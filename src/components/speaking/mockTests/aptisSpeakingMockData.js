const ASSET_ROOT = "/aptis-speaking/mock-1";

export const APTIS_SPEAKING_MOCK = {
  id: "speaking-general-1",
  number: 3,
  title: "Aptis General Speaking Mock 3",
  displayTitle: "Aptis General Practice Test",
  durationMinutes: 12,
  parts: {
    1: {
      number: 1,
      title: "Part One",
      responseSeconds: 30,
      instructionAudio: `${ASSET_ROOT}/audio/part1-instructions.mp3`,
      instructionText:
        "In this part, I am going to ask you three short questions about yourself and your interests. You will have 30 seconds to reply to each question. Begin speaking when you hear this sound.",
      questions: [
        { id: "part1-q1", text: "What’s your favourite time of year?", audio: `${ASSET_ROOT}/audio/part1-question1.mp3` },
        { id: "part1-q2", text: "Where do you usually meet your friends?", audio: `${ASSET_ROOT}/audio/part1-question2.mp3` },
        { id: "part1-q3", text: "Please describe your favourite film.", audio: `${ASSET_ROOT}/audio/part1-question3.mp3` },
      ],
    },
    2: {
      number: 2,
      title: "Part Two",
      responseSeconds: 45,
      instructionAudio: `${ASSET_ROOT}/audio/part2-instructions.mp3`,
      instructionText:
        "In this part, I'm going to ask you to describe a picture. Then I will ask you two questions about it. You will have 45 seconds for each response. Begin speaking when you hear this sound.",
      image: `${ASSET_ROOT}/images/library.jpg`,
      imageAlt: "People reading and studying in a library",
      questions: [
        { id: "part2-q1", text: "Describe the photograph.", audio: `${ASSET_ROOT}/audio/part2-question1.mp3` },
        { id: "part2-q2", text: "Do people in your country use libraries often?", audio: `${ASSET_ROOT}/audio/part2-question2.mp3` },
        { id: "part2-q3", text: "Why is reading important for people of all ages?", audio: `${ASSET_ROOT}/audio/part2-question3.mp3` },
      ],
    },
    3: {
      number: 3,
      title: "Part Three",
      responseSeconds: 45,
      instructionAudio: `${ASSET_ROOT}/audio/part3-instructions.mp3`,
      instructionText:
        "In this part, I'm going to ask you to compare two pictures, and I will then ask you two questions about them. You will have 45 seconds for each response. Begin speaking when you hear this sound.",
      images: [
        { src: `${ASSET_ROOT}/images/part-3-first.jpg`, alt: "A person travelling by train" },
        { src: `${ASSET_ROOT}/images/part-3-second.jpg`, alt: "A person travelling by car" },
      ],
      questions: [
        { id: "part3-q1", text: "Tell me what you can see in the two photographs.", audio: `${ASSET_ROOT}/audio/part3-question1.mp3` },
        { id: "part3-q2", text: "What are the benefits of each way of travelling?", audio: `${ASSET_ROOT}/audio/part3-question2.mp3` },
        { id: "part3-q3", text: "Which way do you normally prefer to travel?", audio: `${ASSET_ROOT}/audio/part3-question3.mp3` },
      ],
    },
    4: {
      number: 4,
      title: "Part Four",
      prepSeconds: 60,
      responseSeconds: 120,
      instructionAudio: `${ASSET_ROOT}/audio/part4-instructions.mp3`,
      questionsAudio: `${ASSET_ROOT}/audio/part4-questions.mp3`,
      startAudio: `${ASSET_ROOT}/audio/part4-start.mp3`,
      instructionText:
        "In this part, I'm going to show you a picture and ask you three questions. You will have one minute to think about your answers before you start speaking. You will have two minutes to answer all three questions. Begin speaking when you hear this sound. Look at the photograph.",
      image: `${ASSET_ROOT}/images/celebration.jpg`,
      imageAlt: "People enjoying a celebration",
      questions: [
        { id: "part4-q1", text: "Tell me about a celebration you enjoyed recently." },
        { id: "part4-q2", text: "What made it special for you?" },
        { id: "part4-q3", text: "Do you think traditional celebrations are becoming less important nowadays?" },
      ],
    },
  },
  beepAudio: `${ASSET_ROOT}/audio/beep.mp3`,
};

const MOCK_2_ROOT = "/aptis-speaking/mock-2";
const MOCK_3_ROOT = "/aptis-speaking/mock-3";

const sharedAudio = {
  1: `${ASSET_ROOT}/audio/part1-instructions.mp3`,
  2: `${ASSET_ROOT}/audio/part2-instructions.mp3`,
  3: `${ASSET_ROOT}/audio/part3-instructions.mp3`,
  4: `${ASSET_ROOT}/audio/part4-instructions.mp3`,
  start: `${ASSET_ROOT}/audio/part4-start.mp3`,
  beep: `${ASSET_ROOT}/audio/beep.mp3`,
};

const sharedInstructionText = Object.fromEntries(
  [1, 2, 3, 4].map((number) => [number, APTIS_SPEAKING_MOCK.parts[number].instructionText])
);

// Keep IDs and asset paths stable so existing links and activity records still identify the same test.
export const APTIS_SPEAKING_MOCKS = [
  {
    id: "speaking-general-2",
    number: 1,
    title: "Aptis General Speaking Mock 1",
    displayTitle: "Aptis General Practice Test",
    durationMinutes: 12,
    beepAudio: sharedAudio.beep,
    parts: {
      1: {
        number: 1,
        title: "Part One",
        responseSeconds: 30,
        instructionAudio: sharedAudio[1],
        instructionText: sharedInstructionText[1],
        questions: [
          { id: "mock2-part1-q1", text: "What do you usually do in the morning?", audio: `${MOCK_2_ROOT}/audio/part1-question1.mp3` },
          { id: "mock2-part1-q2", text: "Where do you like to go in your free time?", audio: `${MOCK_2_ROOT}/audio/part1-question2.mp3` },
          { id: "mock2-part1-q3", text: "What did you do last weekend?", audio: `${MOCK_2_ROOT}/audio/part1-question3.mp3` },
        ],
      },
      2: {
        number: 2,
        title: "Part Two",
        responseSeconds: 45,
        instructionAudio: sharedAudio[2],
        instructionText: sharedInstructionText[2],
        image: `${MOCK_2_ROOT}/images/mock-2-part-2-repairing-chair.jpg`,
        imageAlt: "An adult repairing a wooden chair at home",
        questions: [
          { id: "mock2-part2-q1", text: "Describe the photograph.", audio: `${MOCK_2_ROOT}/audio/part2-question1.mp3` },
          { id: "mock2-part2-q2", text: "What do you usually do when something you own stops working?", audio: `${MOCK_2_ROOT}/audio/part2-question2.mp3` },
          { id: "mock2-part2-q3", text: "Why do some people prefer repairing things to replacing them?", audio: `${MOCK_2_ROOT}/audio/part2-question3.mp3` },
        ],
      },
      3: {
        number: 3,
        title: "Part Three",
        responseSeconds: 45,
        instructionAudio: sharedAudio[3],
        instructionText: sharedInstructionText[3],
        images: [
          { src: `${MOCK_2_ROOT}/images/mock-2-part-3-art-together.jpg`, alt: "A small group of adults painting a mural together" },
          { src: `${MOCK_2_ROOT}/images/mock-2-part-3-art-alone.jpg`, alt: "An adult painting alone in a bright studio" },
        ],
        questions: [
          { id: "mock2-part3-q1", text: "Compare the two photographs.", audio: `${MOCK_2_ROOT}/audio/part3-question1.mp3` },
          { id: "mock2-part3-q2", text: "How might the experience of creating art be different in these two situations?", audio: `${MOCK_2_ROOT}/audio/part3-question2.mp3` },
          { id: "mock2-part3-q3", text: "Why might some creative projects benefit from teamwork more than others?", audio: `${MOCK_2_ROOT}/audio/part3-question3.mp3` },
        ],
      },
      4: {
        number: 4,
        title: "Part Four",
        prepSeconds: 60,
        responseSeconds: 120,
        instructionAudio: sharedAudio[4],
        instructionText: sharedInstructionText[4],
        questionsAudio: `${MOCK_2_ROOT}/audio/part4-questions.mp3`,
        startAudio: sharedAudio.start,
        image: `${MOCK_2_ROOT}/images/mock-2-part-4-advice.jpg`,
        imageAlt: "Two adults having a thoughtful conversation",
        questions: [
          { id: "mock2-part4-q1", text: "Tell me about a time someone gave you useful advice." },
          { id: "mock2-part4-q2", text: "How did that advice affect what you decided to do?" },
          { id: "mock2-part4-q3", text: "Why do people sometimes ignore good advice?" },
        ],
      },
    },
  },
  {
    id: "speaking-general-3",
    number: 2,
    title: "Aptis General Speaking Mock 2",
    displayTitle: "Aptis General Practice Test",
    durationMinutes: 12,
    beepAudio: sharedAudio.beep,
    parts: {
      1: {
        number: 1,
        title: "Part One",
        responseSeconds: 30,
        instructionAudio: sharedAudio[1],
        instructionText: sharedInstructionText[1],
        questions: [
          { id: "mock3-part1-q1", text: "What do you usually have for breakfast?", audio: `${MOCK_3_ROOT}/audio/part1-question1.mp3` },
          { id: "mock3-part1-q2", text: "Tell me about someone you enjoy spending time with.", audio: `${MOCK_3_ROOT}/audio/part1-question2.mp3` },
          { id: "mock3-part1-q3", text: "What did you do yesterday evening?", audio: `${MOCK_3_ROOT}/audio/part1-question3.mp3` },
        ],
      },
      2: {
        number: 2,
        title: "Part Two",
        responseSeconds: 45,
        instructionAudio: sharedAudio[2],
        instructionText: sharedInstructionText[2],
        image: `${MOCK_3_ROOT}/images/mock-3-part-2-taking-break.jpg`,
        imageAlt: "Two colleagues taking a short break outside their workplace",
        questions: [
          { id: "mock3-part2-q1", text: "Describe the photograph.", audio: `${MOCK_3_ROOT}/audio/part2-question1.mp3` },
          { id: "mock3-part2-q2", text: "What do you usually do during breaks from work or study?", audio: `${MOCK_3_ROOT}/audio/part2-question2.mp3` },
          { id: "mock3-part2-q3", text: "Why can regular breaks help people work or study more effectively?", audio: `${MOCK_3_ROOT}/audio/part2-question3.mp3` },
        ],
      },
      3: {
        number: 3,
        title: "Part Three",
        responseSeconds: 45,
        instructionAudio: sharedAudio[3],
        instructionText: sharedInstructionText[3],
        images: [
          { src: `${MOCK_3_ROOT}/images/mock-3-part-3-new-clothes.jpg`, alt: "An adult choosing a new jacket in a clothes shop" },
          { src: `${MOCK_3_ROOT}/images/mock-3-part-3-second-hand-clothes.jpg`, alt: "An adult browsing second-hand clothes at a market stall" },
        ],
        questions: [
          { id: "mock3-part3-q1", text: "Compare the two photographs.", audio: `${MOCK_3_ROOT}/audio/part3-question1.mp3` },
          { id: "mock3-part3-q2", text: "What might influence people when choosing between these two ways of buying clothes?", audio: `${MOCK_3_ROOT}/audio/part3-question2.mp3` },
          { id: "mock3-part3-q3", text: "Do you think buying second-hand goods will become more common in the future? Why or why not?", audio: `${MOCK_3_ROOT}/audio/part3-question3.mp3` },
        ],
      },
      4: {
        number: 4,
        title: "Part Four",
        prepSeconds: 60,
        responseSeconds: 120,
        instructionAudio: sharedAudio[4],
        instructionText: sharedInstructionText[4],
        questionsAudio: `${MOCK_3_ROOT}/audio/part4-questions.mp3`,
        startAudio: sharedAudio.start,
        image: `${MOCK_3_ROOT}/images/mock-3-part-4-waiting.jpg`,
        imageAlt: "People waiting in an orderly queue outside a public venue",
        questions: [
          { id: "mock3-part4-q1", text: "Tell me about a time you had to wait longer than you expected." },
          { id: "mock3-part4-q2", text: "How did you deal with the situation?" },
          { id: "mock3-part4-q3", text: "Do you think modern technology has made people less willing to wait? Why or why not?" },
        ],
      },
    },
  },
  APTIS_SPEAKING_MOCK,
];

export function getAptisSpeakingMock(mockId) {
  return APTIS_SPEAKING_MOCKS.find((mock) => mock.id === mockId) || null;
}

export function getAptisSpeakingMockPart(partNumber, mock = APTIS_SPEAKING_MOCKS[0]) {
  return mock.parts[Number(partNumber)] || mock.parts[1];
}
