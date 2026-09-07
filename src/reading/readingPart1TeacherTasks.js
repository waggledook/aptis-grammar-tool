export const APTIS_READING_PART1_LIVE_GAME_TYPE = "aptis-reading-part1-teacher";

export const READING_PART1_TEACHER_TASKS = [
  {
    id: "moving-house",
    title: "Moving house",
    prompt: "Read the email from Alex to Mia. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Best,",
    sender: "Alex",
    lines: [
      [{ text: "Hi Mia," }],
      [{ text: "Can you " }, { gap: 0 }, { text: " me move on Saturday?" }],
      [{ text: "My flat is " }, { gap: 1 }, { text: ", with room for only one sofa." }],
      [{ text: "I need a " }, { gap: 2 }, { text: "; the bedroom is dark." }],
      [{ text: "Some boxes are " }, { gap: 3 }, { text: ", so please bring your car." }],
      [{ text: "The van leaves at six, so be ready " }, { gap: 4 }, { text: " then." }],
      [{ text: "We can eat " }, { gap: 5 }, { text: " we finish." }],
    ],
    gaps: [
      { id: 0, answer: "help", fixed: true, options: ["help", "carry", "take"] },
      { id: 1, answer: "small", options: ["small", "empty", "modern"], explanation: "Room for only one sofa shows that the flat is small." },
      { id: 2, answer: "lamp", options: ["lamp", "blanket", "mirror"], explanation: "A lamp provides light in a dark bedroom." },
      { id: 3, answer: "heavy", options: ["heavy", "empty", "open"], explanation: "Heavy boxes explain why Alex asks Mia to bring her car." },
      { id: 4, answer: "by", options: ["by", "until", "after"], explanation: "Be ready by then means no later than that time." },
      { id: 5, answer: "when", options: ["when", "where", "what"], explanation: "When introduces the time at which they can eat." },
    ],
  },
  {
    id: "football-practice",
    title: "Football practice",
    prompt: "Read the email from Leo to Dan. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "See you,",
    sender: "Leo",
    lines: [
      [{ text: "Hi Dan," }],
      [{ text: "Are you " }, { gap: 0 }, { text: " to football practice after work?" }],
      [{ text: "The park is very " }, { gap: 1 }, { text: ", only two streets away." }],
      [{ text: "It rained all night, so the ground is " }, { gap: 2 }, { text: "." }],
      [{ text: "Bring a " }, { gap: 3 }, { text: " because there is no shade." }],
      [{ text: "Practice starts " }, { gap: 4 }, { text: " six o'clock." }],
      [{ text: "Call me " }, { gap: 5 }, { text: " you cannot come." }],
    ],
    gaps: [
      { id: 0, answer: "coming", fixed: true, options: ["coming", "taking", "watching"] },
      { id: 1, answer: "near", options: ["near", "quiet", "open"], explanation: "Only two streets away tells us that the park is near." },
      { id: 2, answer: "wet", options: ["wet", "rough", "cold"], explanation: "Rain all night makes the ground wet." },
      { id: 3, answer: "hat", options: ["hat", "jacket", "gloves"], explanation: "With no shade, a hat protects you from the sun." },
      { id: 4, answer: "at", options: ["at", "on", "in"], explanation: "Use at with an exact time: at six o'clock." },
      { id: 5, answer: "if", options: ["if", "when", "where"], explanation: "If introduces the possible condition that Dan cannot come." },
    ],
  },
  {
    id: "looking-after-a-cat",
    title: "Looking after a cat",
    prompt: "Read the email from Nina to Emma. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Thanks,",
    sender: "Nina",
    lines: [
      [{ text: "Hi Emma," }],
      [{ text: "Can you " }, { gap: 0 }, { text: " after my cat this weekend?" }],
      [{ text: "Keep her food in the " }, { gap: 1 }, { text: " so it stays cold." }],
      [{ text: "Please fill her " }, { gap: 2 }, { text: " with fresh water." }],
      [{ text: "She is afraid of " }, { gap: 3 }, { text: " noises." }],
      [{ text: "Remember to close the window " }, { gap: 4 }, { text: " you leave." }],
      [{ text: "I will be home late " }, { gap: 5 }, { text: " Sunday evening." }],
    ],
    gaps: [
      { id: 0, answer: "look", fixed: true, options: ["look", "see", "watch"] },
      { id: 1, answer: "fridge", options: ["fridge", "cupboard", "oven"], explanation: "The fridge keeps the cat's food cold." },
      { id: 2, answer: "bowl", options: ["bowl", "plate", "cup"], explanation: "A cat normally drinks fresh water from a bowl." },
      { id: 3, answer: "loud", options: ["loud", "strong", "heavy"], explanation: "Loud is the adjective that naturally describes frightening noises." },
      { id: 4, answer: "before", options: ["before", "after", "while"], explanation: "The window must be closed before Emma leaves." },
      { id: 5, answer: "on", options: ["on", "in", "at"], explanation: "Use on with a day and part of the day: on Sunday evening." },
    ],
  },
  {
    id: "training-day",
    title: "Training day",
    prompt: "Read the email from Sara to Ben. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Thanks,",
    sender: "Sara",
    lines: [
      [{ text: "Hi Ben," }],
      [{ text: "Can you " }, { gap: 0 }, { text: " me the address for tomorrow's training?" }],
      [{ text: "The course starts " }, { gap: 1 }, { text: " half past eight." }],
      [{ text: "Please " }, { gap: 2 }, { text: " me which room we need." }],
      [{ text: "Bring your " }, { gap: 3 }, { text: " because security will ask for it." }],
      [{ text: "We have a short " }, { gap: 4 }, { text: " at midday for coffee." }],
      [{ text: "I should arrive back at work " }, { gap: 5 }, { text: " four." }],
    ],
    gaps: [
      { id: 0, answer: "send", fixed: true, options: ["send", "bring", "make"] },
      { id: 1, answer: "at", options: ["at", "on", "in"], explanation: "Use at with an exact time: at half past eight." },
      { id: 2, answer: "tell", options: ["tell", "say", "speak"], explanation: "Tell can be followed directly by a person: tell me." },
      { id: 3, answer: "ID", options: ["ID", "notebook", "address"], explanation: "Security asks to see identification, so Sara needs her ID." },
      { id: 4, answer: "break", options: ["break", "lesson", "meeting"], explanation: "A short break is the natural time to stop for coffee." },
      { id: 5, answer: "by", options: ["by", "until", "during"], explanation: "By four means no later than four o'clock." },
    ],
  },
  {
    id: "lost-phone",
    title: "Lost phone",
    prompt: "Read the email from Maya to Jack. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Thanks,",
    sender: "Maya",
    lines: [
      [{ text: "Hi Jack," }],
      [{ text: "Can you " }, { gap: 0 }, { text: " for my phone in your car?" }],
      [{ text: "It won't " }, { gap: 1 }, { text: " because the sound is off." }],
      [{ text: "Please check the " }, { gap: 2 }, { text: " under the seats." }],
      [{ text: "My number is written on a small " }, { gap: 3 }, { text: " in the case." }],
      [{ text: "If you find it, keep it somewhere " }, { gap: 4 }, { text: "." }],
      [{ text: "I can come later to " }, { gap: 5 }, { text: " it." }],
    ],
    gaps: [
      { id: 0, answer: "look", fixed: true, options: ["look", "wait", "ask"] },
      { id: 1, answer: "ring", options: ["ring", "work", "charge"], explanation: "Turning the sound off stops the phone from ringing aloud." },
      { id: 2, answer: "floor", options: ["floor", "roof", "door"], explanation: "Something under the car seats would be on the floor." },
      { id: 3, answer: "card", options: ["card", "coin", "key"], explanation: "A number can be written on a small card kept in the case." },
      { id: 4, answer: "safe", options: ["safe", "quiet", "bright"], explanation: "A found phone should be kept somewhere safe until it is collected." },
      { id: 5, answer: "collect", options: ["collect", "return", "borrow"], explanation: "Maya will come to collect, or pick up, her own phone." },
    ],
  },
];

export function getReadingPart1TeacherTask(taskId) {
  return READING_PART1_TEACHER_TASKS.find((task) => task.id === taskId) || null;
}

export function getReadingPart1LiveScore(task, submission) {
  if (!task || !submission?.answers) return 0;
  return task.gaps
    .filter((gap) => !gap.fixed)
    .filter((gap) => submission.answers[gap.id] === gap.answer)
    .length;
}
