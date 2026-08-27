const FLAG_BASE = "/images/vocab/countries-nationalities/flags";
const CLASSROOM_IMAGE_BASE = "/images/vocab/classroom";
const CLASSROOM_LANGUAGE_IMAGE_BASE = "/images/vocab/classroom-language";
const SMALL_THINGS_IMAGE_BASE = "/images/vocab/small-things";
const PEOPLE_FAMILY_IMAGE_BASE = "/images/vocab/people-family";
const FOOD_IMAGE_BASE = "/images/vocab/textbook-food";
const WORK_IMAGE_BASE = "/images/vocab/work";
const TEXTBOOK_JOBS_IMAGE_BASE = "/images/vocab/textbook-jobs";
const TEXTBOOK_WORKPLACES_IMAGE_BASE = "/images/vocab/textbook-workplaces";
const COMMON_VERB_PHRASES_IMAGE_BASE = "/images/vocab/common-verb-phrases-1";
const COMMON_VERB_PHRASES_2_IMAGE_BASE = "/images/vocab/common-verb-phrases-2";
const TYPICAL_DAY_IMAGE_BASE = "/images/vocab/typical-day";
const HOTEL_IMAGE_BASE = "/images/vocab/hotel";
const CLOTHES_IMAGE_BASE = "/images/vocab/clothes";
const TEXTBOOK_CLOTHES_IMAGE_BASE = "/images/vocab/textbook-clothes";
const TEXTBOOK_ACTIVITIES_IMAGE_BASE = "/images/vocab/textbook-activities";

export const HUB_VOCAB_LEVELS = [
  {
    id: "a1",
    label: "A1",
    title: "A1 Vocabulary",
    description: "Core starter vocabulary from the first textbook units.",
  },
  {
    id: "a2",
    label: "A2",
    title: "A2 Vocabulary",
    description: "Elementary vocabulary review and practice.",
  },
  {
    id: "a2-b1",
    label: "A2–B1",
    title: "Pre-intermediate Vocabulary",
    description: "Pre-intermediate vocabulary review and practice.",
  },
];

export const HUB_VOCAB_LEVEL_COLORS = {
  a1: "#72df9b",
  a2: "#7ef0c2",
  "a2-b1": "#8fb6ff",
  b1: "#8fb6ff",
  b2: "#f6d26b",
  c1: "#f2b0b7",
  c2: "#c7a4ff",
};

export const HUB_VOCAB_THEMES = [
  {
    id: "numbers",
    level: "a1",
    order: 1,
    title: "Numbers",
    shortDescription: "Practise 0-100, spelling, recognition, and quick recall.",
    textbookRef: "Vocabulary Bank 1",
    accent: "#72df9b",
    entries: [
      { id: "n0", numeral: "0", term: "zero", also: "oh", pronunciation: "/'zɪərəʊ/" },
      { id: "n1", numeral: "1", term: "one", pronunciation: "/wʌn/" },
      { id: "n2", numeral: "2", term: "two", pronunciation: "/tuː/" },
      { id: "n3", numeral: "3", term: "three", pronunciation: "/θriː/" },
      { id: "n4", numeral: "4", term: "four", pronunciation: "/fɔː/" },
      { id: "n5", numeral: "5", term: "five", pronunciation: "/faɪv/" },
      { id: "n6", numeral: "6", term: "six", pronunciation: "/sɪks/" },
      { id: "n7", numeral: "7", term: "seven", pronunciation: "/'sevən/" },
      { id: "n8", numeral: "8", term: "eight", pronunciation: "/eɪt/" },
      { id: "n9", numeral: "9", term: "nine", pronunciation: "/naɪn/" },
      { id: "n10", numeral: "10", term: "ten", pronunciation: "/ten/" },
      { id: "n11", numeral: "11", term: "eleven", pronunciation: "/ɪ'levən/" },
      { id: "n12", numeral: "12", term: "twelve", pronunciation: "/twelv/" },
      { id: "n13", numeral: "13", term: "thirteen", pronunciation: "/θɜː'tiːn/" },
      { id: "n14", numeral: "14", term: "fourteen", pronunciation: "/fɔː'tiːn/" },
      { id: "n15", numeral: "15", term: "fifteen", pronunciation: "/fɪf'tiːn/" },
      { id: "n16", numeral: "16", term: "sixteen", pronunciation: "/sɪks'tiːn/" },
      { id: "n17", numeral: "17", term: "seventeen", pronunciation: "/sevən'tiːn/" },
      { id: "n18", numeral: "18", term: "eighteen", pronunciation: "/eɪ'tiːn/" },
      { id: "n19", numeral: "19", term: "nineteen", pronunciation: "/naɪn'tiːn/" },
      { id: "n20", numeral: "20", term: "twenty", pronunciation: "/'twenti/" },
      { id: "n21", numeral: "21", term: "twenty-one", pronunciation: "/twenti 'wʌn/" },
      { id: "n22", numeral: "22", term: "twenty-two", pronunciation: "/twenti 'tuː/" },
      { id: "n30", numeral: "30", term: "thirty", pronunciation: "/'θɜːti/" },
      { id: "n33", numeral: "33", term: "thirty-three", pronunciation: "/θɜːti 'θriː/" },
      { id: "n40", numeral: "40", term: "forty", pronunciation: "/'fɔːti/" },
      { id: "n44", numeral: "44", term: "forty-four", pronunciation: "/fɔːti 'fɔː/" },
      { id: "n50", numeral: "50", term: "fifty", pronunciation: "/'fɪfti/" },
      { id: "n55", numeral: "55", term: "fifty-five", pronunciation: "/fɪfti 'faɪv/" },
      { id: "n60", numeral: "60", term: "sixty", pronunciation: "/'sɪksti/" },
      { id: "n66", numeral: "66", term: "sixty-six", pronunciation: "/sɪksti 'sɪks/" },
      { id: "n70", numeral: "70", term: "seventy", pronunciation: "/'sevnti/" },
      { id: "n77", numeral: "77", term: "seventy-seven", pronunciation: "/sevnti 'sevən/" },
      { id: "n80", numeral: "80", term: "eighty", pronunciation: "/'eɪti/" },
      { id: "n88", numeral: "88", term: "eighty-eight", pronunciation: "/eɪti 'eɪt/" },
      { id: "n90", numeral: "90", term: "ninety", pronunciation: "/'naɪnti/" },
      { id: "n99", numeral: "99", term: "ninety-nine", pronunciation: "/naɪnti 'naɪn/" },
      { id: "n100", numeral: "100", term: "a hundred", pronunciation: "/ə 'hʌndrəd/" },
    ],
    activities: [
      {
        id: "flashcards",
        type: "flashcards",
        title: "Flashcards",
        shortDescription: "Flip between digits and words, then say them aloud.",
        prompt: "Read the number, then flip to check the word.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match numbers",
        shortDescription: "Pair each digit with the correct English word.",
        prompt: "Match the numbers to the words.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the correct word before moving to the next card.",
        prompt: "Choose the word that matches the number.",
      },
      {
        id: "spelling",
        type: "type-answer",
        title: "Spell the number",
        shortDescription: "Type the word for each number.",
        prompt: "Type the number in words.",
      },
    ],
  },
  {
    id: "countries-nationalities",
    level: "a1",
    order: 2,
    title: "Countries & nationalities",
    shortDescription: "Learn country names, nationalities, flags, and capital letters.",
    textbookRef: "Vocabulary Bank 2",
    accent: "#6fb6ff",
    entries: [
      countryEntry("brazil", "Brazil", "Brazilian", "br"),
      countryEntry("china", "China", "Chinese", "cn"),
      countryEntry("egypt", "Egypt", "Egyptian", "eg"),
      countryEntry("england", "England", "English", "gb-eng"),
      countryEntry("france", "France", "French", "fr"),
      countryEntry("germany", "Germany", "German", "de"),
      countryEntry("italy", "Italy", "Italian", "it"),
      countryEntry("japan", "Japan", "Japanese", "jp"),
      countryEntry("mexico", "Mexico", "Mexican", "mx"),
      countryEntry("poland", "Poland", "Polish", "pl"),
      countryEntry("russia", "Russia", "Russian", "ru"),
      countryEntry("spain", "Spain", "Spanish", "es"),
      countryEntry("switzerland", "Switzerland", "Swiss", "ch"),
      countryEntry("turkey", "Turkey", "Turkish", "tr"),
      countryEntry("united-states", "the United States", "American", "us"),
      countryEntry("uk", "the UK", "British", "gb"),
    ],
    activities: [
      {
        id: "flag-flashcards",
        type: "flag-flashcards",
        title: "Flag flashcards",
        shortDescription: "Look at the flag, then reveal the country and nationality.",
        prompt: "Say the country and nationality before you flip.",
      },
      {
        id: "flag-match",
        type: "flag-match",
        title: "Match the flags",
        shortDescription: "Choose the country that matches each flag.",
        prompt: "Which country does this flag show?",
      },
      {
        id: "nationalities",
        type: "nationality-choice",
        title: "Country → nationality",
        shortDescription: "Practise Brazilian, Chinese, Egyptian, and the tricky ones.",
        prompt: "Choose the correct nationality.",
      },
      {
        id: "spelling",
        type: "type-answer",
        title: "Spell the country",
        shortDescription: "Type the country name from the flag.",
        prompt: "Look at the flag and type the country.",
      },
      {
        id: "nationality-spelling",
        type: "nationality-type-answer",
        title: "Spell the nationality",
        shortDescription: "Type the nationality from the country name.",
        prompt: "Look at the country and type the nationality.",
      },
    ],
  },
  {
    id: "the-classroom",
    level: "a1",
    order: 3,
    title: "The classroom",
    shortDescription: "Practise classroom objects and useful classroom language.",
    textbookRef: "Vocabulary Bank 3",
    accent: "#ffb86b",
    itemCount: 23,
    entries: [
      objectEntry("board", "board", "BOARD", "board", ["the board"], null, `${CLASSROOM_IMAGE_BASE}/board.png`),
      objectEntry("door", "door", "DOOR", "door", ["the door"], null, `${CLASSROOM_IMAGE_BASE}/door.png`),
      objectEntry("window", "window", "WINDOW", "window", ["a window"], null, `${CLASSROOM_IMAGE_BASE}/window.png`),
      objectEntry("chair", "chair", "CHAIR", "chair", ["a chair"], null, `${CLASSROOM_IMAGE_BASE}/chair.png`),
      objectEntry("coat", "coat", "COAT", "coat", ["a coat"], null, `${CLASSROOM_IMAGE_BASE}/coat.png`),
      objectEntry("table", "table", "TABLE", "table", ["a table"], null, `${CLASSROOM_IMAGE_BASE}/table.png`),
      objectEntry("laptop", "laptop", "LAPTOP", "laptop", ["a laptop"], null, `${CLASSROOM_IMAGE_BASE}/laptop.png`),
      objectEntry("dictionary", "dictionary", "DICTIONARY", "dictionary", ["a dictionary"], null, `${CLASSROOM_IMAGE_BASE}/book.png`),
      objectEntry("piece-of-paper", "piece of paper", "PAPER", "paper", ["a piece of paper", "piece of paper"], null, `${CLASSROOM_IMAGE_BASE}/piece-of-paper.png`),
      objectEntry("pen", "pen", "PEN", "pen", ["a pen"], null, `${CLASSROOM_IMAGE_BASE}/pen.png`),
      objectEntry("bag", "bag", "BAG", "bag", ["a bag"], null, `${CLASSROOM_IMAGE_BASE}/bag.png`),
    ],
    classroomLanguage: [
      languageEntry("cl-1", "Look at the board, please.", "teacher", "Look at the _____, please.", ["board"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/01-look-at-the-board.png`),
      languageEntry("cl-2", "Open your books.", "teacher", "Open your _____.", ["books"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/02-open-your-books.png`),
      languageEntry("cl-3", "Go to page 10.", "teacher", "Go to _____ 10.", ["page"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/03-go-to-page-10.png`),
      languageEntry("cl-4", "Close your books.", "teacher", "_____ your books.", ["close"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/04-close-your-books.png`),
      languageEntry("cl-5", "Stand up, please.", "teacher", "_____ up, please.", ["stand"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/05-stand-up-please.png`),
      languageEntry("cl-6", "Sit down.", "teacher", "_____ down.", ["sit"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/06-sit-down.png`),
      languageEntry("cl-7", "How do you spell it?", "student", "How do you _____ it?", ["spell"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/07-how-do-you-spell-it.png`),
      languageEntry("cl-8", "Sorry? Can you repeat that, please?", "student", "Sorry? Can you _____ that, please?", ["repeat"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/08-repeat-that-please.png`),
      languageEntry("cl-9", "Excuse me. What's gracias in English?", "student", "Excuse me. What's gracias in _____?", ["English", "english"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/09-gracias-in-english.png`),
      languageEntry("cl-10", "I don't understand.", "student", "I don't _____.", ["understand"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/10-i-dont-understand.png`),
      languageEntry("cl-11", "I don't know.", "student", "I don't _____.", ["know"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/11-i-dont-know.png`),
      languageEntry("cl-12", "Sorry I'm late.", "student", "Sorry I'm _____.", ["late"], `${CLASSROOM_LANGUAGE_IMAGE_BASE}/12-sorry-im-late.png`),
    ],
    activities: [
      {
        id: "flashcards",
        type: "flashcards",
        title: "Object flashcards",
        shortDescription: "Look at the classroom object, then reveal the word.",
        prompt: "Look at the object and say the word before you flip.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match classroom objects",
        shortDescription: "Match each classroom object to the correct word.",
        prompt: "Match the classroom objects to the words.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the correct classroom word.",
        prompt: "Choose the word that matches the classroom object.",
      },
      {
        id: "speaker-choice",
        type: "speaker-choice",
        dataKey: "classroomLanguage",
        title: "Teacher or student?",
        shortDescription: "Decide whether the teacher says it or the student says it.",
        prompt: "Choose who usually says the phrase.",
      },
      {
        id: "spelling",
        type: "type-answer",
        title: "Spell the object",
        shortDescription: "Type the classroom word from the visual prompt.",
        prompt: "Look at the object and type the word.",
      },
      {
        id: "language-gap-fill",
        type: "phrase-gap-fill",
        dataKey: "classroomLanguage",
        title: "Classroom phrase gaps",
        shortDescription: "Type the missing key word from each classroom phrase.",
        prompt: "Complete the classroom phrase.",
      },
    ],
  },
  {
    id: "small-things",
    level: "a1",
    order: 4,
    title: "Small things",
    shortDescription: "Practise everyday objects, spelling, and a / an.",
    textbookRef: "Vocabulary Bank 4",
    accent: "#f082a3",
    itemCount: 15,
    entries: [
      objectEntry("mobile-phone", "mobile phone", "PHONE", "phone", ["phone", "a mobile phone", "mobile phone", "a phone"], "a", `${SMALL_THINGS_IMAGE_BASE}/mobile.png`),
      objectEntry("watch", "watch", "WATCH", "watch", ["a watch"], "a", `${SMALL_THINGS_IMAGE_BASE}/watch.png`),
      objectEntry("tablet", "tablet", "TABLET", "tablet", ["a tablet"], "a", `${SMALL_THINGS_IMAGE_BASE}/tablet.png`),
      objectEntry("wallet", "wallet", "WALLET", "wallet", ["a wallet", "wallet", "a purse", "purse"], "a", `${SMALL_THINGS_IMAGE_BASE}/wallet.png`),
      objectEntry("pencil", "pencil", "PENCIL", "pencil", ["a pencil"], "a", `${SMALL_THINGS_IMAGE_BASE}/pencil.png`),
      objectEntry("notebook", "notebook", "NOTEBOOK", "notebook", ["a notebook"], "a", `${SMALL_THINGS_IMAGE_BASE}/notebook.png`),
      objectEntry("glasses", "glasses", "GLASSES", "glasses", ["glasses", "a pair of glasses"], null, `${SMALL_THINGS_IMAGE_BASE}/glasses.png`),
      objectEntry("photo", "photo", "PHOTO", "photo", ["a photo"], "a", `${SMALL_THINGS_IMAGE_BASE}/photo.png`),
      objectEntry("phone-charger", "phone charger", "CHARGER", "charger", ["a phone charger", "phone charger", "a charger", "charger"], "a", `${SMALL_THINGS_IMAGE_BASE}/charger.png`),
      objectEntry("id-card", "ID card", "ID CARD", "ID card", ["an ID card", "ID card"], "an", `${SMALL_THINGS_IMAGE_BASE}/ID-card.png`),
      objectEntry("umbrella", "umbrella", "UMBRELLA", "umbrella", ["an umbrella"], "an", `${SMALL_THINGS_IMAGE_BASE}/umbrella.png`),
      objectEntry("camera", "camera", "CAMERA", "camera", ["a camera"], "a", `${SMALL_THINGS_IMAGE_BASE}/camera.png`),
      objectEntry("credit-card", "credit card", "CARD", "credit card", ["a credit card", "credit card", "a debit card", "debit card"], "a", `${SMALL_THINGS_IMAGE_BASE}/credit-card.png`),
      objectEntry("key", "key", "KEY", "key", ["a key"], "a", `${SMALL_THINGS_IMAGE_BASE}/key.png`),
      objectEntry("newspaper", "newspaper", "NEWSPAPER", "newspaper", ["a newspaper"], "a", `${SMALL_THINGS_IMAGE_BASE}/newspaper.png`),
    ],
    activities: [
      {
        id: "flashcards",
        type: "flashcards",
        title: "Object flashcards",
        shortDescription: "Look at the everyday object, then reveal the word.",
        prompt: "Look at the object and say the word before you flip.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match small things",
        shortDescription: "Match each object to the correct word.",
        prompt: "Match the objects to the words.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the correct object word.",
        prompt: "Choose the word that matches the object.",
      },
      {
        id: "article-choice",
        type: "article-choice",
        title: "a / an",
        shortDescription: "Choose the correct article for each object.",
        prompt: "Choose the correct article before the noun.",
      },
      {
        id: "spelling",
        type: "type-answer",
        title: "Spell the object",
        shortDescription: "Type the small-object word from the visual prompt.",
        prompt: "Look at the object and type the word.",
      },
    ],
  },
  {
    id: "adjectives",
    level: "a1",
    order: 5,
    title: "Adjectives",
    shortDescription: "Practise colours, common adjectives, and opposites.",
    textbookRef: "Vocabulary Bank 6",
    accent: "#8cd88a",
    itemCount: 26,
    entries: [
      colorEntry("black", "black", "#1f2937"),
      colorEntry("blue", "blue", "#3b82f6"),
      colorEntry("brown", "brown", "#92400e"),
      colorEntry("green", "green", "#22c55e"),
      colorEntry("grey", "grey", "#94a3b8", ["gray"]),
      colorEntry("orange", "orange", "#fb923c"),
      colorEntry("pink", "pink", "#f472b6"),
      colorEntry("red", "red", "#ef4444"),
      colorEntry("white", "white", "#f8fafc"),
      colorEntry("yellow", "yellow", "#facc15"),
    ],
    adjectiveEntries: [
      adjectiveEntry("big", "big", "small"),
      adjectiveEntry("small", "small", "big"),
      adjectiveEntry("old", "old", "new"),
      adjectiveEntry("new", "new", "old"),
      adjectiveEntry("fast", "fast", "slow"),
      adjectiveEntry("slow", "slow", "fast"),
      adjectiveEntry("beautiful", "beautiful", "ugly"),
      adjectiveEntry("ugly", "ugly", "beautiful"),
      adjectiveEntry("cheap", "cheap", "expensive"),
      adjectiveEntry("expensive", "expensive", "cheap"),
      adjectiveEntry("long", "long", "short"),
      adjectiveEntry("short", "short", "long"),
      adjectiveEntry("clean", "clean", "dirty"),
      adjectiveEntry("dirty", "dirty", "clean"),
      adjectiveEntry("easy", "easy", "difficult"),
      adjectiveEntry("difficult", "difficult", "easy"),
    ],
    activities: [
      {
        id: "colour-flashcards",
        type: "flashcards",
        title: "Colour flashcards",
        shortDescription: "Look at the colour, then reveal the word.",
        prompt: "Look at the colour and say the word before you flip.",
      },
      {
        id: "colour-matching",
        type: "matching",
        title: "Match colours",
        shortDescription: "Match each colour prompt to the correct word.",
        prompt: "Match the colours to the words.",
      },
      {
        id: "opposites",
        type: "opposites-choice",
        dataKey: "adjectiveEntries",
        title: "Opposites",
        shortDescription: "Choose the opposite adjective.",
        prompt: "Choose the opposite of each adjective.",
      },
      {
        id: "colour-spelling",
        type: "type-answer",
        title: "Spell the colour",
        shortDescription: "Type the colour word from the visual prompt.",
        prompt: "Look at the colour and type the word.",
      },
      {
        id: "write-the-opposite",
        type: "opposite-type-answer",
        dataKey: "adjectiveEntries",
        title: "Write the opposite",
        shortDescription: "Type the opposite adjective from memory.",
        prompt: "Write the opposite adjective.",
        answerLabel: "Opposite adjective",
        answerPlaceholder: "Type the opposite",
      },
    ],
  },
  {
    id: "people-family",
    level: "a1",
    order: 6,
    title: "People & family",
    shortDescription: "Practise people words, family members, and irregular plurals.",
    textbookRef: "Vocabulary Bank 5",
    accent: "#79c3ff",
    itemCount: 18,
    entries: [
      objectEntry("boy", "boy", "BOY", "boy", ["a boy"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/boy.png`),
      objectEntry("girl", "girl", "GIRL", "girl", ["a girl"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/girl.png`),
      objectEntry("man", "man", "MAN", "man", ["a man"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/man.png`),
      objectEntry("woman", "woman", "WOMAN", "woman", ["a woman"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/woman.png`),
      objectEntry("children", "children", "CHILDREN", "children", ["children"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/children.png`),
      objectEntry("friends", "friends", "FRIENDS", "friends", ["friends"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/friends.png`),
    ],
    familyEntries: [
      objectEntry("husband", "husband", "HUSBAND", "husband", ["a husband"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/husband.png`),
      objectEntry("wife", "wife", "WIFE", "wife", ["a wife"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/wife.png`),
      objectEntry("mother", "mother", "MOTHER", "mother", ["a mother"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/mother.png`),
      objectEntry("father", "father", "FATHER", "father", ["a father"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/father.png`),
      objectEntry("son", "son", "SON", "son", ["a son"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/son.png`),
      objectEntry("daughter", "daughter", "DAUGHTER", "daughter", ["a daughter"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/daughter.png`),
      objectEntry("brother", "brother", "BROTHER", "brother", ["a brother"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/brother.png`),
      objectEntry("sister", "sister", "SISTER", "sister", ["a sister"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/sister.png`),
      objectEntry("grandmother", "grandmother", "GRANDMOTHER", "grandmother", ["a grandmother"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/grandmother.png`),
      objectEntry("grandfather", "grandfather", "GRANDFATHER", "grandfather", ["a grandfather"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/grandfather.png`),
      objectEntry("boyfriend", "boyfriend", "BOYFRIEND", "boyfriend", ["a boyfriend"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/boyfriend.png`),
      objectEntry("girlfriend", "girlfriend", "GIRLFRIEND", "girlfriend", ["a girlfriend"], null, `${PEOPLE_FAMILY_IMAGE_BASE}/girlfriend.png`),
    ],
    pluralEntries: [
      pluralEntry("plural-child", "child", "children"),
      pluralEntry("plural-man", "man", "men"),
      pluralEntry("plural-woman", "woman", "women"),
      pluralEntry("plural-person", "person", "people"),
    ],
    activities: [
      {
        id: "people-flashcards",
        type: "flashcards",
        title: "People flashcards",
        shortDescription: "Flip the people words and say them aloud.",
        prompt: "Look at the prompt and say the people word before you flip.",
      },
      {
        id: "family-flashcards",
        type: "flashcards",
        dataKey: "familyEntries",
        title: "Family flashcards",
        shortDescription: "Flip the family words and say them aloud.",
        prompt: "Look at the family prompt and say the word before you flip.",
      },
      {
        id: "family-matching",
        type: "matching",
        title: "Match people & family",
        shortDescription: "Match prompts from the full people and family set.",
        prompt: "Match the people and family words.",
      },
      {
        id: "family-spelling",
        type: "type-answer",
        title: "Spell people & family words",
        shortDescription: "Type words from the full people and family set.",
        prompt: "Look at the prompt and type the word.",
      },
      {
        id: "plural-practice",
        type: "plural-type-answer",
        dataKey: "pluralEntries",
        title: "Singular → plural",
        shortDescription: "Type the correct irregular plural.",
        prompt: "Read the singular word and type the plural form.",
      },
    ],
  },
  {
    id: "food-drink",
    level: "a1",
    order: 7,
    title: "Food & drink",
    shortDescription: "Practise everyday food, drinks, and simple meal vocabulary.",
    textbookRef: "Vocabulary Bank 7",
    accent: "#6dd3a8",
    itemCount: 25,
    entries: [
      foodEntry("fish", "fish", "food", "eat", `${FOOD_IMAGE_BASE}/fish.png`, ["fish"]),
      foodEntry("meat", "meat", "food", "eat", `${FOOD_IMAGE_BASE}/meat.png`, ["meat"]),
      foodEntry("pasta", "pasta", "food", "eat", `${FOOD_IMAGE_BASE}/pasta.png`, ["pasta"]),
      foodEntry("rice", "rice", "food", "eat", `${FOOD_IMAGE_BASE}/rice.png`, ["rice"]),
      foodEntry("eggs", "eggs", "food", "eat", `${FOOD_IMAGE_BASE}/egg.png`, ["eggs", "egg"]),
      foodEntry("yogurt", "yogurt", "food", "eat", `${FOOD_IMAGE_BASE}/yoghurt.png`, ["yogurt", "yoghurt"]),
      foodEntry("vegetables", "vegetables", "food", "eat", `${FOOD_IMAGE_BASE}/vegetables.png`, ["vegetables", "vegetable"]),
      foodEntry("potatoes", "potatoes", "food", "eat", `${FOOD_IMAGE_BASE}/potatoes.png`, ["potatoes", "potato"]),
      foodEntry("salad", "salad", "food", "eat", `${FOOD_IMAGE_BASE}/salad.png`, ["salad"]),
      foodEntry("fruit", "fruit", "food", "eat", `${FOOD_IMAGE_BASE}/fruit.png`, ["fruit"]),
      foodEntry("bread", "bread", "food", "eat", `${FOOD_IMAGE_BASE}/bread.png`, ["bread"]),
      foodEntry("butter", "butter", "food", "eat", `${FOOD_IMAGE_BASE}/butter.png`, ["butter"]),
      foodEntry("cheese", "cheese", "food", "eat", `${FOOD_IMAGE_BASE}/cheese.png`, ["cheese"]),
      foodEntry("sugar", "sugar", "food", "have", `${FOOD_IMAGE_BASE}/sugar.png`, ["sugar"]),
      foodEntry("sandwich", "sandwich", "food", "eat", `${FOOD_IMAGE_BASE}/sandwich.png`, ["sandwich"]),
      foodEntry("cereal", "cereal", "food", "have", `${FOOD_IMAGE_BASE}/cereal.png`, ["cereal"]),
      foodEntry("chocolate", "chocolate", "food", "eat", `${FOOD_IMAGE_BASE}/chocolate.png`, ["chocolate"]),
      foodEntry("coffee", "coffee", "drink", "drink", `${FOOD_IMAGE_BASE}/coffee.png`, ["coffee"]),
      foodEntry("tea", "tea", "drink", "drink", `${FOOD_IMAGE_BASE}/tea.png`, ["tea"]),
      foodEntry("milk", "milk", "drink", "drink", `${FOOD_IMAGE_BASE}/milk.png`, ["milk"]),
      foodEntry("water", "water", "drink", "drink", `${FOOD_IMAGE_BASE}/water.png`, ["water"]),
      foodEntry("orange-juice", "orange juice", "drink", "drink", `${FOOD_IMAGE_BASE}/orange juice.png`, ["orange juice"]),
      foodEntry("wine", "wine", "drink", "drink", `${FOOD_IMAGE_BASE}/wine.png`, ["wine"]),
      foodEntry("beer", "beer", "drink", "drink", `${FOOD_IMAGE_BASE}/beer.png`, ["beer"]),
    ],
    activities: [
      {
        id: "flashcards",
        type: "flashcards",
        title: "Food flashcards",
        shortDescription: "Look at the food or drink prompt, then reveal the word.",
        prompt: "Look at the prompt and say the word before you flip.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match food & drink",
        shortDescription: "Match the food and drink prompts to the words.",
        prompt: "Match the food and drink items to the words.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the food or drink word that matches the prompt.",
        prompt: "Choose the correct food or drink word.",
      },
      {
        id: "spelling",
        type: "type-answer",
        title: "Spell the item",
        shortDescription: "Type the food or drink word from the prompt.",
        prompt: "Look at the prompt and type the word.",
      },
    ],
  },
  {
    id: "common-verb-phrases-1",
    level: "a1",
    order: 8,
    title: "Common verb phrases 1",
    shortDescription: "Practise everyday verb phrases with cue prompts and quick recall.",
    textbookRef: "Vocabulary Bank 8",
    accent: "#f3a86f",
    itemCount: 15,
    entries: [
      verbPhraseEntry("live-in-a-flat", "live in a flat", "_____ __ a flat", ["live in"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/live-flat.png`),
      verbPhraseEntry("have-breakfast", "have breakfast", "_____ breakfast", ["have"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/have-breakfast.png`),
      verbPhraseEntry("watch-tv", "watch TV", "_____ TV", ["watch"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/watch-tv.png`),
      verbPhraseEntry("listen-to-the-radio", "listen to the radio", "_____ __ the radio", ["listen to"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/listen-radio.png`),
      verbPhraseEntry("read-the-newspaper", "read the newspaper", "_____ the newspaper", ["read"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/read-newspaper.png`),
      verbPhraseEntry("eat-fast-food", "eat fast food", "_____ fast food", ["eat"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/eat-fast-food.png`),
      verbPhraseEntry("drink-tea", "drink tea", "_____ tea", ["drink"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/drink-tea.png`),
      verbPhraseEntry("speak-english", "speak English", "_____ English", ["speak"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/speak-english.png`),
      verbPhraseEntry("want-a-coffee", "want a coffee", "_____ a coffee", ["want"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/want-coffee.png`),
      verbPhraseEntry("have-a-dog", "have a dog", "_____ a dog", ["have"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/have-dog.png`),
      verbPhraseEntry("like-cats", "like cats", "_____ cats", ["like"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/like-cats.png`),
      verbPhraseEntry("work-in-a-bank", "work in a bank", "_____ __ a bank", ["work in"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/work-bank.png`),
      verbPhraseEntry("study-spanish", "study Spanish", "_____ Spanish", ["study"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/study-spanish.png`),
      verbPhraseEntry("go-to-english-classes", "go to English classes", "_____ __ English classes", ["go to"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/go-English-classes.png`),
      verbPhraseEntry("need-a-new-car", "need a new car", "_____ a new car", ["need"], `${COMMON_VERB_PHRASES_IMAGE_BASE}/need-car.png`),
    ],
    activities: [
      {
        id: "cue-flashcards",
        type: "flashcards",
        title: "Cue flashcards",
        shortDescription: "Read the cue prompt, then reveal the full phrase.",
        prompt: "Read the cue prompt and say the full phrase before you flip.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match the phrases",
        shortDescription: "Match each cue prompt to the full verb phrase.",
        prompt: "Match the cue prompts to the full phrases.",
      },
      {
        id: "quick-choice",
        type: "gap-choice",
        title: "Quick choice",
        shortDescription: "Choose the missing verb or verb phrase.",
        prompt: "Choose the missing words.",
      },
      {
        id: "spelling",
        type: "cue-gap-type-answer",
        title: "Complete the phrase",
        shortDescription: "Type the missing verb or verb phrase from the cue prompt.",
        prompt: "Look at the cue prompt and type the missing words.",
        answerLabel: "Missing words",
        answerPlaceholder: "Type the missing words",
      },
    ],
  },
  {
    id: "jobs-places-work",
    level: "a1",
    order: 9,
    title: "Jobs and places of work",
    shortDescription: "Practise common jobs and the places where people work.",
    textbookRef: "Vocabulary Bank 9",
    accent: "#8fb6ff",
    itemCount: 18,
    entries: [
      jobEntry("teacher", "a teacher", `${TEXTBOOK_JOBS_IMAGE_BASE}/teacher.png`, ["teacher"]),
      jobEntry("doctor", "a doctor", `${TEXTBOOK_JOBS_IMAGE_BASE}/doctor.png`, ["doctor"]),
      jobEntry("nurse", "a nurse", `${TEXTBOOK_JOBS_IMAGE_BASE}/nurse.png`, ["nurse"]),
      jobEntry("journalist", "a journalist", `${TEXTBOOK_JOBS_IMAGE_BASE}/journalist.png`, ["journalist"]),
      jobEntry("waiter", "a waiter", `${TEXTBOOK_JOBS_IMAGE_BASE}/waiter.png`, ["waiter"]),
      jobEntry("shop-assistant", "a shop assistant", `${TEXTBOOK_JOBS_IMAGE_BASE}/shop-assistant.png`, ["shop assistant"]),
      jobEntry("receptionist", "a receptionist", `${TEXTBOOK_JOBS_IMAGE_BASE}/receptionist.png`, ["receptionist"]),
      jobEntry("police-officer", "a police officer", `${TEXTBOOK_JOBS_IMAGE_BASE}/police-officer.png`, ["police officer", "a policeman", "policeman", "a policewoman", "policewoman"]),
      jobEntry("factory-worker", "a factory worker", `${TEXTBOOK_JOBS_IMAGE_BASE}/factory-worker.png`, ["factory worker"]),
      jobEntry("taxi-driver", "a taxi driver", `${TEXTBOOK_JOBS_IMAGE_BASE}/taxi-driver.png`, ["taxi driver"]),
    ],
    workplaceEntries: [
      placeEntry("hospital", "in a hospital", ["hospital"], "A clean hospital room with a doctor, nurse, and patient bed, simple textbook photo or illustration, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/hospital.png`),
      placeEntry("shop", "in a shop", ["shop"], "A small clothes shop with racks and a shop assistant helping customers, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/shop.png`),
      placeEntry("restaurant", "in a restaurant", ["restaurant"], "A bright restaurant dining room with tables set for lunch, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/restaurant.png`),
      placeEntry("office", "in an office", ["office"], "A modern office with desks, computers, and workers, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/office.png`),
      placeEntry("school", "in a school", ["school"], "A teacher with students in a classroom at school, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/school.png`),
      placeEntry("factory", "in a factory", ["factory"], "A factory floor with machinery and workers in safety clothing, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/factory.png`),
      placeEntry("home", "at home", ["home"], "A person working at a desk at home with a laptop, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/home.png`),
      placeEntry("street", "in the street", ["street"], "Police officers standing in a city street, simple textbook vocabulary image, no text.", `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/street.png`),
    ],
    activities: [
      {
        id: "job-flashcards",
        type: "flashcards",
        title: "Job flashcards",
        shortDescription: "Look at the job prompt, then reveal the word.",
        prompt: "Look at the job prompt and say the job before you flip.",
      },
      {
        id: "place-flashcards",
        type: "flashcards",
        dataKey: "workplaceEntries",
        title: "Place flashcards",
        shortDescription: "Read the place prompt, then reveal the phrase.",
        prompt: "Look at the workplace prompt and say the phrase before you flip.",
      },
      {
        id: "job-matching",
        type: "matching",
        title: "Match jobs",
        shortDescription: "Match each job prompt to the correct word.",
        prompt: "Match the jobs to the words.",
      },
      {
        id: "place-matching",
        type: "matching",
        dataKey: "workplaceEntries",
        title: "Match places",
        shortDescription: "Match each workplace prompt to the correct phrase.",
        prompt: "Match the workplaces to the phrases.",
      },
      {
        id: "job-spelling",
        type: "type-answer",
        title: "Spell the job",
        shortDescription: "Type the job from the prompt.",
        prompt: "Look at the prompt and type the job.",
        answerLabel: "Job",
        answerPlaceholder: "Type the job",
      },
      {
        id: "place-spelling",
        type: "type-answer",
        dataKey: "workplaceEntries",
        title: "Complete the place",
        shortDescription: "Type the workplace phrase.",
        prompt: "Look at the prompt and type the workplace phrase.",
        answerLabel: "Place phrase",
        answerPlaceholder: "Type the full phrase",
        showGapPrompt: true,
      },
    ],
  },
  {
    id: "typical-day",
    level: "a1",
    order: 10,
    title: "A typical day",
    shortDescription: "Practise daily routine phrases from morning to evening.",
    textbookRef: "Vocabulary Bank 10",
    accent: "#72df9b",
    itemCount: 16,
    entries: [
      routineEntry("get-up", "get up", "_____ up", "in the morning", ["get"], "A person waking up in bed and stretching beside an alarm clock at 6:45, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/get-up.png`),
      routineEntry("have-breakfast", "have breakfast", "_____ breakfast", "in the morning", ["have"], "A person eating cereal and drinking milk at a kitchen table in the morning, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-breakfast.png`),
      routineEntry("have-a-shower", "have a shower", "_____ a shower", "in the morning", ["have"], "A person taking a shower in a clean bathroom, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-a-shower.png`),
      routineEntry("go-to-work", "go to work", "_____ to work", "in the morning", ["go"], "A commuter travelling to work by bus or train in the morning, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/go-to-work.png`),
      routineEntry("have-a-coffee", "have a coffee", "_____ a coffee", "in the morning", ["have"], "Two people having coffee during a morning break, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-coffee.png`),
      routineEntry("have-lunch", "have lunch", "_____ lunch", "in the afternoon", ["have"], "A person eating lunch at a desk at one o'clock, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-lunch.png`),
      routineEntry("finish-work", "finish work", "_____ work", "in the afternoon", ["finish"], "A worker leaving an office at the end of the afternoon, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/finish-work.png`),
      routineEntry("go-home", "go home", "_____ home", "in the afternoon", ["go"], "A person travelling home after work, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/go-home.png`),
      routineEntry("go-shopping", "go shopping", "_____ shopping", "in the afternoon", ["go"], "A person entering a supermarket with a shopping basket, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/go-shopping.png`),
      routineEntry("go-to-the-gym", "go to the gym", "_____ to the gym", "in the afternoon", ["go"], "A person arriving at a gym with exercise machines in the background, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/go-to-the-gym.png`),
      routineEntry("make-dinner", "make dinner", "_____ dinner", "in the evening", ["make"], "A person cooking dinner in a kitchen in the evening, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/make-dinner.png`),
      routineEntry("have-dinner", "have dinner", "_____ dinner", "in the evening", ["have"], "A person eating dinner at a table in the evening, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-dinner.png`),
      routineEntry("do-housework", "do housework", "_____ housework", "in the evening", ["do"], "A person doing laundry and cleaning at home, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/do-housework.png`),
      routineEntry("watch-tv", "watch TV", "_____ TV", "in the evening", ["watch"], "A person watching television on a sofa in the evening, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/watch-TV.png`),
      routineEntry("have-a-bath", "have a bath", "_____ a bath", "in the evening", ["have"], "A calm bathroom scene with a bath ready in the evening, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/have-bath.png`),
      routineEntry("go-to-bed", "go to bed", "_____ to bed", "in the evening", ["go"], "A person getting into bed at night, simple textbook routine illustration, no text.", `${TYPICAL_DAY_IMAGE_BASE}/go-bed.png`),
    ],
    activities: [
      {
        id: "routine-flashcards",
        type: "flashcards",
        title: "Routine flashcards",
        shortDescription: "Read the cue prompt, then reveal the daily routine phrase.",
        prompt: "Read the cue prompt and say the full phrase before you flip.",
      },
      {
        id: "routine-matching",
        type: "matching",
        title: "Match routines",
        shortDescription: "Match each routine prompt to the full phrase.",
        prompt: "Match the daily routine prompts to the phrases.",
      },
      {
        id: "routine-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the full routine phrase that matches the prompt.",
        prompt: "Choose the correct routine phrase.",
      },
      {
        id: "routine-spelling",
        type: "cue-gap-type-answer",
        title: "Complete the routine",
        shortDescription: "Type the missing verb from the routine prompt.",
        prompt: "Look at the cue prompt and type the missing word.",
        answerLabel: "Missing word",
        answerPlaceholder: "Type the missing word",
      },
    ],
  },
  {
    id: "common-verb-phrases-2",
    level: "a1",
    order: 11,
    title: "Common verb phrases 2",
    shortDescription: "Practise free-time and travelling verb phrases.",
    textbookRef: "Vocabulary Bank 11",
    accent: "#72df9b",
    itemCount: 25,
    entries: [
      verbPhraseEntry("go-out", "go out", "_____ out", ["go"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-out.png`),
      verbPhraseEntry("play-computer-games", "play computer games", "_____ computer games", ["play"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/play-computer-games.png`),
      verbPhraseEntry("do-sport", "do sport", "_____ sport", ["do"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/play-basketball.png`),
      verbPhraseEntry("do-exercise", "do exercise", "_____ exercise", ["do"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/do-exercise.png`),
      verbPhraseEntry("go-to-the-beach", "go to the beach", "_____ to the beach", ["go"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-to-the-beach.png`),
      verbPhraseEntry("stay-at-home", "stay at home", "_____ at home", ["stay"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/stay-at-home.png`),
      verbPhraseEntry("play-tennis", "play tennis", "_____ tennis", ["play"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/play-tennis.png`),
      verbPhraseEntry("go-for-a-walk", "go for a walk", "_____ for a walk", ["go"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-for-a-walk.png`),
      verbPhraseEntry("play-the-piano", "play the piano", "_____ the piano", ["play"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/play-the-piano.png`),
      verbPhraseEntry("swim", "swim", "_____", ["swim"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/swim.png`),
      verbPhraseEntry("meet-friends", "meet friends", "_____ friends", ["meet"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/meet-friends.png`),
      verbPhraseEntry("relax", "relax", "_____", ["relax"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/relax.png`),
      verbPhraseEntry("travel", "travel", "_____", ["travel"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/travel.png`),
      verbPhraseEntry("book-tickets", "book tickets", "_____ tickets", ["book"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/book-tickets.png`),
      verbPhraseEntry("pack-a-suitcase", "pack a suitcase", "_____ a suitcase", ["pack"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/pack-a-suitcase.png`),
      verbPhraseEntry("leave-the-house", "leave the house", "_____ the house", ["leave"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/leave-the-house.png`),
      verbPhraseEntry("carry-a-suitcase", "carry a suitcase", "_____ a suitcase", ["carry"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/carry-a-suitcase.png`),
      verbPhraseEntry("wear-sunglasses", "wear sunglasses", "_____ sunglasses", ["wear"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/wear-sunglasses.png`),
      verbPhraseEntry("get-a-taxi", "get a taxi", "_____ a taxi", ["get"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/get-a-taxi.png`),
      verbPhraseEntry("wait-for-a-flight", "wait for a flight", "_____ for a flight", ["wait"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/wait-for-a-flight.png`),
      verbPhraseEntry("rent-a-car", "rent a car", "_____ a car", ["rent"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/rent-a-car.png`),
      verbPhraseEntry("arrive-at-a-hotel", "arrive at a hotel", "_____ at a hotel", ["arrive"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/arrive-at-a-hotel.png`),
      verbPhraseEntry("stay-in-a-hotel", "stay in a hotel", "_____ in a hotel", ["stay"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/stay-in-a-hotel.png`),
      verbPhraseEntry("phone-home", "phone home", "_____ home", ["phone"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/phone-home.png`),
      verbPhraseEntry("buy-presents", "buy presents", "_____ presents", ["buy"], `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/buy-presents.png`),
    ],
    activities: [
      {
        id: "cue-flashcards",
        type: "flashcards",
        title: "Cue flashcards",
        shortDescription: "Read the cue prompt, then reveal the full phrase.",
        prompt: "Read the cue prompt and say the full phrase before you flip.",
      },
      {
        id: "matching",
        type: "matching",
        title: "Match the phrases",
        shortDescription: "Match each cue prompt to the full verb phrase.",
        prompt: "Match the cue prompts to the full phrases.",
      },
      {
        id: "quick-choice",
        type: "gap-choice",
        title: "Quick choice",
        shortDescription: "Choose the missing verb or verb phrase.",
        prompt: "Choose the missing words.",
      },
      {
        id: "spelling",
        type: "cue-gap-type-answer",
        title: "Complete the phrase",
        shortDescription: "Type the missing verb or verb phrase from the cue prompt.",
        prompt: "Look at the cue prompt and type the missing words.",
        answerLabel: "Missing words",
        answerPlaceholder: "Type the missing words",
      },
    ],
  },
  {
    id: "months-ordinal-numbers",
    level: "a1",
    order: 12,
    title: "Months and ordinal numbers",
    shortDescription: "Practise months of the year and ordinal numbers from 1st to 31st.",
    textbookRef: "Vocabulary Bank 12",
    accent: "#72df9b",
    itemCount: 43,
    entries: [
      monthEntry("january", "January", "JAN"),
      monthEntry("february", "February", "FEB"),
      monthEntry("march", "March", "MAR"),
      monthEntry("april", "April", "APR"),
      monthEntry("may", "May", "MAY"),
      monthEntry("june", "June", "JUN"),
      monthEntry("july", "July", "JUL"),
      monthEntry("august", "August", "AUG"),
      monthEntry("september", "September", "SEP"),
      monthEntry("october", "October", "OCT"),
      monthEntry("november", "November", "NOV"),
      monthEntry("december", "December", "DEC"),
    ],
    ordinalEntries: [
      ordinalEntry("first", "1st", "first"),
      ordinalEntry("second", "2nd", "second"),
      ordinalEntry("third", "3rd", "third"),
      ordinalEntry("fourth", "4th", "fourth"),
      ordinalEntry("fifth", "5th", "fifth"),
      ordinalEntry("sixth", "6th", "sixth"),
      ordinalEntry("seventh", "7th", "seventh"),
      ordinalEntry("eighth", "8th", "eighth"),
      ordinalEntry("ninth", "9th", "ninth"),
      ordinalEntry("tenth", "10th", "tenth"),
      ordinalEntry("eleventh", "11th", "eleventh"),
      ordinalEntry("twelfth", "12th", "twelfth"),
      ordinalEntry("thirteenth", "13th", "thirteenth"),
      ordinalEntry("fourteenth", "14th", "fourteenth"),
      ordinalEntry("fifteenth", "15th", "fifteenth"),
      ordinalEntry("sixteenth", "16th", "sixteenth"),
      ordinalEntry("seventeenth", "17th", "seventeenth"),
      ordinalEntry("eighteenth", "18th", "eighteenth"),
      ordinalEntry("nineteenth", "19th", "nineteenth"),
      ordinalEntry("twentieth", "20th", "twentieth"),
      ordinalEntry("twenty-first", "21st", "twenty-first", ["twenty first"]),
      ordinalEntry("twenty-second", "22nd", "twenty-second", ["twenty second"]),
      ordinalEntry("twenty-third", "23rd", "twenty-third", ["twenty third"]),
      ordinalEntry("twenty-fourth", "24th", "twenty-fourth", ["twenty fourth"]),
      ordinalEntry("twenty-fifth", "25th", "twenty-fifth", ["twenty fifth"]),
      ordinalEntry("twenty-sixth", "26th", "twenty-sixth", ["twenty sixth"]),
      ordinalEntry("twenty-seventh", "27th", "twenty-seventh", ["twenty seventh"]),
      ordinalEntry("twenty-eighth", "28th", "twenty-eighth", ["twenty eighth"]),
      ordinalEntry("twenty-ninth", "29th", "twenty-ninth", ["twenty ninth"]),
      ordinalEntry("thirtieth", "30th", "thirtieth"),
      ordinalEntry("thirty-first", "31st", "thirty-first", ["thirty first"]),
    ],
    activities: [
      {
        id: "month-flashcards",
        type: "flashcards",
        title: "Month flashcards",
        shortDescription: "Read the abbreviation, then reveal the month.",
        prompt: "Read the abbreviation and say the month before you flip.",
      },
      {
        id: "ordinal-flashcards",
        type: "flashcards",
        dataKey: "ordinalEntries",
        title: "Ordinal flashcards",
        shortDescription: "Read the ordinal number, then reveal the word.",
        prompt: "Read the ordinal number and say the word before you flip.",
      },
      {
        id: "month-matching",
        type: "matching",
        title: "Match months",
        shortDescription: "Match each abbreviation to the month.",
        prompt: "Match the month abbreviations to the words.",
      },
      {
        id: "ordinal-matching",
        type: "matching",
        dataKey: "ordinalEntries",
        title: "Match ordinals",
        shortDescription: "Match each ordinal number to the word.",
        prompt: "Match the ordinal numbers to the words.",
      },
      {
        id: "month-spelling",
        type: "type-answer",
        title: "Spell the month",
        shortDescription: "Type the month from the abbreviation.",
        prompt: "Look at the abbreviation and type the month.",
        answerLabel: "Month",
        answerPlaceholder: "e.g. January",
      },
      {
        id: "ordinal-spelling",
        type: "type-answer",
        dataKey: "ordinalEntries",
        title: "Spell the ordinal",
        shortDescription: "Type the ordinal word.",
        prompt: "Look at the ordinal number and type the word.",
        answerLabel: "Ordinal word",
        answerPlaceholder: "e.g. first",
      },
    ],
  },
  {
    id: "activities",
    level: "a1",
    order: 13,
    title: "Activities",
    shortDescription: "Practise everyday free-time activities.",
    textbookRef: "Vocabulary Bank 13",
    accent: "#72df9b",
    itemCount: 18,
    entries: [
      activityEntry("buying-clothes", "buying clothes", "In a clothes shop", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/buying-clothes.png`),
      activityEntry("camping", "camping", "Tent and campsite", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/camping.png`),
      activityEntry("cooking", "cooking", "Preparing food", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/cooking.png`),
      activityEntry("cycling", "cycling", "On a bike", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/cycling.png`),
      activityEntry("doing-yoga", "doing yoga", "Exercise on a mat", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/doing-yoga.png`),
      activityEntry("eating-out", "eating out", "Meal in a restaurant", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/eating-out.png`),
      activityEntry("flying", "flying", "Travelling by plane", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/flying.png`),
      activityEntry("going-for-a-walk", "going for a walk", "Walking outside", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/going-for-a-walk.png`),
      activityEntry("going-to-the-cinema", "going to the cinema", "Watching a film", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/going-to-the-cinema.png`),
      activityEntry("painting", "painting", "Making a picture with paint", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/painting.png`),
      activityEntry("reading", "reading", "With a book", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/reading.png`),
      activityEntry("running", "running", "Exercise in the street", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/running.png`),
      activityEntry("shopping", "shopping", "Buying things", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/shopping.png`),
      activityEntry("singing", "singing", "Using your voice for music", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/singing.png`),
      activityEntry("sleeping", "sleeping", "In bed", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/sleeping.png`),
      activityEntry("swimming", "swimming", "In a pool", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/swimming.png`),
      activityEntry("travelling", "travelling", "Going to another place", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/travelling.png`),
      activityEntry("watching-tv-series", "watching TV series", "Watching episodes on TV", `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/watching-tv-series.png`, ["watching tv series"]),
    ],
    activities: [
      {
        id: "activity-flashcards",
        type: "flashcards",
        title: "Activity flashcards",
        shortDescription: "Look at the picture, then reveal the activity.",
        prompt: "Look at the picture and say the activity before you flip.",
      },
      {
        id: "activity-matching",
        type: "matching",
        title: "Match activities",
        shortDescription: "Match each picture to the activity.",
        prompt: "Match the activity pictures to the words.",
      },
      {
        id: "activity-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the activity that matches the cue.",
        prompt: "Choose the correct activity.",
      },
      {
        id: "activity-spelling",
        type: "type-answer",
        title: "Spell the activity",
        shortDescription: "Type the activity from the picture.",
        prompt: "Look at the picture and type the activity.",
        answerLabel: "Activity",
        answerPlaceholder: "e.g. camping",
      },
    ],
  },
  {
    id: "clothes",
    level: "a1",
    order: 14,
    title: "Clothes",
    shortDescription: "Practise common clothes and accessories.",
    textbookRef: "Vocabulary Bank 14",
    accent: "#72df9b",
    itemCount: 16,
    entries: [
      clothesEntry("sweater", "sweater", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/sweater.png`),
      clothesEntry("t-shirt", "T-shirt", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/t-shirt.png`, ["t shirt", "tee shirt"]),
      clothesEntry("shirt", "shirt", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shirt.png`),
      clothesEntry("trousers", "trousers", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/trousers.png`),
      clothesEntry("jeans", "jeans", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/jeans.png`),
      clothesEntry("shorts", "shorts", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shorts.png`),
      clothesEntry("suit", "suit", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/suit.png`),
      clothesEntry("dress", "dress", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/dress.png`),
      clothesEntry("skirt", "skirt", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/skirt.png`),
      clothesEntry("coat", "coat", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/coat.png`),
      clothesEntry("jacket", "jacket", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/jacket.png`),
      clothesEntry("socks", "socks", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/socks.png`),
      clothesEntry("trainers", "trainers", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/trainers.png`, ["sneakers"]),
      clothesEntry("shoes", "shoes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shoes.png`),
      clothesEntry("hat", "hat", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/hat.png`),
      clothesEntry("cap", "cap", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/cap.png`),
    ],
    activities: [
      {
        id: "clothes-flashcards",
        type: "flashcards",
        title: "Clothes flashcards",
        shortDescription: "Look at the picture, then reveal the word.",
        prompt: "Look at the picture and say the clothes word before you flip.",
      },
      {
        id: "clothes-matching",
        type: "matching",
        title: "Match clothes",
        shortDescription: "Match each picture to the clothes word.",
        prompt: "Match the clothes pictures to the words.",
      },
      {
        id: "clothes-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the clothes word that matches the picture.",
        prompt: "Choose the correct clothes word.",
      },
      {
        id: "clothes-spelling",
        type: "type-answer",
        title: "Spell the clothes",
        shortDescription: "Type the clothes word from the picture.",
        prompt: "Look at the picture and type the clothes word.",
        answerLabel: "Clothes word",
        answerPlaceholder: "e.g. jacket",
      },
    ],
  },
  {
    id: "hotel-vocabulary",
    level: "a1",
    order: 15,
    title: "Hotel vocabulary",
    shortDescription: "Practise hotel room objects and useful places in a hotel.",
    textbookRef: "Vocabulary Bank 15",
    accent: "#8fb6ff",
    itemCount: 23,
    sceneImage: `${HOTEL_IMAGE_BASE}/hotel-room.png`,
    hotelSceneImage: `${HOTEL_IMAGE_BASE}/hotel.png`,
    entries: [
      hotelRoomEntry("cupboard", "a cupboard", 1, 53, 26, ["cupboard"]),
      hotelRoomEntry("shower", "a shower", 2, 25, 38, ["shower"]),
      hotelRoomEntry("bathroom", "the bathroom", 3, 18, 52, ["bathroom"]),
      hotelRoomEntry("light", "a light", 4, 81, 3, ["light"]),
      hotelRoomEntry("towel", "a towel", 5, 34, 51, ["towel"]),
      hotelRoomEntry("bath", "a bath", 6, 42, 58, ["bath"]),
      hotelRoomEntry("lamp", "a lamp", 7, 68, 45, ["lamp"]),
      hotelRoomEntry("table", "a table", 8, 13, 83, ["table"]),
      hotelRoomEntry("floor", "the floor", 9, 31, 78, ["floor"]),
      hotelRoomEntry("bed", "a bed", 10, 72, 63, ["bed"]),
      hotelRoomEntry("pillow", "a pillow", 11, 88, 48, ["pillow"]),
      hotelRoomEntry("remote-control", "a remote control", 12, 80, 73, ["remote control", "remote"]),
    ],
    hotelEntries: [
      hotelRoomEntry("swimming-pool", "a swimming pool", 1, 19, 16, ["swimming pool"]),
      hotelRoomEntry("spa", "a spa", 2, 75, 16, ["spa"]),
      hotelRoomEntry("toilets", "toilets", 3, 78, 55, ["toilets"]),
      hotelRoomEntry("restaurant", "a restaurant", 4, 24, 35, ["restaurant"]),
      hotelRoomEntry("bar", "a bar", 5, 66, 35, ["bar"]),
      hotelRoomEntry("lift", "a lift", 6, 47, 35, ["lift", "elevator"]),
      hotelRoomEntry("gym", "a gym", 7, 24, 55, ["gym"]),
      hotelRoomEntry("gift-shop", "a gift shop", 8, 18, 70, ["gift shop"]),
      hotelRoomEntry("reception", "Reception", 9, 60, 70, ["reception"]),
      hotelRoomEntry("garden", "a garden", 10, 89, 68, ["garden"]),
      hotelRoomEntry("car-park", "a car park", 11, 50, 91, ["car park", "parking lot"]),
    ],
    activities: [
      {
        id: "room-labels",
        type: "image-hotspot-match",
        title: "Match the room",
        shortDescription: "Click a number in the room and match it to the word.",
        prompt: "Click a numbered item, then choose the matching word.",
      },
      {
        id: "hotel-labels",
        type: "image-hotspot-match",
        dataKey: "hotelEntries",
        sceneImage: `${HOTEL_IMAGE_BASE}/hotel.png`,
        title: "Match the hotel",
        shortDescription: "Click a numbered hotel facility and match it to the word.",
        prompt: "Click a numbered place in the hotel, then choose the matching word.",
      },
      {
        id: "room-spelling",
        type: "image-hotspot-type-answer",
        title: "Name the room item",
        shortDescription: "Type the word for the highlighted room item.",
        prompt: "Look at the highlighted number and type the word.",
        answerLabel: "Room item",
        answerPlaceholder: "e.g. a lamp",
      },
      {
        id: "hotel-spelling",
        type: "image-hotspot-type-answer",
        dataKey: "hotelEntries",
        sceneImage: `${HOTEL_IMAGE_BASE}/hotel.png`,
        title: "Hotel spelling",
        shortDescription: "Type the word for the highlighted hotel facility.",
        prompt: "Look at the highlighted number and type the word.",
        answerLabel: "Hotel word",
        answerPlaceholder: "e.g. a restaurant",
      },
    ],
  },
];

function countryEntry(id, country, nationality, flagCode, extra = {}) {
  return {
    id,
    country,
    nationality,
    flagCode,
    flag4x3: `${FLAG_BASE}/4x3/${flagCode}.svg`,
    flag1x1: `${FLAG_BASE}/1x1/${flagCode}.svg`,
    ...extra,
  };
}

function objectEntry(
  id,
  term,
  visualLabel,
  spokenLabel,
  acceptedAnswers = [],
  article = null,
  image = null,
  extra = {}
) {
  return {
    id,
    term,
    visualLabel,
    spokenLabel,
    acceptedAnswers,
    article,
    image,
    ...extra,
  };
}

function colorEntry(id, term, colorHex, acceptedAnswers = []) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, null, {
    colorHex,
  });
}

function adjectiveEntry(id, term, opposite) {
  return objectEntry(id, term, term.toUpperCase(), term, [term], null, null, {
    opposite,
  });
}

function pluralEntry(id, singular, plural) {
  return {
    id,
    term: singular,
    singular,
    plural,
    visualLabel: singular.toUpperCase(),
    spokenLabel: singular,
    acceptedAnswers: [plural],
  };
}

function foodEntry(id, term, category, actionVerb, image = null, acceptedAnswers = []) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    category,
    actionVerb,
  });
}

function verbPhraseEntry(id, term, cueText, gapAnswers = [], image = null, acceptedAnswers = []) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    cueText,
    gapAnswers,
  });
}

function activityEntry(id, term, cueText, image = null, acceptedAnswers = []) {
  return objectEntry(id, term, cueText, term, [term, ...acceptedAnswers], null, image, {
    cueText,
  });
}

function clothesEntry(id, term, image = null, acceptedAnswers = []) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image);
}

function jobEntry(id, term, image = null, acceptedAnswers = [], imagePrompt = "") {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    imagePrompt,
  });
}

function placeEntry(id, term, acceptedAnswers = [], imagePrompt = "", image = null) {
  return objectEntry(id, term, term.toUpperCase(), term, [term], null, image, {
    cueText: (acceptedAnswers[0] || term).toUpperCase(),
    gapCueText: makeGapCue(term),
    imagePrompt,
  });
}

function routineEntry(id, term, cueText, timeOfDay, gapAnswers = [], imagePrompt = "", image = null) {
  return objectEntry(id, term, term.toUpperCase(), term, [term], null, image, {
    cueText,
    gapAnswers,
    imagePrompt,
    timeOfDay,
  });
}

function monthEntry(id, term, abbreviation) {
  return objectEntry(id, term, abbreviation, term, [term], null, null, {
    cueText: abbreviation,
  });
}

function ordinalEntry(id, numeral, term, acceptedAnswers = []) {
  return objectEntry(id, term, numeral, term, [term, ...acceptedAnswers], null, null, {
    cueText: numeral,
  });
}

function hotelRoomEntry(id, term, number, x, y, acceptedAnswers = []) {
  return objectEntry(id, term, String(number), term, [term, ...acceptedAnswers], null, null, {
    hotspotNumber: number,
    hotspotX: x,
    hotspotY: y,
  });
}

function makeGapCue(phrase) {
  return phrase
    .split(" ")
    .map((word) => "_".repeat(Math.max(2, Math.min(word.length, 8))))
    .join(" ");
}

function languageEntry(id, phrase, speaker, gappedPhrase = "", gapAnswers = [], image = null) {
  return {
    id,
    phrase,
    speaker,
    gappedPhrase,
    gapAnswers,
    image,
  };
}

function numberToWordsUpTo100(value) {
  const smallNumbers = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (value < 20) return smallNumbers[value];
  if (value === 100) return "a hundred";
  const tensWord = tens[Math.floor(value / 10)];
  const units = value % 10;
  return units ? `${tensWord}-${smallNumbers[units]}` : tensWord;
}

function makeA2NumberEntry(value) {
  const term = numberToWordsUpTo100(value);
  const acceptedAnswers = [];
  if (term.includes("-")) acceptedAnswers.push(term.replace(/-/g, " "));
  if (value === 0) acceptedAnswers.push("oh");
  if (value === 100) acceptedAnswers.push("one hundred", "hundred");
  return {
    id: `a2-number-${value}`,
    numeral: String(value),
    term,
    acceptedAnswers,
  };
}

const a1NumberEntries = HUB_VOCAB_THEMES.find((theme) => theme.id === "numbers")?.entries || [];
const a2NumberEntries = [
  ...a1NumberEntries
    .filter((entry) => Number(entry.numeral) <= 20)
    .map((entry) => ({
      ...entry,
      acceptedAnswers: [...(entry.acceptedAnswers || []), ...(entry.also ? [entry.also] : [])],
    })),
  ...Array.from({ length: 80 }, (_, index) => makeA2NumberEntry(index + 21)),
];
const a2NumberByValue = new Map(a2NumberEntries.map((entry) => [Number(entry.numeral), entry]));
const teenTensPairs = [[13, 30], [14, 40], [15, 50], [16, 60], [17, 70], [18, 80], [19, 90]];
const a2NumberContrastEntries = teenTensPairs.flatMap((pair, pairIndex) => {
  const companionPair = teenTensPairs[(pairIndex + 1) % teenTensPairs.length];
  const options = [...pair, ...companionPair].map((value) => a2NumberByValue.get(value)?.term).filter(Boolean);
  return pair.map((value) => ({
    ...a2NumberByValue.get(value),
    id: `a2-contrast-${value}`,
    options,
  }));
}).concat([
  {
    id: "a2-phone-zero",
    numeral: "Phone: 0",
    term: "oh",
    acceptedAnswers: ["zero"],
    options: ["oh", "zero", "double zero", "o'clock"],
  },
  {
    id: "a2-phone-double-four",
    numeral: "Phone: 44",
    term: "double four",
    acceptedAnswers: ["four four"],
    options: ["double four", "forty-four", "fourteen", "four hundred"],
  },
]);

const a2DayEntries = [
  ["monday", "Monday", "MON"],
  ["tuesday", "Tuesday", "TUE"],
  ["wednesday", "Wednesday", "WED"],
  ["thursday", "Thursday", "THU"],
  ["friday", "Friday", "FRI"],
  ["saturday", "Saturday", "SAT"],
  ["sunday", "Sunday", "SUN"],
].map(([id, term, cueText], index) => ({
  id,
  term,
  cueText,
  sequenceOrder: index + 1,
}));

const a2DayContextEntries = [
  { id: "day-context-1", sentence: "What day is it today? It's ____.", answer: "Friday", acceptedAnswers: ["Friday"], options: ["Friday", "weekend", "tomorrow", "later"] },
  { id: "day-context-2", sentence: "Have a good ____!", answer: "weekend", acceptedAnswers: ["weekend"], options: ["weekend", "weekday", "Friday", "Monday"] },
  { id: "day-context-3", sentence: "Have a good weekend! — You ____.", answer: "too", acceptedAnswers: ["too"], options: ["too", "later", "tomorrow", "today"] },
  { id: "day-context-4", sentence: "I have to go now. See you ____.", answer: "later", acceptedAnswers: ["later"], options: ["later", "weekday", "weekend", "Friday"] },
  { id: "day-context-5", sentence: "It's late. See you ____.", answer: "tomorrow", acceptedAnswers: ["tomorrow"], options: ["tomorrow", "yesterday", "weekend", "Monday"] },
  { id: "day-context-6", sentence: "Have a good Sunday. See you on ____.", answer: "Monday", acceptedAnswers: ["Monday"], options: ["Monday", "tomorrow", "weekend", "weekday"] },
  { id: "day-context-7", sentence: "Saturday and Sunday are the ____.", answer: "weekend", acceptedAnswers: ["weekend"], options: ["weekend", "weekday", "week", "today"] },
  { id: "day-context-8", sentence: "Wednesday is a ____.", answer: "weekday", acceptedAnswers: ["weekday"], options: ["weekday", "weekend", "week", "day off"] },
];

const a2HighNumberEntries = [
  { id: "a2-high-105", numeral: "105", term: "a hundred and five", acceptedAnswers: ["one hundred and five", "a hundred five", "one hundred five"] },
  { id: "a2-high-200", numeral: "200", term: "two hundred", acceptedAnswers: [] },
  { id: "a2-high-350", numeral: "350", term: "three hundred and fifty", acceptedAnswers: ["three hundred fifty"] },
  { id: "a2-high-875", numeral: "875", term: "eight hundred and seventy-five", acceptedAnswers: ["eight hundred and seventy five", "eight hundred seventy-five", "eight hundred seventy five"] },
  { id: "a2-high-1000", numeral: "1,000", term: "a thousand", acceptedAnswers: ["one thousand"] },
  { id: "a2-high-1500", numeral: "1,500", term: "one thousand five hundred", acceptedAnswers: [] },
  { id: "a2-high-2012", numeral: "2,012", term: "two thousand and twelve", acceptedAnswers: ["two thousand twelve"] },
  { id: "a2-high-5420", numeral: "5,420", term: "five thousand four hundred and twenty", acceptedAnswers: ["five thousand four hundred twenty"] },
  { id: "a2-high-25000", numeral: "25,000", term: "twenty-five thousand", acceptedAnswers: ["twenty five thousand"] },
  { id: "a2-high-100000", numeral: "100,000", term: "a hundred thousand", acceptedAnswers: ["one hundred thousand"] },
  { id: "a2-high-1000000", numeral: "1,000,000", term: "a million", acceptedAnswers: ["one million"] },
  { id: "a2-high-2300000", numeral: "2,300,000", term: "two million three hundred thousand", acceptedAnswers: [] },
];

const a2ContinentEntries = [
  ["africa", "Africa", "African"],
  ["asia", "Asia", "Asian"],
  ["australia", "Australia", "Australian"],
  ["europe", "Europe", "European"],
  ["north-america", "North America", "North American"],
  ["south-america", "South America", "South American"],
].map(([id, continent, adjective]) => ({
  id,
  continent,
  adjective,
  cueText: continent,
  term: adjective,
  acceptedAnswers: [adjective],
}));

const a2CountryEntries = [
  countryEntry("a2-spain", "Spain", "Spanish", "es", { continentId: "europe" }),
  countryEntry("a2-poland", "Poland", "Polish", "pl", { continentId: "europe" }),
  countryEntry("a2-england", "England", "English", "gb-eng", { continentId: "europe" }),
  countryEntry("a2-turkey", "Turkey", "Turkish", "tr", { continentId: "europe" }),
  countryEntry("a2-scotland", "Scotland", "Scottish", "gb-sct", { continentId: "europe" }),
  countryEntry("a2-ireland", "Ireland", "Irish", "ie", { continentId: "europe" }),
  countryEntry("a2-mexico", "Mexico", "Mexican", "mx", { continentId: "north-america" }),
  countryEntry("a2-united-states", "the United States / the USA", "American", "us", { continentId: "north-america" }),
  countryEntry("a2-germany", "Germany", "German", "de", { continentId: "europe" }),
  countryEntry("a2-brazil", "Brazil", "Brazilian", "br", { continentId: "south-america" }),
  countryEntry("a2-hungary", "Hungary", "Hungarian", "hu", { continentId: "europe" }),
  countryEntry("a2-egypt", "Egypt", "Egyptian", "eg", { continentId: "africa" }),
  countryEntry("a2-italy", "Italy", "Italian", "it", { continentId: "europe" }),
  countryEntry("a2-argentina", "Argentina", "Argentinian", "ar", { continentId: "south-america", acceptedAnswers: ["Argentine", "Argentinean"] }),
  countryEntry("a2-russia", "Russia", "Russian", "ru", { continentId: "europe" }),
  countryEntry("a2-japan", "Japan", "Japanese", "jp", { continentId: "asia" }),
  countryEntry("a2-china", "China", "Chinese", "cn", { continentId: "asia" }),
  countryEntry("a2-france", "France", "French", "fr", { continentId: "europe" }),
  countryEntry("a2-switzerland", "Switzerland", "Swiss", "ch", { continentId: "europe" }),
  countryEntry("a2-czech-republic", "the Czech Republic", "Czech", "cz", { continentId: "europe" }),
  countryEntry("a2-uk", "the UK", "British", "gb", { continentId: "europe", supplementary: true }),
];
const a2ContinentSortEntries = [
  ...a2CountryEntries,
  { id: "a2-australia-sort", country: "Australia", term: "Australia", continentId: "australia" },
];

const A2_CLASSROOM_LANGUAGE_IMAGE_BASE = "/images/vocab/classroom-language-a2";
const A2_THINGS_IMAGE_BASE = "/images/vocab/textbook-things-a2";

function a2ClassroomPhrase(id, phrase, speaker, { image = null, pendingImage = null } = {}) {
  return { id, term: phrase, phrase, speaker, image, pendingImage };
}

const a2ClassroomPhraseEntries = [
  a2ClassroomPhrase("a2-class-open-books", "Open your books, please.", "teacher", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/02-open-your-books.png` }),
  a2ClassroomPhrase("a2-class-page-84", "Go to page 84.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/01-go-to-page-84.png` }),
  a2ClassroomPhrase("a2-class-exercise-a", "Do exercise a.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/02-do-exercise-a.png` }),
  a2ClassroomPhrase("a2-class-read-text", "Read the text.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/03-read-the-text.png` }),
  a2ClassroomPhrase("a2-class-look-board", "Look at the board.", "teacher", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/01-look-at-the-board.png` }),
  a2ClassroomPhrase("a2-class-close-door", "Close the door.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/04-close-the-door.png` }),
  a2ClassroomPhrase("a2-class-work-pairs", "Work in pairs (or groups).", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/05-work-in-pairs-or-groups.png` }),
  a2ClassroomPhrase("a2-class-answer-questions", "Answer the questions.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/06-answer-the-questions.png` }),
  a2ClassroomPhrase("a2-class-listen-repeat", "Listen and repeat.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/07-listen-and-repeat.png` }),
  a2ClassroomPhrase("a2-class-stand-up", "Stand up.", "teacher", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/05-stand-up-please.png` }),
  a2ClassroomPhrase("a2-class-sit-down", "Sit down.", "teacher", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/06-sit-down.png` }),
  a2ClassroomPhrase("a2-class-phone-off", "Turn off your phone.", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/08-turn-off-your-phone.png` }),
  a2ClassroomPhrase("a2-class-stop-talking", "Please stop talking!", "teacher", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/09-please-stop-talking.png` }),
  a2ClassroomPhrase("a2-class-repeat-that", "Sorry, can you repeat that, please?", "student", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/08-repeat-that-please.png` }),
  a2ClassroomPhrase("a2-class-late", "Sorry I'm late.", "student", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/12-sorry-im-late.png` }),
  a2ClassroomPhrase("a2-class-understand", "I don't understand.", "student", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/10-i-dont-understand.png` }),
  a2ClassroomPhrase("a2-class-copy", "Can I have a copy, please?", "student", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/10-can-i-have-a-copy.png` }),
  a2ClassroomPhrase("a2-class-spell", "How do you spell it?", "student", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/07-how-do-you-spell-it.png` }),
  a2ClassroomPhrase("a2-class-dont-know", "I don't know.", "student", { image: `${CLASSROOM_LANGUAGE_IMAGE_BASE}/11-i-dont-know.png` }),
  a2ClassroomPhrase("a2-class-gato", "How do you say gato in English?", "student", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/11-gato-in-english.png` }),
  a2ClassroomPhrase("a2-class-help", "Can you help me, please?", "student", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/12-can-you-help-me.png` }),
  a2ClassroomPhrase("a2-class-what-page", "What page is it?", "student", { image: `${A2_CLASSROOM_LANGUAGE_IMAGE_BASE}/13-what-page-is-it.png` }),
];
const a2ClassroomPictureEntries = a2ClassroomPhraseEntries.filter((entry) => entry.image);
const a2ClassroomGapEntries = [
  { id: "a2-class-gap-off", sentence: "Turn ____ your phone.", answer: "off", acceptedAnswers: ["off"], options: ["off", "on", "out", "up"] },
  { id: "a2-class-gap-in", sentence: "Work ____ pairs.", answer: "in", acceptedAnswers: ["in"], options: ["in", "on", "at", "with"] },
  { id: "a2-class-gap-help", sentence: "Can you ____ me, please?", answer: "help", acceptedAnswers: ["help"], options: ["help", "spell", "repeat", "answer"] },
  { id: "a2-class-gap-spell", sentence: "How do you ____ it?", answer: "spell", acceptedAnswers: ["spell"], options: ["spell", "say", "read", "talk"] },
  { id: "a2-class-gap-page", sentence: "What ____ is it?", answer: "page", acceptedAnswers: ["page"], options: ["page", "copy", "text", "exercise"] },
  { id: "a2-class-gap-late", sentence: "Sorry I'm ____.", answer: "late", acceptedAnswers: ["late"], options: ["late", "sorry", "lost", "finished"] },
  { id: "a2-class-gap-talking", sentence: "Please stop ____!", answer: "talking", acceptedAnswers: ["talking"], options: ["talking", "talk", "speaking", "speak"] },
  { id: "a2-class-gap-copy", sentence: "Can I have a ____, please?", answer: "copy", acceptedAnswers: ["copy"], options: ["copy", "page", "pair", "text"] },
  { id: "a2-class-gap-repeat", sentence: "Listen and ____.", answer: "repeat", acceptedAnswers: ["repeat"], options: ["repeat", "answer", "spell", "talk"] },
  { id: "a2-class-gap-questions", sentence: "Answer the ____.", answer: "questions", acceptedAnswers: ["questions"], options: ["questions", "exercise", "board", "groups"] },
  { id: "a2-class-gap-please-first", sentence: "____ open your books.", answer: "Please", acceptedAnswers: ["please"], options: ["Please", "Sorry", "Can", "What"] },
  { id: "a2-class-gap-please-last", sentence: "Open your books, ____.", answer: "please", acceptedAnswers: ["please"], options: ["please", "sorry", "thanks", "too"] },
];
const a2ClassroomSituationEntries = [
  { id: "a2-class-situation-gato", sentence: "You don't know the English word for gato.", answer: "How do you say gato in English?", acceptedAnswers: ["How do you say gato in English?"], options: ["How do you say gato in English?", "Can you repeat that, please?", "What page is it?", "Sorry I'm late."] },
  { id: "a2-class-situation-late", sentence: "You arrive ten minutes after the lesson starts.", answer: "Sorry I'm late.", acceptedAnswers: ["Sorry I'm late."], options: ["Sorry I'm late.", "I don't know.", "Can I have a copy, please?", "What page is it?"] },
  { id: "a2-class-situation-repeat", sentence: "You didn't hear the teacher clearly.", answer: "Sorry, can you repeat that, please?", acceptedAnswers: ["Sorry, can you repeat that, please?"], options: ["Sorry, can you repeat that, please?", "How do you spell it?", "Can you help me, please?", "I don't know."] },
  { id: "a2-class-situation-help", sentence: "You need help with the exercise.", answer: "Can you help me, please?", acceptedAnswers: ["Can you help me, please?"], options: ["Can you help me, please?", "What page is it?", "Sorry I'm late.", "I don't understand."] },
  { id: "a2-class-situation-page", sentence: "You don't know where to look in your book.", answer: "What page is it?", acceptedAnswers: ["What page is it?"], options: ["What page is it?", "Can I have a copy, please?", "How do you spell it?", "You too."] },
  { id: "a2-class-situation-copy", sentence: "You need the worksheet but you don't have one.", answer: "Can I have a copy, please?", acceptedAnswers: ["Can I have a copy, please?"], options: ["Can I have a copy, please?", "How do you say it in English?", "What page is it?", "Sorry I'm late."] },
];

function a2ThingEntry(id, term, article, { image = null, pendingImage = null, acceptedAnswers = [], displayTerm = null } = {}) {
  const grammarNumber = article ? "singular" : "plural";
  return {
    id,
    term,
    article,
    grammarNumber,
    displayTerm: displayTerm || (article ? `${article} ${term}` : term),
    acceptedAnswers,
    image,
    pendingImage,
  };
}

const a2ThingEntries = [
  a2ThingEntry("a2-thing-bag", "bag", "a", { image: `${CLASSROOM_IMAGE_BASE}/bag.png`, acceptedAnswers: ["a bag"] }),
  a2ThingEntry("a2-thing-charger", "charger", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/charger.png`, acceptedAnswers: ["a charger", "phone charger", "a phone charger"] }),
  a2ThingEntry("a2-thing-coin", "coin", "a", { image: `${A2_THINGS_IMAGE_BASE}/coin.png`, acceptedAnswers: ["a coin"] }),
  a2ThingEntry("a2-thing-credit-card", "credit card", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/credit-card.png`, displayTerm: "a credit card / debit card", acceptedAnswers: ["a credit card", "debit card", "a debit card"] }),
  a2ThingEntry("a2-thing-diary", "diary", "a", { image: `${A2_THINGS_IMAGE_BASE}/diary.png`, acceptedAnswers: ["a diary"] }),
  a2ThingEntry("a2-thing-dictionary", "dictionary", "a", { image: `${CLASSROOM_IMAGE_BASE}/book.png`, acceptedAnswers: ["a dictionary"] }),
  a2ThingEntry("a2-thing-file", "file", "a", { image: `${A2_THINGS_IMAGE_BASE}/file.png`, acceptedAnswers: ["a file"] }),
  a2ThingEntry("a2-thing-glasses", "glasses", null, { image: `${SMALL_THINGS_IMAGE_BASE}/glasses.png`, acceptedAnswers: ["a pair of glasses"] }),
  a2ThingEntry("a2-thing-headphones", "headphones", null, { image: `${A2_THINGS_IMAGE_BASE}/headphones.png`, acceptedAnswers: ["a pair of headphones"] }),
  a2ThingEntry("a2-thing-identity-card", "identity card", "an", { image: `${SMALL_THINGS_IMAGE_BASE}/ID-card.png`, displayTerm: "an identity card", acceptedAnswers: ["an identity card", "ID card", "an ID card"] }),
  a2ThingEntry("a2-thing-key", "key", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/key.png`, acceptedAnswers: ["a key"] }),
  a2ThingEntry("a2-thing-lamp", "lamp", "a", { image: `${A2_THINGS_IMAGE_BASE}/lamp.png`, acceptedAnswers: ["a lamp"] }),
  a2ThingEntry("a2-thing-laptop", "laptop", "a", { image: `${CLASSROOM_IMAGE_BASE}/laptop.png`, acceptedAnswers: ["a laptop"] }),
  a2ThingEntry("a2-thing-magazine", "magazine", "a", { image: `${A2_THINGS_IMAGE_BASE}/magazine.png`, acceptedAnswers: ["a magazine"] }),
  a2ThingEntry("a2-thing-newspaper", "newspaper", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/newspaper.png`, acceptedAnswers: ["a newspaper"] }),
  a2ThingEntry("a2-thing-notebook", "notebook", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/notebook.png`, acceptedAnswers: ["a notebook"] }),
  a2ThingEntry("a2-thing-pen", "pen", "a", { image: `${CLASSROOM_IMAGE_BASE}/pen.png`, acceptedAnswers: ["a pen"] }),
  a2ThingEntry("a2-thing-pencil", "pencil", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/pencil.png`, acceptedAnswers: ["a pencil"] }),
  a2ThingEntry("a2-thing-phone", "mobile phone", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/mobile.png`, displayTerm: "a (mobile) phone", acceptedAnswers: ["a mobile phone", "mobile phone", "phone", "a phone"] }),
  a2ThingEntry("a2-thing-photo", "photo", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/photo.png`, acceptedAnswers: ["a photo", "photograph", "a photograph"] }),
  a2ThingEntry("a2-thing-paper", "piece of paper", "a", { image: `${CLASSROOM_IMAGE_BASE}/piece-of-paper.png`, acceptedAnswers: ["a piece of paper", "piece of paper", "paper"] }),
  a2ThingEntry("a2-thing-purse", "purse", "a", { image: `${A2_THINGS_IMAGE_BASE}/purse.png`, acceptedAnswers: ["a purse"] }),
  a2ThingEntry("a2-thing-scissors", "scissors", null, { image: `${A2_THINGS_IMAGE_BASE}/scissors.png`, acceptedAnswers: ["a pair of scissors"] }),
  a2ThingEntry("a2-thing-sunglasses", "sunglasses", null, { image: `${A2_THINGS_IMAGE_BASE}/sunglasses.png`, acceptedAnswers: ["a pair of sunglasses"] }),
  a2ThingEntry("a2-thing-tablet", "tablet", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/tablet.png`, acceptedAnswers: ["a tablet"] }),
  a2ThingEntry("a2-thing-ticket", "ticket", "a", { image: `${A2_THINGS_IMAGE_BASE}/ticket.png`, acceptedAnswers: ["a ticket"] }),
  a2ThingEntry("a2-thing-tissue", "tissue", "a", { image: `${A2_THINGS_IMAGE_BASE}/tissue.png`, acceptedAnswers: ["a tissue"] }),
  a2ThingEntry("a2-thing-umbrella", "umbrella", "an", { image: `${SMALL_THINGS_IMAGE_BASE}/umbrella.png`, acceptedAnswers: ["an umbrella"] }),
  a2ThingEntry("a2-thing-wallet", "wallet", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/wallet.png`, acceptedAnswers: ["a wallet"] }),
  a2ThingEntry("a2-thing-watch", "watch", "a", { image: `${SMALL_THINGS_IMAGE_BASE}/watch.png`, acceptedAnswers: ["a watch"] }),
];
const a2ThingPictureEntries = a2ThingEntries.filter((entry) => entry.image);
const a2ThingArticleEntries = a2ThingEntries.map((entry) => ({
  ...entry,
  id: `${entry.id}-article`,
  sentence: `____ ${entry.term}`,
  answer: entry.article || "—",
  acceptedAnswers: entry.article ? [entry.article] : ["—", "-", "no article"],
  options: ["a", "an", "—"],
}));
const a2ThingContextEntries = [
  { id: "a2-thing-context-charger", sentence: "My phone battery is at 2%. I need my ____.", answer: "charger", acceptedAnswers: ["charger", "phone charger"], options: ["charger", "ticket", "lamp", "file"] },
  { id: "a2-thing-context-coin", sentence: "You need a one-euro ____ for this machine.", answer: "coin", acceptedAnswers: ["coin"], options: ["coin", "key", "tissue", "watch"] },
  { id: "a2-thing-context-card", sentence: "I don't have any cash, so I'll pay by ____.", answer: "credit card", acceptedAnswers: ["credit card", "debit card", "card"], options: ["credit card", "diary", "ticket", "coin"] },
  { id: "a2-thing-context-diary", sentence: "I write all my appointments in my ____.", answer: "diary", acceptedAnswers: ["diary"], options: ["diary", "dictionary", "magazine", "file"] },
  { id: "a2-thing-context-dictionary", sentence: "I don't know this word. I'll look it up in the ____.", answer: "dictionary", acceptedAnswers: ["dictionary"], options: ["dictionary", "diary", "newspaper", "notebook"] },
  { id: "a2-thing-context-file", sentence: "Please put these documents in the blue ____.", answer: "file", acceptedAnswers: ["file"], options: ["file", "bag", "notebook", "magazine"] },
  { id: "a2-thing-context-headphones", sentence: "I use my ____ to listen to music without disturbing anyone.", answer: "headphones", acceptedAnswers: ["headphones"], options: ["headphones", "glasses", "sunglasses", "charger"] },
  { id: "a2-thing-context-key", sentence: "I can't open the front door. I can't find my ____.", answer: "key", acceptedAnswers: ["key"], options: ["key", "coin", "ticket", "watch"] },
  { id: "a2-thing-context-lamp", sentence: "It's dark on my desk, so I'll turn on the ____.", answer: "lamp", acceptedAnswers: ["lamp"], options: ["lamp", "laptop", "phone", "charger"] },
  { id: "a2-thing-context-magazine", sentence: "This monthly ____ has articles about fashion and travel.", answer: "magazine", acceptedAnswers: ["magazine"], options: ["magazine", "newspaper", "dictionary", "diary"] },
  { id: "a2-thing-context-newspaper", sentence: "My grandfather reads the ____ every morning to follow the news.", answer: "newspaper", acceptedAnswers: ["newspaper"], options: ["newspaper", "magazine", "notebook", "dictionary"] },
  { id: "a2-thing-context-notebook", sentence: "I write my class notes in a ____.", answer: "notebook", acceptedAnswers: ["notebook"], options: ["notebook", "diary", "file", "newspaper"] },
  { id: "a2-thing-context-pencil", sentence: "Use a ____ so you can erase your answer if it's wrong.", answer: "pencil", acceptedAnswers: ["pencil"], options: ["pencil", "pen", "scissors", "tissue"] },
  { id: "a2-thing-context-photo", sentence: "This ____ shows my family on holiday last summer.", answer: "photo", acceptedAnswers: ["photo", "photograph"], options: ["photo", "identity card", "magazine", "ticket"] },
  { id: "a2-thing-context-purse", sentence: "She keeps her coins and cards in a small ____.", answer: "purse", acceptedAnswers: ["purse"], options: ["purse", "file", "bag", "diary"] },
  { id: "a2-thing-context-scissors", sentence: "Can I borrow your ____ to cut this paper?", answer: "scissors", acceptedAnswers: ["scissors"], options: ["scissors", "glasses", "pencil", "key"] },
  { id: "a2-thing-context-sunglasses", sentence: "The sun is very bright. Where are my ____?", answer: "sunglasses", acceptedAnswers: ["sunglasses"], options: ["sunglasses", "glasses", "headphones", "scissors"] },
  { id: "a2-thing-context-ticket", sentence: "You need a ____ before you get on the train.", answer: "ticket", acceptedAnswers: ["ticket"], options: ["ticket", "identity card", "coin", "credit card"] },
  { id: "a2-thing-context-tissue", sentence: "I need a ____ because I have to blow my nose.", answer: "tissue", acceptedAnswers: ["tissue"], options: ["tissue", "piece of paper", "file", "ticket"] },
  { id: "a2-thing-context-umbrella", sentence: "It's going to rain, so take an ____.", answer: "umbrella", acceptedAnswers: ["umbrella"], options: ["umbrella", "lamp", "bag", "magazine"] },
];

const a2OppositePairDefinitions = [
  ["beautiful-ugly", "beautiful", "ugly"],
  ["big-small", "big", "small"],
  ["cheap-expensive", "cheap", "expensive"],
  ["clean-dirty", "clean", "dirty"],
  ["easy-difficult", "easy", "difficult"],
  ["fast-slow", "fast", "slow"],
  ["full-empty", "full", "empty"],
  ["good-bad", "good", "bad"],
  ["high-low", "high", "low"],
  ["hot-cold", "hot", "cold"],
  ["light-dark", "light", "dark"],
  ["long-short", "long", "short", "long (length)", "short (length)"],
  ["old-new", "old", "new", "old thing", "new thing"],
  ["old-young", "old", "young", "old person", "young person"],
  ["rich-poor", "rich", "poor"],
  ["right-left", "right", "left", "right direction", "left direction"],
  ["right-wrong", "right", "wrong", "right answer", "wrong answer"],
  ["safe-dangerous", "safe", "dangerous"],
  ["same-different", "the same", "different"],
  ["strong-weak", "strong", "weak"],
  ["tall-short", "tall", "short", "tall person", "short person"],
];
const a2OppositeEntriesWithoutOptions = a2OppositePairDefinitions.flatMap(
  ([id, left, right, leftCue = left, rightCue = right]) => [
    { id: `a2-adj-${id}-left`, term: left, cueText: leftCue, opposite: right, acceptedAnswers: [right] },
    { id: `a2-adj-${id}-right`, term: right, cueText: rightCue, opposite: left, acceptedAnswers: [left] },
  ]
);
const a2OppositeVocabulary = [...new Set(a2OppositeEntriesWithoutOptions.map((entry) => entry.opposite))];
const a2OppositeEntries = a2OppositeEntriesWithoutOptions.map((entry, index) => {
  const distractors = Array.from(
    { length: a2OppositeVocabulary.length },
    (_, offset) => a2OppositeVocabulary[(index + offset + 5) % a2OppositeVocabulary.length]
  ).filter((word) => word !== entry.opposite && word !== entry.term).slice(0, 3);
  return { ...entry, options: [entry.opposite, ...distractors] };
});
const a2OppositeFlashcardEntries = a2OppositePairDefinitions.map(
  ([id, left, right, leftCue = left]) => ({
    id: `a2-adj-card-${id}`,
    term: right,
    cueText: leftCue,
    displayTerm: right,
    acceptedAnswers: [right],
  })
);
const a2DescriptiveContextEntries = [
  { id: "a2-description-empty", sentence: "There is no water in the bottle. It's ____.", answer: "empty", acceptedAnswers: ["empty"], options: ["empty", "full", "clean", "light"] },
  { id: "a2-description-full", sentence: "You can't put another book in this bag. It's ____.", answer: "full", acceptedAnswers: ["full"], options: ["full", "empty", "open", "weak"] },
  { id: "a2-description-high", sentence: "That shelf is two metres above the floor. It's very ____.", answer: "high", acceptedAnswers: ["high"], options: ["high", "low", "long", "tall"] },
  { id: "a2-description-low", sentence: "The table is only thirty centimetres above the floor. It's very ____.", answer: "low", acceptedAnswers: ["low"], options: ["low", "high", "short", "small"] },
  { id: "a2-description-light", sentence: "This suitcase only weighs two kilos. It's ____.", answer: "light", acceptedAnswers: ["light"], options: ["light", "dark", "full", "strong"] },
  { id: "a2-description-dark", sentence: "I can't see anything in this room. It's completely ____.", answer: "dark", acceptedAnswers: ["dark"], options: ["dark", "light", "dirty", "empty"] },
  { id: "a2-description-same", sentence: "These two T-shirts have identical colours and designs. They're the ____.", answer: "same", acceptedAnswers: ["same", "the same"], options: ["same", "different", "right", "new"] },
  { id: "a2-description-different", sentence: "One key opens the front door and the other opens the car. They're ____.", answer: "different", acceptedAnswers: ["different"], options: ["different", "the same", "wrong", "old"] },
  { id: "a2-description-right", sentence: "Twelve plus eight is twenty. That answer is ____.", answer: "right", acceptedAnswers: ["right", "correct"], options: ["right", "wrong", "left", "easy"] },
  { id: "a2-description-wrong", sentence: "The capital of France is London. That answer is ____.", answer: "wrong", acceptedAnswers: ["wrong", "incorrect"], options: ["wrong", "right", "different", "difficult"] },
  { id: "a2-description-safe", sentence: "Children can cross here because the traffic lights are red. It's ____.", answer: "safe", acceptedAnswers: ["safe"], options: ["safe", "dangerous", "slow", "low"] },
  { id: "a2-description-dangerous", sentence: "The ice is very thin. Don't walk on it — it's ____.", answer: "dangerous", acceptedAnswers: ["dangerous"], options: ["dangerous", "safe", "weak", "cold"] },
  { id: "a2-description-strong", sentence: "Maya can lift the heavy table by herself. She's very ____.", answer: "strong", acceptedAnswers: ["strong"], options: ["strong", "weak", "rich", "tall"] },
  { id: "a2-description-weak", sentence: "After being ill, Leo can't lift this small box. He feels ____.", answer: "weak", acceptedAnswers: ["weak"], options: ["weak", "strong", "poor", "short"] },
  { id: "a2-description-cheap", sentence: "The meal only costs three euros. It's very ____.", answer: "cheap", acceptedAnswers: ["cheap"], options: ["cheap", "expensive", "bad", "small"] },
  { id: "a2-description-expensive", sentence: "This watch costs five thousand euros. It's very ____.", answer: "expensive", acceptedAnswers: ["expensive"], options: ["expensive", "cheap", "beautiful", "new"] },
];
const a2OpinionEntries = [
  { id: "a2-opinion-good", term: "good", opinion: "positive" },
  { id: "a2-opinion-nice", term: "nice", opinion: "positive" },
  { id: "a2-opinion-great", term: "great", opinion: "positive" },
  { id: "a2-opinion-fantastic", term: "fantastic", opinion: "positive" },
  { id: "a2-opinion-bad", term: "bad", opinion: "negative" },
  { id: "a2-opinion-awful", term: "awful", opinion: "negative" },
  { id: "a2-opinion-terrible", term: "terrible", opinion: "negative" },
];
const a2OpinionContextEntries = [
  { id: "a2-opinion-hotel", sentence: "The hotel was ____. I absolutely loved it.", answer: "fantastic", acceptedAnswers: ["fantastic"], options: ["fantastic", "awful", "dangerous", "empty"] },
  { id: "a2-opinion-film", sentence: "The film was ____. We left after twenty minutes.", answer: "terrible", acceptedAnswers: ["terrible"], options: ["terrible", "great", "safe", "rich"] },
  { id: "a2-opinion-meal", sentence: "The meal was ____. I want to eat there again.", answer: "great", acceptedAnswers: ["great"], options: ["great", "awful", "weak", "dirty"] },
  { id: "a2-opinion-room", sentence: "Our room was ____. It was dirty and very noisy.", answer: "awful", acceptedAnswers: ["awful"], options: ["awful", "nice", "fantastic", "safe"] },
  { id: "a2-opinion-teacher", sentence: "Our new teacher is ____. She's friendly and helpful.", answer: "nice", acceptedAnswers: ["nice"], options: ["nice", "terrible", "empty", "poor"] },
  { id: "a2-opinion-weather", sentence: "The weather was ____. It rained every day.", answer: "bad", acceptedAnswers: ["bad", "awful", "terrible"], options: ["bad", "awful", "terrible", "good"] },
];

const A2_VERB_PHRASES_IMAGE_BASE = "/images/vocab/verb-phrases-a2";
function a2VerbPhrase(id, term, cueText, verb, complement, { image = null, pendingImage = null, acceptedAnswers = [] } = {}) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    cueText,
    gapAnswers: [verb],
    verb,
    complement,
    pendingImage,
  });
}
const a2VerbPhraseEntries = [
  a2VerbPhrase("a2-verb-want-coffee", "want a coffee", "____ a coffee", "want", "a coffee", { image: `${COMMON_VERB_PHRASES_IMAGE_BASE}/want-coffee.png` }),
  a2VerbPhrase("a2-verb-work-office", "work in an office", "____ in an office", "work", "in an office", { image: `${TEXTBOOK_WORKPLACES_IMAGE_BASE}/office.png` }),
  a2VerbPhrase("a2-verb-have-garden", "have a garden", "____ a garden", "have", "a garden", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/have-a-garden.png` }),
  a2VerbPhrase("a2-verb-study-history", "study history", "____ history", "study", "history", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/study-history.png` }),
  a2VerbPhrase("a2-verb-speak-german", "speak German", "____ German", "speak", "German", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/speak-german.png` }),
  a2VerbPhrase("a2-verb-live-flat", "live in a flat", "____ in a flat", "live", "in a flat", { image: `${COMMON_VERB_PHRASES_IMAGE_BASE}/live-flat.png` }),
  a2VerbPhrase("a2-verb-read-book", "read a book", "____ a book", "read", "a book", { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/reading.png` }),
  a2VerbPhrase("a2-verb-like-animals", "like animals", "____ animals", "like", "animals", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/like-animals.png` }),
  a2VerbPhrase("a2-verb-go-cinema", "go to the cinema", "____ to the cinema", "go", "to the cinema", { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/going-to-the-cinema.png` }),
  a2VerbPhrase("a2-verb-watch-tv", "watch TV", "____ TV", "watch", "TV", { image: `${COMMON_VERB_PHRASES_IMAGE_BASE}/watch-tv.png` }),
  a2VerbPhrase("a2-verb-listen-music", "listen to music", "____ to music", "listen", "to music", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/listen-to-music.png` }),
  a2VerbPhrase("a2-verb-play-tennis", "play tennis", "____ tennis", "play", "tennis", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/play-tennis.png` }),
  a2VerbPhrase("a2-verb-take-umbrella", "take an umbrella", "____ an umbrella", "take", "an umbrella", { image: `${SMALL_THINGS_IMAGE_BASE}/umbrella.png` }),
  a2VerbPhrase("a2-verb-do-housework", "do housework", "____ housework", "do", "housework", { image: `${TYPICAL_DAY_IMAGE_BASE}/do-housework.png` }),
  a2VerbPhrase("a2-verb-play-guitar", "play the guitar", "____ the guitar", "play", "the guitar", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/play-the-guitar.png` }),
  a2VerbPhrase("a2-verb-say-sorry", "say sorry", "____ sorry", "say", "sorry", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/say-sorry.png` }),
  a2VerbPhrase("a2-verb-drink-water", "drink mineral water", "____ mineral water", "drink", "mineral water", { image: `${FOOD_IMAGE_BASE}/water.png` }),
  a2VerbPhrase("a2-verb-eat-vegetables", "eat vegetables", "____ vegetables", "eat", "vegetables", { image: `${FOOD_IMAGE_BASE}/vegetables.png` }),
  a2VerbPhrase("a2-verb-cook-dinner", "cook dinner", "____ dinner", "cook", "dinner", { image: `${TYPICAL_DAY_IMAGE_BASE}/make-dinner.png` }),
  a2VerbPhrase("a2-verb-do-exercise", "do exercise", "____ exercise", "do", "exercise", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/do-exercise.png` }),
  a2VerbPhrase("a2-verb-wear-glasses", "wear glasses", "____ glasses", "wear", "glasses", { image: `${SMALL_THINGS_IMAGE_BASE}/glasses.png` }),
  a2VerbPhrase("a2-verb-need-phone", "need a new phone", "____ a new phone", "need", "a new phone", { image: `${SMALL_THINGS_IMAGE_BASE}/mobile.png` }),
  a2VerbPhrase("a2-verb-drive-car", "drive a car", "____ a car", "drive", "a car", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/drive-a-car.png` }),
  a2VerbPhrase("a2-verb-do-homework", "do homework", "____ homework", "do", "homework", { image: `${A2_VERB_PHRASES_IMAGE_BASE}/do-homework.png` }),
];
const a2VerbBuilderEntries = a2VerbPhraseEntries
  .filter((entry) => ["do", "play", "drink", "eat", "cook"].includes(entry.verb))
  .map((entry) => ({ ...entry, id: `${entry.id}-builder`, term: entry.complement }));
const a2VerbContextEntries = [
  { id: "a2-verb-context-umbrella", sentence: "It's raining. You should ____ an umbrella.", answer: "take", acceptedAnswers: ["take"], options: ["take", "wear", "drive", "play"] },
  { id: "a2-verb-context-phone", sentence: "My phone is broken. I ____ a new one.", answer: "need", acceptedAnswers: ["need"], options: ["need", "want", "take", "wear"] },
  { id: "a2-verb-context-german", sentence: "My brother ____ German very well.", answer: "speaks", acceptedAnswers: ["speaks"], options: ["speaks", "studies", "reads", "listens"] },
  { id: "a2-verb-context-dinner", sentence: "I usually ____ dinner for my family in the evening.", answer: "cook", acceptedAnswers: ["cook"], options: ["cook", "do", "play", "drink"] },
  { id: "a2-verb-context-office", sentence: "Sara ____ in an office in the city centre.", answer: "works", acceptedAnswers: ["works"], options: ["works", "lives", "studies", "watches"] },
  { id: "a2-verb-context-glasses", sentence: "I can't see very well, so I ____ glasses.", answer: "wear", acceptedAnswers: ["wear"], options: ["wear", "take", "play", "listen"] },
  { id: "a2-verb-context-homework", sentence: "The children ____ their homework after school.", answer: "do", acceptedAnswers: ["do"], options: ["do", "play", "study", "read"] },
  { id: "a2-verb-context-cinema", sentence: "We often ____ to the cinema on Fridays.", answer: "go", acceptedAnswers: ["go"], options: ["go", "watch", "live", "drive"] },
];

const A2_JOBS_IMAGE_BASE = "/images/vocab/jobs-a2";
function a2Job(id, noun, article, { image = null, pendingImage = null, acceptedAnswers = [] } = {}) {
  const term = `${article} ${noun}`;
  return objectEntry(id, term, term.toUpperCase(), term, [term, noun, ...acceptedAnswers], null, image, {
    noun,
    articleCue: noun.split(" / ")[0],
    article,
    displayTerm: term,
    pendingImage,
  });
}
const a2JobEntries = [
  a2Job("a2-job-accountant", "accountant", "an", { image: `${A2_JOBS_IMAGE_BASE}/accountant.png` }),
  a2Job("a2-job-actor", "actor", "an", { image: `${A2_JOBS_IMAGE_BASE}/actor.png` }),
  a2Job("a2-job-administrator", "administrator", "an", { image: `${A2_JOBS_IMAGE_BASE}/administrator.png` }),
  a2Job("a2-job-architect", "architect", "an", { image: `${A2_JOBS_IMAGE_BASE}/architect.png` }),
  a2Job("a2-job-builder", "builder", "a", { image: `${A2_JOBS_IMAGE_BASE}/builder.png` }),
  a2Job("a2-job-chef", "chef / cook", "a", { image: `${A2_JOBS_IMAGE_BASE}/chef.png`, acceptedAnswers: ["chef", "cook", "a chef", "a cook"] }),
  a2Job("a2-job-cleaner", "cleaner", "a", { image: `${A2_JOBS_IMAGE_BASE}/cleaner.png` }),
  a2Job("a2-job-dentist", "dentist", "a", { image: `${A2_JOBS_IMAGE_BASE}/dentist.png` }),
  a2Job("a2-job-doctor", "doctor", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/doctor.png` }),
  a2Job("a2-job-engineer", "engineer", "an", { image: `${A2_JOBS_IMAGE_BASE}/engineer.png` }),
  a2Job("a2-job-factory-worker", "factory worker", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/factory-worker.png` }),
  a2Job("a2-job-flight-attendant", "flight attendant", "a", { image: `${A2_JOBS_IMAGE_BASE}/flight-attendant.png` }),
  a2Job("a2-job-footballer", "footballer", "a", { image: `${A2_JOBS_IMAGE_BASE}/footballer.png`, acceptedAnswers: ["football player", "a football player"] }),
  a2Job("a2-job-guide", "guide", "a", { image: `${A2_JOBS_IMAGE_BASE}/guide.png`, acceptedAnswers: ["tour guide", "a tour guide"] }),
  a2Job("a2-job-hairdresser", "hairdresser", "a", { image: `${A2_JOBS_IMAGE_BASE}/hairdresser.png` }),
  a2Job("a2-job-journalist", "journalist", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/journalist.png` }),
  a2Job("a2-job-lawyer", "lawyer", "a", { image: `${A2_JOBS_IMAGE_BASE}/lawyer.png` }),
  a2Job("a2-job-bank-manager", "bank manager", "a", { image: `${A2_JOBS_IMAGE_BASE}/bank-manager.png` }),
  a2Job("a2-job-model", "model", "a", { image: `${A2_JOBS_IMAGE_BASE}/model.png` }),
  a2Job("a2-job-musician", "musician", "a", { image: `${A2_JOBS_IMAGE_BASE}/musician.png` }),
  a2Job("a2-job-nurse", "nurse", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/nurse.png` }),
  a2Job("a2-job-pilot", "pilot", "a", { image: `${A2_JOBS_IMAGE_BASE}/pilot.png` }),
  a2Job("a2-job-police-officer", "police officer", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/police-officer.png` }),
  a2Job("a2-job-receptionist", "receptionist", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/receptionist.png` }),
  a2Job("a2-job-shop-assistant", "shop assistant / sales assistant", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/shop-assistant.png`, acceptedAnswers: ["shop assistant", "sales assistant", "a shop assistant", "a sales assistant"] }),
  a2Job("a2-job-soldier", "soldier", "a", { image: `${A2_JOBS_IMAGE_BASE}/soldier.png` }),
  a2Job("a2-job-taxi-driver", "taxi driver", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/taxi-driver.png` }),
  a2Job("a2-job-teacher", "teacher", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/teacher.png` }),
  a2Job("a2-job-vet", "vet", "a", { image: `${A2_JOBS_IMAGE_BASE}/vet.png`, acceptedAnswers: ["veterinarian", "a veterinarian"] }),
  a2Job("a2-job-waiter", "waiter / waitress", "a", { image: `${TEXTBOOK_JOBS_IMAGE_BASE}/waiter.png`, acceptedAnswers: ["waiter", "waitress", "a waiter", "a waitress"] }),
];
const a2JobPictureEntries = a2JobEntries.filter((entry) => entry.image);
const a2JobDefinitionEntries = [
  ["accountant", "I work with company finances and prepare financial records."],
  ["actor", "I perform in films, television programmes, or plays."],
  ["administrator", "I organise information, documents, and office work."],
  ["architect", "I design buildings."],
  ["builder", "I construct and repair buildings."],
  ["chef", "I prepare food in a restaurant kitchen."],
  ["cleaner", "I keep homes, offices, or other places clean."],
  ["dentist", "I examine and treat people's teeth."],
  ["doctor", "I examine ill people and give them medical treatment."],
  ["engineer", "I design or build machines, systems, or structures."],
  ["factory worker", "I make or pack products in a factory."],
  ["flight attendant", "I look after passengers on a plane."],
  ["footballer", "I play football professionally."],
  ["guide", "I show visitors around a place and explain it."],
  ["hairdresser", "I cut and style people's hair."],
  ["journalist", "I research and report news stories."],
  ["lawyer", "I give legal advice."],
  ["bank manager", "I manage staff and help customers at a bank."],
  ["model", "I wear clothes or pose for photographs professionally."],
  ["musician", "I play or write music professionally."],
  ["nurse", "I care for sick people in a hospital or clinic."],
  ["pilot", "I fly passenger planes."],
  ["police officer", "I protect people and enforce the law."],
  ["receptionist", "I welcome visitors and answer calls at a front desk."],
  ["shop assistant", "I help customers and sell things in a shop."],
  ["soldier", "I serve in an army."],
  ["taxi driver", "I drive passengers to places for money."],
  ["teacher", "I help students learn in a school or college."],
  ["vet", "I look after sick animals."],
  ["waiter", "I serve food and drinks to restaurant customers."],
].map(([answer, sentence], index, definitions) => ({
  id: `a2-job-definition-${index + 1}`,
  sentence,
  answer,
  acceptedAnswers: [answer],
  options: [answer, ...definitions.filter(([other]) => other !== answer).slice((index + 7) % (definitions.length - 3), (index + 7) % (definitions.length - 3) + 3).map(([other]) => other)],
}));
const a2WorkStatusEntries = [
  { id: "a2-work-status-musician", sentence: "Leo plays in a band and earns money from music. He's ____.", answer: "a musician", acceptedAnswers: ["a musician", "musician"], options: ["a musician", "an engineer", "unemployed", "retired"] },
  { id: "a2-work-status-engineer", sentence: "Nina designs machines. She's ____.", answer: "an engineer", acceptedAnswers: ["an engineer", "engineer"], options: ["an engineer", "a musician", "at school", "retired"] },
  { id: "a2-work-status-company", sentence: "I have a job with a technology business. I work ____.", answer: "for an IT company", acceptedAnswers: ["for an IT company"], options: ["for an IT company", "in a shop", "at university", "at school"] },
  { id: "a2-work-status-shop", sentence: "I sell clothes to customers. I work ____.", answer: "in a shop", acceptedAnswers: ["in a shop"], options: ["in a shop", "for an IT company", "at university", "at school"] },
  { id: "a2-work-status-student", sentence: "Emma is studying for a degree. She's ____.", answer: "a student", acceptedAnswers: ["a student", "student"], options: ["a student", "unemployed", "retired", "a model"] },
  { id: "a2-work-status-university", sentence: "I'm studying medicine for a degree. I'm ____.", answer: "at university", acceptedAnswers: ["at university"], options: ["at university", "at school", "in a shop", "retired"] },
  { id: "a2-work-status-school", sentence: "My daughter is fourteen. She's ____.", answer: "at school", acceptedAnswers: ["at school"], options: ["at school", "at university", "unemployed", "retired"] },
  { id: "a2-work-status-unemployed", sentence: "Marta doesn't have a job at the moment. She's ____.", answer: "unemployed", acceptedAnswers: ["unemployed"], options: ["unemployed", "retired", "a student", "a receptionist"] },
  { id: "a2-work-status-retired", sentence: "My grandfather stopped working five years ago. He's ____.", answer: "retired", acceptedAnswers: ["retired"], options: ["retired", "unemployed", "at school", "a pilot"] },
];

function a2FamilyEntry(id, term, cueText, image = null, acceptedAnswers = []) {
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, { cueText });
}
const a2FamilyCoreEntries = [
  a2FamilyEntry("a2-family-father", "father", "male parent", `${PEOPLE_FAMILY_IMAGE_BASE}/father.png`),
  a2FamilyEntry("a2-family-mother", "mother", "female parent", `${PEOPLE_FAMILY_IMAGE_BASE}/mother.png`),
  a2FamilyEntry("a2-family-brother", "brother", "male sibling", `${PEOPLE_FAMILY_IMAGE_BASE}/brother.png`),
  a2FamilyEntry("a2-family-sister", "sister", "female sibling", `${PEOPLE_FAMILY_IMAGE_BASE}/sister.png`),
  a2FamilyEntry("a2-family-daughter", "daughter", "female child", `${PEOPLE_FAMILY_IMAGE_BASE}/daughter.png`),
  a2FamilyEntry("a2-family-son", "son", "male child", `${PEOPLE_FAMILY_IMAGE_BASE}/son.png`),
  a2FamilyEntry("a2-family-grandfather", "grandfather", "one of your parents' fathers", `${PEOPLE_FAMILY_IMAGE_BASE}/grandfather.png`),
  a2FamilyEntry("a2-family-grandmother", "grandmother", "one of your parents' mothers", `${PEOPLE_FAMILY_IMAGE_BASE}/grandmother.png`),
  a2FamilyEntry("a2-family-aunt", "aunt", "your parent's sister"),
  a2FamilyEntry("a2-family-uncle", "uncle", "your parent's brother"),
  a2FamilyEntry("a2-family-nephew", "nephew", "your brother's or sister's son"),
  a2FamilyEntry("a2-family-niece", "niece", "your brother's or sister's daughter"),
  a2FamilyEntry("a2-family-cousin", "cousin", "your aunt's or uncle's child"),
  a2FamilyEntry("a2-family-wife", "wife", "a married woman", `${PEOPLE_FAMILY_IMAGE_BASE}/wife.png`),
];
const a2FamilyRelationshipEntries = [
  { id: "a2-family-rel-aunt", sentence: "My father's sister is my ____.", answer: "aunt", acceptedAnswers: ["aunt"], options: ["aunt", "niece", "cousin", "mother-in-law"] },
  { id: "a2-family-rel-nephew", sentence: "My sister's son is my ____.", answer: "nephew", acceptedAnswers: ["nephew"], options: ["nephew", "uncle", "cousin", "son"] },
  { id: "a2-family-rel-uncle", sentence: "My mother's brother is my ____.", answer: "uncle", acceptedAnswers: ["uncle"], options: ["uncle", "nephew", "cousin", "grandfather"] },
  { id: "a2-family-rel-niece", sentence: "My brother's daughter is my ____.", answer: "niece", acceptedAnswers: ["niece"], options: ["niece", "aunt", "cousin", "sister"] },
  { id: "a2-family-rel-cousin", sentence: "My aunt's daughter is my ____.", answer: "cousin", acceptedAnswers: ["cousin"], options: ["cousin", "niece", "sister", "daughter"] },
  { id: "a2-family-rel-grandmother", sentence: "My mother's mother is my ____.", answer: "grandmother", acceptedAnswers: ["grandmother"], options: ["grandmother", "mother-in-law", "aunt", "stepmother"] },
  { id: "a2-family-rel-wife", sentence: "The woman my father is married to is his ____.", answer: "wife", acceptedAnswers: ["wife"], options: ["wife", "sister", "partner", "daughter"] },
];
const a2FamilyGroupEntries = [
  { id: "a2-family-group-parents", term: "parents", cueText: "mother + father", acceptedAnswers: ["parents"] },
  { id: "a2-family-group-grandparents", term: "grandparents", cueText: "grandmother + grandfather", acceptedAnswers: ["grandparents"] },
  { id: "a2-family-group-children", term: "children", cueText: "son + daughter", acceptedAnswers: ["children"] },
  { id: "a2-family-group-couple", term: "a couple", cueText: "two people in a relationship", acceptedAnswers: ["couple", "a couple"] },
  { id: "a2-family-group-in-laws", term: "parents-in-law", cueText: "your husband’s or wife’s parents", acceptedAnswers: ["parents-in-law", "parents in law"] },
];
const a2FamilyTreeEntries = [
  { id: "a2-tree-anna-leo", sentence: "Anna and David are Sophie's parents. Sophie is Leo's mother. Who is Anna to Leo?", answer: "grandmother", acceptedAnswers: ["grandmother"], options: ["grandmother", "aunt", "mother", "cousin"] },
  { id: "a2-tree-david-mia", sentence: "Anna and David are Sophie's parents. Sophie is Mia's mother. Who is David to Mia?", answer: "grandfather", acceptedAnswers: ["grandfather"], options: ["grandfather", "uncle", "father", "cousin"] },
  { id: "a2-tree-mark-mia", sentence: "Sophie and Mark are brother and sister. Mia is Sophie's daughter. Who is Mark to Mia?", answer: "uncle", acceptedAnswers: ["uncle"], options: ["uncle", "nephew", "grandfather", "cousin"] },
  { id: "a2-tree-sophie-ben", sentence: "Sophie and Mark are sister and brother. Ben is Mark's son. Who is Sophie to Ben?", answer: "aunt", acceptedAnswers: ["aunt"], options: ["aunt", "niece", "grandmother", "cousin"] },
  { id: "a2-tree-leo-ben", sentence: "Sophie and Mark are sister and brother. Leo is Sophie's son and Ben is Mark's son. Who are Leo and Ben?", answer: "cousins", acceptedAnswers: ["cousins"], options: ["cousins", "brothers", "uncle and nephew", "father and son"] },
  { id: "a2-tree-leo-mia", sentence: "Sophie is Leo and Mia's mother. Who are Leo and Mia?", answer: "brother and sister", acceptedAnswers: ["brother and sister", "siblings"], options: ["brother and sister", "cousins", "uncle and niece", "father and daughter"] },
];
const a2ExtendedFamilyEntries = [
  { id: "a2-family-inlaw-mother", sentence: "My wife's mother is my ____.", answer: "mother-in-law", acceptedAnswers: ["mother-in-law", "mother in law"] },
  { id: "a2-family-inlaw-sister", sentence: "My husband's sister is my ____.", answer: "sister-in-law", acceptedAnswers: ["sister-in-law", "sister in law"] },
  { id: "a2-family-stepfather", sentence: "My mother's new husband is my ____.", answer: "stepfather", acceptedAnswers: ["stepfather", "step-father", "step father"] },
  { id: "a2-family-stepmother", sentence: "My father's new wife is my ____.", answer: "stepmother", acceptedAnswers: ["stepmother", "step-mother", "step mother"] },
  { id: "a2-family-partner", sentence: "The person I'm in a relationship with is my ____.", answer: "partner", acceptedAnswers: ["partner"] },
];

const A2_DAILY_ROUTINE_IMAGE_BASE = "/images/vocab/daily-routine-a2";
function a2RoutinePhrase(id, term, cueText, gapAnswers, { image = null, pendingImage = null } = {}) {
  return objectEntry(id, term, term.toUpperCase(), term, [term], null, image, {
    fullPhrase: term,
    cueText,
    gapAnswers,
    pendingImage,
  });
}
const a2DailyRoutineEntries = [
  a2RoutinePhrase("a2-routine-do-housework", "do housework", "_____ housework", ["do"], { image: `${TYPICAL_DAY_IMAGE_BASE}/do-housework.png` }),
  a2RoutinePhrase("a2-routine-start-work", "start work at 8.30", "_____ work at 8.30", ["start"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/start-work.png` }),
  a2RoutinePhrase("a2-routine-finish-work", "finish work at 6.30", "_____ work at 6.30", ["finish"], { image: `${TYPICAL_DAY_IMAGE_BASE}/finish-work.png` }),
  a2RoutinePhrase("a2-routine-get-dressed", "get dressed", "_____ dressed", ["get"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/get-dressed.png` }),
  a2RoutinePhrase("a2-routine-wake-up", "wake up at 7.00", "_____ up at 7.00", ["wake"], { image: `${TYPICAL_DAY_IMAGE_BASE}/get-up.png` }),
  a2RoutinePhrase("a2-routine-lunch-work", "have lunch at work", "_____ lunch at work", ["have"], { image: `${TYPICAL_DAY_IMAGE_BASE}/have-lunch.png` }),
  a2RoutinePhrase("a2-routine-go-shopping", "go shopping", "_____ shopping", ["go"], { image: `${TYPICAL_DAY_IMAGE_BASE}/go-shopping.png` }),
  a2RoutinePhrase("a2-routine-go-bed", "go to bed", "_____ to bed", ["go"], { image: `${TYPICAL_DAY_IMAGE_BASE}/go-bed.png` }),
  a2RoutinePhrase("a2-routine-home-late", "go home late", "_____ home late", ["go"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-home-late.png` }),
  a2RoutinePhrase("a2-routine-work-bus", "go to work by bus", "_____ to work by bus", ["go"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-to-work-by-bus.png` }),
  a2RoutinePhrase("a2-routine-makeup", "put on make-up", "_____ on make-up", ["put"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/put-on-make-up.png` }),
  a2RoutinePhrase("a2-routine-emails", "check emails", "_____ emails", ["check"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/check-emails.png` }),
  a2RoutinePhrase("a2-routine-italy", "go to Italy", "_____ to Italy", ["go"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-to-italy.png` }),
  a2RoutinePhrase("a2-routine-get-up", "get up at 8.00", "_____ up at 8.00", ["get"], { image: `${TYPICAL_DAY_IMAGE_BASE}/get-up.png` }),
  a2RoutinePhrase("a2-routine-breakfast", "have breakfast", "_____ breakfast", ["have"], { image: `${TYPICAL_DAY_IMAGE_BASE}/have-breakfast.png` }),
  a2RoutinePhrase("a2-routine-shower", "have a shower", "_____ a shower", ["have"], { image: `${TYPICAL_DAY_IMAGE_BASE}/have-a-shower.png` }),
  a2RoutinePhrase("a2-routine-home-early", "go home early", "_____ home early", ["go"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-home-early.png` }),
  a2RoutinePhrase("a2-routine-walk-work", "walk to work", "_____ to work", ["walk"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/walk-to-work.png` }),
  a2RoutinePhrase("a2-routine-relax", "relax", "_____", ["relax"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/relax.png` }),
  a2RoutinePhrase("a2-routine-dog-walk", "take the dog for a walk", "_____ the dog for a walk", ["take"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/take-the-dog-for-a-walk.png` }),
  a2RoutinePhrase("a2-routine-sleep", "sleep for eight hours", "_____ for eight hours", ["sleep"], { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/sleep-for-eight-hours.png` }),
  a2RoutinePhrase("a2-routine-dinner", "make dinner", "_____ dinner", ["make"], { image: `${TYPICAL_DAY_IMAGE_BASE}/make-dinner.png` }),
  a2RoutinePhrase("a2-routine-bath", "have a bath", "_____ a bath", ["have"], { image: `${TYPICAL_DAY_IMAGE_BASE}/have-bath.png` }),
];
const a2RoutineContextEntries = [
  { id: "a2-routine-context-bus", sentence: "Marta doesn't drive. She ____ to work by bus.", answer: "goes", acceptedAnswers: ["goes"], options: ["goes", "walks", "takes", "checks"] },
  { id: "a2-routine-context-makeup", sentence: "Before Marta goes out, she ____ on make-up.", answer: "puts", acceptedAnswers: ["puts"], options: ["puts", "gets", "takes", "makes"] },
  { id: "a2-routine-context-relax", sentence: "Tom isn't stressed in the evening. He ____.", answer: "relaxes", acceptedAnswers: ["relaxes"], options: ["relaxes", "checks", "finishes", "dresses"] },
  { id: "a2-routine-context-emails", sentence: "Every morning I ____ my emails before work.", answer: "check", acceptedAnswers: ["check"], options: ["check", "walk", "sleep", "relax"] },
  { id: "a2-routine-context-dressed", sentence: "After my shower, I ____ dressed.", answer: "get", acceptedAnswers: ["get"], options: ["get", "have", "put", "take"] },
  { id: "a2-routine-context-housework", sentence: "On Saturday mornings, we ____ housework.", answer: "do", acceptedAnswers: ["do"], options: ["do", "make", "have", "go"] },
  { id: "a2-routine-context-lunch", sentence: "Marta doesn't go home at midday; she ____ lunch at work.", answer: "has", acceptedAnswers: ["has"], options: ["has", "makes", "checks", "finishes"] },
  { id: "a2-routine-context-dog", sentence: "Tom has a dog, so he ____ it for a walk every day.", answer: "takes", acceptedAnswers: ["takes"], options: ["takes", "goes", "puts", "walks"] },
  { id: "a2-routine-context-dinner", sentence: "In the evening Tom ____ dinner at home.", answer: "makes", acceptedAnswers: ["makes"], options: ["makes", "does", "gets", "starts"] },
  { id: "a2-routine-context-sleep", sentence: "Tom goes to bed at eleven and gets up at seven, so he ____ for eight hours.", answer: "sleeps", acceptedAnswers: ["sleeps"], options: ["sleeps", "relaxes", "finishes", "works"] },
  { id: "a2-routine-context-shopping", sentence: "We need food for dinner, so I ____ shopping after work.", answer: "go", acceptedAnswers: ["go"], options: ["go", "do", "make", "take"] },
  { id: "a2-routine-context-work", sentence: "The office opens at half past eight, so Marta ____ work then.", answer: "starts", acceptedAnswers: ["starts"], options: ["starts", "finishes", "checks", "gets"] },
];

const a2TimeClockEntries = [
  { id: "a2-time-0600", hour: 6, minute: 0, answer: "It's six o'clock", acceptedAnswers: ["six o'clock", "it is six o'clock"] },
  { id: "a2-time-0605", hour: 6, minute: 5, answer: "It's five past six", acceptedAnswers: ["five past six", "it is five past six"] },
  { id: "a2-time-0610", hour: 6, minute: 10, answer: "It's ten past six", acceptedAnswers: ["ten past six", "it is ten past six"] },
  { id: "a2-time-0615", hour: 6, minute: 15, answer: "It's quarter past six", acceptedAnswers: ["quarter past six", "a quarter past six", "it's a quarter past six"] },
  { id: "a2-time-0620", hour: 6, minute: 20, answer: "It's twenty past six", acceptedAnswers: ["twenty past six", "it is twenty past six"] },
  { id: "a2-time-0625", hour: 6, minute: 25, answer: "It's twenty-five past six", acceptedAnswers: ["twenty-five past six", "twenty five past six"] },
  { id: "a2-time-0630", hour: 6, minute: 30, answer: "It's half past six", acceptedAnswers: ["half past six", "it is half past six"] },
  { id: "a2-time-0635", hour: 6, minute: 35, answer: "It's twenty-five to seven", acceptedAnswers: ["twenty-five to seven", "twenty five to seven"] },
  { id: "a2-time-0640", hour: 6, minute: 40, answer: "It's twenty to seven", acceptedAnswers: ["twenty to seven", "it is twenty to seven"] },
  { id: "a2-time-0645", hour: 6, minute: 45, answer: "It's quarter to seven", acceptedAnswers: ["quarter to seven", "a quarter to seven", "it's a quarter to seven"] },
  { id: "a2-time-0650", hour: 6, minute: 50, answer: "It's ten to seven", acceptedAnswers: ["ten to seven", "it is ten to seven"] },
  { id: "a2-time-0655", hour: 6, minute: 55, answer: "It's five to seven", acceptedAnswers: ["five to seven", "it is five to seven"] },
];
const a2FrequencyEntries = [
  { id: "a2-freq-every-day", sentence: "I check the news from Monday to Sunday, so I check it ____.", answer: "every day", acceptedAnswers: ["every day"], options: ["every day", "once a week", "twice a month", "once a year"] },
  { id: "a2-freq-every-week", sentence: "Our class is on the same day each week, so we have it ____.", answer: "every week", acceptedAnswers: ["every week"], options: ["every week", "every month", "twice a day", "once a year"] },
  { id: "a2-freq-every-month", sentence: "The magazine arrives each month, so I receive it ____.", answer: "every month", acceptedAnswers: ["every month"], options: ["every month", "every day", "twice a week", "every year"] },
  { id: "a2-freq-every-year", sentence: "My birthday is on 12 May, so I celebrate it ____.", answer: "every year", acceptedAnswers: ["every year"], options: ["every year", "every month", "three times a week", "once a day"] },
  { id: "a2-freq-once-day", sentence: "I take this medicine each morning: ____.", answer: "once a day", acceptedAnswers: ["once a day"], options: ["once a day", "twice a day", "once a week", "every month"] },
  { id: "a2-freq-twice-day", sentence: "I brush my teeth in the morning and at night: ____.", answer: "twice a day", acceptedAnswers: ["twice a day"], options: ["twice a day", "once a day", "twice a week", "every month"] },
  { id: "a2-freq-once-week", sentence: "I have a piano lesson every Wednesday: ____.", answer: "once a week", acceptedAnswers: ["once a week"], options: ["once a week", "twice a week", "every day", "once a year"] },
  { id: "a2-freq-twice-week", sentence: "I go to the gym on Tuesday and Thursday: ____.", answer: "twice a week", acceptedAnswers: ["twice a week"], options: ["twice a week", "once a week", "three times a month", "every day"] },
  { id: "a2-freq-three-week", sentence: "We have English classes on Monday, Wednesday, and Friday: ____.", answer: "three times a week", acceptedAnswers: ["three times a week"], options: ["three times a week", "twice a week", "once a month", "every year"] },
  { id: "a2-freq-once-year", sentence: "We take one summer holiday each year: ____.", answer: "once a year", acceptedAnswers: ["once a year"], options: ["once a year", "twice a month", "every week", "once a day"] },
];
const a2FrequencyAdverbEntries = [
  { id: "a2-adv-always", sentence: "I get up at seven on every working day. I ____ get up at seven during the week.", answer: "always", acceptedAnswers: ["always"], options: ["always", "usually", "sometimes", "never"] },
  { id: "a2-adv-never", sentence: "I don't drink coffee at all. I ____ drink coffee.", answer: "never", acceptedAnswers: ["never"], options: ["never", "hardly ever", "often", "always"] },
  { id: "a2-adv-hardly-ever", sentence: "I go to the theatre about once a year. I ____ go to the theatre.", answer: "hardly ever", acceptedAnswers: ["hardly ever"], options: ["hardly ever", "often", "usually", "always"] },
  { id: "a2-adv-often", sentence: "I go running four days most weeks. I ____ go running.", answer: "often", acceptedAnswers: ["often"], options: ["often", "never", "hardly ever", "sometimes"] },
  { id: "a2-adv-usually", sentence: "I eat breakfast at home on six days out of seven. I ____ eat breakfast at home.", answer: "usually", acceptedAnswers: ["usually"], options: ["usually", "sometimes", "hardly ever", "never"] },
  { id: "a2-adv-sometimes", sentence: "I meet a friend for lunch two or three times a month. I ____ meet a friend for lunch.", answer: "sometimes", acceptedAnswers: ["sometimes"], options: ["sometimes", "always", "never", "usually"] },
  { id: "a2-adv-always-seatbelt", sentence: "I use my seat belt on every car journey. I ____ wear it.", answer: "always", acceptedAnswers: ["always"], options: ["always", "often", "sometimes", "never"] },
  { id: "a2-adv-never-meat", sentence: "Mia is vegetarian and eats no meat. She ____ eats meat.", answer: "never", acceptedAnswers: ["never"], options: ["never", "hardly ever", "usually", "always"] },
  { id: "a2-adv-usually-bus", sentence: "Leo takes the bus on most days, but occasionally walks. He ____ takes the bus.", answer: "usually", acceptedAnswers: ["usually"], options: ["usually", "always", "never", "hardly ever"] },
  { id: "a2-adv-sometimes-cinema", sentence: "We go to the cinema on some weekends, but not most weekends. We ____ go to the cinema.", answer: "sometimes", acceptedAnswers: ["sometimes"], options: ["sometimes", "always", "usually", "never"] },
];
const A2_MORE_VERB_PHRASES_IMAGE_BASE = "/images/vocab/more-verb-phrases-a2";
function a2MoreVerbPhrase(id, term, cueText, gapAnswers, { image = null, pendingImage = null } = {}) {
  return objectEntry(id, term, term.toUpperCase(), term, [term], null, image, {
    cueText,
    gapAnswers,
    pendingImage,
  });
}
const a2MoreVerbPhraseEntries = [
  a2MoreVerbPhrase("a2-more-buy-newspaper", "buy a newspaper", "_____ a newspaper", ["buy"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/buy-a-newspaper.png` }),
  a2MoreVerbPhrase("a2-more-call-taxi", "call a taxi", "_____ a taxi", ["call"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/call-a-taxi.png` }),
  a2MoreVerbPhrase("a2-more-dance-tango", "dance the tango", "_____ the tango", ["dance"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/dance-the-tango.png` }),
  a2MoreVerbPhrase("a2-more-draw-picture", "draw a picture", "_____ a picture", ["draw"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/draw-a-picture.png` }),
  a2MoreVerbPhrase("a2-more-find-space", "find a parking space", "_____ a parking space", ["find"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/find-a-parking-space.png` }),
  a2MoreVerbPhrase("a2-more-forget-name", "forget somebody's name", "_____ somebody's name", ["forget"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/forget-somebodys-name.png` }),
  a2MoreVerbPhrase("a2-more-give-flowers", "give somebody flowers", "_____ somebody flowers", ["give"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/give-somebody-flowers.png` }),
  a2MoreVerbPhrase("a2-more-hear-noise", "hear a noise", "_____ a noise", ["hear"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/hear-a-noise.png` }),
  a2MoreVerbPhrase("a2-more-help-somebody", "help somebody", "_____ somebody", ["help"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/help-somebody.png` }),
  a2MoreVerbPhrase("a2-more-leave-bag", "leave your bag on a train", "_____ your bag on a train", ["leave"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/leave-your-bag-on-a-train.png` }),
  a2MoreVerbPhrase("a2-more-look-keys", "look for your keys", "_____ your keys", ["look for"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/look-for-your-keys.png` }),
  a2MoreVerbPhrase("a2-more-meet-friend", "meet a friend", "_____ a friend", ["meet"], { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/meet-friends.png` }),
  a2MoreVerbPhrase("a2-more-paint-picture", "paint a picture", "_____ a picture", ["paint"], { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/painting.png` }),
  a2MoreVerbPhrase("a2-more-remember-name", "remember somebody's name", "_____ somebody's name", ["remember"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/remember-somebodys-name.png` }),
  a2MoreVerbPhrase("a2-more-run-race", "run a race", "_____ a race", ["run"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/run-a-race.png` }),
  a2MoreVerbPhrase("a2-more-see-film", "see a film", "_____ a film", ["see"], { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/going-to-the-cinema.png` }),
  a2MoreVerbPhrase("a2-more-send-text", "send a text message", "_____ a text message", ["send"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/send-a-text-message.png` }),
  a2MoreVerbPhrase("a2-more-sing-song", "sing a song", "_____ a song", ["sing"], { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/singing.png` }),
  a2MoreVerbPhrase("a2-more-swim-sea", "swim in the sea", "_____ in the sea", ["swim"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/swim-in-the-sea.png` }),
  a2MoreVerbPhrase("a2-more-take-photo", "take a photo", "_____ a photo", ["take"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/take-a-photo.png` }),
  a2MoreVerbPhrase("a2-more-talk-friend", "talk to a friend", "_____ to a friend", ["talk"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/talk-to-a-friend.png` }),
  a2MoreVerbPhrase("a2-more-tell-secret", "tell somebody a secret", "_____ somebody a secret", ["tell"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/tell-somebody-a-secret.png` }),
  a2MoreVerbPhrase("a2-more-try-difficult", "try to do something difficult", "_____ to do something difficult", ["try"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/try-to-do-something-difficult.png` }),
  a2MoreVerbPhrase("a2-more-use-internet", "use the internet", "_____ the internet", ["use"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/use-the-internet.png` }),
  a2MoreVerbPhrase("a2-more-wait-bus", "wait for a bus", "_____ a bus", ["wait for"], { image: `${A2_MORE_VERB_PHRASES_IMAGE_BASE}/wait-for-a-bus.png` }),
];
const a2MoreVerbContextEntries = [
  { id: "a2-more-context-keys", sentence: "I can't find my keys. I'm ____ them now.", answer: "looking for", acceptedAnswers: ["looking for"], options: ["looking for", "waiting for", "remembering", "leaving"] },
  { id: "a2-more-context-forgot", sentence: "I knew her name yesterday, but now I've ____ it.", answer: "forgotten", acceptedAnswers: ["forgotten"], options: ["forgotten", "remembered", "found", "heard"] },
  { id: "a2-more-context-space", sentence: "There was one space outside the hotel, so we ____ a parking space.", answer: "found", acceptedAnswers: ["found"], options: ["found", "looked for", "waited for", "left"] },
  { id: "a2-more-context-noise", sentence: "I was in bed when I ____ a strange noise downstairs.", answer: "heard", acceptedAnswers: ["heard"], options: ["heard", "saw", "told", "called"] },
  { id: "a2-more-context-flowers", sentence: "It's Anna's birthday. I'm going to ____ her some flowers.", answer: "give", acceptedAnswers: ["give"], options: ["give", "send", "tell", "take"] },
  { id: "a2-more-context-film", sentence: "We ____ a really good film last night.", answer: "saw", acceptedAnswers: ["saw"], options: ["saw", "heard", "drew", "met"] },
  { id: "a2-more-context-taxi", sentence: "It's raining and there are no buses, so I'll ____ a taxi.", answer: "call", acceptedAnswers: ["call"], options: ["call", "wait for", "send", "leave"] },
  { id: "a2-more-context-secret", sentence: "Please don't ____ anybody my secret.", answer: "tell", acceptedAnswers: ["tell"], options: ["tell", "talk", "hear", "remember"] },
  { id: "a2-more-context-text", sentence: "I can't talk now, so please ____ me a text message.", answer: "send", acceptedAnswers: ["send"], options: ["send", "give", "call", "take"] },
  { id: "a2-more-context-photo", sentence: "The view is beautiful. Let's ____ a photo.", answer: "take", acceptedAnswers: ["take"], options: ["take", "draw", "paint", "see"] },
  { id: "a2-more-context-bag", sentence: "Be careful not to ____ your bag on the train.", answer: "leave", acceptedAnswers: ["leave"], options: ["leave", "forget", "find", "give"] },
  { id: "a2-more-context-internet", sentence: "I ____ the internet to book train tickets.", answer: "use", acceptedAnswers: ["use"], options: ["use", "try", "look for", "send"] },
];

const A2_WEATHER_DATES_IMAGE_BASE = "/images/vocab/weather-dates-a2";
const a2WeatherEntries = [
  { id: "a2-weather-sunny", term: "sunny", visualLabel: "☀️", image: `${A2_WEATHER_DATES_IMAGE_BASE}/sunny.png`, acceptedAnswers: ["sunny"] },
  { id: "a2-weather-hot", term: "hot", visualLabel: "🌡️ 35°C", image: `${A2_WEATHER_DATES_IMAGE_BASE}/hot.png`, acceptedAnswers: ["hot"] },
  { id: "a2-weather-warm", term: "warm", visualLabel: "🌤️ 22°C", image: `${A2_WEATHER_DATES_IMAGE_BASE}/warm.png`, acceptedAnswers: ["warm"] },
  { id: "a2-weather-cloudy", term: "cloudy", visualLabel: "☁️", image: `${A2_WEATHER_DATES_IMAGE_BASE}/cloudy-foggy.png`, acceptedAnswers: ["cloudy"] },
  { id: "a2-weather-raining", term: "raining", visualLabel: "🌧️", image: `${A2_WEATHER_DATES_IMAGE_BASE}/rainy-wet.png`, acceptedAnswers: ["raining", "rainy"] },
  { id: "a2-weather-cold", term: "cold", visualLabel: "🌡️ 5°C", image: `${A2_WEATHER_DATES_IMAGE_BASE}/cold.png`, acceptedAnswers: ["cold"] },
  { id: "a2-weather-cool", term: "cool", visualLabel: "🌥️ 14°C", image: `${A2_WEATHER_DATES_IMAGE_BASE}/cool.png`, acceptedAnswers: ["cool"] },
  { id: "a2-weather-foggy", term: "foggy", visualLabel: "🌫️", image: `${A2_WEATHER_DATES_IMAGE_BASE}/cloudy-foggy.png`, acceptedAnswers: ["foggy"] },
  { id: "a2-weather-windy", term: "windy", visualLabel: "💨", acceptedAnswers: ["windy"] },
  { id: "a2-weather-snowing", term: "snowing", visualLabel: "🌨️", image: `${A2_WEATHER_DATES_IMAGE_BASE}/snowy.png`, acceptedAnswers: ["snowing", "snowy"] },
  { id: "a2-weather-wet", term: "wet", visualLabel: "💧", image: `${A2_WEATHER_DATES_IMAGE_BASE}/rainy-wet.png`, acceptedAnswers: ["wet"] },
  { id: "a2-weather-dry", term: "dry", visualLabel: "🏜️", acceptedAnswers: ["dry"] },
];
const a2WeatherContextEntries = [
  { id: "a2-weather-context-rain", sentence: "Take an umbrella. It's ____ outside.", answer: "raining", acceptedAnswers: ["raining", "rainy"], options: ["raining", "dry", "sunny", "foggy"] },
  { id: "a2-weather-context-fog", sentence: "You can't see very far because it's ____.", answer: "foggy", acceptedAnswers: ["foggy"], options: ["foggy", "windy", "warm", "dry"] },
  { id: "a2-weather-context-cold", sentence: "It's only 5°C, so it's quite ____.", answer: "cold", acceptedAnswers: ["cold"], options: ["cold", "hot", "warm", "dry"] },
  { id: "a2-weather-context-wind", sentence: "There's a strong wind today. It's very ____.", answer: "windy", acceptedAnswers: ["windy"], options: ["windy", "cloudy", "wet", "snowing"] },
  { id: "a2-weather-context-sun", sentence: "There isn't a cloud in the sky and the sun is shining. It's ____.", answer: "sunny", acceptedAnswers: ["sunny"], options: ["sunny", "cloudy", "foggy", "raining"] },
  { id: "a2-weather-context-cloud", sentence: "The sky is grey and covered with clouds. It's ____.", answer: "cloudy", acceptedAnswers: ["cloudy"], options: ["cloudy", "sunny", "dry", "hot"] },
  { id: "a2-weather-context-snow", sentence: "White flakes are falling from the sky. It's ____.", answer: "snowing", acceptedAnswers: ["snowing", "snowy"], options: ["snowing", "raining", "windy", "warm"] },
  { id: "a2-weather-context-hot", sentence: "It's 37°C. The weather is very ____.", answer: "hot", acceptedAnswers: ["hot"], options: ["hot", "warm", "cool", "cold"] },
  { id: "a2-weather-context-warm", sentence: "It's a pleasant 22°C, so it's ____ rather than hot.", answer: "warm", acceptedAnswers: ["warm"], options: ["warm", "cold", "foggy", "wet"] },
  { id: "a2-weather-context-cool", sentence: "It's 14°C and I need a light jacket. It's ____.", answer: "cool", acceptedAnswers: ["cool"], options: ["cool", "hot", "dry", "sunny"] },
  { id: "a2-weather-context-wet", sentence: "It rained all night, so the streets are ____.", answer: "wet", acceptedAnswers: ["wet"], options: ["wet", "dry", "warm", "windy"] },
  { id: "a2-weather-context-dry", sentence: "There has been no rain for months, so the ground is very ____.", answer: "dry", acceptedAnswers: ["dry"], options: ["dry", "wet", "cloudy", "cool"] },
];
const a2SeasonPictureEntries = [
  { id: "a2-season-spring", term: "spring", image: `${A2_WEATHER_DATES_IMAGE_BASE}/spring.png`, sentence: "Flowers begin to grow and the weather gets warmer in ____.", answer: "spring", acceptedAnswers: ["spring"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-summer", term: "summer", image: `${A2_WEATHER_DATES_IMAGE_BASE}/summer.png`, sentence: "In Spain, July is in ____.", answer: "summer", acceptedAnswers: ["summer"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-autumn", term: "autumn", image: `${A2_WEATHER_DATES_IMAGE_BASE}/autumn.png`, sentence: "Leaves often fall from trees in ____.", answer: "autumn", acceptedAnswers: ["autumn", "fall"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-winter", term: "winter", image: `${A2_WEATHER_DATES_IMAGE_BASE}/winter.png`, sentence: "The coldest season of the year is ____.", answer: "winter", acceptedAnswers: ["winter"], options: ["spring", "summer", "autumn", "winter"] },
];
const a2SeasonEntries = [
  ...a2SeasonPictureEntries,
  { id: "a2-season-south-summer", sentence: "In Australia, January is in ____.", answer: "summer", acceptedAnswers: ["summer"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-north-winter", sentence: "In Britain, Christmas is in ____.", answer: "winter", acceptedAnswers: ["winter"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-spring-month", sentence: "In the northern hemisphere, April is in ____.", answer: "spring", acceptedAnswers: ["spring"], options: ["spring", "summer", "autumn", "winter"] },
  { id: "a2-season-autumn-month", sentence: "In the northern hemisphere, October is in ____.", answer: "autumn", acceptedAnswers: ["autumn", "fall"], options: ["spring", "summer", "autumn", "winter"] },
];
const a2WeatherSeasonWriteEntries = [
  ...a2WeatherEntries.filter(({ id }) => !["a2-weather-foggy", "a2-weather-wet"].includes(id)),
  ...a2SeasonPictureEntries,
];
const a2DateEntries = [
  { id: "a2-date-22-march", term: "the twenty-second of March", cueText: "22 March", acceptedAnswers: ["twenty-second of March", "the twenty second of March", "twenty second of March"] },
  { id: "a2-date-12-1", term: "the twelfth of January", cueText: "12/1", acceptedAnswers: ["twelfth of January"] },
  { id: "a2-date-1-may", term: "the first of May", cueText: "1 May", acceptedAnswers: ["first of May"] },
  { id: "a2-date-3-feb", term: "the third of February", cueText: "3 February", acceptedAnswers: ["third of February"] },
  { id: "a2-date-14-feb", term: "the fourteenth of February", cueText: "14/2", acceptedAnswers: ["fourteenth of February"] },
  { id: "a2-date-21-june", term: "the twenty-first of June", cueText: "21 June", acceptedAnswers: ["twenty-first of June", "the twenty first of June", "twenty first of June"] },
  { id: "a2-date-31-july", term: "the thirty-first of July", cueText: "31/7", acceptedAnswers: ["thirty-first of July", "the thirty first of July", "thirty first of July"] },
  { id: "a2-date-9-sept", term: "the ninth of September", cueText: "9 September", acceptedAnswers: ["ninth of September"] },
  { id: "a2-date-15-oct", term: "the fifteenth of October", cueText: "15/10", acceptedAnswers: ["fifteenth of October"] },
  { id: "a2-date-2-nov", term: "the second of November", cueText: "2 November", acceptedAnswers: ["second of November"] },
  { id: "a2-date-25-dec", term: "the twenty-fifth of December", cueText: "25 December", acceptedAnswers: ["twenty-fifth of December", "the twenty fifth of December", "twenty fifth of December"] },
  { id: "a2-date-30-april", term: "the thirtieth of April", cueText: "30/4", acceptedAnswers: ["thirtieth of April"] },
];
const a2YearEntries = [
  { id: "a2-year-1807", term: "eighteen oh seven", cueText: "1807", acceptedAnswers: ["eighteen zero seven"] },
  { id: "a2-year-1936", term: "nineteen thirty-six", cueText: "1936", acceptedAnswers: ["nineteen thirty six"] },
  { id: "a2-year-1984", term: "nineteen eighty-four", cueText: "1984", acceptedAnswers: ["nineteen eighty four"] },
  { id: "a2-year-1999", term: "nineteen ninety-nine", cueText: "1999", acceptedAnswers: ["nineteen ninety nine"] },
  { id: "a2-year-2000", term: "two thousand", cueText: "2000", acceptedAnswers: [] },
  { id: "a2-year-2008", term: "two thousand and eight", cueText: "2008", acceptedAnswers: ["two thousand eight"] },
  { id: "a2-year-2011", term: "twenty eleven", cueText: "2011", acceptedAnswers: ["two thousand and eleven", "two thousand eleven"] },
  { id: "a2-year-2018", term: "twenty eighteen", cueText: "2018", acceptedAnswers: ["two thousand and eighteen", "two thousand eighteen"] },
  { id: "a2-year-2025", term: "twenty twenty-five", cueText: "2025", acceptedAnswers: ["twenty twenty five", "two thousand and twenty-five", "two thousand twenty-five"] },
  { id: "a2-year-2100", term: "twenty-one hundred", cueText: "2100", acceptedAnswers: ["twenty one hundred", "two thousand one hundred", "two thousand and one hundred"] },
];

const A2_GO_HAVE_GET_IMAGE_BASE = "/images/vocab/go-have-get-a2";

function a2GoHaveGetPhrase(id, term, headVerb, complement, { image = null, pendingImage = null, acceptedAnswers = [] } = {}) {
  const pastAnswer = headVerb === "go" ? "went" : headVerb === "have" ? "had" : "got";
  return objectEntry(id, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    headVerb,
    complement,
    cueText: `_____ ${complement}`,
    gapAnswers: [headVerb],
    pastAnswer,
    pendingImage,
  });
}
const a2GoHaveGetEntries = [
  a2GoHaveGetPhrase("a2-ghg-go-bus", "go by bus", "go", "by bus", { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-to-work-by-bus.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-walk", "go for a walk", "go", "for a walk", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-for-a-walk.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-home", "go home", "go", "home", { image: `${TYPICAL_DAY_IMAGE_BASE}/go-home.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-out", "go out", "go", "out", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-out.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-shopping", "go shopping", "go", "shopping", { image: `${TYPICAL_DAY_IMAGE_BASE}/go-shopping.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-restaurant", "go to a restaurant", "go", "to a restaurant", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/go-to-a-restaurant.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-bed", "go to bed", "go", "to bed", { image: `${TYPICAL_DAY_IMAGE_BASE}/go-bed.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-church", "go to church", "go", "to church", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/go-to-church.png`, acceptedAnswers: ["go to a mosque"] }),
  a2GoHaveGetPhrase("a2-ghg-go-beach", "go to the beach", "go", "to the beach", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-to-the-beach.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-back-work", "go back to work", "go", "back to work", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/go-back-to-work.png` }),
  a2GoHaveGetPhrase("a2-ghg-go-holiday", "go on holiday", "go", "on holiday", { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/travelling.png` }),
  a2GoHaveGetPhrase("a2-ghg-have-car", "have a car", "have", "a car", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/have-a-car.png`, acceptedAnswers: ["have a bike"] }),
  a2GoHaveGetPhrase("a2-ghg-have-hair", "have long hair", "have", "long hair", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/have-long-hair.png` }),
  a2GoHaveGetPhrase("a2-ghg-have-breakfast", "have breakfast", "have", "breakfast", { image: `${TYPICAL_DAY_IMAGE_BASE}/have-breakfast.png`, acceptedAnswers: ["have lunch", "have dinner"] }),
  a2GoHaveGetPhrase("a2-ghg-have-drink", "have a drink", "have", "a drink", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/have-a-drink.png` }),
  a2GoHaveGetPhrase("a2-ghg-have-good-time", "have a good time", "have", "a good time", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/have-a-good-time.png` }),
  a2GoHaveGetPhrase("a2-ghg-have-sandwich", "have a sandwich", "have", "a sandwich", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/have-a-sandwich.png` }),
  a2GoHaveGetPhrase("a2-ghg-have-shower", "have a shower", "have", "a shower", { image: `${TYPICAL_DAY_IMAGE_BASE}/have-a-shower.png`, acceptedAnswers: ["have a bath"] }),
  a2GoHaveGetPhrase("a2-ghg-have-swim", "have a swim", "have", "a swim", { image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/swimming.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-newspaper", "get a newspaper", "get", "a newspaper", { pendingImage: "/images/vocab/go-have-get-a2/get-a-newspaper.png" }),
  a2GoHaveGetPhrase("a2-ghg-get-taxi", "get a taxi", "get", "a taxi", { image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/get-a-taxi.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-email", "get an email", "get", "an email", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/get-an-email.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-dressed", "get dressed", "get", "dressed", { image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/get-dressed.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-home", "get home", "get", "home", { image: `${TYPICAL_DAY_IMAGE_BASE}/go-home.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-airport", "get to the airport", "get", "to the airport", { image: `${A2_GO_HAVE_GET_IMAGE_BASE}/get-to-the-airport.png` }),
  a2GoHaveGetPhrase("a2-ghg-get-up", "get up", "get", "up", { image: `${TYPICAL_DAY_IMAGE_BASE}/get-up.png` }),
];
const a2GoHaveGetPastEntries = [
  { id: "a2-ghg-past-shopping", sentence: "Yesterday I ____ shopping after work.", answer: "went", acceptedAnswers: ["went"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-time", sentence: "We ____ a really good time at the party.", answer: "had", acceptedAnswers: ["had"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-home", sentence: "I ____ home at about eleven. (arrive)", answer: "got", acceptedAnswers: ["got"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-email", sentence: "She ____ an email from her boss yesterday.", answer: "got", acceptedAnswers: ["got"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-breakfast", sentence: "We ____ breakfast in a café.", answer: "had", acceptedAnswers: ["had"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-beach", sentence: "They ____ to the beach on Sunday.", answer: "went", acceptedAnswers: ["went"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-up", sentence: "I ____ up very late this morning.", answer: "got", acceptedAnswers: ["got"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-walk", sentence: "After dinner, we ____ for a walk.", answer: "went", acceptedAnswers: ["went"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-shower", sentence: "I ____ a shower before work.", answer: "had", acceptedAnswers: ["had"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-taxi", sentence: "It was raining, so we ____ a taxi.", answer: "got", acceptedAnswers: ["got"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-out", sentence: "We ____ out on Friday night.", answer: "went", acceptedAnswers: ["went"], options: ["went", "had", "got"] },
  { id: "a2-ghg-past-sandwich", sentence: "I ____ a sandwich for lunch.", answer: "had", acceptedAnswers: ["had"], options: ["went", "had", "got"] },
];

const A2_HOUSE_SCENE_IMAGE = "/images/vocab/house-a2/cutaway-house.png";
function a2HouseEntry(id, term, category, hotspotNumber, hotspotX, hotspotY, acceptedAnswers = []) {
  return objectEntry(id, term, String(hotspotNumber), term, [term, ...acceptedAnswers], null, null, {
    category,
    hotspotNumber,
    hotspotX,
    hotspotY,
  });
}
const a2HouseEntries = [
  a2HouseEntry("a2-house-bathroom", "a bathroom", "room", 1, 14, 30, ["bathroom"]),
  a2HouseEntry("a2-house-bedroom", "a bedroom", "room", 2, 39, 31, ["bedroom"]),
  a2HouseEntry("a2-house-dining-room", "a dining room", "room", 3, 62, 76, ["dining room"]),
  a2HouseEntry("a2-house-garage", "a garage", "room", 4, 89, 69, ["garage"]),
  a2HouseEntry("a2-house-garden", "a garden", "room", 5, 35, 91, ["garden"]),
  a2HouseEntry("a2-house-hall", "a hall", "room", 6, 37, 68, ["hall"]),
  a2HouseEntry("a2-house-kitchen", "a kitchen", "room", 7, 66, 65, ["kitchen"]),
  a2HouseEntry("a2-house-living-room", "a living room", "room", 8, 17, 66, ["living room"]),
  a2HouseEntry("a2-house-study", "a study", "room", 9, 68, 32, ["study"]),
  a2HouseEntry("a2-house-toilet", "a toilet", "room", 10, 56, 33, ["toilet"]),
  a2HouseEntry("a2-house-balcony", "a balcony", "part", 11, 88, 34, ["balcony"]),
  a2HouseEntry("a2-house-ceiling", "a ceiling", "part", 12, 20, 51, ["ceiling"]),
  a2HouseEntry("a2-house-floor", "a floor", "part", 13, 28, 82, ["floor"]),
  a2HouseEntry("a2-house-stairs", "stairs", "part", 14, 45, 67, ["the stairs"]),
  a2HouseEntry("a2-house-wall", "a wall", "part", 15, 50, 67, ["wall"]),
  a2HouseEntry("a2-house-armchair", "an armchair", "thing", 16, 8, 73, ["armchair"]),
  a2HouseEntry("a2-house-bath", "a bath", "thing", 17, 10, 37, ["bath", "bathtub"]),
  a2HouseEntry("a2-house-bed", "a bed", "thing", 18, 36, 37, ["bed"]),
  a2HouseEntry("a2-house-carpet", "a carpet", "thing", 19, 31, 44, ["carpet", "rug"]),
  a2HouseEntry("a2-house-cooker", "a cooker", "thing", 20, 65, 70, ["cooker", "stove"]),
  a2HouseEntry("a2-house-cupboard", "a cupboard", "thing", 21, 76, 65, ["cupboard"]),
  a2HouseEntry("a2-house-dishwasher", "a dishwasher", "thing", 22, 71, 72, ["dishwasher"]),
  a2HouseEntry("a2-house-fireplace", "a fireplace", "thing", 23, 17, 69, ["fireplace"]),
  a2HouseEntry("a2-house-fridge", "a fridge", "thing", 24, 55, 68, ["fridge", "refrigerator"]),
  a2HouseEntry("a2-house-light", "a light", "thing", 25, 37, 54, ["light"]),
  a2HouseEntry("a2-house-microwave", "a microwave", "thing", 26, 59, 69, ["microwave"]),
  a2HouseEntry("a2-house-mirror", "a mirror", "thing", 27, 19, 31, ["mirror"]),
  a2HouseEntry("a2-house-plant", "a plant", "thing", 28, 27, 76, ["plant"]),
  a2HouseEntry("a2-house-shelf", "a shelf", "thing", 29, 70, 25, ["shelf"]),
  a2HouseEntry("a2-house-shower", "a shower", "thing", 30, 10, 28, ["shower"]),
  a2HouseEntry("a2-house-sofa", "a sofa", "thing", 31, 23, 70, ["sofa", "couch"]),
  a2HouseEntry("a2-house-wardrobe", "a wardrobe", "thing", 32, 46, 31, ["wardrobe"]),
  a2HouseEntry("a2-house-washing-machine", "a washing machine", "thing", 33, 75, 73, ["washing machine"]),
];
const A2_HOUSE_HOTSPOT_ROUNDS = [
  {
    id: "rooms",
    title: "Rooms",
    description: "Find the ten rooms and areas in the whole house.",
    categories: ["room"],
  },
  {
    id: "parts",
    title: "Parts of the house",
    description: "Now focus on the building itself, not the furniture.",
    categories: ["part"],
  },
  {
    id: "upstairs-things",
    title: "Things upstairs",
    description: "Look closely at the bathroom, bedroom, toilet, and study.",
    entryIds: [
      "a2-house-bath",
      "a2-house-bed",
      "a2-house-carpet",
      "a2-house-mirror",
      "a2-house-shelf",
      "a2-house-shower",
      "a2-house-wardrobe",
    ],
    viewBox: { x: 0, y: 17, width: 78, height: 34 },
  },
  {
    id: "living-hall-things",
    title: "Living room and hall",
    description: "Focus on the furniture and fittings on the left downstairs.",
    entryIds: [
      "a2-house-armchair",
      "a2-house-fireplace",
      "a2-house-light",
      "a2-house-plant",
      "a2-house-sofa",
    ],
    viewBox: { x: 0, y: 48, width: 48, height: 37 },
  },
  {
    id: "kitchen-dining-things",
    title: "Kitchen and dining",
    description: "Focus on the appliances and storage on the right downstairs.",
    entryIds: [
      "a2-house-cooker",
      "a2-house-cupboard",
      "a2-house-dishwasher",
      "a2-house-fridge",
      "a2-house-microwave",
      "a2-house-washing-machine",
    ],
    viewBox: { x: 48, y: 51, width: 35, height: 35 },
  },
];
const a2HouseLocationEntries = [
  { id: "a2-house-location-fridge", sentence: "Where do you normally find a fridge? In ____.", answer: "the kitchen", acceptedAnswers: ["the kitchen", "kitchen"], options: ["the kitchen", "the bedroom", "the bathroom", "the study"] },
  { id: "a2-house-location-cooker", sentence: "Where do you normally find a cooker? In ____.", answer: "the kitchen", acceptedAnswers: ["the kitchen", "kitchen"], options: ["the kitchen", "the bedroom", "the garage", "the hall"] },
  { id: "a2-house-location-dishwasher", sentence: "Where do you normally find a dishwasher? In ____.", answer: "the kitchen", acceptedAnswers: ["the kitchen", "kitchen"], options: ["the kitchen", "the bathroom", "the study", "the garden"] },
  { id: "a2-house-location-microwave", sentence: "Where do you normally find a microwave? In ____.", answer: "the kitchen", acceptedAnswers: ["the kitchen", "kitchen"], options: ["the kitchen", "the bedroom", "the toilet", "the garage"] },
  { id: "a2-house-location-bed", sentence: "Where do you normally find a bed? In ____.", answer: "the bedroom", acceptedAnswers: ["the bedroom", "bedroom"], options: ["the bedroom", "the kitchen", "the garage", "the hall"] },
  { id: "a2-house-location-wardrobe", sentence: "Where do you normally find a wardrobe? In ____.", answer: "the bedroom", acceptedAnswers: ["the bedroom", "bedroom"], options: ["the bedroom", "the bathroom", "the garden", "the dining room"] },
  { id: "a2-house-location-bath", sentence: "Where do you normally find a bath? In ____.", answer: "the bathroom", acceptedAnswers: ["the bathroom", "bathroom"], options: ["the bathroom", "the kitchen", "the study", "the garage"] },
  { id: "a2-house-location-shower", sentence: "Where do you normally find a shower? In ____.", answer: "the bathroom", acceptedAnswers: ["the bathroom", "bathroom"], options: ["the bathroom", "the living room", "the hall", "the garden"] },
  { id: "a2-house-location-sofa", sentence: "Where do you normally find a sofa? In ____.", answer: "the living room", acceptedAnswers: ["the living room", "living room"], options: ["the living room", "the bathroom", "the garage", "the study"] },
  { id: "a2-house-location-armchair", sentence: "Where do you normally find an armchair? In ____.", answer: "the living room", acceptedAnswers: ["the living room", "living room"], options: ["the living room", "the toilet", "the garage", "the kitchen"] },
  { id: "a2-house-location-car", sentence: "Where do you normally keep a car at home? In ____.", answer: "the garage", acceptedAnswers: ["the garage", "garage"], options: ["the garage", "the study", "the bathroom", "the dining room"] },
  { id: "a2-house-location-desk", sentence: "Where do you normally work quietly at home? In ____.", answer: "the study", acceptedAnswers: ["the study", "study"], options: ["the study", "the toilet", "the garage", "the balcony"] },
];
const a2HouseClueEntries = [
  { id: "a2-house-clue-bedroom", sentence: "You sleep in this room. It is ____.", answer: "a bedroom", acceptedAnswers: ["a bedroom", "bedroom"], options: ["a bedroom", "a study", "a dining room", "a hall"] },
  { id: "a2-house-clue-cooker", sentence: "You cook food on this. It is ____.", answer: "a cooker", acceptedAnswers: ["a cooker", "cooker"], options: ["a cooker", "a fridge", "a dishwasher", "a microwave"] },
  { id: "a2-house-clue-fridge", sentence: "This keeps food cold. It is ____.", answer: "a fridge", acceptedAnswers: ["a fridge", "fridge"], options: ["a fridge", "a cooker", "a cupboard", "a washing machine"] },
  { id: "a2-house-clue-washer", sentence: "This washes your clothes. It is ____.", answer: "a washing machine", acceptedAnswers: ["a washing machine", "washing machine"], options: ["a washing machine", "a dishwasher", "a shower", "a bath"] },
  { id: "a2-house-clue-dishwasher", sentence: "This washes plates and cups. It is ____.", answer: "a dishwasher", acceptedAnswers: ["a dishwasher", "dishwasher"], options: ["a dishwasher", "a washing machine", "a fridge", "a cooker"] },
  { id: "a2-house-clue-sofa", sentence: "Several people can sit on this together. It is ____.", answer: "a sofa", acceptedAnswers: ["a sofa", "sofa"], options: ["a sofa", "an armchair", "a bed", "a carpet"] },
  { id: "a2-house-clue-stairs", sentence: "You go up these to reach the next floor. They are ____.", answer: "stairs", acceptedAnswers: ["stairs", "the stairs"], options: ["stairs", "a balcony", "a ceiling", "a wall"] },
  { id: "a2-house-clue-mirror", sentence: "You look at yourself in this. It is ____.", answer: "a mirror", acceptedAnswers: ["a mirror", "mirror"], options: ["a mirror", "a light", "a shelf", "a plant"] },
  { id: "a2-house-clue-wardrobe", sentence: "You put clothes in this. It is ____.", answer: "a wardrobe", acceptedAnswers: ["a wardrobe", "wardrobe"], options: ["a wardrobe", "a cupboard", "a shelf", "a fridge"] },
  { id: "a2-house-clue-dining", sentence: "You often eat meals in this room. It is ____.", answer: "a dining room", acceptedAnswers: ["a dining room", "dining room"], options: ["a dining room", "a study", "a bedroom", "a garage"] },
  { id: "a2-house-clue-study", sentence: "You work or study quietly in this room. It is ____.", answer: "a study", acceptedAnswers: ["a study", "study"], options: ["a study", "a hall", "a toilet", "a garage"] },
  { id: "a2-house-clue-ceiling", sentence: "This is the surface above your head in a room. It is ____.", answer: "a ceiling", acceptedAnswers: ["a ceiling", "ceiling"], options: ["a ceiling", "a floor", "a wall", "a balcony"] },
  { id: "a2-house-clue-fireplace", sentence: "A fire burns here to make a room warm. It is ____.", answer: "a fireplace", acceptedAnswers: ["a fireplace", "fireplace"], options: ["a fireplace", "a cooker", "a light", "a microwave"] },
  { id: "a2-house-clue-balcony", sentence: "This is an outdoor platform above the ground floor. It is ____.", answer: "a balcony", acceptedAnswers: ["a balcony", "balcony"], options: ["a balcony", "a garden", "a garage", "a hall"] },
  { id: "a2-house-clue-hall", sentence: "You enter the house and often find the stairs here. It is ____.", answer: "a hall", acceptedAnswers: ["a hall", "hall"], options: ["a hall", "a kitchen", "a bathroom", "a study"] },
  { id: "a2-house-clue-cupboard", sentence: "You store food, plates, or other things inside this. It is ____.", answer: "a cupboard", acceptedAnswers: ["a cupboard", "cupboard"], options: ["a cupboard", "a shelf", "a fridge", "a wardrobe"] },
];

const A2_PREPOSITIONS_IMAGE_BASE = "/images/vocab/a2-prepositions";

function a2PrepositionEntry(id, term, example, imagePrompt) {
  return objectEntry(`a2-prep-${id}`, term, term.toUpperCase(), term, [term], null, `${A2_PREPOSITIONS_IMAGE_BASE}/${id}.png`, {
    example,
    imagePrompt,
  });
}

const a2PrepositionPositionEntries = [
  a2PrepositionEntry("in", "in", "in the wardrobe", "A person or subtle translucent figure clearly inside an open wardrobe. The wardrobe surrounds the figure so the spatial relationship IN is unmistakable."),
  a2PrepositionEntry("in-front-of", "in front of", "in front of the table", "A person clearly standing in front of a table, closer to the viewer than the table. Make depth and overlap very clear."),
  a2PrepositionEntry("on", "on", "on the chair", "A small object or figure clearly resting on the seat of a chair, with direct contact between the two."),
  a2PrepositionEntry("under", "under", "under the bed", "A person or object clearly underneath a bed, visible beneath the bed frame."),
  a2PrepositionEntry("behind", "behind", "behind the sofa", "A person partly hidden behind the back of a sofa. The sofa should visibly block part of the figure."),
  a2PrepositionEntry("between", "between", "between the windows", "A person or object positioned exactly between two clearly separated windows."),
  a2PrepositionEntry("opposite", "opposite", "opposite the woman", "Two adults clearly facing one another from opposite sides of a room, with open space between them."),
  a2PrepositionEntry("next-to", "next to", "next to the armchair", "A person or object immediately beside an armchair, clearly close but not touching or sitting on it."),
  a2PrepositionEntry("over", "over", "over the mirror", "A small object or figure directly above a wall mirror, vertically aligned with it and not touching it."),
];

const a2PrepositionMovementEntries = [
  a2PrepositionEntry("from", "from", "from the bedroom", "An adult clearly leaving a bedroom and moving away from it. Show the open bedroom doorway behind them and a clear directional movement away from the room."),
  a2PrepositionEntry("to", "to", "to the bathroom", "An adult clearly walking toward a bathroom doorway. Make the bathroom destination visually recognisable and the direction of travel obvious."),
  a2PrepositionEntry("into", "into", "into the wardrobe", "A figure moving from outside an open wardrobe into its interior. Show movement crossing the wardrobe threshold."),
  a2PrepositionEntry("out-of", "out of", "out of the wardrobe", "A figure emerging from inside an open wardrobe to the outside. The direction must clearly be outward."),
  a2PrepositionEntry("through", "through", "through the window", "A figure clearly passing through an open window from one side to the other. Show the figure crossing the window opening."),
  a2PrepositionEntry("up", "up", "up the stairs", "An adult walking upward on a staircase, clearly moving from the lower steps to the higher steps."),
  a2PrepositionEntry("down", "down", "down the stairs", "An adult walking downward on a staircase, clearly moving from the higher steps toward the lower floor."),
];

function withPrepositionOptions(entries, optionMap, prefix) {
  return entries.map((entry) => ({
    ...entry,
    id: `${prefix}-${entry.id}`,
    options: optionMap[entry.term],
  }));
}

const a2PrepositionPositionChoiceEntries = withPrepositionOptions(a2PrepositionPositionEntries, {
  in: ["in", "on", "under", "behind"],
  "in front of": ["in front of", "behind", "next to", "opposite"],
  on: ["on", "under", "in", "over"],
  under: ["under", "on", "behind", "in"],
  behind: ["behind", "in front of", "next to", "between"],
  between: ["between", "next to", "opposite", "behind"],
  opposite: ["opposite", "next to", "behind", "in front of"],
  "next to": ["next to", "between", "opposite", "in front of"],
  over: ["over", "under", "on", "behind"],
}, "a2-prep-place-choice");

const a2PrepositionMovementChoiceEntries = withPrepositionOptions(a2PrepositionMovementEntries, {
  from: ["from", "to", "into", "out of"],
  to: ["to", "from", "into", "through"],
  into: ["into", "out of", "to", "through"],
  "out of": ["out of", "into", "from", "through"],
  through: ["through", "into", "out of", "to"],
  up: ["up", "down", "to", "from"],
  down: ["down", "up", "from", "to"],
}, "a2-prep-move-choice");

const a2PrepositionVisualEntries = [...a2PrepositionPositionEntries, ...a2PrepositionMovementEntries];

const a2PrepositionContextEntries = [
  { id: "a2-prep-context-01", sentence: "My coat is _____ the wardrobe.", answer: "in", options: ["in", "on", "under", "behind"] },
  { id: "a2-prep-context-02", sentence: "There's a small table _____ the sofa.", answer: "in front of", options: ["in front of", "behind", "between", "under"] },
  { id: "a2-prep-context-03", sentence: "Your phone is _____ the chair.", answer: "on", options: ["on", "in", "under", "over"] },
  { id: "a2-prep-context-04", sentence: "I found my shoes _____ the bed.", answer: "under", options: ["under", "on", "in", "over"] },
  { id: "a2-prep-context-05", sentence: "The cat is hiding _____ the sofa.", answer: "behind", options: ["behind", "in front of", "between", "opposite"] },
  { id: "a2-prep-context-06", sentence: "There's a picture _____ the two windows.", answer: "between", options: ["between", "next to", "opposite", "behind"] },
  { id: "a2-prep-context-07", sentence: "The bank is _____ the supermarket, on the other side of the road.", answer: "opposite", options: ["opposite", "next to", "behind", "between"] },
  { id: "a2-prep-context-08", sentence: "The lamp is _____ the armchair.", answer: "next to", options: ["next to", "between", "opposite", "under"] },
  { id: "a2-prep-context-09", sentence: "There's a light _____ the mirror.", answer: "over", options: ["over", "under", "in", "on"] },
  { id: "a2-prep-context-10", sentence: "The plane is flying _____ the clouds.", answer: "above", options: ["above", "below", "under", "in"] },
  { id: "a2-prep-context-11", sentence: "The garage is _____ our flat.", answer: "below", options: ["below", "above", "over", "on"] },
  { id: "a2-prep-context-12", sentence: "She walked _____ the bedroom and went downstairs.", answer: "from", options: ["from", "to", "into", "through"] },
  { id: "a2-prep-context-13", sentence: "We drove _____ the airport after breakfast.", answer: "to", options: ["to", "from", "out of", "through"] },
  { id: "a2-prep-context-14", sentence: "He opened the door and walked _____ the room.", answer: "into", options: ["into", "out of", "from", "up"] },
  { id: "a2-prep-context-15", sentence: "She took her coat _____ the wardrobe.", answer: "out of", options: ["out of", "into", "through", "to"] },
  { id: "a2-prep-context-16", sentence: "The cat climbed _____ the open window.", answer: "through", options: ["through", "into", "to", "from"] },
  { id: "a2-prep-context-17", sentence: "We walked _____ the stairs to the second floor.", answer: "up", options: ["up", "down", "through", "to"] },
  { id: "a2-prep-context-18", sentence: "He ran _____ the stairs to answer the front door.", answer: "down", options: ["down", "up", "into", "from"] },
  { id: "a2-prep-context-19", sentence: "I walked _____ the kitchen to get some water.", answer: "into", options: ["into", "in", "from", "out of"] },
  { id: "a2-prep-context-20", sentence: "The children came _____ the classroom when the lesson finished.", answer: "out of", options: ["out of", "into", "to", "through"] },
  { id: "a2-prep-context-21", sentence: "The café is _____ the cinema and the bank.", answer: "between", options: ["between", "opposite", "next to", "behind"] },
  { id: "a2-prep-context-22", sentence: "The woman is sitting _____ me, so we're facing each other.", answer: "opposite", options: ["opposite", "next to", "behind", "under"] },
  { id: "a2-prep-context-23", sentence: "He went _____ the stairs slowly because his leg hurt.", answer: "up", options: ["up", "into", "from", "through"] },
  { id: "a2-prep-context-24", sentence: "I came _____ the bathroom and went back to my bedroom.", answer: "from", options: ["from", "to", "into", "up"] },
];

const A2_FOOD_IMAGE_BASE = "/images/vocab/a2-food";

function a2FoodEntry(id, term, sourceGroup, image, acceptedAnswers = []) {
  return objectEntry(`a2-food-${id}`, term, term.toUpperCase(), term, [term, ...acceptedAnswers], null, image, {
    sourceGroup,
  });
}

const a2FoodBreakfastEntries = [
  a2FoodEntry("bread", "bread", "breakfast", `${FOOD_IMAGE_BASE}/bread.png`),
  a2FoodEntry("butter", "butter", "breakfast", `${FOOD_IMAGE_BASE}/butter.png`),
  a2FoodEntry("cereal", "cereal", "breakfast", `${FOOD_IMAGE_BASE}/cereal.png`),
  a2FoodEntry("cheese", "cheese", "breakfast", `${FOOD_IMAGE_BASE}/cheese.png`),
  a2FoodEntry("coffee", "coffee", "breakfast", `${FOOD_IMAGE_BASE}/coffee.png`),
  a2FoodEntry("eggs", "eggs", "breakfast", `${FOOD_IMAGE_BASE}/egg.png`, ["egg"]),
  a2FoodEntry("jam", "jam", "breakfast", `${A2_FOOD_IMAGE_BASE}/jam.png`),
  a2FoodEntry("orange-juice", "orange juice", "breakfast", `${FOOD_IMAGE_BASE}/orange juice.png`, ["juice"]),
  a2FoodEntry("milk", "milk", "breakfast", `${FOOD_IMAGE_BASE}/milk.png`),
  a2FoodEntry("sugar", "sugar", "breakfast", `${FOOD_IMAGE_BASE}/sugar.png`),
  a2FoodEntry("tea", "tea", "breakfast", `${FOOD_IMAGE_BASE}/tea.png`),
  a2FoodEntry("toast", "toast", "breakfast", `${A2_FOOD_IMAGE_BASE}/toast.png`),
];

const a2FoodMealEntries = [
  a2FoodEntry("fish", "fish", "lunch-dinner", `${FOOD_IMAGE_BASE}/fish.png`),
  a2FoodEntry("herbs", "herbs", "lunch-dinner", `${A2_FOOD_IMAGE_BASE}/herbs.png`, ["herb"]),
  a2FoodEntry("meat", "meat", "lunch-dinner", `${FOOD_IMAGE_BASE}/meat.png`),
  a2FoodEntry("olive-oil", "olive oil", "lunch-dinner", `${A2_FOOD_IMAGE_BASE}/olive-oil.png`, ["oil"]),
  a2FoodEntry("pasta", "pasta", "lunch-dinner", `${FOOD_IMAGE_BASE}/pasta.png`),
  a2FoodEntry("rice", "rice", "lunch-dinner", `${FOOD_IMAGE_BASE}/rice.png`),
  a2FoodEntry("salad", "salad", "lunch-dinner", `${FOOD_IMAGE_BASE}/salad.png`),
  a2FoodEntry("seafood", "seafood", "lunch-dinner", `${A2_FOOD_IMAGE_BASE}/seafood.png`),
  a2FoodEntry("spices", "spices", "lunch-dinner", `${A2_FOOD_IMAGE_BASE}/spices.png`, ["spice"]),
];

const a2FoodVegetableEntries = [
  a2FoodEntry("carrots", "carrots", "vegetables", `${A2_FOOD_IMAGE_BASE}/carrots.png`, ["carrot"]),
  a2FoodEntry("chips", "chips", "vegetables", `${A2_FOOD_IMAGE_BASE}/chips.png`, ["chip", "French fries", "French fry"]),
  a2FoodEntry("lettuce", "lettuce", "vegetables", `${A2_FOOD_IMAGE_BASE}/lettuce.png`, ["a lettuce"]),
  a2FoodEntry("mushrooms", "mushrooms", "vegetables", `${A2_FOOD_IMAGE_BASE}/mushrooms.png`, ["mushroom"]),
  a2FoodEntry("onions", "onions", "vegetables", `${A2_FOOD_IMAGE_BASE}/onions.png`, ["onion"]),
  a2FoodEntry("peas", "peas", "vegetables", `${A2_FOOD_IMAGE_BASE}/peas.png`, ["pea"]),
  a2FoodEntry("peppers", "peppers", "vegetables", `${A2_FOOD_IMAGE_BASE}/peppers.png`, ["pepper"]),
  a2FoodEntry("potatoes", "potatoes", "vegetables", `${FOOD_IMAGE_BASE}/potatoes.png`, ["potato"]),
  a2FoodEntry("tomatoes", "tomatoes", "vegetables", `${A2_FOOD_IMAGE_BASE}/tomatoes.png`, ["tomato"]),
];

const a2FoodFruitEntries = [
  a2FoodEntry("apples", "apples", "fruit", `${A2_FOOD_IMAGE_BASE}/apples.png`, ["apple"]),
  a2FoodEntry("bananas", "bananas", "fruit", `${A2_FOOD_IMAGE_BASE}/bananas.png`, ["banana"]),
  a2FoodEntry("oranges", "oranges", "fruit", `${A2_FOOD_IMAGE_BASE}/oranges.png`, ["orange"]),
  a2FoodEntry("pineapple", "pineapple", "fruit", `${A2_FOOD_IMAGE_BASE}/pineapple.png`, ["a pineapple"]),
  a2FoodEntry("strawberries", "strawberries", "fruit", `${A2_FOOD_IMAGE_BASE}/strawberries.png`, ["strawberry"]),
];

const a2FoodDessertEntries = [
  a2FoodEntry("cake", "cake", "desserts", `${A2_FOOD_IMAGE_BASE}/cake.png`),
  a2FoodEntry("fruit-salad", "fruit salad", "desserts", `${A2_FOOD_IMAGE_BASE}/fruit-salad.png`),
  a2FoodEntry("ice-cream", "ice cream", "desserts", `${A2_FOOD_IMAGE_BASE}/ice-cream.png`),
];

const a2FoodSnackEntries = [
  a2FoodEntry("biscuits", "biscuits", "snacks", `${A2_FOOD_IMAGE_BASE}/biscuits.png`, ["biscuit"]),
  a2FoodEntry("chocolate", "chocolate", "snacks", `${FOOD_IMAGE_BASE}/chocolate.png`),
  a2FoodEntry("crisps", "crisps", "snacks", `${A2_FOOD_IMAGE_BASE}/crisps.png`, ["crisp"]),
  a2FoodEntry("nuts", "nuts", "snacks", `${A2_FOOD_IMAGE_BASE}/nuts.png`, ["nut"]),
  a2FoodEntry("sandwich", "sandwich", "snacks", `${FOOD_IMAGE_BASE}/sandwich.png`, ["a sandwich"]),
  a2FoodEntry("sweets", "sweets", "snacks", `${A2_FOOD_IMAGE_BASE}/sweets.png`, ["sweet"]),
];

const a2FoodEntries = [
  ...a2FoodBreakfastEntries,
  ...a2FoodMealEntries,
  ...a2FoodVegetableEntries,
  ...a2FoodFruitEntries,
  ...a2FoodDessertEntries,
  ...a2FoodSnackEntries,
];

const a2FoodClueEntries = [
  { id: "a2-food-clue-01", sentence: "You often put this on bread or toast. It is made from fruit and sugar.", answer: "jam", options: ["jam", "butter", "cheese", "cereal"] },
  { id: "a2-food-clue-02", sentence: "You make this by heating slices of bread until they are brown.", answer: "toast", options: ["toast", "cereal", "cake", "pasta"] },
  { id: "a2-food-clue-03", sentence: "People often eat this from a bowl with milk for breakfast.", answer: "cereal", options: ["cereal", "rice", "salad", "peas"] },
  { id: "a2-food-clue-04", sentence: "This is a hot drink made from coffee beans.", answer: "coffee", options: ["coffee", "tea", "milk", "orange juice"] },
  { id: "a2-food-clue-05", sentence: "Salmon and tuna are examples of this.", answer: "fish", options: ["fish", "meat", "seafood", "herbs"] },
  { id: "a2-food-clue-06", sentence: "Chicken, steak and ham are examples of this.", answer: "meat", options: ["meat", "fish", "seafood", "salad"] },
  { id: "a2-food-clue-07", sentence: "You can add these leaves to food to give it more flavour.", answer: "herbs", options: ["herbs", "peas", "lettuce", "spices"] },
  { id: "a2-food-clue-08", sentence: "You use this liquid for cooking or putting on salad.", answer: "olive oil", options: ["olive oil", "milk", "orange juice", "coffee"] },
  { id: "a2-food-clue-09", sentence: "This food often includes lettuce, tomato and other vegetables mixed together.", answer: "salad", options: ["salad", "pasta", "rice", "seafood"] },
  { id: "a2-food-clue-10", sentence: "These add strong flavours to food and often come as powders or seeds.", answer: "spices", options: ["spices", "herbs", "peas", "nuts"] },
  { id: "a2-food-clue-11", sentence: "These are long orange vegetables that grow underground.", answer: "carrots", options: ["carrots", "peppers", "onions", "potatoes"] },
  { id: "a2-food-clue-12", sentence: "In British English, these are pieces of potato that are fried and usually eaten hot.", answer: "chips", options: ["chips", "crisps", "potatoes", "nuts"] },
  { id: "a2-food-clue-13", sentence: "This green vegetable is often used as the base of a salad.", answer: "lettuce", options: ["lettuce", "peas", "peppers", "carrots"] },
  { id: "a2-food-clue-14", sentence: "These can be white or brown and have a round top and a short stem.", answer: "mushrooms", options: ["mushrooms", "onions", "tomatoes", "peas"] },
  { id: "a2-food-clue-15", sentence: "These vegetables can make your eyes water when you cut them.", answer: "onions", options: ["onions", "carrots", "peppers", "mushrooms"] },
  { id: "a2-food-clue-16", sentence: "These are small round green vegetables.", answer: "peas", options: ["peas", "onions", "carrots", "peppers"] },
  { id: "a2-food-clue-17", sentence: "These vegetables can be red, green, yellow or orange and are often used in salads.", answer: "peppers", options: ["peppers", "tomatoes", "carrots", "onions"] },
  { id: "a2-food-clue-18", sentence: "You can boil, roast, mash or fry these vegetables.", answer: "potatoes", options: ["potatoes", "tomatoes", "carrots", "mushrooms"] },
  { id: "a2-food-clue-19", sentence: "These are usually red and are common in salads and pasta sauces.", answer: "tomatoes", options: ["tomatoes", "peppers", "onions", "strawberries"] },
  { id: "a2-food-clue-20", sentence: "This long yellow fruit has a thick skin that you remove before eating it.", answer: "bananas", options: ["bananas", "oranges", "apples", "pineapple"] },
  { id: "a2-food-clue-21", sentence: "These citrus fruits have orange skin.", answer: "oranges", options: ["oranges", "apples", "strawberries", "bananas"] },
  { id: "a2-food-clue-22", sentence: "This large tropical fruit has a rough skin and green leaves on top.", answer: "pineapple", options: ["pineapple", "apples", "oranges", "bananas"] },
  { id: "a2-food-clue-23", sentence: "These are small red fruits with tiny seeds on the outside.", answer: "strawberries", options: ["strawberries", "apples", "tomatoes", "oranges"] },
  { id: "a2-food-clue-24", sentence: "This dessert is made by cutting different kinds of fruit into pieces and mixing them together.", answer: "fruit salad", options: ["fruit salad", "cake", "ice cream", "cereal"] },
  { id: "a2-food-clue-25", sentence: "This cold sweet dessert is often sold in flavours such as vanilla or chocolate.", answer: "ice cream", options: ["ice cream", "cake", "fruit salad", "chocolate"] },
  { id: "a2-food-clue-26", sentence: "In British English, these are small sweet baked snacks, often eaten with tea.", answer: "biscuits", options: ["biscuits", "crisps", "sweets", "nuts"] },
  { id: "a2-food-clue-27", sentence: "In British English, these are thin crunchy slices of potato sold in packets.", answer: "crisps", options: ["crisps", "chips", "biscuits", "nuts"] },
  { id: "a2-food-clue-28", sentence: "Almonds and walnuts are examples of these.", answer: "nuts", options: ["nuts", "peas", "crisps", "sweets"] },
  { id: "a2-food-clue-29", sentence: "This snack usually has a filling between two pieces of bread.", answer: "sandwich", options: ["sandwich", "toast", "cake", "biscuits"] },
  { id: "a2-food-clue-30", sentence: "In British English, this word means small pieces of sugary food such as boiled sweets or gummies.", answer: "sweets", options: ["sweets", "biscuits", "crisps", "chocolate"] },
];

const A2_PLACES_IMAGE_BASE = "/images/vocab/a2-places-buildings";

function a2PlaceEntry(id, term, category, image = `${A2_PLACES_IMAGE_BASE}/${id}.png`, acceptedAnswers = []) {
  const withoutArticle = term.replace(/^(?:a|an)\s+/i, "");
  return objectEntry(`a2-place-${id}`, term, term.toUpperCase(), term, [term, withoutArticle, ...acceptedAnswers], null, image, {
    category,
  });
}

const a2EverydayPlaceEntries = [
  a2PlaceEntry("chemist", "a chemist's", "everyday", `${A2_PLACES_IMAGE_BASE}/chemist.png`, ["chemist's", "a pharmacy", "pharmacy"]),
  a2PlaceEntry("church", "a church", "everyday"),
  a2PlaceEntry("department-store", "a department store", "everyday"),
  a2PlaceEntry("hospital", "a hospital", "everyday"),
  a2PlaceEntry("market", "a market", "everyday"),
  a2PlaceEntry("park", "a park", "everyday"),
  a2PlaceEntry("police-station", "a police station", "everyday"),
  a2PlaceEntry("post-office", "a post office", "everyday"),
  a2PlaceEntry("shopping-centre", "a shopping centre", "everyday", undefined, ["a shopping center", "shopping center"]),
  a2PlaceEntry("supermarket", "a supermarket", "everyday"),
  a2PlaceEntry("town-hall", "a town hall", "everyday", undefined, ["a city hall", "city hall"]),
];

const a2AttractionEntries = [
  a2PlaceEntry("art-gallery", "an art gallery", "attractions"),
  a2PlaceEntry("castle", "a castle", "attractions"),
  a2PlaceEntry("museum", "a museum", "attractions"),
  a2PlaceEntry("theatre", "a theatre", "attractions", undefined, ["a theater", "theater"]),
  a2PlaceEntry("zoo", "a zoo", "attractions"),
];

const a2TownFeatureEntries = [
  a2PlaceEntry("bridge", "a bridge", "town"),
  a2PlaceEntry("river", "a river", "town"),
  a2PlaceEntry("road", "a road", "town"),
  a2PlaceEntry("square", "a square", "town"),
  a2PlaceEntry("street", "a street", "town"),
];

const a2TransportPlaceEntries = [
  a2PlaceEntry("bus-station", "a bus station", "transport"),
  a2PlaceEntry("car-park", "a car park", "transport", undefined, ["a parking lot", "parking lot"]),
  a2PlaceEntry("railway-station", "a railway station", "transport", `${A2_PLACES_IMAGE_BASE}/railway-station.png`, ["a train station", "train station"]),
];

const a2PlaceEntries = [
  ...a2EverydayPlaceEntries,
  ...a2AttractionEntries,
  ...a2TownFeatureEntries,
  ...a2TransportPlaceEntries,
];

const a2PlaceClueEntries = [
  { id: "a2-place-clue-01", sentence: "You need to buy some medicine.", answer: "a chemist's", acceptedAnswers: ["chemist's", "a pharmacy", "pharmacy"], options: ["a chemist's", "a post office", "a supermarket", "a police station"] },
  { id: "a2-place-clue-02", sentence: "You want to go to a Christian religious service.", answer: "a church", options: ["a church", "a museum", "a town hall", "a theatre"] },
  { id: "a2-place-clue-03", sentence: "You want to buy clothes, cosmetics, and things for your home in one large shop.", answer: "a department store", options: ["a department store", "a supermarket", "a market", "a shopping centre"] },
  { id: "a2-place-clue-04", sentence: "You are very ill and need medical treatment.", answer: "a hospital", options: ["a hospital", "a chemist's", "a police station", "a town hall"] },
  { id: "a2-place-clue-05", sentence: "You want to buy food or other things from different outdoor stalls.", answer: "a market", options: ["a market", "a supermarket", "a department store", "a shopping centre"] },
  { id: "a2-place-clue-06", sentence: "You want to walk, sit outside, or relax somewhere green.", answer: "a park", options: ["a park", "a square", "a street", "a zoo"] },
  { id: "a2-place-clue-07", sentence: "You need to report a crime.", answer: "a police station", options: ["a police station", "a post office", "a town hall", "a hospital"] },
  { id: "a2-place-clue-08", sentence: "You need to send a parcel.", answer: "a post office", options: ["a post office", "a chemist's", "a bus station", "a town hall"] },
  { id: "a2-place-clue-09", sentence: "You want to visit several different shops in the same place.", answer: "a shopping centre", options: ["a shopping centre", "a department store", "a market", "a supermarket"] },
  { id: "a2-place-clue-10", sentence: "You want to do your weekly food shopping.", answer: "a supermarket", options: ["a supermarket", "a market", "a department store", "a chemist's"] },
  { id: "a2-place-clue-11", sentence: "You need to visit the local government offices.", answer: "a town hall", options: ["a town hall", "a police station", "a post office", "a railway station"] },
  { id: "a2-place-clue-12", sentence: "You want to look at paintings and other works of art.", answer: "an art gallery", options: ["an art gallery", "a museum", "a theatre", "a castle"] },
  { id: "a2-place-clue-13", sentence: "You want to visit an old fortified building where kings or queens may once have lived.", answer: "a castle", options: ["a castle", "a museum", "a town hall", "a church"] },
  { id: "a2-place-clue-14", sentence: "You want to see historical or scientific objects and exhibitions.", answer: "a museum", options: ["a museum", "an art gallery", "a theatre", "a zoo"] },
  { id: "a2-place-clue-15", sentence: "You want to watch actors perform a play.", answer: "a theatre", options: ["a theatre", "an art gallery", "a museum", "a church"] },
  { id: "a2-place-clue-16", sentence: "You want to see animals from many different parts of the world.", answer: "a zoo", options: ["a zoo", "a park", "a museum", "a market"] },
  { id: "a2-place-clue-17", sentence: "You need to cross a river without using a boat.", answer: "a bridge", options: ["a bridge", "a road", "a street", "a square"] },
  { id: "a2-place-clue-18", sentence: "This is a natural body of water that flows towards the sea.", answer: "a river", options: ["a river", "a bridge", "a road", "a square"] },
  { id: "a2-place-clue-19", sentence: "Cars and other vehicles travel along this between places.", answer: "a road", options: ["a road", "a street", "a bridge", "a square"] },
  { id: "a2-place-clue-20", sentence: "This is an open public area in a town, often surrounded by buildings.", answer: "a square", options: ["a square", "a street", "a park", "a road"] },
  { id: "a2-place-clue-21", sentence: "This is a road in a town or city, usually with buildings along it.", answer: "a street", options: ["a street", "a road", "a square", "a bridge"] },
  { id: "a2-place-clue-22", sentence: "You want to catch a bus to another town.", answer: "a bus station", options: ["a bus station", "a railway station", "a car park", "a post office"] },
  { id: "a2-place-clue-23", sentence: "You need somewhere to leave your car.", answer: "a car park", options: ["a car park", "a bus station", "a railway station", "a square"] },
  { id: "a2-place-clue-24", sentence: "You want to catch a train.", answer: "a railway station", acceptedAnswers: ["a train station", "train station"], options: ["a railway station", "a bus station", "a car park", "a shopping centre"] },
];

const a2WorshipExtensionEntries = [
  { id: "a2-worship-cathedral", term: "a cathedral", clue: "a large and important Christian church" },
  { id: "a2-worship-mosque", term: "a mosque", clue: "a Muslim place of worship" },
  { id: "a2-worship-synagogue", term: "a synagogue", clue: "a Jewish place of worship" },
  { id: "a2-worship-temple", term: "a temple", clue: "a building used for worship in several religions" },
];

HUB_VOCAB_THEMES.push(
  {
    id: "days-numbers",
    level: "a2",
    order: 1,
    title: "Days and numbers",
    shortDescription: "Practise days, everyday time expressions, number contrasts, and high numbers.",
    textbookRef: "Elementary Vocabulary Bank 1",
    accent: HUB_VOCAB_LEVEL_COLORS.a2,
    itemCount: 128,
    entries: a2DayEntries,
    numberEntries: a2NumberEntries,
    numberContrastEntries: a2NumberContrastEntries,
    dayContextEntries: a2DayContextEntries,
    highNumberEntries: a2HighNumberEntries,
    activities: [
      { id: "day-flashcards", type: "flashcards", title: "Days of the week", shortDescription: "Recall the day from its abbreviation.", prompt: "Say the full day, then flip to check." },
      { id: "day-order", type: "sequence-order", title: "Put the days in order", shortDescription: "Arrange Monday to Sunday in the correct order.", prompt: "Put the days of the week in order.", sequence: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
      { id: "days-context", type: "sentence-gap-choice", dataKey: "dayContextEntries", title: "Days in context", shortDescription: "Complete useful expressions with day and time words.", prompt: "Choose the missing word or phrase." },
      { id: "number-quick-choice", type: "quick-choice", dataKey: "numberContrastEntries", title: "Number quick choice", shortDescription: "Focus on -teen and -ty contrasts and phone-number conventions.", prompt: "Choose the number you see.", itemLimit: 12 },
      { id: "write-number", type: "type-answer", dataKey: "numberEntries", title: "Write the number", shortDescription: "Write a random selection of numbers from 0 to 100.", prompt: "Write each number in words.", answerLabel: "Number in words", answerPlaceholder: "e.g. thirty-five", itemLimit: 15 },
      { id: "high-numbers", type: "type-answer", dataKey: "highNumberEntries", title: "High numbers", shortDescription: "Write hundreds, thousands, and millions in words.", prompt: "Write the high number in words.", answerLabel: "Number in words", answerPlaceholder: "e.g. two thousand and twelve" },
    ],
  },
  {
    id: "a2-countries",
    level: "a2",
    order: 2,
    title: "Countries and continents",
    shortDescription: "Review countries and nationalities, then connect them to the six continents.",
    textbookRef: "Elementary Vocabulary Bank 2",
    accent: "#75d7e8",
    itemCount: 27,
    entries: a2CountryEntries,
    continentEntries: a2ContinentEntries,
    continentSortEntries: a2ContinentSortEntries,
    activities: [
      { id: "continent-flashcards", type: "flashcards", dataKey: "continentEntries", title: "Continent flashcards", shortDescription: "Reveal the adjective for each continent.", prompt: "Say the continent adjective, then flip to check." },
      { id: "flag-flashcards", type: "flag-flashcards", title: "Flag flashcards", shortDescription: "Reveal the country and nationality from its flag.", prompt: "Say the country and nationality before you flip." },
      { id: "continent-matching", type: "matching", dataKey: "continentEntries", title: "Continent → adjective", shortDescription: "Match each continent with its adjective.", prompt: "Match the continents and adjectives." },
      { id: "flag-match", type: "flag-match", title: "Match the flags", shortDescription: "Match each flag to the correct country.", prompt: "Which country does this flag show?" },
      { id: "nationalities", type: "nationality-choice", title: "Country → nationality", shortDescription: "Choose the correct nationality for each country.", prompt: "Choose the correct nationality." },
      { id: "continent-sort", type: "category-sort", dataKey: "continentSortEntries", title: "Which continent?", shortDescription: "Sort countries into their continents.", prompt: "Choose the continent for each country.", promptKey: "country", categoryKey: "continentId", itemLimit: 12, categories: [
        { id: "africa", label: "Africa" },
        { id: "asia", label: "Asia" },
        { id: "australia", label: "Australia" },
        { id: "europe", label: "Europe" },
        { id: "north-america", label: "North America" },
        { id: "south-america", label: "South America" },
      ] },
      { id: "nationality-spelling", type: "nationality-type-answer", title: "Spell the nationality", shortDescription: "Type the nationality from the country name.", prompt: "Look at the country and type the nationality." },
    ],
  },
  {
    id: "a2-classroom-language",
    level: "a2",
    order: 3,
    title: "Classroom language",
    shortDescription: "Practise 22 useful teacher and student phrases for the classroom.",
    textbookRef: "Elementary Vocabulary Bank 3",
    accent: "#ffb86b",
    itemCount: 22,
    entries: a2ClassroomPhraseEntries,
    pictureEntries: a2ClassroomPictureEntries,
    gapEntries: a2ClassroomGapEntries,
    situationEntries: a2ClassroomSituationEntries,
    activities: [
      { id: "phrase-flashcards", type: "flashcards", dataKey: "pictureEntries", title: "Classroom phrase flashcards", shortDescription: "Look at the classroom situation, then reveal the complete phrase.", prompt: "Say the full phrase before you flip." },
      { id: "phrase-matching", type: "matching", dataKey: "pictureEntries", title: "Match the phrase", shortDescription: "Match each classroom illustration to the complete phrase.", prompt: "Match the pictures and classroom phrases." },
      { id: "speaker-choice", type: "speaker-choice", title: "Teacher or student?", shortDescription: "Decide who usually says each classroom phrase.", prompt: "Choose whether the teacher or student says it." },
      { id: "choose-word", type: "sentence-gap-choice", dataKey: "gapEntries", title: "Choose the missing word", shortDescription: "Choose the word that completes each classroom phrase.", prompt: "Choose the missing word." },
      { id: "classroom-situations", type: "sentence-gap-choice", dataKey: "situationEntries", title: "Classroom situations", shortDescription: "Choose the phrase that fits each classroom situation.", prompt: "What would you say?", question: "What would you say?" },
      { id: "complete-phrase", type: "sentence-gap-type-answer", dataKey: "gapEntries", title: "Complete the classroom phrase", shortDescription: "Type the missing verb, preposition, or noun.", prompt: "Type the missing word." },
    ],
  },
  {
    id: "a2-things",
    level: "a2",
    order: 4,
    title: "Things",
    shortDescription: "Practise 30 everyday objects through recognition, spelling, context, and articles.",
    textbookRef: "Elementary Vocabulary Bank 4",
    accent: "#f082a3",
    itemCount: 30,
    entries: a2ThingEntries,
    pictureEntries: a2ThingPictureEntries,
    articleEntries: a2ThingArticleEntries,
    contextEntries: a2ThingContextEntries,
    activities: [
      { id: "thing-flashcards", type: "flashcards", dataKey: "pictureEntries", title: "Things flashcards", shortDescription: "Look at each available object image, then reveal the word.", prompt: "Say the object before you flip." },
      { id: "thing-matching", type: "matching", dataKey: "pictureEntries", title: "Match the things", shortDescription: "Match each available object image to its name.", prompt: "Match the objects and words." },
      { id: "thing-quick-choice", type: "quick-choice", dataKey: "pictureEntries", title: "Quick object choice", shortDescription: "Recognise each object quickly from its image.", prompt: "Choose the object shown.", itemLimit: 15 },
      { id: "articles", type: "sentence-gap-choice", dataKey: "articleEntries", title: "a / an / no article", shortDescription: "Choose a, an, or no article before each noun.", prompt: "Choose the correct article.", question: "Choose a, an, or no article.", itemLimit: 12 },
      { id: "things-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Things in context", shortDescription: "Choose the object that fits each everyday situation.", prompt: "Which object completes the sentence?", question: "Choose the most useful object.", itemLimit: 12 },
      { id: "thing-spelling", type: "type-answer", dataKey: "pictureEntries", title: "Spell the thing", shortDescription: "Type the object name from its image.", prompt: "Look at the object and type the word.", answerLabel: "Object", answerPlaceholder: "Type the object name" },
    ],
  },
  {
    id: "a2-adjectives",
    level: "a2",
    order: 5,
    title: "Adjectives",
    shortDescription: "Practise 21 opposite pairs and use descriptive and opinion adjectives in context.",
    textbookRef: "Elementary Vocabulary Bank 5",
    accent: "#8cd88a",
    itemCount: 44,
    entries: a2OppositeEntries,
    flashcardEntries: a2OppositeFlashcardEntries,
    descriptiveContextEntries: a2DescriptiveContextEntries,
    opinionEntries: a2OpinionEntries,
    opinionContextEntries: a2OpinionContextEntries,
    activities: [
      { id: "opposite-flashcards", type: "flashcards", dataKey: "flashcardEntries", title: "Opposite flashcards", shortDescription: "Recall the second adjective in each opposite pair.", prompt: "Say the opposite before you flip." },
      { id: "choose-opposite", type: "opposites-choice", title: "Choose the opposite", shortDescription: "Choose the opposite, with context for ambiguous words.", prompt: "Choose the opposite adjective.", itemLimit: 15 },
      { id: "opinion-sort", type: "category-sort", dataKey: "opinionEntries", title: "Good or bad?", shortDescription: "Sort opinion adjectives as positive or negative.", prompt: "Is this opinion positive or negative?", promptKey: "term", categoryKey: "opinion", itemLimit: 7, categories: [{ id: "positive", label: "Positive" }, { id: "negative", label: "Negative" }] },
      { id: "describing-context", type: "sentence-gap-choice", dataKey: "descriptiveContextEntries", title: "Which adjective fits?", shortDescription: "Choose an objective descriptive adjective from clear contextual clues.", prompt: "Choose the adjective that fits the description.", itemLimit: 12 },
      { id: "opinion-context", type: "sentence-gap-choice", dataKey: "opinionContextEntries", title: "Opinion adjectives in context", shortDescription: "Choose the adjective that best fits each situation.", prompt: "Choose the best opinion adjective." },
      { id: "write-opposite", type: "opposite-type-answer", title: "Write the opposite", shortDescription: "Type the opposite, using labels such as old person and old thing.", prompt: "Write the opposite adjective.", itemLimit: 15 },
    ],
  },
  {
    id: "a2-verb-phrases",
    level: "a2",
    order: 6,
    title: "Verb phrases",
    shortDescription: "Build 24 useful verb–noun combinations and use them in context.",
    textbookRef: "Elementary Vocabulary Bank 6",
    accent: "#f3a86f",
    itemCount: 24,
    entries: a2VerbPhraseEntries,
    builderEntries: a2VerbBuilderEntries,
    contextEntries: a2VerbContextEntries,
    activities: [
      { id: "verb-flashcards", type: "flashcards", title: "Verb phrase flashcards", shortDescription: "Use an illustration or cue to retrieve the complete phrase.", prompt: "Say the complete verb phrase before you flip." },
      { id: "verb-matching", type: "matching", title: "Match the phrases", shortDescription: "Match each visual or cue with its complete verb phrase.", prompt: "Match the cues and verb phrases." },
      { id: "quick-verb", type: "gap-choice", title: "Quick verb choice", shortDescription: "Choose from real verbs in the bank to complete each collocation.", prompt: "Choose the missing verb.", itemLimit: 15 },
      { id: "verb-builder", type: "category-sort", dataKey: "builderEntries", title: "Verb builder", shortDescription: "Connect complements with do, play, drink, eat, and cook.", prompt: "Which verb completes this phrase?", promptKey: "term", categoryKey: "verb", itemLimit: 8, categories: [{ id: "do", label: "DO" }, { id: "play", label: "PLAY" }, { id: "drink", label: "DRINK" }, { id: "eat", label: "EAT" }, { id: "cook", label: "COOK" }] },
      { id: "phrases-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Phrases in context", shortDescription: "Choose the correctly inflected verb in an everyday sentence.", prompt: "Choose the verb that completes the sentence." },
      { id: "complete-verb", type: "cue-gap-type-answer", title: "Complete the phrase", shortDescription: "Type the verb that naturally completes each phrase.", prompt: "Type the missing verb.", answerLabel: "Verb", answerPlaceholder: "Type the verb" },
    ],
  },
  {
    id: "a2-jobs",
    level: "a2",
    order: 7,
    title: "Jobs",
    shortDescription: "Practise 30 occupations, job articles, definitions, and work status.",
    textbookRef: "Elementary Vocabulary Bank 7",
    accent: "#8fb6ff",
    itemCount: 30,
    entries: a2JobEntries,
    pictureEntries: a2JobPictureEntries,
    definitionEntries: a2JobDefinitionEntries,
    workStatusEntries: a2WorkStatusEntries,
    activities: [
      { id: "job-flashcards", type: "flashcards", dataKey: "pictureEntries", title: "Job flashcards", shortDescription: "Use the available job illustrations to recall the occupation.", prompt: "Say the job before you flip." },
      { id: "job-matching", type: "matching", dataKey: "pictureEntries", title: "Match jobs", shortDescription: "Match each available job illustration with its name.", prompt: "Match the jobs and occupation names." },
      { id: "what-job", type: "sentence-gap-choice", dataKey: "definitionEntries", title: "What job is it?", shortDescription: "Identify occupations from what people do.", prompt: "Read the description and choose the job.", question: "What job is it?", itemLimit: 12 },
      { id: "what-do-you-do", type: "sentence-gap-choice", dataKey: "workStatusEntries", title: "What do you do?", shortDescription: "Practise job, study, unemployment, and retirement expressions.", prompt: "Choose the expression that fits the person." },
      { id: "job-spelling", type: "type-answer", dataKey: "pictureEntries", title: "Spell the job", shortDescription: "Type the complete job name from its illustration.", prompt: "Look at the illustration and type the job.", answerLabel: "Job", answerPlaceholder: "e.g. an accountant" },
    ],
  },
  {
    id: "a2-family",
    level: "a2",
    order: 8,
    title: "The family",
    shortDescription: "Practise core relationships, family groups, in-laws, and stepfamily words.",
    textbookRef: "Elementary Vocabulary Bank 8",
    accent: "#79c3ff",
    itemCount: 24,
    entries: a2FamilyCoreEntries,
    relationshipEntries: a2FamilyRelationshipEntries,
    groupEntries: a2FamilyGroupEntries,
    treeEntries: a2FamilyTreeEntries,
    extendedEntries: a2ExtendedFamilyEntries,
    activities: [
      { id: "family-flashcards", type: "flashcards", title: "Core family flashcards", shortDescription: "Review familiar family members and learn the extended relationships.", prompt: "Say the family word before you flip." },
      { id: "family-groups", type: "matching", dataKey: "groupEntries", title: "Family groups", shortDescription: "Match combinations of people with their family-group word.", prompt: "Match each description with the family group." },
      { id: "relationships", type: "sentence-gap-choice", dataKey: "relationshipEntries", title: "What's the relationship?", shortDescription: "Work out family vocabulary from a relationship sentence.", prompt: "Choose the correct relationship." },
      { id: "family-tree", type: "sentence-gap-choice", dataKey: "treeEntries", title: "Family tree detective", shortDescription: "Follow a named family tree through short relationship clues.", prompt: "Read the family information and identify the relationship.", question: "What is the relationship?" },
      { id: "extended-family", type: "sentence-gap-type-answer", dataKey: "extendedEntries", title: "In-laws, stepfamily and partners", shortDescription: "Type the missing extended-family word.", prompt: "Type the missing family word.", answerLabel: "Family word", answerPlaceholder: "e.g. mother-in-law" },
    ],
  },
  {
    id: "a2-daily-routine",
    level: "a2",
    order: 9,
    title: "Daily routine",
    shortDescription: "Practise everyday routine phrases and use them in short contexts.",
    textbookRef: "Elementary Vocabulary Bank 9",
    accent: "#7ef0c2",
    itemCount: 23,
    entries: a2DailyRoutineEntries,
    contextEntries: a2RoutineContextEntries,
    activities: [
      { id: "routine-flashcards", type: "flashcards", title: "Routine flashcards", shortDescription: "Look at the routine prompt, then reveal the phrase.", prompt: "Look at the prompt and say the routine phrase before you flip." },
      { id: "routine-in-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Daily routine in context", shortDescription: "Choose the correct routine phrase in a short sentence.", prompt: "Read the sentence and choose the correct answer." },
      { id: "routine-complete", type: "cue-gap-type-answer", title: "Complete the routine", shortDescription: "Type the missing verb from the routine phrase.", prompt: "Look at the cue prompt and type the missing word or words.", answerLabel: "Missing words", answerPlaceholder: "Type the missing words" },
    ],
  },
  {
    id: "a2-time",
    level: "a2",
    order: 10,
    title: "Time",
    shortDescription: "Practise telling the time, frequency expressions, and adverbs of frequency.",
    textbookRef: "Elementary Vocabulary Bank 10",
    accent: "#7ed8ee",
    itemCount: 32,
    entries: a2TimeClockEntries,
    clockEntries: a2TimeClockEntries,
    frequencyEntries: a2FrequencyEntries,
    adverbEntries: a2FrequencyAdverbEntries,
    activities: [
      { id: "clock-choice", type: "clock-choice", dataKey: "clockEntries", title: "What time is it?", shortDescription: "Look at the clock and choose the correct time.", prompt: "Look at the clock and choose the correct phrase." },
      { id: "frequency-expressions", type: "sentence-gap-choice", dataKey: "frequencyEntries", title: "Frequency expressions", shortDescription: "Choose the correct expression of frequency from an explicit schedule.", prompt: "Read the schedule and choose the correct expression." },
      { id: "adverbs-of-frequency", type: "sentence-gap-choice", dataKey: "adverbEntries", title: "Adverbs of frequency", shortDescription: "Choose the adverb that matches a clearly stated frequency.", prompt: "Read the frequency clue and choose the correct adverb." },
      { id: "clock-type-answer", type: "clock-type-answer", dataKey: "clockEntries", title: "Write the time", shortDescription: "Look at the clock and type the time.", prompt: "Look at the clock and type the time.", answerLabel: "Time", answerPlaceholder: "e.g. It's quarter past six" },
    ],
  },
  {
    id: "a2-more-verb-phrases",
    level: "a2",
    order: 11,
    title: "More verb phrases",
    shortDescription: "Practise common verbs and the words and phrases they naturally combine with.",
    textbookRef: "Elementary Vocabulary Bank 11",
    accent: "#f3a86f",
    itemCount: 25,
    entries: a2MoreVerbPhraseEntries,
    contextEntries: a2MoreVerbContextEntries,
    activities: [
      { id: "phrase-flashcards", type: "flashcards", title: "Verb phrase flashcards", shortDescription: "Look at the picture or cue and recall the full verb phrase.", prompt: "Say the complete phrase before you flip." },
      { id: "choose-the-verb", type: "gap-choice", title: "Choose the verb", shortDescription: "Choose the verb or lexical unit that completes each phrase.", prompt: "Choose the correct verb or verb phrase.", itemLimit: 15 },
      { id: "verbs-in-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Which verb fits?", shortDescription: "Choose the verb that makes sense in the situation.", prompt: "Read the situation and choose the correct answer." },
      { id: "complete-the-phrase", type: "cue-gap-type-answer", title: "Complete the phrase", shortDescription: "Type the missing verb or verb phrase.", prompt: "Complete each phrase with the correct verb.", answerLabel: "Missing words", answerPlaceholder: "Type the missing words" },
    ],
  },
  {
    id: "a2-weather-dates",
    level: "a2",
    order: 12,
    title: "Weather and dates",
    shortDescription: "Practise weather, seasons, dates, and years.",
    textbookRef: "Elementary Vocabulary Bank 12",
    accent: "#79c3ff",
    itemCount: 38,
    entries: a2WeatherEntries,
    weatherEntries: a2WeatherEntries,
    weatherContextEntries: a2WeatherContextEntries,
    seasonEntries: a2SeasonEntries,
    weatherSeasonWriteEntries: a2WeatherSeasonWriteEntries,
    dateEntries: a2DateEntries,
    yearEntries: a2YearEntries,
    activities: [
      { id: "weather-choice", type: "quick-choice", dataKey: "weatherEntries", title: "What's the weather like?", shortDescription: "Look at the weather symbol and choose the correct description.", prompt: "Choose the correct weather description." },
      { id: "weather-in-context", type: "sentence-gap-choice", dataKey: "weatherContextEntries", title: "Weather in context", shortDescription: "Choose the weather word that fits each situation.", prompt: "Read the situation and choose the correct weather word." },
      { id: "seasons", type: "sentence-gap-choice", dataKey: "seasonEntries", title: "The seasons", shortDescription: "Recognise the seasons from dates and short clues.", prompt: "Choose the correct season." },
      { id: "write-weather-season", type: "type-answer", dataKey: "weatherSeasonWriteEntries", title: "Write the weather or season", shortDescription: "Look at the image and type the weather word or season.", prompt: "Look at the image and write the weather word or season.", answerLabel: "Weather or season", answerPlaceholder: "Type the word" },
      { id: "write-the-date", type: "type-answer", dataKey: "dateEntries", title: "Say the date", shortDescription: "Write each date as you would say it.", prompt: "Look at the date and write it in words.", answerLabel: "Date", answerPlaceholder: "e.g. the twenty-second of March" },
      { id: "say-the-year", type: "type-answer", dataKey: "yearEntries", title: "Say the year", shortDescription: "Write each year as you would normally say it.", prompt: "Write the year in words.", answerLabel: "Year", answerPlaceholder: "e.g. nineteen ninety-eight" },
    ],
  },
  {
    id: "a2-go-have-get",
    level: "a2",
    order: 13,
    title: "go, have, get",
    shortDescription: "Practise common everyday phrases with go, have, and get.",
    textbookRef: "Elementary Vocabulary Bank 13",
    accent: "#8cd88a",
    itemCount: 26,
    entries: a2GoHaveGetEntries,
    pastContextEntries: a2GoHaveGetPastEntries,
    activities: [
      { id: "phrase-flashcards", type: "flashcards", title: "Phrase flashcards", shortDescription: "Look at the cue and recall the complete phrase.", prompt: "Say the full phrase before you flip." },
      { id: "choose-head-verb", type: "category-sort", title: "go, have or get?", shortDescription: "Connect each complement with the verb it normally uses.", prompt: "Which verb completes this phrase?", promptKey: "complement", categoryKey: "headVerb", itemLimit: 15, categories: [{ id: "go", label: "GO" }, { id: "have", label: "HAVE" }, { id: "get", label: "GET" }] },
      { id: "complete-the-phrase", type: "cue-gap-type-answer", title: "Complete the phrase", shortDescription: "Type go, have, or get to complete the phrase.", prompt: "Complete each phrase with the correct verb.", answerLabel: "Verb", answerPlaceholder: "Type go, have, or get", itemLimit: 15 },
      { id: "past-in-context", type: "sentence-gap-type-answer", dataKey: "pastContextEntries", title: "went, had or got?", shortDescription: "Type the correct past form in everyday collocations.", prompt: "Complete each sentence with the past form of go, have, or get.", answerLabel: "Past form", answerPlaceholder: "Use the correct verb in the past" },
    ],
  },
  {
    id: "a2-the-house",
    level: "a2",
    order: 14,
    title: "The house",
    shortDescription: "Practise rooms, parts of a house, and common things in the home.",
    textbookRef: "Elementary Vocabulary Bank 14",
    accent: "#f0b27e",
    itemCount: 33,
    sceneImage: A2_HOUSE_SCENE_IMAGE,
    entries: a2HouseEntries,
    locationEntries: a2HouseLocationEntries,
    clueEntries: a2HouseClueEntries,
    activities: [
      { id: "house-hotspot-match", type: "image-hotspot-match", title: "Explore the house", shortDescription: "Work through five focused rounds for rooms, house parts, and household things.", prompt: "Complete one clearly labelled house round at a time.", sceneImage: A2_HOUSE_SCENE_IMAGE, rounds: A2_HOUSE_HOTSPOT_ROUNDS },
      { id: "where-do-you-find-it", type: "sentence-gap-choice", dataKey: "locationEntries", title: "Where do you find it?", shortDescription: "Choose the room where you normally find each thing.", prompt: "Where would you normally find this?" },
      { id: "house-clues", type: "sentence-gap-choice", dataKey: "clueEntries", title: "What am I?", shortDescription: "Read the clue and identify the room, house part, or object.", prompt: "Read the clue and choose the correct answer." },
      { id: "house-hotspot-type", type: "image-hotspot-type-answer", title: "Name it", shortDescription: "Name highlighted places and objects in five focused rounds.", prompt: "Use the round label and focused view to name the highlighted word.", sceneImage: A2_HOUSE_SCENE_IMAGE, rounds: A2_HOUSE_HOTSPOT_ROUNDS, answerLabel: "House word", answerPlaceholder: "Type the word" },
    ],
  },
  {
    id: "a2-prepositions",
    level: "a2",
    order: 15,
    title: "Prepositions",
    shortDescription: "Practise common prepositions of place and movement.",
    textbookRef: "Elementary Vocabulary Bank 15",
    accent: "#7ef0c2",
    itemCount: 16,
    entries: a2PrepositionVisualEntries,
    positionEntries: a2PrepositionPositionEntries,
    movementEntries: a2PrepositionMovementEntries,
    positionChoiceEntries: a2PrepositionPositionChoiceEntries,
    movementChoiceEntries: a2PrepositionMovementChoiceEntries,
    visualTypeEntries: a2PrepositionVisualEntries,
    contextEntries: a2PrepositionContextEntries,
    infoNotes: [
      {
        title: "above / over and below / under",
        body: ["above is similar to over", "below is similar to under"],
      },
    ],
    activities: [
      { id: "preposition-matching", type: "matching", dataKey: "visualTypeEntries", title: "Match the prepositions", shortDescription: "Match each picture with the correct preposition.", prompt: "Match the pictures and prepositions.", itemLimit: 8 },
      { id: "place-picture-choice", type: "quick-choice", dataKey: "positionChoiceEntries", title: "Where is it?", shortDescription: "Look at the picture and choose the correct preposition.", prompt: "Where is it?" },
      { id: "movement-picture-choice", type: "quick-choice", dataKey: "movementChoiceEntries", title: "Where is it going?", shortDescription: "Look at the picture and choose the correct movement word.", prompt: "Look at the movement and choose the correct answer." },
      { id: "prepositions-in-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Prepositions in context", shortDescription: "Choose the preposition that completes each sentence.", prompt: "Read the sentence and choose the correct answer.", itemLimit: 10 },
      { id: "preposition-picture-type", type: "type-answer", dataKey: "visualTypeEntries", title: "Write the preposition", shortDescription: "Look at the picture and type the correct preposition.", prompt: "Look at the picture and type the missing preposition.", answerLabel: "Preposition", answerPlaceholder: "Type the preposition" },
    ],
  },
  {
    id: "a2-food",
    level: "a2",
    order: 16,
    title: "Food",
    shortDescription: "Practise common foods for meals, fruit and vegetables, desserts, and snacks.",
    textbookRef: "Elementary Vocabulary Bank 16",
    accent: "#7ef0c2",
    itemCount: 44,
    entries: a2FoodEntries,
    foodClueEntries: a2FoodClueEntries,
    activities: [
      { id: "food-flashcards", type: "flashcards", title: "Food flashcards", shortDescription: "Look at the food and recall the word.", prompt: "Look at the picture and say the word before you flip.", itemLimit: 12 },
      { id: "food-picture-choice", type: "quick-choice", title: "Choose the food", shortDescription: "Look at each picture and choose the correct food word.", prompt: "Look at the picture and choose the correct food word.", itemLimit: 12 },
      { id: "food-matching", type: "matching", title: "Match the food", shortDescription: "Match each food picture with its name.", prompt: "Match the pictures and food words.", itemLimit: 8 },
      { id: "food-in-context", type: "sentence-gap-choice", dataKey: "foodClueEntries", title: "What food is it?", shortDescription: "Read the clue and choose the food.", prompt: "Read the clue and choose the correct answer.", question: "What food is it?", itemLimit: 10 },
      { id: "food-spelling", type: "type-answer", title: "Name the food", shortDescription: "Look at the picture and type the food word.", prompt: "Look at the picture and type the word.", answerLabel: "Food", answerPlaceholder: "Type the food", itemLimit: 12 },
    ],
  },
  {
    id: "a2-places-buildings",
    level: "a2",
    order: 17,
    title: "Places and buildings",
    shortDescription: "Practise common buildings, public places, transport places, and features of a town.",
    textbookRef: "Elementary Vocabulary Bank 17",
    accent: "#7ef0c2",
    itemCount: 24,
    entries: a2PlaceEntries,
    placeClueEntries: a2PlaceClueEntries,
    extensionTitle: "More places of worship",
    extensionEntries: a2WorshipExtensionEntries,
    practicePrompt: {
      title: "What is near you?",
      prompt: "Choose some places from the bank and answer: Is there a ___ near where you live?",
      followUp: "Yes, there is. · No, there isn't. · There's one near...",
    },
    activities: [
      { id: "place-flashcards", type: "flashcards", title: "Place flashcards", shortDescription: "Look at the place and recall the word.", prompt: "Look at the picture and say the place before you flip.", itemLimit: 12 },
      { id: "place-matching", type: "matching", title: "Match the places", shortDescription: "Match each place picture with its name.", prompt: "Match the pictures and place names.", itemLimit: 8 },
      { id: "where-would-you-go", type: "sentence-gap-choice", dataKey: "placeClueEntries", title: "Where would you go?", shortDescription: "Choose the place that matches each situation.", prompt: "Where would you go?", question: "Choose the best place.", itemLimit: 10 },
      { id: "place-spelling", type: "type-answer", title: "Name the place", shortDescription: "Look at the picture and type the place.", prompt: "Look at the picture and type the place.", answerLabel: "Place", answerPlaceholder: "Type the place", itemLimit: 12 },
    ],
  }
);

const PREINT_DESCRIBING_PEOPLE_IMAGE_BASE = "/images/vocab/pre-int/describing-people";

const preintAppearanceEntries = [
  {
    id: "preint-person-curly-red-hair",
    term: "She has curly red hair.",
    chunk: "curly red hair",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/01-curly-red-hair.png`,
  },
  {
    id: "preint-person-long-straight-hair",
    term: "She has long straight hair.",
    chunk: "long straight hair",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/02-long-straight-hair.png`,
  },
  {
    id: "preint-person-big-blue-eyes",
    term: "She has big blue eyes.",
    chunk: "big blue eyes",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/03-big-blue-eyes.png`,
    focusArea: { x: 50, y: 32.5, width: 29, height: 10.5, label: "The woman's eyes are highlighted." },
  },
  {
    id: "preint-person-short-blonde-hair",
    term: "She has short blonde hair.",
    chunk: "short blonde hair",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/04-short-blonde-hair.png`,
    acceptedAnswers: ["She has short blond hair."],
  },
  {
    id: "preint-person-beard-moustache",
    term: "He has a beard and a moustache.",
    chunk: "a beard and a moustache",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/05-beard-moustache.png`,
    acceptedAnswers: ["He has a beard and a mustache."],
  },
  {
    id: "preint-person-bald",
    term: "He's bald.",
    chunk: "bald",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/06-bald.png`,
  },
  {
    id: "preint-person-tall-thin",
    term: "He's very tall and thin.",
    chunk: "very tall and thin",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/07-tall-thin.png`,
  },
  {
    id: "preint-person-medium-slim",
    term: "She's medium height and very slim.",
    chunk: "medium height and very slim",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/08-medium-slim.png`,
  },
  {
    id: "preint-person-short-overweight",
    term: "He's quite short and a bit overweight.",
    chunk: "quite short and a bit overweight",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/09-short-overweight.png`,
  },
];

const preintAppearanceChoiceEntries = [
  {
    id: "preint-appearance-choice-curly-red-hair",
    term: "She has curly red hair.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/01-curly-red-hair.png`,
    question: "What does she look like?",
    options: ["She has curly red hair.", "She has long straight hair.", "She has short blonde hair.", "She has big blue eyes."],
  },
  {
    id: "preint-appearance-choice-long-straight-hair",
    term: "She has long straight hair.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/02-long-straight-hair.png`,
    question: "What does she look like?",
    options: ["She has long straight hair.", "She has curly red hair.", "She has short blonde hair.", "She's bald."],
  },
  {
    id: "preint-appearance-choice-big-blue-eyes",
    term: "She has big blue eyes.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/03-big-blue-eyes.png`,
    focusArea: { x: 50, y: 32.5, width: 29, height: 10.5, label: "The woman's eyes are highlighted." },
    question: "What does she look like?",
    options: ["She has big blue eyes.", "She has short blonde hair.", "She has curly red hair.", "She has a beard and a moustache."],
  },
  {
    id: "preint-appearance-choice-short-blonde-hair",
    term: "She has short blonde hair.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/04-short-blonde-hair.png`,
    question: "What does she look like?",
    options: ["She has short blonde hair.", "She has long straight hair.", "She has curly red hair.", "She has big blue eyes."],
  },
  {
    id: "preint-appearance-choice-beard-moustache",
    term: "He has a beard and a moustache.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/05-beard-moustache.png`,
    question: "What does he look like?",
    options: ["He has a beard and a moustache.", "He's bald.", "He's very tall and thin.", "She's medium height and very slim."],
  },
  {
    id: "preint-appearance-choice-bald",
    term: "He's bald.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/06-bald.png`,
    question: "What does he look like?",
    options: ["He's bald.", "He has a beard and a moustache.", "He's quite short and a bit overweight.", "He has long straight hair."],
  },
  {
    id: "preint-appearance-choice-tall-thin",
    term: "He's very tall and thin.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/07-tall-thin.png`,
    question: "What does he look like?",
    options: ["He's very tall and thin.", "She's medium height and very slim.", "He's quite short and a bit overweight.", "He's bald."],
  },
  {
    id: "preint-appearance-choice-medium-slim",
    term: "She's medium height and very slim.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/08-medium-slim.png`,
    question: "What does she look like?",
    options: ["She's medium height and very slim.", "He's very tall and thin.", "He's quite short and a bit overweight.", "He has a beard and a moustache."],
  },
  {
    id: "preint-appearance-choice-short-overweight",
    term: "He's quite short and a bit overweight.",
    image: `${PREINT_DESCRIBING_PEOPLE_IMAGE_BASE}/09-short-overweight.png`,
    question: "What does he look like?",
    options: ["He's quite short and a bit overweight.", "She's medium height and very slim.", "He's very tall and thin.", "He's bald."],
  },
];

const preintPersonalityEntries = [
  { id: "preint-personality-friendly", term: "friendly", opposite: "unfriendly" },
  { id: "preint-personality-unfriendly", term: "unfriendly", opposite: "friendly" },
  { id: "preint-personality-talkative", term: "talkative", opposite: "quiet" },
  { id: "preint-personality-quiet", term: "quiet", opposite: "talkative" },
  { id: "preint-personality-generous", term: "generous", opposite: "mean" },
  { id: "preint-personality-mean", term: "mean", opposite: "generous" },
  { id: "preint-personality-kind", term: "kind", opposite: "unkind" },
  { id: "preint-personality-unkind", term: "unkind", opposite: "kind" },
  { id: "preint-personality-lazy", term: "lazy", opposite: "hard-working" },
  { id: "preint-personality-hard-working", term: "hard-working", opposite: "lazy" },
  { id: "preint-personality-funny", term: "funny", opposite: "serious" },
  { id: "preint-personality-serious", term: "serious", opposite: "funny" },
  { id: "preint-personality-clever", term: "clever", opposite: "stupid" },
  { id: "preint-personality-stupid", term: "stupid", opposite: "clever" },
  { id: "preint-personality-shy", term: "shy", opposite: "extrovert" },
  { id: "preint-personality-extrovert", term: "extrovert", opposite: "shy" },
];

const preintPersonalityContextEntries = [
  { id: "preint-personality-context-friendly", sentence: "Lucía is warm and easy to talk to, even when she meets someone for the first time.", answer: "friendly", options: ["friendly", "unfriendly", "shy", "serious"] },
  { id: "preint-personality-context-unfriendly", sentence: "The new receptionist hardly smiles and isn't very welcoming to customers.", answer: "unfriendly", options: ["unfriendly", "friendly", "generous", "talkative"] },
  { id: "preint-personality-context-talkative", sentence: "Tom can talk for hours. It's sometimes difficult for anyone else to speak.", answer: "talkative", options: ["talkative", "quiet", "shy", "lazy"] },
  { id: "preint-personality-context-quiet", sentence: "Marta doesn't say very much when she's with a group of people.", answer: "quiet", options: ["quiet", "talkative", "funny", "extrovert"] },
  { id: "preint-personality-context-generous", sentence: "David often buys presents for his friends and gives money to people who need help.", answer: "generous", options: ["generous", "mean", "lazy", "serious"] },
  { id: "preint-personality-context-mean", sentence: "Sergio never wants to share anything and hates spending money on other people.", answer: "mean", options: ["mean", "generous", "kind", "funny"] },
  { id: "preint-personality-context-kind", sentence: "When somebody has a problem, Aisha always tries to help them.", answer: "kind", options: ["kind", "unkind", "shy", "clever"] },
  { id: "preint-personality-context-unkind", sentence: "He often says horrible things to people and doesn't care if he hurts their feelings.", answer: "unkind", options: ["unkind", "kind", "quiet", "hard-working"] },
  { id: "preint-personality-context-lazy", sentence: "Paula doesn't want to study or help at home. She prefers doing nothing all day.", answer: "lazy", options: ["lazy", "hard-working", "quiet", "clever"] },
  { id: "preint-personality-context-hard-working", sentence: "Álvaro studies every evening and always finishes his work on time.", answer: "hard-working", options: ["hard-working", "lazy", "funny", "mean"] },
  { id: "preint-personality-context-funny", sentence: "Everyone laughs when Dani tells a story.", answer: "funny", options: ["funny", "serious", "shy", "unfriendly"] },
  { id: "preint-personality-context-serious", sentence: "Rosa doesn't joke very much and usually talks about things in a very sensible way.", answer: "serious", options: ["serious", "funny", "talkative", "generous"] },
  { id: "preint-personality-context-clever", sentence: "Nadia understands new ideas very quickly and is excellent at solving problems.", answer: "clever", options: ["clever", "stupid", "shy", "mean"] },
  { id: "preint-personality-context-stupid", sentence: "That was a really stupid thing to do. He didn't think about the consequences at all.", answer: "stupid", options: ["stupid", "clever", "serious", "hard-working"] },
  { id: "preint-personality-context-shy", sentence: "Emma finds it difficult to talk to people she doesn't know.", answer: "shy", options: ["shy", "extrovert", "talkative", "friendly"] },
  { id: "preint-personality-context-extrovert", sentence: "Leo loves meeting new people and usually starts conversations with strangers.", answer: "extrovert", options: ["extrovert", "shy", "quiet", "lazy"] },
];

const preintDescriptionWriteEntries = [
  { id: "preint-description-write-curly-contrast", category: "appearance", sentence: "Her hair isn't straight. It's ____.", answer: "curly", acceptedAnswers: ["curly"] },
  { id: "preint-description-write-straight-contrast", category: "appearance", sentence: "Her hair isn't curly. It's ____.", answer: "straight", acceptedAnswers: ["straight"] },
  { id: "preint-description-write-curly-red", category: "appearance", sentence: "Her red hair forms lots of natural curls. She has _____ red hair.", answer: "curly", acceptedAnswers: ["curly"] },
  { id: "preint-description-write-long-straight", category: "appearance", sentence: "Her long hair has no waves or curls. She has long _____ hair.", answer: "straight", acceptedAnswers: ["straight"] },
  { id: "preint-description-write-short-blonde", category: "appearance", sentence: "Her hair is short and a very light yellow colour. She has short _____ hair.", answer: "blonde", acceptedAnswers: ["blonde", "blond"] },
  { id: "preint-description-write-bald", category: "appearance", sentence: "He doesn't have any hair. He's ____.", answer: "bald", acceptedAnswers: ["bald"] },
  { id: "preint-description-write-thin", category: "appearance", sentence: "He's very tall and weighs less than is healthy. He's tall and ____.", answer: "thin", acceptedAnswers: ["thin"] },
  { id: "preint-description-write-slim", category: "appearance", sentence: "He's medium height and has an attractively thin, healthy build. He's very ____.", answer: "slim", acceptedAnswers: ["slim"] },
  { id: "preint-description-write-overweight", category: "appearance", sentence: "He's quite short and a bit ____.", answer: "overweight", acceptedAnswers: ["overweight"] },
  { id: "preint-description-write-moustache", category: "appearance", sentence: "He has a beard and a ____.", answer: "moustache", acceptedAnswers: ["moustache", "mustache"] },
  { id: "preint-description-write-eyes", category: "appearance", sentence: "She has big blue ____.", answer: "eyes", acceptedAnswers: ["eyes"] },
  { id: "preint-description-write-friendly", category: "personality", sentence: "She's open, warm, and easy to talk to. She's ____.", answer: "friendly", acceptedAnswers: ["friendly"] },
  { id: "preint-description-write-talkative", category: "personality", sentence: "He talks a lot and is hardly ever silent. He's ____.", answer: "talkative", acceptedAnswers: ["talkative"] },
  { id: "preint-description-write-generous", category: "personality", sentence: "She loves giving things to other people. She's ____.", answer: "generous", acceptedAnswers: ["generous"] },
  { id: "preint-description-write-kind", category: "personality", sentence: "He's friendly and good to other people. He's ____.", answer: "kind", acceptedAnswers: ["kind"] },
  { id: "preint-description-write-lazy", category: "personality", sentence: "She never wants to do any work. She's ____.", answer: "lazy", acceptedAnswers: ["lazy"] },
  { id: "preint-description-write-hard-working", category: "personality", sentence: "He puts a lot of effort into his work. He's ____.", answer: "hard-working", acceptedAnswers: ["hard-working", "hard working", "hardworking"] },
  { id: "preint-description-write-funny", category: "personality", sentence: "She makes people laugh all the time. She's ____.", answer: "funny", acceptedAnswers: ["funny"] },
  { id: "preint-description-write-clever", category: "personality", sentence: "He learns and understands new things very quickly. He's ____.", answer: "clever", acceptedAnswers: ["clever"] },
  { id: "preint-description-write-shy", category: "personality", sentence: "She finds it difficult to talk to people she doesn't know. She's ____.", answer: "shy", acceptedAnswers: ["shy"] },
  { id: "preint-description-write-unfriendly", category: "personality", sentence: "He isn't warm or welcoming when he meets people. He's ____.", answer: "unfriendly", acceptedAnswers: ["unfriendly"] },
  { id: "preint-description-write-quiet", category: "personality", sentence: "She doesn't usually say very much. She's ____.", answer: "quiet", acceptedAnswers: ["quiet"] },
  { id: "preint-description-write-mean", category: "personality", sentence: "He hates giving or sharing things with other people. He's ____.", answer: "mean", acceptedAnswers: ["mean"] },
  { id: "preint-description-write-unkind", category: "personality", sentence: "She often says horrible things and doesn't care if she hurts people. She's ____.", answer: "unkind", acceptedAnswers: ["unkind"] },
  { id: "preint-description-write-serious", category: "personality", sentence: "He rarely jokes and usually seems very sensible. He's ____.", answer: "serious", acceptedAnswers: ["serious"] },
  { id: "preint-description-write-stupid", category: "personality", sentence: "That was a very _____ thing to do. You didn't think at all!", answer: "stupid", acceptedAnswers: ["stupid"] },
  { id: "preint-description-write-extrovert", category: "personality", sentence: "She loves meeting new people and talking to strangers. She's an ____.", answer: "extrovert", acceptedAnswers: ["extrovert"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-describing-people",
  level: "a2-b1",
  order: 1,
  title: "Describing people",
  shortDescription: "Practise appearance, personality adjectives, opposites, and natural descriptions of people.",
  textbookRef: "Pre-intermediate Vocabulary Bank 1",
  accent: HUB_VOCAB_LEVEL_COLORS["a2-b1"],
  itemCount: 25,
  entries: preintAppearanceEntries,
  appearanceEntries: preintAppearanceEntries,
  appearanceChoiceEntries: preintAppearanceChoiceEntries,
  personalityEntries: preintPersonalityEntries,
  personalityContextEntries: preintPersonalityContextEntries,
  descriptionWriteEntries: preintDescriptionWriteEntries,
  infoNotes: [
    {
      title: "What does someone look like?",
      body: [
        '"What does he / she look like?" asks about appearance.',
        'Example: "She\'s tall and she has short dark hair."',
        '"What\'s he / she like?" asks about personality.',
        'Example: "She\'s friendly but quite shy."',
      ],
    },
    {
      title: "Using two adjectives together",
      body: [
        "Adjectives normally follow this order: size → style → colour → noun",
        "long straight blonde hair",
        "big brown eyes",
      ],
    },
    {
      title: "thin, slim and overweight",
      body: [
        "thin and slim have similar meanings.",
        "slim usually has a positive meaning.",
        '"fat" can sound impolite when describing a person.',
        '"(a bit) overweight" is more neutral/polite.',
      ],
    },
    {
      title: "handsome, beautiful and good-looking",
      body: [
        'The textbook presents "handsome" mainly for men.',
        'It presents "beautiful" mainly for women.',
        '"good-looking" and "attractive" can be used for both men and women.',
      ],
    },
  ],
  activities: [
    {
      id: "appearance-flashcards",
      type: "flashcards",
      dataKey: "appearanceEntries",
      title: "Appearance flashcards",
      shortDescription: "Look at the person and recall the complete description.",
      prompt: "Describe the person's appearance, then flip to check.",
    },
    {
      id: "appearance-choice",
      type: "quick-choice",
      dataKey: "appearanceChoiceEntries",
      title: "Which description?",
      shortDescription: "Look at the person and choose the description that fits.",
      prompt: "Choose the best description.",
      itemLimit: 9,
    },
    {
      id: "personality-opposites",
      type: "opposites-choice",
      dataKey: "personalityEntries",
      title: "Personality opposites",
      shortDescription: "Choose the opposite personality adjective.",
      prompt: "Choose the opposite adjective.",
      itemLimit: 12,
    },
    {
      id: "personality-context",
      type: "sentence-gap-choice",
      dataKey: "personalityContextEntries",
      title: "What are they like?",
      shortDescription: "Choose the personality adjective that best fits each person.",
      prompt: "Read the description and choose the best adjective.",
      question: "What are they like?",
      itemLimit: 12,
    },
    {
      id: "description-write",
      type: "sentence-gap-type-answer",
      dataKey: "descriptionWriteEntries",
      title: "Write the description",
      shortDescription: "Complete descriptions of people's appearance and personality from memory.",
      prompt: "Read the clue and type the missing word or words.",
      answerLabel: "Missing description",
      answerPlaceholder: "Type the missing word or words",
      itemLimit: 10,
    },
  ],
});

const PREINT_WEAR_IMAGE_BASE = "/images/vocab/pre-int/things-you-wear";

function preintWearEntry(id, term, category, image, acceptedAnswers = []) {
  return {
    id: `preint-wear-${id}`,
    term,
    category,
    image,
    acceptedAnswers: [term, ...acceptedAnswers],
  };
}

const preintWearEntries = [
  preintWearEntry("blouse", "blouse", "clothes", `${PREINT_WEAR_IMAGE_BASE}/blouse.png`),
  preintWearEntry("cardigan", "cardigan", "clothes", `${PREINT_WEAR_IMAGE_BASE}/cardigan.png`),
  preintWearEntry("coat", "coat", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/coat.png`),
  preintWearEntry("dress", "dress", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/dress.png`),
  preintWearEntry("jacket", "jacket", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/jacket.png`),
  preintWearEntry("jeans", "jeans", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/jeans.png`),
  preintWearEntry("leggings", "leggings", "clothes", `${PREINT_WEAR_IMAGE_BASE}/leggings.png`),
  preintWearEntry("pyjamas", "pyjamas", "clothes", `${PREINT_WEAR_IMAGE_BASE}/pyjamas.png`, ["pajamas"]),
  preintWearEntry("shirt", "shirt", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shirt.png`),
  preintWearEntry("shorts", "shorts", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shorts.png`),
  preintWearEntry("skirt", "skirt", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/skirt.png`),
  preintWearEntry("socks", "socks", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/socks.png`),
  preintWearEntry("suit", "suit", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/suit.png`),
  preintWearEntry("sweater", "sweater", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/sweater.png`, ["jumper"]),
  preintWearEntry("tights", "tights", "clothes", `${PREINT_WEAR_IMAGE_BASE}/tights.png`),
  preintWearEntry("top", "top", "clothes", `${PREINT_WEAR_IMAGE_BASE}/top.png`),
  preintWearEntry("tracksuit", "tracksuit", "clothes", `${PREINT_WEAR_IMAGE_BASE}/tracksuit.png`),
  preintWearEntry("trousers", "trousers", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/trousers.png`),
  preintWearEntry("t-shirt", "T-shirt", "clothes", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/t-shirt.png`, ["t-shirt", "tshirt", "t shirt"]),
  preintWearEntry("underwear", "underwear", "clothes", `${PREINT_WEAR_IMAGE_BASE}/underwear.png`),
  preintWearEntry("boots", "boots", "footwear", `${PREINT_WEAR_IMAGE_BASE}/boots.png`),
  preintWearEntry("flip-flops", "flip-flops", "footwear", `${PREINT_WEAR_IMAGE_BASE}/flip-flops.png`, ["flip flops", "flipflops"]),
  preintWearEntry("sandals", "sandals", "footwear", `${PREINT_WEAR_IMAGE_BASE}/sandals.png`),
  preintWearEntry("shoes", "shoes", "footwear", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/shoes.png`),
  preintWearEntry("trainers", "trainers", "footwear", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/trainers.png`),
  preintWearEntry("belt", "belt", "accessories", `${PREINT_WEAR_IMAGE_BASE}/belt.png`),
  preintWearEntry("cap", "cap", "accessories", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/cap.png`),
  preintWearEntry("gloves", "gloves", "accessories", `${PREINT_WEAR_IMAGE_BASE}/gloves.png`),
  preintWearEntry("scarf", "scarf", "accessories", `${PREINT_WEAR_IMAGE_BASE}/scarf.png`),
  preintWearEntry("hat", "hat", "accessories", `${TEXTBOOK_CLOTHES_IMAGE_BASE}/hat.png`),
  preintWearEntry("tie", "tie", "accessories", `${PREINT_WEAR_IMAGE_BASE}/tie.png`),
  preintWearEntry("earrings", "earrings", "jewellery", `${PREINT_WEAR_IMAGE_BASE}/earrings.png`),
  preintWearEntry("bracelet", "bracelet", "jewellery", `${PREINT_WEAR_IMAGE_BASE}/bracelet.png`),
  preintWearEntry("ring", "ring", "jewellery", `${PREINT_WEAR_IMAGE_BASE}/ring.png`),
  preintWearEntry("necklace", "necklace", "jewellery", `${PREINT_WEAR_IMAGE_BASE}/necklace.png`),
];

const preintWearCarryDressEntries = [
  { id: "preint-wcd-01", sentence: "It's cold outside, so I'm _____ a coat.", answer: "wearing", options: ["wearing", "carrying", "dressing"] },
  { id: "preint-wcd-02", sentence: "She's _____ a beautiful necklace tonight.", answer: "wearing", options: ["wearing", "carrying", "dressing"] },
  { id: "preint-wcd-03", sentence: "He's _____ a grey suit and a blue tie.", answer: "wearing", options: ["wearing", "carrying", "dressing"] },
  { id: "preint-wcd-04", sentence: "Are you _____ gloves? It's freezing.", answer: "wearing", options: ["wearing", "carrying", "dressing"] },
  { id: "preint-wcd-05", sentence: "She's _____ a large bag with all her books in it.", answer: "carrying", options: ["carrying", "wearing", "dressing"] },
  { id: "preint-wcd-06", sentence: "Can you help me? I'm _____ two heavy cases.", answer: "carrying", options: ["carrying", "wearing", "dressing"] },
  { id: "preint-wcd-07", sentence: "He was _____ an umbrella because it was raining.", answer: "carrying", options: ["carrying", "wearing", "dressing"] },
  { id: "preint-wcd-08", sentence: "I don't like _____ lots of things when I travel.", answer: "carrying", options: ["carrying", "wearing", "dressing"] },
  { id: "preint-wcd-09", sentence: "Marta always _____ very elegantly for work.", answer: "dresses", options: ["dresses", "wears", "carries"] },
  { id: "preint-wcd-10", sentence: "He usually _____ in black.", answer: "dresses", options: ["dresses", "wears", "carries"] },
  { id: "preint-wcd-11", sentence: "People tend to _____ more casually at the weekend.", answer: "dress", options: ["dress", "wear", "carry"] },
  { id: "preint-wcd-12", sentence: "She _____ very well, even when she's just going to the supermarket.", answer: "dresses", options: ["dresses", "wears", "carries"] },
  { id: "preint-wcd-13", sentence: "What are you _____ to the wedding?", answer: "wearing", options: ["wearing", "carrying", "dressing"] },
  { id: "preint-wcd-14", sentence: "He normally _____ jeans and a T-shirt to work.", answer: "wears", options: ["wears", "carries", "dresses"] },
  { id: "preint-wcd-15", sentence: "She never _____ jewellery.", answer: "wears", options: ["wears", "carries", "dresses"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-things-you-wear",
  level: "a2-b1",
  order: 2,
  title: "Things you wear",
  shortDescription: "Practise clothes, footwear, accessories, jewellery, and useful verbs for talking about what people wear.",
  textbookRef: "Pre-intermediate Vocabulary Bank 2",
  accent: "#79c3ff",
  itemCount: 35,
  entries: preintWearEntries,
  wearCarryDressEntries: preintWearCarryDressEntries,
  infoNotes: [
    {
      title: "wear, carry or dress?",
      body: [
        "Use wear for clothes, jewellery, glasses, etc.",
        "She's wearing a hat.",
        "He's wearing a necklace.",
        "Use carry for bags, cases, etc.",
        "She's carrying a bag.",
        "I can't carry this case.",
        "Use dress without an object when talking about someone's general style.",
        "They dress very well.",
        "She always dresses in black.",
      ],
    },
    {
      title: "a pair of",
      body: [
        'We often use "a pair of" with plural things that we wear.',
        "a pair of shoes",
        "a pair of trainers",
        "a pair of boots",
        "a pair of jeans",
        "a pair of trousers",
      ],
    },
    {
      title: "sweater / jumper",
      body: ['"jumper" is another word for "sweater".'],
    },
  ],
  activities: [
    { id: "wear-flashcards", type: "flashcards", dataKey: "entries", title: "Things you wear flashcards", shortDescription: "Look at the item and recall the word.", prompt: "Look at the picture and say the word before you flip.", itemLimit: 15 },
    { id: "wear-matching", type: "matching", dataKey: "entries", title: "Match the items", shortDescription: "Match each picture with the correct word.", prompt: "Match the pictures and words.", itemLimit: 8 },
    { id: "wear-category-sort", type: "category-sort", dataKey: "entries", title: "What kind of item is it?", shortDescription: "Sort the vocabulary into clothes, footwear, accessories, and jewellery.", prompt: "Which group does this item belong to?", promptKey: "term", categoryKey: "category", itemLimit: 16, categories: [
      { id: "clothes", label: "Clothes" },
      { id: "footwear", label: "Footwear" },
      { id: "accessories", label: "Accessories" },
      { id: "jewellery", label: "Jewellery" },
    ] },
    { id: "wear-carry-dress", type: "sentence-gap-choice", dataKey: "wearCarryDressEntries", title: "wear, carry or dress?", shortDescription: "Choose the verb that naturally goes with each situation.", prompt: "Read the sentence and choose the correct verb.", itemLimit: 12 },
    { id: "wear-write", type: "type-answer", dataKey: "entries", title: "Write the item", shortDescription: "Look at the picture and type the clothes, footwear, accessory, or jewellery word.", prompt: "Look at the picture and type the word.", answerLabel: "Item", answerPlaceholder: "Type the word", itemLimit: 12 },
  ],
});

const PREINT_HOLIDAYS_IMAGE_BASE = "/images/vocab/pre-int/holidays";

const preintHolidayGoEntries = [
  { id: "preint-holiday-go-sightseeing", term: "go sightseeing", image: `${PREINT_HOLIDAYS_IMAGE_BASE}/go-sightseeing.png` },
  { id: "preint-holiday-go-swimming", term: "go swimming", image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/swimming.png`, spokenLabel: "Also: go sailing / surfing / fishing" },
  { id: "preint-holiday-go-out-night", term: "go out at night", image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-out.png` },
  { id: "preint-holiday-go-by-bus", term: "go by bus", image: `${A2_DAILY_ROUTINE_IMAGE_BASE}/go-to-work-by-bus.png`, spokenLabel: "Also: go by car / plane / train" },
  { id: "preint-holiday-go-on-holiday", term: "go on holiday", image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/travelling.png` },
  { id: "preint-holiday-go-skiing", term: "go skiing", image: `${PREINT_HOLIDAYS_IMAGE_BASE}/go-skiing.png`, spokenLabel: "Also: go walking / cycling" },
  { id: "preint-holiday-go-abroad", term: "go abroad", image: `${PREINT_HOLIDAYS_IMAGE_BASE}/go-abroad.png` },
  { id: "preint-holiday-go-camping", term: "go camping", image: `${TEXTBOOK_ACTIVITIES_IMAGE_BASE}/camping.png` },
  { id: "preint-holiday-go-walk", term: "go for a walk", image: `${COMMON_VERB_PHRASES_2_IMAGE_BASE}/go-for-a-walk.png` },
  { id: "preint-holiday-go-weekend", term: "go away for the weekend", image: `${PREINT_HOLIDAYS_IMAGE_BASE}/go-away-weekend.png` },
];

const preintHolidayGoContextEntries = [
  { id: "preint-holiday-go-context-01", sentence: "I don't want to spend my holiday in my own country this year. I'd like to ____.", answer: "go abroad", options: ["go abroad", "go camping", "go sightseeing", "go out at night"] },
  { id: "preint-holiday-go-context-02", sentence: "We only have Saturday and Sunday free, so we're going to Brighton to ____.", answer: "go away for the weekend", options: ["go away for the weekend", "go on holiday", "go abroad", "go sightseeing"] },
  { id: "preint-holiday-go-context-03", sentence: "The coach leaves at seven tomorrow morning. We're going to ____.", answer: "go by bus", options: ["go by bus", "go by train", "go by plane", "go by car"] },
  { id: "preint-holiday-go-context-04", sentence: "We're driving all the way to Portugal, so we're going to ____.", answer: "go by car", options: ["go by car", "go by bus", "go by plane", "go by train"] },
  { id: "preint-holiday-go-context-05", sentence: "Our flight to Rome leaves at 10.30. We're going to ____.", answer: "go by plane", options: ["go by plane", "go by train", "go by car", "go by bus"] },
  { id: "preint-holiday-go-context-06", sentence: "We've booked seats on the 8.15 to Barcelona. We're going to ____.", answer: "go by train", options: ["go by train", "go by plane", "go by bus", "go by car"] },
  { id: "preint-holiday-go-context-07", sentence: "We're taking a tent and sleeping at a campsite. We're going to ____.", answer: "go camping", options: ["go camping", "go sightseeing", "go skiing", "go abroad"] },
  { id: "preint-holiday-go-context-08", sentence: "Let's ____ after lunch. There's a lovely path around the lake.", answer: "go for a walk", options: ["go for a walk", "go sightseeing", "go cycling", "go out at night"] },
  { id: "preint-holiday-go-context-09", sentence: "I haven't had a break from work for months. We're finally going to ____ in August.", answer: "go on holiday", options: ["go on holiday", "go out at night", "go sightseeing", "go for a walk"] },
  { id: "preint-holiday-go-context-10", sentence: "There are some great bars and clubs here, so we're going to ____.", answer: "go out at night", options: ["go out at night", "go sightseeing", "go camping", "go for a walk"] },
  { id: "preint-holiday-go-context-11", sentence: "It's our first day in Rome, so we're going to see the Colosseum and some other famous places. We're going to ____.", answer: "go sightseeing", options: ["go sightseeing", "go out at night", "go camping", "go swimming"] },
  { id: "preint-holiday-go-context-12", sentence: "There's lots of snow in the mountains, so tomorrow we're going to ____.", answer: "go skiing", options: ["go skiing", "go walking", "go cycling", "go swimming"] },
  { id: "preint-holiday-go-context-13", sentence: "We've planned a long route through the mountains and we're going to ____ all day.", answer: "go walking", options: ["go walking", "go skiing", "go cycling", "go sightseeing"] },
  { id: "preint-holiday-go-context-14", sentence: "We've rented bikes to explore the countryside. We're going to ____.", answer: "go cycling", options: ["go cycling", "go walking", "go skiing", "go sightseeing"] },
  { id: "preint-holiday-go-context-15", sentence: "The hotel has a huge pool. I'm going to ____ every morning.", answer: "go swimming", options: ["go swimming", "go sailing", "go surfing", "go fishing"] },
  { id: "preint-holiday-go-context-16", sentence: "We've hired a small boat for the afternoon. We're going to ____.", answer: "go sailing", options: ["go sailing", "go swimming", "go surfing", "go fishing"] },
  { id: "preint-holiday-go-context-17", sentence: "The waves are fantastic today and I've brought my board. I'm going to ____.", answer: "go surfing", options: ["go surfing", "go swimming", "go sailing", "go fishing"] },
  { id: "preint-holiday-go-context-18", sentence: "We've got our rods and we're spending the morning by the lake. We're going to ____.", answer: "go fishing", options: ["go fishing", "go swimming", "go sailing", "go surfing"] },
];

const preintOtherHolidayPhraseEntries = [
  { id: "preint-holiday-other-01", sentence: "We usually _____ in a hotel when we go on holiday.", answer: "stay", phrase: "stay in a hotel", options: ["stay", "book", "rent", "spend"] },
  { id: "preint-holiday-other-02", sentence: "When we go camping, we _____ at a campsite.", answer: "stay", phrase: "stay at a campsite", options: ["stay", "hire", "rent", "book"] },
  { id: "preint-holiday-other-03", sentence: "We don't need a hotel in London because we can _____ with friends.", answer: "stay", phrase: "stay with friends", options: ["stay", "spend", "hire", "book"] },
  { id: "preint-holiday-other-04", sentence: "Don't forget your camera. I want to _____ lots of photos.", answer: "take", phrase: "take photos", options: ["take", "buy", "spend", "have"] },
  { id: "preint-holiday-other-05", sentence: "I always _____ a few souvenirs for my family.", answer: "buy", phrase: "buy souvenirs", options: ["buy", "take", "book", "rent"] },
  { id: "preint-holiday-other-06", sentence: "I love to _____ on the beach and read a book.", answer: "sunbathe", phrase: "sunbathe on the beach", options: ["sunbathe", "stay", "spend", "hire"] },
  { id: "preint-holiday-other-07", sentence: "We always _____ a really good time when we go away together.", answer: "have", phrase: "have a good time", options: ["have", "spend", "take", "stay"] },
  { id: "preint-holiday-other-08", sentence: "I try not to _____ too much money when I'm on holiday.", answer: "spend", phrase: "spend money", options: ["spend", "rent", "book", "buy"] },
  { id: "preint-holiday-other-09", sentence: "We usually _____ a lot of time by the pool.", answer: "spend", phrase: "spend time", options: ["spend", "stay", "have", "take"] },
  { id: "preint-holiday-other-10", sentence: "We're staying for two months, so we're going to _____ an apartment.", answer: "rent", phrase: "rent an apartment", options: ["rent", "hire", "book", "stay"] },
  { id: "preint-holiday-other-11", sentence: "We only need it for the afternoon, so let's _____ a bicycle.", answer: "hire", phrase: "hire a bicycle", options: ["hire", "rent", "book", "take"] },
  { id: "preint-holiday-other-12", sentence: "We haven't brought any equipment, so we'll _____ skis when we get there.", answer: "hire", phrase: "hire skis", options: ["hire", "rent", "buy", "take"] },
  { id: "preint-holiday-other-13", sentence: "It's often cheaper to _____ a flight online.", answer: "book", phrase: "book a flight online", options: ["book", "hire", "rent", "take"] },
  { id: "preint-holiday-other-14", sentence: "It's a popular destination, so we should _____ a hotel before we leave.", answer: "book", phrase: "book a hotel", options: ["book", "stay", "rent", "spend"] },
];

const preintHolidayAdjectiveEntries = [
  { id: "preint-holiday-adjective-warm", category: "weather", sentence: "It was about 24°C every day — pleasantly ____.", answer: "warm", options: ["warm", "foggy", "cloudy", "very windy"] },
  { id: "preint-holiday-adjective-sunny", category: "weather", sentence: "The sun shone every day and there were hardly any clouds.", answer: "sunny", options: ["sunny", "cloudy", "foggy", "very windy"] },
  { id: "preint-holiday-adjective-windy", category: "weather", sentence: "The wind was so strong that it was difficult to sit on the beach.", answer: "very windy", options: ["very windy", "warm", "sunny", "cloudy"] },
  { id: "preint-holiday-adjective-foggy", category: "weather", sentence: "We could hardly see the road because of the ____ weather.", answer: "foggy", options: ["foggy", "sunny", "warm", "cloudy"] },
  { id: "preint-holiday-adjective-cloudy", category: "weather", sentence: "The sky was grey all day and we hardly saw the sun.", answer: "cloudy", options: ["cloudy", "sunny", "warm", "foggy"] },
  { id: "preint-holiday-adjective-comfortable", category: "hotel", sentence: "The beds were really good and the rooms were pleasant to stay in.", answer: "comfortable", options: ["comfortable", "basic", "dirty", "uncomfortable"] },
  { id: "preint-holiday-adjective-luxurious", category: "hotel", sentence: "It was a five-star hotel with a spa, huge rooms, and excellent service.", answer: "luxurious", options: ["luxurious", "basic", "dirty", "uncomfortable"] },
  { id: "preint-holiday-adjective-basic", category: "hotel", sentence: "The room only had a bed, a small table, and a bathroom. It was very ____.", answer: "basic", options: ["basic", "luxurious", "comfortable", "dirty"] },
  { id: "preint-holiday-adjective-dirty", category: "hotel", sentence: "The bathroom hadn't been cleaned and there were marks on the sheets.", answer: "dirty", options: ["dirty", "comfortable", "luxurious", "basic"] },
  { id: "preint-holiday-adjective-uncomfortable", category: "hotel", sentence: "The bed was hard and none of us slept very well.", answer: "uncomfortable", options: ["uncomfortable", "comfortable", "luxurious", "basic"] },
  { id: "preint-holiday-adjective-beautiful", category: "town", sentence: "The old buildings and the views were absolutely ____.", answer: "beautiful", options: ["beautiful", "noisy", "crowded", "dirty"] },
  { id: "preint-holiday-adjective-lovely", category: "town", sentence: "It was a really _____ little town. We loved spending time there.", answer: "lovely", options: ["lovely", "noisy", "crowded", "uncomfortable"] },
  { id: "preint-holiday-adjective-noisy", category: "town", sentence: "There was traffic all night and loud music from the bars.", answer: "noisy", options: ["noisy", "beautiful", "lovely", "crowded"] },
  { id: "preint-holiday-adjective-crowded", category: "town", sentence: "There were so many tourists that it was difficult to walk through the centre.", answer: "crowded", options: ["crowded", "noisy", "beautiful", "lovely"] },
  { id: "preint-holiday-adjective-friendly", category: "people", sentence: "Everyone smiled at us and made us feel welcome.", answer: "friendly", options: ["friendly", "unfriendly", "helpful", "unhelpful"] },
  { id: "preint-holiday-adjective-helpful", category: "people", sentence: "The receptionist gave us a map, booked a taxi, and answered all our questions.", answer: "helpful", options: ["helpful", "unhelpful", "friendly", "unfriendly"] },
  { id: "preint-holiday-adjective-unfriendly", category: "people", sentence: "The staff hardly smiled or spoke to us and didn't make us feel welcome.", answer: "unfriendly", options: ["unfriendly", "friendly", "helpful", "unhelpful"] },
  { id: "preint-holiday-adjective-unhelpful", category: "people", sentence: "We asked the receptionist several questions, but she refused to help us with anything.", answer: "unhelpful", options: ["unhelpful", "helpful", "friendly", "unfriendly"] },
];

const preintHolidayWriteEntries = [
  { id: "preint-holiday-write-01", category: "go", sentence: "We're visiting museums and famous buildings today. We're going ____.", answer: "sightseeing", acceptedAnswers: ["sightseeing"] },
  { id: "preint-holiday-write-02", category: "go", sentence: "We're taking our tent and sleeping outdoors. We're going ____.", answer: "camping", acceptedAnswers: ["camping"] },
  { id: "preint-holiday-write-03", category: "go", sentence: "We want to visit another country this year. We want to go ____.", answer: "abroad", acceptedAnswers: ["abroad"] },
  { id: "preint-holiday-write-04", category: "go", sentence: "We're only leaving from Friday evening until Sunday. We're going away for the ____.", answer: "weekend", acceptedAnswers: ["weekend"] },
  { id: "preint-holiday-write-05", category: "go", sentence: "Let's go for a _____ after dinner.", answer: "walk", acceptedAnswers: ["walk"] },
  { id: "preint-holiday-write-06", category: "go", sentence: "There are some great clubs here. Let's go _____ tonight.", answer: "out", acceptedAnswers: ["out"] },
  { id: "preint-holiday-write-07", category: "go", sentence: "There's lots of snow. We're going ____ tomorrow.", answer: "skiing", acceptedAnswers: ["skiing"] },
  { id: "preint-holiday-write-08", category: "go", sentence: "I've brought my board because I want to go ____.", answer: "surfing", acceptedAnswers: ["surfing"] },
  { id: "preint-holiday-write-09", category: "go", sentence: "We've got rods and bait because we're going ____.", answer: "fishing", acceptedAnswers: ["fishing"] },
  { id: "preint-holiday-write-10", category: "go", sentence: "Our flight leaves tomorrow morning. We're going by ____.", answer: "plane", acceptedAnswers: ["plane"] },
  { id: "preint-holiday-write-11", category: "other", sentence: "We normally _____ in a hotel.", answer: "stay", acceptedAnswers: ["stay"] },
  { id: "preint-holiday-write-12", category: "other", sentence: "We're going to stay _____ friends in London.", answer: "with", acceptedAnswers: ["with"] },
  { id: "preint-holiday-write-13", category: "other", sentence: "Don't forget your camera. I want to _____ photos.", answer: "take", acceptedAnswers: ["take"] },
  { id: "preint-holiday-write-14", category: "other", sentence: "I always _____ souvenirs for my family.", answer: "buy", acceptedAnswers: ["buy"] },
  { id: "preint-holiday-write-15", category: "other", sentence: "I love to _____ on the beach when it's sunny.", answer: "sunbathe", acceptedAnswers: ["sunbathe"] },
  { id: "preint-holiday-write-16", category: "other", sentence: "We had a really good ____ on holiday.", answer: "time", acceptedAnswers: ["time"] },
  { id: "preint-holiday-write-17", category: "other", sentence: "Try not to _____ too much money.", answer: "spend", acceptedAnswers: ["spend"] },
  { id: "preint-holiday-write-18", category: "other", sentence: "We're staying for six weeks, so we're going to _____ an apartment.", answer: "rent", acceptedAnswers: ["rent"] },
  { id: "preint-holiday-write-19", category: "other", sentence: "We only need bikes for one afternoon, so we'll _____ them.", answer: "hire", acceptedAnswers: ["hire"] },
  { id: "preint-holiday-write-20", category: "other", sentence: "We should _____ our flight online tonight.", answer: "book", acceptedAnswers: ["book"] },
  { id: "preint-holiday-write-21", category: "adjective", sentence: "It was about 25°C every day. The weather was ____.", answer: "warm", acceptedAnswers: ["warm"] },
  { id: "preint-holiday-write-22", category: "adjective", sentence: "The sun shone every day. It was really ____.", answer: "sunny", acceptedAnswers: ["sunny"] },
  { id: "preint-holiday-write-23", category: "adjective", sentence: "We couldn't see much because the weather was ____.", answer: "foggy", acceptedAnswers: ["foggy"] },
  { id: "preint-holiday-write-24", category: "adjective", sentence: "The hotel had a spa and enormous rooms. It was very ____.", answer: "luxurious", acceptedAnswers: ["luxurious"] },
  { id: "preint-holiday-write-25", category: "adjective", sentence: "The room hadn't been cleaned properly. It was ____.", answer: "dirty", acceptedAnswers: ["dirty"] },
  { id: "preint-holiday-write-26", category: "adjective", sentence: "The bed was terrible to sleep in. It was really ____.", answer: "uncomfortable", acceptedAnswers: ["uncomfortable"] },
  { id: "preint-holiday-write-27", category: "adjective", sentence: "There were thousands of tourists everywhere. The town was very ____.", answer: "crowded", acceptedAnswers: ["crowded"] },
  { id: "preint-holiday-write-28", category: "adjective", sentence: "Cars and music kept us awake all night. It was really ____.", answer: "noisy", acceptedAnswers: ["noisy"] },
  { id: "preint-holiday-write-29", category: "adjective", sentence: "The local people were warm and welcoming. They were very ____.", answer: "friendly", acceptedAnswers: ["friendly"] },
  { id: "preint-holiday-write-30", category: "adjective", sentence: "The receptionist did everything she could to solve our problem. She was very ____.", answer: "helpful", acceptedAnswers: ["helpful"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-holidays",
  level: "a2-b1",
  order: 3,
  title: "Holidays",
  shortDescription: "Practise holiday activities, travel phrases, common holiday collocations, and adjectives for describing trips.",
  textbookRef: "Pre-intermediate Vocabulary Bank 3",
  accent: "#f3a86f",
  itemCount: 50,
  entries: preintHolidayGoEntries,
  holidayGoEntries: preintHolidayGoEntries,
  holidayGoContextEntries: preintHolidayGoContextEntries,
  otherHolidayPhraseEntries: preintOtherHolidayPhraseEntries,
  holidayAdjectiveEntries: preintHolidayAdjectiveEntries,
  holidayWriteEntries: preintHolidayWriteEntries,
  infoNotes: [
    { title: "rent or hire?", body: [
      "Rent and hire can mean the same thing.",
      "We normally use rent when something is used for a longer period.",
      "You rent a flat or an apartment.",
      "We normally use hire for a short period.",
      "You hire skis, a bicycle, or a boat.",
      "With a car, either hire or rent can be used.",
    ] },
    { title: "General positive and negative adjectives", body: [
      "Very positive: great · lovely · wonderful · fantastic",
      "OK: OK · not bad · all right",
      "Negative: awful · horrible · terrible",
    ] },
    { title: "go + activity", body: [
      "We use go + -ing for many activities:",
      "go skiing · go walking · go cycling",
      "go swimming · go sailing · go surfing · go fishing",
    ] },
    { title: "go by + transport", body: [
      "Use go by with forms of transport:",
      "go by bus · go by car · go by plane · go by train",
    ] },
  ],
  activities: [
    { id: "holiday-flashcards", type: "flashcards", dataKey: "holidayGoEntries", title: "Holiday flashcards", shortDescription: "Look at the holiday scene and recall the complete phrase.", prompt: "Look at the picture and say the holiday phrase before you flip." },
    { id: "go-phrases-context", type: "sentence-gap-choice", dataKey: "holidayGoContextEntries", title: "Which holiday phrase?", shortDescription: "Choose the correct go phrase for each holiday situation.", prompt: "Read the situation and choose the phrase that fits.", question: "What are they going to do?", itemLimit: 12 },
    { id: "other-holiday-phrases", type: "sentence-gap-choice", dataKey: "otherHolidayPhraseEntries", title: "Complete the holiday phrase", shortDescription: "Choose the verb that completes each common holiday phrase.", prompt: "Choose the correct verb.", itemLimit: 10 },
    { id: "holiday-adjectives", type: "sentence-gap-choice", dataKey: "holidayAdjectiveEntries", title: "Describing a holiday", shortDescription: "Choose the adjective that best describes the weather, hotel, town, or people.", prompt: "Read the description and choose the best adjective.", itemLimit: 12 },
    { id: "holiday-write", type: "sentence-gap-type-answer", dataKey: "holidayWriteEntries", title: "Write the holiday word or phrase", shortDescription: "Complete holiday phrases and descriptions from memory.", prompt: "Type the missing word or phrase.", answerLabel: "Missing word or phrase", answerPlaceholder: "Type your answer", itemLimit: 12 },
  ],
});

function preintAtInOnEntry(id, term, preposition, useType) {
  return { id: `preint-preposition-${id}`, term, preposition, useType };
}

const preintAtInOnEntries = [
  preintAtInOnEntry("in-spain", "Spain", "in", "place"),
  preintAtInOnEntry("in-madrid", "Madrid", "in", "place"),
  preintAtInOnEntry("in-kitchen", "the kitchen", "in", "place"),
  preintAtInOnEntry("in-shop", "a shop", "in", "place"),
  preintAtInOnEntry("in-museum", "a museum", "in", "place"),
  preintAtInOnEntry("in-park", "a park", "in", "place"),
  preintAtInOnEntry("in-garden", "a garden", "in", "place"),
  preintAtInOnEntry("in-car", "a car", "in", "place"),
  preintAtInOnEntry("in-february", "February", "in", "time"),
  preintAtInOnEntry("in-june", "June", "in", "time"),
  preintAtInOnEntry("in-winter", "winter", "in", "time"),
  preintAtInOnEntry("in-2018", "2018", "in", "time"),
  preintAtInOnEntry("in-morning", "the morning", "in", "time"),
  preintAtInOnEntry("in-afternoon", "the afternoon", "in", "time"),
  preintAtInOnEntry("in-evening", "the evening", "in", "time"),
  preintAtInOnEntry("on-bike", "a bike", "on", "place"),
  preintAtInOnEntry("on-bus", "a bus", "on", "place"),
  preintAtInOnEntry("on-train", "a train", "on", "place"),
  preintAtInOnEntry("on-plane", "a plane", "on", "place"),
  preintAtInOnEntry("on-ship", "a ship", "on", "place"),
  preintAtInOnEntry("on-floor", "the floor", "on", "place"),
  preintAtInOnEntry("on-table", "a table", "on", "place"),
  preintAtInOnEntry("on-shelf", "a shelf", "on", "place"),
  preintAtInOnEntry("on-balcony", "the balcony", "on", "place"),
  preintAtInOnEntry("on-roof", "the roof", "on", "place"),
  preintAtInOnEntry("on-wall", "the wall", "on", "place"),
  preintAtInOnEntry("on-march-first", "1st March", "on", "time"),
  preintAtInOnEntry("on-tuesday", "Tuesday", "on", "time"),
  preintAtInOnEntry("on-new-years-day", "New Year's Day", "on", "time"),
  preintAtInOnEntry("on-valentines-day", "Valentine's Day", "on", "time"),
  preintAtInOnEntry("at-school", "school", "at", "place"),
  preintAtInOnEntry("at-home", "home", "at", "place"),
  preintAtInOnEntry("at-work", "work", "at", "place"),
  preintAtInOnEntry("at-university", "university", "at", "place"),
  preintAtInOnEntry("at-airport", "the airport", "at", "place"),
  preintAtInOnEntry("at-station", "the station", "at", "place"),
  preintAtInOnEntry("at-bus-stop", "a bus stop", "at", "place"),
  preintAtInOnEntry("at-six", "6 o'clock", "at", "time"),
  preintAtInOnEntry("at-half-past-two", "half past two", "at", "time"),
  preintAtInOnEntry("at-quarter-to-eight", "quarter to eight", "at", "time"),
  preintAtInOnEntry("at-night", "night", "at", "time"),
  preintAtInOnEntry("at-weekend", "the weekend", "at", "time"),
  preintAtInOnEntry("at-christmas", "Christmas", "at", "time"),
  preintAtInOnEntry("at-easter", "Easter", "at", "time"),
];

const preintAtInOnContextEntries = [
  { id: "preint-at-in-on-context-01", sentence: "My sister lives _____ Spain.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-02", sentence: "We spent the weekend _____ Madrid.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-03", sentence: "Dinner is ready. Everyone's _____ the kitchen.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-04", sentence: "I bought this jacket _____ a shop near my house.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-05", sentence: "The children are playing _____ the park.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-06", sentence: "I left my phone _____ the car.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-07", sentence: "We normally go away _____ June.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-08", sentence: "I love going to the mountains _____ winter.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-09", sentence: "I usually feel more energetic _____ the morning.", answer: "in", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-10", sentence: "There were lots of people _____ the bus.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-11", sentence: "I watched two films _____ the plane.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-12", sentence: "Your keys are _____ the table.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-13", sentence: "There's a cat _____ the roof.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-14", sentence: "My appointment is _____ 1st March.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-15", sentence: "We have English class _____ Tuesday.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-16", sentence: "We always have a big family lunch _____ New Year's Day.", answer: "on", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-17", sentence: "I'll meet you _____ the bus stop.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-18", sentence: "My parents are waiting for us _____ the airport.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-19", sentence: "She's _____ work at the moment.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-20", sentence: "My brother is _____ university.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-21", sentence: "The film starts _____ six o'clock.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-22", sentence: "I don't like driving _____ night.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-23", sentence: "We often see our friends _____ the weekend.", answer: "at", options: ["at", "in", "on"] },
  { id: "preint-at-in-on-context-24", sentence: "We normally visit my grandparents _____ Christmas.", answer: "at", options: ["at", "in", "on"] },
];

const preintVerbPrepositionEntries = [
  { id: "preint-verb-preposition-arrive-in", cueText: "arrive ___ Paris", term: "arrive in Paris", preposition: "in", spokenLabel: "Use IN with cities and countries." },
  { id: "preint-verb-preposition-arrive-at", cueText: "arrive ___ the hotel", term: "arrive at the hotel", preposition: "at", spokenLabel: "Use AT with buildings and stations." },
  { id: "preint-verb-preposition-wait-for", cueText: "wait ___ somebody", term: "wait for somebody", preposition: "for" },
  { id: "preint-verb-preposition-depend-on", cueText: "depend ___ something", term: "depend on something", preposition: "on" },
  { id: "preint-verb-preposition-agree-with", cueText: "agree ___ somebody", term: "agree with somebody", preposition: "with" },
  { id: "preint-verb-preposition-ask-for", cueText: "ask ___ something", term: "ask for something", preposition: "for" },
  { id: "preint-verb-preposition-listen-to", cueText: "listen ___ somebody / something", term: "listen to somebody / something", preposition: "to" },
  { id: "preint-verb-preposition-pay-for", cueText: "pay ___ something", term: "pay for something", preposition: "for" },
  { id: "preint-verb-preposition-speak-to", cueText: "speak / talk / write ___ somebody", term: "speak / talk / write to somebody", preposition: "to" },
  { id: "preint-verb-preposition-talk-about", cueText: "speak / talk / write ___ something", term: "speak / talk / write about something", preposition: "about" },
  { id: "preint-verb-preposition-spend-on", cueText: "spend money ___ something", term: "spend money on something", preposition: "on" },
  { id: "preint-verb-preposition-worry-about", cueText: "worry ___ something", term: "worry about something", preposition: "about" },
  { id: "preint-verb-preposition-believe-in", cueText: "believe ___ something", term: "believe in something", preposition: "in" },
  { id: "preint-verb-preposition-think-about", cueText: "think ___ changing jobs", term: "think about changing jobs", preposition: "about", spokenLabel: "Use THINK ABOUT when considering something." },
  { id: "preint-verb-preposition-think-of", cueText: "What do you think ___ this painting?", term: "What do you think of this painting?", preposition: "of", spokenLabel: "Use THINK OF to ask for an opinion." },
  { id: "preint-verb-preposition-belong-to", cueText: "belong ___ somebody", term: "belong to somebody", preposition: "to" },
];

const preintVerbPrepositionContextEntries = [
  { id: "preint-verb-preposition-context-01", sentence: "We arrived _____ Rome late in the evening.", answer: "in", options: ["in", "at", "to", "on"] },
  { id: "preint-verb-preposition-context-02", sentence: "We arrived _____ the hotel just before midnight.", answer: "at", options: ["at", "in", "to", "on"] },
  { id: "preint-verb-preposition-context-03", sentence: "I've been waiting _____ the bus for twenty minutes.", answer: "for", options: ["for", "to", "about", "on"] },
  { id: "preint-verb-preposition-context-04", sentence: "Whether we go to the beach depends _____ the weather.", answer: "on", options: ["on", "in", "of", "with"] },
  { id: "preint-verb-preposition-context-05", sentence: "I don't agree _____ you about this.", answer: "with", options: ["with", "to", "on", "for"] },
  { id: "preint-verb-preposition-context-06", sentence: "I asked the waiter _____ some water.", answer: "for", options: ["for", "to", "about", "with"] },
  { id: "preint-verb-preposition-context-07", sentence: "Please listen _____ the instructions carefully.", answer: "to", options: ["to", "at", "for", "on"] },
  { id: "preint-verb-preposition-context-08", sentence: "Who paid _____ dinner last night?", answer: "for", options: ["for", "on", "to", "about"] },
  { id: "preint-verb-preposition-context-09", sentence: "I need to speak _____ the manager.", answer: "to", options: ["to", "about", "with", "for"] },
  { id: "preint-verb-preposition-context-10", sentence: "We were talking _____ our holiday plans.", answer: "about", options: ["about", "to", "in", "of"] },
  { id: "preint-verb-preposition-context-11", sentence: "I spend far too much money _____ clothes.", answer: "on", options: ["on", "for", "at", "in"] },
  { id: "preint-verb-preposition-context-12", sentence: "Don't worry _____ the exam. You'll be fine.", answer: "about", options: ["about", "of", "for", "on"] },
  { id: "preint-verb-preposition-context-13", sentence: "Do you believe _____ ghosts?", answer: "in", options: ["in", "of", "on", "at"] },
  { id: "preint-verb-preposition-context-14", sentence: "I'm thinking _____ changing jobs next year.", answer: "about", options: ["about", "of", "on", "for"] },
  { id: "preint-verb-preposition-context-15", sentence: "What do you think _____ this painting?", answer: "of", options: ["of", "about", "to", "with"] },
  { id: "preint-verb-preposition-context-16", sentence: "This jacket belongs _____ my brother.", answer: "to", options: ["to", "with", "of", "for"] },
];

const preintPrepositionWriteEntries = [
  { id: "preint-preposition-write-01", category: "at-in-on", sentence: "They live _____ Madrid.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-02", category: "at-in-on", sentence: "She's waiting _____ the kitchen.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-03", category: "at-in-on", sentence: "I bought it _____ a small shop.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-04", category: "at-in-on", sentence: "We're going away _____ February.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-05", category: "at-in-on", sentence: "It gets very cold here _____ winter.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-06", category: "at-in-on", sentence: "I normally work better _____ the morning.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-07", category: "at-in-on", sentence: "I left my bag _____ the train.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-08", category: "at-in-on", sentence: "Your glasses are _____ the shelf.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-09", category: "at-in-on", sentence: "There's someone _____ the balcony.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-10", category: "at-in-on", sentence: "The meeting is _____ Tuesday.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-11", category: "at-in-on", sentence: "My birthday is _____ 1st March.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-12", category: "at-in-on", sentence: "He's _____ work right now.", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-13", category: "at-in-on", sentence: "Let's meet _____ the station.", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-14", category: "at-in-on", sentence: "The train leaves _____ quarter to eight.", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-15", category: "at-in-on", sentence: "I don't usually go out _____ night.", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-16", category: "at-in-on", sentence: "We're staying at home _____ Easter.", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-17", category: "verb-preposition", sentence: "We arrived _____ Barcelona yesterday.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-18", category: "verb-preposition", sentence: "What time did you arrive _____ the airport?", answer: "at", acceptedAnswers: ["at"] },
  { id: "preint-preposition-write-19", category: "verb-preposition", sentence: "I'm still waiting _____ Marta.", answer: "for", acceptedAnswers: ["for"] },
  { id: "preint-preposition-write-20", category: "verb-preposition", sentence: "It depends _____ how much it costs.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-21", category: "verb-preposition", sentence: "I completely agree _____ you.", answer: "with", acceptedAnswers: ["with"] },
  { id: "preint-preposition-write-22", category: "verb-preposition", sentence: "She asked _____ a glass of water.", answer: "for", acceptedAnswers: ["for"] },
  { id: "preint-preposition-write-23", category: "verb-preposition", sentence: "Are you listening _____ me?", answer: "to", acceptedAnswers: ["to"] },
  { id: "preint-preposition-write-24", category: "verb-preposition", sentence: "I'll pay _____ the tickets.", answer: "for", acceptedAnswers: ["for"] },
  { id: "preint-preposition-write-25", category: "verb-preposition", sentence: "I need to talk _____ Carlos.", answer: "to", acceptedAnswers: ["to"] },
  { id: "preint-preposition-write-26", category: "verb-preposition", sentence: "We talked _____ the problem for hours.", answer: "about", acceptedAnswers: ["about"] },
  { id: "preint-preposition-write-27", category: "verb-preposition", sentence: "How much do you spend _____ food every week?", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-preposition-write-28", category: "verb-preposition", sentence: "She's worried _____ her exam.", answer: "about", acceptedAnswers: ["about"] },
  { id: "preint-preposition-write-29", category: "verb-preposition", sentence: "I don't believe _____ ghosts.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-preposition-write-30", category: "verb-preposition", sentence: "I'm thinking _____ moving to a new flat.", answer: "about", acceptedAnswers: ["about"] },
  { id: "preint-preposition-write-31", category: "verb-preposition", sentence: "What did you think _____ the film?", answer: "of", acceptedAnswers: ["of"] },
  { id: "preint-preposition-write-32", category: "verb-preposition", sentence: "Who does this phone belong _____?", answer: "to", acceptedAnswers: ["to"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-prepositions",
  level: "a2-b1",
  order: 4,
  title: "Prepositions",
  shortDescription: "Practise at, in, and on for place and time, plus common verb-preposition combinations.",
  textbookRef: "Pre-intermediate Vocabulary Bank 4",
  accent: "#7ef0c2",
  itemCount: 60,
  entries: preintAtInOnEntries,
  atInOnEntries: preintAtInOnEntries,
  atInOnContextEntries: preintAtInOnContextEntries,
  verbPrepositionEntries: preintVerbPrepositionEntries,
  verbPrepositionContextEntries: preintVerbPrepositionContextEntries,
  prepositionWriteEntries: preintPrepositionWriteEntries,
  infoNotes: [
    { title: "at, in and on: place", body: [
      "IN — countries and cities: in Spain, in Madrid",
      "IN — rooms: in the kitchen",
      "IN — buildings: in a shop, in a museum",
      "IN — closed spaces: in a park, in a garden, in a car",
      "ON — transport: on a bike, on a bus, on a train, on a plane, on a ship",
      "ON — surfaces: on the floor, on a table, on a shelf, on the balcony, on the roof, on the wall",
      "AT — places: at school, at home, at work, at university",
      "AT — points and transport locations: at the airport, at the station, at a bus stop",
    ] },
    { title: "at, in and on: time", body: [
      "IN — months: in February",
      "IN — seasons: in winter",
      "IN — years: in 2018",
      "IN — times of day: in the morning, in the afternoon, in the evening",
      "ON — dates: on 1st March",
      "ON — days: on Tuesday, on New Year's Day, on Valentine's Day",
      "AT — times: at 6 o'clock, at half past two, at quarter to eight",
      "AT — at night · at the weekend · at Christmas · at Easter",
    ] },
    { title: "arrive in or arrive at?", body: [
      "Use arrive in with cities and countries.",
      "arrive in Paris · arrive in Spain",
      "Use arrive at with buildings, stations, etc.",
      "arrive at the hotel · arrive at the station",
    ] },
    { title: "think about or think of?", body: [
      "think about is used when something is in your thoughts or you are considering it.",
      "I'm thinking about changing jobs.",
      "What do you think of...? asks for an opinion.",
      "What do you think of this painting?",
    ] },
  ],
  activities: [
    { id: "at-in-on-sort", type: "category-sort", dataKey: "atInOnEntries", title: "at, in or on?", shortDescription: "Sort places and time expressions by the preposition they use.", prompt: "Which preposition goes with this place or time expression?", promptKey: "term", categoryKey: "preposition", itemLimit: 15, categories: [
      { id: "at", label: "AT" },
      { id: "in", label: "IN" },
      { id: "on", label: "ON" },
    ] },
    { id: "at-in-on-context", type: "sentence-gap-choice", dataKey: "atInOnContextEntries", title: "Prepositions in context", shortDescription: "Choose at, in, or on in everyday place and time expressions.", prompt: "Complete the sentence with at, in, or on.", question: "Choose the correct preposition.", itemLimit: 12 },
    { id: "verb-preposition-flashcards", type: "flashcards", dataKey: "verbPrepositionEntries", title: "Verb + preposition flashcards", shortDescription: "Recall the preposition that completes each common verb phrase.", prompt: "Say the missing preposition, then flip to check." },
    { id: "verb-prepositions-context", type: "sentence-gap-choice", dataKey: "verbPrepositionContextEntries", title: "Verbs + prepositions", shortDescription: "Choose the preposition that completes each common verb phrase.", prompt: "Read the sentence and choose the correct preposition.", itemLimit: 12 },
    { id: "preposition-write", type: "sentence-gap-type-answer", dataKey: "prepositionWriteEntries", title: "Write the preposition", shortDescription: "Complete place, time, and verb phrases from memory.", prompt: "Type the missing preposition.", answerLabel: "Preposition", answerPlaceholder: "Type the preposition", itemLimit: 12 },
  ],
});

const PREINT_HOUSEWORK_IMAGE_BASE = "/images/vocab/pre-int/housework";

function preintHouseworkEntry(id, term, gapPrompt, gapAnswers, image, acceptedAnswers = [], spokenLabel = "") {
  return {
    id: `preint-housework-${id}`,
    term,
    gapPrompt,
    gapAnswers,
    image,
    acceptedAnswers: [term, ...acceptedAnswers],
    spokenLabel,
  };
}

const preintHouseworkEntries = [
  preintHouseworkEntry("clean-floor", "clean the floor", "_____ the floor", ["clean"], `${PREINT_HOUSEWORK_IMAGE_BASE}/clean-the-floor.png`),
  preintHouseworkEntry("ironing", "do the ironing", "_____ the ironing", ["do"], `${PREINT_HOUSEWORK_IMAGE_BASE}/do-the-ironing.png`),
  preintHouseworkEntry("shopping", "do the shopping", "_____ the shopping", ["do"], `${TYPICAL_DAY_IMAGE_BASE}/go-shopping.png`, ["do the grocery shopping", "do grocery shopping", "go grocery shopping"]),
  preintHouseworkEntry("vacuuming", "do the vacuuming", "_____ the vacuuming", ["do"], `${PREINT_HOUSEWORK_IMAGE_BASE}/do-the-vacuuming.png`, ["do the hoovering", "vacuum the floor", "vacuum the carpet"], "Also: do the hoovering"),
  preintHouseworkEntry("washing", "do the washing", "_____ the washing", ["do"], `${PREINT_HOUSEWORK_IMAGE_BASE}/do-the-washing.png`, ["do the laundry", "do laundry"]),
  preintHouseworkEntry("washing-up", "do the washing-up", "_____ the washing-up", ["do"], `${PREINT_HOUSEWORK_IMAGE_BASE}/do-the-washing-up.png`, ["do the washing up", "do the dishes", "wash the dishes"]),
  preintHouseworkEntry("dust-furniture", "dust the furniture", "_____ the furniture", ["dust"], `${PREINT_HOUSEWORK_IMAGE_BASE}/dust-the-furniture.png`),
  preintHouseworkEntry("lay-table", "lay the table", "_____ the table", ["lay", "set"], `${PREINT_HOUSEWORK_IMAGE_BASE}/lay-the-table.png`, ["set the table"], "Also: set the table · Opposite: clear the table"),
  preintHouseworkEntry("load-dishwasher", "load the dishwasher", "_____ the dishwasher", ["load"], `${PREINT_HOUSEWORK_IMAGE_BASE}/load-the-dishwasher.png`, [], "Opposite: unload the dishwasher"),
  preintHouseworkEntry("make-lunch", "make lunch", "_____ lunch", ["make"], `${TYPICAL_DAY_IMAGE_BASE}/make-dinner.png`, ["make dinner"], "Also: make dinner"),
  preintHouseworkEntry("make-bed", "make the bed", "_____ the bed", ["make"], `${PREINT_HOUSEWORK_IMAGE_BASE}/make-the-bed.png`),
  preintHouseworkEntry("pick-up-clothes", "pick up dirty clothes", "_____ up dirty clothes", ["pick"], `${PREINT_HOUSEWORK_IMAGE_BASE}/pick-up-dirty-clothes.png`),
  preintHouseworkEntry("put-away-clothes", "put away your clothes", "_____ away your clothes", ["put"], `${PREINT_HOUSEWORK_IMAGE_BASE}/put-away-your-clothes.png`),
  preintHouseworkEntry("take-out-rubbish", "take out the rubbish", "take _____ the rubbish", ["out"], `${PREINT_HOUSEWORK_IMAGE_BASE}/take-out-the-rubbish.png`, ["take out the trash", "take the trash out", "take out the garbage", "take the garbage out"]),
  preintHouseworkEntry("tidy-room", "tidy your room", "_____ your room", ["tidy", "clean", "clean up"], `${PREINT_HOUSEWORK_IMAGE_BASE}/tidy-your-room.png`, ["clean your room", "clean up your room"]),
];

const preintMakeDoEntries = [
  { id: "preint-make-do-course", term: "do a course", headVerb: "do", complement: "a course", acceptedAnswers: ["do a course", "take a course"] },
  { id: "preint-make-do-mistake", term: "make a mistake", headVerb: "make", complement: "a mistake", acceptedAnswers: ["make a mistake"] },
  { id: "preint-make-do-exam", term: "do an exam", headVerb: "do", complement: "an exam", acceptedAnswers: ["do an exam", "take an exam"] },
  { id: "preint-make-do-exercise-task", term: "do an exercise", headVerb: "do", complement: "an exercise", acceptedAnswers: ["do an exercise"] },
  { id: "preint-make-do-homework", term: "do homework", headVerb: "do", complement: "homework", acceptedAnswers: ["do homework"] },
  { id: "preint-make-do-noise", term: "make a noise", headVerb: "make", complement: "a noise", acceptedAnswers: ["make a noise"] },
  { id: "preint-make-do-phone-call", term: "make a phone call", headVerb: "make", complement: "a phone call", acceptedAnswers: ["make a phone call"] },
  { id: "preint-make-do-housework", term: "do housework", headVerb: "do", complement: "housework", acceptedAnswers: ["do housework"] },
  { id: "preint-make-do-friends", term: "make friends", headVerb: "make", complement: "friends", acceptedAnswers: ["make friends"] },
  { id: "preint-make-do-sport", term: "do sport", headVerb: "do", complement: "sport", acceptedAnswers: ["do sport", "play sport", "play sports"] },
  { id: "preint-make-do-exercise-activity", term: "do exercise", headVerb: "do", complement: "exercise", acceptedAnswers: ["do exercise"] },
  { id: "preint-make-do-plans", term: "make plans", headVerb: "make", complement: "plans", acceptedAnswers: ["make plans"] },
  { id: "preint-make-do-excuse", term: "make an excuse", headVerb: "make", complement: "an excuse", acceptedAnswers: ["make an excuse"] },
];

const preintHouseworkContextEntries = [
  { id: "preint-housework-context-01", sentence: "There are muddy marks all over the kitchen tiles.", answer: "clean the floor", options: ["clean the floor", "dust the furniture", "make the bed", "lay the table"] },
  { id: "preint-housework-context-02", sentence: "My shirts are clean but they're very creased.", answer: "do the ironing", options: ["do the ironing", "do the washing", "tidy your room", "put away your clothes"] },
  { id: "preint-housework-context-03", sentence: "There's almost no food left in the fridge.", answer: "do the shopping", acceptedAnswers: ["do the grocery shopping", "do grocery shopping", "go grocery shopping"], options: ["do the shopping", "do the washing-up", "make lunch", "take out the rubbish"] },
  { id: "preint-housework-context-04", sentence: "The carpet is covered in dust and dog hair.", answer: "do the vacuuming", acceptedAnswers: ["do the hoovering", "vacuum the carpet"], options: ["do the vacuuming", "clean the floor", "dust the furniture", "do the washing"] },
  { id: "preint-housework-context-05", sentence: "I haven't got any clean clothes for tomorrow.", answer: "do the washing", acceptedAnswers: ["do the laundry", "do laundry"], options: ["do the washing", "do the ironing", "put away your clothes", "pick up dirty clothes"] },
  { id: "preint-housework-context-06", sentence: "There are lots of dirty plates and glasses in the sink.", answer: "do the washing-up", acceptedAnswers: ["do the dishes", "wash the dishes"], options: ["do the washing-up", "load the dishwasher", "lay the table", "make lunch"] },
  { id: "preint-housework-context-07", sentence: "The shelves and tables are covered in dust.", answer: "dust the furniture", options: ["dust the furniture", "do the vacuuming", "clean the floor", "tidy your room"] },
  { id: "preint-housework-context-08", sentence: "Dinner is nearly ready. Can you put the plates, glasses, and cutlery on the table?", answer: "lay the table", acceptedAnswers: ["set the table"], options: ["lay the table", "load the dishwasher", "do the washing-up", "make lunch"] },
  { id: "preint-housework-context-09", sentence: "These plates are dirty. Put them into the machine in the kitchen.", answer: "load the dishwasher", options: ["load the dishwasher", "do the washing-up", "lay the table", "clean the floor"] },
  { id: "preint-housework-context-10", sentence: "It's nearly one o'clock and everyone's hungry.", answer: "make lunch", options: ["make lunch", "do the shopping", "lay the table", "do the washing-up"] },
  { id: "preint-housework-context-11", sentence: "You've just got up and the sheets and duvet are everywhere.", answer: "make the bed", options: ["make the bed", "tidy your room", "put away your clothes", "do the washing"] },
  { id: "preint-housework-context-12", sentence: "Your T-shirts and socks are all over the bedroom floor.", answer: "pick up dirty clothes", options: ["pick up dirty clothes", "put away your clothes", "do the washing", "tidy your room"] },
  { id: "preint-housework-context-13", sentence: "Your clean clothes are still on the chair. Put them in the wardrobe.", answer: "put away your clothes", options: ["put away your clothes", "pick up dirty clothes", "do the ironing", "do the washing"] },
  { id: "preint-housework-context-14", sentence: "The bin is completely full.", answer: "take out the rubbish", acceptedAnswers: ["take out the trash", "take the trash out", "take out the garbage", "take the garbage out"], options: ["take out the rubbish", "clean the floor", "do the shopping", "do the washing-up"] },
  { id: "preint-housework-context-15", sentence: "Your bedroom is a mess. Books, clothes, and other things are everywhere.", answer: "tidy your room", acceptedAnswers: ["clean your room", "clean up your room"], options: ["tidy your room", "make the bed", "clean the floor", "put away your clothes"] },
];

const preintHouseworkWriteEntries = [
  { id: "preint-housework-write-01", category: "housework", sentence: "The kitchen floor is dirty. I need to _____ the floor.", answer: "clean", acceptedAnswers: ["clean"] },
  { id: "preint-housework-write-02", category: "housework", sentence: "My shirts are all creased. I need to _____ the ironing.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-03", category: "housework", sentence: "We need food for the week. I'll _____ the shopping.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-04", category: "housework", sentence: "The carpet is filthy. I need to do the _____.", answer: "vacuuming", acceptedAnswers: ["vacuuming", "hoovering"] },
  { id: "preint-housework-write-05", category: "housework", sentence: "I don't have any clean clothes. I need to _____ the washing.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-06", category: "housework", sentence: "There are dirty plates in the sink. I'll do the _____.", answer: "washing-up", acceptedAnswers: ["washing-up", "washing up", "dishes"] },
  { id: "preint-housework-write-07", category: "housework", sentence: "There's dust all over the shelves. I need to _____ the furniture.", answer: "dust", acceptedAnswers: ["dust"] },
  { id: "preint-housework-write-08", category: "housework", sentence: "Dinner is ready. Can you _____ the table?", answer: "lay", acceptedAnswers: ["lay", "set"] },
  { id: "preint-housework-write-09", category: "housework", sentence: "Put the dirty plates into the machine. _____ the dishwasher.", answer: "Load", acceptedAnswers: ["load"] },
  { id: "preint-housework-write-10", category: "housework", sentence: "Everyone's hungry. I'll _____ lunch.", answer: "make", acceptedAnswers: ["make"] },
  { id: "preint-housework-write-11", category: "housework", sentence: "You've just got up. Please _____ the bed.", answer: "make", acceptedAnswers: ["make"] },
  { id: "preint-housework-write-12", category: "housework", sentence: "Your dirty clothes are all over the floor. _____ them up.", answer: "Pick", acceptedAnswers: ["pick"] },
  { id: "preint-housework-write-13", category: "housework", sentence: "These clothes are clean now. Please _____ them away.", answer: "put", acceptedAnswers: ["put"] },
  { id: "preint-housework-write-14", category: "housework", sentence: "The bin is full. Can you take _____ the rubbish?", answer: "out", acceptedAnswers: ["out"] },
  { id: "preint-housework-write-15", category: "housework", sentence: "Your room is a mess. You need to _____ it.", answer: "tidy", acceptedAnswers: ["tidy", "clean"] },
  { id: "preint-housework-write-16", category: "make-do", sentence: "I'm _____ a computer course at the moment.", answer: "doing", acceptedAnswers: ["doing", "taking"] },
  { id: "preint-housework-write-17", category: "make-do", sentence: "I wrote the wrong answer because I _____ a mistake.", answer: "made", acceptedAnswers: ["made"] },
  { id: "preint-housework-write-18", category: "make-do", sentence: "We have to _____ an English exam tomorrow.", answer: "do", acceptedAnswers: ["do", "take"] },
  { id: "preint-housework-write-19", category: "make-do", sentence: "Please _____ this grammar exercise before the next class.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-20", category: "make-do", sentence: "I can't go out because I have to _____ my homework.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-21", category: "make-do", sentence: "Please be quiet. Don't _____ so much noise.", answer: "make", acceptedAnswers: ["make"] },
  { id: "preint-housework-write-22", category: "make-do", sentence: "I need to _____ a phone call before we leave.", answer: "make", acceptedAnswers: ["make"] },
  { id: "preint-housework-write-23", category: "make-do", sentence: "Nobody likes _____ housework, but it has to be done.", answer: "doing", acceptedAnswers: ["doing"] },
  { id: "preint-housework-write-24", category: "make-do", sentence: "It can be difficult to _____ friends when you move to a new city.", answer: "make", acceptedAnswers: ["make"] },
  { id: "preint-housework-write-25", category: "make-do", sentence: "I try to _____ twice a week.", answer: "do sport", acceptedAnswers: ["do sport", "play sport", "play sports"] },
  { id: "preint-housework-write-26", category: "make-do", sentence: "You should _____ more exercise if you sit at a desk all day.", answer: "do", acceptedAnswers: ["do"] },
  { id: "preint-housework-write-27", category: "make-do", sentence: "What are you doing this weekend? Have you _____ any plans?", answer: "made", acceptedAnswers: ["made"] },
  { id: "preint-housework-write-28", category: "make-do", sentence: "He didn't want to come to the party, so he _____ an excuse.", answer: "made", acceptedAnswers: ["made"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-housework-make-do",
  level: "a2-b1",
  order: 5,
  title: "Housework, make or do?",
  shortDescription: "Practise common housework phrases and useful collocations with make and do.",
  textbookRef: "Pre-intermediate Vocabulary Bank 5",
  accent: "#8cd88a",
  itemCount: 28,
  entries: preintHouseworkEntries,
  houseworkEntries: preintHouseworkEntries,
  makeDoEntries: preintMakeDoEntries,
  houseworkContextEntries: preintHouseworkContextEntries,
  houseworkWriteEntries: preintHouseworkWriteEntries,
  infoNotes: [
    { title: "do the vacuuming / do the hoovering", body: ["do the vacuuming", "do the hoovering", "Both are used for cleaning a floor or carpet with a vacuum cleaner."] },
    { title: "lay / clear the table", body: ["lay the table = put plates, glasses, cutlery, etc. on the table before a meal", "clear the table = remove them after the meal"] },
    { title: "load / unload the dishwasher", body: ["load the dishwasher = put dirty dishes into it", "unload the dishwasher = take clean dishes out"] },
    { title: "British and American English", body: [
      "British: do the washing · American: do the laundry",
      "British: do the washing-up · American: do the dishes",
      "British: lay the table · American: set the table",
      "British: take out the rubbish · American: take out the trash / garbage",
      "British: tidy your room · American: clean / clean up your room",
      "British: do a course / exam · American: take a course / exam",
      "British: do sport · American: play sports",
    ] },
    { title: "make or do?", body: [
      "Common expressions with DO:",
      "do a course · do an exam · do an exercise · do homework",
      "do housework · do sport · do exercise",
      "Common expressions with MAKE:",
      "make a mistake · make a noise · make a phone call",
      "make friends · make plans · make an excuse",
      "These combinations should generally be learned as complete phrases.",
    ] },
  ],
  activities: [
    { id: "housework-flashcards", type: "flashcards", dataKey: "houseworkEntries", title: "Housework flashcards", shortDescription: "Look at the household task and recall the complete phrase.", prompt: "Look at the picture and say the complete phrase before you flip." },
    { id: "housework-matching", type: "matching", dataKey: "houseworkEntries", title: "Match the housework", shortDescription: "Match each household task with the correct phrase.", prompt: "Match the pictures and housework phrases.", itemLimit: 8 },
    { id: "make-do-sort", type: "category-sort", dataKey: "makeDoEntries", title: "make or do?", shortDescription: "Sort common expressions according to whether they use make or do.", prompt: "Which verb completes this phrase?", promptKey: "complement", categoryKey: "headVerb", itemLimit: 13, categories: [
      { id: "make", label: "MAKE" },
      { id: "do", label: "DO" },
    ] },
    { id: "housework-context", type: "sentence-gap-choice", dataKey: "houseworkContextEntries", title: "Housework in context", shortDescription: "Choose the household task that best fits each situation.", prompt: "Read the situation and choose the correct housework phrase.", question: "What needs to be done?", itemLimit: 12 },
    { id: "housework-write", type: "sentence-gap-type-answer", dataKey: "houseworkWriteEntries", title: "Write the phrase", shortDescription: "Complete housework and make/do expressions from memory.", prompt: "Type the missing word or words.", answerLabel: "Missing word or phrase", answerPlaceholder: "Type your answer", itemLimit: 12 },
  ],
});

const PREINT_SHOPPING_IMAGE_BASE = "/images/vocab/pre-int/shopping";

const preintShoppingStoreEntries = [
  { id: "preint-shopping-basket", term: "basket", image: `${PREINT_SHOPPING_IMAGE_BASE}/basket.png`, acceptedAnswers: ["basket"] },
  { id: "preint-shopping-changing-room", term: "changing room", image: `${PREINT_SHOPPING_IMAGE_BASE}/changing-room.png`, acceptedAnswers: ["changing room", "fitting room", "dressing room"] },
  { id: "preint-shopping-checkout", term: "checkout", image: `${PREINT_SHOPPING_IMAGE_BASE}/checkout.png`, acceptedAnswers: ["checkout", "self-service checkout", "self checkout", "self-checkout"], spokenLabel: "This picture shows a self-service checkout, also called a self-checkout." },
  { id: "preint-shopping-customer", term: "customer", image: `${PREINT_SHOPPING_IMAGE_BASE}/customer.png`, acceptedAnswers: ["customer"] },
  { id: "preint-shopping-receipt", term: "receipt", image: `${PREINT_SHOPPING_IMAGE_BASE}/receipt.png`, acceptedAnswers: ["receipt"] },
  { id: "preint-shopping-shelves", term: "shelves", image: `${PREINT_SHOPPING_IMAGE_BASE}/shelves.png`, acceptedAnswers: ["shelves"], spokenLabel: "Singular: shelf" },
  { id: "preint-shopping-shop-assistant", term: "shop assistant", image: `${TEXTBOOK_JOBS_IMAGE_BASE}/shop-assistant.png`, acceptedAnswers: ["shop assistant", "sales assistant", "store clerk", "sales clerk", "shop clerk", "sales associate"] },
  { id: "preint-shopping-shopping-bag", term: "shopping bag", image: `${PREINT_SHOPPING_IMAGE_BASE}/shopping-bag.png`, acceptedAnswers: ["shopping bag"] },
  { id: "preint-shopping-sales", term: "the sales", image: `${PREINT_SHOPPING_IMAGE_BASE}/sales.png`, acceptedAnswers: ["the sales", "sales", "sale"] },
  { id: "preint-shopping-till", term: "till", image: `${PREINT_SHOPPING_IMAGE_BASE}/till.png`, acceptedAnswers: ["till", "cash register", "register", "checkout counter"] },
  { id: "preint-shopping-trolley", term: "trolley", image: `${PREINT_SHOPPING_IMAGE_BASE}/trolley.png`, acceptedAnswers: ["trolley", "shopping cart", "cart"] },
];

const preintShoppingDialogueEntries = [
  { id: "preint-shopping-dialogue-01", sentence: "SHOP ASSISTANT: Can I help you?", answer: "I'm just looking, thank you.", options: ["I'm just looking, thank you.", "I'm a medium.", "They're too short.", "It's too big for me."] },
  { id: "preint-shopping-dialogue-02", sentence: "SHOP ASSISTANT: What size are you?", answer: "I'm a medium.", options: ["I'm a medium.", "I'm just looking, thank you.", "They're too short.", "You always look good in red."] },
  { id: "preint-shopping-dialogue-03", sentence: "CUSTOMER: Can I try on this shirt?", answer: "Yes, the changing rooms are over there.", acceptedAnswers: ["Yes, the fitting rooms are over there.", "Yes, the dressing rooms are over there."], options: ["Yes, the changing rooms are over there.", "I'm a medium.", "It's too big for me.", "I'm just looking, thank you."] },
  { id: "preint-shopping-dialogue-04", sentence: "CUSTOMER: This shirt doesn't fit me.", answer: "It's too big for me.", options: ["It's too big for me.", "You always look good in red.", "I'm just looking, thank you.", "Yes, the changing rooms are over there."] },
  { id: "preint-shopping-dialogue-05", sentence: "FRIEND: That jacket really suits you!", answer: "You always look good in red.", options: ["You always look good in red.", "They're too short.", "I'm a medium.", "It's too big for me."] },
  { id: "preint-shopping-dialogue-06", sentence: "CUSTOMER: I'm going to take these trousers back.", answer: "They're too short.", options: ["They're too short.", "I'm just looking, thank you.", "You always look good in red.", "I'm a medium."] },
];

const preintOnlineShoppingEntries = [
  { id: "preint-online-account", term: "account", phrase: "create an account" },
  { id: "preint-online-auction", term: "auction", phrase: "auction sites" },
  { id: "preint-online-basket", term: "basket", phrase: "in your basket" },
  { id: "preint-online-checkout", term: "checkout", phrase: "proceed to checkout" },
  { id: "preint-online-debit", term: "debit", phrase: "a credit or debit card" },
  { id: "preint-online-delivery", term: "delivery", phrase: "delivery address" },
  { id: "preint-online-item", term: "item", phrase: "click on an item" },
  { id: "preint-online-next-day", term: "next-day", phrase: "next-day delivery" },
  { id: "preint-online-payment", term: "payment", phrase: "payment details" },
  { id: "preint-online-website", term: "website", phrase: "go to a website" },
];

const preintOnlineShoppingSequence = [
  { id: "preint-online-step-01", term: "Go to the shop's website.", sequenceOrder: 1 },
  { id: "preint-online-step-02", term: "If it's your first visit, create an account and give your personal details.", sequenceOrder: 2 },
  { id: "preint-online-step-03", term: "Choose an item and click on it.", sequenceOrder: 3 },
  { id: "preint-online-step-04", term: "Put the item in your basket.", sequenceOrder: 4 },
  { id: "preint-online-step-05", term: "When you're ready to pay, proceed to checkout.", sequenceOrder: 5 },
  { id: "preint-online-step-06", term: "Give the delivery address and choose the delivery option, e.g. standard or next-day delivery.", sequenceOrder: 6 },
  { id: "preint-online-step-07", term: "Choose how you want to pay, for example with a credit or debit card.", sequenceOrder: 7 },
  { id: "preint-online-step-08", term: "Give your payment details and confirm the payment.", sequenceOrder: 8 },
];

const preintShoppingWriteEntries = [
  { id: "preint-shopping-write-01", category: "store", sentence: "You carry your shopping around the supermarket in a ____.", answer: "basket", acceptedAnswers: ["basket"] },
  { id: "preint-shopping-write-02", category: "store", sentence: "You can try clothes on in the changing ____.", answer: "room", acceptedAnswers: ["room"] },
  { id: "preint-shopping-write-03", category: "store", sentence: "In some supermarkets you scan and pay for everything yourself at a self-service ____.", answer: "checkout", acceptedAnswers: ["checkout"] },
  { id: "preint-shopping-write-04", category: "store", sentence: "A person who buys something in a shop is a ____.", answer: "customer", acceptedAnswers: ["customer"] },
  { id: "preint-shopping-write-05", category: "store", sentence: "Keep the _____ in case you need to return the item.", answer: "receipt", acceptedAnswers: ["receipt"] },
  { id: "preint-shopping-write-06", category: "store", sentence: "The shoes are displayed on several ____.", answer: "shelves", acceptedAnswers: ["shelves"] },
  { id: "preint-shopping-write-07", category: "store", sentence: "A person whose job is to help customers in a shop is a shop ____.", answer: "assistant", acceptedAnswers: ["assistant", "clerk"] },
  { id: "preint-shopping-write-08", category: "store", sentence: "She put her new clothes into a shopping ____.", answer: "bag", acceptedAnswers: ["bag"] },
  { id: "preint-shopping-write-09", category: "store", sentence: "Prices are much lower because the shop has started the ____.", answer: "sales", acceptedAnswers: ["sales", "sale"] },
  { id: "preint-shopping-write-10", category: "store", sentence: "You pay the shop assistant at the ____.", answer: "till", acceptedAnswers: ["till", "cash register", "register", "checkout counter"] },
  { id: "preint-shopping-write-11", category: "store", sentence: "If you're buying a lot of food, it's easier to use a ____.", answer: "trolley", acceptedAnswers: ["trolley", "shopping cart", "cart"] },
  { id: "preint-shopping-write-12", category: "language", sentence: "SHOP ASSISTANT: What _____ are you?\nCUSTOMER: I'm a medium.", answer: "size", acceptedAnswers: ["size"] },
  { id: "preint-shopping-write-13", category: "language", sentence: "Can I try _____ this shirt?", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-shopping-write-14", category: "language", sentence: "This shirt doesn't _____ me. It's too big.", answer: "fit", acceptedAnswers: ["fit"] },
  { id: "preint-shopping-write-15", category: "language", sentence: "That jacket really _____ you. You look great in it.", answer: "suits", acceptedAnswers: ["suits"] },
  { id: "preint-shopping-write-16", category: "language", sentence: "These trousers are too short, so I'm going to take them ____.", answer: "back", acceptedAnswers: ["back"] },
  { id: "preint-shopping-write-17", category: "language", sentence: "SHOP ASSISTANT: Can I help you?\nCUSTOMER: I'm just _____, thank you.", answer: "looking", acceptedAnswers: ["looking"] },
  { id: "preint-shopping-write-18", category: "online", sentence: "Most big shops now have a _____ where you can buy things online.", answer: "website", acceptedAnswers: ["website"] },
  { id: "preint-shopping-write-19", category: "online", sentence: "The first time you use the site, you may need to create an ____.", answer: "account", acceptedAnswers: ["account"] },
  { id: "preint-shopping-write-20", category: "online", sentence: "Choose the _____ you want to buy and click on it.", answer: "item", acceptedAnswers: ["item"] },
  { id: "preint-shopping-write-21", category: "online", sentence: "Everything you want to buy goes into your ____.", answer: "basket", acceptedAnswers: ["basket", "cart", "shopping cart"] },
  { id: "preint-shopping-write-22", category: "online", sentence: "When you're ready to pay, proceed to ____.", answer: "checkout", acceptedAnswers: ["checkout"] },
  { id: "preint-shopping-write-23", category: "online", sentence: "You need to give the shop your _____ address so they know where to send the order.", answer: "delivery", acceptedAnswers: ["delivery"] },
  { id: "preint-shopping-write-24", category: "online", sentence: "If you need the order tomorrow, you can sometimes pay extra for _____-day delivery.", answer: "next", acceptedAnswers: ["next"] },
  { id: "preint-shopping-write-25", category: "online", sentence: "You can pay with a credit or _____ card.", answer: "debit", acceptedAnswers: ["debit"] },
  { id: "preint-shopping-write-26", category: "online", sentence: "You'll need to enter your _____ details, such as your card number.", answer: "payment", acceptedAnswers: ["payment"] },
  { id: "preint-shopping-write-27", category: "online", sentence: "eBay is a well-known example of an _____ site.", answer: "auction", acceptedAnswers: ["auction"] },
  { id: "preint-shopping-write-28", category: "language", sentence: "Before buying clothes, I usually ask, 'Can I _____ them on?'", answer: "try", acceptedAnswers: ["try"] },
  { id: "preint-shopping-write-29", category: "language", sentence: "If something is the wrong size, we say it doesn't _____.", answer: "fit", acceptedAnswers: ["fit"] },
  { id: "preint-shopping-write-30", category: "language", sentence: "If a colour or style looks good on you, we say it _____ you.", answer: "suits", acceptedAnswers: ["suits"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-shopping",
  level: "a2-b1",
  order: 6,
  title: "Shopping",
  shortDescription: "Practise shop vocabulary, useful shopping language, and common words and phrases for shopping online.",
  textbookRef: "Pre-intermediate Vocabulary Bank 6",
  accent: "#f0b27e",
  itemCount: 27,
  entries: preintShoppingStoreEntries,
  shoppingStoreEntries: preintShoppingStoreEntries,
  shoppingDialogueEntries: preintShoppingDialogueEntries,
  onlineShoppingEntries: preintOnlineShoppingEntries,
  onlineShoppingSequence: preintOnlineShoppingSequence,
  shoppingWriteEntries: preintShoppingWriteEntries,
  infoNotes: [
    { title: "fit or suit?", body: ["fit is about size.", "These jeans don't fit me. They're too small.", "suit is about appearance.", "That colour really suits you."] },
    { title: "try on", body: ["Use try on when you put clothes on temporarily to see if they fit or look good.", "Can I try on this shirt?", "Where can I try it on?"] },
    { title: "take something back", body: ["Take something back means return something to a shop.", "These trousers are too short.", "I'm going to take them back."] },
    { title: "Shopping online", body: [
      "go to a website · create an account · click on an item",
      "put something in your basket · proceed to checkout",
      "give a delivery address · choose next-day delivery",
      "pay with a credit or debit card · give your payment details",
      "buy or sell things on an auction site",
    ] },
    { title: "checkout or till?", body: ["A till is the machine/place where a shop assistant takes payment.", "A self-service checkout lets the customer scan and pay for items without a cashier."] },
    { title: "British and American English", body: [
      "British: changing room · American: fitting room / dressing room",
      "British: shop assistant · American: store clerk / sales associate",
      "British: till · American: cash register / register",
      "British: trolley · American: shopping cart / cart",
      "Online shops may call saved items a basket or a cart.",
    ] },
  ],
  activities: [
    { id: "shopping-flashcards", type: "flashcards", dataKey: "shoppingStoreEntries", title: "Shopping flashcards", shortDescription: "Look at the shop scene or object and recall the word.", prompt: "Look at the picture and say the shopping word before you flip." },
    { id: "shopping-matching", type: "matching", dataKey: "shoppingStoreEntries", title: "Match the shopping words", shortDescription: "Match each shop picture with the correct word.", prompt: "Match the pictures and shopping words.", itemLimit: 8 },
    { id: "shopping-dialogues", type: "sentence-gap-choice", dataKey: "shoppingDialogueEntries", title: "In the shop", shortDescription: "Choose the natural response in common shopping situations.", prompt: "Read what the person says and choose the best response.", question: "What comes next?" },
    { id: "online-shopping", type: "sequence-order", dataKey: "onlineShoppingSequence", title: "Shopping online", shortDescription: "Put the main steps of buying something online in a logical order.", prompt: "Put the online shopping process in order." },
    { id: "shopping-write", type: "sentence-gap-type-answer", dataKey: "shoppingWriteEntries", title: "Write the shopping word or phrase", shortDescription: "Complete shop, functional, and online shopping language from memory.", prompt: "Type the missing word or phrase.", answerLabel: "Missing word or phrase", answerPlaceholder: "Type your answer", itemLimit: 12 },
  ],
});

const PREINT_TOWN_SIGHTS_IMAGE_BASE = "/images/vocab/pre-int/town-city-sights";

const preintTownLocationEntries = [
  { id: "preint-town-location-01", sentence: "Manchester is _____ the north of England.", answer: "in", options: ["in", "on", "at", "to"] },
  { id: "preint-town-location-02", sentence: "Brighton is _____ the south of England.", answer: "in", options: ["in", "on", "at", "from"] },
  { id: "preint-town-location-03", sentence: "The town is _____ the coast, so there are beaches nearby.", answer: "on", options: ["on", "in", "at", "to"] },
  { id: "preint-town-location-04", sentence: "The city is _____ the River Avon.", answer: "on", options: ["on", "in", "at", "from"] },
  { id: "preint-town-location-05", sentence: "City A is 30 kilometres _____ of City B. You travel towards the rising sun to get there.", answer: "east", options: ["east", "west", "north", "south"] },
  { id: "preint-town-location-06", sentence: "City A is 20 kilometres _____ of City B. It is directly below it on the map.", answer: "south", options: ["south", "north", "east", "west"] },
  { id: "preint-town-location-07", sentence: "The village is 15 kilometres _____ of the capital. It is above it on the map.", answer: "north", options: ["north", "south", "east", "west"] },
  { id: "preint-town-location-08", sentence: "The town is about 40 kilometres _____ of Madrid. You travel towards Portugal to get there.", answer: "west", options: ["west", "east", "north", "south"] },
  { id: "preint-town-location-09", sentence: "Only about 20,000 people live there. It's a _____ town.", answer: "small", options: ["small", "medium-sized", "large", "crowded"] },
  { id: "preint-town-location-10", sentence: "It isn't a small town, but it isn't a huge city either. It's a _____ city.", answer: "medium-sized", options: ["medium-sized", "small", "large", "historic"] },
  { id: "preint-town-location-11", sentence: "More than three million people live there. It's a very _____ city.", answer: "large", options: ["large", "small", "medium-sized", "empty"] },
  { id: "preint-town-location-12", sentence: "The city _____ a population of around 500,000.", answer: "has", options: ["has", "is", "makes", "gives"] },
  { id: "preint-town-location-13", sentence: "The town has a _____ of about 75,000.", answer: "population", options: ["population", "centre", "coast", "size"] },
  { id: "preint-town-location-14", sentence: "Granada is _____ for the Alhambra.", answer: "famous", options: ["famous", "historic", "crowded", "large"] },
  { id: "preint-town-location-15", sentence: "The old streets and buildings are in the _____ city centre.", answer: "historic", options: ["historic", "modern", "crowded", "large"] },
  { id: "preint-town-location-16", sentence: "The city is _____ the east of the country.", answer: "in", options: ["in", "on", "at", "from"] },
  { id: "preint-town-location-17", sentence: "The town is _____ the west coast of the island.", answer: "on", options: ["on", "in", "at", "to"] },
  { id: "preint-town-location-18", sentence: "The village is about ten kilometres south _____ the city.", answer: "of", options: ["of", "from", "to", "at"] },
];

const preintTownAdjectiveContextEntries = [
  { id: "preint-town-adjective-01", sentence: "There aren't many things to do in the evening and there are very few places to visit.", answer: "boring", options: ["boring", "exciting", "crowded", "historic"] },
  { id: "preint-town-adjective-02", sentence: "There are loads of things to do — concerts, festivals, restaurants, museums, and nightlife.", answer: "exciting", options: ["exciting", "boring", "quiet", "empty"] },
  { id: "preint-town-adjective-03", sentence: "The streets are full of people and it's difficult to move through the centre.", answer: "crowded", options: ["crowded", "empty", "quiet", "clean"] },
  { id: "preint-town-adjective-04", sentence: "Almost nobody was in the town centre. The streets were completely ____.", answer: "empty", options: ["empty", "crowded", "noisy", "polluted"] },
  { id: "preint-town-adjective-05", sentence: "You need to be careful there, especially if you're walking alone at night.", answer: "dangerous", options: ["dangerous", "safe", "exciting", "historic"] },
  { id: "preint-town-adjective-06", sentence: "Crime is very low and people generally feel comfortable walking around at night.", answer: "safe", options: ["safe", "dangerous", "empty", "modern"] },
  { id: "preint-town-adjective-07", sentence: "Most of the buildings are new and the city has changed enormously in the last twenty years.", answer: "modern", options: ["modern", "historic", "polluted", "boring"] },
  { id: "preint-town-adjective-08", sentence: "The centre has buildings and streets that are hundreds of years old.", answer: "historic", options: ["historic", "modern", "noisy", "crowded"] },
  { id: "preint-town-adjective-09", sentence: "There are bars, traffic, and loud music until very late.", answer: "noisy", options: ["noisy", "quiet", "polluted", "exciting"] },
  { id: "preint-town-adjective-10", sentence: "It's very peaceful. You hardly hear any traffic at all.", answer: "quiet", options: ["quiet", "noisy", "crowded", "dangerous"] },
  { id: "preint-town-adjective-11", sentence: "Traffic and factories have made the air very dirty.", answer: "polluted", options: ["polluted", "clean", "crowded", "modern"] },
  { id: "preint-town-adjective-12", sentence: "The streets are tidy and the air quality is excellent.", answer: "clean", options: ["clean", "polluted", "empty", "historic"] },
  { id: "preint-town-adjective-13", sentence: "The beach is packed with visitors every summer.", answer: "crowded", options: ["crowded", "empty", "boring", "clean"] },
  { id: "preint-town-adjective-14", sentence: "There's almost no traffic or nightlife, so it's very peaceful after dark.", answer: "quiet", options: ["quiet", "noisy", "exciting", "polluted"] },
  { id: "preint-town-adjective-15", sentence: "The old centre includes a medieval castle and ancient city walls.", answer: "historic", options: ["historic", "modern", "empty", "dangerous"] },
  { id: "preint-town-adjective-16", sentence: "The new business district is full of recently built offices and apartment blocks.", answer: "modern", options: ["modern", "historic", "boring", "polluted"] },
  { id: "preint-town-adjective-17", sentence: "There are activities and interesting places everywhere, so visitors never run out of things to do.", answer: "exciting", options: ["exciting", "boring", "dangerous", "empty"] },
  { id: "preint-town-adjective-18", sentence: "Cars aren't allowed in much of the centre, and the streets and parks are kept extremely tidy.", answer: "clean", options: ["clean", "polluted", "crowded", "noisy"] },
];

function preintTownSightEntry(id, term, category, image, acceptedAnswers = []) {
  return { id: `preint-town-sight-${id}`, term, category, image, acceptedAnswers: [term, ...acceptedAnswers] };
}

const preintTownSightEntries = [
  preintTownSightEntry("bridge", "bridge", "other", `${A2_PLACES_IMAGE_BASE}/bridge.png`),
  preintTownSightEntry("canal", "canal", "other", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/canal.png`),
  preintTownSightEntry("castle", "castle", "historic", `${A2_PLACES_IMAGE_BASE}/castle.png`),
  preintTownSightEntry("cathedral", "cathedral", "religious", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/cathedral.png`),
  preintTownSightEntry("church", "church", "religious", `${A2_PLACES_IMAGE_BASE}/church.png`),
  preintTownSightEntry("city-walls", "city walls", "historic", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/city-walls.png`, ["the city walls"]),
  preintTownSightEntry("department-store", "department store", "shopping", `${A2_PLACES_IMAGE_BASE}/department-store.png`, ["the department store"]),
  preintTownSightEntry("harbour", "harbour", "other", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/harbour.png`, ["harbor"]),
  preintTownSightEntry("hill", "hill", "other", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/hill.png`),
  preintTownSightEntry("lake", "lake", "other", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/lake.png`),
  preintTownSightEntry("market", "market", "shopping", `${A2_PLACES_IMAGE_BASE}/market.png`),
  preintTownSightEntry("mosque", "mosque", "religious", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/mosque.png`),
  preintTownSightEntry("museum", "museum", "other", `${A2_PLACES_IMAGE_BASE}/museum.png`),
  preintTownSightEntry("palace", "palace", "historic", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/palace.png`),
  preintTownSightEntry("ruins", "ruins", "historic", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/ruins.png`),
  preintTownSightEntry("shopping-centre", "shopping centre", "shopping", `${A2_PLACES_IMAGE_BASE}/shopping-centre.png`, ["shopping center", "mall"]),
  preintTownSightEntry("statue", "statue", "historic", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/statue.png`),
  preintTownSightEntry("synagogue", "synagogue", "religious", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/synagogue.png`),
  preintTownSightEntry("temple", "temple", "religious", `${PREINT_TOWN_SIGHTS_IMAGE_BASE}/temple.png`),
  preintTownSightEntry("town-hall", "town hall", "other", `${A2_PLACES_IMAGE_BASE}/town-hall.png`, ["the town hall"]),
];

const preintTownWriteEntries = [
  { id: "preint-town-write-01", category: "location", sentence: "Edinburgh is _____ the north of the UK.", answer: "in", acceptedAnswers: ["in"] },
  { id: "preint-town-write-02", category: "location", sentence: "The town is _____ the coast.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-town-write-03", category: "location", sentence: "The city is _____ the River Dee.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-town-write-04", category: "location", sentence: "The village is about 20 kilometres east _____ the city.", answer: "of", acceptedAnswers: ["of"] },
  { id: "preint-town-write-05", category: "location", sentence: "It isn't very big or very small. It's a _____-sized city.", answer: "medium", acceptedAnswers: ["medium"] },
  { id: "preint-town-write-06", category: "location", sentence: "The city has a _____ of about 300,000.", answer: "population", acceptedAnswers: ["population"] },
  { id: "preint-town-write-07", category: "location", sentence: "The town is _____ for its beautiful cathedral.", answer: "famous", acceptedAnswers: ["famous"] },
  { id: "preint-town-write-08", category: "location", sentence: "The oldest buildings are in the _____ city centre.", answer: "historic", acceptedAnswers: ["historic"] },
  { id: "preint-town-write-09", category: "adjective", sentence: "There's nothing interesting to do there. It's really ____.", answer: "boring", acceptedAnswers: ["boring"] },
  { id: "preint-town-write-10", category: "adjective", sentence: "There are always interesting things happening. It's very ____.", answer: "exciting", acceptedAnswers: ["exciting"] },
  { id: "preint-town-write-11", category: "adjective", sentence: "There are far too many people in the centre. It's ____.", answer: "crowded", acceptedAnswers: ["crowded"] },
  { id: "preint-town-write-12", category: "adjective", sentence: "There was nobody in the street. It was completely ____.", answer: "empty", acceptedAnswers: ["empty"] },
  { id: "preint-town-write-13", category: "adjective", sentence: "You need to be very careful there at night. It can be ____.", answer: "dangerous", acceptedAnswers: ["dangerous"] },
  { id: "preint-town-write-14", category: "adjective", sentence: "Crime is very low, so people generally feel ____ there.", answer: "safe", acceptedAnswers: ["safe"] },
  { id: "preint-town-write-15", category: "adjective", sentence: "Nearly all the buildings were constructed recently. It's very ____.", answer: "modern", acceptedAnswers: ["modern"] },
  { id: "preint-town-write-16", category: "adjective", sentence: "The centre has many buildings that are hundreds of years old. It's very ____.", answer: "historic", acceptedAnswers: ["historic"] },
  { id: "preint-town-write-17", category: "adjective", sentence: "There's loud traffic and music everywhere. It's really ____.", answer: "noisy", acceptedAnswers: ["noisy"] },
  { id: "preint-town-write-18", category: "adjective", sentence: "You hardly hear any traffic. It's very ____.", answer: "quiet", acceptedAnswers: ["quiet"] },
  { id: "preint-town-write-19", category: "adjective", sentence: "The air is dirty because of traffic and industry. It's ____.", answer: "polluted", acceptedAnswers: ["polluted"] },
  { id: "preint-town-write-20", category: "adjective", sentence: "The streets are tidy and there's almost no litter. It's very ____.", answer: "clean", acceptedAnswers: ["clean"] },
  ...preintTownSightEntries.map((entry, index) => ({
    id: `preint-town-write-${String(index + 21).padStart(2, "0")}`,
    category: "sight",
    sentence: ["city walls", "ruins"].includes(entry.term) ? "What are these?" : "What is this?",
    answer: entry.term,
    acceptedAnswers: entry.acceptedAnswers,
    image: entry.image,
  })),
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-describing-town-city",
  level: "a2-b1",
  order: 7,
  title: "Describing a town or city",
  shortDescription: "Practise describing where a place is, what it is like, and the buildings and sights you can find there.",
  textbookRef: "Pre-intermediate Vocabulary Bank 7",
  accent: "#79c3ff",
  itemCount: 48,
  entries: preintTownSightEntries,
  townLocationEntries: preintTownLocationEntries,
  townAdjectiveContextEntries: preintTownAdjectiveContextEntries,
  townSightEntries: preintTownSightEntries,
  townWriteEntries: preintTownWriteEntries,
  infoNotes: [
    { title: "Describing location", body: [
      "Useful patterns: in the north / south / east / west of a country",
      "on a river · on the coast",
      "north / south / east / west of another place",
      "It's in the north of England.",
      "It's on the River Ouse.",
      "It's about 25 miles east of Leeds.",
    ] },
    { title: "Describing size and population", body: ["a small town / city", "a medium-sized town / city", "a large city", "It has a population of about 200,000."] },
    { title: "famous for", body: ["Use famous for to say what people know a place for.", "York is famous for its cathedral.", "The town is famous for its historic centre."] },
    { title: "City adjective opposites", body: ["boring ↔ exciting", "crowded ↔ empty", "dangerous ↔ safe", "modern ↔ historic", "noisy ↔ quiet", "polluted ↔ clean"] },
    { title: "shopping centre / mall", body: ["shopping centre is the main British English form in this bank.", "mall is also given in the source."] },
  ],
  activities: [
    { id: "town-location-context", type: "sentence-gap-choice", dataKey: "townLocationEntries", title: "Where is it? How big is it?", shortDescription: "Complete useful phrases for describing the location and size of a town or city.", prompt: "Read the description and choose the word or phrase that fits.", itemLimit: 12 },
    { id: "town-adjectives-context", type: "sentence-gap-choice", dataKey: "townAdjectiveContextEntries", title: "What's it like?", shortDescription: "Choose the adjective that best describes each town or city.", prompt: "Read the description and choose the best adjective.", itemLimit: 12 },
    { id: "town-sights-flashcards", type: "flashcards", dataKey: "townSightEntries", title: "Places and sights flashcards", shortDescription: "Look at the place or sight and recall the word.", prompt: "Look at the picture and say the word before you flip." },
    { id: "town-sights-matching", type: "matching", dataKey: "townSightEntries", title: "Match the places and sights", shortDescription: "Match each town or city image with the correct word or phrase.", prompt: "Match the pictures and place names.", itemLimit: 8 },
    { id: "town-write", type: "sentence-gap-type-answer", dataKey: "townWriteEntries", title: "Write the city word or phrase", shortDescription: "Write city vocabulary and descriptive phrases from memory.", prompt: "Look at the image or read the clue, then type the word or phrase.", question: "Type the missing word or phrase.", answerLabel: "Answer", answerPlaceholder: "Type your answer", itemLimit: 12 },
  ],
});

const PREINT_OPPOSITE_VERBS_IMAGE_BASE = "/images/vocab/pre-int/opposite-verbs";

const preintOppositeVerbImages = {
  "arrive-leave": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/arrive-early.png`,
  "break-mend-repair": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/break-your-phone.png`,
  "buy-sell": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/buy-a-house.png`,
  "download-upload": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/download-a-song.png`,
  "find-lose": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/find-your-keys.png`,
  "forget-remember": "/images/vocab/more-verb-phrases-a2/forget-somebodys-name.png",
  "lend-borrow": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/lend-money.png`,
  "love-hate": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/love-cooking.png`,
  "miss-catch": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/miss-a-train.png`,
  "pass-fail": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/pass-an-exam.png`,
  "pick-up-drop-off": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/pick-up-at-airport.png`,
  "push-pull": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/push-the-door.png`,
  "send-get-receive": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/send-an-email.png`,
  "start-finish": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/start-a-race.png`,
  "teach-learn": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/teach-maths.png`,
  "turn-on-off": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/turn-on-tv.png`,
  "win-lose": `${PREINT_OPPOSITE_VERBS_IMAGE_BASE}/win-a-match.png`,
};

function preintOppositeVerbEntry({
  id,
  term,
  displayTerm,
  opposite,
  displayOpposite = opposite,
  acceptedAnswers = [opposite],
  options,
  flashcardPrompt,
  matchPrompt = term,
}) {
  return {
    id: `preint-opposite-${id}`,
    term,
    displayTerm,
    opposite,
    displayOpposite,
    acceptedAnswers,
    options,
    flashcardPrompt,
    flashcardAnswer: displayTerm,
    flashcardNote: `↔ ${displayOpposite}`,
    matchPrompt,
    matchAnswer: displayOpposite,
    image: preintOppositeVerbImages[id] || null,
  };
}

const preintOppositeVerbEntries = [
  preintOppositeVerbEntry({ id: "arrive-leave", term: "arrive", displayTerm: "arrive early", opposite: "leave", options: ["leave", "start", "find", "teach"], flashcardPrompt: "Someone reaches a place early." }),
  preintOppositeVerbEntry({ id: "break-mend-repair", term: "break", displayTerm: "break your phone", opposite: "mend / repair", displayOpposite: "mend / repair it", acceptedAnswers: ["mend", "repair"], options: ["mend / repair", "borrow", "lose", "turn off"], flashcardPrompt: "A phone screen becomes damaged." }),
  preintOppositeVerbEntry({ id: "buy-sell", term: "buy", displayTerm: "buy a house", opposite: "sell", displayOpposite: "sell a house", options: ["sell", "lend", "leave", "pull"], flashcardPrompt: "Someone pays money for a house." }),
  preintOppositeVerbEntry({ id: "download-upload", term: "download", displayTerm: "download a song", opposite: "upload", displayOpposite: "upload a song", options: ["upload", "receive", "turn off", "finish"], flashcardPrompt: "A song is copied from the internet to a phone." }),
  preintOppositeVerbEntry({ id: "find-lose", term: "find", displayTerm: "find your keys", opposite: "lose", displayOpposite: "lose your keys", options: ["lose", "remember", "catch", "sell"], flashcardPrompt: "Missing keys are discovered under the sofa.", matchPrompt: "find your keys" }),
  preintOppositeVerbEntry({ id: "forget-remember", term: "forget", displayTerm: "forget a name", opposite: "remember", displayOpposite: "remember a name", options: ["remember", "receive", "learn", "find"], flashcardPrompt: "A person's name disappears from your memory." }),
  preintOppositeVerbEntry({ id: "lend-borrow", term: "lend", displayTerm: "lend money to somebody", opposite: "borrow", displayOpposite: "borrow money from somebody", options: ["borrow", "sell", "get", "pull"], flashcardPrompt: "You give someone money temporarily." }),
  preintOppositeVerbEntry({ id: "love-hate", term: "love", displayTerm: "love cooking", opposite: "hate", displayOpposite: "hate cooking", options: ["hate", "fail", "lose", "leave"], flashcardPrompt: "Cooking is one of your favourite activities." }),
  preintOppositeVerbEntry({ id: "miss-catch", term: "miss", displayTerm: "miss a train", opposite: "catch", displayOpposite: "catch a train", options: ["catch", "finish", "arrive", "push"], flashcardPrompt: "You arrive too late for your train.", matchPrompt: "miss a train" }),
  preintOppositeVerbEntry({ id: "pass-fail", term: "pass", displayTerm: "pass an exam", opposite: "fail", displayOpposite: "fail an exam", options: ["fail", "lose", "forget", "drop off"], flashcardPrompt: "Your exam result is successful.", matchPrompt: "pass an exam" }),
  preintOppositeVerbEntry({ id: "pick-up-drop-off", term: "pick up", displayTerm: "pick somebody up at the airport", opposite: "drop off", displayOpposite: "drop somebody off", options: ["drop off", "turn off", "leave", "pull"], flashcardPrompt: "You collect someone from the airport by car.", matchPrompt: "pick somebody up" }),
  preintOppositeVerbEntry({ id: "push-pull", term: "push", displayTerm: "push the door", opposite: "pull", displayOpposite: "pull the door", options: ["pull", "borrow", "leave", "upload"], flashcardPrompt: "You move a door away from you." }),
  preintOppositeVerbEntry({ id: "send-get-receive", term: "send", displayTerm: "send an email", opposite: "get / receive", displayOpposite: "get / receive an email", acceptedAnswers: ["get", "receive"], options: ["get / receive", "lend", "download", "teach"], flashcardPrompt: "You transmit an email to another person." }),
  preintOppositeVerbEntry({ id: "start-finish", term: "start", displayTerm: "start a race", opposite: "finish", displayOpposite: "finish a race", options: ["finish", "leave", "fail", "turn off"], flashcardPrompt: "A race begins." }),
  preintOppositeVerbEntry({ id: "teach-learn", term: "teach", displayTerm: "teach maths", opposite: "learn", displayOpposite: "learn maths", options: ["learn", "remember", "borrow", "receive"], flashcardPrompt: "You help students understand maths." }),
  preintOppositeVerbEntry({ id: "turn-on-off", term: "turn on", displayTerm: "turn on the TV", opposite: "turn off", displayOpposite: "turn off the TV", options: ["turn off", "finish", "drop off", "upload"], flashcardPrompt: "You press the button and the TV starts working." }),
  preintOppositeVerbEntry({ id: "win-lose", term: "win", displayTerm: "win a match", opposite: "lose", displayOpposite: "lose a match", options: ["lose", "fail", "miss", "sell"], flashcardPrompt: "Your team finishes a match with the better score.", matchPrompt: "win a match" }),
];

const preintOppositeVerbContextEntries = [
  { id: "preint-opposite-context-01", sentence: "We _____ at the hotel at about nine in the evening.", answer: "arrived", options: ["arrived", "left", "missed", "finished"] },
  { id: "preint-opposite-context-02", sentence: "We need to _____ now or we'll miss the last train.", answer: "leave", options: ["leave", "arrive", "catch", "receive"] },
  { id: "preint-opposite-context-03", sentence: "I dropped my phone and _____ the screen.", answer: "broke", options: ["broke", "repaired", "found", "sold"] },
  { id: "preint-opposite-context-04", sentence: "My phone isn't working. I need to get it _____.", answer: "repaired", acceptedAnswers: ["repaired", "mended"], options: ["repaired", "mended", "broken", "borrowed"] },
  { id: "preint-opposite-context-05", sentence: "They _____ a small flat last year.", answer: "bought", options: ["bought", "sold", "lent", "found"] },
  { id: "preint-opposite-context-06", sentence: "They're moving abroad, so they're going to _____ their house.", answer: "sell", options: ["sell", "buy", "borrow", "lose"] },
  { id: "preint-opposite-context-07", sentence: "I _____ the song onto my phone so I can listen offline.", answer: "downloaded", options: ["downloaded", "uploaded", "received", "turned off"] },
  { id: "preint-opposite-context-08", sentence: "She _____ the video to the website yesterday.", answer: "uploaded", options: ["uploaded", "downloaded", "sent", "found"] },
  { id: "preint-opposite-context-09", sentence: "I couldn't find my keys this morning, but eventually I _____ them under the sofa.", answer: "found", options: ["found", "lost", "remembered", "caught"] },
  { id: "preint-opposite-context-10", sentence: "Be careful with your keys. Don't _____ them.", answer: "lose", options: ["lose", "find", "forget", "leave"] },
  { id: "preint-opposite-context-11", sentence: "I always _____ people's names five minutes after I meet them.", answer: "forget", options: ["forget", "remember", "learn", "receive"] },
  { id: "preint-opposite-context-12", sentence: "Do you _____ the name of our old English teacher?", answer: "remember", options: ["remember", "forget", "teach", "find"] },
  { id: "preint-opposite-context-13", sentence: "Could you _____ me €20 until tomorrow?", answer: "lend", options: ["lend", "borrow", "sell", "receive"] },
  { id: "preint-opposite-context-14", sentence: "Can I _____ €20 from you until tomorrow?", answer: "borrow", options: ["borrow", "lend", "buy", "send"] },
  { id: "preint-opposite-context-15", sentence: "I _____ cooking. I make dinner whenever I can.", answer: "love", options: ["love", "hate", "learn", "win"] },
  { id: "preint-opposite-context-16", sentence: "My brother _____ cooking, so he always orders food.", answer: "hates", options: ["hates", "loves", "misses", "loses"] },
  { id: "preint-opposite-context-17", sentence: "We got to the station too late and _____ the train.", answer: "missed", options: ["missed", "caught", "left", "arrived"] },
  { id: "preint-opposite-context-18", sentence: "If we run, we can still _____ the 8.15 train.", answer: "catch", options: ["catch", "miss", "leave", "arrive"] },
  { id: "preint-opposite-context-19", sentence: "She studied really hard and _____ the exam.", answer: "passed", options: ["passed", "failed", "won", "finished"] },
  { id: "preint-opposite-context-20", sentence: "I didn't study enough, so I _____ the exam.", answer: "failed", options: ["failed", "passed", "missed", "lost"] },
  { id: "preint-opposite-context-21", sentence: "I'll _____ you up at the airport when you arrive.", answer: "pick", options: ["pick", "drop", "pull", "turn"] },
  { id: "preint-opposite-context-22", sentence: "I can _____ you off at the station on my way to work.", answer: "drop", options: ["drop", "pick", "send", "turn"] },
  { id: "preint-opposite-context-23", sentence: "Don't _____ the door. Pull it towards you.", answer: "push", options: ["push", "pull", "turn on", "break"] },
  { id: "preint-opposite-context-24", sentence: "The room is dark. Can you _____ the TV and the lamp?", answer: "turn on", options: ["turn on", "turn off", "push", "finish"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-opposite-verbs",
  level: "a2-b1",
  order: 8,
  title: "Opposite verbs",
  shortDescription: "Practise common verbs and their opposites through pairs and everyday contexts.",
  textbookRef: "Pre-intermediate Vocabulary Bank 8",
  accent: "#a9d876",
  itemCount: 17,
  entries: preintOppositeVerbEntries,
  oppositeVerbEntries: preintOppositeVerbEntries,
  oppositeVerbContextEntries: preintOppositeVerbContextEntries,
  infoNotes: [
    { title: "lend or borrow?", body: ["Lend means give something temporarily; borrow means receive or use it temporarily.", "lend something TO somebody", "borrow something FROM somebody"] },
    { title: "miss or catch?", body: ["miss a train / bus / flight = arrive too late for it", "catch a train / bus / flight = get on it successfully"] },
    { title: "pick up or drop off?", body: ["pick somebody up = collect them, often by car", "drop somebody off = take them somewhere and leave them there"] },
    { title: "mend or repair?", body: ["The source gives both as opposites of break.", "Repair is especially common for machines, phones and cars. Both answers are accepted here."] },
    { title: "get or receive?", body: ["Both are opposites of send in the context of messages.", "Get is common in everyday English; receive is more formal."] },
    { title: "One opposite can appear twice", body: ["lose your keys is the opposite of find your keys", "lose a match is the opposite of win a match"] },
  ],
  activities: [
    { id: "opposite-verb-flashcards", type: "flashcards", dataKey: "oppositeVerbEntries", title: "Opposite verb flashcards", shortDescription: "Recall the source verb phrase, then learn its opposite.", prompt: "Read the situation. Say the verb phrase and its opposite before you flip." },
    { id: "choose-opposite-verb", type: "opposites-choice", dataKey: "oppositeVerbEntries", title: "Choose the opposite", shortDescription: "Choose the verb with the opposite meaning.", prompt: "Choose the opposite verb.", itemLimit: 12 },
    { id: "opposite-verbs-matching", type: "matching", dataKey: "oppositeVerbEntries", title: "Match the opposite verbs", shortDescription: "Match each verb or verb phrase with its opposite.", prompt: "Match the opposite verb pairs.", itemLimit: 8, uniqueMatchAnswerKey: "matchAnswer" },
    { id: "opposite-verbs-context", type: "sentence-gap-choice", dataKey: "oppositeVerbContextEntries", title: "Which verb fits?", shortDescription: "Choose the correct verb in everyday situations.", prompt: "Read the sentence and choose the verb that fits.", question: "Choose the correct verb.", itemLimit: 12 },
    { id: "write-opposite-verb", type: "opposite-type-answer", dataKey: "oppositeVerbEntries", title: "Write the opposite", shortDescription: "Look at the verb and type its opposite.", prompt: "Write the opposite verb.", answerLabel: "Opposite verb", answerPlaceholder: "Type the opposite", itemLimit: 12 },
  ],
});

function preintVerbFormEntry(id, headVerb, pattern, patternLabel, model) {
  return {
    id: `preint-verb-form-${id}`,
    term: headVerb,
    headVerb,
    pattern,
    flashcardPrompt: headVerb,
    flashcardAnswer: `${headVerb} + ${patternLabel}`,
    flashcardNote: model,
  };
}

const preintVerbFormEntries = [
  preintVerbFormEntry("decide", "decide", "infinitive", "to + infinitive", "We've decided to go to France."),
  preintVerbFormEntry("forget", "forget", "infinitive", "to + infinitive", "Don't forget to turn off the lights."),
  preintVerbFormEntry("hope", "hope", "infinitive", "to + infinitive", "We hope to see you again soon."),
  preintVerbFormEntry("learn", "learn", "infinitive", "to + infinitive", "I'm learning to drive."),
  preintVerbFormEntry("need", "need", "infinitive", "to + infinitive", "I need to go to the supermarket."),
  preintVerbFormEntry("offer", "offer", "infinitive", "to + infinitive", "He offered to help me."),
  preintVerbFormEntry("plan", "plan", "infinitive", "to + infinitive", "They're planning to get married."),
  preintVerbFormEntry("pretend", "pretend", "infinitive", "to + infinitive", "He pretended to be ill."),
  preintVerbFormEntry("promise", "promise", "infinitive", "to + infinitive", "He promised to pay me back."),
  preintVerbFormEntry("remember", "remember", "infinitive", "to + infinitive", "Remember to bring your dictionary."),
  preintVerbFormEntry("try", "try", "infinitive", "to + infinitive", "I'm trying to find a job."),
  preintVerbFormEntry("want", "want", "infinitive", "to + infinitive", "I want to catch the six o'clock train."),
  preintVerbFormEntry("would-like", "would like", "infinitive", "to + infinitive", "I'd like to buy a new car."),
  preintVerbFormEntry("enjoy", "enjoy", "gerund", "verb + -ing", "I enjoy reading in bed."),
  preintVerbFormEntry("finish", "finish", "gerund", "verb + -ing", "Have you finished tidying your room?"),
  preintVerbFormEntry("go-on", "go on", "gerund", "verb + -ing", "I want to go on working until I'm 70."),
  preintVerbFormEntry("hate", "hate", "gerund", "verb + -ing", "I hate being late."),
  preintVerbFormEntry("like", "like", "gerund", "verb + -ing", "I like having breakfast in a café."),
  preintVerbFormEntry("love", "love", "gerund", "verb + -ing", "I love waking up early."),
  preintVerbFormEntry("mind", "mind", "gerund", "verb + -ing", "I don't mind doing the ironing."),
  preintVerbFormEntry("spend-time", "spend time", "gerund", "verb + -ing", "She spends hours talking on the phone."),
  preintVerbFormEntry("stop", "stop", "gerund", "verb + -ing", "Please stop making such a noise."),
  preintVerbFormEntry("feel-like", "feel like", "gerund", "verb + -ing", "I don't feel like cooking today."),
  preintVerbFormEntry("start", "start", "both", "to + infinitive OR verb + -ing", "It started to rain. / It started raining."),
];

const preintVerbFormComplementEntries = [
  { id: "preint-verb-complement-01", sentence: "We've decided _____ to France for our holiday.", answer: "to go", options: ["to go", "going", "go", "went"] },
  { id: "preint-verb-complement-02", sentence: "Don't forget _____ all the lights.", answer: "to turn off", options: ["to turn off", "turning off", "turn off", "turned off"] },
  { id: "preint-verb-complement-03", sentence: "We hope _____ you again soon.", answer: "to see", options: ["to see", "seeing", "see", "saw"] },
  { id: "preint-verb-complement-04", sentence: "I'm learning _____. My driving test is next month.", answer: "to drive", options: ["to drive", "driving", "drive", "drove"] },
  { id: "preint-verb-complement-05", sentence: "I need _____ to the supermarket.", answer: "to go", options: ["to go", "going", "go", "went"] },
  { id: "preint-verb-complement-06", sentence: "He offered _____ me with my case.", answer: "to help", options: ["to help", "helping", "help", "helped"] },
  { id: "preint-verb-complement-07", sentence: "They're planning _____ soon.", answer: "to get married", options: ["to get married", "getting married", "get married", "got married"] },
  { id: "preint-verb-complement-08", sentence: "He pretended _____ ill.", answer: "to be", options: ["to be", "being", "be", "been"] },
  { id: "preint-verb-complement-09", sentence: "He's promised _____ me back when he gets a job.", answer: "to pay", options: ["to pay", "paying", "pay", "paid"] },
  { id: "preint-verb-complement-10", sentence: "Remember _____ your dictionaries to class tomorrow.", answer: "to bring", options: ["to bring", "bringing", "bring", "brought"] },
  { id: "preint-verb-complement-11", sentence: "It was very cloudy and it started _____.", answer: "to rain", acceptedAnswers: ["to rain", "raining"], options: ["to rain", "raining", "rain", "rained"] },
  { id: "preint-verb-complement-12", sentence: "I'm trying _____ a job, but it's very hard.", answer: "to find", options: ["to find", "finding", "find", "found"] },
  { id: "preint-verb-complement-13", sentence: "I want _____ the six o'clock train.", answer: "to catch", options: ["to catch", "catching", "catch", "caught"] },
  { id: "preint-verb-complement-14", sentence: "I'd like _____ a new car next month.", answer: "to buy", options: ["to buy", "buying", "buy", "bought"] },
  { id: "preint-verb-complement-15", sentence: "I enjoy _____ in bed.", answer: "reading", options: ["reading", "to read", "read", "reads"] },
  { id: "preint-verb-complement-16", sentence: "Have you finished _____ your room?", answer: "tidying", options: ["tidying", "to tidy", "tidy", "tidied"] },
  { id: "preint-verb-complement-17", sentence: "I want to go on _____ until I'm 70.", answer: "working", options: ["working", "to work", "work", "worked"] },
  { id: "preint-verb-complement-18", sentence: "I hate _____ late when I'm meeting someone.", answer: "being", acceptedAnswers: ["being", "to be"], options: ["being", "to be", "be", "been"] },
  { id: "preint-verb-complement-19", sentence: "I like _____ breakfast in a café.", answer: "having", acceptedAnswers: ["having", "to have"], options: ["having", "to have", "have", "had"] },
  { id: "preint-verb-complement-20", sentence: "I love _____ up early on a sunny morning.", answer: "waking", acceptedAnswers: ["waking", "to wake"], options: ["waking", "to wake", "wake", "woke"] },
  { id: "preint-verb-complement-21", sentence: "I don't mind _____ the ironing.", answer: "doing", options: ["doing", "to do", "do", "did"] },
  { id: "preint-verb-complement-22", sentence: "She spends hours _____ on the phone.", answer: "talking", options: ["talking", "to talk", "talk", "talked"] },
  { id: "preint-verb-complement-23", sentence: "It started _____ at 5.30 in the morning.", answer: "raining", acceptedAnswers: ["raining", "to rain"], options: ["raining", "to rain", "rain", "rained"] },
  { id: "preint-verb-complement-24", sentence: "Please stop _____ such a noise.", answer: "making", options: ["making", "to make", "make", "made"] },
  { id: "preint-verb-complement-25", sentence: "I don't feel like _____ today. Let's go out for lunch.", answer: "cooking", options: ["cooking", "to cook", "cook", "cooked"] },
];

const preintVerbFormContextEntries = [
  { id: "preint-verb-context-01", sentence: "We're planning _____ Italy next summer.", answer: "to visit", options: ["to visit", "visiting", "visit", "visited"] },
  { id: "preint-verb-context-02", sentence: "She offered _____ me home after the party.", answer: "to drive", options: ["to drive", "driving", "drive", "drove"] },
  { id: "preint-verb-context-03", sentence: "I hope _____ a better job soon.", answer: "to find", options: ["to find", "finding", "find", "found"] },
  { id: "preint-verb-context-04", sentence: "Don't forget _____ your phone charger.", answer: "to bring", options: ["to bring", "bringing", "bring", "brought"] },
  { id: "preint-verb-context-05", sentence: "He's learning _____ Spanish.", answer: "to speak", options: ["to speak", "speaking", "speak", "spoke"] },
  { id: "preint-verb-context-06", sentence: "They've decided _____ their old car.", answer: "to sell", options: ["to sell", "selling", "sell", "sold"] },
  { id: "preint-verb-context-07", sentence: "She pretended _____ asleep when I came into the room.", answer: "to be", options: ["to be", "being", "be", "been"] },
  { id: "preint-verb-context-08", sentence: "I'd like _____ something to drink.", answer: "to have", options: ["to have", "having", "have", "had"] },
  { id: "preint-verb-context-09", sentence: "He promised _____ me as soon as he arrived.", answer: "to call", options: ["to call", "calling", "call", "called"] },
  { id: "preint-verb-context-10", sentence: "We need _____ before it gets dark.", answer: "to leave", options: ["to leave", "leaving", "leave", "left"] },
  { id: "preint-verb-context-11", sentence: "I really enjoy _____ new places.", answer: "visiting", options: ["visiting", "to visit", "visit", "visited"] },
  { id: "preint-verb-context-12", sentence: "Have you finished _____ your homework?", answer: "doing", options: ["doing", "to do", "do", "did"] },
  { id: "preint-verb-context-13", sentence: "Please stop _____ while I'm talking.", answer: "interrupting", options: ["interrupting", "to interrupt", "interrupt", "interrupted"] },
  { id: "preint-verb-context-14", sentence: "Do you mind _____ the window?", answer: "opening", options: ["opening", "to open", "open", "opened"] },
  { id: "preint-verb-context-15", sentence: "We spent the afternoon _____ around the old town.", answer: "walking", options: ["walking", "to walk", "walk", "walked"] },
  { id: "preint-verb-context-16", sentence: "I don't feel like _____ tonight.", answer: "going out", options: ["going out", "to go out", "go out", "went out"] },
  { id: "preint-verb-context-17", sentence: "She loves _____ for her friends.", answer: "cooking", acceptedAnswers: ["cooking", "to cook"], options: ["cooking", "to cook", "cook", "cooked"] },
  { id: "preint-verb-context-18", sentence: "He hates _____ for buses in the rain.", answer: "waiting", acceptedAnswers: ["waiting", "to wait"], options: ["waiting", "to wait", "wait", "waited"] },
  { id: "preint-verb-context-19", sentence: "After university, she went on _____ in the same city.", answer: "living", options: ["living", "to live", "live", "lived"] },
  { id: "preint-verb-context-20", sentence: "I like _____ breakfast outside when the weather is good.", answer: "having", acceptedAnswers: ["having", "to have"], options: ["having", "to have", "have", "had"] },
];

const preintVerbFormWriteEntries = [
  { id: "preint-verb-write-01", sentence: "We decided _____ to the beach. (go)", answer: "to go", acceptedAnswers: ["to go"] },
  { id: "preint-verb-write-02", sentence: "Don't forget _____ the door. (lock)", answer: "to lock", acceptedAnswers: ["to lock"] },
  { id: "preint-verb-write-03", sentence: "I hope _____ you soon. (see)", answer: "to see", acceptedAnswers: ["to see"] },
  { id: "preint-verb-write-04", sentence: "She's learning _____. (drive)", answer: "to drive", acceptedAnswers: ["to drive"] },
  { id: "preint-verb-write-05", sentence: "I need _____ some food. (buy)", answer: "to buy", acceptedAnswers: ["to buy"] },
  { id: "preint-verb-write-06", sentence: "He offered _____ us. (help)", answer: "to help", acceptedAnswers: ["to help"] },
  { id: "preint-verb-write-07", sentence: "They're planning _____ next year. (get married)", answer: "to get married", acceptedAnswers: ["to get married"] },
  { id: "preint-verb-write-08", sentence: "He pretended _____ busy. (be)", answer: "to be", acceptedAnswers: ["to be"] },
  { id: "preint-verb-write-09", sentence: "She promised _____ me later. (call)", answer: "to call", acceptedAnswers: ["to call"] },
  { id: "preint-verb-write-10", sentence: "Remember _____ your passport. (bring)", answer: "to bring", acceptedAnswers: ["to bring"] },
  { id: "preint-verb-write-11", sentence: "I'm trying _____ my glasses. (find)", answer: "to find", acceptedAnswers: ["to find"] },
  { id: "preint-verb-write-12", sentence: "I want _____ home early. (go)", answer: "to go", acceptedAnswers: ["to go"] },
  { id: "preint-verb-write-13", sentence: "I'd like _____ that jacket. (try on)", answer: "to try on", acceptedAnswers: ["to try on"] },
  { id: "preint-verb-write-14", sentence: "I enjoy _____ before I go to sleep. (read)", answer: "reading", acceptedAnswers: ["reading"] },
  { id: "preint-verb-write-15", sentence: "Have you finished _____ your room? (tidy)", answer: "tidying", acceptedAnswers: ["tidying"] },
  { id: "preint-verb-write-16", sentence: "She wants to go on _____ after she has children. (work)", answer: "working", acceptedAnswers: ["working"] },
  { id: "preint-verb-write-17", sentence: "I hate _____ late. (be)", answer: "being", acceptedAnswers: ["being", "to be"] },
  { id: "preint-verb-write-18", sentence: "I like _____ breakfast in a café. (have)", answer: "having", acceptedAnswers: ["having", "to have"] },
  { id: "preint-verb-write-19", sentence: "I love _____ up early in summer. (wake)", answer: "waking", acceptedAnswers: ["waking", "to wake"] },
  { id: "preint-verb-write-20", sentence: "I don't mind _____ housework. (do)", answer: "doing", acceptedAnswers: ["doing"] },
  { id: "preint-verb-write-21", sentence: "He spends hours _____ to his friends online. (talk)", answer: "talking", acceptedAnswers: ["talking"] },
  { id: "preint-verb-write-22", sentence: "Please stop _____ that noise. (make)", answer: "making", acceptedAnswers: ["making"] },
  { id: "preint-verb-write-23", sentence: "I don't feel like _____ tonight. (cook)", answer: "cooking", acceptedAnswers: ["cooking"] },
  { id: "preint-verb-write-24", sentence: "It started _____. (rain)", answer: "raining / to rain", acceptedAnswers: ["raining", "to rain"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-verb-forms",
  level: "a2-b1",
  order: 9,
  title: "Verb forms",
  shortDescription: "Practise common verbs followed by to + infinitive or verb + -ing.",
  textbookRef: "Pre-intermediate Vocabulary Bank 9",
  accent: "#f0ba6a",
  itemCount: 24,
  entries: preintVerbFormEntries,
  verbFormEntries: preintVerbFormEntries,
  infinitiveEntries: preintVerbFormEntries.filter((entry) => ["infinitive", "both"].includes(entry.pattern)),
  gerundEntries: preintVerbFormEntries.filter((entry) => ["gerund", "both"].includes(entry.pattern)),
  verbFormSortEntries: preintVerbFormEntries,
  verbFormComplementEntries: preintVerbFormComplementEntries,
  verbFormContextEntries: preintVerbFormContextEntries,
  verbFormWriteEntries: preintVerbFormWriteEntries,
  infoNotes: [
    { title: "Verb + to + infinitive", body: ["decide · forget · hope · learn · need · offer · plan", "pretend · promise · remember · try · want · would like", "We decided to go. · Don't forget to call me."] },
    { title: "Verb + -ing", body: ["enjoy · finish · go on · hate · like · love", "mind · spend time · stop · feel like", "I enjoy reading. · I don't feel like cooking."] },
    { title: "start", body: ["Start can be followed by either form.", "It started raining. · It started to rain.", "Both are correct."] },
    { title: "spend time", body: ["Use spend + time + -ing.", "She spends hours talking on the phone."] },
    { title: "feel like", body: ["Feel like is followed by -ing.", "I feel like going out. · I don't feel like cooking."] },
  ],
  activities: [
    { id: "verb-form-flashcards", type: "flashcards", dataKey: "verbFormEntries", title: "Verb form flashcards", shortDescription: "Recall whether each verb is followed by to + infinitive or -ing.", prompt: "Look at the verb and say the pattern before you flip." },
    { id: "verb-form-sort", type: "category-sort", dataKey: "verbFormSortEntries", title: "Which verb form?", shortDescription: "Sort verbs according to the form that follows them.", prompt: "What normally comes after this verb in this vocabulary bank?", promptKey: "headVerb", categoryKey: "pattern", itemLimit: 15, categories: [
      { id: "infinitive", label: "TO + INFINITIVE" },
      { id: "gerund", label: "VERB + -ING" },
      { id: "both", label: "BOTH" },
    ] },
    { id: "verb-form-complements", type: "sentence-gap-choice", dataKey: "verbFormComplementEntries", title: "Complete the verb phrase", shortDescription: "Choose the correct verb form to complete sentences from the vocabulary bank.", prompt: "Choose the correct form.", question: "Which form completes the sentence?", itemLimit: 12 },
    { id: "verb-forms-context", type: "sentence-gap-choice", dataKey: "verbFormContextEntries", title: "Verb forms in context", shortDescription: "Choose the natural verb pattern in new everyday situations.", prompt: "Choose the form that fits the sentence.", itemLimit: 12 },
    { id: "verb-form-write", type: "sentence-gap-type-answer", dataKey: "verbFormWriteEntries", title: "Write the correct verb form", shortDescription: "Complete each sentence with the correct form of the verb in brackets.", prompt: "Write the correct form of the verb.", answerLabel: "Verb form", answerPlaceholder: "Type the missing words", itemLimit: 12 },
  ],
});

const PREINT_GET_IMAGE_BASE = "/images/vocab/pre-int/get";

const preintGetImages = {
  angry: `${PREINT_GET_IMAGE_BASE}/get-angry.png`,
  fit: `${PREINT_GET_IMAGE_BASE}/get-fit.png`,
  lost: `${PREINT_GET_IMAGE_BASE}/get-lost.png`,
  married: `${PREINT_GET_IMAGE_BASE}/get-married.png`,
  nervous: `${PREINT_GET_IMAGE_BASE}/get-nervous.png`,
  ready: `${PREINT_GET_IMAGE_BASE}/get-ready.png`,
  colder: `${PREINT_GET_IMAGE_BASE}/get-colder.png`,
  job: `${PREINT_GET_IMAGE_BASE}/get-a-job.png`,
  newspaper: "/images/vocab/more-verb-phrases-a2/buy-a-newspaper.png",
  ticket: `${PREINT_GET_IMAGE_BASE}/get-a-ticket.png`,
  "into-car": `${PREINT_GET_IMAGE_BASE}/get-into-a-car.png`,
  "out-of-car": `${PREINT_GET_IMAGE_BASE}/get-out-of-a-car.png`,
  "on-bus": `${PREINT_GET_IMAGE_BASE}/get-on-a-bus.png`,
  "off-bus": `${PREINT_GET_IMAGE_BASE}/get-off-a-bus.png`,
  up: "/images/vocab/typical-day/get-up.png",
  home: "/images/vocab/typical-day/go-home.png",
  "email-text": "/images/vocab/go-have-get-a2/get-an-email.png",
  present: `${PREINT_GET_IMAGE_BASE}/get-a-present.png`,
  prize: `${PREINT_GET_IMAGE_BASE}/get-a-prize.png`,
};

function preintGetEntry(id, phrase, complement, meaningGroup, cue, meaningLabel, acceptedAnswers = []) {
  return {
    id: `preint-get-${id}`,
    term: phrase,
    phrase,
    complement,
    meaningGroup,
    cueText: cue,
    acceptedAnswers: [phrase, ...acceptedAnswers],
    flashcardPrompt: cue,
    flashcardAnswer: phrase,
    flashcardNote: `GET = ${meaningLabel}`,
    image: preintGetImages[id] || null,
  };
}

const preintGetEntries = [
  preintGetEntry("angry", "get angry", "angry", "become", "Someone's mood changes because they are annoyed.", "become"),
  preintGetEntry("divorced", "get divorced", "divorced", "become", "A married couple legally separates.", "become"),
  preintGetEntry("fit", "get fit", "fit", "become", "Someone exercises regularly and becomes healthier.", "become"),
  preintGetEntry("lost", "get lost", "lost", "become", "Someone cannot find the correct way.", "become"),
  preintGetEntry("married", "get married", "married", "become", "Two people have a wedding.", "become"),
  preintGetEntry("nervous", "get nervous", "nervous", "become", "Someone begins to worry before an interview.", "become"),
  preintGetEntry("ready", "get ready", "ready", "become", "Someone prepares to leave.", "become"),
  preintGetEntry("better", "get better", "better", "become", "An ill person's health improves.", "become"),
  preintGetEntry("worse", "get worse", "worse", "become", "A bad situation deteriorates.", "become"),
  preintGetEntry("colder", "get colder", "colder", "become", "The temperature continues to fall.", "become"),
  preintGetEntry("job", "get a job", "a job", "obtain", "An applicant receives an offer of employment.", "obtain"),
  preintGetEntry("newspaper", "get a newspaper", "a newspaper", "obtain", "Someone buys the day's paper.", "buy / obtain"),
  preintGetEntry("ticket", "get a ticket", "a ticket", "obtain", "A traveller obtains permission to travel.", "buy / obtain"),
  preintGetEntry("into-car", "get into a car", "into a car", "phrasal", "Someone opens a car door and enters.", "preposition pattern"),
  preintGetEntry("out-of-car", "get out of a car", "out of a car", "phrasal", "Someone opens a car door and leaves the vehicle.", "preposition pattern"),
  preintGetEntry("on-bus", "get on a bus", "on a bus", "phrasal", "Someone boards a bus.", "preposition pattern"),
  preintGetEntry("off-bus", "get off a bus", "off a bus", "phrasal", "Someone leaves a bus at a stop.", "preposition pattern"),
  preintGetEntry("on-with", "get on with somebody", "on with somebody", "phrasal", "Two people have a good relationship.", "have a good relationship"),
  preintGetEntry("up", "get up", "up", "phrasal", "Someone leaves their bed in the morning.", "rise after sleeping"),
  preintGetEntry("home", "get home", "home", "arrive", "Someone reaches their home after a journey.", "arrive"),
  preintGetEntry("school", "get to school", "to school", "arrive", "A student reaches school.", "arrive"),
  preintGetEntry("work", "get to work", "to work", "arrive", "Someone reaches their workplace.", "arrive"),
  preintGetEntry("email-text", "get an email / a text message", "an email / a text message", "receive", "A new message arrives on someone's phone.", "receive", ["get an email", "get a text message", "get a text"]),
  preintGetEntry("present", "get a present", "a present", "receive", "Someone is given a wrapped birthday gift.", "receive"),
  preintGetEntry("prize", "get a prize", "a prize", "receive", "A competition winner is given an award.", "receive"),
];

const preintGetMeaningSortEntries = [
  ...preintGetEntries.filter((entry) => entry.id !== "preint-get-email-text"),
  { ...preintGetEntries.find((entry) => entry.id === "preint-get-email-text"), id: "preint-get-email", term: "get an email", phrase: "get an email" },
  { ...preintGetEntries.find((entry) => entry.id === "preint-get-email-text"), id: "preint-get-text-message", term: "get a text message", phrase: "get a text message" },
];

const preintGetContextEntries = [
  { id: "preint-get-context-01", sentence: "If you shout at him, he'll get ____.", answer: "angry", options: ["angry", "ready", "married", "fit"] },
  { id: "preint-get-context-02", sentence: "Her parents separated and eventually got ____.", answer: "divorced", options: ["divorced", "married", "lost", "ready"] },
  { id: "preint-get-context-03", sentence: "I've started running three times a week because I want to get ____.", answer: "fit", options: ["fit", "nervous", "lost", "angry"] },
  { id: "preint-get-context-04", sentence: "We didn't have a map and we got ____.", answer: "lost", options: ["lost", "fit", "ready", "better"] },
  { id: "preint-get-context-05", sentence: "They're going to get _____ next summer.", answer: "married", options: ["married", "divorced", "nervous", "colder"] },
  { id: "preint-get-context-06", sentence: "I always get _____ before job interviews.", answer: "nervous", options: ["nervous", "angry", "fit", "married"] },
  { id: "preint-get-context-07", sentence: "Hurry up and get _____. We need to leave in ten minutes.", answer: "ready", options: ["ready", "lost", "divorced", "worse"] },
  { id: "preint-get-context-08", sentence: "She's been ill, but she's starting to get ____.", answer: "better", options: ["better", "worse", "colder", "nervous"] },
  { id: "preint-get-context-09", sentence: "The rain is heavier and the wind is stronger. The weather is getting ____.", answer: "worse", options: ["worse", "better", "colder", "ready"] },
  { id: "preint-get-context-10", sentence: "Take a coat. It's going to get _____ tonight.", answer: "colder", options: ["colder", "better", "fit", "angry"] },
  { id: "preint-get-context-11", sentence: "After months of applications, she finally got a ____.", answer: "job", options: ["job", "newspaper", "prize", "present"] },
  { id: "preint-get-context-12", sentence: "I'm going to the shop to get a ____.", answer: "newspaper", options: ["newspaper", "job", "prize", "email"] },
  { id: "preint-get-context-13", sentence: "We need to get a _____ before we get on the train.", answer: "ticket", options: ["ticket", "newspaper", "job", "present"] },
  { id: "preint-get-context-14", sentence: "Open the door and get _____ the car.", answer: "into", options: ["into", "on", "off", "to"] },
  { id: "preint-get-context-15", sentence: "We arrived, parked, and got _____ of the car.", answer: "out", options: ["out", "on", "off", "to"] },
  { id: "preint-get-context-16", sentence: "The bus is here. Let's get ____.", answer: "on", options: ["on", "into", "out", "to"] },
  { id: "preint-get-context-17", sentence: "This is our stop. We need to get _____ the bus.", answer: "off", options: ["off", "out of", "into", "to"] },
  { id: "preint-get-context-18", sentence: "I get _____ really well with my sister.", answer: "on", options: ["on", "into", "off", "to"] },
  { id: "preint-get-context-19", sentence: "I normally get _____ at seven o'clock.", answer: "up", options: ["up", "on", "to", "into"] },
  { id: "preint-get-context-20", sentence: "What time did you get _____ last night?", answer: "home", options: ["home", "to home", "at home", "into home"] },
  { id: "preint-get-context-21", sentence: "The children get _____ school at about eight.", answer: "to", options: ["to", "at", "in", "on"] },
  { id: "preint-get-context-22", sentence: "I usually get _____ work by bus.", answer: "to", options: ["to", "at", "on", "into"] },
  { id: "preint-get-context-23", sentence: "I got an _____ from Laura this morning.", answer: "email", options: ["email", "job", "ticket", "newspaper"] },
  { id: "preint-get-context-24", sentence: "I got a lovely _____ for my birthday.", answer: "present", options: ["present", "prize", "ticket", "job"] },
  { id: "preint-get-context-25", sentence: "She came first in the competition and got a ____.", answer: "prize", options: ["prize", "present", "newspaper", "job"] },
];

const preintGetPrepositionEntries = [
  { id: "preint-get-transport-01", sentence: "She opened the door and got _____ the car.", answer: "into", options: ["into", "on", "off", "to"] },
  { id: "preint-get-transport-02", sentence: "We stopped outside the hotel and got _____ of the taxi.", answer: "out", options: ["out", "on", "into", "up"] },
  { id: "preint-get-transport-03", sentence: "He got _____ the bus and found a seat.", answer: "on", options: ["on", "into", "out of", "to"] },
  { id: "preint-get-transport-04", sentence: "We got _____ the bus at the next stop.", answer: "off", options: ["off", "out of", "into", "to"] },
  { id: "preint-get-transport-05", sentence: "You normally get _____ a car but _____ a bus.", answer: "into / on", options: ["into / on", "on / into", "off / out of", "to / on"] },
  { id: "preint-get-transport-06", sentence: "You normally get _____ of a car but _____ a bus.", answer: "out of / off", options: ["out of / off", "off / out of", "into / on", "on / into"] },
  { id: "preint-get-transport-07", sentence: "I got _____ at midnight and went straight to bed.", answer: "home", options: ["home", "to home", "at home", "into home"] },
  { id: "preint-get-transport-08", sentence: "What time do you normally get _____ school?", answer: "to", options: ["to", "at", "on", "into"] },
  { id: "preint-get-transport-09", sentence: "She gets _____ work at about 8.30.", answer: "to", options: ["to", "at", "in", "on"] },
  { id: "preint-get-transport-10", sentence: "The traffic was terrible, so we didn't get _____ until very late.", answer: "home", options: ["home", "to home", "at home", "into home"] },
  { id: "preint-get-transport-11", sentence: "I left late but still got _____ work on time.", answer: "to", options: ["to", "at", "into", "on"] },
  { id: "preint-get-transport-12", sentence: "The bus was crowded, but we managed to get ____.", answer: "on", options: ["on", "into", "out of", "up"] },
  { id: "preint-get-transport-13", sentence: "When the taxi arrived, we got _____ the car quickly.", answer: "into", options: ["into", "on", "off", "to"] },
  { id: "preint-get-transport-14", sentence: "Don't get _____ the bus here. The next stop is closer.", answer: "off", options: ["off", "out", "into", "up"] },
  { id: "preint-get-transport-15", sentence: "We got _____ of the car and walked into the restaurant.", answer: "out", options: ["out", "off", "on", "to"] },
];

const preintGetWriteEntries = [
  { id: "preint-get-write-01", sentence: "He was really annoyed and started to get ____.", answer: "angry", acceptedAnswers: ["angry"] },
  { id: "preint-get-write-02", sentence: "They aren't together any more. They got _____ last year.", answer: "divorced", acceptedAnswers: ["divorced"] },
  { id: "preint-get-write-03", sentence: "I need more exercise. I want to get ____.", answer: "fit", acceptedAnswers: ["fit"] },
  { id: "preint-get-write-04", sentence: "We took the wrong road and got ____.", answer: "lost", acceptedAnswers: ["lost"] },
  { id: "preint-get-write-05", sentence: "They're getting _____ in June.", answer: "married", acceptedAnswers: ["married"] },
  { id: "preint-get-write-06", sentence: "Exams always make me get ____.", answer: "nervous", acceptedAnswers: ["nervous"] },
  { id: "preint-get-write-07", sentence: "It's nearly time to go. Get ____!", answer: "ready", acceptedAnswers: ["ready"] },
  { id: "preint-get-write-08", sentence: "I was ill last week, but I'm getting ____.", answer: "better", acceptedAnswers: ["better"] },
  { id: "preint-get-write-09", sentence: "The weather is getting _____. Now it's raining heavily.", answer: "worse", acceptedAnswers: ["worse"] },
  { id: "preint-get-write-10", sentence: "It's getting _____ as winter approaches.", answer: "colder", acceptedAnswers: ["colder"] },
  { id: "preint-get-write-11", sentence: "After university, I hope to get a ____.", answer: "job", acceptedAnswers: ["job"] },
  { id: "preint-get-write-12", sentence: "I stopped at the station to get a ____.", answer: "ticket", acceptedAnswers: ["ticket"] },
  { id: "preint-get-write-13", sentence: "Dad goes out every morning to get a ____.", answer: "newspaper", acceptedAnswers: ["newspaper"] },
  { id: "preint-get-write-14", sentence: "She opened the door and got _____ the car.", answer: "into", acceptedAnswers: ["into"] },
  { id: "preint-get-write-15", sentence: "We got _____ of the car outside the hotel.", answer: "out", acceptedAnswers: ["out"] },
  { id: "preint-get-write-16", sentence: "We got _____ the bus outside the station.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-get-write-17", sentence: "We got _____ the bus at the town centre.", answer: "off", acceptedAnswers: ["off"] },
  { id: "preint-get-write-18", sentence: "I get _____ very well with the people I work with.", answer: "on", acceptedAnswers: ["on"] },
  { id: "preint-get-write-19", sentence: "I usually get _____ at seven.", answer: "up", acceptedAnswers: ["up"] },
  { id: "preint-get-write-20", sentence: "I didn't get _____ until nearly midnight.", answer: "home", acceptedAnswers: ["home"] },
  { id: "preint-get-write-21", sentence: "We need to get _____ school before nine.", answer: "to", acceptedAnswers: ["to"] },
  { id: "preint-get-write-22", sentence: "What time do you get _____ work?", answer: "to", acceptedAnswers: ["to"] },
  { id: "preint-get-write-23", sentence: "I got an _____ from my boss this morning.", answer: "email", acceptedAnswers: ["email"] },
  { id: "preint-get-write-24", sentence: "She got a lovely _____ for her birthday.", answer: "present", acceptedAnswers: ["present"] },
  { id: "preint-get-write-25", sentence: "He won the competition and got a ____.", answer: "prize", acceptedAnswers: ["prize"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-get",
  level: "a2-b1",
  order: 10,
  title: "get",
  shortDescription: "Practise common meanings and phrases with get, including changes, transport, arrival, obtaining things and receiving things.",
  textbookRef: "Pre-intermediate Vocabulary Bank 10",
  accent: "#c5a2ec",
  itemCount: 25,
  entries: preintGetEntries,
  getEntries: preintGetEntries,
  getMeaningSortEntries: preintGetMeaningSortEntries,
  getContextEntries: preintGetContextEntries,
  getPrepositionEntries: preintGetPrepositionEntries,
  getWriteEntries: preintGetWriteEntries,
  infoNotes: [
    { title: "get = become", body: ["get angry · get fit · get nervous · get ready", "get better · get worse · get colder", "Also: get married · get divorced · get lost"] },
    { title: "Cars and buses", body: ["With a car: get into a car · get out of a car", "With a bus: get on a bus · get off a bus"] },
    { title: "get home", body: ["Say get home, not get to home.", "But use to with many other places: get to school · get to work."] },
    { title: "get on with somebody", body: ["This means have a good relationship with them.", "I get on well with my sister."] },
    { title: "get = receive", body: ["get an email / a text message", "get a present · get a prize", "Get is very common in everyday English."] },
    { title: "One small verb, many meanings", body: ["get angry = become angry", "get a ticket = buy / obtain a ticket", "get home = arrive home", "get a present = receive a present", "Learn the complete phrase, not only get."] },
  ],
  activities: [
    { id: "get-flashcards", type: "flashcards", dataKey: "getEntries", title: "get phrase flashcards", shortDescription: "Recall common phrases with get and notice what get means.", prompt: "Look at the cue and say the complete phrase before you flip." },
    { id: "get-meaning-sort", type: "category-sort", dataKey: "getMeaningSortEntries", title: "What does get mean?", shortDescription: "Sort common get phrases by meaning and pattern.", prompt: "What does GET mean in this phrase?", promptKey: "phrase", categoryKey: "meaningGroup", itemLimit: 15, categories: [
      { id: "become", label: "BECOME" },
      { id: "obtain", label: "BUY / OBTAIN" },
      { id: "phrasal", label: "GET + PREPOSITION" },
      { id: "arrive", label: "ARRIVE" },
      { id: "receive", label: "RECEIVE" },
    ] },
    { id: "complete-get-phrase", type: "sentence-gap-choice", dataKey: "getContextEntries", title: "Complete the get phrase", shortDescription: "Choose the word or phrase that completes each common expression with get.", prompt: "Choose the correct ending.", question: "Complete the phrase.", itemLimit: 12 },
    { id: "get-transport-arrival", type: "sentence-gap-choice", dataKey: "getPrepositionEntries", title: "Cars, buses and places", shortDescription: "Practise get into, out of, on, off, home and to.", prompt: "Choose the correct word or phrase.", question: "What completes the sentence?", itemLimit: 12 },
    { id: "get-write", type: "sentence-gap-type-answer", dataKey: "getWriteEntries", title: "Write the get phrase", shortDescription: "Complete common expressions with get from memory.", prompt: "Type the missing word or phrase.", answerLabel: "Missing words", answerPlaceholder: "Type the answer", itemLimit: 12 },
  ],
});

function preintConfusingPair(id, leftVerb, rightVerb, leftExamples, rightExamples, contrastNote = "") {
  return {
    id: `preint-confusing-${id}`,
    term: `${leftVerb} / ${rightVerb}`,
    leftVerb,
    rightVerb,
    leftExamples,
    rightExamples,
    contrastNote,
    flashcardPrompt: `${leftVerb.toUpperCase()} or ${rightVerb.toUpperCase()}?`,
    flashcardAnswer: `${leftVerb.toUpperCase()} / ${rightVerb.toUpperCase()}`,
    flashcardNote: `${leftVerb}: ${leftExamples.join(", ")} · ${rightVerb}: ${rightExamples.join(", ")}`,
    image: null,
  };
}

const preintConfusingVerbPairs = [
  preintConfusingPair("wear-carry", "wear", "carry", ["clothes", "jewellery"], ["a bag", "a baby"]),
  preintConfusingPair("win-earn", "win", "earn", ["a match", "a medal", "a prize"], ["a salary", "money"]),
  preintConfusingPair("know-meet", "know", "meet", ["somebody well", "something"], ["somebody for the first time", "somebody at eleven o'clock"]),
  preintConfusingPair("hope-wait", "hope", "wait", ["that something good will happen", "to do something"], ["for a bus", "for a long time"]),
  preintConfusingPair("watch-look-at", "watch", "look at", ["TV", "a match"], ["a photo", "a view"]),
  preintConfusingPair("look-look-like", "look", "look like", ["happy", "about 25 years old"], ["your mother", "a model"]),
  preintConfusingPair("miss-lose", "miss", "lose", ["the bus", "a class"], ["a match", "your glasses"]),
  preintConfusingPair("bring-take", "bring", "take", ["your dictionary to class", "something back from holiday"], ["an umbrella with you", "your children to school"], "Bring moves towards the reference point; take moves away from it."),
  preintConfusingPair("look-for-find", "look for", "find", ["your glasses", "a job"], ["your glasses", "a job"], "Look for is the search; find is the successful result."),
  preintConfusingPair("say-tell", "say", "tell", ["sorry", "hello", "something to somebody"], ["a joke", "a lie", "somebody something"]),
  preintConfusingPair("lend-borrow", "lend", "borrow", ["money to somebody"], ["money from somebody"]),
  preintConfusingPair("hear-listen-to", "hear", "listen to", ["a noise", "the doorbell"], ["music", "the radio"], "Hear is perception; listen to is deliberate attention."),
];

const preintConfusingVerbContextEntries = [
  { id: "preint-confusing-context-01", sentence: "She's _____ a black dress and silver earrings.", answer: "wearing", options: ["wearing", "carrying", "taking", "bringing"] },
  { id: "preint-confusing-context-02", sentence: "He was _____ a heavy bag on his back.", answer: "carrying", options: ["carrying", "wearing", "bringing", "taking"] },
  { id: "preint-confusing-context-03", sentence: "Our team _____ the match 3–1.", answer: "won", options: ["won", "earned", "lost", "passed"] },
  { id: "preint-confusing-context-04", sentence: "She _____ a good salary in her new job.", answer: "earns", options: ["earns", "wins", "gets", "borrows"] },
  { id: "preint-confusing-context-05", sentence: "He _____ first prize in the competition.", answer: "won", options: ["won", "earned", "found", "earned from"] },
  { id: "preint-confusing-context-06", sentence: "I've _____ Marta for nearly ten years.", answer: "known", options: ["known", "met", "found", "seen"] },
  { id: "preint-confusing-context-07", sentence: "I _____ my new boss for the first time yesterday.", answer: "met", options: ["met", "knew", "watched", "found"] },
  { id: "preint-confusing-context-08", sentence: "Let's _____ outside the station at eleven.", answer: "meet", options: ["meet", "know", "wait", "find"] },
  { id: "preint-confusing-context-09", sentence: "I _____ you have a great holiday.", answer: "hope", options: ["hope", "wait", "expect", "look"] },
  { id: "preint-confusing-context-10", sentence: "We had to _____ for the bus for nearly half an hour.", answer: "wait", options: ["wait", "hope", "meet", "look"] },
  { id: "preint-confusing-context-11", sentence: "I'm _____ to visit Japan next year.", answer: "hoping", options: ["hoping", "waiting", "looking", "meeting"] },
  { id: "preint-confusing-context-12", sentence: "We _____ the football match on TV.", answer: "watched", options: ["watched", "looked at", "saw at", "listened to"] },
  { id: "preint-confusing-context-13", sentence: "Come and _____ this photo.", answer: "look at", options: ["look at", "watch", "listen to", "look like"] },
  { id: "preint-confusing-context-14", sentence: "We sat on the hill and _____ the view.", answer: "looked at", options: ["looked at", "watched", "heard", "looked like"] },
  { id: "preint-confusing-context-15", sentence: "You _____ tired. Did you sleep badly?", answer: "look", options: ["look", "look like", "watch", "see"] },
  { id: "preint-confusing-context-16", sentence: "She really _____ her mother.", answer: "looks like", options: ["looks like", "looks", "watches", "knows"] },
  { id: "preint-confusing-context-17", sentence: "He _____ about 30, but he's actually 42.", answer: "looks", options: ["looks", "looks like", "watches", "sees"] },
  { id: "preint-confusing-context-18", sentence: "Hurry up or we'll _____ the bus.", answer: "miss", options: ["miss", "lose", "leave", "fail"] },
  { id: "preint-confusing-context-19", sentence: "I've _____ my glasses. Have you seen them?", answer: "lost", options: ["lost", "missed", "looked", "forgotten"] },
  { id: "preint-confusing-context-20", sentence: "Real Madrid _____ the match 2–0.", answer: "lost", options: ["lost", "missed", "failed", "earned"] },
  { id: "preint-confusing-context-21", sentence: "Please _____ your dictionary to class tomorrow.", answer: "bring", options: ["bring", "take", "carry", "wear"] },
  { id: "preint-confusing-context-22", sentence: "It's going to rain. _____ an umbrella with you.", answer: "Take", options: ["Take", "Bring", "Carry to", "Wear"] },
  { id: "preint-confusing-context-23", sentence: "Can you _____ me back something from Italy?", answer: "bring", options: ["bring", "take", "lend", "borrow"] },
  { id: "preint-confusing-context-24", sentence: "I can't _____ my keys anywhere.", answer: "find", options: ["find", "look for", "meet", "know"] },
  { id: "preint-confusing-context-25", sentence: "What are you doing? — I'm _____ my keys.", answer: "looking for", options: ["looking for", "finding", "knowing", "meeting"] },
  { id: "preint-confusing-context-26", sentence: "Don't forget to _____ hello to your grandmother.", answer: "say", options: ["say", "tell", "speak", "talk"] },
  { id: "preint-confusing-context-27", sentence: "He _____ me a really funny joke.", answer: "told", options: ["told", "said", "spoke", "talked"] },
  { id: "preint-confusing-context-28", sentence: "What did she _____ to you?", answer: "say", options: ["say", "tell", "speak", "talk"] },
  { id: "preint-confusing-context-29", sentence: "Could you _____ me €10 until tomorrow?", answer: "lend", options: ["lend", "borrow", "earn", "win"] },
  { id: "preint-confusing-context-30", sentence: "Can I _____ your pen?", answer: "borrow", options: ["borrow", "lend", "carry", "bring"] },
];

const preintConfusingVerbCollocationEntries = [
  ["wear", "She likes to _____ silver jewellery."], ["carry", "He had to _____ a heavy bag."],
  ["win", "Which team will _____ the match?"], ["earn", "She wants to _____ a good salary."],
  ["know", "I _____ her very well."], ["meet", "Let's _____ at eleven o'clock."],
  ["hope", "We _____ to see you soon."], ["wait", "We had to _____ for a bus."],
  ["watch", "Do you want to _____ TV?"], ["look at", "Come and _____ this photo."],
  ["look", "You _____ happy today."], ["look like", "You really _____ your mother."],
  ["miss", "Hurry or we'll _____ the bus."], ["lose", "Don't _____ your glasses."],
  ["bring", "Please _____ your dictionary to class."], ["take", "_____ an umbrella with you."],
  ["look for", "I'm trying to _____ a job."], ["find", "I hope I can _____ a job soon."],
  ["say", "Don't forget to _____ sorry."], ["tell", "Can you _____ us a joke?"],
  ["lend", "Could you _____ some money to me?"], ["borrow", "Can I _____ some money from you?"],
  ["hear", "Did you _____ the doorbell?"], ["listen to", "I like to _____ music."],
].map(([answer, sentence], index) => ({
  id: `preint-confusing-collocation-${String(index + 1).padStart(2, "0")}`,
  sentence,
  answer,
  options: preintConfusingVerbPairs.find((pair) => [pair.leftVerb, pair.rightVerb].includes(answer))
    ? [
        preintConfusingVerbPairs.find((pair) => [pair.leftVerb, pair.rightVerb].includes(answer)).leftVerb,
        preintConfusingVerbPairs.find((pair) => [pair.leftVerb, pair.rightVerb].includes(answer)).rightVerb,
      ]
    : [answer],
}));

const preintConfusingVerbContrastEntries = [
  ["The jacket is on her body.", "wear", ["wear", "carry"]], ["The suitcase is in his hand.", "carry", ["carry", "wear"]],
  ["She received a medal because she came first.", "win", ["win", "earn"]], ["He gets €2,000 a month for his work.", "earn", ["earn", "win"]],
  ["You have been friends with somebody for years.", "know", ["know", "meet"]], ["You see somebody for the first time.", "meet", ["meet", "know"]],
  ["You want something positive to happen.", "hope", ["hope", "wait"]], ["You stay somewhere until the bus arrives.", "wait", ["wait", "hope"]],
  ["You follow a football match for 90 minutes.", "watch", ["watch", "look at"]], ["You direct your eyes towards one photograph.", "look at", ["look at", "watch"]],
  ["Her appearance suggests that she's tired.", "look", ["look", "look like"]], ["Her face is very similar to her mother's.", "look like", ["look like", "look"]],
  ["You arrive at the station after the train has left.", "miss", ["miss", "lose"]], ["You don't know where your phone is.", "lose", ["lose", "miss"]],
  ["Movement is towards the place where the speaker is.", "bring", ["bring", "take"]], ["Movement is away from the place where the speaker is.", "take", ["take", "bring"]],
  ["You are searching for your keys.", "look for", ["look for", "find"]], ["The search is successful and now you have the keys.", "find", ["find", "look for"]],
  ["The object comes first: _____ something to somebody.", "say", ["say", "tell"]], ["The person comes first: _____ somebody something.", "tell", ["tell", "say"]],
  ["You temporarily give somebody your book.", "lend", ["lend", "borrow"]], ["You temporarily take somebody else's book to use.", "borrow", ["borrow", "lend"]],
  ["A sound reaches your ears without you trying.", "hear", ["hear", "listen to"]], ["You deliberately pay attention to music.", "listen to", ["listen to", "hear"]],
].map(([sentence, answer, options], index) => ({ id: `preint-confusing-contrast-${String(index + 1).padStart(2, "0")}`, sentence, answer, options }));

const preintConfusingVerbWriteEntries = [
  ["She always _____ beautiful jewellery. (wear / carry)", "wears"], ["Can you _____ this bag for me? (wear / carry)", "carry"],
  ["He _____ a medal at the Olympics. (win / earn)", "won"], ["How much does she _____ a year? (win / earn)", "earn"],
  ["I've _____ him since university. (know / meet)", "known"], ["Where did you _____ your wife for the first time? (know / meet)", "meet"],
  ["I _____ everything goes well tomorrow. (hope / wait)", "hope"], ["We had to _____ for two hours. (hope / wait)", "wait"],
  ["We _____ TV after dinner. (watch / look at)", "watch"], ["_____ that amazing view! (watch / look at)", "look at"],
  ["You _____ really happy today. (look / look like)", "look"], ["She _____ her older sister. (look / look like)", "looks like"],
  ["I _____ the bus, so I was late. (miss / lose)", "missed"], ["I've _____ my glasses again. (miss / lose)", "lost"],
  ["Please _____ your books to class tomorrow. (bring / take)", "bring"], ["Don't forget to _____ your umbrella when you leave. (bring / take)", "take"],
  ["I'm _____ a new job at the moment. (look for / find)", "looking for"], ["I finally _____ my keys under the sofa. (look for / find)", "found"],
  ["She _____ hello to me when she arrived. (say / tell)", "said"], ["He _____ us a funny story. (say / tell)", "told"],
  ["Could you _____ me some money? (lend / borrow)", "lend"], ["I need to _____ some money from my brother. (lend / borrow)", "borrow"],
  ["Did you _____ the doorbell? (hear / listen to)", "hear"], ["I usually _____ music while I'm working. (hear / listen to)", "listen to"],
].map(([sentence, answer], index) => ({ id: `preint-confusing-write-${String(index + 1).padStart(2, "0")}`, sentence, answer, acceptedAnswers: [answer] }));

HUB_VOCAB_THEMES.push({
  id: "a2-b1-confusing-verbs",
  level: "a2-b1",
  order: 11,
  title: "Confusing verbs",
  shortDescription: "Practise commonly confused verbs through collocations, contrasts and everyday contexts.",
  textbookRef: "Pre-intermediate Vocabulary Bank 11",
  accent: "#72c8b5",
  itemCount: 12,
  entries: preintConfusingVerbPairs,
  confusingVerbPairs: preintConfusingVerbPairs,
  confusingVerbCollocationEntries: preintConfusingVerbCollocationEntries,
  confusingVerbContextEntries: preintConfusingVerbContextEntries,
  confusingVerbContrastEntries: preintConfusingVerbContrastEntries,
  confusingVerbWriteEntries: preintConfusingVerbWriteEntries,
  infoNotes: [
    { title: "bring or take?", body: ["Bring means movement towards here or the relevant destination.", "Take means movement away from here."] },
    { title: "look for or find?", body: ["Look for describes the search.", "Find describes the successful result."] },
    { title: "say or tell?", body: ["say something TO somebody", "tell SOMEBODY something", "say hello / sorry · tell a joke / lie"] },
    { title: "lend or borrow?", body: ["lend something TO somebody", "borrow something FROM somebody"] },
    { title: "hear or listen?", body: ["Hear means a sound reaches your ears.", "Listen to means deliberately pay attention to a sound."] },
    { title: "hope or expect?", body: ["Hope means want something to happen.", "Expect means think something will happen, usually for a reason.", "Expect is a reference extension, not a thirteenth pair."] },
  ],
  activities: [
    { id: "confusing-verb-flashcards", type: "flashcards", dataKey: "confusingVerbPairs", title: "Confusing verb flashcards", shortDescription: "Learn the difference between commonly confused verbs.", prompt: "Look at the two verbs. Think of how each one is used, then flip to check." },
    { id: "confusing-verbs-choice", type: "sentence-gap-choice", dataKey: "confusingVerbContextEntries", title: "Which verb?", shortDescription: "Choose the correct verb from a commonly confused pair.", prompt: "Read the sentence and choose the correct verb.", question: "Which verb fits?", itemLimit: 12 },
    { id: "confusing-verb-collocations", type: "sentence-gap-choice", dataKey: "confusingVerbCollocationEntries", title: "Complete the collocation", shortDescription: "Choose the verb that completes each source collocation.", prompt: "Complete the collocation with the correct verb.", question: "Which verb fits?", itemLimit: 10 },
    { id: "confusing-verbs-contrast", type: "sentence-gap-choice", dataKey: "confusingVerbContrastEntries", title: "What's the difference?", shortDescription: "Use the context to distinguish verbs that learners often confuse.", prompt: "Choose the verb that matches the meaning.", question: "Which verb is correct?", itemLimit: 12 },
    { id: "confusing-verbs-write", type: "sentence-gap-type-answer", dataKey: "confusingVerbWriteEntries", title: "Write the correct verb", shortDescription: "Complete everyday sentences with the correct confusing verb.", prompt: "Type the missing verb in the correct form.", answerLabel: "Verb", answerPlaceholder: "Type the verb", itemLimit: 12 },
  ],
});

const PREINT_ANIMALS_IMAGE_BASE = "/images/vocab/pre-int/animals";

const preintAnimalGroups = {
  insects: ["bee", "butterfly", "fly", "mosquito", "spider", "wasp"],
  farm: ["bull", "chicken", "cow", "goat", "horse", "pig", "sheep"],
  wild: ["bat", "bear", "bird", "camel", "crocodile", "deer", "elephant", "giraffe", "kangaroo", "lion", "monkey", "mouse", "rabbit", "rat", "snake", "tiger"],
  sea: ["dolphin", "jellyfish", "shark", "whale"],
};

const preintAnimalSymbols = {
  bee: "🐝", butterfly: "🦋", fly: "🪰", mosquito: "🦟", spider: "🕷️", wasp: "🐝⚠️",
  bull: "🐂", chicken: "🐔", cow: "🐄", goat: "🐐", horse: "🐎", pig: "🐖", sheep: "🐑",
  bat: "🦇", bear: "🐻", bird: "🐦", camel: "🐪", crocodile: "🐊", deer: "🦌", elephant: "🐘", giraffe: "🦒",
  kangaroo: "🦘", lion: "🦁", monkey: "🐒", mouse: "🐁", rabbit: "🐇", rat: "🐀", snake: "🐍", tiger: "🐅",
  dolphin: "🐬", jellyfish: "🪼", shark: "🦈", whale: "🐋",
};

const preintAnimalEntries = Object.entries(preintAnimalGroups).flatMap(([category, terms]) =>
  terms.map((term, index) => ({
    id: `preint-animal-${term}`,
    term,
    category,
    image: null,
    imagePath: `${PREINT_ANIMALS_IMAGE_BASE}/${term}.png`,
    visualLabel: preintAnimalSymbols[term],
    acceptedAnswers: [term],
    options: [1, 2, 3].map((offset) => terms[(index + offset) % terms.length]),
    flashcardAnswer: term,
    flashcardNote: term === "deer" ? "plural: deer" : term === "mouse" ? "plural: mice" : undefined,
  }))
);

const preintBiteStingEntries = [
  { id: "preint-bite-sting-01", sentence: "A bee can _____ you.", answer: "sting", options: ["sting", "bite"] },
  { id: "preint-bite-sting-02", sentence: "A wasp can _____ you.", answer: "sting", options: ["sting", "bite"] },
  { id: "preint-bite-sting-03", sentence: "A jellyfish can _____ you.", answer: "sting", options: ["sting", "bite"] },
  { id: "preint-bite-sting-04", sentence: "A mosquito can _____ you.", answer: "bite", options: ["bite", "sting"] },
  { id: "preint-bite-sting-05", sentence: "A spider can _____ you.", answer: "bite", options: ["bite", "sting"] },
  { id: "preint-bite-sting-06", sentence: "A snake can _____ you.", answer: "bite", options: ["bite", "sting"] },
  { id: "preint-bite-sting-07", sentence: "Which verb means 'inject venom into your skin' in the source note?", answer: "sting", options: ["sting", "bite"] },
  { id: "preint-bite-sting-08", sentence: "Which verb does the source use for mosquitoes, spiders and snakes?", answer: "bite", options: ["bite", "sting"] },
];

HUB_VOCAB_THEMES.push({
  id: "a2-b1-animals",
  level: "a2-b1",
  order: 12,
  title: "Animals",
  shortDescription: "Practise insects, farm animals, wild animals and sea animals, plus bite and sting.",
  textbookRef: "Pre-intermediate Vocabulary Bank 12",
  accent: "#81cf86",
  itemCount: 33,
  entries: preintAnimalEntries,
  animalEntries: preintAnimalEntries,
  animalCategoryEntries: preintAnimalEntries,
  biteStingEntries: preintBiteStingEntries,
  infoNotes: [
    { title: "Animal groups", body: ["Insects: bee · butterfly · fly · mosquito · spider · wasp", "Farm animals: bull · chicken · cow · goat · horse · pig · sheep", "Wild animals: bat · bear · bird · camel · crocodile · deer · elephant · giraffe · kangaroo · lion · monkey · mouse · rabbit · rat · snake · tiger", "Sea animals: dolphin · jellyfish · shark · whale"] },
    { title: "deer and mouse", body: ["one deer → two deer (not deers)", "one mouse → two mice"] },
    { title: "bite or sting?", body: ["Sting means inject venom into your skin: bees, wasps and jellyfish.", "The source uses bite for mosquitoes, spiders, snakes and animals with teeth."] },
  ],
  activities: [
    { id: "animal-flashcards", type: "flashcards", dataKey: "animalEntries", title: "Animal flashcards", shortDescription: "Look at each animal and recall its name.", prompt: "Look at the picture and say the animal before you flip." },
    { id: "animal-picture-choice", type: "quick-choice", dataKey: "animalEntries", title: "Choose the animal", shortDescription: "Recognise animals quickly from their pictures.", prompt: "Look at the picture and choose the correct animal.", itemLimit: 15 },
    { id: "animal-category-sort", type: "category-sort", dataKey: "animalCategoryEntries", title: "Which animal group?", shortDescription: "Sort the animals into the four groups from the vocabulary bank.", prompt: "Which group does this animal belong to?", promptKey: "term", categoryKey: "category", itemLimit: 16, categories: [
      { id: "insects", label: "Insects" },
      { id: "farm", label: "Farm animals" },
      { id: "wild", label: "Wild animals" },
      { id: "sea", label: "Sea animals" },
    ] },
    { id: "bite-or-sting", type: "sentence-gap-choice", dataKey: "biteStingEntries", title: "Bite or sting?", shortDescription: "Practise the bite / sting distinction from the vocabulary bank.", prompt: "Choose bite or sting.", question: "Which verb is correct?" },
    { id: "animal-spelling", type: "type-answer", dataKey: "animalEntries", title: "Name the animal", shortDescription: "Look at the picture and type the animal word.", prompt: "Look at the picture and type the animal.", answerLabel: "Animal", answerPlaceholder: "Type the animal", itemLimit: 15 },
  ],
});

const PREINT_MOVEMENT_IMAGE_BASE = "/images/vocab/pre-int/expressing-movement";

function preintMovementEntry(id, term, sourcePhrase, imagePrompt, options, acceptedAnswers = [term], displayTerm = term) {
  return {
    id: `preint-movement-${id}`,
    term,
    displayTerm,
    choiceAnswer: displayTerm,
    sourcePhrase,
    imagePrompt,
    options,
    acceptedAnswers,
    image: `${PREINT_MOVEMENT_IMAGE_BASE}/${id}.png`,
    flashcardAnswer: displayTerm,
    flashcardNote: sourcePhrase,
  };
}

const preintMovementEntries = [
  preintMovementEntry("under", "under", "under the bridge", "She crawls _____ the low wooden obstacle.", ["over", "through", "past"]),
  preintMovementEntry("along", "along", "along the street", "He runs _____ the narrow balance beam.", ["across", "through", "towards"]),
  preintMovementEntry("round", "round", "round the lake", "She runs _____ the stack of tyres.", ["past", "towards", "across"], ["round", "around"], "round / around"),
  preintMovementEntry("through", "through", "through the tunnel", "He crawls _____ the large pipe.", ["across", "under", "along"]),
  preintMovementEntry("into", "into", "into the shop", "He steps _____ the covered container.", ["out of", "through", "towards"]),
  preintMovementEntry("across", "across", "across the road", "She steps _____ the muddy trench from one side to the other.", ["along", "through", "towards"]),
  preintMovementEntry("over", "over", "over the bridge", "He climbs _____ the wooden wall.", ["under", "through", "towards"]),
  preintMovementEntry("up", "up", "up the steps", "She climbs _____ the steep cargo net.", ["down", "past", "along"]),
  preintMovementEntry("past", "past", "past the church", "He runs _____ the tyre wall and continues.", ["towards", "into", "through"]),
  preintMovementEntry("towards", "towards", "towards the lake", "She runs _____ the obstacle ahead.", ["round / around", "past", "across"], ["towards", "toward"]),
  preintMovementEntry("down", "down", "down the steps", "He makes his way _____ the steep wooden ramp.", ["up", "past", "under"]),
  preintMovementEntry("out-of", "out of", "out of the shop", "She comes _____ the covered tunnel.", ["into", "through", "towards"]),
];

const preintMovementContrastEntries = [
  ["The road goes beneath the bridge.", "under", ["under", "over"]],
  ["We crossed the river using the bridge.", "over", ["over", "under"]],
  ["She opened the shop door and went ____.", "into", ["into", "out of"]],
  ["She finished shopping and came _____ the shop.", "out of", ["out of", "into"]],
  ["They climbed from the bottom of the steps to the top.", "up", ["up", "down"]],
  ["They went from the top of the steps to the bottom.", "down", ["down", "up"]],
  ["We walked from one side of the road to the other.", "across", ["across", "through"]],
  ["The train went from one end of the tunnel to the other.", "through", ["through", "across"]],
  ["She swam from one side of the river to the other.", "across", ["across", "through"]],
  ["We walked _____ the forest until we reached the road on the other side.", "through", ["through", "across"]],
  ["She walked by the church and continued without stopping.", "past", ["past", "towards"]],
  ["She was walking in the direction of the lake.", "towards", ["towards", "past"]],
  ["We walked on the street in the same direction as the street.", "along", ["along", "across"]],
  ["We went from one side of the street to the other.", "across", ["across", "along"]],
  ["They followed a path all the way around the lake.", "round", ["round", "towards"], ["round", "around"]],
  ["They were heading in the direction of the lake but hadn't reached it yet.", "towards", ["towards", "round"], ["towards", "toward"]],
  ["He saw the police officer and ran _____ from him.", "away", ["away", "back"]],
  ["We finished dinner and went _____ to our hotel.", "back", ["back", "away"]],
].map(([sentence, answer, options, acceptedAnswers = [answer]], index) => ({
  id: `preint-movement-contrast-${String(index + 1).padStart(2, "0")}`,
  sentence,
  answer,
  options,
  acceptedAnswers,
}));

const preintMovementContextEntries = [
  ["We walked _____ the bridge because the road passed beneath it.", "under", ["under", "over", "along", "past"]],
  ["We walked _____ the street until we reached the station.", "along", ["along", "across", "through", "into"]],
  ["We walked _____ the lake and returned to where we started.", "round", ["round", "towards", "across", "through"], ["round", "around"]],
  ["The road goes _____ a long tunnel under the mountain.", "through", ["through", "across", "over", "past"]],
  ["She opened the door and went _____ the shop.", "into", ["into", "out of", "past", "under"]],
  ["Look both ways before you walk _____ the road.", "across", ["across", "along", "through", "towards"]],
  ["We walked _____ the bridge to reach the other side of the river.", "over", ["over", "under", "through", "towards"]],
  ["She ran _____ the steps to the first floor.", "up", ["up", "down", "along", "past"]],
  ["We walked _____ the church on our way to the station.", "past", ["past", "towards", "into", "through"]],
  ["They walked _____ the lake in the distance.", "towards", ["towards", "round", "past", "across"], ["towards", "toward"]],
  ["He walked _____ the steps and into the street.", "down", ["down", "up", "over", "under"]],
  ["She paid for the clothes and walked _____ the shop.", "out of", ["out of", "into", "through", "towards"]],
  ["The children ran _____ the playground from one side to the other.", "across", ["across", "through", "along", "past"]],
  ["We walked _____ a crowd of people to reach the door.", "through", ["through", "across", "over", "round"]],
  ["Walk _____ this road for about 500 metres.", "along", ["along", "across", "into", "under"]],
  ["She ran _____ me without saying hello.", "past", ["past", "towards", "round", "through"]],
  ["The dog ran _____ its owner when she called it.", "towards", ["towards", "past", "out of", "along"], ["towards", "toward"]],
  ["The cyclist rode _____ the bridge rather than taking the road underneath it.", "over", ["over", "under", "through", "into"]],
  ["The dog ran _____ the table and hid beneath it.", "under", ["under", "over", "along", "across"]],
  ["Everyone went _____ the building when it started raining.", "into", ["into", "out of", "past", "across"]],
  ["The students came _____ the classroom when the lesson finished.", "out of", ["out of", "into", "through", "towards"]],
  ["We walked _____ the park on our way to the other side.", "through", ["through", "across", "along", "over"]],
  ["We went _____ the path that circles the lake.", "round", ["round", "across", "towards", "into"], ["round", "around"]],
  ["The cat ran _____ the stairs when it heard a noise downstairs.", "down", ["down", "up", "over", "past"]],
].map(([sentence, answer, options, acceptedAnswers = [answer]], index) => ({
  id: `preint-movement-context-${String(index + 1).padStart(2, "0")}`,
  sentence,
  answer,
  options,
  acceptedAnswers,
}));

HUB_VOCAB_THEMES.push({
  id: "a2-b1-expressing-movement",
  level: "a2-b1",
  order: 13,
  title: "Expressing movement",
  shortDescription: "Practise movement through places with expressions such as across, through, into, past and towards.",
  textbookRef: "Pre-intermediate Vocabulary Bank 13",
  accent: "#76b8e8",
  itemCount: 12,
  entries: preintMovementEntries,
  movementEntries: preintMovementEntries,
  movementContrastEntries: preintMovementContrastEntries,
  movementContextEntries: preintMovementContextEntries,
  infoNotes: [
    { title: "across or through?", body: ["Use across for movement from one side to another of something with sides: across a square, street or river.", "Use through when you move from one side to the other while inside something: through a forest, tunnel or crowd."] },
    { title: "into or out of?", body: ["Into means movement from outside to inside.", "Out of means movement from inside to outside."] },
    { title: "up or down?", body: ["Up means movement towards a higher position.", "Down means movement towards a lower position."] },
    { title: "past or towards?", body: ["Past means go by something and continue.", "Towards means move in the direction of something."] },
    { title: "round or around?", body: ["Both are accepted in this bank.", "British English commonly uses walk round the lake; around is also correct."] },
    { title: "away and back", body: ["Away means movement to another place.", "Back means movement to the place where somebody or something was before.", "These are source extensions, not part of the 12-item visual set."] },
  ],
  activities: [
    { id: "movement-flashcards", type: "flashcards", dataKey: "movementEntries", title: "Movement flashcards", shortDescription: "Recall the movement word shown in each obstacle-course picture.", prompt: "Look at the picture and say the movement word before you flip." },
    { id: "movement-picture-choice", type: "quick-choice", dataKey: "movementEntries", title: "Choose the movement", shortDescription: "Choose the movement word shown in each obstacle-course picture.", prompt: "Look at the picture and choose the movement word.", itemLimit: 12 },
    { id: "movement-contrasts", type: "sentence-gap-choice", dataKey: "movementContrastEntries", title: "Which way?", shortDescription: "Choose between movement expressions that learners often confuse.", prompt: "Choose the movement word or expression that matches the situation.", question: "Which answer is correct?", itemLimit: 12 },
    { id: "movement-context", type: "sentence-gap-choice", dataKey: "movementContextEntries", title: "Movement in context", shortDescription: "Choose the movement expression that completes each everyday situation.", prompt: "Read the sentence and choose the correct movement expression.", itemLimit: 12 },
    { id: "movement-write", type: "type-answer", dataKey: "movementEntries", title: "Write the movement word", shortDescription: "Look at each picture and type the movement word it shows.", prompt: "Which movement word does the picture show?", answerLabel: "Movement word", answerPlaceholder: "Type the movement word", itemLimit: 12 },
  ],
});

const PREINT_PHRASAL_VERBS_IMAGE_BASE = "/images/vocab/pre-int/phrasal-verbs";
const preintPhrasalVerbImageIds = new Set([
  "fill-in",
  "go-off",
  "put-on",
  "set-off",
  "take-off",
  "throw-away",
  "turn-down",
  "turn-up",
]);

function preintPhrasalVerbEntry(id, term, meaning, model, cueText, type = null) {
  return {
    id: `preint-pv-${id}`,
    term,
    meaning,
    model,
    type,
    cueText,
    acceptedAnswers: [term],
    image: preintPhrasalVerbImageIds.has(id)
      ? `${PREINT_PHRASAL_VERBS_IMAGE_BASE}/${id}.png`
      : null,
    flashcardPrompt: cueText,
    flashcardAnswer: term,
    flashcardNote: `${meaning} · ${model}`,
  };
}

const preintPhrasalVerbEntries = [
  preintPhrasalVerbEntry("be-over", "be over", "be finished", "The match will be over at about 5.30.", "A football match reaches its end.", "type1"),
  preintPhrasalVerbEntry("go-off", "go off", "ring or make a sound", "My alarm goes off at six o'clock.", "An alarm begins ringing.", "type1"),
  preintPhrasalVerbEntry("set-off", "set off", "start a journey", "We set off for the airport at 6.30.", "Travellers begin their journey to the airport.", "type1"),
  preintPhrasalVerbEntry("give-up", "give up", "stop doing or having something", "I want to give up chocolate.", "Someone decides to stop eating chocolate.", "type2"),
  preintPhrasalVerbEntry("throw-away", "throw away", "put something in the rubbish", "Don't throw away that letter!", "Someone puts an unwanted letter in the rubbish.", "type2"),
  preintPhrasalVerbEntry("turn-down", "turn down", "reduce the volume", "Turn down the music! It's very loud.", "The music is too loud and needs a lower volume.", "type2"),
  preintPhrasalVerbEntry("turn-up", "turn up", "increase the volume", "Turn up the TV! I can't hear.", "The television is too quiet and needs a higher volume.", "type2"),
  preintPhrasalVerbEntry("look-up", "look up", "search for specific information", "He looked up the words in a dictionary.", "Someone searches for a word in a dictionary.", "type2"),
  preintPhrasalVerbEntry("fill-in", "fill in", "complete a form in writing", "Could you fill in this form?", "Someone writes the required information on a form.", "type2"),
  preintPhrasalVerbEntry("find-out", "find out", "discover or obtain information", "I want to find out about hotels in Madrid.", "Someone discovers what time a museum closes."),
  preintPhrasalVerbEntry("put-on", "put on", "put clothes onto your body", "Go and put on your pyjamas.", "Someone gets dressed in a coat before going outside.", "type2"),
  preintPhrasalVerbEntry("take-off", "take off", "remove clothes from your body", "Could you take off your boots, please?", "Someone removes their boots after coming inside.", "type2"),
  preintPhrasalVerbEntry("look-after", "look after", "take care of somebody", "My sister is looking after Jimmy today.", "Someone takes care of a child for the afternoon.", "type3"),
  preintPhrasalVerbEntry("look-forward-to", "look forward to", "feel pleased or excited about a future event", "I'm really looking forward to the holidays.", "Someone feels excited about next month's holiday.", "type3"),
];

const preintPhrasalVerbReviewGroups = {
  "Everyday / movement": ["check in", "come on", "get up", "go away", "go back", "go out", "sit down", "stand up", "wake up"],
  "Returning / moving things": ["call back", "drop off", "give back", "pay back", "pick up", "put away", "send back", "take back", "take out"],
  "Clothes / switches / writing": ["try on", "turn off", "turn on", "write down"],
  Other: ["go on", "get on / off", "get on with", "look for", "look round", "run out of"],
};

const preintPhrasalVerbReviewEntries = Object.entries(preintPhrasalVerbReviewGroups).flatMap(([group, terms]) =>
  terms.map((term) => ({ id: `preint-pv-review-${term.replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`, term, group, clue: group }))
);

const preintPhrasalVerbContextEntries = [
  { id: "preint-pv-context-01", sentence: "The film starts at three and will _____ at about five.", answer: "be over", options: ["be over", "set off", "go off", "find out"] },
  { id: "preint-pv-context-02", sentence: "My alarm _____ at 6.30 every morning.", answer: "goes off", options: ["goes off", "sets off", "turns up", "is over"] },
  { id: "preint-pv-context-03", sentence: "We need to _____ early if we want to reach the airport by seven.", answer: "set off", options: ["set off", "go off", "be over", "give up"] },
  { id: "preint-pv-context-04", sentence: "I'm trying to _____ sugar, but it's difficult.", answer: "give up", options: ["give up", "throw away", "take off", "turn down"] },
  { id: "preint-pv-context-05", sentence: "These papers aren't important. You can _____.", answer: "throw them away", options: ["throw them away", "look after them", "fill them in", "find them out"] },
  { id: "preint-pv-context-06", sentence: "The music is too loud. Can you _____?", answer: "turn it down", options: ["turn it down", "turn it up", "take it off", "put it on"] },
  { id: "preint-pv-context-07", sentence: "I can't hear the TV. Can you _____?", answer: "turn it up", options: ["turn it up", "turn it down", "switch it off", "look it up"] },
  { id: "preint-pv-context-08", sentence: "I didn't know the word, so I _____ in a dictionary.", answer: "looked it up", options: ["looked it up", "found it out", "looked after it", "gave it up"] },
  { id: "preint-pv-context-09", sentence: "Please _____ this form and give it to reception.", answer: "fill in", options: ["fill in", "find out", "look up", "throw away"] },
  { id: "preint-pv-context-10", sentence: "I need to _____ what time the museum closes.", answer: "find out", options: ["find out", "look after", "put on", "set off"] },
  { id: "preint-pv-context-11", sentence: "It's cold outside. _____ your coat.", answer: "Put on", options: ["Put on", "Take off", "Turn up", "Give up"] },
  { id: "preint-pv-context-12", sentence: "It's warm in here. You can _____ your jacket.", answer: "take off", options: ["take off", "put on", "turn down", "throw away"] },
  { id: "preint-pv-context-13", sentence: "Could you _____ my dog while I'm away?", answer: "look after", options: ["look after", "look up", "find out", "look forward to"] },
  { id: "preint-pv-context-14", sentence: "I'm really _____ seeing everyone again.", answer: "looking forward to", options: ["looking forward to", "looking after", "looking up", "finding out"] },
];

const preintPhrasalVerbContrastEntries = [
  ["The music is too loud.", "turn it down", ["turn it down", "turn it up"]],
  ["The TV is too quiet.", "turn it up", ["turn it up", "turn it down"]],
  ["You're going outside and it's cold.", "put on your coat", ["put on your coat", "take off your coat"]],
  ["You've come inside and you're too hot.", "take off your coat", ["take off your coat", "put on your coat"]],
  ["You don't know the meaning of a word, so you use a dictionary.", "look it up", ["look it up", "find it out"]],
  ["You want to discover what time a train leaves.", "find out", ["find out", "look after"]],
  ["You take care of your neighbour's child for the afternoon.", "look after", ["look after", "look forward to"]],
  ["You're excited about your holiday next month.", "look forward to", ["look forward to", "look after"]],
  ["An alarm starts ringing.", "go off", ["go off", "set off"]],
  ["You begin a journey.", "set off", ["set off", "go off"]],
  ["You decide to stop eating chocolate.", "give up", ["give up", "throw away"]],
  ["You put an old broken object in the rubbish.", "throw away", ["throw away", "give up"]],
  ["The match has finished.", "be over", ["be over", "go off"]],
  ["The alarm starts making a noise.", "go off", ["go off", "be over"]],
  ["You write your name and address on a form.", "fill in", ["fill in", "find out"]],
  ["You discover some information.", "find out", ["find out", "fill in"]],
].map(([sentence, answer, options], index) => ({ id: `preint-pv-contrast-${String(index + 1).padStart(2, "0")}`, sentence, answer, options }));

const preintPhrasalVerbTypeGroups = {
  type1: ["get up", "sit down", "stand up", "wake up", "go away", "go back", "go out", "set off"],
  type2: ["turn on", "turn off", "turn up", "turn down", "put on", "take off", "throw away", "look up", "write down", "pick up", "give back", "pay back", "send back", "take back", "put away", "take out", "try on"],
  type3: ["look for", "look after", "look forward to", "get on with", "run out of"],
};

const preintPhrasalVerbTypeEntries = Object.entries(preintPhrasalVerbTypeGroups).flatMap(([type, terms]) =>
  terms.map((term) => ({ id: `preint-pv-type-${type}-${term.replace(/[^a-z]+/g, "-")}`, term, type }))
);

const preintPhrasalVerbWriteEntries = [
  ["The concert will _____ at about eleven. (finish)", "be over"],
  ["My alarm _____ at seven every morning. (ring)", "goes off"],
  ["We _____ for the airport before sunrise. (start our journey)", "set off"],
  ["I really need to _____ chocolate. (stop having)", "give up"],
  ["Don't _____ that box. I still need it. (put in the rubbish)", "throw away"],
  ["The music is too loud. _____ it. (reduce the volume)", "turn down"],
  ["I can't hear the TV. _____ it. (increase the volume)", "turn up"],
  ["If you don't know the word, _____ it in a dictionary. (search for the information)", "look up"],
  ["Could you _____ this form, please? (complete)", "fill in"],
  ["I need to _____ when the next bus leaves. (discover)", "find out"],
  ["_____ your coat before you go outside. (dress yourself in)", "put on"],
  ["Please _____ your shoes before you come in. (remove)", "take off"],
  ["Can you _____ the children for half an hour? (take care of)", "look after"],
  ["I'm really _____ my holiday. (feel excited about)", "looking forward to"],
].map(([sentence, answer], index) => ({ id: `preint-pv-write-${String(index + 1).padStart(2, "0")}`, sentence, answer, acceptedAnswers: [answer] }));

HUB_VOCAB_THEMES.push({
  id: "a2-b1-phrasal-verbs",
  level: "a2-b1",
  order: 14,
  title: "Phrasal verbs",
  shortDescription: "Practise common phrasal verbs, their meanings, contrasts and basic separability patterns.",
  textbookRef: "Pre-intermediate Vocabulary Bank 14",
  accent: "#e79772",
  itemCount: 14,
  entries: preintPhrasalVerbEntries,
  phrasalVerbEntries: preintPhrasalVerbEntries,
  phrasalVerbReviewEntries: preintPhrasalVerbReviewEntries,
  phrasalVerbContextEntries: preintPhrasalVerbContextEntries,
  phrasalVerbContrastEntries: preintPhrasalVerbContrastEntries,
  phrasalVerbTypeEntries: preintPhrasalVerbTypeEntries,
  phrasalVerbWriteEntries: preintPhrasalVerbWriteEntries,
  extensionTitle: "Phrasal verbs you've already met",
  extensionEntries: preintPhrasalVerbReviewEntries,
  infoNotes: [
    { title: "Type 1 — no object", body: ["Some phrasal verbs do not take an object, and the verb and particle stay together.", "I get up at 7.30."] },
    { title: "Type 2 — can separate", body: ["Some phrasal verbs take an object and can be separated.", "Turn on the TV. · Turn the TV on.", "Both are correct."] },
    { title: "Type 3 — cannot separate", body: ["Some phrasal verbs take an object but cannot be separated.", "Look for your keys.", "Not: Look your keys for."] },
    { title: "turn up or turn down?", body: ["Turn up means increase the volume.", "Turn down means reduce the volume."] },
    { title: "put on or take off?", body: ["Put on means put clothes onto your body.", "Take off means remove clothes from your body."] },
    { title: "Four useful information phrases", body: ["look up = search for specific information", "find out = discover information", "look after = take care of somebody", "look forward to = feel excited about something in the future"] },
  ],
  activities: [
    { id: "phrasal-verb-flashcards", type: "flashcards", dataKey: "phrasalVerbEntries", title: "Phrasal verb flashcards", shortDescription: "Recall the complete phrasal verb from each situation.", prompt: "Read the situation and say the phrasal verb before you flip." },
    { id: "phrasal-verb-choice", type: "sentence-gap-choice", dataKey: "phrasalVerbContextEntries", title: "Which phrasal verb?", shortDescription: "Choose the phrasal verb that fits each everyday situation.", prompt: "Choose the correct phrasal verb.", question: "Which phrasal verb fits?", itemLimit: 12 },
    { id: "phrasal-verb-contrasts", type: "sentence-gap-choice", dataKey: "phrasalVerbContrastEntries", title: "Don't mix them up", shortDescription: "Choose between phrasal verbs with similar forms or related meanings.", prompt: "Choose the phrasal verb that matches the meaning.", question: "Which answer is correct?", itemLimit: 12 },
    { id: "phrasal-verb-types", type: "category-sort", dataKey: "phrasalVerbTypeEntries", title: "Which type?", shortDescription: "Sort phrasal verbs by whether they take an object and whether they can be separated.", prompt: "Which type of phrasal verb is this?", promptKey: "term", categoryKey: "type", itemLimit: 15, categories: [
      { id: "type1", label: "TYPE 1 — NO OBJECT" },
      { id: "type2", label: "TYPE 2 — CAN SEPARATE" },
      { id: "type3", label: "TYPE 3 — CANNOT SEPARATE" },
    ] },
    { id: "phrasal-verb-write", type: "sentence-gap-type-answer", dataKey: "phrasalVerbWriteEntries", title: "Write the phrasal verb", shortDescription: "Complete everyday sentences with the correct phrasal verb.", prompt: "Type the missing phrasal verb in the correct form.", answerLabel: "Phrasal verb", answerPlaceholder: "Type the missing words", itemLimit: 12 },
  ],
});

export function getHubVocabThemes(levelId = "a1") {
  return HUB_VOCAB_THEMES.filter((theme) => !levelId || theme.level === levelId).sort(sortThemes);
}

export function getAllHubVocabThemes() {
  return [...HUB_VOCAB_THEMES].sort(sortThemes);
}

function sortThemes(left, right) {
  if (left.level !== right.level) return left.level.localeCompare(right.level);
  return left.order - right.order;
}

export function getHubVocabTheme(themeId) {
  return HUB_VOCAB_THEMES.find((theme) => theme.id === themeId) || null;
}

export function getHubVocabActivity(themeId, activityId) {
  const theme = getHubVocabTheme(themeId);
  if (!theme) return null;
  const activity = theme.activities.find((item) => item.id === activityId) || null;
  return activity ? { theme, activity } : null;
}
