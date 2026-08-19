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
];

export const HUB_VOCAB_LEVEL_COLORS = {
  a1: "#72df9b",
  a2: "#7ef0c2",
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
        id: "spelling",
        type: "type-answer",
        title: "Spell the number",
        shortDescription: "Type the word for each number.",
        prompt: "Type the number in words.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the correct word before moving to the next card.",
        prompt: "Choose the word that matches the number.",
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
        id: "spelling",
        type: "type-answer",
        title: "Spell the object",
        shortDescription: "Type the classroom word from the visual prompt.",
        prompt: "Look at the object and type the word.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the correct classroom word.",
        prompt: "Choose the word that matches the classroom object.",
      },
      {
        id: "language-gap-fill",
        type: "phrase-gap-fill",
        dataKey: "classroomLanguage",
        title: "Classroom phrase gaps",
        shortDescription: "Type the missing key word from each classroom phrase.",
        prompt: "Complete the classroom phrase.",
      },
      {
        id: "speaker-choice",
        type: "speaker-choice",
        dataKey: "classroomLanguage",
        title: "Teacher or student?",
        shortDescription: "Decide whether the teacher says it or the student says it.",
        prompt: "Choose who usually says the phrase.",
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
        id: "spelling",
        type: "type-answer",
        title: "Spell the object",
        shortDescription: "Type the small-object word from the visual prompt.",
        prompt: "Look at the object and type the word.",
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
        id: "colour-spelling",
        type: "type-answer",
        title: "Spell the colour",
        shortDescription: "Type the colour word from the visual prompt.",
        prompt: "Look at the colour and type the word.",
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
        id: "spelling",
        type: "type-answer",
        title: "Spell the item",
        shortDescription: "Type the food or drink word from the prompt.",
        prompt: "Look at the prompt and type the word.",
      },
      {
        id: "quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the food or drink word that matches the prompt.",
        prompt: "Choose the correct food or drink word.",
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
        id: "spelling",
        type: "cue-gap-type-answer",
        title: "Complete the phrase",
        shortDescription: "Type the missing verb or verb phrase from the cue prompt.",
        prompt: "Look at the cue prompt and type the missing words.",
        answerLabel: "Missing words",
        answerPlaceholder: "Type the missing words",
      },
      {
        id: "quick-choice",
        type: "gap-choice",
        title: "Quick choice",
        shortDescription: "Choose the missing verb or verb phrase.",
        prompt: "Choose the missing words.",
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
        id: "job-matching",
        type: "matching",
        title: "Match jobs",
        shortDescription: "Match each job prompt to the correct word.",
        prompt: "Match the jobs to the words.",
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
        id: "place-flashcards",
        type: "flashcards",
        dataKey: "workplaceEntries",
        title: "Place flashcards",
        shortDescription: "Read the place prompt, then reveal the phrase.",
        prompt: "Look at the workplace prompt and say the phrase before you flip.",
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
        id: "routine-spelling",
        type: "cue-gap-type-answer",
        title: "Complete the routine",
        shortDescription: "Type the missing verb from the routine prompt.",
        prompt: "Look at the cue prompt and type the missing word.",
        answerLabel: "Missing word",
        answerPlaceholder: "Type the missing word",
      },
      {
        id: "routine-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the full routine phrase that matches the prompt.",
        prompt: "Choose the correct routine phrase.",
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
        id: "spelling",
        type: "cue-gap-type-answer",
        title: "Complete the phrase",
        shortDescription: "Type the missing verb or verb phrase from the cue prompt.",
        prompt: "Look at the cue prompt and type the missing words.",
        answerLabel: "Missing words",
        answerPlaceholder: "Type the missing words",
      },
      {
        id: "quick-choice",
        type: "gap-choice",
        title: "Quick choice",
        shortDescription: "Choose the missing verb or verb phrase.",
        prompt: "Choose the missing words.",
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
        id: "month-matching",
        type: "matching",
        title: "Match months",
        shortDescription: "Match each abbreviation to the month.",
        prompt: "Match the month abbreviations to the words.",
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
        id: "ordinal-flashcards",
        type: "flashcards",
        dataKey: "ordinalEntries",
        title: "Ordinal flashcards",
        shortDescription: "Read the ordinal number, then reveal the word.",
        prompt: "Read the ordinal number and say the word before you flip.",
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
        id: "activity-spelling",
        type: "type-answer",
        title: "Spell the activity",
        shortDescription: "Type the activity from the picture.",
        prompt: "Look at the picture and type the activity.",
        answerLabel: "Activity",
        answerPlaceholder: "e.g. camping",
      },
      {
        id: "activity-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the activity that matches the cue.",
        prompt: "Choose the correct activity.",
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
        id: "clothes-spelling",
        type: "type-answer",
        title: "Spell the clothes",
        shortDescription: "Type the clothes word from the picture.",
        prompt: "Look at the picture and type the clothes word.",
        answerLabel: "Clothes word",
        answerPlaceholder: "e.g. jacket",
      },
      {
        id: "clothes-quick-choice",
        type: "quick-choice",
        title: "Quick choice",
        shortDescription: "Choose the clothes word that matches the picture.",
        prompt: "Choose the correct clothes word.",
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
        id: "room-spelling",
        type: "image-hotspot-type-answer",
        title: "Name the room item",
        shortDescription: "Type the word for the highlighted room item.",
        prompt: "Look at the highlighted number and type the word.",
        answerLabel: "Room item",
        answerPlaceholder: "e.g. a lamp",
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
      { id: "continent-matching", type: "matching", dataKey: "continentEntries", title: "Continent → adjective", shortDescription: "Match each continent with its adjective.", prompt: "Match the continents and adjectives." },
      { id: "flag-flashcards", type: "flag-flashcards", title: "Flag flashcards", shortDescription: "Reveal the country and nationality from its flag.", prompt: "Say the country and nationality before you flip." },
      { id: "flag-match", type: "flag-match", title: "Match the flags", shortDescription: "Match each flag to the correct country.", prompt: "Which country does this flag show?" },
      { id: "nationalities", type: "nationality-choice", title: "Country → nationality", shortDescription: "Choose the correct nationality for each country.", prompt: "Choose the correct nationality." },
      { id: "nationality-spelling", type: "nationality-type-answer", title: "Spell the nationality", shortDescription: "Type the nationality from the country name.", prompt: "Look at the country and type the nationality." },
      { id: "continent-sort", type: "category-sort", dataKey: "continentSortEntries", title: "Which continent?", shortDescription: "Sort countries into their continents.", prompt: "Choose the continent for each country.", promptKey: "country", categoryKey: "continentId", itemLimit: 12, categories: [
        { id: "africa", label: "Africa" },
        { id: "asia", label: "Asia" },
        { id: "australia", label: "Australia" },
        { id: "europe", label: "Europe" },
        { id: "north-america", label: "North America" },
        { id: "south-america", label: "South America" },
      ] },
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
      { id: "complete-phrase", type: "sentence-gap-type-answer", dataKey: "gapEntries", title: "Complete the classroom phrase", shortDescription: "Type the missing verb, preposition, or noun.", prompt: "Type the missing word." },
      { id: "choose-word", type: "sentence-gap-choice", dataKey: "gapEntries", title: "Choose the missing word", shortDescription: "Choose the word that completes each classroom phrase.", prompt: "Choose the missing word." },
      { id: "classroom-situations", type: "sentence-gap-choice", dataKey: "situationEntries", title: "Classroom situations", shortDescription: "Choose the phrase that fits each classroom situation.", prompt: "What would you say?", question: "What would you say?" },
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
      { id: "thing-spelling", type: "type-answer", dataKey: "pictureEntries", title: "Spell the thing", shortDescription: "Type the object name from its image.", prompt: "Look at the object and type the word.", answerLabel: "Object", answerPlaceholder: "Type the object name" },
      { id: "thing-quick-choice", type: "quick-choice", dataKey: "pictureEntries", title: "Quick object choice", shortDescription: "Recognise each object quickly from its image.", prompt: "Choose the object shown.", itemLimit: 15 },
      { id: "things-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Things in context", shortDescription: "Choose the object that fits each everyday situation.", prompt: "Which object completes the sentence?", question: "Choose the most useful object.", itemLimit: 12 },
      { id: "articles", type: "sentence-gap-choice", dataKey: "articleEntries", title: "a / an / no article", shortDescription: "Choose a, an, or no article before each noun.", prompt: "Choose the correct article.", question: "Choose a, an, or no article.", itemLimit: 12 },
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
      { id: "write-opposite", type: "opposite-type-answer", title: "Write the opposite", shortDescription: "Type the opposite, using labels such as old person and old thing.", prompt: "Write the opposite adjective.", itemLimit: 15 },
      { id: "describing-context", type: "sentence-gap-choice", dataKey: "descriptiveContextEntries", title: "Which adjective fits?", shortDescription: "Choose an objective descriptive adjective from clear contextual clues.", prompt: "Choose the adjective that fits the description.", itemLimit: 12 },
      { id: "opinion-sort", type: "category-sort", dataKey: "opinionEntries", title: "Good or bad?", shortDescription: "Sort opinion adjectives as positive or negative.", prompt: "Is this opinion positive or negative?", promptKey: "term", categoryKey: "opinion", itemLimit: 7, categories: [{ id: "positive", label: "Positive" }, { id: "negative", label: "Negative" }] },
      { id: "opinion-context", type: "sentence-gap-choice", dataKey: "opinionContextEntries", title: "Opinion adjectives in context", shortDescription: "Choose the adjective that best fits each situation.", prompt: "Choose the best opinion adjective." },
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
      { id: "complete-verb", type: "cue-gap-type-answer", title: "Complete the phrase", shortDescription: "Type the verb that naturally completes each phrase.", prompt: "Type the missing verb.", answerLabel: "Verb", answerPlaceholder: "Type the verb" },
      { id: "quick-verb", type: "gap-choice", title: "Quick verb choice", shortDescription: "Choose from real verbs in the bank to complete each collocation.", prompt: "Choose the missing verb.", itemLimit: 15 },
      { id: "verb-builder", type: "category-sort", dataKey: "builderEntries", title: "Verb builder", shortDescription: "Connect complements with do, play, drink, eat, and cook.", prompt: "Which verb completes this phrase?", promptKey: "term", categoryKey: "verb", itemLimit: 8, categories: [{ id: "do", label: "DO" }, { id: "play", label: "PLAY" }, { id: "drink", label: "DRINK" }, { id: "eat", label: "EAT" }, { id: "cook", label: "COOK" }] },
      { id: "phrases-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Phrases in context", shortDescription: "Choose the correctly inflected verb in an everyday sentence.", prompt: "Choose the verb that completes the sentence." },
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
      { id: "job-spelling", type: "type-answer", dataKey: "pictureEntries", title: "Spell the job", shortDescription: "Type the complete job name from its illustration.", prompt: "Look at the illustration and type the job.", answerLabel: "Job", answerPlaceholder: "e.g. an accountant" },
      { id: "what-job", type: "sentence-gap-choice", dataKey: "definitionEntries", title: "What job is it?", shortDescription: "Identify occupations from what people do.", prompt: "Read the description and choose the job.", question: "What job is it?", itemLimit: 12 },
      { id: "what-do-you-do", type: "sentence-gap-choice", dataKey: "workStatusEntries", title: "What do you do?", shortDescription: "Practise job, study, unemployment, and retirement expressions.", prompt: "Choose the expression that fits the person." },
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
      { id: "relationships", type: "sentence-gap-choice", dataKey: "relationshipEntries", title: "What's the relationship?", shortDescription: "Work out family vocabulary from a relationship sentence.", prompt: "Choose the correct relationship." },
      { id: "family-groups", type: "matching", dataKey: "groupEntries", title: "Family groups", shortDescription: "Match combinations of people with their family-group word.", prompt: "Match each description with the family group." },
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
      { id: "routine-complete", type: "cue-gap-type-answer", title: "Complete the routine", shortDescription: "Type the missing verb from the routine phrase.", prompt: "Look at the cue prompt and type the missing word or words.", answerLabel: "Missing words", answerPlaceholder: "Type the missing words" },
      { id: "routine-in-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Daily routine in context", shortDescription: "Choose the correct routine phrase in a short sentence.", prompt: "Read the sentence and choose the correct answer." },
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
      { id: "clock-type-answer", type: "clock-type-answer", dataKey: "clockEntries", title: "Write the time", shortDescription: "Look at the clock and type the time.", prompt: "Look at the clock and type the time.", answerLabel: "Time", answerPlaceholder: "e.g. It's quarter past six" },
      { id: "frequency-expressions", type: "sentence-gap-choice", dataKey: "frequencyEntries", title: "Frequency expressions", shortDescription: "Choose the correct expression of frequency from an explicit schedule.", prompt: "Read the schedule and choose the correct expression." },
      { id: "adverbs-of-frequency", type: "sentence-gap-choice", dataKey: "adverbEntries", title: "Adverbs of frequency", shortDescription: "Choose the adverb that matches a clearly stated frequency.", prompt: "Read the frequency clue and choose the correct adverb." },
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
      { id: "complete-the-phrase", type: "cue-gap-type-answer", title: "Complete the phrase", shortDescription: "Type the missing verb or verb phrase.", prompt: "Complete each phrase with the correct verb.", answerLabel: "Missing words", answerPlaceholder: "Type the missing words" },
      { id: "choose-the-verb", type: "gap-choice", title: "Choose the verb", shortDescription: "Choose the verb or lexical unit that completes each phrase.", prompt: "Choose the correct verb or verb phrase.", itemLimit: 15 },
      { id: "verbs-in-context", type: "sentence-gap-choice", dataKey: "contextEntries", title: "Which verb fits?", shortDescription: "Choose the verb that makes sense in the situation.", prompt: "Read the situation and choose the correct answer." },
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
      { id: "house-hotspot-type", type: "image-hotspot-type-answer", title: "Name it", shortDescription: "Name highlighted places and objects in five focused rounds.", prompt: "Use the round label and focused view to name the highlighted word.", sceneImage: A2_HOUSE_SCENE_IMAGE, rounds: A2_HOUSE_HOTSPOT_ROUNDS, answerLabel: "House word", answerPlaceholder: "Type the word" },
      { id: "where-do-you-find-it", type: "sentence-gap-choice", dataKey: "locationEntries", title: "Where do you find it?", shortDescription: "Choose the room where you normally find each thing.", prompt: "Where would you normally find this?" },
      { id: "house-clues", type: "sentence-gap-choice", dataKey: "clueEntries", title: "What am I?", shortDescription: "Read the clue and identify the room, house part, or object.", prompt: "Read the clue and choose the correct answer." },
    ],
  }
);

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
