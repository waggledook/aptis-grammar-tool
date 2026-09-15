const ASSET_ROOT = "/aptis-speaking/mock-1";

export const APTIS_SPEAKING_MOCK = {
  id: "speaking-general-1",
  title: "Aptis General Speaking Mock 1",
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

export function getAptisSpeakingMockPart(partNumber) {
  return APTIS_SPEAKING_MOCK.parts[Number(partNumber)] || APTIS_SPEAKING_MOCK.parts[1];
}
