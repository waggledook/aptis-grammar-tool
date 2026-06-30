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

export const OTE_LEVEL_PRODUCTION_SCALE = [
  "Below A2",
  "A2",
  "B1",
  "B2",
  "Strong B2 / Advanced-ready",
];

export function shouldRecommendAdvancedDiagnostic(profile) {
  return profile?.id === "D" || profile?.cefr === "C1";
}
