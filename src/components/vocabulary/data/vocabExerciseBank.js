import definitionFeedback from "./definitionFeedback.js";
import gapFillFeedback from "./gapFillFeedback.js";
import synonymFeedback from "./synonymFeedback.js";

const synonymSets = [
  {
    id: "syn-adj-1",
    title: "Adjectives: core synonyms",
    wordClass: "adjective",
    example: { prompt: "small", answer: "little" },
    options: {
      A: "empty",
      B: "modern",
      C: "quick",
      D: "normal",
      E: "old",
      F: "difficult",
      G: "accurate",
      H: "strange",
      J: "safe",
      K: "silent",
      L: "little",
    },
    answers: [
      ["ancient", "E"],
      ["precise", "G"],
      ["vacant", "A"],
      ["rapid", "C"],
      ["standard", "D"],
    ],
  },
  {
    id: "syn-verb-1",
    title: "Verbs: common actions",
    wordClass: "verb",
    example: { prompt: "start", answer: "begin" },
    options: {
      A: "accomplish",
      B: "need",
      C: "choose",
      D: "allow",
      E: "ignore",
      F: "collect",
      G: "destroy",
      H: "receive",
      J: "mention",
      K: "complain",
      L: "begin",
    },
    answers: [
      ["select", "C"],
      ["require", "B"],
      ["permit", "D"],
      ["achieve", "A"],
      ["gather", "F"],
    ],
  },
  {
    id: "syn-noun-1",
    title: "Nouns: abstract ideas",
    wordClass: "noun",
    example: { prompt: "job", answer: "work" },
    options: {
      A: "advantage",
      B: "risk",
      C: "mistake",
      D: "argument",
      E: "effect",
      F: "purpose",
      G: "choice",
      H: "solution",
      J: "method",
      K: "schedule",
      L: "work",
    },
    answers: [
      ["impact", "E"],
      ["danger", "B"],
      ["error", "C"],
      ["benefit", "A"],
      ["dispute", "D"],
    ],
  },
  {
    id: "syn-adj-2",
    title: "Adjectives: descriptions",
    wordClass: "adjective",
    example: { prompt: "glad", answer: "happy" },
    options: {
      A: "first",
      B: "careful",
      C: "noticeable",
      D: "complicated",
      E: "huge",
      F: "simple",
      G: "dangerous",
      H: "final",
      J: "heavy",
      K: "silent",
      L: "happy",
    },
    answers: [
      ["complex", "D"],
      ["massive", "E"],
      ["initial", "A"],
      ["visible", "C"],
      ["cautious", "B"],
    ],
  },
  {
    id: "syn-adj-3",
    title: "Adjectives: precision",
    wordClass: "adjective",
    example: { prompt: "correct", answer: "right" },
    options: {
      A: "final",
      B: "strong",
      C: "unclear",
      D: "unfriendly",
      E: "tiny",
      F: "brief",
      G: "secure",
      H: "general",
      J: "expensive",
      K: "intelligent",
      L: "right",
    },
    answers: [
      ["hostile", "D"],
      ["vague", "C"],
      ["terminal", "A"],
      ["miniature", "E"],
      ["robust", "B"],
    ],
  },
  {
    id: "syn-adj-4",
    title: "Adjectives: formal synonyms",
    wordClass: "adjective",
    example: { prompt: "hard", answer: "difficult" },
    options: {
      A: "real",
      B: "complete",
      C: "wealthy",
      D: "unwilling",
      E: "regular",
      F: "artificial",
      G: "partial",
      H: "poor",
      J: "dynamic",
      K: "ultimate",
      L: "difficult",
    },
    answers: [
      ["reluctant", "D"],
      ["genuine", "A"],
      ["absolute", "B"],
      ["prosperous", "C"],
      ["standard", "E"],
    ],
  },
  {
    id: "syn-verb-2",
    title: "Verbs: formal synonyms",
    wordClass: "verb",
    example: { prompt: "talk", answer: "speak" },
    options: {
      A: "assess",
      B: "disappear",
      C: "delay",
      D: "transmit",
      E: "tolerate",
      F: "encourage",
      G: "imagine",
      H: "accelerate",
      J: "refuse",
      K: "design",
      L: "speak",
    },
    answers: [
      ["vanish", "B"],
      ["evaluate", "A"],
      ["endure", "E"],
      ["convey", "D"],
      ["postpone", "C"],
    ],
  },
  {
    id: "syn-verb-3",
    title: "Verbs: academic synonyms",
    wordClass: "verb",
    example: { prompt: "purchase", answer: "buy" },
    options: {
      A: "decrease",
      B: "obtain",
      C: "use",
      D: "settle",
      E: "expect",
      F: "expand",
      G: "dynamic",
      H: "reject",
      J: "ignore",
      K: "describe",
      L: "buy",
    },
    answers: [
      ["acquire", "B"],
      ["resolve", "D"],
      ["diminish", "A"],
      ["utilize", "C"],
      ["anticipate", "E"],
    ],
  },
  {
    id: "syn-noun-2",
    title: "Nouns: abstract meanings",
    wordClass: "noun",
    example: { prompt: "gift", answer: "present" },
    options: {
      A: "result",
      B: "danger",
      C: "viewpoint",
      D: "disorder",
      E: "plenty",
      F: "purpose",
      G: "origin",
      H: "shortage",
      J: "benefit",
      K: "context",
      L: "present",
    },
    answers: [
      ["consequence", "A"],
      ["abundance", "E"],
      ["hazard", "B"],
      ["chaos", "D"],
      ["perspective", "C"],
    ],
  },
  {
    id: "syn-verb-4",
    title: "Verbs: everyday synonyms",
    wordClass: "verb",
    options: {
      A: "allow",
      B: "damage",
      C: "choose",
      D: "improve",
      E: "fix",
      F: "carry on",
      G: "increase",
      H: "refuse",
      I: "cut down",
      J: "explain",
    },
    answers: [
      ["continue", "F"],
      ["reduce", "I"],
      ["repair", "E"],
      ["select", "C"],
      ["permit", "A"],
    ],
  },
  {
    id: "syn-noun-3",
    title: "Nouns: everyday synonyms",
    wordClass: "noun",
    options: {
      A: "error",
      B: "reason",
      C: "trip",
      D: "risk",
      E: "option",
      F: "result",
      G: "target",
      H: "rule",
      I: "price",
      J: "advice",
    },
    answers: [
      ["aim", "G"],
      ["danger", "D"],
      ["choice", "E"],
      ["mistake", "A"],
      ["journey", "C"],
    ],
  },
  {
    id: "syn-adj-5",
    title: "Adjectives: everyday synonyms",
    wordClass: "adjective",
    options: {
      A: "sure",
      B: "quiet",
      C: "cheap",
      D: "usual",
      E: "strange",
      F: "hard",
      G: "nervous",
      H: "costly",
      I: "simple",
      J: "serious",
    },
    answers: [
      ["common", "D"],
      ["difficult", "F"],
      ["calm", "B"],
      ["expensive", "H"],
      ["certain", "A"],
    ],
  },
  {
    id: "syn-verb-5",
    title: "Verbs: actions and processes",
    wordClass: "verb",
    options: {
      A: "start",
      B: "gather",
      C: "defend",
      D: "take away",
      E: "develop",
      F: "finish",
      G: "damage",
      H: "include",
      I: "explain",
      J: "refuse",
    },
    answers: [
      ["improve", "E"],
      ["collect", "B"],
      ["begin", "A"],
      ["protect", "C"],
      ["remove", "D"],
    ],
  },
  {
    id: "syn-verb-6",
    title: "Verbs: communication and control",
    wordClass: "verb",
    options: {
      A: "escape",
      B: "control",
      C: "get",
      D: "propose",
      E: "see",
      F: "accept",
      G: "repair",
      H: "continue",
      I: "forget",
      J: "produce",
    },
    answers: [
      ["receive", "C"],
      ["notice", "E"],
      ["suggest", "D"],
      ["avoid", "A"],
      ["manage", "B"],
    ],
  },
  {
    id: "syn-noun-4",
    title: "Nouns: general meanings",
    wordClass: "noun",
    options: {
      A: "chance",
      B: "work",
      C: "difficulty",
      D: "place",
      E: "details",
      F: "answer",
      G: "journey",
      H: "rule",
      I: "opinion",
      J: "cost",
    },
    answers: [
      ["problem", "C"],
      ["information", "E"],
      ["opportunity", "A"],
      ["area", "D"],
      ["job", "B"],
    ],
  },
  {
    id: "syn-noun-5",
    title: "Nouns: purpose and support",
    wordClass: "noun",
    options: {
      A: "help",
      B: "outcome",
      C: "aim",
      D: "question",
      E: "routine",
      F: "demand",
      G: "choice",
      H: "worry",
      I: "example",
      J: "price",
    },
    answers: [
      ["purpose", "C"],
      ["habit", "E"],
      ["result", "B"],
      ["support", "A"],
      ["request", "F"],
    ],
  },
  {
    id: "syn-adj-6",
    title: "Adjectives: useful descriptions",
    wordClass: "adjective",
    options: {
      A: "right",
      B: "helpful",
      C: "easy",
      D: "important",
      E: "anxious",
      F: "strange",
      G: "careful",
      H: "wrong",
      I: "boring",
      J: "weak",
    },
    answers: [
      ["useful", "B"],
      ["worried", "E"],
      ["simple", "C"],
      ["serious", "D"],
      ["correct", "A"],
    ],
  },
  {
    id: "syn-adj-7",
    title: "Adjectives: similarity and feeling",
    wordClass: "adjective",
    options: {
      A: "strange",
      B: "alike",
      C: "essential",
      D: "happy",
      E: "poor",
      F: "strong",
      G: "boring",
      H: "likely",
      I: "ready",
      J: "safe",
    },
    answers: [
      ["similar", "B"],
      ["necessary", "C"],
      ["unusual", "A"],
      ["pleased", "D"],
      ["weak", "E"],
    ],
  },
];

const definitionSets = [
  {
    id: "def-noun-1",
    title: "Definitions: nouns 1",
    wordClass: "noun",
    options: {
      A: "receipt",
      B: "neighbour",
      C: "review",
      D: "subscription",
      E: "snack",
      F: "itinerary",
      G: "signal",
      H: "journey",
      J: "discount",
      K: "complaint",
    },
    answers: [
      ["A person who lives near you.", "B"],
      ["A written plan for a journey.", "F"],
      ["A short opinion about a book, film, hotel, or product.", "C"],
      ["Money that you pay regularly to use a service.", "D"],
      ["A small amount of food eaten between meals.", "E"],
    ],
  },
  {
    id: "def-noun-2",
    title: "Definitions: nouns 2",
    wordClass: "noun",
    options: {
      A: "witness",
      B: "committee",
      C: "refund",
      D: "obstacle",
      E: "suspicion",
      F: "equipment",
      G: "border",
      H: "damage",
      J: "habit",
      K: "feature",
    },
    answers: [
      ["A person who gives information about something they saw.", "A"],
      ["A difficulty that stops you or slows you down.", "D"],
      ["Money that is given back to you after you return something.", "C"],
      ["A group of people chosen to make decisions for an organisation.", "B"],
      ["A feeling that something may be true, although you are not sure.", "E"],
    ],
  },
  {
    id: "def-noun-3",
    title: "Definitions: nouns 3",
    wordClass: "noun",
    options: {
      A: "customer",
      B: "appointment",
      C: "evidence",
      D: "benefit",
      E: "commute",
      F: "entrance",
      G: "recipe",
      H: "luggage",
      J: "salary",
      K: "warning",
    },
    answers: [
      ["Something that proves or helps to prove that something is true.", "C"],
      ["A regular journey between home and work or school.", "E"],
      ["A person who buys goods or services from a shop or company.", "A"],
      ["Something good that happens because of an action or situation.", "D"],
      ["A formal meeting arranged for a particular time.", "B"],
    ],
  },
  {
    id: "def-noun-4",
    title: "Definitions: nouns 4",
    wordClass: "noun",
    options: {
      A: "ladder",
      B: "factory",
      C: "complaint",
      D: "competitor",
      E: "adjustment",
      F: "border",
      G: "charity",
      H: "delay",
      J: "feature",
      K: "habit",
    },
    answers: [
      ["A person who competes in a sport or competition.", "D"],
      ["A piece of equipment used for climbing up or down.", "A"],
      ["A small change made to improve or correct something.", "E"],
      ["A place where goods are made using machines.", "B"],
      ["A written or spoken statement saying that something is wrong or unsatisfactory.", "C"],
    ],
  },
  {
    id: "def-verb-1",
    title: "Definitions: verbs 1",
    wordClass: "verb",
    options: {
      A: "compare",
      B: "deny",
      C: "improve",
      D: "announce",
      E: "prevent",
      F: "borrow",
      G: "repair",
      H: "attract",
      J: "include",
      K: "receive",
    },
    answers: [
      ["To make something better.", "C"],
      ["To say officially that something will happen.", "D"],
      ["To stop something from happening.", "E"],
      ["To look at two things and think about how they are similar or different.", "A"],
      ["To say that something is not true.", "B"],
    ],
  },
  {
    id: "def-verb-2",
    title: "Definitions: verbs 2",
    wordClass: "verb",
    options: {
      A: "reduce",
      B: "remind",
      C: "appoint",
      D: "participate",
      E: "repay",
      F: "repair",
      G: "protect",
      H: "complain",
      J: "refuse",
      K: "develop",
    },
    answers: [
      ["To give someone back the money that you owe them.", "E"],
      ["To make someone remember something.", "B"],
      ["To take part in an activity or event.", "D"],
      ["To choose someone officially for a job or position.", "C"],
      ["To make something smaller in size, amount, or degree.", "A"],
    ],
  },
  {
    id: "def-verb-3",
    title: "Definitions: verbs 3",
    wordClass: "verb",
    options: {
      A: "arrange",
      B: "predict",
      C: "request",
      D: "survive",
      E: "apologise",
      F: "afford",
      G: "measure",
      H: "replace",
      J: "refuse",
      K: "warn",
    },
    answers: [
      ["To say what you think will happen in the future.", "B"],
      ["To continue to live or exist after a dangerous or difficult situation.", "D"],
      ["To say that you are sorry about something you did.", "E"],
      ["To organise something before it happens.", "A"],
      ["To ask for something in a formal or polite way.", "C"],
    ],
  },
  {
    id: "def-verb-4",
    title: "Definitions: verbs 4",
    wordClass: "verb",
    options: {
      A: "claim",
      B: "attract",
      C: "extend",
      D: "investigate",
      E: "appoint",
      F: "repair",
      G: "depend",
      H: "avoid",
      J: "borrow",
      K: "behave",
    },
    answers: [
      ["To make someone feel interested in something.", "B"],
      ["To say that something is true, although other people may not agree.", "A"],
      ["To make something last for a longer time.", "C"],
      ["To give someone a job or responsibility.", "E"],
      ["To look for information in a careful and detailed way.", "D"],
    ],
  },
  {
    id: "def-adjective-1",
    title: "Definitions: adjectives 1",
    wordClass: "adjective",
    options: {
      A: "flexible",
      B: "confident",
      C: "objective",
      D: "unlikely",
      E: "demanding",
      F: "ordinary",
      G: "previous",
      H: "polite",
      J: "sudden",
      K: "private",
    },
    answers: [
      ["Not likely to happen.", "D"],
      ["Needing a lot of effort, time, or skill.", "E"],
      ["Able to change easily when necessary.", "A"],
      ["Based on facts rather than personal feelings.", "C"],
      ["Feeling sure about your own ability.", "B"],
    ],
  },
  {
    id: "def-adjective-2",
    title: "Definitions: adjectives 2",
    wordClass: "adjective",
    options: {
      A: "urgent",
      B: "widespread",
      C: "fragile",
      D: "annoying",
      E: "experienced",
      F: "narrow",
      G: "familiar",
      H: "empty",
      J: "accurate",
      K: "suitable",
    },
    answers: [
      ["Very important and needing immediate attention.", "A"],
      ["Making you feel slightly angry or impatient.", "D"],
      ["Easy to break or damage.", "C"],
      ["Existing in many places or among many people.", "B"],
      ["Having a lot of knowledge or skill because of past work or practice.", "E"],
    ],
  },
  {
    id: "def-adjective-3",
    title: "Definitions: adjectives 3",
    wordClass: "adjective",
    options: {
      A: "reliable",
      B: "temporary",
      C: "suitable",
      D: "ordinary",
      E: "efficient",
      F: "nervous",
      G: "guilty",
      H: "narrow",
      J: "artificial",
      K: "severe",
    },
    answers: [
      ["Able to be trusted or depended on.", "A"],
      ["Lasting for only a short time.", "B"],
      ["Right or appropriate for a particular person, purpose, or situation.", "C"],
      ["Working well without wasting time, money, or energy.", "E"],
      ["Not unusual or special.", "D"],
    ],
  },
  {
    id: "def-adjective-4",
    title: "Definitions: adjectives 4",
    wordClass: "adjective",
    options: {
      A: "generous",
      B: "accurate",
      C: "illegal",
      D: "ambitious",
      E: "severe",
      F: "familiar",
      G: "casual",
      H: "ordinary",
      J: "empty",
      K: "private",
    },
    answers: [
      ["Very bad or serious.", "E"],
      ["Willing to give money, time, or help to other people.", "A"],
      ["Correct in every detail.", "B"],
      ["Not allowed by law or rules.", "C"],
      ["Having a strong wish to be successful or powerful.", "D"],
    ],
  },
];

const gapFillSets = [
  {
    id: "gap-noun-1",
    title: "Nouns: workplace and travel",
    wordClass: "noun",
    options: {
      A: "bonus",
      B: "delay",
      C: "custom",
      D: "contract",
      E: "budget",
      F: "permission",
      G: "document",
      H: "growth",
      J: "shift",
      K: "signal",
    },
    answers: [
      ["The company decided to increase the annual ___ for marketing.", "E"],
      ["Passengers must show their travel ___ before boarding the train.", "G"],
      ["She received a generous ___ for her hard work on the project.", "A"],
      ["The heavy snow caused a significant ___ to the morning flight schedule.", "B"],
      ["Please sign the ___ at the bottom of the page to confirm your agreement.", "D"],
    ],
  },
  {
    id: "gap-verb-1",
    title: "Verbs: everyday actions",
    wordClass: "verb",
    options: {
      A: "cancel",
      B: "avoid",
      C: "renew",
      D: "expand",
      E: "affect",
      F: "restore",
      G: "progress",
      H: "maintain",
      J: "complain",
      K: "deliver",
    },
    answers: [
      ["The local council plans to ___ the old library building instead of knocking it down.", "F"],
      ["I need to ___ my passport before we travel abroad next month.", "C"],
      ["Drivers are advised to ___ passing through the city centre during rush hour.", "B"],
      ["The heavy rain will likely ___ the quality of the harvest this year.", "E"],
      ["We had to ___ the outdoor party because of the unexpected storm.", "A"],
    ],
  },
  {
    id: "gap-adj-1",
    title: "Adjectives: descriptions and qualities",
    wordClass: "adjective",
    options: {
      A: "crowded",
      B: "temporary",
      C: "essential",
      D: "clear",
      E: "continuous",
      F: "financial",
      G: "anxious",
      H: "serious",
      J: "artificial",
      K: "flexible",
    },
    answers: [
      ["The instructions were so ___ that everyone understood them immediately.", "D"],
      ["It is ___ to lock all windows and doors before leaving the house empty.", "C"],
      ["The city centre is always extremely ___ on Saturday afternoons.", "A"],
      ["He made a ___ mistake on his tax return and had to pay a fine.", "H"],
      ["She was completely ___ about the results of her final exam.", "G"],
    ],
  },
  {
    id: "gap-noun-2",
    title: "Nouns: travel and places",
    wordClass: "noun",
    options: {
      A: "branch",
      B: "permission",
      C: "queue",
      D: "witness",
      E: "view",
      F: "wallet",
      G: "advice",
      H: "delay",
      I: "recipe",
      J: "mistake",
    },
    answers: [
      ["The hotel room had a wonderful ___ of the sea.", "E"],
      ["You need your parents' ___ to join the school trip.", "B"],
      ["The police are looking for a ___ who saw the accident.", "D"],
      ["There was a long ___ at the airport check-in desk.", "C"],
      ["The company has opened a new ___ in the city centre.", "A"],
    ],
  },
  {
    id: "gap-noun-3",
    title: "Nouns: everyday contexts",
    wordClass: "noun",
    options: {
      A: "playground",
      B: "solution",
      C: "envelope",
      D: "speech",
      E: "exhibition",
      F: "ceiling",
      G: "habit",
      H: "traffic",
      I: "neighbour",
      J: "receipt",
    },
    answers: [
      ["She wrote the address on the ___ before posting the letter.", "C"],
      ["The children played in the ___ behind the school.", "A"],
      ["He gave a short ___ at the beginning of the meeting.", "D"],
      ["We need to find a ___ to this problem soon.", "B"],
      ["The museum has a new ___ about ancient Egypt.", "E"],
    ],
  },
  {
    id: "gap-verb-2",
    title: "Verbs: school and events",
    wordClass: "verb",
    options: {
      A: "disturb",
      B: "reduce",
      C: "announce",
      D: "cancel",
      E: "write",
      F: "borrow",
      G: "collect",
      H: "protect",
      I: "repair",
      J: "invite",
    },
    answers: [
      ["The school will ___ the results next week.", "C"],
      ["Please ___ your name at the top of the form.", "E"],
      ["They had to ___ the match because of the rain.", "D"],
      ["I don't want to ___ you while you're working.", "A"],
      ["The new road will ___ the journey by twenty minutes.", "B"],
    ],
  },
  {
    id: "gap-verb-3",
    title: "Verbs: actions and checking",
    wordClass: "verb",
    options: {
      A: "compare",
      B: "charge",
      C: "raise",
      D: "check",
      E: "cut",
      F: "explain",
      G: "follow",
      H: "refuse",
      I: "notice",
      J: "expect",
    },
    answers: [
      ["You should ___ your answers before you hand in the test.", "D"],
      ["The charity hopes to ___ enough money for the new hospital.", "C"],
      ["This machine can ___ paper into small pieces.", "E"],
      ["The teacher asked us to ___ the two pictures.", "A"],
      ["I forgot to ___ my phone before I left home.", "B"],
    ],
  },
  {
    id: "gap-adj-2",
    title: "Adjectives: everyday descriptions",
    wordClass: "adjective",
    options: {
      A: "clear",
      B: "nervous",
      C: "busy",
      D: "wet",
      E: "heavy",
      F: "polite",
      G: "empty",
      H: "useful",
      I: "narrow",
      J: "fresh",
    },
    answers: [
      ["The instructions were very ___, so everybody understood them.", "A"],
      ["The road was ___ after the heavy rain.", "D"],
      ["She felt ___ before the interview.", "B"],
      ["This bag is too ___ to carry on the plane.", "E"],
      ["The restaurant was ___, so we had to wait for a table.", "C"],
    ],
  },
  {
    id: "gap-adj-3",
    title: "Adjectives: states and qualities",
    wordClass: "adjective",
    options: {
      A: "helpful",
      B: "hot",
      C: "small",
      D: "far",
      E: "boring",
      F: "empty",
      G: "famous",
      H: "safe",
      I: "noisy",
      J: "broken",
    },
    answers: [
      ["The soup was still ___, so I waited before eating it.", "B"],
      ["It was a ___ mistake, but it caused a serious problem.", "C"],
      ["The film was quite ___, and I nearly fell asleep.", "E"],
      ["The village is ___ from the nearest train station.", "D"],
      ["The shop assistant was very ___ and answered all our questions.", "A"],
    ],
  },
];

const collocationSets = [
  {
    id: "col-mixed-1",
    title: "Collocations: common adjective pairs",
    wordClass: "mixed",
    options: {
      A: "objective",
      B: "clear",
      C: "intelligence",
      D: "change",
      E: "respect",
      F: "weather",
      G: "expense",
      H: "advice",
      J: "custom",
      K: "mistake",
    },
    answers: [
      ["artificial", "C"],
      ["mutual", "E"],
      ["dramatic", "D"],
      ["crystal", "B"],
      ["ultimate", "A"],
    ],
  },
  {
    id: "col-mixed-2",
    title: "Collocations: topic phrases",
    wordClass: "mixed",
    options: {
      A: "traffic",
      B: "energy",
      C: "events",
      D: "role",
      E: "aids",
      F: "problem",
      G: "income",
      H: "method",
      J: "deadline",
      K: "receipt",
    },
    answers: [
      ["visual", "E"],
      ["heavy", "A"],
      ["vital", "D"],
      ["solar", "B"],
      ["sequence of", "C"],
    ],
  },
  {
    id: "col-mixed-3",
    title: "Collocations: formal phrases",
    wordClass: "mixed",
    options: {
      A: "behaviour",
      B: "breath",
      C: "expert",
      D: "illness",
      E: "audit",
      F: "envelope",
      G: "ceiling",
      H: "witness",
      J: "receipt",
      K: "corridor",
    },
    answers: [
      ["consumer", "A"],
      ["deep", "B"],
      ["leading", "C"],
      ["terminal", "D"],
      ["internal", "E"],
    ],
  },
  {
    id: "col-mixed-4",
    title: "Collocations: academic phrases",
    wordClass: "mixed",
    options: {
      A: "ban",
      B: "damage",
      C: "procedure",
      D: "planning",
      E: "generalisation",
      F: "complaint",
      G: "ticket",
      H: "lecture",
      J: "deadline",
      K: "account",
    },
    answers: [
      ["structural", "B"],
      ["blanket", "A"],
      ["standard", "C"],
      ["sweeping", "E"],
      ["strategic", "D"],
    ],
  },
  {
    id: "col-mixed-5",
    title: "Collocations: common adjective pairs 2",
    wordClass: "mixed",
    options: {
      A: "sector",
      B: "evidence",
      C: "rain",
      D: "decision",
      E: "rules",
      F: "recipe",
      G: "corridor",
      H: "envelope",
      J: "witness",
      K: "ceiling",
    },
    answers: [
      ["heavy", "C"],
      ["strict", "E"],
      ["public", "A"],
      ["strong", "B"],
      ["final", "D"],
    ],
  },
  {
    id: "col-mixed-6",
    title: "Collocations: everyday noun phrases",
    wordClass: "mixed",
    options: {
      A: "crisis",
      B: "disaster",
      C: "exercise",
      D: "sense",
      E: "belongings",
      F: "receipt",
      G: "corridor",
      H: "witness",
      J: "ceiling",
      K: "recipe",
    },
    answers: [
      ["financial", "A"],
      ["natural", "B"],
      ["regular", "C"],
      ["common", "D"],
      ["personal", "E"],
    ],
  },
  {
    id: "col-mixed-7",
    title: "Collocations: verb and noun phrases",
    wordClass: "mixed",
    options: {
      A: "research",
      B: "a speech",
      C: "experience",
      D: "advice",
      E: "a conclusion",
      F: "a corridor",
      G: "a recipe",
      H: "a ceiling",
      J: "a witness",
      K: "a neighbour",
    },
    answers: [
      ["conduct", "A"],
      ["deliver", "B"],
      ["gain", "C"],
      ["seek", "D"],
      ["draw", "E"],
    ],
  },
  {
    id: "col-mixed-8",
    title: "Collocations: adverb and adjective phrases",
    wordClass: "mixed",
    options: {
      A: "equipped",
      B: "spoken",
      C: "ashamed",
      D: "skilled",
      E: "necessary",
      F: "wooden",
      G: "domestic",
      H: "annual",
      J: "manual",
      K: "rural",
    },
    answers: [
      ["deeply", "C"],
      ["highly", "D"],
      ["fully", "A"],
      ["widely", "B"],
      ["strictly", "E"],
    ],
  },
  {
    id: "col-mixed-9",
    title: "Collocations: verb and noun phrases 2",
    wordClass: "mixed",
    options: {
      A: "awareness",
      B: "a train",
      C: "a conclusion",
      D: "a promise",
      E: "your temper",
      F: "a thunderstorm",
      G: "a corridor",
      H: "a ceiling",
      J: "a witness",
      K: "a museum",
    },
    answers: [
      ["raise", "A"],
      ["miss", "B"],
      ["reach", "C"],
      ["keep", "D"],
      ["lose", "E"],
    ],
  },
  {
    id: "col-mixed-10",
    title: "Collocations: adverb phrases",
    wordClass: "mixed",
    options: {
      A: "guarded",
      B: "stated",
      C: "cold",
      D: "normal",
      E: "injured",
      F: "wooden",
      G: "domestic",
      H: "annual",
      J: "manual",
      K: "rural",
    },
    answers: [
      ["bitterly", "C"],
      ["perfectly", "D"],
      ["seriously", "E"],
      ["closely", "A"],
      ["clearly", "B"],
    ],
  },
];

function asOptions(options) {
  return Object.entries(options).map(([letter, text]) => ({ letter, text }));
}

const collocationFeedback = {
  "artificial intelligence": {
    definition:
      "Computer systems or machines that can perform tasks which normally require human intelligence, such as understanding language, recognising images, or solving problems.",
    example: "Artificial intelligence is already changing the way many people work and study.",
  },
  "mutual respect": {
    definition: "A feeling of respect that two people or groups have for each other.",
    example: "A successful working relationship depends on mutual respect.",
  },
  "dramatic change": {
    definition: "A very big, noticeable, or sudden change.",
    example: "There has been a dramatic change in the way people communicate over the last twenty years.",
  },
  "crystal clear": {
    definition: "Extremely clear and easy to understand.",
    example: "The teacher's explanation was crystal clear.",
  },
  "ultimate objective": {
    definition: "The final or most important aim that someone wants to achieve.",
    example: "The ultimate objective of the project is to reduce waste across the whole company.",
  },
  "visual aids": {
    definition: "Pictures, diagrams, slides, or other materials that help people understand information.",
    example: "The speaker used visual aids to make the presentation easier to follow.",
  },
  "heavy traffic": {
    definition: "A large amount of traffic, especially when vehicles are moving slowly.",
    example: "We arrived late because there was heavy traffic on the motorway.",
  },
  "vital role": {
    definition: "A very important part in making something happen or work successfully.",
    example: "Teachers play a vital role in children's development.",
  },
  "solar energy": {
    definition: "Energy that comes from the sun.",
    example: "More homes are now using solar energy to reduce electricity costs.",
  },
  "sequence of events": {
    definition: "A series of things that happen in a particular order.",
    example: "The police are trying to understand the exact sequence of events before the accident.",
  },
  "consumer behaviour": {
    definition: "The way people act when they buy, use, or choose products and services.",
    example: "Online shopping has had a major effect on consumer behaviour.",
  },
  "deep breath": {
    definition: "A large amount of air taken slowly into the lungs.",
    example: "She took a deep breath before beginning her speech.",
  },
  "leading expert": {
    definition: "One of the most respected or knowledgeable people in a particular subject.",
    example: "The report was written by a leading expert in climate science.",
  },
  "terminal illness": {
    definition: "An illness that cannot be cured and is expected to cause death.",
    example: "The charity supports people who are living with a terminal illness.",
  },
  "internal audit": {
    definition: "An official check carried out within an organisation to examine its systems, records, or finances.",
    example: "The company ordered an internal audit after discovering several accounting errors.",
  },
  "structural damage": {
    definition: "Damage to the main parts of a building or object that support it.",
    example: "The earthquake caused serious structural damage to several buildings.",
  },
  "blanket ban": {
    definition: "A complete ban that applies to everything or everyone in a particular category, with no exceptions.",
    example: "The school introduced a blanket ban on mobile phones during lessons.",
  },
  "standard procedure": {
    definition: "The usual or official way of doing something.",
    example: "Checking passengers' identification is standard procedure at the airport.",
  },
  "sweeping generalisation": {
    definition: "A statement that is too general and does not consider individual differences or exceptions.",
    example: "Saying that all teenagers are lazy is a sweeping generalisation.",
  },
  "strategic planning": {
    definition: "The process of making long-term plans in order to achieve important goals.",
    example: "Strategic planning is essential if the organisation wants to grow successfully.",
  },
  "heavy rain": {
    definition: "A large amount of rain falling strongly.",
    example: "The match was cancelled because of heavy rain.",
  },
  "strict rules": {
    definition: "Rules that must be followed carefully and are not flexible.",
    example: "The school has strict rules about attendance.",
  },
  "public sector": {
    definition: "The part of the economy that is controlled or funded by the government, such as state schools, hospitals, and public services.",
    example: "Many nurses and teachers work in the public sector.",
  },
  "strong evidence": {
    definition: "Evidence that clearly supports an argument, claim, or conclusion.",
    example: "There is strong evidence that regular exercise improves mental health.",
  },
  "final decision": {
    definition: "The last decision, after which no further changes are expected.",
    example: "The manager will make the final decision tomorrow.",
  },
  "financial crisis": {
    definition: "A serious situation in which banks, businesses, governments, or individuals have major money problems.",
    example: "Many people lost their jobs during the financial crisis.",
  },
  "natural disaster": {
    definition: "A dangerous event caused by nature, such as an earthquake, flood, hurricane, or wildfire.",
    example: "The country received international aid after the natural disaster.",
  },
  "regular exercise": {
    definition: "Physical activity that someone does frequently or as part of a routine.",
    example: "Regular exercise can help reduce stress.",
  },
  "common sense": {
    definition: "Practical judgement about everyday situations.",
    example: "You don't need special training to solve this problem; you just need common sense.",
  },
  "personal belongings": {
    definition: "The things that belong to a particular person, especially items they carry with them.",
    example: "Passengers should not leave personal belongings unattended.",
  },
  "conduct research": {
    definition: "To carry out a detailed study in order to discover new information.",
    example: "Scientists are conducting research into new treatments for the disease.",
  },
  "deliver a speech": {
    definition: "To give a formal talk to an audience.",
    example: "The president delivered a speech at the opening ceremony.",
  },
  "gain experience": {
    definition: "To get knowledge or skill by doing something.",
    example: "She worked as a volunteer to gain experience in teaching.",
  },
  "seek advice": {
    definition: "To ask someone for guidance or an opinion about what to do.",
    example: "You should seek legal advice before signing the contract.",
  },
  "draw a conclusion": {
    definition: "To decide that something is true after considering the available information.",
    example: "It is difficult to draw a conclusion from such limited evidence.",
  },
  "deeply ashamed": {
    definition: "Feeling very guilty or embarrassed about something you have done.",
    example: "He felt deeply ashamed of the way he had behaved.",
  },
  "highly skilled": {
    definition: "Having a very high level of ability or training.",
    example: "The company is looking for highly skilled workers.",
  },
  "fully equipped": {
    definition: "Having all the necessary tools, equipment, or facilities.",
    example: "The apartment has a fully equipped kitchen.",
  },
  "widely spoken": {
    definition: "Spoken by many people or in many places.",
    example: "English is widely spoken in many parts of the world.",
  },
  "strictly necessary": {
    definition: "Completely necessary; used especially when saying that something should only be done if it is really needed.",
    example: "We should not collect more personal information than is strictly necessary.",
  },
  "raise awareness": {
    definition: "To increase people's knowledge or understanding of an issue.",
    example: "The campaign aims to raise awareness of mental health problems.",
  },
  "miss a train": {
    definition: "To arrive too late to catch a train.",
    example: "I missed the train because my alarm didn't go off.",
  },
  "reach a conclusion": {
    definition: "To arrive at a decision or opinion after thinking about the facts.",
    example: "After examining the evidence, the committee reached a conclusion.",
  },
  "keep a promise": {
    definition: "To do what you said you would do.",
    example: "She always keeps her promises.",
  },
  "lose your temper": {
    definition: "To become angry suddenly.",
    example: "He lost his temper when the customer started shouting at him.",
  },
  "bitterly cold": {
    definition: "Extremely cold in a very unpleasant way.",
    example: "It was bitterly cold outside, so we decided to stay at home.",
  },
  "perfectly normal": {
    definition: "Completely normal; not strange or unusual at all.",
    example: "It is perfectly normal to feel nervous before an exam.",
  },
  "seriously injured": {
    definition: "Badly hurt, especially in an accident or attack.",
    example: "Two people were seriously injured in the crash.",
  },
  "closely guarded": {
    definition: "Carefully protected or kept secret.",
    example: "The details of the agreement were closely guarded until the official announcement.",
  },
  "clearly stated": {
    definition: "Expressed in a way that is easy to understand and leaves no doubt.",
    example: "The rules are clearly stated at the beginning of the document.",
  },
};

function getCollocationFeedback(prompt, answer) {
  return collocationFeedback[`${prompt} ${answer}`.toLowerCase()] || null;
}

function getDefinitionFeedback(answer) {
  return definitionFeedback[String(answer || "").toLowerCase()] || null;
}

function getSynonymFeedback(prompt) {
  return synonymFeedback[String(prompt || "").toLowerCase()] || null;
}

function getGapFillFeedback(taskId, answer) {
  const entries = gapFillFeedback[taskId] || [];
  return entries.find((entry) => entry.answer.toLowerCase() === String(answer || "").toLowerCase()) || null;
}

function getTaskFeedback(type, prompt, answer, taskId) {
  if (type === "synonyms") return getSynonymFeedback(prompt);
  if (type === "definitions") return getDefinitionFeedback(answer);
  if (type === "gap-fill") return getGapFillFeedback(taskId, answer);
  return null;
}

function buildExplanation(type, prompt, answer, taskId = "") {
  if (type === "synonyms") {
    return getSynonymFeedback(prompt)?.usageNote ||
      `${prompt} and ${answer} are close in meaning. In Aptis vocabulary tasks, choose the option that keeps the meaning, not just a word from the same topic.`;
  }
  if (type === "definitions") {
    return getDefinitionFeedback(answer)?.usageNote ||
      `${answer} matches this definition. Definition tasks test whether you can connect a description with the exact word it describes.`;
  }
  if (type === "collocations") {
    return getCollocationFeedback(prompt, answer)?.definition ||
      `${prompt} ${answer} is the natural word partnership. Collocation questions test which words usually appear together.`;
  }
  if (type === "gap-fill") {
    return getGapFillFeedback(taskId, answer)?.whyItFits ||
      `${answer} is the only option that fits both the meaning and grammar of the sentence.`;
  }
  return `${answer} is the only option that fits both the meaning and grammar of the sentence.`;
}

function buildExample(type, prompt, answer, sentence = "", taskId = "") {
  if (type === "gap-fill") {
    return getGapFillFeedback(taskId, answer)?.completedSentence || sentence.replace("___", answer);
  }
  if (type === "definitions") return getDefinitionFeedback(answer)?.example || `${answer}: ${prompt}`;
  if (type === "synonyms") return getSynonymFeedback(prompt)?.exampleWithTarget ||
    `In this task, ${prompt} is closest in meaning to ${answer}.`;
  if (type === "collocations") {
    return getCollocationFeedback(prompt, answer)?.example || `This is a good example of ${prompt} ${answer}.`;
  }
  return `In this task, ${prompt} is closest in meaning to ${answer}.`;
}

function flattenMatchingSet(set, type) {
  return set.answers.map(([prompt, answerLetter], index) => {
    const answer = set.options[answerLetter];
    return {
      id: `${set.id}-${index + 1}`,
      type,
      title: set.title,
      wordClass: set.wordClass,
      prompt,
      instruction:
        type === "collocations"
          ? "Choose the word that is most often used with the word on the left."
          : type === "definitions"
            ? "Choose the word that matches the definition."
            : "Choose the word that is most similar in meaning.",
      options: asOptions(set.options),
      answerLetter,
      answer,
      example: set.example || null,
      explanation: buildExplanation(type, prompt, answer),
      exampleSentence: buildExample(type, prompt, answer),
      feedback: getTaskFeedback(type, prompt, answer),
      tags: [type, set.wordClass].filter(Boolean),
    };
  });
}

function flattenGapSet(set) {
  return set.answers.map(([sentence, answerLetter], index) => {
    const answer = set.options[answerLetter];
    return {
      id: `${set.id}-${index + 1}`,
      type: "gap-fill",
      title: set.title,
      wordClass: set.wordClass,
      sentence,
      instruction: "Choose the word that best completes the sentence.",
      options: asOptions(set.options),
      answerLetter,
      answer,
      explanation: buildExplanation("gap-fill", sentence, answer, set.id),
      exampleSentence: buildExample("gap-fill", "", answer, sentence, set.id),
      feedback: getTaskFeedback("gap-fill", sentence, answer, set.id),
      tags: ["gap-fill", set.wordClass],
    };
  });
}

function buildMatchingTask(set, type) {
  return {
    id: set.id,
    type,
    title: set.title,
    wordClass: set.wordClass,
    instruction:
      type === "collocations"
        ? "Select the word that is most often used with each word on the left. Use each word once only. You will not need five of the words."
        : type === "definitions"
          ? "Select the word that matches each definition on the left. Use each word once only. You will not need five of the words."
        : "Select the word that is most similar in meaning to each word on the left. Use each word once only. You will not need five of the words.",
    example: set.example || null,
    options: asOptions(set.options),
    questions: set.answers.map(([prompt, answerLetter], index) => {
      const answer = set.options[answerLetter];
      return {
        id: `${set.id}-${index + 1}`,
        prompt,
        answerLetter,
        answer,
        explanation: buildExplanation(type, prompt, answer),
        exampleSentence: buildExample(type, prompt, answer),
        feedback: getTaskFeedback(type, prompt, answer),
      };
    }),
    tags: [type, set.wordClass].filter(Boolean),
  };
}

function buildGapTask(set) {
  return {
    id: set.id,
    type: "gap-fill",
    title: set.title,
    wordClass: set.wordClass,
    instruction:
      "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
    example: null,
    options: asOptions(set.options),
    questions: set.answers.map(([sentence, answerLetter], index) => {
      const answer = set.options[answerLetter];
      return {
        id: `${set.id}-${index + 1}`,
        sentence,
        answerLetter,
        answer,
        explanation: buildExplanation("gap-fill", sentence, answer, set.id),
        exampleSentence: buildExample("gap-fill", "", answer, sentence, set.id),
        feedback: getTaskFeedback("gap-fill", sentence, answer, set.id),
      };
    }),
    tags: ["gap-fill", set.wordClass],
  };
}

export const vocabExerciseTasks = [
  ...synonymSets.map((set) => buildMatchingTask(set, "synonyms")),
  ...definitionSets.map((set) => buildMatchingTask(set, "definitions")),
  ...gapFillSets.map(buildGapTask),
  ...collocationSets.map((set) => buildMatchingTask(set, "collocations")),
];

const vocabExerciseBank = [
  ...synonymSets.flatMap((set) => flattenMatchingSet(set, "synonyms")),
  ...definitionSets.flatMap((set) => flattenMatchingSet(set, "definitions")),
  ...gapFillSets.flatMap(flattenGapSet),
  ...collocationSets.flatMap((set) => flattenMatchingSet(set, "collocations")),
];

export const VOCAB_EXERCISE_TYPES = ["synonyms", "definitions", "collocations", "gap-fill"];
export const VOCAB_WORD_CLASSES = ["noun", "verb", "adjective", "mixed"];

export default vocabExerciseBank;
