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
  {
    id: "childrens-independence",
    title: "Children's Independence",
    intro:
      "Listen to a man and a woman discussing independence for their eleven-year-old children. Read the statements (a–d) and decide who expresses each opinion — the man, the woman, or both. You can listen to the discussion twice.",
    audioSrc: "/audio/listening/part3/teacher/childrens-independence.mp3",
    dialogueAudioSrc: "/audio/listening/part3/teacher/childrens-independence-dialogue.mp3",
    sectionAudio: [1, 2, 3, 4].map((number) =>
      `/audio/listening/part3/teacher/childrens-independence-section-${number}.mp3`),
    statements: [
      {
        key: "a",
        text: "Children need a supervised trial even on familiar school routes.",
        answer: "man",
        scriptLineIndex: 1,
        scriptRange: [0, 3],
        evidenceParts: [
          "let her lead while I hung back",
          "noticing a car backing out without a reminder",
          "I'd save that for somewhere he hadn't walked before",
        ],
        explanation:
          "The man distinguishes knowing the route from handling hazards without reminders and proposes following while his daughter leads. The woman reserves that trial for an unfamiliar route and questions its value here. The claim concerns a supervised trial of independent decision-making, rather than the ordinary accompanied walks both children have already made.",
      },
      {
        key: "b",
        text: "Parents should usually avoid delivering forgotten equipment to school.",
        answer: "woman",
        scriptLineIndex: 4,
        scriptRange: [3, 6],
        evidenceParts: [
          "I was passing the school, but left it at home",
          "His bag was packed before the next lesson",
          "I'd have dropped it in",
        ],
        explanation:
          "The woman leaves the kit at home even though she is passing the school. She accepts the missed game because the child subsequently prepares his bag. The man would deliver the item and use a checklist to prevent another mistake. Their disagreement concerns an ordinary forgotten item, rather than emergencies or whether children should learn responsibility.",
      },
      {
        key: "c",
        text: "Children of the same age may need different levels of freedom.",
        answer: "both",
        scriptLineIndex: 6,
        scriptRange: [6, 8],
        evidenceParts: [
          "His friend Ben is eleven too",
          "I wouldn't argue with her",
          "There's only a month between my daughter and her cousin",
          "I'd want an adult going with him for quite a while yet",
        ],
        explanation:
          "The woman lets her son go alone but accepts continued accompaniment for Ben, who is also eleven and changes plans without telling anyone. The man contrasts his daughter's judgement with her almost identically aged cousin's and would keep an adult with the cousin. Both imply that readiness, rather than age alone, should determine freedom.",
      },
      {
        key: "d",
        text: "Parents should routinely use phone tracking on school journeys.",
        answer: "man",
        scriptLineIndex: 9,
        scriptRange: [8, 12],
        evidenceParts: [
          "keep the map open beside my email in the mornings",
          "I've set that up on my son's phone too",
          "If he was late and wasn't answering, I'd be glad of it",
          "Until then, the map stays closed",
        ],
        explanation:
          "The man plans to keep the map open alongside his email in the mornings, implying an ordinary routine rather than an emergency response. The woman has also enabled tracking, but would open the map only if her son were late and uncontactable. Having the technology available does not mean that she supports routine monitoring.",
      },
    ],
    script: [
      {
        speaker: "Woman",
        text:
          "My son's eleven now, and he's walking to school on his own from next week. He knows every turn by now. He's already arranging who to meet at the corner.",
      },
      {
        speaker: "Man",
        text:
          "My daughter knows our route too. I'd still let her lead while I hung back for a couple of mornings. Remembering the turns is one thing; noticing a car backing out without a reminder is another. They can look very sensible when somebody else is making the decisions.",
      },
      {
        speaker: "Woman",
        text:
          "I'd save that for somewhere he hadn't walked before. He's already the one telling me when it's safe to cross. On this route, having me behind him would mostly remind him I was still in charge.",
      },
      {
        speaker: "Man",
        text: "And if he leaves half his school things behind?",
      },
      {
        speaker: "Woman",
        text:
          "He forgot his sports kit last week and rang to ask me to bring it. I was passing the school, but left it at home. He missed a game. His bag was packed before the next lesson, though. That complaint I could live with. An emergency would be different.",
      },
      {
        speaker: "Man",
        text:
          "I'd have dropped it in. Losing a lesson seems a high price for a moment's forgetfulness. A checklist by the door could prevent another mistake without making her sit out today's lesson. She could write it herself and check it each evening.",
      },
      {
        speaker: "Woman",
        text:
          "His friend Ben is eleven too, but still changes plans without telling anyone. His mother walks him to school. Last week she had to ring three different parents to find him. When she says he isn't ready yet, I wouldn't argue with her.",
      },
      {
        speaker: "Man",
        text:
          "There's only a month between my daughter and her cousin. She checks with us when plans change; he follows whoever has the most exciting suggestion. I'd want an adult going with him for quite a while yet.",
      },
      {
        speaker: "Woman",
        text: "What would make you comfortable about her walking by herself?",
      },
      {
        speaker: "Man",
        text:
          "Once she starts, I'll keep the map open beside my email in the mornings. She wouldn't need to report in at every crossing. I won't be watching every step, but a glance across to see her getting nearer would make letting her go much easier.",
      },
      {
        speaker: "Woman",
        text:
          "I've set that up on my son's phone too. If he was late and wasn't answering, I'd be glad of it. Until then, the map stays closed. Otherwise, I might as well follow him down the street.",
      },
      {
        speaker: "Man",
        text: "Well, next week you can tell me how that first walk went.",
      },
    ],
  },
];

export function getTeacherListeningPart3Task(taskId) {
  return TEACHER_LISTENING_PART3_TASKS.find((task) => task.id === taskId) || null;
}
