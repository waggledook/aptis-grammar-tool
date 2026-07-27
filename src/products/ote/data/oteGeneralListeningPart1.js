const root = "/ote/listening/general/part-1";

function pictureOptions(level, itemNumber, texts) {
  return texts.map((text, optionIndex) => ({
    text,
    image: `/images${root}/${level}-set-1/item${itemNumber}${String.fromCharCode(97 + optionIndex)}.webp`,
  }));
}

function audioSources(level, itemNumber) {
  const audioRoot = `/audio${root}/${level}-set-1`;
  return {
    instructionAudioSrc: `${audioRoot}/question-${itemNumber}.mp3`,
    audioSrc: `${audioRoot}/item-${itemNumber}.mp3`,
  };
}

export const generalListeningPart1Sets = [
  {
    id: "a2-set-1",
    level: "A2",
    title: "A2 Picture Set 1",
    description: "Five short picture-option questions about everyday decisions and arrangements.",
    assetsReady: true,
    audioReady: false,
    instructionAudioReady: false,
    questions: [
      {
        id: "birthday-present",
        context: "Two friends are choosing a birthday present.",
        prompt: "What do they decide to buy?",
        kind: "pictures",
        answer: 0,
        ...audioSources("a2", 1),
        options: pictureOptions("a2", 1, ["a cookbook", "a blue mug", "some flowers"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "Actually, the cookbook has recipes from Spain. She’d love that.",
            note: "The cookbook is reconsidered after the woman explains why Maya would like it, and the man agrees to buy it.",
          },
          {
            option: 1,
            quote: "What about that blue mug?",
            note: "The mug is suggested, but the conversation moves on to the flowers and then back to the cookbook.",
          },
          {
            option: 2,
            quote: "flowers would be better for her new flat.",
            note: "Flowers are considered, but they are not the friends’ final decision.",
          },
        ],
        script: [
          { speaker: "Man", text: "What shall we get Maya for her birthday? I saw a lovely cookbook." },
          { speaker: "Woman", text: "She already has lots of books. What about that blue mug?" },
          { speaker: "Man", text: "It’s nice, but flowers would be better for her new flat." },
          { speaker: "Woman", text: "Actually, the cookbook has recipes from Spain. She’d love that." },
          { speaker: "Man", text: "All right, let’s get it." },
        ],
        profile: {
          level: "A2",
          words: 50,
          focus: "Following a simple decision after several suggestions",
          distractors: "The mug and flowers are both suggested before the original cookbook idea is confirmed.",
        },
        explanation:
          "All three gifts are discussed. The cookbook is suggested first, appears to be rejected, and is then chosen after the woman explains why Maya would like it.",
      },
      {
        id: "sports-centre-journey",
        context: "A girl is leaving a message for her father.",
        prompt: "How will she travel to the sports centre?",
        kind: "pictures",
        answer: 1,
        ...audioSources("a2", 2),
        options: pictureOptions("a2", 2, ["by bus", "by car", "by train"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "The bus to the sports centre has been cancelled.",
            note: "The bus is unavailable.",
          },
          {
            option: 1,
            quote: "Elena’s mother is driving past our house at six and says I can go with them.",
            note: "The girl has accepted a lift in Elena’s mother’s car.",
          },
          {
            option: 2,
            quote: "I could take the train, but the station is twenty minutes away.",
            note: "The train is possible, but it is inconvenient and not the chosen journey.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Hi Dad. The bus to the sports centre has been cancelled. I could take the train, but the station is twenty minutes away. Elena’s mother is driving past our house at six and says I can go with them. So don’t worry — I won’t be late.",
          },
        ],
        profile: {
          level: "A2",
          words: 46,
          focus: "Distinguishing an unavailable, inconvenient, and accepted option",
          distractors: "The bus is cancelled and the train is possible but inconvenient.",
        },
        explanation:
          "The bus is cancelled and the train station is a long walk away. Elena’s mother will collect the girl, so she will travel by car.",
      },
      {
        id: "hotel-charge",
        context: "A woman is giving information about a hotel.",
        prompt: "What do guests have to pay for?",
        kind: "pictures",
        answer: 2,
        ...audioSources("a2", 3),
        options: pictureOptions("a2", 3, ["the swimming pool", "breakfast", "the car park"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "Guests can use the swimming pool without paying",
            note: "The swimming pool is free.",
          },
          {
            option: 1,
            quote: "Breakfast is included in your room price.",
            note: "Breakfast is already included rather than charged separately.",
          },
          {
            option: 2,
            quote: "The underground car park costs eight euros a day",
            note: "The daily price shows that guests must pay for the car park.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Welcome to the Seaview Hotel. Breakfast is included in your room price. The underground car park costs eight euros a day, but there is usually plenty of space. Guests can use the swimming pool without paying, and towels are available at reception.",
          },
        ],
        profile: {
          level: "A2",
          words: 42,
          focus: "Separating included, charged, and free facilities",
          distractors: "Breakfast is included and the swimming pool is free.",
        },
        explanation:
          "Breakfast is included in the room price and the swimming pool is free. The underground car park costs eight euros a day.",
      },
      {
        id: "camp-packing",
        context: "A girl is talking to her father about going to a camp.",
        prompt: "What must she still pack?",
        kind: "pictures",
        answer: 1,
        ...audioSources("a2", 4),
        options: pictureOptions("a2", 4, ["a torch", "walking boots", "a blanket"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "my torch is already in the side pocket.",
            note: "The torch has already been packed.",
          },
          {
            option: 1,
            quote: "I still need to put my walking boots in.",
            note: "The walking boots are the only item she still needs to pack.",
          },
          {
            option: 2,
            quote: "No, the camp provides those.",
            note: "The camp supplies the blankets.",
          },
        ],
        script: [
          { speaker: "Man", text: "Have you packed everything for camp?" },
          { speaker: "Woman", text: "Not quite. I still need to put my walking boots in." },
          { speaker: "Man", text: "Do you need a blanket?" },
          { speaker: "Woman", text: "No, the camp provides those. And my torch is already in the side pocket." },
          { speaker: "Man", text: "Good. Don’t leave the boots by the door again!" },
        ],
        profile: {
          level: "A2",
          words: 45,
          focus: "Distinguishing an unpacked, packed, and provided item",
          distractors: "The torch is already packed and the camp provides blankets.",
        },
        explanation:
          "The walking boots still need to go in the bag. The torch is already packed, and the camp supplies the blankets.",
      },
      {
        id: "meeting-place",
        context: "Two friends are arranging to meet.",
        prompt: "Where do they decide to meet?",
        kind: "pictures",
        answer: 2,
        ...audioSources("a2", 5),
        options: pictureOptions("a2", 5, ["at the train station", "outside a café", "at a bus stop"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "We can walk to the station together from there",
            note: "They will visit the station after meeting somewhere else.",
          },
          {
            option: 1,
            quote: "It doesn’t open until nine.",
            note: "The café is the first suggestion, but it is not open early enough.",
          },
          {
            option: 2,
            quote: "Let’s meet at the bus stop at quarter to nine.",
            note: "The bus stop is the agreed meeting place.",
          },
        ],
        script: [
          { speaker: "Woman", text: "Shall we meet outside the café at half past eight?" },
          { speaker: "Man", text: "It doesn’t open until nine. Let’s meet at the bus stop at quarter to nine." },
          { speaker: "Woman", text: "Fine. We can walk to the station together from there and catch the nine o’clock train." },
        ],
        profile: {
          level: "A2",
          words: 41,
          focus: "Separating a suggested, selected, and later location",
          distractors: "The café is unavailable and the station is visited after they meet.",
        },
        explanation:
          "The café is not open early enough. The friends agree to meet at the bus stop and then walk to the station together.",
      },
    ],
  },
  {
    id: "b1-set-1",
    level: "B1",
    title: "B1 Picture Set 1",
    description: "Five picture-option questions testing corrections, reference, status, and present plans.",
    assetsReady: false,
    audioReady: false,
    instructionAudioReady: false,
    questions: [
      {
        id: "uncle-present",
        context: "A man and a woman are choosing a present.",
        prompt: "What do they decide to buy?",
        kind: "pictures",
        answer: 0,
        ...audioSources("b1", 1),
        options: pictureOptions("b1", 1, ["a camera case", "a cookbook", "some headphones"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "Then your first idea makes most sense. Let’s get the camera case.",
            note: "“Your first idea” refers back to the camera case, which is then explicitly selected.",
          },
          {
            option: 1,
            quote: "He hardly ever cooks.",
            note: "The cookbook is unsuitable because Uncle Ben rarely cooks.",
          },
          {
            option: 2,
            quote: "he already has an expensive pair.",
            note: "The headphones are unnecessary because he already owns a good pair.",
          },
        ],
        script: [
          { speaker: "Man", text: "We still need a present for Uncle Ben. What about a new camera case? His old one looks terrible." },
          { speaker: "Woman", text: "Maybe, although I saw a cookbook he might like." },
          { speaker: "Man", text: "He hardly ever cooks. These headphones are good, but he already has an expensive pair." },
          { speaker: "Woman", text: "Then your first idea makes most sense. Let’s get the camera case." },
          { speaker: "Man", text: "Great. I know which colour he wants." },
        ],
        profile: {
          level: "B1",
          words: 67,
          focus: "Resolving a backward reference to the first suggestion",
          distractors: "The cookbook and headphones are both considered and rejected.",
        },
        explanation:
          "The woman’s reference to “your first idea” points back to the camera case. The other two presents are unsuitable.",
      },
      {
        id: "class-journey",
        context: "A woman is leaving a message for her father.",
        prompt: "How will she travel to her class?",
        kind: "pictures",
        answer: 1,
        ...audioSources("b1", 2),
        options: pictureOptions("b1", 2, ["by bicycle", "by car", "by bus"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "I wanted to cycle, but the back tyre is flat again.",
            note: "Cycling was the original plan, but the bicycle cannot be used.",
          },
          {
            option: 1,
            quote: "Leo has offered to drive me",
            note: "Leo will take her to the class by car.",
          },
          {
            option: 2,
            quote: "I’ll probably take the bus home",
            note: "The bus is a genuine travel plan, but it is for the return journey.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Hi, Dad. I’m just leaving for my evening class. I wanted to cycle, but the back tyre is flat again. Leo has offered to drive me because he’s going past the college on his way to work. I’ll probably take the bus home, though, as he won’t finish until midnight. So you don’t need to come and collect me.",
          },
        ],
        profile: {
          level: "B1",
          words: 60,
          focus: "Distinguishing outward and return journeys",
          distractors: "The bicycle is unavailable and the bus is for the journey home.",
        },
        explanation:
          "The woman originally wanted to cycle, but the tyre is flat. Leo will drive her to class; the bus is only her probable journey home.",
      },
      {
        id: "photography-equipment",
        context: "Two people are talking about a photography course.",
        prompt: "What does the woman still need to buy?",
        kind: "pictures",
        answer: 0,
        ...audioSources("b1", 3),
        options: pictureOptions("b1", 3, ["a memory card", "a camera", "a tripod"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "I need to buy a larger memory card",
            note: "The memory card is the item she must obtain from a shop.",
          },
          {
            option: 1,
            quote: "Marta’s lending me hers.",
            note: "She needs a camera, but she will borrow one rather than buy it.",
          },
          {
            option: 2,
            quote: "the college provides one for every student.",
            note: "The college supplies the tripod.",
          },
        ],
        script: [
          { speaker: "Man", text: "Have you got everything for Saturday’s photography course?" },
          { speaker: "Woman", text: "Almost. I need to buy a larger memory card because the teacher says we’ll take hundreds of pictures." },
          { speaker: "Man", text: "And you’ve got a camera?" },
          { speaker: "Woman", text: "Marta’s lending me hers. I wanted to take our tripod too, but the college provides one for every student." },
          { speaker: "Man", text: "Good. Just don’t forget to visit the shop today." },
        ],
        profile: {
          level: "B1",
          words: 64,
          focus: "Separating equipment that is bought, borrowed, and provided",
          distractors: "The camera is borrowed and the tripod is provided by the college.",
        },
        explanation:
          "All three items are needed for photography, but only the memory card must be bought. The camera is borrowed and the tripod is supplied.",
      },
      {
        id: "festival-role",
        context: "A woman is talking about a community festival.",
        prompt: "What will she do there?",
        kind: "pictures",
        answer: 1,
        ...audioSources("b1", 4),
        options: pictureOptions("b1", 4, ["sell tickets", "take photographs", "serve food and drinks"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "That was the original plan, but Chloe has agreed to do it.",
            note: "Selling tickets was her original role, but someone else will now do it.",
          },
          {
            option: 1,
            quote: "Their photographer has become ill, so I’m taking the photographs instead.",
            note: "The photographer’s illness creates the woman’s new role.",
          },
          {
            option: 2,
            quote: "they already have enough people serving drinks and sandwiches.",
            note: "She offers to help with food, but that role is already fully staffed.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I’m helping at the community festival on Sunday." },
          { speaker: "Man", text: "Are you selling tickets at the entrance?" },
          { speaker: "Woman", text: "That was the original plan, but Chloe has agreed to do it. Their photographer has become ill, so I’m taking the photographs instead." },
          { speaker: "Man", text: "That sounds more interesting." },
          { speaker: "Woman", text: "Yes. I offered to help at the food tent too, but they already have enough people serving drinks and sandwiches." },
        ],
        profile: {
          level: "B1",
          words: 67,
          focus: "Following an original role, revised role, and rejected offer",
          distractors: "Ticket sales were the original plan and the food tent already has enough volunteers.",
        },
        explanation:
          "Selling tickets was the original plan, and the food tent does not need more help. The woman will replace the festival photographer.",
      },
      {
        id: "leisure-centre-plan",
        context: "Two friends are making plans.",
        prompt: "Which activity do they decide to do?",
        kind: "pictures",
        answer: 2,
        ...audioSources("b1", 5),
        options: pictureOptions("b1", 5, ["yoga", "climbing", "badminton"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "there aren’t any places left.",
            note: "The yoga class is full.",
          },
          {
            option: 1,
            quote: "I’ve arranged that for next Saturday with my brother.",
            note: "Climbing is planned for a different day and with someone else.",
          },
          {
            option: 2,
            quote: "How about a game of badminton instead?",
            note: "The man agrees that badminton is a good idea and will check for a court.",
          },
        ],
        script: [
          { speaker: "Man", text: "Do you still want to go to the leisure centre tomorrow?" },
          { speaker: "Woman", text: "Yes. I tried to book the yoga class, but there aren’t any places left." },
          { speaker: "Man", text: "We could use the climbing wall." },
          { speaker: "Woman", text: "I’ve arranged that for next Saturday with my brother. How about a game of badminton instead?" },
          { speaker: "Man", text: "Good idea. I’ll check whether a court is free in the morning." },
          { speaker: "Woman", text: "Great. Let me know what time." },
        ],
        profile: {
          level: "B1",
          words: 71,
          focus: "Distinguishing an unavailable, later, and selected activity",
          distractors: "Yoga is full and climbing is already arranged for the following week.",
        },
        explanation:
          "The yoga class is full and climbing is planned for the next Saturday. The friends agree to check whether they can play badminton tomorrow.",
      },
    ],
  },
  {
    id: "b2-set-1",
    level: "B2",
    title: "B2 Picture Set 1",
    description: "Five picture-option questions testing revised plans, shared reactions, and combined details.",
    assetsReady: false,
    audioReady: false,
    instructionAudioReady: false,
    questions: [
      {
        id: "trip-suitcase",
        context: "A woman is discussing what to pack for a trip.",
        prompt: "Which suitcase will she take?",
        kind: "pictures",
        answer: 2,
        ...audioSources("b2", 1),
        options: pictureOptions("b2", 1, ["a large red suitcase", "a small red cabin case", "a large blue suitcase"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "The large red one holds everything, but the airline’s weight limit is lower than I expected.",
            note: "The large red case is suitable in size but too heavy for the airline limit.",
          },
          {
            option: 1,
            quote: "The handle broke last month, and I haven’t repaired it.",
            note: "The small red cabin case cannot be used because its handle is broken.",
          },
          {
            option: 2,
            quote: "My sister says I can borrow her large blue suitcase. It’s lighter than mine",
            note: "The large blue suitcase has the required capacity and is lighter, and the woman confirms she will collect it.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I’m trying to decide which case to take for the trip. The large red one holds everything, but the airline’s weight limit is lower than I expected." },
          { speaker: "Man", text: "What about your small red cabin case?" },
          { speaker: "Woman", text: "The handle broke last month, and I haven’t repaired it. My sister says I can borrow her large blue suitcase. It’s lighter than mine, even though it’s the same size." },
          { speaker: "Man", text: "That sounds like the best option." },
          { speaker: "Woman", text: "Yes, I’ll collect it tonight." },
        ],
        profile: {
          level: "B2",
          words: 75,
          focus: "Combining size, colour, weight, and condition",
          distractors: "One red case is too heavy and the other has a broken handle.",
        },
        explanation:
          "The large red case is too heavy, and the small red case has a broken handle. The large blue case is the same useful size but lighter, so she chooses it.",
      },
      {
        id: "errand-order",
        context: "A man and a woman are planning some errands.",
        prompt: "What will they do first?",
        kind: "pictures",
        answer: 0,
        ...audioSources("b2", 2),
        options: pictureOptions("b2", 2, ["collect a parcel", "go to the supermarket", "walk the dog"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "We’d better collect the parcel now.",
            note: "The parcel office’s early closing time moves collection to the start of the sequence.",
          },
          {
            option: 1,
            quote: "Let’s go to the supermarket first",
            note: "The supermarket is the original suggestion, but its late closing time makes it less urgent.",
          },
          {
            option: 2,
            quote: "We can walk Bruno on the way home",
            note: "Walking the dog remains in the plan, but it happens after collecting the parcel.",
          },
        ],
        script: [
          { speaker: "Man", text: "We need to collect the parcel, buy food for dinner and take Bruno for a walk." },
          { speaker: "Woman", text: "Let’s go to the supermarket first, before it gets busy." },
          { speaker: "Man", text: "The parcel office closes at four, though, and it’s already half past three. The supermarket is open until ten." },
          { speaker: "Woman", text: "Good point. We’d better collect the parcel now. We can walk Bruno on the way home and shop after that." },
          { speaker: "Man", text: "Fine. I’ll get the collection message from my phone." },
        ],
        profile: {
          level: "B2",
          words: 74,
          focus: "Following a revised sequence of three genuine tasks",
          distractors: "The supermarket was originally first, while the dog walk occurs on the way home.",
        },
        explanation:
          "The woman initially suggests the supermarket, but the parcel office closes soon. They revise the order and decide to collect the parcel first.",
      },
      {
        id: "new-office",
        context: "Two colleagues are discussing their new office.",
        prompt: "What did they both particularly like?",
        kind: "pictures",
        answer: 1,
        ...audioSources("b2", 3),
        options: pictureOptions("b2", 3, ["the roof terrace", "the meeting rooms", "the kitchen"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "The roof terrace has a fantastic view.",
            note: "The man likes the terrace, but the woman finds it too windy.",
          },
          {
            option: 1,
            quote: "I was impressed by the meeting rooms.",
            note: "The woman praises the rooms, the man agrees, and they return to this shared positive view at the end.",
          },
          {
            option: 2,
            quote: "The kitchen looks attractive too.",
            note: "The woman likes the kitchen, but the man considers it too small.",
          },
        ],
        script: [
          { speaker: "Woman", text: "What did you think of the new office?" },
          { speaker: "Man", text: "The roof terrace has a fantastic view." },
          { speaker: "Woman", text: "It does, but it was too windy to sit there for long. I was impressed by the meeting rooms. They’re quiet, and the screens are much better than the old ones." },
          { speaker: "Man", text: "Absolutely. We’ll use those a lot." },
          { speaker: "Woman", text: "The kitchen looks attractive too." },
          { speaker: "Man", text: "Yes, although it’s rather small for so many staff." },
          { speaker: "Woman", text: "True. At least the meeting spaces are excellent." },
        ],
        profile: {
          level: "B2",
          words: 74,
          focus: "Separating individual preferences from a shared opinion",
          distractors: "Only one speaker fully approves of the terrace and kitchen.",
        },
        explanation:
          "The man likes the terrace but the woman finds it too windy. The woman likes the kitchen but the man finds it too small. Both clearly approve of the meeting rooms.",
      },
      {
        id: "exhibition-display",
        context: "A student and a teacher are discussing an exhibition display.",
        prompt: "Which part needs improving?",
        kind: "pictures",
        answer: 2,
        ...audioSources("b2", 4),
        options: pictureOptions("b2", 4, ["the photographs", "the timeline", "the information labels"]),
        reviewEvidence: [
          {
            option: 0,
            quote: "The photographs are excellent",
            note: "The student worries about the photographs, but the teacher approves them.",
          },
          {
            option: 1,
            quote: "The timeline is also easy to follow, and the dates are all correct.",
            note: "The timeline is explicitly described as a strength.",
          },
          {
            option: 2,
            quote: "The labels beside the objects are the weak point.",
            note: "The labels are inconsistent and may be too small for visitors to read.",
          },
        ],
        script: [
          { speaker: "Man", text: "Your exhibition display is nearly ready. The photographs are excellent, especially the ones showing how the town changed." },
          { speaker: "Woman", text: "I was worried they were too dark." },
          { speaker: "Man", text: "No, they’re fine. The timeline is also easy to follow, and the dates are all correct. The labels beside the objects are the weak point. Some are much smaller than others, and visitors may not be able to read them." },
          { speaker: "Woman", text: "I’ll print a new set tonight." },
          { speaker: "Man", text: "Good. Then the display should be ready." },
        ],
        profile: {
          level: "B2",
          words: 78,
          focus: "Distinguishing a dismissed concern, confirmed strength, and weakness",
          distractors: "The teacher approves both the photographs and the timeline.",
        },
        explanation:
          "The photographs are approved and the timeline is clear and accurate. The labels are difficult to read and must be replaced.",
      },
      {
        id: "office-supplies",
        context: "A woman is going to an office-supply shop.",
        prompt: "What should she buy?",
        kind: "pictures",
        answer: 1,
        ...audioSources("b2", 5),
        options: pictureOptions("b2", 5, [
          "printer paper and envelopes",
          "envelopes and printer ink",
          "printer paper and printer ink",
        ]),
        reviewEvidence: [
          {
            option: 0,
            quote: "A new box is being delivered tomorrow morning.",
            note: "Paper is needed, but it will arrive separately and should not be bought today.",
          },
          {
            option: 1,
            quote: "envelopes and ink today.",
            note: "The woman summarises the exact pair she must buy, and the man confirms it.",
          },
          {
            option: 2,
            quote: "Do we need printer paper?",
            note: "Paper is discussed, but the delivery means it is not part of today’s purchase.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I’m going to the office-supply shop. Do we need printer paper?" },
          { speaker: "Man", text: "Not today. A new box is being delivered tomorrow morning." },
          { speaker: "Woman", text: "What about envelopes? I used nearly all the large ones for the invitations." },
          { speaker: "Man", text: "Yes, get another packet. And the printer’s ink warning came on this afternoon, so we need a cartridge too." },
          { speaker: "Woman", text: "Right. Paper tomorrow, but envelopes and ink today." },
          { speaker: "Man", text: "Exactly. Keep the receipt, because the office will pay you back." },
        ],
        profile: {
          level: "B2",
          words: 72,
          focus: "Updating a two-item set from details across the recording",
          distractors: "Both wrong options include paper, which is needed but already arriving tomorrow.",
        },
        explanation:
          "Paper will be delivered tomorrow, so it should not be bought today. The woman needs to buy both envelopes and printer ink.",
      },
    ],
  },
];

export function getGeneralListeningPart1Set(setId = "a2-set-1") {
  return generalListeningPart1Sets.find((set) => set.id === setId) || generalListeningPart1Sets[0];
}
