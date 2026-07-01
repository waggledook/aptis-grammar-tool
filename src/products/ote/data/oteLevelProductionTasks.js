export const OTE_LEVEL_PRODUCTION_TASKS = {
  speaking: [
    {
      id: "ote-diagnostic-speaking-personal-1",
      title: "Pregunta personal",
      preparationSeconds: 0,
      responseSeconds: 20,
      weight: 15,
      prompt: "Tell us about an activity you enjoy doing in your free time. How often do you do it, and why do you enjoy it?",
      instructions: "Empieza a hablar cuando escuches el tono. Tienes 20 segundos.",
      expectedContent: ["identify an activity", "say how often you do it", "explain why you enjoy it"],
    },
    {
      id: "ote-diagnostic-speaking-voicemail-1",
      title: "Mensaje de voz",
      preparationSeconds: 20,
      responseSeconds: 40,
      weight: 35,
      prompt:
        "You are taking a weekend photography course at a community centre. The next class has been moved to Friday evening, but you cannot attend. Leave a voicemail for the course manager.",
      bulletPoints: [
        "say which course you are taking",
        "explain why you cannot attend on Friday",
        "ask what you can do instead",
      ],
      instructions: "Tienes 20 segundos para preparar y 40 segundos para grabar tu mensaje.",
      expectedContent: ["identify the course", "explain the problem", "make a clear request", "use a suitable neutral tone"],
    },
    {
      id: "ote-diagnostic-speaking-talk-1",
      title: "Respuesta larga",
      preparationSeconds: 30,
      responseSeconds: 60,
      weight: 50,
      topic: "Improving life in a town",
      prompt:
        "Your town wants to make life healthier and easier for local people. Choose two ideas. Compare them and explain how they could improve people's lives. Say which of the two would be more useful, and why.",
      imageIdeas: ["A public park", "A protected cycle route", "A bus or public transport service", "A local sports centre"],
      instructions: "Tienes 30 segundos para preparar y 60 segundos para responder.",
      expectedContent: ["choose two ideas", "compare benefits", "select one idea as more useful", "justify your choice"],
    },
  ],
  writing: {
    id: "ote-diagnostic-writing-email-1",
    title: "Email de registro",
    recommendedSeconds: 7 * 60,
    targetWordsMin: 60,
    targetWordsMax: 100,
    inputEmail: {
      from: "Elena Ruiz, Course Admissions",
      subject: "English course registration",
      body: [
        "Dear Candidate,",
        "Thank you for your interest in our English courses. Before we recommend a class, we need a little more information about your learning goals.",
        "Which course are you interested in? Why do you want to improve your English? When would you like to start?",
        "Kind regards,",
        "Elena Ruiz",
        "Course Admissions",
      ],
    },
    prompt: "Write a polite email to the admissions team.",
    bulletPoints: [
      "say which course or level you are interested in",
      "explain why you want to improve your English",
      "say when you would like to start",
    ],
  },
};

export const OTE_ADVANCED_LEVEL_PRODUCTION_TASKS = {
  speaking: [
    {
      id: "ote-advanced-diagnostic-speaking-personal-1",
      title: "Pregunta personal",
      preparationSeconds: 0,
      responseSeconds: 30,
      weight: 15,
      prompt: "Tell us about a skill you would like to improve. Why would it be useful to you, and what could you do to improve it?",
      instructions: "Empieza a hablar cuando escuches el tono. Tienes 30 segundos.",
      expectedContent: [
        "identify a skill",
        "explain why it would be useful",
        "suggest one or more ways to improve it",
        "develop the answer with relevant detail",
      ],
      assessmentFocus: [
        "clear and relevant response",
        "explanation and justification",
        "organization of ideas",
        "range and control of grammar",
        "range and appropriacy of vocabulary",
      ],
    },
    {
      id: "ote-advanced-diagnostic-speaking-voicemail-1",
      title: "Mensaje diplomático",
      preparationSeconds: 10,
      responseSeconds: 40,
      weight: 35,
      audience: "manager",
      register: "professional and diplomatic",
      prompt:
        "Your manager has asked you to work this Saturday because another employee is unavailable. You cannot work because you have an important family commitment. Your colleague Jamie has told you that they may be free. Leave your manager a voice message.",
      bulletPoints: [
        "apologise and explain why you cannot work",
        "mention that Jamie may be available",
        "suggest another way you could help",
      ],
      instructions: "Tienes 10 segundos para preparar y 40 segundos para dejar tu mensaje.",
      expectedContent: [
        "respond politely to the manager's request",
        "explain clearly why the candidate cannot work",
        "mention Jamie as a possible replacement without making assumptions",
        "offer another practical way to help",
        "maintain a diplomatic and professional tone",
      ],
      assessmentFocus: [
        "task completion",
        "diplomatic refusal",
        "professional register",
        "clarity and organization",
        "range and control of grammar",
        "range and appropriacy of vocabulary",
      ],
    },
    {
      id: "ote-advanced-diagnostic-speaking-debate-1",
      title: "Mini debate",
      preparationSeconds: 30,
      responseSeconds: 60,
      weight: 50,
      topic: "Recorded university lectures",
      statement: "All university lectures should be recorded and made available online.",
      ideaPrompts: [
        "access to learning",
        "class attendance",
        "student participation",
        "personal responsibility",
      ],
      prompt:
        "Put a case for or against the statement: All university lectures should be recorded and made available online. Use at least two of the ideas provided. Support your points and give a clear conclusion.",
      instructions: "Tienes 30 segundos para preparar y 60 segundos para presentar tu argumento.",
      expectedContent: [
        "establish a clear position",
        "use at least two of the ideas provided",
        "develop the main points with reasons or examples",
        "organize the argument clearly",
        "give a clear conclusion",
      ],
      assessmentFocus: [
        "clear position",
        "development of an argument",
        "relevant supporting reasons or examples",
        "coherence and cohesion",
        "range and control of complex grammar",
        "precision and range of vocabulary",
      ],
    },
  ],
  writing: {
    id: "ote-advanced-diagnostic-writing-opinion-1",
    title: "Respuesta académica breve",
    recommendedSeconds: 8 * 60,
    targetWordsMin: 80,
    targetWordsMax: 100,
    audience: "academic tutor",
    register: "neutral to formal",
    question:
      "Some companies give employees paid time during the working week to learn new professional skills. Do you think this is a good use of working time?",
    topicPrompts: [
      "benefits for employees and companies",
      "possible costs or disadvantages",
    ],
    prompt: "Write a short response for your tutor.",
    bulletPoints: [
      "discuss the benefits for employees and companies",
      "consider possible costs or disadvantages",
      "give your own opinion",
      "support your ideas with reasons",
      "include a brief conclusion",
    ],
    instructions: "Escribe entre 80 y 100 palabras. Tienes aproximadamente 8 minutos.",
    expectedContent: [
      "address both topic prompts",
      "express a clear opinion",
      "develop ideas rather than simply list them",
      "support the main points with reasons or examples",
      "use a suitable neutral or formal register",
      "organize the response coherently",
      "include a brief conclusion",
    ],
    assessmentFocus: [
      "task fulfilment",
      "development of ideas",
      "academic register",
      "organization and cohesion",
      "range and control of grammar",
      "range, precision and appropriacy of vocabulary",
    ],
  },
};

export const OTE_ADVANCED_LEVEL_PRODUCTION_META = {
  estimatedSpeakingSeconds: 130,
  estimatedWritingSeconds: 8 * 60,
  speakingCriteria: [
    "taskFulfilment",
    "pronunciationAndFluency",
    "grammar",
    "lexis",
  ],
  writingCriteria: [
    "taskFulfilment",
    "organization",
    "grammar",
    "lexis",
  ],
  disclaimer:
    "This is a short diagnostic preview of Oxford Test of English Advanced production skills. It is not an official Oxford Test of English score or examination result.",
};

export const OTE_ADVANCED_LEVEL_PRODUCTION_SCALE = [
  "Below B2",
  "B2 developing",
  "Secure B2",
  "Approaching C1",
  "C1",
];

export const OTE_LEVEL_PRODUCTION_SCALE = [
  "Below A2",
  "A2",
  "B1",
  "B2",
  "Strong B2 / Advanced-ready",
  "C1",
];

export function shouldRecommendAdvancedDiagnostic(profile) {
  return profile?.id === "D" || profile?.cefr === "C1";
}
