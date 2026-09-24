// Aptis Listening Mock 1, Questions 16 and 17. Authored tasks and recordings supplied by the user.
export const FITNESS_TRACKERS_QUESTION = {
  id: "q16",
  number: 16,
  type: "multiple-choice",
  part: 4,
  prompt: "Listen to a radio presenter talking about fitness trackers and answer the questions below.",
  audioSrc: "/audio/listening/mock-1/complete/q16.mp3",
  items: [
    {
      id: "daily-targets",
      prompt: "What does the speaker suggest about fixed daily targets?",
      options: [
        "They reliably improve people's long-term fitness.",
        "They can encourage people to make unhelpful choices.",
        "They matter less than measuring exercise intensity.",
      ],
      answer: "B",
    },
    {
      id: "overall-view",
      prompt: "What is the speaker's overall view of fitness trackers?",
      options: [
        "They are too inaccurate to guide behaviour.",
        "They mainly benefit people who are already active.",
        "They are useful when their data is interpreted flexibly.",
      ],
      answer: "C",
    },
  ],
  script: [
    "When I bought a fitness tracker, I expected it to sit quietly on my wrist. Instead, it began organising my day. If I was short of ten thousand steps in the evening, I would walk round the kitchen while the kettle boiled. Once, after swimming for an hour, I went for another walk because the tracker had barely noticed it. The number was satisfied; my legs were not.",
    "That is the odd thing about a fixed target. It can get you off the sofa, but it also makes unlike days look as if they ought to be identical. A long cycle ride, a day recovering from illness and eight hours at a desk produce different needs. Yet the device delivers the same celebration—or silent criticism—at midnight. It also has no idea why one kind of exercise might suit you better than another; it simply rewards what it was designed to notice.",
    "The figures are not worthless. Mine showed that on working-from-home days I moved far less than I imagined. I also noticed that my sleep became more regular after I stopped answering emails late at night. The patterns were useful because I compared several weeks, rather than treating Tuesday's reading as a medical verdict.",
    "Problems begin when the device's estimate becomes more persuasive than the body wearing it. Trackers cannot know that a child kept you awake, your knee hurts, or today's modest walk represents progress after an operation. A target may provide a helpful nudge, but it is a poor judge.",
    "I still wear mine. These days, though, I think of it as a weather forecast rather than an instruction: information worth noticing, alongside other evidence, and sometimes a reason to change plans. I no longer pace around the kitchen simply to make the screen light up. The kettle, at least, seems relieved.",
  ],
};

export const CAREER_CHANGE_QUESTION = {
  id: "q17",
  number: 17,
  type: "multiple-choice",
  part: 4,
  prompt: "Listen to a careers adviser talking about changing career later in life and answer the questions below.",
  audioSrc: "/audio/listening/mock-1/complete/q17.mp3",
  items: [
    {
      id: "short-courses",
      prompt: "What does the speaker suggest about short training courses?",
      options: [
        "They can reveal whether a new career feels suitable.",
        "They rarely provide skills that employers recognise.",
        "They work best when completed after leaving a job.",
      ],
      answer: "A",
    },
    {
      id: "overall-view",
      prompt: "What is the speaker's overall view of changing career later?",
      options: [
        "It succeeds when people accept a temporary salary cut.",
        "It is demanding but builds on earlier experience.",
        "It mainly suits people who are seeking adventure.",
      ],
      answer: "B",
    },
  ],
  script: [
    "Careers clients often begin by telling me what they lack: no qualification in the new field, no contacts and no time to start again. At twenty-five, a career change may sound like an adventure; at forty-five, it can feel like admitting that the earlier years were wasted.",
    "Before anyone resigns, I suggest a small experiment: an evening course, a weekend helping at an event, or a modest freelance project. The certificate may be useful, but it is not always the main benefit. One client loved the idea of landscape design until a Saturday course revealed all the measurements, regulations and negotiation involved. She returned to her job without regret. Another discovered during a coding class that she enjoyed solving problems for hours. She had no new profession yet, but she had something better than a fantasy to base her decision on.",
    "Recruitment can be uncomfortable. An experienced manager may become the least experienced person in the room. Salaries can fall before they rise, and being taught by a younger colleague requires a certain lack of pride. These difficulties are real, so I distrust success stories in which courage pays the bills by itself.",
    "But beginners are not blank pages. A former nurse entering project management knows how to prioritise under pressure. A shop manager moving into social care has spent years listening, calming disagreements and noticing when someone needs help. The challenge is to translate that experience, not hide it beneath the word \"beginner\".",
    "Changing direction later is neither a quick escape nor a return to the starting line. The route may bend, and it may include an awkward step backwards. Still, people frequently arrive with more useful luggage than they realise; they simply need to unpack it in a place where others can see its value.",
  ],
};
