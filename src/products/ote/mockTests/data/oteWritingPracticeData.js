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
};

export function getOteWritingPracticeGroups() {
  return [
    { id: "email", label: "Email", sets: OTE_WRITING_PRACTICE_SETS.email },
    { id: "essay", label: "Essay", sets: OTE_WRITING_PRACTICE_SETS.essay },
    { id: "article-review", label: "Article / Review", sets: OTE_WRITING_PRACTICE_SETS.articleReview },
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
