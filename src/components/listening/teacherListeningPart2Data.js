export const APTIS_LISTENING_PART2_LIVE_GAME_TYPE = "aptis_listening_part2_teacher";

export const TEACHER_LISTENING_PART2_TASKS = [
  {
    id: "using-customer-reviews",
    title: "Using Customer Reviews",
    intro: "You will hear four people talking about using customer reviews. Match each speaker (1–4) with the statement that best describes them. There are two extra statements that you do not need to use. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part2/teacher/customer-reviews.mp3",
    speakerAudio: ["a", "b", "c", "d"].map((speaker) => `/audio/listening/part2/teacher/customer-reviews-${speaker}.mp3`),
    choices: [
      { key: "a", text: "usually follows star ratings" },
      { key: "b", text: "writes reviews after problems" },
      { key: "c", text: "prefers friends’ recommendations" },
      { key: "d", text: "checks several reviews first" },
      { key: "e", text: "ignores reviews for cheap items" },
      { key: "f", text: "trusts detailed reviews most" },
    ],
    prompts: [
      {
        key: "A", text: "Speaker 1", answer: "d", scriptLineIndex: 0,
        evidenceParts: ["open four or five comments", "whether the same strengths or problems appear more than once"],
        explanation: "Speaker A compares several comments to see whether other reviewers report the same strengths or problems.",
      },
      {
        key: "B", text: "Speaker 2", answer: "f", scriptLineIndex: 1,
        evidenceParts: ["explain how they used the product", "what worked well and what disappointed them"],
        explanation: "Speaker B values reviews that explain how a product was used and give enough context to judge it.",
      },
      {
        key: "C", text: "Speaker 3", answer: "b", scriptLineIndex: 2,
        evidenceParts: ["hardly ever write one when everything goes as expected", "Then I feel other customers should know"],
        explanation: "Speaker C rarely posts when things go smoothly, but writes when an order or service causes a problem.",
      },
      {
        key: "D", text: "Speaker 4", answer: "e", scriptLineIndex: 3,
        evidenceParts: ["depends on the price", "not going to spend twenty minutes researching a cheap kitchen tool"],
        explanation: "Speaker D checks reviews for expensive purchases, but does not think the research is worthwhile for cheap items.",
      },
    ],
    script: [
      { speaker: "Speaker 1", text: "I always notice the overall score when I open a product page, but I don’t put much faith in that number on its own. One customer may have been unusually lucky or unlucky, so I usually open four or five comments and see whether the same strengths or problems appear more than once. A very long review can be useful, but I’m more interested in patterns. If several different people mention the same issue, that’s when I start to take it seriously." },
      { speaker: "Speaker 2", text: "A friend often sends me links to things they think I’d like, and I’m happy to look at them. But before I buy anything, I want more than a quick score or a comment saying something is “great”. I pay attention to people who explain how they used the product, what worked well and what disappointed them. Even a negative comment can be useful if it gives enough context for me to decide whether the same problem would matter to me." },
      { speaker: "Speaker 3", text: "I read reviews quite often, but I hardly ever write one when everything goes as expected. I usually just use the product and forget about it. It’s different if an order arrives damaged, the company doesn’t reply, or the service is much worse than I expected. Then I feel other customers should know. I sometimes read a few comments first to see whether anyone else had the same experience, but when things go smoothly, it rarely even occurs to me to post anything." },
      { speaker: "Speaker 4", text: "For me, it depends on the price. If I’m buying a phone, a washing machine or something else expensive, I’ll read comments carefully and probably look at the star rating as well. But I’m not going to spend twenty minutes researching a cheap kitchen tool or some basic household item. If it turns out to be disappointing, I haven’t lost very much. I’d rather save the research for purchases where making the wrong choice would actually cost me something." },
    ],
  },
  {
    id: "volunteering",
    title: "Volunteering",
    intro: "You will hear four people talking about volunteering. Match each speaker (1–4) with the statement that best describes them. There are two extra statements that you do not need to use. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part2/teacher/volunteering.mp3",
    speakerAudio: ["a", "b", "c", "d"].map((speaker) => `/audio/listening/part2/teacher/volunteering-${speaker}.mp3`),
    choices: [
      { key: "a", text: "started because of a friend" },
      { key: "b", text: "volunteers every week" },
      { key: "c", text: "wanted useful experience" },
      { key: "d", text: "works mainly with children" },
      { key: "e", text: "prefers practical work" },
      { key: "f", text: "enjoys meeting new people" },
    ],
    prompts: [
      {
        key: "A", text: "Speaker 1", answer: "c", scriptLineIndex: 0,
        evidenceParts: ["applying for jobs", "something more concrete to talk about"],
        explanation: "Speaker A began volunteering to gain useful experience to show employers and discuss in interviews.",
      },
      {
        key: "B", text: "Speaker 2", answer: "e", scriptLineIndex: 1,
        evidenceParts: ["much happier doing things behind the scenes", "prefer having a clear job to do"],
        explanation: "Speaker B prefers hands-on tasks such as sorting donations to reception or visitor-facing roles.",
      },
      {
        key: "C", text: "Speaker 3", answer: "a", scriptLineIndex: 2,
        evidenceParts: ["A friend of mine", "asked if I could come along", "if my friend hadn’t invited me"],
        explanation: "Speaker C had not considered volunteering until a friend invited them to help at an event.",
      },
      {
        key: "D", text: "Speaker 4", answer: "f", scriptLineIndex: 3,
        evidenceParts: ["chance to talk to people I wouldn’t normally meet", "the conversations are what make the experience worthwhile"],
        explanation: "Speaker D most enjoys talking to visitors and meeting people through volunteering.",
      },
    ],
    script: [
      { speaker: "Speaker 1", text: "I first started volunteering when I was applying for jobs. I realised I didn’t have much outside my studies to show employers, so I thought helping at a local organisation would give me something more concrete to talk about. I expected to stay for only a few months, but I enjoyed it much more than I thought I would. I usually help organise events and prepare materials, although I sometimes work with children during family activities. That original career reason is what got me involved." },
      { speaker: "Speaker 2", text: "I’ve tried a few different volunteer roles. At first I helped on reception and sometimes spoke to visitors, but I found that quite tiring. I’m much happier doing things behind the scenes, like sorting donations, preparing food parcels or setting up rooms before an event. I help quite regularly, although not every single week because work sometimes gets in the way. I know some people love the social side, but I prefer having a clear job to do and getting on with it." },
      { speaker: "Speaker 3", text: "Volunteering wasn’t something I’d really thought about before. A friend of mine was helping at a local charity event and asked if I could come along for one afternoon. I nearly said no, but I went in the end and enjoyed it enough to keep going back. I’ve met lots of people there since then, and that’s become one of the best parts. Still, if my friend hadn’t invited me that first time, I probably wouldn’t have started at all." },
      { speaker: "Speaker 4", text: "What I enjoy most is the chance to talk to people I wouldn’t normally meet. I often help at public events, so I spend a lot of time welcoming visitors, answering simple questions and showing people where to go. I’ve made friends with some of the other volunteers too, but that wasn’t why I joined. Occasionally we run activities for children, which can be fun, though most of my time is spent with adults. For me, the conversations are what make the experience worthwhile." },
    ],
  },
];

export function getTeacherListeningPart2Task(taskId) {
  return TEACHER_LISTENING_PART2_TASKS.find((task) => task.id === taskId) || null;
}
