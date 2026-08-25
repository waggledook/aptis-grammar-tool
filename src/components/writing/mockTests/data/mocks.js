export const WRITING_MOCKS = [
  {
    id: 'music-club',
    title: 'Music Club',
    menuTitle: 'Mock 1: Music Club',
    menuDescription: 'Open practice mock based on the original music club scenario.',
    requiresAuth: false,
    part1: {
      prompt:
        'You want to join a music club. You have 5 messages from a member of the club. Write short answers (1-5 words) to each message. Recommended time: 3 minutes.',
      questions: [
        'What languages do you speak?',
        'Where do you work or study?',
        "What's your favourite kind of food?",
        'What sports do you do?',
        'What time do you get up?'
      ]
    },
    part2: {
      prompt:
        'You are a new member of the Music Club. Fill in the form. Write in sentences. Use 20-30 words. Recommended time: 7 minutes.',
      question:
        'Please tell us about the music you like and when you usually listen to it.'
    },
    part3: {
      prompt:
        'You are communicating with other members of the club in the chat room. Reply to their questions. Write in sentences. Use 30-40 words per answer. Recommended time: 10 minutes.',
      questions: [
        {
          speaker: 'Jasmine',
          text: 'Hi and welcome! Do you prefer listening to music or making it?'
        },
        {
          speaker: 'Leo',
          text: "What was the best live music experience you've had?"
        },
        {
          speaker: 'Amira',
          text: "We're planning a playlist for the next club meeting. Which songs or artists would you recommend, and why?"
        }
      ]
    },
    part4: {
      intro:
        'You are a member of a music club. You have received this email from the club:',
      sourceEmail: [
        'Dear Member,',
        "We are writing to let you know that next week's music club meeting has been changed. Unfortunately, the guest speaker - local musician and music teacher Ms Rachel Dean - is no longer available due to illness.",
        'Instead, we will show a documentary about her life and career, and there will be a short discussion afterwards. The event will still take place at the usual time, and we hope you will enjoy the new format.',
        'If you have any suggestions or questions, please contact the club organiser.',
        'Kind regards,',
        'The Music Club Team'
      ],
      prompts: [
        {
          heading: 'Write an email to your friend.',
          instructions:
            'Write about your feelings and what you think the club should do about the situation. Write about 50 words. Recommended time: 10 minutes.',
          maxWords: 50
        },
        {
          heading: 'Write an email to the president of the club.',
          instructions:
            'Write about your feelings and what you think the club should do about the situation. Write 120-150 words. Recommended time: 20 minutes.',
          maxWords: 150
        }
      ]
    }
  },
  {
    id: 'photography-club',
    title: 'Photography Club',
    menuTitle: 'Mock 2: Photography Club',
    menuDescription: 'Signed-in mock about planning an open talk to attract new members.',
    requiresAuth: true,
    part1: {
      prompt:
        'You want to join a photography club. You have 5 messages from a member of the club. Write short answers (1-5 words) to each message. Recommended time: 3 minutes.',
      questions: [
        'What do you do?',
        'Where do you live?',
        "What's your favourite food?",
        'What do you usually do at the weekend?',
        'What languages do you speak?'
      ]
    },
    part2: {
      prompt:
        'You are a new member of the Photography Club. Fill in the form. Write in sentences. Use 20-30 words. Recommended time: 7 minutes.',
      question:
        'Please tell us about your experience with photography and what you would like to learn at the club.'
    },
    part3: {
      prompt:
        'You are chatting online with other members of the photography club. Answer their messages. Write in sentences. Use 30-40 words per answer. Recommended time: 10 minutes.',
      questions: [
        {
          speaker: 'Maya',
          text: 'Hi and welcome! What types of photography interest you most, and why?'
        },
        {
          speaker: 'Noah',
          text: 'Can you tell us about a photo you took recently that you were pleased with?'
        },
        {
          speaker: 'Elena',
          text: "We're considering a club excursion for members next month. Where do you think we should go, and why would it be a good place to take photos?"
        }
      ]
    },
    part4: {
      intro:
        'You are a member of a photography club. You have received this email from the club:',
      sourceEmail: [
        'Dear Member,',
        'Our photography club would like to organise an open talk next month for people in the local community who may be interested in joining us.',
        'The aim of the event is to show that photography is enjoyable, creative and suitable for people with different levels of experience. We hope the talk will encourage visitors to attend a meeting and become regular members.',
        'We would like to hear your ideas about what the talk should be about and why you think this topic would attract new members.',
        'Please send us your suggestions by the end of the week.',
        'Kind regards,',
        'The Photography Club Committee'
      ],
      prompts: [
        {
          heading: 'Write an email to your friend.',
          instructions:
            'Write about your feelings and what topic you think the talk should cover. Write about 50 words. Recommended time: 10 minutes.',
          maxWords: 50
        },
        {
          heading: 'Write an email to the committee.',
          instructions:
            'Suggest a topic for the open talk, explain why it would attract new members, and give any ideas for organising the event. Write 120-150 words. Recommended time: 20 minutes.',
          maxWords: 150
        }
      ]
    }
  },
  {
    id: 'cooking-course',
    title: 'Cooking Course',
    menuTitle: 'Mock 3: Cooking Course',
    menuDescription: 'Signed-in mock about changes to a practical cooking course.',
    requiresAuth: true,
    part1: {
      prompt:
        'You want to join a cooking course. You have 5 messages from a member of the course. Write short answers (1-5 words) to each message. Recommended time: 3 minutes.',
      questions: [
        'What do you usually have for breakfast?',
        'How do you relax after work?',
        'How often do you use your phone?',
        "What's the weather like today?",
        'What kind of movies do you like?'
      ]
    },
    part2: {
      prompt:
        'You are a new member of the Cooking Course. Fill in the form. Write in sentences. Use 20-30 words. Recommended time: 7 minutes.',
      question:
        'What cooking skill do you most want to improve during the course?'
    },
    part3: {
      prompt:
        'You are chatting with other members of the cooking course in an online forum. Answer their messages. Write in sentences. Use 30-40 words per answer. Recommended time: 10 minutes.',
      questions: [
        {
          speaker: 'Sofia',
          text: "I'm really looking forward to learning some new dishes. What kind of food would you most like to learn how to cook?"
        },
        {
          speaker: 'Daniel',
          text: 'I think cooking is more enjoyable when people cook together. Do you prefer cooking alone or with other people?'
        },
        {
          speaker: 'Priya',
          text: 'Our teacher said we should practise at home between lessons. How much time do you think students should spend practising?'
        }
      ]
    },
    part4: {
      intro:
        'You are a member of a cooking course. You have received this email from the course organiser:',
      sourceEmail: [
        'Dear students,',
        'We are writing to inform you that, from next month, the cooking course will change. Instead of cooking in class every week, students will watch demonstrations by the teacher and then practise the recipes at home.',
        'This change will allow us to invite more students to the course and reduce the cost of ingredients. We believe the new format will be more efficient.',
        'Please write to us with your views.',
        'Course Administration'
      ],
      prompts: [
        {
          heading: 'Write an email to your friend.',
          instructions:
            'Write about your feelings and what you think about the change to the cooking course. Write about 50 words. Recommended time: 10 minutes.',
          maxWords: 50
        },
        {
          heading: 'Write an email to the course organiser.',
          instructions:
            'Write about your views on the new course format, explain whether you think it is a good idea, and suggest what the course should do. Write 120-150 words. Recommended time: 20 minutes.',
          maxWords: 150
        }
      ]
    }
  }
];

export const DEFAULT_MOCK_ID = WRITING_MOCKS[0].id;

export function getWritingMock(mockId) {
  return WRITING_MOCKS.find((mock) => mock.id === mockId) || WRITING_MOCKS[0];
}
