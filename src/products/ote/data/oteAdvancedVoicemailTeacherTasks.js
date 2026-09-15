export const OTE_ADVANCED_VOICEMAIL_TEACHER_GROUPS = [
  {
    id: "responsibility-respect",
    label: "Set 1",
    title: "Responsibility and Respect",
    description:
      "Take responsibility and handle uncomfortable conversations without damaging professional or academic relationships.",
  },
  {
    id: "fairness-professional-judgement",
    label: "Set 2",
    title: "Fairness and Professional Judgement",
    description:
      "Challenge questionable decisions while recognizing the other person's intentions and proposing a constructive alternative.",
  },
];

export const OTE_ADVANCED_VOICEMAIL_TEACHER_TASKS = [
  {
    id: "teacher-voicemail-01",
    groupId: "responsibility-respect",
    title: "Wrong meeting-room booking",
    description: "Professional · Employee → manager",
    tasks: [
      {
        id: "teacher-voicemail-01-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Wrong meeting-room booking",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-01.mp3",
        lead:
          "You work for a company. You were responsible for reserving the main meeting room for a visit from an important supplier tomorrow. You have just discovered that you accidentally booked it for the wrong day, and no other large room is currently available. Leave a voice message for your manager, Rebecca Cole, and:",
        bullets: [
          "explain what happened",
          "say how this may affect the visit",
          "suggest a way to solve the problem",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-02",
    groupId: "responsibility-respect",
    title: "Feedback after presentations",
    description: "Academic · Student → tutor",
    tasks: [
      {
        id: "teacher-voicemail-02-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Feedback after presentations",
        audience: "Tutor",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-02.mp3",
        lead:
          "You study at college. Your tutor, Dr Harris, plans to ask students to give detailed critical feedback immediately after each class presentation. You think this could embarrass some students, particularly those who are less confident, and make the discussion less honest. Leave a voice message for your tutor and:",
        bullets: [
          "acknowledge the purpose of the activity",
          "explain why you are concerned",
          "suggest a different way for students to give useful feedback",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-03",
    groupId: "responsibility-respect",
    title: "Credit for a shared idea",
    description: "Professional · Colleague → colleague",
    tasks: [
      {
        id: "teacher-voicemail-03-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Credit for a shared idea",
        audience: "Colleague",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-03.mp3",
        lead:
          "You work for a company. At yesterday's meeting, your colleague, Laura Bennett, presented an idea that you had developed together but described it as her own. Your manager praised her for the idea and now expects her to lead the project. Leave a voice message for Laura and:",
        bullets: [
          "explain why you are disappointed",
          "say why the situation should be corrected",
          "suggest how you could explain both contributions to your manager",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-04",
    groupId: "responsibility-respect",
    title: "An angry email about a mark",
    description: "Academic · Student mentor → student",
    tasks: [
      {
        id: "teacher-voicemail-04-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "An angry email about a mark",
        audience: "Student",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-04.mp3",
        lead:
          "You study at college. A first-year student you mentor, Luca, has received a low mark and has written an angry email accusing his tutor of unfair treatment. He plans to send it immediately and has asked for your opinion. Leave a voice message for Luca and:",
        bullets: [
          "acknowledge why he is disappointed",
          "explain your concern about the email",
          "suggest a more effective way to discuss the mark with his tutor first",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-05",
    groupId: "fairness-professional-judgement",
    title: "A course complaint",
    description: "Academic · Student → course representative",
    tasks: [
      {
        id: "teacher-voicemail-05-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "A course complaint",
        audience: "Course representative",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-05.mp3",
        lead:
          "You study at college. Your course representative, Amir, has written a formal complaint about changes to the timetable and has asked you to sign it. You agree that the changes have caused problems, but several claims in the complaint are exaggerated. Leave a voice message for Amir and:",
        bullets: [
          "acknowledge the students' concerns",
          "explain why you cannot sign the complaint",
          "suggest how the complaint could be revised before it is sent",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-06",
    groupId: "fairness-professional-judgement",
    title: "Corrections during client meetings",
    description: "Professional · Senior colleague → junior colleague",
    tasks: [
      {
        id: "teacher-voicemail-06-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Corrections during client meetings",
        audience: "Junior colleague",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-06.mp3",
        lead:
          "You work for a company. A junior colleague, Ben Turner, has started correcting other team members whenever they make small mistakes during meetings with clients. Ben is usually right, but some colleagues feel undermined and the meetings have become uncomfortable. Leave a voice message for Ben and:",
        bullets: [
          "acknowledge his intention to provide accurate information",
          "explain how his corrections affect the team",
          "suggest a more professional approach for future client meetings",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-07",
    groupId: "fairness-professional-judgement",
    title: "Blaming an employee online",
    description: "Academic · Student → student",
    tasks: [
      {
        id: "teacher-voicemail-07-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Blaming an employee online",
        audience: "Student",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-07.mp3",
        lead:
          "You study at college. A careers event was badly organized, and several students have complained. Another student, Chloe, now wants to publish an online post blaming one college employee by name. You think this would be unfair because several people were involved. Leave a voice message for Chloe and:",
        bullets: [
          "acknowledge the problems with the event",
          "explain your concern about the post",
          "suggest a more appropriate way to make a complaint",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "teacher-voicemail-08",
    groupId: "fairness-professional-judgement",
    title: "Public error totals",
    description: "Professional · Employee → manager",
    tasks: [
      {
        id: "teacher-voicemail-08-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Public error totals",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/teacher-voicemail-bank/task-08.mp3",
        lead:
          "You work for a company. Your manager, Olivia Grant, plans to display each employee's monthly error total on a board in the main office. She believes this will encourage staff to be more careful. You are concerned about the effect on the team. Leave a voice message for Olivia and:",
        bullets: [
          "acknowledge what she wants to achieve",
          "explain why you disagree with the plan",
          "suggest a different way to improve accuracy",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
];
