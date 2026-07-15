export const OTE_WRITING_MOCKS = {
  "writing-1": {
    id: "writing-1",
    title: "OTE Writing Mock 1",
    moduleLabel: "Writing",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      title: "Email",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      recommendedTime: "20 minutes",
      intro:
        "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You are planning a weekend activity with a friend. First read the email from your friend Alex. Then write an email to Alex, including the three notes you have made.",
      replyTo: "Alex",
      replySubject: "Re: Weekend bike trip",
      email: {
        from: "Alex",
        subject: "Weekend bike trip",
        greeting: "Hi there,",
        paragraphs: [
          "I've been looking at maps for our cycling trip this Saturday.",
        ],
        prompts: [
          {
            question: "I think we should ride up to the mountain lake. Do you agree?",
            note: "Yes - great idea!",
          },
          {
            question:
              "There are two different routes we can take. One is short but very steep, and the other is flat but takes an hour longer. Which path do you think would be best for us?",
            note: "Say which route and why",
          },
          {
            question:
              "Also, we need to decide what to do about lunch. Should we pack a picnic or stop at that small cafe near the water?",
            note: "Thanks, but let's...",
          },
        ],
        closing: ["Let me know what you think!", "Alex"],
      },
    },
    task2: {
      id: "task-2",
      number: 2,
      title: "Extended Writing",
      choiceSeconds: 2 * 60,
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      recommendedTime: "25 minutes",
      chooserIntro: "Choose one of the questions below.",
      chooserCopy: [
        "You have two minutes to choose.",
        "After two minutes, the computer chooses a question for you.",
      ],
      options: {
        essay: {
          id: "essay",
          label: "Write Essay",
          noun: "essay",
          title: "Essay",
          intro:
            "You have 25 minutes to write an essay. Write 100-160 words.",
          context:
            "You have had a class discussion about school schedules. Your teacher has asked you to write an essay.",
          promptLabel: "The title of the essay is:",
          prompt: "Should school holidays be shorter so summer breaks are less disruptive?",
          instruction: "Write your essay.",
        },
        article: {
          id: "article",
          label: "Write Article",
          noun: "article",
          title: "Article",
          intro:
            "You have 25 minutes to write an article. Write 100-160 words.",
          context:
            "You have seen the following advert in an online magazine for English language students.",
          promptLabel: "My favourite book or movie",
          prompt:
            "What is your absolute favourite book or movie? What is the story about and why do you love it so much? Write an article and tell us. We will publish the best entries in next month's issue.",
          instruction: "Write your article.",
        },
      },
    },
  },
  "writing-2": {
    id: "writing-2",
    title: "OTE Writing Mock 2",
    moduleLabel: "Writing",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      title: "Email",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      recommendedTime: "20 minutes",
      intro:
        "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You want to enroll in an evening course. First read the email from Mrs Higgins, the admissions coordinator at a local college. Then write an email to Mrs Higgins, including the three notes you have made.",
      replyTo: "Mrs Higgins",
      replySubject: "Re: Photography Course Enrollment",
      email: {
        from: "Mrs Higgins",
        subject: "Photography Course Enrollment",
        greeting: "Dear Applicant,",
        paragraphs: [
          "Thank you for your interest in our Evening Photography Course starting next term.",
        ],
        prompts: [
          {
            question:
              "Please reply with your full name, age, and student ID number if you have one.",
            note: "Give details",
          },
          {
            question:
              "We offer a choice between a Tuesday evening class or a Saturday morning class. Let us know which session fits your schedule better.",
            note: "Explain preference...",
          },
          {
            question:
              "We also offer a 10% discount on the course fees if you bring your own digital camera instead of borrowing ours. Will you be needing to use a college camera?",
            note: "No - say why",
          },
        ],
        closing: ["Best regards,", "Mrs Higgins"],
      },
    },
    task2: {
      id: "task-2",
      number: 2,
      title: "Extended Writing",
      choiceSeconds: 2 * 60,
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      recommendedTime: "25 minutes",
      chooserIntro: "Choose one of the questions below.",
      chooserCopy: [
        "You have two minutes to choose.",
        "After two minutes, the computer chooses a question for you.",
      ],
      options: {
        essay: {
          id: "essay",
          label: "Write Essay",
          noun: "essay",
          title: "Essay",
          intro:
            "You have 25 minutes to write an essay. Write 100-160 words.",
          context:
            "You have had a class discussion on public transport. Your teacher now wants you to write an essay.",
          promptLabel: "The title of the essay is:",
          prompt: "What are the advantages and disadvantages of working while studying at university?",
          instruction: "Write your essay.",
        },
        article: {
          id: "article",
          label: "Write Review",
          noun: "review",
          title: "Review",
          intro:
            "You have 25 minutes to write a review. Write 100-160 words.",
          context:
            "You have seen the following advert in an online magazine for English language students.",
          promptLabel: "Write a review!",
          prompt:
            "Write a review of an app or website you use frequently to study or organize your time. What features does it have? How exactly has it helped you? Are there any aspects that could be improved? The best review will win a technology gift voucher!",
          instruction: "Write your review.",
        },
      },
    },
  },
  "writing-advanced-1": {
    id: "writing-advanced-1",
    title: "OTE Advanced Writing Mock 1",
    moduleLabel: "Writing",
    levelLabel: "Advanced",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      kind: "essay",
      title: "Essay",
      timeSeconds: 30 * 60,
      minWords: 220,
      maxWords: 280,
      recommendedTime: "30 minutes",
      intro: "You have 30 minutes to write an essay. Write 220-280 words.",
      setup:
        "You have been discussing the topic of working hours in your class. Your tutor has asked you to write an essay on the following:",
      prompt: "An increasing number of companies are considering introducing a four-day working week.",
      question: "Do the advantages of this development outweigh the disadvantages?",
      ideasIntro: "Your essay must include at least two of the following ideas:",
      ideas: [
        "impact on employee well-being",
        "impact on business productivity",
        "impact on customer service",
      ],
      organizationInstruction:
        "Organize your essay clearly, introducing the topic, providing support for the points you make, and giving a conclusion.",
      instruction: "Write your essay.",
    },
    task2: {
      id: "task-2",
      number: 2,
      kind: "summary",
      title: "Summary",
      noChoice: true,
      defaultChoice: "summary",
      choiceSeconds: 0,
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 100,
      recommendedTime: "20 minutes",
      options: {
        summary: {
          id: "summary",
          label: "Write Summary",
          noun: "summary",
          kind: "summary",
          title: "Summary",
          introLines: [
            "The clock shows how much time you have to write a summary.",
            "Write 80-100 words.",
          ],
          setup:
            "You have been learning about an aspect of psychology for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.",
          instructions: [
            [
              "Write ",
              { text: "one", bold: true },
              " paragraph, combining information from the textbook extract and the lecture transcript to summarize the ",
              { text: "main ideas", bold: true },
              ". Your summary should provide the reader with enough information to understand the main ideas from both texts.",
            ],
            [
              "Write full sentences, using your ",
              { text: "own words", bold: true },
              " where possible.",
            ],
            [
              "Do ",
              { text: "NOT", bold: true },
              " write more than 100 words.",
            ],
          ],
          instruction: ["Write your ", { text: "summary", bold: true }, "."],
          sources: [
            {
              title: "Textbook extract",
              wordCount: 144,
              text:
                "Memory does not become permanent at the moment information is learned. At first, new material is fragile and can be disrupted by later experiences. During sleep, the brain reactivates patterns of activity connected with recent learning, helping to stabilize and reorganize them. This process is known as memory consolidation. Different stages of sleep appear to support different kinds of memory. Deep sleep is particularly associated with facts and events, while rapid eye movement sleep may contribute more to emotional and practical skills. Sleep before learning is also important because a tired brain is less able to pay attention and form new memories. Even a daytime nap can sometimes improve later recall when it contains enough deep sleep. However, sleep cannot preserve information that was never understood properly. Effective learning still depends on focused study, meaningful connections and opportunities to retrieve what has been learned.",
            },
            {
              title: "Lecture transcript",
              wordCount: 152,
              text:
                "'In one study, two groups learned the same list of word pairs in the evening. One group slept normally, while the other remained awake for much of the night. The next day, the well-rested group remembered considerably more. Now, that does not mean that sleep simply stores a perfect copy of everything. It seems to strengthen some connections and weaken less useful ones. Timing matters too. Sleeping soon after study may protect new memories from interference caused by other information encountered during the day. We also see the opposite effect when students lose sleep before an exam: they may struggle not only to remember previous work but to take in new material. The effect is not limited to schoolwork; similar patterns appear when people practise movements or learn routes. So, er, the practical message is to combine active study with regular sleep rather than replacing revision with a last-minute night of rest.'",
            },
          ],
          glossary: [
            { term: "fragile", definition: "easily damaged or changed" },
            { term: "stabilize", definition: "make something become more fixed or secure" },
            { term: "retrieve", definition: "bring stored information back into the mind" },
            { term: "interference", definition: "the effect of one thing preventing another from working properly" },
          ],
          markingGuide: {
            overarchingIdea:
              "Sleep supports the formation, consolidation and preservation of memory, but it must complement effective study.",
            mainIdeas: [
              {
                id: "idea-1",
                idea: "Sleep consolidates recently learned information by stabilizing and reorganizing memories.",
                supportingDetails: [
                  { source: "textbook", detail: "New memories are initially fragile." },
                  { source: "textbook", detail: "The sleeping brain reactivates patterns linked to recent learning." },
                  { source: "lecture", detail: "The rested group remembered more word pairs than the sleep-deprived group." },
                  { source: "lecture", detail: "Sleep strengthens useful connections and may weaken less useful ones." },
                ],
              },
              {
                id: "idea-2",
                idea: "The timing and type of sleep influence learning and different kinds of memory.",
                supportingDetails: [
                  { source: "textbook", detail: "Deep sleep is linked to facts and events." },
                  { source: "textbook", detail: "Rapid eye movement sleep may support emotional and practical skills." },
                  { source: "textbook", detail: "Sleep before learning improves attention and memory formation." },
                  { source: "lecture", detail: "Sleeping soon after studying protects memories from later interference." },
                  { source: "lecture", detail: "Similar effects occur when learning movements and routes." },
                ],
              },
              {
                id: "idea-3",
                idea: "Sleep deprivation harms both recall and the ability to learn, but sleep cannot compensate for ineffective study.",
                supportingDetails: [
                  { source: "lecture", detail: "Students who lose sleep may struggle to recall previous work and absorb new information." },
                  { source: "textbook", detail: "Sleep cannot preserve material that was not properly understood." },
                  { source: "textbook", detail: "Learning still requires focused study, meaningful connections and retrieval." },
                  { source: "lecture", detail: "Regular sleep should accompany active study rather than replace revision." },
                ],
              },
            ],
            crossTextLinks: [
              { mainIdeaId: "idea-1", explanation: "The lecture experiment illustrates the textbook's explanation of memory consolidation." },
              { mainIdeaId: "idea-2", explanation: "The textbook describes the stages and timing of sleep, while the lecture provides practical and experimental examples." },
            ],
            lowPriorityDetails: [
              { source: "lecture", detail: "The precise design of the word-pair experiment." },
              { source: "textbook", detail: "The daytime-nap example." },
              { source: "both", detail: "Listing every kind of memory." },
              { source: "lecture", detail: "The final reference to last-minute rest." },
            ],
            modelSummary:
              "Sleep helps memories become stable by reactivating and reorganizing recent learning, and rested learners generally recall more than those deprived of sleep. Different sleep stages may support factual, emotional and practical memories, while sleeping soon after study can protect new information from interference. Adequate sleep before learning is also important because tired people struggle to concentrate and absorb material. However, sleep does not preserve information that was poorly understood, so regular rest should support active study, meaningful connections and retrieval practice rather than replace them.",
            commonWeaknesses: [
              "Reporting the experiment without explaining consolidation.",
              "Claiming that sleep simply stores an exact copy of information.",
              "Suggesting that sleep can replace studying.",
              "Discussing sleep stages but omitting sleep before and after learning.",
            ],
          },
        },
      },
    },
  },
  "writing-advanced-2": {
    id: "writing-advanced-2",
    title: "OTE Advanced Writing Mock 2",
    moduleLabel: "Writing",
    levelLabel: "Advanced",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      kind: "essay",
      title: "Essay",
      timeSeconds: 30 * 60,
      minWords: 220,
      maxWords: 280,
      recommendedTime: "30 minutes",
      intro: "You have 30 minutes to write an essay. Write 220-280 words.",
      setup:
        "You have been discussing the topic of tourism in your class. Your tutor has asked you to write an essay on the following:",
      prompt: "Popular tourist destinations should limit the number of visitors they receive each year.",
      question: "How far do you agree or disagree with this statement?",
      ideasIntro: "Your essay must include at least two of the following ideas:",
      ideas: [
        "impact on local communities",
        "impact on the natural environment",
        "impact on tourism income",
      ],
      organizationInstruction:
        "Organize your essay clearly, introducing the topic, providing support for the points you make, and giving a conclusion.",
      instruction: "Write your essay.",
    },
    task2: {
      id: "task-2",
      number: 2,
      kind: "summary",
      title: "Summary",
      noChoice: true,
      defaultChoice: "summary",
      choiceSeconds: 0,
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 100,
      recommendedTime: "20 minutes",
      options: {
        summary: {
          id: "summary",
          label: "Write Summary",
          noun: "summary",
          kind: "summary",
          title: "Summary",
          introLines: [
            "The clock shows how much time you have to write a summary.",
            "Write 80-100 words.",
          ],
          setup:
            "You have been learning about an aspect of environmental science for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.",
          instructions: [
            [
              "Write ",
              { text: "one", bold: true },
              " paragraph, combining information from the textbook extract and the lecture transcript to summarize the ",
              { text: "main ideas", bold: true },
              ". Your summary should provide the reader with enough information to understand the main ideas from both texts.",
            ],
            [
              "Write full sentences, using your ",
              { text: "own words", bold: true },
              " where possible.",
            ],
            [
              "Do ",
              { text: "NOT", bold: true },
              " write more than 100 words.",
            ],
          ],
          instruction: ["Write your ", { text: "summary", bold: true }, "."],
          sources: [
            {
              title: "Textbook extract",
              wordCount: 145,
              text:
                "Cities are often warmer than nearby rural areas, especially after sunset. This urban heat island effect develops because roads, roofs and walls absorb solar energy during the day and release it slowly at night. Dark surfaces usually store more heat than vegetation, while tall buildings can reduce air movement and trap warm air between them. Cities also contain fewer plants, so less heat is removed through evaporation from leaves and soil. The effect is not equal across a city: districts with little shade and large areas of concrete may remain several degrees warmer than greener neighbourhoods. As heat waves become more frequent, this temperature difference can intensify their effects. High night-time temperatures are particularly dangerous because the human body has less opportunity to recover after a hot day. Older people, young children and those with existing health problems face the greatest risks during prolonged heat.",
            },
            {
              title: "Lecture transcript",
              wordCount: 137,
              text:
                "'So, what can city planners actually do about this? Planting trees is one obvious measure because trees provide shade and release water into the air. But, er, they need space, water and long-term care, so they are not a complete answer. Reflective roofs can send more sunlight back into the atmosphere, while green roofs cover buildings with plants and reduce the amount of heat stored. Tests in several cities suggest that combining measures works better than relying on one solution. Location also matters. Cooling projects should be concentrated where temperatures and health risks are highest, rather than only in wealthy central areas. We should remember, too, that air-conditioning may protect individual buildings but releases heat outdoors and increases electricity use. In other words, reducing urban heat requires changes to the wider environment, not simply cooling more rooms.'",
            },
          ],
          glossary: [
            { term: "evaporation", definition: "the process by which liquid changes into gas" },
            { term: "intensify", definition: "become or make something stronger" },
            { term: "prolonged", definition: "continuing for a long time" },
            { term: "reflective", definition: "able to send light or heat back from a surface" },
          ],
          markingGuide: {
            overarchingIdea:
              "Urban design causes cities to retain heat, producing unequal health risks that require combined, city-wide environmental solutions.",
            mainIdeas: [
              {
                id: "idea-1",
                idea: "Buildings, roads and limited vegetation cause urban areas to absorb and retain heat.",
                supportingDetails: [
                  { source: "textbook", detail: "Roads, roofs and walls absorb energy and release it slowly." },
                  { source: "textbook", detail: "Dark surfaces store more heat than vegetation." },
                  { source: "textbook", detail: "Tall buildings restrict air movement." },
                  { source: "textbook", detail: "Fewer plants means less cooling through evaporation." },
                  { source: "lecture", detail: "Trees, green roofs and reflective roofs directly address these causes." },
                ],
              },
              {
                id: "idea-2",
                idea: "The heat island effect is uneven and creates particular risks for vulnerable residents.",
                supportingDetails: [
                  { source: "textbook", detail: "Districts with little shade and extensive concrete remain hotter." },
                  { source: "textbook", detail: "High night-time temperatures prevent the body recovering." },
                  { source: "textbook", detail: "Older people, children and those with health problems face greater risks." },
                  { source: "lecture", detail: "Cooling projects should target the hottest, highest-risk districts." },
                ],
              },
              {
                id: "idea-3",
                idea: "Cities need a combination of environmental measures rather than relying only on air-conditioning.",
                supportingDetails: [
                  { source: "lecture", detail: "Trees provide shade and release water." },
                  { source: "lecture", detail: "Green and reflective roofs reduce stored heat." },
                  { source: "lecture", detail: "Combinations of measures are more effective." },
                  { source: "lecture", detail: "Air-conditioning increases energy use and releases heat outside." },
                  { source: "textbook", detail: "The variety of physical causes explains why no single measure is sufficient." },
                ],
              },
            ],
            crossTextLinks: [
              { mainIdeaId: "idea-1", explanation: "The textbook explains the physical causes, while the lecture proposes measures that reduce each effect." },
              { mainIdeaId: "idea-2", explanation: "The lecture's recommendation to target projects follows from the textbook's explanation of unequal exposure and vulnerability." },
            ],
            lowPriorityDetails: [
              { source: "textbook", detail: "The exact comparison with nearby rural areas." },
              { source: "lecture", detail: "The practical maintenance requirements of trees." },
              { source: "lecture", detail: "The reference to wealthy central districts." },
              { source: "lecture", detail: "Explaining both disadvantages of air-conditioning in detail." },
            ],
            modelSummary:
              "Cities remain warmer than surrounding areas because dark buildings and roads store heat, tall structures restrict airflow and limited vegetation reduces natural cooling. The effect is greatest in concrete neighbourhoods and during the night, creating particular risks for older people, children and those with health problems. Cities can respond through trees, green roofs and reflective surfaces, with projects concentrated in the hottest and most vulnerable districts. Combining environmental measures is more effective than relying on air-conditioning, which increases electricity use and releases additional heat outdoors.",
            commonWeaknesses: [
              "Listing solutions without explaining why cities become hot.",
              "Describing the physical causes but omitting health risks.",
              "Treating air-conditioning as the main city-wide solution.",
              "Failing to mention that heat and risk vary between neighbourhoods.",
            ],
          },
        },
      },
    },
  },
};

export function getOteWritingMocks() {
  return Object.values(OTE_WRITING_MOCKS);
}

export function getOteWritingMock(mockId = "writing-1") {
  return OTE_WRITING_MOCKS[mockId] || OTE_WRITING_MOCKS["writing-1"];
}
