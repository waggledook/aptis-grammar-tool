export const APTIS_LISTENING_PART4_LIVE_GAME_TYPE = "aptis_listening_part4_teacher";

const TEACHER_LISTENING_PART4_TASK_SEQUENCE = ["cashless-venues", "museum-replicas"];

export const TEACHER_LISTENING_PART4_TASKS = [
  {
    id: "museum-replicas",
    title: "Museum Replicas",
    intro:
      "Listen to a museum curator talking about replicas and answer the questions below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part4/museum-replicas.mp3",
    questions: [
      {
        key: "handling-replicas",
        text: "What does the curator suggest about handling replicas?",
        answer: "A",
        scriptLineIndex: 1,
        scriptRange: [1, 2],
        evidenceParts: [
          "People who had said “I could carry that easily” tried lifting it full and called someone over to take the other handle",
          "After a few turns, they look at the small amount of flour they’ve produced and ask how much a family would need",
        ],
        explanation:
          "Visitors underestimate the effort involved in carrying the bowl and producing flour. Handling the replicas changes their assumptions about ordinary activities in the past. The comparisons between makers and the signs of damage belong to the researchers’ examination of originals.",
        options: [
          {
            value: "A",
            text: "They can correct visitors’ assumptions about everyday life.",
          },
          {
            value: "B",
            text: "They can help visitors compare the skills of different makers.",
          },
          {
            value: "C",
            text: "They can help visitors recognise signs of historical damage.",
          },
        ],
      },
      {
        key: "overall-view",
        text: "What is the curator’s overall view of replicas?",
        answer: "B",
        scriptLineIndex: 4,
        scriptRange: [0, 5],
        evidenceParts: [
          "a transparent working copy lets visitors follow water through the valves",
          "people spent the session following the moving water; the bronze pump remained at the edge of their attention",
          "the letter will stay under glass",
          "the pump will remain downstairs",
        ],
        explanation:
          "The curator now makes selective decisions according to what best explains the subject. The original letter retains its significance, handling copies reveal practical demands, and a working replica is preferred to an available original pump because it communicates the water system more effectively.",
        options: [
          {
            value: "A",
            text: "Replicas should support encounters with originals rather than replace them.",
          },
          {
            value: "B",
            text: "Replicas may be preferable when they explain the subject more effectively.",
          },
          {
            value: "C",
            text: "Replicas should be reserved for objects unavailable for display.",
          },
        ],
      },
    ],
    script: [
        {
          speaker: "Museum curator",
          text:
            "Early in my museum career, I asked for the original object whenever it could be displayed safely. A copy seemed an apology for something missing. I still remember finding the writer’s thumbprint in the ink on a nineteenth-century letter. A photograph would have shown the same words, but I stood there much longer than I expected.",
        },
        {
          speaker: "Museum curator",
          text:
            "In our domestic-life gallery, visitors used to glance at an ancient bowl and move on. We introduced a weighted copy. People who had said “I could carry that easily” tried lifting it full and called someone over to take the other handle. Nearby, a replica hand mill lets visitors grind grain. Most start briskly. After a few turns, they look at the small amount of flour they’ve produced and ask how much a family would need. Researchers study the original’s cracks and tool marks, comparing it with examples from workshops in other towns.",
        },
        {
          speaker: "Museum curator",
          text:
            "Our new water-supply exhibition takes that experiment further. The old pump is sound enough to display, and we have it in storage. In the gallery, a transparent working copy lets visitors follow water through the valves. When we showed both during the trial, people spent the session following the moving water; the bronze pump remained at the edge of their attention.",
        },
        {
          speaker: "Museum curator",
          text:
            "Of course, copies include decisions. Missing parts may be added from drawings, and colours may come from traces too small for visitors to see. For one object, we’re showing two versions based on different interpretations of the same evidence. Each has a label explaining which details are known and which have been filled in.",
        },
        {
          speaker: "Museum curator",
          text:
            "Next month, the letter will stay under glass, the bowl’s copy will be replaced with a sturdier one, and the pump will remain downstairs. The school groups arrive on Tuesday; I’ve ordered extra grain.",
        },
    ],
  },
  {
    id: "cashless-venues",
    title: "Cashless Venues",
    intro:
      "Listen to an events manager talking about cashless venues and answer the questions below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part4/cashless-venues.mp3",
    questions: [
      {
        key: "payment-queues",
        text: "What does the speaker suggest about cashless payment queues?",
        answer: "C",
        scriptLineIndex: 1,
        scriptRange: [1, 2],
        evidenceParts: [
          "The counters looked efficient",
          "Beside the machine, however, people were still waiting",
        ],
        explanation:
          "The ordinary counters move quickly, but customers with payment problems are redirected to a separate machine where another queue forms. The delay has shifted rather than disappeared.",
        options: [
          {
            value: "A",
            text: "They are shorter at every kind of event.",
          },
          {
            value: "B",
            text: "They mainly occur when customers' devices fail.",
          },
          {
            value: "C",
            text: "They may move delays to a different place.",
          },
        ],
      },
      {
        key: "overall-view",
        text: "What is the speaker's overall view of cashless venues?",
        answer: "B",
        scriptLineIndex: 4,
        scriptRange: [0, 5],
        evidenceParts: [
          "ordinary transactions remain digital",
          "each main area has one clearly marked point accepting cash",
          "it prevents a minor payment problem from defining someone's evening",
        ],
        explanation:
          "The events manager supports the operational benefits of digital payment while retaining limited cash access so that a minority of customers are not excluded.",
        options: [
          {
            value: "A",
            text: "Cashless systems create more problems than they solve.",
          },
          {
            value: "B",
            text: "Venues should balance efficiency with inclusive access.",
          },
          {
            value: "C",
            text: "Most objections will disappear as technology improves.",
          },
        ],
      },
    ],
    script: [
      {
        speaker: "Events manager",
        text:
          "Three years ago, the arena I managed stopped accepting cash at food and drink counters. The argument was convincing. Contactless sales took seconds, staff no longer counted change, and there was less money to secure after the event. During quiet evenings, the system worked as promised.",
      },
      {
        speaker: "Events manager",
        text:
          "A sold-out concert was more complicated. Each counter moved quickly until someone had a flat phone battery, an overseas card that failed or a child carrying only a ten-pound note. Staff directed them to a machine where cash could be exchanged for a payment card. The counters looked efficient. Beside the machine, however, people were still waiting while their friends had already been served.",
      },
      {
        speaker: "Events manager",
        text:
          "This does not prove that cashless systems have failed. Digital payment makes stock control easier, reduces mistakes and lets temporary bars serve crowds with less equipment. Most customers prefer it. Staff also feel safer without a cash drawer late at night.",
      },
      {
        speaker: "Events manager",
        text:
          "However, \"most\" hides a varied group. Some teenagers attend without bank cards. Some older customers use cash to control spending. A visitor may own a smartphone but lack reliable data, battery power or confidence using it in a crowd. They have not all refused to move with the times; sometimes technology has met them on a difficult day.",
      },
      {
        speaker: "Events manager",
        text:
          "At our newer venues, ordinary transactions remain digital, but each main area has one clearly marked point accepting cash. It costs money and is rarely busy. Even so, it prevents a minor payment problem from defining someone's evening. Event managers naturally measure speed, sales and security. We should. But a gate that opens quickly for ninety-five people and stays shut for the next five is not, in every sense, an efficient entrance.",
      },
    ],
  },
].sort(
  (firstTask, secondTask) =>
    TEACHER_LISTENING_PART4_TASK_SEQUENCE.indexOf(firstTask.id) -
    TEACHER_LISTENING_PART4_TASK_SEQUENCE.indexOf(secondTask.id)
);

export function getTeacherListeningPart4Task(taskId) {
  return TEACHER_LISTENING_PART4_TASKS.find((task) => task.id === taskId) || null;
}
