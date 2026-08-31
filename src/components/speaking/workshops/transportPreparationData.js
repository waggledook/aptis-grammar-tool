import { transportData } from "../../vocabulary/data/transportData";

const PREPARATION_IMAGE_BASE = "/images/speaking/workshops/travel-transport/preparation";
const SOURCE_SETS = Object.fromEntries(transportData.sets.map((set) => [set.id, set]));
const INCLUDED_TERMS = [
  ["transport_verbs", "catch"],
  ["transport_verbs", "miss"],
  ["transport_verbs", "board"],
  ["transport_verbs", "commute"],
  ["transport_adjectives", "crowded"],
  ["transport_adjectives", "delayed"],
  ["transport_adjectives", "reliable"],
  ["transport_adjectives", "eco-friendly"],
];

export const transportPhraseCards = INCLUDED_TERMS.map(([setId, term]) => {
  const source = SOURCE_SETS[setId].pairs.find((pair) => pair.term === term);
  return {
    ...source,
    id: term.replace(/\s+/g, "-"),
    image: `${PREPARATION_IMAGE_BASE}/${term.replace(/\s+/g, "-")}.webp`,
  };
});

export const transportContextQuestions = [
  {
    id: "context-catch",
    sentence: "If we leave home now, we should _____ the 7:30 train.",
    options: ["catch", "miss", "board"],
    answer: "catch",
    explanation: "Catch a train means arrive in time to travel on it.",
  },
  {
    id: "context-delayed",
    sentence: "Because of a technical problem, our flight was _____ by nearly two hours.",
    options: ["reliable", "delayed", "crowded"],
    answer: "delayed",
    explanation: "A delayed service leaves or arrives later than planned.",
  },
  {
    id: "context-crowded",
    sentence: "The metro is extremely _____ during the morning rush hour, so people often have to stand.",
    options: ["eco-friendly", "crowded", "remote"],
    answer: "crowded",
    explanation: "Crowded means full of people, with little room to move.",
  },
  {
    id: "context-reliable",
    sentence: "People depend on this bus service because it is frequent and _____.",
    options: ["reliable", "exhausting", "overpriced"],
    answer: "reliable",
    explanation: "A reliable service operates when and as regularly as people expect.",
  },
  {
    id: "context-eco-friendly",
    sentence: "Cycling is an _____ way to make short journeys around a city.",
    options: ["efficient", "eco-friendly", "delayed"],
    answer: "eco-friendly",
    explanation: "Eco-friendly transport causes less harm to the environment.",
  },
  {
    id: "context-commute",
    sentence: "Marina _____ from Toledo to Madrid for work three days a week.",
    options: ["boards", "commutes", "misses"],
    answer: "commutes",
    explanation: "Commute means travel regularly between home and work or study.",
  },
];

export const transportAnswerBuilder = [
  {
    id: "open",
    label: "1 · Answer directly",
    prompt: "Name your preferred form of transport.",
    options: [
      "For everyday journeys, I generally prefer…",
      "The form of transport I use most often is…",
      "If I have a choice, I normally travel by…",
    ],
  },
  {
    id: "advantage",
    label: "2 · Give an advantage",
    prompt: "Explain what makes it suitable.",
    options: [
      "The main advantage is that…",
      "I find it particularly convenient because…",
      "What makes it a good option is…",
    ],
  },
  {
    id: "balance",
    label: "3 · Balance your answer",
    prompt: "Add a drawback or comparison.",
    options: [
      "That said, it can be quite…",
      "Compared with travelling by car, it…",
      "The only real disadvantage is that…",
    ],
  },
  {
    id: "support",
    label: "4 · Support and conclude",
    prompt: "Give an example or overall view.",
    options: [
      "For example, when I travel to work…",
      "This is especially useful when…",
      "Overall, I’d say it is the best option for…",
    ],
  },
];

export const transportPreparationSteps = [
  { id: "phrases", label: "Activate", title: "Journey language", description: "Recall eight useful transport words and phrases from visual cues." },
  { id: "context", label: "Choose", title: "Language in context", description: "Choose the expression that completes each travel situation." },
  { id: "builder", label: "Build", title: "Develop an opinion", description: "Build a balanced answer about an everyday transport choice." },
  { id: "rehearsal", label: "Speak", title: "Photo rehearsal", description: "Use the language in one short response about a busy journey." },
];

export const transportPreparationConfig = {
  phraseCards: transportPhraseCards,
  contextQuestions: transportContextQuestions,
  answerBuilder: transportAnswerBuilder,
  steps: transportPreparationSteps,
  copy: {
    phraseQuestion: "Which transport word or phrase fits?",
    builderQuestion: "Which form of transport is best for your everyday journeys?",
  },
  rehearsal: {
    part: 2,
    taskIndex: 1,
    initialQuestionIndex: 1,
    usefulPhrases: "crowded at rush hour · a reliable service · delayed · commute by…",
    developmentPhrases: "The main advantage is… · That said… · For example… · Overall…",
    checks: [
      ["answer", "I answered the exact question."],
      ["balance", "I developed an idea with an advantage, drawback or example."],
      ["phrase", "I used at least one transport word or phrase."],
    ],
  },
};
