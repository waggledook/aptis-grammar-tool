const IMAGE_BASE = "/images/speaking/workshops/travel-transport";

const setAItems = [
  { id: "catch", term: "catch a train / bus", meaning: "arrive in time to travel on it", example: "I normally catch the 7:30 train to work.", gap: "We need to leave now to _____ the bus.", image: `${IMAGE_BASE}/preparation/catch.webp` },
  { id: "miss", term: "miss a flight / train", meaning: "arrive too late to travel on it", example: "Heavy traffic made us miss our flight.", gap: "If we do not hurry, we will _____ the train.", image: `${IMAGE_BASE}/preparation/miss.webp` },
  { id: "board", term: "board a plane / train", meaning: "get onto a plane, train or ship", example: "Passengers began to board the plane at nine.", gap: "We waited at the gate to _____ our flight.", image: `${IMAGE_BASE}/preparation/board.webp` },
  { id: "commute", term: "commute to work", meaning: "travel regularly between home and work or study", example: "I commute into the city three days a week.", gap: "Many people _____ by train every morning.", image: `${IMAGE_BASE}/preparation/commute.webp` },
  { id: "traffic", term: "get stuck in traffic", meaning: "be unable to move because roads are very busy", example: "We got stuck in traffic for nearly an hour.", gap: "I left early because I did not want to get _____ in traffic." },
  { id: "break-down", term: "break down", meaning: "stop working because of a mechanical problem", example: "Our car broke down halfway through the journey.", gap: "The bus _____ down on the motorway." },
  { id: "delayed", term: "be delayed", meaning: "leave or arrive later than planned", example: "Our flight was delayed by two hours.", gap: "The train has been _____ because of bad weather.", image: `${IMAGE_BASE}/preparation/delayed.webp` },
  { id: "crowded", term: "be crowded", meaning: "be full of people, with little room to move", example: "The metro is extremely crowded at rush hour.", gap: "I had to stand because the bus was so _____.", image: `${IMAGE_BASE}/preparation/crowded.webp` },
];

const setBItems = [
  { id: "convenient", term: "convenient", meaning: "easy and suitable for your needs", example: "The metro is convenient because it stops near my office.", gap: "Cycling is a _____ option for short journeys." },
  { id: "reliable", term: "reliable", meaning: "working well and arriving when expected", example: "People use the service because it is frequent and reliable.", gap: "A _____ bus service makes commuting easier.", image: `${IMAGE_BASE}/preparation/reliable.webp` },
  { id: "efficient", term: "efficient", meaning: "working quickly without wasting time or energy", example: "The city has a fast, efficient transport system.", gap: "Modern trains are an _____ way to move many people." },
  { id: "eco-friendly", term: "eco-friendly", meaning: "causing less harm to the environment", example: "Cycling is one of the most eco-friendly ways to travel.", gap: "Electric buses are a more _____ alternative.", image: `${IMAGE_BASE}/preparation/eco-friendly.webp` },
  { id: "affordable", term: "affordable", meaning: "not too expensive for most people", example: "A monthly travel pass makes the journey more affordable.", gap: "Public transport needs to be safe and _____." },
  { id: "overpriced", term: "overpriced", meaning: "more expensive than it is worth", example: "Taxis from the airport can be badly overpriced.", gap: "The ticket was _____ for such a short journey." },
  { id: "spacious", term: "spacious", meaning: "having plenty of room inside", example: "The new trains are bright, comfortable and spacious.", gap: "The carriage was _____ enough for all our luggage." },
  { id: "exhausting", term: "exhausting", meaning: "making you feel extremely tired", example: "Travelling overnight can be absolutely exhausting.", gap: "The long, crowded journey was _____." },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const transportPreparationConfig = {
  storageVersion: "v2",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Journeys and travel problems",
      introduction: "Useful verb phrases and descriptions for explaining what happened during a journey.",
      items: setAItems,
      practice: [
        practice("a1", "If we leave home now, we should _____ the 7:30 train.", ["catch", "miss", "board"], "catch", "Catch a train means arrive in time to travel on it."),
        practice("a2", "A motorway accident made us _____ our flight.", ["commute to", "miss", "board"], "miss", "You miss a service when you arrive too late to use it."),
        practice("a3", "When our row was called, we joined the queue to _____ the plane.", ["board", "catch up", "commute"], "board", "Board is a useful formal verb for getting onto a plane, train or ship."),
        practice("a4", "She _____ from Toledo to Madrid for work three times a week.", ["boards", "commutes", "misses"], "commutes", "Commute describes regular travel between home and work or study."),
        practice("a5", "We _____ for forty minutes on the way to the airport.", ["got stuck in traffic", "boarded a train", "caught a bus"], "got stuck in traffic", "This phrase describes being unable to move on a busy road."),
        practice("a6", "Our car _____ on a quiet country road, so we called for help.", ["broke down", "was crowded", "commuted"], "broke down", "A vehicle breaks down when a mechanical problem stops it working."),
        practice("a7", "Because of a technical problem, our flight was _____ by nearly two hours.", ["crowded", "delayed", "missed"], "delayed", "A delayed service leaves or arrives later than planned."),
        practice("a8", "The metro was so _____ that nobody could find a seat.", ["broken down", "crowded", "boarded"], "crowded", "Crowded means full of people, with little room."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Evaluating transport",
      introduction: "Flexible adjectives for comparing transport choices and giving balanced opinions.",
      items: setBItems,
      practice: [
        practice("b1", "The bus stops outside my house, so it is very _____.", ["efficient", "convenient", "spacious"], "convenient", "Convenient means easy and suitable for your needs."),
        practice("b2", "People depend on this service because it is frequent and _____.", ["reliable", "affordable", "exhausting"], "reliable", "A reliable service operates when people expect it to."),
        practice("b3", "The new metro carries more passengers while using less energy, so it is highly _____.", ["efficient", "overpriced", "crowded"], "efficient", "Efficient systems work well without wasting time or energy."),
        practice("b4", "Walking and cycling are _____ ways to make short journeys.", ["spacious", "eco-friendly", "delayed"], "eco-friendly", "Eco-friendly options cause less environmental harm."),
        practice("b5", "The city introduced a cheaper pass to make public transport more _____.", ["affordable", "reliable", "remote"], "affordable", "Affordable means reasonably priced for people to use."),
        practice("b6", "Forty euros for a ten-minute taxi ride seems completely _____.", ["efficient", "overpriced", "convenient"], "overpriced", "Something overpriced costs more than it is worth."),
        practice("b7", "The carriage was clean and _____, with plenty of room for our bags.", ["spacious", "exhausting", "eco-friendly"], "spacious", "Spacious means having a lot of room inside."),
        practice("b8", "Changing trains four times made the journey absolutely _____.", ["reliable", "affordable", "exhausting"], "exhausting", "An exhausting journey makes you feel extremely tired."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "The train is usually _____, but today it was delayed by an hour.", ["reliable", "crowded", "overpriced"], "reliable", "Reliable contrasts naturally with an unusual delay."),
    practice("m2", "We _____ on the motorway and reached the airport too late.", ["got stuck in traffic", "commuted", "boarded"], "got stuck in traffic", "Busy roads can prevent a journey from progressing."),
    practice("m3", "For short city journeys, cycling is both cheap and _____.", ["delayed", "eco-friendly", "spacious"], "eco-friendly", "Cycling produces very little environmental harm."),
    practice("m4", "Leave some extra time so you do not _____ the last bus.", ["miss", "break down", "commute"], "miss", "You miss a service if you arrive too late."),
    practice("m5", "The overnight coach was cheap, but the journey was _____.", ["efficient", "exhausting", "convenient"], "exhausting", "This gives a natural disadvantage to balance the low price."),
    practice("m6", "A station near your home makes train travel more _____.", ["convenient", "crowded", "overpriced"], "convenient", "Nearby transport saves time and effort."),
    practice("m7", "Our bus _____ outside the city, but the driver found another vehicle for us.", ["boarded", "broke down", "caught"], "broke down", "Break down describes a vehicle that stops working."),
    practice("m8", "Students need an _____ fare that does not use most of their weekly budget.", ["affordable", "spacious", "reliable"], "affordable", "An affordable fare is reasonably priced."),
  ],
  ideaTasks: [
    {
      id: "journey",
      question: "Describe a journey that you remember clearly.",
      instruction: "Choose details that could help you tell the story.",
      minimum: 3,
      ideas: ["where you were going", "who you travelled with", "the transport you used", "a delay or unexpected problem", "how you felt at the end"],
    },
    {
      id: "city-transport",
      question: "What makes a good city transport system?",
      instruction: "Choose features you could support with a reason or example.",
      minimum: 3,
      ideas: ["reliable services", "affordable tickets", "convenient routes", "clean and spacious vehicles", "eco-friendly choices"],
    },
  ],
  rehearsal: {
    question: "Which form of transport is best for everyday journeys, and why?",
    image: `${IMAGE_BASE}/part2_task01_travelling_by_train.webp`,
    imageAlt: "A passenger making an everyday journey by train",
    ideaPrompts: ["the journeys you make", "cost and convenience", "reliability and delays", "comfort or environmental impact"],
    usefulChunks: ["The main advantage is…", "I find it convenient because…", "That said, it can be…"],
  },
};
