export const OTE_SPEAKING_MOCKS = {
  "speaking-1": {
    id: "speaking-1",
    title: "OTE Speaking Mock 1",
    moduleLabel: "Speaking",
    maxDurationSeconds: 15 * 60,
    part3Theme: "different ways of learning",
    parts: [
      {
        id: "part-1",
        number: 1,
        title: "Interview",
        instructions: [
          "You are going to answer eight questions.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
          "Try to speak for the full amount of time.",
        ],
        questions: [
          { id: "p1-q1", prompt: "What is your name?", responseSeconds: 10 },
          { id: "p1-q2", prompt: "Which country do you come from?", responseSeconds: 10 },
          { id: "p1-q3", prompt: "What do you usually do at weekends?", responseSeconds: 20 },
          { id: "p1-q4", prompt: "Tell me about a place in your town that you like.", responseSeconds: 20 },
          { id: "p1-q5", prompt: "What kind of food do you enjoy eating?", responseSeconds: 20 },
          { id: "p1-q6", prompt: "How do you normally travel around your city?", responseSeconds: 20 },
          { id: "p1-q7", prompt: "Tell me about something you are learning at the moment.", responseSeconds: 20 },
          { id: "p1-q8", prompt: "What would you like to improve in your English?", responseSeconds: 20 },
        ],
      },
      {
        id: "part-2",
        number: 2,
        title: "Voice Message",
        instructions: [
          "First read and listen to the task, then decide what you want to say.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
        ],
        tasks: [
          {
            id: "p2-vm1",
            mode: "leave",
            title: "Leave a voice message",
            lead: "You would like to join a new evening photography course. Leave a voicemail message for the course organiser.",
            bullets: [
              "say why you are interested in the course",
              "ask about the equipment you need",
              "suggest a day when you could visit the centre",
            ],
            prepSeconds: 20,
            responseSeconds: 40,
          },
          {
            id: "p2-vm2",
            mode: "reply",
            title: "Reply to a voice message",
            lead: "Listen to the message from your friend about a weekend trip. Then leave a voicemail message for your friend.",
            bullets: [
              "thank your friend for the invitation",
              "ask about the travel arrangements",
              "say what you would like to do on the trip",
            ],
            prepSeconds: 20,
            responseSeconds: 40,
          },
        ],
      },
      {
        id: "part-3",
        number: 3,
        title: "Talk",
        instructions: [
          "You are going to give a talk.",
          "Read and listen to the task.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
        ],
        task: {
          id: "p3-talk",
          topic: "different ways of learning",
          prompt:
            "You are going to give a talk to your English class about different ways of learning. Choose two photographs. Tell your class what the advantages and disadvantages of learning in these two ways might be.",
          prepSeconds: 30,
          responseSeconds: 60,
          images: [
            {
              id: "online",
              label: "An online lesson",
              src: "/images/speaking/library-laptops.png",
            },
            {
              id: "group",
              label: "A study group",
              src: "/images/speaking/city-park.png",
            },
            {
              id: "museum",
              label: "A museum visit",
              src: "/images/speaking/museum.png",
            },
            {
              id: "workshop",
              label: "A practical workshop",
              src: "/images/speaking/cooking-home.png",
            },
          ],
        },
      },
      {
        id: "part-4",
        number: 4,
        title: "Follow-up Questions",
        instructions: [
          "You are going to answer six questions about your talk.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
        ],
        topic: "different ways of learning",
        questions: [
          { id: "p4-q1", prompt: "Why do some people prefer learning alone?", responseSeconds: 30 },
          { id: "p4-q2", prompt: "What can students learn from working with other people?", responseSeconds: 30 },
          { id: "p4-q3", prompt: "Do you think online learning is suitable for everyone?", responseSeconds: 30 },
          { id: "p4-q4", prompt: "How important is a teacher when someone is learning something new?", responseSeconds: 30 },
          { id: "p4-q5", prompt: "What skills will people need to learn in the future?", responseSeconds: 30 },
          { id: "p4-q6", prompt: "Should schools spend more time teaching practical skills?", responseSeconds: 30 },
        ],
      },
    ],
  },
};

export function getOteSpeakingMock(mockId = "speaking-1") {
  return OTE_SPEAKING_MOCKS[mockId] || OTE_SPEAKING_MOCKS["speaking-1"];
}
