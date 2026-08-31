export const APTIS_WRITING_PART1_QUESTIONS = [
  "What do you do?",
  "What did you do yesterday?",
  "What’s your favourite colour?",
  "What’s the weather like today?",
  "How do you get to work?",
  "Where do you usually eat lunch?",
  "What time do you get up on weekdays?",
  "What type of films do you like watching?",
  "What’s your favourite type of music?",
  "How often do you exercise?",
  "Who do you spend the weekend with?",
  "What’s your favourite food?",
  "What do you do in your free time?",
  "Who do you live with?",
  "Where do you live?",
  "What’s your favourite animal?",
  "What’s your favourite TV show?",
  "What’s your dream job?",
  "What’s your favourite place in your city?",
  "What dishes do you like to cook?",
  "Who is your best friend?",
  "What’s/was your favourite subject at school?",
  "How often do you use your phone?",
  "What kind of clothes do you like?",
  "What’s your favourite time of year?",
  "What do you usually do on holidays?",
  "What’s your favourite sport?",
  "How do you usually spend your evenings?",
  "What kind of movies do you like?",
  "What are you doing this weekend?",
  "Where would you like to travel?",
  "What languages do you speak?",
  "What do you usually have for breakfast?",
  "What’s your favourite app?",
  "What hobbies do you have?",
  "How do you relax after work?",
];

export const getAptisWritingPart1QuestionId = (question) =>
  `q_${[...question].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0)}`;

export function getAptisWritingPart1QuestionBank() {
  return APTIS_WRITING_PART1_QUESTIONS.map((text) => ({
    id: getAptisWritingPart1QuestionId(text),
    text,
  }));
}

export function getAptisWritingPart1QuestionsById(questionIds = []) {
  const questionById = new Map(getAptisWritingPart1QuestionBank().map((question) => [question.id, question]));
  return questionIds.map((id) => questionById.get(id)).filter(Boolean);
}

export function pickAptisWritingPart1Questions({ history = new Set(), count = 5 } = {}) {
  const bank = getAptisWritingPart1QuestionBank();
  const unseen = bank.filter((question) => !history.has(question.id));
  const pool = unseen.length >= count ? unseen : bank;
  return pool.slice().sort(() => Math.random() - 0.5).slice(0, count);
}
