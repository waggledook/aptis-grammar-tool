const IMAGE_BASE = "/images/speaking/workshops/home-neighbourhood";

const setAItems = [
  { id: "city-centre", term: "in the city centre", meaning: "in the central part of a city, close to many shops, services and activities", example: "I live in the city centre, so I can walk almost everywhere.", gap: "She enjoys living _____ because there are lots of things to do nearby.", image: `${IMAGE_BASE}/preparation/city-centre.webp` },
  { id: "outskirts", term: "on the outskirts", meaning: "in the outer parts of a town or city, away from the centre", example: "Housing is usually more spacious on the outskirts.", gap: "They moved _____ because they wanted a quieter area.", image: `${IMAGE_BASE}/preparation/outskirts.webp` },
  { id: "residential-area", term: "a residential area", meaning: "an area where most of the buildings are homes", example: "It is a quiet residential area with very few offices.", gap: "We live in _____ just outside the city centre.", image: `${IMAGE_BASE}/preparation/residential-area.webp` },
  { id: "local-facilities", term: "local facilities", meaning: "useful places and services in an area, such as shops, health centres or sports centres", example: "The neighbourhood has excellent local facilities.", gap: "Good _____ make everyday life much easier for residents.", image: `${IMAGE_BASE}/preparation/local-facilities.webp` },
  { id: "transport-links", term: "public transport links", meaning: "bus, train or metro connections that make it easy to travel somewhere", example: "The area has good public transport links to the city centre.", gap: "One advantage of living here is the excellent _____.", image: `${IMAGE_BASE}/preparation/transport-links.webp` },
  { id: "green-space", term: "green space", meaning: "parks, gardens or other outdoor areas with grass, trees and plants", example: "There is plenty of green space near our home.", gap: "Families often prefer areas with lots of _____.", image: `${IMAGE_BASE}/preparation/green-space.webp` },
  { id: "walking-distance", term: "within walking distance", meaning: "close enough to reach easily on foot", example: "The supermarket and station are both within walking distance.", gap: "I rarely use the car because most local facilities are _____.", image: `${IMAGE_BASE}/preparation/walking-distance.webp` },
  { id: "well-connected", term: "a well-connected area", meaning: "an area from which it is easy to travel to other places", example: "It is a well-connected area with several bus and metro lines.", gap: "I do not need a car because I live in _____.", image: `${IMAGE_BASE}/preparation/well-connected.webp` },
];

const setBItems = [
  { id: "spacious", term: "spacious", meaning: "having plenty of room", example: "The flat is bright and spacious.", gap: "The living room is very _____, with plenty of room for everyone.", image: `${IMAGE_BASE}/preparation/spacious.webp` },
  { id: "cramped", term: "cramped", meaning: "too small or crowded to feel comfortable", example: "The kitchen feels cramped when several people are using it.", gap: "The flat was quite _____ for a family of five.", image: `${IMAGE_BASE}/preparation/cramped.webp` },
  { id: "affordable", term: "affordable", meaning: "not too expensive for someone to pay for", example: "It is difficult to find affordable housing near the centre.", gap: "Many young people are looking for somewhere more _____ to live.", image: `${IMAGE_BASE}/preparation/affordable.webp` },
  { id: "convenient", term: "convenient", meaning: "easy and practical for your needs", example: "Living near the station is very convenient.", gap: "The location is extremely _____ for getting to work.", image: `${IMAGE_BASE}/preparation/convenient.webp` },
  { id: "peaceful", term: "peaceful", meaning: "quiet, calm and relaxing", example: "We live in a peaceful area with very little traffic.", gap: "I would like to live somewhere quiet and _____.", image: `${IMAGE_BASE}/preparation/peaceful.webp` },
  { id: "lively", term: "lively", meaning: "busy, active and full of energy", example: "It is a lively neighbourhood with lots of cafés and restaurants.", gap: "The area becomes very _____ in the evenings.", image: `${IMAGE_BASE}/preparation/lively.webp` },
  { id: "well-maintained", term: "well-maintained", meaning: "kept in good condition and looked after", example: "The building is old but very well-maintained.", gap: "The park is clean and _____.", image: `${IMAGE_BASE}/preparation/well-maintained.webp` },
  { id: "run-down", term: "run-down", meaning: "in poor condition because it has not been looked after", example: "Some of the older buildings are quite run-down.", gap: "The neighbourhood used to look _____, but many buildings have now been renovated.", image: `${IMAGE_BASE}/preparation/run-down.webp` },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const homeNeighbourhoodPreparationConfig = {
  storageVersion: "v2",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Places and location",
      introduction: "Useful language for describing where a home is and what the surrounding area offers.",
      items: setAItems,
      practice: [
        practice("a1", "I like living _____ because I can walk to shops, cafés and museums.", ["in the city centre", "on the outskirts", "in a residential area"], "in the city centre", "‘In the city centre’ means in the central part of the city."),
        practice("a2", "Homes are often larger and quieter _____.", ["on the outskirts", "within walking distance", "in the city centre"], "on the outskirts", "‘The outskirts’ are the outer parts of a town or city."),
        practice("a3", "There are mostly houses and flats here because it is _____.", ["a residential area", "green space", "a local facility"], "a residential area", "A residential area is mainly used for housing."),
        practice("a4", "The neighbourhood has good _____, including a supermarket, library and health centre.", ["local facilities", "public transport links", "green space"], "local facilities", "Local facilities are useful services and places available nearby."),
        practice("a5", "The metro, buses and local train give the area excellent _____.", ["public transport links", "local facilities", "residential areas"], "public transport links", "Public transport links are the connections that help people travel around."),
        practice("a6", "One thing I like about the neighbourhood is the amount of _____, especially the parks.", ["green space", "local facilities", "city centre"], "green space", "Green space includes parks, gardens and similar outdoor areas."),
        practice("a7", "My office is _____, so I normally go there on foot.", ["within walking distance", "on the outskirts", "well-maintained"], "within walking distance", "Within walking distance means close enough to reach easily on foot."),
        practice("a8", "It is _____, with buses, trains and a metro station nearby.", ["a well-connected area", "a residential area", "green space"], "a well-connected area", "A well-connected area is easy to travel to and from."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Evaluating homes and areas",
      introduction: "Flexible adjectives for describing the advantages and disadvantages of homes and neighbourhoods.",
      items: setBItems,
      practice: [
        practice("b1", "The house is very _____, so there is plenty of room for guests.", ["spacious", "cramped", "affordable"], "spacious", "Spacious means having plenty of room."),
        practice("b2", "Five people sharing such a small flat would probably feel _____.", ["cramped", "lively", "convenient"], "cramped", "A cramped place feels uncomfortably small."),
        practice("b3", "They moved further from the centre because the rent was more _____.", ["affordable", "peaceful", "well-maintained"], "affordable", "Affordable means reasonably priced."),
        practice("b4", "Having a supermarket downstairs is very _____.", ["convenient", "spacious", "run-down"], "convenient", "Convenient describes something that makes life easier or more practical."),
        practice("b5", "There is almost no traffic, so the neighbourhood is very _____.", ["peaceful", "lively", "cramped"], "peaceful", "A peaceful place is quiet and calm."),
        practice("b6", "There are cafés, shops and people everywhere, so it is a very _____ area.", ["lively", "peaceful", "run-down"], "lively", "A lively area has plenty of activity and energy."),
        practice("b7", "Although the building is quite old, it is clean and _____.", ["well-maintained", "cramped", "lively"], "well-maintained", "A well-maintained place is kept in good condition."),
        practice("b8", "Several empty shops and damaged buildings make the street look _____.", ["run-down", "affordable", "spacious"], "run-down", "Run-down describes a place that has not been properly maintained."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "We chose to live _____ because houses there were more affordable.", ["on the outskirts", "within walking distance", "in the city centre"], "on the outskirts", "Homes further from the centre can sometimes be cheaper."),
    practice("m2", "The flat looks attractive, but with six people living there it might feel _____.", ["cramped", "peaceful", "well-connected"], "cramped", "Cramped describes a space that feels too small."),
    practice("m3", "There are always people outside the cafés and shops, so it is a very _____ neighbourhood.", ["lively", "run-down", "spacious"], "lively", "Lively describes an active area with plenty going on."),
    practice("m4", "The station is _____, so I normally walk there in about ten minutes.", ["within walking distance", "on the outskirts", "a residential area"], "within walking distance", "This means close enough to reach easily on foot."),
    practice("m5", "The building was constructed fifty years ago but is still very _____.", ["well-maintained", "cramped", "affordable"], "well-maintained", "Age does not prevent a building from being well looked after."),
    practice("m6", "Good _____ make it easy to reach the centre without driving.", ["public transport links", "green space", "local facilities"], "public transport links", "These are the bus, train or metro connections serving an area."),
    practice("m7", "Living in the centre is _____ for work and shopping, although it can be noisy.", ["convenient", "peaceful", "run-down"], "convenient", "Convenient means practical and suitable for your needs."),
    practice("m8", "The area used to be quite _____, but the streets and buildings have recently been improved.", ["run-down", "spacious", "lively"], "run-down", "A run-down area is in poor condition because it has not been maintained."),
  ],
  writeTest: {
    title: "Write the key words",
    introduction: "Complete each sentence with one important word from the expressions you have learned. Four items come from each set.",
    items: [
      { id: "write-city-centre", prompt: "I live in the city _____.", answer: "centre", acceptedAnswers: ["center"], feedback: "The full expression is ‘in the city centre’. The US spelling ‘center’ is also accepted.", image: `${IMAGE_BASE}/preparation/city-centre.webp` },
      { id: "write-transport-links", prompt: "The area has good public transport _____.", answer: "links", acceptedAnswers: ["connections"], feedback: "The target expression is ‘public transport links’; ‘connections’ also fits naturally.", image: `${IMAGE_BASE}/preparation/transport-links.webp` },
      { id: "write-green-space", prompt: "There is plenty of green _____ near our home.", answer: "space", acceptedAnswers: ["spaces", "areas"], feedback: "‘Green space’, ‘green spaces’ and ‘green areas’ are all natural here.", image: `${IMAGE_BASE}/preparation/green-space.webp` },
      { id: "write-walking-distance", prompt: "Most local facilities are within walking _____.", answer: "distance", feedback: "The full expression is ‘within walking distance’.", image: `${IMAGE_BASE}/preparation/walking-distance.webp` },
      { id: "write-spacious", prompt: "The flat is bright and _____.", answer: "spacious", acceptedAnswers: ["roomy", "large"], feedback: "The target word is ‘spacious’; ‘roomy’ and ‘large’ also complete the sentence naturally.", image: `${IMAGE_BASE}/preparation/spacious.webp` },
      { id: "write-affordable", prompt: "It is difficult to find _____ housing near the centre.", answer: "affordable", acceptedAnswers: ["inexpensive", "reasonably priced", "cheap"], feedback: "The target word is ‘affordable’; other natural ways to express a low price are also accepted.", image: `${IMAGE_BASE}/preparation/affordable.webp` },
      { id: "write-well-maintained", prompt: "The building is old but well-_____.", answer: "maintained", acceptedAnswers: ["kept"], feedback: "‘Well-maintained’ is the target adjective; ‘well-kept’ has a very similar meaning.", image: `${IMAGE_BASE}/preparation/well-maintained.webp` },
      { id: "write-run-down", prompt: "Some of the older buildings are quite run-_____.", answer: "down", feedback: "The full adjective is ‘run-down’.", image: `${IMAGE_BASE}/preparation/run-down.webp` },
    ],
  },
  ideaTasks: [
    {
      id: "where-live",
      question: "What do you like or dislike about the area where you live?",
      instruction: "Choose the points that would be easiest for you to talk about.",
      minimum: 3,
      ideas: ["where it is located", "local facilities", "public transport links", "parks or green space", "whether it is peaceful or lively"],
    },
    {
      id: "good-neighbourhood",
      question: "What makes a good neighbourhood?",
      instruction: "Choose features you could explain with a reason or example.",
      minimum: 3,
      ideas: ["affordable homes", "useful local facilities", "good public transport links", "plenty of green space", "a convenient location"],
    },
  ],
  rehearsal: {
    question: "Would you rather live in the city centre or on the outskirts? Why?",
    image: `${IMAGE_BASE}/part2_task04_local_shops.webp`,
    imageAlt: "People walking past local shops in a neighbourhood",
    ideaPrompts: ["cost and space", "local facilities", "public transport links", "a peaceful or lively atmosphere"],
    usefulChunks: ["I’d rather live…", "The main advantage is…", "On the other hand…"],
  },
};
