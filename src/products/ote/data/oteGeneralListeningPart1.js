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
    instructionAudioReady: true,
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
    assetsReady: true,
    audioReady: true,
    instructionAudioReady: true,
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
            quote: "Then let’s stick with what you said at the start. He takes his camera everywhere, after all.",
            note: "“What you said at the start” refers back to the camera case, while his regular camera use confirms that it is suitable.",
          },
          {
            option: 1,
            quote: "He hardly ever cooks.",
            note: "The cookbook is unsuitable because Uncle Ben rarely cooks.",
          },
          {
            option: 2,
            quote: "he already owns a much better pair.",
            note: "The headphones are unnecessary because he already owns a better pair.",
          },
        ],
        script: [
          { speaker: "Man", text: "We still need something for Uncle Ben. His camera case is almost falling apart, so that might be useful." },
          { speaker: "Woman", text: "I saw a cookbook he might like." },
          { speaker: "Man", text: "He hardly ever cooks. These headphones are good, but he already owns a much better pair." },
          { speaker: "Woman", text: "Then let’s stick with what you said at the start. He takes his camera everywhere, after all." },
          { speaker: "Man", text: "Fine. I’ll see whether they have one in brown." },
        ],
        profile: {
          level: "B1",
          words: 68,
          focus: "Resolving backward references to an earlier suggestion",
          distractors: "The cookbook and headphones are considered but rejected before the speakers refer back to the original idea.",
        },
        explanation:
          "The cookbook is unsuitable because Uncle Ben rarely cooks, and he already owns better headphones. “What you said at the start” refers back to the camera case, which is useful because he takes his camera everywhere.",
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
            quote: "I was going to cycle, but the back tyre is flat again.",
            note: "Cycling was the original plan, but the bicycle cannot be used.",
          },
          {
            option: 1,
            quote: "Leo’s passing the college on his way to work and says there’s room for me, so I’ll go with him.",
            note: "The available space and the offer to travel with Leo imply that she will go in his car.",
          },
          {
            option: 2,
            quote: "I may come home by bus",
            note: "The bus is a genuine travel plan, but it is for the return journey.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Hi, Dad. I’m just leaving for my evening class. I was going to cycle, but the back tyre is flat again. Leo’s passing the college on his way to work and says there’s room for me, so I’ll go with him. I may come home by bus because he won’t finish until midnight. Anyway, you don’t need to collect me.",
          },
        ],
        profile: {
          level: "B1",
          words: 60,
          focus: "Inferring a transport method while distinguishing outward and return journeys",
          distractors: "The bicycle is unavailable, while the bus is mentioned only as a possible journey home.",
        },
        explanation:
          "The bicycle cannot be used because of the flat tyre. Leo is passing the college and has room for her, so she will travel with him in his car. The bus is only a possible journey home.",
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
            quote: "So you’ll need one with more space.",
            note: "“One” refers back to the card whose limited capacity is insufficient for the number of photographs expected.",
          },
          {
            option: 1,
            quote: "Marta’s lending me hers.",
            note: "She needs a camera, but she will borrow one rather than buy it.",
          },
          {
            option: 2,
            quote: "the college has one for every student.",
            note: "The college supplies the tripod.",
          },
        ],
        script: [
          { speaker: "Man", text: "Have you got everything for Saturday’s photography course?" },
          { speaker: "Woman", text: "Nearly. The card I’ve got only holds about two hundred pictures, and the teacher says we could take twice that many." },
          { speaker: "Man", text: "So you’ll need one with more space. What about the camera?" },
          { speaker: "Woman", text: "Marta’s lending me hers. I was also going to bring our tripod, but apparently the college has one for every student." },
          { speaker: "Man", text: "Good. You’d better visit the shop today, then." },
        ],
        profile: {
          level: "B1",
          words: 69,
          focus: "Resolving reference while separating equipment that is bought, borrowed, and provided",
          distractors: "The camera is borrowed and the tripod is provided by the college.",
        },
        explanation:
          "The existing card cannot hold enough photographs, so “one with more space” means a larger memory card must be bought. The camera will be borrowed and the college supplies the tripod.",
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
            quote: "That was the plan, but Chloe has taken over.",
            note: "Selling tickets was the original role, but Chloe will now do it.",
          },
          {
            option: 1,
            quote: "The person who was supposed to photograph the event is ill, and they asked whether I could cover for her.",
            note: "Covering for the absent event photographer means that the woman will take the photographs.",
          },
          {
            option: 2,
            quote: "they already have enough people serving drinks and sandwiches.",
            note: "She offers to help with food, but that role is already fully staffed.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I’m helping at the community festival on Sunday." },
          { speaker: "Man", text: "I thought you were selling tickets at the entrance." },
          { speaker: "Woman", text: "That was the plan, but Chloe has taken over. The person who was supposed to photograph the event is ill, and they asked whether I could cover for her." },
          { speaker: "Man", text: "That sounds more interesting." },
          { speaker: "Woman", text: "Definitely. I also offered to help at the food tent, but they already have enough people serving drinks and sandwiches." },
        ],
        profile: {
          level: "B1",
          words: 70,
          focus: "Following an original role, replacement role, and rejected offer",
          distractors: "Ticket sales were reassigned to someone else, while the food tent already has enough volunteers.",
        },
        explanation:
          "Chloe has taken over the ticket role, and the food tent does not need another volunteer. The woman has been asked to cover for the absent event photographer, so she will take photographs.",
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
          words: 65,
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
    assetsReady: true,
    audioReady: false,
    instructionAudioReady: true,
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
            quote: "I thought my red case would be fine, but after putting everything in it, it’s already over the airline limit",
            note: "The full-sized red case has enough space, but it is already too heavy before the woman finishes packing.",
          },
          {
            option: 1,
            quote: "Not unless I replace the handle, and there’s no time now.",
            note: "The cabin case is ruled out because its broken handle cannot be replaced before the trip.",
          },
          {
            option: 2,
            quote: "It’s full-sized like the red one, but it’s navy and weighs almost two kilos less.",
            note: "The sister’s case combines the required capacity with a lower weight. “Navy” identifies the blue suitcase in the picture.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I thought my red case would be fine, but after putting everything in it, it’s already over the airline limit—and that’s before I add my shoes." },
          { speaker: "Man", text: "Couldn’t you manage with the cabin case?" },
          { speaker: "Woman", text: "Not unless I replace the handle, and there’s no time now. My sister’s offered me hers. It’s full-sized like the red one, but it’s navy and weighs almost two kilos less." },
          { speaker: "Man", text: "Problem solved, then." },
          { speaker: "Woman", text: "Looks that way. I’ll collect it after work." },
        ],
        profile: {
          level: "B2",
          words: 76,
          focus: "Combining size, colour, weight, and condition",
          distractors: "The listener must distinguish the overweight full-sized red case from the unusable red cabin case.",
        },
        explanation:
          "The woman’s red case is over the weight limit, and the cabin case has a broken handle. Her sister’s navy case is full-sized but considerably lighter, so that is the one she will collect.",
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
            quote: "Hang on—the collection desk shuts at four, doesn’t it? It’s nearly twenty to four.",
            note: "The imminent closing time makes collecting the parcel the urgent first task.",
          },
          {
            option: 1,
            quote: "The shops are open all evening",
            note: "Shopping can be postponed because there is no immediate closing-time pressure.",
          },
          {
            option: 2,
            quote: "We can take the dog on the way back and shop afterwards.",
            note: "The dog walk is placed on the return journey, after the first errand.",
          },
        ],
        script: [
          { speaker: "Man", text: "We’ve still got to deal with the parcel, get something for dinner and take Bruno out." },
          { speaker: "Woman", text: "The supermarket will be packed later, so perhaps—" },
          { speaker: "Man", text: "Hang on—the collection desk shuts at four, doesn’t it? It’s nearly twenty to four." },
          { speaker: "Woman", text: "You’re right. The shops are open all evening, and Bruno can wait another half hour." },
          { speaker: "Man", text: "I’ll bring up the message with the collection number while you get your coat." },
          { speaker: "Woman", text: "Fine. We can take the dog on the way back and shop afterwards." },
        ],
        profile: {
          level: "B2",
          words: 81,
          focus: "Following a revised sequence of three genuine tasks",
          distractors: "The supermarket is initially considered, but its opening hours remove the urgency; the dog walk is deferred until the return journey.",
        },
        explanation:
          "The collection desk is about to close, while the shops remain open and the dog can wait. The collection message and their departure preparations show that the parcel is the first task.",
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
            quote: "Great view, yes, though the wind made it hard to stay out there.",
            note: "The terrace is impressive, but the wind qualifies the positive reaction.",
          },
          {
            option: 1,
            quote: "That was the best part for me too. We’ll get plenty of use out of them.",
            note: "The man’s agreement shows that both speakers particularly liked the rooms used for group discussions.",
          },
          {
            option: 2,
            quote: "Stylish, but tiny. Imagine everyone trying to make coffee at once.",
            note: "The kitchen’s appearance is praised, but its limited size prevents a fully shared positive judgement.",
          },
        ],
        script: [
          { speaker: "Woman", text: "The terrace looked impressive in the photographs." },
          { speaker: "Man", text: "Great view, yes, though the wind made it hard to stay out there." },
          { speaker: "Woman", text: "I was more taken with the rooms set aside for group discussions. You couldn’t hear anything from the corridor, and the screens were far clearer than our old ones." },
          { speaker: "Man", text: "That was the best part for me too. We’ll get plenty of use out of them." },
          { speaker: "Woman", text: "The kitchen was stylish as well." },
          { speaker: "Man", text: "Stylish, but tiny. Imagine everyone trying to make coffee at once." },
        ],
        profile: {
          level: "B2",
          words: 82,
          focus: "Separating individual preferences from a shared opinion",
          distractors: "Both alternative spaces attract praise, but each is subsequently qualified rather than endorsed by both speakers.",
        },
        explanation:
          "The terrace is too windy and the kitchen is considered too small. The woman is particularly impressed by the rooms for group discussions, and the man identifies them as his favourite feature too.",
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
            quote: "The old photographs have reproduced nicely; I was worried they’d lose detail.",
            note: "The photographs are explicitly evaluated as a successful part of the display.",
          },
          {
            option: 1,
            quote: "They lead visitors through the story clearly.",
            note: "The dates along the wall—the timeline—are described as clear and effective.",
          },
          {
            option: 2,
            quote: "What may cause trouble is the material beside the objects.",
            note: "The material beside the objects refers to the information labels, whose inconsistent size makes some difficult to read.",
          },
        ],
        script: [
          { speaker: "Man", text: "The display’s coming together well. The old photographs have reproduced nicely; I was worried they’d lose detail." },
          { speaker: "Woman", text: "And the dates along the wall?" },
          { speaker: "Man", text: "They lead visitors through the story clearly. What may cause trouble is the material beside the objects. Some of it can be read from a normal distance, but for other pieces you’d almost have to put your face against the glass." },
          { speaker: "Woman", text: "I used two different printers." },
          { speaker: "Man", text: "That explains it. Make those consistent and I think you’re done." },
        ],
        profile: {
          level: "B2",
          words: 80,
          focus: "Inferring the problematic display element from its position and effect on visitors",
          distractors: "The photographs and timeline are approved through natural comments about reproduction quality and clarity.",
        },
        explanation:
          "The photographs have reproduced well and the dates form a clear timeline. The material beside the objects is inconsistently printed and sometimes unreadable from a normal distance, so the information labels need improving.",
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
            quote: "I thought we’d run out of paper, but the delivery email says the box is coming first thing tomorrow.",
            note: "Paper initially appears necessary, but the scheduled delivery removes it from today’s shopping list.",
          },
          {
            option: 1,
            quote: "That won’t see us through the week, then. Oh, and the printer started flashing its warning light this afternoon. The colour’s beginning to look faint too.",
            note: "The first comment confirms that more envelopes are needed; the warning light and faint colour indicate that printer ink is also required.",
          },
          {
            option: 2,
            quote: "I thought we’d run out of paper, but the delivery email says the box is coming first thing tomorrow.",
            note: "Although ink is needed, paper should not be bought because a new box is arriving the following morning.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I’m going past the office-supply shop. Is there anything we’re short of?" },
          { speaker: "Man", text: "I thought we’d run out of paper, but the delivery email says the box is coming first thing tomorrow." },
          { speaker: "Woman", text: "Good. I used nearly all the large envelopes for those invitations." },
          { speaker: "Man", text: "That won’t see us through the week, then. Oh, and the printer started flashing its warning light this afternoon. The colour’s beginning to look faint too." },
          { speaker: "Woman", text: "Already? I changed the cartridge last month." },
          { speaker: "Man", text: "We’ve printed a lot since then." },
          { speaker: "Woman", text: "True. I’ll keep the receipt." },
        ],
        profile: {
          level: "B2",
          words: 86,
          focus: "Updating a two-item set from details across the recording",
          distractors: "Both wrong options retain paper after the delivery information has removed it from the immediate purchase.",
        },
        explanation:
          "Paper is arriving the following morning. The depleted envelope supply and the printer’s warning light, faint colour and cartridge reference show that the woman should buy envelopes and printer ink.",
      },
    ],
  },
];

export function getGeneralListeningPart1Set(setId = "a2-set-1") {
  return generalListeningPart1Sets.find((set) => set.id === setId) || generalListeningPart1Sets[0];
}
