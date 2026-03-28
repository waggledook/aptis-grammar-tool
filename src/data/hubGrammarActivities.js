const singleGap = (id, prompt, parts, acceptedAnswers, feedback) => ({
  id,
  prompt,
  parts,
  gaps: [
    {
      id: "g1",
      acceptedAnswers,
      feedback,
    },
  ],
});

export const HUB_GRAMMAR_ACTIVITIES = [
  {
    id: "second-conditional-reformulation",
    title: "Second Conditional Reformulation",
    shortDescription: "Rewrite each sentence using the second conditional.",
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
        "Use the second conditional: if + past simple, then would/could + base verb."
      ),
      singleGap(
        "sc2",
        "Use the second conditional.",
        ["I would wake up early ", { gapId: "g1" }, "."],
        ["if i set the alarm", "if i set an alarm"],
        "The missing clause should be an if-clause in the past simple: if I set the alarm."
      ),
      singleGap(
        "sc3",
        "Use the second conditional.",
        ["If she learned French, ", { gapId: "g1" }, "."],
        [
          "she could communicate in paris",
          "she would be able to communicate in paris",
        ],
        "After the if-clause, use would/could + base verb to describe the imaginary result."
      ),
      singleGap(
        "sc4",
        "Use the second conditional.",
        ["We would grow vegetables ", { gapId: "g1" }, "."],
        ["if we had a garden"],
        "Use the unreal condition with past simple: if we had a garden."
      ),
      singleGap(
        "sc5",
        "Use the second conditional.",
        ["If they liked art, ", { gapId: "g1" }, "."],
        ["they would visit museums", "they'd visit museums"],
        "The result clause should use would + base verb: they would visit museums."
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
        "Both forms are natural here. The key is the if-clause in the past simple."
      ),
      singleGap(
        "sc7",
        "Use the second conditional.",
        ["He wouldn’t miss the news ", { gapId: "g1" }, "."],
        ["if he read headlines", "if he read the headlines"],
        "Use the if-clause in the past simple: if he read headlines."
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
        "Both 'were' and 'was' are accepted here. The important part is the unreal condition."
      ),
      singleGap(
        "sc9",
        "Use the second conditional.",
        ["If we ate vegetables, ", { gapId: "g1" }, "."],
        ["we wouldn't lack vitamins", "we would not lack vitamins"],
        "Use wouldn't + base verb in the result clause: we wouldn't lack vitamins."
      ),
      singleGap(
        "sc10",
        "Use the second conditional.",
        ["They wouldn’t make mistakes ", { gapId: "g1" }, "."],
        ["if they practiced speaking", "if they practised speaking"],
        "The if-clause should use the past simple: if they practiced speaking."
      ),
    ],
  },
  {
    id: "used-to-forms",
    title: "Used To Forms",
    shortDescription: "Practise used to, didn’t use to, and be used to.",
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
            acceptedAnswers: ["is wearing"],
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
            acceptedAnswers: ["is taking", "takes"],
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
    intro:
      "Type the full tag. The checker accepts natural punctuation variants, so you can focus on the grammar.",
    items: [
      singleGap(
        "qt1",
        "She’s from Madrid,",
        [{ gapId: "g1" }],
        ["isn't she"],
        "A positive statement with 'be' takes a negative tag: isn't she?"
      ),
      singleGap(
        "qt2",
        "You play the guitar,",
        [{ gapId: "g1" }],
        ["don't you"],
        "A positive present simple statement takes a negative 'do' tag: don't you?"
      ),
      singleGap(
        "qt3",
        "We aren't meeting at six,",
        [{ gapId: "g1" }],
        ["are we"],
        "A negative present continuous statement takes a positive tag: are we?"
      ),
      singleGap(
        "qt4",
        "It was expensive,",
        [{ gapId: "g1" }],
        ["wasn't it"],
        "A positive past simple 'be' statement takes a negative tag: wasn't it?"
      ),
      singleGap(
        "qt5",
        "They finished early,",
        [{ gapId: "g1" }],
        ["didn't they"],
        "A positive past simple statement takes a negative 'did' tag."
      ),
      singleGap(
        "qt6",
        "She wasn't studying all night,",
        [{ gapId: "g1" }],
        ["was she"],
        "A negative past continuous statement takes a positive tag."
      ),
      singleGap(
        "qt7",
        "He’s already eaten,",
        [{ gapId: "g1" }],
        ["hasn't he"],
        "Present perfect positive statements take a negative 'has' tag."
      ),
      singleGap(
        "qt8",
        "They hadn't left before noon,",
        [{ gapId: "g1" }],
        ["had they"],
        "A negative past perfect statement takes a positive tag."
      ),
      singleGap(
        "qt9",
        "She’s going to call later,",
        [{ gapId: "g1" }],
        ["isn't she"],
        "With 'going to', keep the auxiliary 'be' in the tag: isn't she?"
      ),
      singleGap(
        "qt10",
        "They won't be working on Friday,",
        [{ gapId: "g1" }],
        ["will they"],
        "A negative future continuous statement takes a positive 'will' tag."
      ),
      singleGap(
        "qt11",
        "He’ll have finished by six,",
        [{ gapId: "g1" }],
        ["won't he"],
        "A positive future perfect statement usually takes a negative tag: won't he?"
      ),
      singleGap(
        "qt12",
        "We shouldn't start now,",
        [{ gapId: "g1" }],
        ["should we"],
        "A negative modal statement takes a positive tag: should we?"
      ),
      singleGap(
        "qt13",
        "They must be tired,",
        [{ gapId: "g1" }],
        ["mustn't they"],
        "A positive 'must' statement takes a negative tag."
      ),
      singleGap(
        "qt14",
        "She could have told us,",
        [{ gapId: "g1" }],
        ["couldn't she"],
        "A positive modal perfect statement takes a negative tag."
      ),
      singleGap(
        "qt15",
        "Close the window,",
        [{ gapId: "g1" }],
        ["will you", "would you", "can you", "can't you"],
        "Imperatives often take 'will you?' as the standard tag. Other polite variants are common too."
      ),
      singleGap(
        "qt16",
        "Don’t be late,",
        [{ gapId: "g1" }],
        ["will you"],
        "Negative imperatives typically take 'will you?'"
      ),
      singleGap(
        "qt17",
        "Let’s start the meeting,",
        [{ gapId: "g1" }],
        ["shall we"],
        "After 'Let's...', the normal tag is 'shall we?'"
      ),
      singleGap(
        "qt18",
        "He used to smoke,",
        [{ gapId: "g1" }],
        ["didn't he"],
        "With 'used to', the tag is usually formed with 'did': didn't he?"
      ),
      singleGap(
        "qt19",
        "They would visit every summer,",
        [{ gapId: "g1" }],
        ["wouldn't they"],
        "A positive 'would' statement takes a negative tag."
      ),
      singleGap(
        "qt20",
        "Nobody called,",
        [{ gapId: "g1" }],
        ["did they"],
        "Negative words like 'nobody' make the sentence negative in meaning, so the tag is positive."
      ),
      singleGap(
        "qt21",
        "Nothing works in this old laptop,",
        [{ gapId: "g1" }],
        ["does it"],
        "Negative words like 'nothing' take a positive tag."
      ),
      singleGap(
        "qt22",
        "They haven't been waiting long,",
        [{ gapId: "g1" }],
        ["have they"],
        "A negative present perfect continuous statement takes a positive tag."
      ),
      singleGap(
        "qt23",
        "The match was postponed,",
        [{ gapId: "g1" }],
        ["wasn't it"],
        "A positive passive statement still follows the normal auxiliary pattern: wasn't it?"
      ),
    ],
  },
  {
    id: "passive-voice-reformulation",
    title: "Passive Voice Reformulation",
    shortDescription: "Rewrite active sentences in the passive.",
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
];

export function getHubGrammarActivity(activityId) {
  return HUB_GRAMMAR_ACTIVITIES.find((activity) => activity.id === activityId) || null;
}
