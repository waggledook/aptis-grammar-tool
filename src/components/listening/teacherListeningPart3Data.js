export const APTIS_LISTENING_PART3_LIVE_GAME_TYPE = "aptis_listening_part3_teacher";

export const TEACHER_LISTENING_PART3_TASKS = [
  {
    id: "renting-borrowing",
    title: "Renting and Borrowing Possessions",
    intro: "Listen to two people discussing renting and borrowing possessions. Read the statements (a–d) and decide who expresses each opinion — the man, the woman, or both the man and the woman. You can listen to the discussion twice.",
    audioSrc: "/audio/listening/part3/teacher/renting-borrowing.mp3",
    sectionAudio: [1, 2, 3, 4].map((number) =>
      `/audio/listening/part3/teacher/renting-borrowing-section-${number}.mp3`),
    statements: [
      {
        key: "a",
        text: "Renting suits things used occasionally.",
        answer: "man",
        scriptLineIndex: 1,
        scriptRange: [0, 4],
        evidenceParts: ["a drill that has come out of its case twice in three years", "Paying a modest fee on those two occasions would have cost less"],
        explanation: "The man uses his rarely used drill to argue that renting would cost less and avoid storage and maintenance. The woman's experience of hiring a carpet cleaner makes her favour ownership instead.",
      },
      {
        key: "b",
        text: "Ownership can be more convenient.",
        answer: "woman",
        scriptLineIndex: 4,
        scriptRange: [4, 7],
        evidenceParts: ["when I need it, I want to begin immediately", "rather pay once than organise my evening around somebody else’s booking"],
        explanation: "The woman values having her sewing machine available immediately. The man recognises the convenience but argues that reliable delivery could make renting nearly as easy.",
      },
      {
        key: "c",
        text: "Sharing prevents unnecessary purchases.",
        answer: "both",
        scriptLineIndex: 7,
        scriptRange: [7, 9],
        evidenceParts: ["stopped anyone buying a fifth", "without adding another appliance to the back of a cupboard"],
        explanation: "The man describes households sharing one ladder instead of buying another. The woman says borrowing would have kept her short-lived interest in a bread maker from becoming another unused purchase.",
      },
      {
        key: "d",
        text: "Environmental concerns rarely determine behaviour.",
        answer: "man",
        scriptLineIndex: 11,
        scriptRange: [9, 13],
        evidenceParts: ["most customers follow price and convenience", "I doubt it normally gets them through the door"],
        explanation: "The man says price and convenience usually motivate people more than environmental benefits. The woman gives her sister as a counterexample and argues that practical benefits can still lead to less wasteful habits.",
      },
    ],
    script: [
      { speaker: "Woman", text: "The council has opened a “library of things” near the station. You can borrow everything from carpet cleaners to camping equipment. Would you use it?" },
      { speaker: "Man", text: "For some things, definitely. I own a drill that has come out of its case twice in three years. Paying a modest fee on those two occasions would have cost less, and I would not have had to find somewhere to store it or replace the battery. Most of the time, it is simply taking up space." },
      { speaker: "Woman", text: "That ignores the effort involved. I once hired a carpet cleaner for a weekend. Collecting it meant crossing town before the shop closed, and returning it on Monday was worse. Buying one suddenly seemed attractive." },
      { speaker: "Man", text: "A local service with sensible collection times would make that a different calculation." },
      { speaker: "Woman", text: "Access is never as certain as having something in the cupboard. My sewing machine is not used every day, yet when I need it, I want to begin immediately. I would rather pay once than organise my evening around somebody else’s booking." },
      { speaker: "Man", text: "That convenience has a price, though. You store and maintain the machine whether you use it or not. With reliable delivery, renting could be almost as easy as ordering anything else online." },
      { speaker: "Woman", text: "Almost as easy is not quite the same as immediately available." },
      { speaker: "Man", text: "What appeals to me is avoiding all the duplicate equipment. Four families in our building own ladders, and most weeks none of them is used. We have started leaving one in a shared storeroom instead. It frees space in the flats and has stopped anyone buying a fifth." },
      { speaker: "Woman", text: "My kitchen is full of evidence. I bought a bread-making machine, used it enthusiastically for a month, then forgot about it. Borrowing would have let me discover that temporary enthusiasm without adding another appliance to the back of a cupboard." },
      { speaker: "Man", text: "People often present schemes like this as an environmental choice. I am not convinced that is what usually persuades them." },
      { speaker: "Woman", text: "It persuaded my sister. She rents clothes because she dislikes the waste created by buying outfits for single occasions. It costs more than hunting for cheap clothes online, but she has stayed with it." },
      { speaker: "Man", text: "She may be unusual. Put a cheaper, simpler option beside a greener one and most customers follow price and convenience. They may welcome the reduction in waste afterwards, but I doubt it normally gets them through the door." },
      { speaker: "Woman", text: "Perhaps not initially. A practical benefit can still lead people towards a less wasteful habit." },
    ],
  },
];

export function getTeacherListeningPart3Task(taskId) {
  return TEACHER_LISTENING_PART3_TASKS.find((task) => task.id === taskId) || null;
}
