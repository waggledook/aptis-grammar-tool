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
            "Some products become more useful as the number of users increases, a pattern known as a network effect. A telephone, for example, has little value if only one person owns one, but becomes more useful as others join the same system. Digital platforms can therefore grow rapidly because each new user may attract more participants. This is common in social media, payment systems and online marketplaces. Large networks can make it easier to find information, buyers, sellers or services in one place. However, their size can also discourage competition. People may be unwilling to leave an established platform if their contacts, records or reputation are stored there, even when another service offers better technology. This creates switching costs and may allow a small number of companies to gain considerable market power. The advantage is strongest when users depend on a single network and competing systems cannot exchange information with it.",
        },
        {
          title: "Lecture transcript",
          text:
            "'Now, a large network does not automatically remain successful. Its advantage depends partly on how difficult it is for users to choose alternatives. When switching is cheap, people may use several services at once; restaurants, for instance, often advertise through more than one delivery app. Systems can also be required to work together, allowing users to communicate or transfer information across competing platforms. This interoperability weakens the barrier created by network size. Trust and quality matter as well. A dominant platform may, er, lose users if it handles personal data badly or allows unreliable sellers to become common. So network effects create momentum, but they do not remove the need to provide a useful and dependable service. Size gives a platform its greatest protection when users are locked in and alternatives cannot connect with it.'",
        },
      ],
      glossary: [
        { term: "reputation", definition: "the opinion that people generally have of someone or something" },
        { term: "switching costs", definition: "the disadvantages or losses involved in changing to another product or service" },
        { term: "interoperability", definition: "the ability of different systems to work together" },
        { term: "momentum", definition: "the force that keeps a process developing after it has begun" },
      ],
      markingGuide: {
        overarchingIdea:
          "Network effects can help digital platforms grow and become powerful, but their advantage depends on users being locked in and on competitors being unable to connect.",
        mainIdeas: [
          {
            id: "idea-1",
            idea: "A product or platform becomes more useful and can grow more rapidly as its number of users increases.",
            supportingDetails: [
              { source: "textbook", detail: "Each new platform user may attract further participants." },
              { source: "textbook", detail: "Large networks make it easier to find information, buyers, sellers or services." },
              { source: "lecture", detail: "Network size creates momentum." },
            ],
          },
          {
            id: "idea-2",
            idea: "Established platforms can gain market power because users may find it difficult or costly to leave.",
            supportingDetails: [
              { source: "textbook", detail: "Users may lose contacts, records or reputation by changing platforms." },
              { source: "textbook", detail: "This can discourage new competitors even when they have better technology." },
              { source: "lecture", detail: "Network effects are strongest when users are locked into one service." },
              { source: "lecture", detail: "Using several platforms is easier when switching is cheap." },
            ],
          },
          {
            id: "idea-3",
            idea: "Large networks do not automatically remain dominant because competition, connectivity, trust and quality still matter.",
            supportingDetails: [
              { source: "lecture", detail: "Users may use several competing services." },
              { source: "lecture", detail: "Interoperability allows different systems to communicate or exchange information." },
              { source: "lecture", detail: "Poor data handling or unreliable sellers can cause users to leave." },
              { source: "textbook", detail: "Competitors may offer better technology, although switching barriers can prevent users moving." },
            ],
          },
        ],
        crossTextLinks: [
          { mainIdeaId: "idea-1", explanation: "The lecture's reference to momentum supports the textbook's explanation of the cycle of growth." },
          { mainIdeaId: "idea-2", explanation: "The textbook explains the causes of lock-in, while the lecture explains when that lock-in is strong or weak." },
          { mainIdeaId: "idea-3", explanation: "The textbook establishes the market barrier, while the lecture explains how that barrier can be reduced." },
        ],
        lowPriorityDetails: [
          { source: "textbook", detail: "The telephone example." },
          { source: "textbook", detail: "The complete list of social media, payment systems and online marketplaces." },
          { source: "lecture", detail: "The restaurant and delivery-app example." },
          { source: "lecture", detail: "Both the personal-data and unreliable-seller examples; one would be enough." },
        ],
        modelSummary:
          "Network effects make products more valuable as participation grows, allowing digital platforms to expand rapidly and offer users convenient access to information and services. Established networks may also gain market power because people risk losing contacts, records or reputation when switching. However, size does not guarantee permanent dominance. Users can choose several platforms when switching is cheap, while interoperability allows competing systems to connect. Poor quality or loss of trust may also drive users away, so network effects are strongest when customers are locked into one dependable system.",
        commonWeaknesses: [
          "Describing the benefits of large networks but omitting lock-in.",
          "Listing the lecture's exceptions without explaining what a network effect is.",
          "Treating size as a guarantee of success.",
          "Spending too many words on the telephone or delivery-app examples.",
          "Summarizing the textbook first and the lecture second without linking them.",
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
            "Pollination transfers pollen between parts of a flower, allowing seeds and fruit to develop. Wind performs this task for some plants, but many depend on animals, especially insects. Animal pollination supports wild plants that provide food and shelter for other species, and many crops produce larger or better-quality harvests when insects visit them. A diverse pollinator community makes reproduction more reliable because different species are active in different weather conditions and visit different flowers. Managed honeybee colonies are often taken to farms during flowering, but they cannot fully replace wild pollinators. Heavy dependence on one species creates a risk if disease, poor weather or food shortages reduce its numbers. Pollinators are also threatened by the loss of flowering habitats, pesticides and climate change. Protecting a range of species is therefore important for both natural ecosystems and dependable food production.",
        },
        {
          title: "Lecture transcript",
          text:
            "'So, what can farms actually do to protect pollinators? Leaving strips of wild flowers beside fields provides food and nesting places, while reducing pesticide use lowers the risk of insects being killed or, er, losing their ability to navigate and reproduce. These measures can also benefit farmers. In one study, fields surrounded by suitable habitat attracted a wider range of insects and produced more stable fruit harvests, even when honeybee activity was low. This matters because different pollinators work under different conditions, particularly as weather patterns and growing seasons change. Providing nesting areas can help species that do not live in managed hives, although the most effective action will vary between farms. The key point is that conservation should support several species rather than relying only on honeybees. A more diverse pollinator population makes the whole agricultural system less vulnerable when one species declines.'",
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
          "Protecting a diverse population of pollinators supports natural ecosystems and makes food production more reliable.",
        mainIdeas: [
          {
            id: "idea-1",
            idea: "Animal pollination enables wild plants and many crops to reproduce.",
            supportingDetails: [
              { source: "textbook", detail: "Pollination allows seeds and fruit to develop." },
              { source: "textbook", detail: "Wild plants support other species by providing food and shelter." },
              { source: "textbook", detail: "Insect visits can improve the size or quality of crop harvests." },
              { source: "lecture", detail: "Farms with suitable pollinator habitat achieved more stable fruit production." },
            ],
          },
          {
            id: "idea-2",
            idea: "A diverse group of pollinators is more dependable than relying mainly on managed honeybees.",
            supportingDetails: [
              { source: "textbook", detail: "Different species work in different weather and visit different flowers." },
              { source: "textbook", detail: "Managed honeybees cannot fully replace wild pollinators." },
              { source: "lecture", detail: "Diverse insects stabilized harvests when honeybee activity was low." },
              { source: "lecture", detail: "A system with several species is less vulnerable when one declines." },
            ],
          },
          {
            id: "idea-3",
            idea: "Pollinators face several threats, but farms can protect them through changes in land and pesticide management.",
            supportingDetails: [
              { source: "textbook", detail: "Habitat loss, pesticides, disease, food shortages and climate change create risks." },
              { source: "lecture", detail: "Wild-flower strips provide food and nesting places." },
              { source: "lecture", detail: "Reducing pesticide use protects navigation and reproduction." },
              { source: "lecture", detail: "Nesting areas can support species that do not use managed hives." },
            ],
          },
        ],
        crossTextLinks: [
          { mainIdeaId: "idea-1", explanation: "The textbook explains why pollination matters generally, while the lecture provides agricultural evidence of its benefits." },
          { mainIdeaId: "idea-2", explanation: "The lecture's farm study illustrates the textbook's broader claim that diversity increases reliability." },
          { mainIdeaId: "idea-3", explanation: "The textbook identifies the threats, while the lecture develops practical responses." },
        ],
        lowPriorityDetails: [
          { source: "textbook", detail: "The fact that wind pollinates some plants." },
          { source: "textbook", detail: "Detailed distinctions between flowers visited by individual species." },
          { source: "lecture", detail: "The precise circumstances of the farm study." },
          { source: "lecture", detail: "The qualification that different measures work on different farms." },
          { source: "both", detail: "Listing every threat and every conservation method." },
        ],
        modelSummary:
          "Animal pollination enables many wild plants and crops to reproduce, supporting ecosystems and food production. A diverse group of pollinators is more reliable because species visit different flowers and remain active under different conditions, meaning managed honeybees cannot replace wild insects completely. Habitat loss, pesticides, disease and climate change threaten these populations. Farms can help through flower strips, nesting areas and reduced pesticide use. Such measures attract more species and can stabilize harvests when honeybee activity falls, making agriculture less dependent on any single pollinator.",
        commonWeaknesses: [
          "Writing mainly about threats and failing to explain why pollination matters.",
          "Referring only to honeybees and ignoring species diversity.",
          "Listing conservation measures without linking them to stable harvests.",
          "Including every threat and solution instead of selecting representative details.",
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
