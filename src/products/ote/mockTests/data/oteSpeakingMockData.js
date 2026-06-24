export const OTE_SPEAKING_AUDIO = {
  part1Instructions: "/audio/ote/speaking/instructions/part-1-instructions.mp3",
  part1AdvancedInstructions: "/audio/ote/speaking/instructions/part-1-instructions-advanced.mp3",
  voicemailInstructions1: "/audio/ote/speaking/instructions/voice-message-instructions-1.mp3",
  voicemailInstructions2: "/audio/ote/speaking/instructions/voice-message-instructions-2.mp3",
  voicemailAdvancedInstructions: "/audio/ote/speaking/instructions/voice-message-advanced-instructions.mp3",
  nowListenToMessage: "/audio/ote/speaking/instructions/now-listen-to-the-message.mp3",
  part3Instructions: "/audio/ote/speaking/instructions/part-3-instructions.mp3",
  summaryAdvancedInstructions: "/audio/ote/speaking/instructions/summary-advanced-instructions.mp3",
  summaryExpert1Intro: "/audio/ote/speaking/instructions/expert-1.mp3",
  summaryExpert2Intro: "/audio/ote/speaking/instructions/expert-2.mp3",
  part4Instructions: "/audio/ote/speaking/instructions/part-4-instructions.mp3",
  debateAdvancedInstructions: "/audio/ote/speaking/instructions/debate-advanced-instructions.mp3",
  debatePrepareInstructions: "/audio/ote/speaking/instructions/debate-prepare-your-case.mp3",
  followUpAdvancedInstructions: "/audio/ote/speaking/instructions/follow-up-questions-advanced.mp3",
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
        instructionAudioSrc: OTE_SPEAKING_AUDIO.debateAdvancedInstructions,
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
  "speaking-advanced-1": {
    id: "speaking-advanced-1",
    title: "OTE Advanced Speaking Mock 1",
    moduleLabel: "Speaking",
    levelLabel: "Advanced",
    maxDurationSeconds: 15 * 60,
    part3Theme: "research summaries",
    part4Theme: "education and society",
    parts: [
      {
        id: "part-1",
        number: 1,
        title: "Interview",
        instructions: [
          "You are going to answer six questions.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
          "Try to speak for the full amount of time.",
        ],
        instructionAudioSrc: OTE_SPEAKING_AUDIO.part1AdvancedInstructions,
        questions: [
          {
            id: "adv-p1-q1",
            prompt: "What's your name?",
            audioSrc: OTE_SPEAKING_AUDIO.whatName,
            responseSeconds: 10,
          },
          {
            id: "adv-p1-q2",
            prompt: "Which country do you come from?",
            audioSrc: OTE_SPEAKING_AUDIO.whichCountry,
            responseSeconds: 10,
          },
          {
            id: "adv-p1-q3",
            prompt: "Thinking about your free time, what do you usually do to relax?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/part-1-q3.mp3",
            responseSeconds: 30,
          },
          {
            id: "adv-p1-q4",
            prompt: "Can you describe a journey that you remember clearly?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/part-1-q4.mp3",
            responseSeconds: 30,
          },
          {
            id: "adv-p1-q5",
            prompt: "Do you think people work better alone or as part of a team?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/part-1-q5.mp3",
            responseSeconds: 30,
          },
          {
            id: "adv-p1-q6",
            prompt: "Finally, what personal goal would you most like to achieve in the next five years?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/part-1-q6.mp3",
            responseSeconds: 30,
          },
        ],
      },
      {
        id: "part-2",
        number: 2,
        title: "Voice Message",
        instructions: [
          "You are going to leave a voice message.",
          "First read and listen to the task, then decide what you want to say.",
          "You need to be diplomatic in your response.",
          "The clock shows how much time you have to leave your voice message.",
          "Start speaking when you hear the tone.",
        ],
        instructionAudioSrc: OTE_SPEAKING_AUDIO.voicemailAdvancedInstructions,
        showTaskDuringInstructions: true,
        tasks: [
          {
            id: "adv-p2-voice-message",
            mode: "diplomatic",
            title: "Diplomatic voice message",
            lead:
              "You study at college. One member of your project group, Daniel, has missed two meetings and not completed his work. The deadline is approaching, and the group is worried about finishing on time. You do not know why he has been absent. Leave a voice message for Daniel and:",
            bullets: [
              "explain how the situation is affecting the group",
              "ask whether there is a problem",
              "suggest how you could complete the work together",
            ],
            taskAudioSrc: "/audio/ote/speaking/advanced/mock-1/voice-message-task.mp3",
            thinkingAudioSrc: OTE_SPEAKING_AUDIO.timeToThink,
            prepSeconds: 10,
            responseSeconds: 40,
          },
        ],
      },
      {
        id: "part-3",
        number: 3,
        title: "Summary",
        instructions: [
          "You are going to give a summary.",
          "First read and listen to the task.",
          "You can make notes while you listen. Your notes will not be marked. Use the Notes button below to open your notepad.",
          "You will then have some time to think about what you want to say.",
          "The clock shows how much time you have to give your summary.",
          "Start speaking when you hear the tone.",
        ],
        instructionAudioSrc: OTE_SPEAKING_AUDIO.summaryAdvancedInstructions,
        task: {
          id: "adv-p3-summary",
          title: "Summary",
          visualType: "summary",
          allowNotes: true,
          prompt:
            "Your tutor has asked you to summarize some research for your tutor group. Listen to two experts talking about research into taking notes. The two experts make the same two main points. You should:",
          requirements: [
            "combine the information from the two experts.",
            "summarize the two main points the experts make.",
          ],
          listenPrompt: "Now listen to the two experts.",
          listenItems: ["Expert 1", "Expert 2"],
          taskAudioSrc: "/audio/ote/speaking/advanced/mock-1/summary-task.mp3",
          expertIntroAudioSources: [
            OTE_SPEAKING_AUDIO.summaryExpert1Intro,
            OTE_SPEAKING_AUDIO.summaryExpert2Intro,
          ],
          expertAudioSources: [
            "/audio/ote/speaking/advanced/mock-1/summary-expert-1.mp3",
            "/audio/ote/speaking/advanced/mock-1/summary-expert-2.mp3",
          ],
          audioScript: {
            expert1:
              "Studies comparing handwritten and typed notes suggest that the two methods support learning in different ways. Writing by hand is slower, so students usually have to select and reformulate the main ideas rather than record every sentence. This extra processing can lead to stronger understanding and better recall later. Typing, however, allows people to capture more information and is often more practical when a lecture moves quickly or when notes need to be searched and shared. The difficulty is that fast typists may copy the speaker's words without thinking about them. For this reason, researchers increasingly argue that the best method depends on the purpose: summarizing and learning may favour handwriting, while producing a detailed record may favour typing.",
            expert2:
              "There is no simple winner in the debate over laptops and notebooks. Evidence indicates that handwritten note-takers often remember concepts more effectively because they cannot write everything down and must decide what matters. In effect, the slower method encourages them to organize the information as they hear it. On the other hand, digital notes can be produced more rapidly, edited easily and stored in a form that is accessible later. They may therefore be preferable for complex sessions containing many facts or for learners who find handwriting difficult. Problems arise when typing becomes automatic copying. The choice should be guided by the task, and students using laptops may need to pause and summarize ideas in their own words.",
          },
          teacherKey: {
            essentialContentPoints: [
              "Handwriting may improve understanding and recall because learners must select, organise and reformulate information.",
              "Typing is faster and more practical for recording, editing and storing detailed information, so the better method depends on the task; unthinking word-for-word copying should be avoided.",
            ],
            wordCounts: {
              total: 237,
              expert1: 119,
              expert2: 118,
            },
          },
          prepSeconds: 40,
          responseSeconds: 50,
        },
      },
      {
        id: "part-4",
        number: 4,
        title: "Debate",
        instructions: [
          "You are going to take part in a debate.",
          "First read and listen to the task, then decide what you want to say.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
        ],
        task: {
          id: "adv-p4-debate",
          title: "Debate",
          visualType: "debate",
          allowNotes: true,
          statement: "Higher education should be completely free for everyone.",
          prompt:
            "Your tutor has asked you to take part in a class debate. You are going to put a case for or against the statement below.",
          taskAudioSrc: "/audio/ote/speaking/advanced/mock-1/debate-task.mp3",
          prepInstructionAudioSrc: OTE_SPEAKING_AUDIO.debatePrepareInstructions,
          requirements: [
            "use two or three of the ideas below to argue your case",
            "provide support for the ideas you choose",
            "give a conclusion",
          ],
          mindMapIdeas: [
            "government budgets",
            "graduate salaries",
            "educational quality",
            "social equality",
            "online alternatives",
          ],
          prepSeconds: 45,
          responseSeconds: 120,
        },
      },
      {
        id: "part-5",
        number: 5,
        title: "Follow-up Questions",
        instructions: [
          "You are going to answer four questions on the topic of your debate.",
          "The clock shows how much time you have to speak.",
          "Start speaking when you hear the tone.",
        ],
        instructionAudioSrc: OTE_SPEAKING_AUDIO.followUpAdvancedInstructions,
        topic: "the cost of higher education",
        questions: [
          {
            id: "adv-p5-q1",
            prompt: "Your talk was about university education. Is a university degree still the best path to career success?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/follow-up-q1.mp3",
            responseSeconds: 40,
          },
          {
            id: "adv-p5-q2",
            prompt: "Many industries report a lack of practical skills in young applicants. How important is vocational training compared to academic study?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/follow-up-q2.mp3",
            responseSeconds: 40,
          },
          {
            id: "adv-p5-q3",
            prompt: "Do you think that companies should be responsible for funding their employees' ongoing training?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/follow-up-q3.mp3",
            responseSeconds: 40,
          },
          {
            id: "adv-p5-q4",
            prompt: "Some people prefer to live in different countries to find work. What are the advantages of working abroad?",
            audioSrc: "/audio/ote/speaking/advanced/mock-1/follow-up-q4.mp3",
            responseSeconds: 40,
          },
        ],
      },
    ],
  },
};

export function getOteSpeakingMock(mockId = "speaking-1") {
  return OTE_SPEAKING_MOCKS[mockId] || OTE_SPEAKING_MOCKS["speaking-1"];
}
