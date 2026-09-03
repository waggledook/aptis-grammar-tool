const IMAGE_BASE = "/images/speaking/workshops/relationships-family";

const setAItems = [
  { id: "get-on-well", term: "get on well", meaning: "have a friendly, positive relationship", example: "I get on really well with my older sister.", gap: "I _____ well with most of my colleagues.", image: `${IMAGE_BASE}/preparation/get-on.webp` },
  { id: "keep-in-touch", term: "keep in touch", meaning: "continue communicating regularly", example: "We keep in touch through messages and video calls.", gap: "It is easier to _____ touch now.", image: `${IMAGE_BASE}/preparation/keep-in-touch.webp` },
  { id: "rely-on", term: "rely on someone", meaning: "trust someone to help or support you", example: "I can always rely on my best friend for honest advice.", gap: "She is someone I can _____ on.", image: `${IMAGE_BASE}/preparation/rely-on.webp` },
  { id: "get-to-know", term: "get to know someone", meaning: "gradually learn more about a person", example: "The course helped me get to know people from other countries.", gap: "It takes time to _____ someone properly.", image: `${IMAGE_BASE}/preparation/get-to-know.webp` },
  { id: "fall-out", term: "fall out with someone", meaning: "argue and stop being friendly", example: "We sometimes fall out, but it never lasts long.", gap: "They _____ out over something unimportant.", image: `${IMAGE_BASE}/preparation/fall-out.webp` },
  { id: "make-up", term: "make up", meaning: "become friendly again after an argument", example: "We talked about the problem and quickly made up.", gap: "Good friends usually _____ up in the end.", image: `${IMAGE_BASE}/preparation/make-up.webp` },
  { id: "grow-apart", term: "grow apart", meaning: "slowly become less close over time", example: "Some school friends grow apart when they move away.", gap: "We gradually _____ apart after university.", image: `${IMAGE_BASE}/preparation/grow-apart.webp` },
  { id: "trust", term: "trust someone", meaning: "believe that someone is honest and dependable", example: "Trust is essential in any close relationship.", gap: "I _____ her because she always tells me the truth.", image: `${IMAGE_BASE}/preparation/trust.webp` },
];

const setBItems = [
  { id: "close-knit", term: "close-knit", meaning: "having strong, supportive relationships", example: "I come from a close-knit family.", gap: "We are a very _____ group of friends." },
  { id: "supportive", term: "supportive", meaning: "giving encouragement or practical help", example: "My parents have always been very supportive.", gap: "A good friend should be _____ when things are difficult." },
  { id: "dependable", term: "dependable", meaning: "someone you can trust to do what they promise", example: "She is incredibly dependable and never lets me down.", gap: "I value friends who are honest and _____." },
  { id: "considerate", term: "considerate", meaning: "careful not to inconvenience or upset others", example: "My flatmate is considerate and respects my space.", gap: "It was _____ of him to call and check I was all right." },
  { id: "have-in-common", term: "have a lot in common", meaning: "share similar interests, opinions or experiences", example: "We became friends because we had a lot in common.", gap: "Although we are different ages, we _____ a lot in common." },
  { id: "be-there", term: "be there for someone", meaning: "give someone support when they need it", example: "Close friends are there for each other during difficult times.", gap: "She was always _____ for me when I needed help." },
  { id: "quality-time", term: "spend quality time together", meaning: "give each other enjoyable, meaningful attention", example: "At weekends, we try to spend quality time together.", gap: "Shared meals let families spend _____ time together." },
  { id: "make-effort", term: "make an effort", meaning: "try actively to achieve or maintain something", example: "Both people need to make an effort to stay close.", gap: "I _____ an effort to call my grandparents every week." },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const relationshipsPreparationConfig = {
  storageVersion: "v2",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Relationships and communication",
      introduction: "Language for becoming close, staying connected and dealing with changes in a relationship.",
      items: setAItems,
      practice: [
        practice("a1", "My cousin lives abroad, but we _____ through weekly video calls.", ["keep in touch", "grow apart", "fall out"], "keep in touch", "Keep in touch means continue communicating regularly."),
        practice("a2", "My brother and I _____, even though we have very different personalities.", ["make up", "get on well", "get to know"], "get on well", "Get on well describes a positive relationship."),
        practice("a3", "When I need honest advice, I know I can _____ my oldest friend.", ["rely on", "fall out with", "grow apart from"], "rely on", "Rely on someone means trust them for help or support."),
        practice("a4", "Joining a club is a good way to _____ new people.", ["trust", "make up with", "get to know"], "get to know", "You get to know someone gradually by spending time with them."),
        practice("a5", "They disagreed about money and _____ for several months.", ["fell out", "kept in touch", "got on well"], "fell out", "Fall out means argue and stop being friendly."),
        practice("a6", "We apologised to each other and _____ after the argument.", ["grew apart", "made up", "relied on"], "made up", "Make up means become friendly again."),
        practice("a7", "We were close at school, but we slowly _____ after moving to different cities.", ["made up", "got to know", "grew apart"], "grew apart", "Grow apart is a gradual change, not a single argument."),
        practice("a8", "I _____ her completely because she has always been honest with me.", ["trust", "keep in touch", "fall out"], "trust", "Trust means believe that someone is honest and dependable."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Support and strong relationships",
      introduction: "Flexible language for describing people and explaining how relationships stay strong.",
      items: setBItems,
      practice: [
        practice("b1", "Everyone helps one another in my _____ family.", ["dependable", "close-knit", "considerate"], "close-knit", "A close-knit family or group has strong relationships."),
        practice("b2", "My tutor was very _____ when I found the course difficult.", ["supportive", "close-knit", "quality time"], "supportive", "Supportive people offer encouragement or practical help."),
        practice("b3", "You can trust Elena to do exactly what she promises; she is very _____.", ["considerate", "dependable", "supportive"], "dependable", "A dependable person does what you expect or need."),
        practice("b4", "It was _____ of my neighbour to keep the music quiet while I was studying.", ["close-knit", "dependable", "considerate"], "considerate", "Considerate behaviour shows awareness of other people’s needs."),
        practice("b5", "We _____, especially our taste in music and films.", ["make an effort", "have a lot in common", "spend quality time"], "have a lot in common", "Having things in common makes conversation and shared activities easier."),
        practice("b6", "A true friend will _____ when life becomes difficult.", ["be there for you", "grow apart", "get to know you"], "be there for you", "Be there for someone means support them when needed."),
        practice("b7", "We turn off our phones at dinner so we can _____.", ["fall out", "spend quality time together", "be dependable"], "spend quality time together", "Quality time is meaningful, attentive time together."),
        practice("b8", "Busy people often need to _____ to maintain their friendships.", ["make an effort", "make up", "have an argument"], "make an effort", "Maintaining relationships usually requires active effort."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "Even when we are busy, we both _____ to meet at least once a month.", ["make an effort", "fall out", "grow apart"], "make an effort", "This describes actively trying to maintain the friendship."),
    practice("m2", "We became friends quickly because we _____.", ["were dependable", "had a lot in common", "made up"], "had a lot in common", "Shared interests can help a friendship develop."),
    practice("m3", "After ten years in different countries, they gradually _____.", ["grew apart", "kept in touch", "got to know"], "grew apart", "Grow apart describes becoming less close over time."),
    practice("m4", "My sister is the person I can always _____ when I have a problem.", ["be there", "rely on", "make up"], "rely on", "You rely on a person for help or support."),
    practice("m5", "A _____ friend remembers what matters to you and respects your feelings.", ["considerate", "close-knit", "quality"], "considerate", "Considerate people think about the effects of their actions."),
    practice("m6", "Although we disagreed, we talked calmly and _____.", ["made up", "grew apart", "kept in touch"], "made up", "Make up follows an argument or disagreement."),
    practice("m7", "My family is very _____; we help one another whenever possible.", ["supportive", "dependable", "common"], "supportive", "Supportive is natural for a person, family or environment that gives help."),
    practice("m8", "Social media makes it easier to _____ with friends who move away.", ["get on", "keep in touch", "fall out"], "keep in touch", "Keep in touch focuses on continued communication."),
  ],
  ideaTasks: [
    {
      id: "close-person",
      question: "Tell me about someone you are close to.",
      instruction: "Choose the details that would be easiest for you to develop.",
      minimum: 3,
      ideas: ["who the person is", "how you met", "what you have in common", "how the person supports you", "something you enjoy doing together"],
    },
    {
      id: "maintain",
      question: "How can people maintain strong relationships?",
      instruction: "Choose ideas you could explain with a reason or example.",
      minimum: 3,
      ideas: ["keep in touch regularly", "spend quality time together", "listen and be considerate", "be there during difficult times", "make up after disagreements"],
    },
  ],
  rehearsal: {
    question: "Tell me about someone you have a strong relationship with.",
    image: `${IMAGE_BASE}/part2_task05_keeping_in_touch.webp`,
    imageAlt: "Two people keeping in touch on a video call",
    ideaPrompts: ["Who is the person?", "What do you have in common?", "How do you support each other?", "How do you keep in touch?"],
    usefulChunks: ["We get on well because…", "I can always rely on…", "We make an effort to…"],
  },
};
