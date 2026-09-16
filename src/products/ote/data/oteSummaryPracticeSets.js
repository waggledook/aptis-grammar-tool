import newSummaryTasks from "./oteAdvancedSummaryNewTasks.json";

export const SUMMARY_SHARED_TASK_ENDING =
  "The two experts make the same two main points. You should combine the information from the two experts and summarize the two main points the experts make.";

const ORIGINAL_SUMMARY_PRACTICE_SETS = [
  {
    id: "urban-green-spaces",
    title: "Urban Green Spaces",
    description: "Combine two expert views on how urban nature supports health and why access and quality matter.",
    topic: "urban green spaces",
    taskAudioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-task.mp3",
    prompt:
      "Your tutor has asked you to summarize some research for your tutor group. Listen to two experts talking about research into urban green spaces. The two experts make the same two main points. You should:",
    requirements: [
      "combine the information from the two experts.",
      "summarize the two main points the experts make.",
    ],
    experts: [
      {
        label: "Expert 1",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-expert-1.mp3",
        script:
          "A substantial body of research links urban green spaces with better health. People who spend time in parks, gardens or tree-lined areas often report lower stress and improved mood, and regular visits can encourage walking and other forms of physical activity. These effects may be especially valuable in crowded cities, where contact with nature offers relief from noise and pressure. Yet simply placing a park on a map is not enough. Green spaces are used more frequently when they feel safe, are easy to reach and contain features that suit local residents, such as paths, seating and shaded areas. Poorly maintained spaces may provide little benefit because people are unlikely to spend time there.",
        wordCount: 114,
      },
      {
        label: "Expert 2",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-expert-2.mp3",
        script:
          "Cities are often assessed by how much green land they contain, but researchers argue that quality and access are just as important as total area. Contact with natural surroundings can reduce feelings of anxiety, support social interaction and create opportunities for exercise, all of which contribute to physical and mental well-being. However, these advantages depend on people being able and willing to use the space regularly. A large park far from residential neighbourhoods may be less useful than several smaller areas within walking distance. Good lighting, suitable facilities and careful maintenance also influence who visits. In short, urban nature can improve health, but planners need to consider how green spaces function in everyday life, not merely how much land is provided.",
        wordCount: 121,
      },
    ],
    teacherKey: {
      essentialContentPoints: [
        "Urban green spaces can improve mental and physical health by reducing stress, encouraging exercise and supporting social contact.",
        "Their benefits depend on usability rather than quantity alone: spaces must be accessible, safe, well maintained and suited to residents' needs.",
      ],
      wordCounts: {
        total: 235,
        expert1: 114,
        expert2: 121,
      },
    },
  },
  {
    id: "short-breaks",
    title: "Short Breaks",
    description: "Summarize two expert views on planned breaks, attention, and what makes a break useful.",
    topic: "taking short breaks",
    taskAudioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-task.mp3",
    prompt:
      "Your tutor has asked you to summarize some research for your tutor group. Listen to two experts talking about research into taking short breaks. The two experts make the same two main points. You should:",
    requirements: [
      "combine the information from the two experts.",
      "summarize the two main points the experts make.",
    ],
    experts: [
      {
        label: "Expert 1",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-expert-1.mp3",
        script:
          "Research into attention suggests that short breaks can make study and work more effective. When people concentrate for a long period, their performance often falls because the mind becomes less responsive to the task. In several experiments, participants who paused briefly returned with better focus and made fewer mistakes than those who continued without stopping. The nature of the break also seems important. A few minutes of walking, stretching or looking away from a screen can be useful, whereas checking messages may simply replace one demanding activity with another. Very long or frequent breaks can also interrupt progress, so the aim is not to avoid effort but to divide it into manageable periods.",
        wordCount: 113,
      },
      {
        label: "Expert 2",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-expert-2.mp3",
        script:
          "People sometimes assume that productive workers should remain at their desks continuously, but the evidence points in a different direction. Brief, planned pauses can restore attention and may help learners remember material more successfully, particularly during tasks that require sustained concentration. However, not every pause has the same effect. Researchers have found that light movement or a quiet change of activity is generally more refreshing than spending the break on social media, which continues to place demands on attention. Breaks also need to be kept under control: if they last too long or occur whenever a task becomes difficult, it may be harder to return to the original goal and maintain momentum.",
        wordCount: 112,
      },
    ],
    teacherKey: {
      essentialContentPoints: [
        "Brief, planned breaks can restore attention and improve performance or learning.",
        "The type and length of the break matter: light movement or a genuine mental rest is useful, whereas screen use and excessively long or frequent breaks may be counterproductive.",
      ],
      wordCounts: {
        total: 225,
        expert1: 113,
        expert2: 112,
      },
    },
  },
];

export const SUMMARY_PRACTICE_SETS = [
  ...ORIGINAL_SUMMARY_PRACTICE_SETS,
  ...newSummaryTasks.filter((task) => task.bank === "student"),
];
export const SUMMARY_TEACHER_SETS = newSummaryTasks.filter((task) => task.bank === "teacher");
