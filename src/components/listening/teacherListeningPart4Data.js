export const APTIS_LISTENING_PART4_LIVE_GAME_TYPE = "aptis_listening_part4_teacher";

export const TEACHER_LISTENING_PART4_TASKS = [
  {
    id: "museum-replicas",
    title: "Museum Replicas",
    intro:
      "Listen to a museum curator talking about replicas and answer the questions below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part4/museum-replicas.mp3",
    questions: [
      {
        key: "visitor-understanding",
        text: "Why does the speaker value replicas in exhibitions?",
        answer: "C",
        scriptLineIndex: 2,
        scriptRange: [2, 3],
        evidenceParts: [
          "People could lift the copy, turn it over and try carrying it by a reconstructed handle",
          "many returned to the original and noticed details they had walked past",
          "The modern object had taught people how to look at the ancient one",
        ],
        explanation:
          "Handling the replica lets visitors explore features that cannot be experienced through glass. They then return to the original and notice more, so the replica deepens their understanding of the authentic object.",
        options: [
          {
            value: "A",
            text: "They make exhibitions less expensive to update.",
          },
          {
            value: "B",
            text: "They attract visitors who are unfamiliar with history.",
          },
          {
            value: "C",
            text: "They can deepen visitors' understanding of originals.",
          },
        ],
      },
      {
        key: "overall-view",
        text: "What is the speaker's overall opinion of replicas?",
        answer: "A",
        scriptLineIndex: 4,
        scriptRange: [0, 5],
        evidenceParts: [
          "I would not trade our damaged bowl for its flawless younger relative",
          "I would, however, keep them close together",
          "One carries the history; the other helps more of us discover what that history means",
        ],
        explanation:
          "The curator values the authenticity of originals and the interpretive help offered by replicas. Replicas are useful alongside clearly identified originals, rather than as replacements for them.",
        options: [
          {
            value: "A",
            text: "They should complement original objects, not replace them.",
          },
          {
            value: "B",
            text: "They deserve the same status as original objects.",
          },
          {
            value: "C",
            text: "They are mainly appropriate in children's exhibitions.",
          },
        ],
      },
    ],
    script: [
      {
        speaker: "Museum curator",
        text:
          "Museum visitors sometimes feel cheated when an object is a replica. I understand. If you travelled to see a Roman helmet, learning that the object in front of you was made last year can feel like meeting an actor instead of the historical figure.",
      },
      {
        speaker: "Museum curator",
        text:
          "Originals have a presence that is difficult to manufacture. Scratches on a tool or the faded edge of a letter connect us with the people who used them. Knowing an object survived a fire, a journey or several centuries changes the way we attend to it. Museums should be honest about that history and about what is modern.",
      },
      {
        speaker: "Museum curator",
        text:
          "Yet glass cases impose limits. You can see the front of an ancient bowl but not its weight, the roughness underneath or how it sits in the hand. Last year, we displayed a copy beside a Bronze Age bowl. People could lift the copy, turn it over and try carrying it by a reconstructed handle. Afterwards, many returned to the original and noticed details they had walked past. The modern object had taught people how to look at the ancient one.",
      },
      {
        speaker: "Museum curator",
        text:
          "Copies can also restore missing context. A stone fragment may seem dull until a reconstruction shows the complete pattern and original colours. If the original is too fragile to travel, a replica can reach a school or regional museum that would otherwise have only a photograph. As digital printing becomes cheaper, there is a temptation to fill every gap with something bright and complete. That would remove the uncertainty that makes historical evidence interesting. A reconstruction is an argument about the past, not the past itself, and labels should make that clear.",
      },
      {
        speaker: "Museum curator",
        text:
          "So I would not trade our damaged bowl for its flawless younger relative. I would, however, keep them close together. One carries the history; the other helps more of us discover what that history means.",
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
];

export function getTeacherListeningPart4Task(taskId) {
  return TEACHER_LISTENING_PART4_TASKS.find((task) => task.id === taskId) || null;
}
