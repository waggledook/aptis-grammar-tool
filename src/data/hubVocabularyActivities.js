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

function countryEntry(id, country, nationality, flagCode) {
  return {
    id,
    country,
    nationality,
    flagCode,
    flag4x3: `${FLAG_BASE}/4x3/${flagCode}.svg`,
    flag1x1: `${FLAG_BASE}/1x1/${flagCode}.svg`,
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
