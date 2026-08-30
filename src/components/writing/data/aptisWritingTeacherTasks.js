export const APTIS_WRITING_LIVE_GAME_TYPE = "aptis-writing-teacher";

export const APTIS_WRITING_TEACHER_TOPICS = [
  {
    id: "language-exchange-club",
    title: "Language Exchange Club",
    part2: {
      context:
        "You are a new member of a language exchange club. Complete the information on the form. Write in full sentences using 20–30 words.",
      prompt:
        "Tell us why you want to practise another language and what you hope to improve.",
    },
    part3: {
      context:
        "You are chatting online with other members of the language exchange club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        { name: "Sofia", question: "Hi! How often do you use the language outside class, and who do you speak to?" },
        { name: "Marc", question: "Tell us about a time you had a conversation in another language. How did it go?" },
        { name: "Aisha", question: "In your area, how do people usually practise foreign languages outside class?" },
      ],
    },
    part4: {
      sourceTitle: "Email from the Language Exchange Team",
      source: `Dear Member,

From next month, we are changing the way our weekly meetings work. Instead of choosing a different person to speak to each week, members will be paired with the same language partner for three months.

We hope this will help people make faster progress and feel more comfortable speaking. Please tell us what you think about the new system.

Best wishes,
The Language Exchange Team`,
      friendPrompt:
        "Write an email to your friend. Tell them how you feel about the new system and whether you think it will help you. Write 40–50 words.",
      formalPrompt:
        "Write an email to the club organiser. Give your opinion about the new system and suggest how the club could make language exchanges more useful for members. Write 120–150 words.",
    },
  },
  {
    id: "gardening-club",
    title: "Gardening Club",
    part2: {
      context:
        "You are a new member of a gardening club. Complete the information on the form. Write in full sentences using 20–30 words.",
      prompt: "Please tell us what you enjoy about gardening and what you would like to learn.",
    },
    part3: {
      context:
        "You are chatting online with other members of the gardening club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        { name: "Leo", question: "Hi! Do you grow any plants at home or in a garden? What do you enjoy growing?" },
        { name: "Nina", question: "Have you ever had a problem with a plant or garden? What did you do?" },
        { name: "Adam", question: "Is gardening popular where you live? Why do you think that is?" },
      ],
    },
    part4: {
      sourceTitle: "Email from the Gardening Club Committee",
      source: `Dear Member,

The community centre has told us that our garden will no longer be available on Saturday mornings. We can continue using it on Sunday afternoons, or we could look for a different place to meet.

Before making a decision, we would like to know which option members prefer and whether you have any other suggestions.

Best wishes,
The Gardening Club Committee`,
      friendPrompt:
        "Write an email to your friend. Tell them about the change and say which option you would prefer. Write 40–50 words.",
      formalPrompt:
        "Write an email to the club committee. Explain which option you prefer, give your reasons and suggest anything else the club could do. Write 120–150 words.",
    },
  },
  {
    id: "local-history-course",
    title: "Local History Course",
    part2: {
      context:
        "You are a new student on a local history course. Complete the information on the form. Write in full sentences using 20–30 words.",
      prompt: "Tell us why local history interests you and what you hope to learn.",
    },
    part3: {
      context:
        "You are chatting online with other students on the local history course. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        { name: "Marta", question: "Is there a local story or historical event you find interesting? Tell us about it." },
        { name: "Jon", question: "Have you ever visited a historical place in your area? What was it like?" },
        { name: "Priya", question: "Do people in your area care about protecting old buildings? How can you tell?" },
      ],
    },
    part4: {
      sourceTitle: "Email from the Course Tutor",
      source: `Dear Student,

Unfortunately, the local museum will be closed for repairs during the final month of our course. This means we cannot make the two visits that were planned.

We can replace them with guided walks around the town, or invite local experts to give talks in class. We would like to hear which option you would prefer.

Kind regards,
The Course Tutor`,
      friendPrompt:
        "Write an email to another student on the course. Tell them how you feel about the change and which alternative you prefer. Write 40–50 words.",
      formalPrompt:
        "Write an email to your course tutor. Explain which alternative you prefer, give your reasons and suggest how the replacement activities could be organised. Write 120–150 words.",
    },
  },
  {
    id: "drama-course",
    title: "Drama Course",
    part2: {
      context:
        "You are a new student on a drama course. Complete the information on the form. Write in full sentences using 20–30 words.",
      prompt: "Please tell us about any acting experience you have and why you joined the course.",
    },
    part3: {
      context:
        "You are chatting online with other students on the drama course. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        { name: "Ellie", question: "Hi! What kind of plays or performances do you enjoy watching? Why?" },
        { name: "Ravi", question: "Which part of performing makes you most nervous or excited? Why?" },
        { name: "Sam", question: "Is drama popular in schools or community groups where you live? Why or why not?" },
      ],
    },
    part4: {
      sourceTitle: "Email from the Drama Course Team",
      source: `Dear Student,

We have been offered the chance to perform our final play at a local theatre instead of in the college hall. This would give us a larger audience and professional lighting, but we would need two extra evening rehearsals.

Please tell us whether you would like to accept the offer and how the extra rehearsals might affect you.

Best wishes,
The Drama Course Team`,
      friendPrompt:
        "Write an email to another student on the course. Tell them what you think about the theatre offer and the extra rehearsals. Write 40–50 words.",
      formalPrompt:
        "Write an email to the course organiser. Give your opinion about the offer, explain how the extra rehearsals would affect you and suggest how they could be organised. Write 120–150 words.",
    },
  },
];

function buildPartTasks(part) {
  const key = `part${part}`;
  return APTIS_WRITING_TEACHER_TOPICS.map((topic) => ({
    id: topic.id,
    title: topic.title,
    ...topic[key],
  }));
}

export const APTIS_WRITING_TEACHER_PART2_TASKS = buildPartTasks(2);
export const APTIS_WRITING_TEACHER_PART3_TASKS = buildPartTasks(3);
export const APTIS_WRITING_TEACHER_PART4_TASKS = buildPartTasks(4);

export function getAptisWritingTeacherTasks(part) {
  if (Number(part) === 2) return APTIS_WRITING_TEACHER_PART2_TASKS;
  if (Number(part) === 3) return APTIS_WRITING_TEACHER_PART3_TASKS;
  if (Number(part) === 4) return APTIS_WRITING_TEACHER_PART4_TASKS;
  return [];
}

export function getAptisWritingTeacherTask(part, taskId) {
  return getAptisWritingTeacherTasks(part).find((task) => task.id === taskId) || null;
}
