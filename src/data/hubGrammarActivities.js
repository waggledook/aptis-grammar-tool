export const HUB_GRAMMAR_LEVELS = [
  { id: "a1", label: "A1", title: "Beginner" },
  { id: "a1-a2", label: "A1–A2", title: "Elementary" },
  { id: "a2", label: "A2", title: "A2" },
  { id: "a2-b1", label: "A2–B1", title: "Pre-intermediate" },
  { id: "b1", label: "B1", title: "Intermediate" },
  { id: "b1-b2", label: "B1–B2", title: "Intermediate Plus" },
  { id: "b2", label: "B2", title: "Upper-intermediate" },
  { id: "c1", label: "C1", title: "Advanced" },
  { id: "c1-c2", label: "C1–C2", title: "Advanced Plus" },
  { id: "c2", label: "C2", title: "Proficiency" },
];

export const HUB_GRAMMAR_LEVEL_COLORS = {
  a1: "#72df9b",
  "a1-a2": "#75e8ad",
  a2: "#7ef0c2",
  "a2-b1": "#69c8df",
  b1: "#8fb6ff",
  "b1-b2": "#c4c47f",
  b2: "#f6d26b",
  c1: "#f2b0b7",
  "c1-c2": "#dcb0dc",
  c2: "#c7a4ff",
};

const GRAMMAR_LEVEL_ORDER = HUB_GRAMMAR_LEVELS.map((level) => level.id).filter(
  (level) => !level.includes("-")
);

export function getHubGrammarLevel(activity) {
  if (activity?.level) return String(activity.level).toLowerCase();

  const legacyLevels = Array.isArray(activity?.levels) ? activity.levels : [];
  const orderedLevels = [...new Set(legacyLevels.map((level) => String(level).toLowerCase()))]
    .sort((left, right) => GRAMMAR_LEVEL_ORDER.indexOf(left) - GRAMMAR_LEVEL_ORDER.indexOf(right));

  return orderedLevels.join("-");
}

const singleGap = (id, prompt, parts, acceptedAnswers, feedback, extra = {}) => ({
  id,
  type: "gap-fill",
  prompt,
  parts,
  gaps: [
    {
      id: "g1",
      acceptedAnswers,
      feedback,
    },
  ],
  ...extra,
});

const doubleGap = (
  id,
  prompt,
  parts,
  firstAcceptedAnswers,
  secondAcceptedAnswers,
  feedback,
  extra = {}
) => {
  const gapExtras = extra.gapExtras || {};

  return {
    id,
    type: "gap-fill",
    prompt,
    parts,
    gaps: [
      {
        id: "g1",
        acceptedAnswers: firstAcceptedAnswers,
        feedback,
        ...(gapExtras.g1 || {}),
      },
      {
        id: "g2",
        acceptedAnswers: secondAcceptedAnswers,
        feedback,
        ...(gapExtras.g2 || {}),
      },
    ],
    ...extra,
  };
};

const multipleChoiceItem = (id, prompt, question, options, answerIndex, explanation) => ({
  id,
  type: "multiple-choice",
  prompt,
  question,
  options,
  answerIndex,
  explanation,
});

const errorCorrectionItem = (
  id,
  prompt,
  sentence,
  highlighted,
  isCorrect,
  correction,
  explanation
) => ({
  id,
  type: "error-correction",
  prompt,
  sentence,
  highlighted,
  isCorrect,
  correction,
  explanation,
});

const placeholderGapItem = (
  id,
  prompt,
  sentence,
  answer,
  alternatives = [],
  explanation,
  extra = {}
) => {
  const normalizedSentence = String(sentence || "");
  const markerMatch = normalizedSentence.match(/_{3,}/);
  const index = markerMatch ? markerMatch.index : -1;
  const markerLength = markerMatch ? markerMatch[0].length : 0;
  const before = index >= 0 ? normalizedSentence.slice(0, index) : normalizedSentence;
  const after = index >= 0 ? normalizedSentence.slice(index + markerLength) : "";

  return singleGap(
    id,
    prompt,
    [before, { gapId: "g1" }, after],
    [answer, ...alternatives],
    explanation,
    extra
  );
};

const audioResponseItem = (
  id,
  prompt,
  audioSrc,
  answer,
  explanation,
  alternatives = [],
  extra = {}
) => ({
  id,
  type: "audio-response",
  prompt,
  audioSrc,
  acceptedAnswers: [answer, ...alternatives],
  answer,
  explanation,
  ...extra,
});

const wordOrderItem = (
  id,
  prompt,
  tokens,
  answer,
  explanation,
  alternatives = [],
  extra = {}
) => {
  const trimmedAnswer = String(answer || "").trim();
  const derivedFinalPunctuation =
    String(extra.finalPunctuation || "").trim() ||
    trimmedAnswer.match(/([.?!])$/)?.[1] ||
    "";
  const cleanedTokens = Array.isArray(tokens)
    ? tokens.filter((token, index) => {
        if (token == null) return false;
        const normalizedToken = String(token).trim();
        const isStandalonePunctuation = /^[.?!]$/.test(normalizedToken);
        const isFinalToken = index === tokens.length - 1;

        return !(isStandalonePunctuation && isFinalToken && normalizedToken === derivedFinalPunctuation);
      })
    : [];

  return {
    id,
    type: "word-order",
    prompt,
    tokens: cleanedTokens,
    answer,
    acceptedAnswers: [answer, ...alternatives],
    explanation,
    finalPunctuation: derivedFinalPunctuation,
    ...extra,
  };
};

const placeholderChoiceGapItem = (
  id,
  prompt,
  sentence,
  answers = [],
  explanation,
  choices = ["a", "an", "the", "—"],
  extra = {}
) => {
  const marker = "____";
  const source = String(sentence || "");
  const parts = [];
  const gaps = [];
  let cursor = 0;
  let gapIndex = 0;

  while (true) {
    const index = source.indexOf(marker, cursor);
    if (index === -1) break;

    parts.push(source.slice(cursor, index));

    const gapId = `g${gapIndex + 1}`;
    parts.push({ gapId });
    gaps.push({
      id: gapId,
      acceptedAnswers: [answers[gapIndex]],
      feedback: explanation,
      choices,
    });

    cursor = index + marker.length;
    gapIndex += 1;
  }

  parts.push(source.slice(cursor));

  return {
    id,
    type: "gap-fill",
    prompt,
    parts,
    gaps,
    ...extra,
  };
};

const commaPlacementItem = (id, prompt, sentence, needsCommas, corrected, explanation) => {
  const words = String(sentence || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const correctedWords = String(corrected || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const commaPositions = correctedWords.reduce((positions, token, index) => {
    if (index < words.length - 1 && token.includes(",")) {
      positions.push(index);
    }
    return positions;
  }, []);

  return {
    id,
    type: "comma-placement",
    prompt,
    sentence,
    words,
    needsCommas,
    corrected,
    commaPositions,
    explanation,
  };
};

const adverbPlacementItem = (
  id,
  prompt,
  baseSentence,
  adverbs,
  correctPlacements,
  correctSentence,
  explanation
) => {
  const tokens = String(baseSentence || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lastToken = tokens[tokens.length - 1] || "";
  const finalPunctuationMatch = lastToken.match(/([.!?])$/);
  const finalPunctuation = finalPunctuationMatch?.[1] || "";

  if (finalPunctuation) {
    tokens[tokens.length - 1] = lastToken.slice(0, -1);
  }

  return {
    id,
    type: "adverb-placement",
    prompt,
    baseSentence,
    tokens,
    finalPunctuation,
    adverbs,
    correctPlacements,
    correctSentence,
    explanation,
  };
};

const HUB_GRAMMAR_ACTIVITY_DEFINITIONS = [
  {
    id: "a1-1a-verb-be-i-you",
    title: "1A · Verb Be: I and You",
    shortDescription: "Practise am and are in statements, negatives, questions, and short answers.",
    levels: ["a1"],
    intro:
      "Start with the basic forms of be for I and you, then build questions, negatives, and a short conversation.",
    items: [
      multipleChoiceItem(
        "a1-1a-mc-1",
        "Choose the correct form of be.",
        "I ____ on the morning course.",
        ["am", "is", "are"],
        0,
        "Use 'am' with I."
      ),
      multipleChoiceItem(
        "a1-1a-mc-2",
        "Choose the correct form of be.",
        "You ____ beside the window.",
        ["am", "is", "are"],
        2,
        "Use 'are' with you."
      ),
      placeholderGapItem(
        "a1-1a-gf-1",
        "Complete the second sentence with a contraction.",
        "I am ready now. → __________ ready now.",
        "I'm",
        [],
        "The contraction of 'I am' is 'I'm'."
      ),
      multipleChoiceItem(
        "a1-1a-mc-3",
        "Choose the correct negative form.",
        "You ____ in the wrong queue. This one is for online orders.",
        ["isn't", "aren't", "am not"],
        1,
        "Use 'aren't' or 'are not' with you."
      ),
      doubleGap(
        "a1-1a-gf-2",
        "Complete the question and short answer.",
        ["A: ", { gapId: "g1" }, " I in the right room?\nB: Yes, you ", { gapId: "g2" }, "."],
        ["Am"],
        ["are"],
        "Put 'am' before I in the question. In the positive short answer, use 'you are'."
      ),
      multipleChoiceItem(
        "a1-1a-mc-4",
        "Choose the best short answer.",
        "Are you busy right now?",
        ["No, I'm not.", "No, I not.", "No, you aren't."],
        0,
        "Answer a question about you with 'Yes, I am' or 'No, I'm not'."
      ),
      errorCorrectionItem(
        "a1-1a-ec-1",
        "Check the highlighted word.",
        "I is on the evening course.",
        "is",
        false,
        "am",
        "Use 'am', not 'is', with I."
      ),
      errorCorrectionItem(
        "a1-1a-ec-2",
        "Check the highlighted phrase.",
        "You're not in my group today.",
        "You're not",
        true,
        "",
        "Correct! 'You're not' is a natural contraction of 'you are not'."
      ),
      wordOrderItem(
        "a1-1a-wo-1",
        "Put the words in the correct order.",
        ["you", "Are", "after", "class", "free"],
        "Are you free after class?",
        "For a question, put 'are' before 'you'."
      ),
      wordOrderItem(
        "a1-1a-wo-2",
        "Put the words in the correct order.",
        ["not", "I", "at", "am", "the", "correct", "table"],
        "I am not at the correct table.",
        "The negative order is subject + be + not."
      ),
      placeholderGapItem(
        "a1-1a-gf-3",
        "Complete the reply.",
        "A: Are you in the weekend class?\nB: Yes, __________.",
        "I am",
        [],
        "Use 'Yes, I am' for a positive short answer about yourself."
      ),
      {
        id: "a1-1a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the introduction with forms of be.",
        parts: [
          "A: Hi, I ",
          { gapId: "g1" },
          " Nia. ",
          { gapId: "g2" },
          " you Leo?\nB: No, I ",
          { gapId: "g3" },
          " not. I ",
          { gapId: "g4" },
          " Sam.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["am", "'m"],
            feedback: "Use 'am' with I.",
          },
          {
            id: "g2",
            acceptedAnswers: ["Are"],
            feedback: "Begin the question with 'Are'.",
          },
          {
            id: "g3",
            acceptedAnswers: ["am", "'m"],
            feedback: "The negative short answer is 'No, I am not'.",
          },
          {
            id: "g4",
            acceptedAnswers: ["am", "'m"],
            feedback: "Use 'am' with I.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-1b-verb-be-he-she-it",
    title: "1B · Verb Be: He, She, and It",
    shortDescription: "Use is with he, she, and it in statements, negatives, and questions.",
    levels: ["a1"],
    intro:
      "Work from simple statements to questions and a short conversation using he, she, and it.",
    items: [
      multipleChoiceItem(
        "a1-1b-mc-1",
        "Choose the correct form of be.",
        "Lena ____ in the garden.",
        ["am", "is", "are"],
        1,
        "Use 'is' with she, he, and a person's name."
      ),
      multipleChoiceItem(
        "a1-1b-mc-2",
        "Choose the correct form of be.",
        "My phone ____ in my bag.",
        ["am", "are", "is"],
        2,
        "Use 'is' with one thing."
      ),
      placeholderGapItem(
        "a1-1b-gf-1",
        "Complete the second sentence with a contraction.",
        "He is a careful driver. → __________ a careful driver.",
        "He's",
        [],
        "The contraction of 'he is' is 'he's'."
      ),
      placeholderGapItem(
        "a1-1b-gf-2",
        "Complete the sentence with a negative form of be.",
        "The museum __________ open on Mondays.",
        "isn't",
        ["is not"],
        "Use 'isn't' or 'is not' with one place or thing."
      ),
      multipleChoiceItem(
        "a1-1b-mc-3",
        "Choose the best short answer.",
        "Is Ava your neighbour?",
        ["Yes, she is.", "Yes, she's.", "Yes, it is."],
        0,
        "Use 'Yes, she is'. Do not use the contraction 'she's' as a short answer."
      ),
      doubleGap(
        "a1-1b-gf-3",
        "Complete the question and short answer.",
        ["A: ", { gapId: "g1" }, " it cold outside?\nB: No, it ", { gapId: "g2" }, "."],
        ["Is"],
        ["isn't", "is not"],
        "Put 'is' before it in the question. Use 'isn't' or 'is not' in the negative answer."
      ),
      errorCorrectionItem(
        "a1-1b-ec-1",
        "Check the highlighted word.",
        "She are near the main entrance.",
        "are",
        false,
        "is",
        "Use 'is' with she."
      ),
      errorCorrectionItem(
        "a1-1b-ec-2",
        "Check the highlighted phrase.",
        "He's not here this morning.",
        "He's not",
        true,
        "",
        "Correct! 'He's not' means 'he is not'."
      ),
      wordOrderItem(
        "a1-1b-wo-1",
        "Put the words in the correct order.",
        ["this", "she", "Where", "afternoon", "is"],
        "Where is she this afternoon?",
        "Put the question word first, then 'is', then the subject."
      ),
      wordOrderItem(
        "a1-1b-wo-2",
        "Put the words in the correct order.",
        ["the", "Is", "blue", "under", "it", "chair"],
        "Is it under the blue chair?",
        "For a yes/no question, put 'is' before 'it'."
      ),
      placeholderGapItem(
        "a1-1b-gf-4",
        "Complete the question.",
        "__________ he at home today?",
        "Is",
        [],
        "Begin a question about he with 'Is'."
      ),
      {
        id: "a1-1b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with forms of be.",
        parts: [
          "A: This is Omar. He ",
          { gapId: "g1" },
          " our new neighbour.\nB: ",
          { gapId: "g2" },
          " he from Cairo?\nA: No, he ",
          { gapId: "g3" },
          ". He ",
          { gapId: "g4" },
          " from Alexandria.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["is", "'s"],
            feedback: "Use 'is' with he.",
          },
          {
            id: "g2",
            acceptedAnswers: ["Is"],
            feedback: "Begin the question with 'Is'.",
          },
          {
            id: "g3",
            acceptedAnswers: ["isn't", "is not"],
            feedback: "Use the negative short answer 'he isn't' or 'he is not'.",
          },
          {
            id: "g4",
            acceptedAnswers: ["is", "'s"],
            feedback: "Use 'is' with he.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-2a-verb-be-we-you-they",
    title: "2A · Verb Be: We, You, and They",
    shortDescription: "Practise are with plural subjects in statements, negatives, and questions.",
    levels: ["a1"],
    intro:
      "Use are with we, plural you, and they, then apply the forms in questions and short exchanges.",
    items: [
      multipleChoiceItem(
        "a1-2a-mc-1",
        "Choose the correct form of be.",
        "My cousin and I ____ on the same course.",
        ["am", "is", "are"],
        2,
        "'My cousin and I' means we, so use 'are'."
      ),
      multipleChoiceItem(
        "a1-2a-mc-2",
        "Choose the correct form of be.",
        "The lights ____ on.",
        ["am", "are", "is"],
        1,
        "Use 'are' with a plural noun."
      ),
      placeholderGapItem(
        "a1-2a-gf-1",
        "Complete the second sentence with a contraction.",
        "We are ready for the tour. → __________ ready for the tour.",
        "We're",
        [],
        "The contraction of 'we are' is 'we're'."
      ),
      multipleChoiceItem(
        "a1-2a-mc-3",
        "Choose the correct negative form.",
        "The sandwiches ____ fresh, so don't eat them.",
        ["aren't", "isn't", "am not"],
        0,
        "Use 'aren't' or 'are not' with a plural noun."
      ),
      placeholderGapItem(
        "a1-2a-gf-2",
        "Complete the sentence with a form of be.",
        "You __________ both very helpful.",
        "are",
        ["'re"],
        "Use 'are' when you refers to more than one person."
      ),
      doubleGap(
        "a1-2a-gf-3",
        "Complete the question and short answer.",
        ["A: ", { gapId: "g1" }, " they near the lift?\nB: Yes, they ", { gapId: "g2" }, "."],
        ["Are"],
        ["are"],
        "Put 'are' before they in the question and use 'they are' in the positive short answer."
      ),
      multipleChoiceItem(
        "a1-2a-mc-4",
        "Choose the best short answer.",
        "Are you and Jo in room five?",
        ["No, you aren't.", "No, they aren't.", "No, we aren't."],
        2,
        "When you answer for yourself and Jo, use 'we'."
      ),
      errorCorrectionItem(
        "a1-2a-ec-1",
        "Check the highlighted word.",
        "These chairs is very comfortable.",
        "is",
        false,
        "are",
        "Use 'are' with the plural subject 'these chairs'."
      ),
      errorCorrectionItem(
        "a1-2a-ec-2",
        "Check the highlighted phrase.",
        "We're not far from the station.",
        "We're not",
        true,
        "",
        "Correct! 'We're not' is a natural contraction of 'we are not'."
      ),
      wordOrderItem(
        "a1-2a-wo-1",
        "Put the words in the correct order.",
        ["they", "Are", "the", "near", "desk", "front"],
        "Are they near the front desk?",
        "For a yes/no question, put 'are' before 'they'."
      ),
      wordOrderItem(
        "a1-2a-wo-2",
        "Put the words in the correct order.",
        ["not", "on", "We", "guest", "the", "are", "list"],
        "We are not on the guest list.",
        "The negative order is subject + be + not."
      ),
      {
        id: "a1-2a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with plural forms of be.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you two here for the art class?\nB: No, we ",
          { gapId: "g2" },
          ". We ",
          { gapId: "g3" },
          " here for the music class. Our friends ",
          { gapId: "g4" },
          " inside already.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Are"],
            feedback: "Begin a question about plural you with 'Are'.",
          },
          {
            id: "g2",
            acceptedAnswers: ["aren't", "are not"],
            feedback: "Use 'we aren't' or 'we are not' for the negative short answer.",
          },
          {
            id: "g3",
            acceptedAnswers: ["are", "'re"],
            feedback: "Use 'are' with we.",
          },
          {
            id: "g4",
            acceptedAnswers: ["are", "'re"],
            feedback: "Use 'are' with the plural subject 'our friends'.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-2b-wh-how-questions-be",
    title: "2B · Wh- and How Questions with Be",
    shortDescription: "Build questions with who, what, where, when, how, and how old.",
    levels: ["a1"],
    intro:
      "Choose the right question word, put be before the subject, and finish with a short information-gap conversation.",
    items: [
      multipleChoiceItem(
        "a1-2b-mc-1",
        "Choose the question word that matches the answer.",
        "____ is the last bus? At 11:30.",
        ["Who", "When", "Where"],
        1,
        "Use 'when' to ask about a time."
      ),
      multipleChoiceItem(
        "a1-2b-mc-2",
        "Choose the question that matches the answer.",
        "She's our new coach.",
        ["Where is that woman?", "How is that woman?", "Who is that woman?"],
        2,
        "Use 'who' to ask about a person."
      ),
      multipleChoiceItem(
        "a1-2b-mc-3",
        "Choose the question that matches the answer.",
        "Much better, thanks.",
        ["How are you today?", "What are you?", "Where are you today?"],
        0,
        "Use 'How are you?' to ask how somebody feels."
      ),
      placeholderGapItem(
        "a1-2b-gf-1",
        "Complete the question with one question word.",
        "__________ is the nearest cash machine? Next to the supermarket.",
        "Where",
        [],
        "Use 'where' to ask about a place."
      ),
      doubleGap(
        "a1-2b-gf-2",
        "Complete the question.",
        ["", { gapId: "g1" }, " old ", { gapId: "g2" }, " your children? They're six."],
        ["How"],
        ["are"],
        "Use 'How old + be + subject' to ask about age."
      ),
      wordOrderItem(
        "a1-2b-wo-1",
        "Put the words in the correct order.",
        ["the", "What", "Wi-Fi", "is", "password"],
        "What is the Wi-Fi password?",
        "The order is question word + be + subject."
      ),
      wordOrderItem(
        "a1-2b-wo-2",
        "Put the words in the correct order.",
        ["the", "Where", "clean", "are", "towels"],
        "Where are the clean towels?",
        "Put 'where' first, then 'are', then the subject."
      ),
      errorCorrectionItem(
        "a1-2b-ec-1",
        "Check the highlighted question.",
        "Where you are at the moment?",
        "Where you are",
        false,
        "Where are you",
        "In a question, put 'are' before the subject 'you'."
      ),
      multipleChoiceItem(
        "a1-2b-mc-4",
        "Choose the question form used in this course.",
        "____? She's at the bus stop.",
        ["Where she is", "Where is she", "Where's she"],
        1,
        "Use the full form before a pronoun in this course: 'Where is she?'"
      ),
      errorCorrectionItem(
        "a1-2b-ec-3",
        "Check the highlighted phrase.",
        "What's the price of this notebook?",
        "What's the price",
        true,
        "",
        "Correct! 'What's' is possible because a noun phrase follows it."
      ),
      placeholderGapItem(
        "a1-2b-gf-3",
        "Complete the question. Use the full form or a contraction.",
        "__________ your surname?",
        "What is",
        ["What's"],
        "Use 'What is' or 'What's' before the noun phrase 'your surname'."
      ),
      {
        id: "a1-2b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with three question words.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " is the art class?\nB: It's upstairs.\nA: ",
          { gapId: "g2" },
          " is it?\nB: It's on Wednesday.\nA: ",
          { gapId: "g3" },
          " is the teacher?\nB: Ms Patel.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Where"],
            feedback: "Use 'where' to ask about a place.",
          },
          {
            id: "g2",
            acceptedAnswers: ["When"],
            feedback: "Use 'when' to ask about a day or time.",
          },
          {
            id: "g3",
            acceptedAnswers: ["Who"],
            feedback: "Use 'who' to ask about a person.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-3a-singular-plural-a-an",
    title: "3A · Singular and Plural Nouns: A and An",
    shortDescription: "Choose a or an and form regular plural nouns correctly.",
    levels: ["a1"],
    intro:
      "Begin with a and an, then practise regular plural endings and use both skills in a short description.",
    items: [
      multipleChoiceItem(
        "a1-3a-mc-1",
        "Choose the correct article.",
        "There is ____ orange in my lunchbox.",
        ["a", "an", "the"],
        1,
        "Use 'an' before a word that begins with a vowel sound."
      ),
      multipleChoiceItem(
        "a1-3a-mc-2",
        "Choose the correct article.",
        "Mila is ____ doctor at the town clinic.",
        ["a", "an", "the"],
        0,
        "Use 'a' before a singular noun that begins with a consonant sound."
      ),
      placeholderChoiceGapItem(
        "a1-3a-cg-1",
        "Choose a, an, or no article for each gap.",
        "Outside, I can see ____ bicycle, ____ old bus, and ____ taxis.",
        ["a", "an", "—"],
        "Use 'a' before bicycle, 'an' before old, and no article before the plural noun taxis.",
        ["a", "an", "—"]
      ),
      multipleChoiceItem(
        "a1-3a-mc-3",
        "Choose the correct plural.",
        "One city, two ____.",
        ["citys", "cityes", "cities"],
        2,
        "After a consonant + y, change y to i and add -es: city → cities."
      ),
      multipleChoiceItem(
        "a1-3a-mc-4",
        "Choose the correct plural.",
        "One brush, three ____.",
        ["brushs", "brushes", "brushies"],
        1,
        "Nouns ending in -sh normally add -es."
      ),
      placeholderGapItem(
        "a1-3a-gf-1",
        "Write the plural form of the noun in brackets.",
        "Two __________ are asleep in the car. (baby)",
        "babies",
        [],
        "After a consonant + y, change y to i and add -es."
      ),
      placeholderGapItem(
        "a1-3a-gf-2",
        "Write the plural form of the noun in brackets.",
        "We need four __________ for these gifts. (box)",
        "boxes",
        [],
        "Add -es to a noun ending in -x."
      ),
      errorCorrectionItem(
        "a1-3a-ec-1",
        "Check the highlighted article.",
        "I have an new camera.",
        "an",
        false,
        "a",
        "Use 'a' before the consonant sound at the beginning of 'new'."
      ),
      errorCorrectionItem(
        "a1-3a-ec-2",
        "Check the highlighted noun.",
        "There are two bus at the stop.",
        "bus",
        false,
        "buses",
        "The plural of 'bus' is 'buses'."
      ),
      errorCorrectionItem(
        "a1-3a-ec-3",
        "Check the highlighted noun.",
        "We visit three citys on our trip.",
        "citys",
        false,
        "cities",
        "Change consonant + y to -ies: city → cities."
      ),
      placeholderChoiceGapItem(
        "a1-3a-cg-2",
        "Choose the correct article.",
        "Please close ____ gate behind you.",
        ["the"],
        "Use 'the' when both people know which specific gate you mean.",
        ["a", "an", "the", "—"]
      ),
      {
        id: "a1-3a-description-1",
        type: "gap-fill",
        prompt: "Complete the description with articles or plural nouns.",
        parts: [
          "In my bag, I have ",
          { gapId: "g1" },
          " map, ",
          { gapId: "g2" },
          " apple, and two ",
          { gapId: "g3" },
          ". (sandwich)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["a"],
            feedback: "Use 'a' before map.",
          },
          {
            id: "g2",
            acceptedAnswers: ["an"],
            feedback: "Use 'an' before apple.",
          },
          {
            id: "g3",
            acceptedAnswers: ["sandwiches"],
            feedback: "Add -es to a noun ending in -ch.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-3b-demonstratives",
    title: "3B · This, That, These, and Those",
    shortDescription: "Choose demonstratives for near and distant singular and plural things.",
    levels: ["a1"],
    intro:
      "Decide whether each person or thing is near or far away and whether it is singular or plural.",
    items: [
      multipleChoiceItem(
        "a1-3b-mc-1",
        "Choose the correct demonstrative.",
        "I'm holding one photo. ____ photo is from my holiday.",
        ["That", "This", "These", "Those"],
        1,
        "Use 'this' for one thing near you."
      ),
      multipleChoiceItem(
        "a1-3b-mc-2",
        "Choose the correct demonstrative.",
        "Look at the clock on the wall over there. ____ clock is very old.",
        ["This", "These", "Those", "That"],
        3,
        "Use 'that' for one thing away from you."
      ),
      multipleChoiceItem(
        "a1-3b-mc-3",
        "Choose the correct demonstrative.",
        "The two cups beside me are clean. ____ cups are for us.",
        ["These", "This", "That", "Those"],
        0,
        "Use 'these' for plural things near you."
      ),
      multipleChoiceItem(
        "a1-3b-mc-4",
        "Choose the correct demonstrative.",
        "Can you see the boats far out on the water? ____ boats are beautiful.",
        ["This", "That", "Those", "These"],
        2,
        "Use 'those' for plural things away from you."
      ),
      doubleGap(
        "a1-3b-gf-1",
        "Complete the sentence with two demonstratives.",
        ["", { gapId: "g1" }, " is my coat here, and ", { gapId: "g2" }, " is your coat by the door."],
        ["This"],
        ["that"],
        "Use 'this' for the coat here and 'that' for the coat farther away."
      ),
      placeholderGapItem(
        "a1-3b-gf-2",
        "Complete the question with one demonstrative.",
        "I'm holding two small objects. What are __________ in my hand?",
        "these",
        [],
        "The objects are in the speaker's hand, so use 'these' for plural things nearby."
      ),
      errorCorrectionItem(
        "a1-3b-ec-1",
        "Check the highlighted word.",
        "This shoes are wet.",
        "This",
        false,
        "These",
        "Use the plural form 'these' with shoes."
      ),
      errorCorrectionItem(
        "a1-3b-ec-2",
        "Check the highlighted word.",
        "Who are that people outside?",
        "that",
        false,
        "those",
        "Use the plural form 'those' with people who are farther away."
      ),
      errorCorrectionItem(
        "a1-3b-ec-3",
        "Check the highlighted word.",
        "These are my notes for today's class.",
        "These",
        true,
        "",
        "Correct! 'These' can stand alone as a pronoun for plural things nearby."
      ),
      wordOrderItem(
        "a1-3b-wo-1",
        "Put the words in the correct order.",
        ["are", "What", "the", "those", "on", "shelf", "top"],
        "What are those on the top shelf?",
        "Use 'those' as a plural pronoun for things farther away."
      ),
      wordOrderItem(
        "a1-3b-wo-2",
        "Put the words in the correct order.",
        ["over", "your", "Is", "that", "bike", "there"],
        "Is that your bike over there?",
        "Use 'that' for one thing over there."
      ),
      {
        id: "a1-3b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with this, that, these, or those.",
        parts: [
          "A: What is ",
          { gapId: "g1" },
          " beside me?\nB: It's a radio.\nA: And what are ",
          { gapId: "g2" },
          " near the door?\nB: They're speakers. Are ",
          { gapId: "g3" },
          " headphones here black?\nA: No. ",
          { gapId: "g4" },
          " pair over there is black.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["this"],
            feedback: "Use 'this' for one thing beside the speaker.",
          },
          {
            id: "g2",
            acceptedAnswers: ["those"],
            feedback: "Use 'those' for plural things near the door, away from the speaker.",
          },
          {
            id: "g3",
            acceptedAnswers: ["these"],
            feedback: "Use 'these' for the headphones here.",
          },
          {
            id: "g4",
            acceptedAnswers: ["That"],
            feedback: "Use 'that' for one pair over there.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-4a-possessive-adjectives-s",
    title: "4A · Possessive Adjectives and Possessive 's",
    shortDescription: "Use my, your, his, her, its, our, and their, plus possessive apostrophes.",
    levels: ["a1"],
    intro:
      "Match people and things with the correct possessive adjective, then show ownership with 's or a final apostrophe.",
    items: [
      multipleChoiceItem(
        "a1-4a-mc-1",
        "Choose the correct possessive adjective.",
        "I'm Leo. ____ address is 18 Green Street.",
        ["My", "His", "Our"],
        0,
        "Use 'my' for something that belongs to me."
      ),
      multipleChoiceItem(
        "a1-4a-mc-2",
        "Choose the correct possessive adjective.",
        "You have a new phone. Is this ____ number?",
        ["my", "your", "their"],
        1,
        "Use 'your' for something that belongs to you."
      ),
      multipleChoiceItem(
        "a1-4a-mc-3",
        "Choose the correct possessive adjective.",
        "My school has a new website. ____ address is easy to remember.",
        ["His", "It's", "Its"],
        2,
        "Use 'its' for possession. 'It's' means 'it is'."
      ),
      multipleChoiceItem(
        "a1-4a-mc-4",
        "Choose the correct possessive adjective.",
        "Sam is my uncle. ____ wife is called Aisha.",
        ["Her", "His", "Their"],
        1,
        "Use 'his' for something connected to a man."
      ),
      multipleChoiceItem(
        "a1-4a-mc-5",
        "Choose the correct possessive adjective.",
        "Nadia is my aunt. ____ job is very interesting.",
        ["Her", "His", "Its"],
        0,
        "Use 'her' for something connected to a woman."
      ),
      placeholderChoiceGapItem(
        "a1-4a-cg-1",
        "Choose the correct possessive adjective for each gap.",
        "We like ____ new flat. The children love ____ bedrooms, and the cat sleeps in ____ basket.",
        ["our", "their", "its"],
        "Use 'our' for we, 'their' for the children, and 'its' for the cat.",
        ["my", "your", "his", "her", "its", "our", "their"]
      ),
      multipleChoiceItem(
        "a1-4a-mc-6",
        "Choose the correct possessive form.",
        "The bicycle belongs to Jamie. This is ____.",
        ["Jamie bicycle", "Jamies bicycle", "Jamie's bicycle"],
        2,
        "Add 's to a person's name to show possession."
      ),
      errorCorrectionItem(
        "a1-4a-ec-1",
        "Check the highlighted word.",
        "This is Ben, and her sister is a nurse.",
        "her",
        false,
        "his",
        "Use 'his' because the sister is Ben's sister."
      ),
      errorCorrectionItem(
        "a1-4a-ec-2",
        "Check the highlighted word.",
        "The company changes it's logo every year.",
        "it's",
        false,
        "its",
        "Use the possessive adjective 'its'. 'It's' means 'it is'."
      ),
      errorCorrectionItem(
        "a1-4a-ec-3",
        "Check the highlighted phrase.",
        "This is Nora bag on the chair.",
        "Nora bag",
        false,
        "Nora's bag",
        "Add 's after Nora to show that the bag belongs to her."
      ),
      wordOrderItem(
        "a1-4a-wo-1",
        "Put the words in the correct order.",
        ["bus", "is", "players'", "This", "the"],
        "This is the players' bus.",
        "For a regular plural noun ending in s, put the apostrophe after the s: players'."
      ),
      {
        id: "a1-4a-description-1",
        type: "gap-fill",
        prompt: "Complete the family description with possessive adjectives.",
        parts: [
          "Eva and Amir are brother and sister. ",
          { gapId: "g1" },
          " parents have a café. ",
          { gapId: "g2" },
          " name is Corner Cup. Eva works there with ",
          { gapId: "g3" },
          " mother, and Amir works there with ",
          { gapId: "g4" },
          " father.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Their"],
            feedback: "Use 'their' for Eva and Amir.",
          },
          {
            id: "g2",
            acceptedAnswers: ["Its"],
            feedback: "Use 'its' for the café's name.",
          },
          {
            id: "g3",
            acceptedAnswers: ["her"],
            feedback: "Use 'her' for Eva.",
          },
          {
            id: "g4",
            acceptedAnswers: ["his"],
            feedback: "Use 'his' for Amir.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-4b-adjectives",
    title: "4B · Adjectives",
    shortDescription: "Place adjectives before nouns or after be and keep their form unchanged.",
    levels: ["a1"],
    intro:
      "Choose the correct adjective form, fix common word-order errors, and build natural descriptions.",
    items: [
      multipleChoiceItem(
        "a1-4b-mc-1",
        "Choose the correct adjective.",
        "The soup is ____.",
        ["hot", "hotly", "hots"],
        0,
        "Use the adjective 'hot' after be."
      ),
      multipleChoiceItem(
        "a1-4b-mc-2",
        "Choose the correct adjective.",
        "It is a ____ street.",
        ["quietly", "quiets", "quiet"],
        2,
        "Use an adjective before a noun: a quiet street."
      ),
      multipleChoiceItem(
        "a1-4b-mc-3",
        "Choose the sentence with the correct word order.",
        "They live in ____.",
        ["a house small", "a small house", "a smalls house"],
        1,
        "Put the adjective before the noun: a small house."
      ),
      multipleChoiceItem(
        "a1-4b-mc-4",
        "Choose the correct form.",
        "The rooms are ____.",
        ["clean", "cleans", "cleanes"],
        0,
        "Adjectives do not change for plural nouns."
      ),
      multipleChoiceItem(
        "a1-4b-mc-5",
        "Choose the correct form.",
        "Maya is calm, and her brother is ____ too.",
        ["calms", "calm", "calm man"],
        1,
        "The adjective has the same form for women and men."
      ),
      multipleChoiceItem(
        "a1-4b-mc-6",
        "Choose the sentence with correct adjective position and form.",
        "Which description is correct?",
        [
          "The café has tables small, and the chairs are comfortables.",
          "The café has smalls tables, and comfortable are the chairs.",
          "The café has small tables, and the chairs are comfortable.",
        ],
        2,
        "Put an adjective before a noun or after be, and do not add a plural -s to an adjective."
      ),
      errorCorrectionItem(
        "a1-4b-ec-1",
        "Check the highlighted phrase.",
        "We have a red car.",
        "a red car",
        true,
        "",
        "Correct! Put the adjective before the noun."
      ),
      errorCorrectionItem(
        "a1-4b-ec-2",
        "Check the highlighted word.",
        "Those are importants documents.",
        "importants",
        false,
        "important",
        "Adjectives do not take a plural -s in English."
      ),
      errorCorrectionItem(
        "a1-4b-ec-3",
        "Check the highlighted word.",
        "The café is very noisily.",
        "noisily",
        false,
        "noisy",
        "Use the adjective 'noisy' after be."
      ),
      wordOrderItem(
        "a1-4b-wo-1",
        "Put the words in the correct order.",
        ["comfortable", "a", "chair", "very", "is", "It"],
        "It is a very comfortable chair.",
        "Put the adjective before the noun: a very comfortable chair."
      ),
      singleGap(
        "a1-4b-rf-1",
        "Rewrite the description as one noun phrase.",
        ["It's ", { gapId: "g1" }, "."],
        ["a modern hotel"],
        "Put the adjective before the noun and use 'a' with the singular noun.",
        { originalSentence: "The hotel is modern." }
      ),
      {
        id: "a1-4b-description-1",
        type: "gap-fill",
        prompt: "Complete the description with the adjectives in brackets.",
        parts: [
          "The café is ",
          { gapId: "g1" },
          ", but it's a ",
          { gapId: "g2" },
          " place. The chairs are ",
          { gapId: "g3" },
          ", and the coffee is ",
          { gapId: "g4" },
          ". (small / friendly / comfortable / good)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["small"],
            feedback: "Use 'small' after is.",
          },
          {
            id: "g2",
            acceptedAnswers: ["friendly"],
            feedback: "Use 'friendly' before the noun place.",
          },
          {
            id: "g3",
            acceptedAnswers: ["comfortable"],
            feedback: "The adjective stays unchanged with the plural noun chairs.",
          },
          {
            id: "g4",
            acceptedAnswers: ["good"],
            feedback: "Use 'good' after is.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-5a-present-simple-i-you-we-they",
    title: "5A · Present Simple: I, You, We, and They",
    shortDescription: "Build affirmative and negative present-simple sentences about habits and facts.",
    levels: ["a1"],
    intro:
      "Use the base verb with I, you, we, and they, and make negatives with don't plus the base verb.",
    items: [
      multipleChoiceItem(
        "a1-5a-mc-1",
        "Choose the correct verb form.",
        "I ____ the bus to college every day.",
        ["takes", "am take", "take"],
        2,
        "Use the base verb with I: I take."
      ),
      multipleChoiceItem(
        "a1-5a-mc-2",
        "Choose the correct verb form.",
        "We ____ near the city centre.",
        ["lives", "live", "are live"],
        1,
        "Use the base verb with we: we live."
      ),
      multipleChoiceItem(
        "a1-5a-mc-3",
        "Choose the correct negative form.",
        "They ____ TV before school.",
        ["don't watch", "not watch", "aren't watch"],
        0,
        "Use don't + base verb with they."
      ),
      placeholderGapItem(
        "a1-5a-gf-1",
        "Complete the sentence with the verb in brackets.",
        "You __________ very fast. (read)",
        "read",
        [],
        "Use the base verb with you."
      ),
      placeholderGapItem(
        "a1-5a-gf-2",
        "Complete the negative sentence.",
        "I __________ meat. (not / eat)",
        "don't eat",
        ["do not eat"],
        "Use don't or do not + base verb with I."
      ),
      doubleGap(
        "a1-5a-gf-3",
        "Complete the sentence with the verbs in brackets.",
        ["We ", { gapId: "g1" }, " online from Monday to Friday, but we ", { gapId: "g2" }, " on Sunday. (study / not study)"],
        ["study"],
        ["don't study", "do not study"],
        "Use the base verb in the affirmative and don't + base verb in the negative."
      ),
      errorCorrectionItem(
        "a1-5a-ec-1",
        "Check the highlighted word.",
        "I walks home after class.",
        "walks",
        false,
        "walk",
        "Use the base verb without -s after I."
      ),
      errorCorrectionItem(
        "a1-5a-ec-2",
        "Check the highlighted phrase.",
        "They don't works on Fridays.",
        "don't works",
        false,
        "don't work",
        "After don't, use the base verb: don't work."
      ),
      errorCorrectionItem(
        "a1-5a-ec-3",
        "Check the highlighted phrase.",
        "We play tennis in the park on Saturdays.",
        "We play",
        true,
        "",
        "Correct! Use the base verb with we."
      ),
      wordOrderItem(
        "a1-5a-wo-1",
        "Put the words in the correct order.",
        ["very", "You", "English", "well", "speak"],
        "You speak English very well.",
        "The affirmative order is subject + base verb + the rest of the sentence."
      ),
      wordOrderItem(
        "a1-5a-wo-2",
        "Put the words in the correct order.",
        ["phone", "do", "at", "my", "I", "use", "not", "work"],
        "I do not use my phone at work.",
        "The negative order is subject + do not + base verb."
      ),
      {
        id: "a1-5a-routine-1",
        type: "gap-fill",
        prompt: "Complete the routine with the verbs in brackets.",
        parts: [
          "My friends and I ",
          { gapId: "g1" },
          " near the college. We ",
          { gapId: "g2" },
          " there together. We ",
          { gapId: "g3" },
          " lunch on campus; we ",
          { gapId: "g4" },
          " sandwiches at home. (live / walk / not buy / make)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["live"],
            feedback: "My friends and I means we, so use the base verb live.",
          },
          {
            id: "g2",
            acceptedAnswers: ["walk"],
            feedback: "Use the base verb walk with we.",
          },
          {
            id: "g3",
            acceptedAnswers: ["don't buy", "do not buy"],
            feedback: "Use don't + base verb for the negative.",
          },
          {
            id: "g4",
            acceptedAnswers: ["make"],
            feedback: "Use the base verb make with we.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-5b-present-simple-questions",
    title: "5B · Present Simple Questions: I, You, We, and They",
    shortDescription: "Make present-simple questions and short answers with do and don't.",
    levels: ["a1"],
    intro:
      "Begin questions with do, keep the main verb in its base form, and answer with do or don't.",
    items: [
      multipleChoiceItem(
        "a1-5b-mc-1",
        "Choose the correct auxiliary.",
        "____ you work on Saturdays?",
        ["Do", "Are", "Does"],
        0,
        "Use 'do' to make a present-simple question with you."
      ),
      multipleChoiceItem(
        "a1-5b-mc-2",
        "Choose the best short answer.",
        "Do they know the answer?",
        ["Yes, they are.", "Yes, they know.", "Yes, they do."],
        2,
        "Use 'Yes, they do' as the positive short answer."
      ),
      multipleChoiceItem(
        "a1-5b-mc-3",
        "Choose the best short answer.",
        "Do we need more paper?",
        ["No, we aren't.", "No, we don't.", "No, we not."],
        1,
        "Use 'No, we don't' as the negative short answer."
      ),
      placeholderGapItem(
        "a1-5b-gf-1",
        "Complete the question with one word.",
        "__________ I need my passport?",
        "Do",
        [],
        "Begin a present-simple question with I using 'Do'."
      ),
      doubleGap(
        "a1-5b-gf-2",
        "Complete the question. Use the verb in brackets.",
        ["Where ", { gapId: "g1" }, " you ", { gapId: "g2" }, "? (live)"],
        ["do"],
        ["live"],
        "The question order is question word + do + subject + base verb."
      ),
      doubleGap(
        "a1-5b-gf-3",
        "Complete the question. Use the verb in brackets.",
        ["What time ", { gapId: "g1" }, " they ", { gapId: "g2" }, " work? (finish)"],
        ["do"],
        ["finish"],
        "Use do before they and keep finish in the base form."
      ),
      errorCorrectionItem(
        "a1-5b-ec-1",
        "Check the highlighted phrase.",
        "Do you likes this song?",
        "Do you likes",
        false,
        "Do you like",
        "After do, use the base verb: Do you like...?"
      ),
      errorCorrectionItem(
        "a1-5b-ec-2",
        "Check the highlighted question.",
        "Where you do study?",
        "Where you do study",
        false,
        "Where do you study",
        "Put do before the subject: Where do you study?"
      ),
      errorCorrectionItem(
        "a1-5b-ec-3",
        "Check the highlighted question.",
        "Do we have enough chairs?",
        "Do we have",
        true,
        "",
        "Correct! The order is do + subject + base verb."
      ),
      wordOrderItem(
        "a1-5b-wo-1",
        "Put the words in the correct order.",
        ["music", "Do", "home", "they", "at", "play"],
        "Do they play music at home?",
        "Begin with do, then add the subject and base verb."
      ),
      wordOrderItem(
        "a1-5b-wo-2",
        "Put the words in the correct order.",
        ["we", "What", "the", "time", "lesson", "do", "start"],
        "What time do we start the lesson?",
        "Use question phrase + do + subject + base verb."
      ),
      {
        id: "a1-5b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with do, don't, or the verb study.",
        parts: [
          "A: Do you ",
          { gapId: "g1" },
          " in the evening?\nB: Yes, I ",
          { gapId: "g2" },
          ".\nA: Where ",
          { gapId: "g3" },
          " you study?\nB: At the library.\nA: Do your friends ",
          { gapId: "g4" },
          " there too?\nB: No, they ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["study"],
            feedback: "Use the base verb study after do.",
          },
          {
            id: "g2",
            acceptedAnswers: ["do"],
            feedback: "Use 'Yes, I do' for the positive short answer.",
          },
          {
            id: "g3",
            acceptedAnswers: ["do"],
            feedback: "Put do before the subject in the question.",
          },
          {
            id: "g4",
            acceptedAnswers: ["study"],
            feedback: "Use the base verb study after do.",
          },
          {
            id: "g5",
            acceptedAnswers: ["don't", "do not"],
            feedback: "Use 'No, they don't' for the negative short answer.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-6a-present-simple-he-she-it",
    title: "6A · Present Simple: He, She, and It",
    shortDescription: "Use third-person present-simple forms in statements, negatives, and questions.",
    levels: ["a1"],
    intro:
      "Practise third-person endings, doesn't, does questions, and the irregular forms has, goes, and does.",
    items: [
      multipleChoiceItem(
        "a1-6a-mc-1",
        "Choose the correct verb form.",
        "Luca ____ near the train station.",
        ["live", "lives", "living"],
        1,
        "Add -s to the verb with he, she, or one person's name."
      ),
      multipleChoiceItem(
        "a1-6a-mc-2",
        "Choose the correct verb form.",
        "Omar ____ his homework before dinner.",
        ["does", "do", "dos"],
        0,
        "The third-person form of do is does."
      ),
      multipleChoiceItem(
        "a1-6a-mc-3",
        "Choose the correct verb form.",
        "She ____ a comedy show on Tuesday evenings.",
        ["watch", "watchs", "watches"],
        2,
        "Add -es to a verb ending in -ch: watch → watches."
      ),
      multipleChoiceItem(
        "a1-6a-mc-4",
        "Choose the correct verb form.",
        "Nora ____ French at college.",
        ["studies", "study", "studys"],
        0,
        "After a consonant + y, change y to i and add -es: study → studies."
      ),
      multipleChoiceItem(
        "a1-6a-mc-5",
        "Choose the correct verb form.",
        "He ____ two younger sisters.",
        ["have", "haves", "has"],
        2,
        "The third-person form of have is has."
      ),
      placeholderGapItem(
        "a1-6a-gf-1",
        "Complete the negative sentence.",
        "It __________ much here in summer. (not / rain)",
        "doesn't rain",
        ["does not rain"],
        "Use doesn't + base verb with it."
      ),
      doubleGap(
        "a1-6a-gf-2",
        "Complete the question. Use the verb in brackets.",
        ["", { gapId: "g1" }, " your brother ", { gapId: "g2" }, " online? (study)"],
        ["Does"],
        ["study"],
        "Use does before the subject and keep the main verb in the base form."
      ),
      multipleChoiceItem(
        "a1-6a-mc-6",
        "Choose the best short answer.",
        "Does Maya work on Fridays?",
        ["No, she don't.", "No, she doesn't.", "No, she isn't."],
        1,
        "Use 'No, she doesn't' as the negative short answer."
      ),
      errorCorrectionItem(
        "a1-6a-ec-1",
        "Check the highlighted phrase.",
        "He don't use social media.",
        "don't use",
        false,
        "doesn't use",
        "Use doesn't with he, then use the base verb."
      ),
      errorCorrectionItem(
        "a1-6a-ec-2",
        "Check the highlighted question.",
        "Does she walks to school?",
        "Does she walks",
        false,
        "Does she walk",
        "After does, use the base verb without -s."
      ),
      wordOrderItem(
        "a1-6a-wo-1",
        "Put the words in the correct order.",
        ["your", "Where", "work", "does", "father"],
        "Where does your father work?",
        "Use question word + does + subject + base verb."
      ),
      {
        id: "a1-6a-profile-1",
        type: "gap-fill",
        prompt: "Complete each gap with the correct form of the base verb in brackets.",
        parts: [
          "Mara ",
          { gapId: "g1" },
          " near the sea. (live)\nShe ",
          { gapId: "g2" },
          " in a hotel. (work)\nShe ",
          { gapId: "g3" },
          " to work by bus. (go)\nThe hotel is closed on Mondays, so she ",
          { gapId: "g4" },
          " that day. (work)\nDoes she ",
          { gapId: "g5" },
          " her job? (like)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["lives"],
            feedback: "Add -s to live with she.",
          },
          {
            id: "g2",
            acceptedAnswers: ["works"],
            feedback: "Add -s to work with she.",
          },
          {
            id: "g3",
            acceptedAnswers: ["goes"],
            feedback: "The third-person form of go is goes.",
          },
          {
            id: "g4",
            acceptedAnswers: ["doesn't work", "does not work"],
            feedback: "The hotel is closed, so use doesn't + the base verb work.",
          },
          {
            id: "g5",
            acceptedAnswers: ["like"],
            feedback: "Use the base verb after does.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-6b-adverbs-frequency",
    title: "6B · Adverbs of Frequency",
    shortDescription: "Use always, usually, sometimes, and never in the correct position.",
    levels: ["a1"],
    intro:
      "Match frequency adverbs to their meaning, then place them before main verbs or after be.",
    items: [
      multipleChoiceItem(
        "a1-6b-mc-1",
        "Choose the adverb that means 100% of the time.",
        "I ____ lock the door when I leave home.",
        ["always", "sometimes", "never"],
        0,
        "Always means every time."
      ),
      multipleChoiceItem(
        "a1-6b-mc-2",
        "Choose the adverb that means 0% of the time.",
        "We ____ drive to work because we don't have a car.",
        ["usually", "sometimes", "never"],
        2,
        "Never means not at any time."
      ),
      multipleChoiceItem(
        "a1-6b-mc-3",
        "Choose the most logical adverb.",
        "Maya works from home from Monday to Thursday, but she works at the office on Friday. She ____ works from home.",
        ["never", "usually", "always"],
        1,
        "She works from home on most working days, so 'usually' is the best answer."
      ),
      multipleChoiceItem(
        "a1-6b-mc-4",
        "Choose the sentence with the correct word order.",
        "Which sentence is correct?",
        ["I usually walk to the market.", "I walk usually to the market.", "Usually I walk always to the market."],
        0,
        "Put an adverb of frequency before the main verb."
      ),
      multipleChoiceItem(
        "a1-6b-mc-5",
        "Choose the sentence with the correct word order.",
        "Which sentence is correct?",
        ["She always is early.", "She is always early.", "She is early always."],
        1,
        "Put an adverb of frequency after the verb be."
      ),
      adverbPlacementItem(
        "a1-6b-place-1",
        "Place the adverb in the correct position.",
        "Mina walks to school.",
        ["usually"],
        { usually: 1 },
        "Mina usually walks to school.",
        "Put usually before the main verb walks."
      ),
      adverbPlacementItem(
        "a1-6b-place-2",
        "Place the adverb in the correct position.",
        "They are at home on Sunday mornings.",
        ["always"],
        { always: 2 },
        "They are always at home on Sunday mornings.",
        "Put always after the verb are."
      ),
      placeholderGapItem(
        "a1-6b-gf-1",
        "Complete the question with always, usually, sometimes, or never.",
        "Leo visits his grandparents on most Sundays. Does he __________ visit them at the weekend?",
        "usually",
        [],
        "Most Sundays means usually. In a question with does, put the adverb before the main verb."
      ),
      errorCorrectionItem(
        "a1-6b-ec-1",
        "Check the highlighted phrase.",
        "She eats always lunch at her desk.",
        "eats always",
        false,
        "always eats",
        "Put always before the main verb eats."
      ),
      errorCorrectionItem(
        "a1-6b-ec-2",
        "Check the highlighted phrase.",
        "He doesn't never arrive late.",
        "doesn't never arrive",
        false,
        "never arrives",
        "Never already has a negative meaning, so use it with an affirmative verb."
      ),
      errorCorrectionItem(
        "a1-6b-ec-3",
        "Check the highlighted phrase.",
        "We sometimes go for a walk after dinner.",
        "sometimes go",
        true,
        "",
        "Correct! Sometimes comes before the main verb go."
      ),
      {
        id: "a1-6b-routine-1",
        type: "gap-fill",
        prompt: "Complete the routine with the frequency adverbs shown by the percentages.",
        parts: [
          "Noah ",
          { gapId: "g1" },
          " checks the weather before work (100%). He is ",
          { gapId: "g2" },
          " late (0%). He ",
          { gapId: "g3" },
          " walks to work (about 50%), but he ",
          { gapId: "g4" },
          " takes the bus (most days).",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["always"],
            feedback: "Use always for 100%. It comes before checks.",
          },
          {
            id: "g2",
            acceptedAnswers: ["never"],
            feedback: "Use never for 0%. It comes after is.",
          },
          {
            id: "g3",
            acceptedAnswers: ["sometimes"],
            feedback: "Use sometimes for about 50%. It comes before walks.",
          },
          {
            id: "g4",
            acceptedAnswers: ["usually"],
            feedback: "Use usually for most days. It comes before takes.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-7a-question-word-order",
    title: "7A · Word Order in Questions",
    shortDescription: "Build questions with be and with present-simple auxiliary verbs.",
    levels: ["a1"],
    intro:
      "Decide whether a question needs be or do/does, then put the subject and main verb in the correct order.",
    items: [
      multipleChoiceItem(
        "a1-7a-mc-1",
        "Choose the correct question.",
        "You want to know if your friend is tired.",
        ["Are you tired?", "Do you tired?", "You are tired?"],
        0,
        "With be, put the verb before the subject: Are you tired?"
      ),
      multipleChoiceItem(
        "a1-7a-mc-2",
        "Choose the correct auxiliary.",
        "____ Marta work in the town centre?",
        ["Is", "Does", "Do"],
        1,
        "Use does to make a present-simple question about Marta."
      ),
      multipleChoiceItem(
        "a1-7a-mc-3",
        "Choose the correct verb.",
        "Where ____ the nearest pharmacy?",
        ["does", "do", "is"],
        2,
        "Use is because the question uses the verb be."
      ),
      multipleChoiceItem(
        "a1-7a-mc-4",
        "Choose the correct auxiliary.",
        "Where ____ Luca live?",
        ["does", "is", "do"],
        0,
        "Use does before a third-person subject with a main verb."
      ),
      doubleGap(
        "a1-7a-gf-1",
        "Complete the present-simple question. Use the verb in brackets.",
        ["What time ", { gapId: "g1" }, " the film ", { gapId: "g2" }, "? (start)"],
        ["does"],
        ["start"],
        "Use does + subject + base verb."
      ),
      placeholderGapItem(
        "a1-7a-gf-2",
        "Complete the question with the correct form of be.",
        "How old __________ your cousins?",
        "are",
        [],
        "With be, use question phrase + verb + subject."
      ),
      errorCorrectionItem(
        "a1-7a-ec-1",
        "Check the highlighted question.",
        "Do you are ready to leave?",
        "Do you are",
        false,
        "Are you",
        "Do not use do with be. Put are before the subject."
      ),
      errorCorrectionItem(
        "a1-7a-ec-2",
        "Check the highlighted question.",
        "Where is your brother work?",
        "Where is your brother work",
        false,
        "Where does your brother work",
        "Use does for a present-simple question with the main verb work."
      ),
      errorCorrectionItem(
        "a1-7a-ec-3",
        "Check the highlighted question.",
        "What does Eva studies at university?",
        "What does Eva studies",
        false,
        "What does Eva study",
        "After does, use the base verb study."
      ),
      wordOrderItem(
        "a1-7a-wo-1",
        "Put the words in the correct order.",
        ["the", "closed", "Why", "shops", "are"],
        "Why are the shops closed?",
        "With be, use question word + verb + subject."
      ),
      wordOrderItem(
        "a1-7a-wo-2",
        "Put the words in the correct order.",
        ["travel", "Mia", "Who", "does", "with"],
        "Who does Mia travel with?",
        "With another verb, use question word + does + subject + base verb."
      ),
      {
        id: "a1-7a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with be, do, or does.",
        parts: [
          "A: Where ",
          { gapId: "g1" },
          " you from?\nB: I'm from Leeds.\nA: Where ",
          { gapId: "g2" },
          " you live now?\nB: In York.\nA: ",
          { gapId: "g3" },
          " your parents in York too?\nB: No, they aren't.\nA: What ",
          { gapId: "g4" },
          " they do?\nB: They're teachers.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["are"],
            feedback: "Use are in the be question Where are you from?",
          },
          {
            id: "g2",
            acceptedAnswers: ["do"],
            feedback: "Use do with the main verb live.",
          },
          {
            id: "g3",
            acceptedAnswers: ["Are"],
            feedback: "Begin the be question with Are.",
          },
          {
            id: "g4",
            acceptedAnswers: ["do"],
            feedback: "Use do with the plural subject they.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-7b-imperatives-object-pronouns",
    title: "7B · Imperatives and Object Pronouns",
    shortDescription: "Give instructions and replace object nouns with me, him, her, it, us, or them.",
    levels: ["a1"],
    intro:
      "Use the base verb for positive instructions, don't for negative instructions, and object pronouns after verbs and prepositions.",
    items: [
      multipleChoiceItem(
        "a1-7b-mc-1",
        "Choose the correct instruction.",
        "____ the lights, please. It's dark in here.",
        ["Turn on", "You turn on", "Turning on"],
        0,
        "Begin a positive imperative with the base verb."
      ),
      multipleChoiceItem(
        "a1-7b-mc-2",
        "Choose the correct negative instruction.",
        "____ this button. It starts the alarm.",
        ["Not press", "Doesn't press", "Don't press"],
        2,
        "Use don't + base verb for a negative imperative."
      ),
      multipleChoiceItem(
        "a1-7b-mc-3",
        "Choose the correct object pronoun.",
        "Please send the photo to ____.",
        ["I", "me", "my"],
        1,
        "Use the object pronoun me after the preposition to."
      ),
      multipleChoiceItem(
        "a1-7b-mc-4",
        "Choose the correct object pronoun.",
        "I know Sara well. I see ____ every weekend.",
        ["her", "she", "hers"],
        0,
        "Use her as the object of see."
      ),
      multipleChoiceItem(
        "a1-7b-mc-5",
        "Choose the correct object pronoun.",
        "These boxes are heavy. Can you move ____?",
        ["they", "it", "them"],
        2,
        "Use them to replace a plural object."
      ),
      placeholderChoiceGapItem(
        "a1-7b-cg-1",
        "Choose the correct object pronoun for each gap.",
        "Leo calls Ana every day. He calls ____ after work. Ana tells Leo and me about her day. She tells ____ everything.",
        ["her", "us"],
        "Use her for Ana and us for Leo and me.",
        ["me", "you", "him", "her", "it", "us", "them"]
      ),
      errorCorrectionItem(
        "a1-7b-ec-1",
        "Check the highlighted phrase.",
        "Please listen I for a moment.",
        "listen I",
        false,
        "listen to me",
        "Use the object pronoun me after the preposition to."
      ),
      errorCorrectionItem(
        "a1-7b-ec-2",
        "Check the highlighted instruction.",
        "Don't talks during the film.",
        "Don't talks",
        false,
        "Don't talk",
        "Use don't + base verb in a negative imperative."
      ),
      errorCorrectionItem(
        "a1-7b-ec-3",
        "Check the highlighted phrase.",
        "Please give it to us before lunch.",
        "give it to us",
        true,
        "",
        "Correct! It replaces one thing, and us is the object after to."
      ),
      wordOrderItem(
        "a1-7b-wo-1",
        "Put the words in the correct order.",
        ["table", "Please", "on", "put", "the", "them"],
        "Please put them on the table.",
        "Use the object pronoun after the verb: put them."
      ),
      wordOrderItem(
        "a1-7b-wo-2",
        "Put the words in the correct order.",
        ["now", "Don't", "it", "open"],
        "Don't open it now.",
        "Use don't + base verb, then the object pronoun."
      ),
      {
        id: "a1-7b-instructions-1",
        type: "gap-fill",
        prompt: "Complete each instruction with the base verb or the correct object pronoun in brackets.",
        parts: [
          "1. Take this note and give ",
          { gapId: "g1" },
          " to Ben. (it)\n2. Don't ",
          { gapId: "g2" },
          " the note to the other students. (show)\n3. Ben needs help. Please speak to ",
          { gapId: "g3" },
          ". (he)\n4. I have the answer. Ask Ben to call ",
          { gapId: "g4" },
          ". (I)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["it"],
            feedback: "Use it to replace this note.",
          },
          {
            id: "g2",
            acceptedAnswers: ["show"],
            feedback: "Use the base verb show after don't."
          },
          {
            id: "g3",
            acceptedAnswers: ["him"],
            feedback: "Use him as the object form of he."
          },
          {
            id: "g4",
            acceptedAnswers: ["me"],
            feedback: "Use me as the object form of I."
          },
        ],
      },
    ],
  },
  {
    id: "a1-8a-can-cant",
    title: "8A · Can and Can't",
    shortDescription: "Talk about ability, permission, and possibility with can and can't.",
    levels: ["a1"],
    intro:
      "Use can or can't with the base verb, put can before the subject in questions, and give short answers.",
    items: [
      multipleChoiceItem(
        "a1-8a-mc-1",
        "Choose the correct form.",
        "Mia ____ speak three languages.",
        ["can", "cans", "can to"],
        0,
        "Can has the same form with all subjects and is followed by the base verb."
      ),
      multipleChoiceItem(
        "a1-8a-mc-2",
        "Choose the correct negative form.",
        "I ____ come to the meeting tonight.",
        ["don't can", "can't", "am not can"],
        1,
        "Use can't + base verb for a negative sentence."
      ),
      multipleChoiceItem(
        "a1-8a-mc-3",
        "Choose the correct permission question.",
        "____ I use this chair?",
        ["Do", "Am", "Can"],
        2,
        "Put can before the subject to ask permission."
      ),
      multipleChoiceItem(
        "a1-8a-mc-4",
        "Choose the correct question form.",
        "____ your brother know how to swim?",
        ["Can", "Does", "Is"],
        1,
        "Use does before your brother and keep know in the base form."
      ),
      multipleChoiceItem(
        "a1-8a-mc-5",
        "Choose the best short answer.",
        "Can they stay until six?",
        ["No, they don't.", "No, they aren't.", "No, they can't."],
        2,
        "Use can or can't in a short answer to a can question."
      ),
      placeholderGapItem(
        "a1-8a-gf-1",
        "Complete the sentence with can or can't.",
        "The weather is warm, so we __________ sit in the garden.",
        "can",
        [],
        "Use can for something that is possible."
      ),
      doubleGap(
        "a1-8a-gf-2",
        "Complete the question and short answer.",
        ["", { gapId: "g1" }, " Leo drive? Yes, he ", { gapId: "g2" }, "."],
        ["Can"],
        ["can"],
        "Begin the question with Can and repeat can in the positive short answer."
      ),
      errorCorrectionItem(
        "a1-8a-ec-1",
        "Check the highlighted phrase.",
        "She cans play the piano very well.",
        "cans play",
        false,
        "can play",
        "Can does not take -s with he, she, or it."
      ),
      errorCorrectionItem(
        "a1-8a-ec-2",
        "Check the highlighted question.",
        "Do you can carry this bag?",
        "Do you can carry",
        false,
        "Can you carry",
        "Do not use do with can. Begin the question with Can."
      ),
      errorCorrectionItem(
        "a1-8a-ec-3",
        "Check the highlighted phrase.",
        "You can't take photos in this room.",
        "can't take",
        true,
        "",
        "Correct! Can't can express that something is not permitted."
      ),
      wordOrderItem(
        "a1-8a-wo-1",
        "Put the words in the correct order.",
        ["bag", "Can", "leave", "here", "my", "I"],
        "Can I leave my bag here?",
        "For a permission question, use can + subject + base verb."
      ),
      {
        id: "a1-8a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with can, can't, and the base verbs in brackets.",
        parts: [
          "A: We need someone to take photos at the school event. ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " this camera? (use)\nB: Yes, I ",
          { gapId: "g3" },
          ". I have to leave at six, so I ",
          { gapId: "g4" },
          " stay later.\nA: That's fine. ",
          { gapId: "g5" },
          " your sister ",
          { gapId: "g6" },
          " us after six? (help)\nB: No, she ",
          { gapId: "g7" },
          ". She's working.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Can"],
            feedback: "Begin the question with Can."
          },
          {
            id: "g2",
            acceptedAnswers: ["use"],
            feedback: "Use the base verb use after can."
          },
          {
            id: "g3",
            acceptedAnswers: ["can"],
            feedback: "Use can in the positive short answer."
          },
          {
            id: "g4",
            acceptedAnswers: ["can't", "cannot"],
            feedback: "The speaker has to leave at six, so use can't."
          },
          {
            id: "g5",
            acceptedAnswers: ["Can"],
            feedback: "Begin the question about the sister with Can."
          },
          {
            id: "g6",
            acceptedAnswers: ["help"],
            feedback: "Use the base verb help after can."
          },
          {
            id: "g7",
            acceptedAnswers: ["can't", "cannot"],
            feedback: "She is working, so use can't in the short answer."
          },
        ],
      },
    ],
  },
  {
    id: "a1-8b-like-love-hate-ing",
    title: "8B · Like, Love, and Hate + -ing",
    shortDescription: "Use verb + -ing after like, love, and hate, with accurate spelling.",
    levels: ["a1"],
    intro:
      "Choose the -ing form after like, love, and hate, then apply the spelling rules in questions and descriptions.",
    items: [
      multipleChoiceItem(
        "a1-8b-mc-1",
        "Choose the correct verb form.",
        "I like ____ photos of city streets.",
        ["taking", "take", "takes"],
        0,
        "Use verb + -ing after like."
      ),
      multipleChoiceItem(
        "a1-8b-mc-2",
        "Choose the correct verb form.",
        "She loves ____ to podcasts on the bus.",
        ["listen", "listens", "listening"],
        2,
        "Use verb + -ing after loves."
      ),
      multipleChoiceItem(
        "a1-8b-mc-3",
        "Choose the correct verb form.",
        "We don't like ____ in long queues.",
        ["wait", "waiting", "waits"],
        1,
        "Use verb + -ing after don't like."
      ),
      multipleChoiceItem(
        "a1-8b-mc-4",
        "Choose the correct -ing spelling.",
        "dance → ____",
        ["dancing", "danceing", "dancinng"],
        0,
        "Drop the final e before adding -ing: dance → dancing."
      ),
      multipleChoiceItem(
        "a1-8b-mc-5",
        "Choose the correct -ing spelling.",
        "run → ____",
        ["runing", "runinng", "running"],
        2,
        "Double the final consonant after one vowel: run → running."
      ),
      placeholderGapItem(
        "a1-8b-gf-1",
        "Complete the sentence with the -ing form of the verb.",
        "He hates __________ wet clothes. (wear)",
        "wearing",
        [],
        "Add -ing to wear: wearing."
      ),
      doubleGap(
        "a1-8b-gf-2",
        "Complete the sentence with the -ing forms in brackets.",
        ["I love ", { gapId: "g1" }, ", but I don't like ", { gapId: "g2" }, " walls. (draw / paint)"],
        ["drawing"],
        ["painting"],
        "Use the -ing form after love and don't like."
      ),
      errorCorrectionItem(
        "a1-8b-ec-1",
        "Check the highlighted phrase.",
        "She likes cook for her friends.",
        "likes cook",
        false,
        "likes cooking",
        "Use the -ing form after likes."
      ),
      errorCorrectionItem(
        "a1-8b-ec-2",
        "Check the highlighted word.",
        "They hate waitting for slow buses.",
        "waitting",
        false,
        "waiting",
        "Waiting has one t because wait does not end in one vowel + one consonant."
      ),
      errorCorrectionItem(
        "a1-8b-ec-3",
        "Check the highlighted phrase.",
        "Mara loves dancing with her friends.",
        "loves dancing",
        true,
        "",
        "Correct! Use the -ing form after loves."
      ),
      wordOrderItem(
        "a1-8b-wo-1",
        "Put the words in the correct order.",
        ["playing", "What", "like", "games", "you", "do"],
        "What games do you like playing?",
        "Use like + -ing in the present-simple question."
      ),
      {
        id: "a1-8b-profile-1",
        type: "gap-fill",
        prompt: "Complete the description with the -ing forms of the verbs.",
        parts: [
          "On Saturdays, Ken loves ",
          { gapId: "g1" },
          " in the morning. He likes ",
          { gapId: "g2" },
          " friends for lunch, but he hates ",
          { gapId: "g3" },
          ". In the evening, he likes ",
          { gapId: "g4" },
          " films. (cycle / meet / shop / watch)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["cycling"],
            feedback: "Drop the final e before adding -ing: cycle → cycling."
          },
          {
            id: "g2",
            acceptedAnswers: ["meeting"],
            feedback: "Add -ing to meet: meeting."
          },
          {
            id: "g3",
            acceptedAnswers: ["shopping"],
            feedback: "Double the final p before adding -ing: shop → shopping."
          },
          {
            id: "g4",
            acceptedAnswers: ["watching"],
            feedback: "Add -ing to watch: watching."
          },
        ],
      },
    ],
  },
  {
    id: "a1-9a-present-continuous",
    title: "9A · Present Continuous",
    shortDescription: "Describe actions happening now with be and the -ing form.",
    levels: ["a1"],
    intro:
      "Build present-continuous statements, negatives, questions, and short answers, with careful attention to be and -ing spelling.",
    items: [
      multipleChoiceItem(
        "a1-9a-mc-1",
        "Choose the correct verb form.",
        "The children ____ in the garden right now.",
        ["play", "are playing", "plays"],
        1,
        "Use are + verb-ing with the plural subject the children."
      ),
      multipleChoiceItem(
        "a1-9a-mc-2",
        "Choose the correct verb form.",
        "I ____ for the train at the moment.",
        ["waiting", "wait", "am waiting"],
        2,
        "Use am + verb-ing with I."
      ),
      placeholderGapItem(
        "a1-9a-gf-1",
        "Complete the sentence with the correct form of the verb in brackets.",
        "Leo __________ his bicycle now. (repair)",
        "is repairing",
        ["'s repairing"],
        "Use is + repairing for an action happening now."
      ),
      multipleChoiceItem(
        "a1-9a-mc-3",
        "Choose the correct negative form.",
        "Mina ____ today because she is ill.",
        ["isn't working", "doesn't working", "not working"],
        0,
        "Use isn't + verb-ing with she."
      ),
      placeholderGapItem(
        "a1-9a-gf-2",
        "Complete the sentence with the correct form of the verb in brackets.",
        "We __________ dinner at the moment. (make)",
        "are making",
        ["'re making"],
        "Use are + making with we. Drop the final e before adding -ing."
      ),
      multipleChoiceItem(
        "a1-9a-mc-4",
        "Choose the correct -ing form.",
        "swim → ____",
        ["swiming", "swimming", "swims"],
        1,
        "Double the final consonant before adding -ing: swim → swimming."
      ),
      multipleChoiceItem(
        "a1-9a-mc-5",
        "Choose the correct form of be.",
        "____ your parents travelling today?",
        ["Is", "Do", "Are"],
        2,
        "Put are before the plural subject your parents."
      ),
      doubleGap(
        "a1-9a-gf-3",
        "Complete the question. Use the verb in brackets.",
        ["", { gapId: "g1" }, " Noah ", { gapId: "g2" }, " his room? (paint)"],
        ["Is"],
        ["painting"],
        "Use is before Noah and the -ing form painting after the subject."
      ),
      multipleChoiceItem(
        "a1-9a-mc-6",
        "Choose the correct form of be.",
        "Why ____ Ella crying?",
        ["does", "is", "are"],
        1,
        "Use is with Ella in a present-continuous question."
      ),
      doubleGap(
        "a1-9a-gf-4",
        "Complete the question. Use the verb in brackets.",
        ["What ", { gapId: "g1" }, " you ", { gapId: "g2" }, "? (cook)"],
        ["are"],
        ["cooking"],
        "Use question word + are + subject + verb-ing."
      ),
      multipleChoiceItem(
        "a1-9a-mc-7",
        "Choose the best short answer.",
        "Are they waiting outside?",
        ["Yes, they are.", "Yes, they're.", "Yes, they do."],
        0,
        "Use are in the short answer, without a contraction."
      ),
      errorCorrectionItem(
        "a1-9a-ec-1",
        "Check the highlighted phrase.",
        "He watching a video in his room.",
        "He watching",
        false,
        ["He is watching", "He's watching"],
        "The present continuous needs be: He is watching or He's watching."
      ),
      errorCorrectionItem(
        "a1-9a-ec-2",
        "Check the highlighted word.",
        "I am writeing an email to my cousin.",
        "writeing",
        false,
        "writing",
        "Drop the final e before adding -ing: write → writing."
      ),
      errorCorrectionItem(
        "a1-9a-ec-3",
        "Check the highlighted phrase.",
        "The dogs aren't sleeping in the kitchen.",
        "aren't sleeping",
        true,
        "",
        "Correct! Use aren't + verb-ing with a plural subject."
      ),
      wordOrderItem(
        "a1-9a-wo-1",
        "Put the words in the correct order.",
        ["to", "She", "her", "is", "manager", "talking"],
        "She is talking to her manager.",
        "The order is subject + be + verb-ing."
      ),
      wordOrderItem(
        "a1-9a-wo-2",
        "Put the words in the correct order.",
        ["today", "not", "We", "the", "are", "car", "using"],
        "We are not using the car today.",
        "Put not after be in a negative present-continuous sentence."
      ),
      wordOrderItem(
        "a1-9a-wo-3",
        "Put the words in the correct order.",
        ["looking", "What", "you", "at", "are"],
        "What are you looking at?",
        "Use question word + be + subject + verb-ing."
      ),
      {
        id: "a1-9a-scene-1",
        type: "gap-fill",
        prompt: "Complete the scene. Use the base verb in brackets where shown.",
        parts: [
          "It is 8:00. Theo ",
          { gapId: "g1" },
          " his bag. (pack)\nHis sister ",
          { gapId: "g2" },
          " the tickets. (check)\nThey ",
          { gapId: "g3" },
          " the house yet. (leave)\n",
          { gapId: "g4" },
          " their parents ",
          { gapId: "g5" },
          " in the car? (wait)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["is packing", "'s packing"],
            feedback: "Use is + packing with Theo.",
          },
          {
            id: "g2",
            acceptedAnswers: ["is checking", "'s checking"],
            feedback: "Use is + checking with his sister.",
          },
          {
            id: "g3",
            acceptedAnswers: ["aren't leaving", "are not leaving"],
            feedback: "Yet and the context show that they are not leaving now.",
          },
          {
            id: "g4",
            acceptedAnswers: ["Are"],
            feedback: "Begin the question about the plural subject their parents with Are.",
          },
          {
            id: "g5",
            acceptedAnswers: ["waiting"],
            feedback: "Use the -ing form waiting after are and the subject.",
          },
        ],
      },
    ],
  },
  {
    id: "a1-9b-present-continuous-or-simple",
    title: "9B · Present Continuous or Present Simple?",
    shortDescription: "Choose between routines and actions happening now or today.",
    levels: ["a1"],
    intro:
      "Use the present simple for usual actions and the present continuous for actions happening now or around today.",
    items: [
      multipleChoiceItem(
        "a1-9b-mc-1",
        "Choose the correct verb form.",
        "Nico ____ breakfast at home every weekday.",
        ["is having", "has", "having"],
        1,
        "Every weekday describes a routine, so use the present simple."
      ),
      multipleChoiceItem(
        "a1-9b-mc-2",
        "Choose the correct verb form.",
        "Be quiet! The baby ____.",
        ["sleeps", "sleep", "is sleeping"],
        2,
        "The action is happening now, so use the present continuous."
      ),
      placeholderGapItem(
        "a1-9b-gf-1",
        "Complete the sentence with the correct form of the verb in brackets.",
        "I usually __________ lunch at about one o'clock. (eat)",
        "eat",
        [],
        "Usually signals a routine, so use the present simple."
      ),
      placeholderGapItem(
        "a1-9b-gf-2",
        "Complete the sentence with the correct form of the verb in brackets.",
        "Please call later. I __________ a customer right now. (help)",
        "am helping",
        ["'m helping"],
        "Right now signals the present continuous."
      ),
      multipleChoiceItem(
        "a1-9b-mc-3",
        "Choose the sentence about a usual habit.",
        "Which sentence describes a routine?",
        ["We often take the early train.", "We're taking the early train today.", "We're on the early train now."],
        0,
        "Often describes a repeated habit, so use the present simple."
      ),
      multipleChoiceItem(
        "a1-9b-mc-4",
        "Choose the sentence about today.",
        "Which sentence describes a temporary action?",
        ["I work at the front desk every day.", "I usually work upstairs.", "I'm working at the front desk today."],
        2,
        "Today can describe a temporary action happening around now."
      ),
      doubleGap(
        "a1-9b-gf-3",
        "Complete each gap with the correct form of the base verb beside it.",
        ["Lina usually ", { gapId: "g1" }, " to work. (drive) But today she ", { gapId: "g2" }, " the bus. (take)"],
        ["drives"],
        ["is taking", "'s taking"],
        "Use the present simple for the usual action and the present continuous for today."
      ),
      multipleChoiceItem(
        "a1-9b-mc-5",
        "Choose the time expression that best completes the sentence.",
        "Sam is wearing a suit ____.",
        ["every Monday", "at the moment", "usually"],
        1,
        "At the moment matches the present continuous."
      ),
      multipleChoiceItem(
        "a1-9b-mc-6",
        "Choose the correct verb form.",
        "My parents never ____ coffee after dinner.",
        ["drink", "are drinking", "drinks"],
        0,
        "Never describes a usual pattern, so use the present simple."
      ),
      errorCorrectionItem(
        "a1-9b-ec-1",
        "Check the highlighted phrase.",
        "Ella is usually walking to college.",
        "is usually walking",
        false,
        "usually walks",
        "Use the present simple for a usual action."
      ),
      errorCorrectionItem(
        "a1-9b-ec-2",
        "Check the highlighted phrase.",
        "Look outside! It rains heavily.",
        "rains",
        false,
        "is raining",
        "The action is happening now, so use is raining."
      ),
      errorCorrectionItem(
        "a1-9b-ec-3",
        "Check the highlighted phrase.",
        "We don't normally open on Sundays.",
        "don't normally open",
        true,
        "",
        "Correct! Normally describes a routine, so the present simple is appropriate."
      ),
      wordOrderItem(
        "a1-9b-wo-1",
        "Put the words in the correct order.",
        ["after", "usually", "work", "They", "exercise"],
        "They usually exercise after work.",
        "Use the present simple and put usually before the main verb."
      ),
      wordOrderItem(
        "a1-9b-wo-2",
        "Put the words in the correct order.",
        ["this", "with", "staying", "week", "I'm", "friends"],
        "I'm staying with friends this week.",
        "This week describes a temporary situation, so use the present continuous."
      ),
      multipleChoiceItem(
        "a1-9b-mc-7",
        "Choose the correct question.",
        "You want to ask about Kim's usual journey to work.",
        ["Is Kim going to work?", "Kim goes to work by bus?", "Does Kim go to work by bus?"],
        2,
        "Use does + base verb to ask about a usual action."
      ),
      multipleChoiceItem(
        "a1-9b-mc-8",
        "Choose the correct question.",
        "You can hear music and want to know about it now.",
        ["Do they play music?", "Are they playing music?", "They are playing music?"],
        1,
        "Use are + subject + verb-ing for an action happening now."
      ),
      {
        id: "a1-9b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation. Use the base verb in brackets where shown.",
        parts: [
          "A: Where ",
          { gapId: "g1" },
          " you usually ",
          { gapId: "g2" },
          " after class? (go)\nB: I usually go home, but today I ",
          { gapId: "g3" },
          " for a friend. (wait)\nA: ",
          { gapId: "g4" },
          " she ",
          { gapId: "g5" },
          " here now? (come)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["do"],
            feedback: "Use do before you in a present-simple question.",
          },
          {
            id: "g2",
            acceptedAnswers: ["go"],
            feedback: "Use the base verb go after the subject."
          },
          {
            id: "g3",
            acceptedAnswers: ["am waiting", "'m waiting"],
            feedback: "Today shows a temporary action, so use am waiting.",
          },
          {
            id: "g4",
            acceptedAnswers: ["Is"],
            feedback: "Begin the present-continuous question about she with Is.",
          },
          {
            id: "g5",
            acceptedAnswers: ["coming"],
            feedback: "Use coming after is and the subject."
          },
        ],
      },
      {
        id: "a1-9b-routine-now-1",
        type: "gap-fill",
        prompt: "Complete the description. Use the correct form of each base verb in brackets.",
        parts: [
          "Ravi usually ",
          { gapId: "g1" },
          " in a shop. (work)\nHe ",
          { gapId: "g2" },
          " a dark uniform there. (wear)\nThis week he ",
          { gapId: "g3" },
          " his sister at her café. (help)\nToday he ",
          { gapId: "g4" },
          " food to customers. (serve)\nHis usual uniform is at home, so he ",
          { gapId: "g5" },
          " it today. (wear)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["works"],
            feedback: "Usually signals the present simple: Ravi works."
          },
          {
            id: "g2",
            acceptedAnswers: ["wears"],
            feedback: "This is part of his usual work routine, so use wears."
          },
          {
            id: "g3",
            acceptedAnswers: ["is helping", "'s helping"],
            feedback: "This week describes a temporary action, so use is helping."
          },
          {
            id: "g4",
            acceptedAnswers: ["is serving", "'s serving"],
            feedback: "Today describes what is happening now, so use is serving."
          },
          {
            id: "g5",
            acceptedAnswers: ["isn't wearing", "is not wearing"],
            feedback: "Today contrasts with his usual routine, so use isn't wearing."
          },
        ],
      },
    ],
  },
  {
    id: "a1-10a-there-is-there-are",
    title: "10A · There Is, There Are, Some, and Any",
    shortDescription: "Say what is in a place and use some and any with plural nouns.",
    levels: ["a1"],
    intro:
      "Practise singular and plural forms of there is and there are, then use some and any in statements, negatives, and questions.",
    items: [
      multipleChoiceItem(
        "a1-10a-mc-1",
        "Choose the correct form.",
        "____ a notice beside the entrance.",
        ["There are", "There is", "Are there"],
        1,
        "Use there is before one singular thing."
      ),
      multipleChoiceItem(
        "a1-10a-mc-2",
        "Choose the correct form.",
        "____ three clean glasses on the shelf.",
        ["There's", "There isn't", "There are"],
        2,
        "Use there are before a plural noun."
      ),
      multipleChoiceItem(
        "a1-10a-mc-3",
        "Choose the correct word.",
        "There are ____ cushions on the sofa.",
        ["some", "any", "a"],
        0,
        "Use some with a plural noun in an affirmative sentence."
      ),
      multipleChoiceItem(
        "a1-10a-mc-4",
        "Choose the correct word.",
        "There aren't ____ clean plates.",
        ["some", "a", "any"],
        2,
        "Use any with a plural noun in a negative sentence."
      ),
      multipleChoiceItem(
        "a1-10a-mc-5",
        "Choose the correct word.",
        "Are there ____ lockers near the office?",
        ["any", "some", "a"],
        0,
        "Use any with a plural noun in a question."
      ),
      placeholderGapItem(
        "a1-10a-gf-1",
        "Complete the sentence.",
        "__________ a small balcony outside my room.",
        "There is",
        ["There's"],
        "Use there is or there's before one singular thing."
      ),
      placeholderGapItem(
        "a1-10a-gf-2",
        "Complete the sentence.",
        "__________ two messages for you on the desk.",
        "There are",
        [],
        "Use there are before the plural noun messages."
      ),
      doubleGap(
        "a1-10a-gf-3",
        "Complete the two negative sentences.",
        ["", { gapId: "g1" }, " a printer in this office. ", { gapId: "g2" }, " any computers here either."],
        ["There isn't", "There is not"],
        ["There aren't", "There are not"],
        "Use there isn't with one thing and there aren't with plural things."
      ),
      multipleChoiceItem(
        "a1-10a-mc-6",
        "Choose the correct question.",
        "You want to know if the building has a lift.",
        ["Are there a lift?", "Is there a lift?", "There is a lift?"],
        1,
        "Put is before there when asking about one thing."
      ),
      multipleChoiceItem(
        "a1-10a-mc-7",
        "Choose the best short answer.",
        "Are there any cafés near the station?",
        ["Yes, there are.", "Yes, there is.", "Yes, they're."],
        0,
        "Answer a plural there are question with Yes, there are."
      ),
      doubleGap(
        "a1-10a-gf-4",
        "Complete the question and short answer.",
        ["", { gapId: "g1" }, " any towels in the bathroom? No, ", { gapId: "g2" }, "."],
        ["Are there"],
        ["there aren't", "there are not"],
        "Use Are there for the plural question and there aren't in the negative short answer."
      ),
      errorCorrectionItem(
        "a1-10a-ec-1",
        "Check the highlighted phrase.",
        "There are a sofa under the window.",
        "There are",
        false,
        "There is",
        "Use there is before the singular noun a sofa."
      ),
      errorCorrectionItem(
        "a1-10a-ec-2",
        "Check the highlighted word.",
        "There aren't some bins in this street.",
        "some",
        false,
        "any",
        "Use any, not some, in a negative sentence."
      ),
      errorCorrectionItem(
        "a1-10a-ec-3",
        "Check the highlighted question.",
        "Is there a pharmacy near here?",
        "Is there a pharmacy",
        true,
        "",
        "Correct! Use Is there to ask about one place or thing."
      ),
      wordOrderItem(
        "a1-10a-wo-1",
        "Put the words in the correct order.",
        ["on", "a", "There", "is", "floor", "the", "lamp"],
        "There is a lamp on the floor.",
        "Begin with there is, then add the singular noun phrase."
      ),
      wordOrderItem(
        "a1-10a-wo-2",
        "Put the words in the correct order.",
        ["any", "park", "Are", "trees", "the", "there", "in"],
        "Are there any trees in the park?",
        "Use Are there any + plural noun in a question."
      ),
      placeholderChoiceGapItem(
        "a1-10a-cg-1",
        "Choose some or any for each gap.",
        "There are ____ plants by the window. There aren't ____ plants by the door. Are there ____ plants upstairs?",
        ["some", "any", "any"],
        "Use some in an affirmative sentence and any in negatives and questions.",
        ["some", "any"]
      ),
      {
        id: "a1-10a-classroom-1",
        type: "gap-fill",
        prompt: "Complete the conversation about the new classroom.",
        parts: [
          "A: Is the new classroom ready?\nB: Yes. ",
          { gapId: "g1" },
          " a large screen, and ",
          { gapId: "g2" },
          " some tables. But ",
          { gapId: "g3" },
          " any chairs yet.\nA: ",
          { gapId: "g4" },
          " any windows?\nB: Yes, ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["There is", "There's"],
            feedback: "Use there is before the singular noun a screen."
          },
          {
            id: "g2",
            acceptedAnswers: ["there are"],
            feedback: "Use there are before the plural noun tables."
          },
          {
            id: "g3",
            acceptedAnswers: ["there aren't", "there are not"],
            feedback: "Use there aren't before any chairs."
          },
          {
            id: "g4",
            acceptedAnswers: ["Are there"],
            feedback: "Begin the plural question with Are there."
          },
          {
            id: "g5",
            acceptedAnswers: ["there are"],
            feedback: "Use there are in a positive short answer."
          },
        ],
      },
    ],
  },
  {
    id: "a1-10b-past-simple-be",
    title: "10B · Past Simple: Be",
    shortDescription: "Use was and were in past statements, negatives, questions, and short answers.",
    levels: ["a1"],
    intro:
      "Move from was and were in simple past statements to negatives, questions, short answers, and there was or there were.",
    items: [
      multipleChoiceItem(
        "a1-10b-mc-1",
        "Choose the correct past form of be.",
        "I ____ at the dentist yesterday morning.",
        ["was", "were", "am"],
        0,
        "Use was with I in the past."
      ),
      multipleChoiceItem(
        "a1-10b-mc-2",
        "Choose the correct past form of be.",
        "The shops ____ very busy last Saturday.",
        ["was", "are", "were"],
        2,
        "Use were with the plural subject the shops."
      ),
      multipleChoiceItem(
        "a1-10b-mc-3",
        "Choose the correct negative form.",
        "Ben ____ at training last night because he was ill.",
        ["weren't", "wasn't", "isn't"],
        1,
        "Use wasn't with Ben in the past."
      ),
      multipleChoiceItem(
        "a1-10b-mc-4",
        "Choose the correct negative form.",
        "We ____ ready when the taxi arrived.",
        ["weren't", "wasn't", "aren't"],
        0,
        "Use weren't with we in the past."
      ),
      placeholderGapItem(
        "a1-10b-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "Kai __________ at the library yesterday afternoon. (be)",
        "was",
        [],
        "Use was with one person in the past."
      ),
      placeholderGapItem(
        "a1-10b-gf-2",
        "Complete the sentence with the past form of the verb in brackets.",
        "My gloves __________ under the seat this morning. (be)",
        "were",
        [],
        "Use were with the plural noun gloves."
      ),
      doubleGap(
        "a1-10b-gf-3",
        "Complete the question and short answer with the past form of be.",
        ["", { gapId: "g1" }, " the clinic open yesterday? No, it ", { gapId: "g2" }, "."],
        ["Was"],
        ["wasn't", "was not"],
        "Use was in the question and wasn't in the negative short answer."
      ),
      multipleChoiceItem(
        "a1-10b-mc-5",
        "Choose the correct question.",
        "____ your keys in your coat pocket?",
        ["Was", "Were", "Are"],
        1,
        "Use were before the plural subject your keys."
      ),
      multipleChoiceItem(
        "a1-10b-mc-6",
        "Choose the best short answer.",
        "Was Eva at the meeting?",
        ["Yes, she were.", "Yes, she's.", "Yes, she was."],
        2,
        "Use was in the positive short answer."
      ),
      doubleGap(
        "a1-10b-gf-4",
        "Complete both gaps with the past form of the verb in brackets.",
        ["Where ", { gapId: "g1" }, " you last night? (be) I ", { gapId: "g2" }, " at my cousin's house. (be)"],
        ["were"],
        ["was"],
        "Use were with you and was with I."
      ),
      placeholderGapItem(
        "a1-10b-gf-5",
        "Complete the sentence.",
        "__________ a power cut in our street last night.",
        "There was",
        [],
        "Use there was before one past event or thing."
      ),
      placeholderGapItem(
        "a1-10b-gf-6",
        "Complete the sentence.",
        "__________ several empty seats near the front.",
        "There were",
        [],
        "Use there were before a plural noun in the past."
      ),
      errorCorrectionItem(
        "a1-10b-ec-1",
        "Check the highlighted word.",
        "You was very quiet at lunch.",
        "was",
        false,
        "were",
        "Use were with you in the past."
      ),
      errorCorrectionItem(
        "a1-10b-ec-2",
        "Check the highlighted phrase.",
        "Were Ben at work yesterday?",
        "Were Ben",
        false,
        "Was Ben",
        "Use was with the singular subject Ben."
      ),
      errorCorrectionItem(
        "a1-10b-ec-3",
        "Check the highlighted phrase.",
        "There weren't any buses after midnight.",
        "There weren't",
        true,
        "",
        "Correct! Use there weren't before a plural noun in a past negative sentence."
      ),
      wordOrderItem(
        "a1-10b-wo-1",
        "Put the words in the correct order.",
        ["the", "They", "at", "concert", "were", "last", "night"],
        "They were at the concert last night.",
        "Use subject + were + place + past time expression."
      ),
      wordOrderItem(
        "a1-10b-wo-2",
        "Put the words in the correct order.",
        ["there", "Was", "near", "hotel", "the", "a", "beach"],
        "Was there a beach near the hotel?",
        "Put was before there to make a singular question about the past."
      ),
      {
        id: "a1-10b-weekend-1",
        type: "gap-fill",
        prompt: "Complete each gap with the correct past form of the verb be.",
        parts: [
          "Last weekend ",
          { gapId: "g1" },
          " very busy. (be)\nMy parents ",
          { gapId: "g2" },
          " at home on Saturday. (be)\nI ",
          { gapId: "g3" },
          " with them (be) because I ",
          { gapId: "g4" },
          " at work. (be)\n",
          { gapId: "g5" },
          " they free on Sunday? (be)\nNo, they ",
          { gapId: "g6" },
          ". (be)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["was"],
            feedback: "Use was with the singular subject last weekend."
          },
          {
            id: "g2",
            acceptedAnswers: ["were"],
            feedback: "Use were with my parents."
          },
          {
            id: "g3",
            acceptedAnswers: ["wasn't", "was not"],
            feedback: "The sentence gives a contrasting reason, so use wasn't."
          },
          {
            id: "g4",
            acceptedAnswers: ["was"],
            feedback: "Use was with I."
          },
          {
            id: "g5",
            acceptedAnswers: ["Were"],
            feedback: "Begin the question about they with Were."
          },
          {
            id: "g6",
            acceptedAnswers: ["weren't", "were not"],
            feedback: "Use weren't in the negative short answer."
          },
        ],
      },
    ],
  },
  {
    id: "a1-11a-past-simple-regular-verbs",
    title: "11A · Past Simple: Regular Verbs",
    shortDescription: "Use regular past forms in statements, negatives, questions, and short answers.",
    levels: ["a1"],
    intro:
      "Practise regular -ed spelling, then use did and didn't with the base verb in past-simple questions and negatives.",
    items: [
      multipleChoiceItem(
        "a1-11a-mc-1",
        "Choose the correct past form.",
        "clean → ____",
        ["cleant", "cleaned", "cleanid"],
        1,
        "Most regular verbs form the past with -ed: clean → cleaned."
      ),
      multipleChoiceItem(
        "a1-11a-mc-2",
        "Choose the correct past form.",
        "move → ____",
        ["moveed", "movved", "moved"],
        2,
        "For a verb ending in e, add -d: move → moved."
      ),
      multipleChoiceItem(
        "a1-11a-mc-3",
        "Choose the correct past form.",
        "carry → ____",
        ["carried", "carryed", "carrid"],
        0,
        "After a consonant + y, change y to i and add -ed."
      ),
      multipleChoiceItem(
        "a1-11a-mc-4",
        "Choose the correct past form.",
        "plan → ____",
        ["planed", "planned", "planied"],
        1,
        "Double the final consonant before adding -ed: plan → planned."
      ),
      placeholderGapItem(
        "a1-11a-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "We __________ a small castle on Sunday. (visit)",
        "visited",
        [],
        "Add -ed to the regular verb visit."
      ),
      placeholderGapItem(
        "a1-11a-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "Maya __________ the report yesterday. (not finish)",
        "didn't finish",
        ["did not finish"],
        "Use didn't + the base verb finish."
      ),
      multipleChoiceItem(
        "a1-11a-mc-5",
        "Choose the correct auxiliary.",
        "____ you call the hotel yesterday?",
        ["Was", "Did", "Do"],
        1,
        "Use did to make a past-simple question."
      ),
      multipleChoiceItem(
        "a1-11a-mc-6",
        "Choose the correct verb form.",
        "Did the shop ____ on time this morning?",
        ["open", "opens", "opened"],
        0,
        "Use the base verb after did."
      ),
      multipleChoiceItem(
        "a1-11a-mc-7",
        "Choose the best short answer.",
        "Did Amir text you last night?",
        ["No, he wasn't.", "No, he doesn't.", "No, he didn't."],
        2,
        "Use didn't in a negative short answer to a did question."
      ),
      doubleGap(
        "a1-11a-gf-3",
        "Complete the question and short answer. Use the verb in brackets.",
        ["", { gapId: "g1" }, " Ada ", { gapId: "g2" }, " you after class? No, she didn't. (phone)"],
        ["Did"],
        ["phone"],
        "Use did before the subject and the base verb phone after it."
      ),
      errorCorrectionItem(
        "a1-11a-ec-1",
        "Check the highlighted phrase.",
        "We didn't watched the match last night.",
        "didn't watched",
        false,
        "didn't watch",
        "Use the base verb after didn't."
      ),
      errorCorrectionItem(
        "a1-11a-ec-2",
        "Check the highlighted word.",
        "They planed a picnic for Saturday.",
        "planed",
        false,
        "planned",
        "Double the final consonant before adding -ed: planned."
      ),
      errorCorrectionItem(
        "a1-11a-ec-3",
        "Check the highlighted phrase.",
        "The children played in the garden after lunch.",
        "played",
        true,
        "",
        "Correct! Played is the regular past form of play."
      ),
      wordOrderItem(
        "a1-11a-wo-1",
        "Put the words in the correct order.",
        ["evening", "called", "yesterday", "I", "my", "aunt"],
        "I called my aunt yesterday evening.",
        "Use the regular past form called before the object."
      ),
      wordOrderItem(
        "a1-11a-wo-2",
        "Put the words in the correct order.",
        ["door", "didn't", "They", "the", "close"],
        "They didn't close the door.",
        "Use didn't + base verb in a past negative sentence."
      ),
      wordOrderItem(
        "a1-11a-wo-3",
        "Put the words in the correct order.",
        ["arrive", "train", "the", "Did", "late"],
        "Did the train arrive late?",
        "Use did + subject + base verb in a past question."
      ),
      {
        id: "a1-11a-diary-1",
        type: "gap-fill",
        prompt: "Complete each gap with the past form of the base verb in brackets.",
        parts: [
          "On Saturday, Leila ",
          { gapId: "g1" },
          " her grandmother. (visit)\nThey ",
          { gapId: "g2" },
          " lunch together. (cook)\nAfter lunch, they ",
          { gapId: "g3" },
          " through the park. (walk)\nIt ",
          { gapId: "g4" },
          " to rain. (start)\nSo they ",
          { gapId: "g5" },
          " home. (hurry)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["visited"],
            feedback: "Add -ed to visit: visited."
          },
          {
            id: "g2",
            acceptedAnswers: ["cooked"],
            feedback: "Add -ed to cook: cooked."
          },
          {
            id: "g3",
            acceptedAnswers: ["walked"],
            feedback: "Add -ed to walk: walked."
          },
          {
            id: "g4",
            acceptedAnswers: ["started"],
            feedback: "Add -ed to start: started."
          },
          {
            id: "g5",
            acceptedAnswers: ["hurried"],
            feedback: "Change the final y to i and add -ed: hurried."
          },
        ],
      },
      {
        id: "a1-11a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation. Use the base verb in brackets where shown.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " the concert? (enjoy)\nB: Yes, I ",
          { gapId: "g3" },
          ".\nA: ",
          { gapId: "g4" },
          " the band ",
          { gapId: "g5" },
          " late? (finish)\nB: No, they ",
          { gapId: "g6" },
          ".",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Did"],
            feedback: "Begin the past-simple question with Did."
          },
          {
            id: "g2",
            acceptedAnswers: ["enjoy"],
            feedback: "Use the base verb enjoy after did."
          },
          {
            id: "g3",
            acceptedAnswers: ["did"],
            feedback: "Use did in a positive short answer."
          },
          {
            id: "g4",
            acceptedAnswers: ["Did"],
            feedback: "Begin the second past-simple question with Did."
          },
          {
            id: "g5",
            acceptedAnswers: ["finish"],
            feedback: "Use the base verb finish after did."
          },
          {
            id: "g6",
            acceptedAnswers: ["didn't", "did not"],
            feedback: "Use didn't in a negative short answer."
          },
        ],
      },
    ],
  },
  {
    id: "a1-11b-past-simple-irregular-get-go-have-do",
    title: "11B · Past Simple: Get, Go, Have, and Do",
    shortDescription: "Use four common irregular past forms and build questions and negatives with did.",
    levels: ["a1"],
    intro:
      "Learn got, went, had, and did, then keep the base verb after did and didn't in questions and negatives.",
    items: [
      multipleChoiceItem(
        "a1-11b-mc-1",
        "Choose the correct past form.",
        "get → ____",
        ["getted", "got", "get"],
        1,
        "The past form of get is got."
      ),
      multipleChoiceItem(
        "a1-11b-mc-2",
        "Choose the correct past form.",
        "go → ____",
        ["goed", "go", "went"],
        2,
        "The past form of go is went."
      ),
      multipleChoiceItem(
        "a1-11b-mc-3",
        "Choose the correct past form.",
        "have → ____",
        ["had", "haved", "has"],
        0,
        "The past form of have is had."
      ),
      multipleChoiceItem(
        "a1-11b-mc-4",
        "Choose the correct past form.",
        "do → ____",
        ["done", "did", "doed"],
        1,
        "The past form of do is did."
      ),
      placeholderGapItem(
        "a1-11b-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "I __________ home just before midnight. (get)",
        "got",
        [],
        "Use the irregular past form got."
      ),
      placeholderGapItem(
        "a1-11b-gf-2",
        "Complete the sentence with the past form of the verb in brackets.",
        "Rosa __________ to the market before lunch. (go)",
        "went",
        [],
        "Use the irregular past form went."
      ),
      placeholderGapItem(
        "a1-11b-gf-3",
        "Complete the sentence with the past form of the verb in brackets.",
        "We __________ soup and bread for dinner. (have)",
        "had",
        [],
        "Use the irregular past form had."
      ),
      placeholderGapItem(
        "a1-11b-gf-4",
        "Complete the sentence with the past form of the verb in brackets.",
        "The children __________ their homework before the film. (do)",
        "did",
        [],
        "Use the irregular past form did."
      ),
      multipleChoiceItem(
        "a1-11b-mc-5",
        "Choose the correct negative form.",
        "Luca ____ to the gym yesterday.",
        ["didn't went", "not went", "didn't go"],
        2,
        "Use didn't + the base verb go."
      ),
      multipleChoiceItem(
        "a1-11b-mc-6",
        "Choose the correct negative form.",
        "We ____ time for breakfast this morning.",
        ["didn't have", "didn't had", "not had"],
        0,
        "Use didn't + the base verb have."
      ),
      multipleChoiceItem(
        "a1-11b-mc-7",
        "Choose the correct auxiliary.",
        "____ you get my message last night?",
        ["Does", "Did", "Was"],
        1,
        "Use did to make a past-simple question."
      ),
      multipleChoiceItem(
        "a1-11b-mc-8",
        "Choose the correct verb form.",
        "Where did your friends ____ after dinner?",
        ["went", "goed", "go"],
        2,
        "Use the base verb go after did."
      ),
      multipleChoiceItem(
        "a1-11b-mc-9",
        "Choose the best short answer.",
        "Did Sara do the shopping?",
        ["Yes, she did.", "Yes, she was.", "Yes, she done."],
        0,
        "Use did in a positive short answer."
      ),
      errorCorrectionItem(
        "a1-11b-ec-1",
        "Check the highlighted phrase.",
        "I didn't went out on Friday.",
        "didn't went",
        false,
        "didn't go",
        "Use the base verb go after didn't."
      ),
      errorCorrectionItem(
        "a1-11b-ec-2",
        "Check the highlighted phrase.",
        "Did Leo had lunch at home?",
        "Did Leo had",
        false,
        "Did Leo have",
        "Use the base verb have after did."
      ),
      errorCorrectionItem(
        "a1-11b-ec-3",
        "Check the highlighted phrase.",
        "We did the shopping after work.",
        "did the shopping",
        true,
        "",
        "Correct! Did is the irregular past form of do."
      ),
      wordOrderItem(
        "a1-11b-wo-1",
        "Put the words in the correct order.",
        ["morning", "Nina", "a", "had", "busy"],
        "Nina had a busy morning.",
        "Use had as the past form of have."
      ),
      wordOrderItem(
        "a1-11b-wo-2",
        "Put the words in the correct order.",
        ["weekend", "Where", "they", "go", "did", "the", "at"],
        "Where did they go at the weekend?",
        "Use question word + did + subject + base verb."
      ),
      {
        id: "a1-11b-day-1",
        type: "gap-fill",
        prompt: "Complete each gap with the correct past form. Use the base verb in brackets where shown.",
        parts: [
          "Yesterday I ",
          { gapId: "g1" },
          " up late. (get)\nI ",
          { gapId: "g2" },
          " breakfast because I was in a hurry. (not have)\nI ",
          { gapId: "g3" },
          " to work by taxi. (go)\nAt lunch, I ",
          { gapId: "g4" },
          " a sandwich. (have)\nAfter work, I ",
          { gapId: "g5" },
          " the shopping. (do)\n",
          { gapId: "g6" },
          " I ",
          { gapId: "g7" },
          " to bed early? (go) No, I ",
          { gapId: "g8" },
          ".",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["got"],
            feedback: "Use got, the past form of get."
          },
          {
            id: "g2",
            acceptedAnswers: ["didn't have", "did not have"],
            feedback: "The reason shows a negative, so use didn't have."
          },
          {
            id: "g3",
            acceptedAnswers: ["went"],
            feedback: "Use went, the past form of go."
          },
          {
            id: "g4",
            acceptedAnswers: ["had"],
            feedback: "Use had, the past form of have."
          },
          {
            id: "g5",
            acceptedAnswers: ["did"],
            feedback: "Use did, the past form of do."
          },
          {
            id: "g6",
            acceptedAnswers: ["Did"],
            feedback: "Begin the past-simple question with Did."
          },
          {
            id: "g7",
            acceptedAnswers: ["go"],
            feedback: "Use the base verb go after did."
          },
          {
            id: "g8",
            acceptedAnswers: ["didn't", "did not"],
            feedback: "Use didn't in the negative short answer."
          },
        ],
      },
    ],
  },
  {
    id: "a1-12a-past-simple-regular-irregular",
    title: "12A · Past Simple: Regular and Irregular Verbs",
    shortDescription: "Combine past be with regular and irregular past-simple forms.",
    levels: ["a1"],
    intro:
      "Review was and were, build regular and irregular past forms, and use did or didn't with the base verb.",
    items: [
      multipleChoiceItem(
        "a1-12a-mc-1",
        "Choose the correct past form.",
        "The roads ____ very quiet after the storm.",
        ["was", "were", "did"],
        1,
        "Use were with the plural subject the roads."
      ),
      multipleChoiceItem(
        "a1-12a-mc-2",
        "Choose the correct past form.",
        "close → ____",
        ["closd", "closeed", "closed"],
        2,
        "For a regular verb ending in e, add -d: close → closed."
      ),
      multipleChoiceItem(
        "a1-12a-mc-3",
        "Choose the correct past form.",
        "bring → ____",
        ["brought", "bringed", "brang"],
        0,
        "The irregular past form of bring is brought."
      ),
      multipleChoiceItem(
        "a1-12a-mc-4",
        "Choose the correct verb form.",
        "Tariq ____ his phone on the kitchen table this morning.",
        ["leaves", "left", "leaved"],
        1,
        "Use the irregular past form left."
      ),
      multipleChoiceItem(
        "a1-12a-mc-5",
        "Choose the correct verb form.",
        "We ____ a documentary last night.",
        ["see", "seed", "saw"],
        2,
        "Use the irregular past form saw."
      ),
      placeholderGapItem(
        "a1-12a-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "The café __________ at nine yesterday. (close)",
        "closed",
        [],
        "Add -d to the regular verb close."
      ),
      placeholderGapItem(
        "a1-12a-gf-2",
        "Complete the sentence with the past form of the verb in brackets.",
        "Nora __________ her umbrella on the train. (forget)",
        "forgot",
        [],
        "The irregular past form of forget is forgot."
      ),
      placeholderGapItem(
        "a1-12a-gf-3",
        "Complete the negative sentence with the verb in brackets.",
        "The parcel arrived this morning, so we __________ it yesterday. (not receive)",
        "didn't receive",
        ["did not receive"],
        "Use didn't + the base verb receive."
      ),
      placeholderGapItem(
        "a1-12a-gf-4",
        "Complete the negative sentence with the verb in brackets.",
        "I had no cash, so I __________ anything at the market. (not buy)",
        "didn't buy",
        ["did not buy"],
        "Use didn't + the base verb buy, not the past form bought."
      ),
      multipleChoiceItem(
        "a1-12a-mc-6",
        "Choose the correct verb form.",
        "Did Mila ____ the address in her notebook?",
        ["write", "wrote", "writes"],
        0,
        "Use the base verb write after did."
      ),
      multipleChoiceItem(
        "a1-12a-mc-7",
        "Choose the best short answer.",
        "Did the parcel arrive on Tuesday?",
        ["No, it wasn't.", "No, it didn't.", "No, it doesn't."],
        1,
        "Use didn't in a negative short answer to a did question."
      ),
      doubleGap(
        "a1-12a-gf-5",
        "Complete the question and short answer. Use the verb in brackets.",
        ["", { gapId: "g1" }, " Karim ", { gapId: "g2" }, " dessert? Yes, he did. (bring)"],
        ["Did"],
        ["bring"],
        "Use did before the subject and the base verb bring after it."
      ),
      errorCorrectionItem(
        "a1-12a-ec-1",
        "Check the highlighted phrase.",
        "We didn't found the correct platform.",
        "didn't found",
        false,
        "didn't find",
        "Use the base verb find after didn't."
      ),
      errorCorrectionItem(
        "a1-12a-ec-2",
        "Check the highlighted phrase.",
        "Did Ana called you yesterday?",
        "Did Ana called",
        false,
        "Did Ana call",
        "Use the base verb call after did."
      ),
      errorCorrectionItem(
        "a1-12a-ec-3",
        "Check the highlighted word.",
        "The meeting ended just before five.",
        "ended",
        true,
        "",
        "Correct! Ended is the regular past form of end."
      ),
      wordOrderItem(
        "a1-12a-wo-1",
        "Put the words in the correct order.",
        ["six", "They", "station", "left", "the", "at"],
        "They left the station at six.",
        "Use the irregular past form left after the subject."
      ),
      wordOrderItem(
        "a1-12a-wo-2",
        "Put the words in the correct order.",
        ["message", "open", "I", "yesterday", "didn't", "the"],
        "I didn't open the message yesterday.",
        "Use didn't + the base verb open."
      ),
      {
        id: "a1-12a-journey-1",
        type: "gap-fill",
        prompt: "Complete the story with the past form of each base verb in brackets.",
        parts: [
          "On Tuesday, Eva ",
          { gapId: "g1" },
          " home early. (leave)\nShe ",
          { gapId: "g2" },
          " to the station. (walk)\nOn the platform, she ",
          { gapId: "g3" },
          " an old friend. (see)\nThey ",
          { gapId: "g4" },
          " for a few minutes. (talk)\nEva ",
          { gapId: "g5" },
          " a coffee. (buy)\nThen her train ",
          { gapId: "g6" },
          ". (arrive)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["left"],
            feedback: "Use left, the irregular past form of leave."
          },
          {
            id: "g2",
            acceptedAnswers: ["walked"],
            feedback: "Add -ed to walk: walked."
          },
          {
            id: "g3",
            acceptedAnswers: ["saw"],
            feedback: "Use saw, the irregular past form of see."
          },
          {
            id: "g4",
            acceptedAnswers: ["talked"],
            feedback: "Add -ed to talk: talked."
          },
          {
            id: "g5",
            acceptedAnswers: ["bought"],
            feedback: "Use bought, the irregular past form of buy."
          },
          {
            id: "g6",
            acceptedAnswers: ["arrived"],
            feedback: "Add -d to arrive: arrived."
          },
        ],
      },
      {
        id: "a1-12a-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation. Use the base verb in brackets where shown.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you at the market yesterday? (be)\nB: Yes, I ",
          { gapId: "g2" },
          ".\nA: ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          " the jacket you wanted? (find)\nB: No, I ",
          { gapId: "g5" },
          ". But I ",
          { gapId: "g6" },
          " a scarf. (buy)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["Were"],
            feedback: "Begin the past be question about you with Were."
          },
          {
            id: "g2",
            acceptedAnswers: ["was"],
            feedback: "Use was in the positive short answer with I."
          },
          {
            id: "g3",
            acceptedAnswers: ["Did"],
            feedback: "Begin the past-simple question with Did."
          },
          {
            id: "g4",
            acceptedAnswers: ["find"],
            feedback: "Use the base verb find after did."
          },
          {
            id: "g5",
            acceptedAnswers: ["didn't", "did not"],
            feedback: "Use didn't in the negative short answer."
          },
          {
            id: "g6",
            acceptedAnswers: ["bought"],
            feedback: "Use bought, the irregular past form of buy."
          },
        ],
      },
    ],
  },
  {
    id: "a1-12b-past-simple-revision",
    title: "12B · Past Simple Revision",
    shortDescription: "Review past be and past-simple verbs in statements, negatives, and questions.",
    levels: ["a1"],
    intro:
      "Choose between was or were and did or didn't, then apply regular and irregular past forms in longer contexts.",
    items: [
      multipleChoiceItem(
        "a1-12b-mc-1",
        "Choose the correct question.",
        "You want to ask about someone's location last night.",
        ["Where were you last night?", "Where did you be last night?", "Where you were last night?"],
        0,
        "Use were before you in a past question with be."
      ),
      multipleChoiceItem(
        "a1-12b-mc-2",
        "Choose the correct question.",
        "You want to ask about Leo's evening meal.",
        ["What Leo cooked for dinner?", "What was Leo cook for dinner?", "What did Leo cook for dinner?"],
        2,
        "Use did + subject + base verb for a past-simple question with cook."
      ),
      multipleChoiceItem(
        "a1-12b-mc-3",
        "Choose the correct negative form.",
        "The museum ____ open when we arrived.",
        ["didn't be", "wasn't", "weren't"],
        1,
        "Use wasn't with the singular subject the museum."
      ),
      multipleChoiceItem(
        "a1-12b-mc-4",
        "Choose the correct negative form.",
        "They ____ the earlier train.",
        ["didn't take", "weren't take", "didn't took"],
        0,
        "Use didn't + the base verb take."
      ),
      multipleChoiceItem(
        "a1-12b-mc-5",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["We go to the lake last Sunday.", "We goed to the lake last Sunday.", "We went to the lake last Sunday."],
        2,
        "Went is the irregular past form of go."
      ),
      placeholderGapItem(
        "a1-12b-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "The weather __________ warm and sunny yesterday. (be)",
        "was",
        [],
        "Use was with the singular subject the weather."
      ),
      placeholderGapItem(
        "a1-12b-gf-2",
        "Complete the sentence with the past form of the verb in brackets.",
        "Our neighbours __________ us for dinner on Friday. (invite)",
        "invited",
        [],
        "Add -d to the regular verb invite."
      ),
      placeholderGapItem(
        "a1-12b-gf-3",
        "Complete the sentence with the past form of the verb in brackets.",
        "I __________ a cake for my brother's birthday. (make)",
        "made",
        [],
        "Made is the irregular past form of make."
      ),
      doubleGap(
        "a1-12b-gf-4",
        "Complete both sentences with the correct past form of be.",
        ["Maya ", { gapId: "g1" }, " at the rehearsal. (be) Her friends ", { gapId: "g2" }, " there because they stayed at home. (not be)"],
        ["was"],
        ["weren't", "were not"],
        "Use was with Maya and weren't with the plural subject her friends."
      ),
      doubleGap(
        "a1-12b-gf-5",
        "Complete the question. Use the verb in brackets.",
        ["Where ", { gapId: "g1" }, " Leo ", { gapId: "g2" }, " the tickets? (put)"],
        ["did"],
        ["put"],
        "Use did before Leo and the base verb put after the subject."
      ),
      multipleChoiceItem(
        "a1-12b-mc-6",
        "Choose the correct question.",
        "Which question is correct?",
        ["Did Nina send the email?", "Did Nina sent the email?", "Nina did send the email?"],
        0,
        "Use did + subject + base verb."
      ),
      multipleChoiceItem(
        "a1-12b-mc-7",
        "Choose the best short answer.",
        "Were the children tired after the walk?",
        ["Yes, they did.", "Yes, they were.", "Yes, they was."],
        1,
        "Use were in a positive short answer to a were question."
      ),
      errorCorrectionItem(
        "a1-12b-ec-1",
        "Check the highlighted question.",
        "Where did you went after lunch?",
        "did you went",
        false,
        "did you go",
        "Use the base verb go after did."
      ),
      errorCorrectionItem(
        "a1-12b-ec-2",
        "Check the highlighted phrase.",
        "Was your parents at the ceremony?",
        "Was your parents",
        false,
        "Were your parents",
        "Use were with the plural subject your parents."
      ),
      errorCorrectionItem(
        "a1-12b-ec-3",
        "Check the highlighted phrase.",
        "I didn't see your message until this morning.",
        "didn't see",
        true,
        "",
        "Correct! Use didn't + the base verb see."
      ),
      wordOrderItem(
        "a1-12b-wo-1",
        "Put the words in the correct order.",
        ["yesterday", "Why", "closed", "office", "the", "was"],
        "Why was the office closed yesterday?",
        "With be, use question word + was + subject."
      ),
      wordOrderItem(
        "a1-12b-wo-2",
        "Put the words in the correct order.",
        ["home", "What", "you", "time", "get", "did"],
        "What time did you get home?",
        "Use question phrase + did + subject + base verb."
      ),
      placeholderChoiceGapItem(
        "a1-12b-cg-1",
        "Choose was, were, did, or didn't for each gap.",
        "Where ____ you yesterday afternoon? What ____ you do there? I called, but you ____ answer.",
        ["were", "did", "didn't"],
        "Use were with you and be; use did or didn't with another main verb.",
        ["was", "were", "did", "didn't"]
      ),
      {
        id: "a1-12b-saturday-1",
        type: "gap-fill",
        prompt: "Complete the story. Use the base verb in brackets beside each gap.",
        parts: [
          "Last Saturday ",
          { gapId: "g1" },
          " very busy. (be)\nI ",
          { gapId: "g2" },
          " up at seven. (get)\nI ",
          { gapId: "g3" },
          " the kitchen before breakfast. (clean)\nThen my sister and I ",
          { gapId: "g4" },
          " to the market. (go)\nIt ",
          { gapId: "g5" },
          " to rain. (start)\nSo we ",
          { gapId: "g6" },
          " long. (not stay)\nIn the evening, some friends ",
          { gapId: "g7" },
          " to our house. (come)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["was"],
            feedback: "Use was with the singular subject last Saturday."
          },
          {
            id: "g2",
            acceptedAnswers: ["got"],
            feedback: "Use got, the irregular past form of get."
          },
          {
            id: "g3",
            acceptedAnswers: ["cleaned"],
            feedback: "Add -ed to clean: cleaned."
          },
          {
            id: "g4",
            acceptedAnswers: ["went"],
            feedback: "Use went, the irregular past form of go."
          },
          {
            id: "g5",
            acceptedAnswers: ["started"],
            feedback: "Add -ed to start: started."
          },
          {
            id: "g6",
            acceptedAnswers: ["didn't stay", "did not stay"],
            feedback: "The rain gives the reason for leaving, so use didn't stay."
          },
          {
            id: "g7",
            acceptedAnswers: ["came"],
            feedback: "Use came, the irregular past form of come."
          },
        ],
      },
      {
        id: "a1-12b-interview-1",
        type: "gap-fill",
        prompt: "Complete the conversation. Use the base verb in brackets where shown.",
        parts: [
          "A: Where ",
          { gapId: "g1" },
          " you last night? (be)\nB: I ",
          { gapId: "g2" },
          " at Priya's house. (be)\nA: ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          " a film? (watch)\nB: No, we ",
          { gapId: "g5" },
          ". We ",
          { gapId: "g6" },
          " cards. (play)\nA: What time ",
          { gapId: "g7" },
          " you ",
          { gapId: "g8" },
          "? (leave)\nB: At about eleven.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["were"],
            feedback: "Use were before you in a past be question."
          },
          {
            id: "g2",
            acceptedAnswers: ["was"],
            feedback: "Use was with I."
          },
          {
            id: "g3",
            acceptedAnswers: ["Did"],
            feedback: "Begin the past-simple question with Did."
          },
          {
            id: "g4",
            acceptedAnswers: ["watch"],
            feedback: "Use the base verb watch after did."
          },
          {
            id: "g5",
            acceptedAnswers: ["didn't", "did not"],
            feedback: "Use didn't in the negative short answer."
          },
          {
            id: "g6",
            acceptedAnswers: ["played"],
            feedback: "Add -ed to play: played."
          },
          {
            id: "g7",
            acceptedAnswers: ["did"],
            feedback: "Use did before you in the past-simple question."
          },
          {
            id: "g8",
            acceptedAnswers: ["leave"],
            feedback: "Use the base verb leave after did."
          },
        ],
      },
    ],
  },
  {
    id: "a2-1a-present-simple-be-positive-subject-pronouns",
    title: "1A · Present Simple Be: Positive Forms and Subject Pronouns",
    shortDescription: "Use am, is, and are with subject pronouns and positive contractions.",
    levels: ["a2"],
    intro:
      "Review positive forms of be, choose accurate subject pronouns, and use natural contractions in short descriptions.",
    items: [
      multipleChoiceItem(
        "a2-1a-mc-1",
        "Choose the correct form of be.",
        "I ____ responsible for the bookings today.",
        ["is", "am", "are"],
        1,
        "Use am with I."
      ),
      multipleChoiceItem(
        "a2-1a-mc-2",
        "Choose the correct form of be.",
        "The new trainers ____ in the cupboard.",
        ["is", "am", "are"],
        2,
        "Use are with the plural subject the new trainers."
      ),
      multipleChoiceItem(
        "a2-1a-mc-3",
        "Choose the correct subject pronoun.",
        "Mara and I work together. ____ are on the afternoon shift.",
        ["They", "We", "You"],
        1,
        "Mara and I means we."
      ),
      multipleChoiceItem(
        "a2-1a-mc-4",
        "Choose the correct subject pronoun.",
        "The coffee machine is new. ____ is beside the window.",
        ["He", "They", "It"],
        2,
        "Use it for one thing."
      ),
      multipleChoiceItem(
        "a2-1a-mc-5",
        "Choose the correct contraction.",
        "They are ready. → ____ ready.",
        ["They're", "Their", "They's"],
        0,
        "The contraction of they are is they're."
      ),
      placeholderGapItem(
        "a2-1a-gf-1",
        "Complete the sentence with the correct form of be.",
        "Jon __________ our new receptionist. (be)",
        "is",
        ["'s"],
        "Use is with Jon."
      ),
      placeholderGapItem(
        "a2-1a-gf-2",
        "Complete the sentence with the correct form of be.",
        "These keys __________ for room fourteen. (be)",
        "are",
        ["'re"],
        "Use are with the plural subject these keys."
      ),
      placeholderGapItem(
        "a2-1a-gf-3",
        "Rewrite the words as a contraction.",
        "We are early. → __________ early.",
        "We're",
        [],
        "The contraction of we are is we're."
      ),
      placeholderChoiceGapItem(
        "a2-1a-cg-1",
        "Choose the correct subject pronoun for each gap.",
        "Ms Lee is our manager. ____ is from Dublin. The office is upstairs. ____ is quite small. Ben and Omar are new. ____ are in my team.",
        ["She", "It", "They"],
        "Use she for Ms Lee, it for the office, and they for Ben and Omar.",
        ["he", "she", "it", "we", "they"]
      ),
      errorCorrectionItem(
        "a2-1a-ec-1",
        "Check the highlighted phrase.",
        "Is a useful app for travellers.",
        "Is",
        false,
        ["It is", "It's"],
        "English statements need a subject pronoun: It is or It's."
      ),
      errorCorrectionItem(
        "a2-1a-ec-2",
        "Check the highlighted phrase.",
        "My name is Amina and i live in Leeds.",
        "i live",
        false,
        "I live",
        "Always write the subject pronoun I with a capital letter."
      ),
      errorCorrectionItem(
        "a2-1a-ec-3",
        "Check the highlighted phrase.",
        "We're in the same evening class.",
        "We're",
        true,
        "",
        "Correct! We're is the contraction of we are."
      ),
      wordOrderItem(
        "a2-1a-wo-1",
        "Put the words in the correct order.",
        ["a", "is", "photographer", "She"],
        "She is a photographer.",
        "Use subject + be + noun phrase."
      ),
      wordOrderItem(
        "a2-1a-wo-2",
        "Put the words in the correct order.",
        ["from", "They're", "northern", "Italy"],
        "They're from northern Italy.",
        "They're already contains the subject they and the verb are."
      ),
      wordOrderItem(
        "a2-1a-wo-3",
        "Put the words in the correct order.",
        ["an", "It", "interesting", "is", "idea"],
        "It is an interesting idea.",
        "Use the subject pronoun it before is."
      ),
      multipleChoiceItem(
        "a2-1a-mc-6",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["Are very friendly.", "They are very friendly.", "They is very friendly."],
        1,
        "Use a subject pronoun and are with the plural pronoun they."
      ),
      {
        id: "a2-1a-introductions-1",
        type: "gap-fill",
        prompt: "Complete the introductions with subject pronouns and forms of be.",
        parts: [
          "This is Clara. ",
          { gapId: "g1" },
          " a designer. Her colleagues are Max and Jo. ",
          { gapId: "g2" },
          " from Bristol. Clara and Jo work on one project. ",
          { gapId: "g3" },
          " a small team. The project is a travel app. ",
          { gapId: "g4" },
          " very useful.",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["She is", "She's"],
            feedback: "Use she is or she's for Clara."
          },
          {
            id: "g2",
            acceptedAnswers: ["They are", "They're"],
            feedback: "Use they are or they're for Max and Jo."
          },
          {
            id: "g3",
            acceptedAnswers: ["They are", "They're"],
            feedback: "Use they for Clara and Jo."
          },
          {
            id: "g4",
            acceptedAnswers: ["It is", "It's"],
            feedback: "Use it is or it's for the project."
          },
        ],
      },
      {
        id: "a2-1a-profile-1",
        type: "gap-fill",
        prompt: "Complete the profile with the correct positive form of be.",
        parts: [
          "I ",
          { gapId: "g1" },
          " Elena, and this ",
          { gapId: "g2" },
          " my brother Luis. We ",
          { gapId: "g3" },
          " from Seville. Luis ",
          { gapId: "g4" },
          " a student, and I ",
          { gapId: "g5" },
          " a nurse. Our parents ",
          { gapId: "g6" },
          " teachers.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["am", "'m"], feedback: "Use am with I." },
          { id: "g2", acceptedAnswers: ["is", "'s"], feedback: "Use is with this." },
          { id: "g3", acceptedAnswers: ["are", "'re"], feedback: "Use are with we." },
          { id: "g4", acceptedAnswers: ["is", "'s"], feedback: "Use is with Luis." },
          { id: "g5", acceptedAnswers: ["am", "'m"], feedback: "Use am with I." },
          { id: "g6", acceptedAnswers: ["are", "'re"], feedback: "Use are with our parents." },
        ],
      },
    ],
  },
  {
    id: "a2-1b-present-simple-be-negative-questions",
    title: "1B · Present Simple Be: Negatives and Questions",
    shortDescription: "Use negative forms of be, make questions, and give accurate short answers.",
    levels: ["a2"],
    intro:
      "Practise negative contractions, question word order, and short answers without contracted positive forms.",
    items: [
      multipleChoiceItem(
        "a2-1b-mc-1",
        "Choose the correct negative form.",
        "I ____ available on Friday morning.",
        ["isn't", "am not", "aren't"],
        1,
        "Use am not with I."
      ),
      multipleChoiceItem(
        "a2-1b-mc-2",
        "Choose the correct negative form.",
        "The documents ____ in this folder.",
        ["isn't", "am not", "aren't"],
        2,
        "Use aren't with the plural subject the documents."
      ),
      multipleChoiceItem(
        "a2-1b-mc-3",
        "Choose the correct question form.",
        "____ the manager in her office?",
        ["Is", "Does", "Are"],
        0,
        "Put is before the singular subject the manager."
      ),
      multipleChoiceItem(
        "a2-1b-mc-4",
        "Choose the correct form of be.",
        "Where ____ your neighbours from?",
        ["is", "are", "do"],
        1,
        "Use are with the plural subject your neighbours."
      ),
      multipleChoiceItem(
        "a2-1b-mc-5",
        "Choose the best short answer.",
        "Is Rosa your team leader?",
        ["Yes, she's.", "Yes, she does.", "Yes, she is."],
        2,
        "Do not use a contraction in a positive short answer: Yes, she is."
      ),
      multipleChoiceItem(
        "a2-1b-mc-6",
        "Choose the best short answer.",
        "Are the meeting rooms free?",
        ["No, they aren't.", "No, it isn't.", "No, they don't."],
        0,
        "Use aren't in a negative short answer to an are question."
      ),
      placeholderGapItem(
        "a2-1b-gf-1",
        "Complete the negative sentence with the verb in brackets.",
        "The café __________ open this evening. (not be)",
        "isn't",
        ["is not", "'s not"],
        "Use isn't, is not, or 's not with the singular subject the café."
      ),
      placeholderGapItem(
        "a2-1b-gf-2",
        "Complete the question with the correct form of be.",
        "__________ this your umbrella? (be)",
        "Is",
        [],
        "Put is before this in the question."
      ),
      doubleGap(
        "a2-1b-gf-3",
        "Complete the question and short answer with forms of be.",
        ["", { gapId: "g1" }, " your cousins at the hotel? No, they ", { gapId: "g2" }, "."],
        ["Are"],
        ["aren't", "are not"],
        "Use Are with the plural subject and aren't in the negative short answer."
      ),
      placeholderChoiceGapItem(
        "a2-1b-cg-1",
        "Choose am, is, or are for each question.",
        "Why ____ I on the waiting list? Why ____ the door locked? ____ your friends outside?",
        ["am", "is", "are"],
        "Match the form of be to the subject in each question.",
        ["am", "is", "are"]
      ),
      errorCorrectionItem(
        "a2-1b-ec-1",
        "Check the highlighted question.",
        "Where your keys are?",
        "your keys are",
        false,
        "are your keys",
        "In a question with be, put are before the subject."
      ),
      errorCorrectionItem(
        "a2-1b-ec-2",
        "Check the highlighted short answer.",
        "A: Is Leo at reception? B: Yes, he's.",
        "Yes, he's",
        false,
        "Yes, he is",
        "Do not use a contraction in a positive short answer."
      ),
      errorCorrectionItem(
        "a2-1b-ec-3",
        "Check the highlighted phrase.",
        "We aren't in the same group this term.",
        "aren't",
        true,
        "",
        "Correct! Aren't is the contraction of are not."
      ),
      wordOrderItem(
        "a2-1b-wo-1",
        "Put the words in the correct order.",
        ["today", "Why", "quiet", "office", "the", "is"],
        "Why is the office quiet today?",
        "Use question word + be + subject + adjective."
      ),
      wordOrderItem(
        "a2-1b-wo-2",
        "Put the words in the correct order.",
        ["not", "ready", "We", "yet", "are"],
        "We are not ready yet.",
        "Put not after the verb be."
      ),
      multipleChoiceItem(
        "a2-1b-mc-7",
        "Choose the correct question.",
        "Which question is correct?",
        ["Are your sister at university?", "Is your sister at university?", "Your sister is at university?"],
        1,
        "Use is before the singular subject your sister."
      ),
      {
        id: "a2-1b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with forms of be.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you new here?\nB: Yes, I ",
          { gapId: "g2" },
          ".\nA: Where ",
          { gapId: "g3" },
          " you from?\nB: I'm from Cardiff.\nA: ",
          { gapId: "g4" },
          " your colleagues from Cardiff too?\nB: No, they ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Are"], feedback: "Begin the question with Are." },
          { id: "g2", acceptedAnswers: ["am"], feedback: "Use am in the positive short answer." },
          { id: "g3", acceptedAnswers: ["are"], feedback: "Put are before you after where." },
          { id: "g4", acceptedAnswers: ["Are"], feedback: "Use Are with the plural subject your colleagues." },
          { id: "g5", acceptedAnswers: ["aren't", "are not"], feedback: "Use aren't in the negative short answer." },
        ],
      },
      {
        id: "a2-1b-check-in-1",
        type: "gap-fill",
        prompt: "Complete the hotel check-in with forms of be.",
        parts: [
          "A: Good evening. ",
          { gapId: "g1" },
          " you Mr and Mrs Khan?\nB: Yes, we ",
          { gapId: "g2" },
          ".\nA: Your room ",
          { gapId: "g3" },
          " ready yet. It ",
          { gapId: "g4" },
          " still dirty.\nB: ",
          { gapId: "g5" },
          " the café open?\nA: No, it ",
          { gapId: "g6" },
          ", but the lounge is open.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Are"], feedback: "Begin the question with Are." },
          { id: "g2", acceptedAnswers: ["are"], feedback: "Use are in the positive short answer." },
          { id: "g3", acceptedAnswers: ["isn't", "is not"], feedback: "Use the negative form with room." },
          { id: "g4", acceptedAnswers: ["is", "'s"], feedback: "Use is with it." },
          { id: "g5", acceptedAnswers: ["Is"], feedback: "Begin the question about the café with Is." },
          { id: "g6", acceptedAnswers: ["isn't", "is not"], feedback: "Use isn't in the negative short answer." },
        ],
      },
    ],
  },
  {
    id: "a2-1c-possessive-adjectives",
    title: "1C · Possessive Adjectives",
    shortDescription: "Use my, your, his, her, its, our, and their accurately.",
    levels: ["a2"],
    intro:
      "Match possessive adjectives to their owners and distinguish the possessive its from the contraction it's.",
    items: [
      multipleChoiceItem(
        "a2-1c-mc-1",
        "Choose the correct possessive adjective.",
        "I work from home. ____ desk is in the spare room.",
        ["His", "My", "Our"],
        1,
        "Use my for something that belongs to the speaker."
      ),
      multipleChoiceItem(
        "a2-1c-mc-2",
        "Choose the correct possessive adjective.",
        "You have a visitor. Is this ____ coat?",
        ["my", "his", "your"],
        2,
        "Use your for something that belongs to you."
      ),
      multipleChoiceItem(
        "a2-1c-mc-3",
        "Choose the correct possessive adjective.",
        "Daniel is a chef. ____ restaurant is near the river.",
        ["His", "Her", "Their"],
        0,
        "Use his for something connected to a man."
      ),
      multipleChoiceItem(
        "a2-1c-mc-4",
        "Choose the correct possessive adjective.",
        "Priya has a new flat. ____ kitchen is very bright.",
        ["His", "Their", "Her"],
        2,
        "Use her for something connected to a woman."
      ),
      multipleChoiceItem(
        "a2-1c-mc-5",
        "Choose the correct word.",
        "The company changes ____ website every year.",
        ["it's", "its", "their"],
        1,
        "Use its for possession. It's means it is."
      ),
      multipleChoiceItem(
        "a2-1c-mc-6",
        "Choose the correct possessive adjective.",
        "We share an office. ____ desks are beside the window.",
        ["Our", "Their", "Your"],
        0,
        "Use our for something that belongs to us."
      ),
      placeholderGapItem(
        "a2-1c-gf-1",
        "Complete the sentence with one possessive adjective.",
        "The students have new laptops. __________ laptops are very light.",
        "Their",
        [],
        "Use their for something that belongs to the students."
      ),
      placeholderGapItem(
        "a2-1c-gf-2",
        "Complete the second sentence with a possessive adjective.",
        "I have a meeting at ten. __________ meeting is online.",
        "My",
        [],
        "Use my because the meeting belongs to the speaker."
      ),
      placeholderChoiceGapItem(
        "a2-1c-cg-1",
        "Choose the correct possessive adjective for each gap.",
        "Leo calls ____ parents every Sunday. Nadia visits ____ grandmother on Fridays. We see ____ cousins in the summer.",
        ["his", "her", "our"],
        "Match each possessive adjective to its owner.",
        ["my", "your", "his", "her", "its", "our", "their"]
      ),
      errorCorrectionItem(
        "a2-1c-ec-1",
        "Check the highlighted word.",
        "This is Omar, and her office is downstairs.",
        "her",
        false,
        "his",
        "Use his because the office belongs to Omar."
      ),
      errorCorrectionItem(
        "a2-1c-ec-2",
        "Check the highlighted word.",
        "The museum is famous for it's garden.",
        "it's",
        false,
        "its",
        "Use the possessive adjective its. It's means it is."
      ),
      errorCorrectionItem(
        "a2-1c-ec-3",
        "Check the highlighted phrase.",
        "Our neighbours are very friendly.",
        "Our neighbours",
        true,
        "",
        "Correct! Our shows that the neighbours are connected to us."
      ),
      wordOrderItem(
        "a2-1c-wo-1",
        "Put the words in the correct order.",
        ["new", "Their", "is", "near", "house", "school", "the"],
        "Their new house is near the school.",
        "Put the possessive adjective before the adjective and noun."
      ),
      multipleChoiceItem(
        "a2-1c-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["Its a modern building.", "It's windows are large.", "Its windows are large."],
        2,
        "Its is possessive; it's means it is."
      ),
      placeholderChoiceGapItem(
        "a2-1c-cg-2",
        "Choose its or it's for each gap.",
        "The hotel is old, but ____ very comfortable. ____ rooms are large, and ____ restaurant is excellent.",
        ["it's", "its", "its"],
        "Use it's for it is and its for possession.",
        ["its", "it's"]
      ),
      {
        id: "a2-1c-family-1",
        type: "gap-fill",
        prompt: "Complete the family description with possessive adjectives.",
        parts: [
          "Marta and Luis live near us. ",
          { gapId: "g1" },
          " daughter is in my class. Marta is a doctor, and ",
          { gapId: "g2" },
          " hospital is in the city centre. Luis works from home. ",
          { gapId: "g3" },
          " office is in the garden. We often visit them with ",
          { gapId: "g4" },
          " children.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Their"], feedback: "Use their for Marta and Luis." },
          { id: "g2", acceptedAnswers: ["her"], feedback: "Use her for Marta." },
          { id: "g3", acceptedAnswers: ["His"], feedback: "Use his for Luis." },
          { id: "g4", acceptedAnswers: ["our"], feedback: "Use our for the speaker's children." },
        ],
      },
      {
        id: "a2-1c-workplace-1",
        type: "gap-fill",
        prompt: "Complete the workplace description with possessive adjectives.",
        parts: [
          "I work for North Star Travel. ",
          { gapId: "g1" },
          " office is near the station. My manager is Chloe. ",
          { gapId: "g2" },
          " desk is opposite mine. We have two new colleagues. ",
          { gapId: "g3" },
          " names are Tariq and Mei. Chloe says ",
          { gapId: "g4" },
          " team is complete now.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Its"], feedback: "Use its for the company's office." },
          { id: "g2", acceptedAnswers: ["Her"], feedback: "Use her for Chloe." },
          { id: "g3", acceptedAnswers: ["Their"], feedback: "Use their for the two colleagues." },
          { id: "g4", acceptedAnswers: ["our"], feedback: "Use our because Chloe is part of the team." },
        ],
      },
      wordOrderItem(
        "a2-1c-wo-2",
        "Put the words in the correct order.",
        ["number", "What", "your", "phone", "is"],
        "What is your phone number?",
        "Put the possessive adjective immediately before the noun phrase phone number."
      ),
    ],
  },
  {
    id: "a2-2a-singular-plural-nouns",
    title: "2A · Singular and Plural Nouns",
    shortDescription: "Use a, an, and the and form regular and irregular plurals.",
    levels: ["a2"],
    intro:
      "Review articles with singular nouns, build regular plurals, and use common irregular plural forms accurately.",
    items: [
      multipleChoiceItem(
        "a2-2a-mc-1",
        "Choose the correct article.",
        "There is ____ umbrella beside the door.",
        ["a", "an", "the"],
        1,
        "Use an before a word beginning with a vowel sound."
      ),
      multipleChoiceItem(
        "a2-2a-mc-2",
        "Choose the correct article.",
        "Mila is ____ university student.",
        ["an", "the", "a"],
        2,
        "University begins with a /j/ consonant sound, so use a."
      ),
      multipleChoiceItem(
        "a2-2a-mc-3",
        "Choose a, an, or no article.",
        "Those are ____ headphones for the language lab.",
        ["—", "a", "an"],
        0,
        "Do not use a or an before a plural noun."
      ),
      multipleChoiceItem(
        "a2-2a-mc-4",
        "Choose the correct plural.",
        "one box → three ____",
        ["boxs", "boxes", "boxies"],
        1,
        "Add -es to a noun ending in -x."
      ),
      multipleChoiceItem(
        "a2-2a-mc-5",
        "Choose the correct plural.",
        "one city → two ____",
        ["citys", "cityes", "cities"],
        2,
        "Change consonant + y to -ies."
      ),
      multipleChoiceItem(
        "a2-2a-mc-6",
        "Choose the correct irregular plural.",
        "one child → four ____",
        ["children", "childs", "childrens"],
        0,
        "The irregular plural of child is children."
      ),
      multipleChoiceItem(
        "a2-2a-mc-7",
        "Choose the correct irregular plural.",
        "one person → many ____",
        ["persons", "people", "peoples"],
        1,
        "The usual plural of person is people."
      ),
      placeholderGapItem(
        "a2-2a-gf-1",
        "Write the plural form of the noun in brackets.",
        "There are two __________ on the reception desk. (watch)",
        "watches",
        [],
        "Add -es to a noun ending in -ch."
      ),
      placeholderGapItem(
        "a2-2a-gf-2",
        "Write the plural form of the noun in brackets.",
        "Please show your __________ at the entrance. (identity card)",
        "identity cards",
        [],
        "In a two-word noun, make the second noun plural."
      ),
      placeholderChoiceGapItem(
        "a2-2a-cg-1",
        "Choose a, an, the, or no article for each gap.",
        "I have ____ new passport and ____ old identity card. ____ passport is in my bag, with ____ tickets for tomorrow.",
        ["a", "an", "the", "—"],
        "Use a or an for a new singular item, the for the specific passport already mentioned, and no article before the plural noun tickets.",
        ["a", "an", "the", "—"]
      ),
      errorCorrectionItem(
        "a2-2a-ec-1",
        "Check the highlighted article.",
        "Leo wears an uniform at work.",
        "an",
        false,
        "a",
        "Uniform begins with a /j/ consonant sound, so use a."
      ),
      errorCorrectionItem(
        "a2-2a-ec-2",
        "Check the highlighted noun.",
        "Two womans are waiting outside.",
        "womans",
        false,
        "women",
        "The irregular plural of woman is women."
      ),
      errorCorrectionItem(
        "a2-2a-ec-3",
        "Check the highlighted noun.",
        "Several people work in this building at night.",
        "people",
        true,
        "",
        "Correct! People is the usual plural of person."
      ),
      wordOrderItem(
        "a2-2a-wo-1",
        "Put the words in the correct order.",
        ["old", "They're", "very", "dictionaries"],
        "They're very old dictionaries.",
        "Use no article before the plural noun and put the adjective before it."
      ),
      multipleChoiceItem(
        "a2-2a-mc-8",
        "Choose the correct article.",
        "Please close ____ window next to you.",
        ["a", "an", "the"],
        2,
        "Use the when both people know which specific window is meant."
      ),
      placeholderGapItem(
        "a2-2a-gf-3",
        "Write the plural form of the noun in brackets.",
        "Three __________ are carrying the tables. (man)",
        "men",
        [],
        "The irregular plural of man is men."
      ),
      {
        id: "a2-2a-bag-1",
        type: "gap-fill",
        prompt: "Complete the description with articles or plural nouns.",
        parts: [
          "In my bag, there is ",
          { gapId: "g1" },
          " charger and ",
          { gapId: "g2" },
          " address book. There are two ",
          { gapId: "g3" },
          " (key), three ",
          { gapId: "g4" },
          " (battery), and some ",
          { gapId: "g5" },
          " (photo).",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["a"], feedback: "Use a before charger." },
          { id: "g2", acceptedAnswers: ["an"], feedback: "Use an before address book." },
          { id: "g3", acceptedAnswers: ["keys"], feedback: "Add -s to key." },
          { id: "g4", acceptedAnswers: ["batteries"], feedback: "Change consonant + y to -ies." },
          { id: "g5", acceptedAnswers: ["photos"], feedback: "Add -s to photo." },
        ],
      },
      {
        id: "a2-2a-office-1",
        type: "gap-fill",
        prompt: "Complete the office description with the correct noun forms.",
        parts: [
          "There are five ",
          { gapId: "g1" },
          " in our team. (person) Two are ",
          { gapId: "g2" },
          ". (man) Three are ",
          { gapId: "g3" },
          ". (woman) We use six ",
          { gapId: "g4" },
          ". (computer) We keep important papers in two ",
          { gapId: "g5" },
          ". (box)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["people"], feedback: "Use people as the plural of person." },
          { id: "g2", acceptedAnswers: ["men"], feedback: "Use men as the plural of man." },
          { id: "g3", acceptedAnswers: ["women"], feedback: "Use women as the plural of woman." },
          { id: "g4", acceptedAnswers: ["computers"], feedback: "Add -s to computer." },
          { id: "g5", acceptedAnswers: ["boxes"], feedback: "Add -es to box." },
        ],
      },
    ],
  },
  {
    id: "a2-2b-adjectives",
    title: "2B · Adjectives",
    shortDescription: "Place adjectives correctly and use a, an, very, really, and quite.",
    levels: ["a2"],
    intro:
      "Use adjectives before nouns or after be, keep their form unchanged, and choose natural degree words.",
    items: [
      multipleChoiceItem(
        "a2-2b-mc-1",
        "Choose the correct noun phrase.",
        "They live in ____.",
        ["a house modern", "a modern house", "a moderns house"],
        1,
        "Put the adjective before the noun."
      ),
      multipleChoiceItem(
        "a2-2b-mc-2",
        "Choose the correct adjective form.",
        "The waiting area is ____.",
        ["comfort", "comfortably", "comfortable"],
        2,
        "Use an adjective after be."
      ),
      multipleChoiceItem(
        "a2-2b-mc-3",
        "Choose the correct form.",
        "Those bags are ____.",
        ["heavy", "heavies", "heavys"],
        0,
        "Adjectives do not change before plural nouns or after be."
      ),
      multipleChoiceItem(
        "a2-2b-mc-4",
        "Choose the correct article.",
        "It's ____ old building near the harbour.",
        ["a", "an", "—"],
        1,
        "Use an before the vowel sound in old."
      ),
      multipleChoiceItem(
        "a2-2b-mc-5",
        "Choose the word that means fairly, but not very.",
        "The walk is ____ difficult.",
        ["really", "very", "quite"],
        2,
        "Quite can mean fairly or moderately."
      ),
      multipleChoiceItem(
        "a2-2b-mc-6",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["The city centre is really busy.", "The city centre really is busy very.", "The city centre is busily."],
        0,
        "Use be + degree word + adjective."
      ),
      singleGap(
        "a2-2b-rf-1",
        "Rewrite the description as one noun phrase.",
        ["It's ", { gapId: "g1" }, "."],
        ["a modern hotel"],
        "Put the adjective before the noun and use a with the singular noun.",
        { originalSentence: "The hotel is modern." }
      ),
      singleGap(
        "a2-2b-rf-2",
        "Rewrite the description as one noun phrase.",
        ["They're ", { gapId: "g1" }, "."],
        ["comfortable chairs"],
        "Put the adjective before the plural noun and do not add -s to the adjective.",
        { originalSentence: "The chairs are comfortable." }
      ),
      errorCorrectionItem(
        "a2-2b-ec-1",
        "Check the highlighted phrase.",
        "They have a car expensive.",
        "a car expensive",
        false,
        "an expensive car",
        "Put the adjective before the noun and use an before expensive."
      ),
      errorCorrectionItem(
        "a2-2b-ec-2",
        "Check the highlighted phrase.",
        "The reds buses stop outside the station.",
        "reds buses",
        false,
        "red buses",
        "Adjectives do not take a plural -s."
      ),
      errorCorrectionItem(
        "a2-2b-ec-3",
        "Check the highlighted phrase.",
        "It's an beautiful square.",
        "an beautiful square",
        false,
        "a beautiful square",
        "Use a before the consonant sound in beautiful."
      ),
      errorCorrectionItem(
        "a2-2b-ec-4",
        "Check the highlighted phrase.",
        "The bedrooms are quite small.",
        "quite small",
        true,
        "",
        "Correct! Put quite before the adjective."
      ),
      wordOrderItem(
        "a2-2b-wo-1",
        "Put the words in the correct order.",
        ["a", "has", "garden", "large", "The", "house"],
        "The house has a large garden.",
        "Put the adjective large before the noun garden."
      ),
      wordOrderItem(
        "a2-2b-wo-2",
        "Put the words in the correct order.",
        ["really", "view", "is", "The", "beautiful"],
        "The view is really beautiful.",
        "Use subject + be + degree word + adjective."
      ),
      multipleChoiceItem(
        "a2-2b-mc-7",
        "Choose the correct form.",
        "The two new assistants are very ____.",
        ["friendlies", "friendly", "friendlys"],
        1,
        "The adjective friendly does not change with a plural subject."
      ),
      placeholderChoiceGapItem(
        "a2-2b-cg-1",
        "Choose a or an for each adjective + noun phrase.",
        "It's ____ unusual name. We stayed in ____ comfortable room near ____ busy market.",
        ["an", "a", "a"],
        "Choose the article from the sound at the beginning of the following adjective.",
        ["a", "an"]
      ),
      {
        id: "a2-2b-rewrite-1",
        type: "gap-fill",
        prompt: "Rewrite each description as a noun phrase.",
        parts: [
          "1. The office is bright. → It's ",
          { gapId: "g1" },
          ".\n2. The rooms are small. → They're ",
          { gapId: "g2" },
          ".\n3. The sofas are comfortable. → They're ",
          { gapId: "g3" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["a bright office"], feedback: "Use a + adjective + singular noun." },
          { id: "g2", acceptedAnswers: ["small rooms"], feedback: "Use adjective + plural noun." },
          { id: "g3", acceptedAnswers: ["comfortable sofas"], feedback: "Keep the adjective unchanged before the plural noun." },
        ],
      },
      {
        id: "a2-2b-description-1",
        type: "gap-fill",
        prompt: "Arrange the words in brackets to complete the description.",
        parts: [
          "Riverside is ",
          { gapId: "g1" },
          ". (modern / hotel) It has ",
          { gapId: "g2" },
          ". (very small / garden) The rooms are ",
          { gapId: "g3" },
          ". (really comfortable) The staff are ",
          { gapId: "g4" },
          ". (very friendly)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["a modern hotel"], feedback: "Use a + adjective + noun." },
          { id: "g2", acceptedAnswers: ["a very small garden"], feedback: "Put very before the adjective and the adjective before the noun." },
          { id: "g3", acceptedAnswers: ["really comfortable"], feedback: "Use really before the adjective comfortable." },
          { id: "g4", acceptedAnswers: ["very friendly"], feedback: "Use very before the adjective friendly." },
        ],
      },
    ],
  },
  {
    id: "a2-2c-imperatives-lets",
    title: "2C · Imperatives and Let's",
    shortDescription: "Give instructions, make negative commands, and suggest actions with let's.",
    levels: ["a2"],
    intro:
      "Use the base verb in imperatives, don't for negative instructions, and let's or let's not for suggestions.",
    items: [
      multipleChoiceItem(
        "a2-2c-mc-1",
        "Choose the correct instruction.",
        "____ the file before you close the program.",
        ["You save", "Save", "Saving"],
        1,
        "Begin a positive imperative with the base verb."
      ),
      multipleChoiceItem(
        "a2-2c-mc-2",
        "Choose the correct negative instruction.",
        "____ this door. It's an emergency exit.",
        ["Not lock", "Doesn't lock", "Don't lock"],
        2,
        "Use don't + base verb for a negative imperative."
      ),
      multipleChoiceItem(
        "a2-2c-mc-3",
        "Choose the correct instruction.",
        "____ careful on the wet floor.",
        ["Be", "Are", "You be"],
        0,
        "Use be + adjective in an imperative."
      ),
      multipleChoiceItem(
        "a2-2c-mc-4",
        "Choose the correct suggestion.",
        "The weather is good. ____ lunch outside.",
        ["We have", "Let's have", "Let's having"],
        1,
        "Use let's + base verb for a suggestion."
      ),
      multipleChoiceItem(
        "a2-2c-mc-5",
        "Choose the correct negative suggestion.",
        "The roads are busy. ____ into the city centre.",
        ["Let's don't drive", "Don't let's drive", "Let's not drive"],
        2,
        "Use let's not + base verb for a negative suggestion."
      ),
      multipleChoiceItem(
        "a2-2c-mc-6",
        "Choose the polite alternative to an imperative.",
        "Open the window, please.",
        ["Can you open the window, please?", "Do you open the window, please?", "Are you opening the window, please?"],
        0,
        "Can you + base verb is a polite way to make a request."
      ),
      placeholderGapItem(
        "a2-2c-gf-1",
        "Complete the negative instruction with the verb in brackets.",
        "__________ the screen with wet hands. (not touch)",
        "Don't touch",
        ["Do not touch"],
        "Use don't + the base verb touch."
      ),
      placeholderGapItem(
        "a2-2c-gf-2",
        "Complete the suggestion with the verb in brackets.",
        "__________ the earlier train tomorrow. (take)",
        "Let's take",
        [],
        "Use let's + the base verb take."
      ),
      doubleGap(
        "a2-2c-gf-3",
        "Complete the two instructions with the verbs in brackets.",
        ["", { gapId: "g1" }, " quiet, please. (be) ", { gapId: "g2" }, " your phone during the talk. (not use)"],
        ["Be"],
        ["Don't use", "Do not use"],
        "Use be + adjective and don't + base verb."
      ),
      errorCorrectionItem(
        "a2-2c-ec-1",
        "Check the highlighted instruction.",
        "You open the book at page twelve.",
        "You open",
        false,
        "Open",
        "Do not use a subject pronoun in a standard imperative."
      ),
      errorCorrectionItem(
        "a2-2c-ec-2",
        "Check the highlighted phrase.",
        "Don't talking during the presentation.",
        "Don't talking",
        false,
        "Don't talk",
        "Use the base verb after don't."
      ),
      errorCorrectionItem(
        "a2-2c-ec-3",
        "Check the highlighted phrase.",
        "Let's to meet outside the station.",
        "Let's to meet",
        false,
        "Let's meet",
        "Use the base verb without to after let's."
      ),
      errorCorrectionItem(
        "a2-2c-ec-4",
        "Check the highlighted instruction.",
        "Please sit down near the front.",
        "Please sit down",
        true,
        "",
        "Correct! Please can come before a positive imperative."
      ),
      wordOrderItem(
        "a2-2c-wo-1",
        "Put the words in the correct order.",
        ["lights", "Turn", "the", "at", "left"],
        "Turn left at the lights.",
        "Begin the instruction with the base verb turn."
      ),
      wordOrderItem(
        "a2-2c-wo-2",
        "Put the words in the correct order.",
        ["your", "here", "Don't", "bags", "leave"],
        "Don't leave your bags here.",
        "Use don't + base verb + object."
      ),
      wordOrderItem(
        "a2-2c-wo-3",
        "Put the words in the correct order.",
        ["after", "Let's", "lunch", "walk", "a", "have"],
        "Let's have a walk after lunch.",
        "Use let's + base verb to make a suggestion."
      ),
      {
        id: "a2-2c-instructions-1",
        type: "gap-fill",
        prompt: "Complete each instruction with the base verb in brackets.",
        parts: [
          "1. Please ",
          { gapId: "g1" },
          " the door quietly. (close)\n2. ",
          { gapId: "g2" },
          " your bags in this area. (not put)\n3. ",
          { gapId: "g3" },
          " careful on the stairs. (be)\n4. ",
          { gapId: "g4" },
          " here until your name is called. (wait)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["close"], feedback: "Use the base verb close after please." },
          { id: "g2", acceptedAnswers: ["Don't put", "Do not put"], feedback: "Use don't + the base verb put." },
          { id: "g3", acceptedAnswers: ["Be"], feedback: "Use be before the adjective careful." },
          { id: "g4", acceptedAnswers: ["Wait"], feedback: "Begin the instruction with wait." },
        ],
      },
      {
        id: "a2-2c-suggestions-1",
        type: "gap-fill",
        prompt: "Complete the conversation. Use the base verb in brackets where shown.",
        parts: [
          "A: It's sunny. ",
          { gapId: "g1" },
          " ",
          { gapId: "g2" },
          " to the lake. (walk)\nB: Good idea. ",
          { gapId: "g3" },
          " ",
          { gapId: "g4" },
          " the car. (not take)\nA: ",
          { gapId: "g5" },
          " you ",
          { gapId: "g6" },
          " some water? (bring)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Let's"], feedback: "Begin the positive suggestion with Let's." },
          { id: "g2", acceptedAnswers: ["walk"], feedback: "Use the base verb walk after let's." },
          { id: "g3", acceptedAnswers: ["Let's"], feedback: "Begin the negative suggestion with Let's." },
          { id: "g4", acceptedAnswers: ["not take"], feedback: "Use not + base verb after let's." },
          { id: "g5", acceptedAnswers: ["Can"], feedback: "Begin the polite request with Can." },
          { id: "g6", acceptedAnswers: ["bring"], feedback: "Use the base verb bring after can." },
        ],
      },
    ],
  },
  {
    id: "a2-3a-present-simple-positive-negative",
    title: "3A · Present Simple: Positive and Negative Forms",
    shortDescription: "Use present-simple positive and negative forms with accurate third-person spelling.",
    levels: ["a2"],
    intro:
      "Use the base verb with I, you, we, and they; add the correct third-person ending with he, she, and it; and form negatives with don't or doesn't.",
    items: [
      multipleChoiceItem(
        "a2-3a-mc-1",
        "Choose the correct verb form.",
        "The first train ____ at half past six.",
        ["leave", "leaves", "leavs"],
        1,
        "Use leaves with the third-person singular subject the first train."
      ),
      multipleChoiceItem(
        "a2-3a-mc-2",
        "Choose the correct negative form.",
        "Rina ____ on Mondays.",
        ["not works", "don't work", "doesn't work"],
        2,
        "Use doesn't + the base verb with Rina."
      ),
      multipleChoiceItem(
        "a2-3a-mc-3",
        "Choose the correct spelling.",
        "My neighbour ____ heavy boxes for a delivery company.",
        ["carries", "carrys", "carryes"],
        0,
        "Change consonant + y to -ies: carry becomes carries."
      ),
      multipleChoiceItem(
        "a2-3a-mc-4",
        "Choose the correct verb form.",
        "This apartment ____ two balconies.",
        ["have", "has", "haves"],
        1,
        "The third-person singular form of have is has."
      ),
      multipleChoiceItem(
        "a2-3a-mc-5",
        "Choose the correct verb form.",
        "Our receptionist ____ home at five.",
        ["go", "gos", "goes"],
        2,
        "Add -es to go with a third-person singular subject."
      ),
      multipleChoiceItem(
        "a2-3a-mc-6",
        "Choose the correct negative form.",
        "The shops near us ____ late on Sundays.",
        ["don't close", "doesn't close", "not close"],
        0,
        "Use don't + the base verb with the plural subject shops."
      ),
      placeholderGapItem(
        "a2-3a-gf-1",
        "Complete the sentence with the verb in brackets.",
        "The workshop __________ at four o'clock. (finish)",
        "finishes",
        [],
        "Add -es to finish with the singular subject workshop."
      ),
      placeholderGapItem(
        "a2-3a-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "Lena __________ crowded places. (not enjoy)",
        "doesn't enjoy",
        ["does not enjoy"],
        "Use doesn't + the base verb enjoy."
      ),
      placeholderChoiceGapItem(
        "a2-3a-cg-1",
        "Choose the correct verb form for each gap.",
        "I ____ near the market. My brother ____ across town, but we ____ in the same office.",
        ["live", "lives", "work"],
        "Match the verb form to the subject.",
        ["live", "lives", "work", "works"]
      ),
      errorCorrectionItem(
        "a2-3a-ec-1",
        "Check the highlighted verb.",
        "The hotel kitchen close at eleven.",
        "close",
        false,
        "closes",
        "Add -s because the subject the hotel kitchen is singular."
      ),
      errorCorrectionItem(
        "a2-3a-ec-2",
        "Check the highlighted phrase.",
        "My cousin doesn't drives to work.",
        "doesn't drives",
        false,
        "doesn't drive",
        "After doesn't, use the base form drive."
      ),
      errorCorrectionItem(
        "a2-3a-ec-3",
        "Check the highlighted phrase.",
        "We don't need a reservation for lunch.",
        "don't need",
        true,
        "",
        "Correct! Use don't + the base verb with we."
      ),
      wordOrderItem(
        "a2-3a-wo-1",
        "Put the words in the correct order.",
        ["repairs", "My", "bicycles", "uncle"],
        "My uncle repairs bicycles.",
        "Use the third-person form repairs after my uncle."
      ),
      wordOrderItem(
        "a2-3a-wo-2",
        "Put the words in the correct order.",
        ["eat", "They", "meat", "don't"],
        "They don't eat meat.",
        "Put don't before the base verb eat."
      ),
      multipleChoiceItem(
        "a2-3a-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["He don't wear glasses.", "He doesn't wear glasses.", "He doesn't wears glasses."],
        1,
        "Use doesn't + the base verb wear."
      ),
      {
        id: "a2-3a-routine-1",
        type: "gap-fill",
        prompt: "Complete the routine with the verbs in brackets.",
        parts: [
          "Noah ",
          { gapId: "g1" },
          " the bakery at 6:00. (open) He ",
          { gapId: "g2" },
          " breakfast there. (not have) His assistants ",
          { gapId: "g3" },
          " at 7:00. (arrive) The first customers ",
          { gapId: "g4" },
          " in soon after that. (come)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["opens"], feedback: "Use opens with Noah." },
          { id: "g2", acceptedAnswers: ["doesn't have", "does not have"], feedback: "Use doesn't + have with he." },
          { id: "g3", acceptedAnswers: ["arrive"], feedback: "Use the base form with the plural subject assistants." },
          { id: "g4", acceptedAnswers: ["come"], feedback: "Use the base form with the plural subject customers." },
        ],
      },
      {
        id: "a2-3a-household-1",
        type: "gap-fill",
        prompt: "Complete the description with the verbs in brackets.",
        parts: [
          "Eva and Kim ",
          { gapId: "g1" },
          " a small flat. (share) Eva ",
          { gapId: "g2" },
          " dinner most evenings. (cook) She ",
          { gapId: "g3" },
          " the dishes. (not wash) Kim ",
          { gapId: "g4" },
          " that job. (do) They both ",
          { gapId: "g5" },
          " the kitchen tidy. (keep)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["share"], feedback: "Use share with Eva and Kim." },
          { id: "g2", acceptedAnswers: ["cooks"], feedback: "Add -s to cook with Eva." },
          { id: "g3", acceptedAnswers: ["doesn't wash", "does not wash"], feedback: "Use doesn't + wash with she." },
          { id: "g4", acceptedAnswers: ["does"], feedback: "The third-person form of do is does." },
          { id: "g5", acceptedAnswers: ["keep"], feedback: "Use keep with the plural subject they." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-3a-cg-2",
        "Choose the correct positive or negative form for each gap.",
        "The library ____ at nine. It ____ on public holidays. Students ____ their ID cards at all times.",
        ["opens", "doesn't open", "carry"],
        "Check the subject and whether the sentence is positive or negative.",
        ["open", "opens", "don't open", "doesn't open", "carry", "carries"]
      ),
    ],
  },
  {
    id: "a2-3b-present-simple-questions",
    title: "3B · Present Simple Questions and Short Answers",
    shortDescription: "Make present-simple questions and answer them with do or does.",
    levels: ["a2"],
    intro:
      "Use do or does before the subject, keep the main verb in the base form, and use the auxiliary in short answers.",
    items: [
      multipleChoiceItem(
        "a2-3b-mc-1",
        "Choose the correct auxiliary.",
        "____ Nina cycle to college?",
        ["Do", "Is", "Does"],
        2,
        "Use does to ask about Nina."
      ),
      multipleChoiceItem(
        "a2-3b-mc-2",
        "Choose the correct auxiliary.",
        "Where ____ your neighbours park their car?",
        ["do", "does", "are"],
        0,
        "Use do with the plural subject your neighbours."
      ),
      multipleChoiceItem(
        "a2-3b-mc-3",
        "Choose the best short answer.",
        "Do the children walk to school?",
        ["Yes, they are.", "Yes, they do.", "Yes, they walk."],
        1,
        "Use do in a positive short answer to a question beginning with do."
      ),
      multipleChoiceItem(
        "a2-3b-mc-4",
        "Choose the correct question.",
        "Ask about the café's closing time.",
        ["What time the café closes?", "What time does close the café?", "What time does the café close?"],
        2,
        "Use question phrase + does + subject + base verb."
      ),
      multipleChoiceItem(
        "a2-3b-mc-5",
        "Choose the best short answer.",
        "Does your phone need a new battery?",
        ["No, it doesn't.", "No, it isn't.", "No, it don't."],
        0,
        "Use doesn't in the negative short answer."
      ),
      multipleChoiceItem(
        "a2-3b-mc-6",
        "Choose the correct main verb.",
        "Does the shop ____ maps of the city?",
        ["selling", "sell", "sells"],
        1,
        "After does, use the base verb sell."
      ),
      doubleGap(
        "a2-3b-gf-1",
        "Complete the question. Use the verb in brackets.",
        ["What time ", { gapId: "g1" }, " the ferry ", { gapId: "g2" }, "? (leave)"],
        ["does"],
        ["leave"],
        "Use does before the singular subject and keep leave in the base form."
      ),
      doubleGap(
        "a2-3b-gf-2",
        "Complete the question. Use the verb in brackets.",
        ["Where ", { gapId: "g1" }, " your neighbours ", { gapId: "g2" }, " their bicycles? (keep)"],
        ["do"],
        ["keep"],
        "Use do before the plural subject and keep the main verb in the base form."
      ),
      {
        id: "a2-3b-short-answer-1",
        type: "gap-fill",
        prompt: "Complete the question and short answer.",
        parts: [
          { gapId: "g1" },
          " this train stop near the museum? No, it ",
          { gapId: "g2" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Does"], feedback: "Begin the question with Does." },
          { id: "g2", acceptedAnswers: ["doesn't", "does not"], feedback: "Use doesn't in the negative short answer." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-3b-cg-1",
        "Choose do or does for each question.",
        "____ the lift stop on every floor? ____ you need a key? Where ____ the night buses leave from?",
        ["Does", "Do", "do"],
        "Use does with a singular third-person subject and do with you or a plural subject.",
        ["Do", "Does", "do", "does"]
      ),
      errorCorrectionItem(
        "a2-3b-ec-1",
        "Check the highlighted phrase.",
        "Does Mateo works at the sports centre?",
        "Does Mateo works",
        false,
        "Does Mateo work",
        "After does, use the base verb work."
      ),
      errorCorrectionItem(
        "a2-3b-ec-2",
        "Check the highlighted question.",
        "Where do they collect the tickets?",
        "Where do they collect",
        true,
        "",
        "Correct! The order is question word + do + subject + base verb."
      ),
      errorCorrectionItem(
        "a2-3b-ec-3",
        "Check the highlighted phrase.",
        "Do your sister teach music?",
        "Do your sister teach",
        false,
        "Does your sister teach",
        "Use does with the singular subject your sister."
      ),
      wordOrderItem(
        "a2-3b-wo-1",
        "Put the words in the correct order.",
        ["often", "do", "How", "grandparents", "you", "your", "call"],
        "How often do you call your grandparents?",
        "Use question phrase + do + subject + base verb."
      ),
      wordOrderItem(
        "a2-3b-wo-2",
        "Put the words in the correct order.",
        ["museum", "Does", "Mondays", "open", "the", "on"],
        "Does the museum open on Mondays?",
        "Put does before the subject and use the base verb open."
      ),
      multipleChoiceItem(
        "a2-3b-mc-7",
        "Choose the correct question.",
        "Which question is correct?",
        ["Why does Ava leaves early?", "Why Ava does leave early?", "Why does Ava leave early?"],
        2,
        "After does and the subject, use the base verb leave."
      ),
      {
        id: "a2-3b-dialogue-1",
        type: "gap-fill",
        prompt: "Complete the conversation with do, does, or the verbs in brackets.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " your brother ",
          { gapId: "g2" },
          " at the clinic? (work)\nB: Yes, he ",
          { gapId: "g3" },
          ".\nA: What time ",
          { gapId: "g4" },
          " he ",
          { gapId: "g5" },
          "? (start)\nB: At eight o'clock.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Does"], feedback: "Begin the question about your brother with Does." },
          { id: "g2", acceptedAnswers: ["work"], feedback: "Use the base verb work after does." },
          { id: "g3", acceptedAnswers: ["does"], feedback: "Use does in the positive short answer." },
          { id: "g4", acceptedAnswers: ["does"], feedback: "Use does before he." },
          { id: "g5", acceptedAnswers: ["start"], feedback: "Use the base verb start after does." },
        ],
      },
      {
        id: "a2-3b-interview-1",
        type: "gap-fill",
        prompt: "Complete the interview questions. Use the verbs in brackets.",
        parts: [
          "1. Where ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " lunch? (buy)\n2. ",
          { gapId: "g3" },
          " your best friend ",
          { gapId: "g4" },
          " near you? (live)\n3. What time ",
          { gapId: "g5" },
          " your classes ",
          { gapId: "g6" },
          "? (finish)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["do"], feedback: "Use do before you." },
          { id: "g2", acceptedAnswers: ["buy"], feedback: "Use the base verb buy after do." },
          { id: "g3", acceptedAnswers: ["Does"], feedback: "Use Does with your best friend." },
          { id: "g4", acceptedAnswers: ["live"], feedback: "Use the base verb live after does." },
          { id: "g5", acceptedAnswers: ["do"], feedback: "Use do with the plural subject classes." },
          { id: "g6", acceptedAnswers: ["finish"], feedback: "Use the base verb finish after do." },
        ],
      },
    ],
  },
  {
    id: "a2-3c-word-order-in-questions",
    title: "3C · Word Order in Questions",
    shortDescription: "Build questions with be, do, does, and common question phrases.",
    levels: ["a2"],
    intro:
      "Put be before the subject in be questions, and use question word + do or does + subject + base verb with other verbs.",
    items: [
      multipleChoiceItem(
        "a2-3c-mc-1",
        "Choose the correct verb.",
        "Where ____ the lockers?",
        ["are", "is", "do"],
        0,
        "Use are before the plural subject the lockers."
      ),
      multipleChoiceItem(
        "a2-3c-mc-2",
        "Choose the correct auxiliary.",
        "What kind of books ____ Farah read?",
        ["do", "does", "is"],
        1,
        "Use does before the singular subject Farah."
      ),
      multipleChoiceItem(
        "a2-3c-mc-3",
        "Choose the correct question form.",
        "How many bedrooms ____?",
        ["the flat has", "has the flat", "does the flat have"],
        2,
        "Use does + subject + the base verb have."
      ),
      multipleChoiceItem(
        "a2-3c-mc-4",
        "Choose the correct auxiliary.",
        "Where ____ your cousins work?",
        ["do", "does", "are"],
        0,
        "Use do before the plural subject your cousins."
      ),
      multipleChoiceItem(
        "a2-3c-mc-5",
        "Choose the correct verb.",
        "How old ____ your manager?",
        ["does", "is", "are"],
        1,
        "Put is before the singular subject your manager."
      ),
      multipleChoiceItem(
        "a2-3c-mc-6",
        "Choose the correct auxiliary.",
        "What time ____ the first lesson begin?",
        ["is", "do", "does"],
        2,
        "Use does before the singular subject the first lesson."
      ),
      placeholderGapItem(
        "a2-3c-gf-1",
        "Complete the question with the correct form of be.",
        "Where __________ the nearest cash machine? (be)",
        "is",
        [],
        "Put is after where and before the singular subject."
      ),
      doubleGap(
        "a2-3c-gf-2",
        "Complete the question. Use the verb in brackets.",
        ["What kind of music ", { gapId: "g1" }, " Leo ", { gapId: "g2" }, " to? (listen)"],
        ["does"],
        ["listen"],
        "Use does before Leo and the base verb listen after the subject."
      ),
      doubleGap(
        "a2-3c-gf-3",
        "Complete the question. Use the verb in brackets.",
        ["How ", { gapId: "g1" }, " you ", { gapId: "g2" }, " your surname? (spell)"],
        ["do"],
        ["spell"],
        "Use how + do + subject + base verb."
      ),
      placeholderChoiceGapItem(
        "a2-3c-cg-1",
        "Choose is, are, do, or does for each gap.",
        "Why ____ the door locked? Where ____ the students have lunch? What ____ this key open?",
        ["is", "do", "does"],
        "Use be with an adjective and do or does with a main verb.",
        ["is", "are", "do", "does"]
      ),
      errorCorrectionItem(
        "a2-3c-ec-1",
        "Check the highlighted question.",
        "Where your office is?",
        "Where your office is",
        false,
        "Where is your office",
        "In a be question, put is before the subject."
      ),
      errorCorrectionItem(
        "a2-3c-ec-2",
        "Check the highlighted phrase.",
        "What does this sign means?",
        "does this sign means",
        false,
        "does this sign mean",
        "After does and the subject, use the base verb mean."
      ),
      errorCorrectionItem(
        "a2-3c-ec-3",
        "Check the highlighted question.",
        "How many people are in your class?",
        "How many people are in your class",
        true,
        "",
        "Correct! Put are before the rest of the sentence in this question with be."
      ),
      wordOrderItem(
        "a2-3c-wo-1",
        "Put the words in the correct order.",
        ["your", "What", "name", "teacher's", "is"],
        "What is your teacher's name?",
        "With be, put is before the subject phrase."
      ),
      wordOrderItem(
        "a2-3c-wo-2",
        "Put the words in the correct order.",
        ["does", "How", "cost", "ticket", "the", "much"],
        "How much does the ticket cost?",
        "Use question phrase + does + subject + base verb."
      ),
      multipleChoiceItem(
        "a2-3c-mc-7",
        "Choose the correct question.",
        "Ask about the number of students in the course.",
        ["How many students are in the course?", "How many students there are in the course?", "How many are students in the course?"],
        0,
        "Use how many + plural noun + are + place phrase."
      ),
      {
        id: "a2-3c-neighbours-1",
        type: "gap-fill",
        prompt: "Complete the conversation with be, do, or does.",
        parts: [
          "A: Where ",
          { gapId: "g1" },
          " your new neighbours from?\nB: They're from Brazil.\nA: What ",
          { gapId: "g2" },
          " they ",
          { gapId: "g3" },
          "? (do)\nB: They're architects.\nA: How old ",
          { gapId: "g4" },
          " their daughter?\nB: She's twelve.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["are"], feedback: "Use are before the plural subject neighbours." },
          { id: "g2", acceptedAnswers: ["do"], feedback: "Use do before they." },
          { id: "g3", acceptedAnswers: ["do"], feedback: "Use the base verb do after the subject." },
          { id: "g4", acceptedAnswers: ["is"], feedback: "Use is before the singular subject their daughter." },
        ],
      },
      {
        id: "a2-3c-questionnaire-1",
        type: "gap-fill",
        prompt: "Complete the questionnaire. Use the verbs in brackets.",
        parts: [
          "1. What kind of films ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          "? (like)\n2. How many people ",
          { gapId: "g3" },
          " in your team? (be)\n3. Where ",
          { gapId: "g4" },
          " your supervisor ",
          { gapId: "g5" },
          " lunch? (have)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["do"], feedback: "Use do before you." },
          { id: "g2", acceptedAnswers: ["like"], feedback: "Use the base verb like after do." },
          { id: "g3", acceptedAnswers: ["are"], feedback: "Use are with the plural subject people." },
          { id: "g4", acceptedAnswers: ["does"], feedback: "Use does before the singular subject supervisor." },
          { id: "g5", acceptedAnswers: ["have"], feedback: "Use the base verb have after does." },
        ],
      },
    ],
  },
  {
    id: "a2-4a-possessive-s-whose",
    title: "4A · Possessive 's and Whose...?",
    shortDescription: "Show possession with apostrophes and ask who something belongs to.",
    levels: ["a2"],
    intro:
      "Use 's with a singular person or an irregular plural, an apostrophe after a regular plural ending in -s, and whose to ask about possession.",
    items: [
      multipleChoiceItem(
        "a2-4a-mc-1",
        "Choose the correct possessive form.",
        "That is ____ desk.",
        ["Sofia", "Sofia's", "Sofias'"],
        1,
        "Add 's to the singular name Sofia."
      ),
      multipleChoiceItem(
        "a2-4a-mc-2",
        "Choose the correct possessive form.",
        "The ____ car is outside. Both of them are waiting for us.",
        ["parents'", "parent's", "parents's"],
        0,
        "For the regular plural parents, add an apostrophe after the final s."
      ),
      multipleChoiceItem(
        "a2-4a-mc-3",
        "Choose the correct possessive form.",
        "The ____ coats are beside the door.",
        ["childrens'", "childrens's", "children's"],
        2,
        "Children is an irregular plural, so add 's."
      ),
      multipleChoiceItem(
        "a2-4a-mc-4",
        "Choose the correct question word.",
        "____ bicycle is blocking the entrance?",
        ["Who", "Whose", "Who's"],
        1,
        "Use whose to ask who owns the bicycle."
      ),
      multipleChoiceItem(
        "a2-4a-mc-5",
        "Choose the best answer.",
        "Whose tablet is this?",
        ["It's Sofia's.", "It's Sofia.", "It's of Sofia."],
        0,
        "Use the person's name + 's when the owned object is understood."
      ),
      multipleChoiceItem(
        "a2-4a-mc-6",
        "Choose the correct of phrase.",
        "We waited until ____.",
        ["the meeting of the end", "the end's meeting", "the end of the meeting"],
        2,
        "We usually use an of phrase, not possessive 's, with a thing such as a road."
      ),
      placeholderGapItem(
        "a2-4a-gf-1",
        "Complete the sentence with the possessive form in brackets.",
        "This is my __________ bicycle. (uncle)",
        "uncle's",
        [],
        "Add 's to the singular noun uncle."
      ),
      placeholderGapItem(
        "a2-4a-gf-2",
        "Complete the sentence with the possessive form in brackets.",
        "The __________ bags are in the changing room. (players)",
        "players'",
        [],
        "Players is a regular plural ending in s, so add only an apostrophe."
      ),
      placeholderGapItem(
        "a2-4a-gf-3",
        "Complete the sentence with the possessive form in brackets.",
        "The __________ room is on the first floor. (children)",
        "children's",
        [],
        "Children is an irregular plural, so add 's."
      ),
      placeholderChoiceGapItem(
        "a2-4a-cg-1",
        "Choose the correct possessive form for each gap.",
        "My ____ office is upstairs. The two ____ coats are here, and the ____ toys are in that box.",
        ["manager's", "visitors'", "children's"],
        "Use 's for a singular person or irregular plural, and an apostrophe after a regular plural ending in s.",
        ["manager's", "managers'", "visitors'", "visitor's", "children's", "childrens'"]
      ),
      errorCorrectionItem(
        "a2-4a-ec-1",
        "Check the highlighted phrase.",
        "The doctors office is opposite the pharmacy.",
        "doctors office",
        false,
        "doctor's office",
        "Add 's to show that the office belongs to one doctor."
      ),
      errorCorrectionItem(
        "a2-4a-ec-2",
        "Check the highlighted word.",
        "My parents's garden is full of flowers.",
        "parents's",
        false,
        "parents'",
        "Parents is a regular plural ending in s, so add only an apostrophe."
      ),
      errorCorrectionItem(
        "a2-4a-ec-3",
        "Check the highlighted word.",
        "I have one brother. This is my brothers' phone.",
        "brothers'",
        false,
        "brother's",
        "The phone belongs to one brother, so use brother's."
      ),
      wordOrderItem(
        "a2-4a-wo-1",
        "Put the words in the correct order.",
        ["umbrella", "Whose", "this", "is"],
        "Whose umbrella is this?",
        "Put whose before the object and is before this."
      ),
      multipleChoiceItem(
        "a2-4a-mc-7",
        "Choose the correct word.",
        "____ bag is on the reception desk?",
        ["Who's", "Whose", "Who"],
        1,
        "Whose asks who the bag belongs to; who's means who is."
      ),
      errorCorrectionItem(
        "a2-4a-ec-4",
        "Check the highlighted phrase.",
        "The children's lunch is ready.",
        "children's lunch",
        true,
        "",
        "Correct! Add 's to the irregular plural children."
      ),
      {
        id: "a2-4a-family-1",
        type: "gap-fill",
        prompt: "Complete the description with the possessive forms in brackets.",
        parts: [
          "This is ",
          { gapId: "g1" },
          " coat. (Maya) Those are her ",
          { gapId: "g2" },
          " bicycles. (parents) The ",
          { gapId: "g3" },
          " helmets are in the garage. (children) They are next to her ",
          { gapId: "g4" },
          " toolbox. (father)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Maya's"], feedback: "Add 's to the singular name Maya." },
          { id: "g2", acceptedAnswers: ["parents'"], feedback: "Add an apostrophe after the regular plural parents." },
          { id: "g3", acceptedAnswers: ["children's"], feedback: "Add 's to the irregular plural children." },
          { id: "g4", acceptedAnswers: ["father's"], feedback: "Add 's to the singular noun father." },
        ],
      },
      {
        id: "a2-4a-lost-property-1",
        type: "gap-fill",
        prompt: "Complete the lost-property conversation.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " umbrella is this?\nB: It's ",
          { gapId: "g2" },
          ". (Karim)\nA: And ",
          { gapId: "g3" },
          " keys are these?\nB: They're my ",
          { gapId: "g4" },
          ". (parents)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Whose"], feedback: "Use Whose to ask who owns the umbrella." },
          { id: "g2", acceptedAnswers: ["Karim's"], feedback: "Use Karim's because umbrella is understood." },
          { id: "g3", acceptedAnswers: ["whose"], feedback: "Use whose before the plural noun keys." },
          { id: "g4", acceptedAnswers: ["parents'"], feedback: "Add an apostrophe after the regular plural parents." },
        ],
      },
    ],
  },
  {
    id: "a2-4b-prepositions-time-place",
    title: "4B · Prepositions of Time and Place",
    shortDescription: "Use in, on, at, and to for time, place, and movement.",
    levels: ["a2"],
    intro:
      "Use in, on, and at with common time expressions, choose in or at for place, use to for movement, and remember that go home has no preposition.",
    items: [
      multipleChoiceItem(
        "a2-4b-mc-1",
        "Choose the correct preposition.",
        "The first appointment is ____ 7:45.",
        ["in", "on", "at"],
        2,
        "Use at with a clock time."
      ),
      multipleChoiceItem(
        "a2-4b-mc-2",
        "Choose the correct preposition.",
        "The festival is ____ February this year.",
        ["at", "in", "on"],
        1,
        "Use in with a month."
      ),
      multipleChoiceItem(
        "a2-4b-mc-3",
        "Choose the correct preposition.",
        "We have a team lunch ____ Friday.",
        ["on", "in", "at"],
        0,
        "Use on with a day of the week."
      ),
      multipleChoiceItem(
        "a2-4b-mc-4",
        "Choose the correct preposition.",
        "Lena is waiting ____ reception.",
        ["in", "to", "at"],
        2,
        "Use at for a point or activity place such as reception."
      ),
      multipleChoiceItem(
        "a2-4b-mc-5",
        "Choose the correct preposition.",
        "The spare cables are ____ a cupboard beside the printer.",
        ["at", "in", "on"],
        1,
        "Use in because the cables are inside the cupboard."
      ),
      multipleChoiceItem(
        "a2-4b-mc-6",
        "Choose the correct preposition.",
        "After breakfast, Mia goes ____ the station.",
        ["to", "at", "in"],
        0,
        "Use to for movement towards a place."
      ),
      placeholderGapItem(
        "a2-4b-gf-1",
        "Complete the time expression with one preposition.",
        "The street is very quiet __________ night.",
        "at",
        [],
        "Use at in the expression at night."
      ),
      placeholderGapItem(
        "a2-4b-gf-2",
        "Complete the time expression with one preposition.",
        "This beach is crowded __________ summer.",
        "in",
        [],
        "Use in with a season."
      ),
      placeholderGapItem(
        "a2-4b-gf-3",
        "Complete the date with one preposition.",
        "The new shop opens __________ 12 May.",
        "on",
        [],
        "Use on with a date."
      ),
      placeholderChoiceGapItem(
        "a2-4b-cg-1",
        "Choose in, on, or at for each gap.",
        "The course begins ____ September. Classes are ____ Tuesday evenings ____ six o'clock.",
        ["in", "on", "at"],
        "Use in with a month, on with a day, and at with a clock time.",
        ["in", "on", "at"]
      ),
      errorCorrectionItem(
        "a2-4b-ec-1",
        "Check the highlighted phrase.",
        "Our building opened at 2024.",
        "at 2024",
        false,
        "in 2024",
        "Use in with a year."
      ),
      errorCorrectionItem(
        "a2-4b-ec-2",
        "Check the highlighted phrase.",
        "Nora goes at the gym after work.",
        "goes at the gym",
        false,
        "goes to the gym",
        "Use to for movement towards the gym."
      ),
      errorCorrectionItem(
        "a2-4b-ec-3",
        "Check the highlighted phrase.",
        "The children go to home at four.",
        "go to home",
        false,
        "go home",
        "Do not use to before home after go."
      ),
      wordOrderItem(
        "a2-4b-wo-1",
        "Put the words in the correct order.",
        ["work", "lunch", "at", "We", "have"],
        "We have lunch at work.",
        "Use at in the expression at work."
      ),
      wordOrderItem(
        "a2-4b-wo-2",
        "Put the words in the correct order.",
        ["goes", "six", "home", "She", "at"],
        "She goes home at six.",
        "Use no preposition before home and at before the time."
      ),
      multipleChoiceItem(
        "a2-4b-mc-7",
        "Choose the correct preposition.",
        "The night train leaves ____ midnight.",
        ["in", "on", "at"],
        2,
        "Use at in the expression at midnight."
      ),
      {
        id: "a2-4b-schedule-1",
        type: "gap-fill",
        prompt: "Complete the schedule with in, on, or at.",
        parts: [
          "I start work ",
          { gapId: "g1" },
          " 8:30 ",
          { gapId: "g2" },
          " weekdays. ",
          { gapId: "g3" },
          " winter, it is often dark when I arrive. This week, our staff meeting is ",
          { gapId: "g4" },
          " Thursday afternoon.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["at"], feedback: "Use at with 8:30." },
          { id: "g2", acceptedAnswers: ["on"], feedback: "Use on with weekdays." },
          { id: "g3", acceptedAnswers: ["In"], feedback: "Use in with winter." },
          { id: "g4", acceptedAnswers: ["on"], feedback: "Use on with Thursday afternoon." },
        ],
      },
      {
        id: "a2-4b-daily-route-1",
        type: "gap-fill",
        prompt: "Complete the description with prepositions. Write home without a preposition where required.",
        parts: [
          "Luca lives ",
          { gapId: "g1" },
          " Bristol and works ",
          { gapId: "g2" },
          " a hospital. He goes ",
          { gapId: "g3" },
          " work by bus. At lunchtime, he eats ",
          { gapId: "g4" },
          " the staff kitchen. After work, he goes ",
          { gapId: "g5" },
          " and reads ",
          { gapId: "g6" },
          " the evening.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["in"], feedback: "Use in with a city." },
          { id: "g2", acceptedAnswers: ["in"], feedback: "Use in for a place inside a building." },
          { id: "g3", acceptedAnswers: ["to"], feedback: "Use to for movement to work." },
          { id: "g4", acceptedAnswers: ["in"], feedback: "Use in because he eats inside the staff kitchen." },
          { id: "g5", acceptedAnswers: ["home"], feedback: "Use home without to after goes." },
          { id: "g6", acceptedAnswers: ["in"], feedback: "Use in with the evening." },
        ],
      },
    ],
  },
  {
    id: "a2-4c-frequency-adverbs-expressions",
    title: "4C · Adverbs and Expressions of Frequency",
    shortDescription: "Place frequency adverbs and expressions correctly in a sentence.",
    levels: ["a2"],
    intro:
      "Put frequency adverbs before a main verb, after be, and between don't or doesn't and the main verb; put frequency expressions at the end.",
    items: [
      multipleChoiceItem(
        "a2-4c-mc-1",
        "Choose the sentence with the adverb in the correct position.",
        "Kai ____ goes running before breakfast.",
        ["usually", "is usually", "usually is"],
        0,
        "Put usually before the main verb goes."
      ),
      multipleChoiceItem(
        "a2-4c-mc-2",
        "Choose the correct position for the adverb.",
        "The buses ____ crowded after five.",
        ["usually are", "are crowded usually", "are usually"],
        2,
        "Put usually after the verb are."
      ),
      multipleChoiceItem(
        "a2-4c-mc-3",
        "Choose the correct negative form.",
        "My manager ____ messages during meetings.",
        ["not often check", "doesn't often check", "doesn't often checks"],
        1,
        "In a negative sentence, often goes between doesn't and the base verb."
      ),
      multipleChoiceItem(
        "a2-4c-mc-4",
        "Choose the sentence with the frequency expression in the usual position.",
        "Which sentence is correct?",
        ["We clean the office twice a week.", "Twice a week we the office clean.", "We twice a week clean the office."],
        0,
        "Expressions such as twice a week usually go at the end."
      ),
      multipleChoiceItem(
        "a2-4c-mc-5",
        "Choose the best frequency adverb.",
        "Mila ____ takes a taxi - perhaps twice a year.",
        ["always", "often", "hardly ever"],
        2,
        "Hardly ever means almost never."
      ),
      multipleChoiceItem(
        "a2-4c-mc-6",
        "Choose the correct question phrase.",
        "____ do you replace the water filter?",
        ["How time", "How often", "How many often"],
        1,
        "Use How often to ask about frequency."
      ),
      adverbPlacementItem(
        "a2-4c-place-1",
        "Place the adverb in the correct position.",
        "Mina takes the early train.",
        ["always"],
        { always: 1 },
        "Mina always takes the early train.",
        "Put always before the main verb takes."
      ),
      adverbPlacementItem(
        "a2-4c-place-2",
        "Place the adverb in the correct position.",
        "The waiting room is quiet in the afternoon.",
        ["usually"],
        { usually: 4 },
        "The waiting room is usually quiet in the afternoon.",
        "Put usually after the verb is."
      ),
      adverbPlacementItem(
        "a2-4c-place-3",
        "Place the expression in the correct position.",
        "I work from home.",
        ["twice a week"],
        { "twice a week": 4 },
        "I work from home twice a week.",
        "Frequency expressions usually go at the end of the sentence."
      ),
      placeholderChoiceGapItem(
        "a2-4c-cg-1",
        "Choose the correct frequency adverb for each gap.",
        "I ____ eat breakfast before work. My brother is ____ late, and our parents don't ____ call before nine.",
        ["usually", "never", "often"],
        "Put the adverb before a main verb, after be, or between don't and the main verb.",
        ["always", "usually", "often", "sometimes", "hardly ever", "never"]
      ),
      errorCorrectionItem(
        "a2-4c-ec-1",
        "Check the highlighted phrase.",
        "Our delivery often is late.",
        "often is late",
        false,
        "is often late",
        "Put often after the verb be."
      ),
      errorCorrectionItem(
        "a2-4c-ec-2",
        "Check the highlighted phrase.",
        "Tara doesn't never use cash.",
        "doesn't never use",
        false,
        "never uses",
        "Use never with a positive verb; do not combine it with doesn't."
      ),
      errorCorrectionItem(
        "a2-4c-ec-3",
        "Check the highlighted expression.",
        "The team meets every Fridays.",
        "every Fridays",
        false,
        "every Friday",
        "Use every with a singular day: every Friday."
      ),
      errorCorrectionItem(
        "a2-4c-ec-4",
        "Check the highlighted phrase.",
        "I hardly ever watch television in the morning.",
        "hardly ever watch",
        true,
        "",
        "Correct! Hardly ever goes before the main verb watch."
      ),
      wordOrderItem(
        "a2-4c-wo-1",
        "Put the words in the correct order.",
        ["hiking", "once", "go", "a", "We", "month"],
        "We go hiking once a month.",
        "Put the frequency expression once a month at the end."
      ),
      multipleChoiceItem(
        "a2-4c-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["He hardly ever eats fast food.", "He doesn't never eat fast food.", "He eats hardly fast food ever."],
        0,
        "Use hardly ever before the positive main verb eats."
      ),
      {
        id: "a2-4c-work-routine-1",
        type: "gap-fill",
        prompt: "Arrange the words in brackets to complete the routine.",
        parts: [
          "Mara ",
          { gapId: "g1" },
          " to work. (usually / walk) She ",
          { gapId: "g2" },
          " late. (never / be) She ",
          { gapId: "g3" },
          " lunch at her desk. (not often / eat) She goes to a café ",
          { gapId: "g4" },
          ". (twice a week)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["usually walks"], feedback: "Put usually before the main verb walks." },
          { id: "g2", acceptedAnswers: ["is never"], feedback: "Put never after the verb is." },
          { id: "g3", acceptedAnswers: ["doesn't often eat", "does not often eat"], feedback: "Put often between doesn't and the base verb eat." },
          { id: "g4", acceptedAnswers: ["twice a week"], feedback: "Put the frequency expression at the end." },
        ],
      },
      {
        id: "a2-4c-home-routine-1",
        type: "gap-fill",
        prompt: "Arrange the words in brackets to complete the description.",
        parts: [
          "On weekdays, I ",
          { gapId: "g1" },
          " before seven. (always / get up) My housemates ",
          { gapId: "g2" },
          " awake then. (hardly ever / be) We ",
          { gapId: "g3" },
          " breakfast together. (not usually / have) We meet for dinner ",
          { gapId: "g4" },
          ". (once a week)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["always get up"], feedback: "Put always before the main verb get up." },
          { id: "g2", acceptedAnswers: ["are hardly ever"], feedback: "Put hardly ever after the verb are." },
          { id: "g3", acceptedAnswers: ["don't usually have", "do not usually have"], feedback: "Put usually between don't and the base verb have." },
          { id: "g4", acceptedAnswers: ["once a week"], feedback: "Put the frequency expression at the end." },
        ],
      },
    ],
  },
  {
    id: "a2-5a-can-cant",
    title: "5A · Can and Can't",
    shortDescription: "Use can and can't for ability, possibility, permission, and requests.",
    levels: ["a2"],
    intro:
      "Use can or can't with the base verb for every subject, put can before the subject in questions, and use can or can't in short answers.",
    items: [
      multipleChoiceItem(
        "a2-5a-mc-1",
        "Choose the correct verb form.",
        "Ari can ____ every street in the old town from memory.",
        ["names", "know", "name"],
        2,
        "After can, use the base verb name."
      ),
      multipleChoiceItem(
        "a2-5a-mc-2",
        "Choose the correct negative form.",
        "You ____ beside this gate. It is an emergency entrance.",
        ["don't can park", "can't park", "can't to park"],
        1,
        "Use can't + the base verb park."
      ),
      multipleChoiceItem(
        "a2-5a-mc-3",
        "Choose the correct question word.",
        "____ Rosa use the new booking system?",
        ["Can", "Does", "Is"],
        0,
        "Put can before the subject to ask about ability."
      ),
      multipleChoiceItem(
        "a2-5a-mc-4",
        "Choose the meaning of can in this sentence.",
        "Staff can leave early on Friday.",
        ["They know how to leave.", "They are leaving now.", "They have permission to leave."],
        2,
        "Here, can shows permission."
      ),
      multipleChoiceItem(
        "a2-5a-mc-5",
        "Choose the polite request.",
        "You need help with a heavy parcel.",
        ["Can you help me carry this?", "Do you can help me carry this?", "Are you help me carry this?"],
        0,
        "Use Can you + base verb for a request."
      ),
      multipleChoiceItem(
        "a2-5a-mc-6",
        "Choose the best short answer.",
        "Can I charge my phone here?",
        ["Yes, you do.", "Yes, you can.", "Yes, you are."],
        1,
        "Answer a can question with can."
      ),
      placeholderGapItem(
        "a2-5a-gf-1",
        "Complete the sentence with the verb in brackets.",
        "Tomas can __________ most computer problems. (repair)",
        "repair",
        [],
        "Use the base verb repair after can."
      ),
      placeholderGapItem(
        "a2-5a-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "Visitors __________ this door after six. (not use)",
        "can't use",
        ["cannot use"],
        "Use can't or cannot + the base verb use."
      ),
      {
        id: "a2-5a-question-1",
        type: "gap-fill",
        prompt: "Complete the question and short answer. Use the verb in brackets.",
        parts: [
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " this box? (lift) Yes, I ",
          { gapId: "g3" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Can"], feedback: "Begin the question with Can." },
          { id: "g2", acceptedAnswers: ["lift"], feedback: "Use the base verb lift after the subject." },
          { id: "g3", acceptedAnswers: ["can"], feedback: "Use can in the positive short answer." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-5a-cg-1",
        "Choose can or can't for each gap.",
        "The café is open, so we ____ get a drink. It only accepts cards, so you ____ pay with cash. ____ we sit outside?",
        ["can", "can't", "Can"],
        "Use the context to decide whether something is possible or not, and begin the question with Can.",
        ["can", "can't", "Can", "Can't"]
      ),
      errorCorrectionItem(
        "a2-5a-ec-1",
        "Check the highlighted phrase.",
        "Mina can knows the answer.",
        "can knows",
        false,
        "can know",
        "After can, use the base verb know."
      ),
      errorCorrectionItem(
        "a2-5a-ec-2",
        "Check the highlighted phrase.",
        "I can to meet you after lunch.",
        "can to meet",
        false,
        "can meet",
        "Do not use to after can."
      ),
      errorCorrectionItem(
        "a2-5a-ec-3",
        "Check the highlighted phrase.",
        "We can't hear the announcement from here.",
        "can't hear",
        true,
        "",
        "Correct! Use can't + the base verb hear."
      ),
      wordOrderItem(
        "a2-5a-wo-1",
        "Put the words in the correct order.",
        ["charger", "Can", "your", "use", "I"],
        "Can I use your charger?",
        "Put can before the subject and use the base verb use."
      ),
      wordOrderItem(
        "a2-5a-wo-2",
        "Put the words in the correct order.",
        ["leave", "You", "here", "can't", "bicycle", "your"],
        "You can't leave your bicycle here.",
        "Put can't before the base verb leave."
      ),
      multipleChoiceItem(
        "a2-5a-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["She cans speak Arabic.", "She can to speak Arabic.", "She can speak Arabic."],
        2,
        "Can is the same for every subject and is followed by the base verb."
      ),
      {
        id: "a2-5a-skills-1",
        type: "gap-fill",
        prompt: "Complete the description with can, can't, and the verbs in brackets.",
        parts: [
          "Leila is good with bicycles, so she ",
          { gapId: "g1" },
          " them. (fix) She doesn't have a driving licence, so she ",
          { gapId: "g2" },
          " a car. (not drive) ",
          { gapId: "g3" },
          " her brother ",
          { gapId: "g4" },
          "? (drive) Yes, he ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["can fix"], feedback: "Use can + fix because she has this ability." },
          { id: "g2", acceptedAnswers: ["can't drive", "cannot drive"], feedback: "Use can't + drive because she does not have a licence." },
          { id: "g3", acceptedAnswers: ["Can"], feedback: "Begin the question with Can." },
          { id: "g4", acceptedAnswers: ["drive"], feedback: "Use the base verb drive after the subject." },
          { id: "g5", acceptedAnswers: ["can"], feedback: "Use can in the positive short answer." },
        ],
      },
      {
        id: "a2-5a-library-rules-1",
        type: "gap-fill",
        prompt: "Complete the library rules and request with can, can't, and the verbs in brackets.",
        parts: [
          "You ",
          { gapId: "g1" },
          " the computers without booking. (use) You ",
          { gapId: "g2" },
          " food into the reading room. (not take) ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          " your phone, please? (switch off)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["can use"], feedback: "Use can + use to show permission." },
          { id: "g2", acceptedAnswers: ["can't take", "cannot take"], feedback: "Use can't + take for a rule that prohibits something." },
          { id: "g3", acceptedAnswers: ["Can"], feedback: "Begin the request with Can." },
          { id: "g4", acceptedAnswers: ["switch off"], feedback: "Use the base verb switch off after the subject." },
        ],
      },
    ],
  },
  {
    id: "a2-5b-present-continuous",
    title: "5B · Present Continuous",
    shortDescription: "Describe actions happening now or around now with be + verb-ing.",
    levels: ["a2"],
    intro:
      "Use am, is, or are with an -ing form, invert be and the subject in questions, and apply the common -ing spelling rules.",
    items: [
      multipleChoiceItem(
        "a2-5b-mc-1",
        "Choose the correct present-continuous form.",
        "The receptionist ____ a guest's details right now.",
        ["is checking", "checks", "checking"],
        0,
        "Use is + checking for an action happening now."
      ),
      multipleChoiceItem(
        "a2-5b-mc-2",
        "Choose the correct -ing spelling.",
        "Nora is ____ near the window while she waits.",
        ["siting", "siteing", "sitting"],
        2,
        "Double the final consonant in sit before adding -ing."
      ),
      multipleChoiceItem(
        "a2-5b-mc-3",
        "Choose the correct negative form.",
        "The lifts ____ today, so please use the stairs.",
        ["don't working", "aren't working", "not work"],
        1,
        "Use aren't + working with the plural subject lifts."
      ),
      multipleChoiceItem(
        "a2-5b-mc-4",
        "Choose the correct question form.",
        "____ the customers waiting outside?",
        ["Are", "Do", "Is"],
        0,
        "Put Are before the plural subject in a present-continuous question."
      ),
      multipleChoiceItem(
        "a2-5b-mc-5",
        "Choose the best short answer.",
        "Is Daniel wearing his name badge?",
        ["Yes, he does.", "Yes, he is.", "Yes, he's."],
        1,
        "Use Yes, he is. Do not contract be in a positive short answer."
      ),
      multipleChoiceItem(
        "a2-5b-mc-6",
        "Choose the correct -ing spelling.",
        "Nora is ____ an email to the supplier.",
        ["writeing", "writting", "writing"],
        2,
        "Drop the final e in write before adding -ing."
      ),
      placeholderGapItem(
        "a2-5b-gf-1",
        "Complete the sentence with the verb in brackets.",
        "I __________ for the blue folder at the moment. (look)",
        "am looking",
        ["'m looking"],
        "Use am + looking with I."
      ),
      placeholderGapItem(
        "a2-5b-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "The printer __________ properly today. (not work)",
        "isn't working",
        ["is not working", "'s not working"],
        "Use isn't + working with the singular subject printer."
      ),
      doubleGap(
        "a2-5b-gf-3",
        "Complete the question. Use the verb in brackets.",
        [
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " this chair? (use)",
        ],
        ["Are"],
        ["using"],
        "Use Are + subject + using."
      ),
      placeholderChoiceGapItem(
        "a2-5b-cg-1",
        "Choose the correct form of be for each gap.",
        "I ____ packing the samples. Sara ____ checking the list, and the drivers ____ waiting outside.",
        ["am", "is", "are"],
        "Match am, is, or are to the subject.",
        ["am", "is", "are"]
      ),
      errorCorrectionItem(
        "a2-5b-ec-1",
        "Check the highlighted phrase.",
        "She talking to a customer at the moment.",
        "She talking",
        false,
        ["She is talking", "She's talking"],
        "The present continuous needs be: She is talking."
      ),
      errorCorrectionItem(
        "a2-5b-ec-2",
        "Check the highlighted verb.",
        "The children are runing across the playground.",
        "runing",
        false,
        "running",
        "Double the final consonant in run before adding -ing."
      ),
      errorCorrectionItem(
        "a2-5b-ec-3",
        "Check the highlighted phrase.",
        "We're staying near the conference centre this week.",
        "We're staying",
        true,
        "",
        "Correct! Use the present continuous for a temporary situation this week."
      ),
      wordOrderItem(
        "a2-5b-wo-1",
        "Put the words in the correct order.",
        ["working", "today", "from", "They're", "home"],
        "They're working from home today.",
        "Use be + verb-ing, followed by the temporary time expression."
      ),
      wordOrderItem(
        "a2-5b-wo-2",
        "Put the words in the correct order.",
        ["taxi", "outside", "Is", "waiting", "the"],
        "Is the taxi waiting outside?",
        "Put is before the subject in a present-continuous question."
      ),
      multipleChoiceItem(
        "a2-5b-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["We aren't having lunch yet.", "We don't having lunch yet.", "We aren't have lunch yet."],
        0,
        "Use aren't + having for a negative present-continuous sentence."
      ),
      {
        id: "a2-5b-event-1",
        type: "gap-fill",
        prompt: "Complete the description with the verbs in brackets.",
        parts: [
          "The events manager ",
          { gapId: "g1" },
          " the hall now. (prepare) Ana ",
          { gapId: "g2" },
          " signs near the entrance. (put) Omar ",
          { gapId: "g3" },
          " boxes because his arm hurts. (not carry) Two assistants ",
          { gapId: "g4" },
          " the chairs. (move)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["is preparing", "'s preparing"], feedback: "Use is + preparing with the singular subject manager." },
          { id: "g2", acceptedAnswers: ["is putting", "'s putting"], feedback: "Use is + putting and double the final consonant in put." },
          { id: "g3", acceptedAnswers: ["isn't carrying", "is not carrying", "'s not carrying"], feedback: "Use isn't + carrying for the negative action." },
          { id: "g4", acceptedAnswers: ["are moving", "'re moving"], feedback: "Use are + moving with the plural subject assistants." },
        ],
      },
      {
        id: "a2-5b-phone-call-1",
        type: "gap-fill",
        prompt: "Complete the phone conversation with the verbs in brackets.",
        parts: [
          "A: What ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          "? (do)\nB: I ",
          { gapId: "g3" },
          " for the bus. (wait)\nA: ",
          { gapId: "g4" },
          " Maya ",
          { gapId: "g5" },
          " with you? (come)\nB: No, she ",
          { gapId: "g6" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["are"], feedback: "Use are before you." },
          { id: "g2", acceptedAnswers: ["doing"], feedback: "Use doing after the subject." },
          { id: "g3", acceptedAnswers: ["am waiting", "'m waiting"], feedback: "Use am + waiting with I." },
          { id: "g4", acceptedAnswers: ["Is"], feedback: "Begin the question about Maya with Is." },
          { id: "g5", acceptedAnswers: ["coming"], feedback: "Drop the final e in come before adding -ing." },
          { id: "g6", acceptedAnswers: ["isn't", "is not"], feedback: "Use isn't in the negative short answer." },
        ],
      },
    ],
  },
  {
    id: "a2-5c-present-simple-or-continuous",
    title: "5C · Present Simple or Present Continuous?",
    shortDescription: "Choose between routines and facts or actions happening around now.",
    levels: ["a2"],
    intro:
      "Use the present simple for routines and things that are normally true, and the present continuous for actions happening now or temporary situations around now.",
    items: [
      multipleChoiceItem(
        "a2-5c-mc-1",
        "Choose the correct verb form.",
        "Marta usually ____ the underground to work.",
        ["is taking", "takes", "take"],
        1,
        "Usually signals a routine, so use the present simple takes."
      ),
      multipleChoiceItem(
        "a2-5c-mc-2",
        "Choose the correct verb form.",
        "This week, Marta ____ the bus because her station is closed.",
        ["is taking", "takes", "take"],
        0,
        "This week describes a temporary situation, so use is taking."
      ),
      multipleChoiceItem(
        "a2-5c-mc-3",
        "Choose the correct verb form.",
        "Look! A cat ____ onto the balcony.",
        ["climbs", "climb", "is climbing"],
        2,
        "Look signals an action happening now, so use is climbing."
      ),
      multipleChoiceItem(
        "a2-5c-mc-4",
        "Choose the correct question.",
        "Ask someone about their job.",
        ["What are you doing?", "What do you do?", "What you do?"],
        1,
        "What do you do? asks about a person's job."
      ),
      multipleChoiceItem(
        "a2-5c-mc-5",
        "Choose the correct question.",
        "Ask what someone is doing right now.",
        ["What do you usually do?", "What you are doing?", "What are you doing?"],
        2,
        "Use What are you doing? for an action happening now."
      ),
      multipleChoiceItem(
        "a2-5c-mc-6",
        "Choose the correct verb form.",
        "Leo ____ lunch at work every day.",
        ["doesn't buy", "isn't buying", "not buys"],
        0,
        "Every day signals a routine, so use the present-simple negative doesn't buy."
      ),
      placeholderGapItem(
        "a2-5c-gf-1",
        "Complete the sentence with the verb in brackets.",
        "At the moment, I __________ outside the dentist's office. (wait)",
        "am waiting",
        ["'m waiting"],
        "At the moment signals the present continuous: am waiting."
      ),
      placeholderGapItem(
        "a2-5c-gf-2",
        "Complete the sentence with the verb in brackets.",
        "Rafi __________ at the community centre every Monday. (work)",
        "works",
        [],
        "Every Monday signals a routine, so use the present simple works."
      ),
      placeholderChoiceGapItem(
        "a2-5c-cg-1",
        "Choose the correct verb form for each gap.",
        "Nina normally ____ lunch at home. Today she ____ in a café because she ____ a client nearby.",
        ["has", "is eating", "is meeting"],
        "Use the present simple for the normal routine and the present continuous for today's temporary actions.",
        ["has", "is having", "eats", "is eating", "meets", "is meeting"]
      ),
      errorCorrectionItem(
        "a2-5c-ec-1",
        "Check the highlighted phrase.",
        "Sofia works from home today because her office is closed.",
        "works from home today",
        false,
        "is working from home today",
        "Today describes a temporary situation here, so use the present continuous."
      ),
      errorCorrectionItem(
        "a2-5c-ec-2",
        "Check the highlighted phrase.",
        "I am usually walking to the market on Saturdays.",
        "am usually walking",
        false,
        "usually walk",
        "On Saturdays describes a routine, so use the present simple."
      ),
      errorCorrectionItem(
        "a2-5c-ec-3",
        "Check the highlighted phrase.",
        "The students are taking an exam at the moment.",
        "are taking",
        true,
        "",
        "Correct! At the moment signals an action happening now."
      ),
      wordOrderItem(
        "a2-5c-wo-1",
        "Put the words in the correct order.",
        ["friends", "week", "with", "They're", "staying", "this"],
        "They're staying with friends this week.",
        "Use the present continuous with the temporary expression this week."
      ),
      wordOrderItem(
        "a2-5c-wo-2",
        "Put the words in the correct order.",
        ["office", "usually", "drives", "He", "the", "to"],
        "He usually drives to the office.",
        "Use the present simple for a usual routine."
      ),
      multipleChoiceItem(
        "a2-5c-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["At the moment, they repair the roof.", "At the moment, they're repairing the roof.", "At the moment, they repairing the roof."],
        1,
        "At the moment requires the present continuous: they are repairing."
      ),
      {
        id: "a2-5c-changing-routine-1",
        type: "gap-fill",
        prompt: "Complete the description with the verbs in brackets.",
        parts: [
          "Sam normally ",
          { gapId: "g1" },
          " work at nine. (start) This week, he ",
          { gapId: "g2" },
          " at seven. (start) He usually ",
          { gapId: "g3" },
          " to work. (drive) Today, he ",
          { gapId: "g4" },
          " by train. (travel)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["starts"], feedback: "Normally signals the present simple starts." },
          { id: "g2", acceptedAnswers: ["is starting", "'s starting"], feedback: "This week signals the present continuous is starting." },
          { id: "g3", acceptedAnswers: ["drives"], feedback: "Usually signals the present simple drives." },
          { id: "g4", acceptedAnswers: ["is travelling", "is traveling", "'s travelling", "'s traveling"], feedback: "Today signals the present continuous is travelling." },
        ],
      },
      {
        id: "a2-5c-job-conversation-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the verbs in brackets.",
        parts: [
          "A: What ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          "? (do)\nB: I ",
          { gapId: "g3" },
          " a small hotel. (manage)\nA: Why ",
          { gapId: "g4" },
          " you ",
          { gapId: "g5" },
          " sports clothes today? (wear)\nB: We're having a staff activity day.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["do"], feedback: "Use do to ask about a job." },
          { id: "g2", acceptedAnswers: ["do"], feedback: "Use the base verb do after the subject." },
          { id: "g3", acceptedAnswers: ["manage"], feedback: "Use the present simple for a permanent job." },
          { id: "g4", acceptedAnswers: ["are"], feedback: "Use are for an action happening today." },
          { id: "g5", acceptedAnswers: ["wearing"], feedback: "Use wearing after the subject in the present continuous." },
        ],
      },
      {
        id: "a2-5c-cafe-1",
        type: "gap-fill",
        prompt: "Complete the café description with the verbs in brackets.",
        parts: [
          "Our café usually ",
          { gapId: "g1" },
          " at six. (close) This month, it ",
          { gapId: "g2" },
          " open until eight. (stay) Most customers ",
          { gapId: "g3" },
          " inside in winter. (sit) Today, several people ",
          { gapId: "g4" },
          " outside. (eat)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["closes"], feedback: "Usually signals the present simple closes." },
          { id: "g2", acceptedAnswers: ["is staying", "'s staying"], feedback: "This month signals the present continuous is staying." },
          { id: "g3", acceptedAnswers: ["sit"], feedback: "Use the present simple for what most customers normally do in winter." },
          { id: "g4", acceptedAnswers: ["are eating", "'re eating"], feedback: "Today describes an action happening now, so use are eating." },
        ],
      },
    ],
  },
  {
    id: "a2-6a-object-pronouns",
    title: "6A · Object Pronouns",
    shortDescription: "Use me, you, him, her, it, us, and them after verbs and prepositions.",
    levels: ["a2"],
    intro:
      "Replace object nouns with object pronouns, and use object rather than subject pronouns after verbs and prepositions.",
    items: [
      multipleChoiceItem(
        "a2-6a-mc-1",
        "Choose the correct object pronoun.",
        "I call Maria every Friday. I call ____ after work.",
        ["she", "hers", "her"],
        2,
        "Use her as the object form for Maria."
      ),
      multipleChoiceItem(
        "a2-6a-mc-2",
        "Choose the correct object pronoun.",
        "The music is very loud. Can you hear ____?",
        ["me", "I", "my"],
        0,
        "Use me after the verb hear."
      ),
      multipleChoiceItem(
        "a2-6a-mc-3",
        "Choose the correct object pronoun.",
        "Our neighbour often invites my sister and me. She invites ____ for dinner.",
        ["we", "us", "our"],
        1,
        "Use us for my sister and me after the verb invites."
      ),
      multipleChoiceItem(
        "a2-6a-mc-4",
        "Choose the correct object pronoun.",
        "The documents are ready. Please collect ____ at reception.",
        ["it", "they", "them"],
        2,
        "Use them for the plural noun documents."
      ),
      multipleChoiceItem(
        "a2-6a-mc-5",
        "Choose the correct object pronoun.",
        "Omar is at the café. I'm having lunch with ____.",
        ["he", "him", "his"],
        1,
        "Use him after the preposition with."
      ),
      multipleChoiceItem(
        "a2-6a-mc-6",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["They know us very well.", "Them know we very well.", "They know we very well."],
        0,
        "Use they as the subject and us as the object."
      ),
      multipleChoiceItem(
        "a2-6a-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["Can you send I the address?", "Can you send the address to I?", "Can you send me the address?"],
        2,
        "Use the object pronoun me after send."
      ),
      placeholderGapItem(
        "a2-6a-gf-1",
        "Replace the noun phrase with one object pronoun.",
        "I can't find my keys. Have you seen __________? (my keys)",
        "them",
        [],
        "Use them to replace the plural object my keys."
      ),
      placeholderGapItem(
        "a2-6a-gf-2",
        "Complete the second sentence with an object pronoun.",
        "Daniel works near me. I see __________ on the bus most mornings. (Daniel)",
        "him",
        [],
        "Use him to replace Daniel as the object of see."
      ),
      placeholderGapItem(
        "a2-6a-gf-3",
        "Complete the sentence with the object form in brackets.",
        "The guide is waiting for __________ outside. (we)",
        "us",
        [],
        "Use us after the preposition for."
      ),
      placeholderChoiceGapItem(
        "a2-6a-cg-1",
        "Choose the correct object pronoun for each gap.",
        "Nico has the tickets. Ask ____ for ____. I need one, so give ____ to ____.",
        ["him", "them", "it", "me"],
        "Choose the pronoun that matches each person or thing and use object forms after verbs and prepositions.",
        ["me", "you", "him", "her", "it", "us", "them"]
      ),
      errorCorrectionItem(
        "a2-6a-ec-1",
        "Check the highlighted word.",
        "Please call she before the meeting.",
        "she",
        false,
        "her",
        "Use the object pronoun her after call."
      ),
      errorCorrectionItem(
        "a2-6a-ec-2",
        "Check the highlighted phrase.",
        "There are two seats for you and I.",
        "you and I",
        false,
        "you and me",
        "Use the object form me after the preposition for."
      ),
      errorCorrectionItem(
        "a2-6a-ec-3",
        "Check the highlighted phrase.",
        "Please sit with us near the front.",
        "with us",
        true,
        "",
        "Correct! Use the object pronoun us after with."
      ),
      wordOrderItem(
        "a2-6a-wo-1",
        "Put the words in the correct order.",
        ["to", "Please", "send", "me", "it"],
        "Please send it to me.",
        "Use it after the verb and me after the preposition to."
      ),
      wordOrderItem(
        "a2-6a-wo-2",
        "Put the words in the correct order.",
        ["visit", "every", "We", "month", "them"],
        "We visit them every month.",
        "Put the object pronoun them after the verb visit."
      ),
      {
        id: "a2-6a-family-1",
        type: "gap-fill",
        prompt: "Complete the family description with object pronouns.",
        parts: [
          "Clara is my cousin. I see ",
          { gapId: "g1" },
          " every weekend. She often visits ",
          { gapId: "g2" },
          " at home. Her young son usually comes with ",
          { gapId: "g3" },
          ", and we take ",
          { gapId: "g4" },
          " to the playground.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["her"], feedback: "Use her for Clara after see." },
          { id: "g2", acceptedAnswers: ["us"], feedback: "Use us for the speaker's household after visits." },
          { id: "g3", acceptedAnswers: ["her"], feedback: "Use her for Clara after with." },
          { id: "g4", acceptedAnswers: ["him"], feedback: "Use him for Clara's son after take." },
        ],
      },
      {
        id: "a2-6a-office-message-1",
        type: "gap-fill",
        prompt: "Complete the message with object pronouns.",
        parts: [
          "I need to speak to Ana. Can you call ",
          { gapId: "g1" },
          "? I sent ",
          { gapId: "g2" },
          " a message, but she didn't answer ",
          { gapId: "g3" },
          ". Her colleagues are with ",
          { gapId: "g4" },
          ", so you can ask ",
          { gapId: "g5" },
          " too.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["her"], feedback: "Use her for Ana after call." },
          { id: "g2", acceptedAnswers: ["her"], feedback: "Use her for Ana after sent." },
          { id: "g3", acceptedAnswers: ["it"], feedback: "Use it for the singular noun message." },
          { id: "g4", acceptedAnswers: ["her"], feedback: "Use her for Ana after with." },
          { id: "g5", acceptedAnswers: ["them"], feedback: "Use them for Ana's colleagues after ask." },
        ],
      },
    ],
  },
  {
    id: "a2-6b-like-verb-ing",
    title: "6B · Like + Verb-ing",
    shortDescription: "Use verb-ing after like, love, don't mind, hate, enjoy, and prefer.",
    levels: ["a2"],
    intro:
      "Follow preference verbs with an -ing form and apply the common spelling changes when adding -ing.",
    items: [
      multipleChoiceItem(
        "a2-6b-mc-1",
        "Choose the correct verb form.",
        "I love ____ for friends at the weekend.",
        ["cooking", "cook", "to cooking"],
        0,
        "Use the -ing form cooking after love."
      ),
      multipleChoiceItem(
        "a2-6b-mc-2",
        "Choose the correct verb form.",
        "Lara hates ____ early on cold mornings.",
        ["get", "getting", "to getting"],
        1,
        "Use getting after hates and double the final consonant in get."
      ),
      multipleChoiceItem(
        "a2-6b-mc-3",
        "Choose the correct verb form.",
        "I don't mind ____ for ten minutes.",
        ["wait", "to wait", "waiting"],
        2,
        "Use the -ing form waiting after don't mind."
      ),
      multipleChoiceItem(
        "a2-6b-mc-4",
        "Choose the correct spelling.",
        "My children enjoy ____ in the outdoor pool.",
        ["swimming", "swiming", "swimmming"],
        0,
        "Double the final consonant in swim before adding -ing."
      ),
      multipleChoiceItem(
        "a2-6b-mc-5",
        "Choose the correct spelling.",
        "We like ____ to live music.",
        ["danceing", "dance", "dancing"],
        2,
        "Drop the final e in dance before adding -ing."
      ),
      multipleChoiceItem(
        "a2-6b-mc-6",
        "Choose the correct verb form.",
        "They enjoy ____ near the lake in summer.",
        ["camp", "camping", "to camp"],
        1,
        "Use the -ing form camping after enjoy."
      ),
      multipleChoiceItem(
        "a2-6b-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["He prefers cycling to work.", "He prefers cycle to work.", "He prefers to cycling to work."],
        0,
        "Use the -ing form cycling after prefers."
      ),
      placeholderGapItem(
        "a2-6b-gf-1",
        "Complete the sentence with the verb in brackets.",
        "We like __________ travel blogs before a holiday. (read)",
        "reading",
        [],
        "Add -ing to read after like."
      ),
      placeholderGapItem(
        "a2-6b-gf-2",
        "Complete the sentence with the verb in brackets.",
        "Maya hates __________ in city traffic. (drive)",
        "driving",
        [],
        "Drop the final e in drive before adding -ing."
      ),
      placeholderGapItem(
        "a2-6b-gf-3",
        "Complete the sentence with the verb in brackets.",
        "My brother loves __________ for old records. (shop)",
        "shopping",
        [],
        "Double the final consonant in shop before adding -ing."
      ),
      placeholderChoiceGapItem(
        "a2-6b-cg-1",
        "Choose the correct -ing form for each gap.",
        "I love ____ rooms, but I don't mind ____ up afterwards. My sister enjoys ____ small decorations.",
        ["painting", "cleaning", "making"],
        "Use an -ing form after love, don't mind, and enjoy.",
        ["paint", "painting", "clean", "cleaning", "make", "making"]
      ),
      errorCorrectionItem(
        "a2-6b-ec-1",
        "Check the highlighted phrase.",
        "Sam enjoys to cook for large groups.",
        "enjoys to cook",
        false,
        "enjoys cooking",
        "Use verb-ing after enjoy."
      ),
      errorCorrectionItem(
        "a2-6b-ec-2",
        "Check the highlighted phrase.",
        "We don't mind to wait outside.",
        "don't mind to wait",
        false,
        "don't mind waiting",
        "Use verb-ing after don't mind."
      ),
      errorCorrectionItem(
        "a2-6b-ec-3",
        "Check the highlighted phrase.",
        "I prefer walking when the weather is good.",
        "prefer walking",
        true,
        "",
        "Correct! Use the -ing form walking after prefer."
      ),
      wordOrderItem(
        "a2-6b-wo-1",
        "Put the words in the correct order.",
        ["photos", "taking", "I", "love"],
        "I love taking photos.",
        "Put the -ing form taking after love."
      ),
      wordOrderItem(
        "a2-6b-wo-2",
        "Put the words in the correct order.",
        ["early", "like", "They", "getting", "don't", "up"],
        "They don't like getting up early.",
        "Use getting after don't like."
      ),
      {
        id: "a2-6b-hobbies-1",
        type: "gap-fill",
        prompt: "Complete the description with the -ing forms of the verbs in brackets.",
        parts: [
          "Jon loves ",
          { gapId: "g1" },
          " chess online. (play) He enjoys ",
          { gapId: "g2" },
          " new players. (meet) However, he doesn't like ",
          { gapId: "g3" },
          ". (lose) He prefers ",
          { gapId: "g4" },
          " face to face. (play)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["playing"], feedback: "Use playing after loves." },
          { id: "g2", acceptedAnswers: ["meeting"], feedback: "Use meeting after enjoys." },
          { id: "g3", acceptedAnswers: ["losing"], feedback: "Drop the final e in lose before adding -ing." },
          { id: "g4", acceptedAnswers: ["playing"], feedback: "Use playing after prefers." },
        ],
      },
      {
        id: "a2-6b-food-conversation-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the -ing forms of the verbs in brackets.",
        parts: [
          "A: Do you like ",
          { gapId: "g1" },
          "? (cook)\nB: I don't mind ",
          { gapId: "g2" },
          ". (cook) However, I hate ",
          { gapId: "g3" },
          " the dishes. (wash) I prefer ",
          { gapId: "g4" },
          " out. (eat)\nA: I love ",
          { gapId: "g5" },
          " new restaurants. (try)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["cooking"], feedback: "Use cooking after like." },
          { id: "g2", acceptedAnswers: ["cooking"], feedback: "Use cooking after don't mind." },
          { id: "g3", acceptedAnswers: ["washing"], feedback: "Use washing after hate." },
          { id: "g4", acceptedAnswers: ["eating"], feedback: "Use eating after prefer." },
          { id: "g5", acceptedAnswers: ["trying"], feedback: "Add -ing to try: trying." },
        ],
      },
    ],
  },
  {
    id: "a2-6c-be-or-do",
    title: "6C · Be or Do?",
    shortDescription: "Choose be or do in statements, negatives, and questions.",
    levels: ["a2"],
    intro:
      "Use be as a main verb or to form the present continuous, and use do or does to form present-simple questions and negatives with other verbs.",
    items: [
      multipleChoiceItem(
        "a2-6c-mc-1",
        "Choose the correct verb.",
        "____ you tired after the journey?",
        ["Do", "Are", "Is"],
        1,
        "Use are before you with the adjective tired."
      ),
      multipleChoiceItem(
        "a2-6c-mc-2",
        "Choose the correct auxiliary.",
        "____ Sara work at the health centre?",
        ["Is", "Do", "Does"],
        2,
        "Use does to form a present-simple question about Sara."
      ),
      multipleChoiceItem(
        "a2-6c-mc-3",
        "Choose the correct auxiliary.",
        "____ Theo studying for his exam now?",
        ["Is", "Does", "Do"],
        0,
        "Use is to form the present continuous is studying."
      ),
      multipleChoiceItem(
        "a2-6c-mc-4",
        "Choose the correct auxiliary.",
        "Why ____ you carry two phones?",
        ["are", "do", "does"],
        1,
        "Use do to form a present-simple question with the main verb carry."
      ),
      multipleChoiceItem(
        "a2-6c-mc-5",
        "Choose the correct negative form.",
        "The new receptionist ____ very friendly. She never says hello.",
        ["isn't", "doesn't", "not"],
        0,
        "Use isn't because friendly follows the verb be."
      ),
      multipleChoiceItem(
        "a2-6c-mc-6",
        "Choose the correct negative form.",
        "Nico ____ like jazz.",
        ["isn't", "not", "doesn't"],
        2,
        "Use doesn't + the base verb like."
      ),
      multipleChoiceItem(
        "a2-6c-mc-7",
        "Choose the correct question.",
        "Ask whether the shop is open today.",
        ["Does the shop is open today?", "Is the shop open today?", "Do the shop open today?"],
        1,
        "Open is an adjective here, so put is before the subject."
      ),
      placeholderGapItem(
        "a2-6c-gf-1",
        "Complete the question with the correct form of be.",
        "__________ they ready to begin?",
        "Are",
        [],
        "Put Are before the plural subject they."
      ),
      doubleGap(
        "a2-6c-gf-2",
        "Complete the present-simple question. Use the verb in brackets.",
        ["Where ", { gapId: "g1" }, " your manager ", { gapId: "g2" }, "? (work)"],
        ["does"],
        ["work"],
        "Use does before the subject and the base verb work after it."
      ),
      doubleGap(
        "a2-6c-gf-3",
        "Complete the present-continuous question. Use the verb in brackets.",
        ["What ", { gapId: "g1" }, " you ", { gapId: "g2" }, "? (do)"],
        ["are"],
        ["doing"],
        "Use are + subject + doing for an action happening now."
      ),
      placeholderChoiceGapItem(
        "a2-6c-cg-1",
        "Choose the correct form of be or do for each gap.",
        "Why ____ the room cold? ____ you know? The heater ____ working, and it ____ make any sound.",
        ["is", "Do", "isn't", "doesn't"],
        "Use be with an adjective or verb-ing, and do or does with a present-simple main verb.",
        ["is", "are", "do", "Do", "does", "isn't", "aren't", "don't", "doesn't"]
      ),
      errorCorrectionItem(
        "a2-6c-ec-1",
        "Check the highlighted phrase.",
        "Do you hungry after the walk?",
        "Do you hungry",
        false,
        "Are you hungry",
        "Use be before an adjective: Are you hungry?"
      ),
      errorCorrectionItem(
        "a2-6c-ec-2",
        "Check the highlighted phrase.",
        "Is Leo work in this building?",
        "Is Leo work",
        false,
        "Does Leo work",
        "Use does with the main verb work."
      ),
      errorCorrectionItem(
        "a2-6c-ec-3",
        "Check the highlighted phrase.",
        "She doesn't doing her homework now.",
        "doesn't doing",
        false,
        ["isn't doing", "is not doing"],
        "Use isn't + doing for a negative present-continuous sentence."
      ),
      errorCorrectionItem(
        "a2-6c-ec-4",
        "Check the highlighted question.",
        "Are they waiting near the main entrance?",
        "Are they waiting",
        true,
        "",
        "Correct! Use are to form a present-continuous question."
      ),
      wordOrderItem(
        "a2-6c-wo-1",
        "Put the words in the correct order.",
        ["your", "does", "do", "brother", "What"],
        "What does your brother do?",
        "Use question word + does + subject + base verb do."
      ),
      {
        id: "a2-6c-new-colleague-1",
        type: "gap-fill",
        prompt: "Complete the conversation with forms of be or do.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you new here?\nB: Yes, I ",
          { gapId: "g2" },
          ".\nA: Where ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          "? (work)\nB: At the clinic across the road.\nA: ",
          { gapId: "g5" },
          " you ",
          { gapId: "g6" },
          " today? (work)\nB: No, I'm not.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Are"], feedback: "Use Are before you with the adjective new." },
          { id: "g2", acceptedAnswers: ["am"], feedback: "Use am in the positive short answer." },
          { id: "g3", acceptedAnswers: ["do"], feedback: "Use do for the present-simple question." },
          { id: "g4", acceptedAnswers: ["work"], feedback: "Use the base verb work after the subject." },
          { id: "g5", acceptedAnswers: ["Are"], feedback: "Use Are for the present-continuous question." },
          { id: "g6", acceptedAnswers: ["working"], feedback: "Use working after the subject." },
        ],
      },
      {
        id: "a2-6c-presentation-1",
        type: "gap-fill",
        prompt: "Complete the description with forms of be or do.",
        parts: [
          "Lena ",
          { gapId: "g1" },
          " usually calm, but today she ",
          { gapId: "g2" },
          " feeling nervous. She ",
          { gapId: "g3" },
          " usually give presentations. ",
          { gapId: "g4" },
          " she need help? No, she ",
          { gapId: "g5" },
          ". Her manager ",
          { gapId: "g6" },
          " waiting outside.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["is", "'s"], feedback: "Use is with the adjective calm." },
          { id: "g2", acceptedAnswers: ["is", "'s"], feedback: "Use is to form is feeling." },
          { id: "g3", acceptedAnswers: ["doesn't", "does not"], feedback: "Use doesn't + give for the present-simple negative." },
          { id: "g4", acceptedAnswers: ["Does"], feedback: "Use Does to ask the present-simple question." },
          { id: "g5", acceptedAnswers: ["doesn't", "does not"], feedback: "Use doesn't in the negative short answer." },
          { id: "g6", acceptedAnswers: ["is", "'s"], feedback: "Use is to form is waiting." },
        ],
      },
    ],
  },
  {
    id: "a2-7a-past-simple-be",
    title: "7A · Past Simple of Be: Was and Were",
    shortDescription: "Use was, were, wasn't, and weren't in past statements and questions.",
    levels: ["a2"],
    intro:
      "Use was with I, he, she, and it; use were with you, we, and they; and invert the subject and verb in questions.",
    items: [
      multipleChoiceItem(
        "a2-7a-mc-1",
        "Choose the correct past form of be.",
        "The exhibition ____ very popular last month.",
        ["was", "were", "is"],
        0,
        "Use was with the singular subject exhibition."
      ),
      multipleChoiceItem(
        "a2-7a-mc-2",
        "Choose the correct past form of be.",
        "My grandparents ____ both teachers.",
        ["was", "are", "were"],
        2,
        "Use were with the plural subject grandparents."
      ),
      multipleChoiceItem(
        "a2-7a-mc-3",
        "Choose the correct negative form.",
        "Rosa ____ at the meeting yesterday.",
        ["weren't", "wasn't", "didn't be"],
        1,
        "Use wasn't with the singular subject Rosa."
      ),
      multipleChoiceItem(
        "a2-7a-mc-4",
        "Choose the correct question form.",
        "____ the museum busy on Saturday?",
        ["Was", "Did", "Were"],
        0,
        "Put Was before the singular subject museum."
      ),
      multipleChoiceItem(
        "a2-7a-mc-5",
        "Choose the best short answer.",
        "Were the offices open yesterday?",
        ["No, they wasn't.", "No, they weren't.", "No, they didn't."],
        1,
        "Use weren't in the negative short answer to a were question."
      ),
      multipleChoiceItem(
        "a2-7a-mc-6",
        "Choose the correct past form.",
        "My parents ____ in different countries.",
        ["was born", "born were", "were born"],
        2,
        "Use were born with the plural subject parents."
      ),
      multipleChoiceItem(
        "a2-7a-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["I was at home last night.", "I were at home last night.", "I did be at home last night."],
        0,
        "Use was with I in the past."
      ),
      placeholderGapItem(
        "a2-7a-gf-1",
        "Complete the sentence with the past form of be.",
        "Mina __________ ill yesterday morning. (be)",
        "was",
        [],
        "Use was with Mina."
      ),
      placeholderGapItem(
        "a2-7a-gf-2",
        "Complete the negative sentence with the past form of be.",
        "The shops __________ open last Sunday. (not be)",
        "weren't",
        ["were not"],
        "Use weren't or were not with the plural subject shops."
      ),
      {
        id: "a2-7a-question-1",
        type: "gap-fill",
        prompt: "Complete the question and short answer with past forms of be.",
        parts: [
          { gapId: "g1" },
          " you at the concert? Yes, I ",
          { gapId: "g2" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Were"], feedback: "Begin the question with Were." },
          { id: "g2", acceptedAnswers: ["was"], feedback: "Use was in the positive short answer with I." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-7a-cg-1",
        "Choose was, were, wasn't, or weren't for each gap.",
        "The café ____ quiet. The tables ____ clean. (not be) The staff ____ busy, and the manager ____ there. (not be)",
        ["was", "weren't", "were", "wasn't"],
        "Match the form to the subject and use the negative cue for the final gap.",
        ["was", "were", "wasn't", "weren't"]
      ),
      errorCorrectionItem(
        "a2-7a-ec-1",
        "Check the highlighted phrase.",
        "We was near the station at six.",
        "We was",
        false,
        "We were",
        "Use were with we."
      ),
      errorCorrectionItem(
        "a2-7a-ec-2",
        "Check the highlighted phrase.",
        "Was they at school yesterday?",
        "Was they",
        false,
        "Were they",
        "Use Were before the plural subject they."
      ),
      errorCorrectionItem(
        "a2-7a-ec-3",
        "Check the highlighted phrase.",
        "The weather wasn't cold last weekend.",
        "wasn't cold",
        true,
        "",
        "Correct! Use wasn't with the singular subject weather."
      ),
      wordOrderItem(
        "a2-7a-wo-1",
        "Put the words in the correct order.",
        ["your", "Where", "keys", "were"],
        "Where were your keys?",
        "Put were before the subject in a question."
      ),
      wordOrderItem(
        "a2-7a-wo-2",
        "Put the words in the correct order.",
        ["home", "They", "night", "weren't", "last", "at"],
        "They weren't at home last night.",
        "Use weren't with they and put the time expression at the end."
      ),
      {
        id: "a2-7a-museum-1",
        type: "gap-fill",
        prompt: "Complete the description with past forms of be.",
        parts: [
          "The science museum ",
          { gapId: "g1" },
          " crowded yesterday. The main rooms ",
          { gapId: "g2" },
          " very warm, but the café ",
          { gapId: "g3" },
          " open. (not be) We ",
          { gapId: "g4" },
          " tired at the end of the visit.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["was"], feedback: "Use was with the singular subject museum." },
          { id: "g2", acceptedAnswers: ["were"], feedback: "Use were with the plural subject rooms." },
          { id: "g3", acceptedAnswers: ["wasn't", "was not"], feedback: "Use wasn't with the singular subject café." },
          { id: "g4", acceptedAnswers: ["were"], feedback: "Use were with we." },
        ],
      },
      {
        id: "a2-7a-evening-1",
        type: "gap-fill",
        prompt: "Complete the conversation with past forms of be.",
        parts: [
          "A: Where ",
          { gapId: "g1" },
          " you last night?\nB: I ",
          { gapId: "g2" },
          " at the office.\nA: ",
          { gapId: "g3" },
          " your colleagues there too?\nB: No, they ",
          { gapId: "g4" },
          ". The building ",
          { gapId: "g5" },
          " very quiet.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["were"], feedback: "Use were before you." },
          { id: "g2", acceptedAnswers: ["was"], feedback: "Use was with I." },
          { id: "g3", acceptedAnswers: ["Were"], feedback: "Begin the question about the plural subject colleagues with Were." },
          { id: "g4", acceptedAnswers: ["weren't", "were not"], feedback: "Use weren't in the negative short answer." },
          { id: "g5", acceptedAnswers: ["was"], feedback: "Use was with the singular subject building." },
        ],
      },
    ],
  },
  {
    id: "a2-7b-past-simple-regular-verbs",
    title: "7B · Past Simple: Regular Verbs",
    shortDescription: "Use regular past forms and make past questions and negatives with did.",
    levels: ["a2"],
    intro:
      "Form regular past verbs with -ed or -d, apply the spelling rules, and use did or didn't with the base verb in questions and negatives.",
    items: [
      multipleChoiceItem(
        "a2-7b-mc-1",
        "Choose the correct past form.",
        "The new bakery ____ last Thursday.",
        ["open", "opened", "openned"],
        1,
        "Add -ed to open: opened."
      ),
      multipleChoiceItem(
        "a2-7b-mc-2",
        "Choose the correct past spelling.",
        "Nadia ____ design at university.",
        ["studied", "studyed", "studyd"],
        0,
        "Change consonant + y to -ied: studied."
      ),
      multipleChoiceItem(
        "a2-7b-mc-3",
        "Choose the correct past spelling.",
        "The driver ____ beside the entrance.",
        ["stoped", "stopied", "stopped"],
        2,
        "Double the final consonant in stop before adding -ed."
      ),
      multipleChoiceItem(
        "a2-7b-mc-4",
        "Choose the correct negative form.",
        "I ____ the supplier yesterday. (not call)",
        ["don't called", "didn't call", "didn't called"],
        1,
        "Use didn't + the base verb call."
      ),
      multipleChoiceItem(
        "a2-7b-mc-5",
        "Choose the correct question form.",
        "____ the parcel arrive this morning?",
        ["Was", "Does", "Did"],
        2,
        "Use Did + subject + base verb arrive."
      ),
      multipleChoiceItem(
        "a2-7b-mc-6",
        "Choose the best short answer.",
        "Did the class finish on time?",
        ["Yes, it did.", "Yes, it finished.", "Yes, it was."],
        0,
        "Use did in the positive short answer."
      ),
      multipleChoiceItem(
        "a2-7b-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["She didn't finished the report.", "She didn't finish the report.", "She not finish the report."],
        1,
        "Use didn't + the base verb finish."
      ),
      placeholderGapItem(
        "a2-7b-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "We __________ the apartment before the guests arrived. (clean)",
        "cleaned",
        [],
        "Add -ed to clean."
      ),
      placeholderGapItem(
        "a2-7b-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "Maya __________ the report yesterday. (not finish)",
        "didn't finish",
        ["did not finish"],
        "Use didn't + the base verb finish."
      ),
      doubleGap(
        "a2-7b-gf-3",
        "Complete the question. Use the verb in brackets.",
        [
          { gapId: "g1" },
          " the company ",
          { gapId: "g2" },
          " its logo last year? (change)",
        ],
        ["Did"],
        ["change"],
        "Use Did + subject + the base verb change."
      ),
      placeholderChoiceGapItem(
        "a2-7b-cg-1",
        "Choose the correct regular past form for each gap.",
        "The course ____ in April. We ____ every evening, but we ____ on Fridays. (not study)",
        ["started", "practised", "didn't study"],
        "Use regular past forms in positive sentences and didn't + base verb for the negative cue.",
        ["start", "started", "practice", "practised", "practising", "didn't study", "did not study", "didn't studied"]
      ),
      errorCorrectionItem(
        "a2-7b-ec-1",
        "Check the highlighted verb.",
        "The bus stoped outside the hotel.",
        "stoped",
        false,
        "stopped",
        "Double the final consonant in stop before adding -ed."
      ),
      errorCorrectionItem(
        "a2-7b-ec-2",
        "Check the highlighted phrase.",
        "We didn't arrived until midnight.",
        "didn't arrived",
        false,
        ["didn't arrive", "did not arrive"],
        "After didn't, use the base verb arrive."
      ),
      errorCorrectionItem(
        "a2-7b-ec-3",
        "Check the highlighted phrase.",
        "The shop closed early last Monday.",
        "closed early",
        true,
        "",
        "Correct! Closed is the regular past form of close."
      ),
      wordOrderItem(
        "a2-7b-wo-1",
        "Put the words in the correct order.",
        ["visited", "yesterday", "We", "castle", "the"],
        "We visited the castle yesterday.",
        "Use the regular past form visited and put the time expression at the end."
      ),
      wordOrderItem(
        "a2-7b-wo-2",
        "Put the words in the correct order.",
        ["phone", "Did", "morning", "she", "this"],
        "Did she phone this morning?",
        "Put Did before the subject and use the base verb phone."
      ),
      {
        id: "a2-7b-saturday-1",
        type: "gap-fill",
        prompt: "Complete the description with the verbs in brackets.",
        parts: [
          "Last Saturday, Maya ",
          { gapId: "g1" },
          " to the old market. (walk) She ",
          { gapId: "g2" },
          " several craft stalls. (visit) She ",
          { gapId: "g3" },
          " very long. (not stay) Then she ",
          { gapId: "g4" },
          " home. (cycle)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["walked"], feedback: "Add -ed to walk." },
          { id: "g2", acceptedAnswers: ["visited"], feedback: "Add -ed to visit." },
          { id: "g3", acceptedAnswers: ["didn't stay", "did not stay"], feedback: "Use didn't + the base verb stay." },
          { id: "g4", acceptedAnswers: ["cycled"], feedback: "Add -d to cycle." },
        ],
      },
      {
        id: "a2-7b-workshop-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the verbs in brackets.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " the workshop? (enjoy)\nB: Yes, I ",
          { gapId: "g3" },
          ".\nA: What time ",
          { gapId: "g4" },
          " it ",
          { gapId: "g5" },
          "? (finish)\nB: At half past four.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Did"], feedback: "Begin the question with Did." },
          { id: "g2", acceptedAnswers: ["enjoy"], feedback: "Use the base verb enjoy after the subject." },
          { id: "g3", acceptedAnswers: ["did"], feedback: "Use did in the positive short answer." },
          { id: "g4", acceptedAnswers: ["did"], feedback: "Use did before the subject it." },
          { id: "g5", acceptedAnswers: ["finish"], feedback: "Use the base verb finish after the subject." },
        ],
      },
    ],
  },
  {
    id: "a2-7c-past-simple-irregular-verbs",
    title: "7C · Past Simple: Irregular Verbs",
    shortDescription: "Use common irregular past forms and make questions and negatives with did.",
    levels: ["a2"],
    intro:
      "Learn common irregular past forms, use only the base verb after did or didn't, and use could as the past form of can.",
    items: [
      multipleChoiceItem(
        "a2-7c-mc-1",
        "Choose the correct irregular past form.",
        "We ____ to the coast for the weekend.",
        ["goed", "go", "went"],
        2,
        "The irregular past form of go is went."
      ),
      multipleChoiceItem(
        "a2-7c-mc-2",
        "Choose the correct irregular past form.",
        "Nora ____ a headache after lunch.",
        ["haved", "had", "has"],
        1,
        "The irregular past form of have is had."
      ),
      multipleChoiceItem(
        "a2-7c-mc-3",
        "Choose the correct irregular past form.",
        "I ____ this jacket in the January sale.",
        ["bought", "buyed", "buy"],
        0,
        "The irregular past form of buy is bought."
      ),
      multipleChoiceItem(
        "a2-7c-mc-4",
        "Choose the correct negative form.",
        "Leo ____ his umbrella this morning. (not take)",
        ["didn't took", "not take", "didn't take"],
        2,
        "Use didn't + the base verb take."
      ),
      multipleChoiceItem(
        "a2-7c-mc-5",
        "Choose the correct question form.",
        "____ you see the message on the door?",
        ["Did", "Were", "Do"],
        0,
        "Use Did + subject + the base verb see."
      ),
      multipleChoiceItem(
        "a2-7c-mc-6",
        "Choose the correct past form.",
        "When she was five, Lina ____ read simple stories.",
        ["can", "could", "did can"],
        1,
        "Could is the past form of can."
      ),
      multipleChoiceItem(
        "a2-7c-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["They didn't came by train.", "They not come by train.", "They didn't come by train."],
        2,
        "Use didn't + the base verb come."
      ),
      placeholderGapItem(
        "a2-7c-gf-1",
        "Complete the sentence with the past form of the verb in brackets.",
        "I __________ my missing card under the sofa. (find)",
        "found",
        [],
        "The irregular past form of find is found."
      ),
      placeholderGapItem(
        "a2-7c-gf-2",
        "Complete the negative sentence with the verb in brackets.",
        "We __________ breakfast before the early train. (not have)",
        "didn't have",
        ["did not have"],
        "Use didn't + the base verb have."
      ),
      doubleGap(
        "a2-7c-gf-3",
        "Complete the question. Use the verb in brackets.",
        [
          { gapId: "g1" },
          " Nina ",
          { gapId: "g2" },
          " the tickets online? (buy)",
        ],
        ["Did"],
        ["buy"],
        "Use Did + subject + the base verb buy."
      ),
      placeholderChoiceGapItem(
        "a2-7c-cg-1",
        "Choose the correct irregular past form for each gap.",
        "We ____ home early, and I ____ goodbye to everyone. From the hill, we ____ see the lights across the town.",
        ["went", "said", "could"],
        "Choose the irregular past form that fits each meaning.",
        ["go", "went", "say", "said", "can", "could"]
      ),
      errorCorrectionItem(
        "a2-7c-ec-1",
        "Check the highlighted phrase.",
        "The children didn't went outside.",
        "didn't went",
        false,
        ["didn't go", "did not go"],
        "After didn't, use the base verb go."
      ),
      errorCorrectionItem(
        "a2-7c-ec-2",
        "Check the highlighted phrase.",
        "Did you bought anything at the market?",
        "Did you bought",
        false,
        "Did you buy",
        "After did and the subject, use the base verb buy."
      ),
      errorCorrectionItem(
        "a2-7c-ec-3",
        "Check the highlighted phrase.",
        "I couldn't to see the number from the road.",
        "couldn't to see",
        false,
        ["couldn't see", "could not see"],
        "Use could or couldn't directly before the base verb without to."
      ),
      wordOrderItem(
        "a2-7c-wo-1",
        "Put the words in the correct order.",
        ["they", "Where", "go", "did"],
        "Where did they go?",
        "Use question word + did + subject + base verb."
      ),
      wordOrderItem(
        "a2-7c-wo-2",
        "Put the words in the correct order.",
        ["coat", "red", "She", "a", "wore"],
        "She wore a red coat.",
        "Wore is the irregular past form of wear."
      ),
      {
        id: "a2-7c-day-trip-1",
        type: "gap-fill",
        prompt: "Complete the story with the verbs in brackets.",
        parts: [
          "We ",
          { gapId: "g1" },
          " an early bus to the lake. (take) Then we ",
          { gapId: "g2" },
          " up a narrow path. (go) At the top, I ",
          { gapId: "g3" },
          " an old coin. (find) My friend ",
          { gapId: "g4" },
          " it was probably modern. (say)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["took"], feedback: "The irregular past form of take is took." },
          { id: "g2", acceptedAnswers: ["went"], feedback: "The irregular past form of go is went." },
          { id: "g3", acceptedAnswers: ["found"], feedback: "The irregular past form of find is found." },
          { id: "g4", acceptedAnswers: ["said"], feedback: "The irregular past form of say is said." },
        ],
      },
      {
        id: "a2-7c-visitor-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the verbs in brackets. Use can in the past where needed.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " Eva yesterday? (see)\nB: Yes. She ",
          { gapId: "g3" },
          " to the office at lunchtime. (come)\nA: ",
          { gapId: "g4" },
          " she stay long?\nB: No. She ",
          { gapId: "g5" },
          " stay because she had another appointment. (not stay)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Did"], feedback: "Begin the question with Did." },
          { id: "g2", acceptedAnswers: ["see"], feedback: "Use the base verb see after the subject." },
          { id: "g3", acceptedAnswers: ["came"], feedback: "The irregular past form of come is came." },
          { id: "g4", acceptedAnswers: ["Did"], feedback: "Begin the second question with Did." },
          { id: "g5", acceptedAnswers: ["couldn't", "could not"], feedback: "Use couldn't as the negative past form of can." },
        ],
      },
    ],
  },
  {
    id: "a2-8a-past-simple-mixed-review",
    title: "8A · Past Simple: Regular and Irregular Forms",
    shortDescription: "Review past be, could, and regular and irregular past verbs together.",
    levels: ["a2"],
    intro:
      "Choose the correct past form for be, can, regular verbs, and irregular verbs, and use did or didn't with the base verb.",
    items: [
      multipleChoiceItem(
        "a2-8a-mc-1",
        "Choose the correct past form.",
        "I ____ very nervous before the interview.",
        ["was", "were", "did be"],
        0,
        "Use was with I in the past."
      ),
      multipleChoiceItem(
        "a2-8a-mc-2",
        "Choose the correct past form.",
        "The last coach ____ at eleven.",
        ["leaved", "left", "leave"],
        1,
        "The irregular past form of leave is left."
      ),
      multipleChoiceItem(
        "a2-8a-mc-3",
        "Choose the correct negative form.",
        "We ____ the sign in the dark. (not see)",
        ["didn't saw", "weren't see", "didn't see"],
        2,
        "Use didn't + the base verb see."
      ),
      multipleChoiceItem(
        "a2-8a-mc-4",
        "Choose the correct past form.",
        "At six years old, Mei ____ already play the piano.",
        ["could", "can", "did can"],
        0,
        "Could is the past form of can."
      ),
      multipleChoiceItem(
        "a2-8a-mc-5",
        "Choose the correct question form.",
        "____ they book the room online?",
        ["Were", "Was", "Did"],
        2,
        "Use Did + subject + the base verb book."
      ),
      multipleChoiceItem(
        "a2-8a-mc-6",
        "Choose the correct question form.",
        "Where ____ your first office?",
        ["were", "was", "did"],
        1,
        "Use was before the singular subject office."
      ),
      multipleChoiceItem(
        "a2-8a-mc-7",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["Nora didn't take a taxi.", "Nora didn't took a taxi.", "Nora not take a taxi."],
        0,
        "Use didn't + the base verb take."
      ),
      placeholderGapItem(
        "a2-8a-gf-1",
        "Complete the sentence with the past form in brackets.",
        "Elena __________ in a small town near Granada. (be born)",
        "was born",
        [],
        "Use was born with the singular subject Elena."
      ),
      placeholderChoiceGapItem(
        "a2-8a-cg-1",
        "Choose the correct past form for each gap.",
        "We ____ at the hotel before lunch. Then we ____ a bus into town. The shops ____ open. (not be)",
        ["arrived", "took", "weren't"],
        "Use the regular past arrived, the irregular past took, and weren't for the negative plural form of be.",
        ["arrive", "arrived", "take", "took", "wasn't", "weren't", "didn't be"]
      ),
      doubleGap(
        "a2-8a-gf-2",
        "Complete the question. Use the verb in brackets.",
        ["What time ", { gapId: "g1" }, " you ", { gapId: "g2" }, " the train? (take)"],
        ["did"],
        ["take"],
        "Use did before the subject and the base verb take after it."
      ),
      placeholderGapItem(
        "a2-8a-gf-3",
        "Complete the negative sentence with the past form of can.",
        "The path was too dark, so we __________ the signs. (not read)",
        "couldn't read",
        ["could not read"],
        "Use couldn't + the base verb read."
      ),
      errorCorrectionItem(
        "a2-8a-ec-1",
        "Check the highlighted phrase.",
        "My grandparents were born in the same village.",
        "were born",
        true,
        "",
        "Correct! Use were born with the plural subject grandparents."
      ),
      errorCorrectionItem(
        "a2-8a-ec-2",
        "Check the highlighted phrase.",
        "I didn't saw the final part of the film.",
        "didn't saw",
        false,
        ["didn't see", "did not see"],
        "After didn't, use the base verb see."
      ),
      errorCorrectionItem(
        "a2-8a-ec-3",
        "Check the highlighted phrase.",
        "Ravi couldn't to hear the guide.",
        "couldn't to hear",
        false,
        ["couldn't hear", "could not hear"],
        "Use couldn't directly before the base verb hear."
      ),
      wordOrderItem(
        "a2-8a-wo-1",
        "Put the words in the correct order.",
        ["yesterday", "Where", "you", "were"],
        "Where were you yesterday?",
        "Put were before the subject in a question with be."
      ),
      wordOrderItem(
        "a2-8a-wo-2",
        "Put the words in the correct order.",
        ["concert", "Did", "enjoy", "they", "the"],
        "Did they enjoy the concert?",
        "Put Did before the subject and use the base verb enjoy."
      ),
      {
        id: "a2-8a-city-break-1",
        type: "gap-fill",
        prompt: "Complete the description with the verbs in brackets.",
        parts: [
          "Last month, we ",
          { gapId: "g1" },
          " in Glasgow. (be) We ",
          { gapId: "g2" },
          " near the river (stay) and ",
          { gapId: "g3" },
          " several museums. (see) We ",
          { gapId: "g4" },
          " the castle because it was closed. (not visit) However, we ",
          { gapId: "g5" },
          " walk everywhere. (can)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["were"], feedback: "Use were with we." },
          { id: "g2", acceptedAnswers: ["stayed"], feedback: "Add -ed to stay." },
          { id: "g3", acceptedAnswers: ["saw"], feedback: "The irregular past form of see is saw." },
          { id: "g4", acceptedAnswers: ["didn't visit", "did not visit"], feedback: "Use didn't + the base verb visit." },
          { id: "g5", acceptedAnswers: ["could"], feedback: "Use could as the past form of can." },
        ],
      },
      {
        id: "a2-8a-career-1",
        type: "gap-fill",
        prompt: "Complete the short biography with the verbs in brackets.",
        parts: [
          "Amira ",
          { gapId: "g1" },
          " in 1998. (be born) She ",
          { gapId: "g2" },
          " design at college. (study) She ",
          { gapId: "g3" },
          " her first job in a small studio. (get) However, she ",
          { gapId: "g4" },
          " there long. (not stay) She ",
          { gapId: "g5" },
          " to a larger company in 2022. (go)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["was born"], feedback: "Use was born with Amira." },
          { id: "g2", acceptedAnswers: ["studied"], feedback: "Change consonant + y to -ied: studied." },
          { id: "g3", acceptedAnswers: ["got"], feedback: "The irregular past form of get is got." },
          { id: "g4", acceptedAnswers: ["didn't stay", "did not stay"], feedback: "Use didn't + the base verb stay." },
          { id: "g5", acceptedAnswers: ["went"], feedback: "The irregular past form of go is went." },
        ],
      },
    ],
  },
  {
    id: "a2-8b-there-is-are-some-any",
    title: "8B · There Is, There Are, Some, and Any",
    shortDescription: "Describe what exists with there is or there are and use some or any.",
    levels: ["a2"],
    intro:
      "Use there is with a singular noun, there are with plural nouns, some in positive plural statements, and any in negatives and questions.",
    items: [
      multipleChoiceItem(
        "a2-8b-mc-1",
        "Choose the correct form.",
        "____ a pharmacy opposite the station.",
        ["There are", "There is", "They are"],
        1,
        "Use There is with the singular noun pharmacy."
      ),
      multipleChoiceItem(
        "a2-8b-mc-2",
        "Choose the correct form.",
        "____ three USB ports on this computer.",
        ["There is", "They are", "There are"],
        2,
        "Use There are with the plural noun ports."
      ),
      multipleChoiceItem(
        "a2-8b-mc-3",
        "Choose the correct negative form.",
        "____ a lift in this building. (not be)",
        ["There isn't", "There aren't", "It isn't"],
        0,
        "Use There isn't with the singular noun lift."
      ),
      multipleChoiceItem(
        "a2-8b-mc-4",
        "Choose the correct question form.",
        "____ cafés near the hotel?",
        ["Is there any", "Are there any", "Are there some"],
        1,
        "Use Are there any before a plural noun in a question."
      ),
      multipleChoiceItem(
        "a2-8b-mc-5",
        "Choose some or any.",
        "There are ____ clean glasses in the cupboard.",
        ["some", "any", "a"],
        0,
        "Use some in a positive statement with a plural noun."
      ),
      multipleChoiceItem(
        "a2-8b-mc-6",
        "Choose some or any.",
        "There aren't ____ sockets beside the bed.",
        ["some", "a", "any"],
        2,
        "Use any in a negative statement with a plural noun."
      ),
      multipleChoiceItem(
        "a2-8b-mc-7",
        "Choose the correct words.",
        "There is a parcel at reception. ____ for you.",
        ["There is", "It is", "They are"],
        1,
        "Use It is to refer back to the specific parcel already mentioned."
      ),
      placeholderGapItem(
        "a2-8b-gf-1",
        "Complete the sentence with there is.",
        "__________ a small balcony outside the bedroom.",
        "There is",
        ["There's"],
        "Use There is or There's with the singular noun balcony."
      ),
      placeholderGapItem(
        "a2-8b-gf-2",
        "Complete the negative sentence.",
        "__________ any clean towels in the bathroom. (not be)",
        "There aren't",
        ["There are not"],
        "Use There aren't with the plural noun towels."
      ),
      {
        id: "a2-8b-question-1",
        type: "gap-fill",
        prompt: "Complete the question and short answer.",
        parts: [
          { gapId: "g1" },
          " there a cash machine nearby? Yes, there ",
          { gapId: "g2" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Is"], feedback: "Begin the singular question with Is." },
          { id: "g2", acceptedAnswers: ["is"], feedback: "Use is in the positive short answer." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-8b-cg-1",
        "Choose there is, there are, some, or any for each gap.",
        "____ a desk beside the window. ____ two chairs near it. There are ____ books on the shelf, but there aren't ____ magazines.",
        ["There is", "There are", "some", "any"],
        "Match there is or there are to the noun, use some in the positive statement, and any in the negative statement.",
        ["There is", "There are", "some", "any"]
      ),
      errorCorrectionItem(
        "a2-8b-ec-1",
        "Check the highlighted phrase.",
        "There are a sofa beside the fireplace.",
        "There are a sofa",
        false,
        ["There is a sofa", "There's a sofa"],
        "Use There is with the singular noun sofa."
      ),
      errorCorrectionItem(
        "a2-8b-ec-2",
        "Check the highlighted word.",
        "There are any plants in the lobby.",
        "any",
        false,
        "some",
        "Use some in a positive statement."
      ),
      errorCorrectionItem(
        "a2-8b-ec-3",
        "Check the highlighted phrase.",
        "There isn't a printer in the study.",
        "There isn't",
        true,
        "",
        "Correct! Use There isn't with a singular noun."
      ),
      wordOrderItem(
        "a2-8b-wo-1",
        "Put the words in the correct order.",
        ["bathroom", "Is", "downstairs", "a", "there"],
        "Is there a bathroom downstairs?",
        "Put Is before there in a singular question."
      ),
      wordOrderItem(
        "a2-8b-wo-2",
        "Put the words in the correct order.",
        ["pictures", "wall", "some", "There", "the", "are", "on"],
        "There are some pictures on the wall.",
        "Use There are + some + plural noun."
      ),
      {
        id: "a2-8b-flat-1",
        type: "gap-fill",
        prompt: "Complete the flat description with there is or there are.",
        parts: [
          "In the living room, ",
          { gapId: "g1" },
          " a large sofa and ",
          { gapId: "g2" },
          " some chairs. ",
          { gapId: "g3" },
          " a dining table. (not be) ",
          { gapId: "g4" },
          " any curtains yet. (not be)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["there is", "there's"], feedback: "Use there is because the first item is the singular noun sofa." },
          { id: "g2", acceptedAnswers: ["there are"], feedback: "Use there are with the plural noun chairs." },
          { id: "g3", acceptedAnswers: ["There isn't", "There is not"], feedback: "Use There isn't with the singular noun table." },
          { id: "g4", acceptedAnswers: ["there aren't", "there are not"], feedback: "Use there aren't with the plural noun curtains." },
        ],
      },
      {
        id: "a2-8b-hotel-1",
        type: "gap-fill",
        prompt: "Complete the hotel conversation with there is or there are.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " there a gym?\nB: No, there ",
          { gapId: "g2" },
          ".\nA: ",
          { gapId: "g3" },
          " there any meeting rooms?\nB: Yes, there ",
          { gapId: "g4" },
          ". ",
          { gapId: "g5" },
          " some on the first floor.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Is"], feedback: "Begin the singular question with Is." },
          { id: "g2", acceptedAnswers: ["isn't", "is not"], feedback: "Use isn't in the negative singular short answer." },
          { id: "g3", acceptedAnswers: ["Are"], feedback: "Begin the plural question with Are." },
          { id: "g4", acceptedAnswers: ["are"], feedback: "Use are in the positive plural short answer." },
          { id: "g5", acceptedAnswers: ["There are"], feedback: "Use There are with some meeting rooms." },
        ],
      },
    ],
  },
  {
    id: "a2-8c-there-was-were",
    title: "8C · There Was and There Were",
    shortDescription: "Describe what existed in the past with there was and there were.",
    levels: ["a2"],
    intro:
      "Use there was with a singular noun, there were with plural nouns, and was or were before there in questions.",
    items: [
      multipleChoiceItem(
        "a2-8c-mc-1",
        "Choose the correct past form.",
        "____ a bookshop here twenty years ago.",
        ["There were", "There is", "There was"],
        2,
        "Use There was with the singular noun bookshop."
      ),
      multipleChoiceItem(
        "a2-8c-mc-2",
        "Choose the correct past form.",
        "____ four messages on my phone yesterday morning.",
        ["There were", "There was", "They were"],
        0,
        "Use There were with the plural noun messages."
      ),
      multipleChoiceItem(
        "a2-8c-mc-3",
        "Choose the correct negative form.",
        "____ a key in the envelope. (not be)",
        ["There weren't", "There wasn't", "It wasn't"],
        1,
        "Use There wasn't with the singular noun key."
      ),
      multipleChoiceItem(
        "a2-8c-mc-4",
        "Choose the correct negative form.",
        "____ any taxis outside the theatre. (not be)",
        ["There wasn't", "There didn't", "There weren't"],
        2,
        "Use There weren't with the plural noun taxis."
      ),
      multipleChoiceItem(
        "a2-8c-mc-5",
        "Choose the correct question form.",
        "____ a balcony in your old flat?",
        ["Did there", "Was there", "Were there"],
        1,
        "Use Was there with the singular noun balcony."
      ),
      multipleChoiceItem(
        "a2-8c-mc-6",
        "Choose the correct question form.",
        "____ any computers in the classroom?",
        ["Were there", "Was there", "Did there"],
        0,
        "Use Were there with the plural noun computers."
      ),
      multipleChoiceItem(
        "a2-8c-mc-7",
        "Choose the best short answer.",
        "Were there any empty seats?",
        ["Yes, there was.", "Yes, they were.", "Yes, there were."],
        2,
        "Use there were in the positive plural short answer."
      ),
      placeholderGapItem(
        "a2-8c-gf-1",
        "Complete the sentence with the correct past form.",
        "__________ a large clock above the entrance.",
        "There was",
        [],
        "Use There was with the singular noun clock."
      ),
      placeholderGapItem(
        "a2-8c-gf-2",
        "Complete the negative sentence with the correct past form.",
        "__________ any lights along the path. (not be)",
        "There weren't",
        ["There were not"],
        "Use There weren't with the plural noun lights."
      ),
      {
        id: "a2-8c-question-1",
        type: "gap-fill",
        prompt: "Complete the question and short answer.",
        parts: [
          { gapId: "g1" },
          " there a café at the old station? No, there ",
          { gapId: "g2" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Was"], feedback: "Begin the singular question with Was." },
          { id: "g2", acceptedAnswers: ["wasn't", "was not"], feedback: "Use wasn't in the negative singular short answer." },
        ],
      },
      placeholderChoiceGapItem(
        "a2-8c-cg-1",
        "Choose the correct past form for each gap.",
        "At the old station, ____ a ticket office and ____ two platforms. There ____ a café. (not be) There ____ any toilets. (not be)",
        ["there was", "there were", "wasn't", "weren't"],
        "Use singular or plural forms and follow each negative cue.",
        ["there was", "there were", "wasn't", "weren't"]
      ),
      errorCorrectionItem(
        "a2-8c-ec-1",
        "Check the highlighted phrase.",
        "There were a large mirror in the hallway.",
        "There were a large mirror",
        false,
        "There was a large mirror",
        "Use There was with the singular noun mirror."
      ),
      errorCorrectionItem(
        "a2-8c-ec-2",
        "Check the highlighted phrase.",
        "Was there any windows in the room?",
        "Was there any windows",
        false,
        "Were there any windows",
        "Use Were there with the plural noun windows."
      ),
      errorCorrectionItem(
        "a2-8c-ec-3",
        "Check the highlighted phrase.",
        "There weren't any signs outside the building.",
        "There weren't any signs",
        true,
        "",
        "Correct! Use There weren't any with a plural noun."
      ),
      wordOrderItem(
        "a2-8c-wo-1",
        "Put the words in the correct order.",
        ["TV", "wasn't", "room", "There", "a", "the", "in"],
        "There wasn't a TV in the room.",
        "Use There wasn't with the singular noun TV."
      ),
      wordOrderItem(
        "a2-8c-wo-2",
        "Put the words in the correct order.",
        ["any", "there", "nearby", "Were", "shops"],
        "Were there any shops nearby?",
        "Use Were there any before a plural noun."
      ),
      {
        id: "a2-8c-old-office-1",
        type: "gap-fill",
        prompt: "Complete the old office description with past forms of there is or there are.",
        parts: [
          "In the old office, ",
          { gapId: "g1" },
          " one large desk and ",
          { gapId: "g2" },
          " three metal cabinets. ",
          { gapId: "g3" },
          " a printer. (not be) ",
          { gapId: "g4" },
          " any plants. (not be)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["there was"], feedback: "Use there was because the first item is the singular noun desk." },
          { id: "g2", acceptedAnswers: ["there were"], feedback: "Use there were with the plural noun cabinets." },
          { id: "g3", acceptedAnswers: ["There wasn't", "There was not"], feedback: "Use There wasn't with the singular noun printer." },
          { id: "g4", acceptedAnswers: ["there weren't", "there were not"], feedback: "Use there weren't with the plural noun plants." },
        ],
      },
      {
        id: "a2-8c-old-house-1",
        type: "gap-fill",
        prompt: "Complete the conversation about an old house.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " there a garden?\nB: Yes, there ",
          { gapId: "g2" },
          ".\nA: ",
          { gapId: "g3" },
          " there any trees?\nB: No, there ",
          { gapId: "g4" },
          ", but ",
          { gapId: "g5" },
          " some flowers beside the door.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Was"], feedback: "Begin the singular question with Was." },
          { id: "g2", acceptedAnswers: ["was"], feedback: "Use was in the positive singular short answer." },
          { id: "g3", acceptedAnswers: ["Were"], feedback: "Begin the plural question with Were." },
          { id: "g4", acceptedAnswers: ["weren't", "were not"], feedback: "Use weren't in the negative plural short answer." },
          { id: "g5", acceptedAnswers: ["there were"], feedback: "Use there were with the plural noun flowers." },
        ],
      },
    ],
  },
  {
    id: "a2-9a-countable-uncountable-some-any",
    title: "9A · Countable and Uncountable Nouns",
    shortDescription: "Use a, an, some, and any with countable and uncountable nouns.",
    levels: ["a2"],
    intro:
      "Use a or an with one countable noun, some in positive statements, and any in most negatives and questions. Uncountable nouns do not normally have a plural form.",
    items: [
      multipleChoiceItem(
        "a2-9a-mc-1",
        "Choose the correct words.",
        "We need ____ onion for the soup.",
        ["a", "an", "some"],
        1,
        "Use an before the vowel sound in onion."
      ),
      multipleChoiceItem(
        "a2-9a-mc-2",
        "Choose the correct words.",
        "There is ____ bread on the kitchen table.",
        ["some", "a", "any"],
        0,
        "Use some with the uncountable noun bread in a positive sentence."
      ),
      multipleChoiceItem(
        "a2-9a-mc-3",
        "Choose the correct words.",
        "I don't have ____ clean socks.",
        ["a", "some", "any"],
        2,
        "Use any with a plural countable noun in a negative sentence."
      ),
      multipleChoiceItem(
        "a2-9a-mc-4",
        "Choose the correct question.",
        "Ask whether there is milk in the fridge.",
        ["Is there a milk in the fridge?", "Is there any milk in the fridge?", "Are there any milk in the fridge?"],
        1,
        "Milk is uncountable, so ask Is there any milk...?"
      ),
      multipleChoiceItem(
        "a2-9a-mc-5",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["I bought two cheese for the pasta.", "I bought any cheese for the pasta.", "I bought some cheese for the pasta."],
        2,
        "Cheese is uncountable here, so use some cheese."
      ),
      multipleChoiceItem(
        "a2-9a-mc-6",
        "Choose the correct words.",
        "Would you like ____ tea?",
        ["some", "any", "a"],
        0,
        "Use some when offering something."
      ),
      multipleChoiceItem(
        "a2-9a-mc-7",
        "Choose the correct words.",
        "Can I have ____ glass of water, please?",
        ["some", "a", "any"],
        1,
        "Glass is a singular countable noun here, so use a."
      ),
      placeholderGapItem(
        "a2-9a-gf-1",
        "Complete the sentence with a or an.",
        "Nora packed __________ apple for the journey.",
        "an",
        [],
        "Use an before the vowel sound in apple."
      ),
      placeholderGapItem(
        "a2-9a-gf-2",
        "Complete the negative sentence with some or any.",
        "We don't need __________ butter. (not need)",
        "any",
        [],
        "Use any with an uncountable noun in a negative sentence."
      ),
      placeholderGapItem(
        "a2-9a-gf-3",
        "Complete the request with some or any.",
        "Could I have __________ ice, please?",
        "some",
        [],
        "Use some when asking for something."
      ),
      placeholderChoiceGapItem(
        "a2-9a-cg-1",
        "Choose a, an, some, or any for each gap.",
        "For the salad, we need ____ avocado, ____ tomato, and ____ olive oil. We don't need ____ salt.",
        ["an", "a", "some", "any"],
        "Use an before avocado, a before tomato, some in the positive uncountable phrase, and any in the negative phrase.",
        ["a", "an", "some", "any"]
      ),
      errorCorrectionItem(
        "a2-9a-ec-1",
        "Check the highlighted phrase.",
        "There are some rice in the cupboard.",
        "are some rice",
        false,
        "is some rice",
        "Rice is uncountable, so use the singular verb is."
      ),
      errorCorrectionItem(
        "a2-9a-ec-2",
        "Check the highlighted phrase.",
        "There aren't some batteries in the drawer.",
        "some batteries",
        false,
        "any batteries",
        "Use any with a plural countable noun in a negative sentence."
      ),
      errorCorrectionItem(
        "a2-9a-ec-3",
        "Check the highlighted phrase.",
        "I'd like an orange and some yoghurt.",
        "an orange and some yoghurt",
        true,
        "",
        "Correct! Use an with the singular countable noun orange and some with the uncountable noun yoghurt."
      ),
      wordOrderItem(
        "a2-9a-wo-1",
        "Put the words in the correct order.",
        ["any", "We", "haven't", "coffee", "got"],
        "We haven't got any coffee.",
        "Use any with coffee in a negative sentence."
      ),
      wordOrderItem(
        "a2-9a-wo-2",
        "Put the words in the correct order.",
        ["some", "Would", "fruit", "you", "like"],
        "Would you like some fruit?",
        "Use some in an offer."
      ),
      {
        id: "a2-9a-picnic-1",
        type: "gap-fill",
        prompt: "Complete the picnic list with a, an, some, or any.",
        parts: [
          "Let's take ",
          { gapId: "g1" },
          " sandwiches and ",
          { gapId: "g2" },
          " bottle of water. We also need ",
          { gapId: "g3" },
          " umbrella, but we don't need ",
          { gapId: "g4" },
          " plates.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["some"], feedback: "Use some with plural sandwiches in a positive sentence." },
          { id: "g2", acceptedAnswers: ["a"], feedback: "Use a with the singular noun bottle." },
          { id: "g3", acceptedAnswers: ["an"], feedback: "Use an before the vowel sound in umbrella." },
          { id: "g4", acceptedAnswers: ["any"], feedback: "Use any with plural plates in a negative sentence." },
        ],
      },
      {
        id: "a2-9a-breakfast-1",
        type: "gap-fill",
        prompt: "Complete the breakfast conversation with a, an, some, or any.",
        parts: [
          "A: Is there ",
          { gapId: "g1" },
          " cereal?\nB: No, but there's ",
          { gapId: "g2" },
          " bread.\nA: Great. Can I have ",
          { gapId: "g3" },
          " egg too?\nB: Yes, and there are ",
          { gapId: "g4" },
          " bananas in the bowl.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["any"], feedback: "Use any in the question about cereal." },
          { id: "g2", acceptedAnswers: ["some"], feedback: "Use some with bread in a positive sentence." },
          { id: "g3", acceptedAnswers: ["an"], feedback: "Use an before egg." },
          { id: "g4", acceptedAnswers: ["some"], feedback: "Use some with plural bananas in a positive sentence." },
        ],
      },
    ],
  },
  {
    id: "a2-9b-quantifiers",
    title: "9B · Quantifiers",
    shortDescription: "Use how much, how many, a lot, a little, and a few.",
    levels: ["a2"],
    intro:
      "Use how much with uncountable nouns and how many with plural countable nouns. Use a little or not much for small uncountable quantities, and a few or not many for small countable quantities.",
    items: [
      multipleChoiceItem(
        "a2-9b-mc-1",
        "Choose the correct question phrase.",
        "____ luggage are you taking?",
        ["How many", "How a lot of", "How much"],
        2,
        "Luggage is uncountable, so use How much."
      ),
      multipleChoiceItem(
        "a2-9b-mc-2",
        "Choose the correct question phrase.",
        "____ guests are coming to dinner?",
        ["How much", "How many", "How a few"],
        1,
        "Guests is a plural countable noun, so use How many."
      ),
      multipleChoiceItem(
        "a2-9b-mc-3",
        "Choose the correct quantifier.",
        "There are ____ empty chairs near the window—three, I think.",
        ["a few", "a little", "much"],
        0,
        "Use a few with a small number of plural countable nouns."
      ),
      multipleChoiceItem(
        "a2-9b-mc-4",
        "Choose the correct quantifier.",
        "We didn't get ____ snow last winter.",
        ["many", "a few", "much"],
        2,
        "Use much with the uncountable noun snow in a negative sentence."
      ),
      multipleChoiceItem(
        "a2-9b-mc-5",
        "Choose the correct quantifier.",
        "Add ____ olive oil, but not too much.",
        ["a little", "a few", "many"],
        0,
        "Use a little with a small quantity of the uncountable noun olive oil."
      ),
      multipleChoiceItem(
        "a2-9b-mc-6",
        "Choose the correct quantifier.",
        "The renovation created ____ work for everyone.",
        ["many", "a lot of", "a few"],
        1,
        "Use a lot of with the uncountable noun work in a positive sentence."
      ),
      multipleChoiceItem(
        "a2-9b-mc-7",
        "Choose the best short answer.",
        "How many tickets are left?",
        ["Not much.", "A little.", "None."],
        2,
        "None means that zero tickets are left."
      ),
      placeholderGapItem(
        "a2-9b-gf-1",
        "Complete the question with much or many.",
        "How __________ flour do we need?",
        "much",
        [],
        "Flour is uncountable, so use much."
      ),
      placeholderGapItem(
        "a2-9b-gf-2",
        "Complete the sentence with a little or a few.",
        "I speak __________ Italian, so I can order food.",
        "a little",
        [],
        "Italian means the language here and is uncountable, so use a little."
      ),
      placeholderGapItem(
        "a2-9b-gf-3",
        "Complete the negative sentence with much or many.",
        "There aren't __________ buses after midnight. (not be)",
        "many",
        [],
        "Use many with the plural countable noun buses."
      ),
      placeholderChoiceGapItem(
        "a2-9b-cg-1",
        "Choose the correct quantifier for each gap.",
        "We have ____ time before the train and only ____ coins for the ticket machine. There are ____ people in the queue, so we don't have ____ time.",
        ["a little", "a few", "a lot of", "much"],
        "Match each quantifier to the noun and the meaning of the sentence.",
        ["a lot of", "a little", "a few", "much", "many", "any"]
      ),
      errorCorrectionItem(
        "a2-9b-ec-1",
        "Check the highlighted phrase.",
        "How many traffic is there this morning?",
        "How many traffic",
        false,
        "How much traffic",
        "Traffic is uncountable, so use How much."
      ),
      errorCorrectionItem(
        "a2-9b-ec-2",
        "Check the highlighted phrase.",
        "I have a little close friends in this city.",
        "a little close friends",
        false,
        "a few close friends",
        "Friends is a plural countable noun, so use a few."
      ),
      errorCorrectionItem(
        "a2-9b-ec-3",
        "Check the highlighted phrase.",
        "We don't use much electricity in summer.",
        "don't use much electricity",
        true,
        "",
        "Correct! Much is natural with an uncountable noun in a negative sentence."
      ),
      wordOrderItem(
        "a2-9b-wo-1",
        "Put the words in the correct order.",
        ["emails", "many", "send", "How", "you", "did"],
        "How many emails did you send?",
        "Use How many before a plural countable noun."
      ),
      wordOrderItem(
        "a2-9b-wo-2",
        "Put the words in the correct order.",
        ["a", "water", "Drink", "of", "lot"],
        "Drink a lot of water.",
        "Use a lot of before the uncountable noun water."
      ),
      {
        id: "a2-9b-market-1",
        type: "gap-fill",
        prompt: "Complete the market conversation with the quantifiers in brackets.",
        parts: [
          "A: How ",
          { gapId: "g1" },
          " oranges do we need? (much / many)\nB: Just ",
          { gapId: "g2" },
          "—four should be enough. (a little / a few)\nA: And how ",
          { gapId: "g3" },
          " juice is left? (much / many)\nB: None, so let's buy ",
          { gapId: "g4" },
          " juice. (a lot of / many)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["many"], feedback: "Use many with plural oranges." },
          { id: "g2", acceptedAnswers: ["a few"], feedback: "Use a few for a small number of oranges." },
          { id: "g3", acceptedAnswers: ["much"], feedback: "Use much with uncountable juice." },
          { id: "g4", acceptedAnswers: ["a lot of", "lots of"], feedback: "Use a lot of or lots of for a large quantity of juice." },
        ],
      },
      {
        id: "a2-9b-workshop-1",
        type: "gap-fill",
        prompt: "Complete the workshop update with a few, a little, much, or many.",
        parts: [
          "Only ",
          { gapId: "g1" },
          " people arrived early, but we didn't have ",
          { gapId: "g2" },
          " work to do. There was ",
          { gapId: "g3" },
          " paint left, and there weren't ",
          { gapId: "g4" },
          " chairs to move.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["a few"], feedback: "Use a few with plural people." },
          { id: "g2", acceptedAnswers: ["much"], feedback: "Use much with uncountable work in a negative sentence." },
          { id: "g3", acceptedAnswers: ["a little"], feedback: "Use a little for a small quantity of paint." },
          { id: "g4", acceptedAnswers: ["many"], feedback: "Use many with plural chairs in a negative sentence." },
        ],
      },
    ],
  },
  {
    id: "a2-9c-comparative-adjectives",
    title: "9C · Comparative Adjectives",
    shortDescription: "Compare two people, places, or things with comparative adjectives.",
    levels: ["a2"],
    intro:
      "Use adjective + -er for many short adjectives, more + adjective for longer adjectives, and than before the second person or thing in a comparison.",
    items: [
      multipleChoiceItem(
        "a2-9c-mc-1",
        "Choose the correct comparative form.",
        "This suitcase is ____ than mine.",
        ["lighter", "more light", "lightest"],
        0,
        "Add -er to the short adjective light."
      ),
      multipleChoiceItem(
        "a2-9c-mc-2",
        "Choose the correct comparative form.",
        "The second route is ____ than the first.",
        ["dangerouser", "dangerous", "more dangerous"],
        2,
        "Use more with the long adjective dangerous."
      ),
      multipleChoiceItem(
        "a2-9c-mc-3",
        "Choose the correct comparative form.",
        "Today's lesson was ____ than yesterday's.",
        ["gooder", "better", "more good"],
        1,
        "Better is the irregular comparative form of good."
      ),
      multipleChoiceItem(
        "a2-9c-mc-4",
        "Choose the correct comparative form.",
        "My new desk is ____ than the old one.",
        ["bigger", "biger", "more big"],
        0,
        "Double the final consonant in big before adding -er."
      ),
      multipleChoiceItem(
        "a2-9c-mc-5",
        "Choose the correct comparative form.",
        "The city centre is ____ on Sundays than on Saturdays.",
        ["quietter", "quieter", "quietest"],
        1,
        "The comparative form of quiet is quieter."
      ),
      multipleChoiceItem(
        "a2-9c-mc-6",
        "Choose the correct words.",
        "Cycling is healthier ____ driving for short journeys.",
        ["that", "as", "than"],
        2,
        "Use than after a comparative adjective."
      ),
      multipleChoiceItem(
        "a2-9c-mc-7",
        "Choose the correct comparative form.",
        "The situation is ____ than we expected.",
        ["worse", "badder", "more bad"],
        0,
        "Worse is the irregular comparative form of bad."
      ),
      placeholderGapItem(
        "a2-9c-gf-1",
        "Complete the sentence with the comparative form of the adjective.",
        "The blue jacket is __________ than the black one. (cheap)",
        "cheaper",
        [],
        "Add -er to cheap: cheaper."
      ),
      placeholderGapItem(
        "a2-9c-gf-2",
        "Complete the sentence with the comparative form of the adjective.",
        "Working from home is __________ for Lena than commuting every day. (convenient)",
        "more convenient",
        [],
        "Use more before the long adjective convenient."
      ),
      placeholderGapItem(
        "a2-9c-gf-3",
        "Complete the sentence with the comparative form of the adjective.",
        "The air is __________ here than beside the main road. (healthy)",
        "healthier",
        [],
        "Change the final y to i before adding -er: healthier."
      ),
      placeholderChoiceGapItem(
        "a2-9c-cg-1",
        "Choose the correct comparative form for each gap.",
        "The morning train is ____ than the evening one, but it is usually ____. The seats are ____, and the journey feels ____.",
        ["faster", "busier", "more comfortable", "shorter"],
        "Use the comparative form in each comparison.",
        ["faster", "fastest", "busier", "more busy", "more comfortable", "comfortabler", "shorter", "shortest"]
      ),
      errorCorrectionItem(
        "a2-9c-ec-1",
        "Check the highlighted phrase.",
        "This exercise is more easy than the last one.",
        "more easy",
        false,
        "easier",
        "Change the final y to i and add -er: easier."
      ),
      errorCorrectionItem(
        "a2-9c-ec-2",
        "Check the highlighted phrase.",
        "Our new neighbours are friendlier that the previous ones.",
        "friendlier that",
        false,
        "friendlier than",
        "Use than after a comparative adjective."
      ),
      errorCorrectionItem(
        "a2-9c-ec-3",
        "Check the highlighted phrase.",
        "The red path is narrower than the green path.",
        "narrower than",
        true,
        "",
        "Correct! Add -er to narrow and use than before the second thing."
      ),
      wordOrderItem(
        "a2-9c-wo-1",
        "Put the words in the correct order.",
        ["than", "is", "My", "yours", "older", "phone"],
        "My phone is older than yours.",
        "Put the comparative adjective before than."
      ),
      wordOrderItem(
        "a2-9c-wo-2",
        "Put the words in the correct order.",
        ["than", "looks", "The", "at", "during", "more", "night", "day", "square", "the", "beautiful"],
        "The square looks more beautiful at night than during the day.",
        "Use more before the long adjective beautiful and than before the second time."
      ),
      {
        id: "a2-9c-two-hotels-1",
        type: "gap-fill",
        prompt: "Complete the hotel comparison with the comparative forms of the adjectives in brackets.",
        parts: [
          "The Harbour Hotel is ",
          { gapId: "g1" },
          " to the beach than the Park Hotel. (close) Its rooms are also ",
          { gapId: "g2" },
          ". (large) However, the Park Hotel is ",
          { gapId: "g3" },
          ". (quiet) Its restaurant is ",
          { gapId: "g4" },
          " too. (good)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["closer"], feedback: "Drop the final e before adding -er: closer." },
          { id: "g2", acceptedAnswers: ["larger"], feedback: "Drop the final e before adding -er: larger." },
          { id: "g3", acceptedAnswers: ["quieter"], feedback: "Add -er to quiet: quieter." },
          { id: "g4", acceptedAnswers: ["better"], feedback: "Better is the irregular comparative form of good." },
        ],
      },
      {
        id: "a2-9c-old-new-job-1",
        type: "gap-fill",
        prompt: "Complete the job comparison with the comparative forms of the adjectives in brackets.",
        parts: [
          "My new office is ",
          { gapId: "g1" },
          " from home than my old office. (far) The journey is ",
          { gapId: "g2" },
          ". (long) However, the work is ",
          { gapId: "g3" },
          ". (interesting) My new colleagues are ",
          { gapId: "g4" },
          " too. (friendly)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["further", "farther"], feedback: "Further and farther are comparative forms of far." },
          { id: "g2", acceptedAnswers: ["longer"], feedback: "Add -er to long: longer." },
          { id: "g3", acceptedAnswers: ["more interesting"], feedback: "Use more before the long adjective interesting." },
          { id: "g4", acceptedAnswers: ["friendlier"], feedback: "Change the final y to i before adding -er: friendlier." },
        ],
      },
    ],
  },
  {
    id: "a2-10a-superlative-adjectives",
    title: "10A · Superlative Adjectives",
    shortDescription: "Identify the highest or lowest member of a group with superlatives.",
    levels: ["a2"],
    intro:
      "Use the + adjective-est for many short adjectives and the most + adjective for longer adjectives. Use in before places and groups.",
    items: [
      multipleChoiceItem(
        "a2-10a-mc-1",
        "Choose the correct superlative form.",
        "This is ____ room in the house.",
        ["the bigger", "the biggest", "biggest"],
        1,
        "Use the biggest and double the final consonant in big."
      ),
      multipleChoiceItem(
        "a2-10a-mc-2",
        "Choose the correct superlative form.",
        "February is ____ month of the year.",
        ["the shortest", "the most short", "shorter"],
        0,
        "Use the shortest for the short adjective short."
      ),
      multipleChoiceItem(
        "a2-10a-mc-3",
        "Choose the correct superlative form.",
        "That was ____ part of the journey.",
        ["the tiringest", "the more tiring", "the most tiring"],
        2,
        "Use the most with the adjective tiring."
      ),
      multipleChoiceItem(
        "a2-10a-mc-4",
        "Choose the correct superlative form.",
        "Who is ____ person in your family?",
        ["oldest", "the oldest", "the most old"],
        1,
        "Use the before the superlative oldest."
      ),
      multipleChoiceItem(
        "a2-10a-mc-5",
        "Choose the correct superlative form.",
        "This is ____ café in our neighbourhood.",
        ["the best", "the goodest", "the better"],
        0,
        "The best is the irregular superlative form of good."
      ),
      multipleChoiceItem(
        "a2-10a-mc-6",
        "Choose the correct words.",
        "It's the busiest station ____ the city.",
        ["of", "than", "in"],
        2,
        "Use in before a place such as the city."
      ),
      multipleChoiceItem(
        "a2-10a-mc-7",
        "Choose the correct superlative form.",
        "Monday was ____ day of our trip.",
        ["the worse", "the worst", "the most bad"],
        1,
        "The worst is the irregular superlative form of bad."
      ),
      placeholderGapItem(
        "a2-10a-gf-1",
        "Complete the sentence with the superlative form of the adjective.",
        "This is __________ street in the old town. (narrow)",
        "the narrowest",
        [],
        "Use the + narrowest."
      ),
      placeholderGapItem(
        "a2-10a-gf-2",
        "Complete the sentence with the superlative form of the adjective.",
        "It was __________ meal on the menu. (expensive)",
        "the most expensive",
        [],
        "Use the most before the long adjective expensive."
      ),
      placeholderGapItem(
        "a2-10a-gf-3",
        "Complete the sentence with the superlative form of the adjective.",
        "August is usually __________ month here. (dry)",
        "the driest",
        [],
        "Change the final y to i and add -est: the driest."
      ),
      placeholderChoiceGapItem(
        "a2-10a-cg-1",
        "Choose the correct superlative form for each gap.",
        "The north path is ____ route, but it has ____ views. The river path is ____ option, and the forest path is ____.",
        ["the longest", "the best", "the easiest", "the most beautiful"],
        "Use the correct superlative form in each description.",
        ["the longest", "the longer", "the best", "the better", "the easiest", "the most easy", "the most beautiful", "the beautifulest"]
      ),
      errorCorrectionItem(
        "a2-10a-ec-1",
        "Check the highlighted phrase.",
        "Leo is fastest runner in the club.",
        "fastest runner",
        false,
        "the fastest runner",
        "Use the before a superlative adjective."
      ),
      errorCorrectionItem(
        "a2-10a-ec-2",
        "Check the highlighted phrase.",
        "That is the most old building in the square.",
        "the most old",
        false,
        "the oldest",
        "Use the oldest for the short adjective old."
      ),
      errorCorrectionItem(
        "a2-10a-ec-3",
        "Check the highlighted phrase.",
        "This is the most useful app on my phone.",
        "the most useful",
        true,
        "",
        "Correct! Use the most with the long adjective useful."
      ),
      wordOrderItem(
        "a2-10a-wo-1",
        "Put the words in the correct order.",
        ["class", "the", "question", "hardest", "This", "in", "is", "the"],
        "This is the hardest question in the class.",
        "Use the + superlative adjective, followed by in the class."
      ),
      wordOrderItem(
        "a2-10a-wo-2",
        "Put the words in the correct order.",
        ["most", "It's", "shop", "the", "street", "popular", "the", "on"],
        "It's the most popular shop on the street.",
        "Use the most before the long adjective popular."
      ),
      {
        id: "a2-10a-island-1",
        type: "gap-fill",
        prompt: "Complete the island guide with the superlative forms of the adjectives in brackets.",
        parts: [
          "Bay Beach is ",
          { gapId: "g1" },
          " beach on the island. (wide) The path to it is ",
          { gapId: "g2" },
          " route from town. (easy) Sunset Point has ",
          { gapId: "g3" },
          " view. (good) However, it is also ",
          { gapId: "g4" },
          " place to reach. (difficult)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["the widest"], feedback: "Drop the final e before adding -est: the widest." },
          { id: "g2", acceptedAnswers: ["the easiest"], feedback: "Change the final y to i and add -est: the easiest." },
          { id: "g3", acceptedAnswers: ["the best"], feedback: "The best is the irregular superlative form of good." },
          { id: "g4", acceptedAnswers: ["the most difficult"], feedback: "Use the most before difficult." },
        ],
      },
      {
        id: "a2-10a-team-1",
        type: "gap-fill",
        prompt: "Complete the team description with the superlative forms of the adjectives in brackets.",
        parts: [
          "Mia is ",
          { gapId: "g1" },
          " member of the team. (young) Arun is ",
          { gapId: "g2" },
          " and often solves difficult problems. (experienced) Jo has ",
          { gapId: "g3" },
          " start. (early) Bea has ",
          { gapId: "g4" },
          " journey to work. (long)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["the youngest"], feedback: "Use the + youngest." },
          { id: "g2", acceptedAnswers: ["the most experienced"], feedback: "Use the most before experienced." },
          { id: "g3", acceptedAnswers: ["the earliest"], feedback: "Change the final y to i and add -est: the earliest." },
          { id: "g4", acceptedAnswers: ["the longest"], feedback: "Use the + longest." },
        ],
      },
    ],
  },
  {
    id: "a2-10b-going-to-plans",
    title: "10B · Be Going To: Plans",
    shortDescription: "Talk about future plans with be going to and future time expressions.",
    levels: ["a2"],
    intro:
      "Use the present form of be + going to + base verb for future plans. Put the form of be before the subject in questions, and use future expressions such as tomorrow and next week.",
    items: [
      multipleChoiceItem(
        "a2-10b-mc-1",
        "Choose the correct future form.",
        "We ____ visit my aunt next weekend.",
        ["going to", "are going", "are going to"],
        2,
        "Use are going to + base verb with we."
      ),
      multipleChoiceItem(
        "a2-10b-mc-2",
        "Choose the correct negative form.",
        "I ____ drive to work tomorrow. The car is at the garage.",
        ["am not going to", "don't going to", "not going to"],
        0,
        "Use am not going to + base verb with I."
      ),
      multipleChoiceItem(
        "a2-10b-mc-3",
        "Choose the correct question form.",
        "____ a hotel for the trip?",
        ["They are going to book", "Are they going to book", "Do they going to book"],
        1,
        "Put Are before they in a going to question."
      ),
      multipleChoiceItem(
        "a2-10b-mc-4",
        "Choose the correct verb form.",
        "Ella is going to ____ a photography course.",
        ["taking", "takes", "take"],
        2,
        "Use the base verb take after going to."
      ),
      multipleChoiceItem(
        "a2-10b-mc-5",
        "Choose the best short answer.",
        "Are you going to stay for dinner?",
        ["Yes, I'm.", "Yes, I am.", "Yes, I going to."],
        1,
        "Use Yes, I am in the positive short answer."
      ),
      multipleChoiceItem(
        "a2-10b-mc-6",
        "Choose the correct future time expression.",
        "Today is 10 May. Our course finishes ____, in June.",
        ["next month", "last month", "yesterday"],
        0,
        "Next month refers to a future month."
      ),
      multipleChoiceItem(
        "a2-10b-mc-7",
        "Choose the correct sentence.",
        "Which sentence describes a future plan correctly?",
        ["She going to move next year.", "She does going to move next year.", "She's going to move next year."],
        2,
        "Use She is or She's going to + base verb."
      ),
      placeholderGapItem(
        "a2-10b-gf-1",
        "Complete the plan with the correct form of be going to.",
        "__________ for a new passport tomorrow. (apply)",
        "I am going to apply",
        ["I'm going to apply"],
        "Use am going to + the base verb apply with I."
      ),
      placeholderGapItem(
        "a2-10b-gf-2",
        "Complete the negative plan with the correct form of be going to.",
        "Leo __________ the meeting next week. (not attend)",
        "isn't going to attend",
        ["is not going to attend"],
        "Use isn't going to + the base verb attend with Leo."
      ),
      doubleGap(
        "a2-10b-gf-3",
        "Complete the question. Use the verb in brackets.",
        ["What ", { gapId: "g1" }, " you going to ", { gapId: "g2" }, " after the course? (do)"],
        ["are"],
        ["do"],
        "Use are before the subject and the base verb do after going to."
      ),
      placeholderChoiceGapItem(
        "a2-10b-cg-1",
        "Choose the correct going to form for each gap.",
        "I ____ cook tonight. My friends ____ bring dessert. We ____ eat late because everyone has work tomorrow, and Marta ____ stay after ten. (not stay)",
        ["am going to", "are going to", "aren't going to", "isn't going to"],
        "Match the form of be to the subject and follow the negative cue for the final gap.",
        ["am going to", "is going to", "are going to", "isn't going to", "aren't going to"]
      ),
      errorCorrectionItem(
        "a2-10b-ec-1",
        "Check the highlighted phrase.",
        "I'm going to buying a new laptop next month.",
        "going to buying",
        false,
        "going to buy",
        "Use the base verb buy after going to."
      ),
      errorCorrectionItem(
        "a2-10b-ec-2",
        "Check the highlighted phrase.",
        "Does Ana going to travel this summer?",
        "Does Ana going to travel",
        false,
        "Is Ana going to travel",
        "Use Is before Ana to form a going to question."
      ),
      errorCorrectionItem(
        "a2-10b-ec-3",
        "Check the highlighted phrase.",
        "We're going to paint the kitchen this weekend.",
        "We're going to paint",
        true,
        "",
        "Correct! Use are going to + the base verb paint with we."
      ),
      wordOrderItem(
        "a2-10b-wo-1",
        "Put the words in the correct order.",
        ["you", "going", "Where", "stay", "are", "to"],
        "Where are you going to stay?",
        "Use question word + be + subject + going to + base verb."
      ),
      wordOrderItem(
        "a2-10b-wo-2",
        "Put the words in the correct order.",
        ["aren't", "They", "this", "going", "week", "to", "leave"],
        "They aren't going to leave this week.",
        "Use aren't going to + base verb with they."
      ),
      {
        id: "a2-10b-weekend-1",
        type: "gap-fill",
        prompt: "Complete the conversation about weekend plans with be going to and the verbs in brackets.",
        parts: [
          "A: What ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " on Saturday? (do)\nB: I ",
          { gapId: "g3" },
          " my cousins. (visit) We ",
          { gapId: "g4" },
          " at home. (not stay) We ",
          { gapId: "g5" },
          " to the coast. (drive)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["are"], feedback: "Use are before you." },
          { id: "g2", acceptedAnswers: ["going to do"], feedback: "Use going to + the base verb do." },
          { id: "g3", acceptedAnswers: ["am going to visit"], feedback: "Use am going to visit with I." },
          { id: "g4", acceptedAnswers: ["aren't going to stay", "are not going to stay"], feedback: "Use aren't going to stay with we." },
          { id: "g5", acceptedAnswers: ["are going to drive"], feedback: "Use are going to drive with we." },
        ],
      },
      {
        id: "a2-10b-office-move-1",
        type: "gap-fill",
        prompt: "Complete the office plans with the correct form of be going to.",
        parts: [
          "The company ",
          { gapId: "g1" },
          " offices next month. (change) We ",
          { gapId: "g2" },
          " our old desks. (not take) Our manager ",
          { gapId: "g3" },
          " new furniture. (order) ",
          { gapId: "g4" },
          " the IT team going to move the computers? Yes, they ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["is going to change"], feedback: "Use is going to change with the singular subject company." },
          { id: "g2", acceptedAnswers: ["aren't going to take", "are not going to take"], feedback: "Use aren't going to take with we." },
          { id: "g3", acceptedAnswers: ["is going to order"], feedback: "Use is going to order with manager." },
          { id: "g4", acceptedAnswers: ["Is"], feedback: "Begin the question about the singular team with Is." },
          { id: "g5", acceptedAnswers: ["are"], feedback: "Use are in the positive short answer; do not contract it." },
        ],
      },
    ],
  },
  {
    id: "a2-10c-going-to-predictions",
    title: "10C · Be Going To: Predictions",
    shortDescription: "Make predictions with be going to when you have evidence or a clear expectation.",
    levels: ["a2"],
    intro:
      "Use be going to + base verb to predict what you think or can see will happen. The form changes with the subject, but going to and the base verb do not change.",
    items: [
      multipleChoiceItem(
        "a2-10c-mc-1",
        "Choose the correct prediction.",
        "Look at those dark clouds. It ____ rain.",
        ["is going to", "going to", "does going to"],
        0,
        "Use is going to + base verb with it."
      ),
      multipleChoiceItem(
        "a2-10c-mc-2",
        "Choose the correct prediction.",
        "Be careful! You ____ drop those glasses.",
        ["are going", "are going to", "going to"],
        1,
        "Use are going to + base verb with you."
      ),
      multipleChoiceItem(
        "a2-10c-mc-3",
        "Choose the correct verb form.",
        "That cyclist is going to ____ the race.",
        ["winning", "wins", "win"],
        2,
        "Use the base verb win after going to."
      ),
      multipleChoiceItem(
        "a2-10c-mc-4",
        "Choose the correct negative prediction.",
        "The team is exhausted. They ____ finish first.",
        ["aren't going to", "don't going to", "not going to"],
        0,
        "Use aren't going to + base verb with they."
      ),
      multipleChoiceItem(
        "a2-10c-mc-5",
        "Choose the correct question form.",
        "____ enough food for everyone?",
        ["Is be there going to", "There is going to be", "Is there going to be"],
        2,
        "Use Is there going to be...? in the question."
      ),
      multipleChoiceItem(
        "a2-10c-mc-6",
        "Choose the correct prediction.",
        "I think the new series ____ very popular.",
        ["is going be", "is going to be", "going to be"],
        1,
        "Use is going to be after the singular subject series."
      ),
      multipleChoiceItem(
        "a2-10c-mc-7",
        "Choose the correct sentence.",
        "Which prediction is correct?",
        ["She's going to miss the bus.", "She going to miss the bus.", "She's going to misses the bus."],
        0,
        "Use She's going to + the base verb miss."
      ),
      placeholderGapItem(
        "a2-10c-gf-1",
        "Complete the prediction with the correct form of be going to.",
        "The shelf is moving. __________. (fall)",
        "It is going to fall",
        ["It's going to fall"],
        "Use is going to + the base verb fall with it."
      ),
      placeholderGapItem(
        "a2-10c-gf-2",
        "Complete the negative prediction with the correct form of be going to.",
        "Without a map, we __________ the cabin easily. (not find)",
        "aren't going to find",
        ["are not going to find"],
        "Use aren't going to + the base verb find with we."
      ),
      doubleGap(
        "a2-10c-gf-3",
        "Complete the prediction. Use the verb in brackets.",
        ["I think the children ", { gapId: "g1" }, " going to ", { gapId: "g2" }, " the surprise. (love)"],
        ["are"],
        ["love"],
        "Use are going to + the base verb love with the plural subject children."
      ),
      placeholderChoiceGapItem(
        "a2-10c-cg-1",
        "Choose the correct going to form for each prediction.",
        "The road ____ get icy tonight. Some buses ____ run, but they ____ arrive on time. I think the schools ____ close tomorrow.",
        ["is going to", "are going to", "aren't going to", "are going to"],
        "Match is or are to the subject and use the negative form where the prediction is negative.",
        ["is going to", "are going to", "isn't going to", "aren't going to"]
      ),
      errorCorrectionItem(
        "a2-10c-ec-1",
        "Check the highlighted phrase.",
        "Watch out! That box is going fall.",
        "is going fall",
        false,
        "is going to fall",
        "Use going to before the base verb fall."
      ),
      errorCorrectionItem(
        "a2-10c-ec-2",
        "Check the highlighted phrase.",
        "I think they going to enjoy the festival.",
        "they going to enjoy",
        false,
        ["they are going to enjoy", "they're going to enjoy"],
        "Use are or 're before going to with they."
      ),
      errorCorrectionItem(
        "a2-10c-ec-3",
        "Check the highlighted phrase.",
        "The dog is going to catch the ball.",
        "is going to catch",
        true,
        "",
        "Correct! Use is going to + the base verb catch with dog."
      ),
      wordOrderItem(
        "a2-10c-wo-1",
        "Put the words in the correct order.",
        ["to", "going", "glass", "is", "break", "The"],
        "The glass is going to break.",
        "Use subject + be + going to + base verb."
      ),
      wordOrderItem(
        "a2-10c-wo-2",
        "Put the words in the correct order.",
        ["going", "What", "happen", "to", "is"],
        "What is going to happen?",
        "Put is before going to in this question."
      ),
      {
        id: "a2-10c-weather-1",
        type: "gap-fill",
        prompt: "Complete the weather predictions with the correct form of be going to and the verbs in brackets.",
        parts: [
          "The sky is very dark, so it ",
          { gapId: "g1" },
          ". (storm) The temperature ",
          { gapId: "g2" },
          " above ten degrees. (not rise) The strong wind ",
          { gapId: "g3" },
          " some branches. (break) Roads near the river ",
          { gapId: "g4" },
          " wet. (be)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["is going to storm"], feedback: "Use is going to storm with it." },
          { id: "g2", acceptedAnswers: ["isn't going to rise", "is not going to rise"], feedback: "Use isn't going to rise with temperature." },
          { id: "g3", acceptedAnswers: ["is going to break"], feedback: "Use is going to break with wind." },
          { id: "g4", acceptedAnswers: ["are going to be"], feedback: "Use are going to be with plural roads." },
        ],
      },
      {
        id: "a2-10c-match-1",
        type: "gap-fill",
        prompt: "Complete the match predictions with the correct form of be going to.",
        parts: [
          "A: Which team ",
          { gapId: "g1" },
          " win?\nB: I think the home team ",
          { gapId: "g2" },
          " win. Their best player ",
          { gapId: "g3" },
          " score again.\nA: And ",
          { gapId: "g4" },
          " the match going to be close?\nB: No, it ",
          { gapId: "g5" },
          ".",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["is going to"], feedback: "Use is going to after the singular noun team." },
          { id: "g2", acceptedAnswers: ["is going to"], feedback: "Use is going to before win." },
          { id: "g3", acceptedAnswers: ["is going to"], feedback: "Use is going to before score." },
          { id: "g4", acceptedAnswers: ["is"], feedback: "Begin the question with is." },
          { id: "g5", acceptedAnswers: ["isn't", "is not"], feedback: "Use isn't in the negative short answer." },
        ],
      },
    ],
  },
  {
    id: "a2-11a-adverbs-manner-modifiers",
    title: "11A · Adverbs of Manner and Modifiers",
    shortDescription: "Describe how actions happen and modify adjectives or adverbs.",
    levels: ["a2"],
    intro:
      "Use adverbs of manner to describe actions. Many end in -ly, but well, fast, and hard are irregular or unchanged. Put modifiers such as very, quite, and really before an adjective or adverb.",
    items: [
      multipleChoiceItem(
        "a2-11a-mc-1",
        "Choose the correct adverb.",
        "Rina explained the problem ____.",
        ["clear", "clearly", "clearness"],
        1,
        "Use the adverb clearly to describe how Rina explained the problem."
      ),
      multipleChoiceItem(
        "a2-11a-mc-2",
        "Choose the correct form.",
        "Hugo is a ____ driver.",
        ["carefully", "care", "careful"],
        2,
        "Use the adjective careful before the noun driver."
      ),
      multipleChoiceItem(
        "a2-11a-mc-3",
        "Choose the correct adverb.",
        "Theo completed the form ____.",
        ["easily", "easy", "easiness"],
        0,
        "Change easy to easily to describe the verb completed."
      ),
      multipleChoiceItem(
        "a2-11a-mc-4",
        "Choose the correct modifier.",
        "The Wi-Fi is ____ slow today.",
        ["reality", "real", "really"],
        2,
        "Use really before the adjective slow."
      ),
      multipleChoiceItem(
        "a2-11a-mc-5",
        "Choose the correct form.",
        "We worked ____ all morning.",
        ["hardly", "hard", "harderly"],
        1,
        "Hard is both an adjective and an adverb; hardly has a different meaning."
      ),
      multipleChoiceItem(
        "a2-11a-mc-6",
        "Choose the correct adverb.",
        "Mina plays the piano very ____.",
        ["well", "good", "goodly"],
        0,
        "Well is the adverb form of good."
      ),
      multipleChoiceItem(
        "a2-11a-mc-7",
        "Choose the correct word.",
        "The instructions were ____ clear.",
        ["quiet", "quite", "quietly"],
        1,
        "Quite is a modifier that can come before the adjective clear."
      ),
      placeholderGapItem(
        "a2-11a-gf-1",
        "Complete the sentence with the adverb form of the adjective.",
        "Please speak __________ because the baby is asleep. (quiet)",
        "quietly",
        [],
        "Add -ly to quiet: quietly."
      ),
      placeholderGapItem(
        "a2-11a-gf-2",
        "Complete the sentence with the adverb form of the adjective.",
        "The technician checked every cable __________. (careful)",
        "carefully",
        [],
        "Add -ly to careful: carefully."
      ),
      placeholderGapItem(
        "a2-11a-gf-3",
        "Complete the sentence with the adverb form of the adjective.",
        "I slept __________ after the long journey. (good)",
        "well",
        [],
        "Well is the irregular adverb form of good."
      ),
      placeholderChoiceGapItem(
        "a2-11a-cg-1",
        "Choose the correct adjective, adverb, or modifier for each gap.",
        "The room was ____ noisy, but the speaker talked ____ and answered every question ____. She seemed very ____.",
        ["quite", "slowly", "politely", "friendly"],
        "Use a modifier before an adjective, adverbs after action verbs, and an adjective after seemed.",
        ["quite", "quiet", "slow", "slowly", "polite", "politely", "friendly", "friendlily"]
      ),
      errorCorrectionItem(
        "a2-11a-ec-1",
        "Check the highlighted phrase.",
        "The children waited patient outside the classroom.",
        "waited patient",
        false,
        "waited patiently",
        "Use the adverb patiently to describe how they waited."
      ),
      errorCorrectionItem(
        "a2-11a-ec-2",
        "Check the highlighted phrase.",
        "Our team played very good in the second half.",
        "played very good",
        false,
        "played very well",
        "Use the adverb well after played; very comes before the adverb."
      ),
      errorCorrectionItem(
        "a2-11a-ec-3",
        "Check the highlighted phrase.",
        "The new printer works incredibly fast.",
        "incredibly fast",
        true,
        "",
        "Correct! The modifier incredibly comes before the adverb fast."
      ),
      wordOrderItem(
        "a2-11a-wo-1",
        "Put the words in the correct order.",
        ["carefully", "the", "Read", "instructions"],
        "Read the instructions carefully.",
        "An adverb of manner usually follows the verb phrase."
      ),
      wordOrderItem(
        "a2-11a-wo-2",
        "Put the words in the correct order.",
        ["really", "My", "quickly", "learns", "brother"],
        "My brother learns really quickly.",
        "Put the modifier really before the adverb quickly."
      ),
      {
        id: "a2-11a-presentation-1",
        type: "gap-fill",
        prompt: "Complete the presentation review with the adverb forms of the adjectives in brackets.",
        parts: [
          "Nadia spoke ",
          { gapId: "g1" },
          ". (confident) She introduced the topic ",
          { gapId: "g2" },
          ". (quick) She explained the difficult ideas ",
          { gapId: "g3" },
          ". (simple) At the end, she answered the questions ",
          { gapId: "g4" },
          ". (honest)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["confidently"], feedback: "Add -ly to confident: confidently." },
          { id: "g2", acceptedAnswers: ["quickly"], feedback: "Add -ly to quick: quickly." },
          { id: "g3", acceptedAnswers: ["simply"], feedback: "Drop the final e in simple and add -y: simply." },
          { id: "g4", acceptedAnswers: ["honestly"], feedback: "Add -ly to honest: honestly." },
        ],
      },
      {
        id: "a2-11a-driving-lesson-1",
        type: "gap-fill",
        prompt: "Complete the driving lesson description with the words in brackets.",
        parts: [
          "The instructor spoke ",
          { gapId: "g1" },
          ". (calm) I drove quite ",
          { gapId: "g2" },
          " at first. (slow) Later, I turned ",
          { gapId: "g3" },
          ". (safe) I parked very ",
          { gapId: "g4" },
          ". (careful)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["calmly"], feedback: "Use calmly to describe how the instructor spoke." },
          { id: "g2", acceptedAnswers: ["slowly"], feedback: "Use slowly after drove; quite comes before it." },
          { id: "g3", acceptedAnswers: ["safely"], feedback: "Use safely to describe how I turned." },
          { id: "g4", acceptedAnswers: ["carefully"], feedback: "Use carefully after parked; very comes before it." },
        ],
      },
    ],
  },
  {
    id: "a2-11b-verb-to-infinitive",
    title: "11B · Verb + To-infinitive",
    shortDescription: "Use to + base verb after common verbs and would like.",
    levels: ["a2"],
    intro:
      "Use to + base verb after verbs such as want, need, decide, plan, hope, promise, learn, and remember. Would like is also followed by to + base verb.",
    items: [
      multipleChoiceItem(
        "a2-11b-mc-1",
        "Choose the correct verb form.",
        "We decided ____ by train.",
        ["travelling", "travel", "to travel"],
        2,
        "Use to + base verb after decided."
      ),
      multipleChoiceItem(
        "a2-11b-mc-2",
        "Choose the correct verb form.",
        "I hope ____ you again soon.",
        ["to see", "seeing", "see"],
        0,
        "Use to see after hope."
      ),
      multipleChoiceItem(
        "a2-11b-mc-3",
        "Choose the correct verb form.",
        "You need ____ some photo ID.",
        ["bringing", "to bring", "bring"],
        1,
        "Use to bring after need."
      ),
      multipleChoiceItem(
        "a2-11b-mc-4",
        "Choose the correct verb form.",
        "Would you like ____ for lunch tomorrow?",
        ["to meet", "meeting", "meet"],
        0,
        "Use to + base verb after would like."
      ),
      multipleChoiceItem(
        "a2-11b-mc-5",
        "Choose the correct verb form.",
        "Sara promised ____ when she arrived.",
        ["calling", "call", "to call"],
        2,
        "Use to call after promised."
      ),
      multipleChoiceItem(
        "a2-11b-mc-6",
        "Choose the correct verb form.",
        "I wouldn't like ____ alone on a small island.",
        ["living", "to live", "live"],
        1,
        "Use to live after wouldn't like."
      ),
      multipleChoiceItem(
        "a2-11b-mc-7",
        "Choose the correct verb form.",
        "Please remember ____ the door when you leave.",
        ["locking", "lock", "to lock"],
        2,
        "Use to lock after remember when talking about an action you must do."
      ),
      placeholderGapItem(
        "a2-11b-gf-1",
        "Complete the sentence with the verb in brackets.",
        "Dylan wants __________ Japanese next year. (learn)",
        "to learn",
        [],
        "Use to learn after wants."
      ),
      placeholderGapItem(
        "a2-11b-gf-2",
        "Complete the sentence with the verb in brackets.",
        "We plan __________ early on Friday. (leave)",
        "to leave",
        [],
        "Use to leave after plan."
      ),
      placeholderGapItem(
        "a2-11b-gf-3",
        "Complete the sentence with the verb in brackets.",
        "I'd like __________ the manager, please. (speak to)",
        "to speak to",
        [],
        "Use to speak to after would like."
      ),
      placeholderChoiceGapItem(
        "a2-11b-cg-1",
        "Choose the correct to-infinitive for each gap.",
        "I need ____ a dentist. I hope ____ an appointment today, and I promise ____ on time. I don't want ____ another week.",
        ["to call", "to get", "to arrive", "to wait"],
        "Use to + base verb after need, hope, promise, and want.",
        ["call", "to call", "get", "to get", "arrive", "to arrive", "wait", "to wait"]
      ),
      errorCorrectionItem(
        "a2-11b-ec-1",
        "Check the highlighted phrase.",
        "My cousins want visiting us in July.",
        "want visiting",
        false,
        "want to visit",
        "Use to + base verb after want."
      ),
      errorCorrectionItem(
        "a2-11b-ec-2",
        "Check the highlighted phrase.",
        "Would you like come to the concert with us?",
        "like come",
        false,
        "like to come",
        "Use to come after would like."
      ),
      errorCorrectionItem(
        "a2-11b-ec-3",
        "Check the highlighted phrase.",
        "I learned to use the new booking system.",
        "learned to use",
        true,
        "",
        "Correct! Use to + base verb after learned."
      ),
      wordOrderItem(
        "a2-11b-wo-1",
        "Put the words in the correct order.",
        ["to", "She", "abroad", "decided", "study"],
        "She decided to study abroad.",
        "Put to + base verb after decided."
      ),
      wordOrderItem(
        "a2-11b-wo-2",
        "Put the words in the correct order.",
        ["like", "Would", "sit", "you", "to", "down"],
        "Would you like to sit down?",
        "Use Would you like to + base verb for an offer."
      ),
      {
        id: "a2-11b-course-1",
        type: "gap-fill",
        prompt: "Complete the course plans with the verbs in brackets.",
        parts: [
          "I hope ",
          { gapId: "g1" },
          " a design course this autumn. (start) First, I need ",
          { gapId: "g2" },
          " an application. (complete) I plan ",
          { gapId: "g3" },
          " it this weekend. (send) I also want ",
          { gapId: "g4" },
          " more about the college. (learn)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["to start"], feedback: "Use to start after hope." },
          { id: "g2", acceptedAnswers: ["to complete"], feedback: "Use to complete after need." },
          { id: "g3", acceptedAnswers: ["to send"], feedback: "Use to send after plan." },
          { id: "g4", acceptedAnswers: ["to learn"], feedback: "Use to learn after want." },
        ],
      },
      {
        id: "a2-11b-dinner-1",
        type: "gap-fill",
        prompt: "Complete the dinner conversation with the verbs in brackets.",
        parts: [
          "A: Would you like ",
          { gapId: "g1" },
          " dinner with us? (have)\nB: Yes, I'd love ",
          { gapId: "g2" },
          ". (come) I promise ",
          { gapId: "g3" },
          " a dessert. (bring)\nA: Great. Remember ",
          { gapId: "g4" },
          " Sam the address. (send)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["to have"], feedback: "Use to have after would like." },
          { id: "g2", acceptedAnswers: ["to come"], feedback: "Use to come after would love." },
          { id: "g3", acceptedAnswers: ["to bring"], feedback: "Use to bring after promise." },
          { id: "g4", acceptedAnswers: ["to send"], feedback: "Use to send after remember." },
        ],
      },
    ],
  },
  {
    id: "a2-11c-definite-article",
    title: "11C · The Definite Article",
    shortDescription: "Use the when something is specific and no article for common general expressions.",
    levels: ["a2"],
    intro:
      "Use the for a specific or unique person or thing and before superlatives. Do not normally use the for general plural nouns, meals, transport with by, or places such as work, school, university, bed, and home.",
    items: [
      multipleChoiceItem(
        "a2-11c-mc-1",
        "Choose the correct article.",
        "Could you close ____ door beside you?",
        ["the", "a", "—"],
        0,
        "Use the because the speaker means a specific door."
      ),
      multipleChoiceItem(
        "a2-11c-mc-2",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["Nora goes to the work by the bus.", "Nora goes to work by bus.", "Nora goes to a work by bus."],
        1,
        "Do not use an article with go to work or by bus."
      ),
      multipleChoiceItem(
        "a2-11c-mc-3",
        "Choose the correct article.",
        "____ sun was already low in the sky.",
        ["A", "—", "The"],
        2,
        "Use the with the sun because there is only one."
      ),
      multipleChoiceItem(
        "a2-11c-mc-4",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["I had the breakfast at seven.", "I had breakfast at seven.", "I had a breakfast at seven."],
        1,
        "Do not normally use an article with the name of a meal."
      ),
      multipleChoiceItem(
        "a2-11c-mc-5",
        "Choose the correct article.",
        "I bought a lamp. ____ lamp has a blue shade.",
        ["The", "A", "—"],
        0,
        "Use the on the second mention because the lamp is now specific."
      ),
      multipleChoiceItem(
        "a2-11c-mc-6",
        "Choose the correct sentence.",
        "Which sentence talks about children in general?",
        ["A children need enough sleep.", "The children need enough sleep.", "Children need enough sleep."],
        2,
        "Use no article with a plural noun when speaking in general."
      ),
      multipleChoiceItem(
        "a2-11c-mc-7",
        "Choose the correct article.",
        "This room has ____ best view in the hotel.",
        ["the", "a", "—"],
        0,
        "Use the before a superlative adjective."
      ),
      placeholderGapItem(
        "a2-11c-gf-1",
        "Complete the sentence with the where it is needed.",
        "Please turn off __________ light in the hallway.",
        "the",
        [],
        "Use the because the phrase identifies a specific light."
      ),
      placeholderGapItem(
        "a2-11c-gf-2",
        "Complete the second sentence with the correct article.",
        "I found a key under the sofa. __________ key opened the back door.",
        "The",
        [],
        "Use the when mentioning the same key again."
      ),
      placeholderGapItem(
        "a2-11c-gf-3",
        "Complete the sentence with the correct article.",
        "We checked the train times on __________ internet.",
        "the",
        [],
        "Use the in the fixed expression on the internet."
      ),
      placeholderChoiceGapItem(
        "a2-11c-cg-1",
        "Choose a, an, the, or no article for each gap.",
        "Kai goes to ____ university by ____ train. He usually has ____ lunch there and studies in ____ library near his department.",
        ["—", "—", "—", "the"],
        "Use no article with university, by train, and lunch; use the for the specific library.",
        ["a", "an", "the", "—"]
      ),
      errorCorrectionItem(
        "a2-11c-ec-1",
        "Check the highlighted phrase.",
        "She's the my brother's new manager.",
        "the my brother's",
        false,
        "my brother's",
        "Do not use the before a possessive form."
      ),
      errorCorrectionItem(
        "a2-11c-ec-2",
        "Check the highlighted phrase.",
        "I usually eat the lunch at my desk.",
        "eat the lunch",
        false,
        "eat lunch",
        "Do not normally use the with the name of a meal."
      ),
      errorCorrectionItem(
        "a2-11c-ec-3",
        "Check the highlighted phrase.",
        "Moon looks very bright tonight.",
        "Moon looks",
        false,
        "The moon looks",
        "Use the with the moon because there is only one."
      ),
      wordOrderItem(
        "a2-11c-wo-1",
        "Put the words in the correct order.",
        ["the", "Can", "window", "open", "you"],
        "Can you open the window?",
        "Use the because both speakers know which window is meant."
      ),
      wordOrderItem(
        "a2-11c-wo-2",
        "Put the words in the correct order.",
        ["in", "tallest", "building", "It's", "city", "the", "the"],
        "It's the tallest building in the city.",
        "Use the before a superlative adjective and before the specific place."
      ),
      placeholderChoiceGapItem(
        "a2-11c-café-1",
        "Choose a, an, the, or no article for each gap.",
        "We found ____ small café near the station. ____ café had a garden, so we ate ____ lunch outside and enjoyed ____ view of the river.",
        ["a", "the", "—", "the"],
        "Use a on first mention, the on second mention and for the specific view, and no article with lunch.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "a2-11c-routine-1",
        "Choose the or no article for each gap.",
        "Maya goes to ____ work by ____ bus. In ____ evening, she often uses ____ internet to call her family.",
        ["—", "—", "the", "the"],
        "Use no article with work and by bus, and use the in the evening and the internet.",
        ["the", "—"]
      ),
    ],
  },
  {
    id: "a2-12a-present-perfect",
    title: "12A · Present Perfect",
    shortDescription: "Use have or has with a past participle for experiences and recent events.",
    levels: ["a2"],
    intro:
      "Form the present perfect with have or has + past participle. Use it for past experiences when no time is given and for recent events with a present result; ever and never are common with experiences.",
    items: [
      multipleChoiceItem(
        "a2-12a-mc-1",
        "Choose the correct present-perfect form.",
        "Mia ____ finished her assignment.",
        ["have", "has", "is"],
        1,
        "Use has + past participle with Mia."
      ),
      multipleChoiceItem(
        "a2-12a-mc-2",
        "Choose the correct past participle.",
        "We've ____ that documentary before.",
        ["seen", "saw", "see"],
        0,
        "Seen is the past participle of see."
      ),
      multipleChoiceItem(
        "a2-12a-mc-3",
        "Choose the correct question form.",
        "____ you ever tried kayaking?",
        ["Did", "Has", "Have"],
        2,
        "Use Have + subject + past participle with you."
      ),
      multipleChoiceItem(
        "a2-12a-mc-4",
        "Choose the correct negative form.",
        "Noah ____ replied to my message.",
        ["doesn't have", "haven't", "hasn't"],
        2,
        "Use hasn't + past participle with Noah."
      ),
      multipleChoiceItem(
        "a2-12a-mc-5",
        "Choose the best short answer.",
        "Has your sister finished the course?",
        ["Yes, she have.", "Yes, she has.", "Yes, she's."],
        1,
        "Use Yes, she has in a positive short answer."
      ),
      multipleChoiceItem(
        "a2-12a-mc-6",
        "Choose the correct sentence.",
        "Which sentence is correct?",
        ["I've never flown in a helicopter.", "I haven't never flown in a helicopter.", "I've never flew in a helicopter."],
        0,
        "Use have + never + the past participle flown."
      ),
      multipleChoiceItem(
        "a2-12a-mc-7",
        "Choose the correct present-perfect form.",
        "The guests ____ arrived. They're in the living room.",
        ["has", "have", "are"],
        1,
        "Use have arrived with the plural subject guests."
      ),
      placeholderGapItem(
        "a2-12a-gf-1",
        "Complete the sentence with the present perfect form of the verb.",
        "__________ three emails so far. (write)",
        "I have written",
        ["I've written"],
        "Use have + the past participle written with I."
      ),
      placeholderGapItem(
        "a2-12a-gf-2",
        "Complete the negative sentence with the present perfect form of the verb.",
        "Lena __________ the new novel. (not read)",
        "hasn't read",
        ["has not read"],
        "Use hasn't + the past participle read with Lena."
      ),
      doubleGap(
        "a2-12a-gf-3",
        "Complete the present-perfect question. Use the verb in brackets.",
        ["", { gapId: "g1" }, " your parents ever ", { gapId: "g2" }, " sushi? (eat)"],
        ["Have"],
        ["eaten"],
        "Use Have before the subject and the past participle eaten."
      ),
      placeholderChoiceGapItem(
        "a2-12a-cg-1",
        "Choose the correct present-perfect form for each gap.",
        "I ____ the tickets, but Sam ____ the hotel. (not book) We ____ our passports, and our friends ____ a taxi.",
        ["have bought", "hasn't booked", "have found", "have ordered"],
        "Use have or has with the correct past participle, and follow the negative cue for Sam.",
        ["have bought", "bought", "hasn't booked", "didn't book", "have found", "found", "have ordered", "ordered"]
      ),
      errorCorrectionItem(
        "a2-12a-ec-1",
        "Check the highlighted phrase.",
        "My neighbour has saw the missing cat.",
        "has saw",
        false,
        "has seen",
        "Use the past participle seen after has."
      ),
      errorCorrectionItem(
        "a2-12a-ec-2",
        "Check the highlighted phrase.",
        "Did you ever eaten Korean food?",
        "Did you ever eaten",
        false,
        "Have you ever eaten",
        "Use Have + subject + ever + past participle for a life experience."
      ),
      errorCorrectionItem(
        "a2-12a-ec-3",
        "Check the highlighted phrase.",
        "We've never stayed in a castle.",
        "We've never stayed",
        true,
        "",
        "Correct! Use have + never + past participle for an experience you have not had."
      ),
      wordOrderItem(
        "a2-12a-wo-1",
        "Put the words in the correct order.",
        ["ever", "Has", "won", "a", "prize", "he"],
        "Has he ever won a prize?",
        "Use Has + subject + ever + past participle."
      ),
      wordOrderItem(
        "a2-12a-wo-2",
        "Put the words in the correct order.",
        ["haven't", "We", "yet", "decided"],
        "We haven't decided yet.",
        "Use haven't + past participle; yet commonly comes at the end."
      ),
      {
        id: "a2-12a-project-1",
        type: "gap-fill",
        prompt: "Complete the project update with the present perfect forms of the verbs in brackets.",
        parts: [
          "The team ",
          { gapId: "g1" },
          " the first report. (finish) Eva ",
          { gapId: "g2" },
          " the photos. (choose) I ",
          { gapId: "g3" },
          " the final page yet. (not write) We ",
          { gapId: "g4" },
          " the manager for more time. (ask)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["has finished"], feedback: "Use has finished with the singular collective noun team." },
          { id: "g2", acceptedAnswers: ["has chosen"], feedback: "Use has + the past participle chosen with Eva." },
          { id: "g3", acceptedAnswers: ["haven't written", "have not written"], feedback: "Use haven't + written with I." },
          { id: "g4", acceptedAnswers: ["have asked"], feedback: "Use have asked with we." },
        ],
      },
      {
        id: "a2-12a-experiences-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the present perfect forms of the verbs in brackets.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ever ",
          { gapId: "g2" },
          " a marathon? (run)\nB: No, I ",
          { gapId: "g3" },
          ", but I ",
          { gapId: "g4" },
          " several long races. (complete) My sister ",
          { gapId: "g5" },
          " two marathons. (do)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Have"], feedback: "Begin the question with Have." },
          { id: "g2", acceptedAnswers: ["run"], feedback: "Run is also the past participle of run." },
          { id: "g3", acceptedAnswers: ["haven't", "have not"], feedback: "Use haven't in the negative short answer." },
          { id: "g4", acceptedAnswers: ["have completed"], feedback: "Use have completed with I." },
          { id: "g5", acceptedAnswers: ["has done"], feedback: "Use has + the past participle done with sister." },
        ],
      },
    ],
  },
  {
    id: "a2-12b-present-perfect-past-simple",
    title: "12B · Present Perfect or Past Simple?",
    shortDescription: "Choose between life experience and a finished past time, and distinguish been from gone.",
    levels: ["a2"],
    intro:
      "Use the present perfect to introduce an experience when no finished time is given. Use the past simple for details and finished times such as yesterday or last week. Been means visited and returned; gone means went and is still there.",
    items: [
      multipleChoiceItem(
        "a2-12b-mc-1",
        "Choose the correct question.",
        "Ask about someone's life experience without saying when.",
        ["Did you ever rode a horse?", "Have you ever rode a horse?", "Have you ever ridden a horse?"],
        2,
        "Use Have + subject + ever + the past participle ridden."
      ),
      multipleChoiceItem(
        "a2-12b-mc-2",
        "Choose the correct verb form.",
        "We ____ the exhibition yesterday afternoon.",
        ["have visited", "visited", "have visit"],
        1,
        "Use the past simple with the finished time yesterday afternoon."
      ),
      multipleChoiceItem(
        "a2-12b-mc-3",
        "Choose the correct follow-up question.",
        "A: I've been to Seoul. B: Really? ____",
        ["When did you go?", "When have you gone?", "When have you been?"],
        0,
        "Use the past simple to ask for the specific past details."
      ),
      multipleChoiceItem(
        "a2-12b-mc-4",
        "Choose been or gone.",
        "Maya has ____ to the pharmacy. She'll be back soon.",
        ["gone", "been", "went"],
        0,
        "Gone means Maya went there and has not returned yet."
      ),
      multipleChoiceItem(
        "a2-12b-mc-5",
        "Choose been or gone.",
        "I've ____ to Lisbon twice, and I'd love to return.",
        ["went", "gone", "been"],
        2,
        "Been means visited and returned."
      ),
      multipleChoiceItem(
        "a2-12b-mc-6",
        "Choose the correct verb form.",
        "Leo ____ the final episode last night.",
        ["has watched", "watched", "has watch"],
        1,
        "Use the past simple with the finished time last night."
      ),
      multipleChoiceItem(
        "a2-12b-mc-7",
        "Choose the correct verb form.",
        "I can't open the door. I think I ____ my keys.",
        ["lost yesterday", "did lose", "have lost"],
        2,
        "Use the present perfect for a recent event with a present result."
      ),
      placeholderGapItem(
        "a2-12b-gf-1",
        "Complete the sentence with the correct form of the verb.",
        "We __________ this restaurant several times. (visit)",
        "have visited",
        [],
        "Use the present perfect because no finished past time is given."
      ),
      placeholderGapItem(
        "a2-12b-gf-2",
        "Complete the sentence with the correct form of the verb.",
        "I __________ my first laptop in 2019. (buy)",
        "bought",
        [],
        "Use the past simple with the finished time in 2019."
      ),
      placeholderGapItem(
        "a2-12b-gf-3",
        "Complete the sentence with been or gone.",
        "Omar isn't at his desk. He's __________ to a meeting.",
        "gone",
        [],
        "Use gone because Omar is still at the meeting."
      ),
      placeholderChoiceGapItem(
        "a2-12b-cg-1",
        "Choose the present perfect or past simple form for each gap.",
        "Nina ____ several cookery courses. She ____ her first one last year. She ____ a bread-making class in March and ____ many new recipes since then.",
        ["has taken", "started", "attended", "has learned"],
        "Use the present perfect without a finished time and the past simple with last year and in March.",
        ["has taken", "took", "has started", "started", "has attended", "attended", "has learned", "learned"]
      ),
      errorCorrectionItem(
        "a2-12b-ec-1",
        "Check the highlighted phrase.",
        "I've met our new neighbour yesterday.",
        "I've met",
        false,
        "I met",
        "Use the past simple with yesterday."
      ),
      errorCorrectionItem(
        "a2-12b-ec-2",
        "Check the highlighted phrase.",
        "When have you bought that jacket?",
        "have you bought",
        false,
        "did you buy",
        "Use the past simple when asking when an action happened."
      ),
      errorCorrectionItem(
        "a2-12b-ec-3",
        "Check the highlighted phrase.",
        "Eva is here with us. She has gone to Canada three times.",
        "has gone to Canada",
        false,
        "has been to Canada",
        "Use been to for visits that finished; gone to means the person is still there."
      ),
      wordOrderItem(
        "a2-12b-wo-1",
        "Put the words in the correct order.",
        ["you", "ever", "this", "Have", "read", "book"],
        "Have you ever read this book?",
        "Use the present perfect to ask about an experience without a past time."
      ),
      wordOrderItem(
        "a2-12b-wo-2",
        "Put the words in the correct order.",
        ["did", "Where", "stay", "you", "there", "you", "when", "went"],
        "Where did you stay when you went there?",
        "Use the past simple to ask about the details of a finished trip."
      ),
      {
        id: "a2-12b-film-1",
        type: "gap-fill",
        prompt: "Complete the conversation with the present perfect or past simple forms of the verbs in brackets.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          " the new science-fiction film? (see)\nB: Yes, I ",
          { gapId: "g3" },
          " it on Saturday. (see)\nA: Who ",
          { gapId: "g4" },
          " you go with?\nB: I ",
          { gapId: "g5" },
          " with my cousins. (go)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Have"], feedback: "Begin the experience question with Have." },
          { id: "g2", acceptedAnswers: ["seen"], feedback: "Use the past participle seen." },
          { id: "g3", acceptedAnswers: ["saw"], feedback: "Use the past simple saw with on Saturday." },
          { id: "g4", acceptedAnswers: ["did"], feedback: "Use did to ask for a past detail." },
          { id: "g5", acceptedAnswers: ["went"], feedback: "Use the past simple went for the finished visit." },
        ],
      },
      {
        id: "a2-12b-travel-1",
        type: "gap-fill",
        prompt: "Complete the travel conversation with been, gone, or the correct verb form.",
        parts: [
          "A: Where's Luis?\nB: He's ",
          { gapId: "g1" },
          " to Prague for work.\nA: Really? I ",
          { gapId: "g2" },
          " never ",
          { gapId: "g3" },
          " there. (be)\nB: I ",
          { gapId: "g4" },
          " there in 2024. (go) I ",
          { gapId: "g5" },
          " the city. (love)",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["gone"], feedback: "Use gone because Luis is still in Prague." },
          { id: "g2", acceptedAnswers: ["have"], feedback: "Use have with I in the present perfect." },
          { id: "g3", acceptedAnswers: ["been"], feedback: "Use been to for a life experience." },
          { id: "g4", acceptedAnswers: ["went"], feedback: "Use the past simple with the finished time in 2024." },
          { id: "g5", acceptedAnswers: ["loved"], feedback: "Use the past simple to give another detail of that trip." },
        ],
      },
    ],
  },
  {
    id: "a2-12c-question-formation-review",
    title: "12C · Question Formation Review",
    shortDescription: "Review question forms with be, do, did, can, going to, and the present perfect.",
    levels: ["a2"],
    intro:
      "Put be or a helping verb before the subject. Use do, does, or did with a base verb; place question words first; and keep the correct verb form in continuous, going to, and present-perfect questions.",
    items: [
      multipleChoiceItem(
        "a2-12c-mc-1",
        "Choose the correct question form.",
        "____ ready to begin?",
        ["Are you", "Do you", "You are"],
        0,
        "Use Are before you with the adjective ready."
      ),
      multipleChoiceItem(
        "a2-12c-mc-2",
        "Choose the correct question form.",
        "____ at the sports centre?",
        ["Do your brother work", "Is your brother work", "Does your brother work"],
        2,
        "Use Does + subject + base verb for a present-simple question."
      ),
      multipleChoiceItem(
        "a2-12c-mc-3",
        "Choose the correct question form.",
        "____ at the market yesterday?",
        ["What they bought", "What did they buy", "What have they buy"],
        1,
        "Use question word + did + subject + base verb."
      ),
      multipleChoiceItem(
        "a2-12c-mc-4",
        "Choose the correct question form.",
        "____ while her flat is being painted?",
        ["Where Marta is staying", "Where is Marta staying", "Where does Marta staying"],
        1,
        "Put is before the subject in a present-continuous question."
      ),
      multipleChoiceItem(
        "a2-12c-mc-5",
        "Choose the correct question form.",
        "____ without glasses?",
        ["Can you read", "Do you can read", "Can read you"],
        0,
        "Put can before the subject and use the base verb read."
      ),
      multipleChoiceItem(
        "a2-12c-mc-6",
        "Choose the correct question form.",
        "____ us after work?",
        ["Do they going to join", "They are going to join", "Are they going to join"],
        2,
        "Put Are before they in a going to question."
      ),
      multipleChoiceItem(
        "a2-12c-mc-7",
        "Choose the correct question form.",
        "____ this artist's work before?",
        ["Have you seen", "Did you seen", "Do you have seen"],
        0,
        "Use Have + subject + past participle for an experience without a finished time."
      ),
      placeholderGapItem(
        "a2-12c-gf-1",
        "Complete the question with the correct form of be.",
        "Where __________ the documents? (be)",
        "are",
        [],
        "Use are with the plural subject documents."
      ),
      doubleGap(
        "a2-12c-gf-2",
        "Complete the present-simple question. Use the verb in brackets.",
        ["What time ", { gapId: "g1" }, " the shop ", { gapId: "g2" }, "? (close)"],
        ["does"],
        ["close"],
        "Use does before the subject and the base verb close."
      ),
      doubleGap(
        "a2-12c-gf-3",
        "Complete the past-simple question. Use the verb in brackets.",
        ["Why ", { gapId: "g1" }, " you ", { gapId: "g2" }, " the meeting early? (leave)"],
        ["did"],
        ["leave"],
        "Use did before the subject and the base verb leave."
      ),
      placeholderChoiceGapItem(
        "a2-12c-cg-1",
        "Choose the correct helping verb for each question.",
        "____ your neighbours friendly? ____ they have children? ____ they moved in yet? ____ they moving furniture now?",
        ["Are", "Do", "Have", "Are"],
        "Choose be for adjectives and continuous forms, do for the present simple, and have for the present perfect.",
        ["Are", "Do", "Did", "Have", "Can"]
      ),
      errorCorrectionItem(
        "a2-12c-ec-1",
        "Check the highlighted phrase.",
        "Where you work during the week?",
        "Where you work",
        false,
        "Where do you work",
        "Use do before the subject in a present-simple question."
      ),
      errorCorrectionItem(
        "a2-12c-ec-2",
        "Check the highlighted phrase.",
        "What means this word?",
        "What means this word",
        false,
        "What does this word mean",
        "Use does before the subject and the base verb mean after it."
      ),
      errorCorrectionItem(
        "a2-12c-ec-3",
        "Check the highlighted phrase.",
        "Where did Sofia went after lunch?",
        "did Sofia went",
        false,
        "did Sofia go",
        "Use the base verb go after did and the subject."
      ),
      wordOrderItem(
        "a2-12c-wo-1",
        "Put the words in the correct order.",
        ["doing", "What", "you", "are", "now"],
        "What are you doing now?",
        "Use question word + be + subject + verb-ing."
      ),
      wordOrderItem(
        "a2-12c-wo-2",
        "Put the words in the correct order.",
        ["been", "How", "you", "here", "have", "long"],
        "How long have you been here?",
        "Use question phrase + have + subject + past participle."
      ),
      {
        id: "a2-12c-interview-1",
        type: "gap-fill",
        prompt: "Complete the interview questions with the verbs in brackets.",
        parts: [
          "Where ",
          { gapId: "g1" },
          " you ",
          { gapId: "g2" },
          "? (live) What ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          "? (study) ",
          { gapId: "g5" },
          " you speak any other languages? What kind of music ",
          { gapId: "g6" },
          " you like?",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["do"], feedback: "Use do before you in a present-simple question." },
          { id: "g2", acceptedAnswers: ["live"], feedback: "Use the base verb live after the subject." },
          { id: "g3", acceptedAnswers: ["do"], feedback: "Use do before you in the second present-simple question." },
          { id: "g4", acceptedAnswers: ["study"], feedback: "Use the base verb study after the subject." },
          { id: "g5", acceptedAnswers: ["Can"], feedback: "Put Can before the subject." },
          { id: "g6", acceptedAnswers: ["do"], feedback: "Use do before you with the main verb like." },
        ],
      },
      {
        id: "a2-12c-trip-1",
        type: "gap-fill",
        prompt: "Complete the travel questions with the correct helping verbs and verb forms.",
        parts: [
          "A: ",
          { gapId: "g1" },
          " you ever ",
          { gapId: "g2" },
          " to Dublin? (be)\nB: Yes, I have.\nA: When ",
          { gapId: "g3" },
          " you ",
          { gapId: "g4" },
          " there? (go)\nB: Last spring.\nA: ",
          { gapId: "g5" },
          " you going to visit again?\nB: Yes, I am.",
        ],
        gaps: [
          { id: "g1", acceptedAnswers: ["Have"], feedback: "Begin the experience question with Have." },
          { id: "g2", acceptedAnswers: ["been"], feedback: "Use the past participle been after ever." },
          { id: "g3", acceptedAnswers: ["did"], feedback: "Use did to ask when the finished trip happened." },
          { id: "g4", acceptedAnswers: ["go"], feedback: "Use the base verb go after the subject." },
          { id: "g5", acceptedAnswers: ["Are"], feedback: "Use Are before you in a going to question." },
        ],
      },
    ],
  },
  {
    id: "second-conditional-reformulation",
    title: "Second Conditional Reformulation",
    shortDescription: "Rewrite each sentence using the second conditional.",
    levels: ["b1", "b2"],
    intro:
      "Complete each reformulation with the missing clause. You’ll get instant feedback after you submit.",
    items: [
      singleGap(
        "sc1",
        "Use the second conditional.",
        ["If he saved money, ", { gapId: "g1" }, "."],
        [
          "he could buy a computer",
          "he'd buy a computer",
          "he would buy a computer",
          "he would be able to buy a computer",
          "he'd be able to buy a computer",
        ],
        "Use the second conditional: if + past simple, then would/could + base verb.",
        { originalSentence: "He doesn’t save money, so he can’t buy a computer." }
      ),
      singleGap(
        "sc2",
        "Use the second conditional.",
        ["I would wake up early ", { gapId: "g1" }, "."],
        ["if i set the alarm", "if i set an alarm"],
        "The missing clause should be an if-clause in the past simple: if I set the alarm.",
        { originalSentence: "I don’t wake up early because I don’t set the alarm." }
      ),
      singleGap(
        "sc3",
        "Use the second conditional.",
        ["If she learned French, ", { gapId: "g1" }, "."],
        [
          "she could communicate in paris",
          "she would be able to communicate in paris",
        ],
        "After the if-clause, use would/could + base verb to describe the imaginary result.",
        { originalSentence: "She doesn’t learn French, so she can’t communicate in Paris." }
      ),
      singleGap(
        "sc4",
        "Use the second conditional.",
        ["We would grow vegetables ", { gapId: "g1" }, "."],
        ["if we had a garden"],
        "Use the unreal condition with past simple: if we had a garden.",
        { originalSentence: "We don’t have a garden, so we don’t grow vegetables." }
      ),
      singleGap(
        "sc5",
        "Use the second conditional.",
        ["If they liked art, ", { gapId: "g1" }, "."],
        ["they would visit museums", "they'd visit museums"],
        "The result clause should use would + base verb: they would visit museums.",
        { originalSentence: "They don’t visit museums because they don’t like art." }
      ),
      singleGap(
        "sc6",
        "Use the second conditional.",
        ["I would have fresh bread ", { gapId: "g1" }, "."],
        [
          "if i baked often",
          "if i baked more often",
          "if i were to bake more often",
        ],
        "Both forms are natural here. The key is the if-clause in the past simple.",
        { originalSentence: "I don’t bake often, so I don’t have fresh bread." }
      ),
      singleGap(
        "sc7",
        "Use the second conditional.",
        ["He wouldn’t miss the news ", { gapId: "g1" }, "."],
        ["if he read headlines", "if he read the headlines"],
        "Use the if-clause in the past simple: if he read headlines.",
        { originalSentence: "He misses the news because he doesn’t read the headlines." }
      ),
      singleGap(
        "sc8",
        "Use the second conditional.",
        ["She would wear sunglasses ", { gapId: "g1" }, "."],
        [
          "if it were sunny",
          "if it was sunny",
          "if it weren't cloudy",
          "if it wasn't cloudy",
        ],
        "Both 'were' and 'was' are accepted here. The important part is the unreal condition.",
        { originalSentence: "She doesn’t wear sunglasses because it isn’t sunny." }
      ),
      singleGap(
        "sc9",
        "Use the second conditional.",
        ["If we ate vegetables, ", { gapId: "g1" }, "."],
        ["we wouldn't lack vitamins", "we would not lack vitamins"],
        "Use wouldn't + base verb in the result clause: we wouldn't lack vitamins.",
        { originalSentence: "We lack vitamins because we don’t eat vegetables." }
      ),
      singleGap(
        "sc10",
        "Use the second conditional.",
        ["They wouldn’t make mistakes ", { gapId: "g1" }, "."],
        ["if they practiced speaking", "if they practised speaking"],
        "The if-clause should use the past simple: if they practiced speaking.",
        { originalSentence: "They make mistakes because they don’t practise speaking." }
      ),
    ],
  },
  {
    id: "used-to-forms",
    title: "Used To Forms",
    shortDescription: "Practise used to, didn’t use to, and be used to.",
    levels: ["b2"],
    intro:
      "Fill each gap with the correct used to form. Focus on past habits versus being accustomed to something.",
    items: [
      singleGap(
        "ut1",
        "I usually just run a few miles at a time.",
        ["I ", { gapId: "g1" }, " long distances. (run)"],
        [
          "am not used to running",
          "i'm not used to running",
        ],
        "This sentence is about what feels unfamiliar now, so use 'be not used to + -ing': I'm not used to running long distances."
      ),
      singleGap(
        "ut2",
        "Sara only sees her parents on special occasions now.",
        ["Sara ", { gapId: "g1" }, " her parents all the time. (see)"],
        ["used to see"],
        "This refers to a repeated past situation, so 'used to see' is the natural form."
      ),
      singleGap(
        "ut3",
        "When I lived in Mexico, I had to speak Spanish every day.",
        ["When I lived in Mexico, I had to ", { gapId: "g1" }, " Spanish every day. (speak)"],
        ["get used to speaking"],
        "Here the meaning is adaptation, so 'had to get used to speaking' is the best fit."
      ),
      singleGap(
        "ut4",
        "It's easy for my sister to get up at 5am as she does it every day.",
        ["My sister ", { gapId: "g1" }, " at 5am. (get up)"],
        ["is used to getting up"],
        "Use 'be used to + -ing' for something that feels normal now."
      ),
      singleGap(
        "ut5",
        "It was strange for Jane to call teachers by their first name when she first came to the U.S.",
        ["Akiko ", { gapId: "g1" }, " teachers by their first name when she first came to the U.S. (call)"],
        [
          "wasn't used to calling",
          "was not used to calling",
        ],
        "Use 'wasn't used to + -ing' for something that felt unfamiliar at that time."
      ),
      singleGap(
        "ut6",
        "Monica ate hamburgers all the time before becoming a vegetarian.",
        ["Monica ", { gapId: "g1" }, " hamburgers all the time before becoming a vegetarian. (eat)"],
        ["used to eat"],
        "This is a discontinued past habit, so 'used to eat' fits best."
      ),
      singleGap(
        "ut7",
        "My co-worker doesn't diet anymore since she got pregnant.",
        ["My coworker ", { gapId: "g1" }, " for health reasons, but she stopped after she got pregnant. (diet)"],
        ["used to diet"],
        "Use 'used to + verb' for something that happened regularly in the past."
      ),
      singleGap(
        "ut8",
        "I studied a lot in high school. I was pretty nerdy.",
        ["I ", { gapId: "g1" }, " a lot in high school. (study)"],
        ["used to study"],
        "Use 'used to study' for a repeated past habit."
      ),
      singleGap(
        "ut9",
        "Now that Sam lives in the UK, he drinks tea instead of coffee, but it's still a little strange!",
        ["Now that Sam lives in the UK, he ", { gapId: "g1" }, " tea instead of coffee. (drink)"],
        ["is getting used to drinking", "is used to drinking"],
        "Both can work: 'is getting used to' stresses the transition, while 'is used to' stresses familiarity."
      ),
      singleGap(
        "ut10",
        "After Mike moved to Japan, he had to use chopsticks.",
        ["After Mike moved to Japan, he had to ", { gapId: "g1" }, " chopsticks. (use)"],
        ["get used to using"],
        "After moving, the meaning is adaptation over time, so 'get used to using' is the best answer."
      ),
      singleGap(
        "ut11",
        "I could never live in a cold climate. I need the sunshine!",
        ["I could never ", { gapId: "g1" }, " in a cold climate. (live)"],
        ["get used to living"],
        "With 'could never', the natural meaning is 'never become accustomed to', so 'get used to living' is the best answer."
      ),
      singleGap(
        "ut12",
        "I'm a farmer, so I get up early. I've been doing it for years.",
        ["I'm a farmer, so I ", { gapId: "g1" }, " early. (get up)"],
        ["am used to getting up"],
        "Use 'am used to + -ing' for a routine that feels normal now."
      ),
      singleGap(
        "ut13",
        "I didn't recognise you because you're wearing sunglasses now.",
        ["You ", { gapId: "g1" }, " glasses, did you? (wear)"],
        [
          "didn't use to wear",
          "did not use to wear",
          "didn't used to wear",
          "did not used to wear",
        ],
        "In negatives and questions, learners commonly write 'didn't use to'. We also accept the spoken variant with 'used'."
      ),
    ],
  },
  {
    id: "present-simple-or-continuous",
    title: "Present Simple or Continuous",
    shortDescription: "Choose between present simple and present continuous.",
    levels: ["b1"],
    intro:
      "Complete each sentence with the best present simple or present continuous form. Watch for stative verbs and temporary situations.",
    items: [
      singleGap(
        "psc1",
        "Complete the sentence with the correct form of the verb.",
        ["Be quiet! The baby ", { gapId: "g1" }, ". (sleep)"],
        ["is sleeping"],
        "Use the present continuous for something happening right now."
      ),
      {
        id: "psc2",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "She usually ",
          { gapId: "g1" },
          " jeans, but today she ",
          { gapId: "g2" },
          " a dress. (wear)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["wears"],
            feedback: "Use the present simple with 'usually' for a routine.",
          },
          {
            id: "g2",
            acceptedAnswers: ["is wearing", "'s wearing"],
            feedback: "Use the present continuous for today's temporary situation.",
          },
        ],
      },
      singleGap(
        "psc3",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " next to Marta right now. (sit)"],
        ["am sitting"],
        "Use the present continuous because the action is happening now."
      ),
      {
        id: "psc4",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "He ",
          { gapId: "g1" },
          " to work by bike every day, but this week he ",
          { gapId: "g2" },
          " the bus. (go/take)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["goes"],
            feedback: "Use the present simple for the usual routine: he goes to work by bike every day.",
          },
          {
            id: "g2",
            acceptedAnswers: ["is taking", "'s taking", "takes"],
            feedback: "The idea is a temporary arrangement this week, so 'is taking' is best. 'Takes' is also accepted as a practical variant.",
          },
        ],
      },
      singleGap(
        "psc5",
        "Complete the sentence with the correct form of the verb.",
        ["She ", { gapId: "g1" }, " to understand the question. Can you repeat it? (not seem)"],
        ["doesn't seem", "does not seem"],
        "'Seem' is normally stative here, so use the present simple."
      ),
      singleGap(
        "psc6",
        "Complete the sentence with the correct form of the verb.",
        ["This soup ", { gapId: "g1" }, " delicious. (taste)"],
        ["tastes"],
        "When 'taste' describes flavour, the present simple is the usual choice."
      ),
      singleGap(
        "psc7",
        "Complete the sentence with the correct form of the verb.",
        ["More and more people ", { gapId: "g1" }, " electric cars these days. (buy)"],
        ["are buying"],
        "Use the present continuous for a current trend or change."
      ),
      singleGap(
        "psc8",
        "Complete the sentence with the correct form of the verb.",
        ["My parents ", { gapId: "g1" }, " in a hotel this week because their house is being painted. (stay)"],
        ["are staying"],
        "Use the present continuous for a temporary arrangement this week."
      ),
      singleGap(
        "psc9",
        "Complete the sentence with the correct form of the verb.",
        ["What ", { gapId: "g1" }, " about the new policy? (you/think)"],
        ["do you think"],
        "Use the present simple for opinions: What do you think...?"
      ),
      singleGap(
        "psc10",
        "Complete the sentence with the correct form of the verb.",
        ["Be quiet! I ", { gapId: "g1" }, " to a strange noise. (listen)"],
        ["am listening"],
        "Use the present continuous because the action is happening right now."
      ),
      singleGap(
        "psc11",
        "Complete the sentence with the correct form of the verb.",
        ["This cake ", { gapId: "g1" }, " great! (smell)"],
        ["smells"],
        "When 'smell' describes the quality of something, the present simple is the usual choice."
      ),
      singleGap(
        "psc12",
        "Complete the sentence with the correct form of the verb.",
        ["We ", { gapId: "g1" }, " a great time on our holiday. I don't want to go home. (have)"],
        ["are having"],
        "Use the present continuous for the current holiday experience."
      ),
      singleGap(
        "psc13",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " the doctor at 4 o’clock this afternoon. (see)"],
        ["am seeing"],
        "Use the present continuous for a fixed future arrangement."
      ),
      singleGap(
        "psc14",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " what you mean. (see)"],
        ["see"],
        "When 'see' means understand, it is normally stative, so use the present simple."
      ),
      singleGap(
        "psc15",
        "Complete the sentence with the correct form of the verb.",
        ["She ", { gapId: "g1" }, " in ghosts. (not/believe)"],
        ["doesn't believe", "does not believe"],
        "'Believe' is stative here, so use the present simple negative."
      ),
      singleGap(
        "psc16",
        "Complete the sentence with the correct form of the verb.",
        ["Why ", { gapId: "g1" }, " at me like that? (you/look)"],
        ["are you looking"],
        "Use the present continuous because the action is happening now."
      ),
      singleGap(
        "psc17",
        "Complete the sentence with the correct form of the verb.",
        ["You ", { gapId: "g1" }, " a bit tired today. (look)"],
        ["look"],
        "Here 'look' describes appearance, so the present simple is the usual choice."
      ),
      singleGap(
        "psc18",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " about changing my job. (think)"],
        ["am thinking"],
        "Use the present continuous when 'think about' describes a current process or plan."
      ),
      {
        id: "psc19",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "We always ",
          { gapId: "g1" },
          " in the back row, but today we ",
          { gapId: "g2" },
          " in front. (sit)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["sit"],
            feedback: "Use the present simple with 'always' for a routine.",
          },
          {
            id: "g2",
            acceptedAnswers: ["are sitting"],
            feedback: "Use the present continuous for today's different temporary situation.",
          },
        ],
      },
    ],
  },
  {
    id: "present-perfect-simple-or-continuous",
    title: "Present Perfect Simple or Continuous",
    shortDescription: "Choose between present perfect simple and continuous.",
    levels: ["b1", "b2"],
    intro:
      "Complete each sentence with the correct present perfect form. Think about finished results versus ongoing duration.",
    items: [
      singleGap(
        "pp1",
        "Complete the sentence with the correct form of the verb.",
        ["Be careful — I ", { gapId: "g1" }, " coffee on the floor! (just/spill)"],
        ["have just spilled", "have just spilt", "'ve just spilled", "'ve just spilt"],
        "Use the present perfect simple for a very recent completed result."
      ),
      singleGap(
        "pp2",
        "Complete the sentence with the correct form of the verb.",
        ["Sorry I’m out of breath. I ", { gapId: "g1" }, " all the way here. (run)"],
        ["have been running", "'ve been running"],
        "Use the present perfect continuous to focus on the recent activity causing the current result."
      ),
      singleGap(
        "pp3",
        "Complete the sentence with the correct form of the verb.",
        ["She ", { gapId: "g1" }, " her homework already. (finish)"],
        ["has finished", "'s finished"],
        "Use the present perfect simple because the homework is complete."
      ),
      {
        id: "pp4",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: ["Look at your hands! What ", { gapId: "g1" }, " you ", { gapId: "g2" }, "? (do)"],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["have"],
            feedback: "Use 'have' to build the present perfect question with 'you'.",
          },
          {
            id: "g2",
            acceptedAnswers: ["been doing"],
            feedback: "Use the present perfect continuous to ask about the recent activity causing the visible result.",
          },
        ],
      },
      {
        id: "pp5",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "We ",
          { gapId: "g1" },
          " the kitchen, and that’s why it looks great. We ",
          { gapId: "g2" },
          " the oven for an hour. (clean/scrub)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["have cleaned", "'ve cleaned"],
            feedback: "Use the present perfect simple for the finished visible result.",
          },
          {
            id: "g2",
            acceptedAnswers: ["have been scrubbing", "'ve been scrubbing"],
            feedback: "Use the present perfect continuous for the duration/activity.",
          },
        ],
      },
      singleGap(
        "pp6",
        "Complete the sentence with the correct form of the verb.",
        ["It ", { gapId: "g1" }, " all day; the streets are soaked. (rain)"],
        ["has been raining", "'s been raining"],
        "Use the present perfect continuous because the action has been continuing up to now."
      ),
      singleGap(
        "pp7",
        "Complete the sentence with the correct form of the verb.",
        ["It ", { gapId: "g1" }, " three times this week. (rain)"],
        ["has rained", "'s rained"],
        "Use the present perfect simple to count completed events."
      ),
      {
        id: "pp8",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "I ",
          { gapId: "g1" },
          " Spanish for three years, and I ",
          { gapId: "g2" },
          " 500 new words so far. (study/learn)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["have been studying", "'ve been studying"],
            feedback: "Use the present perfect continuous for an activity over a period of time.",
          },
          {
            id: "g2",
            acceptedAnswers: ["have learned", "have learnt", "'ve learned", "'ve learnt"],
            feedback: "Use the present perfect simple for the accumulated result.",
          },
        ],
      },
      {
        id: "pp9",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "He ",
          { gapId: "g1" },
          " the car, so you can drive it now. He ",
          { gapId: "g2" },
          " on it all morning. (repair/work)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["has repaired", "has fixed", "'s repaired", "'s fixed"],
            feedback: "Use the present perfect simple for the finished result: the car is ready now.",
          },
          {
            id: "g2",
            acceptedAnswers: ["has been working", "'s been working"],
            feedback: "Use the present perfect continuous for the ongoing activity over time.",
          },
        ],
      },
      singleGap(
        "pp10",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " my keys! Have you seen them? (lose)"],
        ["have lost", "'ve lost"],
        "Use the present perfect simple for a completed action with a present consequence."
      ),
      singleGap(
        "pp11",
        "Complete the sentence with the correct form of the verb.",
        ["I’m covered in flour because I ", { gapId: "g1" }, ". (bake)"],
        ["have been baking", "'ve been baking"],
        "Use the present perfect continuous to explain the current evidence."
      ),
      {
        id: "pp12",
        prompt: "Complete the sentence with the correct form of the verb.",
        parts: [
          "She ",
          { gapId: "g1" },
          " dinner. That’s why the kitchen smells great. She ",
          { gapId: "g2" },
          " lasagna, your favourite. (cook/make)",
        ],
        gaps: [
          {
            id: "g1",
            acceptedAnswers: ["has been cooking", "'s been cooking"],
            feedback: "Use the present perfect continuous for the recent activity causing the current smell.",
          },
          {
            id: "g2",
            acceptedAnswers: ["has made", "'s made"],
            feedback: "Use the present perfect simple for the finished result: the lasagna now exists.",
          },
        ],
      },
      singleGap(
        "pp13",
        "Complete the sentence with the correct form of the verb.",
        ["He ", { gapId: "g1" }, " that book for days. (read)"],
        ["has been reading", "'s been reading"],
        "Use the present perfect continuous for an activity continuing over several days."
      ),
      singleGap(
        "pp14",
        "Complete the sentence with the correct form of the verb.",
        ["We ", { gapId: "g1" }, " for you since 5:00. (wait)"],
        ["have been waiting", "'ve been waiting"],
        "Use the present perfect continuous with 'since' to show duration."
      ),
      singleGap(
        "pp15",
        "Complete the sentence with the correct form of the verb.",
        ["They ", { gapId: "g1" }, " London twice this year. (visit)"],
        ["have visited", "'ve visited"],
        "Use the present perfect simple because you are counting completed visits."
      ),
    ],
  },
  {
    id: "question-tags",
    title: "Question Tags Trainer",
    shortDescription: "Build the correct question tag for each sentence.",
    levels: ["b1", "b2"],
    intro:
      "Type the full tag. The checker accepts natural punctuation variants, so you can focus on the grammar.",
    items: [
      singleGap(
        "qt1",
        "She’s from Madrid,",
        [{ gapId: "g1" }, "?"],
        ["isn't she"],
        "A positive statement with 'be' takes a negative tag: isn't she?"
      ),
      singleGap(
        "qt2",
        "You play the guitar,",
        [{ gapId: "g1" }, "?"],
        ["don't you"],
        "A positive present simple statement takes a negative 'do' tag: don't you?"
      ),
      singleGap(
        "qt3",
        "We aren't meeting at six,",
        [{ gapId: "g1" }, "?"],
        ["are we"],
        "A negative present continuous statement takes a positive tag: are we?"
      ),
      singleGap(
        "qt4",
        "It was expensive,",
        [{ gapId: "g1" }, "?"],
        ["wasn't it"],
        "A positive past simple 'be' statement takes a negative tag: wasn't it?"
      ),
      singleGap(
        "qt5",
        "They finished early,",
        [{ gapId: "g1" }, "?"],
        ["didn't they"],
        "A positive past simple statement takes a negative 'did' tag."
      ),
      singleGap(
        "qt6",
        "She wasn't studying all night,",
        [{ gapId: "g1" }, "?"],
        ["was she"],
        "A negative past continuous statement takes a positive tag."
      ),
      singleGap(
        "qt7",
        "He’s already eaten,",
        [{ gapId: "g1" }, "?"],
        ["hasn't he"],
        "Present perfect positive statements take a negative 'has' tag."
      ),
      singleGap(
        "qt8",
        "They hadn't left before noon,",
        [{ gapId: "g1" }, "?"],
        ["had they"],
        "A negative past perfect statement takes a positive tag."
      ),
      singleGap(
        "qt9",
        "She’s going to call later,",
        [{ gapId: "g1" }, "?"],
        ["isn't she"],
        "With 'going to', keep the auxiliary 'be' in the tag: isn't she?"
      ),
      singleGap(
        "qt10",
        "They won't be working on Friday,",
        [{ gapId: "g1" }, "?"],
        ["will they"],
        "A negative future continuous statement takes a positive 'will' tag."
      ),
      singleGap(
        "qt11",
        "He’ll have finished by six,",
        [{ gapId: "g1" }, "?"],
        ["won't he"],
        "A positive future perfect statement usually takes a negative tag: won't he?"
      ),
      singleGap(
        "qt12",
        "We shouldn't start now,",
        [{ gapId: "g1" }, "?"],
        ["should we"],
        "A negative modal statement takes a positive tag: should we?"
      ),
      singleGap(
        "qt13",
        "They must be tired,",
        [{ gapId: "g1" }, "?"],
        ["mustn't they"],
        "A positive 'must' statement takes a negative tag. Some speakers, especially Americans, might say 'aren't they?'"
      ),
      singleGap(
        "qt14",
        "She could have told us,",
        [{ gapId: "g1" }, "?"],
        ["couldn't she"],
        "A positive modal perfect statement takes a negative tag."
      ),
      singleGap(
        "qt15",
        "Close the window,",
        [{ gapId: "g1" }, "?"],
        ["will you", "would you", "won't you"],
        "Imperatives often take 'will you?' as the standard tag. Other polite variants are common too."
      ),
      singleGap(
        "qt16",
        "Don’t be late,",
        [{ gapId: "g1" }, "?"],
        ["will you", "would you", "won't you"],
        "Negative imperatives typically take 'will you?'"
      ),
      singleGap(
        "qt17",
        "Let’s start the meeting,",
        [{ gapId: "g1" }, "?"],
        ["shall we"],
        "After 'Let's...', the normal tag is 'shall we?'"
      ),
      singleGap(
        "qt18",
        "He used to smoke,",
        [{ gapId: "g1" }, "?"],
        ["didn't he"],
        "With 'used to', the tag is usually formed with 'did': didn't he?"
      ),
      singleGap(
        "qt19",
        "They would visit every summer,",
        [{ gapId: "g1" }, "?"],
        ["wouldn't they"],
        "A positive 'would' statement takes a negative tag."
      ),
      singleGap(
        "qt20",
        "Nobody called,",
        [{ gapId: "g1" }, "?"],
        ["did they"],
        "Negative words like 'nobody' make the sentence negative in meaning, so the tag is positive."
      ),
      singleGap(
        "qt21",
        "Nothing works in this old laptop,",
        [{ gapId: "g1" }, "?"],
        ["does it"],
        "Negative words like 'nothing' take a positive tag."
      ),
      singleGap(
        "qt22",
        "They haven't been waiting long,",
        [{ gapId: "g1" }, "?"],
        ["have they"],
        "A negative present perfect continuous statement takes a positive tag."
      ),
      singleGap(
        "qt23",
        "The match was postponed,",
        [{ gapId: "g1" }, "?"],
        ["wasn't it"],
        "A positive passive statement still follows the normal auxiliary pattern: wasn't it?"
      ),
    ],
  },
  {
    id: "passive-voice-reformulation",
    title: "Passive Voice Reformulation",
    shortDescription: "Rewrite active sentences in the passive.",
    levels: ["b1", "b2"],
    intro:
      "Transform each sentence so the passive form is grammatically correct. Watch the tense and modal structure carefully.",
    items: [
      singleGap(
        "pv1",
        "They are redecorating my house at the moment.",
        ["My house ", { gapId: "g1" }, " at the moment."],
        ["is being redecorated"],
        "Use the present continuous passive: is being + past participle."
      ),
      singleGap(
        "pv2",
        "Someone broke the window last night.",
        ["The window ", { gapId: "g1" }, " last night."],
        ["was broken"],
        "Use the past simple passive: was broken."
      ),
      singleGap(
        "pv3",
        "They have delivered the parcel.",
        ["The parcel ", { gapId: "g1" }, "."],
        ["has been delivered"],
        "Use the present perfect passive: has been delivered."
      ),
      singleGap(
        "pv4",
        "They were repairing the road when I arrived.",
        ["The road ", { gapId: "g1" }, " when I arrived."],
        ["was being repaired"],
        "Use the past continuous passive: was being repaired."
      ),
      singleGap(
        "pv5",
        "They are going to announce the results tomorrow.",
        ["The results ", { gapId: "g1" }, " tomorrow."],
        ["are going to be announced"],
        "With 'going to', use 'are going to be + past participle'."
      ),
      singleGap(
        "pv6",
        "They will build a new school here.",
        ["A new school ", { gapId: "g1" }, " here."],
        ["will be built"],
        "Use the future passive: will be built."
      ),
      singleGap(
        "pv7",
        "People can see the mountains from here.",
        ["The mountains ", { gapId: "g1" }, " from here."],
        ["can be seen"],
        "With a modal, use modal + be + past participle."
      ),
      singleGap(
        "pv8",
        "Someone should fix that leak soon.",
        ["That leak ", { gapId: "g1" }, " soon."],
        ["should be fixed"],
        "With 'should', use should be + past participle."
      ),
      singleGap(
        "pv9",
        "They must finish this project by Friday.",
        ["This project ", { gapId: "g1" }, " by Friday."],
        ["must be finished", "must be completed"],
        "With 'must', use must be + past participle."
      ),
      singleGap(
        "pv10",
        "Someone might have stolen my bag.",
        ["My bag ", { gapId: "g1" }, "."],
        ["might have been stolen"],
        "For a modal perfect passive, use might have been + past participle."
      ),
      singleGap(
        "pv11",
        "I don't like it when people watch me.",
        ["I don't like ", { gapId: "g1" }, "."],
        ["being watched"],
        "After 'like', use the gerund passive: being watched."
      ),
      singleGap(
        "pv12",
        "I need to edit this document.",
        ["This document needs ", { gapId: "g1" }, "."],
        ["to be edited", "editing"],
        "Both 'needs to be edited' and the shorter passive-like form 'needs editing' are natural."
      ),
      singleGap(
        "pv13",
        "They had already completed the task before I arrived.",
        ["The task ", { gapId: "g1" }, " before I arrived."],
        ["had already been completed", "had been completed already"],
        "Use the past perfect passive: had already been completed."
      ),
      singleGap(
        "pv14",
        "They serve breakfast at 8 o'clock.",
        ["Breakfast ", { gapId: "g1" }, " at 8 o'clock."],
        ["is served"],
        "Use the present simple passive: is served."
      ),
      singleGap(
        "pv15",
        "They will have completed the tests by next week.",
        ["The tests ", { gapId: "g1" }, " by next week."],
        ["will have been completed", "will have been finished"],
        "Use the future perfect passive: will have been completed."
      ),
    ],
  },
  {
    id: "question-word-order-a2-b1",
    title: "Question Formation Mastery",
    shortDescription: "Master ASI and QuASI patterns in Present and Past Simple.",
    levels: ["a2", "b1"],
    intro:
      "Practice building questions correctly. Remember: use inversion for 'be' and 'can', but use ASI/QuASI for other verbs. Finish by unjumbling some question forms.",
    items: [
      multipleChoiceItem(
        "qwo-mc-1",
        "Choose the correct auxiliary.",
        "____ your parents live in a big house?",
        ["Are", "Do", "Does"],
        1,
        "Use 'Do' for present simple questions with 'I/you/we/they'."
      ),
      multipleChoiceItem(
        "qwo-mc-2",
        "Choose the correct question form.",
        "____ a bank near here?",
        ["Is there", "Does there", "There is"],
        0,
        "For questions with 'be', we invert the verb and the subject: 'Is there...?'."
      ),
      multipleChoiceItem(
        "qwo-mc-3",
        "Choose the correct auxiliary.",
        "Where ____ you go on holiday last year?",
        ["do", "were", "did"],
        2,
        "Use 'did' for past simple questions with most verbs."
      ),
      multipleChoiceItem(
        "qwo-mc-5",
        "Choose the correct auxiliary.",
        "____ you sit here, please?",
        ["Can", "Do", "Are"],
        0,
        "Use 'Can' for requests or asking about ability; it follows the inversion pattern."
      ),
      errorCorrectionItem(
        "qwo-ec-1",
        "Check the highlighted phrase for errors.",
        "When did you started studying English?",
        "did you started",
        false,
        "did you start",
        "After 'did', always use the infinitive (base form) of the verb."
      ),
      errorCorrectionItem(
        "qwo-ec-2",
        "Check the highlighted phrase for errors.",
        "Where were you born?",
        "were you born",
        true,
        "",
        "Correct! With the verb 'be', we invert the subject and verb: 'you were' -> 'were you'."
      ),
      errorCorrectionItem(
        "qwo-ec-3",
        "Check the highlighted phrase for errors.",
        "Does your sister works in an office?",
        "Does your sister works",
        false,
        "Does your sister work",
        "In questions with 'Does', the main verb loses its '-s' and stays in the infinitive form."
      ),
      errorCorrectionItem(
        "qwo-ec-4",
        "Check the highlighted phrase for errors.",
        "Who do you live with?",
        "Who do you live with",
        true,
        "",
        "Correct! In English, we often put the preposition (with) at the end of the question."
      ),
      placeholderGapItem(
        "qwo-gf-1",
        "Build the question from the prompt.",
        "What __________? (that noise / was)",
        "was that noise",
        [],
        "For questions with 'be' in the past, invert the verb and the subject."
      ),
      placeholderGapItem(
        "qwo-gf-2",
        "Build the question in present simple.",
        "Where __________? (your parents / live)",
        "do your parents live",
        [],
        "Follow the QuASI pattern: Question word (Where) + Auxiliary (do) + Subject (your parents) + Infinitive (live)."
      ),
      placeholderGapItem(
        "qwo-gf-4",
        "Build the question with the preposition at the end.",
        "Who __________? (you / wait / for)",
        "are you waiting for",
        ["do you wait for"],
        "Put the preposition 'for' at the end of the question."
      ),
      wordOrderItem(
        "qwo-wo-1",
        "Unjumble the question.",
        ["sister", "work", "your", "where", "does"],
        "Where does your sister work?",
        "Use QuASI order here: question word + auxiliary + subject + infinitive."
      ),
      wordOrderItem(
        "qwo-wo-2",
        "Unjumble the question.",
        ["start", "when", "studying", "you", "did", "English"],
        "When did you start studying English?",
        "After 'did', use the base form 'start', then continue with 'studying English'."
      ),
      wordOrderItem(
        "qwo-wo-3",
        "Unjumble the question.",
        ["you", "do", "with", "who", "live"],
        "Who do you live with?",
        "This tests the common pattern with the preposition at the end: 'Who do you live with?'"
      ),
      wordOrderItem(
        "qwo-wo-4",
        "Unjumble the question.",
        ["bank", "near", "is", "here", "there", "a"],
        "Is there a bank near here?",
        "With the verb 'be', make the question by inversion: 'Is there ...?'"
      ),
      wordOrderItem(
        "qwo-wo-5",
        "Unjumble the question.",
        ["talk", "what", "about", "they", "did"],
        "What did they talk about?",
        "Use QuASI order, and keep the preposition 'about' at the end."
      ),
      wordOrderItem(
        "qwo-wo-6",
        "Unjumble the question.",
        ["born", "where", "were", "you"],
        "Where were you born?",
        "Another inversion pattern with 'be' in the past: 'Where were you born?'"
      ),
    ],
  },
  {
    id: "present-simple-frequency-a2-b1",
    title: "Present Simple & Frequency",
    shortDescription: "Master third-person forms and the position of frequency adverbs.",
    levels: ["a2", "b1"],
    intro:
      "Practice the present simple for habits and general truths. Pay close attention to third-person singular (-s) and where you place words like 'often' or 'usually'!",
    items: [
      multipleChoiceItem(
        "psf-mc-1",
        "Choose the correct form.",
        "My brother ____ in the city centre.",
        ["work", "works", "is work"],
        1,
        "Use the third-person singular ending (-s) for 'he/she/it' in the present simple."
      ),
      multipleChoiceItem(
        "psf-mc-2",
        "Choose the most natural sentence.",
        "Which sentence is correct?",
        [
          "We often go out on Friday night.",
          "We go often out on Friday night.",
          "We often are go out on Friday night.",
        ],
        0,
        "Adverbs of frequency usually go before the main verb."
      ),
      multipleChoiceItem(
        "psf-mc-3",
        "Choose the correct option.",
        "It ____ in the desert.",
        ["doesn't never rain", "never rains", "never doesn't rain"],
        1,
        "Use a positive verb with 'never'."
      ),
      multipleChoiceItem(
        "psf-mc-4",
        "Choose the correct form.",
        "She ____ at weekends.",
        ["doesn't usually study", "doesn't usually studies", "not usually study"],
        0,
        "In negative sentences, use 'doesn't' + the infinitive (base form) of the verb."
      ),
      multipleChoiceItem(
        "psf-mc-5",
        "Choose the correct position.",
        "He ____ for work.",
        ["is always late", "always is late", "late is always"],
        0,
        "Adverbs of frequency go after the verb 'be'."
      ),
      errorCorrectionItem(
        "psf-ec-1",
        "Check the spelling of the highlighted verb.",
        "My friend studys every evening.",
        "studys",
        false,
        "studies",
        "For verbs ending in consonant + y, change the 'y' to 'i' and add '-es'."
      ),
      errorCorrectionItem(
        "psf-ec-2",
        "Check the highlighted phrase for errors.",
        "She doesn't usually study at weekends.",
        "doesn't usually study",
        true,
        "",
        "Correct! This uses the negative 'doesn't' with the infinitive and the correct adverb position."
      ),
      errorCorrectionItem(
        "psf-ec-3",
        "Check the highlighted phrase for errors.",
        "He has English classes every Mondays.",
        "every Mondays",
        false,
        "every Monday",
        "Use 'every' with the singular form: 'every Monday', not 'every Mondays'."
      ),
      errorCorrectionItem(
        "psf-ec-4",
        "Check the highlighted phrase for errors.",
        "I'm never ill.",
        "I'm never ill",
        true,
        "",
        "Correct! The adverb 'never' comes after the verb 'be'."
      ),
      errorCorrectionItem(
        "psf-ec-5",
        "Check the highlighted phrase for errors.",
        "My parents don't live near here.",
        "don't live",
        true,
        "",
        "Correct! Use 'don't' for negative sentences with 'I/you/we/they'."
      ),
      adverbPlacementItem(
        "psf-place-1",
        "Place the adverb in the correct position.",
        "She gets up early.",
        ["every day"],
        { "every day": 4 },
        "She gets up early every day.",
        "Expressions of frequency like 'every day' usually go at the end of a sentence."
      ),
      adverbPlacementItem(
        "psf-place-2",
        "Place the adverb in the correct position.",
        "We go to the cinema.",
        ["sometimes"],
        { sometimes: 1 },
        "We sometimes go to the cinema.",
        "Adverbs of frequency go before the main verb."
      ),
      adverbPlacementItem(
        "psf-place-3",
        "Place the adverb in the correct position.",
        "They are tired after work.",
        ["usually"],
        { usually: 2 },
        "They are usually tired after work.",
        "Adverbs of frequency go after the verb 'be'."
      ),
      singleGap(
        "psf-gf-1",
        "Complete the sentence with the correct form of the verb.",
        ["The lesson ", { gapId: "g1" }, " at 9:00. (finish)"],
        ["finishes"],
        "Add '-es' to verbs ending in -sh, -ch, -s, or -x."
      ),
      singleGap(
        "psf-gf-2",
        "Complete the sentence with the correct form of the verb.",
        ["She ", { gapId: "g1" }, " pop music. (not like)"],
        ["doesn't like", "does not like"],
        "Use 'doesn't' for negative sentences with 'she'."
      ),
    ],
  },
  {
    id: "simple-vs-continuous-a2-b1",
    title: "Present Simple or Continuous?",
    shortDescription: "Contrast habits with actions happening right now.",
    levels: ["a2", "b1"],
    intro:
      "Do you know when to use the simple or continuous? Focus on temporary situations, things happening now, and verbs that describe feelings (stative verbs)!",
    items: [
      multipleChoiceItem(
        "psc-mc-1",
        "Choose the correct response.",
        "A: What do you do? B: ____.",
        [
          "I'm working for an IT company.",
          "I work for an IT company.",
          "I working for an IT company.",
        ],
        1,
        "Use the present simple to talk about your general job or routine."
      ),
      multipleChoiceItem(
        "psc-mc-2",
        "Choose the correct form.",
        "I ____ this painting; it's beautiful!",
        ["am liking", "like", "likes"],
        1,
        "Verbs that describe feelings, like 'like', are normally used in the present simple, not continuous."
      ),
      multipleChoiceItem(
        "psc-mc-3",
        "Choose the correct form for an action happening now.",
        "Look! The woman ____ near the table.",
        ["is standing", "stands", "standing"],
        0,
        "Use the present continuous (be + verb + -ing) to describe what is happening in a picture or at this moment."
      ),
      multipleChoiceItem(
        "psc-mc-4",
        "Choose the correct spelling.",
        "They are ____ through the park.",
        ["runing", "running", "runing"],
        1,
        "If a verb finishes in consonant-vowel-consonant, double the final consonant before adding -ing."
      ),
      multipleChoiceItem(
        "psc-mc-5",
        "Choose the correct form for a temporary situation.",
        "My brother ____ a two-month course in the UK.",
        ["does", "is doing", "doing"],
        1,
        "Use the present continuous for temporary things happening around now, even if they aren't happening at this exact second."
      ),
      errorCorrectionItem(
        "psc-ec-1",
        "Check the highlighted phrase for errors.",
        "I'm needing a coffee right now.",
        "I'm needing",
        false,
        "I need",
        "Verbs like 'need', 'want', and 'like' are stative verbs and are not usually used in the continuous form."
      ),
      errorCorrectionItem(
        "psc-ec-2",
        "Check the spelling of the highlighted verb.",
        "Are you liveing in the city centre?",
        "liveing",
        false,
        "living",
        "For verbs ending in 'e', cut the 'e' before adding -ing."
      ),
      errorCorrectionItem(
        "psc-ec-3",
        "Check the highlighted phrase for errors.",
        "What are you doing? I'm checking my messages.",
        "I'm checking",
        true,
        "",
        "Correct! Use the present continuous for an action happening now."
      ),
      errorCorrectionItem(
        "psc-ec-4",
        "Check the highlighted phrase for errors.",
        "I'm liking Italian food.",
        "I'm liking",
        false,
        "I like",
        "We normally use verbs describing feelings in the present simple."
      ),
      errorCorrectionItem(
        "psc-ec-5",
        "Check the highlighted phrase for errors.",
        "I'm sending a message to Sarah.",
        "I'm sending",
        true,
        "",
        "Correct! This is an action happening at the moment of speaking."
      ),
      placeholderGapItem(
        "psc-gf-1",
        "Complete the sentence with the correct form.",
        "Be quiet! The baby __________. (sleep)",
        "is sleeping",
        [],
        "Use the present continuous for an action happening right now."
      ),
      placeholderGapItem(
        "psc-gf-2",
        "Complete the sentence.",
        "I __________ to go home now. (want)",
        "want",
        [],
        "'Want' is a non-action verb, so use the present simple even when talking about 'now'."
      ),
      placeholderGapItem(
        "psc-gf-3",
        "Complete the sentence with the correct form.",
        "She usually wears jeans, but today she __________ a dress. (wear)",
        "is wearing",
        [],
        "Contrast a routine (usually) with a temporary situation (today) using the continuous."
      ),
      placeholderGapItem(
        "psc-gf-4",
        "Complete the sentence.",
        "What __________ on TV? (you / watch)",
        "are you watching",
        [],
        "Use the present continuous question form for an action in progress."
      ),
      placeholderGapItem(
        "psc-gf-5",
        "Complete the sentence.",
        "My parents __________ near here. (not live)",
        "don't live",
        ["do not live"],
        "Use the present simple for things that are generally true."
      ),
    ],
  },
  {
    id: "past-simple-mastery-a2-b1",
    title: "Past Simple: Regular & Irregular",
    shortDescription: "Master finished actions, spelling rules, and negatives.",
    levels: ["a2", "b1"],
    intro:
      "Practice talking about the past. Remember the spelling rules for regular verbs and watch out for those tricky irregular forms!",
    items: [
      multipleChoiceItem(
        "ps-mc-1",
        "Choose the correct regular form.",
        "We ____ at a wonderful hotel last summer.",
        ["stay", "stayed", "staiyed"],
        1,
        "To make the past simple of most regular verbs, just add -ed."
      ),
      multipleChoiceItem(
        "ps-mc-2",
        "Choose the correct irregular form.",
        "I ____ to Turkey twice last year.",
        ["goed", "was go", "went"],
        2,
        "The verb 'go' is irregular; its past simple form is 'went'."
      ),
      multipleChoiceItem(
        "ps-mc-3",
        "Choose the correct negative form.",
        "She ____ to France with her family.",
        ["didn't go", "didn't went", "not went"],
        0,
        "Use 'didn't' + the infinitive (base form) for negative sentences in the past simple."
      ),
      multipleChoiceItem(
        "ps-mc-4",
        "Choose the correct auxiliary for a question.",
        "____ you stay for the weekend?",
        ["Were", "Did", "Do"],
        1,
        "Use 'Did' as the auxiliary for questions in the past simple."
      ),
      multipleChoiceItem(
        "ps-mc-5",
        "Choose the correct question.",
        "Where ____ you stay?",
        ["did", "were", "are"],
        0,
        "Follow the QuASI pattern: Question word + did + subject + infinitive."
      ),
      errorCorrectionItem(
        "ps-ec-1",
        "Check the spelling of the highlighted verb.",
        "I studyed for three hours last night.",
        "studyed",
        false,
        "studied",
        "For verbs ending in consonant + y, change the 'y' to 'i' and add -ed."
      ),
      errorCorrectionItem(
        "ps-ec-2",
        "Check the highlighted phrase for errors.",
        "Did you saw the news this morning?",
        "did you saw",
        false,
        "did you see",
        "In questions, use 'did' + the infinitive. Do not use the past simple form of the main verb."
      ),
      errorCorrectionItem(
        "ps-ec-3",
        "Check the spelling of the highlighted verb.",
        "We stoped at the park for a picnic.",
        "stoped",
        false,
        "stopped",
        "If a verb finishes in consonant-vowel-consonant, double the final consonant before adding -ed."
      ),
      errorCorrectionItem(
        "ps-ec-4",
        "Check the highlighted phrase for errors.",
        "He didn't stay with friends.",
        "didn't stay",
        true,
        "",
        "Correct! Use 'didn't' + infinitive for negative sentences."
      ),
      errorCorrectionItem(
        "ps-ec-5",
        "Check the highlighted phrase for errors.",
        "Why did you go to Madrid?",
        "Why did you go",
        true,
        "",
        "Correct! This follows the QuASI (Question word, Auxiliary, Subject, Infinitive) pattern."
      ),
      placeholderGapItem(
        "ps-gf-1",
        "Complete the sentence with the past simple form.",
        "I __________ (see) a great movie on Friday night.",
        "saw",
        [],
        "'See' is an irregular verb. Its past simple form is 'saw'."
      ),
      placeholderGapItem(
        "ps-gf-2",
        "Complete the sentence.",
        "They __________ (not like) the food at the restaurant.",
        "didn't like",
        ["did not like"],
        "Use 'didn't' + infinitive for negative past simple sentences."
      ),
      placeholderGapItem(
        "ps-gf-3",
        "Complete the question.",
        "What time __________ (you / arrive) yesterday?",
        "did you arrive",
        [],
        "Use 'did' + subject + infinitive to form a past simple question."
      ),
      placeholderGapItem(
        "ps-gf-4",
        "Complete the sentence with the correct spelling.",
        "The cat __________ (stop) running suddenly.",
        "stopped",
        [],
        "Remember to double the 'p' in 'stop' before adding -ed."
      ),
      placeholderGapItem(
        "ps-gf-5",
        "Complete the sentence with the past simple form.",
        "We __________ (stay) at home all weekend.",
        "stayed",
        [],
        "'Stay' is a regular verb; simply add -ed."
      ),
      wordOrderItem(
        "ps-wo-1",
        "Unjumble the question.",
        ["last", "you", "stay", "where", "did", "summer"],
        "Where did you stay last summer?",
        "Use QuASI order: question word + did + subject + infinitive + time expression."
      ),
      wordOrderItem(
        "ps-wo-2",
        "Unjumble the sentence.",
        ["Turkey", "year", "I", "to", "went", "last"],
        "I went to Turkey last year.",
        "This is a past simple statement: subject + past verb + place + time."
      ),
      wordOrderItem(
        "ps-wo-3",
        "Unjumble the question.",
        ["go", "why", "Madrid", "did", "you", "to"],
        "Why did you go to Madrid?",
        "Use QuASI order again: question word + did + subject + infinitive + destination."
      ),
    ],
  },
  {
    id: "past-simple-vs-continuous-a2-b1",
    title: "Past Continuous vs Past Simple",
    shortDescription: "Use the past continuous for background actions and the past simple for interruptions.",
    levels: ["a2", "b1"],
    intro:
      "Can you manage two actions at once? Use the Past Continuous for the longer background action and the Past Simple for the shorter event that interrupts it.",
    items: [
      multipleChoiceItem(
        "pscn-mc-1",
        "Which action was already happening?",
        "I was walking in the park when I saw a strange bird.",
        ["I was walking", "I saw a strange bird", "Both happened at once"],
        0,
        "The Past Continuous (was walking) describes the longer background action that was already in progress."
      ),
      multipleChoiceItem(
        "pscn-mc-2",
        "Choose the correct interruption.",
        "The birds were singing when suddenly __________.",
        ["it started to rain", "it was starting to rain", "it rain"],
        0,
        "Use the Past Simple for the sudden event that interrupts the background situation."
      ),
      multipleChoiceItem(
        "pscn-mc-3",
        "Choose the correct combination.",
        "What __________ when the accident happened?",
        ["were you doing", "did you do", "you were doing"],
        0,
        "Use the Past Continuous to ask about the action in progress at the specific moment of the accident."
      ),
      errorCorrectionItem(
        "pscn-ec-1",
        "Check the highlighted phrase for errors.",
        "When the phone rang, I was answering it.",
        "was answering",
        false,
        "answered",
        "If one action follows another in a sequence, use the Past Simple for both: 'The phone rang and I answered it'."
      ),
      errorCorrectionItem(
        "pscn-ec-2",
        "Check the highlighted phrase for errors.",
        "My sister arrived while I was having lunch.",
        "was having lunch",
        true,
        "",
        "Correct! 'Arrived' is the shorter interruption, and 'was having lunch' is the longer background action."
      ),
      errorCorrectionItem(
        "pscn-ec-3",
        "Check the highlighted phrase for errors.",
        "I was seeing a famous actor while I was waiting for the bus.",
        "was seeing",
        false,
        "saw",
        "Even in the middle of another action, 'seeing' the actor is a short, completed event (interruption)."
      ),
      doubleGap(
        "pscn-dg-1",
        "Complete the story with the correct tenses.",
        ["It ", { gapId: "g1" }, " when I ", { gapId: "g2" }, " the house. (rain / leave)"],
        ["was raining"],
        ["left"],
        "Background: It was raining. Interruption: I left the house."
      ),
      doubleGap(
        "pscn-dg-2",
        "Complete the story with the correct tenses.",
        ["We ", { gapId: "g1" }, " in the gardens when he ", { gapId: "g2" }, " a photo of us. (walk / take)"],
        ["were walking"],
        ["took"],
        "Background: We were walking. Interruption: He took a photo."
      ),
      doubleGap(
        "pscn-dg-3",
        "Complete the story with the correct tenses.",
        ["When I ", { gapId: "g1" }, ", you ", { gapId: "g2" }, " on the sofa! (arrive / sleep)"],
        ["arrived"],
        ["were sleeping"],
        "The sleeping was already in progress (Background) when the arrival happened (Interruption)."
      ),
      doubleGap(
        "pscn-dg-4",
        "Complete the story with the correct tenses.",
        ["What ", { gapId: "g1" }, " when the phone ", { gapId: "g2" }, "? (you / do / ring)"],
        ["were you doing"],
        ["rang"],
        "Question about the background action interrupted by the phone ringing."
      ),
      placeholderGapItem(
        "pscn-gf-1",
        "Complete the background description.",
        "In 1972, my parents __________ in London. (live)",
        "were living",
        [],
        "Use the Past Continuous to describe the background situation at the beginning of a story."
      ),
      placeholderGapItem(
        "pscn-gf-2",
        "Fill the gap.",
        "I broke my leg while I __________ in the mountains. (ski)",
        "was skiing",
        [],
        "Use the Past Continuous after 'while' for the longer action."
      ),
      placeholderGapItem(
        "pscn-gf-3",
        "Fill the gap.",
        "When the teacher came in, the students __________ quietly. (not / work)",
        "weren't working",
        ["were not working"],
        "Describe the background state (not working) when the teacher entered."
      ),
      placeholderGapItem(
        "pscn-gf-4",
        "Fill the gap.",
        "I __________ the news on the radio this morning. (hear)",
        "heard",
        [],
        "Hearing the news is a finished, shorter action."
      ),
      placeholderGapItem(
        "pscn-gf-5",
        "Fill the gap.",
        "At 8:00 AM yesterday, she __________ breakfast. (have)",
        "was having",
        [],
        "Use the Past Continuous for an action in progress at a specific moment in the past."
      ),
    ],
  },
  {
    id: "connector-logic-a2-b1",
    title: "Connectors: Reason, Result & Contrast",
    shortDescription: "Link your ideas using so, because, but, and although.",
    levels: ["a2", "b1"],
    intro:
      "Practice how to connect two ideas. Are you explaining 'why' (reason), 'what happened next' (result), or a 'surprise' (contrast)?",
    items: [
      placeholderChoiceGapItem(
        "cl-1",
        "Choose the correct connector.",
        "The outdoor concert was cancelled ____ there was a massive thunderstorm.",
        ["because"],
        "The storm is the reason the concert was cancelled.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-2",
        "Choose the correct connector.",
        "There was a massive thunderstorm, ____ the outdoor concert was cancelled.",
        ["so"],
        "The cancellation is the result of the storm.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-3",
        "Choose the correct connector.",
        "He didn't study at all, ____ he still passed the exam with an 'A'.",
        ["but"],
        "Use 'but' for a simple contrast between not studying and passing.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-4",
        "Choose the correct connector.",
        "____ he didn't study at all, he still passed the exam with an 'A'.",
        ["although"],
        "Use 'although' at the start to show a surprising contrast.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-5",
        "Choose the correct connector.",
        "The hotel was very cheap, ____ it was quite far from the city center.",
        ["but"],
        "A contrast between a positive (cheap) and a negative (far away).",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-6",
        "Choose the correct connector.",
        "We chose that hotel ____ it was very cheap.",
        ["because"],
        "The low price was the reason for choosing it.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-7",
        "Choose the correct connector.",
        "The hotel was very cheap, ____ we decided to stay there for a week.",
        ["so"],
        "The long stay is the result of the low price.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-8",
        "Choose the correct connector.",
        "____ the hotel was cheap, it was actually very clean and modern.",
        ["although"],
        "A surprise contrast: usually cheap hotels aren't very modern.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-9",
        "Choose the correct connector.",
        "I forgot my umbrella, ____ I got completely wet in the rain.",
        ["so"],
        "Getting wet was the result of forgetting the umbrella.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-10",
        "Choose the correct connector.",
        "I got completely wet in the rain ____ I forgot my umbrella.",
        ["because"],
        "Forgetting the umbrella was the reason for getting wet.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-11",
        "Choose the correct connector.",
        "I had an umbrella, ____ I still got a bit wet because of the wind.",
        ["but"],
        "A contrast: having an umbrella didn't keep the person 100% dry.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-12",
        "Choose the correct connector.",
        "____ I had an umbrella, I still got a bit wet because of the wind.",
        ["although"],
        "Starting the contrast with 'although'.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-13",
        "Choose the correct connector.",
        "I was feeling very lazy, ____ I went to the gym anyway.",
        ["but"],
        "Contrast: feeling lazy vs. going to the gym.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-14",
        "Choose the correct connector.",
        "____ the new laptop was very expensive, he decided to buy it.",
        ["although"],
        "Surprising contrast: high price vs. buying it anyway.",
        ["so", "because", "but", "although"]
      ),
      placeholderChoiceGapItem(
        "cl-15",
        "Choose the correct connector.",
        "He bought the laptop ____ his old one was broken.",
        ["because"],
        "The broken laptop is the reason for the new purchase.",
        ["so", "because", "but", "although"]
      ),
    ],
  },
  {
    id: "relative-clauses-a2-b1",
    title: "Who, Which, and Where",
    shortDescription: "Use relative pronouns to describe people, things, and places.",
    levels: ["a2", "b1"],
    intro:
      "Use 'who' for people, 'which' for things, and 'where' for places. These words help you join ideas and define what or who you mean.",
    items: [
      multipleChoiceItem(
        "rel-mc-1",
        "Choose the correct word.",
        "The tour guide is the person ____ shows us the historic monuments.",
        ["who", "which", "where"],
        0,
        "We use 'who' to give more information about a person."
      ),
      multipleChoiceItem(
        "rel-mc-2",
        "Choose the correct word.",
        "A souvenir is something ____ you buy to remember your holiday.",
        ["who", "which", "where"],
        1,
        "We use 'which' (or 'that') for objects or things."
      ),
      multipleChoiceItem(
        "rel-mc-3",
        "Choose the correct word.",
        "The museum is the place ____ we saw the famous paintings.",
        ["who", "which", "where"],
        2,
        "We use 'where' for locations and buildings."
      ),
      errorCorrectionItem(
        "rel-ec-1",
        "Is the relative pronoun correct?",
        "I found a small café which sells the best coffee in the city centre.",
        "which",
        true,
        "",
        "Correct! We use 'which' because the café is the subject performing the action (selling coffee)."
      ),
      errorCorrectionItem(
        "rel-ec-2",
        "Is the relative pronoun correct?",
        "The woman where checked our passports was very friendly.",
        "where",
        false,
        "who",
        "Since we are talking about a person (the woman), we must use 'who'."
      ),
      errorCorrectionItem(
        "rel-ec-3",
        "Is the relative pronoun correct?",
        "That's the hotel where we stayed last summer.",
        "where",
        true,
        "",
        "Correct! We use 'where' to describe a place where an action happened."
      ),
      placeholderGapItem(
        "rel-gf-1",
        "Complete the definition.",
        "A suitcase is a large bag _________ you use for carrying clothes.",
        "which",
        ["that"],
        "Defining an object (a bag)."
      ),
      placeholderGapItem(
        "rel-gf-2",
        "Complete the definition.",
        "A receptionist is the person _________ works at the front desk.",
        "who",
        ["that"],
        "Defining a person."
      ),
      placeholderGapItem(
        "rel-gf-3",
        "Complete the definition.",
        "An airport is a place _________ planes land and take off.",
        "where",
        [],
        "Defining a location."
      ),
      singleGap(
        "rel-rf-1",
        "Combine the ideas: 'I met a traveller. He spoke five languages.'",
        ["I met a traveller ", { gapId: "g1" }, " five languages."],
        ["who spoke", "that spoke"],
        "Join the sentences using 'who' to describe the person."
      ),
      singleGap(
        "rel-rf-2",
        "Combine the ideas: 'This is the map. I bought it at the station centre.'",
        ["This is the map ", { gapId: "g1" }, " at the station centre."],
        ["which I bought", "that I bought"],
        "Join the sentences using 'which' to describe the thing."
      ),
    ],
  },
  {
    id: "future-forms-mixed",
    title: "Future Forms",
    shortDescription: "Mix predictions, plans, arrangements, and instant decisions.",
    levels: ["b1"],
    intro:
      "Work through a mixed future forms test. Some items are multiple choice, and others ask you to judge whether the highlighted future form is correct.",
    items: [
      multipleChoiceItem(
        "ff-mc-1",
        "Choose the best future form.",
        "The phone's ringing. I ____ it.",
        ["'m going to answer", "'ll answer", "'m answering"],
        1,
        "Use 'will' for an instant decision made at the moment of speaking."
      ),
      multipleChoiceItem(
        "ff-mc-2",
        "Choose the best future form.",
        "Look at those black clouds. It ____ soon.",
        ["'s raining", "'ll rain", "'s going to rain"],
        2,
        "Use 'be going to' for a prediction based on present evidence."
      ),
      multipleChoiceItem(
        "ff-mc-3",
        "Choose the best future form.",
        "We ____ the estate agent at 4:30 tomorrow. It's already in the diary.",
        ["'re meeting", "'ll meet", "'re going to meet"],
        0,
        "Use the present continuous for a fixed future arrangement."
      ),
      multipleChoiceItem(
        "ff-mc-4",
        "Choose the best future form.",
        "I've decided to save money, so I ____ a cheaper phone next month.",
        ["'m going to buy", "'m buying", "'ll buy"],
        0,
        "Use 'be going to' for a prior intention or plan."
      ),
      multipleChoiceItem(
        "ff-mc-5",
        "Choose the best future form.",
        "Don't worry — I ____ anybody your secret.",
        ["'m not telling", "won't tell", "'m not going to tell"],
        1,
        "Use 'will not / won't' for a promise."
      ),
      multipleChoiceItem(
        "ff-mc-6",
        "Choose the best future form.",
        "A: This suitcase is really heavy. B: OK, I ____ you with it.",
        ["'m helping", "'ll help", "'m going to help"],
        1,
        "Use 'will' for an offer made at the moment of speaking."
      ),
      multipleChoiceItem(
        "ff-mc-7",
        "Choose the best future form.",
        "Barcelona are playing really well. I think they ____ the match.",
        ["'ll win", "'re winning", "'re going to win"],
        2,
        "Use 'be going to' for a prediction based on present evidence: they are playing really well now."
      ),
      multipleChoiceItem(
        "ff-mc-8",
        "Choose the best future form.",
        "Sorry, I can't talk now. I ____ dinner with my cousins tonight.",
        ["'ll have", "'m having", "'m going to have"],
        1,
        "Use the present continuous for a personal arrangement."
      ),
      multipleChoiceItem(
        "ff-mc-9",
        "Choose the best future form.",
        "Careful! You ____ that glass if you put it there.",
        ["'re going to break", "'ll break", "'re breaking"],
        0,
        "Use 'be going to' for a prediction based on what is happening now."
      ),
      multipleChoiceItem(
        "ff-mc-10",
        "Choose the best future form.",
        "I’m sure you ____ New York. It’s an amazing city.",
        ["'re loving", "'re going to love", "'ll love"],
        2,
        "Use 'will' for a general prediction."
      ),
      errorCorrectionItem(
        "ff-ec-1",
        "Decide whether the highlighted future form is correct.",
        "I can’t come to the cinema on Friday because I’m going to meet my tutor at 6:30.",
        "I’m going to meet",
        false,
        "I’m meeting",
        "For a fixed arrangement with a time already set, the present continuous is the best choice."
      ),
      errorCorrectionItem(
        "ff-ec-2",
        "Decide whether the highlighted future form is correct.",
        "That child is playing too close to the pool — he’ll fall in.",
        "he’ll fall in",
        false,
        "he’s going to fall in",
        "Use 'be going to' for a prediction based on present evidence."
      ),
      errorCorrectionItem(
        "ff-ec-3",
        "Decide whether the highlighted future form is correct.",
        "I think people will live longer in the future.",
        "will live",
        true,
        "",
        "A general prediction based on opinion commonly takes 'will'."
      ),
      errorCorrectionItem(
        "ff-ec-4",
        "Decide whether the highlighted future form is correct.",
        "A: I haven’t got a pen. B: Wait, I’m going to lend you one.",
        "I’m going to lend",
        false,
        "I'll lend",
        "An offer made at the moment of speaking normally takes 'will'."
      ),
      errorCorrectionItem(
        "ff-ec-5",
        "Decide whether the highlighted future form is correct.",
        "We’re staying with my aunt in Seville this weekend.",
        "We’re staying",
        true,
        "",
        "The present continuous is correct for a personal arrangement."
      ),
      errorCorrectionItem(
        "ff-ec-6",
        "Decide whether the highlighted future form is correct.",
        "I’ve already made up my mind — I’ll look for another job after the summer.",
        "I’ll look for",
        false,
        "I’m going to look for",
        "Use 'be going to' for a plan or intention decided before the moment of speaking."
      ),
      errorCorrectionItem(
        "ff-ec-7",
        "Decide whether the highlighted future form is correct.",
        "Don’t worry, I’ll help you with the report if you want.",
        "I’ll help",
        true,
        "",
        "This is an offer or promise, so 'will' is correct."
      ),
      errorCorrectionItem(
        "ff-ec-8",
        "Decide whether the highlighted future form is correct.",
        "Look at the way that chair is balanced — it’ll fall over.",
        "it’ll fall over",
        false,
        "it’s going to fall over",
        "When the prediction comes from what we can see now, 'going to' is the more natural choice."
      ),
      errorCorrectionItem(
        "ff-ec-9",
        "Decide whether the highlighted future form is correct.",
        "A: These boxes are really heavy. B: OK, I carry the one on the left.",
        "I carry",
        false,
        "I'll carry",
        "Use 'will' for an instant decision made at the moment of speaking."
      ),
      errorCorrectionItem(
        "ff-ec-10",
        "Decide whether the highlighted future form is correct.",
        "She’s going to start her driving lessons next month — she’s already paid for them.",
        "She’s going to start",
        true,
        "",
        "This is a prior plan or intention, so 'be going to' works well."
      ),
    ],
  },
  {
    id: "present-perfect-or-past-simple-mixed",
    title: "Present Perfect or Past Simple",
    shortDescription: "Practise finished past time and present relevance.",
    levels: ["b1"],
    intro:
      "Judge whether the highlighted verb form is correct first, then complete the gap-fill items in the second half.",
    items: [
      errorCorrectionItem(
        "ppps-ec-1",
        "Decide whether the highlighted verb form is correct.",
        "I’ve lost my keys yesterday.",
        "I’ve lost",
        false,
        "I lost",
        "Use the past simple with a finished past time expression like 'yesterday'."
      ),
      errorCorrectionItem(
        "ppps-ec-2",
        "Decide whether the highlighted verb form is correct.",
        "She’s just finished her homework, so she can come out now.",
        "She’s just finished",
        true,
        "",
        "The present perfect is correct here because it describes a recent action with a present result."
      ),
      errorCorrectionItem(
        "ppps-ec-3",
        "Decide whether the highlighted verb form is correct.",
        "Did you ever try Japanese food?",
        "Did you ever try",
        false,
        "Have you ever tried",
        "Use the present perfect to talk about life experience when the time is not specified."
      ),
      errorCorrectionItem(
        "ppps-ec-4",
        "Decide whether the highlighted verb form is correct.",
        "We went to Rome twice.",
        "went",
        true,
        "",
        "The past simple can be correct here if the speaker is thinking of two finished trips in the past."
      ),
      errorCorrectionItem(
        "ppps-ec-5",
        "Decide whether the highlighted verb form is correct.",
        "My brother hasn’t called me last week.",
        "hasn’t called",
        false,
        "didn't call",
        "Use the past simple with a finished time reference like 'last week'."
      ),
      errorCorrectionItem(
        "ppps-ec-6",
        "Decide whether the highlighted verb form is correct.",
        "Have you seen Marta this morning?",
        "Have you seen",
        true,
        "",
        "The present perfect is possible if 'this morning' is still part of the current unfinished time period."
      ),
      errorCorrectionItem(
        "ppps-ec-7",
        "Decide whether the highlighted verb form is correct.",
        "I didn’t finish my project yet.",
        "didn’t finish",
        false,
        "haven't finished",
        "Use the present perfect with 'yet' when talking about something unfinished up to now."
      ),
      errorCorrectionItem(
        "ppps-ec-8",
        "Decide whether the highlighted verb form is correct.",
        "He’s been to London in 2019.",
        "He’s been",
        false,
        "He went",
        "Use the past simple when a specific finished time is mentioned."
      ),
      errorCorrectionItem(
        "ppps-ec-9",
        "Decide whether the highlighted verb form is correct.",
        "I’ve already told you three times!",
        "I’ve already told",
        true,
        "",
        "The present perfect is correct because the speaker is focusing on the connection to now."
      ),
      errorCorrectionItem(
        "ppps-ec-10",
        "Decide whether the highlighted verb form is correct.",
        "When have you bought that jacket?",
        "have you bought",
        false,
        "did you buy",
        "Use the past simple with 'when' questions about finished past actions."
      ),
      placeholderGapItem(
        "ppps-gf-1",
        "Complete the sentence with the correct form.",
        "I __________ my homework an hour ago, so I can relax now. (finish)",
        "finished",
        [],
        "Use the past simple with a finished past time expression like 'an hour ago'."
      ),
      placeholderGapItem(
        "ppps-gf-2",
        "Complete the sentence with the correct form.",
        "She  __________ the train, so she’ll be here in a minute. (just/catch)",
        "has just caught",
        ["'s just caught"],
        "Use the present perfect for a recent action with a present result."
      ),
      placeholderGapItem(
        "ppps-gf-3",
        "Complete the sentence with the correct form.",
        "__________ sushi? (you/ever/eat)",
        "Have you ever eaten",
        [],
        "Use the present perfect to talk about life experience when no specific time is mentioned."
      ),
      placeholderGapItem(
        "ppps-gf-4",
        "Complete the sentence with the correct form.",
        "We __________ that museum when we were in Paris last summer. (visit)",
        "visited",
        [],
        "Use the past simple because the action happened in a finished past time period."
      ),
      placeholderGapItem(
        "ppps-gf-5",
        "Complete the sentence with the correct form.",
        "I __________ my keys — can you help me look for them? (lose)",
        "have lost",
        ["'ve lost"],
        "Use the present perfect for a past action with an important result now."
      ),
      placeholderGapItem(
        "ppps-gf-6",
        "Complete the sentence with the correct form.",
        "My parents __________ to Italy three times. (be)",
        "have been",
        [],
        "Use the present perfect for past experiences when the exact time is not given."
      ),
      placeholderGapItem(
        "ppps-gf-7",
        "Complete the sentence with the correct form.",
        "What time __________ yesterday? (he/leave)",
        "did he leave",
        [],
        "Use the past simple when asking about a finished past action with a past time reference."
      ),
      placeholderGapItem(
        "ppps-gf-8",
        "Complete the sentence with the correct form.",
        "We __________ dinner yet, so I’m getting hungry. (not have)",
        "haven't had",
        ["have not had"],
        "Use the present perfect with 'yet' for something unfinished up to now."
      ),
      placeholderGapItem(
        "ppps-gf-9",
        "Complete the sentence with the correct form.",
        "She __________ her ankle last week, so she can’t do PE today. (hurt)",
        "hurt",
        [],
        "Use the past simple with a finished past time expression like 'last week'."
      ),
      placeholderGapItem(
        "ppps-gf-10",
        "Complete the sentence with the correct form.",
        "I __________ that film already, so I don’t really want to watch it again. (see)",
        "have seen",
        ["'ve seen"],
        "Use the present perfect with 'already' when the exact time is not important."
      ),
    ],
  },
  {
    id: "comparatives-and-superlatives-mixed",
    title: "Comparatives and Superlatives",
    shortDescription: "Practise comparison structures through reformulation and error correction.",
    levels: ["b1"],
    intro:
      "Decide whether the highlighted comparison form is correct first, then complete the reformulation items in the second half.",
    items: [
      errorCorrectionItem(
        "cs-ec-1",
        "Decide whether the highlighted comparison form is correct.",
        "My new laptop is more lighter than my old one.",
        "more lighter than",
        false,
        "lighter than",
        "Don't use both 'more' and '-er' together. Use 'lighter than'."
      ),
      errorCorrectionItem(
        "cs-ec-2",
        "Decide whether the highlighted comparison form is correct.",
        "This is the most boring film I’ve seen all year.",
        "the most boring",
        true,
        "",
        "This is correct. Longer adjectives usually form the superlative with 'the most'."
      ),
      errorCorrectionItem(
        "cs-ec-3",
        "Decide whether the highlighted comparison form is correct.",
        "My sister drives more carefully than I do.",
        "more carefully than",
        true,
        "",
        "This is correct. Adverbs like 'carefully' usually form the comparative with 'more'."
      ),
      errorCorrectionItem(
        "cs-ec-4",
        "Decide whether the highlighted comparison form is correct.",
        "Your bag is the same than mine.",
        "the same than",
        false,
        "the same as",
        "Use 'the same as', not 'the same than'."
      ),
      errorCorrectionItem(
        "cs-ec-5",
        "Decide whether the highlighted comparison form is correct.",
        "Today is hotter that yesterday.",
        "hotter that",
        false,
        "hotter than",
        "Use 'than' after a comparative, not 'that'."
      ),
      errorCorrectionItem(
        "cs-ec-6",
        "Decide whether the highlighted comparison form is correct.",
        "Of all the students in the class, Marta works the hardest.",
        "the hardest",
        true,
        "",
        "This is correct. 'Hard' can form the superlative adverb with '-est': 'the hardest'."
      ),
      errorCorrectionItem(
        "cs-ec-7",
        "Decide whether the highlighted comparison form is correct.",
        "This exercise isn’t as difficult than the last one.",
        "as difficult than",
        false,
        "as difficult as",
        "Use 'as ... as' in this structure, not 'as ... than'."
      ),
      errorCorrectionItem(
        "cs-ec-8",
        "Decide whether the highlighted comparison form is correct.",
        "He’s the best player of the team.",
        "of the team",
        false,
        "in the team",
        "After superlatives with groups, we normally use 'in': 'the best player in the team'."
      ),
      errorCorrectionItem(
        "cs-ec-9",
        "Decide whether the highlighted comparison form is correct.",
        "I don’t earn as much money as my brother.",
        "as much money as",
        true,
        "",
        "This is correct. Use 'as much ... as' with uncountable nouns like 'money'."
      ),
      errorCorrectionItem(
        "cs-ec-10",
        "Decide whether the highlighted comparison form is correct.",
        "The journey by coach was more cheaper than the train.",
        "more cheaper than",
        false,
        "cheaper than",
        "Don't use 'more' with a short adjective that already takes '-er'."
      ),
      placeholderGapItem(
        "cs-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "My brother is taller than me.\nI’m not __________ my brother.",
        "as tall as",
        [],
        "Use 'not as ... as' to express an inferior comparison."
      ),
      placeholderGapItem(
        "cs-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "This test is easier than the last one.\nThe last test was __________ this one.",
        "more difficult than",
        ["harder than"],
        "You can reverse the comparison by using the opposite comparative."
      ),
      placeholderGapItem(
        "cs-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        "No one in the class is as hardworking as Julia.\nJulia is __________ student in the class.",
        "the most hardworking",
        ["the hardest-working", "the most hard-working"],
        "Use a superlative to compare one person with the whole group."
      ),
      placeholderGapItem(
        "cs-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "My phone and yours cost exactly the same.\nYour phone costs __________ mine.",
        "the same as",
        [],
        "Use 'the same as' to show equality here: your phone costs the same as mine."
      ),
      placeholderGapItem(
        "cs-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "Travelling by train is more relaxing than driving.\nDriving isn’t __________ travelling by train.",
        "as relaxing as",
        [],
        "Use 'not as ... as' to reformulate the comparative."
      ),
      placeholderGapItem(
        "cs-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "This is the most expensive restaurant in town.\nNo other restaurant in town is __________ this one.",
        "as expensive as",
        [],
        "A superlative can often be reformulated with 'No other...' + 'as ... as'."
      ),
      placeholderGapItem(
        "cs-rf-7",
        "Complete the second sentence so that it has a similar meaning.",
        "Sara speaks English more confidently than I do.\nI don’t speak English __________ Sara does.",
        "as confidently as",
        [],
        "Use 'as ... as' with an adverb to compare actions."
      ),
      placeholderGapItem(
        "cs-rf-8",
        "Complete the second sentence so that it has a similar meaning.",
        "This is the best meal I’ve had in ages.\nI’ve never had __________ this one.",
        "a better meal than",
        [],
        "A superlative sentence can often be reformulated with a comparative after 'never'."
      ),
      placeholderGapItem(
        "cs-rf-9",
        "Complete the second sentence so that it has a similar meaning.",
        "Her new job is less stressful than her old one.\nHer old job was __________ her new one.",
        "more stressful than",
        [],
        "Reverse the comparison by changing 'less' to the opposite comparative."
      ),
      placeholderGapItem(
        "cs-rf-10",
        "Complete the second sentence so that it has a similar meaning.",
        "Nobody in my family gets up earlier than my dad.\nMy dad gets up __________ in my family.",
        "the earliest",
        ["earlier than anyone", "earlier than anybody", "earlier than anyone else", "earlier than anybody else"],
        "Both the superlative form and a comparative form with 'anyone/anybody' can express the same idea here."
      ),
    ],
  },
  {
    id: "comparatives-logic-a2-b1",
    title: "Comparatives: Adjectives and Adverbs",
    shortDescription: "Master the rules for comparing people, places, and actions.",
    levels: ["a2", "b1"],
    intro:
      "Practice using comparatives to explain differences. Pay close attention to spelling rules and the difference between comparing things and comparing how people do things.",
    items: [
      multipleChoiceItem(
        "comp-mc-1",
        "Choose the correct comparative form.",
        "The new office is much ____ than the old one in the city centre.",
        ["bigerr", "bigger", "more big"],
        1,
        "For one-syllable adjectives ending in vowel + consonant, double the final letter before adding -er."
      ),
      multipleChoiceItem(
        "comp-mc-2",
        "Choose the correct comparative form.",
        "I find learning Italian ____ than learning German.",
        ["easyer", "more easy", "easier"],
        2,
        "Two-syllable adjectives ending in -y change the 'y' to 'i' and add -er."
      ),
      multipleChoiceItem(
        "comp-mc-3",
        "Choose the correct adverb form.",
        "She plays the piano ____ than anyone else in the family.",
        ["more beautifully", "beautifuller", "more beautiful"],
        0,
        "To compare an action (playing), use 'more' + the adverb ending in -ly."
      ),
      multipleChoiceItem(
        "comp-mc-4",
        "Choose the correct option.",
        "This year's exam was ____ than last year's.",
        ["badder", "worse", "worser"],
        1,
        "'Bad' is an irregular adjective. Its comparative form is 'worse'."
      ),
      multipleChoiceItem(
        "comp-mc-5",
        "Choose the correct pronoun structure.",
        "My brother is a lot taller than ____.",
        ["I", "me", "my"],
        1,
        "After 'than', we use an object pronoun like 'me', 'him', or 'her'."
      ),
      multipleChoiceItem(
        "comp-mc-6",
        "Choose the correct option.",
        "The journey by train is ____ expensive than going by coach.",
        ["least", "less", "as"],
        1,
        "Use 'less + adjective' to show that something has a lower quality or amount."
      ),
      errorCorrectionItem(
        "comp-ec-1",
        "Check the highlighted phrase for errors.",
        "The weather today is more hotter than it was yesterday.",
        "more hotter",
        false,
        "hotter",
        "Don't use 'more' with one-syllable adjectives that already end in -er."
      ),
      errorCorrectionItem(
        "comp-ec-2",
        "Check the highlighted phrase for errors.",
        "He doesn't drive as well than his father.",
        "as well than",
        false,
        "as well as",
        "The structure for equality is 'as + adverb + as'. Never use 'than' with 'as'."
      ),
      errorCorrectionItem(
        "comp-ec-3",
        "Check the highlighted phrase for errors.",
        "The station is further than I thought.",
        "further",
        true,
        "",
        "Correct! 'Further' is the irregular comparative of 'far'."
      ),
      errorCorrectionItem(
        "comp-ec-4",
        "Check the highlighted phrase for errors.",
        "I can run more fast than my best friend.",
        "more fast",
        false,
        "faster",
        "'Fast' is an irregular adverb; its comparative form is 'faster', not 'more fast'."
      ),
      errorCorrectionItem(
        "comp-ec-5",
        "Check the highlighted phrase for errors.",
        "This restaurant isn't as good than the one we visited last week.",
        "as good than",
        false,
        "as good as",
        "Always use '(not) as... as' for comparisons of equality or inequality."
      ),
      errorCorrectionItem(
        "comp-ec-6",
        "Check the highlighted phrase for errors.",
        "She is more impatient today than she was this morning.",
        "more impatient",
        true,
        "",
        "Correct! For longer adjectives, use 'more' + adjective."
      ),
      placeholderGapItem(
        "comp-rf-1",
        "Complete the second sentence.",
        "My car is faster than yours.\nYour car isn't __________ mine.",
        "as fast as",
        [],
        "Use 'not as + adjective + as' to show that the second thing has less of a quality."
      ),
      placeholderGapItem(
        "comp-rf-2",
        "Complete the second sentence.",
        "I'm older than her.\nShe is __________ me.",
        "younger than",
        [],
        "You can reverse the comparison by using an opposite comparative."
      ),
      placeholderGapItem(
        "comp-rf-3",
        "Complete the second sentence.",
        "He speaks more slowly than I do.\nI speak __________ he does.",
        "faster than",
        ["more quickly than"],
        "Reverse the adverb comparison using an opposite comparative adverb."
      ),
      placeholderGapItem(
        "comp-rf-4",
        "Complete the second sentence.",
        "The film was less interesting than the book.\nThe film wasn't __________ the book.",
        "as interesting as",
        [],
        "'Less + adjective' has a similar meaning to 'not as + adjective + as'."
      ),
      placeholderGapItem(
        "comp-rf-5",
        "Complete the second sentence.",
        "I don't play tennis as well as you.\nYou play tennis __________ me.",
        "better than",
        [],
        "The opposite of 'not as well as' is 'better than'."
      ),
      placeholderGapItem(
        "comp-rf-6",
        "Complete the second sentence.",
        "This bag and that bag are exactly the same price.\nThis bag costs __________ that one.",
        "the same as",
        ["as much as"],
        "Use 'the same as' to show total equality."
      ),
    ],
  },
  {
    id: "superlatives-logic-a2-b1",
    title: "Superlatives: The Best & The Worst",
    shortDescription: "Master superlative adjectives and common B1 structures.",
    levels: ["a2", "b1"],
    intro:
      "Use superlatives to compare one thing with a whole group. Practice the spelling rules, irregular forms, and how to use superlatives with your own life experiences.",
    items: [
      multipleChoiceItem(
        "sup-mc-1",
        "Choose the correct superlative form.",
        "That was ____ film I've ever seen at the cinema.",
        ["the baddest", "the worst", "the most bad"],
        1,
        "'Bad' is an irregular adjective. Its superlative form is 'the worst'."
      ),
      multipleChoiceItem(
        "sup-mc-2",
        "Choose the correct superlative form.",
        "My sister is ____ person in our family.",
        ["the thinnest", "the thinest", "the most thin"],
        0,
        "For adjectives ending in vowel + consonant, double the final letter before adding -est."
      ),
      multipleChoiceItem(
        "sup-mc-3",
        "Choose the correct option.",
        "She is the best student ____ the class.",
        ["of", "in", "at"],
        1,
        "Use 'in' with singular words for groups like 'class', 'team', or 'family'."
      ),
      multipleChoiceItem(
        "sup-mc-4",
        "Choose the correct option.",
        "It was ____ experience of my life.",
        ["the most terrifying", "the terrifyingest", "the more terrifying"],
        0,
        "Use 'the most' for adjectives with three or more syllables."
      ),
      multipleChoiceItem(
        "sup-mc-5",
        "Choose the correct superlative form.",
        "Which is ____ city in the world?",
        ["the noisest", "the noisiyest", "the noisiest"],
        2,
        "Two-syllable adjectives ending in -y change 'y' to 'i' before adding -est."
      ),
      multipleChoiceItem(
        "sup-mc-6",
        "Choose the correct option.",
        "That is the most delicious cake I have ____ eaten.",
        ["never", "ever", "already"],
        1,
        "We often use 'the + superlative' with the present perfect and 'ever' to talk about experiences."
      ),
      errorCorrectionItem(
        "sup-ec-1",
        "Check the highlighted phrase for errors.",
        "This is the most cheapest restaurant in the city centre.",
        "the most cheapest",
        false,
        "the cheapest",
        "Don't use 'most' with short adjectives that already end in -est."
      ),
      errorCorrectionItem(
        "sup-ec-2",
        "Check the highlighted phrase for errors.",
        "He is the more intelligent person I know.",
        "the more intelligent",
        false,
        "the most intelligent",
        "Use 'the most' to compare one person with a whole group."
      ),
      errorCorrectionItem(
        "sup-ec-3",
        "Check the highlighted phrase for errors.",
        "It was the best holiday I ever had.",
        "I ever had",
        false,
        "I've ever had",
        "Use the present perfect ('I have ever had') when using 'ever' with a superlative."
      ),
      errorCorrectionItem(
        "sup-ec-4",
        "Check the highlighted phrase for errors.",
        "Vatican City is the smallest country in the world.",
        "the smallest",
        true,
        "",
        "Correct! 'Small' is a one-syllable adjective, so add -est."
      ),
      errorCorrectionItem(
        "sup-ec-5",
        "Check the highlighted phrase for errors.",
        "He is the baddest player in the team.",
        "the baddest",
        false,
        "the worst",
        "'Bad' is irregular; the correct superlative is 'the worst'."
      ),
      errorCorrectionItem(
        "sup-ec-6",
        "Check the highlighted phrase for errors.",
        "This exercise is the most easy in the book.",
        "the most easy",
        false,
        "the easiest",
        "Two-syllable adjectives ending in -y usually take the -est ending."
      ),
      placeholderGapItem(
        "sup-rf-1",
        "Complete the second sentence.",
        "No one in the class is taller than Julia.\nJulia is __________ student in the class.",
        "the tallest",
        [],
        "Use a superlative to show that Julia is at the top of the group."
      ),
      placeholderGapItem(
        "sup-rf-2",
        "Complete the second sentence.",
        "I've never seen a more beautiful sunset.\nThat is __________ I've ever seen.",
        "the most beautiful sunset",
        ["the most beautiful one"],
        "Combine the superlative with 'ever' to describe a unique experience."
      ),
      placeholderGapItem(
        "sup-rf-3",
        "Complete the second sentence.",
        "All the other hotels are more expensive than this one.\nThis is __________ hotel in town.",
        "the least expensive",
        ["the cheapest"],
        "You can use 'the least + adjective' to show something is at the bottom of a group."
      ),
      placeholderGapItem(
        "sup-rf-4",
        "Complete the second sentence.",
        "This book is better than any other book I've read.\nThis is __________ book I've ever read.",
        "the best",
        [],
        "The superlative of 'good' is 'the best'."
      ),
      placeholderGapItem(
        "sup-rf-5",
        "Complete the second sentence.",
        "No other city is as noisy as this one.\nThis is __________ city I've ever visited.",
        "the noisiest",
        [],
        "Convert an 'as...as' comparison into a superlative."
      ),
      placeholderGapItem(
        "sup-rf-6",
        "Complete the second sentence.",
        "My old laptop was much heavier than my new one.\nMy new laptop is __________ one I've owned.",
        "the lightest",
        ["the least heavy"],
        "Use the opposite superlative to describe the new situation."
      ),
    ],
  },
  {
    id: "articles-mixed",
    title: "Articles",
    shortDescription: "Practise a, an, the, and zero article in common B1 contexts.",
    levels: ["b1"],
    intro:
      "Start with error correction, then choose the correct article for each gap using a, an, the, or — when no article is needed.",
    items: [
      errorCorrectionItem(
        "art-ec-1",
        "Decide whether the highlighted article use is correct.",
        "My sister is engineer in a big company.",
        "is engineer",
        false,
        "is an engineer",
        "Use 'a / an' with singular countable nouns when we say what somebody does."
      ),
      errorCorrectionItem(
        "art-ec-2",
        "Decide whether the highlighted article use is correct.",
        "I usually have breakfast at home before work.",
        "have breakfast at home before work",
        true,
        "",
        "No article is needed with meals, 'home', or 'work' in this general sense."
      ),
      errorCorrectionItem(
        "art-ec-3",
        "Decide whether the highlighted article use is correct.",
        "We went to cinema on Saturday night.",
        "to cinema",
        false,
        "to the cinema",
        "Use 'the' with places in town such as 'the cinema' and 'the theatre'."
      ),
      errorCorrectionItem(
        "art-ec-4",
        "Decide whether the highlighted article use is correct.",
        "She bought an beautiful dress for the wedding.",
        "an beautiful dress",
        false,
        "a beautiful dress",
        "Use 'a' before a consonant sound and 'an' before a vowel sound."
      ),
      errorCorrectionItem(
        "art-ec-5",
        "Decide whether the highlighted article use is correct.",
        "The moon looked really bright last night.",
        "The moon",
        true,
        "",
        "Use 'the' when there is only one of something, like 'the moon'."
      ),
      errorCorrectionItem(
        "art-ec-6",
        "Decide whether the highlighted article use is correct.",
        "I love the dogs, but I’m afraid of the ones next door.",
        "the dogs",
        false,
        "dogs",
        "When speaking about things in general, we usually use no article with plural nouns."
      ),
      errorCorrectionItem(
        "art-ec-7",
        "Decide whether the highlighted article use is correct.",
        "Can you close window, please?",
        "close window",
        false,
        "close the window",
        "Use 'the' when it is clear which thing we are referring to."
      ),
      errorCorrectionItem(
        "art-ec-8",
        "Decide whether the highlighted article use is correct.",
        "He never drinks coffee after the dinner.",
        "the dinner",
        false,
        "dinner",
        "We normally use no article before meals: breakfast, lunch, and dinner."
      ),
      errorCorrectionItem(
        "art-ec-9",
        "Decide whether the highlighted article use is correct.",
        "She’s the best student in the class.",
        "the best student",
        true,
        "",
        "Use 'the' with superlatives."
      ),
      errorCorrectionItem(
        "art-ec-10",
        "Decide whether the highlighted article use is correct.",
        "I’ll see you on the Friday after work.",
        "on the Friday",
        false,
        "on Friday",
        "We usually use no article before days of the week."
      ),
      errorCorrectionItem(
        "art-ec-11",
        "Decide whether the highlighted article use is correct.",
        "My dad comes home late because he usually leaves the work at 8:00.",
        "the work",
        false,
        "work",
        "After verbs like 'leave' and prepositions like 'from', we usually use no article with 'work'."
      ),
      errorCorrectionItem(
        "art-ec-12",
        "Decide whether the highlighted article use is correct.",
        "What amazing idea!",
        "What amazing idea",
        false,
        "What an amazing idea",
        "Use 'a / an' in exclamations with singular countable nouns: 'What an amazing idea!'"
      ),
      errorCorrectionItem(
        "art-ec-13",
        "Decide whether the highlighted article use is correct.",
        "We had lunch in a small café near the station.",
        "a small café",
        true,
        "",
        "Use 'a' when mentioning a singular countable noun for the first time."
      ),
      errorCorrectionItem(
        "art-ec-14",
        "Decide whether the highlighted article use is correct.",
        "Children often learn languages more easily than the adults.",
        "the adults",
        false,
        "adults",
        "When speaking about people in general, we usually use no article with plural nouns."
      ),
      errorCorrectionItem(
        "art-ec-15",
        "Decide whether the highlighted article use is correct.",
        "I think this is best café in the neighbourhood.",
        "is best café",
        false,
        "is the best café",
        "Use 'the' with superlatives such as 'the best'."
      ),
      errorCorrectionItem(
        "art-ec-16",
        "Decide whether the highlighted article use is correct.",
        "She was tired, so she went straight to bed after the school.",
        "the school",
        false,
        "school",
        "With nouns like 'school', 'work', and 'home', we often use no article in common expressions such as 'after school'."
      ),
      placeholderChoiceGapItem(
        "art-gf-1",
        "Choose the correct article for each gap.",
        "My brother is ____ doctor at ____ local hospital.",
        ["a", "the"],
        "Use 'a' for jobs, and 'the' when the place is specific or known in the context."
      ),
      placeholderChoiceGapItem(
        "art-gf-2",
        "Choose the correct article for each gap.",
        "We usually have ____ lunch at home, but today we’re going to ____ restaurant near the beach.",
        ["—", "a"],
        "Use no article with meals in general, and 'a' when mentioning a singular countable noun for the first time."
      ),
      placeholderChoiceGapItem(
        "art-gf-3",
        "Choose the correct article for each gap.",
        "Can you open ____ window? It’s ____ hottest room in the house.",
        ["the", "the"],
        "Use 'the' when it is clear which thing we mean, and also with superlatives."
      ),
      placeholderChoiceGapItem(
        "art-gf-4",
        "Choose the correct article for each gap.",
        "She bought ____ umbrella and ____ orange scarf yesterday.",
        ["an", "an"],
        "Use 'an' before vowel sounds."
      ),
      placeholderChoiceGapItem(
        "art-gf-5",
        "Choose the correct article for each gap.",
        "I don’t like ____ spiders, but I’m not afraid of ____ ones in that photo.",
        ["—", "the"],
        "Use no article for plural nouns in general, and 'the' for specific ones."
      ),
      placeholderChoiceGapItem(
        "art-gf-6",
        "Choose the correct article for each gap.",
        "What ____ amazing story! You should write ____ book about it.",
        ["an", "a"],
        "Use 'an' in exclamations with singular countable nouns, and 'a' for a singular noun mentioned for the first time."
      ),
      placeholderChoiceGapItem(
        "art-gf-7",
        "Choose the correct article for each gap.",
        "I’ll meet you at ____ station after ____ work.",
        ["the", "—"],
        "Use 'the' for a specific place, but no article in the expression 'after work'."
      ),
      placeholderChoiceGapItem(
        "art-gf-8",
        "Choose the correct article for each gap.",
        "We went to ____ cinema on Friday, then had dinner at ____ friend’s house.",
        ["the", "a"],
        "Use 'the' with places in town like 'the cinema', and 'a' when introducing 'a friend'."
      ),
      placeholderChoiceGapItem(
        "art-gf-9",
        "Choose the correct article for each gap.",
        "____ children in my street often play football after ____ school.",
        ["the", "—"],
        "Use 'the' for a specific group of children, and no article in the expression 'after school'."
      ),
      placeholderChoiceGapItem(
        "art-gf-10",
        "Choose the correct article for each gap.",
        "This is ____ most interesting article I’ve read in ____ long time.",
        ["the", "a"],
        "Use 'the' with superlatives and 'a' in the expression 'in a long time'."
      ),
      placeholderChoiceGapItem(
        "art-gf-11",
        "Choose the correct article for each gap.",
        "My aunt is ____ teacher, and my uncle works from ____ home.",
        ["a", "—"],
        "Use 'a' with jobs and no article in the expression 'from home'."
      ),
      placeholderChoiceGapItem(
        "art-gf-12",
        "Choose the correct article for each gap.",
        "Have you ever seen ____ moon look so bright?",
        ["the"],
        "Use 'the' when there is only one of something."
      ),
      placeholderChoiceGapItem(
        "art-gf-13",
        "Choose the correct article for each gap.",
        "I need to buy ____ new phone because ____ old one is broken.",
        ["a", "the"],
        "Use 'a' when introducing something for the first time, then 'the' for the one already known."
      ),
      placeholderChoiceGapItem(
        "art-gf-14",
        "Choose the correct article for each gap.",
        "He never eats ____ breakfast, but he always has ____ big lunch.",
        ["—", "a"],
        "Use no article with meals in general, but 'a' with a singular countable noun phrase like 'a big lunch'."
      ),
      placeholderChoiceGapItem(
        "art-gf-15",
        "Choose the correct article for each gap.",
        "What time do you usually get back from ____ work on ____ Tuesdays?",
        ["—", "—"],
        "Use no article with 'work' and before days of the week."
      ),
      placeholderChoiceGapItem(
        "art-gf-16",
        "Choose the correct article for each gap.",
        "It’s ____ best café in town, but it isn’t ____ cheapest.",
        ["the", "the"],
        "Use 'the' with superlatives."
      ),
    ],
  },
  {
    id: "obligation-and-prohibition-mixed",
    title: "Modals: Obligation and Prohibition",
    shortDescription: "Practise must, have to, should, ought to, and mustn't at B1 level.",
    levels: ["b1"],
    intro:
      "Start with error correction, then move into gapfill and reformulation to practise obligation, prohibition, advice, and lack of necessity.",
    items: [
      errorCorrectionItem(
        "op-ec-1",
        "Decide whether the highlighted modal form is correct.",
        "You don’t have to smoke inside the building. It’s against the rules.",
        "don’t have to smoke",
        false,
        "mustn't smoke",
        "Use 'mustn't' when something is prohibited. 'Don't have to' means it isn't necessary."
      ),
      errorCorrectionItem(
        "op-ec-2",
        "Decide whether the highlighted modal form is correct.",
        "You ought wear a helmet when you ride a bike.",
        "ought wear",
        false,
        "ought to wear",
        "Use 'ought to' + infinitive."
      ),
      errorCorrectionItem(
        "op-ec-3",
        "Decide whether the highlighted modal form is correct.",
        "I had to get up early yesterday for a dentist appointment.",
        "had to get up",
        true,
        "",
        "Use 'had to' for past obligation or necessity."
      ),
      errorCorrectionItem(
        "op-ec-4",
        "Decide whether the highlighted modal form is correct.",
        "Students mustn’t wear a uniform at this school, so they can choose their own clothes.",
        "mustn't wear",
        false,
        "don't have to wear",
        "Use 'don't have to' when something is not necessary. 'Mustn't' means it is forbidden."
      ),
      errorCorrectionItem(
        "op-ec-5",
        "Decide whether the highlighted modal form is correct.",
        "You should to talk to your manager before making a complaint.",
        "should to talk",
        false,
        "should talk",
        "Use 'should' + infinitive without 'to'."
      ),
      errorCorrectionItem(
        "op-ec-6",
        "Decide whether the highlighted modal form is correct.",
        "We won’t have to take the car if the weather stays good — we can walk.",
        "won't have to take",
        true,
        "",
        "Use 'won't have to' for future lack of necessity."
      ),
      errorCorrectionItem(
        "op-ec-7",
        "Decide whether the highlighted modal form is correct.",
        "You must finish this book — it’s brilliant.",
        "must finish",
        true,
        "",
        "We can use 'must' for a strong recommendation."
      ),
      errorCorrectionItem(
        "op-ec-8",
        "Decide whether the highlighted modal form is correct.",
        "I’m sorry, but passengers mustn’t show their tickets before boarding.",
        "mustn't show",
        false,
        "have to show / must show",
        "Use 'have to' or 'must' when something is required by a rule. 'Mustn't' would mean it is forbidden."
      ),
      errorCorrectionItem(
        "op-ec-9",
        "Decide whether the highlighted modal form is correct.",
        "Tomorrow I’ll have to leave early because I’ve got a hospital appointment.",
        "I'll have to leave",
        true,
        "",
        "Use 'will have to' for future necessity."
      ),
      errorCorrectionItem(
        "op-ec-10",
        "Decide whether the highlighted modal form is correct.",
        "You ought not drive so fast in the rain.",
        "ought not drive",
        false,
        "ought not to drive",
        "The negative form is 'ought not to' + infinitive."
      ),
      placeholderGapItem(
        "op-gf-1",
        "Complete the sentence with the correct modal form.",
        "You __________ wear a seat belt in a car. It’s the law.",
        "have to",
        ["must"],
        "Both are possible here for obligation, though 'have to' is often more natural for rules and laws."
      ),
      placeholderGapItem(
        "op-gf-2",
        "Complete the sentence with the correct modal form.",
        "We __________ get up early tomorrow because our train leaves at 6:15.",
        "will have to",
        [],
        "Use 'will have to' for future necessity."
      ),
      placeholderGapItem(
        "op-gf-3",
        "Complete the sentence with the correct modal form.",
        "You __________ touch that wire — it’s dangerous.",
        "mustn't",
        ["must not"],
        "Use 'mustn't' when something is prohibited or strongly warned against."
      ),
      placeholderGapItem(
        "op-gf-4",
        "Complete the sentence with the correct modal form.",
        "I __________ wear a suit to work, so I usually go in jeans and a jumper.",
        "don't have to",
        ["do not have to"],
        "Use 'don't have to' when something is not necessary."
      ),
      placeholderGapItem(
        "op-gf-5",
        "Complete the sentence with the correct modal form.",
        "You look exhausted. You __________ go to bed earlier.",
        "should",
        ["ought to"],
        "Use 'should' or 'ought to' to give advice."
      ),
      placeholderGapItem(
        "op-gf-6",
        "Complete the sentence with the correct modal form.",
        "When my mum was at school, she __________ wear a uniform every day.",
        "had to",
        [],
        "Use 'had to' for obligation in the past."
      ),
      placeholderGapItem(
        "op-gf-7",
        "Complete the sentence with the correct modal form.",
        "We __________ book tickets yet — my uncle might be able to get them for free.",
        "don't have to",
        ["do not have to"],
        "Use 'don't have to' when something is not necessary."
      ),
      placeholderGapItem(
        "op-gf-8",
        "Complete the sentence with the correct modal form.",
        "You __________ be rude to the waiter. He is only trying to help.",
        "shouldn't",
        ["should not", "ought not to"],
        "Use 'shouldn't' or 'ought not to' to give negative advice."
      ),
      placeholderGapItem(
        "op-gf-9",
        "Complete the sentence with the correct modal form.",
        "Visitors __________ leave their bags at reception before entering the museum.",
        "have to",
        ["must"],
        "Both are possible for obligation, though 'have to' is often more natural for rules."
      ),
      placeholderGapItem(
        "op-gf-10",
        "Complete the sentence with the correct modal form.",
        "You __________ bring any food — there’ll be plenty at the party.",
        "don't have to",
        ["do not have to"],
        "Use 'don't have to' when something is not necessary."
      ),
      placeholderGapItem(
        "op-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "It isn’t necessary to bring a towel.\nYou __________ a towel.",
        "don't have to bring",
        ["do not have to bring"],
        "Use 'don't have to' to express lack of necessity."
      ),
      placeholderGapItem(
        "op-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "It’s forbidden to park here.\nYou __________ here.",
        "mustn't park",
        ["must not park"],
        "Use 'mustn't' to express prohibition."
      ),
      placeholderGapItem(
        "op-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        "It’s a good idea to call your grandmother.\nYou __________ your grandmother.",
        "should call",
        ["ought to call"],
        "Use 'should' or 'ought to' to give advice."
      ),
      placeholderGapItem(
        "op-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "It was necessary for us to leave early.\nWe __________ early.",
        "had to leave",
        [],
        "Use 'had to' for past necessity."
      ),
      placeholderGapItem(
        "op-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "It will be necessary for me to buy a new charger.\nI __________ a new charger.",
        "will have to buy",
        [],
        "Use 'will have to' for future necessity."
      ),
      placeholderGapItem(
        "op-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "It isn’t a good idea to stay up so late.\nYou __________ so late.",
        "shouldn't stay up",
        ["should not stay up", "ought not to stay up"],
        "Use 'shouldn't' or 'ought not to' for negative advice."
      ),
      placeholderGapItem(
        "op-rf-7",
        "Complete the second sentence so that it has a similar meaning.",
        "It isn’t necessary for Sam to come if he’s busy.\nSam __________ if he’s busy.",
        "doesn't have to come",
        ["does not have to come"],
        "Use 'doesn't have to' to show that something is not necessary."
      ),
      placeholderGapItem(
        "op-rf-8",
        "Complete the second sentence so that it has a similar meaning.",
        "It’s forbidden to use your phone during the exam.\nYou __________ your phone during the exam.",
        "mustn't use",
        ["must not use"],
        "Use 'mustn't' for prohibition."
      ),
    ],
  },
  {
    id: "ability-possibility-mixed",
    title: "Ability: Can, Could, or Be Able To?",
    shortDescription: "25 items to master ability in every tense and form.",
    levels: ["b1"],
    intro:
      "Choose the correct way to express ability. Remember: use can/could for present or past, but switch to 'be able to' for everything else.",
    items: [
      errorCorrectionItem(
        "ab1",
        "Check the highlighted phrase for errors.",
        "I will can help you with your homework tomorrow.",
        "will can",
        false,
        "will be able to",
        "We cannot use two modal verbs together. Use 'will be able to' for the future."
      ),
      errorCorrectionItem(
        "ab2",
        "Check the highlighted phrase for errors.",
        "I've always wanted to be able to speak Italian.",
        "be able to",
        true,
        "",
        "Correct. After 'want to', we need the infinitive 'be able to'."
      ),
      errorCorrectionItem(
        "ab3",
        "Check the highlighted phrase for errors.",
        "She hasn't could find her keys all morning.",
        "hasn't could",
        false,
        "hasn't been able to",
        "'Could' doesn't have a past participle. Use 'been able to' for the present perfect."
      ),
      errorCorrectionItem(
        "ab4",
        "Check the highlighted phrase for errors.",
        "I love being able to work from home.",
        "being able to",
        true,
        "",
        "Correct. Use the -ing form (gerund) after verbs of liking like 'love'."
      ),
      errorCorrectionItem(
        "ab5",
        "Check the highlighted phrase for errors.",
        "We might can come to the party on Friday.",
        "might can",
        false,
        "might be able to",
        "After modals like 'might', 'may', or 'should', we must use 'be able to'."
      ),
      multipleChoiceItem(
        "ab6",
        "Choose the best option.",
        "When I was five, I ____ already read very well.",
        ["can", "could", "been able to"],
        1,
        "Use 'could' for general ability in the past."
      ),
      multipleChoiceItem(
        "ab7",
        "Choose the best option.",
        "I haven't ____ sleep lately.",
        ["could", "can", "been able to"],
        2,
        "Present perfect requires the past participle 'been able to'."
      ),
      multipleChoiceItem(
        "ab8",
        "Choose the best option.",
        "I'm sorry, I ____ come to the meeting tomorrow.",
        ["can't", "couldn't", "not being able to"],
        0,
        "For future arrangements, we often use 'can't' or the present continuous."
      ),
      multipleChoiceItem(
        "ab9",
        "Choose the best option.",
        "You should ____ swim if you want to go on the boat.",
        ["can", "could", "be able to"],
        2,
        "After the modal 'should', we need the infinitive 'be able to'."
      ),
      multipleChoiceItem(
        "ab10",
        "Choose the best option.",
        "After three hours of trying, I ____ finally open the jar.",
        ["can", "was able to", "couldn't"],
        1,
        "For a specific success in the past, 'was able to' is better than 'could'."
      ),
      placeholderGapItem(
        "ab11",
        "Fill the gap.",
        "I'd love __________ play the piano like you.",
        "to be able to",
        ["to can"],
        "Use the infinitive 'to be able to' after 'would love'."
      ),
      placeholderGapItem(
        "ab12",
        "Fill the gap.",
        "I __________ finish the report yesterday, so I'll do it now.",
        "couldn't",
        ["wasn't able to", "was not able to"],
        "Negative past ability can use 'couldn't' or 'wasn't able to'."
      ),
      placeholderGapItem(
        "ab13",
        "Fill the gap.",
        "One day, humans __________ live on Mars.",
        "will be able to",
        ["'ll be able to"],
        "Use 'will be able to' for future possibility."
      ),
      placeholderGapItem(
        "ab14",
        "Fill the gap.",
        "I've never __________ understand why he's so popular.",
        "been able to",
        [],
        "Present perfect requires 'been able to'."
      ),
      placeholderGapItem(
        "ab15",
        "Fill the gap.",
        "He hates __________ drive in the dark.",
        "not being able to",
        ["not to be able to"],
        "After 'hate', use the -ing form: 'not being able to'."
      ),
      placeholderGapItem(
        "ab16",
        "Fill the gap.",
        "If you don't hurry, you __________ finish the exam on time.",
        "won't be able to",
        ["will not be able to"],
        "Future inability."
      ),
      placeholderGapItem(
        "ab17",
        "Fill the gap.",
        "When he was younger, my grandfather __________ speak five languages.",
        "could",
        ["was able to"],
        "General ability in the past."
      ),
      placeholderGapItem(
        "ab18",
        "Fill the gap.",
        "I hope __________ come to your party next week.",
        "to be able to",
        [],
        "Use 'to be able to' after 'hope'."
      ),
      placeholderGapItem(
        "ab19",
        "Fill the gap.",
        "I __________ find my wallet anywhere! Have you seen it?",
        "can't",
        ["cannot"],
        "Present inability."
      ),
      placeholderGapItem(
        "ab20",
        "Fill the gap.",
        "We're so happy! We __________ buy a new car last week.",
        "were able to",
        ["managed to"],
        "For a specific achievement in the past, 'were able to' is preferred."
      ),
      singleGap(
        "ab21",
        "Rewrite using 'be able to'.",
        ["I can't swim. -> I'd love ", { gapId: "g1" }, "."],
        ["to be able to swim"],
        "Change 'can' to the infinitive 'to be able to' after 'would love'."
      ),
      singleGap(
        "ab22",
        "Rewrite using 'be able to'.",
        ["He could ski. -> He has ", { gapId: "g1" }, " since he was ten."],
        ["been able to ski"],
        "Use the present perfect form of 'be able to'."
      ),
      singleGap(
        "ab23",
        "Rewrite using 'be able to'.",
        ["We can go. -> We might ", { gapId: "g1" }, " tomorrow."],
        ["be able to go"],
        "After 'might', use the base form 'be able to'."
      ),
      singleGap(
        "ab24",
        "Rewrite using 'be able to'.",
        ["I will call you. -> I hope ", { gapId: "g1" }, " tomorrow."],
        ["to be able to call you"],
        "Use the infinitive after 'hope'."
      ),
      singleGap(
        "ab25",
        "Rewrite using 'be able to'.",
        ["I can't see the screen. -> I hate ", { gapId: "g1" }, "."],
        ["not being able to see the screen", "not being able to see"],
        "After 'hate', use the negative gerund form."
      ),
    ],
  },
  {
    id: "habits-and-states",
    title: "Habits and States: Used to & Usually",
    shortDescription: "Master 'used to', 'usually', and getting accustomed to things.",
    levels: ["b1"],
    intro:
      "Learn to talk about your past and present routines. Remember: 'used to' is only for the past. For present habits, we use 'usually' with the present simple.",
    items: [
      errorCorrectionItem(
        "hs1",
        "Check the highlighted phrase for errors.",
        "I use to get up early when I was at school.",
        "use to",
        false,
        "used to",
        "In the positive past form, we always use 'used to' with a 'd'."
      ),
      errorCorrectionItem(
        "hs2",
        "Check the highlighted phrase for errors.",
        "I use to play tennis twice a week now.",
        "use to",
        false,
        "usually play",
        "'Used to' doesn't exist for present habits. Use 'usually' + present simple."
      ),
      errorCorrectionItem(
        "hs3",
        "Check the highlighted phrase for errors.",
        "Did you used to have long hair?",
        "used to",
        false,
        "use to",
        "In questions and negatives with 'did/didn't', we remove the 'd' from 'use to'."
      ),
      errorCorrectionItem(
        "hs4",
        "Check the highlighted phrase for errors.",
        "I'm used to getting up early every day.",
        "getting up",
        true,
        "",
        "Correct. After 'be used to', we use the -ing form of the verb."
      ),
      errorCorrectionItem(
        "hs5",
        "Check the highlighted phrase for errors.",
        "We didn't used to like sushi, but we love it now.",
        "used to",
        false,
        "use to",
        "Negative form: didn't + use to (no 'd')."
      ),
      errorCorrectionItem(
        "hs6",
        "Check the highlighted phrase for errors.",
        "Nowadays, we usually go to the cinema on Fridays.",
        "usually go",
        true,
        "",
        "Correct. Use 'usually' for a present habit."
      ),
      multipleChoiceItem(
        "hs7",
        "Choose the correct option.",
        "I ____ like vegetables, but now I love them.",
        ["didn't use to", "don't usually", "wasn't used to"],
        0,
        "Use 'didn't use to' for a past state that changed."
      ),
      multipleChoiceItem(
        "hs8",
        "Choose the correct option.",
        "It's taking me a long time to ____ living in the city.",
        ["be used to", "get used to", "used to"],
        1,
        "Use 'get used to' for the process of becoming accustomed to something."
      ),
      multipleChoiceItem(
        "hs9",
        "Choose the correct option.",
        "British people ____ on the left.",
        ["used to drive", "usually drive", "are get used to driving"],
        1,
        "This is a general present habit."
      ),
      multipleChoiceItem(
        "hs10",
        "Choose the correct option.",
        "I ____ be very shy when I was a child.",
        ["usually", "was used to", "used to"],
        2,
        "Use 'used to' for a past state."
      ),
      multipleChoiceItem(
        "hs11",
        "Choose the correct option.",
        "I can't ____ the cold weather here.",
        ["get used to", "use to", "usually"],
        0,
        "Use 'get used to' with 'can't' to show difficulty in adjusting."
      ),
      multipleChoiceItem(
        "hs12",
        "Choose the correct option.",
        "Did you ____ to work by bus?",
        ["usually go", "used to go", "use to go"],
        2,
        "In a question about a past habit, use 'use to'."
      ),
      placeholderGapItem(
        "hs13",
        "Complete the sentence.",
        "I __________ have a dog, but he died last year.",
        "used to",
        [],
        "Past state or possession."
      ),
      placeholderGapItem(
        "hs14",
        "Complete the sentence.",
        "We __________ our friends at the weekend these days. (meet)",
        "usually meet",
        ["normally meet"],
        "Present routine."
      ),
      placeholderGapItem(
        "hs15",
        "Complete the sentence.",
        "I __________ living on my own yet. It feels strange.",
        "am not used to",
        ["'m not used to"],
        "Current state of being accustomed, or not, to something."
      ),
      placeholderGapItem(
        "hs16",
        "Complete the sentence.",
        "Where __________ live before you moved here?",
        "did you use to",
        [],
        "Question about a past habit."
      ),
      placeholderGapItem(
        "hs17",
        "Complete the sentence.",
        "I __________ like coffee, but now I drink three cups a day.",
        "never used to",
        ["didn't use to"],
        "'Never used to' is a common alternative to 'didn't use to'."
      ),
      placeholderGapItem(
        "hs18",
        "Complete the sentence.",
        "She __________ very slim, but she's lost a lot of weight.",
        "didn't use to be",
        ["never used to be"],
        "Past state."
      ),
      placeholderGapItem(
        "hs19",
        "Complete the sentence.",
        "Don't worry, you'll soon __________ the new software.",
        "get used to",
        [],
        "The process of becoming accustomed."
      ),
      placeholderGapItem(
        "hs20",
        "Complete the sentence.",
        "They __________ go out much during the week.",
        "don't normally",
        ["don't usually"],
        "Present negative habit."
      ),
      singleGap(
        "hs21",
        "Rewrite the sentence.",
        ["It was my habit to smoke. -> I ", { gapId: "g1" }, "."],
        ["used to smoke"],
        "Change a past habit to 'used to'."
      ),
      singleGap(
        "hs22",
        "Rewrite the sentence.",
        ["It is still strange for me to drive on the right. -> I'm not ", { gapId: "g1" }, " on the right."],
        ["used to driving"],
        "Be used to + -ing."
      ),
      singleGap(
        "hs23",
        "Rewrite the sentence.",
        ["He was a teacher in the past. -> He ", { gapId: "g1" }, " a teacher."],
        ["used to be"],
        "Use 'used to' for past states."
      ),
      singleGap(
        "hs24",
        "Rewrite the sentence.",
        ["I'm becoming accustomed to the noise. -> I'm ", { gapId: "g1" }, " the noise."],
        ["getting used to"],
        "Use 'get used to' for the process of adjusting."
      ),
      singleGap(
        "hs25",
        "Rewrite the sentence.",
        ["Is it your normal routine to walk to work? -> Do you ", { gapId: "g1" }, " to work?"],
        ["usually walk", "normally walk"],
        "Use 'usually' or 'normally' for present routines."
      ),
    ],
  },
  {
    id: "past-narrative-tenses",
    title: "Past and Narrative Tenses",
    shortDescription: "Practise past simple, past continuous, and past perfect together.",
    levels: ["b1"],
    intro:
      "Work through past simple, past continuous, and past perfect in a mixed test. Focus on sequence, interruption, and background description.",
    items: [
      errorCorrectionItem(
        "pt-ec-1",
        "Check the highlighted phrase for errors.",
        "I was having a shower when the phone rang.",
        "was having",
        true,
        "",
        "This is correct. Use the past continuous for an action in progress when another action happened."
      ),
      errorCorrectionItem(
        "pt-ec-2",
        "Check the highlighted phrase for errors.",
        "When we got to the cinema, the film already started.",
        "already started",
        false,
        "had already started",
        "Use the past perfect for an action that happened before another past action."
      ),
      errorCorrectionItem(
        "pt-ec-3",
        "Check the highlighted phrase for errors.",
        "While I did my homework, my brother was playing video games.",
        "did my homework",
        false,
        "was doing my homework",
        "Use the past continuous with 'while' for two actions happening at the same time."
      ),
      errorCorrectionItem(
        "pt-ec-4",
        "Check the highlighted phrase for errors.",
        "She didn’t recognise me because I wore a hat and sunglasses.",
        "wore",
        false,
        "was wearing",
        "Use the past continuous to describe the temporary appearance or situation at that moment in the past."
      ),
      errorCorrectionItem(
        "pt-ec-5",
        "Check the highlighted phrase for errors.",
        "By the time the police arrived, the thieves escaped.",
        "escaped",
        false,
        "had escaped",
        "Use the past perfect after 'by the time' for the earlier past action."
      ),
      errorCorrectionItem(
        "pt-ec-6",
        "Check the highlighted phrase for errors.",
        "It was snowing, and the wind blew really hard.",
        "was snowing",
        true,
        "",
        "This is correct. The past continuous can set the scene, while the past simple gives the main event or detail."
      ),
      errorCorrectionItem(
        "pt-ec-7",
        "Check the highlighted phrase for errors.",
        "When the teacher came in, we wrote the last question.",
        "wrote",
        false,
        "were writing",
        "Use the past continuous for an action already in progress when another past action happened."
      ),
      errorCorrectionItem(
        "pt-ec-8",
        "Check the highlighted phrase for errors.",
        "After I had turned off the lights, I locked the door.",
        "had turned off",
        true,
        "",
        "This is correct. The past perfect shows the earlier of the two past actions."
      ),
      errorCorrectionItem(
        "pt-ec-9",
        "Check the highlighted phrase for errors.",
        "He was knowing the answer, but he was too nervous to speak.",
        "was knowing",
        false,
        "knew",
        "We don't normally use stative verbs like 'know' in the past continuous."
      ),
      errorCorrectionItem(
        "pt-ec-10",
        "Check the highlighted phrase for errors.",
        "The match had finished, and then the fans were leaving the stadium.",
        "were leaving",
        false,
        "left",
        "Use the past simple for the next completed action in a narrative sequence."
      ),
      placeholderGapItem(
        "pt-gf-1",
        "Fill the gap.",
        "I __________ dinner when the lights went out. (cook)",
        "was cooking",
        [],
        "Use the past continuous for an action in progress when another action happened."
      ),
      placeholderGapItem(
        "pt-gf-2",
        "Fill the gap.",
        "By the time we arrived at the station, the train __________. (leave)",
        "had left",
        [],
        "Use the past perfect for an action that happened before another past action."
      ),
      placeholderGapItem(
        "pt-gf-3",
        "Fill the gap.",
        "While the children __________ in the garden, their parents prepared lunch. (play)",
        "were playing",
        [],
        "Use the past continuous with 'while' for an action in progress."
      ),
      placeholderGapItem(
        "pt-gf-4",
        "Fill the gap.",
        "She __________ her leg while she was skiing. (hurt)",
        "hurt",
        [],
        "Use the past simple for the main completed event."
      ),
      placeholderGapItem(
        "pt-gf-5",
        "Fill the gap.",
        "When I opened the door, I realised that someone __________ my bag. (take)",
        "had taken",
        [],
        "Use the past perfect for the earlier past action."
      ),
      placeholderGapItem(
        "pt-gf-6",
        "Fill the gap.",
        "It __________ heavily, so we decided to stay inside. (rain)",
        "was raining",
        [],
        "Use the past continuous to describe the background situation."
      ),
      placeholderGapItem(
        "pt-gf-7",
        "Fill the gap.",
        "After they __________ the match, they went out for dinner. (win)",
        "had won",
        [],
        "Use the past perfect for the earlier action before another past event."
      ),
      placeholderGapItem(
        "pt-gf-8",
        "Fill the gap.",
        "What __________ at 9 o’clock last night? (you/do)",
        "were you doing",
        [],
        "Use the past continuous for an action in progress at a specific time in the past."
      ),
      placeholderGapItem(
        "pt-gf-9",
        "Fill the gap.",
        "We __________ TV when we heard a loud crash outside. (watch)",
        "were watching",
        [],
        "Use the past continuous for the background action interrupted by another event."
      ),
      placeholderGapItem(
        "pt-gf-10",
        "Fill the gap.",
        "I was really tired because I __________ very little the night before. (sleep)",
        "had slept",
        [],
        "Use the past perfect for the earlier cause in the past."
      ),
      placeholderGapItem(
        "pt-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "Event 1: We finished dinner. Event 2: The guests arrived.\nBy the time the guests arrived, we __________ dinner.",
        "had finished",
        ["had eaten", "'d finished", "'d eaten"],
        "Use the Past Perfect to show dinner was completed before the arrival."
      ),
      placeholderGapItem(
        "pt-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "I walked to work this morning. On the way, I saw the accident.\nWhile I __________ to work, I saw the accident.",
        "was walking",
        [],
        "Use the past continuous for an action in progress when another action happened."
      ),
      placeholderGapItem(
        "pt-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        // Prompt uses Past Simple to show a sequence
        "The plane took off at 6:00. We reached the airport at 6:15.\nBy the time we reached the airport, the plane __________ off.",
        "had already taken",
        ["had taken", "'d already taken", "'d taken"],
        "Use the past perfect (had + past participle) to show an action happened before another point in the past."
      ),
      placeholderGapItem(
        "pt-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "I started reading at 7:00. My friend called at 7:30.\nI __________ when my friend called.",
        "was reading",
        ["had been reading"],
        "The reading was an 'in-progress' background action when the call interrupted."
      ),
      placeholderGapItem(
        "pt-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "The children played in the garden. At the same time. their parents made lunch.\nWhile the children __________ in the garden, their parents made lunch.",
        "were playing",
        [],
        "Use the past continuous with 'while' for an action in progress."
      ),
      placeholderGapItem(
        "pt-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "She ate too much. Later, she felt sick.\nShe felt sick because she __________ too much.",
        "had eaten",
        [],
        "Use the past perfect for the earlier cause in the past."
      ),
      placeholderGapItem(
        "pt-rf-7",
        "Complete the second sentence so that it has a similar meaning.",
        "The film started, and then we arrived at the cinema.\nWhen we arrived at the cinema, the film __________.",
        "had started",
        ["had already started"],
        "Use the past perfect for the action that happened before we arrived."
      ),
      placeholderGapItem(
        "pt-rf-8",
        "Complete the second sentence so that it has a similar meaning.",
        "I began watching TV at 7:00 and finished at 9:00.\nAt 8:00 last night, I __________ TV.",
        "was watching",
        "Use Past Continuous for an action in progress at a specific point in time."
      ),
    ],
  },
  {
    id: "first-conditional-8b-a2b1",
    title: "First Conditional: Future Possibilities",
    shortDescription: "Master the structure of 'if + present' to talk about future results.",
    levels: ["a2", "b1"],
    intro:
      "Use the First Conditional to talk about things that are likely to happen in the future. Remember: use the Present Simple after 'if', and 'will' or 'won't' for the result. You can also use 'can' or an imperative for the consequence.",
    items: [
      multipleChoiceItem(
        "fc2-mc-1",
        "Choose the correct verb form.",
        "If I ____ time this evening, I'll help you with your project.",
        ["have", "will have", "had"],
        0,
        "We use the Present Simple after 'if' to talk about a future condition."
      ),
      multipleChoiceItem(
        "fc2-mc-2",
        "Choose the correct verb form.",
        "She ____ very happy if she doesn't get that job.",
        ["isn't", "won't be", "don't be"],
        1,
        "Use 'will / won't' for the consequence or result of the condition."
      ),
      multipleChoiceItem(
        "fc2-mc-3",
        "Choose the correct verb form.",
        "If they ____ to the party, they'll have a great time.",
        ["will go", "go", "goes"],
        1,
        "The if-clause requires the Present Simple."
      ),
      multipleChoiceItem(
        "fc2-mc-4",
        "Choose the correct option.",
        "We'll go for a walk if the sun ____ tomorrow.",
        ["shines", "will shine", "is shine"],
        0,
        "Use the Present Simple (third person -s) after 'if'."
      ),
      multipleChoiceItem(
        "fc2-mc-5",
        "Choose the correct negative form.",
        "If you ____ your coat, you'll be cold outside.",
        ["won't wear", "don't wear", "not wear"],
        1,
        "Use 'don't / doesn't' for negative if-clauses in the Present Simple."
      ),
      multipleChoiceItem(
        "fc2-mc-6",
        "Choose the correct result.",
        "What ____ if you lose your phone?",
        ["do you do", "will you do", "you will do"],
        1,
        "Question form: Will + subject + infinitive for the result."
      ),
      errorCorrectionItem(
        "fc2-ec-1",
        "Check the highlighted phrase for errors.",
        "If I will see Mark, I'll tell him about the meeting.",
        "will see",
        false,
        "see",
        "Never use 'will' in the if-clause. Use the Present Simple instead."
      ),
      errorCorrectionItem(
        "fc2-ec-2",
        "Check the highlighted phrase for errors.",
        "We'll be late if we will not hurry.",
        "if we will not",
        false,
        "if we don't",
        "Use 'don't / doesn't' for negative conditions, not 'will not'."
      ),
      errorCorrectionItem(
        "fc2-ec-3",
        "Check the highlighted phrase for errors.",
        "If it rains tomorrow we won't go to the park.",
        "rains tomorrow we",
        false,
        "rains tomorrow, we",
        "If the if-clause comes first, a comma is normally used before the result clause."
      ),
      errorCorrectionItem(
        "fc2-ec-4",
        "Check the highlighted phrase for errors.",
        "I give you the money if you need it.",
        "give",
        false,
        "will give / 'll give",
        "The result clause needs 'will' to show it's a future consequence."
      ),
      errorCorrectionItem(
        "fc2-ec-5",
        "Check the highlighted phrase for errors.",
        "If you see Sarah, tell her I'm looking for her.",
        "tell",
        true,
        "",
        "Correct! You can use an imperative (tell) instead of 'will' in the consequence clause."
      ),
      errorCorrectionItem(
        "fc2-ec-6",
        "Check the highlighted phrase for errors.",
        "If you have a car, you can drive to the coast.",
        "can drive",
        true,
        "",
        "Correct! You can use 'can' instead of 'will' to talk about possibility."
      ),
      doubleGap(
        "fc2-gf-1",
        "Complete the sentence.",
        ["If you ", { gapId: "g1" }, " (not / hurry), we ", { gapId: "g2" }, " (be) late."],
        ["don't hurry", "do not hurry"],
        ["'ll be", "will be"],
        "Present simple negative after 'if', will + infinitive for result."
      ),
      doubleGap(
        "fc2-gf-2",
        "Complete the sentence.",
        ["We ", { gapId: "g1" }, " (have) a picnic if the weather ", { gapId: "g2" }, " (be) good."],
        ["'ll have", "will have"],
        ["is"],
        "If the if-clause comes second, do not use a comma."
      ),
      doubleGap(
        "fc2-gf-3",
        "Complete the sentence.",
        ["If she ", { gapId: "g1" }, " (find) your keys, she ", { gapId: "g2" }, " (call) you immediately."],
        ["finds"],
        ["'ll call", "will call"],
        "Third person singular -s in the present simple, then ''ll for result."
      ),
      doubleGap(
        "fc2-gf-4",
        "Complete the sentence.",
        ["They ", { gapId: "g1" }, " (not / come) to the party if they ", { gapId: "g2" }, " (be) tired."],
        ["won't come", "will not come"],
        ["'re", "are"],
        "Use 'won't' for a negative consequence."
      ),
      doubleGap(
        "fc2-gf-5",
        "Complete the sentence.",
        ["If you ", { gapId: "g1" }, " (be) cold, ", { gapId: "g2" }, " (put on) a sweater."],
        ["are", "'re"],
        ["put on"],
        "The imperative can replace the 'will' clause."
      ),
      doubleGap(
        "fc2-gf-6",
        "Complete the sentence.",
        ["What ", { gapId: "g1" }, " (you / do) if you ", { gapId: "g2" }, " (not / find) your passport?"],
        ["will you do"],
        ["don't find", "do not find"],
        "Question form: Will + subject + infinitive... if + subject + don't + infinitive."
      ),
      singleGap(
        "fc2-rf-1",
        "Change the order of the clauses.",
        ["If ", { gapId: "g1" }, "."],
        [
          "I pass the exam, I'll be very happy",
          "I pass the exam, I will be very happy",
          "I pass the exam I'll be very happy",
          "I pass the exam I will be very happy",
          "i pass the exam, i'll be very happy",
          "i pass the exam, i will be very happy",
          "i pass the exam i'll be very happy",
          "i pass the exam i will be very happy",
        ],
        "When the if-clause comes first, a comma is common, but we won't be strict about punctuation here.",
        { originalSentence: "I'll be very happy if I pass the exam." }
      ),
      singleGap(
        "fc2-rf-2",
        "Rewrite as a negative condition.",
        ["You'll be cold if ", { gapId: "g1" }, "."],
        ["you don't wear a coat", "you do not wear a coat"],
        "The negative present simple is used for negative conditions.",
        { originalSentence: "If you wear a coat, you won't be cold." }
      ),
      singleGap(
        "fc2-rf-3",
        "Rewrite using 'can' for the result.",
        ["If the weather stays good, we ", { gapId: "g1" }, " to the beach."],
        ["can go"],
        "Use 'can' to show a possible consequence.",
        { originalSentence: "If the weather stays good, it is possible for us to go to the beach." }
      ),
      singleGap(
        "fc2-rf-4",
        "Rewrite using an imperative for advice.",
        ["If you see Mark, ", { gapId: "g1" }, " him to call me."],
        ["tell"],
        "Use the base form for an imperative command.",
        { originalSentence: "If you see Mark, you will tell him to call me." }
      ),
      singleGap(
        "fc2-rf-5",
        "Rewrite as a question.",
        ["", { gapId: "g1" }, " if you don't leave now?"],
        ["Will you miss the train"],
        "Form a question by moving 'will' before the subject.",
        { originalSentence: "You'll miss the train if you don't leave now." }
      ),
      singleGap(
        "fc2-rf-6",
        "Combine the ideas.",
        ["If ", { gapId: "g1" }, " at home."],
        [
          "it rains, we'll stay",
          "it rains, we will stay",
          "it rains we'll stay",
          "it rains we will stay",
        ],
        "Combine two facts into a conditional sentence. We won't be strict about the comma.",
        { originalSentence: "It might rain. Then we'll stay at home." }
      ),
    ],
  },
  {
    id: "first-conditional-and-future-clauses",
    title: "First Conditional & Future Time Clauses",
    shortDescription: "Master 'if', 'unless', 'when', 'until', and 'as soon as'.",
    levels: ["b1"],
    intro:
      "Practice using the present tense after 'if', 'unless', and time expressions like 'when' or 'as soon as' to talk about the future.",
    items: [
      errorCorrectionItem(
        "fc-ec-1",
        "Check the highlighted phrase for errors.",
        "If you will work hard, you'll pass your exams.",
        "will work",
        false,
        "work",
        "We use the present tense, not the future, after 'if' in first conditional sentences."
      ),
      errorCorrectionItem(
        "fc-ec-2",
        "Check the highlighted phrase for errors.",
        "I'll have a quick lunch before I leave.",
        "before I leave",
        true,
        "",
        "Correct. We use the present simple after 'before' when talking about the future."
      ),
      errorCorrectionItem(
        "fc-ec-3",
        "Check the highlighted phrase for errors.",
        "Alison won't get into university unless she will get good grades.",
        "will get",
        false,
        "gets",
        "Use the present simple after 'unless' to talk about a future condition."
      ),
      errorCorrectionItem(
        "fc-ec-4",
        "Check the highlighted phrase for errors.",
        "As soon as you get your exam results, call me.",
        "call me",
        true,
        "",
        "Correct. You can use an imperative instead of a 'will' clause in conditionals."
      ),
      errorCorrectionItem(
        "fc-ec-5",
        "Check the highlighted phrase for errors.",
        "I won't go to bed until you will come home.",
        "will come",
        false,
        "come",
        "Use the present simple, not 'will', after 'until'."
      ),
      multipleChoiceItem(
        "fc-mc-1",
        "Choose the correct word.",
        "I won't go ____ you go too.",
        ["unless", "if", "until"],
        0,
        "Use 'unless' to mean 'if... not'."
      ),
      multipleChoiceItem(
        "fc-mc-2",
        "Choose the correct verb form.",
        "That girl ____ into trouble if she doesn't wear her uniform.",
        ["gets", "will get", "got"],
        1,
        "Use 'will + infinitive' for the consequence in a first conditional sentence."
      ),
      multipleChoiceItem(
        "fc-mc-3",
        "Choose the correct word.",
        "Don't turn over the exam paper ____ the teacher tells you to.",
        ["after", "until", "when"],
        1,
        "Use 'until' to mean 'up to that time'."
      ),
      multipleChoiceItem(
        "fc-mc-4",
        "Choose the correct verb form.",
        "I'll look for a job after I ____ back from holiday.",
        ["will come", "come", "am coming"],
        1,
        "Use the present simple after 'after' when referring to future time."
      ),
      multipleChoiceItem(
        "fc-mc-5",
        "Choose the correct word.",
        "The job is very urgent, so please do it ____ you can.",
        ["as soon as", "until", "before"],
        0,
        "Use 'as soon as' to mean 'at the moment that'."
      ),
      placeholderGapItem(
        "fc-gf-1",
        "Complete with the present simple or 'will' form.",
        "If you __________ in your homework late, the teacher won't mark it. (hand)",
        "hand",
        [],
        "Use the present simple after 'if'."
      ),
      placeholderGapItem(
        "fc-gf-2",
        "Complete with the present simple or 'will' form.",
        "Gary __________ expelled if his behaviour doesn't improve. (be)",
        "will be",
        ["'ll be"],
        "Use 'will' for the result clause."
      ),
      placeholderGapItem(
        "fc-gf-3",
        "Complete with the present simple or 'will' form.",
        "They'll be late for school unless they __________. (hurry)",
        "hurry",
        [],
        "Use the present simple after 'unless'."
      ),
      placeholderGapItem(
        "fc-gf-4",
        "Complete with the present simple or 'will' form.",
        "Ask me if you __________ what to do. (not know)",
        "don't know",
        ["do not know"],
        "Use the present simple after 'if'."
      ),
      placeholderGapItem(
        "fc-gf-5",
        "Complete with the present simple or 'will' form.",
        "Johnny __________ punished if he shouts at the teacher again. (be)",
        "will be",
        ["'ll be"],
        "The result clause uses 'will'."
      ),
      placeholderGapItem(
        "fc-gf-6",
        "Complete with the present simple or 'will' form.",
        "My sister __________ university this year if she passes all her exams. (finish)",
        "will finish",
        ["'ll finish"],
        "The result clause uses 'will'."
      ),
      placeholderGapItem(
        "fc-gf-7",
        "Complete with the present simple or 'will' form.",
        "I __________ tonight unless I finish my homework quickly. (not go out)",
        "won't go out",
        ["will not go out"],
        "Use 'will not' in the negative result clause."
      ),
      placeholderGapItem(
        "fc-gf-8",
        "Complete with the present simple or 'will' form.",
        "Call me if you __________ some help with your project. (need)",
        "need",
        [],
        "Use the present simple after 'if'."
      ),
      placeholderGapItem(
        "fc-gf-9",
        "Complete with the present simple or 'will' form.",
        "We'll stay in the library as soon as it __________. (open)",
        "opens",
        [],
        "Use the present simple after 'as soon as'."
      ),
      placeholderGapItem(
        "fc-gf-10",
        "Complete with the present simple or 'will' form.",
        "Give Mummy a kiss before she __________ to work. (go)",
        "goes",
        [],
        "Use the present simple after 'before'."
      ),
      singleGap(
        "fc-rf-1",
        "Rewrite using 'unless'.",
        [
          "I won't go to the party if you don't come with me. -> I won't go to the party ",
          { gapId: "g1" },
          " with me.",
        ],
        ["unless you come"],
        "Replace 'if... not' with 'unless' + present simple."
      ),
      singleGap(
        "fc-rf-2",
        "Complete the time clause.",
        [
          "I'm going to finish university. Then I'll travel. -> After I ",
          { gapId: "g1" },
          ", I'll probably travel.",
        ],
        ["finish university"],
        "Use the present simple after 'after' to talk about the future."
      ),
      singleGap(
        "fc-rf-3",
        "Complete the sentence.",
        [
          "The teacher will be angry if we are late. -> If we are late, the teacher ",
          { gapId: "g1" },
          ".",
        ],
        ["will be angry", "'ll be angry"],
        "Changing the order of the clauses doesn't change the tense pattern."
      ),
      singleGap(
        "fc-rf-4",
        "Rewrite using 'until'.",
        [
          "It's snowing. We can't go out yet. -> We won't go out ",
          { gapId: "g1" },
          " snowing.",
        ],
        ["until it stops"],
        "Use 'until' + present simple for the time condition."
      ),
      singleGap(
        "fc-rf-5",
        "Complete the imperative conditional.",
        [
          "Have time? Come and see us. -> Come and see us next week if you ",
          { gapId: "g1" },
          ".",
        ],
        ["have time"],
        "Use the present simple after 'if' even with an imperative main clause."
      ),
    ],
  },
  {
    id: "modals-of-deduction",
    title: "Modals of Deduction",
    shortDescription: "Practise must, might, and can't for present deduction.",
    levels: ["b1"],
    intro:
      "Use 'must', 'might', and 'can't' to make deductions about the present, including actions happening now.",
    items: [
      multipleChoiceItem(
        "md-mc-1",
        "Choose the correct option.",
        "All the lights are off and there’s no car outside. They ____ at home.",
        ["must be", "might be", "can't be"],
        2,
        "Use 'can't be' when you are sure something is not true based on the evidence."
      ),
      multipleChoiceItem(
        "md-mc-2",
        "Choose the correct option.",
        "Anna’s been studying medicine for six years. She ____ a doctor by now.",
        ["can't be", "might be", "must be"],
        2,
        "Use 'must be' when the evidence makes you feel sure something is true."
      ),
      multipleChoiceItem(
        "md-mc-3",
        "Choose the correct option.",
        "I’m not sure where Leo is. He ____ at the gym, but I haven’t checked.",
        ["must be", "might be", "can't be"],
        1,
        "Use 'might be' when something is possible, but you are not sure."
      ),
      multipleChoiceItem(
        "md-mc-4",
        "Choose the correct option.",
        "That girl ____ a university student — she looks about twelve.",
        ["must be", "might be", "can't be"],
        2,
        "Use 'can't be' when you think something is impossible or clearly untrue."
      ),
      multipleChoiceItem(
        "md-mc-5",
        "Choose the correct option.",
        "Listen to that music! They ____ a party.",
        ["must be having", "might have", "can't be having"],
        0,
        "Use 'must be having' when the evidence strongly suggests an action is happening now."
      ),
      multipleChoiceItem(
        "md-mc-6",
        "Choose the correct option.",
        "She hasn’t replied to my messages. She ____ her phone.",
        ["must lose", "might not have", "can't to have"],
        1,
        "Use 'might not have' when you think something is possibly not true. Here 'have' is a main verb."
      ),
      multipleChoiceItem(
        "md-mc-7",
        "Choose the correct option.",
        "He’s wearing a wedding ring, so he ____ married.",
        ["might be", "must be", "can't be"],
        1,
        "Use 'must be' for a strong logical deduction."
      ),
      multipleChoiceItem(
        "md-mc-8",
        "Choose the correct option.",
        "Why isn’t Marta answering? She ____ asleep already; it's quite late.",
        ["might be", "mustn't be", "can't be"],
        0,
        "Use 'might be' when something is a possible explanation."
      ),
      multipleChoiceItem(
        "md-mc-9",
        "Choose the correct option.",
        "He drives a Ferrari and owns three houses. He ____ a lot of money.",
        ["can't have", "might have", "must have"],
        2,
        "Use 'must have' when you are making a strong deduction about possession."
      ),
      multipleChoiceItem(
        "md-mc-10",
        "Choose the correct option.",
        "She’s laughing and dancing with everyone. She ____ the party.",
        ["can't be enjoying", "must be enjoying", "must enjoy"],
        1,
        "Use 'must be enjoying' when the evidence clearly suggests something is happening now."
      ),
      errorCorrectionItem(
        "md-ec-1",
        "Check the highlighted phrase for errors.",
        "That man mustn't be a teacher — he’s wearing a police uniform.",
        "mustn't be",
        false,
        "can't be",
        "Use 'can't be' for deduction when you think something is impossible. 'Mustn't' is usually used for prohibition."
      ),
      errorCorrectionItem(
        "md-ec-2",
        "Check the highlighted phrase for errors.",
        "I’m not sure where Eva is. She can be in the library.",
        "can be",
        false,
        "might be",
        "In this meaning, we use 'might' for possibility, not 'can'."
      ),
      errorCorrectionItem(
        "md-ec-3",
        "Check the highlighted phrase for errors.",
        "Look at his suit and tie — he must be a businessman.",
        "must be",
        true,
        "",
        "This is correct. Use 'must be' for a strong deduction about the present."
      ),
      errorCorrectionItem(
        "md-ec-4",
        "Check the highlighted phrase for errors.",
        "She might not likes that film. It’s not really her kind of thing.",
        "might not likes",
        false,
        "might not like",
        "After a modal verb, use the base form of the verb: 'might not like'."
      ),
      errorCorrectionItem(
        "md-ec-5",
        "Check the highlighted phrase for errors.",
        "They must to be at home — the kitchen light is on.",
        "must to be",
        false,
        "must be",
        "After 'must', use the infinitive without 'to'."
      ),
      errorCorrectionItem(
        "md-ec-6",
        "Check the highlighted phrase for errors.",
        "I’m not sure, but he might be working late tonight.",
        "might be working",
        true,
        "",
        "This is correct. We can use 'might be + -ing' for a possible action happening around now."
      ),
      errorCorrectionItem(
        "md-ec-7",
        "Check the highlighted phrase for errors.",
        "That can’t be Jenny’s coat — hers is blue, not black.",
        "can't be",
        true,
        "",
        "This is correct. Use 'can't be' when you are sure something is not true."
      ),
      errorCorrectionItem(
        "md-ec-8",
        "Check the highlighted phrase for errors.",
        "He must being very tired after that ten-hour journey.",
        "must being",
        false,
        "must be",
        "After 'must', use 'be', not 'being', unless you are forming 'must be + -ing'."
      ),
      errorCorrectionItem(
        "md-ec-9",
        "Check the highlighted phrase for errors.",
        "She’s in a meeting, so she can’t answer her phone right now.",
        "can't answer",
        true,
        "",
        "This is correct. 'Can't' expresses impossibility here."
      ),
      errorCorrectionItem(
        "md-ec-10",
        "Check the highlighted phrase for errors.",
        "They might not be at home — the lights are on in every room.",
        "might not be",
        false,
        "must be",
        "The evidence suggests a strong positive deduction, so 'must be' is better than 'might not be'."
      ),
      placeholderGapItem(
        "md-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "I’m sure he’s at work.\nHe __________ at work.",
        "must be",
        [],
        "Use 'must be' when you are sure something is true."
      ),
      placeholderGapItem(
        "md-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "Maybe she’s asleep.\nShe __________ asleep.",
        "might be",
        ["may be", "could be"],
        "Use 'might be' for a possible explanation when you are not sure."
      ),
      placeholderGapItem(
        "md-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        "I’m sure that isn’t their house.\nThat __________ their house.",
        "can't be",
        ["cannot be"],
        "Use 'can't be' when you are sure something is not true."
      ),
      placeholderGapItem(
        "md-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "Perhaps they’re having lunch.\nThey __________ lunch.",
        "might be having",
        ["may be having", "could be having"],
        "Use 'might be + -ing' for a possible action happening now."
      ),
      placeholderGapItem(
        "md-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "I’m sure she has a lot of money.\nShe __________ a lot of money.",
        "must have",
        [],
        "Use 'must have' here with 'have' as a main verb to express a strong deduction about possession."
      ),
      placeholderGapItem(
        "md-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "Maybe he doesn’t like seafood.\nHe __________ seafood.",
        "might not like",
        ["may not like"],
        "Use 'might not' when something is possibly not true."
      ),
      placeholderGapItem(
        "md-rf-7",
        "Complete the second sentence so that it has a similar meaning.",
        "I’m sure they aren’t ready yet.\nThey __________ ready yet.",
        "can't be",
        ["cannot be"],
        "Use 'can't be' for a strong negative deduction."
      ),
      placeholderGapItem(
        "md-rf-8",
        "Complete the second sentence so that it has a similar meaning.",
        "Perhaps your parents are watching TV.\nYour parents __________ TV.",
        "might be watching",
        ["may be watching", "could be watching"],
        "Use 'might be + -ing' to talk about a possible action happening now."
      ),
    ],
  },
  {
    id: "gerunds-and-infinitives",
    title: "Gerunds and Infinitives",
    shortDescription: "Practise gerunds, to-infinitives, and bare infinitives.",
    levels: ["b1"],
    intro:
      "Work on common gerund, to-infinitive, and bare infinitive patterns in a mixed mini test.",
    items: [
      multipleChoiceItem(
        "gi-mc-1",
        "Choose the correct option.",
        "I’m really good at ____ in a team.",
        ["work", "to work", "working"],
        2,
        "Use the gerund after prepositions like 'at'."
      ),
      multipleChoiceItem(
        "gi-mc-2",
        "Choose the correct option.",
        "She decided ____ early because she wasn’t feeling well.",
        ["leave", "to leave", "leaving"],
        1,
        "Use the to-infinitive after 'decide'."
      ),
      multipleChoiceItem(
        "gi-mc-3",
        "Choose the correct option.",
        "You must ____ your phone off during the exam.",
        ["switch", "to switch", "switching"],
        0,
        "Use the bare infinitive after modal verbs like 'must'."
      ),
      multipleChoiceItem(
        "gi-mc-4",
        "Choose the correct option.",
        "They enjoy ____ out for dinner at weekends.",
        ["go", "to go", "going"],
        2,
        "Use the gerund after 'enjoy'."
      ),
      multipleChoiceItem(
        "gi-mc-5",
        "Choose the correct option.",
        "My parents want me ____ medicine at university.",
        ["study", "to study", "studying"],
        1,
        "Use verb + person + to-infinitive after 'want'."
      ),
      multipleChoiceItem(
        "gi-mc-6",
        "Choose the correct option.",
        "This software is easy ____ once you get used to it.",
        ["use", "to use", "using"],
        1,
        "Use the to-infinitive after adjectives like 'easy'."
      ),
      multipleChoiceItem(
        "gi-mc-7",
        "Choose the correct option.",
        "The teacher made us ____ the exercise again.",
        ["do", "to do", "doing"],
        0,
        "Use the bare infinitive after 'make' + object."
      ),
      multipleChoiceItem(
        "gi-mc-8",
        "Choose the correct option.",
        "He’s thinking of ____ abroad for a year.",
        ["work", "to work", "working"],
        2,
        "Use the gerund after prepositions like 'of'."
      ),
      multipleChoiceItem(
        "gi-mc-9",
        "Choose the correct option.",
        "We went to the shop ____ some milk.",
        ["buy", "to buy", "buying"],
        1,
        "Use the to-infinitive to express purpose."
      ),
      multipleChoiceItem(
        "gi-mc-10",
        "Choose the correct option.",
        "My boss let me ____ home early yesterday.",
        ["go", "to go", "going"],
        0,
        "Use the bare infinitive after 'let' + object."
      ),
      errorCorrectionItem(
        "gi-ec-1",
        "Check the highlighted phrase for errors.",
        "I’m interested in to learn more about graphic design.",
        "in to learn",
        false,
        "in learning",
        "Use the gerund after prepositions like 'in'."
      ),
      errorCorrectionItem(
        "gi-ec-2",
        "Check the highlighted phrase for errors.",
        "She promised to call me after the meeting.",
        "promised to call",
        true,
        "",
        "This is correct. Use the to-infinitive after 'promise'."
      ),
      errorCorrectionItem(
        "gi-ec-3",
        "Check the highlighted phrase for errors.",
        "You shouldn’t to tell him anything yet.",
        "shouldn't to tell",
        false,
        "shouldn't tell",
        "Use the bare infinitive after modal verbs like 'should'."
      ),
      errorCorrectionItem(
        "gi-ec-4",
        "Check the highlighted phrase for errors.",
        "My parents don’t let me going out late on school nights.",
        "let me going",
        false,
        "let me go",
        "Use the bare infinitive after 'let' + object."
      ),
      errorCorrectionItem(
        "gi-ec-5",
        "Check the highlighted phrase for errors.",
        "We agreed meeting outside the station at six.",
        "agreed meeting",
        false,
        "agreed to meet",
        "Use the to-infinitive after 'agree'."
      ),
      errorCorrectionItem(
        "gi-ec-6",
        "Check the highlighted phrase for errors.",
        "She’s very good at solving practical problems.",
        "at solving",
        true,
        "",
        "This is correct. Use the gerund after prepositions like 'at'."
      ),
      placeholderGapItem(
        "gi-gf-1",
        "Fill the gap.",
        "I can’t afford __________ a new laptop right now. (buy)",
        "to buy",
        [],
        "Use the to-infinitive after 'afford'."
      ),
      placeholderGapItem(
        "gi-gf-2",
        "Fill the gap.",
        "She suggested __________ a taxi because it was getting late. (take)",
        "taking",
        [],
        "Use the gerund after 'suggest'."
      ),
      placeholderGapItem(
        "gi-gf-3",
        "Fill the gap.",
        "You must __________ your passport with you at all times. (carry)",
        "carry",
        [],
        "Use the bare infinitive after 'must'."
      ),
      placeholderGapItem(
        "gi-gf-4",
        "Fill the gap.",
        "I’d like __________ abroad for a few years after university. (work)",
        "to work",
        [],
        "Use the to-infinitive after 'would like'."
      ),
      placeholderGapItem(
        "gi-gf-5",
        "Fill the gap.",
        "They spend a lot of time __________ for cheap flights online. (look)",
        "looking",
        [],
        "Use the gerund after expressions like 'spend time'."
      ),
      placeholderGapItem(
        "gi-gf-6",
        "Fill the gap.",
        "The film made me __________ really emotional. (feel)",
        "feel",
        [],
        "Use the bare infinitive after 'make' + object."
      ),
      placeholderGapItem(
        "gi-gf-7",
        "Fill the gap.",
        "He hopes __________ his driving test next month. (pass)",
        "to pass",
        [],
        "Use the to-infinitive after 'hope'."
      ),
      placeholderGapItem(
        "gi-gf-8",
        "Fill the gap.",
        "I don’t mind __________ late if the work is interesting. (stay)",
        "staying",
        [],
        "Use the gerund after 'mind'."
      ),
    ],
  },
  {
    id: "gerund-infinitive-review-a2b1",
    title: "Gerunds and Infinitives Review",
    shortDescription: "Master the patterns of 'to + verb' and 'verb + -ing' in context.",
    levels: ["a2", "b1"],
    intro:
      "Some verbs need an infinitive (to go), while others need a gerund (going). We also use infinitives for purpose and gerunds after prepositions. Practice these patterns with original scenarios.",
    items: [
      multipleChoiceItem(
        "gi2-mc-1",
        "Choose the correct form.",
        "They've decided ____ a new car next month.",
        ["buying", "to buy", "buy"],
        1,
        "The verb 'decide' is followed by the to-infinitive."
      ),
      multipleChoiceItem(
        "gi2-mc-2",
        "Choose the correct form.",
        "I really enjoy ____ to music while I study.",
        ["listening", "to listen", "listen"],
        0,
        "The verb 'enjoy' is followed by the gerund (-ing)."
      ),
      multipleChoiceItem(
        "gi2-mc-3",
        "Choose the correct form.",
        "He promised ____ me with my project this weekend.",
        ["helping", "to help", "help"],
        1,
        "The verb 'promise' is followed by the to-infinitive."
      ),
      multipleChoiceItem(
        "gi2-mc-4",
        "Choose the correct form.",
        "Do you mind ____ the window? It's a bit cold.",
        ["closing", "to close", "close"],
        0,
        "The verb 'mind' is followed by the gerund (-ing)."
      ),
      multipleChoiceItem(
        "gi2-mc-5",
        "Choose the correct form.",
        "I'd like ____ to that new Italian restaurant for dinner.",
        ["going", "to go", "go"],
        1,
        "Use 'would like' + to-infinitive."
      ),
      multipleChoiceItem(
        "gi2-mc-6",
        "Choose the correct form.",
        "She spends a lot of time ____ photos for her blog.",
        ["taking", "to take", "take"],
        0,
        "After 'spend (time)', use the gerund (-ing)."
      ),
      errorCorrectionItem(
        "gi2-ec-1",
        "Check the highlighted phrase for errors.",
        "I went to the pharmacy for buy some aspirin.",
        "for buy",
        false,
        "to buy",
        "To express purpose, use 'to + infinitive', not 'for'."
      ),
      errorCorrectionItem(
        "gi2-ec-2",
        "Check the highlighted phrase for errors.",
        "It was very difficult understanding the instructions.",
        "understanding",
        false,
        "to understand",
        "After adjectives like 'difficult', 'nice', or 'important', use the to-infinitive."
      ),
      errorCorrectionItem(
        "gi2-ec-3",
        "Check the highlighted phrase for errors.",
        "He left the room without to say goodbye.",
        "without to say",
        false,
        "without saying",
        "After prepositions like 'without', 'before', or 'after', use the gerund (-ing)."
      ),
      errorCorrectionItem(
        "gi2-ec-4",
        "Check the highlighted phrase for errors.",
        "I forgot telling you about the meeting.",
        "telling",
        false,
        "to tell",
        "Use 'forget + to-infinitive' for a task you didn't remember to do."
      ),
      errorCorrectionItem(
        "gi2-ec-5",
        "Check the highlighted phrase for errors.",
        "I don't feel like to go to the gym today.",
        "to go",
        false,
        "going",
        "The expression 'feel like' is followed by the gerund (-ing)."
      ),
      errorCorrectionItem(
        "gi2-ec-6",
        "Check the highlighted phrase for errors.",
        "Swimming in the sea is my favourite hobby.",
        "Swimming",
        true,
        "",
        "Correct! We use the gerund (-ing) when a verb is the subject of a sentence."
      ),
      placeholderGapItem(
        "gi2-gf-1",
        "Complete the sentence.",
        "I'm saving money __________ (buy) a new laptop.",
        "to buy",
        [],
        "Use the infinitive of purpose."
      ),
      placeholderGapItem(
        "gi2-gf-2",
        "Complete the sentence.",
        "It's important __________ (not / be) late for the interview.",
        "not to be",
        [],
        "The negative infinitive is 'not to + verb'."
      ),
      placeholderGapItem(
        "gi2-gf-3",
        "Complete the sentence.",
        "I'm not sure __________ (what / do) about the problem.",
        "what to do",
        [],
        "Use the to-infinitive after question words."
      ),
      placeholderGapItem(
        "gi2-gf-4",
        "Complete the sentence.",
        "__________ (learn) a new language takes a lot of time.",
        "Learning",
        [],
        "Use the gerund as the subject of the sentence."
      ),
      placeholderGapItem(
        "gi2-gf-5",
        "Complete the sentence.",
        "She finished __________ (cook) dinner at 8:00.",
        "cooking",
        [],
        "The verb 'finish' is followed by the gerund."
      ),
      placeholderGapItem(
        "gi2-gf-6",
        "Complete the sentence.",
        "I hate __________ (wait) in long queues.",
        "waiting",
        ["to wait"],
        "Verbs like 'hate', 'love', and 'like' can take the gerund or the infinitive."
      ),
    ],
  },
  {
    id: "third-conditional-regrets",
    title: "Third Conditional: Past Regrets",
    shortDescription: "Master 'if + past perfect' and 'would have' for hypothetical pasts.",
    levels: ["b1"],
    intro:
      "Use the third conditional to talk about things that didn't happen in the past and their hypothetical consequences. Remember: if + past perfect, ... would have + past participle.",
    items: [
      errorCorrectionItem(
        "tc-ec-1",
        "Check the highlighted phrase for errors.",
        "If I would have known you were coming, I'd have made a cake.",
        "would have known",
        false,
        "had known",
        "We never use 'would have' in the if-clause. Use the past perfect instead."
      ),
      errorCorrectionItem(
        "tc-ec-2",
        "Check the highlighted phrase for errors.",
        "I would have been late if I hadn't taken a taxi.",
        "would have been",
        true,
        "",
        "Correct. 'Would have' + past participle is the correct structure for the result clause."
      ),
      errorCorrectionItem(
        "tc-ec-3",
        "Check the highlighted phrase for errors.",
        "If we had played better, we might won the match.",
        "might won",
        false,
        "might have won",
        "The modal 'might' needs 'have' + past participle in the third conditional."
      ),
      errorCorrectionItem(
        "tc-ec-4",
        "Check the highlighted phrase for errors.",
        "If he hadn't died so young, he would been a great musician.",
        "would been",
        false,
        "would have been",
        "Don't forget the 'have'. It's 'would have been'."
      ),
      errorCorrectionItem(
        "tc-ec-5",
        "Check the highlighted phrase for errors.",
        "I might have forgotten if you hadn't reminded me.",
        "hadn't reminded",
        true,
        "",
        "Correct. Use the past perfect in the if-clause."
      ),
      multipleChoiceItem(
        "tc-mc-1",
        "Choose the correct verb form.",
        "If I ____ more time, I could have finished the exam.",
        ["had", "had had", "would have had"],
        1,
        "Use the past perfect, had + past participle, in the if-clause."
      ),
      multipleChoiceItem(
        "tc-mc-2",
        "Choose the correct verb form.",
        "We ____ the flight if we'd left five minutes later.",
        ["would miss", "will miss", "would have missed"],
        2,
        "Use 'would have' + past participle for the hypothetical result in the past."
      ),
      multipleChoiceItem(
        "tc-mc-3",
        "Choose the correct verb form.",
        "If you ____ told me about the problem, I would have helped you.",
        ["had", "have", "would have"],
        0,
        "The if-clause requires the past perfect."
      ),
      multipleChoiceItem(
        "tc-mc-4",
        "Choose the correct modal.",
        "I ____ if I'd known it was a formal party.",
        ["wouldn't go", "wouldn't have gone", "hadn't gone"],
        1,
        "Use 'wouldn't have gone' for the hypothetical past result."
      ),
      multipleChoiceItem(
        "tc-mc-5",
        "Choose the correct verb form.",
        "If they ____ the map, they wouldn't have got lost.",
        ["checked", "had checked", "would have checked"],
        1,
        "Use the past perfect after 'if'."
      ),
      placeholderGapItem(
        "tc-gf-1",
        "Complete the sentence.",
        "If you __________ to that party, you wouldn't have met him. (not / go)",
        "hadn't gone",
        ["had not gone"],
        "Use if + past perfect in the negative."
      ),
      placeholderGapItem(
        "tc-gf-2",
        "Complete the sentence.",
        "I __________ you the money if you'd asked me. (lend)",
        "would have lent",
        ["'d have lent", "could have lent"],
        "The result clause uses would have + past participle."
      ),
      placeholderGapItem(
        "tc-gf-3",
        "Complete the sentence.",
        "If I __________ it was your birthday, I'd have bought you a present. (know)",
        "had known",
        ["'d known"],
        "Use if + past perfect."
      ),
      placeholderGapItem(
        "tc-gf-4",
        "Complete the sentence.",
        "We __________ late if we hadn't taken the shortcut. (be)",
        "would have been",
        ["'d have been"],
        "Use the third conditional result clause."
      ),
      placeholderGapItem(
        "tc-gf-5",
        "Complete the sentence.",
        "If they __________ us, we wouldn't have finished on time. (not / help)",
        "hadn't helped",
        ["had not helped"],
        "Use the past perfect negative."
      ),
      placeholderGapItem(
        "tc-gf-6",
        "Complete the sentence.",
        "You __________ the film if you'd come with us. (enjoy)",
        "would have enjoyed",
        ["'d have enjoyed", "might have enjoyed"],
        "Use the result clause for the hypothetical consequence."
      ),
      placeholderGapItem(
        "tc-gf-7",
        "Complete the sentence.",
        "If I __________ it with my own eyes, I wouldn't have believed it. (not / see)",
        "hadn't seen",
        ["had not seen"],
        "Use if + past perfect negative."
      ),
      placeholderGapItem(
        "tc-gf-8",
        "Complete the sentence.",
        "He __________ the exam if he'd studied harder. (not / fail)",
        "wouldn't have failed",
        ["would not have failed"],
        "Use the negative result clause."
      ),
      placeholderGapItem(
        "tc-gf-9",
        "Complete the sentence.",
        "What __________ if you'd lost your passport? (you / do)",
        "would you have done",
        [],
        "Question form: would + subject + have + past participle."
      ),
      placeholderGapItem(
        "tc-gf-10",
        "Complete the sentence.",
        "If we __________ more money, we would have stayed in a better hotel. (have)",
        "had had",
        ["'d had"],
        "The past perfect of 'have' is 'had had'."
      ),
      singleGap(
        "tc-rf-1",
        "Rewrite the facts as a third conditional sentence.",
        [
          "I didn't see you, so I didn't say hello. -> If I'd seen you, I ",
          { gapId: "g1" },
          " hello.",
        ],
        ["would have said", "'d have said"],
        "Convert the past fact into a hypothetical result."
      ),
      singleGap(
        "tc-rf-2",
        "Rewrite the facts as a third conditional sentence.",
        [
          "He was driving too fast, so he had an accident. -> He wouldn't have had an accident if he ",
          { gapId: "g1" },
          " so fast.",
        ],
        ["hadn't been driving", "hadn't driven"],
        "Both past perfect simple and continuous work here to show the cause."
      ),
      singleGap(
        "tc-rf-3",
        "Rewrite the facts as a third conditional sentence.",
        [
          "We didn't go out because it was raining. -> If it hadn't been raining, we ",
          { gapId: "g1" },
          " out.",
        ],
        ["would have gone", "'d have gone"],
        "Use the hypothetical past result."
      ),
      singleGap(
        "tc-rf-4",
        "Rewrite the facts as a third conditional sentence.",
        [
          "I forgot my phone, so I couldn't call you. -> I ",
          { gapId: "g1" },
          " you if I hadn't forgotten my phone.",
        ],
        ["could have called", "would have called", "would have been able to call"],
        "Use a third conditional result form here. 'Could have called' and 'would have called' are both natural answers."
      ),
      singleGap(
        "tc-rf-5",
        "Rewrite the facts as a third conditional sentence.",
        [
          "She didn't know the truth, so she was angry. -> She wouldn't have been angry if she ",
          { gapId: "g1" },
          " the truth.",
        ],
        ["had known", "'d known"],
        "Use if + past perfect."
      ),
    ],
  },
  {
    id: "reported-speech",
    title: "Reported Speech",
    shortDescription: "Practise backshift, pronoun changes, and reported questions.",
    levels: ["b1"],
    intro:
      "Work on tense backshift, time and place changes, and the structure of reported statements and questions.",
    items: [
      multipleChoiceItem(
        "rs-mc-1",
        "Choose the best reported version.",
        "Direct speech: 'I’m feeling tired.'\nWhich is the best reported version?",
        [
          "She said that she is feeling tired.",
          "She said that she was feeling tired.",
          "She told that she was feeling tired.",
        ],
        1,
        "Use backshift after a past reporting verb: 'am feeling' becomes 'was feeling'. Also, we say 'said that', not 'told that'."
      ),
      multipleChoiceItem(
        "rs-mc-2",
        "Choose the best reported version.",
        "Direct speech: 'I’ll call you tomorrow.'\nWhich is the best reported version?",
        [
          "He said that he would call me the next day.",
          "He said that he will call me tomorrow.",
          "He told that he would call me the next day.",
        ],
        0,
        "Backshift 'will' to 'would', and change 'tomorrow' to 'the next day'."
      ),
      multipleChoiceItem(
        "rs-mc-3",
        "Choose the best reported version.",
        "Direct speech: 'We’ve finished our homework.'\nWhich is the best reported version?",
        [
          "They said that they had finished their homework.",
          "They said that they have finished their homework.",
          "They told that they had finished their homework.",
        ],
        0,
        "Present perfect usually backshifts to past perfect in reported speech."
      ),
      multipleChoiceItem(
        "rs-mc-4",
        "Choose the best reported version.",
        "Direct question: 'Are you busy?'\nWhich is the best reported version?",
        [
          "She asked me if was I busy.",
          "She asked me if I was busy.",
          "She asked me whether I am busy.",
        ],
        1,
        "In reported yes or no questions, use 'if' or 'whether' and normal subject + verb word order. With a past reporting verb, the tense usually backshifts too."
      ),
      multipleChoiceItem(
        "rs-mc-5",
        "Choose the best reported version.",
        "Direct question: 'Where do you live?'\nWhich is the best reported version?",
        [
          "He asked me where did I live.",
          "He asked me where I lived.",
          "He asked me where do I live.",
        ],
        1,
        "In reported questions, keep the question word but change to statement word order."
      ),
      multipleChoiceItem(
        "rs-mc-6",
        "Choose the best reported version.",
        "Direct speech: 'I can’t come today.'\nWhich is the best reported version?",
        [
          "She said that she couldn't come that day.",
          "She said me that she couldn't come that day.",
          "She told that she couldn't come that day.",
        ],
        0,
        "Backshift 'can’t' to 'couldn’t' and change 'today' to 'that day'. Use 'said that' or 'told me that', not 'said me' or 'told that'."
      ),
      multipleChoiceItem(
        "rs-mc-7",
        "Choose the best reported version.",
        "Direct speech: 'This is my favourite jacket.'\nWhich is the best reported version?",
        [
          "He said that this was his favourite jacket.",
          "He said that that was his favourite jacket.",
          "He told that that was his favourite jacket.",
        ],
        1,
        "We often change 'this' to 'that' in reported speech, and 'my' changes to 'his'."
      ),
      multipleChoiceItem(
        "rs-mc-8",
        "Choose the best reported version.",
        "Direct question: 'Did Lucy phone?'\nWhich is the best reported version?",
        [
          "He asked me whether Lucy had phoned.",
          "He asked me whether did Lucy phone.",
          "He asked me if had Lucy phoned.",
        ],
        0,
        "For reported yes or no questions, use 'if' or 'whether' and normal word order. Past simple often backshifts to past perfect."
      ),
      multipleChoiceItem(
        "rs-mc-9",
        "Choose the best reported version.",
        "Direct speech: 'I must go now.'\nWhich is the best reported version?",
        [
          "She said that she must go then.",
          "She said that she had to go then.",
          "She told that she had to go then.",
        ],
        1,
        "In reported speech, 'must' often changes to 'had to'. 'Now' can change to 'then'."
      ),
      multipleChoiceItem(
        "rs-mc-10",
        "Choose the best reported version.",
        "Direct speech: 'We’re meeting here tonight.'\nWhich is the best reported version?",
        [
          "They said that they were meeting there that night.",
          "They said that they are meeting here tonight.",
          "They told that they were meeting there that night.",
        ],
        0,
        "Backshift the tense and change place/time words: 'here' to 'there' and 'tonight' to 'that night'."
      ),
      errorCorrectionItem(
        "rs-ec-1",
        "Check the highlighted phrase for errors.",
        "She told that she was too tired to go out.",
        "told that",
        false,
        ["said that", "told me that", "told us that", "told him that", "told her that", "told them that"],
        "Use 'said that' or 'told + object + that'. We don't say 'told that' without an object."
      ),
      errorCorrectionItem(
        "rs-ec-2",
        "Check the highlighted phrase for errors.",
        "He asked me where did I work.",
        "where did I work",
        false,
        "where I worked",
        "In reported questions, use statement word order, not question word order."
      ),
      errorCorrectionItem(
        "rs-ec-3",
        "Check the highlighted phrase for errors.",
        "Marta said me that she couldn’t stay long.",
        "said me that",
        false,
        "told me that",
        "After 'said', we don't use an object pronoun directly. Use 'told me that' or 'said that'."
      ),
      errorCorrectionItem(
        "rs-ec-4",
        "Check the highlighted phrase for errors.",
        "He said that he would see us the next day.",
        "would see us the next day",
        true,
        "",
        "This is correct. 'Will' changes to 'would' and 'tomorrow' often changes to 'the next day'."
      ),
      errorCorrectionItem(
        "rs-ec-5",
        "Check the highlighted phrase for errors.",
        "She asked if was I feeling OK.",
        "if was I feeling",
        false,
        "if I was feeling",
        "In reported yes or no questions, use 'if' or 'whether' and normal subject + verb order."
      ),
      errorCorrectionItem(
        "rs-ec-6",
        "Check the highlighted phrase for errors.",
        "They said that they have already finished.",
        "have already finished",
        false,
        "had already finished",
        "In reported speech with a past reporting verb, present perfect usually changes to past perfect."
      ),
      errorCorrectionItem(
        "rs-ec-7",
        "Check the highlighted phrase for errors.",
        "My brother told me that he was leaving that night.",
        "told me that",
        true,
        "",
        "This is correct. 'Told' needs an object, and the tense and time expression are correctly backshifted."
      ),
      errorCorrectionItem(
        "rs-ec-8",
        "Check the highlighted phrase for errors.",
        "She asked me did I want some coffee.",
        "did I want",
        false,
        "if I wanted",
        "For reported yes or no questions, use 'if' or 'whether' and statement word order."
      ),
      placeholderGapItem(
        "rs-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "'I’m working late tonight,' Ben said.\nBen said that __________ late that night.",
        "he was working",
        [],
        "Backshift the present continuous to past continuous and change the pronoun."
      ),
      placeholderGapItem(
        "rs-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "'We’ve never been to Greece,' they told us.\nThey told us that __________ to Greece.",
        "they had never been",
        [],
        "Present perfect usually changes to past perfect in reported speech."
      ),
      placeholderGapItem(
        "rs-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        "'I’ll help you tomorrow,' she said to me.\nShe told me that __________ the next day.",
        "she would help me",
        [],
        "Use 'told me that' with an object, and change 'will' to 'would'."
      ),
      placeholderGapItem(
        "rs-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "'Are you feeling better?' my aunt asked me.\nMy aunt asked me __________ feeling better.",
        "if I was",
        ["whether I was"],
        "For reported yes or no questions, use 'if' or 'whether' and statement word order."
      ),
      placeholderGapItem(
        "rs-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "'Where do your cousins live?' he asked us.\nHe asked us where __________.",
        "our cousins lived",
        [],
        "Keep the question word, but change the order to subject + verb."
      ),
      placeholderGapItem(
        "rs-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "'This is my favourite café,' Laura said.\nLaura said that __________ favourite café.",
        "that was her",
        ["was her"],
        "Change 'this' to 'that' and 'my' to 'her' in reported speech."
      ),
      placeholderGapItem(
        "rs-rf-7",
        "Complete the second sentence so that it has a similar meaning.",
        "'I can’t find my keys,' Dan said.\nDan said that __________ keys.",
        "he couldn't find his",
        [],
        "Change 'can’t' to 'couldn’t' and adjust the pronouns."
      ),
      placeholderGapItem(
        "rs-rf-8",
        "Complete the second sentence so that it has a similar meaning.",
        "'Did you enjoy the concert?' she asked him.\nShe asked him __________ the concert.",
        "if he had enjoyed",
        ["whether he had enjoyed"],
        "For reported yes or no questions, use 'if' or 'whether'. Past simple often changes to past perfect."
      ),
    ],
  },
  {
    id: "quantifiers",
    title: "Quantifiers",
    shortDescription: "Practise much, many, few, little, enough, too, and plenty.",
    levels: ["b1"],
    intro:
      "Work on common quantifiers with countable and uncountable nouns, plus structures like 'too', 'enough', and 'plenty of'.",
    items: [
      multipleChoiceItem(
        "q-mc-1",
        "Choose the correct option.",
        "There are ____ books on the floor — can you pick them up?",
        ["too much", "too many", "too"],
        1,
        "Use 'too many' with plural countable nouns like 'books'."
      ),
      multipleChoiceItem(
        "q-mc-2",
        "Choose the correct option.",
        "I don’t have ____ time to cook tonight, so I’ll order something.",
        ["many", "much", "a few"],
        1,
        "Use 'much' with uncountable nouns like 'time', especially in negative sentences."
      ),
      multipleChoiceItem(
        "q-mc-3",
        "Choose the correct option.",
        "We’ve got ____ milk in the fridge, so there’s no need to buy any.",
        ["plenty of", "too many", "a few"],
        0,
        "Use 'plenty of' to mean more than enough."
      ),
      multipleChoiceItem(
        "q-mc-4",
        "Choose the correct option.",
        "Only ____ students came to class today, so the room felt really empty.",
        ["a little", "a few", "much"],
        1,
        "Use 'a few' with plural countable nouns like 'students'."
      ),
      multipleChoiceItem(
        "q-mc-5",
        "Choose the correct option.",
        "You’re driving ____ fast. Slow down!",
        ["too much", "enough", "too"],
        2,
        "Use 'too' before adjectives and adverbs: 'too fast'."
      ),
      multipleChoiceItem(
        "q-mc-6",
        "Choose the correct option.",
        "There isn’t ____ sugar left. We need to buy some more.",
        ["any", "no", "none"],
        0,
        "Use 'any' with a negative verb to talk about zero quantity."
      ),
      multipleChoiceItem(
        "q-mc-7",
        "Choose the correct option.",
        "My suitcase isn’t big ____ for all my clothes.",
        ["too", "enough", "much"],
        1,
        "Use 'adjective + enough': 'big enough'."
      ),
      multipleChoiceItem(
        "q-mc-8",
        "Choose the correct option.",
        "There are very ____ parking spaces near my flat, so it’s hard to park.",
        ["little", "few", "a few"],
        1,
        "Use 'very few' with plural countable nouns when you mean almost none."
      ),
      multipleChoiceItem(
        "q-mc-9",
        "Choose the correct option.",
        "I don’t want any more cake, thanks. I’ve had ____ already.",
        ["a lot", "many", "plenty of"],
        0,
        "Use 'a lot' when there is no noun after it."
      ),
      multipleChoiceItem(
        "q-mc-10",
        "Choose the correct option.",
        "There are ____ people in the village during the colder months.",
        ["few", "too much", "little"],
        0,
        "Use 'few' with plural countable nouns like 'people'."
      ),
      errorCorrectionItem(
        "q-ec-1",
        "Check the highlighted phrase for errors.",
        "There are too much cars in the city centre at rush hour.",
        "too much cars",
        false,
        "too many cars",
        "Use 'too many' with plural countable nouns like 'cars'."
      ),
      errorCorrectionItem(
        "q-ec-2",
        "Check the highlighted phrase for errors.",
        "We’ve got plenty of time, so we don’t need to hurry.",
        "plenty of time",
        true,
        "",
        "This is correct. Use 'plenty of' to mean more than enough."
      ),
      errorCorrectionItem(
        "q-ec-3",
        "Check the highlighted phrase for errors.",
        "There aren’t enough chairs for everyone in the room.",
        "enough chairs",
        true,
        "",
        "This is correct. Use 'enough' before a noun."
      ),
      errorCorrectionItem(
        "q-ec-4",
        "Check the highlighted phrase for errors.",
        "My coffee is too much hot to drink.",
        "too much hot",
        false,
        "too hot",
        "Use 'too' before adjectives: 'too hot', not 'too much hot'."
      ),
      errorCorrectionItem(
        "q-ec-5",
        "Check the highlighted phrase for errors.",
        "There were very little people at the meeting, so we finished early.",
        "very little people",
        false,
        "very few people",
        "Use 'few' with plural countable nouns like 'people'. 'Little' is used with uncountable nouns."
      ),
      errorCorrectionItem(
        "q-ec-6",
        "Check the highlighted phrase for errors.",
        "I’ve only got a few money left, so I can’t buy that jacket.",
        "a few money",
        false,
        "a little money",
        "Use 'a little' with uncountable nouns like 'money'."
      ),
      errorCorrectionItem(
        "q-ec-7",
        "Check the highlighted phrase for errors.",
        "A: How many biscuits are left? B: None.",
        "None",
        true,
        "",
        "This is correct. We use 'none' in short answers when the quantity is zero."
      ),
      errorCorrectionItem(
        "q-ec-8",
        "Check the highlighted phrase for errors.",
        "This bag isn’t enough big for my laptop.",
        "enough big",
        false,
        "big enough",
        "Put 'enough' after an adjective: 'big enough'."
      ),
      placeholderGapItem(
        "q-gf-1",
        "Fill the gap.",
        "There isn’t __________ milk left, so we need to buy some. (zero quantity)",
        "any",
        [],
        "Use 'any' with a negative verb to talk about zero quantity."
      ),
      placeholderGapItem(
        "q-gf-2",
        "Fill the gap.",
        "We’ve got __________ of food for the weekend, so don’t go shopping. (more than enough)",
        "plenty",
        [],
        "Use 'plenty of' to mean more than enough. The missing word here is 'plenty'."
      ),
      placeholderGapItem(
        "q-gf-3",
        "Fill the gap.",
        "There were only __________ people at the talk, so the hall looked empty. (small number)",
        "a few",
        [],
        "Use 'a few' with plural countable nouns for a small number."
      ),
      placeholderGapItem(
        "q-gf-4",
        "Fill the gap.",
        "You’re speaking __________ quietly — I can’t hear you. (more than is good)",
        "too",
        [],
        "Use 'too' before an adverb: 'too quietly'."
      ),
      placeholderGapItem(
        "q-gf-5",
        "Fill the gap.",
        "I don’t have __________ time to read during the week. (uncountable noun in a negative sentence)",
        "much",
        [],
        "Use 'much' with uncountable nouns in negative sentences."
      ),
      placeholderGapItem(
        "q-gf-6",
        "Fill the gap.",
        "This soup isn’t hot __________. Can you warm it up? (not sufficiently)",
        "enough",
        [],
        "Use 'adjective + enough': 'hot enough'."
      ),
      placeholderGapItem(
        "q-gf-7",
        "Fill the gap.",
        "There are __________ tourists in the town this weekend than usual. (plural countable noun, comparative)",
        "more",
        [],
        "Use 'more' with plural countable nouns when making a comparative."
      ),
      placeholderGapItem(
        "q-gf-8",
        "Fill the gap.",
        "A: How many eggs have we got? B: __________. I used the last two this morning. (short answer)",
        "None",
        ["none"],
        "Use 'none' in short answers when there is zero quantity."
      ),
    ],
  },
  {
    id: "quantifiers-full-b1-test",
    title: "Quantifiers: Too and Enough Mastery",
    shortDescription: "A four-phase test covering conceptual logic, common errors, visual construction, and word order.",
    levels: ["a2", "b1"],
    intro:
      "Welcome to the comprehensive quantifier test. Master the use of 'too', 'too much', 'too many', and 'enough' with adjectives and nouns. Pay attention to the difference between 'more than is necessary' (too) and 'all that is necessary' (enough).",
    items: [
      multipleChoiceItem(
        "qfull-mc-1",
        "Choose the correct quantifier.",
        "This programme is very interesting, but it's ____ long.",
        ["too", "enough", "too many"],
        0,
        "Use 'too' before an adjective to show a negative degree."
      ),
      multipleChoiceItem(
        "qfull-mc-2",
        "Choose the correct quantifier.",
        "The water in the swimming pool isn't warm ____.",
        ["too", "enough", "too much"],
        1,
        "Use 'enough' after an adjective (warm) to mean 'sufficiently'."
      ),
      multipleChoiceItem(
        "qfull-mc-3",
        "Choose the correct quantifier.",
        "We didn't buy the tickets because there were ____ people in the queue.",
        ["too many", "too much", "too"],
        0,
        "Use 'too many' with countable nouns like 'people'."
      ),
      multipleChoiceItem(
        "qfull-mc-4",
        "Choose the correct quantifier.",
        "I need a bigger suitcase; I've got ____ clothes.",
        ["too many", "too much", "enough"],
        0,
        "Use 'too many' with plural countable nouns like 'clothes'."
      ),
      multipleChoiceItem(
        "qfull-mc-5",
        "Choose the correct quantifier.",
        "Don't put ____ salt in the soup, please.",
        ["too many", "too much", "too"],
        1,
        "Use 'too much' with uncountable nouns like 'salt'."
      ),
      multipleChoiceItem(
        "qfull-mc-6",
        "Choose the correct quantifier (British English).",
        "He isn't fast ____ to win the race.",
        ["too", "enough", "too many"],
        1,
        "Use 'enough' after an adjective: 'fast enough'."
      ),
      errorCorrectionItem(
        "qfull-ec-1",
        "Check the highlighted phrase for errors.",
        "The water isn't enough hot for a bath.",
        "enough hot",
        false,
        "hot enough",
        "With adjectives, 'enough' must come after the adjective: 'hot enough'."
      ),
      errorCorrectionItem(
        "qfull-ec-2",
        "Check the highlighted phrase for errors.",
        "He has too much problems at work.",
        "too much",
        false,
        "too many",
        "Use 'too many' with countable nouns like 'problems'."
      ),
      errorCorrectionItem(
        "qfull-ec-3",
        "Check the highlighted phrase for errors.",
        "I am looking for too much people to help with the project.",
        "too much",
        false,
        "too many",
        "Use 'too many' with countable people."
      ),
      errorCorrectionItem(
        "qfull-ec-4",
        "Check the highlighted phrase for errors.",
        "That exam was too easy to be a good test.",
        "too easy",
        true,
        "",
        "Correct! 'Too easy' works here because there is a clear negative consequence: it wasn't a good test."
      ),
      errorCorrectionItem(
        "qfull-ec-5",
        "Check the highlighted phrase for errors.",
        "The film wasn't good enough to win an award.",
        "good enough",
        true,
        "",
        "Correct! 'Enough' follows the adjective, so 'good enough' is the right structure."
      ),
      errorCorrectionItem(
        "qfull-ec-6",
        "Check the highlighted phrase for errors.",
        "I don't have time enough to see you today.",
        "time enough",
        false,
        "enough time",
        "With nouns, 'enough' must come before the noun: 'enough time'."
      ),
      doubleGap(
        "qfull-img-1",
        "Look at the bus illustration and complete the conversation.",
        [
          "A: Look at that bus! I think it ",
          { gapId: "g1" },
          ".\nB: Yes, there definitely ",
          { gapId: "g2" },
          " for everyone.",
        ],
        ["has too many people", "has too many people in it", "is too crowded", "is too full"],
        ["isn't enough space", "isn't enough room"],
        "Use 'too many' with countable people, and 'enough' before the noun 'space'.",
        {
          imageSrc: "/images/grammar/quantifiers/busquant.png",
          imageAlt: "A crowded bus with too many passengers and someone unable to get on.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "crowded / people" },
            g2: { placeholder: "space / room" },
          },
        }
      ),
      doubleGap(
        "qfull-img-2",
        "Look at the painter and complete the conversation.",
        [
          "A: He can't reach the ceiling because the ladder ",
          { gapId: "g1" },
          ".\nB: Exactly. It ",
          { gapId: "g2" },
          " to reach the top.",
        ],
        ["is too short", "isn't tall enough"],
        ["isn't tall enough", "is too short"],
        "Use one 'too + adjective' structure and one 'adjective + enough' structure. Either order is fine.",
        {
          imageSrc: "/images/grammar/quantifiers/paintquant.png",
          imageAlt: "A painter standing on a ladder that is too short to reach the ceiling.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "short / tall" },
            g2: { placeholder: "tall / short" },
          },
        }
      ),
      doubleGap(
        "qfull-img-3",
        "Look at the soup scene and complete the conversation.",
        [
          "A: Yuck! He has put ",
          { gapId: "g1" },
          " on his soup.\nB: I know. The soup ",
          { gapId: "g2" },
          " to eat now.",
        ],
        ["too much salt", "far too much salt"],
        ["is too salty", "is much too salty"],
        "Use 'too much' with the uncountable noun 'salt', then 'too' before the adjective 'salty'.",
        {
          imageSrc: "/images/grammar/quantifiers/saltquant.png",
          imageAlt: "A man disgusted by soup with too much salt on it.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "salt" },
            g2: { placeholder: "salty" },
          },
        }
      ),
      doubleGap(
        "qfull-img-4",
        "Look at the trainers in the shop window and complete the conversation.",
        [
          "A: Those trainers are amazing, but they ",
          { gapId: "g1" },
          ".\nB: Yes, he ",
          { gapId: "g2" },
          " in his wallet to buy them.",
        ],
        ["are too expensive", "cost too much"],
        ["doesn't have enough money", "hasn't got enough money"],
        "Use 'too' before 'expensive' and 'enough' before the noun 'money'.",
        {
          imageSrc: "/images/grammar/quantifiers/shoequant.png",
          imageAlt: "A teenager looking at expensive trainers with an empty wallet.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "expensive / cost" },
            g2: { placeholder: "money" },
          },
        }
      ),
      doubleGap(
        "qfull-img-5",
        "Look at the wardrobe scene and complete the conversation.",
        [
          "A: She has got ",
          { gapId: "g1" },
          " to fit in there.\nB: Her wardrobe definitely ",
          { gapId: "g2" },
          " for all her clothes.",
        ],
        ["too many coats", "too many clothes", "too many things"],
        ["isn't big enough", "is too small"],
        "Use 'too many' with plural countable nouns and 'enough' after the adjective 'big'.",
        {
          imageSrc: "/images/grammar/quantifiers/wardrobequant.png",
          imageAlt: "A woman trying to force too many coats into a wardrobe that is too small.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "coats / clothes" },
            g2: { placeholder: "big / small" },
          },
        }
      ),
      doubleGap(
        "qfull-img-6",
        "Look at the computer scene and complete the conversation.",
        [
          "A: His computer takes ",
          { gapId: "g1" },
          " to start up.\nB: Yes, it really ",
          { gapId: "g2" },
          " for modern work.",
        ],
        ["too much time", "too long", "a long time"],
        ["isn't fast enough", "is too slow", "isn't quick enough"],
        "In A, use a time expression. In B, use an adjective phrase about speed.",
        {
          imageSrc: "/images/grammar/quantifiers/computerquant.png",
          imageAlt: "A frustrated office worker waiting for a slow computer to load.",
          imageCaption: "Complete the conversation.",
          imageMaxWidth: "420px",
          gapExtras: {
            g1: { placeholder: "time / long" },
            g2: { placeholder: "fast / slow" },
          },
        }
      ),
      wordOrderItem(
        "qfull-jumb-1",
        "Unjumble the sentence.",
        ["coffee", "to", "is", "hot", "drink", "the", "too"],
        "The coffee is too hot to drink.",
        "Pattern: Too + adjective + infinitive."
      ),
      wordOrderItem(
        "qfull-jumb-2",
        "Unjumble the sentence.",
        ["enough", "haven't", "I", "to", "got", "time", "finish"],
        "I haven't got enough time to finish.",
        "Pattern: Enough + noun + infinitive."
      ),
      wordOrderItem(
        "qfull-jumb-3",
        "Unjumble the sentence.",
        ["there", "too", "people", "many", "queue", "the", "in", "are"],
        "There are too many people in the queue.",
        "Pattern: There are + too many + plural countable noun."
      ),
      wordOrderItem(
        "qfull-jumb-4",
        "Unjumble the sentence.",
        ["strong", "not", "he", "to", "carry", "box", "enough", "that", "is"],
        "He is not strong enough to carry that box.",
        "Pattern: Adjective + enough + infinitive."
      ),
      wordOrderItem(
        "qfull-jumb-5",
        "Unjumble the sentence.",
        ["sugar", "put", "too", "the", "in", "cake", "didn't", "much", "I"],
        "I didn't put too much sugar in the cake.",
        "Pattern: Didn't + verb + too much + uncountable noun."
      ),
      wordOrderItem(
        "qfull-jumb-6",
        "Unjumble the sentence.",
        ["well", "she", "didn't", "the", "programme", "do", "on", "enough"],
        "She didn't do well enough on the programme.",
        "Pattern: Negative verb + adverb + enough."
      ),
    ],
  },
  {
    id: "question-formation-mastery",
    title: "Question Formation: Direct & Indirect",
    shortDescription: "Master indirect questions, negative questions, and prepositions.",
    levels: ["b2"],
    intro:
      "Practice the nuances of English questions. Remember: in indirect questions, we use statement word order (subject before verb)!",
    items: [
      errorCorrectionItem(
        "q-ec-1",
        "Check the highlighted phrase for errors.",
        "Could you tell me what time does the film start?",
        "does the film start",
        false,
        "the film starts",
        "In indirect questions, we don't use the auxiliary 'do/does/did' and we use statement word order."
      ),
      errorCorrectionItem(
        "q-ec-2",
        "Check the highlighted phrase for errors.",
        "Who did you go to the cinema with?",
        "Who did you go to the cinema with",
        true,
        "",
        "Correct! In informal English, we usually put the preposition at the end of the question."
      ),
      errorCorrectionItem(
        "q-ec-3",
        "Check the highlighted phrase for errors.",
        "Don't you like the soup? It's delicious!",
        "Don't you like",
        true,
        "",
        "Correct. Negative questions are often used to express surprise."
      ),
      errorCorrectionItem(
        "q-ec-4",
        "Check the highlighted phrase for errors.",
        "I wonder where has she gone.",
        "has she gone",
        false,
        "she has gone",
        "Even with 'I wonder', which isn't technically a question, we use statement word order for the following clause."
      ),
      errorCorrectionItem(
        "q-ec-5",
        "Check the highlighted phrase for errors.",
        "What is your new boss like?",
        "What is your new boss like",
        true,
        "",
        "Correct. Use 'What... like?' to ask for a description of someone's personality or appearance."
      ),
      multipleChoiceItem(
        "q-mc-1",
        "Choose the correct option.",
        "____ you see the news last night? It was shocking!",
        ["Didn't", "Don't", "Hadn't"],
        0,
        "Use a negative question in the past simple to check information or express surprise."
      ),
      multipleChoiceItem(
        "q-mc-2",
        "Choose the correct option.",
        "Do you have any idea ____?",
        ["where is the key", "where the key is", "where did the key go"],
        1,
        "Indirect questions use subject + verb order."
      ),
      multipleChoiceItem(
        "q-mc-3",
        "Choose the correct option.",
        "____ does this umbrella belong to?",
        ["Who", "Whom", "Whose"],
        0,
        "In modern English, we use 'Who' at the start and 'to' at the end."
      ),
      multipleChoiceItem(
        "q-mc-4",
        "Choose the correct option.",
        "I'd like to know why ____.",
        ["you are late", "are you late", "did you be late"],
        0,
        "Statement word order after 'I'd like to know'."
      ),
      multipleChoiceItem(
        "q-mc-5",
        "Choose the correct option.",
        "Which flat ____?",
        ["they live in", "do they live in", "do they live"],
        1,
        "Direct question word order with the preposition at the end."
      ),
      placeholderGapItem(
        "q-gf-1",
        "Complete the question.",
        "__________ you found your keys? You've been looking for ages! (negative)",
        "Haven't",
        ["Have you not"],
        "Use a negative present perfect question to express frustration or surprise."
      ),
      placeholderGapItem(
        "q-gf-2",
        "Complete the indirect question.",
        "Can you tell me what __________? (your name / be)",
        "your name is",
        [],
        "Indirect question: subject + verb."
      ),
      placeholderGapItem(
        "q-gf-3",
        "Complete the question with a preposition at the end.",
        "Who __________? (you / wait)",
        "are you waiting for",
        [],
        "Preposition 'for' goes at the end."
      ),
      placeholderGapItem(
        "q-gf-4",
        "Complete the question.",
        "What __________ like? (the weather / be)",
        "is the weather",
        ["'s the weather"],
        "Asking for a description."
      ),
      placeholderGapItem(
        "q-gf-5",
        "Complete the indirect question.",
        "I wonder if __________ to the party. (they / come)",
        "they are coming",
        ["they're coming", "they will come", "they'll come"],
        "Use statement word order after 'if' in an indirect question."
      ),
      singleGap(
        "q-gf-6",
        "Change this into a negative question.",
        [
          "I thought you wanted another coffee. -> ",
          { gapId: "g1" },
          " another coffee?",
        ],
        ["Didn't you want", "Did you not want"],
        "Use a negative past simple question to show surprise or check your understanding."
      ),
      placeholderGapItem(
        "q-gf-7",
        "Complete the indirect question.",
        "Do you know when __________? (the train / leave)",
        "the train leaves",
        ["the train is leaving"],
        "Remove the auxiliary 'does' and use statement word order."
      ),
      placeholderGapItem(
        "q-gf-8",
        "Complete the question.",
        "Which company __________? (he / work / for)",
        "does he work for",
        [],
        "Standard direct question with a preposition at the end."
      ),
      placeholderGapItem(
        "q-gf-9",
        "Complete the question.",
        "How many people __________ to the wedding? (come)",
        "are coming",
        ["will come"],
        "Who/How many as a subject doesn't need 'do' (though 'are coming' is the intended future use here)."
      ),
      placeholderGapItem(
        "q-gf-10",
        "Complete the indirect question.",
        "Could you tell me how much __________? (this / cost)",
        "this costs",
        [],
        "Indirect question: subject + verb (with third person 's')."
      ),
      singleGap(
        "q-rf-1",
        "Turn the direct question into an indirect one.",
        ["Where is the nearest bank? -> Can you tell me ", { gapId: "g1" }, "?"],
        ["where the nearest bank is"],
        "Switch from verb-subject to subject-verb."
      ),
      singleGap(
        "q-rf-2",
        "Turn the direct question into an indirect one.",
        ["Why did she leave early? -> I'd like to know ", { gapId: "g1" }, "."],
        ["why she left early"],
        "Remove 'did' and change the verb to the past simple."
      ),
      singleGap(
        "q-rf-3",
        "Rewrite this sentence.",
        ["To which city are you flying? -> Which city ", { gapId: "g1" }, "?"],
        ["are you flying to"],
        "In neutral English, the preposition 'to' moves to the end."
      ),
      singleGap(
        "q-rf-4",
        "Rewrite as an indirect question using 'if'.",
        ["Is the shop open? -> Do you know ", { gapId: "g1" }, "?"],
        ["if the shop is open", "whether the shop is open"],
        "Use 'if' or 'whether' for yes/no indirect questions."
      ),
      singleGap(
        "q-rf-5",
        "Turn the fact into a negative question expressing surprise.",
        ["You haven't finished yet! -> ", { gapId: "g1" }, " yet?"],
        ["Haven't you finished"],
        "Use a negative auxiliary to show surprise."
      ),
    ],
  },
  {
    id: "auxiliary-verb-mastery",
    title: "Auxiliary Verbs: Echoes and Emphasis",
    shortDescription: "Master 'so/neither', question tags, and using 'do' for emphasis.",
    levels: ["b2"],
    intro:
      "Practice using auxiliary verbs to avoid repetition, show interest, and add emphasis to your sentences.",
    items: [
      errorCorrectionItem(
        "aux-ec-1",
        "Check the highlighted phrase for errors. If it's correct, mark it so.",
        "A: I'm a bit tired today. B: So do I.",
        "So do I",
        false,
        "So am I",
        "The auxiliary must match the original sentence. Since 'A' used 'am', the agreement must also use 'am'."
      ),
      errorCorrectionItem(
        "aux-ec-2",
        "Check the highlighted phrase for errors. If it's correct, mark it so.",
        "A: I've never been to Asia. B: Neither I have.",
        "Neither I have",
        false,
        "Neither have I",
        "In agreements with 'So' and 'Neither', we use inverted word order: Auxiliary + Subject."
      ),
      errorCorrectionItem(
        "aux-ec-3",
        "Check the highlighted phrase for errors. If it's correct, mark it so.",
        "You've been to London before, haven't you?",
        "haven't you",
        true,
        "",
        "Correct! A positive statement in the Present Perfect takes a negative 'haven't' tag."
      ),
      errorCorrectionItem(
        "aux-ec-4",
        "Check the highlighted phrase for errors. If it's correct, mark it so.",
        "A: Why didn't you go to the party? B: I did went! I just left early.",
        "did went",
        false,
        "did go",
        "When using 'do/does/did' for emphasis, the main verb must be in the base form (infinitive)."
      ),
      errorCorrectionItem(
        "aux-ec-5",
        "Check the highlighted phrase for errors. If it's correct, mark it so.",
        "A: We really enjoyed the film. B: Have you? I thought it was a bit slow.",
        "Have you",
        false,
        "Did you",
        "The echo question must match the tense of the original statement. 'Enjoyed' is Past Simple, so use 'Did'."
      ),
      multipleChoiceItem(
        "aux-mc-1",
        "Choose the correct response.",
        "A: I haven't finished the report yet. B: ____.",
        ["So have I", "Neither have I", "I haven't too"],
        1,
        "Use 'neither' + auxiliary to agree with a negative statement."
      ),
      multipleChoiceItem(
        "aux-mc-2",
        "Choose the correct response.",
        "A: I'm exhausted. B: ____. It's been a long day.",
        ["So am I", "So do I", "I am so"],
        0,
        "Match the auxiliary 'am' from the original sentence."
      ),
      multipleChoiceItem(
        "aux-mc-3",
        "Choose the correct tag.",
        "You'll remember to call me, ____?",
        ["will you", "don't you", "won't you"],
        2,
        "A positive 'will' statement takes a negative 'won't' tag."
      ),
      multipleChoiceItem(
        "aux-mc-4",
        "Choose the correct option.",
        "I ____ want to come with you, I'm just very busy today.",
        ["do", "am", "have"],
        0,
        "Use 'do' for emphasis when the listener might think the opposite."
      ),
      multipleChoiceItem(
        "aux-mc-5",
        "Choose the correct response.",
        "A: We went to that new Italian restaurant. B: ____? Was it good?",
        ["Did you", "Went you", "Have you"],
        0,
        "Use the auxiliary 'did' to show interest in a Past Simple action."
      ),
      placeholderGapItem(
        "aux-gf-1",
        "Complete the sentence to avoid repetition.",
        "He doesn't like football, but his brother __________.",
        "does",
        [],
        "Use the auxiliary 'does' to replace the verb 'likes'."
      ),
      placeholderGapItem(
        "aux-gf-2",
        "Complete with a 'so' or 'neither' structure.",
        "A: I'm not going to the party. B: __________ I.",
        "Neither am",
        ["Neither'm"],
        "Negative agreement with 'be'."
      ),
      placeholderGapItem(
        "aux-gf-3",
        "Complete the question tag.",
        "They've lived here for years, __________ they?",
        "haven't",
        ["have not"],
        "Negative tag for a positive Present Perfect statement."
      ),
      placeholderGapItem(
        "aux-gf-4",
        "Add emphasis to the sentence.",
        "I __________ hope you can come to the wedding! (hope)",
        "do",
        [],
        "Use 'do' to emphasize the verb."
      ),
      placeholderGapItem(
        "aux-gf-5",
        "Complete the echo question.",
        "A: I can't find my glasses. B: __________ you? Have you looked in the kitchen?",
        "Can't",
        ["Can you not"],
        "Echo the auxiliary to show interest/surprise."
      ),
      placeholderGapItem(
        "aux-gf-6",
        "Complete with a 'so' or 'neither' structure.",
        "A: I'd love a cup of tea. B: __________ I.",
        "So would",
        ["So'd"],
        "Positive agreement with 'would'."
      ),
      placeholderGapItem(
        "aux-gf-7",
        "Complete the sentence to avoid repetition.",
        "I've seen that movie, but Sarah __________.",
        "hasn't",
        ["has not"],
        "Use the negative auxiliary to show contrast."
      ),
      placeholderGapItem(
        "aux-gf-8",
        "Complete the question tag.",
        "That isn't your bag, __________ it?",
        "is",
        [],
        "Positive tag for a negative statement."
      ),
      placeholderGapItem(
        "aux-gf-9",
        "Add emphasis to the sentence.",
        "She __________ look like her mother, doesn't she? (look)",
        "does",
        [],
        "Use 'does' for third-person emphasis."
      ),
      placeholderGapItem(
        "aux-gf-10",
        "Complete the echo question.",
        "A: We've bought a new house. B: __________ you? That's amazing!",
        "Have",
        [],
        "Echo question for the Present Perfect."
      ),
      singleGap(
        "aux-rf-1",
        "Rewrite using 'so' or 'neither'.",
        [
          "I'm a teacher and my wife is a teacher too. -> I'm a teacher and ",
          { gapId: "g1" },
          " my wife.",
        ],
        ["so is"],
        "Use 'so + auxiliary + subject'."
      ),
      singleGap(
        "aux-rf-2",
        "Rewrite the sentence to add emphasis.",
        ["I saw him yesterday, I promise! -> I ", { gapId: "g1" }, " him yesterday!"],
        ["did see"],
        "Change the Past Simple to 'did + infinitive' for emphasis."
      ),
      singleGap(
        "aux-rf-3",
        "Rewrite using 'neither'.",
        [
          "I don't like eggs and I don't like mushrooms either. -> I don't like eggs and ",
          { gapId: "g1" },
          " I.",
        ],
        ["neither do"],
        "Negative agreement with the Present Simple."
      ),
      singleGap(
        "aux-rf-4",
        "Rewrite using a question tag.",
        ["I'm sure it will rain. -> It will rain, ", { gapId: "g1" }, "?"],
        ["won't it"],
        "Convert a statement into a question tag."
      ),
      singleGap(
        "aux-rf-5",
        "Complete using an auxiliary.",
        [
          "I thought she was coming, but I was wrong. -> I thought she was coming, but she ",
          { gapId: "g1" },
          ".",
        ],
        ["wasn't"],
        "Shorten the sentence using just the auxiliary."
      ),
    ],
  },
  {
    id: "adjectives-order-and-groups",
    title: "Adjectives: Order, Groups, and -ed/-ing",
    shortDescription: "Master adjective order, collective nouns, and participle adjectives.",
    levels: ["b2"],
    intro:
      "Practice the natural order of adjectives (Opinion > Size > Color, etc.) and how to use adjectives to describe groups of people.",
    items: [
      errorCorrectionItem(
        "adj-ec-1",
        "Is this word order correct?",
        "She wore a silk expensive vintage scarf.",
        "silk expensive vintage",
        false,
        "expensive vintage silk",
        "Opinion (expensive) should come before Age (vintage) and Material (silk)."
      ),
      errorCorrectionItem(
        "adj-ec-2",
        "Check the highlighted phrase for errors.",
        "The government should do more for the unemployeds.",
        "the unemployeds",
        false,
        "the unemployed",
        "When using 'the + adjective' for a group, we never add an 's'."
      ),
      errorCorrectionItem(
        "adj-ec-3",
        "Check the highlighted phrase for errors.",
        "I’m very confused by these instructions.",
        "confused",
        true,
        "",
        "Correct. Use -ed for how a person feels."
      ),
      errorCorrectionItem(
        "adj-ec-4",
        "Check the highlighted phrase for errors.",
        "The French people are famous for their food.",
        "The French people",
        false,
        ["The French", "French people"],
        "Nationalities ending in -ch, -sh, -ese, or -ss don't take an 's' when used as a collective noun."
      ),
      errorCorrectionItem(
        "adj-ec-5",
        "Check the highlighted phrase for errors.",
        "He’s a very interesting person.",
        "interesting",
        true,
        "",
        "Correct. Use -ing for the person/thing that causes the feeling."
      ),
      multipleChoiceItem(
        "adj-mc-1",
        "Choose the most natural adjective order.",
        "We stayed in a ____ cabin.",
        ["charming small old wooden", "small charming wooden old", "old small wooden charming"],
        0,
        "Order: Opinion (charming) > Size (small) > Age (old) > Material (wooden)."
      ),
      multipleChoiceItem(
        "adj-mc-2",
        "Choose the correct collective noun.",
        "____ in this region are calling for better accessibility in public transport.",
        ["The disableds", "The disabled", "The disabled people"],
        1,
        "Use 'the + adjective' for a group; we never add a plural 's' to the adjective."
      ),
      multipleChoiceItem(
        "adj-mc-3",
        "Choose the correct option.",
        "The match was really ____. I almost fell asleep.",
        ["bored", "boring", "bores"],
        1,
        "The match is the 'cause' of the feeling, so use -ing."
      ),
      multipleChoiceItem(
        "adj-mc-4",
        "Choose the most natural adjective order.",
        "He found an ____ coin in the garden.",
        ["ancient gold round tiny", "tiny round ancient gold", "tiny ancient round gold"],
        1,
        "Order: Size (tiny) > Shape (round) > Age (ancient) > Material (gold)."
      ),
      multipleChoiceItem(
        "adj-mc-5",
        "Choose the correct option.",
        "I am so ____ that the weekend is finally here!",
        ["excited", "exciting", "excite"],
        0,
        "Use -ed to describe a person's emotion."
      ),
      placeholderGapItem(
        "adj-gf-1",
        "Complete the group noun.",
        "__________ (people who don't have enough money) often struggle during the winter months.",
        "The underprivileged",
        ["The poor"],
        "Use 'The' + adjective to describe a collective group in society."
      ),
      placeholderGapItem(
        "adj-gf-2",
        "Put the adjectives in the correct order.",
        "A pair of __________ sunglasses. (expensive / Italian / designer)",
        "expensive designer Italian",
        ["expensive Italian designer"],
        "Opinion (expensive) usually leads, followed by the specific type/origin."
      ),
      placeholderGapItem(
        "adj-gf-3",
        "Complete with the -ed or -ing form.",
        "It was a __________ experience. I'll never forget it. (terrify)",
        "terrifying",
        [],
        "-ing describes the nature of the experience."
      ),
      placeholderGapItem(
        "adj-gf-4",
        "Complete the nationality phrase.",
        "__________ (People from the Netherlands) are famous for their engineering skills.",
        "The Dutch",
        [],
        "Some nationalities have a specific collective noun that doesn't end in -s."
      ),
      placeholderGapItem(
        "adj-gf-5",
        "Complete the collective noun.",
        "Resources are limited for __________ (people who are looking for work) in rural areas.",
        "the unemployed",
        [],
        "Use 'the' + adjective for the group; do not add an 's'."
      ),
      placeholderGapItem(
        "adj-gf-6",
        "Put the adjectives in the correct order.",
        "He lives in a __________ house. (big / old / beautiful)",
        "beautiful big old",
        [],
        "Opinion (beautiful) > Size (big) > Age (old)."
      ),
      placeholderGapItem(
        "adj-gf-7",
        "Complete with the -ed or -ing form.",
        "Are you __________ in classical music? (interest)",
        "interested",
        [],
        "-ed for personal interest/feelings."
      ),
      placeholderGapItem(
        "adj-gf-8",
        "Complete the nationality phrase.",
        "__________ (People from Wales) have a very rich musical tradition.",
        "The Welsh",
        [],
        "Nationalities ending in -sh take 'The' for the collective group."
      ),
      placeholderGapItem(
        "adj-gf-9",
        "Put the adjectives in the correct order.",
        "I bought some __________ curtains. ( striped / cotton / lovely)",
        "lovely striped cotton",
        [],
        "Order: Opinion (lovely) > Pattern (striped) > Colour (blue) > Material (cotton)."
      ),
      placeholderGapItem(
        "adj-gf-10",
        "Complete with the -ed or -ing form.",
        "I find city maps very __________. (confuse)",
        "confusing",
        [],
        "The maps are the cause of the confusion."
      ),
      singleGap(
        "adj-rf-1",
        "Rewrite the sentence using the adjectives in brackets.",
        ["He has a car. (fast / red / German) -> He has a ", { gapId: "g1" }, "."],
        ["fast red German car"],
        "Opinion (fast) > Color (red) > Origin (German)."
      ),
      singleGap(
        "adj-rf-2",
        "Rewrite using a group noun.",
        [
          "People who don't have a home need our help. -> ",
          { gapId: "g1" },
          " need our help. (two words)",
        ],
        ["The homeless"],
        "Convert 'People who are [adj]' into 'The [adj]'."
      ),
      singleGap(
        "adj-rf-3",
        "Rewrite the description in the correct order.",
        ["A box (metal / small / square). -> A ", { gapId: "g1" }, "."],
        ["small square metal box"],
        "Size (small) > Shape (square) > Material (metal)."
      ),
      singleGap(
        "adj-rf-4",
        "Complete the sentence based on the feeling.",
        ["The news came as a shock to me. -> I was ", { gapId: "g1" }, " by the news."],
        ["shocked"],
        "Use the -ed form for the person's reaction."
      ),
      placeholderGapItem(
        "adj-rf-5",
        "Complete the collective noun.",
        "Society has a duty to look after __________ (people who have been injured in war).",
        "the wounded",
        ["the injured"],
        "Collective group nouns often use the past participle after 'the'."
      ),
    ],
  },
  {
    id: "narrative-tenses-storytelling",
    title: "Narrative Tenses: Storytelling",
    shortDescription: "Master Past Simple, Continuous, and Perfect (Simple & Continuous).",
    levels: ["b2"],
    intro:
      "Practice using narrative tenses to tell stories. Use the Past Simple for main events, Continuous for background actions, and the Past Perfect for events that happened earlier.",
    items: [
      errorCorrectionItem(
        "nt-ec-1",
        "Check the highlighted phrase for errors.",
        "We arrived at the cinema, but the film already started.",
        "already started",
        false,
        "had already started",
        "Use the Past Perfect for an action that happened before the main story event (arriving)."
      ),
      errorCorrectionItem(
        "nt-ec-2",
        "Check the highlighted phrase for errors.",
        "I was walking to the station when it started to rain.",
        "was walking",
        true,
        "",
        "Correct! Use the Past Continuous for a background action interrupted by a main event."
      ),
      errorCorrectionItem(
        "nt-ec-3",
        "Check the highlighted phrase for errors.",
        "They were exhausted because they were working all day.",
        "were working",
        false,
        "had been working",
        "Use the Past Perfect Continuous to show the cause of a past situation (being exhausted)."
      ),
      errorCorrectionItem(
        "nt-ec-4",
        "Check the highlighted phrase for errors.",
        "When I reached the platform, the train had left.",
        "had left",
        true,
        "",
        "Correct. The train left *before* you reached the platform."
      ),
      errorCorrectionItem(
        "nt-ec-5",
        "Check the highlighted phrase for errors.",
        "I didn't recognize him because he was changing a lot.",
        "was changing",
        false,
        "had changed",
        "Use the Past Perfect Simple for a completed change that happened before you saw him."
      ),
      multipleChoiceItem(
        "nt-mc-1",
        "Choose the correct tense.",
        "When we got to the airport, we realized we ____ our passports at home.",
        ["left", "had left", "were leaving"],
        1,
        "The leaving happened before the realizing, so use the Past Perfect."
      ),
      multipleChoiceItem(
        "nt-mc-2",
        "Choose the correct tense.",
        "I ____ a book when I heard a loud bang in the kitchen.",
        ["read", "was reading", "had read"],
        1,
        "Use the Past Continuous for an action in progress when something else happened."
      ),
      multipleChoiceItem(
        "nt-mc-3",
        "Choose the correct tense.",
        "The streets were wet because it ____ for hours.",
        ["rained", "was raining", "had been raining"],
        2,
        "Use the Past Perfect Continuous for a continuous action that finished just before the main past time."
      ),
      multipleChoiceItem(
        "nt-mc-4",
        "Choose the correct tense.",
        "By the time the police arrived, the thieves ____.",
        ["escaped", "were escaping", "had escaped"],
        2,
        "The escape was completed before the police arrived."
      ),
      multipleChoiceItem(
        "nt-mc-5",
        "Choose the correct tense.",
        "While we ____ through the park, we saw a rare bird.",
        ["walked", "were walking", "had walked"],
        1,
        "Use the Past Continuous after 'while' for background actions."
      ),
      placeholderGapItem(
        "nt-gf-1",
        "Complete the sentence with the correct narrative tense.",
        "I __________ (never / see) a volcano until I went to Iceland last year.",
        "had never seen",
        ["'d never seen"],
        "Past Perfect for an experience (or lack of) before a specific point in the past."
      ),
      placeholderGapItem(
        "nt-gf-2",
        "Complete the sentence.",
        "We __________ (walk) along the beach when we found a message in a bottle.",
        "were walking",
        [],
        "Background action in progress."
      ),
      placeholderGapItem(
        "nt-gf-3",
        "Complete the sentence.",
        "He __________ (wait) for an hour before the bus finally arrived.",
        "had been waiting",
        ["'d been waiting"],
        "Duration of an action leading up to a past event."
      ),
      placeholderGapItem(
        "nt-gf-4",
        "Complete the sentence.",
        "When I opened the fridge, I saw that someone __________ (eat) all the cake.",
        "had eaten",
        ["'d eaten"],
        "Past Perfect for the earlier action."
      ),
      placeholderGapItem(
        "nt-gf-5",
        "Complete the sentence.",
        "I __________ (cook) dinner when the lights went out.",
        "was cooking",
        [],
        "Action interrupted by a main event."
      ),
      placeholderGapItem(
        "nt-gf-6",
        "Complete the sentence.",
        "She __________ (not / want) to go to the cinema because she'd seen the film before.",
        "didn't want",
        ["did not want"],
        "Past Simple for the main state/reaction."
      ),
      placeholderGapItem(
        "nt-gf-7",
        "Complete the sentence.",
        "I was out of breath because I __________ (run).",
        "had been running",
        ["'d been running"],
        "Past Perfect Continuous to explain a past state."
      ),
      placeholderGapItem(
        "nt-gf-8",
        "Complete the sentence.",
        "He __________ (sleep) when the alarm went off at 7:00.",
        "was sleeping",
        [],
        "Background action in progress at a specific time."
      ),
      placeholderGapItem(
        "nt-gf-9",
        "Complete the sentence.",
        "They __________ (finish) the meeting by the time I got there.",
        "had finished",
        ["'d finished"],
        "Action completed before a point in the past."
      ),
      placeholderGapItem(
        "nt-gf-10",
        "Complete the sentence.",
        "I __________ (watch) TV when I remembered I hadn't locked the door.",
        "was watching",
        [],
        "Action in progress when a thought or event occurred."
      ),
      singleGap(
        "nt-rf-1",
        "Rewrite the sequence of events using 'By the time'.",
        [
          "I finished the report. Then I went to bed. -> By the time I went to bed, I ",
          { gapId: "g1" },
          " the report.",
        ],
        ["had finished", "'d finished"],
        "The finishing happened first, so use the Past Perfect."
      ),
      singleGap(
        "nt-rf-2",
        "Rewrite using 'While'.",
        [
          "The sun was shining when I woke up. -> While I ",
          { gapId: "g1" },
          ", the sun was shining.",
        ],
        ["was waking up"],
        "Note: Though 'When I woke up' is more common, 'While I was waking up' focuses on the process."
      ),
      singleGap(
        "nt-rf-3",
        "Combine the facts using the Past Perfect Continuous.",
        [
          "They started playing at 2:00. I arrived at 4:00. -> They ",
          { gapId: "g1" },
          " for two hours when I arrived.",
        ],
        ["had been playing", "'d been playing"],
        "Show the duration of the earlier action."
      ),
      singleGap(
        "nt-rf-4",
        "Rewrite using 'because'.",
        [
          "I didn't recognize him. He was very different from before. -> I didn't recognize him because he ",
          { gapId: "g1" },
          " a lot.",
        ],
        ["had changed", "'d changed"],
        "The change happened before the meeting."
      ),
      singleGap(
        "nt-rf-5",
        "Rewrite the background action using 'have'.",
        [
          "I was in the middle of a bath. The doorbell rang. -> The doorbell rang while I ",
          { gapId: "g1" },
          " a bath.",
        ],
        ["was having", "was taking"],
        "Use Past Continuous for the background action."
      ),
    ],
  },
  {
    id: "b2-adverb-position-expanded",
    title: "Adverb Position: B2 Practice",
    shortDescription: "Original exercises for Manner, Place, Time, and Degree adverbs.",
    levels: ["b2"],
    intro:
      "Test your instincts on where adverbs naturally belong in English. Remember that the 'where' usually comes before the 'when'!",
    items: [
      multipleChoiceItem(
        "adv-mc-ext-1",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "We met yesterday in the park.",
          "We met in the park yesterday.",
          "We yesterday met in the park.",
        ],
        1,
        "Adverbs of place (in the park) normally go before adverbs of time (yesterday)."
      ),
      multipleChoiceItem(
        "adv-mc-ext-2",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "The files have already been uploaded to the server.",
          "The files have been uploaded already to the server.",
          "Already the files have been uploaded to the server.",
        ],
        0,
        "'Already' usually goes after the first auxiliary in a present perfect passive structure."
      ),
      multipleChoiceItem(
        "adv-mc-ext-3",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "She works a lot at the library.",
          "She works at the library a lot.",
          "She a lot works at the library.",
        ],
        0,
        "Adverbs of degree like 'a lot' should go after the verb or verb phrase."
      ),
      multipleChoiceItem(
        "adv-mc-ext-4",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "He is always late for the presentation.",
          "He always is late for the presentation.",
          "He is late always for the presentation.",
        ],
        0,
        "Adverbs of frequency go after the verb 'to be'."
      ),
      multipleChoiceItem(
        "adv-mc-ext-5",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "The package probably will arrive tomorrow.",
          "The package will arrive probably tomorrow.",
          "The package will probably arrive tomorrow.",
        ],
        2,
        "Adverbs like 'probably' usually go in mid-position after the first auxiliary verb."
      ),
      multipleChoiceItem(
        "adv-mc-ext-6",
        "Choose the most natural sentence.",
        "Which word order is correct?",
        [
          "She almost missed the bus.",
          "She missed almost the bus.",
          "She missed the bus almost.",
        ],
        0,
        "Adverbs of degree like 'almost' or 'nearly' go before the verb or verb phrase."
      ),
      errorCorrectionItem(
        "adv-ec-ext-1",
        "Is this word order correct?",
        "I'll see you tomorrow at the office.",
        "tomorrow at the office",
        false,
        "at the office tomorrow",
        "Adverbs of place (at the office) should come before adverbs of time (tomorrow)."
      ),
      errorCorrectionItem(
        "adv-ec-ext-2",
        "Is this word order correct?",
        "Obviously, we need to find a better way to do this.",
        "Obviously, we need",
        true,
        "",
        "Correct! Comment adverbs that give the speaker's opinion usually go at the beginning of the sentence."
      ),
      errorCorrectionItem(
        "adv-ec-ext-3",
        "Is this word order correct?",
        "That soup is hot extremely.",
        "hot extremely",
        false,
        "extremely hot",
        "Adverbs of degree like 'extremely' or 'incredibly' go before the adjective they modify."
      ),
      errorCorrectionItem(
        "adv-ec-ext-4",
        "Is this word order correct?",
        "The application was successfully submitted online.",
        "was successfully submitted",
        true,
        "",
        "Correct! In passive constructions, the adverb of manner usually sits in mid-position."
      ),
      errorCorrectionItem(
        "adv-ec-ext-5",
        "Is this word order correct?",
        "He drives carefully his new car.",
        "carefully his new car",
        false,
        "his new car carefully",
        "Adverbs of manner usually go after the verb phrase or the object."
      ),
      errorCorrectionItem(
        "adv-ec-ext-6",
        "Is this word order correct?",
        "The director never is satisfied with the first draft.",
        "never is",
        false,
        "is never",
        "Adverbs of frequency go after the verb 'to be'."
      ),
      adverbPlacementItem(
        "adv-place-1",
        "Place the adverbs in the correct position.",
        "I'll finish this project.",
        ["Hopefully", "tonight"],
        { Hopefully: 0, tonight: 4 },
        "Hopefully, I'll finish this project tonight.",
        "Comment adverbs can start the sentence, and the time adverb usually goes at the end."
      ),
      adverbPlacementItem(
        "adv-place-2",
        "Place the adverbs in the correct position.",
        "The website will be updated.",
        ["automatically", "every hour"],
        { automatically: 4, "every hour": 5 },
        "The website will be automatically updated every hour.",
        "In passive structures, manner often goes before the main verb; frequency/time goes at the end."
      ),
      adverbPlacementItem(
        "adv-place-3",
        "Place the adverbs in the correct position.",
        "She arrives late.",
        ["Unfortunately", "often"],
        { Unfortunately: 0, often: 1 },
        "Unfortunately, she often arrives late.",
        "Comment adverbs can introduce the whole sentence; frequency goes before the main verb."
      ),
      adverbPlacementItem(
        "adv-place-4",
        "Place the adverbs in the correct position.",
        "The car was parked.",
        ["badly", "outside"],
        { badly: 3, outside: 4 },
        "The car was badly parked outside.",
        "In the passive, 'badly' sits before the main verb; place normally comes after the verb phrase."
      ),
      adverbPlacementItem(
        "adv-place-5",
        "Place the adverbs in the correct position.",
        "The film was scary.",
        ["Clearly", "quite"],
        { Clearly: 0, quite: 3 },
        "Clearly, the film was quite scary.",
        "Comment adverbs can start the sentence; degree adverbs go before the adjective."
      ),
      adverbPlacementItem(
        "adv-place-6",
        "Place the adverbs in the correct position.",
        "I missed the train.",
        ["almost", "this morning"],
        { almost: 1, "this morning": 4 },
        "I almost missed the train this morning.",
        "'Almost' goes before the verb phrase, and the time expression usually goes at the end."
      ),
      adverbPlacementItem(
        "adv-place-7",
        "Place the adverbs in the correct position.",
        "I watch horror films.",
        ["Honestly", "never"],
        { Honestly: 0, never: 1 },
        "Honestly, I never watch horror films.",
        "Comment adverbs can go first; frequency adverbs go before the main verb."
      ),
      adverbPlacementItem(
        "adv-place-8",
        "Place the adverbs in the correct position.",
        "He'll arrive.",
        ["probably", "later"],
        { probably: 1, later: 2 },
        "He'll probably arrive later.",
        "'Probably' goes after the auxiliary, and the time adverb goes at the end."
      ),
    ],
  },
  {
    id: "advanced-future-mechanics",
    title: "Future Continuous vs. Future Perfect",
    shortDescription: "Original scenarios focusing on deadlines, ongoing actions, and planned events.",
    levels: ["b2"],
    intro:
      "Can you tell the difference between a project in progress and a finished result? Test your future-tense instincts with these brand-new challenges.",
    items: [
      multipleChoiceItem(
        "adv-f-mc-1",
        "Choose the most logical future form.",
        "The renovation starts in June and finishes in August. In July, they ____ the kitchen.",
        ["will renovate", "will be renovating", "will have renovated"],
        1,
        "Since the work is right in the middle of its schedule, it will be in progress."
      ),
      multipleChoiceItem(
        "adv-f-mc-2",
        "Choose the most logical future form.",
        "Our interns start at 9:00 and leave at 5:00. If you arrive at 5:30, they ____ for the day.",
        ["will leave", "will be leaving", "will have left"],
        2,
        "By 5:30, the act of leaving is already finished."
      ),
      multipleChoiceItem(
        "adv-f-mc-3",
        "Choose the most logical future form.",
        "Don't call between 8:00 and 9:00 tonight; I ____ of questions for tomorrow's podcast.",
        ["will think", "will be thinking", "will have thought"],
        1,
        "The time window makes the thinking an action in progress, so the Future Continuous is the clearest choice."
      ),
      multipleChoiceItem(
        "adv-f-mc-4",
        "Choose the most logical future form.",
        "In six months' time, the developers ____ the entire app from scratch.",
        ["will rewrite", "will be rewriting", "will have rewritten"],
        2,
        "This indicates the completion of a major project within a specific timeframe."
      ),
      multipleChoiceItem(
        "adv-f-mc-5",
        "Choose the most logical future form.",
        "Don't visit the office at noon; the staff ____ their lunch break then.",
        ["will have", "will be having", "will have had"],
        1,
        "At exactly noon, the lunch break will be an ongoing activity."
      ),
      multipleChoiceItem(
        "adv-f-mc-6",
        "Choose the most logical future form.",
        "The marathon starts at 8:00 AM. By noon, most of the elite runners ____ the finish line.",
        ["will cross", "will be crossing", "will have crossed"],
        2,
        "The runners will have completed the race by that specific time."
      ),
      multipleChoiceItem(
        "adv-f-mc-7",
        "Choose the most logical future form.",
        "I ____ to the post office later today. Can I drop anything off for you?",
        ["will go", "will be going", "will have gone"],
        1,
        "Future Continuous is used here for a planned action that is part of a routine or decision."
      ),
      multipleChoiceItem(
        "adv-f-mc-8",
        "Choose the most logical future form.",
        "If you check the news in an hour, they ____ the election results.",
        ["will announce", "will be announcing", "will have announced"],
        2,
        "By the time you check, the announcement will be a finished event."
      ),
      errorCorrectionItem(
        "adv-f-ec-1",
        "Check the tense: Does it fit the timeline?",
        "The lecture begins at 2:00. At 2:15, the professor will have started speaking.",
        "will have started speaking",
        true,
        "",
        "Correct! By 2:15, the act of starting is already complete. 'Will be speaking' would also be possible if we focused on the lecture in progress."
      ),
      errorCorrectionItem(
        "adv-f-ec-2",
        "Check the tense: Does it fit the timeline?",
        "By the end of this decade, scientists will have found a more efficient fuel.",
        "will have found",
        true,
        "",
        "Correct! 'By the end of' is the perfect trigger for a completed future result."
      ),
      errorCorrectionItem(
        "adv-f-ec-3",
        "Check the tense: Does it fit the timeline?",
        "At midnight tonight, most people in the city will have slept.",
        "will have slept",
        false,
        "will be sleeping",
        "At midnight, the act of sleeping is usually in progress, not finished."
      ),
      errorCorrectionItem(
        "adv-f-ec-4",
        "Check the tense: Does it fit the timeline?",
        "I'll be seeing the director tomorrow, so I'll mention your proposal.",
        "I'll be seeing",
        true,
        "",
        "Correct! Use Future Continuous for pre-planned professional arrangements."
      ),
      errorCorrectionItem(
        "adv-f-ec-5",
        "Check the tense: Does it fit the timeline?",
        "In two years' time, we will be doubling our production capacity.",
        "will be doubling",
        false,
        "will have doubled",
        "With 'In X time', we usually focus on the final result that has been achieved."
      ),
      errorCorrectionItem(
        "adv-f-ec-6",
        "Check the tense: Does it fit the timeline?",
        "Wait! Don't go yet. I'll have finished this email in just a second.",
        "I'll have finished",
        true,
        "",
        "Correct! This shows the action will be complete within a very short future window."
      ),
      errorCorrectionItem(
        "adv-f-ec-7",
        "Check the tense: Does it fit the timeline?",
        "When the guests arrive, I will be cooking the main course.",
        "will be cooking",
        true,
        "",
        "Correct! This shows the cooking is in progress when the interruption (arrival) happens."
      ),
      errorCorrectionItem(
        "adv-f-ec-8",
        "Check the tense: Does it fit the timeline?",
        "By the time you get home, I will be cleaning the whole house.",
        "will be cleaning",
        false,
        "will have cleaned",
        "The speaker likely means the house will be clean (finished) when the other person arrives."
      ),
      placeholderGapItem(
        "adv-f-slot-1",
        "Use the verb prompt and place the adverb naturally.",
        "The software team __________ the bug by next week. (fix / completely)",
        "will have completely fixed",
        [],
        "Use Future Perfect for a resolved issue by a deadline. 'Completely' naturally goes before the main verb."
      ),
      placeholderGapItem(
        "adv-f-slot-2",
        "Use the verb prompt and place the adverb naturally.",
        "I wonder if people __________ printed books in fifty years. (read / still)",
        "will still be reading",
        [],
        "Future Continuous shows an ongoing habit in the future. 'Still' sits after the first auxiliary."
      ),
      placeholderGapItem(
        "adv-f-slot-3",
        "Use the verb prompt and place the adverb naturally.",
        "The storm __________ by the time we land. (pass / probably)",
        "will probably have passed",
        ["will have probably passed"],
        "Future Perfect describes an event completed by a future point. 'Probably' is a mid-position adverb."
      ),
      placeholderGapItem(
        "adv-f-slot-4",
        "Use the verb prompt and place the adverb naturally.",
        "I __________ the report by midnight. (finish / definitely)",
        "will definitely have finished",
        [],
        "Future Perfect fits the deadline. 'Definitely' comes after the first auxiliary."
      ),
      placeholderGapItem(
        "adv-f-slot-5",
        "Use the verb prompt and place the adverb naturally.",
        "They __________ for the results all day tomorrow. (wait / patiently)",
        "will be waiting patiently",
        [],
        "Future Continuous shows an action in progress for a duration. Manner normally follows the verb phrase."
      ),
      placeholderGapItem(
        "adv-f-slot-6",
        "Use the verb prompt and place the adverb naturally.",
        "By 5 PM, the sun __________. (set / nearly)",
        "will have nearly set",
        [],
        "Future Perfect fits the future deadline. Degree adverbs like 'nearly' go before the participle."
      ),
      placeholderGapItem(
        "adv-f-slot-7",
        "Use the verb prompt and place the adverb naturally.",
        "At 3:00 tomorrow, she __________ in the library. (study / quietly)",
        "will be studying quietly",
        [],
        "Future Continuous describes the action in progress. Manner comes before the place phrase."
      ),
      placeholderGapItem(
        "adv-f-slot-8",
        "Use the verb prompt and place the adverb naturally.",
        "The garden __________ by next summer. (grow / fully)",
        "will have fully grown",
        [],
        "Future Perfect shows the completed process by a future deadline. 'Fully' modifies the participle."
      ),
    ],
  },
  {
    id: "unreal-conditionals-mastery",
    title: "Unreal Conditionals: 2nd, 3rd & Mixed",
    shortDescription: "Master hypothetical situations in the past, present, and mixed timelines.",
    levels: ["b2"],
    intro:
      "Test your ability to imagine different realities. We'll cover Second and Third conditionals, plus those tricky Mixed conditionals where the past affects the present.",
    items: [
      multipleChoiceItem(
        "cond-mc-1",
        "Choose the correct verb form.",
        "If I ____ more time, I'd definitely take up a new hobby like photography.",
        ["have", "had", "would have"],
        1,
        "Second conditional: Use the past simple in the 'if' clause to describe an imaginary present or future situation."
      ),
      multipleChoiceItem(
        "cond-mc-2",
        "Choose the correct verb form.",
        "We ____ the deadline if the server hadn't crashed last night.",
        ["would meet", "would have met", "had met"],
        1,
        "Third conditional: Use 'would have + past participle' for a hypothetical past result."
      ),
      multipleChoiceItem(
        "cond-mc-3",
        "Choose the correct verb form (Mixed Conditional).",
        "If I hadn't missed my flight, I ____ on a beach in Bali right now.",
        ["would be sitting", "would have sat", "would sit"],
        0,
        "Mixed conditional (Past action/Present result): Use 'would + be + -ing' for a hypothetical present result of a past event."
      ),
      multipleChoiceItem(
        "cond-mc-4",
        "Choose the correct verb form.",
        "I ____ to the party if I were you; it's going to be very crowded.",
        ["won't go", "didn't go", "wouldn't go"],
        2,
        "Second conditional: Use 'wouldn't' for advice or imaginary choices in the present."
      ),
      multipleChoiceItem(
        "cond-mc-5",
        "Choose the correct verb form (Mixed Conditional).",
        "If he ____ so afraid of heights, he would have gone skydiving with us yesterday.",
        ["wasn't", "hadn't been", "wouldn't be"],
        0,
        "Mixed conditional (Present state/Past result): Use the past simple for a permanent state that affected a past event."
      ),
      multipleChoiceItem(
        "cond-mc-6",
        "Choose the correct verb form.",
        "If they ____ about the traffic, they would have left much earlier.",
        ["knew", "would have known", "had known"],
        2,
        "Third conditional: Use the past perfect in the 'if' clause for a hypothetical past condition."
      ),
      errorCorrectionItem(
        "cond-ec-1",
        "Is the conditional structure correct?",
        "If I would have known it was your birthday, I would have bought a gift.",
        "would have known",
        false,
        "had known",
        "Never use 'would have' in the 'if' clause. Use the past perfect for third conditionals."
      ),
      errorCorrectionItem(
        "cond-ec-2",
        "Is the conditional structure correct?",
        "If I won the lottery, I would travel around the world.",
        "won",
        true,
        "",
        "Correct! Second conditional uses the past simple for the condition."
      ),
      errorCorrectionItem(
        "cond-ec-3",
        "Is the conditional structure correct?",
        "I'd have a better job now if I worked harder at university.",
        "I'd have",
        true,
        "",
        "Correct! This is a mixed conditional: a past action (working at university) affecting the present (having a job)."
      ),
      errorCorrectionItem(
        "cond-ec-4",
        "Is the conditional structure correct?",
        "If we had more money, we would have moved to a bigger house years ago.",
        "had",
        true,
        "",
        "Correct! This can work as a mixed conditional: a present state (not having enough money) explains a past result (not moving years ago)."
      ),
      errorCorrectionItem(
        "cond-ec-5",
        "Is the conditional structure correct?",
        "I wouldn't be so tired today if I hadn't stayed up so late last night.",
        "wouldn't be",
        true,
        "",
        "Correct! This is a mixed conditional: past action (staying up late) affecting the present feeling (tired)."
      ),
      errorCorrectionItem(
        "cond-ec-6",
        "Is the conditional structure correct?",
        "If you would be taller, you could reach the top shelf.",
        "would be",
        false,
        "were",
        "In second conditionals, use 'were' or 'was' in the 'if' clause, not 'would be'."
      ),
      singleGap(
        "cond-rf-1",
        "Rewrite the facts as a 3rd conditional sentence.",
        ["I didn't see the sign, so I didn't stop. -> If I'd seen the sign, I ", { gapId: "g1" }, "."],
        ["would have stopped"],
        "Hypothetical past result: would have + past participle."
      ),
      singleGap(
        "cond-rf-2",
        "Rewrite the facts as a 2nd conditional sentence.",
        ["I don't have a car, so I walk to work. -> If I had a car, I ", { gapId: "g1" }, " to work."],
        ["wouldn't walk", "would not walk"],
        "Imaginary present: would/wouldn't + infinitive."
      ),
      singleGap(
        "cond-rf-3",
        "Combine the facts using a Mixed Conditional.",
        ["He isn't very clever. He failed the exam. -> He would have passed the exam if he ", { gapId: "g1" }, " cleverer."],
        ["were", "was"],
        "Mixed conditional: Present state (being clever) affecting a past result."
      ),
      singleGap(
        "cond-rf-4",
        "Rewrite the facts as a 3rd conditional sentence.",
        ["The team played badly, so they lost. -> If the team ", { gapId: "g1" }, ", they wouldn't have lost."],
        ["had played better", "hadn't played so badly"],
        "Hypothetical past condition: past perfect."
      ),
      singleGap(
        "cond-rf-5",
        "Combine the facts using a Mixed Conditional.",
        ["I forgot to buy milk. Now I can't have cereal. -> I could have cereal now if I ", { gapId: "g1" }, " to buy milk."],
        ["hadn't forgotten", "had not forgotten", "had remembered"],
        "Mixed conditional: A past action affects the present possibility. Both 'hadn't forgotten' and 'had remembered' express the needed idea here."
      ),
      singleGap(
        "cond-rf-6",
        "Combine the facts using a Mixed Conditional.",
        ["I don't have a map. I got lost in the city center. -> I wouldn't have got lost in the city center if I ", { gapId: "g1" }, "."],
        ["had a map"],
        "Mixed conditional: A permanent or present state (not having a map) affecting a specific result in the past."
      ),
      singleGap(
        "cond-rf-7",
        "Rewrite the facts as a 3rd conditional sentence.",
        ["The shop was closed. We didn't buy any bread. -> If the shop had been open, we ", { gapId: "g1" }, " some bread."],
        ["would have bought", "could have bought"],
        "Third conditional: An imaginary past condition and its hypothetical result."
      ),
    ],
  },
  {
    id: "uses-of-wish-mastery",
    title: "Wishes and Regrets",
    shortDescription: "Master 'wish' for present desires, past regrets, and annoying behaviors.",
    levels: ["b2"],
    intro:
      "When we 'wish' for things, the tense we choose tells the story. Use the past to talk about the present, the past perfect for regrets, and 'would' when something is annoying you.",
    items: [
      multipleChoiceItem(
        "wish-mc-1",
        "Choose the most natural option.",
        "I’m so busy this week. I wish I ____ more free time.",
        ["would have", "had", "have had"],
        1,
        "Use the past simple to talk about something you want to be different in the present."
      ),
      multipleChoiceItem(
        "wish-mc-2",
        "Choose the most natural option.",
        "I'm sorry I was rude to you. I wish I ____ that.",
        ["didn't say", "wouldn't say", "hadn't said"],
        2,
        "Use the past perfect to express a regret about a finished action in the past."
      ),
      multipleChoiceItem(
        "wish-mc-3",
        "Choose the most natural option.",
        "I wish the person in front of me ____ their phone; I can't see the screen!",
        ["put away", "would put away", "had put away"],
        1,
        "Use 'wish + would' to talk about a behavior that is annoying you or something you want to change."
      ),
      multipleChoiceItem(
        "wish-mc-4",
        "Choose the most natural option.",
        "This flat is tiny. I wish it ____ a bit bigger.",
        ["would be", "was", "has been"],
        1,
        "We use the past simple (was/were) for present states. We don't use 'would' for stative verbs like 'be'."
      ),
      multipleChoiceItem(
        "wish-mc-5",
        "Choose the most natural option.",
        "I wish I ____ to the concert with you last night. It sounds like it was amazing.",
        ["went", "could have gone", "would go"],
        1,
        "To talk about an ability or possibility that didn't happen in the past, use 'could have' + past participle."
      ),
      multipleChoiceItem(
        "wish-mc-6",
        "Choose the most natural option.",
        "I wish you ____ whistling! It's really distracting me.",
        ["would stop", "stopped", "had stopped"],
        0,
        "Use 'wish + would' when you want someone to change a specific, annoying action."
      ),
      errorCorrectionItem(
        "wish-ec-1",
        "Is the tense correct for this context?",
        "I wish I would have a faster car.",
        "would have",
        false,
        "had",
        "When wishing for a different present state for yourself, use the past simple, not 'would'."
      ),
      errorCorrectionItem(
        "wish-ec-2",
        "Is the tense correct for this context?",
        "I wish I hadn't spent so much money on that laptop.",
        "hadn't spent",
        true,
        "",
        "Correct! Use the past perfect for a regret about a past decision."
      ),
      errorCorrectionItem(
        "wish-ec-3",
        "Is the tense correct for this context?",
        "I wish my apartment would be bigger.",
        "would be bigger",
        false,
        "was bigger",
        "We don't use 'would' for stative verbs like 'be'. Use the past simple to talk about a present situation you want to be different."
      ),
      errorCorrectionItem(
        "wish-ec-4",
        "Is the tense correct for this context?",
        "I wish my brother wouldn't leave his dirty dishes in the sink.",
        "wouldn't leave",
        true,
        "",
        "Correct! Use 'wish + wouldn't' to complain about an annoying habit."
      ),
      errorCorrectionItem(
        "wish-ec-5",
        "Is the tense correct for this context?",
        "I wish I didn't lose my passport last year.",
        "didn't lose",
        false,
        "hadn't lost",
        "For a regret about a specific event in the past, you must use the past perfect."
      ),
      errorCorrectionItem(
        "wish-ec-6",
        "Is the tense correct for this context?",
        "I wish I knew where they were.",
        "knew",
        true,
        "",
        "Correct! Use the past simple to talk about a present situation you are unhappy about."
      ),
      placeholderGapItem(
        "wish-rf-1",
        "Express the desire: I don't live near the coast.",
        "I wish I __________ near the coast.",
        "lived",
        [],
        "Use the past simple to express a desire for a different present situation."
      ),
      placeholderGapItem(
        "wish-rf-2",
        "Express the regret: I didn't check the weather forecast.",
        "I wish I __________ the weather forecast.",
        "had checked",
        ["'d checked"],
        "Use the past perfect for regrets about past actions."
      ),
      placeholderGapItem(
        "wish-rf-3",
        "Express the annoyance: You keep interrupting me.",
        "I wish you __________ interrupting me.",
        "would stop",
        ["wouldn't keep"],
        "Use 'wish + would' to ask for a change in someone's behavior."
      ),
      placeholderGapItem(
        "wish-rf-4",
        "Express the desire: My phone is broken.",
        "I wish my phone __________ broken.",
        "wasn't",
        ["weren't"],
        "Use the negative past simple for a present state."
      ),
      placeholderGapItem(
        "wish-rf-5",
        "Express the regret: I forgot to back up my files.",
        "I wish I __________ to back up my files.",
        "hadn't forgotten",
        ["had not forgotten"],
        "Past perfect for past regrets."
      ),
      placeholderGapItem(
        "wish-rf-6",
        "Express the annoyance: It's raining and I want to go for a run.",
        "I wish it __________ raining.",
        "would stop",
        [],
        "Use 'would' for things you want to change but cannot control."
      ),
      placeholderGapItem(
        "wish-rf-7",
        "Express the desire: I am not very good at public speaking.",
        "I wish I __________ better at public speaking.",
        "was",
        ["were"],
        "Past simple of 'be' (was or were) for present desires."
      ),
      placeholderGapItem(
        "wish-rf-8",
        "Express the regret: He didn't tell me the truth.",
        "I wish he __________ me the truth.",
        "had told",
        ["'d told"],
        "Past perfect for a past event that didn't happen as you wanted."
      ),
    ],
  },
  {
    id: "gerunds-and-infinitives-mastery",
    title: "Gerunds and Infinitives: B2 Level",
    shortDescription: "Master the patterns of -ing, to-infinitive, and the bare infinitive.",
    levels: ["b2"],
    intro:
      "Some verbs follow a strict pattern, while others change meaning entirely based on the form you choose. Test your ability to navigate these nuances.",
    items: [
      multipleChoiceItem(
        "gim-mc-1",
        "Choose the most natural option.",
        "We've finished the project, so I'm really looking forward to ____ on holiday.",
        ["going", "to go", "go"],
        0,
        "The expression 'looking forward to' ends with a preposition, so it must be followed by a gerund (-ing)."
      ),
      multipleChoiceItem(
        "gim-mc-2",
        "Choose the most natural option.",
        "You can't afford ____ a car like that if you're trying to save money.",
        ["buying", "to buy", "buy"],
        1,
        "The verb 'afford' is followed by the to-infinitive."
      ),
      multipleChoiceItem(
        "gim-mc-3",
        "Choose the most natural option.",
        "The security guard made everyone ____ their bags at the entrance.",
        ["opening", "to open", "open"],
        2,
        "The verb 'make' (+ object) is followed by the bare infinitive (without 'to')."
      ),
      multipleChoiceItem(
        "gim-mc-4",
        "Choose the most natural option.",
        "I remember ____ that film when I was a child, but I don't remember the ending.",
        ["seeing", "to see", "see"],
        0,
        "Use 'remember + gerund' to talk about a memory of an action that happened in the past."
      ),
      multipleChoiceItem(
        "gim-mc-5",
        "Choose the most natural option.",
        "I'd prefer ____ at home tonight rather than going to the loud party.",
        ["staying", "to stay", "stay"],
        1,
        "When 'prefer' is used with 'would', it must be followed by the to-infinitive."
      ),
      multipleChoiceItem(
        "gim-mc-6",
        "Choose the most natural option.",
        "If the soup is too bland, try ____ some salt; it might taste better.",
        ["adding", "to add", "add"],
        0,
        "Use 'try + gerund' when you are experimenting or testing something to see if it works."
      ),
      multipleChoiceItem(
        "gim-mc-7",
        "Choose the most natural option.",
        "The central heating really needs ____ before the winter starts.",
        ["servicing", "to service", "service"],
        0,
        "Use 'need + gerund' for passive constructions where something needs to be done to an object."
      ),
      multipleChoiceItem(
        "gim-mc-8",
        "Choose the most natural option.",
        "He admitted ____ the mistake, although he wasn't happy about it.",
        ["making", "to make", "make"],
        0,
        "The verb 'admit' is followed by the gerund (-ing)."
      ),
      errorCorrectionItem(
        "gim-ec-1",
        "Check the highlighted phrase for errors.",
        "He decided changing his career after ten years in the same office.",
        "decided changing",
        false,
        "decided to change",
        "The verb 'decide' is followed by the to-infinitive."
      ),
      errorCorrectionItem(
        "gim-ec-2",
        "Check the highlighted phrase for errors.",
        "I don't feel like to go out in this weather.",
        "feel like to go",
        false,
        "feel like going",
        "The expression 'feel like' is followed by the gerund (-ing)."
      ),
      errorCorrectionItem(
        "gim-ec-3",
        "Check the highlighted phrase for errors.",
        "The manager let us leave the office early because of the storm.",
        "let us leave",
        true,
        "",
        "Correct! 'Let' (+ object) is followed by the bare infinitive."
      ),
      errorCorrectionItem(
        "gim-ec-4",
        "Check the highlighted phrase for errors.",
        "I'll never forget meeting the president last year.",
        "forget meeting",
        true,
        "",
        "Correct! Use 'forget + gerund' when you cannot remember an image or event from the past."
      ),
      errorCorrectionItem(
        "gim-ec-5",
        "Check the highlighted phrase for errors.",
        "I forgot locking the door, so I had to drive all the way back home.",
        "forgot locking",
        false,
        "forgot to lock",
        "Use 'forget + to-infinitive' when you didn't remember to do a task or action."
      ),
      errorCorrectionItem(
        "gim-ec-6",
        "Check the highlighted phrase for errors.",
        "We'd rather staying at a small hotel than a large resort.",
        "rather staying",
        false,
        "rather stay",
        "The expression 'would rather' is followed by the bare infinitive."
      ),
      errorCorrectionItem(
        "gim-ec-7",
        "Check the highlighted phrase for errors.",
        "The rain continued to fall throughout the entire afternoon.",
        "continued to fall",
        true,
        "",
        "Correct! Verbs like 'continue', 'start', and 'begin' can be followed by either form without a change in meaning."
      ),
      errorCorrectionItem(
        "gim-ec-8",
        "Check the highlighted phrase for errors.",
        "You should avoid to make mistakes like that in the final report.",
        "avoid to make",
        false,
        "avoid making",
        "The verb 'avoid' is followed by the gerund (-ing)."
      ),
      placeholderGapItem(
        "gim-gf-1",
        "Complete the sentence with the correct form.",
        "Please remember __________ the cat before you leave for work. (feed)",
        "to feed",
        [],
        "Use 'remember + to-infinitive' for a task you need to do."
      ),
      placeholderGapItem(
        "gim-gf-2",
        "Complete the sentence with the correct form.",
        "I tried __________ the window but it was painted shut. (open)",
        "to open",
        [],
        "Use 'try + to-infinitive' when making an effort to do something difficult."
      ),
      placeholderGapItem(
        "gim-gf-3",
        "Complete the sentence with the correct form.",
        "She has given up __________ sugar in her tea. (take)",
        "taking",
        [],
        "Phrasal verbs like 'give up' are followed by the gerund (-ing)."
      ),
      placeholderGapItem(
        "gim-gf-4",
        "Complete the sentence with the correct form.",
        "It's no use __________ about things you can't change. (worry)",
        "worrying",
        [],
        "The expression 'it's no use' is followed by the gerund (-ing)."
      ),
      placeholderGapItem(
        "gim-gf-5",
        "Complete the sentence with the correct form.",
        "I regret __________ you that your application has been unsuccessful. (tell)",
        "to tell",
        [],
        "Use 'regret + to-infinitive' for formal announcements or giving bad news."
      ),
      placeholderGapItem(
        "gim-gf-6",
        "Complete the sentence with the correct form.",
        "He managed __________ the mountain despite the terrible weather. (climb)",
        "to climb",
        [],
        "The verb 'manage' is followed by the to-infinitive."
      ),
      placeholderGapItem(
        "gim-gf-7",
        "Complete the sentence with the correct form.",
        "I don't mind __________ extra hours if the pay is good. (work)",
        "working",
        [],
        "The expression 'don't mind' is followed by the gerund (-ing)."
      ),
      placeholderGapItem(
        "gim-gf-8",
        "Complete the sentence with the correct form.",
        "My parents didn't allow me __________ out late on school nights. (go)",
        "to go",
        [],
        "The verb 'allow' (+ object) is followed by the to-infinitive."
      ),
    ],
  },
  {
    id: "past-modals-mastery",
    title: "Past Modals: Deduction & Regret",
    shortDescription: "Master 'must have', 'can't have', and 'should have' for past situations.",
    levels: ["b2"],
    intro:
      "When we look back at the past, we use modals to show how certain we are or how we feel about what happened. Remember: use 'must/can't have' for deduction and 'should have' for regrets.",
    items: [
      multipleChoiceItem(
        "pm-mc-1",
        "Choose the most logical future form.",
        "The kitchen is a mess! The kids ____ a snack while we were out.",
        ["must have made", "should have made", "can't have made"],
        0,
        "Use 'must have' when you are almost sure something happened based on the evidence."
      ),
      multipleChoiceItem(
        "pm-mc-2",
        "Choose the most logical future form.",
        "I'm not sure why they didn't come. They ____ the invitation.",
        ["must have missed", "might have missed", "should have missed"],
        1,
        "Use 'might have' or 'could have' when you think something was possible, but you aren't sure."
      ),
      multipleChoiceItem(
        "pm-mc-3",
        "Choose the most logical future form.",
        "It's a shame you didn't see the show. You ____ it.",
        ["must have loved", "might have loved", "would have loved"],
        2,
        "Use 'would have' to describe a hypothetical past reaction."
      ),
      multipleChoiceItem(
        "pm-mc-4",
        "Choose the most logical future form.",
        "I saw Jack in London today, so he ____ at the meeting in Manchester.",
        ["can't have been", "mustn't have been", "shouldn't have been"],
        0,
        "Use 'can't have' when you are almost sure something didn't happen because it's impossible."
      ),
      multipleChoiceItem(
        "pm-mc-5",
        "Choose the most logical future form.",
        "We're completely lost. We ____ the map more carefully before we left.",
        ["must have checked", "should have checked", "could have checked"],
        1,
        "Use 'should have' to express regret or criticism about a past action that didn't happen."
      ),
      multipleChoiceItem(
        "pm-mc-6",
        "Choose the most logical future form.",
        "She didn't answer her phone. She ____ it at home.",
        ["could have left", "ought to leave", "must leave"],
        0,
        "Use 'could have' + past participle to speculate about a past possibility."
      ),
      errorCorrectionItem(
        "pm-ec-1",
        "Check the highlighted phrase for errors.",
        "You must have told me it was a formal party! I feel ridiculous in these jeans.",
        "must have told",
        false,
        ["should have told", "ought to have told"],
        "Use 'should have' or 'ought to have' to criticize someone for not doing the right thing. 'Must have' is for logical deduction."
      ),
      errorCorrectionItem(
        "pm-ec-2",
        "Check the highlighted phrase for errors.",
        "I suppose he couldn't have seen your message yet, but I'm not certain.",
        "couldn't have seen",
        false,
        "might not have seen",
        "Use 'might not have' for a possibility. 'Couldn't have' implies you are almost certain it was impossible."
      ),
      errorCorrectionItem(
        "pm-ec-3",
        "Check the highlighted phrase for errors.",
        "They ought have arrived by now; they left over three hours ago.",
        "ought have arrived",
        false,
        "ought to have arrived",
        "The full structure is 'ought to have' + past participle."
      ),
      errorCorrectionItem(
        "pm-ec-4",
        "Check the highlighted phrase for errors.",
        "He can't have forgotten the meeting; I reminded him twice this morning.",
        "can't have forgotten",
        true,
        "",
        "Correct! Use 'can't have' when you are almost sure something didn't happen."
      ),
      errorCorrectionItem(
        "pm-ec-5",
        "Check the highlighted phrase for errors.",
        "I shouldn't have eaten that third piece of cake. I feel quite ill now.",
        "shouldn't have eaten",
        true,
        "",
        "Correct! Use 'shouldn't have' to express regret about a past action."
      ),
      errorCorrectionItem(
        "pm-ec-6",
        "Check the highlighted phrase for errors.",
        "The document must been deleted by mistake.",
        "must been",
        false,
        "must have been",
        "Don't forget the 'have' in the past modal structure: must + have + past participle."
      ),
      placeholderGapItem(
        "pm-gf-1",
        "Complete the deduction: I'm sure she was at the office.",
        "She __________ at the office.",
        "must have been",
        [],
        "Use 'must have' when you are almost sure about a past state."
      ),
      placeholderGapItem(
        "pm-gf-2",
        "Complete the regret: It was a mistake for you to say that.",
        "You __________ that.",
        "shouldn't have said",
        ["should not have said", "oughtn't to have said"],
        "Use 'shouldn't have' to express that a past action was the wrong thing to do."
      ),
      placeholderGapItem(
        "pm-gf-3",
        "Complete the speculation: Maybe he didn't receive the email.",
        "He __________ the email.",
        "might not have received",
        ["may not have received"],
        "Use 'might not have' or 'may not have' to talk about a negative possibility."
      ),
      placeholderGapItem(
        "pm-gf-4",
        "Complete the deduction: I'm sure they didn't finish the work.",
        "They __________ the work.",
        "can't have finished",
        ["couldn't have finished"],
        "Use 'can't have' or 'couldn't have' when you are sure something didn't happen."
      ),
      placeholderGapItem(
        "pm-gf-5",
        "Complete the criticism: Why didn't you lock the door?",
        "You __________ the door.",
        "should have locked",
        ["ought to have locked"],
        "Use 'should have' to suggest the right action that was missed."
      ),
      placeholderGapItem(
        "pm-gf-6",
        "Complete the speculation: It's possible that someone found your wallet.",
        "Someone __________ your wallet.",
        "might have found",
        ["could have found", "may have found"],
        "Use 'might', 'could', or 'may have' to talk about a past possibility."
      ),
      placeholderGapItem(
        "pm-gf-7",
        "Complete the deduction: I'm certain he wasn't driving the car.",
        "He __________ the car.",
        "can't have been driving",
        ["couldn't have been driving"],
        "Use the continuous form of the past modal for an action in progress."
      ),
      placeholderGapItem(
        "pm-gf-8",
        "Complete the regret: I'm sorry I didn't listen to your advice.",
        "I __________ to your advice.",
        "should have listened",
        ["ought to have listened"],
        "Use 'should have' for personal regrets about past actions."
      ),
    ],
  },
  {
    id: "verbs-of-the-senses-mastery",
    title: "Verbs of the Senses",
    shortDescription: "Master 'look', 'feel', 'smell', 'sound', and 'taste' plus the many uses of 'as'.",
    levels: ["b2"],
    intro:
      "When describing our impressions, the structure changes depending on what follows the verb. Practice the difference between using adjectives, 'like', and 'as if', as well as the functional uses of 'as'.",
    items: [
      multipleChoiceItem(
        "vs-mc-1",
        "Choose the most natural option.",
        "The music from the apartment next door ____ a bit too loud.",
        ["sounds", "sounds like", "sounds as if"],
        0,
        "Use 'verb + adjective' to describe a direct impression."
      ),
      multipleChoiceItem(
        "vs-mc-2",
        "Choose the most natural option.",
        "This new sauce ____ curry, don't you think?",
        ["tastes", "tastes like", "tastes as if"],
        1,
        "Use 'verb + like + noun' when comparing one thing to another."
      ),
      multipleChoiceItem(
        "vs-mc-3",
        "Choose the most natural option.",
        "The athlete ____ completely exhausted after the race.",
        ["looks", "looks like", "looks as if"],
        0,
        "Use 'verb + adjective' to describe a direct impression."
      ),
      multipleChoiceItem(
        "vs-mc-4",
        "Choose the most natural option.",
        "It's a long walk, but I ____ going for a stroll in the park.",
        ["feel", "feel like", "feel as if"],
        1,
        "Use 'feel like + gerund' to mean 'want' or 'would like'."
      ),
      multipleChoiceItem(
        "vs-mc-5",
        "Choose the most natural option.",
        "She is currently working ____ a project manager for a tech firm.",
        ["as", "like", "as if"],
        0,
        "Use 'as' to describe someone's job or function."
      ),
      multipleChoiceItem(
        "vs-mc-6",
        "Choose the most natural option.",
        "The bread ____ fresh from the oven. It's delicious!",
        ["smells", "smells like", "smells as though"],
        0,
        "Use 'verb + adjective' to describe a quality."
      ),
      multipleChoiceItem(
        "vs-mc-7",
        "Choose the most natural option.",
        "____ it was a holiday, the shops were all closed.",
        ["As", "Like", "As if"],
        0,
        "Use 'as' as a synonym for 'because' to give a reason."
      ),
      multipleChoiceItem(
        "vs-mc-8",
        "Choose the most natural option.",
        "I need a tool for the garden, ____ a shovel or a rake.",
        ["as", "such as", "as if"],
        1,
        "Use 'such as' to provide specific examples."
      ),
      errorCorrectionItem(
        "vs-ec-1",
        "Check the highlighted phrase for errors.",
        "You look like tired after your long flight.",
        "look like tired",
        false,
        "look tired",
        "Don't use 'like' before an adjective. Simply use the verb + adjective."
      ),
      errorCorrectionItem(
        "vs-ec-2",
        "Check the highlighted phrase for errors.",
        "This perfume smells as jasmine; it's very floral.",
        "smells as",
        false,
        "smells like",
        "Use 'verb + like' when followed by a noun to make a comparison."
      ),
      errorCorrectionItem(
        "vs-ec-3",
        "Check the highlighted phrase for errors.",
        "It sounds as though it's going to be a stormy night.",
        "sounds as though",
        true,
        "",
        "Correct! 'As though' is a valid alternative to 'as if' before a clause."
      ),
      errorCorrectionItem(
        "vs-ec-4",
        "Check the highlighted phrase for errors.",
        "I feel like to go to the cinema tonight.",
        "feel like to go",
        false,
        "feel like going",
        "The expression 'feel like' must be followed by a gerund (-ing) or a noun."
      ),
      errorCorrectionItem(
        "vs-ec-5",
        "Check the highlighted phrase for errors.",
        "He seems as if he's a very reliable person.",
        "seems as if",
        true,
        "",
        "Correct! 'Seem' can be followed by the same structures as 'look'."
      ),
      errorCorrectionItem(
        "vs-ec-6",
        "Check the highlighted phrase for errors.",
        "I used my phone like a flashlight when the power went out.",
        "like a flashlight",
        false,
        "as a flashlight",
        "Use 'as' to describe the function or role of an object."
      ),
      errorCorrectionItem(
        "vs-ec-7",
        "Check the highlighted phrase for errors.",
        "As we were leaving, it started to rain heavily.",
        "As",
        true,
        "",
        "Correct! 'As' can be used to mean 'when' or 'at the same time'."
      ),
      errorCorrectionItem(
        "vs-ec-8",
        "Check the highlighted phrase for errors.",
        "That actor looks his father when he was young.",
        "looks his father",
        false,
        "looks like his father",
        "When comparing a person to a noun, you must use 'look like'."
      ),
      placeholderGapItem(
        "vs-gf-1",
        "Complete the sentence with the correct form.",
        "This room __________ it hasn't been aired in days. (smell)",
        "smells as if",
        ["smells as though"],
        "Use 'smell + as if/as though' before a clause."
      ),
      placeholderGapItem(
        "vs-gf-2",
        "Complete the sentence with the correct form.",
        "That idea __________ very interesting to me. (sound)",
        "sounds",
        [],
        "Use 'sound + adjective' for a direct impression."
      ),
      placeholderGapItem(
        "vs-gf-3",
        "Complete the sentence with the correct form.",
        "Your new dog __________ a small wolf! (look)",
        "looks like",
        [],
        "Use 'look + like' before a noun."
      ),
      placeholderGapItem(
        "vs-gf-4",
        "Complete the sentence.",
        "I don't feel like __________ a big meal tonight. (feel like / cook)",
        "cooking",
        [],
        "Use a gerund after 'feel like'."
      ),
      placeholderGapItem(
        "vs-gf-5",
        "Complete the sentence.",
        "I am working __________ a volunteer at the film festival. (as/like)",
        "as",
        [],
        "Use 'as' to describe a job or role."
      ),
      placeholderGapItem(
        "vs-gf-6",
        "Complete the sentence.",
        "It __________ that the morning meeting has been cancelled. (seem)",
        "seems",
        [],
        "Use 'seem' to describe a general impression or a fact you've learned."
      ),
      placeholderGapItem(
        "vs-gf-7",
        "Complete the sentence.",
        "This cold tea __________ honey and lemon. (taste)",
        "tastes like",
        [],
        "Use 'taste + like' before a noun phrase."
      ),
      placeholderGapItem(
        "vs-gf-8",
        "Complete the sentence.",
        "He was running for the platform __________ the train was pulling away. (as/like)",
        "as",
        [],
        "Use 'as' to show that two actions were happening at the same time."
      ),
    ],
  },
  {
    id: "passive-voice-advanced",
    title: "The Passive: Advanced Forms",
    shortDescription: "Master all tenses, causative 'have', and formal reported passives.",
    levels: ["b2"],
    intro:
      "Go beyond the basics. This test covers passives in every tense, 'have something done' for services, and formal structures like 'He is believed to have...'.",
    items: [
      multipleChoiceItem(
        "pv-mc-1",
        "Choose the correct passive form.",
        "The stolen paintings ____ yet, despite a massive police search.",
        ["haven't been found", "aren't being found", "haven't found"],
        0,
        "Use the present perfect passive (have been + past participle) for a finished result with present relevance."
      ),
      multipleChoiceItem(
        "pv-mc-2",
        "Choose the correct passive form.",
        "By the time the inspectors arrive next month, all the seats in the new stadium ____.",
        ["will be installed", "will have been installed", "are being installed"],
        1,
        "Use the future perfect passive for an action that will be completed by a certain time in the future."
      ),
      multipleChoiceItem(
        "pv-mc-3",
        "Choose the correct passive form.",
        "I'm going to ____ before I go on holiday next week.",
        ["have my car serviced", "have serviced my car", "get serviced my car"],
        0,
        "Use the causative structure: have + object + past participle for services you arrange."
      ),
      multipleChoiceItem(
        "pv-mc-4",
        "Choose the correct passive form.",
        "The suspect is believed ____ the country shortly after the robbery.",
        ["to leave", "to be leaving", "to have left"],
        2,
        "Use the perfect infinitive (to have + past participle) to report an action that happened in the past."
      ),
      multipleChoiceItem(
        "pv-mc-5",
        "Choose the correct passive form.",
        "It ____ that the government will announce a tax cut tomorrow.",
        ["is thought", "is thinking", "thought"],
        0,
        "Use the impersonal passive 'It is said/thought that...' to report general beliefs."
      ),
      multipleChoiceItem(
        "pv-mc-6",
        "Choose the correct passive form.",
        "The CEO is thought ____ on a secret new project at the moment.",
        ["to work", "to be working", "to have worked"],
        1,
        "Use the continuous infinitive (to be + -ing) for a reported action that is currently in progress."
      ),
      multipleChoiceItem(
        "pv-mc-7",
        "Choose the correct passive form.",
        "The patient complained about ____ enough information by the doctors.",
        ["not being given", "not to be given", "not having given"],
        0,
        "After prepositions like 'about', use the gerund passive (being + past participle)."
      ),
      multipleChoiceItem(
        "pv-mc-8",
        "Choose the correct passive form.",
        "These laws ____ years ago to prevent such accidents.",
        ["should have passed", "should have been passed", "ought to pass"],
        1,
        "Use modal perfect passive (should have been + past participle) for something that was necessary but didn't happen."
      ),
      errorCorrectionItem(
        "pv-ec-1",
        "Check the highlighted phrase for errors.",
        "The bridge was being repaired when we drove past it.",
        "was being repaired",
        true,
        "",
        "Correct! Use the past continuous passive for an action that was in progress at a specific moment in the past."
      ),
      errorCorrectionItem(
        "pv-ec-2",
        "Check the highlighted phrase for errors.",
        "I need to have my hair cut this afternoon.",
        "have my hair cut",
        true,
        "",
        "Correct! Causative 'have' (have + object + past participle) for an arranged service."
      ),
      errorCorrectionItem(
        "pv-ec-3",
        "Check the highlighted phrase for errors.",
        "The man is said to be living abroad for several years.",
        "is said to be living",
        false,
        "is said to have been living",
        "To report an action that started in the past and is still continuing, use the perfect continuous infinitive (to have been + -ing)."
      ),
      errorCorrectionItem(
        "pv-ec-4",
        "Check the highlighted phrase for errors.",
        "It is believed that the strike will end soon.",
        "It is believed that",
        true,
        "",
        "Correct! Impersonal passive structure for formal reporting."
      ),
      errorCorrectionItem(
        "pv-ec-5",
        "Check the highlighted phrase for errors.",
        "He is thought that he has escaped from prison.",
        "He is thought that he has escaped",
        false,
        ["He is thought to have escaped", "It is thought that he has escaped"],
        "In the personal structure, use: Subject + is thought + to-infinitive. The impersonal structure 'It is thought that...' is also correct."
      ),
      errorCorrectionItem(
        "pv-ec-6",
        "Check the highlighted phrase for errors.",
        "We had our passports stolen while we were on holiday.",
        "had our passports stolen",
        true,
        "",
        "Correct! Causative 'had' can also refer to unexpected bad things that happen to us."
      ),
      errorCorrectionItem(
        "pv-ec-7",
        "Check the highlighted phrase for errors.",
        "The documents are reported to have been destroyed in the fire.",
        "to have been destroyed",
        true,
        "",
        "Correct! Use the perfect passive infinitive to report a past passive action."
      ),
      errorCorrectionItem(
        "pv-ec-8",
        "Check the highlighted phrase for errors.",
        "A new park is going to be open by the Mayor.",
        "be open",
        false,
        "be opened",
        "Passive structures always require the past participle: be + opened."
      ),
      placeholderGapItem(
        "pv-rf-1",
        "Rewrite in the passive: People say that he is a genius.",
        "He __________ a genius.",
        "is said to be",
        [],
        "Personal reported passive: Subject + is said + to-infinitive."
      ),
      placeholderGapItem(
        "pv-rf-2",
        "Rewrite in the passive: They believe the fire was started by an electrical fault.",
        "The fire __________ by an electrical fault.",
        "is believed to have been started",
        [],
        "Personal passive for a past action: Subject + is believed + perfect passive infinitive."
      ),
      placeholderGapItem(
        "pv-rf-3",
        "Rewrite using 'have something done': Someone is painting my house today.",
        "I __________ today.",
        "am having my house painted",
        ["'m having my house painted"],
        "Use the causative structure in the present continuous."
      ),
      placeholderGapItem(
        "pv-rf-4",
        "Rewrite in the passive: We expect that the company will make a profit.",
        "The company __________ a profit.",
        "is expected to make",
        [],
        "Personal passive for a future expectation."
      ),
      placeholderGapItem(
        "pv-rf-5",
        "Rewrite in the passive: People think he is hiding in the forest.",
        "He __________ in the forest.",
        "is thought to be hiding",
        [],
        "Use the continuous infinitive (to be + -ing) for a reported action in progress."
      ),
      placeholderGapItem(
        "pv-rf-6",
        "Rewrite in the passive: They say the price of oil has fallen again.",
        "The price of oil __________ again.",
        "is said to have fallen",
        [],
        "Use the perfect infinitive (to have + past participle) to report a completed action."
      ),
      placeholderGapItem(
        "pv-rf-7",
        "Rewrite using 'have something done': The dentist checked my teeth yesterday.",
        "I __________ yesterday.",
        "had my teeth checked",
        [],
        "Causative structure in the past simple."
      ),
      placeholderGapItem(
        "pv-rf-8",
        "Rewrite in the passive: They report that the missing explorers are safe.",
        "It __________ the missing explorers are safe.",
        "is reported that",
        ["is reported"],
        "Use the impersonal passive: It + is + past participle + that + clause. In formal English, 'that' is sometimes omitted."
      ),
    ],
  },
  {
    id: "reporting-verbs-mastery",
    title: "Reporting Verbs: B2 Level",
    shortDescription: "Master the patterns of infinitives and gerunds after reporting verbs.",
    levels: ["b2"],
    intro:
      "Beyond 'say' and 'tell', English uses specific verbs to report actions. The challenge is remembering which pattern follows each verb: to + infinitive, person + to + infinitive, or the -ing form.",
    items: [
      multipleChoiceItem(
        "rv-mc-1",
        "Choose the correct grammatical pattern.",
        "The doctor suggested ____ more exercise to improve my health.",
        ["me to do", "doing", "to do"],
        1,
        "The verb 'suggest' is followed by the -ing form, not 'person + to'."
      ),
      multipleChoiceItem(
        "rv-mc-2",
        "Choose the correct grammatical pattern.",
        "They threatened ____ the contract if we didn't meet the deadline.",
        ["to cancel", "cancelling", "us to cancel"],
        0,
        "The verb 'threaten' is followed by the to-infinitive."
      ),
      multipleChoiceItem(
        "rv-mc-3",
        "Choose the correct grammatical pattern.",
        "My manager reminded ____ the report before the weekend.",
        ["to finish", "me to finish", "me finishing"],
        1,
        "The verb 'remind' is followed by a person + to + infinitive."
      ),
      multipleChoiceItem(
        "rv-mc-4",
        "Choose the correct grammatical pattern.",
        "The neighbor blamed us ____ all the noise last night.",
        ["for making", "to make", "of making"],
        0,
        "The verb 'blame' is followed by a person + for + -ing form."
      ),
      multipleChoiceItem(
        "rv-mc-5",
        "Choose the correct grammatical pattern.",
        "They've invited ____ to their wedding in June.",
        ["us to come", "us coming", "to come"],
        0,
        "The verb 'invite' is followed by a person + to + infinitive."
      ),
      multipleChoiceItem(
        "rv-mc-6",
        "Choose the correct grammatical pattern.",
        "The suspect denied ____ anywhere near the scene of the crime.",
        ["to be", "being", "him to be"],
        1,
        "The verb 'deny' is followed by the -ing form."
      ),
      multipleChoiceItem(
        "rv-mc-7",
        "Choose the correct grammatical pattern.",
        "He insisted ____ for the meal, even though we wanted to split the bill.",
        ["to pay", "on paying", "paying"],
        1,
        "The verb 'insist' is followed by the preposition 'on' and then the gerund."
      ),
      multipleChoiceItem(
        "rv-mc-8",
        "Choose the correct grammatical pattern.",
        "She promised ____ anyone our secret.",
        ["to not tell", "not to tell", "not telling"],
        1,
        "In negative sentences, the 'not' comes before the to-infinitive."
      ),
      errorCorrectionItem(
        "rv-ec-1",
        "Check the highlighted phrase for errors.",
        "He suggested me to take a holiday, but I was too busy.",
        "suggested me to take",
        false,
        ["suggested that I take", "suggested taking"],
        "You cannot use 'suggest + person + to'. Use 'suggest + -ing' or a 'that' clause."
      ),
      errorCorrectionItem(
        "rv-ec-2",
        "Check the highlighted phrase for errors.",
        "She refused to help us with the preparations.",
        "refused to help",
        true,
        "",
        "Correct! 'Refuse' is followed by the to-infinitive."
      ),
      errorCorrectionItem(
        "rv-ec-3",
        "Check the highlighted phrase for errors.",
        "The guide warned us not to touch the artifacts.",
        "warned us not to touch",
        true,
        "",
        "Correct! 'Warn' is followed by a person + to + infinitive, and the 'not' is in the correct place."
      ),
      errorCorrectionItem(
        "rv-ec-4",
        "Check the highlighted phrase for errors.",
        "They apologized for be so late to the meeting.",
        "apologized for be",
        false,
        ["apologized for being", "apologised for being"],
        "After a preposition like 'for', you must use the -ing form."
      ),
      errorCorrectionItem(
        "rv-ec-5",
        "Check the highlighted phrase for errors.",
        "He admitted to have broken the window by accident.",
        "admitted to have broken",
        false,
        ["admitted breaking", "admitted having broken", "admitted to having broken"],
        "After 'admit', we use an -ing form. Several natural corrections are possible here."
      ),
      errorCorrectionItem(
        "rv-ec-6",
        "Check the highlighted phrase for errors.",
        "I recommend to visit the old town while you are there.",
        "recommend to visit",
        false,
        "recommend visiting",
        "The verb 'recommend' is followed by the -ing form, not the to-infinitive."
      ),
      errorCorrectionItem(
        "rv-ec-7",
        "Check the highlighted phrase for errors.",
        "The police accused him of stealing the car.",
        "accused him of stealing",
        true,
        "",
        "Correct! 'Accuse' is followed by a person + of + -ing."
      ),
      errorCorrectionItem(
        "rv-ec-8",
        "Check the highlighted phrase for errors.",
        "My friends encouraged me to apply for the new job.",
        "encouraged me to apply",
        true,
        "",
        "Correct! 'Encourage' is followed by a person + to + infinitive."
      ),
      placeholderGapItem(
        "rv-rf-1",
        "Rewrite the speech using the verb: 'I didn't break the vase!' (deny)",
        "She __________ the vase.",
        "denied breaking",
        ["denied having broken", "denied that she broke"],
        "Use 'deny + -ing' to report a negative statement about the past."
      ),
      placeholderGapItem(
        "rv-rf-2",
        "Rewrite the speech to us: 'Don't forget to lock the door.' (remind)",
        "He __________ the door.",
        "reminded us to lock",
        [],
        "Use 'remind + person + to + infinitive'."
      ),
      placeholderGapItem(
        "rv-rf-3",
        "Rewrite the speech to us: 'Would you like to stay for dinner?' (invite)",
        "They __________ for dinner.",
        "invited us to stay",
        [],
        "Use 'invite + person + to + infinitive'."
      ),
      placeholderGapItem(
        "rv-rf-4",
        "Rewrite the speech: 'No, I won't do your homework for you.' (refuse)",
        "She __________ my homework for me.",
        "refused to do",
        [],
        "Use 'refuse + to + infinitive'."
      ),
      placeholderGapItem(
        "rv-rf-5",
        "Rewrite the speech: 'You should go to the doctor.' (advise)",
        "The pharmacist __________ to the doctor.",
        "advised me to go",
        ["advised us to go"],
        "Use 'advise + person + to + infinitive'."
      ),
      placeholderGapItem(
        "rv-rf-6",
        "Rewrite the speech: 'I'm sorry I'm so late.' (apologize)",
        "He __________ so late.",
        "apologized for being",
        ["apologised for being"],
        "Use 'apologize/apologise (to someone) for + -ing'."
      ),
      placeholderGapItem(
        "rv-rf-7",
        "Rewrite the speech about him: 'You stole the money!' (accuse)",
        "They __________ the money.",
        "accused him of stealing",
        [],
        "Use 'accuse + person + of + -ing'."
      ),
      placeholderGapItem(
        "rv-rf-8",
        "Rewrite the speech: 'I'll give you a lift to the station.' (offer)",
        "She __________ me a lift to the station.",
        "offered to give",
        [],
        "Use 'offer + to + infinitive'."
      ),
    ],
  },
  {
    id: "countable-uncountable-mastery",
    title: "Countable and Uncountable Nouns",
    shortDescription: "Master the tricky grammar of advice, furniture, news, and plural nouns.",
    levels: ["b2"],
    intro:
      "Some nouns in English refuse to be counted, while others are always plural. Test your knowledge of these unique B2 noun patterns.",
    items: [
      multipleChoiceItem(
        "noun-mc-1",
        "Choose the correct option.",
        "The news about the company's merger ____ better than we expected.",
        ["is", "are", "have been"],
        0,
        "Even though 'news' ends in -s, it is uncountable and always takes a singular verb."
      ),
      multipleChoiceItem(
        "noun-mc-2",
        "Choose the correct option.",
        "I need to buy ____ new trousers for the wedding.",
        ["a", "some", "a piece of"],
        1,
        "Trousers are plural nouns. Use 'some' or 'a pair of', but never 'a'."
      ),
      multipleChoiceItem(
        "noun-mc-3",
        "Choose the correct option.",
        "The police ____ currently investigating the cause of the fire.",
        ["is", "are", "has been"],
        1,
        "The word 'police' is always followed by a plural verb."
      ),
      multipleChoiceItem(
        "noun-mc-4",
        "Choose the correct option.",
        "I've got ____ luggage, so I might need a hand at the station.",
        ["too many", "too much", "a few"],
        1,
        "Luggage is uncountable, so we use 'too much' or 'a lot of' to describe quantity."
      ),
      multipleChoiceItem(
        "noun-mc-5",
        "Choose the correct option.",
        "Could you give me a ____ of advice on which laptop to buy?",
        ["piece", "bit", "Either 'piece' or 'bit'"],
        2,
        "To count an individual item of an uncountable noun like advice, use 'a piece of' or 'a bit of'."
      ),
      multipleChoiceItem(
        "noun-mc-6",
        "Choose the correct option.",
        "The outskirts of the city ____ much more peaceful than the center.",
        ["is", "are", "be"],
        1,
        "The noun 'outskirts' is always plural and takes a plural verb."
      ),
      errorCorrectionItem(
        "noun-ec-1",
        "Check the highlighted phrase for errors.",
        "The sceneries in the mountains were absolutely breathtaking.",
        "The sceneries",
        false,
        "The scenery",
        "Scenery is an uncountable noun and does not have a plural form."
      ),
      errorCorrectionItem(
        "noun-ec-2",
        "Check the highlighted phrase for errors.",
        "We need to buy some new furnitures for the spare bedroom.",
        "furnitures",
        false,
        "furniture",
        "Furniture is uncountable. You can say 'some furniture' or 'pieces of furniture'."
      ),
      errorCorrectionItem(
        "noun-ec-3",
        "Check the highlighted phrase for errors.",
        "His behavior during the meeting was very professional.",
        "behavior",
        true,
        "",
        "Correct! Behavior (or behaviour) is an uncountable noun."
      ),
      errorCorrectionItem(
        "noun-ec-4",
        "Check the highlighted phrase for errors.",
        "I have a great news for you regarding your application!",
        "a great news",
        false,
        "some great news",
        "News is uncountable. Use 'some news' or just 'news', never 'a news'."
      ),
      errorCorrectionItem(
        "noun-ec-5",
        "Check the highlighted phrase for errors.",
        "I've found a pair of scissors in the kitchen drawer.",
        "a pair of scissors",
        true,
        "",
        "Correct! Use 'a pair of' for nouns made of two parts like scissors or trousers."
      ),
      errorCorrectionItem(
        "noun-ec-6",
        "Check the highlighted phrase for errors.",
        "The equipment we used for the experiment were quite old.",
        "were",
        false,
        "was",
        "Equipment is uncountable and must take a singular verb."
      ),
      placeholderGapItem(
        "noun-gf-1",
        "Complete the sentence with the correct form.",
        "I've bought some __________ (paper/papers) to read on the train.",
        "papers",
        [],
        "When 'paper' refers to newspapers, it is a countable noun."
      ),
      placeholderGapItem(
        "noun-gf-2",
        "Complete the sentence with the correct form.",
        "I'm sorry, I can't help you because I have too much __________ (homework/homeworks).",
        "homework",
        [],
        "Homework is uncountable and never takes a plural -s."
      ),
      placeholderGapItem(
        "noun-gf-3",
        "Complete the sentence with the correct form.",
        "The kitchen floor is covered in __________ (glass/glasses) from the broken bottle.",
        "glass",
        [],
        "Use uncountable 'glass' when referring to the material."
      ),
      placeholderGapItem(
        "noun-gf-4",
        "Complete the sentence with the correct form.",
        "My clothes __________ (be) still wet from the rain.",
        "are",
        [],
        "Clothes is a plural noun and always requires a plural verb."
      ),
      placeholderGapItem(
        "noun-gf-5",
        "Complete the sentence.",
        "The hotel staff __________ (be) incredibly helpful during our stay.",
        "are",
        ["is"],
        "Collective nouns like staff can take a singular or plural verb, though plural is common in B2 to emphasize individuals."
      ),
      placeholderGapItem(
        "noun-gf-6",
        "Complete the sentence.",
        "I've had a lot of __________ (luck/lucks) lately.",
        "luck",
        [],
        "Luck is uncountable and doesn't have a plural form."
      ),
      placeholderGapItem(
        "noun-gf-7",
        "Complete the sentence.",
        "Could I have a __________ of water, please? (drinking vessel)",
        "glass",
        [],
        "When referring to a container, 'glass' is countable."
      ),
      placeholderGapItem(
        "noun-gf-8",
        "Complete the sentence.",
        "The research __________ (show) that the climate is changing rapidly.",
        "shows",
        [],
        "Research is uncountable, so it takes a singular verb."
      ),
    ],
  },
  {
    id: "quantifiers-mastery-all-both-neither",
    title: "Quantifiers: All, Every, Both & Neither",
    shortDescription: "Master the tricky grammar of totalities, zero quantity, and choices.",
    levels: ["b2"],
    intro:
      "Quantifiers are all about the details. Do you use a singular or plural verb? Is it 'none' or 'any'? Test your ability to quantify precisely.",
    items: [
      multipleChoiceItem(
        "quant-mc-1",
        "Choose the correct option.",
        "I've been working ____ and I'm absolutely exhausted.",
        ["every day", "all day", "all the days"],
        1,
        "Use 'all day' to describe duration (from morning to night). 'Every day' refers to frequency (Monday to Sunday)."
      ),
      multipleChoiceItem(
        "quant-mc-2",
        "Choose the correct option.",
        "____ student in the class has to submit their essay by Friday.",
        ["All", "Every", "Most of"],
        1,
        "Use 'Every' with a singular countable noun. 'All' would require a plural noun (students)."
      ),
      multipleChoiceItem(
        "quant-mc-3",
        "Choose the correct option.",
        "____ my parents are retired, so they travel quite a lot.",
        ["Both", "Neither", "Either"],
        0,
        "Use 'Both' to refer to two people/things when the statement is positive."
      ),
      multipleChoiceItem(
        "quant-mc-4",
        "Choose the correct option.",
        "I've invited ten people, but ____ of them have replied yet.",
        ["no", "any", "none"],
        2,
        "Use 'none' as a pronoun to refer to zero quantity. 'No' must be followed by a noun."
      ),
      multipleChoiceItem(
        "quant-mc-5",
        "Choose the correct option.",
        "You can take ____ the 10:00 train or the 10:30 one; they both arrive on time.",
        ["both", "neither", "either"],
        2,
        "Use 'either... or' to talk about a choice between two alternatives."
      ),
      multipleChoiceItem(
        "quant-mc-6",
        "Choose the correct option.",
        "____ needs to be ready by the time the guests arrive.",
        ["All", "Everything", "Most"],
        1,
        "Use 'everything' (with a singular verb) to mean 'all things'. 'All' usually needs a noun or a different structure."
      ),
      errorCorrectionItem(
        "quant-ec-1",
        "Check the highlighted phrase for errors.",
        "Most of people in my office prefer to work from home.",
        "Most of people",
        false,
        "Most people / Most of the people",
        "Use 'most' for people in general, or 'most of the' for a specific group. Never 'most of' + noun."
      ),
      errorCorrectionItem(
        "quant-ec-2",
        "Check the highlighted phrase for errors.",
        "Neither John nor his sister is coming to the wedding.",
        "is coming",
        true,
        "",
        "Correct! With 'neither... nor', you can use a singular or plural verb, but singular is often preferred in formal English."
      ),
      errorCorrectionItem(
        "quant-ec-3",
        "Check the highlighted phrase for errors.",
        "There isn't none milk in the fridge, so I'll go to the shop.",
        "isn't none",
        false,
        "isn't any / is no",
        "Don't use a double negative. Use 'any' with negative verbs or 'no' with positive verbs."
      ),
      errorCorrectionItem(
        "quant-ec-4",
        "Check the highlighted phrase for errors.",
        "Not everybody likes spicy food.",
        "Not everybody",
        true,
        "",
        "Correct! We often use 'not' before 'everybody' or 'everything' to show that something isn't true for everyone."
      ),
      errorCorrectionItem(
        "quant-ec-5",
        "Check the highlighted phrase for errors.",
        "I've seen both of film, and they were both excellent.",
        "both of film",
        false,
        "both films / both of the films",
        "Use 'both' or 'both of the' with a plural noun."
      ),
      errorCorrectionItem(
        "quant-ec-6",
        "Check the highlighted phrase for errors.",
        "All the scientists at the conference agreed with the findings.",
        "All the",
        true,
        "",
        "Correct! 'All the' refers to a specific group of people or things."
      ),
      placeholderGapItem(
        "quant-gf-1",
        "Complete the sentence with the correct word.",
        "I've lived in this town __________ my life. (all / every)",
        "all",
        [],
        "Use 'all' with time expressions to show duration."
      ),
      placeholderGapItem(
        "quant-gf-2",
        "Complete the sentence with the correct word.",
        "Neither my brother __________ my father can cook very well. (or / nor)",
        "nor",
        [],
        "The correct pair is 'neither... nor'."
      ),
      placeholderGapItem(
        "quant-gf-3",
        "Complete the sentence with the correct word.",
        "__________ of the students passed the exam; the teacher was very disappointed. (None / No)",
        "None",
        [],
        "Use 'none of' before a noun or pronoun."
      ),
      placeholderGapItem(
        "quant-gf-4",
        "Complete the sentence with the correct word.",
        "I go for a run __________ morning before work. (all / every)",
        "every",
        [],
        "Use 'every' to show frequency."
      ),
      placeholderGapItem(
        "quant-gf-5",
        "Complete the sentence with the correct word.",
        "Most of __________ were late because of the traffic. (we / us)",
        "us",
        [],
        "Use an object pronoun (us, them, you) after 'most of'."
      ),
      placeholderGapItem(
        "quant-gf-6",
        "Complete the sentence.",
        "You can have __________ tea or coffee, but not both. (either / neither)",
        "either",
        [],
        "Use 'either' when choosing between two options."
      ),
      placeholderGapItem(
        "quant-gf-7",
        "Complete the sentence with the correct verb form.",
        "Everything __________ (be) ready for the presentation now.",
        "is",
        [],
        "Words like 'everything' and 'everybody' always take a singular verb."
      ),
      placeholderGapItem(
        "quant-gf-8",
        "Complete the sentence.",
        "Neither of my sisters __________ (live) in the same city as me.",
        "lives",
        ["live"],
        "Both singular and plural verbs are used with 'neither of', though singular is more formal."
      ),
      placeholderChoiceGapItem(
        "quant-pic-1",
        "Look at the classroom scene and choose the best quantifier.",
        "____ is allowed to use their phone.",
        ["Nobody"],
        "Use 'nobody' when no person is allowed to do something.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"],
        {
          imageSrc: "/images/grammar/classroom-scene.png",
          imageAlt: "A chaotic classroom scene with a stressed teacher, messy desks, and distracted students.",
          imageCaption: "Look at the picture and complete the sentences with the best quantifier.",
        }
      ),
      placeholderChoiceGapItem(
        "quant-pic-2",
        "Use the same picture to choose the best quantifier.",
        "Classes are ____ Tuesday and Thursday.",
        ["every"],
        "Use 'every' before singular time expressions like days of the week.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
      placeholderChoiceGapItem(
        "quant-pic-3",
        "Use the same picture to choose the best quantifier.",
        "You can go to reception ____ time between 9am and 10pm.",
        ["any"],
        "Use 'any' with singular nouns in expressions like 'any time' to mean 'it doesn't matter which'.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
      placeholderChoiceGapItem(
        "quant-pic-4",
        "Use the same picture to choose the best quantifier.",
        "There are ____ classes on Friday afternoons.",
        ["no"],
        "Use 'no' directly before a plural noun to mean zero quantity.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
      placeholderChoiceGapItem(
        "quant-pic-5",
        "Use the same picture to choose the best quantifier.",
        "The self-study room is available to ____ taking an exam.",
        ["anybody"],
        "Use 'anybody' to mean any person in that situation.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
      placeholderChoiceGapItem(
        "quant-pic-6",
        "Use the same picture to choose the best quantifier.",
        "____ of the students are paying attention to their teacher.",
        ["None"],
        "Use 'none of' before a plural noun phrase to mean zero people in the group.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
      placeholderChoiceGapItem(
        "quant-pic-7",
        "Use the same picture to choose the best quantifier.",
        "The teacher has broken ____ his board pens.",
        ["both"],
        "Use 'both' for two things when the statement is positive.",
        ["Nobody", "every", "any", "no", "anybody", "None", "both"]
      ),
    ],
  },
  {
    id: "ed-ing-adjectives-mastery",
    title: "-ed and -ing Adjectives",
    shortDescription: "Master the difference between describing feelings and describing situations.",
    levels: ["b1", "b2"],
    intro:
      "Are you 'bored' or 'boring'? The answer depends on whether you're talking about your feelings or your personality. This test helps you choose the right ending every time.",
    items: [
      multipleChoiceItem(
        "adj-ed-mc-1",
        "Choose the most natural option.",
        "The instructions for the new software were very ____, so I had to call for help.",
        ["confused", "confusing", "confuse"],
        1,
        "Use -ing to describe the thing (the instructions) that causes the feeling."
      ),
      multipleChoiceItem(
        "adj-ed-mc-2",
        "Choose the most natural option.",
        "I was quite ____ when I saw the final score of the match.",
        ["surprising", "surprised", "surprise"],
        1,
        "Use -ed to describe how a person feels in response to a situation."
      ),
      multipleChoiceItem(
        "adj-ed-mc-3",
        "Choose the most natural option.",
        "He’s such an ____ person; he’s traveled to over fifty countries!",
        ["interested", "interesting", "interest"],
        1,
        "Use -ing to describe someone's personality or the qualities they have that affect others."
      ),
      multipleChoiceItem(
        "adj-ed-mc-4",
        "Choose the most natural option.",
        "Working in a hospital can be very ____ at the end of a long shift.",
        ["exhausted", "exhausting", "exhaust"],
        1,
        "The job is the cause of the feeling, so we use the -ing form."
      ),
      multipleChoiceItem(
        "adj-ed-mc-5",
        "Choose the most natural option.",
        "I always feel ____ after a long walk by the sea.",
        ["relaxing", "relaxed", "relax"],
        1,
        "Use -ed to describe how a person feels after an experience."
      ),
      errorCorrectionItem(
        "adj-ed-ec-1",
        "Check the highlighted phrase for errors.",
        "I’m very boring in this meeting. Can we take a break?",
        "very boring",
        false,
        "very bored",
        "If you are the one feeling the lack of interest, use 'bored'. 'Boring' would mean you are a dull person!"
      ),
      errorCorrectionItem(
        "adj-ed-ec-2",
        "Check the highlighted phrase for errors.",
        "The documentary was absolutely fascinated.",
        "fascinated",
        false,
        "fascinating",
        "Inanimate objects like documentaries cannot 'feel' fascinated; they are 'fascinating' to the audience."
      ),
      errorCorrectionItem(
        "adj-ed-ec-3",
        "Check the highlighted phrase for errors.",
        "She was so embarrassed when she realized her mistake.",
        "embarrassed",
        true,
        "",
        "Correct! Use -ed for the person's internal feeling of shame or awkwardness."
      ),
      errorCorrectionItem(
        "adj-ed-ec-4",
        "Check the highlighted phrase for errors.",
        "It was a really frightened experience for everyone involved.",
        "frightened",
        false,
        "frightening",
        "The experience is the cause of the fear, so it must be 'frightening'."
      ),
      errorCorrectionItem(
        "adj-ed-ec-5",
        "Check the highlighted phrase for errors.",
        "After the exam, everyone looked very tiring.",
        "very tiring",
        false,
        "very tired",
        "Use -ed to describe the students' feeling after a lot of mental effort."
      ),
      placeholderGapItem(
        "adj-ed-gf-1",
        "Complete the sentence with the correct form.",
        "I find city maps very __________. (confuse)",
        "confusing",
        [],
        "The maps are the cause of the confusion."
      ),
      placeholderGapItem(
        "adj-ed-gf-2",
        "Complete the sentence with the correct form.",
        "Are you __________ in visiting the museum this afternoon? (interest)",
        "interested",
        [],
        "Use -ed for personal interest or feelings."
      ),
      placeholderGapItem(
        "adj-ed-gf-3",
        "Complete the sentence with the correct form.",
        "The results of the test were quite __________. (disappoint)",
        "disappointing",
        [],
        "Use -ing to describe the nature of the results."
      ),
      placeholderGapItem(
        "adj-ed-gf-4",
        "Complete the sentence with the correct form.",
        "He looked really __________ when he heard the bad news. (depress)",
        "depressed",
        [],
        "Use -ed to describe the person's emotional state."
      ),
      placeholderGapItem(
        "adj-ed-gf-5",
        "Complete the sentence with the correct form.",
        "I love listening to jazz because I find it very __________. (relax)",
        "relaxing",
        [],
        "Use -ing to describe the thing that creates the feeling."
      ),
      singleGap(
        "adj-ed-rf-1",
        "Rewrite the sentence using an -ed adjective.",
        ["The news shocked everyone. -> Everyone was ", { gapId: "g1" }, " by the news."],
        ["shocked"],
        "Convert the verb into a feeling adjective."
      ),
      singleGap(
        "adj-ed-rf-2",
        "Rewrite the sentence using an -ing adjective.",
        ["This book bores me. -> This is a very ", { gapId: "g1" }, " book."],
        ["boring"],
        "Convert the verb into a characteristic adjective."
      ),
      singleGap(
        "adj-ed-rf-3",
        "Rewrite the sentence based on the feeling.",
        ["The long flight made us feel exhausted. -> The long flight was ", { gapId: "g1" }, "."],
        ["exhausting"],
        "Describe the cause of the exhaustion."
      ),
      singleGap(
        "adj-ed-rf-4",
        "Rewrite the sentence using an -ing adjective.",
        ["The ten-hour journey tired us all out. -> The ten-hour journey was very ", { gapId: "g1" }, "."],
        ["tiring"],
        "Use the -ing adjective to describe the thing that causes the feeling."
      ),
    ],
  },
  {
    id: "be-going-to-mastery",
    title: "Be Going To: Plans vs. Predictions",
    shortDescription: "Practice intentions and predictions based on present evidence.",
    levels: ["a2", "b1"],
    intro:
      "We use 'be going to' for two main reasons: intentions we've already made (plans) or things we can see are about to happen (predictions).",
    items: [
      multipleChoiceItem(
        "bgt-mc-1",
        "Is this a plan or a prediction?",
        "Look at those dark clouds! It's going to rain.",
        ["Plan", "Prediction"],
        1,
        "Prediction: We can see evidence (the clouds) that something is about to happen."
      ),
      multipleChoiceItem(
        "bgt-mc-2",
        "Is this a plan or a prediction?",
        "I've bought a new camera because I'm going to take up photography.",
        ["Plan", "Prediction"],
        0,
        "Plan: This is an intention made before the moment of speaking."
      ),
      multipleChoiceItem(
        "bgt-mc-3",
        "Is this a plan or a prediction?",
        "Watch out! That ladder is going to fall!",
        ["Plan", "Prediction"],
        1,
        "Prediction: You can see the ladder wobbling right now."
      ),
      multipleChoiceItem(
        "bgt-mc-4",
        "Is this a plan or a prediction?",
        "We're going to move house next month; we've already signed the contract.",
        ["Plan", "Prediction"],
        0,
        "Plan: A clear intention with previous arrangement."
      ),
      placeholderGapItem(
        "bgt-gf-1",
        "Complete with 'be going to' + verb.",
        "I __________ (not / work) this weekend. I need a rest.",
        "am not going to work",
        ["'m not going to work"],
        "Negative intention/plan."
      ),
      placeholderGapItem(
        "bgt-gf-2",
        "Complete with 'be going to' + verb.",
        "__________ (you / invite) Mark to the party?",
        "Are you going to invite",
        [],
        "Question form for intentions."
      ),
      placeholderGapItem(
        "bgt-gf-3",
        "Complete with 'be going to' + verb.",
        "Be careful! You __________ (drop) that glass!",
        "are going to drop",
        ["'re going to drop"],
        "Prediction based on what we can see happening now."
      ),
      placeholderGapItem(
        "bgt-gf-4",
        "Complete with 'be going to' + verb.",
        "They __________ (get) married in the summer.",
        "are going to get",
        ["'re going to get"],
        "A future plan."
      ),
      placeholderGapItem(
        "bgt-visual-1",
        "Look at the picture and complete the prediction.",
        "He __________ the bus.",
        "is going to miss",
        ["'s going to miss"],
        "The evidence shows the bus is leaving without him.",
        {
          imageSrc: "/images/grammar/going-to/bus.png",
          imageAlt: "A man running after a bus while the doors are closing and it is moving away.",
          imageMaxWidth: "320px",
        }
      ),
      placeholderGapItem(
        "bgt-visual-2",
        "Look at the picture and complete the prediction.",
        "The plates __________.",
        "are going to fall",
        ["are going to break", "'re going to fall", "'re going to break"],
        "We can see the plates are about to fall.",
        {
          imageSrc: "/images/grammar/going-to/waiter.png",
          imageAlt: "A waiter carrying a dangerously leaning stack of plates.",
          imageMaxWidth: "320px",
        }
      ),
      placeholderGapItem(
        "bgt-visual-3",
        "Look at the picture and complete the prediction.",
        "She __________.",
        "is going to slip",
        ["is going to fall", "'s going to fall", "'s going to slip"],
        "The immediate evidence is the ice on her path.",
        {
          imageSrc: "/images/grammar/going-to/ice.png",
          imageAlt: "A young woman looking at her phone while walking towards a patch of ice.",
          imageMaxWidth: "320px",
        }
      ),
      placeholderGapItem(
        "bgt-visual-4",
        "Look at the picture and complete the prediction.",
        "They __________ lost.",
        "are going to get",
        ["'re going to get"],
        "The evidence suggests they don't know where they are going.",
        {
          imageSrc: "/images/grammar/going-to/map.png",
          imageAlt: "A confused traveler holding a map upside down at a crossroads.",
          imageMaxWidth: "320px",
        }
      ),
    ],
  },
  {
    id: "predictions-will-wont-a2b1",
    title: "Future Predictions: Will and Won't",
    shortDescription: "Practice making guesses and sharing opinions about the future.",
    levels: ["a2", "b1"],
    intro:
      "Use 'will' (or ''ll) and 'won't' to say what you think or guess will happen in the future. Remember to use 'I don't think...' for negative predictions.",
    items: [
      multipleChoiceItem(
        "will-mc-1",
        "Choose the correct future form.",
        "It's a great book. I'm sure you ____ it.",
        ["'ll like", "will liking", "won't like"],
        0,
        "Use ''ll' (will) for a positive prediction after 'I'm sure'."
      ),
      multipleChoiceItem(
        "will-mc-2",
        "Choose the correct future form.",
        "The film is in French. We ____ understand anything.",
        ["'ll", "won't", "don't"],
        1,
        "Use 'won't' for a negative prediction based on a current situation."
      ),
      multipleChoiceItem(
        "will-mc-3",
        "Choose the correct future form.",
        "A: Is Jessica coming?\nB: Yes, but she ____ late.",
        ["will", "be", "'ll be"],
        2,
        "Always use 'will' (or ''ll) followed by the infinitive 'be'."
      ),
      errorCorrectionItem(
        "will-ec-1",
        "Check the highlighted phrase for errors.",
        "I think he won't pass the exam.",
        "I think he won't pass",
        false,
        "I don't think he'll pass",
        "It is much more natural to say 'I don't think... will' than 'I think... won't'."
      ),
      errorCorrectionItem(
        "will-ec-2",
        "Check the highlighted phrase for errors.",
        "I'm sure you will to enjoy the party.",
        "will to enjoy",
        false,
        "will enjoy",
        "Never use 'to' after will. Use the infinitive without 'to'."
      ),
      errorCorrectionItem(
        "will-ec-3",
        "Check the highlighted phrase for errors.",
        "Do you think they'll win the match?",
        "they'll win",
        true,
        "",
        "Correct! Use 'Do you think... will' for questions about predictions."
      ),
      singleGap(
        "will-rf-1",
        "Rewrite using 'don't think'.",
        ["I ", { gapId: "g1" }, " rain tomorrow."],
        ["don't think it will", "don't think it'll"],
        "Move the negative to the start of the sentence with 'I don't think'.",
        { originalSentence: "I think it won't rain tomorrow." }
      ),
      singleGap(
        "will-rf-2",
        "Rewrite using a contraction.",
        ["I'm sure you ", { gapId: "g1" }, " a famous artist."],
        ["'ll be"],
        "Use the contraction ''ll' for a more natural spoken prediction.",
        { originalSentence: "I am sure that you will be a famous artist." }
      ),
      placeholderGapItem(
        "will-gf-1",
        "Complete the sentence.",
        "He is very tired. He __________ (not / stay) for the whole party.",
        "won't stay",
        ["will not stay"],
        "Use 'won't' + infinitive for a negative prediction."
      ),
      placeholderGapItem(
        "will-gf-2",
        "Complete the sentence.",
        "__________ (you / be) at home this evening?",
        "Will you be",
        [],
        "Question form: Will + subject + be."
      ),
      placeholderGapItem(
        "will-gf-3",
        "Complete the sentence.",
        "Wait! I'm sure I __________ (find) your keys in a minute.",
        "'ll find",
        ["will find"],
        "Use 'will' for a positive prediction about finding something."
      ),
      multipleChoiceItem(
        "pred-con-1",
        "Which form is more natural?",
        "Look at those dark clouds! It ____ rain in a minute.",
        ["will", "is going to"],
        1,
        "The clouds are visible evidence that it is about to rain."
      ),
      multipleChoiceItem(
        "pred-con-2",
        "Which form is more natural?",
        "I'm not sure, but I think the price of petrol ____ up again next month.",
        ["will go", "is going to go"],
        0,
        "Use 'will' because this is a guess or opinion, not based on something you see right now."
      ),
      multipleChoiceItem(
        "pred-con-3",
        "Which form is more natural?",
        "Watch out! That vase ____ off the shelf!",
        ["will fall", "is going to fall"],
        1,
        "Use 'be going to' for an immediate prediction based on what you can see."
      ),
      multipleChoiceItem(
        "pred-con-4",
        "Which form is more natural?",
        "I've seen his test paper; it's full of mistakes. He ____ pass the exam.",
        ["won't", "is not going to"],
        1,
        "The mistakes on the paper are the current evidence for the prediction."
      ),
      multipleChoiceItem(
        "pred-con-5",
        "Which form is more natural?",
        "I'm sure you ____ a wonderful time on your holiday in Spain.",
        ["'ll have", "are going to have"],
        0,
        "Use 'will' (or ''ll') after 'I'm sure' to express a personal belief about the future."
      ),
    ],
  },
  {
    id: "will-shall-functions-a2b1",
    title: "Will and Shall: Decisions and Offers",
    shortDescription: "Master the use of will and shall for instant decisions, promises, and offers.",
    levels: ["a2", "b1"],
    intro:
      "Use 'will' for instant decisions and promises. Use 'shall' in questions when you want to offer help or suggest an idea to someone else.",
    items: [
      multipleChoiceItem(
        "ws-mc-1",
        "Choose the correct option.",
        "Instant Decision: 'A: We've run out of sugar.'\n'B: Don't worry, ____ some when I go to the supermarket.'",
        ["I'll buy", "I buy", "I'm going to buy"],
        0,
        "Use 'will' for a decision made at the moment of speaking."
      ),
      multipleChoiceItem(
        "ws-mc-2",
        "Choose the correct option.",
        "Offer: 'You look lost. ____ I show you the way on the map?'",
        ["Will", "Shall", "Do"],
        1,
        "Use 'Shall I...?' to offer help in the form of a question."
      ),
      multipleChoiceItem(
        "ws-mc-3",
        "Choose the correct option.",
        "Suggestion: 'It's very hot in here. ____ we open a window?'",
        ["Shall", "Will", "Are"],
        0,
        "Use 'Shall we...?' to make a suggestion for the group."
      ),
      multipleChoiceItem(
        "ws-mc-4",
        "Choose the correct option.",
        "Promise: 'Thank you for the money. I ____ you back on Friday.'",
        ["pay", "shall pay", "will pay"],
        2,
        "Use 'will' to make a promise about a future action."
      ),
      errorCorrectionItem(
        "ws-ec-1",
        "Check the highlighted phrase for errors.",
        "I help you with those heavy suitcases.",
        "I help",
        false,
        "I'll help",
        "Use 'will' or ''ll' for an instant offer. Don't use the present simple."
      ),
      errorCorrectionItem(
        "ws-ec-2",
        "Check the highlighted phrase for errors.",
        "Shall I will carry your bag for you?",
        "Shall I will",
        false,
        "Shall I",
        "Do not use 'will' after 'shall'. Use 'Shall I' + infinitive."
      ),
      errorCorrectionItem(
        "ws-ec-3",
        "Check the highlighted phrase for errors.",
        "I promise I won't tell anybody your secret.",
        "won't tell",
        true,
        "",
        "Correct! Use 'won't' for a negative promise."
      ),
      errorCorrectionItem(
        "ws-ec-4",
        "Check the highlighted phrase for errors.",
        "Will we go for a coffee after the lesson?",
        "Will we",
        false,
        "Shall we",
        "Use 'Shall we...?' when making a suggestion or asking for an opinion on a plan."
      ),
      placeholderGapItem(
        "ws-gf-1",
        "Complete the sentence.",
        "Instant Decision: 'A: The phone is ringing!'\n'B: ____________________ (answer) it!'",
        "I'll answer",
        ["I will answer"],
        "Use 'I'll' + infinitive for an instant reaction to a situation."
      ),
      placeholderGapItem(
        "ws-gf-2",
        "Complete the sentence.",
        "Offer: 'A: I'm really thirsty.'\n'B: ____________________ (get) you a glass of water?'",
        "Shall I get",
        ["Should I get"],
        "Use 'Shall I' to offer to do something for someone else."
      ),
      placeholderGapItem(
        "ws-gf-3",
        "Complete the sentence.",
        "Promise: 'Don't worry about the mess. ____________________ (tidy) it up later.'",
        "I'll tidy",
        ["I will tidy"],
        "Use the contraction ''ll' for a natural-sounding promise."
      ),
      placeholderGapItem(
        "ws-gf-4",
        "Complete the sentence.",
        "Suggestion: 'A: I'm bored. ____________________ (watch) a film?'",
        "Shall we watch",
        [],
        "Use 'Shall we' + infinitive to suggest an activity."
      ),
      wordOrderItem(
        "ws-wo-1",
        "Unjumble the offer.",
        ["the", "dinner", "I", "shall", "make"],
        "Shall I make the dinner?",
        "Structure: Shall + I + infinitive + object?"
      ),
      wordOrderItem(
        "ws-wo-2",
        "Unjumble the promise.",
        ["be", "late", "promise", "I", "won't", "I"],
        "I promise I won't be late.",
        "Structure: Subject + promise + Subject + won't + be."
      ),
      wordOrderItem(
        "ws-wo-3",
        "Unjumble the decision.",
        ["take", "I", "it", "think", "I'll"],
        "I think I'll take it.",
        "Structure: I think + I'll + infinitive."
      ),
      wordOrderItem(
        "ws-wo-4",
        "Unjumble the suggestion.",
        ["to", "park", "we", "the", "shall", "go"],
        "Shall we go to the park?",
        "Structure: Shall + we + verb + prepositional phrase?"
      ),
    ],
  },
  {
    id: "conditional-choice-7b",
    title: "Second Conditional: Choosing Between Conditionals",
    shortDescription:
      "Choose between first and second conditional by deciding if the situation is real or unreal.",
    levels: ["b1"],
    intro:
      "Read the situation first. Use the first conditional for real, likely future possibilities, and the second conditional for imaginary, impossible, or very unlikely situations.",
    items: [
      multipleChoiceItem(
        "cc7b-mc-1",
        "Choose the best sentence.",
        "Situation: You are a student with very little money. You don't have enough to buy a car.",
        [
          "If I have enough money, I'll buy a car.",
          "If I had enough money, I'd buy a car.",
        ],
        1,
        "Because you don't have the money now, this is an unreal or hypothetical situation, so the second conditional fits best."
      ),
      multipleChoiceItem(
        "cc7b-mc-2",
        "Choose the best sentence.",
        "Situation: You're at a restaurant. You might order dessert, but you're quite full.",
        [
          "If I'm still hungry, I'll order a cake.",
          "If I were still hungry, I'd order a cake.",
        ],
        0,
        "This is a real possibility later in the meal, so use the first conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-3",
        "Choose the best sentence.",
        "Situation: You are 30 years old and you are imagining being a teenager again.",
        [
          "If I am a teenager again, I'll study harder.",
          "If I were a teenager again, I'd study harder.",
        ],
        1,
        "This is an impossible or unreal situation, so use the second conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-4",
        "Choose the best sentence.",
        "Situation: It's a bit cloudy outside and there is a chance of rain this afternoon.",
        ["If it rains, we'll stay home.", "If it rained, we'd stay home."],
        0,
        "There is a real chance of rain, so the first conditional is the better choice."
      ),
      multipleChoiceItem(
        "cc7b-mc-5",
        "Choose the best sentence.",
        "Situation: You don't speak French and you are not planning to learn it.",
        [
          "If you speak French, you can communicate in Paris.",
          "If you spoke French, you could communicate in Paris.",
        ],
        1,
        "Because this is not true now, the unreal option with the second conditional is more logical."
      ),
      multipleChoiceItem(
        "cc7b-mc-6",
        "Choose the best sentence.",
        "Situation: You're at home and your phone might ring.",
        [
          "If your phone rings, you'll answer it.",
          "If your phone rang, you would answer it.",
        ],
        0,
        "This is a real possibility in the near future, so use the first conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-7",
        "Choose the best sentence.",
        "Situation: You don't have any money and you know you won't win the lottery.",
        [
          "If you have money, you can buy a ticket.",
          "If you had money, you could buy a ticket.",
        ],
        1,
        "This situation is unreal, so the second conditional is the better match."
      ),
      multipleChoiceItem(
        "cc7b-mc-8",
        "Choose the best option.",
        "If I had a job, I ____ much more social.",
        ["will be", "would be", "am"],
        1,
        "Use 'would' + infinitive in the result clause of the second conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-9",
        "Choose the best option.",
        "If it ____ later, we'll have the party inside.",
        ["rains", "rained", "would rain"],
        0,
        "Use the present simple after 'if' in the first conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-10",
        "Choose the best option.",
        "If I ____ nearer the office, I wouldn't need to drive every day.",
        ["live", "lived", "will live"],
        1,
        "Use the past simple in the if-clause for the second conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-11",
        "Choose the best option.",
        "If she ____ her homework now, she'll be free later.",
        ["finishes", "finished", "would finish"],
        0,
        "Use the present simple in the if-clause for a real future possibility."
      ),
      multipleChoiceItem(
        "cc7b-mc-12",
        "Choose the best option.",
        "If we ____ more time, we'd visit the museum too.",
        ["have", "had", "will have"],
        1,
        "This is a hypothetical situation, so use the past simple after 'if'."
      ),
      multipleChoiceItem(
        "cc7b-mc-13",
        "Choose the best option.",
        "If my train is late, I ____ you a message.",
        ["send", "'d send", "'ll send"],
        2,
        "Use 'will' in the result clause for the first conditional."
      ),
      multipleChoiceItem(
        "cc7b-mc-14",
        "Choose the best option.",
        "If I ____ you, I wouldn't wait much longer.",
        ["am", "were", "will be"],
        1,
        "Use 'If I were you' for advice."
      ),
      errorCorrectionItem(
        "cc7b-ec-1",
        "Check the highlighted phrase for errors.",
        "If I would live in London, I'd visit the museums every week.",
        "If I would live",
        false,
        "If I lived",
        "Never use 'would' in the if-clause. Use the past simple in the second conditional."
      ),
      errorCorrectionItem(
        "cc7b-ec-2",
        "Check the highlighted phrase for errors.",
        "If it will be sunny tomorrow, we'll go to the beach.",
        "If it will be",
        false,
        "If it is",
        "Use the present simple after 'if' for a real future possibility."
      ),
      errorCorrectionItem(
        "cc7b-ec-3",
        "Check the highlighted phrase for errors.",
        "If he studied more, he will pass all his exams easily.",
        "he will pass",
        false,
        "he would pass",
        "With a hypothetical if-clause in the past simple, the result clause should use 'would'."
      ),
      errorCorrectionItem(
        "cc7b-ec-4",
        "Check the highlighted phrase for errors.",
        "If I were you, I would take that offer.",
        "If I were you",
        true,
        "",
        "Correct. 'If I were you' is the standard advice structure in the second conditional."
      ),
      singleGap(
        "cc7b-rf-1",
        "Real: I don't have a car, so I walk to work. Complete the unreal sentence.",
        ["If I had a car, I ", { gapId: "g1" }, " to work."],
        ["wouldn't walk", "would not walk"],
        "Use the second conditional to imagine the opposite of the real situation."
      ),
      singleGap(
        "cc7b-rf-2",
        "Real: She is shy, so she doesn't go to many parties. Complete the unreal sentence.",
        ["If she ", { gapId: "g1" }, " shy, she'd go to more parties."],
        ["weren't", "were not", "wasn't", "was not"],
        "Use the past simple negative in the if-clause for a hypothetical present situation."
      ),
      singleGap(
        "cc7b-rf-3",
        "Complete the advice sentence.",
        ["If I ", { gapId: "g1" }, " you, I'd tell her the truth."],
        ["were", "was"],
        "Use 'If I were you' to give advice."
      ),
      doubleGap(
        "cc7b-gf-1",
        "Complete the sentence with the correct forms.",
        ["If I ", { gapId: "g1" }, " (win) a trip to space, I ", { gapId: "g2" }, " (go) tomorrow."],
        ["won"],
        ["'d go", "would go"],
        "Because this is a very unlikely dream, use the second conditional: past simple + would."
      ),
      doubleGap(
        "cc7b-gf-2",
        "Complete the sentence with the correct forms.",
        ["I ", { gapId: "g1" }, " (call) you if I ", { gapId: "g2" }, " (finish) my homework early tonight."],
        ["'ll call", "will call"],
        ["finish"],
        "This is a real possibility, so use the first conditional: will + infinitive, then present simple."
      ),
      singleGap(
        "cc7b-rf-4",
        "Real: I'm cold because the heating is off. Complete the unreal sentence.",
        ["I would not be cold if the heating ", { gapId: "g1" }, " on."],
        ["was", "were"],
        "Use the past simple of 'be' in the if-clause to imagine a different present situation."
      ),
      singleGap(
        "cc7b-rf-5",
        "Real: I'm lazy, so I don't exercise. Complete the unreal sentence.",
        ["If I wasn't lazy, I ", { gapId: "g1" }, "."],
        ["would exercise", "'d exercise", "would do more exercise", "'d do more exercise"],
        "Use the second conditional to imagine the opposite result in the present."
      ),
      singleGap(
        "cc7b-rf-6",
        "Real: I'm tired because I go to bed too late. Complete the unreal sentence.",
        ["If I did not go to bed so late, I ", { gapId: "g1" }, "."],
        ["would not be tired", "wouldn't be tired", "would be less tired", "'d be less tired"],
        "Change the present cause into a hypothetical condition and use 'would' in the result clause."
      ),
      singleGap(
        "cc7b-rf-7",
        "Real: I live in the city, so I don't see the stars. Complete the unreal sentence.",
        ["I would see the stars if I ", { gapId: "g1" }, " in the city."],
        ["didn't live", "did not live", "lived somewhere else", "lived outside the city"],
        "Use a negative or contrasting idea in the if-clause to imagine a different present reality."
      ),
      singleGap(
        "cc7b-rf-8",
        "Real: They don't have more money because they spend too much. Complete the unreal sentence.",
        ["If they did not spend so much, they ", { gapId: "g1" }, " more money."],
        ["would have", "'d have"],
        "Use the second conditional to imagine a different result from a different present habit."
      ),
    ],
  },
  {
    id: "second-conditional-intro-a2b1",
    title: "Second Conditional: Dreams and Hypotheses",
    shortDescription: "A first look at using 'if + past' to talk about imaginary situations.",
    levels: ["a2", "b1"],
    intro:
      "Use the second conditional to talk about imaginary or hypothetical situations in the present or future. Remember: use the past simple after 'if', and 'would' or 'wouldn't' for the result.",
    items: [
      multipleChoiceItem(
        "sc2-mc-1",
        "Choose the correct verb form for an imaginary situation.",
        "If I ____ more free time, I'd learn to cook properly.",
        ["have", "had", "would have"],
        1,
        "In the if-clause, use the past simple to show the situation is imaginary."
      ),
      multipleChoiceItem(
        "sc2-mc-2",
        "Choose the correct verb form for the result.",
        "My parents ____ less stressed if they worked fewer hours.",
        ["would be", "will be", "were"],
        0,
        "In the result clause, use 'would' + the base form of the verb."
      ),
      multipleChoiceItem(
        "sc2-mc-3",
        "Choose the correct negative result.",
        "If he lived closer to the office, he ____ two trains every morning.",
        ["doesn't take", "won't take", "wouldn't take"],
        2,
        "Use 'wouldn't' (would not) for a negative result in an imaginary scenario."
      ),
      multipleChoiceItem(
        "sc2-mc-4",
        "Which word can replace 'would' to talk about possibility?",
        "If we borrowed Anna's satnav, we ____ find the hotel more easily.",
        ["could", "can", "did"],
        0,
        "You can use 'could' + infinitive instead of 'would' in the second conditional."
      ),
      multipleChoiceItem(
        "sc2-log-1",
        "Choose the correct form.",
        "Context: The restaurant is open and we've already booked a table.\n'If we ____ early, we'll get the best seats.'",
        ["leave", "left"],
        0,
        "Use the first conditional (if + present) for real, possible situations."
      ),
      multipleChoiceItem(
        "sc2-log-2",
        "Choose the correct form.",
        "Context: I don't have enough money for the course this year.\n'If I ____ the money, I'd sign up tomorrow.'",
        ["have", "had"],
        1,
        "Use the second conditional (if + past) for imaginary or impossible situations."
      ),
      placeholderChoiceGapItem(
        "sc2-were-1",
        "Choose the correct form.",
        "Formal advice: If I ____ you, I wouldn't reply while you were angry.",
        ["were"],
        "Use 'If I were you' for giving advice.",
        ["was", "were", "am"]
      ),
      placeholderChoiceGapItem(
        "sc2-were-2",
        "Choose the correct form.",
        "Hypothesis: If she ____ here, she would know how to fix this printer.",
        ["were"],
        "With the verb 'be', we can use 'were' instead of 'was' after I/he/she/it.",
        ["was", "were", "be"]
      ),
      placeholderGapItem(
        "sc2-gf-1",
        "Complete the sentence.",
        "If I __________ (be) better at maths, I'd study engineering.",
        "were",
        ["was"],
        "Use the past simple of 'be' (were/was) in the if-clause."
      ),
      placeholderGapItem(
        "sc2-gf-2",
        "Complete the sentence.",
        "We __________ (eat) out more often if restaurants were cheaper here.",
        "would eat",
        ["'d eat"],
        "Use 'would' + infinitive for the imaginary result."
      ),
      placeholderGapItem(
        "sc2-gf-3",
        "Complete the sentence.",
        "If I were you, I __________ (not / lend) him any more money.",
        "wouldn't lend",
        ["would not lend"],
        "Use the negative 'wouldn't' for negative advice."
      ),
      placeholderGapItem(
        "sc2-gf-4",
        "Complete the sentence.",
        "We could have lunch outside if the wind __________ (not / be) so strong.",
        "weren't",
        ["were not", "wasn't", "was not"],
        "Use the past simple of 'be' in the if-clause for a second conditional sentence."
      ),
    ],
  },
  {
    id: "possessive-pronouns-8c-a2b1",
    title: "Possessive Pronouns and Adjectives",
    shortDescription: "Master the difference between possessive adjectives (my, your) and pronouns (mine, yours).",
    levels: ["a2", "b1"],
    intro:
      "Use possessive adjectives (my, your, his...) before a noun. Use possessive pronouns (mine, yours, hers...) when you don't use a noun. Use 'Whose' to ask about possession.",
    items: [
      multipleChoiceItem(
        "pos-mc-1",
        "Choose the correct word.",
        "I've got my suitcase, but I can't see ____.",
        ["your", "yours", "the yours"],
        1,
        "Use the possessive pronoun 'yours' because there is no noun after it."
      ),
      multipleChoiceItem(
        "pos-mc-2",
        "Choose the correct word.",
        "This isn't ____ coat. Mine is blue.",
        ["my", "mine", "my one"],
        0,
        "Use the possessive adjective 'my' because it is followed by the noun 'coat'."
      ),
      multipleChoiceItem(
        "pos-mc-3",
        "Choose the correct word.",
        "We've lost our keys. Are these ____?",
        ["our", "ours", "ours keys"],
        1,
        "Use 'ours' as a stand-alone pronoun to replace 'our keys'."
      ),
      multipleChoiceItem(
        "pos-mc-4",
        "Choose the correct word.",
        "That's his car, and this one is ____.",
        ["her", "hers", "she's"],
        1,
        "Use the possessive pronoun 'hers' to show possession without repeating 'car'."
      ),
      errorCorrectionItem(
        "pos-ec-1",
        "Check the highlighted phrase for errors.",
        "Is this the yours? I found it on the table.",
        "the yours",
        false,
        "yours",
        "Never use 'the' with possessive pronouns."
      ),
      errorCorrectionItem(
        "pos-ec-2",
        "Check the highlighted phrase for errors.",
        "That isn't mine book. I think it belongs to Sarah.",
        "mine book",
        false,
        "my book",
        "Do not use possessive pronouns (mine) with a noun. Use a possessive adjective (my) instead."
      ),
      errorCorrectionItem(
        "pos-ec-3",
        "Check the highlighted phrase for errors.",
        "Who's phone is this? It's been ringing for ages.",
        "Who's",
        false,
        "Whose",
        "Use 'Whose' to ask about possession. 'Who's' is a contraction of 'Who is'."
      ),
      errorCorrectionItem(
        "pos-ec-4",
        "Check the highlighted phrase for errors.",
        "The house is theirs, but the garden is ours.",
        "theirs",
        true,
        "",
        "Correct! 'Theirs' is the possessive pronoun for 'they'."
      ),
      placeholderGapItem(
        "pos-gf-1",
        "Complete the sentence.",
        "__________ (jacket / be) this?",
        "Whose jacket is",
        [],
        "Use 'Whose' + noun + 'is' to ask who something belongs to."
      ),
      doubleGap(
        "pos-gf-2",
        "Complete the sentence.",
        ["It isn't ", { gapId: "g1" }, " (my / jacket). It's ", { gapId: "g2" }, " (your)."],
        ["my jacket"],
        ["yours"],
        "Adjective (my) before the noun; pronoun (yours) at the end."
      ),
      placeholderGapItem(
        "pos-gf-3",
        "Complete the sentence.",
        "These are their trainers, and those __________ (be / our).",
        "are ours",
        [],
        "Use the plural verb 'are' with the possessive pronoun 'ours'."
      ),
      singleGap(
        "pos-rf-1",
        "Rewrite using a pronoun.",
        ["It's ", { gapId: "g1" }, "."],
        ["mine"],
        "The pronoun 'mine' replaces 'my coat'.",
        { originalSentence: "It's my coat." }
      ),
      singleGap(
        "pos-rf-2",
        "Rewrite using a pronoun.",
        ["Is it ", { gapId: "g1" }, "?"],
        ["hers"],
        "The pronoun 'hers' replaces 'her bag'.",
        { originalSentence: "Is it her bag?" }
      ),
      singleGap(
        "pos-rf-3",
        "Rewrite using 'Whose'.",
        ["", { gapId: "g1" }, " is this?"],
        ["Whose phone"],
        "Start with 'Whose' + the noun to ask about possession.",
        { originalSentence: "Who does this phone belong to?" }
      ),
    ],
  },
  {
    id: "advice-should-ought-a2b1",
    title: "Giving Advice: Should and Shouldn't",
    shortDescription: "Master giving advice and sharing opinions using should, shouldn't, and ought to.",
    levels: ["a2", "b1"],
    intro:
      "Use 'should' to give advice or say what you think is a good idea. Remember the natural rule: say 'I don't think you should...' rather than 'I think you shouldn't...'.",
    items: [
      multipleChoiceItem(
        "adv-mc-1",
        "Choose the best advice for the situation.",
        "Your phone battery is very low. You ____ it now.",
        ["should charge", "should to charge", "ought charge"],
        0,
        "After 'should', use the infinitive without 'to'. 'Ought' would require 'to'."
      ),
      multipleChoiceItem(
        "adv-mc-2",
        "Choose the best advice for the situation.",
        "It's a very formal party. You ____ wear those old trainers.",
        ["shouldn't", "don't should", "ought not"],
        0,
        "Use 'shouldn't' (should not) to advise against an action."
      ),
      multipleChoiceItem(
        "adv-mc-3",
        "Choose the correct synonym.",
        "He looks very stressed. He ____ take a few days off work.",
        ["should", "ought to", "Either of these"],
        2,
        "'Should' and 'ought to' have the same meaning when giving advice."
      ),
      multipleChoiceItem(
        "adv-mc-4",
        "Choose the best advice for the situation.",
        "The road is icy. You ____ too fast.",
        ["shouldn't drive", "shouldn't to drive", "don't should drive"],
        0,
        "After 'shouldn't', use the base form of the verb without 'to'."
      ),
      errorCorrectionItem(
        "adv-ec-1",
        "Check the highlighted phrase for errors.",
        "You should to call your parents more often.",
        "should to",
        false,
        "should",
        "Never use 'to' after 'should'. Use the base form of the verb."
      ),
      errorCorrectionItem(
        "adv-ec-2",
        "Check the highlighted phrase for errors.",
        "I think you should to rest before the exam.",
        "should to rest",
        false,
        "should rest",
        "After 'should', use the base form of the verb without 'to'."
      ),
      errorCorrectionItem(
        "adv-ec-3",
        "Check the highlighted phrase for errors.",
        "She ought to see a doctor about that cough.",
        "ought to",
        true,
        "",
        "Correct! 'Ought to' is a slightly more formal but correct way to say 'should'."
      ),
      errorCorrectionItem(
        "adv-ec-4",
        "Check the highlighted phrase for errors.",
        "What do you think I should do?",
        "do you think I should",
        true,
        "",
        "Correct! Use this structure to ask for someone's advice."
      ),
      placeholderGapItem(
        "adv-gf-1",
        "Complete the sentence.",
        "A: I'm really tired all the time.\nB: I think you __________ (go) to bed earlier.",
        "should go",
        ["ought to go"],
        "Give a positive recommendation using should or ought to."
      ),
      placeholderGapItem(
        "adv-gf-2",
        "Complete the sentence.",
        "A: Should I tell him the truth?\nB: No, I __________ (think / tell) him yet.",
        "don't think you should tell",
        ["do not think you should tell"],
        "Use the natural negative advice structure: I don't think + you + should."
      ),
      placeholderGapItem(
        "adv-gf-3",
        "Complete the sentence.",
        "A: I have a lot of work to do.\nB: Then you __________ (not / watch) TV all evening!",
        "shouldn't watch",
        ["should not watch"],
        "Give negative advice based on the situation."
      ),
      singleGap(
        "adv-rf-1",
        "Rewrite using 'ought to'.",
        ["You ", { gapId: "g1" }, " your boyfriend."],
        ["ought to leave"],
        "Replace 'should' with the synonym 'ought to'.",
        { originalSentence: "You should leave your boyfriend." }
      ),
      singleGap(
        "adv-rf-2",
        "Rewrite using 'should'.",
        ["You ", { gapId: "g1" }, "."],
        ["should take a break"],
        "Use 'should' + base verb to give advice.",
        { originalSentence: "It's a good idea to take a break." }
      ),
    ],
  },
  {
    id: "obligation-prohibition-7c-a2b1",
    title: "Obligation and Prohibition: Must and Have to",
    shortDescription: "Master rules, recommendations, and prohibitions using modal verbs.",
    levels: ["a2", "b1"],
    intro:
      "Use 'have to' for rules and 'must' for strong advice or personal obligations. Be careful: 'mustn't' means something is forbidden, while 'don't have to' means it isn't necessary.",
    items: [
      multipleChoiceItem(
        "op2-mc-1",
        "Choose the correct modal.",
        "It's a secret. You ____ tell anybody!",
        ["mustn't", "don't have to", "must"],
        0,
        "Use 'mustn't' when something is prohibited or forbidden."
      ),
      multipleChoiceItem(
        "op2-mc-2",
        "Choose the correct modal.",
        "We've got plenty of time. We ____ hurry.",
        ["mustn't", "don't have to", "must"],
        1,
        "Use 'don't have to' when an action is not obligatory or necessary."
      ),
      multipleChoiceItem(
        "op2-mc-3",
        "Choose the correct modal.",
        "At this school, students ____ wear a uniform; they can wear their own clothes.",
        ["mustn't", "don't have to", "have to"],
        1,
        "The lack of a rule means you 'don't have to' do it."
      ),
      multipleChoiceItem(
        "op2-mc-4",
        "Choose the correct modal.",
        "You ____ touch that wire! It's extremely dangerous.",
        ["mustn't", "don't have to", "have to"],
        0,
        "Use 'mustn't' for strong warnings or prohibitions."
      ),
      errorCorrectionItem(
        "op2-ec-1",
        "Check the highlighted phrase for errors.",
        "What time must you to leave tomorrow?",
        "must you to",
        false,
        ["must you", "do you have to"],
        "After 'must', use the infinitive without 'to'. You can also use 'do you have to' to ask about obligation."
      ),
      errorCorrectionItem(
        "op2-ec-2",
        "Check the highlighted phrase for errors.",
        "Do you have to work on Saturdays?",
        "have to",
        true,
        "",
        "Correct! We use 'do/does' to make questions with 'have to'."
      ),
      errorCorrectionItem(
        "op2-ec-3",
        "Check the highlighted phrase for errors.",
        "She hasn't to go to the office today.",
        "hasn't to",
        false,
        "doesn't have to",
        "For negatives, use 'don't/doesn't have to'."
      ),
      errorCorrectionItem(
        "op2-ec-4",
        "Check the highlighted phrase for errors.",
        "You mustn't drink the water in that river; it's dirty.",
        "mustn't",
        true,
        "",
        "Correct! 'Mustn't' is used to say something is a bad idea or forbidden."
      ),
      placeholderGapItem(
        "op2-gf-1",
        "Complete the sentence.",
        "You __________ (wear) a seatbelt in the car. It's the law.",
        "have to wear",
        ["must wear"],
        "Both work for rules, though 'have to' is common for laws."
      ),
      placeholderGapItem(
        "op2-gf-2",
        "Complete the sentence.",
        "__________ (I / buy) a ticket for the museum, or is it free?",
        "Do I have to buy",
        [],
        "Use 'do + subject + have to' for questions about rules."
      ),
      placeholderGapItem(
        "op2-gf-3",
        "Complete the sentence.",
        "Visitors __________ (take) photos inside the gallery.",
        "mustn't take",
        ["must not take"],
        "Use 'mustn't' for formal prohibitions."
      ),
      placeholderGapItem(
        "op2-gf-4",
        "Complete the sentence.",
        "He __________ (get up) early tomorrow because he's on holiday.",
        "doesn't have to get up",
        ["does not have to get up"],
        "Use 'doesn't have to' for a lack of necessity."
      ),
      placeholderGapItem(
        "op2-gf-5",
        "Complete the sentence.",
        "I __________ (remember) to call my mum tonight.",
        "must remember",
        ["have to remember"],
        "Use 'must' for personal obligations you impose on yourself."
      ),
      placeholderGapItem(
        "op2-gf-6",
        "Complete the sentence.",
        "She __________ (work) very hard at her new job.",
        "has to work",
        [],
        "Use 'has to' (third person) for workplace requirements."
      ),
      placeholderGapItem(
        "sign-gap-1",
        "Complete the rule from the sign.",
        "You ____________________ (take) photos inside this gallery.",
        "mustn't take",
        ["must not take"],
        "Use 'mustn't' when an action is prohibited or forbidden.",
        {
          imageSrc: "/images/grammar/signs/photos.png",
          imageAlt: "A museum gallery with a no-photos sign showing a camera with a red line through it.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "sign-gap-2",
        "Complete the rule from the sign.",
        "The light is on, so you ____________________ (wear) your seatbelt now.",
        "have to wear",
        ["must wear"],
        "Both 'must' and 'have to' work for rules, but 'have to' is common for external requirements.",
        {
          imageSrc: "/images/grammar/signs/seat-belt.png",
          imageAlt: "An airplane cabin with the illuminated seatbelt sign switched on.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "sign-gap-3",
        "Complete the rule from the sign.",
        "You ____________________ (pay) to use the internet here.",
        "don't have to pay",
        ["do not have to pay"],
        "Use 'don't have to' to show that something is not necessary or obligatory.",
        {
          imageSrc: "/images/grammar/signs/wifi.png",
          imageAlt: "A cafe window with a large sign that says free wifi for customers.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "sign-gap-4",
        "Complete the rule from the sign.",
        "Visitors ____________________ (use) their mobile phones in this area.",
        "mustn't use",
        ["must not use"],
        "A red line through a sign indicates that an action is forbidden.",
        {
          imageSrc: "/images/grammar/signs/mobile.png",
          imageAlt: "A hospital area with a no-mobile-phone sign on the wall.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "sign-gap-5",
        "Complete the rule from the sign.",
        "Employees ____________________ (wash) their hands before starting work.",
        "have to wash",
        ["must wash"],
        "Use 'have to' for general obligations like work rules or laws.",
        {
          imageSrc: "/images/grammar/signs/restaurant.png",
          imageAlt: "A restaurant kitchen with an all staff wash hands sign and a chef washing his hands.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "sign-gap-6",
        "Complete the rule from the sign.",
        "On this part of the coast, you ____________________ (wear) a swimsuit.",
        "don't have to wear",
        ["do not have to wear"],
        "If something is 'optional', it means you can do it if you want, but it isn't necessary or obligatory.",
        {
          imageSrc: "/images/grammar/signs/beach.png",
          imageAlt: "A sunny beach with a sign saying nudist beach swimsuit optional.",
          imageCaption: "Look at the sign and complete the rule.",
          imageMaxWidth: "420px",
        }
      ),
    ],
  },
  {
    id: "verb-form-review-6c",
    title: "The Big Verb Review",
    shortDescription: "A comprehensive test of present, past, and future forms.",
    levels: ["a2", "b1"],
    intro:
      "This review covers all the major verb forms. Look closely at the context of each sentence to decide if it's a habit, a finished past action, a life experience, or a future plan.",
    items: [
      multipleChoiceItem(
        "rev-mc-1",
        "Choose the correct form.",
        "We ____ a really good film at the cinema last night.",
        ["have seen", "saw", "were seeing"],
        1,
        "Use the Past Simple for finished actions with a specific time (last night)."
      ),
      multipleChoiceItem(
        "rev-mc-2",
        "Choose the correct form.",
        "He ____ for a new job at the moment.",
        ["looks", "is looking", "has looked"],
        1,
        "Use the Present Continuous for things happening now or around now."
      ),
      multipleChoiceItem(
        "rev-mc-3",
        "Choose the correct form.",
        "I'm sure you ____ the exhibition. It's fantastic.",
        ["'ll love", "going to love", "love"],
        0,
        "Use 'will' for predictions based on what we think or feel."
      ),
      multipleChoiceItem(
        "rev-mc-4",
        "Choose the correct form.",
        "____ you ever ____ to South America?",
        ["Did / go", "Have / been", "Are / going"],
        1,
        "Use the Present Perfect to ask about life experiences (ever)."
      ),
      multipleChoiceItem(
        "rev-mc-5",
        "Choose the correct form.",
        "I ____ my parents for dinner this Sunday.",
        ["meet", "am meeting", "will meet"],
        1,
        "Use the Present Continuous for fixed future arrangements."
      ),
      errorCorrectionItem(
        "rev-ec-1",
        "Check the highlighted phrase for errors.",
        "She doesn't smoke since she was a teenager.",
        "doesn't smoke",
        false,
        "hasn't smoked",
        "Use the Present Perfect for actions that started in the past and continue to now."
      ),
      errorCorrectionItem(
        "rev-ec-2",
        "Check the highlighted phrase for errors.",
        "What were you doing at 7.00 last night?",
        "were you doing",
        true,
        "",
        "Correct! Use the Past Continuous for actions in progress at a specific past time."
      ),
      errorCorrectionItem(
        "rev-ec-3",
        "Check the highlighted phrase for errors.",
        "Look at those clouds! It will rain.",
        "will rain",
        false,
        ["is going to rain", "'s going to rain"],
        "Use 'be going to' for predictions when you have visible evidence (the clouds)."
      ),
      errorCorrectionItem(
        "rev-ec-4",
        "Check the highlighted phrase for errors.",
        "I saw a great play last weekend.",
        "saw",
        true,
        "",
        "Correct! Use the Past Simple for finished actions."
      ),
      placeholderGapItem(
        "rev-gf-1",
        "Complete the sentence.",
        "A: Where's John?\nB: He __________ (work) in the garden right now.",
        "is working",
        ["'s working"],
        "Present Continuous for an action happening now."
      ),
      placeholderGapItem(
        "rev-gf-2",
        "Complete the sentence.",
        "I __________ (not / see) that new TV series yet.",
        "haven't seen",
        ["have not seen"],
        "Present Perfect with 'yet' for recently finished actions."
      ),
      placeholderGapItem(
        "rev-gf-3",
        "Complete the sentence.",
        "A: I'm really cold.\nB: I __________ (close) the window for you.",
        "will close",
        ["'ll close"],
        "Use 'will' for an instant decision or offer."
      ),
      placeholderGapItem(
        "rev-gf-4",
        "Complete the sentence.",
        "We __________ (move) to a new flat next month. We've already signed the contract.",
        "are moving",
        ["'re moving"],
        "Present Continuous for a fixed future arrangement."
      ),
      placeholderGapItem(
        "rev-gf-5",
        "Complete the sentence.",
        "What __________ (you / do) when the phone rang?",
        "were you doing",
        [],
        "Past Continuous for an action in progress when another action happened."
      ),
      placeholderGapItem(
        "rev-gf-6",
        "Complete the sentence.",
        "He __________ (not / go) to the gym yesterday because he was ill.",
        "didn't go",
        ["did not go"],
        "Past Simple for a finished past action."
      ),
      placeholderGapItem(
        "rev-gf-7",
        "Complete the sentence.",
        "I __________ (buy) a new car next week. I've already chosen the model.",
        "am going to buy",
        ["'m going to buy"],
        "Use 'be going to' for future plans."
      ),
      placeholderGapItem(
        "rev-gf-8",
        "Complete the sentence.",
        "She __________ (live) in the city centre, so she walks to work.",
        "lives",
        [],
        "Present Simple for things that usually happen."
      ),
      placeholderGapItem(
        "rev-gf-9",
        "Complete the sentence.",
        "I __________ (already / finish) my homework, so I can go out now.",
        "have already finished",
        ["'ve already finished"],
        "Present Perfect with 'already' for completed actions."
      ),
      placeholderGapItem(
        "rev-gf-10",
        "Complete the sentence.",
        "I promise I __________ (not / be) late for the meeting.",
        "won't be",
        ["will not be"],
        "Use 'won't' for a future promise."
      ),
    ],
  },
  {
    id: "arrangements-vs-plans-a2-b1",
    title: "Arrangements or Intentions?",
    shortDescription: "Decide between the Present Continuous and 'be going to'.",
    levels: ["a2", "b1"],
    intro:
      "Is it a fixed arrangement in your diary, or just a general plan? Use the Present Continuous for fixed appointments and 'be going to' for intentions.",
    items: [
      multipleChoiceItem(
        "fut-mc-1",
        "Which is more natural for a fixed appointment?",
        "I ____ the manager at 10:00 AM in her office.",
        ["am meeting", "going to meet", "meet"],
        0,
        "Present Continuous is best for fixed arrangements with a specific time and place."
      ),
      multipleChoiceItem(
        "fut-mc-2",
        "Which is more natural for a general goal?",
        "One day, I ____ my own business, but I need to save money first.",
        ["am starting", "am going to start", "start"],
        1,
        "Use 'be going to' for an intention or a goal that doesn't have a fixed date yet."
      ),
      multipleChoiceItem(
        "fut-mc-3",
        "Which is more natural for travel arrangements?",
        "We ____ from Heathrow Airport at 6:00 AM on Tuesday.",
        ["are flying", "are going to fly", "fly"],
        0,
        "For travel with a specific time and location, we almost always use the Present Continuous."
      ),
      errorCorrectionItem(
        "fut-ec-1",
        "Check the highlighted phrase.",
        "I'm going to see the doctor tomorrow at 3:30.",
        "going to see",
        true,
        "",
        "Correct! 'Going to see' is perfectly possible here. 'I'm seeing the doctor tomorrow at 3:30' is also very natural because it sounds more like a fixed appointment."
      ),
      errorCorrectionItem(
        "fut-ec-2",
        "Check the highlighted phrase.",
        "We are having a big party next Saturday; I've already sent the invites.",
        "are having",
        true,
        "",
        "Correct! Because the invites are sent, this is a fixed arrangement."
      ),
      errorCorrectionItem(
        "fut-ec-3",
        "Check the highlighted phrase.",
        "I am learning to play the guitar next year.",
        "am learning",
        false,
        "am going to learn",
        "Use 'be going to' for a new year's resolution or a general intention."
      ),
      placeholderGapItem(
        "fut-gf-1",
        "Complete the sentence.",
        "Fixed Arrangement: My sister __________ (get) married on June 12th.",
        "is getting",
        [],
        "A wedding is a very fixed arrangement!"
      ),
      placeholderGapItem(
        "fut-gf-2",
        "Complete the sentence.",
        "General Plan: I __________ (travel) around South America when I finish university.",
        "am going to travel",
        ["'m going to travel"],
        "This is a big plan for the future, but it's not a fixed arrangement yet."
      ),
      placeholderGapItem(
        "fut-gf-3",
        "Complete the sentence.",
        "Fixed Appointment: I __________ (see) the dentist after work today.",
        "am seeing",
        ["'m seeing"],
        "A specific appointment in the diary."
      ),
      placeholderGapItem(
        "fut-gf-4",
        "Complete the sentence.",
        "Decision: We've decided that we __________ (buy) a new car soon.",
        "are going to buy",
        ["'re going to buy"],
        "An intention/decision made before the moment of speaking."
      ),
      singleGap(
        "fut-rf-1",
        "Rewrite using the Present Continuous: 'I have a table booked at the Italian restaurant for 8:00 PM.'",
        ["I ", { gapId: "g1" }, " at the Italian restaurant tonight."],
        ["am having dinner", "am eating"],
        "Use the Present Continuous for a social arrangement that is already booked."
      ),
      singleGap(
        "fut-rf-2",
        "Rewrite using 'be going to': 'I intend to look for a better job.'",
        ["I ", { gapId: "g1" }, " for a better job."],
        ["am going to look"],
        "Turn the verb 'intend' into the 'be going to' structure."
      ),
    ],
  },
  {
    id: "pp-duration-9b-a2b1",
    title: "Present Perfect: For and Since",
    shortDescription: "Practice talking about how long you have done something.",
    levels: ["a2", "b1"],
    intro:
      "Use the Present Perfect with 'for' and 'since' to talk about actions that started in the past and are still true now. Use 'for' for a period of time and 'since' for the starting point.",
    items: [
      multipleChoiceItem(
        "dur-mc-1",
        "Choose the correct word for the period of time.",
        "We've had this sofa ____ ages.",
        ["for", "since", "from"],
        0,
        "Use 'for' with a period of time."
      ),
      multipleChoiceItem(
        "dur-mc-2",
        "Choose the correct word for the starting point.",
        "My uncle has worked nights ____ last November.",
        ["for", "since", "ago"],
        1,
        "Use 'since' with a specific point in time."
      ),
      multipleChoiceItem(
        "dur-mc-3",
        "Choose the correct question form.",
        "____ have you known Carla?",
        ["How many time", "How long", "Since when"],
        1,
        "Use 'How long...?' to ask about the duration of a state or action."
      ),
      errorCorrectionItem(
        "dur-ec-1",
        "Check the highlighted phrase for errors.",
        "My grandparents live in this village for forty years.",
        "live",
        false,
        "have lived / 've lived",
        "Don't use the present simple for things that started in the past and are still true. Use the present perfect."
      ),
      errorCorrectionItem(
        "dur-ec-2",
        "Check the highlighted phrase for errors.",
        "She's had that phone since two years.",
        "since two years",
        false,
        "for two years",
        "A number of years is a period of time, so you must use 'for'."
      ),
      errorCorrectionItem(
        "dur-ec-3",
        "Check the highlighted phrase for errors.",
        "I've loved jazz since I was at university.",
        "since I was",
        true,
        "",
        "Correct! You can use 'since' with a point-in-time clause in the past."
      ),
      doubleGap(
        "dur-gf-1",
        "Complete the sentence.",
        ["Nora started her new job in April. It is now December.\nNora ", { gapId: "g1" }, " (work) there ", { gapId: "g2" }, " eight months."],
        ["has worked", "'s worked"],
        ["for"],
        "Present perfect + 'for' + period of time."
      ),
      doubleGap(
        "dur-gf-2",
        "Complete the sentence.",
        ["You started learning English in Year 5, and you're still learning it now.\nI ", { gapId: "g1" }, " (study) English ", { gapId: "g2" }, " Year 5."],
        ["have studied", "'ve studied", "have been studying", "'ve been studying"],
        ["since"],
        "Use the present perfect with 'since' for the starting point."
      ),
      wordOrderItem(
        "dur-wo-1",
        "Unjumble the duration sentence.",
        ["for", "has", "my", "brother", "worked", "here", "years", "five"],
        "My brother has worked here for five years.",
        "Structure: Subject + has + past participle + for + period."
      ),
      wordOrderItem(
        "dur-wo-2",
        "Unjumble the question.",
        ["long", "known", "have", "how", "them", "you"],
        "How long have you known them?",
        "Structure: How long + have + subject + past participle."
      ),
      doubleGap(
        "dur-vis-1",
        "Look at the picture and complete the sentence.",
        ["She ", { gapId: "g1" }, " (work) at this company ", { gapId: "g2" }, "."],
        ["has worked", "'s worked"],
        ["since January"],
        "Use 'has' (3rd person) + 'since' for a specific month starting point.",
        {
          imageSrc: "/images/grammar/for-since/job.png",
          imageAlt: "A woman at a new desk with a caption showing January.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
      doubleGap(
        "dur-vis-2",
        "Look at the picture and complete the sentence.",
        ["They ", { gapId: "g1" }, " (be) best friends ", { gapId: "g2" }, "."],
        ["have been", "'ve been"],
        ["for eight years"],
        "Use 'have' (plural) + 'for' for a period of time.",
        {
          imageSrc: "/images/grammar/for-since/friends.png",
          imageAlt: "Two teenagers smiling together with a caption showing 8 years.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
      doubleGap(
        "dur-vis-3",
        "Look at the picture and complete the sentence.",
        ["We ", { gapId: "g1" }, " (live) in this house ", { gapId: "g2" }, "."],
        ["have lived", "'ve lived"],
        ["since 2012"],
        "Use 'since' for a specific year starting point.",
        {
          imageSrc: "/images/grammar/for-since/house.png",
          imageAlt: "A family standing outside their house with a caption showing 2012.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
      doubleGap(
        "dur-vis-4",
        "Look at the picture and complete the sentence.",
        ["He ", { gapId: "g1" }, " (play) the guitar ", { gapId: "g2" }, "."],
        ["has played", "'s played", "has been playing", "'s been playing"],
        ["for six months"],
        "Use 'has' + 'for' for a duration of months.",
        {
          imageSrc: "/images/grammar/for-since/guitar.png",
          imageAlt: "A man with a guitar and a caption showing 6 months.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
      doubleGap(
        "dur-vis-5",
        "Look at the picture and complete the sentence.",
        ["I ", { gapId: "g1" }, " (be) in hospital ", { gapId: "g2" }, "."],
        ["have been", "'ve been"],
        ["since Tuesday"],
        "Use 'since' for a specific day of the week.",
        {
          imageSrc: "/images/grammar/for-since/hospital.png",
          imageAlt: "A patient in bed with a caption showing Tuesday.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
      doubleGap(
        "dur-vis-6",
        "Look at the picture and complete the sentence.",
        ["She ", { gapId: "g1" }, " (have) her puppy ", { gapId: "g2" }, "."],
        ["has had", "'s had"],
        ["for three weeks"],
        "Don't forget the past participle of 'have' is 'had'. Pattern: has + had + for.",
        {
          imageSrc: "/images/grammar/for-since/puppy.png",
          imageAlt: "A girl holding a puppy with a caption showing 3 weeks.",
          imageCaption: "Use the picture and the time caption to complete the sentence.",
          imageMaxWidth: "420px",
        }
      ),
    ],
  },
  {
    id: "present-perfect-extended-a2b1",
    title: "Present Perfect: Adverbs & Form",
    shortDescription: "Complete practice for have/has and the adverbs just, already, and yet.",
    levels: ["a2", "b1"],
    intro:
      "Master the present perfect by practicing regular and irregular forms, alongside the three key time adverbs: just, already, and yet.",
    items: [
      placeholderGapItem(
        "pp-form-1",
        "Complete with the present perfect.",
        "I __________ (wash) the car. It looks much better now.",
        "have washed",
        ["'ve washed"],
        "Regular verb: add -ed."
      ),
      placeholderGapItem(
        "pp-form-2",
        "Complete with the present perfect.",
        "She __________ (buy) a new pair of trainers for the gym.",
        "has bought",
        ["'s bought"],
        "Irregular verb: buy -> bought."
      ),
      placeholderGapItem(
        "pp-form-3",
        "Complete with the present perfect.",
        "They __________ (not / see) the new exhibition at the gallery.",
        "haven't seen",
        ["have not seen"],
        "Negative form: haven't + irregular past participle."
      ),
      placeholderGapItem(
        "pp-form-4",
        "Complete with the present perfect.",
        "__________ (you / finish) that report for the meeting?",
        "Have you finished",
        [],
        "Question form: Have + subject + past participle."
      ),
      placeholderGapItem(
        "pp-form-5",
        "Complete with the present perfect.",
        "We __________ (not / start) the film. You're just in time!",
        "haven't started",
        ["have not started"],
        "Negative form with a regular verb."
      ),
      placeholderGapItem(
        "pp-form-6",
        "Complete with the present perfect.",
        "__________ (he / send) the photos of the wedding to everyone?",
        "Has he sent",
        [],
        "Question form with an irregular verb: send -> sent."
      ),
      multipleChoiceItem(
        "pp-adv-1",
        "Choose the best adverb.",
        "I'm not hungry, thank you. I've ____ had a large lunch.",
        ["yet", "just", "already"],
        1,
        "Use 'just' for an action that happened very recently."
      ),
      multipleChoiceItem(
        "pp-adv-2",
        "Choose the best adverb.",
        "Have you spoken to the manager about your holiday ____?",
        ["yet", "just", "already"],
        0,
        "Use 'yet' at the end of questions."
      ),
      multipleChoiceItem(
        "pp-adv-3",
        "Choose the best adverb.",
        "Don't worry about the bins. I've ____ taken them out.",
        ["yet", "just", "already"],
        2,
        "Use 'already' for something that happened earlier than expected."
      ),
      multipleChoiceItem(
        "pp-adv-4",
        "Choose the best adverb.",
        "We haven't received the confirmation email ____.",
        ["yet", "just", "already"],
        0,
        "Use 'yet' at the end of negative sentences."
      ),
      multipleChoiceItem(
        "pp-adv-5",
        "Choose the best adverb.",
        "Is the news on? No, sorry, it has ____ finished.",
        ["yet", "just", "already"],
        1,
        "Use 'just' to indicate the news finished a moment ago."
      ),
      multipleChoiceItem(
        "pp-adv-6",
        "Choose the best adverb.",
        "I don't need to read that book. I've ____ read it twice.",
        ["yet", "just", "already"],
        2,
        "Use 'already' to show the action was completed in the past."
      ),
      singleGap(
        "pp-rf-1",
        "Rewrite using 'just': 'He finished the phone call a few seconds ago.'",
        ["He ", { gapId: "g1" }, " the phone call."],
        ["has just finished", "'s just finished"],
        "Position 'just' between the auxiliary and the main verb."
      ),
      singleGap(
        "pp-rf-2",
        "Rewrite using 'yet': 'Is the cake ready? (ask as a question)'",
        ["Have ", { gapId: "g1" }, "?"],
        ["you finished the cake yet", "you made the cake yet"],
        "Add 'yet' to the end of the question."
      ),
      singleGap(
        "pp-rf-3",
        "Rewrite using 'already': 'I tidied the kitchen earlier than planned.'",
        ["I ", { gapId: "g1" }, " the kitchen."],
        ["have already tidied", "'ve already tidied"],
        "Position 'already' before the past participle."
      ),
      singleGap(
        "pp-rf-4",
        "Rewrite using 'yet': 'I am still waiting for the bus to arrive.'",
        ["The bus ", { gapId: "g1" }, "."],
        ["hasn't arrived yet", "has not arrived yet"],
        "Use a negative present perfect with 'yet' for expected actions."
      ),
      singleGap(
        "pp-rf-5",
        "Rewrite using 'just': 'The postman delivered the mail a moment ago.'",
        ["The postman ", { gapId: "g1" }, " the mail."],
        ["has just delivered", "'s just delivered"],
        "Use 'just' to describe a very recent event."
      ),
      singleGap(
        "pp-rf-6",
        "Rewrite using 'yet': 'Are you still doing your homework?'",
        ["Have ", { gapId: "g1" }, "?"],
        ["you finished your homework yet"],
        "Change the continuous question into a present perfect 'yet' question."
      ),
    ],
  },
  {
    id: "present-perfect-vs-past-simple-a2b1",
    title: "Present Perfect or Past Simple?",
    shortDescription: "Master the difference between finished past actions and life experiences.",
    levels: ["a2", "b1"],
    intro:
      "Use the Past Simple for finished actions with a specific time. Use the Present Perfect for life experiences or recent news where the time isn't mentioned.",
    items: [
      multipleChoiceItem(
        "ppvsps-mc-1",
        "Choose the correct verb form.",
        "I ____ Thai food lots of times, but I still can't cook it.",
        ["have eaten", "ate", "was eating"],
        0,
        "Use Present Perfect for life experiences when we don't say exactly when."
      ),
      multipleChoiceItem(
        "ppvsps-mc-2",
        "Choose the correct verb form.",
        "We ____ to Lisbon for the first time in 2022.",
        ["have gone", "went", "have been"],
        1,
        "Use Past Simple because 'in 2022' is a finished time."
      ),
      multipleChoiceItem(
        "ppvsps-mc-3",
        "Choose the correct verb form.",
        "Oh no! I ____ my glasses. I can't read anything now.",
        ["have lost", "lost", "lose"],
        0,
        "Use Present Perfect for recent news that has a result in the present."
      ),
      multipleChoiceItem(
        "ppvsps-mc-4",
        "Choose the correct verb form.",
        "I ____ my glasses on the train yesterday morning.",
        ["have lost", "lost", "had lost"],
        1,
        "Use Past Simple because 'yesterday' is a finished time."
      ),
      multipleChoiceItem(
        "ppvsps-mc-5",
        "Choose the correct verb form.",
        "Oh no! We ____ the tickets. We can't get into the stadium!",
        ["lost", "have lost", "were losing"],
        1,
        "Use the Present Perfect for a recent action that has a direct result in the present (I can't get in)."
      ),
      multipleChoiceItem(
        "ppvsps-mc-6",
        "Choose the correct verb form.",
        "My cousins ____ to a street-food market on Friday night.",
        ["went", "have gone", "have been"],
        0,
        "Use the Past Simple because 'on Friday night' is a finished time."
      ),
      errorCorrectionItem(
        "ppvsps-ec-1",
        "Check the highlighted phrase for errors.",
        "I have met your brother last weekend.",
        "have met",
        false,
        "met",
        "You cannot use the Present Perfect with a finished time like 'last weekend'."
      ),
      errorCorrectionItem(
        "ppvsps-ec-2",
        "Check the highlighted phrase for errors.",
        "Have you ever flown in a helicopter?",
        "Have you ever flown",
        true,
        "",
        "Correct! Use Present Perfect to ask about general life experiences."
      ),
      errorCorrectionItem(
        "ppvsps-ec-3",
        "Check the highlighted phrase for errors.",
        "She has changed schools two years ago.",
        "has changed",
        false,
        "changed",
        "The word 'ago' always requires the Past Simple."
      ),
      errorCorrectionItem(
        "ppvsps-ec-4",
        "Check the highlighted phrase for errors.",
        "They have emailed us an hour ago.",
        "have emailed",
        false,
        "emailed",
        "You cannot use the Present Perfect with 'ago'. Use the Past Simple instead."
      ),
      errorCorrectionItem(
        "ppvsps-ec-5",
        "Check the highlighted phrase for errors.",
        "He has broken his wrist in 2021.",
        "has broken",
        false,
        "broke",
        "Use the Past Simple with a finished time expression like 'in 2019'."
      ),
      errorCorrectionItem(
        "ppvsps-ec-6",
        "Check the highlighted phrase for errors.",
        "She has travelled to many different countries in her life.",
        "has travelled",
        true,
        "",
        "Correct! Use the Present Perfect to describe experiences throughout someone's life up to now."
      ),
      placeholderChoiceGapItem(
        "bg-1",
        "Choose been or gone.",
        "He isn't here at the moment. He has ____ to the shops.",
        ["gone"],
        "Use 'gone' because he is still at the shops (he hasn't returned).",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-2",
        "Choose been or gone.",
        "I've ____ to the shops, so the fridge is full now.",
        ["been"],
        "Use 'been' because the speaker has returned from the shops.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-3",
        "Choose been or gone.",
        "Have you ever ____ to Mexico?",
        ["been"],
        "Use 'been' when asking about a completed trip in someone's life.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-4",
        "Choose been or gone.",
        "My parents are on holiday. They've ____ to Portugal for two weeks.",
        ["gone"],
        "They are currently in Portugal, so use 'gone'.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-5",
        "Choose been or gone.",
        "I'm exhausted! I've ____ to the gym every day this week.",
        ["been"],
        "The speaker is currently 'here' (exhausted), so the trips are complete.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-6",
        "Choose been or gone.",
        "Where is Sarah? She's ____ to lunch with her manager.",
        ["gone"],
        "She is still at lunch, so use 'gone'.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-7",
        "Choose been or gone.",
        "The house is very quiet because everyone has ____ to the cinema.",
        ["gone"],
        "They are at the cinema now, so use 'gone'.",
        ["been", "gone"]
      ),
      placeholderChoiceGapItem(
        "bg-8",
        "Choose been or gone.",
        "I've ____ to the cinema twice this month.",
        ["been"],
        "The speaker is telling you about their experience, not currently at the cinema.",
        ["been", "gone"]
      ),
      placeholderGapItem(
        "ppvsps-gf-1",
        "Complete with the correct tense.",
        "A: Have you seen my keys? \nB: Yes, I __________ (see) them on the table five minutes ago.",
        "saw",
        [],
        "The second sentence mentions a specific time (five minutes ago)."
      ),
      placeholderGapItem(
        "ppvsps-gf-2",
        "Complete with the correct tense.",
        "My sister is a famous writer. She __________ (write) over twenty books.",
        "has written",
        ["'s written"],
        "This is an ongoing experience/achievement in her life."
      ),
      placeholderGapItem(
        "ppvsps-gf-3",
        "Complete with the correct tense.",
        "I __________ (not / go) to work yesterday because I was ill.",
        "didn't go",
        ["did not go"],
        "Use Past Simple for 'yesterday'."
      ),
      placeholderGapItem(
        "ppvsps-gf-4",
        "Complete with the correct tense.",
        "__________ (you / ever / try) skydiving?",
        "Have you ever tried",
        [],
        "A question about a life experience."
      ),
      placeholderGapItem(
        "ppvsps-gf-5",
        "Complete with the correct tense.",
        "We __________ (arrive) at the airport very late last night.",
        "arrived",
        [],
        "Use Past Simple for 'last night'."
      ),
      placeholderGapItem(
        "ppvsps-gf-6",
        "Complete with the correct tense.",
        "I __________ (never / visit) London, but I'd like to go next year.",
        "have never visited",
        ["'ve never visited"],
        "A statement about a life experience using 'never'."
      ),
    ],
  },
  {
    id: "indefinite-pronouns-logic",
    title: "Something, Anything, Nothing",
    shortDescription: "Master the use of someone, anywhere, nothing, and more.",
    levels: ["a2", "b1"],
    intro:
      "Use 'some-' for positive sentences, 'any-' for questions and negatives, and 'no-' for negative meanings with a positive verb. Practice choosing the right compound for people, things, and places.",
    items: [
      multipleChoiceItem(
        "ind-mc-1",
        "Choose the correct option.",
        "I'm bored. I have ____ to do today.",
        ["something", "anything", "nothing"],
        2,
        "Use 'nothing' with a positive verb to give a negative meaning."
      ),
      multipleChoiceItem(
        "ind-mc-2",
        "Choose the correct option.",
        "I didn't see ____ I liked in the department store.",
        ["anything", "nothing", "something"],
        0,
        "Use 'any-' compounds in negative sentences."
      ),
      multipleChoiceItem(
        "ind-mc-3",
        "Choose the correct option.",
        "Wait! I think I've forgotten ____, but I can't remember what.",
        ["anything", "nothing", "something"],
        2,
        "Use 'something' in positive statements."
      ),
      multipleChoiceItem(
        "ind-mc-4",
        "Choose the correct option.",
        "Is there ____ at home right now?",
        ["anybody", "nobody", "somebody"],
        0,
        "Use 'anybody' (or 'anyone') for questions about people."
      ),
      multipleChoiceItem(
        "ind-mc-5",
        "Choose the correct option (Nuance).",
        "I'm so hungry I could eat ____!",
        ["anything", "something", "nothing"],
        0,
        "In positive sentences, 'anything' means 'it doesn't matter what'."
      ),
      multipleChoiceItem(
        "ind-mc-6",
        "Choose the correct option.",
        "Let's go ____ hot for our holiday this year.",
        ["anywhere", "nowhere", "somewhere"],
        2,
        "Use 'somewhere' for positive suggestions about places."
      ),
      errorCorrectionItem(
        "ind-ec-1",
        "Check the highlighted phrase for errors.",
        "I didn't talk to nobody at the party.",
        "didn't talk to nobody",
        false,
        "didn't talk to anybody",
        "Avoid double negatives. Use 'anybody' with negative verbs like 'didn't'."
      ),
      errorCorrectionItem(
        "ind-ec-2",
        "Check the highlighted phrase for errors.",
        "Somebody has left their umbrella in the hallway.",
        "Somebody",
        true,
        "",
        "Correct! Use 'somebody' when you don't know exactly who did something."
      ),
      errorCorrectionItem(
        "ind-ec-3",
        "Check the highlighted phrase for errors.",
        "There's anywhere to park near the city centre.",
        "anywhere",
        false,
        "nowhere",
        "Use 'nowhere' with a positive verb to show that a place does not exist."
      ),
      errorCorrectionItem(
        "ind-ec-4",
        "Check the highlighted phrase for errors.",
        "Do you want anything to drink?",
        "anything",
        true,
        "",
        "Correct! 'Anything' is fine in questions. In offers, 'something' is also very common, but this sentence is acceptable as it is."
      ),
      errorCorrectionItem(
        "ind-ec-5",
        "Check the highlighted phrase for errors.",
        "I looked for my keys, but I found anything.",
        "found anything",
        false,
        ["found nothing", "didn't find anything"],
        "Both 'found nothing' and 'didn't find anything' are correct. Avoid 'found anything' in this positive statement."
      ),
      errorCorrectionItem(
        "ind-ec-6",
        "Check the highlighted phrase for errors.",
        "Anyone can come to the club; it's open to everyone.",
        "Anyone",
        true,
        "",
        "Correct! 'Anyone' in a positive sentence means 'it doesn't matter who'."
      ),
      placeholderGapItem(
        "ind-gf-1",
        "Complete with the correct indefinite pronoun.",
        "I'm looking for my glasses. Has __________ seen them? (people / ?)",
        "anybody",
        ["anyone"],
        "Use 'any-' for questions about people."
      ),
      placeholderGapItem(
        "ind-gf-2",
        "Complete with the correct indefinite pronoun.",
        "The room was completely empty. There was __________ there. (people / -)",
        "nobody",
        ["no one"],
        "Use 'no-' with a positive verb to show zero quantity."
      ),
      placeholderGapItem(
        "ind-gf-3",
        "Complete with the correct indefinite pronoun.",
        "I'm really thirsty. I need __________ to drink. (thing / +)",
        "something",
        [],
        "Use 'some-' for positive statements about things."
      ),
      placeholderGapItem(
        "ind-gf-4",
        "Complete with the correct indefinite pronoun.",
        "I've looked __________, but I still can't find my wallet. (place / all)",
        "everywhere",
        [],
        "Use 'everywhere' to mean all places."
      ),
      placeholderGapItem(
        "ind-gf-5",
        "Complete with the correct indefinite pronoun.",
        "You don't need a reservation. You can sit __________ you like. (place / no matter)",
        "anywhere",
        [],
        "Use 'anywhere' in a positive sentence to mean 'it doesn't matter where'."
      ),
      placeholderGapItem(
        "ind-gf-6",
        "Complete with the correct indefinite pronoun.",
        "I'm sorry, I can't help you. I know __________ about fixing cars. (thing / -)",
        "nothing",
        [],
        "Use 'nothing' for zero quantity with a positive verb."
      ),
      wordOrderItem(
        "ind-wo-1",
        "Unjumble the sentence.",
        ["anybody", "didn't", "I", "know", "the", "at", "party"],
        "I didn't know anybody at the party.",
        "Subject + negative verb + indefinite pronoun + place."
      ),
      wordOrderItem(
        "ind-wo-2",
        "Unjumble the sentence.",
        ["nothing", "is", "fridge", "the", "in", "there"],
        "There is nothing in the fridge.",
        "There + be + indefinite pronoun + location."
      ),
      wordOrderItem(
        "ind-wo-3",
        "Unjumble the question.",
        ["you", "anywhere", "did", "weekend", "go", "this"],
        "Did you go anywhere this weekend?",
        "Auxiliary + Subject + Verb + Indefinite Pronoun + Time."
      ),
    ],
  },
  {
    id: "articles-advanced-mastery",
    title: "Articles: Geography, Institutions & Nuance",
    shortDescription: "Master the use of 'the', 'a/an', and the 'zero article' in complex contexts.",
    levels: ["b2"],
    intro:
      "At B2, articles are about more than just 'a' or 'the'. You need to know when an institution becomes a building, which mountains need an article, and why we don't 'go to the bed'.",
    items: [
      multipleChoiceItem(
        "arta-mc-1",
        "Choose the correct option.",
        "____ usually have a better understanding of digital privacy than their parents.",
        ["The teenagers", "Teenagers", "A teenager"],
        1,
        "Do not use an article when speaking in general about plural or uncountable nouns."
      ),
      multipleChoiceItem(
        "arta-mc-2",
        "Choose the correct option.",
        "After the accident, he had to stay ____ for three weeks.",
        ["in hospital", "in the hospital", "at the hospital"],
        0,
        "Use no article with institutions like 'hospital' when referring to their primary purpose. Here, he is there as a patient."
      ),
      multipleChoiceItem(
        "arta-mc-3",
        "Choose the correct option.",
        "We spent our summer hiking in ____, which was an incredible experience.",
        ["the Alps", "Alps", "the Mount Alps"],
        0,
        "Use 'the' with mountain ranges, but not with individual mountains."
      ),
      multipleChoiceItem(
        "arta-mc-4",
        "Choose the correct option.",
        "____ is a beautiful city, but it can be quite expensive in the summer.",
        ["The Prague", "Prague", "A Prague"],
        1,
        "Do not use 'the' with the names of most cities, countries, or continents."
      ),
      multipleChoiceItem(
        "arta-mc-5",
        "Choose the correct option.",
        "The cruise ship traveled through ____ to reach the Mediterranean.",
        ["Suez Canal", "the Suez Canal", "a Suez Canal"],
        1,
        "Always use 'the' with the names of canals, rivers, seas, and oceans."
      ),
      multipleChoiceItem(
        "arta-mc-6",
        "Choose the correct option.",
        "I’m meeting a friend for lunch on ____ tomorrow.",
        ["the Regent Street", "Regent Street", "a Regent Street"],
        1,
        "Do not use 'the' with the names of most roads, streets, or parks."
      ),
      multipleChoiceItem(
        "arta-mc-7",
        "Choose the correct option.",
        "They are planning to build ____ new university on the outskirts of the city.",
        ["a", "an", "the"],
        0,
        "Use 'a' for a non-specific building being mentioned for the first time. Note: 'university' starts with a consonant sound (/j/), so we use 'a'."
      ),
      multipleChoiceItem(
        "arta-mc-8",
        "Choose the correct option.",
        "It was ____ honor to be invited to the international gala.",
        ["a", "an", "the"],
        1,
        "Use 'an' because 'honor' starts with a silent 'h', creating a vowel sound (/ˈɒn.ər/)."
      ),
      errorCorrectionItem(
        "arta-ec-1",
        "Check the highlighted phrase for errors.",
        "The classical music has a very relaxing effect on me.",
        "The classical music",
        false,
        "Classical music",
        "Do not use an article for abstract concepts or types of music when speaking generally."
      ),
      errorCorrectionItem(
        "arta-ec-2",
        "Check the highlighted phrase for errors.",
        "He went to the prison to visit his brother who works there.",
        "to the prison",
        true,
        "",
        "Correct! Use 'the' when you are thinking about the building/location rather than the primary purpose (being a prisoner)."
      ),
      errorCorrectionItem(
        "arta-ec-3",
        "Check the highlighted phrase for errors.",
        "We are planning a trip to the Lake Geneva next spring.",
        "the Lake Geneva",
        false,
        "Lake Geneva",
        "Do not use 'the' with individual lakes."
      ),
      errorCorrectionItem(
        "arta-ec-4",
        "Check the highlighted phrase for errors.",
        "I'll see you the next Monday at the office.",
        "the next Monday",
        false,
        "next Monday",
        "We don't use an article in phrases like 'next week', 'last night', or 'at home'."
      ),
      errorCorrectionItem(
        "arta-ec-5",
        "Check the highlighted phrase for errors.",
        "The British Museum is one of the most famous in the world.",
        "The British Museum",
        true,
        "",
        "Correct! We normally use 'the' with the names of museums, galleries, and hotels."
      ),
      errorCorrectionItem(
        "arta-ec-6",
        "Check the highlighted phrase for errors.",
        "She moved to United Kingdom to finish her degree.",
        "United Kingdom",
        false,
        "the United Kingdom",
        "While most countries have no article, names including 'Kingdom', 'Republic', or 'States' require 'the'."
      ),
      errorCorrectionItem(
        "arta-ec-7",
        "Check the highlighted phrase for errors.",
        "He has been working as the architect for over twenty years.",
        "the architect",
        false,
        "an architect",
        "Use 'a/an' when saying what someone's job is."
      ),
      errorCorrectionItem(
        "arta-ec-8",
        "Check the highlighted phrase for errors.",
        "Everyone in the department has to wear an uniform.",
        "an uniform",
        false,
        "a uniform",
        "Although it starts with a vowel letter, 'uniform' is pronounced with a consonant /j/ sound at the start, so it requires 'a'."
      ),
      placeholderChoiceGapItem(
        "arta-gf-1",
        "Choose the correct article.",
        "____ Sahara Desert covers a large part of North Africa.",
        ["the"],
        "Use 'the' with the names of deserts.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-2",
        "Choose the correct article.",
        "It was ____ incredibly difficult decision to make at the time.",
        ["an"],
        "Use 'an' before an adjective starting with a vowel sound.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-3",
        "Choose the correct article.",
        "I usually go to ____ bed around 11:00 PM.",
        ["—"],
        "In the phrase 'go to bed', we do not use an article.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-4",
        "Choose the correct article.",
        "My daughter starts ____ university in September.",
        ["—"],
        "Use no article when referring to the institution for its primary purpose.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-5",
        "Choose the correct article.",
        "We stayed in ____ small hotel near the station on our first night.",
        ["a"],
        "Use 'a' for a singular countable noun being mentioned for the first time.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-6",
        "Choose the correct article.",
        "____ Philippines is a country made up of thousands of islands.",
        ["the"],
        "Use 'the' with island groups (archipelagos).",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-7",
        "Choose the correct article.",
        "We had a lovely walk through ____ Hyde Park yesterday.",
        ["—"],
        "Most names of parks do not require an article.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-8",
        "Choose the correct article.",
        "____ Danube is the second-longest river in Europe.",
        ["the"],
        "Always use 'the' with the names of rivers.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-9",
        "Choose the correct article.",
        "It took us ____ hour to get to the airport in the end.",
        ["an"],
        "Use 'an' because 'hour' begins with a vowel sound; the 'h' is silent.",
        ["a", "an", "the", "—"]
      ),
      placeholderChoiceGapItem(
        "arta-gf-10",
        "Choose the correct article.",
        "They are staying at ____ Hilton Hotel for the conference.",
        ["the"],
        "Use 'the' with the names of hotels.",
        ["a", "an", "the", "—"]
      ),
    ],
  },
  {
    id: "b2-conditionals-and-time-clauses",
    title: "Logic of the Future: Conditionals & Time Clauses",
    shortDescription: "Advanced practice with if, unless, in case, and future deadlines.",
    levels: ["b2"],
    intro:
      "Can you navigate the present-tense rule after future linkers? Test your ability to link conditions and consequences without falling for the 'will' trap.",
    items: [
      multipleChoiceItem(
        "ct-mc-1",
        "Choose the most natural future form.",
        "If the software ____ updated by tomorrow, the system might crash.",
        ["isn't being", "won't be", "hasn't been"],
        2,
        "We use the present perfect in the 'if' clause to show a condition that must be completed first."
      ),
      multipleChoiceItem(
        "ct-mc-2",
        "Choose the most natural future form.",
        "I'll buy some extra snacks ____ our guests are hungrier than expected.",
        ["if", "unless", "in case"],
        2,
        "Use 'in case' for a precaution taken now to prepare for a possible future situation."
      ),
      multipleChoiceItem(
        "ct-mc-3",
        "Choose the most natural future form.",
        "We'll have collected all the data ____ the meeting starts at 3:00.",
        ["until", "by the time", "as soon as"],
        1,
        "Use 'by the time' to indicate a deadline for a completed future result."
      ),
      multipleChoiceItem(
        "ct-mc-4",
        "Choose the most natural future form.",
        "If they ____ currently working on a solution, we shouldn't interrupt them.",
        ["are", "will be", "have been"],
        0,
        "Zero conditional: use present continuous for an ongoing state that leads to a general result."
      ),
      multipleChoiceItem(
        "ct-mc-5",
        "Choose the most natural future form.",
        "I’m not signing the contract ____ my lawyer has checked the small print.",
        ["when", "until", "after"],
        1,
        "Use 'until' to show an action is delayed up to a specific point of completion."
      ),
      multipleChoiceItem(
        "ct-mc-6",
        "Choose the most natural future form.",
        "____ you've finished the report, take the rest of the afternoon off.",
        ["Unless", "As soon as", "In case"],
        1,
        "Use 'as soon as' + present perfect to give an imperative based on a finished action."
      ),
      multipleChoiceItem(
        "ct-mc-7",
        "Choose the most natural future form.",
        "The battery ____ lasts if you leave the screen brightness on its highest setting.",
        ["never", "will never", "doesn't usually"],
        0,
        "Zero conditional for general truths often uses frequency adverbs like 'never' or 'usually' with the present simple."
      ),
      multipleChoiceItem(
        "ct-mc-8",
        "Choose the most natural future form.",
        "I'll call you ____ I see anything suspicious.",
        ["in case", "if", "unless"],
        1,
        "Use 'if' because the phone call only happens if the condition is actually met."
      ),
      multipleChoiceItem(
        "ct-mc-9",
        "Choose the most natural future form.",
        "You'll be exhausted tomorrow ____ you get some sleep now.",
        ["if", "in case", "unless"],
        2,
        "Use 'unless' to mean 'except if' or 'if... not'."
      ),
      errorCorrectionItem(
        "ct-ec-1",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "If you will be visiting the city next month, I'll show you around.",
        "will be visiting",
        false,
        ["are visiting", "visit"],
        "After 'if', use a present tense for future meaning. Present continuous works for an arrangement; present simple also works here."
      ),
      errorCorrectionItem(
        "ct-ec-2",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "Don't worry, the taxi will be waiting in case the train is late.",
        "is",
        true,
        "",
        "Correct! We use the present simple after 'in case' for a possible future problem."
      ),
      errorCorrectionItem(
        "ct-ec-3",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "We'll stay here until it stops raining.",
        "stops",
        true,
        "",
        "Correct! Use the present simple after 'until' to talk about the future."
      ),
      errorCorrectionItem(
        "ct-ec-4",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "Unless the weather will improve, we'll have to cancel the match.",
        "will improve",
        false,
        "improves",
        "After 'unless', use the present simple to describe a future condition."
      ),
      errorCorrectionItem(
        "ct-ec-5",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "As soon as I've found my keys, I'll meet you at the car.",
        "I've found",
        true,
        "",
        "Correct! The present perfect shows that the first action must be finished first."
      ),
      errorCorrectionItem(
        "ct-ec-6",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "If people are often stressed, they won't sleep well.",
        "are often stressed",
        true,
        "",
        "Correct! This is a zero conditional describing a general result of a state."
      ),
      errorCorrectionItem(
        "ct-ec-7",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "I'll give you a lift when I'll finish work.",
        "I'll finish",
        false,
        "I finish",
        "Use the present simple after 'when' to refer to a future time."
      ),
      errorCorrectionItem(
        "ct-ec-8",
        "Check the tense: Does it follow the 'Present for Future' rule?",
        "In case you won't hear me, I'll send you a text as well.",
        "won't hear",
        false,
        "don't hear",
        "After 'in case', we use a present tense to talk about a potential future problem."
      ),
      placeholderGapItem(
        "ct-slot-1",
        "Choose the best linker: (unless / in case / if)",
        "Pack an extra power bank __________ your phone battery dies during the hike.",
        "in case",
        [],
        "You pack the bank now as a precaution, regardless of whether the battery actually dies."
      ),
      placeholderGapItem(
        "ct-slot-2",
        "Choose the best linker: (until / as soon as / when)",
        "We can't start the presentation __________ everyone has arrived.",
        "until",
        [],
        "The delay continues up to the specific point of arrival."
      ),
      placeholderGapItem(
        "ct-slot-3",
        "Choose the best linker: (before / after / unless)",
        "Please back up all your files __________ you turn off your computer.",
        "before",
        [],
        "This describes the necessary sequence of actions."
      ),
      placeholderGapItem(
        "ct-slot-4",
        "Choose the best linker: (if / in case / unless)",
        "The alarm goes off __________ anyone tries to open this window.",
        "if",
        ["whenever"],
        "A zero conditional describing a direct cause and effect."
      ),
      placeholderGapItem(
        "ct-slot-5",
        "Choose the best linker: (as soon as / unless / in case)",
        "I'll send you the link __________ I get back to my desk.",
        "as soon as",
        ["when"],
        "This shows the action will happen immediately after the first one is complete."
      ),
      placeholderGapItem(
        "ct-slot-6",
        "Choose the best linker: (unless / until / if)",
        "Don't click 'subscribe' __________ you've read the terms and conditions.",
        "unless",
        ["until"],
        "Both linkers work here to show a necessary condition or a time limit."
      ),
      placeholderGapItem(
        "ct-slot-7",
        "Choose the best linker: (after / in case / when)",
        "I'll keep the receipt __________ the jacket doesn't fit and I need to return it.",
        "in case",
        [],
        "Keeping the receipt is a precaution for a possible future problem."
      ),
      placeholderGapItem(
        "ct-slot-8",
        "Choose the best linker: (once / until / unless)",
        "__________ you've tried the new version, you won't want to go back to the old one.",
        "Once",
        ["As soon as", "When"],
        "This indicates that after the experience is complete, the result is certain."
      ),
    ],
  },
  {
    id: "contrast-and-purpose",
    title: "Contrast and Purpose",
    shortDescription:
      "Practise contrast linkers and purpose structures through multiple choice, error correction, and reformulation.",
    levels: ["b2"],
    intro:
      "Work on despite, although, in spite of, to, for, so that, and negative purpose forms in a mixed mini test.",
    items: [
      multipleChoiceItem(
        "da-mc-1",
        "Choose the correct option.",
        "__________ the rain, we still went for a walk.",
        ["Despite", "Although"],
        0,
        "Use 'despite' before a noun phrase: 'despite the rain'."
      ),
      multipleChoiceItem(
        "da-mc-2",
        "Choose the correct option.",
        "__________ she was feeling ill, she went to work.",
        ["Despite", "Although"],
        1,
        "Use 'although' before a full clause: 'although she was feeling ill'."
      ),
      multipleChoiceItem(
        "da-mc-3",
        "Choose the correct option.",
        "__________ being very tired, he finished the report.",
        ["Despite", "Although"],
        0,
        "Use 'despite' before a gerund: 'despite being very tired'."
      ),
      multipleChoiceItem(
        "da-mc-4",
        "Choose the correct option.",
        "__________ the hotel was expensive, we decided to stay there.",
        ["Despite", "Although"],
        1,
        "Use 'although' before a clause with subject + verb."
      ),
      multipleChoiceItem(
        "da-mc-5",
        "Choose the correct option.",
        "__________ the fact that it was late, nobody wanted to go home.",
        ["Despite", "Although"],
        0,
        "Use 'despite the fact that...' as a fixed expression."
      ),
      multipleChoiceItem(
        "da-mc-6",
        "Choose the correct option.",
        "__________ I don't usually like horror films, I enjoyed this one.",
        ["Despite", "Although"],
        1,
        "Use 'although' before a full clause."
      ),
      multipleChoiceItem(
        "pc-mc-1",
        "Choose the correct option.",
        "I left home early ____ catch the first train.",
        ["to", "for", "so that"],
        0,
        "Use 'to' + infinitive to express purpose when the subject stays the same."
      ),
      multipleChoiceItem(
        "pc-mc-2",
        "Choose the correct option.",
        "She wrote the instructions down ____ she wouldn't forget them.",
        ["to", "for", "so that"],
        2,
        "Use 'so that' when there is a subject + modal verb in the purpose clause."
      ),
      multipleChoiceItem(
        "pc-mc-3",
        "Choose the correct option.",
        "We stopped at a cafe ____ a quick coffee before the meeting.",
        ["for", "to", "so as"],
        0,
        "Use 'for' before a noun phrase: 'for a quick coffee'."
      ),
      multipleChoiceItem(
        "pc-mc-4",
        "Choose the correct option.",
        "He turned the TV down ____ wake the baby.",
        ["so that", "in order not to", "for"],
        1,
        "Use 'in order not to' + infinitive for negative purpose."
      ),
      multipleChoiceItem(
        "pc-mc-5",
        "Choose the correct option.",
        "I'm saving money ____ buy a new laptop this summer.",
        ["for", "to", "so that"],
        1,
        "Use 'to' + infinitive to express purpose."
      ),
      multipleChoiceItem(
        "pc-mc-6",
        "Choose the correct option.",
        "They bought a bigger car ____ the children would have more space.",
        ["to", "so that", "for"],
        1,
        "Use 'so that' when the purpose clause has a different subject."
      ),
      multipleChoiceItem(
        "pc-mc-7",
        "Choose the correct option.",
        "This brush is ____ cleaning bottles.",
        ["to", "for", "so that"],
        1,
        "Use 'for' + gerund to describe the purpose or function of an object."
      ),
      multipleChoiceItem(
        "pc-mc-8",
        "Choose the correct option.",
        "We used a map ____ get lost in the old town.",
        ["for not", "so as not to", "so that not"],
        1,
        "Use 'so as not to' + infinitive for negative purpose."
      ),
      errorCorrectionItem(
        "cp-ec-1",
        "Check the highlighted phrase for errors.",
        "Despite of the bad weather, we went hiking anyway.",
        "Despite of",
        false,
        ["Despite", "In spite of"],
        "Use 'despite' without 'of', or use 'in spite of': 'despite the bad weather' / 'in spite of the bad weather'."
      ),
      errorCorrectionItem(
        "cp-ec-2",
        "Check the highlighted phrase for errors.",
        "Although being very tired, she stayed up to finish the report.",
        "Although being",
        false,
        ["Despite being", "In spite of being", "Although she was"],
        "Use 'despite' / 'in spite of' before a noun or gerund, or change it to a full clause with 'although she was'."
      ),
      errorCorrectionItem(
        "cp-ec-3",
        "Check the highlighted phrase for errors.",
        "We left early so that avoid the traffic.",
        "so that avoid",
        false,
        ["to avoid", "in order to avoid", "so as to avoid"],
        "Use 'to' / 'in order to' / 'so as to' + infinitive when the subject stays the same. 'So that' needs a subject and verb."
      ),
      errorCorrectionItem(
        "cp-ec-4",
        "Check the highlighted phrase for errors.",
        "I wrote her address down in order not forgetting it.",
        "in order not forgetting",
        false,
        "in order not to forget",
        "Use 'in order not to' + infinitive for negative purpose."
      ),
      errorCorrectionItem(
        "cp-ec-5",
        "Check the highlighted phrase for errors.",
        "In spite of the fact that he was nervous, he gave a very good presentation.",
        "In spite of the fact that",
        true,
        "",
        "This is correct. 'In spite of the fact that...' is a correct contrast structure."
      ),
      errorCorrectionItem(
        "cp-ec-6",
        "Check the highlighted phrase for errors.",
        "She took a notebook for write down the key points.",
        "for write down",
        false,
        "to write down",
        "Use 'to' + infinitive to express purpose. 'For' is followed by a noun or gerund, not an infinitive."
      ),
      errorCorrectionItem(
        "cp-ec-7",
        "Check the highlighted phrase for errors.",
        "He spoke quietly so as not to wake the baby.",
        "so as not to wake",
        true,
        "",
        "This is correct. 'So as not to' is a correct form for negative purpose."
      ),
      placeholderGapItem(
        "cp-rf-1",
        "Complete the second sentence so that it has a similar meaning.",
        "Although it was raining, we went for a walk.\nDespite __________, we went for a walk.",
        "the rain",
        [],
        "Use 'despite' before a noun phrase here. The target structure is 'despite the rain'.",
        { keyWord: "despite" }
      ),
      placeholderGapItem(
        "cp-rf-2",
        "Complete the second sentence so that it has a similar meaning.",
        "Despite being very tired, she finished the essay.\nAlthough __________, she finished the essay.",
        "she was very tired",
        [],
        "Use 'although' before a full clause with subject + verb.",
        { keyWord: "tired" }
      ),
      placeholderGapItem(
        "cp-rf-3",
        "Complete the second sentence so that it has a similar meaning.",
        "I'm leaving early so that I won't miss the bus.\nI'm leaving early __________ miss the bus.",
        "in order not to",
        ["so as not to"],
        "Use a negative purpose form: 'in order not to' or 'so as not to' + infinitive.",
        { keyWord: "to" }
      ),
      placeholderGapItem(
        "cp-rf-4",
        "Complete the second sentence so that it has a similar meaning.",
        "He went to the bank to get some cash.\nHe went to the bank __________ some cash.",
        "so as to get",
        [],
        "Use 'so as to' + infinitive to express purpose here.",
        { keyWord: "as" }
      ),
      placeholderGapItem(
        "cp-rf-5",
        "Complete the second sentence so that it has a similar meaning.",
        "She wore a coat because she didn't want to get cold.\nShe wore a coat __________ get cold.",
        "so as not to",
        ["in order not to"],
        "Use a negative purpose form such as 'so as not to' or 'in order not to' + infinitive.",
        { keyWord: "not" }
      ),
      placeholderGapItem(
        "cp-rf-6",
        "Complete the second sentence so that it has a similar meaning.",
        "Although he had very little experience, he got the job.\nIn spite of __________, he got the job.",
        "his lack of experience",
        [],
        "Use the noun phrase 'his lack of experience' after 'in spite of'.",
        { keyWord: "lack" }
      ),
    ],
  },
  {
    id: "unreal-past-tenses-c1",
    title: "C1 Mastery: Unreal Past Tenses",
    shortDescription: "Practise wish, if only, would rather, and it's high time with unreal past forms.",
    levels: ["c1"],
    intro:
      "Use unreal past forms after 'wish', 'if only', 'would rather', and 'it's high time' to talk about regrets, preferences, annoyance, and urgent changes.",
    items: [
      multipleChoiceItem(
        "unreal-past-c1-mc-1",
        "Choose the most appropriate option.",
        "I'm exhausted. I wish we __________ so much work to do this weekend.",
        ["didn't have", "hadn't had", "wouldn't have"],
        0,
        "Use wish + past simple for a present situation you want to be different."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-2",
        "Choose the most appropriate option.",
        "If only you __________ to me before you signed that contract! I could have warned you.",
        ["spoke", "had spoken", "would speak"],
        1,
        "Use if only + past perfect for regret about a past action."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-3",
        "Choose the most appropriate option.",
        "I'd rather you __________ my phone without asking first.",
        ["don't use", "didn't use", "hadn't used"],
        1,
        "Use would rather + subject + past simple for a present or future preference."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-4",
        "Choose the most appropriate option.",
        "It's high time the government __________ something about the rising cost of living.",
        ["did", "does", "had done"],
        0,
        "Use it's high time + past simple for an action that should happen now."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-5",
        "Choose the most appropriate option.",
        "I wish my flatmate __________ his music down; it's nearly midnight!",
        ["turned", "had turned", "would turn"],
        2,
        "Use wish + would to complain about behaviour you want someone to change."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-6",
        "Choose the most appropriate option.",
        "I'd rather __________ at home tonight if you don't mind. I'm not in the mood for a party.",
        ["stay", "stayed", "have stayed"],
        0,
        "Use would rather + base verb when the subject is the same."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-7",
        "Choose the most appropriate option.",
        "If only the weather __________ a bit warmer last week, we could have gone hiking.",
        ["were", "had been", "would be"],
        1,
        "Use if only + past perfect for regret about a past situation."
      ),
      multipleChoiceItem(
        "unreal-past-c1-mc-8",
        "Choose the most appropriate option.",
        "Don't you think it's time you __________ an apology for what you said?",
        ["make", "made", "have made"],
        1,
        "Use it's time + subject + past simple for something that should happen now."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-1",
        "Check the highlighted phrase for errors.",
        "I wish I could afford a new car, but they are just too expensive.",
        "could afford",
        true,
        "",
        "Correct! Wish + could is used for a present ability or possibility you want to be different."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-2",
        "Check the highlighted phrase for errors.",
        "I'd rather you don't tell anyone what I just said.",
        "don't tell",
        false,
        ["didn't tell", "did not tell"],
        "Use would rather + subject + past simple."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-3",
        "Check the highlighted phrase for errors.",
        "If only we would have more money, we could move to a bigger house.",
        "would have",
        false,
        "had",
        "Use wish / if only + past simple for present states."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-4",
        "Check the highlighted phrase for errors.",
        "It's about time you learned how to cook for yourself.",
        "learned",
        true,
        "",
        "Correct! It's about time + past simple is used for an action that should happen now."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-5",
        "Check the highlighted phrase for errors.",
        "I wish the neighbors stopped arguing; I can't concentrate.",
        "stopped",
        false,
        "would stop",
        "Use wish + would to complain about another person's repeated behaviour."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-6",
        "Check the highlighted phrase for errors.",
        "Would you rather I would pay you in cash or by bank transfer?",
        "would pay",
        false,
        "paid",
        "Use would rather + subject + past simple."
      ),
      errorCorrectionItem(
        "unreal-past-c1-ec-7",
        "Check the highlighted phrase for errors.",
        "If only I hadn't forgotten the map, we wouldn't be lost now.",
        "hadn't forgotten",
        true,
        "",
        "Correct! The past perfect can express regret about a past action with a present result."
      ),
      singleGap(
        "unreal-past-c1-rf-1",
        "Complete the second sentence using the word in bold: TAKEN.",
        ["If only ", { gapId: "g1" }, " that job offer in Paris."],
        ["I had taken", "I'd taken"],
        "Use if only + past perfect for regret about the past.",
        { originalSentence: "I really regret not taking that job offer in Paris.", keyWord: "taken" }
      ),
      singleGap(
        "unreal-past-c1-rf-2",
        "Complete the second sentence using the word in bold: RATHER.",
        ["I would ", { gapId: "g1" }, " you came at 8:00 instead of 7:00."],
        ["rather"],
        "Use would rather + subject + past simple for a preference about another person.",
        { originalSentence: "I would prefer you to come at 8:00 instead of 7:00.", keyWord: "rather" }
      ),
      singleGap(
        "unreal-past-c1-rf-3",
        "Complete the second sentence using the word in bold: STOP.",
        ["I wish ", { gapId: "g1" }, " interrupting me."],
        [
          "you'd stop",
          "you would stop",
        ],
        "Use wish + would to complain about annoying behaviour.",
        { originalSentence: "It's really annoying that you keep interrupting me.", keyWord: "stop" }
      ),
      singleGap(
        "unreal-past-c1-rf-4",
        "Complete the second sentence using the word in bold: TIME.",
        ["It's ", { gapId: "g1" }, " you started studying for your finals."],
        ["high time"],
        "Use it's high time + subject + past simple.",
        { originalSentence: "You really ought to start studying for your finals.", keyWord: "time" }
      ),
      singleGap(
        "unreal-past-c1-rf-5",
        "Complete the second sentence using the word in bold: ONLY.",
        [{ gapId: "g1" }, " I could help you with your move this weekend."],
        ["If only"],
        "Use if only + could for a present or future impossibility.",
        { originalSentence: "I'm sorry I can't help you with your move this weekend.", keyWord: "only" }
      ),
      placeholderGapItem(
        "unreal-past-c1-gf-1",
        "Fill in the gap with the correct form of the verb in brackets.",
        "I'm allergic to dogs. I'd rather you __________ (leave) your dog in the garden.",
        "left",
        [],
        "Use would rather + subject + past simple."
      ),
      placeholderGapItem(
        "unreal-past-c1-gf-2",
        "Fill in the gap with the correct form of the verb in brackets.",
        "I wish I __________ (know) how to play the piano; it would be such a lovely skill.",
        "knew",
        [],
        "Use wish + past simple for a present situation."
      ),
      placeholderGapItem(
        "unreal-past-c1-gf-3",
        "Fill in the gap with the correct form of the verb in brackets.",
        "It's already 11:00 PM. It's time the children __________ (be) in bed.",
        "were",
        [],
        "Use it's time + subject + past simple. 'Were' is common in this unreal-past pattern."
      ),
      placeholderGapItem(
        "unreal-past-c1-gf-4",
        "Fill in the gap with the correct form of the verb in brackets.",
        "If only the bus __________ (come)! I've been waiting here for forty minutes.",
        "would come",
        [],
        "Use if only + would for impatience or a desired change."
      ),
      placeholderGapItem(
        "unreal-past-c1-gf-5",
        "Fill in the gap with the correct form of the verb in brackets.",
        "I wish I __________ (not/be) so stubborn during the meeting yesterday.",
        "hadn't been",
        ["had not been"],
        "Use wish + past perfect for regret about a past situation."
      ),
    ],
  },
  {
    id: "relative-clauses",
    title: "Relative Clauses",
    shortDescription: "Practise who, which, where, whose, and comma use in relative clauses.",
    levels: ["b1"],
    intro:
      "Work on defining and non-defining relative clauses, including the correct relative word and when commas are needed.",
    items: [
      multipleChoiceItem(
        "rc-mc-1",
        "Choose the correct option.",
        "That’s the woman ____ works with my brother.",
        ["which", "who", "where"],
        1,
        "Use 'who' for people."
      ),
      multipleChoiceItem(
        "rc-mc-2",
        "Choose the correct option.",
        "This is the café ____ we had lunch yesterday.",
        ["where", "which", "whose"],
        0,
        "Use 'where' for places."
      ),
      multipleChoiceItem(
        "rc-mc-3",
        "Choose the correct option.",
        "The book ____ I bought last week is really interesting.",
        ["who", "where", "which"],
        2,
        "Use 'which' for things."
      ),
      multipleChoiceItem(
        "rc-mc-4",
        "Choose the correct option.",
        "She’s the girl ____ brother is a professional footballer.",
        ["whose", "which", "that"],
        0,
        "Use 'whose' to show possession."
      ),
      multipleChoiceItem(
        "rc-mc-5",
        "Choose the correct option.",
        "The man ____ we met at the station was very friendly.",
        ["who", "which", "where"],
        0,
        "Use 'who' for people. In this sentence, 'that' could also work, but 'who' is the best option here."
      ),
      multipleChoiceItem(
        "rc-mc-6",
        "Choose the correct option.",
        "The film ____ won the award was directed by a Spanish woman.",
        ["where", "which", "whose"],
        1,
        "Use 'which' for things."
      ),
      multipleChoiceItem(
        "rc-mc-7",
        "Choose the correct option.",
        "That’s the town ____ my grandparents were born.",
        ["who", "where", "which"],
        1,
        "Use 'where' for places."
      ),
      multipleChoiceItem(
        "rc-mc-8",
        "Choose the correct option.",
        "My neighbour, ____ son goes to my school, is a doctor.",
        ["that", "whose", "who"],
        1,
        "Use 'whose' for possession. In non-defining clauses, we don't use 'that'."
      ),
      multipleChoiceItem(
        "rc-mc-9",
        "Choose the correct option.",
        "The phone ____ you lent me has stopped working.",
        ["which", "where", "who"],
        0,
        "Use 'which' for things."
      ),
      multipleChoiceItem(
        "rc-mc-10",
        "Choose the correct option.",
        "This is the park ____ I learned to ride a bike.",
        ["which", "whose", "where"],
        2,
        "Use 'where' for places."
      ),
      placeholderGapItem(
        "rc-gf-1",
        "Fill the gap.",
        "That’s the teacher __________ helped me with my project. (person)",
        "who",
        ["that"],
        "Use 'who' for people. 'That' is also possible in a defining relative clause."
      ),
      placeholderGapItem(
        "rc-gf-2",
        "Fill the gap.",
        "The house __________ we stayed in was right by the sea. (thing/place)",
        "which",
        ["that"],
        "Use 'which' or 'that' for things in defining clauses. Here the pronoun is the object of 'stayed in'."
      ),
      placeholderGapItem(
        "rc-gf-3",
        "Fill the gap.",
        "She’s the woman __________ daughter won the singing competition. (possession)",
        "whose",
        [],
        "Use 'whose' to show possession."
      ),
      placeholderGapItem(
        "rc-gf-4",
        "Fill the gap.",
        "This is the café __________ we usually meet after class. (place)",
        "where",
        [],
        "Use 'where' for places."
      ),
      placeholderGapItem(
        "rc-gf-5",
        "Fill the gap.",
        "The shoes __________ I bought online were too small. (thing)",
        "which",
        ["that"],
        "Use 'which' or 'that' for things in defining clauses."
      ),
      placeholderGapItem(
        "rc-gf-6",
        "Fill the gap.",
        "My aunt, __________ lives in Canada, is visiting us next month. (person, non-defining)",
        "who",
        [],
        "Use 'who' in a non-defining clause about a person. We can't use 'that' here."
      ),
      placeholderGapItem(
        "rc-gf-7",
        "Fill the gap.",
        "The man __________ you saw at the party is my cousin. (person)",
        "who",
        ["that"],
        "Use 'who' or 'that' for people in defining clauses."
      ),
      placeholderGapItem(
        "rc-gf-8",
        "Fill the gap.",
        "Stratford-upon-Avon, __________ Shakespeare was born, is a popular tourist destination. (place, non-defining)",
        "where",
        [],
        "Use 'where' for places. In non-defining clauses, we don't use 'that'."
      ),
      placeholderGapItem(
        "rc-gf-9",
        "Fill the gap.",
        "That’s the laptop __________ screen is cracked. (possession)",
        "whose",
        [],
        "Use 'whose' to show possession."
      ),
      placeholderGapItem(
        "rc-gf-10",
        "Fill the gap.",
        "The film __________ we watched last night was really disappointing. (thing)",
        "which",
        ["that"],
        "Use 'which' or 'that' for things in defining clauses."
      ),
      commaPlacementItem(
        "rc-comma-1",
        "Click where commas are needed, or choose 'No commas needed'.",
        "My brother who lives in Berlin is coming to stay next week. (I have more than one brother)",
        false,
        "My brother who lives in Berlin is coming to stay next week.",
        "No commas. This is a defining relative clause because it identifies which brother."
      ),
      commaPlacementItem(
        "rc-comma-2",
        "Click where commas are needed, or choose 'No commas needed'.",
        "My brother Tom who lives in Berlin is coming to stay next week.",
        true,
        "My brother Tom, who lives in Berlin, is coming to stay next week.",
        "Use commas because the clause gives extra information about Tom, who is already identified."
      ),
      commaPlacementItem(
        "rc-comma-3",
        "Click where commas are needed, or choose 'No commas needed'.",
        "The restaurant that we went to last night was excellent.",
        false,
        "The restaurant that we went to last night was excellent.",
        "No commas. The clause is defining because it tells us which restaurant."
      ),
      commaPlacementItem(
        "rc-comma-4",
        "Click where commas are needed, or choose 'No commas needed'.",
        "Paris which is one of my favourite cities is beautiful in spring.",
        true,
        "Paris, which is one of my favourite cities, is beautiful in spring.",
        "Use commas because the clause adds non-essential extra information about Paris."
      ),
      commaPlacementItem(
        "rc-comma-5",
        "Click where commas are needed, or choose 'No commas needed'.",
        "The students who finished early were allowed to leave.",
        false,
        "The students who finished early were allowed to leave.",
        "No commas. The clause identifies which students."
      ),
      commaPlacementItem(
        "rc-comma-6",
        "Click where commas are needed, or choose 'No commas needed'.",
        "My car which I bought last year has already broken down twice.",
        true,
        "My car, which I bought last year, has already broken down twice.",
        "Use commas because the speaker is referring to one specific car, and the clause is extra information."
      ),
      commaPlacementItem(
        "rc-comma-7",
        "Click where commas are needed, or choose 'No commas needed'.",
        "The people who were sitting near the door heard everything.",
        false,
        "The people who were sitting near the door heard everything.",
        "No commas. The clause is necessary to identify which people."
      ),
      commaPlacementItem(
        "rc-comma-8",
        "Click where commas are needed, or choose 'No commas needed'.",
        "Oxford where my sister studied is a lovely city.",
        true,
        "Oxford, where my sister studied, is a lovely city.",
        "Use commas because the clause gives extra information about Oxford."
      ),
      commaPlacementItem(
        "rc-comma-9",
        "Click where commas are needed, or choose 'No commas needed'.",
        "The book that I borrowed from you was really useful.",
        false,
        "The book that I borrowed from you was really useful.",
        "No commas. The clause defines which book."
      ),
      commaPlacementItem(
        "rc-comma-10",
        "Click where commas are needed, or choose 'No commas needed'.",
        "Our next-door neighbours whose son is in my class are moving to Valencia. (there is only one set of neighbours)",
        true,
        "Our next-door neighbours, whose son is in my class, are moving to Valencia.",
        "Use commas because the clause gives extra information about already identified neighbours."
      ),
      commaPlacementItem(
        "rc-comma-11",
        "Click where commas are needed, or choose 'No commas needed'.",
        "The shoes which I wore to the wedding were really uncomfortable.",
        false,
        "The shoes which I wore to the wedding were really uncomfortable.",
        "No commas. The clause tells us which shoes."
      ),
      commaPlacementItem(
        "rc-comma-12",
        "Click where commas are needed, or choose 'No commas needed'.",
        "Mr Lewis who teaches us maths is leaving the school next term.",
        true,
        "Mr Lewis, who teaches us maths, is leaving the school next term.",
        "Use commas because the clause adds extra information about a person already identified by name."
      ),
    ],
  },
  {
    id: "expressing-movement-mastery",
    title: "Expressing Movement",
    shortDescription: "Master prepositions and adverbs of direction.",
    levels: ["a2", "b1"],
    intro:
      "Learn how to describe direction. Use 'into' or 'out of' when followed by a noun, and 'in' or 'out' when used alone.",
    items: [
      multipleChoiceItem(
        "mov-mc-1",
        "Choose the correct preposition.",
        "The ball went ____ the goalkeeper's head.",
        ["under", "over", "along"],
        1,
        "Use 'over' when something moves above an object."
      ),
      multipleChoiceItem(
        "mov-mc-2",
        "Choose the correct preposition.",
        "He drove ____ the car park and onto the main road.",
        ["out of", "out", "outside"],
        0,
        "Use 'out of' when it is followed by a noun like 'the car park'."
      ),
      multipleChoiceItem(
        "mov-mc-3",
        "Towards or away?",
        "I'm at the office. Please ____ here and bring the documents.",
        ["go", "come", "walk"],
        1,
        "Use 'come' for movement towards the speaker."
      ),
      multipleChoiceItem(
        "mov-mc-4",
        "Choose the correct preposition.",
        "The children ran ____ the bridge to the other side of the river.",
        ["across", "along", "into"],
        0,
        "Use 'across' for movement from one side of something to the other."
      ),
      multipleChoiceItem(
        "mov-mc-5",
        "Choose the correct adverb.",
        "It's very cold outside. Please come ____.",
        ["into", "in", "inside of"],
        1,
        "Use 'in' (not 'into') when there is no noun following the verb."
      ),
      errorCorrectionItem(
        "mov-ec-1",
        "Check the highlighted phrase for errors.",
        "She went out the room because she was angry.",
        "out the room",
        false,
        "out of the room",
        "You must use 'out of' before a noun."
      ),
      errorCorrectionItem(
        "mov-ec-2",
        "Check the highlighted phrase for errors.",
        "He walked along the street to the end of the block.",
        "along the street",
        true,
        "",
        "Correct! 'Along' is used for movement following a line or path."
      ),
      errorCorrectionItem(
        "mov-ec-3",
        "Check the highlighted phrase for errors.",
        "The cat jumped in the box.",
        "in the box",
        false,
        "into the box",
        "Use 'into' for movement that results in being inside a space."
      ),
      errorCorrectionItem(
        "mov-ec-4",
        "Check the highlighted phrase for errors.",
        "Go here, please! I want to show you this.",
        "Go here",
        false,
        "Come here",
        "Use 'come' for movement towards the person speaking."
      ),
      errorCorrectionItem(
        "mov-ec-5",
        "Check the highlighted phrase for errors.",
        "They ran over the bridge.",
        "over the bridge",
        true,
        "",
        "Correct! 'Over' describes movement from one side of a high surface to the other."
      ),
      placeholderGapItem(
        "mov-gf-1",
        "Complete the sentence.",
        "He ran __________ the park to get to the station on the other side.",
        "across",
        ["through"],
        "Use 'across' for movement to the other side of an area. 'Through' is also natural when the person moves inside the area."
      ),
      placeholderGapItem(
        "mov-gf-2",
        "Complete the sentence.",
        "The car drove __________ of the garage.",
        "out",
        ["out of"],
        "When followed by 'of' + noun, the adverb is 'out'."
      ),
      placeholderGapItem(
        "mov-gf-3",
        "Complete the sentence.",
        "Get __________ the car! We're going to be late.",
        "into",
        ["in"],
        "Use 'into' when movement enters a noun/object."
      ),
      placeholderGapItem(
        "mov-gf-4",
        "Complete the sentence.",
        "The athletes ran __________ the track for 10 laps.",
        "around",
        ["along"],
        "Use 'around' or 'along' to describe movement following a specific path."
      ),
      placeholderGapItem(
        "ge-1",
        "The house",
        "Jax was bored inside, so he jumped __________ the sofa.",
        "off",
        ["down from"],
        "Use 'off' to describe moving away from a surface.",
        {
          imageSrc: "/images/grammar/expressing-movement/the-house.png",
          imageAlt: "Jax the cat inside the house near the sofa and an open window.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "ge-2",
        "The house",
        "He saw an open window and walked __________ the living room.",
        "out of",
        [],
        "Use 'out of' because it is followed by the noun 'the living room'."
      ),
      placeholderGapItem(
        "ge-3",
        "The house",
        "He jumped __________ the window and landed in the garden.",
        "out",
        ["through", "out of"],
        "Use 'out' when there is no noun immediately following the movement verb."
      ),
      placeholderGapItem(
        "ge-4",
        "The garden",
        "Jax ran __________ the garden path toward the back fence.",
        "along",
        ["down"],
        "Use 'along' to describe movement following a line or path.",
        {
          imageSrc: "/images/grammar/expressing-movement/the-garden.png",
          imageAlt: "Jax the cat running along a garden path towards a wooden fence.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "ge-5",
        "The garden",
        "He saw a tall wooden fence and climbed __________ it.",
        "up",
        [],
        "Use 'up' for vertical movement away from the ground."
      ),
      placeholderGapItem(
        "ge-6",
        "The garden",
        "From the top, he looked down and then jumped __________ the fence to the other side.",
        "off",
        ["down from"],
        "Use 'off' or 'down from' to describe moving away from a high surface."
      ),
      placeholderGapItem(
        "ge-7",
        "The park",
        "He was now in the park. He walked __________ the grass to the pond.",
        "across",
        ["through"],
        "Use 'across' for movement from one side of an area to another. 'Through' is also natural when moving inside the area.",
        {
          imageSrc: "/images/grammar/expressing-movement/the-park.png",
          imageAlt: "Jax the cat crossing a park with grass, a pond, and a small bridge.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "ge-8",
        "The park",
        "He saw a small bridge and ran __________ it to avoid the water.",
        "over",
        [],
        "Use 'over' to describe movement above or across a high surface."
      ),
      placeholderGapItem(
        "ge-9",
        "The park",
        "Suddenly, he saw a dog! He ran __________ from the dog as fast as he could.",
        "away",
        [],
        "Use 'away' (or 'away from') for movement in the opposite direction of something."
      ),
      placeholderGapItem(
        "ge-10",
        "The neighbourhood",
        "Jax reached the street and ran __________ the sidewalk.",
        "along",
        ["down"],
        "Use 'along' to describe following the length of the sidewalk.",
        {
          imageSrc: "/images/grammar/expressing-movement/the-neighbourhood.png",
          imageAlt: "Jax the cat running along a neighbourhood sidewalk near houses and garages.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "ge-11",
        "The neighbourhood",
        "He found an open garage and walked __________.",
        "in",
        ["inside"],
        "Use 'in' when there is no noun following the verb."
      ),
      placeholderGapItem(
        "ge-12",
        "The neighbourhood",
        "He realized it wasn't his house and quickly ran __________ the garage.",
        "out of",
        [],
        "Use 'out of' followed by the noun 'the garage'."
      ),
      placeholderGapItem(
        "ge-13",
        "The return",
        "Jax was tired. He saw his owner at the door. '__________ here, Jax!' she called.",
        "Come",
        ["come"],
        "Use 'come' for movement towards the speaker.",
        {
          imageSrc: "/images/grammar/expressing-movement/the-return.png",
          imageAlt: "Jax the cat returning home to his owner at the door.",
          imageMaxWidth: "420px",
        }
      ),
      placeholderGapItem(
        "ge-14",
        "The return",
        "He was happy to be home. He ran __________ the house through the cat flap.",
        "into",
        [],
        "Use 'into' for movement entering a space followed by a noun."
      ),
      placeholderGapItem(
        "ge-15",
        "The return",
        "Finally, he climbed __________ his bed and fell fast asleep.",
        "into",
        ["in"],
        "Use 'into' or 'in' to describe arriving inside his sleeping spot."
      ),
    ],
  },
  {
    id: "phrasal-verb-precision-10b",
    title: "Phrasal Verbs: Word Order Mastery",
    shortDescription: "A curated 15-item test on separable and inseparable phrasal verbs.",
    levels: ["a2", "b1"],
    intro:
      "Practice where to put the object. Remember: pronouns like 'it' or 'them' must go between the verb and the particle for separable verbs.",
    items: [
      multipleChoiceItem(
        "pvp-mc-1",
        "Which response to 'Put on your coat' is correct?",
        "Okay, I'll ____.",
        ["put on it", "put it on", "it put on"],
        1,
        "When the object is a pronoun (it), it must go between the verb and the particle for separable verbs."
      ),
      multipleChoiceItem(
        "pvp-mc-2",
        "I can't find my keys. I'm ____.",
        "____.",
        ["looking them for", "looking for them", "looking for it"],
        1,
        "The phrasal verb 'look for' is inseparable; the object (them) always follows the particle."
      ),
      multipleChoiceItem(
        "pvp-mc-3",
        "Which option is correct with a pronoun object?",
        "Can you ____?",
        ["turn off it", "turn it off", "it turn off"],
        1,
        "With a separable phrasal verb, a pronoun object like 'it' must go between the verb and the particle: 'turn it off'."
      ),
      multipleChoiceItem(
        "pvp-mc-4",
        "Which verb does NOT take an object?",
        "I usually ____ at 7:30 AM.",
        ["get up", "get up it", "get it up"],
        0,
        "Some phrasal verbs like 'get up' or 'go out' don't have an object at all."
      ),
      errorCorrectionItem(
        "pvp-ec-1",
        "Check the pronoun position.",
        "Your shoes are dirty. Take off them!",
        "Take off them",
        false,
        "Take them off",
        "Pronouns (them) must go between the verb and the particle in separable verbs."
      ),
      errorCorrectionItem(
        "pvp-ec-2",
        "Check the word order.",
        "I'm looking for my glasses.",
        "looking for my glasses",
        true,
        "",
        "Correct! 'Look for' is inseparable, so the object follows the particle."
      ),
      errorCorrectionItem(
        "pvp-ec-3",
        "Check the word order.",
        "Please turn the music down.",
        "turn the music down",
        true,
        "",
        "Correct! With a noun (the music), you can put the particle before or after the object."
      ),
      errorCorrectionItem(
        "pvp-ec-4",
        "Check the phrasal verb type.",
        "I don't usually go out it during the week.",
        "go out it",
        false,
        "go out",
        "'Go out' does not take an object. You cannot 'go out' a thing."
      ),
      errorCorrectionItem(
        "pvp-ec-5",
        "Check the pronoun position.",
        "I found your pen. I'll give back it tomorrow.",
        "give back it",
        false,
        "give it back",
        "For separable verbs like 'give back', the pronoun 'it' must go in the middle."
      ),
      wordOrderItem(
        "pvp-wo-1",
        "Context: It's dark in here.",
        ["can", "on", "turn", "you", "it", "?"],
        "Can you turn it on?",
        "With separable verbs, the pronoun 'it' must go in the middle."
      ),
      wordOrderItem(
        "pvp-wo-2",
        "Context: The TV is too loud.",
        ["off", "TV", "the", "turn", "please", "."],
        "Please turn the TV off.",
        "With a noun, the particle 'off' can go before or after the object.",
        ["Please turn off the TV."]
      ),
      wordOrderItem(
        "pvp-wo-3",
        "Context: I'm looking for my sister.",
        ["looking", "I", "for", "her", "am", "."],
        "I am looking for her.",
        "The verb 'look for' is inseparable; the object (her) follows the particle."
      ),
      wordOrderItem(
        "pvp-wo-4",
        "Context: If you find the address...",
        ["it", "write", "down", "."],
        "Write it down.",
        "When using a pronoun with 'write down', it must go in the middle."
      ),
      wordOrderItem(
        "pvp-wo-5",
        "Context: Here is your coat.",
        ["on", "should", "put", "you", "it", "."],
        "You should put it on.",
        "The pronoun 'it' must separate the verb 'put' and the particle 'on'."
      ),
      wordOrderItem(
        "pvp-wo-6",
        "Context: I finished with your book.",
        ["back", "I'll", "it", "give", "tomorrow", "."],
        "I'll give it back tomorrow.",
        "The pronoun 'it' sits in the middle for the separable verb 'give back'."
      ),
    ],
  },
  {
    id: "passive-voice-precision-10c",
    title: "The Passive: Focus and Form",
    shortDescription: "Build confidence with present and past passive forms through recognition, correction, and reformulation.",
    levels: ["a2", "b1"],
    intro:
      "Start by choosing the right passive form, then complete a few short gap tasks, correct common mistakes, and finally rewrite active sentences to shift the focus.",
    items: [
      multipleChoiceItem(
        "passive-mc-1",
        "Complete the general fact.",
        "Most coffee ____ in tropical countries.",
        ["grow", "is grown", "are grown"],
        1,
        "Use 'is' + past participle with singular or uncountable subjects like 'coffee'."
      ),
      multipleChoiceItem(
        "passive-mc-2",
        "Choose the correct negative form.",
        "Some emails ____ because the address is entered incorrectly.",
        ["aren't delivered", "don't delivered", "isn't delivered"],
        0,
        "Use 'aren't' + past participle for negative plural present passive sentences."
      ),
      multipleChoiceItem(
        "passive-mc-4",
        "Choose the correct present passive form.",
        "Many animated films ____ by large teams of artists.",
        ["create", "is created", "are created"],
        2,
        "Plural subjects like 'films' take 'are' in the passive."
      ),
      multipleChoiceItem(
        "passive-mc-5",
        "Complete the past passive sentence.",
        "The old theatre ____ in 1926.",
        ["built", "was built", "were built"],
        1,
        "Use 'was' for singular subjects in the past passive."
      ),
      multipleChoiceItem(
        "passive-mc-7",
        "Choose the correct question word order.",
        "When ____ the bridge ____?",
        ["the bridge was opened", "was the bridge opened", "did the bridge opened"],
        1,
        "In passive questions, the auxiliary comes before the subject: 'was the bridge opened'."
      ),
      multipleChoiceItem(
        "passive-mc-8",
        "Choose the correct agent word.",
        "The mural was painted ____ a local art teacher.",
        ["by", "from", "for"],
        0,
        "Use 'by' to say who did the action in a passive sentence."
      ),
      doubleGap(
        "passive-gf-3",
        "Complete the question.",
        [{ gapId: "g1" }, " fresh bread ", { gapId: "g2" }, " here every morning?"],
        ["Is", "is"],
        ["sold"],
        "In present passive questions, 'be' comes before the subject and the past participle comes after it: 'Is fresh bread sold...?'"
      ),
      placeholderGapItem(
        "passive-gf-6",
        "Complete the negative past fact.",
        "The exam results __________ (not / publish) until Friday morning.",
        "weren't published",
        ["were not published"],
        "Use 'weren't' + past participle for negative plural past passive sentences."
      ),
      errorCorrectionItem(
        "passive-ec-9",
        "Check the passive sentence.",
        "My bike was repaired yesterday.",
        "was repaired",
        true,
        "",
        "Correct! The passive works well here because the action is more important than the person who did it."
      ),
      errorCorrectionItem(
        "passive-ec-10",
        "Check the past participle spelling.",
        "The school play was write by the students last year.",
        "was write",
        false,
        "was written",
        "The passive needs the past participle: 'written', not 'write'."
      ),
      errorCorrectionItem(
        "passive-ec-11",
        "Check the verb 'be'.",
        "These phones made in South Korea.",
        "made",
        false,
        "are made",
        "Don't forget the verb 'be' in the present passive: 'These phones are made...'"
      ),
      singleGap(
        "passive-rf-12",
        "Rewrite to focus on the recipe: 'A local chef created the recipe.'",
        ["The recipe ", { gapId: "g1" }, " a local chef."],
        ["was created by"],
        "To focus on the object, use the past passive with 'by'."
      ),
      singleGap(
        "passive-rf-13",
        "Rewrite to focus on the classrooms: 'Workers clean the classrooms every evening.'",
        ["The classrooms ", { gapId: "g1" }, " workers every evening."],
        ["are cleaned by"],
        "Use the present passive to focus on what receives the action."
      ),
      singleGap(
        "passive-rf-14",
        "Rewrite as a question: 'Do they deliver parcels here on Saturdays?'",
        ["", { gapId: "g1" }, " here on Saturdays?"],
        ["Are parcels delivered", "are parcels delivered"],
        "In a passive question, use 'be' before the subject and the past participle after it."
      ),
      singleGap(
        "passive-rf-15",
        "Rewrite to focus on the backpack: 'Someone stole my backpack on the train.'",
        ["My backpack ", { gapId: "g1" }, " on the train."],
        ["was stolen"],
        "Use the past passive when the action matters more than the unknown person who did it."
      ),
    ],
  },
  {
    id: "past-habits-used-to-11a",
    title: "Habits: used to and usually",
    shortDescription: "Contrast past habits with present routines using 'used to' and 'usually'.",
    levels: ["a2", "b1"],
    intro:
      "Use 'used to' for past habits that are not true now. For present habits, use 'usually' + the present simple.",
    items: [
      multipleChoiceItem(
        "ut-mc-1",
        "Context: A habit in the past.",
        "When I was a child, I ____ play in the streets.",
        ["use to", "used to", "usually"],
        1,
        "Use 'used to' for things that happened repeatedly in the past but are not true now."
      ),
      multipleChoiceItem(
        "ut-mc-2",
        "Context: A habit in the present.",
        "I ____ cook in the evenings now.",
        ["usually", "use to", "used to"],
        0,
        "For habits in the present, use 'usually' + the present simple. Do not use 'use to'."
      ),
      multipleChoiceItem(
        "ut-mc-3",
        "Choose the correct negative form.",
        "I ____ like vegetables, but now I love them.",
        ["didn't used to", "didn't use to", "not used to"],
        1,
        "In negative sentences, use 'didn't' + 'use to' without the 'd'."
      ),
      multipleChoiceItem(
        "ut-mc-4",
        "Choose the correct question form.",
        "____ wear a uniform at school?",
        ["Did you used to", "Did you use to", "Do you used to"],
        1,
        "In questions, use 'Did' + 'use to' without the 'd'."
      ),
      errorCorrectionItem(
        "ut-ec-1",
        "Check the spelling of the negative form.",
        "I didn't used to like maths at school.",
        "didn't used to",
        false,
        "didn't use to",
        "Be careful! In negatives, the 'd' is removed from 'use to'."
      ),
      errorCorrectionItem(
        "ut-ec-2",
        "Check the question structure.",
        "Did you used to like your teachers?",
        "used to",
        false,
        "use to",
        "After 'Did', use 'use to' without the 'd'."
      ),
      errorCorrectionItem(
        "ut-ec-3",
        "Check the present habit form.",
        "I use to play tennis on Saturday mornings now.",
        "use to play",
        false,
        "usually play",
        "'Used to' is only for the past. For present habits, use 'usually' + present simple."
      ),
      errorCorrectionItem(
        "ut-ec-4",
        "Check the highlighted phrase for errors.",
        "My brother used to have very long hair.",
        "used to have",
        true,
        "",
        "Correct! 'Used to' can describe states that were true for a long period in the past."
      ),
      singleGap(
        "ut-rf-1",
        "Rewrite using 'used to': 'When I was a child I often played in the street.'",
        ["When I was a child, I ", { gapId: "g1" }, " in the street."],
        ["used to play"],
        "You can replace the past simple + adverb of frequency with 'used to'."
      ),
      singleGap(
        "ut-rf-2",
        "Rewrite as a negative: 'I liked vegetables when I was young.'",
        ["I ", { gapId: "g1" }, " vegetables, but now I love them."],
        ["didn't use to like", "did not use to like"],
        "Use 'didn't use to' to show a past state has changed to a present one."
      ),
      singleGap(
        "ut-rf-3",
        "Rewrite as a present habit: 'I cooked every night in the past.'",
        ["I ", { gapId: "g1" }, " in the evenings now."],
        ["usually cook"],
        "For current habits, switch from 'used to' to 'usually' + present simple."
      ),
      singleGap(
        "sn-1",
        "Look at the hair in the first photo.",
        ["Sarah ", { gapId: "g1" }, " (have) very long, messy hair when she was 20."],
        ["used to have"],
        "Use 'used to' for a state that was true for a long time in the past.",
        {
          imageSrc: "/images/grammar/used-to/sarah-then-now.png",
          imageAlt:
            "Two-panel illustration comparing Sarah at age 20, stressed in a messy bedroom, with Sarah at age 40, relaxed in a bright kitchen preparing salad.",
          imageMaxWidth: "640px",
        }
      ),
      singleGap(
        "sn-2",
        "Look at the food Sarah is eating at age 20.",
        ["She ", { gapId: "g1" }, " (not / eat) healthy salad; she preferred pizza."],
        ["didn't use to eat", "did not use to eat"],
        "Use the negative 'didn't use to' for past habits that have changed."
      ),
      singleGap(
        "sn-3",
        "Look at the textbooks on the floor in the first photo.",
        ["Sarah ", { gapId: "g1" }, " (study) maths and calculus all day."],
        ["used to study"],
        "Use 'used to' for repeated past actions."
      ),
      singleGap(
        "sn-4",
        "Look at Sarah in her kitchen now.",
        ["Now that she is 40, she ", { gapId: "g1" }, " (prepare) fresh meals for dinner."],
        ["usually prepares"],
        "For present habits, use 'usually' with the present simple."
      ),
      singleGap(
        "sn-5",
        "Look at Sarah's expression and the cloud in the first photo.",
        ["She ", { gapId: "g1" }, " (be) very stressed and worried about her life."],
        ["used to be"],
        "Use 'used to' for a past state that is no longer true."
      ),
      singleGap(
        "sn-6",
        "Look through the window in the second photo.",
        ["Sarah ", { gapId: "g1" }, " (not / have) a car when she was a student."],
        ["didn't use to have", "did not use to have"],
        "Use 'didn't use to' for things that were not true in the past."
      ),
    ],
  },
  {
    id: "possibility-might-general-11b",
    title: "Possibility: might and might not",
    shortDescription: "Master 'might' for future possibilities and uncertainty without visual aids.",
    levels: ["a2", "b1"],
    intro:
      "Use 'might' or 'might not' + verb without 'to' to say that perhaps something will or won't happen.",
    items: [
      multipleChoiceItem(
        "mig-mc-1",
        "Choose the correct structure for a future possibility.",
        "Ella ____ us after work, but she isn't sure yet.",
        ["might join", "might to join", "mights join"],
        0,
        "After 'might', use the infinitive without 'to'. Do not add '-s' for he/she/it."
      ),
      multipleChoiceItem(
        "mig-mc-2",
        "Choose the correct negative form.",
        "I'm not sure yet, so I ____ come to the party.",
        ["might not", "mightn't", "don't might"],
        0,
        "Use 'might not' for negative possibilities. In English, it is usually not contracted to 'mightn't'."
      ),
      multipleChoiceItem(
        "mig-mc-3",
        "Identify the synonym.",
        "Which word can replace 'might' in this sentence: 'We might go to the beach.'",
        ["can", "may", "must"],
        1,
        "You can also use 'may' instead of 'might' to express possibility."
      ),
      errorCorrectionItem(
        "mig-ec-1",
        "Check the highlighted phrase for errors.",
        "He mights come to the meeting later.",
        "mights come",
        false,
        "might come",
        "The form 'might' is the same for all persons. Never add an '-s'."
      ),
      errorCorrectionItem(
        "mig-ec-2",
        "Check the highlighted phrase for errors.",
        "We might to need a taxi later tonight.",
        "might to need",
        false,
        "might need",
        "Use 'might' + verb (infinitive without 'to')."
      ),
      errorCorrectionItem(
        "mig-ec-3",
        "Check the highlighted phrase for errors.",
        "They might not open the cafe tomorrow because of the storm.",
        "might not open",
        true,
        "",
        "Correct! Use 'might not' to say perhaps something won't happen."
      ),
      errorCorrectionItem(
        "mig-ec-4",
        "Check the highlighted phrase for errors.",
        "I may not go swimming this afternoon.",
        "may not go",
        true,
        "",
        "Correct! 'May not' is a valid alternative to 'might not'."
      ),
      placeholderGapItem(
        "mig-gf-1",
        "Rewrite: 'Perhaps Tom will call later.'",
        "Tom __________ later. (might)",
        "might call",
        [],
        "Use 'might' to replace 'perhaps... will'."
      ),
      placeholderGapItem(
        "mig-gf-2",
        "Rewrite: 'Perhaps the keys won't be in the car.'",
        "The keys __________ in the car. (might not)",
        "might not be",
        [],
        "Use 'might not' to replace 'perhaps... won't'."
      ),
      placeholderGapItem(
        "mig-gf-3",
        "Rewrite: 'Perhaps our team will finish first.'",
        "Our team __________ first. (may)",
        "may finish",
        ["might finish"],
        "You can use 'may' as a synonym for 'might'."
      ),
      singleGap(
        "mig-sg-1",
        "Complete the sentence for uncertainty.",
        ["I'm not sure yet. I ", { gapId: "g1" }, " (go) to the cinema tonight."],
        ["might go", "may go"],
        "Use 'might' + infinitive when you haven't decided yet."
      ),
      singleGap(
        "mig-sg-2",
        "Complete with a negative possibility.",
        ["The weather is bad, so the plane ", { gapId: "g1" }, " (not / leave) on time."],
        ["might not leave", "may not leave"],
        "Use 'might not' + verb for a possible negative outcome."
      ),
      singleGap(
        "mig-sg-3",
        "Complete with a state verb.",
        ["Take an umbrella. It ", { gapId: "g1" }, " (be) wet outside."],
        ["might be", "may be"],
        "Use 'might be' for a possible current state or future condition."
      ),
      placeholderGapItem(
        "mig-gf-4",
        "Complete the thought.",
        "I'm worried. I __________ (not / pass) my driving test.",
        "might not pass",
        ["may not pass"],
        "Use 'might not' to express worry or uncertainty about the future."
      ),
      placeholderGapItem(
        "mig-gf-5",
        "Complete the thought.",
        "Ask Karen. She __________ (know) the answer.",
        "might know",
        ["may know"],
        "Use 'might' to suggest a possibility."
      ),
    ],
  },
  {
    id: "so-neither-auxiliaries-11c",
    title: "Agreements: So and Neither",
    shortDescription:
      "Master agreeing with positive and negative statements using the correct auxiliary.",
    levels: ["a2", "b1"],
    intro:
      "Use 'So' to agree with positive statements and 'Neither' to agree with negative ones. Remember to match the auxiliary to the speaker's tense.",
    items: [
      multipleChoiceItem(
        "sn-mc-1",
        "Agree with the statement.",
        "A: I live near the city centre.",
        ["So do I.", "Neither do I.", "So am I."],
        0,
        "Use 'So + do + I' to agree with a positive Present Simple statement."
      ),
      multipleChoiceItem(
        "sn-mc-2",
        "Agree with the statement.",
        "A: I'm not married.",
        ["So am I.", "Neither do I.", "Neither am I."],
        2,
        "Use 'Neither + am + I' to agree with a negative 'be' statement."
      ),
      multipleChoiceItem(
        "sn-mc-3",
        "Agree with the past event.",
        "A: I watched the match yesterday.",
        ["So did I.", "Neither did I.", "So was I."],
        0,
        "Match the Past Simple with the auxiliary 'did'."
      ),
      multipleChoiceItem(
        "sn-mc-4",
        "Agree with the inability.",
        "A: I can't drive.",
        ["Neither can I.", "So can I.", "Neither do I."],
        0,
        "Use 'Neither' for negative statements and match the modal 'can'."
      ),
      errorCorrectionItem(
        "sn-ec-1",
        "Check the word order.",
        "A: I like films. B: So I do.",
        "So I do",
        false,
        "So do I",
        "The auxiliary must come before the subject: 'So do I'."
      ),
      errorCorrectionItem(
        "sn-ec-2",
        "Check the tense and agreement type.",
        "A: I was late this morning. B: Neither did I.",
        "Neither did I",
        false,
        "So was I",
        "The auxiliary must match the original verb, and positive statements use 'So'."
      ),
      errorCorrectionItem(
        "sn-ec-3",
        "Check the auxiliary.",
        "A: I've finished my homework. B: So do I.",
        "So do I",
        false,
        "So have I",
        "For the Present Perfect, use 'have' or 'has' to agree."
      ),
      errorCorrectionItem(
        "sn-ec-4",
        "Check the agreement type.",
        "A: I don't want to get married. B: So do I.",
        "So do I",
        false,
        "Neither do I",
        "Use 'Neither' to agree with negative statements (don't/can't/wasn't)."
      ),
      placeholderGapItem(
        "sn-gf-1",
        "Complete the response: 'A: I'm learning Spanish.'",
        "B: __________ I.",
        "So am",
        [],
        "Match the Present Continuous 'am' and use 'So' for the positive statement."
      ),
      placeholderGapItem(
        "sn-gf-2",
        "Complete the response: 'A: I didn't like the film.'",
        "B: __________ I.",
        "Neither did",
        ["Nor did"],
        "Use 'Neither' (or 'Nor') to agree with a negative Past Simple statement."
      ),
      placeholderGapItem(
        "sn-gf-3",
        "Complete the response: 'A: I wouldn't buy that car.'",
        "B: __________ I.",
        "Neither would",
        ["Nor would"],
        "Match the modal 'would' in the negative agreement."
      ),
      audioResponseItem(
        "sn-au-1",
        "Listen and type your agreement.",
        "/audio/11c/love-classical.mp3",
        "So do I",
        "Match the positive Present Simple with 'So do I'."
      ),
      audioResponseItem(
        "sn-au-2",
        "Listen and type your agreement.",
        "/audio/11c/wasnt-tired.mp3",
        "Neither was I",
        "Match the negative past state 'wasn't' with 'Neither was I'.",
        ["Nor was I"]
      ),
      audioResponseItem(
        "sn-au-3",
        "Listen and type your agreement.",
        "/audio/11c/concert-last-night.mp3",
        "So did I",
        "Match the positive Past Simple action with 'So did I'."
      ),
      audioResponseItem(
        "sn-au-4",
        "Listen and type your agreement.",
        "/audio/11c/been-to-brazil.mp3",
        "So have I",
        "Match the positive Present Perfect with 'So have I'."
      ),
      audioResponseItem(
        "sn-au-5",
        "Listen and type your agreement.",
        "/audio/11c/cant-swim.mp3",
        "Neither can I",
        "Match the negative modal 'can't' with 'Neither can I'.",
        ["Nor can I"]
      ),
      audioResponseItem(
        "sn-au-6",
        "Listen and type your agreement.",
        "/audio/11c/great-time.mp3",
        "So am I",
        "Match the positive Present Continuous 'am' with 'So am I'."
      ),
      audioResponseItem(
        "sn-au-7",
        "Listen and type your agreement.",
        "/audio/11c/dont-like-classical.mp3",
        "Neither do I",
        "Match the negative Present Simple 'don't' with 'Neither do I'.",
        ["Nor do I"]
      ),
      audioResponseItem(
        "sn-au-8",
        "Listen and type your agreement.",
        "/audio/11c/wouldnt-like-to-go.mp3",
        "Neither would I",
        "Match the negative modal 'wouldn't' with 'Neither would I'.",
        ["Nor would I"]
      ),
    ],
  },
  {
    id: "past-perfect-logic-12a",
    title: "The Past Perfect: Logic & Form",
    shortDescription: "Master the 'past of the past' using had and the past participle.",
    levels: ["a2", "b1"],
    intro:
      "Use the past perfect to talk about an action that happened before the time you are currently talking about. Form: had / hadn't + past participle.",
    items: [
      multipleChoiceItem(
        "ppl-mc-1",
        "Which action happened FIRST?",
        "By the time we got to the cinema, the trailers had already started.",
        ["We got to the cinema", "The trailers started", "Both happened together"],
        1,
        "The past perfect shows the earlier action: the trailers started before we arrived."
      ),
      multipleChoiceItem(
        "ppl-mc-2",
        "Choose the correct negative form.",
        "We sat down just in time, but the concert ____ yet.",
        ["didn't started", "hadn't started", "hadn't start"],
        1,
        "Use 'hadn't' + the past participle (started) for negative past perfect."
      ),
      multipleChoiceItem(
        "ppl-mc-3",
        "Form the question.",
        "A: I tried sushi last night. B: ____ it before?",
        ["Did you tried", "Had you tried", "Were you tried"],
        1,
        "Use 'Had' + subject + past participle for questions about earlier experiences."
      ),
      multipleChoiceItem(
        "ppl-mc-4",
        "Identify the 'd contraction.",
        "She was thrilled because she'd won the prize.",
        ["she had", "she would", "she did"],
        0,
        "In this context, 'd represents 'had' because it is followed by a past participle (won)."
      ),
      errorCorrectionItem(
        "ppl-ec-1",
        "Check the highlighted phrase for errors.",
        "When I got to the office, I realized that I'd left my wallet at home.",
        "I'd left",
        true,
        "",
        "Correct! 'I'd' is the contraction for 'I had', used here for an earlier action."
      ),
      errorCorrectionItem(
        "ppl-ec-2",
        "Check the past participle.",
        "At the airport, he realized that he hadn't packed his passport.",
        "hadn't packed",
        true,
        "",
        "Correct! The past perfect is formed with 'hadn't' + past participle."
      ),
      errorCorrectionItem(
        "ppl-ec-3",
        "Check the form.",
        "The film had already began when we arrived.",
        "had already began",
        false,
        "had already begun",
        "Always use the past participle after 'had'. The participle of 'begin' is 'begun', not 'began'."
      ),
      multipleChoiceItem(
        "ppl-mc-5",
        "What does 'd mean here?",
        "If we left now, we'd catch the last bus.",
        ["had", "would", "did"],
        1,
        "Here, 'd means 'would' because it is followed by the base verb 'catch', not a past participle."
      ),
      errorCorrectionItem(
        "ppl-ec-5",
        "Check the logic.",
        "I arrived at the station, but the train had left.",
        "had left",
        true,
        "",
        "Correct! The train left before the arrival."
      ),
      placeholderGapItem(
        "ppl-gf-1",
        "Complete the sentence with the past perfect.",
        "By breakfast time, the streets were wet because it __________ (rain) all night.",
        "had rained",
        [],
        "Use 'had' + past participle to show an earlier past action."
      ),
      placeholderGapItem(
        "ppl-gf-2",
        "Complete the negative thought.",
        "She __________ (not / meet) him before, so she was nervous.",
        "hadn't met",
        ["had not met"],
        "Use 'hadn't' + past participle for negative past perfect."
      ),
      placeholderGapItem(
        "ppl-gf-3",
        "Complete the realization.",
        "I suddenly remembered that I __________ (promise) to call Eva.",
        "had promised",
        ["'d promised"],
        "Use the past perfect for something that happened before you remembered it."
      ),
      placeholderGapItem(
        "ppl-gf-4",
        "Complete the question.",
        "__________ (you / ever / fly) before that trip to Japan?",
        "Had you ever flown",
        ["had you ever flown"],
        "In questions, place 'Had' before the subject."
      ),
      placeholderGapItem(
        "ppl-gf-5",
        "Complete the sequence.",
        "The meeting __________ (already / finish) by the time I arrived.",
        "had already finished",
        [],
        "Past perfect shows the meeting was over before the arrival."
      ),
      placeholderGapItem(
        "ppl-gf-6",
        "Complete the negative past state.",
        "He was nervous because he __________ (not / fly) before.",
        "hadn't flown",
        ["had not flown"],
        "Use the past perfect to talk about lack of experience before a past point."
      ),
    ],
  },
  {
    id: "reported-speech-mastery-12b",
    title: "Reported Speech: Backshift & Form",
    shortDescription:
      "Practice reporting what people said using tense backshifting and pronoun changes.",
    levels: ["a2", "b1"],
    intro:
      "When reporting speech, we usually change the tense (backshift) and the pronouns. Use 'say' without an object and 'tell' with an object.",
    items: [
      multipleChoiceItem(
        "rsm-mc-1",
        "Direct: 'I can lend you my notes.'",
        "He said that he ____ lend me his notes.",
        ["can", "could", "will"],
        1,
        "The modal 'can' backshifts to 'could' in reported speech."
      ),
      multipleChoiceItem(
        "rsm-mc-2",
        "Direct: 'I'm waiting outside.'",
        "She said that she ____.",
        ["is waiting outside", "was waiting outside", "waited outside"],
        1,
        "The present continuous backshifts to the past continuous."
      ),
      multipleChoiceItem(
        "rsm-mc-3",
        "Direct: 'I'll send you the file tonight.'",
        "He told me that he ____ send me the file that night.",
        ["will", "would", "shall"],
        1,
        "The future 'will' backshifts to 'would'."
      ),
      multipleChoiceItem(
        "rsm-mc-4",
        "Direct: 'I've lost my keys.'",
        "Sara said that she ____ her keys.",
        ["lost", "has lost", "had lost"],
        2,
        "The present perfect backshifts to the past perfect."
      ),
      multipleChoiceItem(
        "rsm-mc-5",
        "Choose the correct reporting verb.",
        "She ____ that the meeting was cancelled.",
        ["said", "told", "told to me"],
        0,
        "Use 'say' without an object or pronoun."
      ),
      multipleChoiceItem(
        "rsm-mc-6",
        "Choose the correct reporting verb.",
        "She ____ me that the meeting was cancelled.",
        ["said", "told", "said me"],
        1,
        "Use 'tell' with an object or pronoun like 'me'."
      ),
      errorCorrectionItem(
        "rsm-ec-1",
        "Check the highlighted phrase for errors.",
        "Marco told that he was too busy to come.",
        "told that",
        false,
        "said that",
        "You cannot use 'told' without an object. Use 'said that' or 'told me that'."
      ),
      errorCorrectionItem(
        "rsm-ec-2",
        "Check the highlighted phrase for errors.",
        "My sister said me that she was upset.",
        "said me",
        false,
        "told me",
        "We use 'tell' with an object (me). We don't say 'said me'."
      ),
      errorCorrectionItem(
        "rsm-ec-3",
        "Check the pronoun change.",
        "Direct: 'I miss you.' -> She said that she missed me.",
        "she missed me",
        true,
        "",
        "Correct! Pronouns often change in reported speech."
      ),
      errorCorrectionItem(
        "rsm-ec-4",
        "Check the tense.",
        "Direct: 'I found your keys.' -> Tom told me that he had found my keys.",
        "had found",
        true,
        "",
        "Correct! The past simple backshifts to the past perfect."
      ),
      singleGap(
        "rsm-rf-1",
        "Report this: 'I've just finished work,' she said.",
        ["She said that she ", { gapId: "g1" }, "."],
        ["had just finished work"],
        "Backshift the present perfect to the past perfect."
      ),
      singleGap(
        "rsm-rf-2",
        "Report this: 'We'll meet you outside,' they said.",
        ["They told me that they ", { gapId: "g1" }, " outside."],
        ["would meet me"],
        "Backshift 'will' to 'would'."
      ),
      placeholderGapItem(
        "rsm-gf-1",
        "Report this: 'I don't feel well,' Jack told Anna.",
        "Jack told Anna that he __________ well.",
        "didn't feel",
        ["did not feel"],
        "Backshift the present simple to the past simple and change 'I' to 'he'."
      ),
      singleGap(
        "rsm-gf-2",
        "Report this: 'I'm ready to leave,' she said.",
        ["She said that ", { gapId: "g1" }, "."],
        ["she was ready to leave"],
        "Backshift 'am' to 'was' and keep the clause after 'said that'."
      ),
      singleGap(
        "rsm-gf-3",
        "Report this: 'I can carry that bag,' he said to me.",
        ["He told me ", { gapId: "g1" }, "."],
        ["he could carry that bag", "that he could carry that bag"],
        "Backshift 'can' to 'could'. 'That' is optional after 'told me'."
      ),
    ],
  },
  {
    id: "subject-questions-12c",
    title: "Questions without auxiliaries",
    shortDescription: "Master 'subject questions' where we don't use do, does, or did.",
    levels: ["a2", "b1"],
    intro:
      "When the question word is the subject of the sentence, we don't use an auxiliary verb. We just use the verb in the correct tense.",
    items: [
      multipleChoiceItem(
        "sq-mc-1",
        "Subject Question: Identify the painter.",
        "Who ____ the poster for the school play?",
        ["did design", "designed", "did designed"],
        1,
        "When 'Who' is the subject, we don't use 'did'. Use the past simple form directly."
      ),
      multipleChoiceItem(
        "sq-mc-2",
        "Object Question Contrast: Identify preferences.",
        "Which films ____ most?",
        ["you enjoy", "do you enjoy", "enjoy you"],
        1,
        "In most other questions where 'you' is the subject, we must use the auxiliary 'do'."
      ),
      multipleChoiceItem(
        "sq-mc-3",
        "Subject Question: Statistics.",
        "Which shop ____ fresh bread the earliest?",
        ["sells", "does sell", "is selling"],
        0,
        "When the question phrase is the subject, we use the main verb directly."
      ),
      multipleChoiceItem(
        "sq-mc-4",
        "Subject Question: Social offers.",
        "Who ____ a charger for their phone?",
        ["does need", "needs", "need"],
        1,
        "Use the third-person singular verb directly after 'Who' in a subject question."
      ),
      errorCorrectionItem(
        "sq-ec-1",
        "Check for unnecessary auxiliaries.",
        "Who did design the poster?",
        "did design",
        false,
        "designed",
        "We don't use an auxiliary verb when the question word is the subject."
      ),
      errorCorrectionItem(
        "sq-ec-2",
        "Check the word order.",
        "Which teacher lives near the station?",
        "lives",
        true,
        "",
        "Correct! The question phrase is the subject, so no auxiliary is needed."
      ),
      errorCorrectionItem(
        "sq-ec-3",
        "Check the auxiliary use.",
        "What music you like?",
        "you like",
        false,
        "do you like",
        "This is an object question, so we need the auxiliary verb 'do'."
      ),
      errorCorrectionItem(
        "sq-ec-4",
        "Check the verb form.",
        "Who needs some help with the printer?",
        "needs",
        true,
        "",
        "Correct! The question word is the subject, so we use the verb directly."
      ),
      errorCorrectionItem(
        "sq-ec-5",
        "Check for redundant 'did'.",
        "Which team did win the match?",
        "did win",
        false,
        "won",
        "If the question word is the subject, use the past simple 'won' without 'did'."
      ),
      placeholderGapItem(
        "sq-gf-1",
        "Build the question.",
        "__________ (design) the website?",
        "Who designed",
        [],
        "Use the verb directly in the past simple for this subject question."
      ),
      placeholderGapItem(
        "sq-gf-2",
        "Build the question.",
        "How many guests __________ (need) a taxi after the wedding last night?",
        "needed",
        [],
        "No auxiliary is needed when the question phrase is the subject."
      ),
      placeholderGapItem(
        "sq-gf-3",
        "Build the question.",
        "Which player __________ (want) to take the penalty?",
        "wants",
        [],
        "The question phrase is the subject, so use the main verb directly."
      ),
      placeholderGapItem(
        "sq-gf-4",
        "Build the question.",
        "What __________ (happen) last night?",
        "happened",
        [],
        "When 'What' is the subject of the action, don't use 'did'."
      ),
      placeholderGapItem(
        "sq-gf-5",
        "Build the question.",
        "Who __________ (write) the email?",
        "wrote",
        [],
        "A subject question about a past action uses the past simple verb directly."
      ),
      placeholderGapItem(
        "sq-gf-6",
        "Build the question.",
        "Which bus __________ (go) to the airport?",
        "goes",
        [],
        "Use the present simple verb directly for this subject question."
      ),
      placeholderGapItem(
        "sq-gf-7",
        "Build the question.",
        "What music __________ (you / listen to) when you study?",
        "do you listen to",
        [],
        "This is an object question, so you need the auxiliary 'do'."
      ),
      placeholderGapItem(
        "sq-gf-8",
        "Build the question.",
        "Which candidate __________ (they / choose) in the end?",
        "did they choose",
        [],
        "This is an object question about the past, so you need the auxiliary 'did'."
      ),
    ],
  },
  {
    id: "advanced-have-mastery-1a",
    title: "Advanced 'Have': Lexical & Grammatical Uses",
    shortDescription:
      "Advanced practice with lexical, causative, and idiomatic uses of 'have'.",
    levels: ["c1"],
    intro:
      "Test your control of 'have' in advanced contexts. Pay attention to whether it is stative or dynamic, part of a perfect form, causative, or used inside a fixed expression.",
    items: [
      multipleChoiceItem(
        "adv-h-mc-1",
        "Choose the most natural form.",
        "I can't talk right now; I ____ a serious discussion with my landlord about the rent.",
        ["have", "am having", "'ve got"],
        1,
        "When 'have' describes an action or experience, it can be used in continuous tenses."
      ),
      multipleChoiceItem(
        "adv-h-mc-2",
        "Choose the only correct negative form.",
        "You ____ come in tomorrow after all; the meeting has been cancelled.",
        ["don't have to", "haven't to", "mustn't"],
        0,
        "Use 'don't have to' to say there is no obligation. 'Haven't to' is not standard, and 'mustn't' means it is forbidden."
      ),
      multipleChoiceItem(
        "adv-h-mc-3",
        "Choose the correct past form.",
        "Back when we were at university, we ____ a very small apartment in the suburbs.",
        ["had got", "had", "were having"],
        1,
        "For past possession, standard English normally uses 'had', not 'had got'."
      ),
      multipleChoiceItem(
        "adv-h-mc-4",
        "Choose the correct form for arranging a service.",
        "The roof is leaking; we need to ____ as soon as possible.",
        ["have it fixed", "have fixed it", "get to fix it"],
        0,
        "The causative structure is 'have + object + past participle'."
      ),
      multipleChoiceItem(
        "adv-h-mc-5",
        "Choose the correct future form.",
        "By this time next Friday, I ____ my final exams.",
        ["will have finished", "will have been finishing", "will finish"],
        0,
        "Use 'will have' + past participle for the future perfect."
      ),
      multipleChoiceItem(
        "adv-h-mc-6",
        "Choose the most natural expression.",
        "I ____ what to do next; the situation is completely unprecedented.",
        ["haven't a clue", "don't have got a clue", "am not having a clue"],
        0,
        "In fixed expressions like 'haven't a clue', 'have' can appear without 'got'."
      ),
      multipleChoiceItem(
        "adv-h-mc-7",
        "Choose the correct form.",
        "She ____ a very close relationship with her grandmother.",
        ["is having", "has", "has got to"],
        1,
        "'Have' is stative when talking about relationships and is not usually used in continuous tenses."
      ),
      multipleChoiceItem(
        "adv-h-mc-8",
        "Choose the expression that fits best.",
        "If he continues to ignore his responsibilities, I'm going to have to ____ him.",
        ["have it out with", "have him on", "have it in for"],
        0,
        "'Have it out with someone' means to discuss a problem openly and directly."
      ),
      multipleChoiceItem(
        "adv-h-mc-9",
        "Choose the expression that fits best.",
        "Are you serious about moving to Alaska, or are you just ____?",
        ["having a go", "having me on", "having a laugh"],
        1,
        "To 'have someone on' means to joke with them by making them believe something untrue."
      ),
      multipleChoiceItem(
        "adv-h-mc-10",
        "Choose the only correct form.",
        "She ____ a very good relationship with her business partner.",
        ["has", "is having", "has got to"],
        0,
        "Use 'have' as a stative main verb when talking about relationships."
      ),
      errorCorrectionItem(
        "adv-h-ec-1",
        "Check the contraction.",
        "I've a small house in the countryside.",
        "I've a",
        false,
        "I have a",
        "In the standard neutral form tested here, we do not usually contract 'have' when it is a main verb of possession."
      ),
      errorCorrectionItem(
        "adv-h-ec-2",
        "Check the past tense usage.",
        "My parents had got a red car when I was young.",
        "had got",
        false,
        "had",
        "For past possession, use 'had', not 'had got'."
      ),
      errorCorrectionItem(
        "adv-h-ec-3",
        "Check the stative verb form.",
        "I'm having a terrible headache today.",
        "I'm having",
        false,
        "I have",
        "In the standard form tested here, 'have' is treated as stative when talking about illnesses or physical states."
      ),
      errorCorrectionItem(
        "adv-h-ec-4",
        "Check the causative structure.",
        "I had stolen my wallet while I was on the bus.",
        "I had stolen my wallet",
        false,
        "I had my wallet stolen",
        "Use 'have + object + past participle' to describe something bad that happened to you."
      ),
      errorCorrectionItem(
        "adv-h-ec-5",
        "Check the idiomatic expression.",
        "I don't think I've got it in for me to run a marathon.",
        "got it in for me",
        false,
        "got it in me",
        "To feel capable of something is to 'have it in you'; 'have it in for someone' means to dislike them."
      ),
      errorCorrectionItem(
        "adv-h-ec-6",
        "Check the more neutral form for repeated obligation.",
        "I've got to wear a suit to work every day.",
        "I've got to",
        false,
        "I have to",
        "In this test, 'have to' is treated as the more neutral form for a general repeated obligation."
      ),
      errorCorrectionItem(
        "adv-h-ec-7",
        "Check the dynamic use.",
        "We had such a laugh at the party last night.",
        "had such a laugh",
        true,
        "",
        "Correct! 'Have a laugh' is a dynamic expression and is used correctly here."
      ),
      errorCorrectionItem(
        "adv-h-ec-8",
        "Check the auxiliary form.",
        "If I had not gone to the party, I wouldn't have met her.",
        "wouldn't have",
        true,
        "",
        "Correct! Here 'have' is part of the modal perfect structure 'wouldn't have met'."
      ),
      errorCorrectionItem(
        "adv-h-ec-9",
        "Check the stative possession.",
        "Are you having any siblings?",
        "Are you having",
        false,
        "Do you have",
        "'Have' for family relationships is stative and is not used in the continuous form here."
      ),
      errorCorrectionItem(
        "adv-h-ec-10",
        "Check the perfect form auxiliary.",
        "How long is she having been waiting?",
        "is she having",
        false,
        "has she",
        "The auxiliary 'has' is required to form the present perfect continuous."
      ),
      placeholderGapItem(
        "adv-h-gf-1",
        "Complete the expression.",
        "I'm not sure if I can fix the car, but I'll __________ at it. (= try)",
        "have a go",
        [],
        "To 'have a go' means to try something."
      ),
      placeholderGapItem(
        "adv-h-gf-2",
        "Complete the expression.",
        "My boss really __________ me; she always gives me the worst shifts. (= dislikes me)",
        "has it in for",
        [],
        "To 'have it in for someone' means to dislike them and treat them unfairly."
      ),
      placeholderGapItem(
        "adv-h-gf-3",
        "Complete the expression.",
        "I've __________ with this noisy neighborhood; I'm moving next month. (= had enough)",
        "had it",
        [],
        "To 'have had it' with something means to be fed up or to have had enough."
      ),
      placeholderGapItem(
        "adv-h-gf-4",
        "Complete the expression.",
        "I can't believe you're moving to Mars! You're __________, right? (= joking)",
        "having me on",
        [],
        "To 'have someone on' means to joke with them."
      ),
      placeholderGapItem(
        "adv-h-gf-5",
        "Complete the expression.",
        "I need to __________ with my brother about his behavior. (= speak openly)",
        "have it out",
        [],
        "To 'have it out with someone' means to talk openly about a problem."
      ),
      singleGap(
        "adv-h-rf-1",
        "Rewrite using a causative: 'The mechanic is servicing my car tomorrow.'",
        ["I am ", { gapId: "g1" }, " tomorrow."],
        ["having my car serviced"],
        "Use 'have + object + past participle' for services."
      ),
      singleGap(
        "adv-h-rf-2",
        "Rewrite to show specific obligation: 'It is necessary for me to call the bank today.'",
        ["I ", { gapId: "g1" }, " call the bank today."],
        ["'ve got to", "have got to"],
        "Use 'have got to' for a specific present obligation."
      ),
      singleGap(
        "adv-h-rf-3",
        "Rewrite using an idiom: 'I don't think I am capable of forgiving her.'",
        ["I don't think I ", { gapId: "g1" }, " to forgive her."],
        ["have it in me", "have got it in me", "'ve got it in me"],
        "To 'have it in you' or 'have it in you to...' means to feel capable of doing something."
      ),
      singleGap(
        "adv-h-rf-5",
        "Rewrite for a bad experience: 'Someone hacked his email account.'",
        ["He ", { gapId: "g1" }, "."],
        ["had his email account hacked"],
        "The causative can also describe negative experiences that happen to someone."
      ),
    ],
  },
  {
    id: "advanced-linkers-mastery-1b",
    title: "Advanced Discourse Markers: Linkers",
    shortDescription:
      "Advanced practice with linkers of result, reason, purpose, and contrast.",
    levels: ["c1"],
    intro:
      "Master the nuances of linking ideas. Pay attention to register, punctuation, and the grammatical structures that must follow each linker.",
    items: [
      multipleChoiceItem(
        "dm-mc-1",
        "Result: choose the most appropriate formal linker.",
        "The company failed to meet its quarterly targets; ____, the board has decided to restructure the entire department.",
        ["so", "consequently", "because"],
        1,
        "'Consequently' is more formal than 'so' and is often used to introduce a result."
      ),
      multipleChoiceItem(
        "dm-mc-2",
        "Contrast: which linker is followed by a noun phrase?",
        "____ the torrential rain, the outdoor music festival continued as planned.",
        ["Although", "In spite of", "Even though"],
        1,
        "'In spite of' must be followed by a noun phrase, a gerund, or 'the fact that'."
      ),
      multipleChoiceItem(
        "dm-mc-3",
        "Purpose: choose the correct structure for a negative purpose.",
        "We left the office early ____ we wouldn't get caught in the rush-hour traffic.",
        ["so that", "in order not to", "despite"],
        0,
        "Use 'so that' when the purpose clause has its own subject and verb."
      ),
      multipleChoiceItem(
        "dm-mc-4",
        "Reason: which option fits the formal register?",
        "The flight was cancelled ____ a technical fault in the engine.",
        ["since", "due to", "seeing as"],
        1,
        "'Due to' is more formal than 'because of' and is followed by a noun phrase."
      ),
      multipleChoiceItem(
        "dm-mc-5",
        "Purpose: preparation for a future problem.",
        "I've packed an extra set of clothes ____ the airline loses my luggage.",
        ["so that", "in case", "to"],
        1,
        "Use 'in case' + clause when doing something to be ready for a possible future problem."
      ),
      multipleChoiceItem(
        "dm-mc-6",
        "Contrast: choose the sentence-initial formal linker.",
        "The research is promising. ____, further trials are required before it can be approved.",
        ["But", "However", "Though"],
        1,
        "'However' is commonly used at the beginning of a sentence to show contrast."
      ),
      multipleChoiceItem(
        "dm-mc-7",
        "Reason: giving a reason for what you are currently saying.",
        "____ you've already finished your work, you're welcome to head home early.",
        ["Seeing as", "Due to", "Because of"],
        0,
        "'Seeing as' or 'seeing that' is used to give a reason for the current statement."
      ),
      multipleChoiceItem(
        "dm-mc-8",
        "Result: identify the correct mid-position formal linker.",
        "The committee has ____ decided to postpone the vote until next month.",
        ["so", "therefore", "as a result"],
        1,
        "'Therefore' can appear before a main verb in a formal sentence."
      ),
      multipleChoiceItem(
        "dm-mc-9",
        "Contrast: choose the most formal option for linking within a sentence.",
        "The strategy was ambitious, ____ many experts doubted it would succeed.",
        ["but", "yet", "although"],
        1,
        "'Yet' is often more formal or literary than 'but' in this position."
      ),
      multipleChoiceItem(
        "dm-mc-10",
        "Purpose: change of subject in the purpose clause.",
        "The teacher spoke slowly ____ all the students could follow the instructions.",
        ["so as to", "so that", "in order to"],
        1,
        "Use 'so that' when there is a change of subject in the purpose clause."
      ),
      errorCorrectionItem(
        "dm-ec-1",
        "Check the structure following the contrast linker.",
        "Despite she felt ill, she insisted on finishing the marathon.",
        "Despite she felt ill",
        false,
        "Despite feeling ill",
        "After 'despite' or 'in spite of', use a gerund, a noun phrase, or 'the fact that' + clause."
      ),
      errorCorrectionItem(
        "dm-ec-2",
        "Check the negative purpose structure.",
        "He wore a disguise so as to not be recognized by the reporters.",
        "so as to not",
        false,
        "so as not to",
        "The word 'not' comes before 'to' in the structure 'so as not to'."
      ),
      errorCorrectionItem(
        "dm-ec-3",
        "Check the reason linker usage.",
        "The match was abandoned because the heavy snow.",
        "because the heavy snow",
        false,
        "because of the heavy snow",
        "Use 'because of' before a noun phrase; 'because' must be followed by a clause."
      ),
      errorCorrectionItem(
        "dm-ec-4",
        "Check the register and placement of the result linker.",
        "I have a lot of experience, as result, I was offered the position.",
        "as result",
        false,
        "as a result",
        "'As a result' is normally separated with punctuation and often begins a new clause or sentence."
      ),
      errorCorrectionItem(
        "dm-ec-5",
        "Check the structure after 'in case'.",
        "Take a map in case you will get lost in the mountains.",
        "will get lost",
        false,
        "get lost",
        "After 'in case', we normally use a present form to talk about a possible future problem."
      ),
      errorCorrectionItem(
        "dm-ec-6",
        "Check the structure following the contrast linker.",
        "Despite of the high cost, the project was approved.",
        "Despite of",
        false,
        "Despite",
        "Use 'despite' without 'of'."
      ),
      errorCorrectionItem(
        "dm-ec-7",
        "Check the result linker logic.",
        "The data was corrupted, because we had to restart the analysis.",
        "because",
        false,
        "so",
        "The second clause is a result of the first, not the reason for it."
      ),
      errorCorrectionItem(
        "dm-ec-8",
        "Check the purpose linker structure.",
        "I'm studying hard in order that pass the exam.",
        "in order that pass",
        false,
        "in order to pass",
        "Use 'in order to' with an infinitive or 'so that' with a clause."
      ),
      errorCorrectionItem(
        "dm-ec-9",
        "Check the contrast linker logic.",
        "The movie was great. As a result, it was a bit too long.",
        "As a result",
        false,
        "However",
        "Use 'however' or 'nevertheless' to add contrast, not a result."
      ),
      errorCorrectionItem(
        "dm-ec-10",
        "Check the reason linker structure.",
        "Due to the weather was bad, the event was moved indoors.",
        "Due to the weather was bad",
        false,
        "Due to the bad weather",
        "'Due to' is followed by a noun phrase, not a full clause."
      ),
      singleGap(
        "dm-rf-1",
        "Complete the second sentence using the word in bold: CONSEQUENTLY.",
        ["The system crashed. ", { gapId: "g1" }, "."],
        ["Consequently, we lost all our progress"],
        "Use 'consequently' to introduce the result in a more formal way.",
        { originalSentence: "The system crashed, so we lost all our progress.", keyWord: "consequently" }
      ),
      singleGap(
        "dm-rf-2",
        "Complete the second sentence using the word in bold: DESPITE.",
        ["", { gapId: "g1" }, ", he managed to reach the village."],
        ["Despite having a broken leg"],
        "Use 'despite' followed by a gerund phrase.",
        {
          originalSentence: "Although he had a broken leg, he managed to walk to the village.",
          keyWord: "despite",
        }
      ),
      singleGap(
        "dm-rf-3",
        "Complete the second sentence using the word in bold: OWING.",
        ["", { gapId: "g1" }, ", the game was postponed."],
        ["Owing to the flooded pitch"],
        "Use 'owing to' followed by a noun phrase.",
        {
          originalSentence: "The game was postponed because the pitch was flooded.",
          keyWord: "owing",
        }
      ),
      singleGap(
        "dm-rf-4",
        "Complete the second sentence using the word in bold: SO.",
        ["He turned down the music ", { gapId: "g1" }, "."],
        ["so that he wouldn't disturb his neighbours", "so that he would not disturb his neighbours"],
        "Use 'so that' when the purpose clause has its own subject and verb.",
        {
          originalSentence: "He turned down the music in order not to disturb his neighbours.",
          keyWord: "so",
        }
      ),
      singleGap(
        "dm-rf-5",
        "Complete the second sentence using the word in bold: HOWEVER.",
        ["The plan was perfect. ", { gapId: "g1" }, "."],
        ["However, the execution was flawed"],
        "Use 'however' at the start of a new sentence to introduce contrast.",
        {
          originalSentence: "The plan was perfect, but the execution was flawed.",
          keyWord: "however",
        }
      ),
      singleGap(
        "dm-rf-6",
        "Complete the second sentence using the word in bold: SEEING.",
        ["", { gapId: "g1" }, ", you might as well help me."],
        ["Seeing that you are here", "Seeing as you are here"],
        "Use 'seeing that' or 'seeing as' to give the reason for what you are saying.",
        {
          originalSentence: "Because you are here, you might as well help me.",
          keyWord: "seeing",
        }
      ),
      singleGap(
        "dm-rf-7",
        "Complete the second sentence using the word in bold: ORDER.",
        ["She saved her money ", { gapId: "g1" }, "."],
        ["in order to buy a new house"],
        "Use 'in order to' followed by an infinitive of purpose.",
        {
          originalSentence: "She saved her money to buy a new house.",
          keyWord: "order",
        }
      ),
      singleGap(
        "dm-rf-8",
        "Complete the second sentence using the word in bold: THEREFORE.",
        ["The train was delayed; we were ", { gapId: "g1" }, "."],
        ["therefore unable to arrive on time"],
        "Use 'therefore' in mid position in a formal sentence.",
        {
          originalSentence: "The train was delayed, and as a result, we were unable to arrive on time.",
          keyWord: "therefore",
        }
      ),
      singleGap(
        "dm-rf-9",
        "Complete the second sentence using the word in bold: SPITE.",
        ["", { gapId: "g1" }, ", she speaks four languages."],
        ["In spite of being only ten"],
        "Use 'in spite of' followed by a gerund phrase.",
        {
          originalSentence: "Even though she is only ten, she speaks four languages.",
          keyWord: "spite",
        }
      ),
      singleGap(
        "dm-rf-10",
        "Complete the second sentence using the word in bold: CASE.",
        ["I'll take an umbrella ", { gapId: "g1" }, "."],
        ["in case it rains"],
        "Use 'in case' to show preparation for a possible future situation.",
        {
          originalSentence: "I'll take an umbrella because it might rain.",
          keyWord: "case",
        }
      ),
    ],
  },
  {
    id: "advanced-past-logic-mastery-1c",
    title: "The Past: Incidents and Habits",
    shortDescription:
      "Advanced practice with narrative tenses and past habits.",
    levels: ["c1"],
    intro:
      "Master the subtle differences between narrative incidents and past habits. In the final section, choose which full verb forms are grammatically possible in each context.",
    items: [
      multipleChoiceItem(
        "p-logic-1",
        "Sequence: which action was already in progress when the main event occurred?",
        "I was presenting the data when the CEO ____ to ask a question.",
        ["interrupted", "was interrupting", "had interrupted"],
        0,
        "Use the past simple for the main action that interrupts a background activity."
      ),
      multipleChoiceItem(
        "p-logic-2",
        "Earlier past: why was the result visible?",
        "The floor was filthy because the contractors ____ all day.",
        ["worked", "were working", "had been working"],
        2,
        "Use the past perfect continuous to show the cause of a past situation."
      ),
      multipleChoiceItem(
        "p-logic-3",
        "Scene setting: establish the background.",
        "The rain ____ against the window as we sat down to begin the negotiations.",
        ["beat", "was beating", "had beaten"],
        1,
        "The past continuous is used to set the scene in a narrative."
      ),
      multipleChoiceItem(
        "p-logic-4",
        "Irritating habits: express annoyance at a past behavior.",
        "My old boss ____ me on my personal phone during my vacation.",
        ["would always call", "was always calling", "Either of these"],
        2,
        "Both 'would always' and 'was always ...-ing' can describe annoying repeated past behavior."
      ),
      multipleChoiceItem(
        "p-logic-5",
        "States vs. actions: habitual behavior.",
        "In the summer, we ____ the antique shops looking for rare books.",
        ["would scour", "were scouring", "had scoured"],
        0,
        "Use 'would' + infinitive for repeated actions in the past when the time frame is clear."
      ),
      multipleChoiceItem(
        "p-logic-6",
        "Usage check: 'get used to' logic.",
        "After six months in London, I finally ____ the constant noise.",
        ["used to", "was getting used to", "got used to"],
        2,
        "'Got used to' describes the completed process of becoming familiar with something."
      ),
      multipleChoiceItem(
        "p-logic-7",
        "Choose the correct form for a past state.",
        "Before the renovation, the house ____ a large front porch.",
        ["would have", "used to having", "used to have"],
        2,
        "For a past state like possession, 'used to have' is possible, but 'would' is not normally used."
      ),
      multipleChoiceItem(
        "p-logic-8",
        "Earlier past: completed action.",
        "I didn't recognize him because he ____ a full beard since our last meeting.",
        ["grew", "was growing", "had grown"],
        2,
        "Use the past perfect simple for a completed change that happened before the main past event."
      ),
      multipleChoiceItem(
        "p-logic-9",
        "Main action: narrative flow.",
        "I was scanning the crowd when I ____ my former colleague.",
        ["spotted", "was spotting", "had spotted"],
        0,
        "The past simple describes the main events in a narrative."
      ),
      multipleChoiceItem(
        "p-logic-10",
        "Stative verbs in narrative.",
        "Even though he looked confident, he ____ absolutely terrified.",
        ["was being", "was", "had been being"],
        1,
        "Stative verbs like 'be' are usually used in simple forms to describe states."
      ),
      errorCorrectionItem(
        "p-err-1",
        "Check 'would' with a stative verb.",
        "I would belong to a tennis club, but I rarely played.",
        "would belong",
        false,
        "used to belong",
        "'Would' cannot be used for past states; use 'used to' instead."
      ),
      errorCorrectionItem(
        "p-err-2",
        "Check specific incident logic.",
        "I had been going to that restaurant three times last month.",
        "had been going",
        false,
        "went",
        "If you specify the number of times, you normally use the past simple."
      ),
      errorCorrectionItem(
        "p-err-3",
        "Check narrative sequence.",
        "The meeting ended and I had been going home.",
        "had been going",
        false,
        "went",
        "Use the past simple for a sequence of main actions in a story."
      ),
      errorCorrectionItem(
        "p-err-4",
        "Check 'get used to' structure.",
        "I'm not used to wake up so early.",
        "used to wake",
        false,
        "used to waking",
        "The 'to' in 'be used to' is a preposition, so it must be followed by a gerund."
      ),
      errorCorrectionItem(
        "p-err-5",
        "Check past perfect continuous vs. state.",
        "I had been knowing him for years before we became partners.",
        "had been knowing",
        false,
        "had known",
        "'Know' is stative and is not normally used in the continuous form."
      ),
      errorCorrectionItem(
        "p-err-6",
        "Check habitual time reference.",
        "I would play the piano.",
        "would play",
        false,
        "used to play",
        "'Would' for past habits normally needs a clear time frame or narrative context."
      ),
      errorCorrectionItem(
        "p-err-7",
        "Check state verb in the past.",
        "She used to have a very different personality when she was younger.",
        "used to have",
        true,
        "",
        "Correct! 'Used to' works well for past states and long-term situations."
      ),
      errorCorrectionItem(
        "p-err-8",
        "Check the duration logic.",
        "They had been married for fifty years and then he died.",
        "had been married",
        true,
        "",
        "Correct! The past perfect can show a state continuing up to a later point in the past."
      ),
      errorCorrectionItem(
        "p-err-9",
        "Check scene-setting vs. main action.",
        "While I worked in the garden, a storm began.",
        "worked",
        false,
        "was working",
        "Use the past continuous for the background action in progress."
      ),
      errorCorrectionItem(
        "p-err-10",
        "Check irritating habit placement.",
        "My brother always was borrowing my clothes without asking.",
        "always was borrowing",
        false,
        "was always borrowing",
        "With the past continuous, 'always' usually comes after the verb 'be'."
      ),
      placeholderChoiceGapItem(
        "p-cat-1",
        "Choose the full set of forms that could work here.",
        "I ____ very shy when I first started working here. (be)",
        ["was / used to be"],
        "For past states, the past simple and 'used to' are possible, but not 'would'.",
        ["was", "was / used to be", "was / used to be / would be"]
      ),
      placeholderChoiceGapItem(
        "p-cat-2",
        "Choose the full set of forms that could work here.",
        "We ____ to the coast every weekend during the summer. (drive)",
        ["drove / used to drive / would drive"],
        "A repeated past action with a clear time reference allows all three forms.",
        ["drove", "drove / used to drive", "drove / used to drive / would drive"]
      ),
      placeholderChoiceGapItem(
        "p-cat-3",
        "Choose the full set of forms that could work here.",
        "He ____ for that company from 2001 to 2011 before retiring. (work)",
        ["worked"],
        "A clearly finished time period with beginning and end dates points to the past simple here.",
        ["worked", "worked / used to work", "worked / used to work / would work"]
      ),
      placeholderChoiceGapItem(
        "p-cat-4",
        "Choose the full set of forms that could work here.",
        "My grandfather ____ a small boat in the harbor. (own)",
        ["owned / used to own"],
        "Ownership is a state, so 'would' is not normally possible.",
        ["owned", "owned / used to own", "owned / used to own / would own"]
      ),
      placeholderChoiceGapItem(
        "p-cat-5",
        "Choose the full set of forms that could work here.",
        "I ____ that movie five times when I was a teenager. (see)",
        ["saw"],
        "Specifying the number of times normally limits you to the past simple.",
        ["saw", "saw / used to see", "saw / used to see / would see"]
      ),
      placeholderChoiceGapItem(
        "p-cat-6",
        "Choose the full set of forms that could work here.",
        "She ____ me every night to make sure I was okay. (call)",
        ["called / used to call / would call"],
        "A repeated past action with a clear time reference allows all three forms.",
        ["called", "called / used to call", "called / used to call / would call"]
      ),
      placeholderChoiceGapItem(
        "p-cat-7",
        "Choose the full set of forms that could work here.",
        "I ____ studying history at university. (love)",
        ["loved / used to love"],
        "Emotional states or preferences take the past simple or 'used to', not 'would'.",
        ["loved", "loved / used to love", "loved / used to love / would love"]
      ),
      placeholderChoiceGapItem(
        "p-cat-8",
        "Choose the full set of forms that could work here.",
        "They ____ out together twelve times before they got engaged. (go)",
        ["went out"],
        "A specific number of completed occasions points to the past simple rather than a habitual form.",
        ["went out", "went out / used to go out", "went out / used to go out / would go out"]
      ),
      placeholderChoiceGapItem(
        "p-cat-9",
        "Choose the full set of forms that could work here.",
        "In my first job, I ____ the mail by hand every morning. (sort)",
        ["sorted / used to sort / would sort"],
        "A repeated task with a clear past time frame allows all three forms.",
        ["sorted", "sorted / used to sort", "sorted / used to sort / would sort"]
      ),
      placeholderChoiceGapItem(
        "p-cat-10",
        "Choose the full set of forms that could work here.",
        "We ____ in a very remote village before we moved here. (live)",
        ["lived / used to live"],
        "Living in a place is treated as a state or long-term condition, so 'would' is not normally used.",
        ["lived", "lived / used to live", "lived / used to live / would live"]
      ),
    ],
  },
  {
    id: "advanced-pronouns-mastery-2a",
    title: "Advanced Pronouns: Generic, Reflexive, & Preparatory Subjects",
    shortDescription:
      "Advanced practice with generic pronouns, reflexives, and 'it' vs 'there'.",
    levels: ["c1"],
    intro:
      "Refine your use of pronouns. This test covers formal and informal generic subjects, the mechanics of reflexives and reciprocals, and the correct use of preparatory subjects.",
    items: [
      multipleChoiceItem(
        "pro-mc-1",
        "Choose the best option.",
        "____ should always consider the long-term consequences of one's financial decisions.",
        ["You", "One", "They"],
        1,
        "'One' is much more formal than 'you' and is often paired with the possessive 'one's'."
      ),
      multipleChoiceItem(
        "pro-mc-2",
        "Choose the best option.",
        "If you park there for too long, ____ give you a fine.",
        ["They", "One", "We"],
        0,
        "In informal English, 'they' is often used to refer to people in authority, such as the government."
      ),
      multipleChoiceItem(
        "pro-mc-3",
        "Choose the best option.",
        "Everyone should check their phone before ____ leave the building.",
        ["they", "he", "one"],
        0,
        "We often use singular 'they' after words like 'everyone' when the gender is not specified."
      ),
      multipleChoiceItem(
        "pro-mc-4",
        "Choose the best option.",
        "As a society, ____ need to address the rising cost of living together.",
        ["one", "they", "we"],
        2,
        "'We' is used to make a general statement that includes both the speaker and the audience."
      ),
      multipleChoiceItem(
        "pro-mc-5",
        "Choose the best option.",
        "It is important to defend ____ rights when facing a legal dispute.",
        ["one's", "their", "your"],
        0,
        "'One's' is the possessive form used with the formal generic pronoun 'one'."
      ),
      multipleChoiceItem(
        "pro-mc-6",
        "Choose the best option.",
        "____ say that it's better to have loved and lost than never to have loved at all.",
        ["One", "They", "We"],
        1,
        "'They' is commonly used to refer to people in general in sayings and shared opinions."
      ),
      multipleChoiceItem(
        "pro-mc-7",
        "Choose the most natural option.",
        "If ____ want to succeed in this industry, ____ need to network constantly.",
        ["one / one", "you / you", "they / they"],
        1,
        "'You' is the most common generic pronoun in spoken English."
      ),
      multipleChoiceItem(
        "pro-mc-8",
        "Choose the best option.",
        "Could the passenger who left ____ umbrella on the train please contact the lost property office?",
        ["his", "their", "her"],
        1,
        "Using 'their' is the standard way to refer to an individual of unknown or unspecified gender."
      ),
      multipleChoiceItem(
        "pro-mc-9",
        "Choose the best option.",
        "If one wants to learn a language, ____ must practise every day.",
        ["they", "you", "one"],
        2,
        "When using 'one' as a generic pronoun, it is consistent to continue with 'one'."
      ),
      multipleChoiceItem(
        "pro-mc-10",
        "Choose the best option.",
        "If you leave your car there, ____ tow it away.",
        ["One", "We", "They"],
        2,
        "'They' is often used informally to refer to people in authority or institutions."
      ),
      errorCorrectionItem(
        "pro-ec-1",
        "Check the sentence.",
        "He got up, washed himself, and had breakfast.",
        "washed himself",
        false,
        "washed",
        "We do not usually use reflexive pronouns with verbs like 'wash', 'shave', or 'dress' unless we want special emphasis."
      ),
      errorCorrectionItem(
        "pro-ec-2",
        "Check the sentence.",
        "He looked in the mirror and saw a shadow behind himself.",
        "behind himself",
        false,
        "behind him",
        "After prepositions of place, we normally use object pronouns such as 'him' or 'her', not reflexive pronouns."
      ),
      errorCorrectionItem(
        "pro-ec-3",
        "Check the sentence.",
        "The party was great; did you enjoy last night?",
        "enjoy last night",
        false,
        "enjoy yourself last night",
        "'Enjoy' is normally used with a reflexive pronoun when it has no other object."
      ),
      errorCorrectionItem(
        "pro-ec-4",
        "Check the sentence.",
        "My two brothers don't speak to themselves anymore.",
        "to themselves",
        false,
        "to each other",
        "Use 'each other' or 'one another' for reciprocal actions."
      ),
      errorCorrectionItem(
        "pro-ec-6",
        "Check the sentence.",
        "There used to be a very good restaurant in this street.",
        "There used to be",
        true,
        "",
        "Correct! Use 'there + be' to say that something exists in a place."
      ),
      errorCorrectionItem(
        "pro-ec-7",
        "Check the sentence.",
        "She put the briefcase on the floor next to herself.",
        "next to herself",
        false,
        "next to her",
        "After prepositions of place, use the object pronoun even if it refers back to the subject."
      ),
      errorCorrectionItem(
        "pro-ec-8",
        "Check the sentence.",
        "I built the entire shelving unit by my own.",
        "my own",
        false,
        "myself",
        "Use 'by + reflexive pronoun' or 'on + possessive + own' to mean alone."
      ),
      errorCorrectionItem(
        "pro-ec-9",
        "Check the sentence.",
        "There is five miles to the nearest petrol station.",
        "There is",
        false,
        "It is",
        "Use 'it + be' to talk about distance, time, and temperature."
      ),
      errorCorrectionItem(
        "pro-ec-10",
        "Check the sentence.",
        "I managed to complete the crossword! I was really pleased with myself.",
        "with myself",
        true,
        "",
        "Correct! Use a reflexive pronoun when the subject and the object of the preposition refer to the same person."
      ),
      placeholderGapItem(
        "pro-gf-1",
        "Complete the sentence.",
        "__________ a lot of noise outside last night.",
        "There was",
        [],
        "Use 'there' to indicate the presence or existence of something."
      ),
      placeholderGapItem(
        "pro-gf-2",
        "Complete the sentence.",
        "It's very egocentric behaviour; he only ever thinks about __________.",
        "himself",
        [],
        "Use a reflexive pronoun when the subject and object are the same person."
      ),
      placeholderGapItem(
        "pro-gf-3",
        "Complete the sentence.",
        "__________ ten degrees colder than it was yesterday.",
        "It is",
        ["It's"],
        "Use 'it' to talk about temperature."
      ),
      placeholderGapItem(
        "pro-gf-4",
        "Complete the sentence.",
        "We don't get along anymore; we don't even look at __________ when we speak.",
        "each other",
        ["one another"],
        "Use 'each other' or 'one another' for reciprocal actions."
      ),
      placeholderGapItem(
        "pro-gf-5",
        "Complete the sentence.",
        "I don't mind going to the concert __________. (= alone)",
        "by myself",
        ["on my own"],
        "Use 'by + reflexive pronoun' or 'on + possessive + own' to mean alone."
      ),
      singleGap(
        "pro-rf-1",
        "Rewrite to be more formal: 'If you want to understand the law, you must study its history.'",
        ["If ", { gapId: "g1" }, " wants to understand the law, one must study its history."],
        ["one"],
        "Use 'one' as a more formal generic subject."
      ),
      singleGap(
        "pro-rf-2",
        "Rewrite using a preparatory subject: 'To hear that you're moving abroad was a surprise.'",
        ["", { gapId: "g1" }, " a surprise to hear that you're moving abroad."],
        ["It was"],
        "Use 'it' as a preparatory subject."
      ),
      singleGap(
        "pro-rf-3",
        "Rewrite using 'there': 'The street doesn't have a cinema anymore.'",
        ["", { gapId: "g1" }, " a cinema in the street anymore."],
        ["There isn't", "There is no"],
        "Use 'there + be' to talk about the presence or absence of something."
      ),
      singleGap(
        "pro-rf-4",
        "Rewrite for emphasis: 'We didn't hire professionals; we painted the office.'",
        ["We painted the office ", { gapId: "g1" }, "."],
        ["ourselves"],
        "Reflexive pronouns can emphasize that the subject performed the action without help."
      ),
    ],
  },
  {
    id: "advanced-get-mastery-3a",
    title: "Advanced 'Get': Syntax and Semantics",
    shortDescription:
      "Advanced practice with causatives, passives, and other common uses of 'get'.",
    levels: ["c1"],
    intro:
      "This test looks at several advanced uses of 'get': persuasion, services, change, arrival, and informal passives. Pay attention to the structure after 'get' and to the exact meaning in each sentence.",
    items: [
      multipleChoiceItem(
        "get-mc-1",
        "Choose the best option.",
        "After several phone calls, we finally ____ the landlord to replace the broken heater.",
        ["got the landlord to replace", "got the landlord replace", "got replaced the landlord"],
        0,
        "Use 'get + object + to + infinitive' when you persuade or manage to make someone do something."
      ),
      multipleChoiceItem(
        "get-mc-2",
        "Choose the best option.",
        "The kitchen is still a mess because we haven't ____ yet.",
        ["got painted it", "got it paint", "got it painted"],
        2,
        "For services, use 'get + object + past participle'."
      ),
      multipleChoiceItem(
        "get-mc-3",
        "Choose the best option.",
        "The room was so stuffy that we couldn't even ____ without opening a window.",
        ["get to breathe", "get any air", "get breathing"],
        1,
        "Here, 'get' means receive or obtain something."
      ),
      multipleChoiceItem(
        "get-mc-4",
        "Choose the best option.",
        "If traffic is light, we should ____ the gallery before it closes.",
        ["get", "get at", "get to"],
        2,
        "When 'get' means arrive, it is followed by 'to' before most places."
      ),
      multipleChoiceItem(
        "get-mc-5",
        "Choose the best option.",
        "She never really ____ speaking in front of large audiences.",
        ["got used to", "used to", "was used"],
        0,
        "'Get used to' describes the process of becoming familiar with something."
      ),
      multipleChoiceItem(
        "get-mc-6",
        "Choose the best option.",
        "While we were inside, our car ____ from outside the stadium.",
        ["had stolen", "got stealing", "got stolen"],
        2,
        "Use 'get + past participle' for unexpected or unpleasant things that happen."
      ),
      multipleChoiceItem(
        "get-mc-7",
        "Choose the best option.",
        "Could you ____ this before lunch?",
        ["get someone from IT looking at", "get someone from IT to look at", "get someone from IT look at"],
        1,
        "Use 'get + person + to + infinitive' when you want someone to do something."
      ),
      multipleChoiceItem(
        "get-mc-8",
        "Choose the best option.",
        "Once you know the shortcuts, you ____ the new booking system quite quickly.",
        ["are getting used to", "get to used to", "get used to"],
        2,
        "Use 'get used to' before a noun or -ing form."
      ),
      multipleChoiceItem(
        "get-mc-9",
        "Choose the best option.",
        "I was relieved when I finally ____ after pushing for almost a minute.",
        ["got the window open", "got open the window", "got the window opened"],
        0,
        "Use 'get + object + adjective' to mean manage to make something become a certain state."
      ),
      multipleChoiceItem(
        "get-mc-10",
        "Choose the best option.",
        "If we miss the last bus, we'll never ____ before midnight.",
        ["get home", "get to home", "get at home"],
        0,
        "With 'home', we normally say 'get home' without 'to'."
      ),
      errorCorrectionItem(
        "get-ec-1",
        "Check the sentence.",
        "We finally got the caretaker to unlock the side gate.",
        "got the caretaker to unlock",
        true,
        "",
        "Correct! This is the right pattern for persuading or asking someone to do something."
      ),
      errorCorrectionItem(
        "get-ec-2",
        "Check the sentence.",
        "I'm going to get cut it next week because it's far too long.",
        "get cut it",
        false,
        "get it cut",
        "With services, the object comes between 'get' and the past participle."
      ),
      errorCorrectionItem(
        "get-ec-3",
        "Check the sentence.",
        "By winter, you'll get used to the earlier sunsets.",
        "get used to",
        true,
        "",
        "Correct! 'Get used to' is used correctly here."
      ),
      errorCorrectionItem(
        "get-ec-4",
        "Check the sentence.",
        "What time did you get to home after the concert?",
        "get to home",
        false,
        "get home",
        "With 'home', we do not normally use 'to'."
      ),
      errorCorrectionItem(
        "get-ec-5",
        "Check the sentence.",
        "The queue is getting longer every minute.",
        "getting longer",
        true,
        "",
        "Correct! 'Get + comparative' shows change over time."
      ),
      errorCorrectionItem(
        "get-ec-6",
        "Check the sentence.",
        "We got the broken lock fixed that same afternoon.",
        "got the broken lock fixed",
        true,
        "",
        "Correct! This is the right structure for arranging a service."
      ),
      errorCorrectionItem(
        "get-ec-7",
        "Check the sentence.",
        "They got their neighbours help them carry the sofa upstairs.",
        "got their neighbours help",
        false,
        "got their neighbours to help",
        "After 'get + person', use 'to + infinitive'."
      ),
      errorCorrectionItem(
        "get-ec-8",
        "Check the sentence.",
        "Her visa got renewing faster than we expected.",
        "got renewing",
        false,
        "got renewed",
        "Use 'get + past participle' in this passive structure."
      ),
      errorCorrectionItem(
        "get-ec-9",
        "Check the sentence.",
        "We got delayed by roadworks on the ring road.",
        "got delayed",
        true,
        "",
        "Correct! 'Get delayed' is a common informal passive."
      ),
      errorCorrectionItem(
        "get-ec-10",
        "Check the sentence.",
        "I'm slowly getting used to work on my own.",
        "used to work",
        false,
        "used to working",
        "After 'get used to', use a noun or an -ing form."
      ),
      singleGap(
        "get-rf-1",
        "Complete the second sentence using the word in bold: GOT.",
        ["I ", { gapId: "g1" }, " the faulty charger."],
        ["got the shop to replace"],
        "Use 'get + person + to + infinitive' for persuading someone to do something.",
        {
          originalSentence: "I persuaded the shop to replace the faulty charger.",
          keyWord: "got",
        }
      ),
      singleGap(
        "get-rf-2",
        "Complete the second sentence using the word in bold: GET.",
        ["We're going to ", { gapId: "g1" }, " before Friday."],
        ["get the windows cleaned"],
        "Use 'get + object + past participle' for a service someone does for you.",
        {
          originalSentence: "A company is going to clean the windows for us before Friday.",
          keyWord: "get",
        }
      ),
      singleGap(
        "get-rf-3",
        "Complete the second sentence using the word in bold: GOT.",
        ["After a few weeks, I finally ", { gapId: "g1" }, " working late every night."],
        ["got used to"],
        "Use 'get used to' for becoming familiar with a situation.",
        {
          originalSentence: "After a few weeks, working late every night stopped feeling strange to me.",
          keyWord: "got",
        }
      ),
      singleGap(
        "get-rf-4",
        "Complete the second sentence using the word in bold: TO.",
        ["What time did you ", { gapId: "g1" }, " the venue?"],
        ["get to"],
        "Use 'get to' to mean 'arrive at'.",
        {
          originalSentence: "What time did you arrive at the venue?",
          keyWord: "to",
        }
      ),
      singleGap(
        "get-rf-5",
        "Complete the second sentence using the word in bold: GOT.",
        ["He ", { gapId: "g1" }, " while he was asleep on the train."],
        ["got his suitcase stolen"],
        "Use 'get + object + past participle' to describe something bad that happened to someone.",
        {
          originalSentence: "Someone stole his suitcase while he was asleep on the train.",
          keyWord: "got",
        }
      ),
      placeholderGapItem(
        "get-gf-1",
        "Complete the sentence.",
        "After a few weeks, you'll soon __________ the smell of paint in the studio.",
        "get used to",
        [],
        "Use 'get used to' for becoming familiar with something."
      ),
      doubleGap(
        "get-gf-2",
        "Complete the sentence.",
        ["Could you ", { gapId: "g1" }, " Lena ", { gapId: "g2" }, " me the updated file tonight?"],
        ["get"],
        ["to send"],
        "Use 'get + person + to + infinitive' when you ask or persuade someone to do something."
      ),
      placeholderGapItem(
        "get-gf-3",
        "Complete the sentence.",
        "It's __________ much harder to find a table there without a booking.",
        "getting",
        [],
        "Use 'getting' to show that a situation is changing."
      ),
      doubleGap(
        "get-gf-4",
        "Complete the sentence using `REPLACE`.",
        ["We need to ", { gapId: "g1" }, " the hallway lights ", { gapId: "g2" }, " before the guests arrive."],
        ["get"],
        ["replaced"],
        "Use 'get + object + past participle' when you arrange a service."
      ),
      placeholderGapItem(
        "get-gf-5",
        "Complete the sentence.",
        "If we leave now, we should __________ before the opening talk begins.",
        "get there",
        [],
        "Use 'get there' to mean arrive at a place already understood from the context."
      ),
    ],
  },
  {
    id: "advanced-discourse-markers-3b",
    title: "Discourse Markers: Adverbs & Adverbial Expressions",
    shortDescription:
      "Advanced practice with discourse markers for flow, clarification, and topic change.",
    levels: ["c1"],
    intro:
      "Discourse markers help organize what you say. Some are informal and common in speech, while others are more formal and better suited to professional contexts. Choose the marker that best fits the logic and register of each sentence.",
    items: [
      multipleChoiceItem(
        "dm2-mc-1",
        "Topic link: choose the best option to connect to a previous mention.",
        "I saw that the old cinema is being renovated. ____ cinemas, do you still go to the IMAX often?",
        ["Actually", "Basically", "Talking of"],
        2,
        "Use 'Talking of' or 'Speaking of' to link a new point to what has just been mentioned."
      ),
      multipleChoiceItem(
        "dm2-mc-2",
        "Register: which is the most formal way to change the subject?",
        "____, I should mention that the budget meeting has been moved to Friday.",
        ["Incidentally", "By the way", "Anyway"],
        0,
        "'Incidentally' is a more formal alternative to 'by the way' for adding a related point."
      ),
      multipleChoiceItem(
        "dm2-mc-3",
        "Unexpected information: choose the marker that introduces a surprising fact.",
        "Many people assume the project failed. ____, it was a massive success in terms of engagement.",
        ["In other words", "As a matter of fact", "On the whole"],
        1,
        "Use 'as a matter of fact', 'in fact', or 'actually' to introduce unexpected information."
      ),
      multipleChoiceItem(
        "dm2-mc-4",
        "Argumentative: introduce a point the listener may have overlooked.",
        "You shouldn't be so hard on yourself. ____, you only had two days to finish the entire report.",
        ["Besides", "Anyway", "After all"],
        2,
        "Use 'after all' to introduce an argument that the other person may not have considered."
      ),
      multipleChoiceItem(
        "dm2-mc-5",
        "Generalizing: talk about a situation in a broad sense.",
        "The software has a few minor bugs but, ____, it is much more stable than the previous version.",
        ["all in all", "on the whole", "basically"],
        1,
        "Use 'on the whole' to make a broad general judgment about a situation."
      ),
      multipleChoiceItem(
        "dm2-mc-6",
        "Clarification: make a point clearer or more detailed.",
        "He isn't very reliable. ____, he promised to call this morning and never did.",
        ["Obviously", "After all", "I mean"],
        2,
        "Use 'I mean' in spoken English to clarify or add a more specific detail."
      ),
      multipleChoiceItem(
        "dm2-mc-7",
        "Result or alternative: say what will happen if things are different.",
        "We need to leave now. ____, we'll miss the start of the performance.",
        ["Besides", "Otherwise", "In any case"],
        1,
        "Use 'otherwise' to show the result if the advice is not followed."
      ),
      multipleChoiceItem(
        "dm2-mc-8",
        "Fundamental point: introduce the main idea.",
        "There are lots of technical details, but ____, the new law is meant to keep personal data safer.",
        ["All in all", "Actually", "Basically"],
        2,
        "Use 'basically' to introduce the most important or fundamental point."
      ),
      multipleChoiceItem(
        "dm2-mc-9",
        "Topic change: formal introduction of a new subject.",
        "____ the proposed merger, we are still awaiting legal clearance.",
        ["By the way", "As regards", "Beside"],
        1,
        "Use 'as regards' or 'regarding' to introduce a new topic formally."
      ),
      multipleChoiceItem(
        "dm2-mc-10",
        "Return to topic: continue after an interruption.",
        "____, we need to decide on the new marketing strategy by the end of the day.",
        ["As I was saying", "In other words", "Anyway"],
        0,
        "Use 'as I was saying' to return to a previous topic after an interruption."
      ),
      multipleChoiceItem(
        "dm2-mc-11",
        "Positive point: choose the best option.",
        "The hotel room was tiny, but ____ it was very clean.",
        ["at least", "besides", "otherwise"],
        0,
        "Use 'at least' to introduce a positive point after negative information."
      ),
      multipleChoiceItem(
        "dm2-mc-12",
        "Explanation: choose the best option.",
        "The whole plan needs to be simplified. ____, there are too many stages and too many people involved.",
        ["Anyway", "In other words", "That is to say"],
        2,
        "Use 'that is to say' to introduce an explanation or clarification."
      ),
      errorCorrectionItem(
        "dm2-ec-1",
        "Check the sentence.",
        "Regarding to the new office, we will move in January.",
        "Regarding to",
        false,
        "Regarding",
        "'Regarding' is not followed by 'to'."
      ),
      errorCorrectionItem(
        "dm2-ec-2",
        "Check the sentence.",
        "As regards the budget, we need a final decision by Friday.",
        "As regards",
        true,
        "",
        "Correct! 'As regards' is used correctly here to introduce a topic."
      ),
      errorCorrectionItem(
        "dm2-ec-3",
        "Check the sentence.",
        "On one hand, the pay is good, but on the other hand, the hours are long.",
        "On one hand",
        true,
        "",
        "Correct! Both 'on one hand' and 'on the one hand' are used."
      ),
      errorCorrectionItem(
        "dm2-ec-4",
        "Check the sentence.",
        "I didn't enjoy the ending. In other word, the film felt unfinished.",
        "In other word",
        false,
        "In other words",
        "Use the fixed phrase 'in other words' when you restate something."
      ),
      errorCorrectionItem(
        "dm2-ec-5",
        "Check the sentence.",
        "We were very tired. Anyway, we decided to walk home.",
        "Anyway",
        true,
        "",
        "Correct! 'Anyway' works here to show that the earlier point is less important."
      ),
      errorCorrectionItem(
        "dm2-ec-6",
        "Check the sentence.",
        "Beside being expensive, the course starts far too early for me.",
        "Beside",
        false,
        "Besides",
        "Use 'besides' to add an extra point."
      ),
      placeholderGapItem(
        "dm2-gf-5",
        "Complete the dialogue.",
        "A: So what did you think of the restaurant?\nB: __________, it was good, although the service was a bit slow.",
        "On the whole",
        ["All in all"],
        "Use these markers to make a general judgment after considering the whole situation."
      ),
      placeholderGapItem(
        "dm2-gf-6",
        "Complete the sentence.",
        "__________ the travel arrangements, I'll email everyone this afternoon.",
        "As regards",
        ["Regarding"],
        "These are formal ways to introduce a new topic."
      ),
      placeholderGapItem(
        "dm2-gf-7",
        "Complete the dialogue.",
        "A: Why do you say she's not ready for the job?\nB: __________, she still needs help with basic tasks.",
        "I mean",
        [],
        "Use 'I mean' to add more detail or make your point clearer."
      ),
      placeholderGapItem(
        "dm2-gf-8",
        "Complete the dialogue.",
        "A: Did the rain ruin the day out?\nB: Not really. __________, we were planning to visit the museum instead.",
        "Anyway",
        ["In any case", "Besides"],
        "Use 'anyway', 'in any case', or 'besides' here to show the previous point is less important or to add another reason."
      ),
      doubleGap(
        "dm2-gf-9",
        "Complete the sentence.",
        [{ gapId: "g1" }, ", the salary is good. But ", { gapId: "g2" }, ", the hours are very long."],
        ["On the one hand", "On one hand"],
        ["on the other hand", "on the other"],
        "Use this pair to balance contrasting facts or points."
      ),
      placeholderGapItem(
        "dm2-gf-10",
        "Complete the dialogue.",
        "A: There are lots of details to sort out.\nB: Yes, but __________, we just need to increase sales.",
        "Basically",
        [],
        "Use 'basically' for the most fundamental point."
      ),
      placeholderGapItem(
        "dm2-gf-12",
        "Complete the dialogue.",
        "A: The flight was delayed and my suitcase never arrived.\nB: That's awful. __________, nobody was hurt.",
        "At least",
        [],
        "Use 'at least' to introduce a positive point after negative information."
      ),
    ],
  },
  {
    id: "advanced-inversion-mastery-4a",
    title: "Advanced Emphasis: Inversion",
    shortDescription:
      "Advanced practice with inversion after negative adverbials.",
    levels: ["c1"],
    intro:
      "Use inversion to make your writing more dramatic or emphatic. After negative adverbials, the auxiliary usually comes before the subject, much like in a question.",
    items: [
      multipleChoiceItem(
        "inv-mc-1",
        "Form: identify the correct word order after 'Never'.",
        "____ witnessed such a spectacular display of natural beauty.",
        ["Never I have", "Never have I", "Never did I have"],
        1,
        "When 'never' begins a sentence, the auxiliary must come before the subject."
      ),
      multipleChoiceItem(
        "inv-mc-2",
        "Connectors: pair 'No sooner' with the correct conjunction.",
        "No sooner had the CEO finished her speech ____ the reporters began shouting questions.",
        ["when", "than", "before"],
        1,
        "'No sooner' is paired with 'than' to show two actions happening in quick succession."
      ),
      multipleChoiceItem(
        "inv-mc-3",
        "Simple tense: use the correct auxiliary for a past action.",
        "Not only ____ the deadline, but they also exceeded the budget.",
        ["missed they", "did they miss", "they did miss"],
        1,
        "For past simple inversion, use 'did + subject + base verb'."
      ),
      multipleChoiceItem(
        "inv-mc-4",
        "Negative adverbials: pair 'Hardly' with the correct conjunction.",
        "Hardly had the plane touched down ____ a swarm of photographers surrounded the terminal.",
        ["than", "when", "that"],
        1,
        "'Hardly' and 'scarcely' are usually paired with 'when' or 'before'."
      ),
      multipleChoiceItem(
        "inv-mc-5",
        "Logic: 'Not until' placement.",
        "Not until the results were published ____ the magnitude of their discovery.",
        ["they realized", "did they realize", "realized they"],
        1,
        "Inversion happens in the main clause after 'not until' introduces the time condition."
      ),
      multipleChoiceItem(
        "inv-mc-6",
        "Frequency: emphasizing a rare occurrence.",
        "____ does a politician admit to making a mistake so publicly.",
        ["Rarely", "Not only", "No sooner"],
        0,
        "'Rarely' is a limiting adverbial that triggers inversion."
      ),
      multipleChoiceItem(
        "inv-mc-7",
        "Emphasis: consecutive actions.",
        "Only then ____ the true extent of the damage caused by the storm.",
        ["I understood", "did I understand", "understood I"],
        1,
        "Inversion is used after the expression 'only then'."
      ),
      multipleChoiceItem(
        "inv-mc-8",
        "Complex structure: 'Not only' with 'be'.",
        "Not only ____ extremely talented, but she is also remarkably humble.",
        ["is she", "she is", "does she be"],
        0,
        "With the verb 'be', simply invert the subject and the verb."
      ),
      multipleChoiceItem(
        "inv-mc-9",
        "Negative adverbials: future warning.",
        "Never again ____ to that restaurant after such terrible service.",
        ["I will go", "will I go", "do I go"],
        1,
        "Use 'never again' + auxiliary + subject to emphasize future resolve."
      ),
      multipleChoiceItem(
        "inv-mc-10",
        "Context: identify the incorrect pairing.",
        "Scarcely had the curtains closed ____ the audience burst into applause.",
        ["than", "when", "before"],
        0,
        "'Scarcely' cannot be paired with 'than'; use 'when' or 'before'."
      ),
      errorCorrectionItem(
        "inv-ec-1",
        "Check word order after a negative adverbial.",
        "Not only she forgot her keys, but she also left the oven on.",
        "she forgot",
        false,
        "did she forget",
        "After 'not only', use 'did + subject + base verb' for past simple actions."
      ),
      errorCorrectionItem(
        "inv-ec-2",
        "Check auxiliary placement.",
        "Never I have seen such a disorganized office.",
        "I have seen",
        false,
        "have I seen",
        "The auxiliary must come before the subject after 'never'."
      ),
      errorCorrectionItem(
        "inv-ec-3",
        "Check 'Not until' word order.",
        "Not until I saw him did I realized who he was.",
        "did I realized",
        false,
        "did I realize",
        "After 'did', the main verb must be in the base form."
      ),
      errorCorrectionItem(
        "inv-ec-4",
        "Check conjunction pairing.",
        "No sooner had the alarm gone off when the police arrived.",
        "when",
        false,
        "than",
        "'No sooner' must be followed by 'than'."
      ),
      errorCorrectionItem(
        "inv-ec-5",
        "Check inversion with 'Only when'.",
        "Only when you lose something you do realize how much it mattered.",
        "you do realize",
        false,
        "do you realize",
        "Invert the auxiliary and subject in the main clause after 'only when'."
      ),
      errorCorrectionItem(
        "inv-ec-6",
        "Check inversion with 'Rarely'.",
        "Rarely we meet people with such high integrity.",
        "we meet",
        false,
        "do we meet",
        "Use 'do/does' for present simple inversion after 'rarely'."
      ),
      errorCorrectionItem(
        "inv-ec-7",
        "Check the conjunction with 'Hardly'.",
        "Hardly had I started my dinner than the phone rang.",
        "than",
        false,
        "when",
        "'Hardly' is normally paired with 'when' rather than 'than'."
      ),
      errorCorrectionItem(
        "inv-ec-8",
        "Check inversion with 'be' in the past.",
        "Only then the truth was clear to everyone.",
        "the truth was",
        false,
        "was the truth",
        "Invert the subject and the verb 'be' after 'only then'."
      ),
      errorCorrectionItem(
        "inv-ec-9",
        "Check 'Not only' logical flow.",
        "Not only is the food expensive, but it's also not very good.",
        "is the food",
        true,
        "",
        "Correct! Inversion is used correctly with the verb 'be'."
      ),
      errorCorrectionItem(
        "inv-ec-10",
        "Check future inversion.",
        "Never again I will trust his promises.",
        "I will trust",
        false,
        "will I trust",
        "Move the auxiliary 'will' before the subject after 'never again'."
      ),
      singleGap(
        "inv-rf-1",
        "Complete the second sentence.",
        ["Never ", { gapId: "g1" }, " difficult problem."],
        ["have I encountered such a"],
        "After 'never', use auxiliary-subject order.",
        { originalSentence: "I have never encountered such a difficult problem." }
      ),
      singleGap(
        "inv-rf-2",
        "Complete the second sentence.",
        ["Not only ", { gapId: "g1" }, ", but he also stole the money."],
        ["did he lie about his age"],
        "After 'not only', use inversion in the first clause.",
        { originalSentence: "He lied about his age, and he also stole the money." }
      ),
      singleGap(
        "inv-rf-3",
        "Complete the second sentence.",
        ["No sooner ", { gapId: "g1" }, " it started to rain."],
        ["had we left the house than"],
        "Use 'no sooner + had + subject' for immediate sequence.",
        { originalSentence: "As soon as we left the house, it started to rain." }
      ),
      singleGap(
        "inv-rf-4",
        "Complete the second sentence.",
        ["Not until you experience it yourself ", { gapId: "g1" }, "."],
        ["will you understand it properly"],
        "Invert the main clause after the 'not until' condition.",
        { originalSentence: "You will not understand it properly until you experience it yourself." }
      ),
      singleGap(
        "inv-rf-5",
        "Complete the second sentence.",
        ["Rarely ", { gapId: "g1" }, " well-preserved artifact."],
        ["do you find such a", "does one find such a"],
        "Use 'rarely + do/does' for a present simple statement.",
        { originalSentence: "You rarely find such a well-preserved artifact." }
      ),
      singleGap(
        "inv-rf-6",
        "Complete the second sentence.",
        ["Hardly ", { gapId: "g1" }, " the bell rang."],
        ["had I sat down when", "had I even sat down when"],
        "Use 'hardly + had + subject' to show immediate succession.",
        { originalSentence: "I had only just sat down when the bell rang." }
      ),
      singleGap(
        "inv-rf-7",
        "Complete the second sentence.",
        ["Only when ", { gapId: "g1" }, " my mistake."],
        ["I saw his face did I realize"],
        "Invert the main clause after 'only when...'.",
        { originalSentence: "I only realized my mistake when I saw his face." }
      ),
      singleGap(
        "inv-rf-8",
        "Complete the second sentence.",
        ["Never again ", { gapId: "g1" }, "."],
        ["will I speak to her"],
        "After 'never again', invert the auxiliary and the subject.",
        { originalSentence: "I will never speak to her again." }
      ),
      singleGap(
        "inv-rf-9",
        "Complete the second sentence.",
        ["Only after he had signed ", { gapId: "g1" }, "."],
        ["did he understand the risk"],
        "Use 'only after...' followed by 'did + subject + base verb'.",
        { originalSentence: "He only understood the risk after he had signed." }
      ),
      singleGap(
        "inv-rf-10",
        "Complete the second sentence.",
        ["Not only ", { gapId: "g1" }, ", but she is also hardworking."],
        ["is she smart"],
        "Invert the verb 'be' after 'not only' when it is the main verb.",
        { originalSentence: "She is not only smart; she is also hardworking." }
      ),
    ],
  },
  {
    id: "advanced-speculation-deduction-4b",
    title: "Advanced Speculation and Deduction",
    shortDescription:
      "Advanced practice with speculation, deduction, and degrees of certainty.",
    levels: ["c1"],
    intro:
      "Refine your control of certainty and possibility. Focus on the difference between present and past deductions, and pay attention to the position of speculative adverbs in negative sentences.",
    items: [
      multipleChoiceItem(
        "spec-mc-1",
        "Degrees of certainty: choose the best option for a strong positive deduction.",
        "You've been working on that project for twelve hours straight; you ____ be exhausted.",
        ["must", "can't", "should"],
        0,
        "Use 'must + infinitive' when you are almost sure something is true in the present."
      ),
      multipleChoiceItem(
        "spec-mc-2",
        "Negative possibility: choose the grammatically correct option.",
        "I haven't heard back from the recruitment team. They ____ my application yet.",
        ["couldn't have seen", "might not have seen", "mustn't have seen"],
        1,
        "For negative possibility, use 'may not have' or 'might not have'."
      ),
      multipleChoiceItem(
        "spec-mc-3",
        "Adverb position: identify the correct placement in a negative sentence.",
        "He ____ come to the party tonight; he mentioned feeling unwell earlier.",
        ["definitely won't", "won't definitely", "definitely doesn't"],
        0,
        "Adverbs like 'definitely' and 'probably' usually go before the auxiliary in negative sentences."
      ),
      multipleChoiceItem(
        "spec-mc-4",
        "Expectation: past event.",
        "The results were supposed to be released at noon. They ____ by now.",
        ["should have arrived", "must have arrived", "can't have arrived"],
        0,
        "Use 'should have' + past participle to talk about something you expected to happen in the past."
      ),
      multipleChoiceItem(
        "spec-mc-5",
        "Past deduction: strong negative.",
        "He ____ the money; he wasn't even in the building when the theft occurred.",
        ["mustn't have taken", "can't have taken", "might not have taken"],
        1,
        "Use 'can't have' or 'couldn't have' to say you are almost sure something did not happen in the past."
      ),
      multipleChoiceItem(
        "spec-mc-6",
        "Adjectives for speculation: certainty.",
        "With her level of experience, she is ____ to be offered the position.",
        ["probably", "likely", "bound"],
        2,
        "'Bound' and 'sure' are adjectives used with 'to + infinitive' to express strong certainty."
      ),
      multipleChoiceItem(
        "spec-mc-7",
        "Continuous deduction: action in progress.",
        "There's a light on in his study. He ____ on his thesis.",
        ["must work", "must be working", "should work"],
        1,
        "Use the continuous infinitive for a deduction about an action in progress now."
      ),
      multipleChoiceItem(
        "spec-mc-8",
        "Possibility: past event.",
        "The file might still be in the archive folder, but someone ____ it by mistake.",
        ["must have deleted", "could have deleted", "can have deleted"],
        1,
        "Use 'may / might / could have + past participle' to say something is possible in the past."
      ),
      multipleChoiceItem(
        "spec-mc-9",
        "Adverb position with 'be': negative.",
        "The diamond in that ring ____ genuine; it looks far too shiny.",
        ["probably won't be", "isn't probably", "probably isn't"],
        2,
        "With the verb 'be', speculative adverbs normally go before the negative form."
      ),
      multipleChoiceItem(
        "spec-mc-10",
        "Expectation: present or future.",
        "If the traffic isn't too bad, they ____ arrive within the hour.",
        ["must", "ought to", "can't"],
        1,
        "Use 'should' or 'ought to' for something you expect to happen."
      ),
      errorCorrectionItem(
        "spec-ec-1",
        "Check the negative deduction modal.",
        "She hasn't eaten anything all day; she mustn't be very hungry.",
        "mustn't be",
        false,
        "can't be",
        "Do not use 'mustn't' for deductions; use 'can't' to say you are sure something is not true."
      ),
      errorCorrectionItem(
        "spec-ec-2",
        "Check the possibility modal.",
        "I can't find my keys. Someone couldn't have moved them.",
        "couldn't have moved",
        false,
        "might have moved",
        "Use 'might have' or 'could have' for past possibility."
      ),
      errorCorrectionItem(
        "spec-ec-3",
        "Check adverb position in positive sentences.",
        "The flight will definitely be delayed due to the storm.",
        "will definitely be",
        true,
        "",
        "Correct! In positive sentences, adverbs usually go after the auxiliary."
      ),
      errorCorrectionItem(
        "spec-ec-4",
        "Check adjective vs. adverb usage.",
        "It is probably that the economy will recover by next year.",
        "It is probably",
        false,
        "It is likely",
        "'Probably' is an adverb; after 'It is...', use an adjective such as 'likely' or 'probable'."
      ),
      errorCorrectionItem(
        "spec-ec-5",
        "Check the past expectation structure.",
        "They should arrive two hours ago, but they are still not here.",
        "should arrive",
        false,
        "should have arrived",
        "Use 'should have + past participle' for an expected situation in the past."
      ),
      errorCorrectionItem(
        "spec-ec-6",
        "Check adverb placement with 'be'.",
        "He is probably British, given his accent.",
        "is probably",
        true,
        "",
        "Correct! With the verb 'be', the adverb usually comes after the verb in positive sentences."
      ),
      errorCorrectionItem(
        "spec-ec-7",
        "Check negative possibility vs. deduction.",
        "He might not have heard the announcement.",
        "might not have heard",
        true,
        "",
        "Correct! Use 'might not have' for a negative possibility in the past."
      ),
      errorCorrectionItem(
        "spec-ec-8",
        "Check the word order for 'bound to'.",
        "He's bound win the election.",
        "bound win",
        false,
        "bound to win",
        "'Bound' is used with the structure 'subject + be + bound + to + infinitive'."
      ),
      errorCorrectionItem(
        "spec-ec-9",
        "Check the adverb position in negatives.",
        "The painting isn't definitely genuine.",
        "isn't definitely",
        false,
        "definitely isn't",
        "In this structure, the adverb goes before the negative form of 'be'."
      ),
      errorCorrectionItem(
        "spec-ec-10",
        "Check the past deduction modal.",
        "You've only written fifty words; you couldn't have spent long on this.",
        "couldn't have spent",
        true,
        "",
        "Correct! 'Couldn't have' expresses near-certainty that something did not happen."
      ),
      singleGap(
        "spec-rf-1",
        "Complete the second sentence using the word in bold: MUST.",
        ["He ", { gapId: "g1" }, " at the office because the lights are on."],
        ["must be"],
        "Use 'must' for a near-certain present deduction.",
        { originalSentence: "I'm sure he is at the office because the lights are on.", keyWord: "must" }
      ),
      singleGap(
        "spec-rf-2",
        "Complete the second sentence using the word in bold: LIKELY.",
        ["The government ", { gapId: "g1" }, " taxes."],
        ["is likely to increase"],
        "Use 'It is likely that + clause' to express possibility.",
        { originalSentence: "Perhaps the government will increase taxes.", keyWord: "likely" }
      ),
      singleGap(
        "spec-rf-3",
        "Complete the second sentence using the word in bold: CAN'T.",
        ["She ", { gapId: "g1" }, " you."],
        ["can't have seen", "couldn't have seen"],
        "Use 'can't have' or 'couldn't have' for near-certainty about the past.",
        { originalSentence: "I'm certain she didn't see you.", keyWord: "can't" }
      ),
      singleGap(
        "spec-rf-4",
        "Complete the second sentence using the word in bold: BOUND.",
        ["He is ", { gapId: "g1" }, " if he doesn't study."],
        ["bound to fail", "sure to fail"],
        "Use 'be bound to' for certainty about future events.",
        { originalSentence: "It is certain that he will fail if he doesn't study.", keyWord: "bound" }
      ),
      singleGap(
        "spec-rf-5",
        "Complete the second sentence using the word in bold: DEFINITELY.",
        ["The film ", { gapId: "g1" }, " be very good."],
        ["definitely won't"],
        "Place 'definitely' before the auxiliary in this negative structure.",
        { originalSentence: "I'm sure the film won't be very good.", keyWord: "definitely" }
      ),
      singleGap(
        "spec-rf-6",
        "Complete the second sentence using the word in bold: SHOULD.",
        ["I sent the letter a week ago; it ", { gapId: "g1" }, " by now."],
        ["should have arrived", "ought to have arrived"],
        "Use 'should/ought to have' for expectations about the past.",
        { originalSentence: "I sent the letter a week ago, so it has probably arrived by now.", keyWord: "should" }
      ),
      singleGap(
        "spec-rf-7",
        "Complete the second sentence using the word in bold: MIGHT.",
        ["They ", { gapId: "g1" }, " the email yet."],
        ["might not have received", "may not have received"],
        "Use 'may/might not' for negative possibility.",
        { originalSentence: "Perhaps they haven't received the email yet.", keyWord: "might" }
      ),
      singleGap(
        "spec-rf-8",
        "Complete the second sentence using the word in bold: LIKELY.",
        ["She is ", { gapId: "g1" }, " the race."],
        ["likely to win"],
        "Use 'subject + be + likely + to + infinitive'.",
        { originalSentence: "It is expected that she will win the race.", keyWord: "likely" }
      ),
      singleGap(
        "spec-rf-9",
        "Complete the second sentence using the word in bold: MUST.",
        ["They ", { gapId: "g1" }, " a meeting right now."],
        ["must be having"],
        "Use 'must be + -ing' for deductions about an action in progress.",
        { originalSentence: "I'm sure they are having a meeting right now.", keyWord: "must" }
      ),
      singleGap(
        "spec-rf-10",
        "Complete the second sentence using the word in bold: MAY.",
        ["Someone ", { gapId: "g1" }, " your bike."],
        ["may have stolen", "might have stolen", "could have stolen"],
        "Use these modals for past possibility.",
        { originalSentence: "It's possible that someone stole your bike.", keyWord: "may" }
      ),
    ],
  },
  {
    id: "advanced-distancing-mastery-5a",
    title: "Advanced Distancing: Seem, Passive Reporting, & Attribution",
    shortDescription:
      "Advanced practice with formal distancing and reported information.",
    levels: ["c1"],
    intro:
      "Learn to distance yourself from information using passives, reporting verbs, and lexical markers. Focus on the difference between impersonal 'it' structures, existential 'there' structures, and subject-driven passive reporting.",
    items: [
      multipleChoiceItem(
        "dist-mc-1",
        "Choose the best option.",
        "____ that several pages of the contract were missing from the final version.",
        ["Apparently", "There would seem", "It would seem"],
        2,
        "Using 'It would seem' or 'It would appear' creates more distance and sounds more formal than 'It seems'."
      ),
      multipleChoiceItem(
        "dist-mc-2",
        "Choose the best option.",
        "____, the new tax laws will be voted on by the end of the month.",
        ["According to latest reports", "I claim", "According to me"],
        0,
        "We use 'according to' to refer to an external source, not to ourselves."
      ),
      multipleChoiceItem(
        "dist-mc-3",
        "Choose the best option.",
        "____ to be a significant discrepancy in the quarterly earnings report.",
        ["There appears", "It appears", "There is appeared"],
        0,
        "Use 'There seems / appears to be' to indicate the existence of something without stating it too directly."
      ),
      multipleChoiceItem(
        "dist-mc-4",
        "Choose the best option.",
        "The CEO ____ to announce his resignation during this evening's gala.",
        ["expects", "is expected", "is expected that"],
        1,
        "Use 'subject + passive verb + to + infinitive' in formal reporting structures."
      ),
      multipleChoiceItem(
        "dist-mc-5",
        "Choose the best option.",
        "____, the two companies have been secretly negotiating a merger for months.",
        ["Apparently", "According to", "It is expected"],
        0,
        "'Apparently' is common in conversation when you have heard something that may or may not be true."
      ),
      multipleChoiceItem(
        "dist-mc-6",
        "Choose the best option.",
        "The defendant ____ to have been at home at the time of the incident, but there are no witnesses.",
        ["claims", "appears", "seems"],
        0,
        "We say somebody 'claims' something when there is doubt about whether it is true."
      ),
      multipleChoiceItem(
        "dist-mc-7",
        "Choose the best option.",
        "The missing artifacts ____ to have been sold on the black market years ago.",
        ["are understood that", "are understood", "understand"],
        1,
        "Use 'subject + passive verb + to have + past participle' to report an earlier past situation."
      ),
      multipleChoiceItem(
        "dist-mc-8",
        "Choose the best option.",
        "____ that the new railway will cost three times the original budget.",
        ["There has been announced", "It has been announced", "He is announced"],
        1,
        "Use 'It + passive verb + that + clause' to introduce reported information objectively."
      ),
      multipleChoiceItem(
        "dist-mc-9",
        "Choose the best option.",
        "Recent data suggests the virus ____ have mutated several weeks ago.",
        ["claim", "must", "may"],
        2,
        "Using 'may' or 'might' suggests possibility rather than certainty."
      ),
      multipleChoiceItem(
        "dist-mc-10",
        "Choose the best option.",
        "____ that the trial should be postponed until new evidence is reviewed.",
        ["It was agreed to", "There was agreed", "It was agreed"],
        2,
        "'Agree' is one of the verbs commonly used in the 'It + passive verb + that' pattern."
      ),
      errorCorrectionItem(
        "dist-ec-2",
        "Check the sentence.",
        "There are thought be thousands of undiscovered species in the ocean.",
        "thought be",
        false,
        "thought to be",
        "Use 'There are thought to be ...' in this reporting structure."
      ),
      errorCorrectionItem(
        "dist-ec-3",
        "Check the sentence.",
        "He seems that he has forgotten about the meeting again.",
        "seems that he has forgotten",
        false,
        "seems to have forgotten",
        "Use 'subject + seems + infinitive' here."
      ),
      errorCorrectionItem(
        "dist-ec-4",
        "Check the sentence.",
        "It would appear that the funds was stolen from the account.",
        "funds was",
        false,
        "funds were",
        "Even in distancing structures, subject-verb agreement must still be correct."
      ),
      errorCorrectionItem(
        "dist-ec-5",
        "Check the sentence.",
        "The suspect is understood having been hiding in a local cellar.",
        "understood having been",
        false,
        "understood to have been",
        "Passive reporting verbs are followed by 'to + infinitive', not a gerund."
      ),
      errorCorrectionItem(
        "dist-ec-6",
        "Check the sentence.",
        "Jeff and Katie have apparently separated, according to their friends.",
        "have apparently separated",
        true,
        "",
        "Correct! 'Apparently' can be placed at the beginning, in the middle, or at the end of a sentence."
      ),
      errorCorrectionItem(
        "dist-ec-7",
        "Check the sentence.",
        "She claims that she has discovered a cure, but no one believes her.",
        "claims that she has",
        true,
        "",
        "Correct! 'Claim' can be followed by a 'that' clause or an infinitive."
      ),
      errorCorrectionItem(
        "dist-ec-8",
        "Check the sentence.",
        "There seems to being a mistake with your reservation.",
        "to being",
        false,
        "to be",
        "Use 'There seems / appears to be' with the infinitive 'be'."
      ),
      errorCorrectionItem(
        "dist-ec-9",
        "Check the sentence.",
        "It has announced that the athlete failed the drug test.",
        "has announced",
        false,
        "has been announced",
        "'Announce' is more natural in the impersonal passive 'It has been announced that...'."
      ),
      errorCorrectionItem(
        "dist-ec-10",
        "Check the sentence.",
        "It is believed that the strike will end tomorrow.",
        "It is believed that",
        true,
        "",
        "Correct! This is the standard 'It + passive + that' pattern."
      ),
      placeholderGapItem(
        "dist-gf-1",
        "Complete the sentence using `WOULD`.",
        "__________ that the market will not recover until next year.",
        "It would seem",
        ["It would appear"],
        "Use 'It would seem / appear' for a more formal and distant observation."
      ),
      placeholderGapItem(
        "dist-gf-2",
        "Complete the sentence using `CLAIM`.",
        "The defendant __________ innocent despite the DNA evidence.",
        "claims to be",
        [],
        "Use 'claim' to report information that is under doubt."
      ),
      placeholderGapItem(
        "dist-gf-5",
        "Complete the sentence using `ACCORDING TO RESEARCH`.",
        "__________ dolphins have complex social structures.",
        "According to research",
        [],
        "Use 'according to' to specify a source."
      ),
      singleGap(
        "dist-rf-1",
        "Complete the second sentence.",
        ["The suspect ", { gapId: "g1" }, " in the woods."],
        ["is believed to be hiding"],
        "Shift from the impersonal 'It' pattern to the subject-driven passive reporting pattern.",
        { originalSentence: "It is believed that the suspect is hiding in the woods." }
      ),
      singleGap(
        "dist-rf-2",
        "Complete the second sentence using the word in bold: WOULD.",
        ["It ", { gapId: "g1" }, " that the company is facing bankruptcy."],
        ["would seem"],
        "Use the more formal distancing structure with 'would'.",
        { originalSentence: "It seems that the company is facing bankruptcy.", keyWord: "would" }
      ),
      singleGap(
        "dist-rf-3",
        "Complete the second sentence using the word in bold: THERE.",
        ["", { gapId: "g1" }, " millions of stars in this galaxy."],
        ["There are thought to be"],
        "Use the 'There + passive + to be' structure for existence.",
        {
          originalSentence: "It is thought that there are millions of stars in this galaxy.",
          keyWord: "there",
        }
      ),
      singleGap(
        "dist-rf-4",
        "Complete the second sentence.",
        ["Dinosaurs ", { gapId: "g1" }, " due to a meteor."],
        ["may have died out"],
        "Use 'may/might have' + past participle for a past possibility.",
        { originalSentence: "It is possible that the dinosaurs died out due to a meteor." }
      ),
      singleGap(
        "dist-rf-5",
        "Complete the second sentence using the word in bold: CLAIMS.",
        ["He ", { gapId: "g1" }, " the project on his own."],
        ["claims to have finished"],
        "Use 'claim' to distance yourself from a doubtful statement.",
        {
          originalSentence: "I am skeptical that he actually finished the project on his own.",
          keyWord: "claims",
        }
      ),
    ],
  },
];

export const HUB_GRAMMAR_ACTIVITIES = HUB_GRAMMAR_ACTIVITY_DEFINITIONS.map((activity) => {
  const level = getHubGrammarLevel(activity);
  return {
    ...activity,
    level,
    // Kept as a one-value compatibility field for existing submissions and consumers.
    levels: level ? [level] : [],
  };
});

export function getHubGrammarActivity(activityId) {
  return HUB_GRAMMAR_ACTIVITIES.find((activity) => activity.id === activityId) || null;
}
