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
) => ({
  id,
  type: "gap-fill",
  prompt,
  parts,
  gaps: [
    {
      id: "g1",
      acceptedAnswers: firstAcceptedAnswers,
      feedback,
    },
    {
      id: "g2",
      acceptedAnswers: secondAcceptedAnswers,
      feedback,
    },
  ],
  ...extra,
});

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
  const marker = "__________";
  const index = String(sentence || "").indexOf(marker);
  const before = index >= 0 ? sentence.slice(0, index) : sentence;
  const after = index >= 0 ? sentence.slice(index + marker.length) : "";

  return singleGap(
    id,
    prompt,
    [before, { gapId: "g1" }, after],
    [answer, ...alternatives],
    explanation,
    extra
  );
};

const wordOrderItem = (
  id,
  prompt,
  tokens,
  answer,
  explanation,
  alternatives = [],
  extra = {}
) => ({
  id,
  type: "word-order",
  prompt,
  tokens,
  answer,
  acceptedAnswers: [answer, ...alternatives],
  explanation,
  finalPunctuation:
    extra.finalPunctuation ||
    String(answer || "").trim().match(/([?!])$/)?.[1] ||
    "",
  ...extra,
});

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
        ["have just spilled", "have just spilt"],
        "Use the present perfect simple for a very recent completed result."
      ),
      singleGap(
        "pp2",
        "Complete the sentence with the correct form of the verb.",
        ["Sorry I’m out of breath. I ", { gapId: "g1" }, " all the way here. (run)"],
        ["have been running"],
        "Use the present perfect continuous to focus on the recent activity causing the current result."
      ),
      singleGap(
        "pp3",
        "Complete the sentence with the correct form of the verb.",
        ["She ", { gapId: "g1" }, " her homework already. (finish)"],
        ["has finished"],
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
            acceptedAnswers: ["have cleaned"],
            feedback: "Use the present perfect simple for the finished visible result.",
          },
          {
            id: "g2",
            acceptedAnswers: ["have been scrubbing"],
            feedback: "Use the present perfect continuous for the duration/activity.",
          },
        ],
      },
      singleGap(
        "pp6",
        "Complete the sentence with the correct form of the verb.",
        ["It ", { gapId: "g1" }, " all day; the streets are soaked. (rain)"],
        ["has been raining"],
        "Use the present perfect continuous because the action has been continuing up to now."
      ),
      singleGap(
        "pp7",
        "Complete the sentence with the correct form of the verb.",
        ["It ", { gapId: "g1" }, " three times this week. (rain)"],
        ["has rained"],
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
            acceptedAnswers: ["have been studying"],
            feedback: "Use the present perfect continuous for an activity over a period of time.",
          },
          {
            id: "g2",
            acceptedAnswers: ["have learned", "have learnt"],
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
            acceptedAnswers: ["has repaired", "has fixed"],
            feedback: "Use the present perfect simple for the finished result: the car is ready now.",
          },
          {
            id: "g2",
            acceptedAnswers: ["has been working"],
            feedback: "Use the present perfect continuous for the ongoing activity over time.",
          },
        ],
      },
      singleGap(
        "pp10",
        "Complete the sentence with the correct form of the verb.",
        ["I ", { gapId: "g1" }, " my keys! Have you seen them? (lose)"],
        ["have lost"],
        "Use the present perfect simple for a completed action with a present consequence."
      ),
      singleGap(
        "pp11",
        "Complete the sentence with the correct form of the verb.",
        ["I’m covered in flour because I ", { gapId: "g1" }, ". (bake)"],
        ["have been baking"],
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
            acceptedAnswers: ["has been cooking"],
            feedback: "Use the present perfect continuous for the recent activity causing the current smell.",
          },
          {
            id: "g2",
            acceptedAnswers: ["has made"],
            feedback: "Use the present perfect simple for the finished result: the lasagna now exists.",
          },
        ],
      },
      singleGap(
        "pp13",
        "Complete the sentence with the correct form of the verb.",
        ["He ", { gapId: "g1" }, " that book for days. (read)"],
        ["has been reading"],
        "Use the present perfect continuous for an activity continuing over several days."
      ),
      singleGap(
        "pp14",
        "Complete the sentence with the correct form of the verb.",
        ["We ", { gapId: "g1" }, " for you since 5:00. (wait)"],
        ["have been waiting"],
        "Use the present perfect continuous with 'since' to show duration."
      ),
      singleGap(
        "pp15",
        "Complete the sentence with the correct form of the verb.",
        ["They ", { gapId: "g1" }, " London twice this year. (visit)"],
        ["have visited"],
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
        "Complete the definition: A suitcase is a large bag __________ you use for carrying clothes.",
        "which",
        ["that"],
        "Defining an object (a bag)."
      ),
      placeholderGapItem(
        "rel-gf-2",
        "Complete the definition: A receptionist is the person __________ works at the front desk.",
        "who",
        ["that"],
        "Defining a person."
      ),
      placeholderGapItem(
        "rel-gf-3",
        "Complete the definition: An airport is a place __________ planes land and take off.",
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
        "I ____ to Italy three times, but I'd love to go again.",
        ["have been", "went", "was going"],
        0,
        "Use Present Perfect for life experiences when we don't say exactly when."
      ),
      multipleChoiceItem(
        "ppvsps-mc-2",
        "Choose the correct verb form.",
        "I ____ to Italy for the first time in 2018.",
        ["have gone", "went", "have been"],
        1,
        "Use Past Simple because 'in 2018' is a finished time."
      ),
      multipleChoiceItem(
        "ppvsps-mc-3",
        "Choose the correct verb form.",
        "Oh no! I ____ my phone. The screen is completely cracked.",
        ["have broken", "broke", "break"],
        0,
        "Use Present Perfect for recent news that has a result in the present."
      ),
      multipleChoiceItem(
        "ppvsps-mc-4",
        "Choose the correct verb form.",
        "I ____ my phone while I was running for the bus yesterday.",
        ["have broken", "broke", "had broken"],
        1,
        "Use Past Simple because 'yesterday' is a finished time."
      ),
      multipleChoiceItem(
        "ppvsps-mc-5",
        "Choose the correct verb form.",
        "Oh no! I ____ my keys. I can't get into my flat!",
        ["lost", "have lost", "was losing"],
        1,
        "Use the Present Perfect for a recent action that has a direct result in the present (I can't get in)."
      ),
      multipleChoiceItem(
        "ppvsps-mc-6",
        "Choose the correct verb form.",
        "They ____ to a lovely Indian restaurant for dinner last night.",
        ["went", "have gone", "have been"],
        0,
        "Use the Past Simple because 'last night' is a finished time."
      ),
      errorCorrectionItem(
        "ppvsps-ec-1",
        "Check the highlighted phrase for errors.",
        "I have seen that film last night at the cinema.",
        "have seen",
        false,
        "saw",
        "You cannot use the Present Perfect with a finished time like 'last night'."
      ),
      errorCorrectionItem(
        "ppvsps-ec-2",
        "Check the highlighted phrase for errors.",
        "Have you ever eaten Japanese food?",
        "Have you ever eaten",
        true,
        "",
        "Correct! Use Present Perfect to ask about general life experiences."
      ),
      errorCorrectionItem(
        "ppvsps-ec-3",
        "Check the highlighted phrase for errors.",
        "We have moved to this house three years ago.",
        "have moved",
        false,
        "moved",
        "The word 'ago' always requires the Past Simple."
      ),
      errorCorrectionItem(
        "ppvsps-ec-4",
        "Check the highlighted phrase for errors.",
        "I have spoken to the manager about the problem ten minutes ago.",
        "have spoken",
        false,
        "spoke",
        "You cannot use the Present Perfect with 'ago'. Use the Past Simple instead."
      ),
      errorCorrectionItem(
        "ppvsps-ec-5",
        "Check the highlighted phrase for errors.",
        "I have won a trophy for sport at school in 2019.",
        "have won",
        false,
        "won",
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
];

export function getHubGrammarActivity(activityId) {
  return HUB_GRAMMAR_ACTIVITIES.find((activity) => activity.id === activityId) || null;
}
