export const PRACTICE_SETS = [
  {
    id: "set-1",
    title: "Public Transportation and Dinner Plans",
    description: "A polite lost-property message and a friendly dinner reply.",
    tasks: [
      {
        id: "set-1-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Lost Laptop on a Bus",
        audience: "Customer service manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set1-message1.mp3",
        lead:
          "You left your laptop on a city bus this morning on your way to work. Leave a voicemail message for the customer service manager at the bus company.",
        bullets: [
          "say who you are and what time you were traveling",
          "describe your laptop and where you think you left it",
          "ask how you can find out if someone turned it in",
        ],
      },
      {
        id: "set-1-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Dinner Plans",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set1-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/tom.mp3",
        lead:
          "Listen to a message from your friend about cooking dinner tonight. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hey, it's Tom. I know we were planning to order food tonight, but I've decided to cook a huge Mexican dinner at my place instead! I'm planning to make it really spicy. Let me know if that sounds good to you or if you have any issues with that, OK? See ya!",
        bullets: [
          "accept your friend's invitation for dinner",
          "explain why you cannot eat spicy food",
          "suggest something sweet to bring for dessert",
        ],
      },
    ],
  },
  {
    id: "set-2",
    title: "Language Schools and Weekend Sports",
    description: "A polite class-change message and a friendly sports-plan reply.",
    tasks: [
      {
        id: "set-2-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Change an Evening Class",
        audience: "School admissions coordinator",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set2-message1.mp3",
        lead:
          "You are taking an evening English course, but you need to change your class from Tuesday to Thursday. Leave a voicemail message for the school admissions coordinator.",
        bullets: [
          "say who you are and give the name of your current class",
          "explain why your work schedule has changed",
          "ask if there is a free space for you in the Thursday group",
        ],
      },
      {
        id: "set-2-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Weekend Sports",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set2-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/sarah.mp3",
        lead:
          "Listen to a message from your friend about a sports activity this weekend. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Sarah. A few of us are planning to go down to the park this Saturday morning around nine to play a few games of tennis. I know you've been wanting to play lately, so do you fancy joining us? Give me a call back when you can. Bye!",
        bullets: [
          "say why you cannot play tennis on Saturday morning",
          "ask some questions about the weather forecast",
          "suggest a different day or time to play",
        ],
      },
    ],
  },
  {
    id: "set-3",
    title: "Music Shops and Concert Tickets",
    description: "A polite product-damage message and a friendly ticket reply.",
    tasks: [
      {
        id: "set-3-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Broken Guitar Strings",
        audience: "Shop manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set3-message1.mp3",
        lead:
          "You recently bought a guitar from an online shop, but when it arrived, the strings were broken. Leave a voicemail message for the shop manager.",
        bullets: [
          "say who you are and when you ordered the item",
          "describe the damage to the item when you opened it",
          "ask how you can return it for a replacement or a refund",
        ],
      },
      {
        id: "set-3-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Concert Tickets",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set3-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/jack.mp3",
        lead:
          "Listen to a message from your friend about concert tickets. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hey, Jack here. Listen, I'm looking at the ticket website right now for that rock concert next month. The front-row seats are still available, but they are quite expensive at eighty pounds each. Do you want me to book them right now before they sell out? Let me know. Bye.",
        bullets: [
          "thank your friend for finding the tickets",
          "explain why you cannot afford the expensive seats",
          "suggest a cheaper seating option or a different event",
        ],
      },
    ],
  },
  {
    id: "set-4",
    title: "Community Gyms and Study Sessions",
    description: "A polite class-list problem message and a friendly study reply.",
    tasks: [
      {
        id: "set-4-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Missing from the Class List",
        audience: "Sports centre coordinator",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set4-message1.mp3",
        lead:
          "You signed up for a swimming class at a local sports center, but your name is missing from the student attendance list. Leave a voicemail message for the sports center coordinator.",
        bullets: [
          "say who you are and which day your class is on",
          "explain the error you saw on the notice board today",
          "ask how they can correct the problem before the class starts",
        ],
      },
      {
        id: "set-4-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Study Session",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set4-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/amy.mp3",
        lead:
          "Listen to a message from your friend about preparing for a test. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Amy. Look, I'm getting a bit stressed about our final history exam next week. I thought we could meet up at the high street cafe tomorrow afternoon to go over our notes together. Let me know if that works for you or if you have a better idea. Speak soon!",
        bullets: [
          "tell your friend why you are also worried about the test",
          "explain why you prefer studying at the library instead of a cafe",
          "suggest a specific day and time to meet up",
        ],
      },
    ],
  },
  {
    id: "set-5",
    title: "Holiday Bookings and Birthday Parties",
    description: "A polite booking-change message and a friendly party-planning reply.",
    tasks: [
      {
        id: "set-5-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Change a Hotel Check-in Date",
        audience: "Hotel reception manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set5-message1.mp3",
        lead:
          "You recently booked a weekend stay at a hotel online. However, you need to change your check-in date to one day later. Leave a voicemail message for the hotel reception manager.",
        bullets: [
          "say who you are and when you are supposed to arrive",
          "explain why you have to delay your trip by one day",
          "ask if it is possible to change your reservation without a fee",
        ],
      },
      {
        id: "set-5-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Joint Birthday Party",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set5-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/sam.mp3",
        lead:
          "Listen to a message from your friend about a joint birthday party next month. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Sam. We said we were going to discuss the best place for our joint birthday party next month. I think the Italian restaurant on the High Street would be perfect. Let me know what you think about that or where you'd like to go, OK? Thanks.",
        bullets: [
          "thank your friend for thinking of a venue",
          "explain why you do not want to have the party at a restaurant",
          "say which place you prefer for the party and why",
        ],
      },
    ],
  },
];

export const ADVANCED_PRACTICE_SETS = [
  {
    id: "advanced-set-1",
    title: "Tutor Assignment Request",
    description: "Diplomatically respond to a tutor who wants to share your assignment.",
    tasks: [
      {
        id: "advanced-set-1-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Assignment Example",
        audience: "Tutor",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-1-message.mp3",
        lead:
          "You study at college. Your tutor, Dr Evans, has asked for permission to show your recent assignment to other students as an example. Your tutor would like to use it in next week's class. The assignment contains some personal information, so you do not want the current version to be shared. Leave a voice message for your tutor and:",
        bullets: [
          "thank her for choosing your work",
          "explain your concern",
          "suggest a possible solution",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-2",
    title: "Study Room Meeting",
    description: "Ask another student to move a meeting without creating conflict.",
    tasks: [
      {
        id: "advanced-set-2-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Silent Study Room",
        audience: "Student society organiser",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-2-message.mp3",
        lead:
          "You study at college. A student you know, Maya, has arranged a society meeting in a study room tomorrow. You have discovered that the room is reserved for silent study, and the meeting may disturb other students. The college has recently received complaints about noise in this area. Leave a voice message for Maya and:",
        bullets: [
          "explain why you are calling",
          "ask her to change the location",
          "suggest a suitable alternative",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-3",
    title: "Short-notice Saturday Shift",
    description: "Respond tactfully to a manager about a difficult schedule change.",
    tasks: [
      {
        id: "advanced-set-3-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Saturday Work Request",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-3-message.mp3",
        lead:
          "You work for a company. Your manager, Karen Willis, has changed your work schedule at short notice and asked you to work on Saturday. The change was made because several employees are ill during a particularly busy week. You have an important personal commitment that day. Leave a voice message for your manager and:",
        bullets: [
          "acknowledge why the company needs extra staff",
          "explain why Saturday is difficult for you",
          "suggest a compromise",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-4",
    title: "Client Report Figures",
    description: "Ask a colleague to delay a report because figures may be inaccurate.",
    tasks: [
      {
        id: "advanced-set-4-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Report Accuracy Concern",
        audience: "Colleague",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-4-message.mp3",
        lead:
          "You work for a company. Your colleague, Marcus, plans to send a report to a client this afternoon. You have noticed that some of the cost figures may be inaccurate, but Marcus believes the report should be sent immediately. The information could influence the client's decision. Leave a voice message for Marcus and:",
        bullets: [
          "explain why you are concerned",
          "ask him to delay sending the report",
          "suggest how you can check it quickly",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-5",
    title: "Training a New Employee",
    description: "Suggest a practical arrangement when two work responsibilities conflict.",
    tasks: [
      {
        id: "advanced-set-5-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Training Schedule",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-5-message.mp3",
        lead:
          "You work for a company. Your manager, Ms Patel, has asked you to train a new employee throughout next week. You are willing to help, but you also have an urgent project to finish by Friday. No other experienced employee is available for the whole week. Leave a voice message for your manager and:",
        bullets: [
          "show that you understand the importance of the training",
          "explain your difficulty",
          "suggest a different arrangement",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-6",
    title: "Incorrect Price Estimate",
    description: "Take responsibility for an incorrect customer estimate and help resolve it.",
    tasks: [
      {
        id: "advanced-set-6-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Incorrect Price Estimate",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-6-message.mp3",
        lead:
          "You work for a company. You sent a price estimate to a customer this morning. You have now realised that you used an old price list and the estimate is too low. The customer has replied to accept it. Your manager, Paula, is meeting the customer today. Leave a voice message for Paula and:",
        bullets: [
          "explain the mistake",
          "recommend how Paula should handle the meeting",
          "offer to help resolve the situation",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-7",
    title: "An Unfair Performance Review",
    description: "Explain why you cannot assess a colleague fairly and suggest better evidence.",
    tasks: [
      {
        id: "advanced-set-7-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "An Unfair Performance Review",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-7-message.mp3",
        lead:
          "You work for a company. Your manager, Louise, has asked you to write a performance review for a new colleague by tomorrow morning. You have only worked directly with him twice, but Louise needs the review before deciding whether to extend his contract. Leave a voice message for Louise and:",
        bullets: [
          "explain why you cannot complete the review fairly",
          "say why using it could be risky",
          "suggest another source of feedback",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-8",
    title: "Choosing Student Speakers",
    description: "Challenge a public vote and recommend a fairer selection method.",
    tasks: [
      {
        id: "advanced-set-8-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Choosing Student Speakers",
        audience: "Class representative",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-8-message.mp3",
        lead:
          "You study at college. Your class representative, Alex, wants to choose speakers for an important college event by asking students to vote publicly in class. Alex thinks this will produce a quick decision, but several interested students are shy and less well known. Leave a voice message for Alex and:",
        bullets: [
          "give your opinion of the plan",
          "explain how the vote could affect some students",
          "recommend a fairer selection method instead",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-9",
    title: "A Strongly Worded Complaint",
    description: "Support a serious complaint while recommending a fairer, evidence-based message.",
    tasks: [
      {
        id: "advanced-set-9-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "A Strongly Worded Complaint",
        audience: "Coursemate",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-9-message.mp3",
        lead:
          "You study at college. Your coursemate, Priya, has written a complaint about a lecturer and plans to send it. You agree that the problem she describes is serious, but the message makes personal claims about the lecturer without giving any evidence. Leave a voice message for Priya and:",
        bullets: [
          "say which part of the complaint you support",
          "explain the risk of including personal claims",
          "recommend how Priya should revise the message",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-10",
    title: "Contacting Colleagues on Leave",
    description: "Balance an urgent customer problem against colleagues' agreed time off.",
    tasks: [
      {
        id: "advanced-set-10-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Contacting Colleagues on Leave",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-10-message.mp3",
        lead:
          "You work for a company. Your manager, Victor, wants you to contact colleagues on annual leave because they know how to solve a customer problem. The customer expects an answer today, but the colleagues had been promised they would not be disturbed. Leave a voice message for Victor and:",
        bullets: [
          "tell Victor whether you will contact them",
          "explain the reasons for your decision",
          "suggest what Victor could tell the customer instead",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
];

