// src/components/speaking/banks/part1.js
const RAW = [
    "Who do you usually spend your weekends with?",
    "Tell me about your best friend",
    "What's your favourite city?",
    "What’s the food like in your country?",
    "Describe your home",
    "Tell me about your favourite book",
    "What’s the weather like today?",
    "Tell me about your family",
    "What do you like doing in your free time?",
    "Tell me about your last holiday",
    "What did you do last night?",
    "What’s your typical day like?",
    "Tell me about your town",
    "Describe the room you are in now",
    "What do you like doing at the weekend?",
    "Tell me about your work or studies",
    "What was your favourite toy as a child?",
    "What are you wearing today?",
    "Tell me about your favourite film",
    "Tell me about your favourite animal",
    "What is your favourite item of clothing?",
    "What is your favourite time of the year?",
    "Tell me about your favourite food",
    "What’s your favourite subject at school (or what was it)?",
    "What’s the most interesting place you have visited?",
    "Do you prefer mornings or evenings? Why?",
    "What’s your favourite type of music?",
    "Tell me about a tradition in your country.",
    "Do you prefer summer or winter holidays? Why?",
    "What are you wearing today?",                 // (dup)
    "Tell me about your favourite film",           // (dup)
    "Tell me about your favourite animal",         // (dup)
    "What is your favourite item of clothing?",    // (dup)
    "What is your favourite time of the year?",    // (dup)
    "Where did you last go on holiday?",
    "What do you like about your neighbourhood?"
  ];
  
  // de-dupe and add stable ids
  export const PART1_QUESTIONS = Array.from(new Set(RAW)).map((text, i) => ({
    id: `p1q${String(i + 1).padStart(3, "0")}`,
    text,
  }));
  