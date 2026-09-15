const IMAGE_BASE = "/images/speaking/workshops/food-eating";

const setAItems = [
  { id: "cook-at-home", term: "cook at home", meaning: "prepare and eat food at home rather than buying prepared food or eating out", example: "I usually cook at home during the week.", gap: "We tend to _____ instead of going to restaurants.", image: `${IMAGE_BASE}/preparation/cook-at-home.webp` },
  { id: "eat-out", term: "eat out", meaning: "eat a meal in a restaurant, café or other place away from home", example: "We normally eat out once or twice a month.", gap: "We sometimes _____ at weekends.", image: `${IMAGE_BASE}/preparation/eat-out.webp` },
  { id: "order-takeaway", term: "order a takeaway", meaning: "order prepared food from a restaurant to eat somewhere else", example: "We ordered a takeaway because nobody wanted to cook.", gap: "On Friday evenings, we sometimes _____.", image: `${IMAGE_BASE}/preparation/order-takeaway.webp` },
  { id: "have-snack", term: "have a snack", meaning: "eat a small amount of food between or instead of main meals", example: "I usually have a snack in the afternoon.", gap: "If I get hungry between meals, I usually _____.", image: `${IMAGE_BASE}/preparation/have-snack.webp` },
  { id: "cut-down-on", term: "cut down on", meaning: "reduce the amount of something that you eat or drink", example: "I'm trying to cut down on sugar.", gap: "My doctor suggested that I _____ processed food.", image: `${IMAGE_BASE}/preparation/cut-down-on.webp` },
  { id: "try-something-new", term: "try something new", meaning: "eat or experience something you have not had before", example: "I enjoy trying something new when I travel.", gap: "I normally choose familiar dishes, but sometimes I like to _____.", image: `${IMAGE_BASE}/preparation/try-something-new.webp` },
  { id: "food-shopping", term: "do the food shopping", meaning: "buy the food and other everyday items needed at home", example: "I usually do the food shopping at the weekend.", gap: "We normally _____ once or twice a week.", image: `${IMAGE_BASE}/preparation/food-shopping.webp` },
  { id: "share-meal", term: "share a meal", meaning: "eat a meal together with other people", example: "It's nice to share a meal with friends.", gap: "We try to _____ as a family whenever we can.", image: `${IMAGE_BASE}/preparation/share-meal.webp` },
];

const setBItems = [
  { id: "fresh", term: "fresh", meaning: "recently produced or prepared, rather than preserved for a long time", example: "I prefer fresh fruit and vegetables.", gap: "The market sells lots of _____ local produce.", image: `${IMAGE_BASE}/preparation/fresh.webp` },
  { id: "home-cooked", term: "home-cooked", meaning: "prepared at home rather than bought ready to eat", example: "I prefer home-cooked meals to takeaway food.", gap: "My grandmother always makes wonderful _____ food.", image: `${IMAGE_BASE}/preparation/home-cooked.webp` },
  { id: "ready-made", term: "ready-made", meaning: "already prepared and needing little or no cooking", example: "Ready-made meals can be useful when you're busy.", gap: "I sometimes buy _____ food if I don't have time to cook.", image: `${IMAGE_BASE}/preparation/ready-made.webp` },
  { id: "healthy", term: "healthy", meaning: "good for your health", example: "I try to eat a healthy diet.", gap: "Fruit makes a quick and _____ snack.", image: `${IMAGE_BASE}/preparation/healthy.webp` },
  { id: "filling", term: "filling", meaning: "making you feel full after eating", example: "Soup can be surprisingly filling.", gap: "The meal wasn't very large, but it was quite _____.", image: `${IMAGE_BASE}/preparation/filling.webp` },
  { id: "tasty", term: "tasty", meaning: "having a pleasant and enjoyable flavour", example: "The food was simple but very tasty.", gap: "The dish looked ordinary, but it was really _____.", image: `${IMAGE_BASE}/preparation/tasty.webp` },
  { id: "traditional", term: "traditional", meaning: "connected with customs or ways of preparing food that have existed for a long time", example: "We ate several traditional Spanish dishes.", gap: "This is a _____ dish from the north of the country.", image: `${IMAGE_BASE}/preparation/traditional.webp` },
  { id: "affordable", term: "affordable", meaning: "not too expensive for someone to buy regularly", example: "The café serves good, affordable food.", gap: "Students need somewhere _____ to eat near the university.", image: `${IMAGE_BASE}/preparation/affordable.webp` },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const foodEatingPreparationConfig = {
  storageVersion: "v1",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Eating habits and actions",
      introduction: "Useful expressions for talking about everyday eating habits, meals and food choices.",
      items: setAItems,
      practice: [
        practice("a1", "During the week I usually _____ rather than going to restaurants.", ["cook at home", "eat out", "have a snack"], "cook at home", "Cook at home means prepare your own meals at home."),
        practice("a2", "We like to _____ for birthdays and other special occasions.", ["eat out", "cut down on", "do the food shopping"], "eat out", "Eat out means have a meal in a restaurant, café or similar place."),
        practice("a3", "Nobody felt like cooking, so we decided to _____.", ["order a takeaway", "share a meal", "try something new"], "order a takeaway", "You order a takeaway when you buy prepared restaurant food to eat elsewhere."),
        practice("a4", "I often _____ at about five o'clock if dinner is going to be late.", ["have a snack", "eat out", "cut down on"], "have a snack", "A snack is a small amount of food eaten between meals."),
        practice("a5", "I'm trying to _____ sugary drinks.", ["cut down on", "share a meal", "cook at home"], "cut down on", "Cut down on means reduce how much of something you consume."),
        practice("a6", "When I go abroad, I always like to _____.", ["try something new", "do the food shopping", "order a takeaway"], "try something new", "This means eat or experience something unfamiliar."),
        practice("a7", "I usually _____ on Saturday morning and buy enough for the whole week.", ["do the food shopping", "eat out", "have a snack"], "do the food shopping", "Do the food shopping means buy the food needed at home."),
        practice("a8", "One of the nicest parts of Christmas is being able to _____ with the whole family.", ["share a meal", "cut down on", "order a takeaway"], "share a meal", "Share a meal means eat together with other people."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Describing food and meals",
      introduction: "Flexible adjectives for describing food, meals and places to eat.",
      items: setBItems,
      practice: [
        practice("b1", "I buy fruit at the market because it is usually very _____.", ["fresh", "ready-made", "filling"], "fresh", "Fresh food has been produced or prepared recently."),
        practice("b2", "After travelling for weeks, I really missed _____ food.", ["home-cooked", "affordable", "ready-made"], "home-cooked", "Home-cooked food is prepared at home rather than bought ready to eat."),
        practice("b3", "When I'm very busy, I sometimes buy a _____ meal and heat it up at home.", ["ready-made", "traditional", "fresh"], "ready-made", "Ready-made food has already been prepared."),
        practice("b4", "I try to choose a _____ breakfast with some fruit and wholegrain bread.", ["healthy", "filling", "traditional"], "healthy", "Healthy food is good for your health."),
        practice("b5", "Lentils are cheap and very _____, so you don't need a huge portion.", ["filling", "tasty", "fresh"], "filling", "Filling food makes you feel full."),
        practice("b6", "The recipe was very simple, but the finished dish was really _____.", ["tasty", "affordable", "ready-made"], "tasty", "Tasty means having an enjoyable flavour."),
        practice("b7", "We tried a _____ dish that people in the region have been making for generations.", ["traditional", "healthy", "filling"], "traditional", "Traditional food is connected with long-established local customs."),
        practice("b8", "The restaurant is popular with students because the food is good and _____.", ["affordable", "fresh", "home-cooked"], "affordable", "Affordable means reasonably priced."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "We were too tired to cook, so we decided to _____.", ["order a takeaway", "cut down on", "do the food shopping"], "order a takeaway", "A takeaway is a convenient option when you don't want to prepare a meal."),
    practice("m2", "The portions aren't enormous, but the food is surprisingly _____.", ["filling", "fresh", "affordable"], "filling", "Filling food makes you feel satisfied after eating."),
    practice("m3", "I'm trying to _____ the amount of sugar I eat.", ["cut down on", "eat out", "share"], "cut down on", "Cut down on means consume less of something."),
    practice("m4", "One reason I like this market is that the fruit and vegetables are very _____.", ["fresh", "ready-made", "traditional"], "fresh", "Fresh is commonly used for recently produced fruit, vegetables and other foods."),
    practice("m5", "We don't _____ very often because restaurants have become quite expensive.", ["eat out", "have a snack", "cook at home"], "eat out", "Eat out means have a meal away from home in a restaurant or café."),
    practice("m6", "The café is simple, friendly and quite _____, which is why I go there regularly.", ["affordable", "filling", "home-cooked"], "affordable", "Affordable describes something that is not too expensive."),
    practice("m7", "When I travel, I prefer to _____ rather than order the same dishes I eat at home.", ["try something new", "do the food shopping", "cut down on something"], "try something new", "Trying something new is useful language for unfamiliar dishes and cuisines."),
    practice("m8", "I usually prefer _____ meals, but prepared food can be useful when I'm busy.", ["home-cooked", "ready-made", "fresh"], "home-cooked", "Home-cooked contrasts naturally with prepared or takeaway food."),
  ],
  writeTest: {
    title: "Write the key words",
    introduction: "Complete each sentence with one important word from the expressions you have learned. Four items come from each set.",
    items: [
      { id: "write-eat-out", prompt: "We sometimes eat _____ at weekends.", answer: "out", feedback: "The full expression is ‘eat out’.", image: `${IMAGE_BASE}/preparation/eat-out.webp` },
      { id: "write-takeaway", prompt: "We ordered a _____ because nobody wanted to cook.", answer: "takeaway", acceptedAnswers: ["take-away"], feedback: "The target expression is ‘order a takeaway’.", image: `${IMAGE_BASE}/preparation/order-takeaway.webp` },
      { id: "write-cut-down", prompt: "I'm trying to cut _____ on sugar.", answer: "down", feedback: "The full expression is ‘cut down on something’.", image: `${IMAGE_BASE}/preparation/cut-down-on.webp` },
      { id: "write-food-shopping", prompt: "I usually do the food _____ on Saturday.", answer: "shopping", feedback: "The full British-English expression is ‘do the food shopping’.", image: `${IMAGE_BASE}/preparation/food-shopping.webp` },
      { id: "write-home-cooked", prompt: "I prefer home-_____ meals.", answer: "cooked", feedback: "The full adjective is ‘home-cooked’.", image: `${IMAGE_BASE}/preparation/home-cooked.webp` },
      { id: "write-ready-made", prompt: "I sometimes buy ready-_____ meals when I'm busy.", answer: "made", feedback: "The full adjective is ‘ready-made’.", image: `${IMAGE_BASE}/preparation/ready-made.webp` },
      { id: "write-filling", prompt: "The meal was small but surprisingly _____.", answer: "filling", acceptedAnswers: ["satisfying"], feedback: "The target word is ‘filling’; ‘satisfying’ also works naturally.", image: `${IMAGE_BASE}/preparation/filling.webp` },
      { id: "write-affordable", prompt: "The café serves good, _____ food.", answer: "affordable", acceptedAnswers: ["inexpensive", "reasonably priced", "cheap"], feedback: "The target word is ‘affordable’; several natural price adjectives also fit.", image: `${IMAGE_BASE}/preparation/affordable.webp` },
    ],
  },
  ideaTasks: [
    {
      id: "eating-habits",
      question: "What are your usual eating habits during the week?",
      instruction: "Choose the points that would be easiest for you to talk about.",
      minimum: 3,
      ideas: ["cook at home", "eat out", "order a takeaway", "have a snack", "do the food shopping"],
    },
    {
      id: "choosing-food",
      question: "What is important to you when you choose food or a meal?",
      instruction: "Choose features you could explain with a reason or example.",
      minimum: 3,
      ideas: ["fresh or home-cooked", "healthy and filling", "tasty", "traditional", "affordable"],
    },
  ],
  rehearsal: {
    question: "Do you prefer to cook at home or eat out? Why?",
    image: `${IMAGE_BASE}/part2_task01_cooking_at_home.webp`,
    imageAlt: "A person preparing a meal at home",
    ideaPrompts: ["home-cooked or ready-made food", "healthy, filling or tasty meals", "cost and affordability", "sharing a meal or trying something new"],
    usefulChunks: ["I prefer to…", "The main reason is…", "For example…"],
  },
};
