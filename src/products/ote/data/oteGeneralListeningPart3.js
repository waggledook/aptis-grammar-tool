const speakers = [
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "both", label: "Both" },
];

const preparationPrompt = "The clock shows how much time you have to look at the task.";

export const generalListeningPart3Sets = [
  {
    id: "a2-sports-centre",
    level: "A2",
    title: "A New Sports Centre",
    description:
      "Match five opinions about a visit to a new sports centre to the woman, the man, or both speakers.",
    assetsReady: true,
    practiceReady: false,
    audioReady: false,
    audioSrc: "/audio/ote/listening/general/part-3/a2-sports-centre/discussion.mp3",
    instructionAudioReady: false,
    instructionAudioSrc: "/audio/ote/listening/general/part-3/a2-sports-centre/question.mp3",
    instructions:
      "Listen to a man and a woman talking about a new sports centre. Match the people—the woman, the man or both—to the opinions below. The first one has been done for you.",
    preparationPrompt,
    preparationSeconds: 30,
    speakers,
    example: {
      id: "finding-the-centre",
      text: "Finding the sports centre was difficult.",
      answer: "woman",
    },
    opinions: [
      {
        id: "pool-too-busy",
        text: "The swimming pool was too busy.",
        answer: "both",
        review: {
          explanation:
            "The woman says there were far too many people, and the man agrees that he could hardly swim properly.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "there were far too many people",
              note: "She directly describes the pool as overcrowded.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "I agree. I could hardly swim a full length without stopping.",
              note: "He shares her opinion and explains how the crowd affected him.",
            },
          ],
        },
      },
      {
        id: "changing-rooms-clean",
        text: "The changing rooms were clean.",
        answer: "man",
        review: {
          explanation:
            "Only the man used the changing rooms and describes them as bright and tidy. The woman changed at home.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "They were bright and tidy",
              note: "Tidy paraphrases the opinion that the rooms were clean.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "I changed at home, so I didn’t see them.",
              note: "She cannot express an opinion because she did not use the changing rooms.",
            },
          ],
        },
      },
      {
        id: "food-and-drink-expensive",
        text: "Food and drink cost too much.",
        answer: "woman",
        review: {
          explanation:
            "The woman considers the café expensive. The man disagrees and says his sandwich was quite cheap.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "The prices were much higher than at the old centre, and the cakes were expensive too.",
              note: "She clearly thinks the café prices are too high.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I thought they were normal. My sandwich was quite cheap, actually",
              note: "He expresses the opposite opinion about the prices.",
            },
          ],
        },
      },
      {
        id: "staff-helpful",
        text: "The people working there were helpful.",
        answer: "both",
        review: {
          explanation:
            "The woman describes help from the receptionist, while the man describes help from the lifeguard.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "the receptionist was helpful when I asked about the exercise classes",
              note: "The receptionist gives her useful information and advice.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "the lifeguard found my lost towel and brought it to me",
              note: "The lifeguard’s action supports the same general opinion about the staff.",
            },
          ],
        },
      },
      {
        id: "better-during-week",
        text: "It would be better to go during the week.",
        answer: "man",
        review: {
          explanation:
            "The man proposes returning on a weekday because it would be quieter. The woman remains uncertain and prefers the old centre.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "A weekday afternoon would be quieter, and we might be able to use the pool properly.",
              note: "He gives a clear reason why a weekday visit would be better.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "Maybe. I think I’ll keep using the old centre for now.",
              note: "She does not adopt his plan and instead chooses the old centre.",
            },
          ],
        },
      },
    ],
    script: [
      { speaker: "Man", text: "Hi, Emma. What did you think of the new sports centre yesterday?" },
      {
        speaker: "Woman",
        text: "Once I found it, I enjoyed the afternoon. The signs from the bus stop were terrible. I walked past the entrance twice.",
      },
      { speaker: "Man", text: "Really? I used the map on the website, so I had no problem." },
      {
        speaker: "Woman",
        text: "The swimming pool looked nice, but there were far too many people. There was a children’s class at one end and hardly any space for everyone else.",
      },
      {
        speaker: "Man",
        text: "I agree. I could hardly swim a full length without stopping. Saturday afternoon probably wasn’t the best time to go.",
      },
      { speaker: "Woman", text: "Did you use the changing rooms?" },
      {
        speaker: "Man",
        text: "Yes. They were bright and tidy, and there were plenty of lockers. The showers were warm too.",
      },
      { speaker: "Woman", text: "I changed at home, so I didn’t see them." },
      { speaker: "Man", text: "What about the café?" },
      {
        speaker: "Woman",
        text: "I only bought a drink. The prices were much higher than at the old centre, and the cakes were expensive too.",
      },
      {
        speaker: "Man",
        text: "I thought they were normal. My sandwich was quite cheap, actually, and it was good.",
      },
      {
        speaker: "Woman",
        text: "At least the receptionist was helpful when I asked about the exercise classes. She showed me the timetable and explained which class was best for beginners.",
      },
      {
        speaker: "Man",
        text: "Yes, and the lifeguard found my lost towel and brought it to me. Everyone working there seemed friendly.",
      },
      { speaker: "Woman", text: "That’s good. Would you go again?" },
      {
        speaker: "Man",
        text: "Definitely, but not on a Saturday. A weekday afternoon would be quieter, and we might be able to use the pool properly.",
      },
      {
        speaker: "Woman",
        text: "Maybe. I think I’ll keep using the old centre for now. It’s smaller, but it feels less busy.",
      },
    ],
  },
  {
    id: "b1-community-arts-centre",
    level: "B1",
    title: "A New Community Arts Centre",
    description:
      "Match five opinions about a community arts centre to the woman, the man, or both speakers.",
    assetsReady: true,
    audioReady: true,
    audioSrc: "/audio/ote/listening/general/part-3/b1-community-arts-centre/discussion.mp3",
    instructionAudioReady: true,
    instructionAudioSrc: "/audio/ote/listening/general/part-3/b1-community-arts-centre/question.mp3",
    instructions:
      "Listen to a man and a woman talking about a new community arts centre. Match the people—the woman, the man or both—to the opinions below. The first one has been done for you.",
    preparationPrompt,
    preparationSeconds: 30,
    speakers,
    example: {
      id: "convenient-location",
      text: "The centre is in a convenient location.",
      answer: "both",
    },
    opinions: [
      {
        id: "building-confusing",
        text: "It is difficult to find your way around the building.",
        answer: "woman",
        review: {
          explanation:
            "The woman found the building confusing and got lost. The man says the entrance map was clear.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "I found the building rather confusing.",
              note: "She states the opinion directly and then gives an example.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "The map near the entrance seemed clear enough to me.",
              note: "He did not experience the same difficulty.",
            },
          ],
        },
      },
      {
        id: "drawing-course-value",
        text: "The drawing course offers good value for money.",
        answer: "man",
        review: {
          explanation:
            "The man considers ten euros per lesson fair. The woman thinks the total cost is too high once materials are included.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "It works out at ten euros a lesson, which I think is quite fair.",
              note: "He gives a positive judgement of the course price.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "Altogether, it costs more than I’d be willing to pay.",
              note: "She rejects the course as poor value for her once all costs are considered.",
            },
          ],
        },
      },
      {
        id: "cafe-pleasant",
        text: "The café is a pleasant place to spend time.",
        answer: "both",
        review: {
          explanation:
            "The woman praises the comfortable, sociable café, and the man enjoyed it enough to stay much longer than planned.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "It’s much nicer than I expected. The chairs are comfortable",
              note: "She explicitly gives a positive opinion of the café.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "I liked it too. I only planned to have a quick coffee, but I ended up staying for nearly an hour.",
              note: "His extended visit supports the same positive opinion.",
            },
          ],
        },
      },
      {
        id: "more-for-teenagers",
        text: "The centre should offer more activities for teenagers.",
        answer: "woman",
        review: {
          explanation:
            "The woman thinks the programme lacks activities for teenagers. The man does not think the centre needs to serve every age group.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "there isn’t much for teenagers",
              note: "She identifies a gap in the centre’s programme.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I’m not sure the arts centre has to provide something for every age group.",
              note: "He questions whether the centre needs to add those activities.",
            },
          ],
        },
      },
      {
        id: "publicity-needs-improving",
        text: "The centre needs to improve how it tells people about events.",
        answer: "man",
        review: {
          explanation:
            "The man complains that events are announced too late and proposes better publicity. The woman is satisfied with the website.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "They only mentioned it online the day before. That’s not enough time for people to make plans.",
              note: "His complaint implies that the centre’s event publicity is inadequate.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "They should put the full programme in the local newspaper or send out a monthly email.",
              note: "His proposed solutions reinforce that opinion.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "I usually check their website, so I haven’t really had a problem.",
              note: "She does not share his dissatisfaction.",
            },
          ],
        },
      },
    ],
    script: [
      { speaker: "Man", text: "Have you been to the new community arts centre yet?" },
      {
        speaker: "Woman",
        text: "Yes, I went on Saturday. I like where they’ve put it. It’s right in the centre of town, and there’s a bus stop almost outside.",
      },
      { speaker: "Man", text: "That was a sensible choice. I walked there from the station in less than ten minutes." },
      {
        speaker: "Woman",
        text: "Once I was inside, though, I found the building rather confusing. I wanted the photography room, but I went upstairs twice before I found it.",
      },
      {
        speaker: "Man",
        text: "I didn’t have that problem. The map near the entrance seemed clear enough to me. Maybe you missed it.",
      },
      { speaker: "Woman", text: "Maybe. Have you signed up for any classes?" },
      {
        speaker: "Man",
        text: "I’m doing a six-week drawing course. It works out at ten euros a lesson, which I think is quite fair.",
      },
      {
        speaker: "Woman",
        text: "Ten euros doesn’t sound much, but you have to buy your own materials as well. Altogether, it costs more than I’d be willing to pay. I’d rather try one of the free talks first.",
      },
      { speaker: "Man", text: "Did you go into the café?" },
      {
        speaker: "Woman",
        text: "Yes. It’s much nicer than I expected. The chairs are comfortable, and there were several groups of people sitting and chatting.",
      },
      {
        speaker: "Man",
        text: "I liked it too. I only planned to have a quick coffee, but I ended up staying for nearly an hour.",
      },
      {
        speaker: "Woman",
        text: "The programme seems good for adults and young children, but there isn’t much for teenagers. My niece looked through it and couldn’t find anything she wanted to do.",
      },
      {
        speaker: "Man",
        text: "There’s already a sports club for teenagers on the other side of town. I’m not sure the arts centre has to provide something for every age group.",
      },
      { speaker: "Woman", text: "Perhaps not. Were you at the music evening last Thursday?" },
      {
        speaker: "Man",
        text: "No, and I would have gone if I’d known about it. They only mentioned it online the day before. That’s not enough time for people to make plans.",
      },
      { speaker: "Woman", text: "There were posters in the building." },
      {
        speaker: "Man",
        text: "That only helps people who are already there. They should put the full programme in the local newspaper or send out a monthly email.",
      },
      { speaker: "Woman", text: "I usually check their website, so I haven’t really had a problem." },
    ],
  },
  {
    id: "b2-town-market",
    level: "B2",
    title: "Plans for the Town Market",
    description:
      "Match five opinions about plans for a town market to the woman, the man, or both speakers.",
    assetsReady: true,
    audioReady: true,
    audioSrc: "/audio/ote/listening/general/part-3/b2-town-market/discussion.mp3",
    instructionAudioReady: true,
    instructionAudioSrc: "/audio/ote/listening/general/part-3/b2-town-market/question.mp3",
    instructions:
      "Listen to a man and a woman discussing plans for a town market. Match the people—the woman, the man or both—to the opinions below. The first one has been done for you.",
    preparationPrompt,
    preparationSeconds: 30,
    speakers,
    example: {
      id: "market-needed-improvement",
      text: "The old market needed to be improved.",
      answer: "both",
    },
    opinions: [
      {
        id: "food-stalls-indoors",
        text: "Moving more food stalls indoors will improve the shopping experience.",
        answer: "woman",
        review: {
          explanation:
            "The woman believes indoor stalls will make customers more comfortable. The man accepts that some stalls will remain outside but retains his concern about losing the outdoor atmosphere.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "if people are more comfortable, they may stay longer and buy more",
              note: "She explains how moving stalls indoors could improve the experience.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I’ll miss the outdoor section. It gave the place some atmosphere.",
              note: "His overall reaction to moving stalls indoors remains negative.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "Fair enough.",
              note: "This concedes the factual correction that not every stall is moving, rather than adopting the woman’s overall opinion.",
            },
          ],
        },
      },
      {
        id: "later-hours-useful",
        text: "Later opening hours will be useful for people who work.",
        answer: "both",
        review: {
          explanation:
            "The man says the later closing time will help office workers, and the woman agrees that she would use the market after work.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "Keeping it open until eight on Thursdays makes sense.",
              note: "He supports the later opening hours after explaining the problem for office workers.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote: "I agree. I’d certainly use it after work.",
              note: "She explicitly shares his opinion.",
            },
          ],
        },
      },
      {
        id: "rent-unfair",
        text: "The rent increase is unfair to long-established traders.",
        answer: "man",
        review: {
          explanation:
            "The woman reports the traders’ complaint but partly justifies the rise. The man personally argues that established traders are being treated unfairly.",
          evidence: [
            {
              speaker: "Woman",
              type: "distractor",
              quote: "I can understand why they’re unhappy, but improved heating, storage and security all have to be paid for somehow.",
              note: "She acknowledges the complaint but offers a justification for the increase.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "Increasing their costs so sharply seems a poor way to reward them.",
              note: "He personally judges the treatment of long-established traders to be unfair.",
            },
          ],
        },
      },
      {
        id: "regular-live-music",
        text: "Live music should become a regular feature of the market.",
        answer: "woman",
        review: {
          explanation:
            "The woman supports the planned Saturday performances and suggests a workable format. The man finally prefers occasional rather than weekly music.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "I quite like the idea of local musicians performing near the café area.",
              note: "She supports the proposed Saturday entertainment.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote: "A singer or two could work well.",
              note: "She adapts the regular proposal to address the man’s practical concern.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I’d start with occasional performances rather than making it a weekly event.",
              note: "His final position rejects music as a regular weekly feature.",
            },
          ],
        },
      },
      {
        id: "advertising-new-visitors",
        text: "Advertising should try to attract people who do not usually visit.",
        answer: "both",
        review: {
          explanation:
            "The man wants promotion to reach neighbouring towns, while the woman suggests content aimed at people who normally shop elsewhere.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote: "They should promote it in neighbouring towns and give visitors another reason to come into the centre.",
              note: "He wants advertising to reach beyond the market’s existing customers.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote: "could interest people who normally use supermarkets",
              note: "She independently supports targeting people who do not currently use the market.",
            },
          ],
        },
      },
    ],
    script: [
      { speaker: "Man", text: "Have you seen the council’s plans for the old market?" },
      {
        speaker: "Woman",
        text: "Yes. Something had to be done. The roof leaked whenever it rained, and some of the entrances were so narrow that people with pushchairs struggled to get through.",
      },
      {
        speaker: "Man",
        text: "Exactly. I know some people liked its old-fashioned character, but there’s a difference between traditional and badly maintained.",
      },
      {
        speaker: "Woman",
        text: "I’m pleased they’re moving more of the food stalls indoors. Shopping for vegetables in the rain isn’t anyone’s idea of fun, and if people are more comfortable, they may stay longer and buy more.",
      },
      {
        speaker: "Man",
        text: "Perhaps, although I’ll miss the outdoor section. It gave the place some atmosphere. If every stall is inside, it could end up feeling like an ordinary shopping centre.",
      },
      { speaker: "Woman", text: "Not every stall is moving. There’ll still be some outside at weekends." },
      { speaker: "Man", text: "Fair enough." },
      { speaker: "Woman", text: "What do you think about the new opening hours?" },
      {
        speaker: "Man",
        text: "That’s probably the best part of the plan. At the moment, the market closes at four, so anyone working normal office hours can only go on Saturdays. Keeping it open until eight on Thursdays makes sense.",
      },
      {
        speaker: "Woman",
        text: "I agree. I’d certainly use it after work. Some traders are worried about having a longer day, but the council’s only suggesting a three-month trial. They can see whether enough customers actually come.",
      },
      { speaker: "Man", text: "The traders are more upset about the rent increase, aren’t they?" },
      {
        speaker: "Woman",
        text: "They are. Several have said a fifteen-percent rise is unreasonable, especially after months of building work. I can understand why they’re unhappy, but improved heating, storage and security all have to be paid for somehow.",
      },
      {
        speaker: "Man",
        text: "Even so, some of those families have been there for decades and helped make the market successful. Increasing their costs so sharply seems a poor way to reward them. New businesses may be able to afford it more easily than the people who kept the place going.",
      },
      {
        speaker: "Woman",
        text: "The plan also mentions entertainment on Saturday afternoons. I quite like the idea of local musicians performing near the café area.",
      },
      {
        speaker: "Man",
        text: "Yes, that could create a good atmosphere. Though, thinking about it, the building isn’t very large. Music, customers and people queuing for food might make it impossible to hear yourself think.",
      },
      { speaker: "Woman", text: "They wouldn’t need a full band. A singer or two could work well." },
      {
        speaker: "Man",
        text: "Maybe, but I’d start with occasional performances rather than making it a weekly event.",
      },
      { speaker: "Woman", text: "At least we agree that the market needs better advertising." },
      {
        speaker: "Man",
        text: "Definitely. The current website is mostly read by people who already shop there. They should promote it in neighbouring towns and give visitors another reason to come into the centre.",
      },
      {
        speaker: "Woman",
        text: "And the campaign shouldn’t just list opening times. Short videos about the traders and where their products come from could interest people who normally use supermarkets.",
      },
      {
        speaker: "Man",
        text: "Good idea. The market has plenty of stories; it just hasn’t been very good at telling them.",
      },
    ],
  },
];

export function getGeneralListeningPart3Set(setId) {
  return (
    generalListeningPart3Sets.find((set) => set.id === setId) ||
    generalListeningPart3Sets[0]
  );
}
