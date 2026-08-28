import { relationshipsData } from "../../vocabulary/data/relationshipsData";

const SOURCE_SET = relationshipsData.sets.find((set) => set.id === "relationship_phrasal_verbs");
const PREPARATION_IMAGE_BASE = "/images/speaking/workshops/relationships-family/preparation";
const INCLUDED_TERMS = [
  "get on",
  "keep in touch",
  "rely on",
  "get to know",
  "trust",
  "grow apart",
  "fall out",
  "make up",
];

export const relationshipPhraseCards = INCLUDED_TERMS.map((term) => {
  const source = SOURCE_SET.pairs.find((pair) => pair.term === term);
  return {
    ...source,
    id: term.replace(/\s+/g, "-"),
    image: `${PREPARATION_IMAGE_BASE}/${term.replace(/\s+/g, "-")}.webp`,
  };
});

export const relationshipContextQuestions = [
  {
    id: "context-keep-in-touch",
    sentence: "Even after Marta moved abroad, we managed to _____ through messages and video calls.",
    options: ["keep in touch", "grow apart", "fall out"],
    answer: "keep in touch",
    explanation: "Keep in touch means continue communicating regularly.",
  },
  {
    id: "context-get-on",
    sentence: "My brother and I _____ really well, although our personalities are quite different.",
    options: ["get on", "make up", "lose touch"],
    answer: "get on",
    explanation: "Get on well with someone means have a good relationship with them.",
  },
  {
    id: "context-rely-on",
    sentence: "She is the person I can always _____ when I need honest advice.",
    options: ["rely on", "get to know", "argue with"],
    answer: "rely on",
    explanation: "Rely on someone means trust them to help or support you.",
  },
  {
    id: "context-grow-apart",
    sentence: "We were close at school, but we gradually _____ after moving to different cities.",
    options: ["grew apart", "made up", "got on"],
    answer: "grew apart",
    explanation: "Grow apart describes becoming less close slowly over time.",
  },
  {
    id: "context-get-to-know",
    sentence: "Joining the course gave me a chance to _____ people from several different countries.",
    options: ["get to know", "fall out with", "rely on"],
    answer: "get to know",
    explanation: "Get to know someone means gradually learn more about them.",
  },
  {
    id: "context-make-up",
    sentence: "They argued during the journey, but they apologised and _____ later that evening.",
    options: ["made up", "grew apart", "kept in touch"],
    answer: "made up",
    explanation: "Make up means become friendly again after an argument.",
  },
];

export const relationshipAnswerBuilder = [
  {
    id: "open",
    label: "1 · Answer directly",
    prompt: "Introduce the person or relationship.",
    options: [
      "One person I’m particularly close to is…",
      "I’d like to talk about…",
      "The relationship that comes to mind is…",
    ],
  },
  {
    id: "develop",
    label: "2 · Explain",
    prompt: "Say why the relationship matters.",
    options: [
      "The main reason we get on so well is that…",
      "What I value most about this relationship is…",
      "This person is important to me because…",
    ],
  },
  {
    id: "support",
    label: "3 · Support",
    prompt: "Add a detail or example.",
    options: [
      "For example, we often…",
      "A good example of this is when…",
      "Whenever I need support, this person…",
    ],
  },
  {
    id: "widen",
    label: "4 · Widen the answer",
    prompt: "Connect your experience to people in general.",
    options: [
      "In general, I think close relationships last when…",
      "For most people, friendship is important because…",
      "I’d say people can maintain strong relationships by…",
    ],
  },
];

export const relationshipPreparationSteps = [
  { id: "phrases", label: "Activate", title: "Relationship phrases", description: "Recall eight useful phrases from visual cues." },
  { id: "context", label: "Choose", title: "Phrases in context", description: "Choose the expression that completes each situation." },
  { id: "builder", label: "Build", title: "Build a longer answer", description: "Choose useful stems for a developed speaking answer." },
  { id: "rehearsal", label: "Speak", title: "Photo rehearsal", description: "Use the language in one short spoken response." },
];
