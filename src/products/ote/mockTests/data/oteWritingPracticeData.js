export const OTE_WRITING_PRACTICE_SETS = {
  email: [
    {
      id: "email-informal-1",
      title: "Email Practice 1 (Informal)",
      type: "email",
      typeLabel: "Email",
      register: "informal",
      registerLabel: "Informal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You and your friend Alex are planning a surprise birthday party for another friend. First read the email from Alex. Then write an email to Alex, including the three notes you have made.",
      replyTo: "Alex",
      replySubject: "Re: Surprise party for Leo!",
      email: {
        from: "Alex",
        subject: "Surprise party for Leo!",
        greeting: "Hey!",
        paragraphs: ["I've been thinking about Leo's surprise party next week. It's going to be great if we can pull it off!"],
        prompts: [
          {
            question: "Should we host the party at my house or rent a room at the local bowling alley? What do you think?",
            highlight: "host the party at my house or rent a room at the local bowling alley",
            note: "Choose one and why",
          },
          {
            question: "I can order some pizzas, but maybe we need some other snacks too. Any ideas?",
            highlight: "some other snacks too. Any ideas?",
            note: "Suggest snacks",
          },
          {
            question: "By the way, my sister wants to come along and help us set up the decorations.",
            highlight: "my sister wants to come along and help us set up the decorations",
            note: "Great!",
          },
        ],
        closing: ["Catch you later,", "Alex"],
      },
    },
    {
      id: "email-informal-2",
      title: "Email Practice 2 (Informal)",
      type: "email",
      typeLabel: "Email",
      register: "informal",
      registerLabel: "Informal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "Your friend Taylor wants you to join a local sports club together. First read the email from Taylor. Then write an email to Taylor, including the three notes you have made.",
      replyTo: "Taylor",
      replySubject: "Re: Tennis club",
      email: {
        from: "Taylor",
        subject: "Tennis club",
        greeting: "Hi there,",
        paragraphs: ["I just checked the schedule for the local tennis club. They have open sessions starting this weekend and I really want us to sign up."],
        prompts: [
          {
            question: "They have a morning session at 8:00 AM and an afternoon one at 4:00 PM. Which one would be best for you?",
            highlight: "a morning session at 8:00 AM and an afternoon one at 4:00 PM. Which one would be best for you?",
            note: "Say which and why",
          },
          {
            question: "Do you have a spare racket I could borrow, or should I buy a cheap one online?",
            highlight: "Do you have a spare racket I could borrow",
            note: "Explain...",
          },
          {
            question: "I was thinking we could grab some lunch right after our first session to celebrate.",
            highlight: "grab some lunch right after our first session",
            note: "That's a great idea!",
          },
        ],
        closing: ["Best,", "Taylor"],
      },
    },
    {
      id: "email-informal-3",
      title: "Email Practice 3 (Informal)",
      type: "email",
      typeLabel: "Email",
      register: "informal",
      registerLabel: "Informal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "Your friend Morgan is moving to a new apartment and needs some assistance. First read the email from Morgan. Then write an email to Morgan, including the three notes you have made.",
      replyTo: "Morgan",
      replySubject: "Re: Moving next weekend!",
      email: {
        from: "Morgan",
        subject: "Moving next weekend!",
        greeting: "Hey friend,",
        paragraphs: ["The big moving day is finally coming up on Saturday! I have a lot of heavy boxes to carry down to the truck."],
        prompts: [
          {
            question: "Are you free to come over and help me out around 10:00 AM?",
            highlight: "free to come over and help me out around 10:00 AM?",
            note: "Yes, but...",
          },
          {
            question: "I also have some old books and video games I'm giving away. Would you like to have any of them?",
            highlight: "old books and video games I'm giving away. Would you like to have any of them?",
            note: "No thanks - explain",
          },
          {
            question: "Let me know what kind of drinks or takeout food you want me to buy for us while we work.",
            highlight: "what kind of drinks or takeout food you want me to buy for us",
            note: "Suggest...",
          },
        ],
        closing: ["See ya,", "Morgan"],
      },
    },
    {
      id: "email-formal-1",
      title: "Email Practice 1 (Formal)",
      type: "email",
      typeLabel: "Email",
      register: "formal",
      registerLabel: "Formal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You inquired about donating some books to the town library. First read the email from the Head Librarian. Then write an email to Mr Davies, including the three notes you have made.",
      replyTo: "Mr Davies",
      replySubject: "Re: Book donation inquiry",
      email: {
        from: "Mr Davies",
        subject: "Book donation inquiry",
        greeting: "Dear Resident,",
        paragraphs: ["Thank you for contacting the municipal library regarding your offer to donate various items to our collection next month."],
        prompts: [
          {
            question: "We are currently only accepting children's fiction and educational textbooks. Could you please give me the details of what you have?",
            highlight: "children's fiction and educational textbooks. Could you please give me the details of what you have?",
            note: "Give details",
          },
          {
            question: "We usually ask donors to bring the books directly to the front desk, but we can arrange a collection if you have more than three boxes.",
            highlight: "bring the books directly to the front desk, but we can arrange a collection if you have more than three boxes",
            note: "How to deliver?",
          },
          {
            question: "Would you be interested in attending our evening community book fair as a volunteer guest?",
            highlight: "attending our evening community book fair as a volunteer guest",
            note: "Thanks but no",
          },
        ],
        closing: ["Yours sincerely,", "Mr Davies", "Head Librarian"],
      },
    },
    {
      id: "email-formal-2",
      title: "Email Practice 2 (Formal)",
      type: "email",
      typeLabel: "Email",
      register: "formal",
      registerLabel: "Formal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You asked for information about an upcoming evening cooking course. First read the email from the course instructor. Then write an email to Ms Oliver, including the three notes you have made.",
      replyTo: "Ms Oliver",
      replySubject: "Re: Weekend Baking Course",
      email: {
        from: "Ms Oliver",
        subject: "Weekend Baking Course",
        greeting: "Dear Applicant,",
        paragraphs: ["Thank you for your interest in our upcoming baking workshop series at the culinary center."],
        prompts: [
          {
            question: "We offer two different sessions: a beginner bread-making class or an advanced pastry class. Please let us know which one you prefer.",
            highlight: "a beginner bread-making class or an advanced pastry class. Please let us know which one you prefer",
            note: "Choose one",
          },
          {
            question: "Please note that all participants must bring their own apron and containers, as we do not provide these.",
            highlight: "bring their own apron and containers",
            note: "No problem",
          },
          {
            question: "If you have any food allergies or specific dietary restrictions, please inform us as soon as possible.",
            highlight: "food allergies or specific dietary restrictions",
            note: "Explain...",
          },
        ],
        closing: ["Best wishes,", "Ms Oliver", "Course Coordinator"],
      },
    },
    {
      id: "email-formal-3",
      title: "Email Practice 3 (Formal)",
      type: "email",
      typeLabel: "Email",
      register: "formal",
      registerLabel: "Formal",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      intro: "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You are a regular member of a community sports center. First read the email from the facility manager. Then write an email to Mr Harrison, including the three notes you have made.",
      replyTo: "Mr Harrison",
      replySubject: "Re: Gym facility improvements",
      email: {
        from: "Mr Harrison",
        subject: "Gym facility improvements",
        greeting: "Dear Member,",
        paragraphs: ["The management team is planning to upgrade the community center gym over the summer break. We want to ensure these changes benefit our members."],
        prompts: [
          {
            question: "We are considering adding either a new cardio zone or a dedicated stretching area. What do you think would be more useful?",
            highlight: "adding either a new cardio zone or a dedicated stretching area. What do you think would be more useful?",
            note: "Say which and why",
          },
          {
            question: "We would also appreciate any other specific suggestions you have regarding our opening hours or equipment.",
            highlight: "suggestions you have regarding our opening hours or equipment",
            note: "Suggest...",
          },
          {
            question: "We are looking for a few members to join an advisory focus group meeting next Tuesday evening. Would you be able to attend?",
            highlight: "join an advisory focus group meeting next Tuesday evening. Would you be able to attend?",
            note: "Not Tuesday - offer alternative",
          },
        ],
        closing: ["Yours faithfully,", "Mr Harrison", "Facility Manager"],
      },
    },
  ],
  essay: [
    {
      id: "essay-school-uniforms",
      title: "Essay Practice 1",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Education & Student Life",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about school life and clothing. Your teacher has asked you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "Should all school students be required to wear uniforms?",
      instruction: "Write your essay.",
    },
    {
      id: "essay-homework-every-day",
      title: "Essay Practice 2",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Education & Teenagers",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about school workloads. Your teacher now wants you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "Is it a good idea for teachers to give students homework every day?",
      instruction: "Write your essay.",
    },
    {
      id: "essay-online-shopping",
      title: "Essay Practice 3",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Consumerism & Local Communities",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about shopping habits. Your teacher has asked you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "Is online shopping better than shopping in local stores?",
      instruction: "Write your essay.",
    },
    {
      id: "essay-fast-food-regulation",
      title: "Essay Practice 4",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Health & Diet",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about health and nutrition. Your teacher now wants you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "Should governments limit the amount of fast food people can buy?",
      instruction: "Write your essay.",
    },
    {
      id: "essay-zoos",
      title: "Essay Practice 5",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Environment & Animals",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about wild animals and captivity. Your teacher has asked you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "What are the advantages and disadvantages of keeping animals in zoos?",
      instruction: "Write your essay.",
    },
    {
      id: "essay-travel-alone-or-group",
      title: "Essay Practice 6",
      type: "essay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Tourism & Leisure",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an essay. Write 100-160 words.",
      context:
        "You have had a class discussion about travel and holidays. Your teacher now wants you to write an essay.",
      promptLabel: "The title of the essay is:",
      prompt: "Is it better to travel alone or with a group of friends?",
      instruction: "Write your essay.",
    },
  ],
  articleReview: [
    {
      id: "article-family-celebration",
      title: "Article Practice 1",
      type: "article",
      typeLabel: "Article",
      noun: "article",
      theme: "Social life & traditions",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an article. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "An unforgettable celebration",
      prompt:
        "Tell us about a special family celebration or traditional festival you attended. What were you celebrating, and what did people do there? Why is it a great memory for you? The best articles will appear on our website.",
      instruction: "Write your article.",
    },
    {
      id: "article-dream-job",
      title: "Article Practice 2",
      type: "article",
      typeLabel: "Article",
      noun: "article",
      theme: "Future plans & careers",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an article. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "My future career",
      prompt:
        "What is your dream job and what sort of things do people do in that line of work? What skills or training do you need to do it? Write an article and tell us. We will publish the best articles in next month's issue of our magazine.",
      instruction: "Write your article.",
    },
    {
      id: "article-interesting-hobby",
      title: "Article Practice 3",
      type: "article",
      typeLabel: "Article",
      noun: "article",
      theme: "Free time & sports",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write an article. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "An amazing hobby",
      prompt:
        "We want to hear about an interesting hobby or free-time activity that you enjoy. How did you first get started with it? Why do you think other people should try it? The best articles will be published in next month's issue of EZ English Magazine.",
      instruction: "Write your article.",
    },
    {
      id: "review-book",
      title: "Review Practice 1",
      type: "review",
      typeLabel: "Review",
      noun: "review",
      theme: "Media & Entertainment",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write a review. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "Book reviews wanted!",
      prompt:
        "Write a review of a book you have read recently. What was the story or main topic about? What did you like most about the writer's style? Would you recommend it to people your age? We will publish the best reviews in the next issue of E-magazine.",
      instruction: "Write your review.",
    },
    {
      id: "review-film-tv",
      title: "Review Practice 2",
      type: "review",
      typeLabel: "Review",
      noun: "review",
      theme: "Entertainment & Culture",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write a review. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "Write a film review!",
      prompt:
        "Write a review of a movie or a TV series that you watched recently. Who were the main characters and what was the plot like? Was there anything you disliked about it? The best review will win a cinema voucher!",
      instruction: "Write your review.",
    },
    {
      id: "review-gadget",
      title: "Review Practice 3",
      type: "review",
      typeLabel: "Review",
      noun: "review",
      theme: "Technology & Everyday Objects",
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      intro: "You have 25 minutes to write a review. Write 100-160 words.",
      context:
        "You have seen the following advert in an online magazine for English language students.",
      promptLabel: "Gadget reviews!",
      prompt:
        "Write a review of a technological gadget you use often, such as headphones, a smartwatch, or a laptop. What features do you use the most? How reliable is it, and is it worth the money? The best reviews will be published in the magazine next month.",
      instruction: "Write your review.",
    },
  ],
  advancedEssay: [
    {
      id: "advanced-essay-lecture-recordings",
      title: "Advanced Essay Practice 1",
      type: "advancedEssay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Higher education",
      timeSeconds: 30 * 60,
      minWords: 220,
      maxWords: 280,
      intro: "You have 30 minutes to write an essay. Write 220-280 words.",
      setup:
        "You have been discussing the topic of higher education in your class. Your tutor has asked you to write an essay on the following:",
      prompt: "Many universities now record lectures so that students can watch them at a later time.",
      question: "Do you think that this is a positive or a negative development?",
      ideasIntro: "Your essay must include at least two of the following ideas:",
      ideas: [
        "impact on student attendance",
        "impact on the quality of learning",
        "impact on access to education",
      ],
      organizationInstruction:
        "Organize your essay clearly, introducing the topic, providing support for the points you make, and giving a conclusion.",
      instruction: "Write your essay.",
    },
    {
      id: "advanced-essay-city-cars",
      title: "Advanced Essay Practice 2",
      type: "advancedEssay",
      typeLabel: "Essay",
      noun: "essay",
      theme: "Urban transport",
      timeSeconds: 30 * 60,
      minWords: 220,
      maxWords: 280,
      intro: "You have 30 minutes to write an essay. Write 220-280 words.",
      setup:
        "You have been discussing the topic of transport in cities in your class. Your tutor has asked you to write an essay on the following:",
      prompt:
        "Some people say that private cars should be banned from city centres. However, others argue that drivers should remain free to use city roads.",
      question: "Which opinion do you agree with?",
      ideasIntro: "Your essay must include at least two of the following ideas:",
      ideas: [
        "impact on local businesses",
        "impact on air quality",
        "impact on public transport",
      ],
      organizationInstruction:
        "Organize your essay clearly, introducing the topic, providing support for the points you make, and giving a conclusion.",
      instruction: "Write your essay.",
    },
  ],
  advancedSummary: [
    {
      id: "advanced-summary-network-effects",
      title: "Advanced Summary Practice 1",
      type: "advancedSummary",
      typeLabel: "Summary",
      noun: "summary",
      theme: "Economics",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 100,
      intro: "You have 20 minutes to write a summary. Write 80-100 words.",
      setup:
        "You have been learning about an aspect of economics for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.",
      instructions: [
        "Write one paragraph, combining information from the textbook extract and the lecture transcript to summarize the main ideas. Your summary should provide the reader with enough information to understand the main ideas from both texts.",
        "Write full sentences, using your own words where possible.",
        "Do NOT write more than 100 words.",
      ],
      instruction: "Write your summary.",
      sources: [
        {
          title: "Textbook extract",
          text:
            "Some products become more useful as the number of users increases. This is known as a network effect. A telephone, for example, has little value if only one person owns one, but its usefulness grows as more people join the same system. Digital platforms can expand especially quickly because each new user may attract others, creating a cycle of growth. This pattern is common in social media, payment systems and online marketplaces. Large networks can benefit consumers by making it easier to find information, buyers, sellers or services in one place. However, they may also make it difficult for new competitors to enter the market, even when those competitors offer better technology. Users may hesitate to move because their contacts, records or reputation are already connected to the established platform. As a result, network effects can contribute to a small number of companies becoming extremely powerful.",
        },
        {
          title: "Lecture transcript",
          text:
            "'It is tempting to assume that the biggest platform will always win, but, well, the picture is more complicated. People may use several services at the same time, particularly when switching is cheap. A restaurant can advertise on two delivery apps, for instance, and customers can compare both. Trust and quality matter as well: a large network may lose users rapidly if it handles personal data badly or allows unreliable sellers to dominate. Governments and industry groups can also require systems to work together. This interoperability means that people can communicate or transfer information across competing services, reducing the advantage of the largest network. So size creates momentum, but it does not remove the need to provide a useful and dependable service. Network effects are strongest when users feel locked into one system and alternatives cannot connect with it.'",
        },
      ],
      glossary: [
        { term: "reputation", definition: "the opinion that people generally have of someone or something" },
        { term: "established", definition: "having existed successfully for a long time" },
        { term: "interoperability", definition: "the ability of different systems to work together" },
        { term: "momentum", definition: "the force that keeps a process developing after it has begun" },
      ],
      markingGuide: {
        overarchingIdea:
          "Digital platforms can grow rapidly because their value increases with user numbers, although size alone does not guarantee permanent success.",
        mainIdeas: [
          "Network effects create cycles of growth and can make platforms more convenient for users.",
          "Established networks may become powerful because moving to a competitor can mean losing contacts, information or reputation.",
          "Competition remains possible when users can use several services, systems can connect, or a large platform loses trust or quality.",
        ],
      },
    },
    {
      id: "advanced-summary-pollination",
      title: "Advanced Summary Practice 2",
      type: "advancedSummary",
      typeLabel: "Summary",
      noun: "summary",
      theme: "Biology",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 100,
      intro: "You have 20 minutes to write a summary. Write 80-100 words.",
      setup:
        "You have been learning about an aspect of biology for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.",
      instructions: [
        "Write one paragraph, combining information from the textbook extract and the lecture transcript to summarize the main ideas. Your summary should provide the reader with enough information to understand the main ideas from both texts.",
        "Write full sentences, using your own words where possible.",
        "Do NOT write more than 100 words.",
      ],
      instruction: "Write your summary.",
      sources: [
        {
          title: "Textbook extract",
          text:
            "Pollination occurs when pollen is transferred between parts of a flower, allowing seeds and fruit to develop. Wind performs this task for some plants, but many depend on animals, especially insects. Bees are the best-known pollinators, although flies, butterflies, beetles and some birds also play important roles. A diverse pollinator community can make plant reproduction more reliable because different species are active in different weather conditions and visit different kinds of flowers. This matters for natural ecosystems and for agriculture: many crops produce larger or better-quality harvests when insects visit them. Pollination also supports wild plants that provide food and shelter for other animals. Managed honeybee colonies are often brought to farms during flowering, but they cannot fully replace wild pollinators. Relying heavily on one species creates a risk if disease, poor weather or food shortages reduce its numbers.",
        },
        {
          title: "Lecture transcript",
          text:
            "'We have seen major declines in some pollinator populations, and there is no single cause. The loss of flowering habitats leaves insects with less food and fewer nesting places. Certain pesticides can kill them directly or, er, affect their ability to navigate and reproduce. Disease and climate change add further pressure. Farmers can help by leaving strips of wild flowers beside fields, reducing pesticide use and providing nesting areas. These measures do more than protect wildlife. In one study, farms with suitable habitat attracted a wider range of insects and achieved more stable fruit production, even when honeybee activity was low. This is especially important as growing seasons shift. The key point is diversity: protecting several pollinator species makes the whole system less dependent on any one of them. Conservation therefore supports both ecosystems and the long-term security of food production.'",
        },
      ],
      glossary: [
        { term: "colony", definition: "a group of insects of the same type living together" },
        { term: "nesting", definition: "connected with making or using a place to lay eggs" },
        { term: "navigate", definition: "find the correct direction while travelling" },
        { term: "stable", definition: "unlikely to change suddenly or fail" },
      ],
      markingGuide: {
        overarchingIdea:
          "A diverse population of pollinators is essential to natural ecosystems and dependable food production.",
        mainIdeas: [
          "Animal pollination enables many wild plants and crops to reproduce and produce good-quality fruit or seeds.",
          "Different pollinator species work under different conditions, so managed honeybees cannot fully replace wild populations.",
          "Habitat loss, pesticides, disease and climate change threaten pollinators, while flower strips, nesting areas and reduced pesticide use can protect them and stabilize harvests.",
        ],
      },
    },
  ],
};

export function getOteWritingPracticeGroups() {
  return [
    { id: "email", label: "Email", sets: OTE_WRITING_PRACTICE_SETS.email },
    { id: "essay", label: "Essay", sets: OTE_WRITING_PRACTICE_SETS.essay },
    { id: "article-review", label: "Article / Review", sets: OTE_WRITING_PRACTICE_SETS.articleReview },
    { id: "advanced-essay", label: "Advanced Essay", sets: OTE_WRITING_PRACTICE_SETS.advancedEssay },
    { id: "advanced-summary", label: "Advanced Summary", sets: OTE_WRITING_PRACTICE_SETS.advancedSummary },
  ];
}

export function getOteWritingPracticeGroup(section = "email") {
  return getOteWritingPracticeGroups().find((group) => group.id === section) || getOteWritingPracticeGroups()[0];
}

export function getOteWritingPracticeSet(setId = "") {
  return Object.values(OTE_WRITING_PRACTICE_SETS)
    .flat()
    .find((set) => set.id === setId) || OTE_WRITING_PRACTICE_SETS.email[0];
}

export function getOteWritingPracticeGroupForSet(setId = "") {
  return getOteWritingPracticeGroups().find((group) => group.sets.some((set) => set.id === setId)) || getOteWritingPracticeGroups()[0];
}
