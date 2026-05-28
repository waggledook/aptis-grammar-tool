export const OTE_SPEAKING_AUDIO = {
  part1Instructions: "/audio/ote/speaking/instructions/part-1-instructions.mp3",
  voicemailInstructions1: "/audio/ote/speaking/instructions/voice-message-instructions-1.mp3",
  voicemailInstructions2: "/audio/ote/speaking/instructions/voice-message-instructions-2.mp3",
  nowListenToMessage: "/audio/ote/speaking/instructions/now-listen-to-the-message.mp3",
  part3Instructions: "/audio/ote/speaking/instructions/part-3-instructions.mp3",
  part4Instructions: "/audio/ote/speaking/instructions/part-4-instructions.mp3",
  timeToThink: "/audio/ote/speaking/instructions/time-to-think.mp3",
  whatName: "/audio/ote/speaking/instructions/what-name.mp3",
  whichCountry: "/audio/ote/speaking/instructions/which-country.mp3",
};

export const OTE_SPEAKING_MOCKS = {
  "speaking-1": {
    id: "speaking-1",
    title: "OTE Speaking Mock 1",
    moduleLabel: "Speaking",
    maxDurationSeconds: 15 * 60,
    part3Theme: "healthy living",
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
        instructionAudioSrc: OTE_SPEAKING_AUDIO.part1Instructions,
        questions: [
          {
            id: "p1-q1",
            prompt: "What's your name?",
            audioSrc: OTE_SPEAKING_AUDIO.whatName,
            responseSeconds: 10,
          },
          {
            id: "p1-q2",
            prompt: "Which country do you come from?",
            audioSrc: OTE_SPEAKING_AUDIO.whichCountry,
            responseSeconds: 10,
          },
          {
            id: "p1-q3",
            prompt: "I'm going to ask you some questions about food. What is your favourite meal of the day?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q3.mp3",
            responseSeconds: 20,
          },
          {
            id: "p1-q4",
            prompt: "Can you describe a traditional dish from your country?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q4.mp3",
            responseSeconds: 20,
          },
          {
            id: "p1-q5",
            prompt: "Do you prefer eating out at restaurants or cooking at home?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q5.mp3",
            responseSeconds: 20,
          },
          {
            id: "p1-q6",
            prompt: "I'm going to ask you some questions about technology. What electronic devices do you use every day?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q6.mp3",
            responseSeconds: 20,
          },
          {
            id: "p1-q7",
            prompt: "Can you tell me about the last time you bought a new gadget or phone?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q7.mp3",
            responseSeconds: 20,
          },
          {
            id: "p1-q8",
            prompt: "Do you think young children should be allowed to use smartphones?",
            audioSrc: "/audio/ote/speaking/mock-1/part-1-q8.mp3",
            responseSeconds: 20,
          },
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
            title: "Leave a voicemail",
            lead:
              "You recently booked a holiday apartment online. However, you need to change the dates of your stay due to a sudden change in your work schedule. Leave a voicemail message for the property manager. In your message, you should:",
            bullets: [
              "say who you are and state your booking reference number",
              "explain why you need to alter your reservation dates",
              "ask if it is possible to move the booking to the following weekend",
            ],
            instructionAudioSrc: OTE_SPEAKING_AUDIO.voicemailInstructions1,
            taskAudioSrc: "/audio/ote/speaking/mock-1/part2-first-task.mp3",
            thinkingAudioSrc: OTE_SPEAKING_AUDIO.timeToThink,
            prepSeconds: 20,
            responseSeconds: 40,
          },
          {
            id: "p2-vm2",
            mode: "reply",
            title: "Reply to a voicemail",
            lead:
              "Listen to the message from your friend about cooking together. Then, leave a voicemail message for your friend. In your message, you should:",
            incomingAudioSrc: "/audio/ote/speaking/mock-1/voice-message-mock-1.mp3",
            bullets: [
              "agree to cook a meal together this weekend",
              "say why you prefer making Mexican food instead of what they suggested",
              "suggest a time to meet at the supermarket to buy ingredients",
            ],
            instructionAudioSrc: OTE_SPEAKING_AUDIO.voicemailInstructions2,
            taskAudioSrc: "/audio/ote/speaking/mock-1/part2-second-task.mp3",
            nowListenAudioSrc: OTE_SPEAKING_AUDIO.nowListenToMessage,
            thinkingAudioSrc: OTE_SPEAKING_AUDIO.timeToThink,
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
          topic: "healthy living",
          prompt:
            "Your school or workplace is launching a \"Healthy Living Week\" to encourage people to improve their well-being. You are going to give a talk to your English class about different ways people can maintain a healthy lifestyle. Choose two photographs. Tell your class how these two activities can benefit a person's physical or mental health.",
          instructionAudioSrc: OTE_SPEAKING_AUDIO.part3Instructions,
          taskAudioSrc: "/audio/ote/speaking/mock-1/part3-talk-task-mock-1.mp3",
          thinkingAudioSrc: OTE_SPEAKING_AUDIO.timeToThink,
          prepSeconds: 30,
          responseSeconds: 60,
          images: [
            {
              id: "cooking",
              label: "Cooking a healthy meal",
              src: "/images/ote/speaking/mock-1/image1-cooking-a-healthy-meal.png",
            },
            {
              id: "sleeping",
              label: "Sleeping eight hours",
              src: "/images/ote/speaking/mock-1/image2-sleeping-8-hours.png",
            },
            {
              id: "yoga",
              label: "Doing yoga or meditation",
              src: "/images/ote/speaking/mock-1/image3-doing-yoga-or-meditation.png",
            },
            {
              id: "jogging",
              label: "Jogging outdoors",
              src: "/images/ote/speaking/mock-1/image4-jogging-outdoors.png",
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
        instructionAudioSrc: OTE_SPEAKING_AUDIO.part4Instructions,
        topic: "healthy living",
        questions: [
          {
            id: "p4-q1",
            prompt: "Your talk was about healthy living. What do you do to keep fit?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q1.mp3",
            responseSeconds: 30,
          },
          {
            id: "p4-q2",
            prompt: "Some people say that healthy food is too expensive. Do you agree?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q2.mp3",
            responseSeconds: 30,
          },
          {
            id: "p4-q3",
            prompt: "Is it better to play a team sport or exercise alone?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q3.mp3",
            responseSeconds: 30,
          },
          {
            id: "p4-q4",
            prompt: "Who should help children stay active: parents or schools?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q4.mp3",
            responseSeconds: 30,
          },
          {
            id: "p4-q5",
            prompt: "Do you think modern life is too stressful?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q5.mp3",
            responseSeconds: 30,
          },
          {
            id: "p4-q6",
            prompt: "Should fast-food restaurants be banned near schools?",
            audioSrc: "/audio/ote/speaking/mock-1/part4-q6.mp3",
            responseSeconds: 30,
          },
        ],
      },
    ],
  },
};

export function getOteSpeakingMock(mockId = "speaking-1") {
  return OTE_SPEAKING_MOCKS[mockId] || OTE_SPEAKING_MOCKS["speaking-1"];
}
