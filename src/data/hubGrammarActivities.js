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
  explanation
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
    explanation
  );
};

const placeholderChoiceGapItem = (
  id,
  prompt,
  sentence,
  answers = [],
  explanation,
  choices = ["a", "an", "the", "—"]
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
