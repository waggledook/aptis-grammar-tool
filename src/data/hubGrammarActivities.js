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

export const HUB_GRAMMAR_ACTIVITIES = [
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
        0,
        "Use 'will' for a prediction based on opinion."
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

export function getHubGrammarActivity(activityId) {
  return HUB_GRAMMAR_ACTIVITIES.find((activity) => activity.id === activityId) || null;
}
