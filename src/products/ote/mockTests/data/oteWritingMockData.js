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
              "Sleep supports the formation and preservation of memories but must complement effective learning.",
            mainIdeas: [
              "Sleep helps consolidate memories by strengthening and reorganizing recently learned information.",
              "Different sleep stages may support different kinds of memory, and sleep both before and soon after learning is beneficial.",
              "Sleep deprivation damages recall and the ability to absorb new information, but sleep cannot compensate for ineffective study.",
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
              "The design of urban areas causes them to retain heat, creating unequal health risks that require city-wide solutions.",
            mainIdeas: [
              "Buildings and hard, dark surfaces store heat, while limited vegetation and air movement reduce natural cooling.",
              "The greatest danger occurs in hotter, less-green districts and during the night, particularly for vulnerable residents.",
              "Cities can reduce temperatures through trees, green or reflective roofs and carefully targeted projects; air-conditioning alone is insufficient.",
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
