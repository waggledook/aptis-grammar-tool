const TOPICS = [
  {
    id: "music",
    title: "Music",
    questions: [
      "I'm going to ask you some questions about music. What kind of music do you enjoy listening to?",
      "Can you tell me about the last time you listened to live music?",
      "Do you prefer listening to music alone or with other people?",
    ],
  },
  {
    id: "books-reading",
    title: "Books and reading",
    questions: [
      "I'm going to ask you some questions about reading. What kinds of books or stories do you enjoy?",
      "Tell me about a book you have read recently.",
      "Do you prefer reading for information or reading for pleasure?",
    ],
  },
  {
    id: "films",
    title: "Films",
    questions: [
      "I'm going to ask you some questions about films. What sort of films do you like watching?",
      "Can you describe a film you saw recently?",
      "Do you prefer watching films at home or at the cinema?",
    ],
  },
  {
    id: "free-time",
    title: "Free time",
    questions: [
      "I'm going to ask you some questions about your free time. What do you usually do when you have some free time?",
      "Tell me about something interesting you did last weekend.",
      "Do you prefer having a busy weekend or a relaxing one?",
    ],
  },
  {
    id: "work-study",
    title: "Work and study",
    questions: [
      "I'm going to ask you some questions about work and study. What do you enjoy most about your work or studies?",
      "Tell me about something difficult you learned recently.",
      "Do you prefer working or studying alone or with other people?",
    ],
  },
  {
    id: "holidays",
    title: "Holidays",
    questions: [
      "I'm going to ask you some questions about holidays. What kind of holidays do you enjoy?",
      "Can you tell me about the last holiday you had?",
      "Do you prefer visiting new places or returning to places you already know?",
    ],
  },
  {
    id: "friends",
    title: "Friends",
    questions: [
      "I'm going to ask you some questions about friends. What do you enjoy doing with your friends?",
      "Tell me about the last time you met one of your friends.",
      "Do you prefer having a few close friends or a large group of friends?",
    ],
  },
  {
    id: "celebrations",
    title: "Celebrations",
    questions: [
      "I'm going to ask you some questions about celebrations. Which celebrations are important in your country?",
      "Can you describe the last celebration you went to?",
      "Do you prefer small celebrations or large parties?",
    ],
  },
  {
    id: "animals",
    title: "Animals",
    questions: [
      "I'm going to ask you some questions about animals. What animals do you like?",
      "Can you describe an animal that you know well?",
      "Would you like to have a pet in the future? Why or why not?",
    ],
  },
  {
    id: "weather-seasons",
    title: "Weather and seasons",
    questions: [
      "I'm going to ask you some questions about weather. What kind of weather do you like most?",
      "Tell me about a time when bad weather changed your plans.",
      "Do you prefer summer or winter?",
    ],
  },
  {
    id: "learning-skills",
    title: "Learning new skills",
    questions: [
      "I'm going to ask you some questions about learning new skills. What new skill would you like to learn?",
      "Tell me about the last time you learned to do something new.",
      "Do you prefer learning from a teacher or learning by yourself?",
    ],
  },
  {
    id: "photographs",
    title: "Photographs",
    questions: [
      "I'm going to ask you some questions about photographs. What kinds of things do you like taking photographs of?",
      "Can you tell me about a photograph that is important to you?",
      "Do you prefer taking photographs or being in them?",
    ],
  },
];

export const TOPIC_AUDIO = {
  music: [
    "/audio/ote/speaking/part1-prompts/music-q1.mp3",
    "/audio/ote/speaking/part1-prompts/music-q2.mp3",
    "/audio/ote/speaking/part1-prompts/music-q3.mp3",
  ],
  "books-reading": [
    "/audio/ote/speaking/part1-prompts/books-reading-q1.mp3",
    "/audio/ote/speaking/part1-prompts/books-reading-q2.mp3",
    "/audio/ote/speaking/part1-prompts/books-reading-q3.mp3",
  ],
  films: [
    "/audio/ote/speaking/part1-prompts/films-q1.mp3",
    "/audio/ote/speaking/part1-prompts/films-q2.mp3",
    "/audio/ote/speaking/part1-prompts/films-q3.mp3",
  ],
  "free-time": [
    "/audio/ote/speaking/part1-prompts/free-time-q1.mp3",
    "/audio/ote/speaking/part1-prompts/free-time-q2.mp3",
    "/audio/ote/speaking/part1-prompts/free-time-q3.mp3",
  ],
  "work-study": [
    "/audio/ote/speaking/part1-prompts/work-study-q1.mp3",
    "/audio/ote/speaking/part1-prompts/work-study-q2.mp3",
    "/audio/ote/speaking/part1-prompts/work-study-q3.mp3",
  ],
  holidays: [
    "/audio/ote/speaking/part1-prompts/holidays-q1.mp3",
    "/audio/ote/speaking/part1-prompts/holidays-q2.mp3",
    "/audio/ote/speaking/part1-prompts/holidays-q3.mp3",
  ],
  friends: [
    "/audio/ote/speaking/part1-prompts/friends-q1.mp3",
    "/audio/ote/speaking/part1-prompts/friends-q2.mp3",
    "/audio/ote/speaking/part1-prompts/friends-q3.mp3",
  ],
  celebrations: [
    "/audio/ote/speaking/part1-prompts/celebrations-q1.mp3",
    "/audio/ote/speaking/part1-prompts/celebrations-q2.mp3",
    "/audio/ote/speaking/part1-prompts/celebrations-q3.mp3",
  ],
  animals: [
    "/audio/ote/speaking/part1-prompts/animals-q1.mp3",
    "/audio/ote/speaking/part1-prompts/animals-q2.mp3",
    "/audio/ote/speaking/part1-prompts/animals-q3.mp3",
  ],
  "weather-seasons": [
    "/audio/ote/speaking/part1-prompts/weather-seasons-q1.mp3",
    "/audio/ote/speaking/part1-prompts/weather-seasons-q2.mp3",
    "/audio/ote/speaking/part1-prompts/weather-seasons-q3.mp3",
  ],
  "learning-skills": [
    "/audio/ote/speaking/part1-prompts/learning-skills-q1.mp3",
    "/audio/ote/speaking/part1-prompts/learning-skills-q2.mp3",
    "/audio/ote/speaking/part1-prompts/learning-skills-q3.mp3",
  ],
  photographs: [
    "/audio/ote/speaking/part1-prompts/photographs-q1.mp3",
    "/audio/ote/speaking/part1-prompts/photographs-q2.mp3",
    "/audio/ote/speaking/part1-prompts/photographs-q3.mp3",
  ],
};

export const PRACTICE_SETS = TOPICS.reduce((sets, topic, index) => {
  if (index % 2 !== 0) return sets;
  const secondTopic = TOPICS[index + 1];
  sets.push({
    id: `set-${sets.length + 1}`,
    title: `${topic.title} + ${secondTopic.title}`,
    description: `Answer the two fixed practice questions, then talk about ${topic.title.toLowerCase()} and ${secondTopic.title.toLowerCase()}.`,
    topics: [topic, secondTopic],
  });
  return sets;
}, []);

export const ADVANCED_PRACTICE_SETS = [
  {
    id: "advanced-set-1",
    title: "Food, Home and Technology",
    description: "Answer the two fixed practice questions, then respond to four Advanced interview questions.",
    questions: [
      "Thinking about food, tell me about a meal you particularly enjoyed recently.",
      "What makes a good place to live?",
      "How has the way you use technology changed in recent years?",
      "Finally, if you could learn one practical skill immediately, what would you choose, and why?",
    ],
    audio: [
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-1-q3.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-1-q4.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-1-q5.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-1-q6.mp3",
    ],
  },
  {
    id: "advanced-set-2",
    title: "Music, Neighbours and Priorities",
    description: "Answer the two fixed practice questions, then respond to four Advanced interview questions.",
    questions: [
      "Thinking about music, tell me about something you enjoy listening to.",
      "What qualities make someone a good neighbour?",
      "How did an important decision you made affect your life?",
      "Finally, if you had much more free time, how do you think your priorities would change?",
    ],
    audio: [
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-2-q3.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-2-q4.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-2-q5.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-2-q6.mp3",
    ],
  },
  {
    id: "advanced-set-3",
    title: "Home, People and Risk",
    description: "Answer the two fixed practice questions, then respond to four Advanced interview questions.",
    questions: [
      "Thinking about your home, which room do you spend the most time in, and why?",
      "Can you tell me about a person whose company you enjoy?",
      "In what ways have shopping habits changed during your lifetime?",
      "Finally, when do you think it is worth taking a risk?",
    ],
    audio: [
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-3-q3.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-3-q4.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-3-q5.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-3-q6.mp3",
    ],
  },
  {
    id: "advanced-set-4",
    title: "Health, Traditions and Change",
    description: "Answer the two fixed practice questions, then respond to four Advanced interview questions.",
    questions: [
      "Thinking about health, what do you do to stay physically or mentally well?",
      "What is one tradition from your country that you value?",
      "Tell me about a time when you had to adapt to an unexpected situation.",
      "Finally, if you could change one aspect of modern life, what would it be?",
    ],
    audio: [
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-4-q3.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-4-q4.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-4-q5.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-4-q6.mp3",
    ],
  },
  {
    id: "advanced-set-5",
    title: "Work, Concentration and Lessons",
    description: "Answer the two fixed practice questions, then respond to four Advanced interview questions.",
    questions: [
      "Thinking about work or study, which tasks do you find most satisfying?",
      "Can you describe a place where you can concentrate well?",
      "How has your idea of success changed over time?",
      "Finally, what is the most valuable lesson you have learned from a difficult experience?",
    ],
    audio: [
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-5-q3.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-5-q4.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-5-q5.mp3",
      "/audio/ote/speaking/advanced/part1-practice/advanced-set-5-q6.mp3",
    ],
  },
];

