// Aptis Listening Mock 1, Questions 11–13. Authored tasks and recordings supplied by the user.
export const B1_QUESTIONS_ELEVEN_TO_THIRTEEN = [
  {
    id: "q11",
    number: 11,
    type: "multiple-choice",
    part: 1,
    prompt: "Listen to a customer returning some headphones.",
    audioSrc: "/audio/listening/mock-1/complete/q11.mp3",
    items: [{
      id: "main",
      prompt: "Why is the customer returning the headphones?",
      options: ["The sound is unclear", "They are uncomfortable", "One side has stopped working"],
      answer: "C",
    }],
    script: [
      { speaker: "Assistant", text: "Can I help you with something?" },
      { speaker: "Customer", text: "I bought these headphones here two weeks ago. The headband felt rather tight at first, but it became comfortable after I had worn it a few times. The sound was clear too—much better than my old pair. Yesterday, though, the music suddenly started coming through only the right side." },
      { speaker: "Assistant", text: "That can sometimes be caused by the phone socket." },
      { speaker: "Customer", text: "That was my first thought, so I tried them with my laptop and my partner’s phone. The left side was still silent, and I cannot see any damage to the cable. I would like to exchange them." },
    ],
  },
  {
    id: "q12",
    number: 12,
    type: "multiple-choice",
    part: 1,
    prompt: "Listen to two colleagues discussing a report.",
    audioSrc: "/audio/listening/mock-1/complete/q12.mp3",
    items: [{
      id: "main",
      prompt: "What mainly delayed the report?",
      options: ["Late figures from the client", "A problem with the computer", "An additional meeting"],
      answer: "A",
    }],
    script: [
      { speaker: "Man", text: "Is the sales report ready to send?" },
      { speaker: "Woman", text: "Not quite. My laptop froze on Tuesday, but the technical team recovered the file within an hour, so I did not lose much time. Then the manager called an extra meeting yesterday afternoon. That took longer than expected, although I could have caught up last night. The client’s sales figures only arrived this morning, after I had asked for them twice. I could write the introduction, but I could not complete the analysis without those numbers. They are here now, so I should be able to send everything by lunchtime tomorrow." },
    ],
  },
  {
    id: "q13",
    number: 13,
    type: "multiple-choice",
    part: 1,
    prompt: "Listen to an announcement at a community centre.",
    audioSrc: "/audio/listening/mock-1/complete/q13.mp3",
    items: [{
      id: "main",
      prompt: "What is the announcement mainly about?",
      options: ["A new membership system", "Temporary changes to building access", "Plans for an open day"],
      answer: "B",
    }],
    script: "From Monday, the main entrance to Brookfield Community Centre will be closed for approximately six weeks while repairs are carried out on the roof above it. All classes and clubs will continue as normal, but visitors should enter through the side door beside the car park. Please have your membership card ready because reception staff will be working at a temporary desk just inside. Anyone who needs to renew a card can still do so there. Next Saturday’s open day will also go ahead, although outdoor activities may move into the sports hall if it rains. Signs will show visitors how to reach each part of the building.",
  },
];
