import { AudioLines, Headphones, MessageCircle, Users } from "lucide-react";

export const APTIS_LISTENING_PARTS = [
  {
    number: "1",
    label: "Part 1",
    title: "Information Recognition",
    copy: "Listen to short recordings and choose the correct answer to each question.",
    format: "13 short recordings",
    questionType: "3-option multiple choice",
    icon: Headphones,
    menuSummary: "Strategy guide + exam practice",
    training: [
      {
        id: "part1-strategy-guide",
        eyebrow: "Strategy guide",
        title: "Information Recognition Strategy",
        copy: "Learn a clear method for reading the question, listening for the key information and checking your choice.",
        path: "/listening/parts/1/strategy-guide",
        demoAccess: "demo",
      },
    ],
    practice: {
      id: "part1-practice",
      eyebrow: "Exam practice",
      title: "Part 1 Task Library",
      copy: "Practise short recordings with two listens, immediate feedback and detailed explanations.",
      path: "/listening/part1",
      demoAccess: "demo",
    },
  },
  {
    number: "2",
    label: "Part 2",
    title: "Information Matching",
    copy: "Listen to four speakers and match each person to the idea they express.",
    format: "4 speakers",
    questionType: "6 options, 2 extra",
    icon: Users,
    menuSummary: "Strategy guide + exam practice",
    training: [
      {
        id: "part2-strategy-guide",
        eyebrow: "Strategy guide",
        title: "Information Matching Strategy",
        copy: "Learn how to analyse the options, follow one speaker at a time and match meanings rather than individual words.",
        path: "/listening/parts/2/strategy-guide",
        demoAccess: "demo",
      },
    ],
    practice: {
      id: "part2-practice",
      eyebrow: "Exam practice",
      title: "Part 2 Task Library",
      copy: "Match four speakers to six options, then review the evidence behind every answer.",
      path: "/listening/part2",
      demoAccess: "demo",
    },
  },
  {
    number: "3",
    label: "Part 3",
    title: "Inference: Discussion",
    copy: "Listen to two people discussing a topic and identify who expresses each opinion.",
    format: "1 discussion",
    questionType: "Man, woman or both",
    icon: MessageCircle,
    menuSummary: "Strategy guide + exam practice",
    training: [
      {
        id: "part3-strategy-guide",
        eyebrow: "Strategy guide",
        title: "Discussion and Opinion Strategy",
        copy: "Learn how to separate the speakers’ viewpoints and recognise opinions that are stated indirectly.",
        path: "/listening/parts/3/strategy-guide",
        demoAccess: "locked",
      },
    ],
    practice: {
      id: "part3-practice",
      eyebrow: "Exam practice",
      title: "Part 3 Task Library",
      copy: "Decide whether each opinion belongs to the man, the woman or both speakers.",
      path: "/listening/part3",
      demoAccess: "locked",
    },
  },
  {
    number: "4",
    label: "Part 4",
    title: "Inference: Longer Monologues",
    copy: "Listen to longer monologues and identify the speaker’s meaning, attitude and opinion.",
    format: "2 longer monologues",
    questionType: "3-option multiple choice",
    icon: AudioLines,
    menuSummary: "Strategy guide + exam practice",
    training: [
      {
        id: "part4-strategy-guide",
        eyebrow: "Strategy guide",
        title: "Longer Monologue Strategy",
        copy: "Learn how to follow a longer recording and distinguish the speaker’s main message from supporting details.",
        path: "/listening/parts/4/strategy-guide",
        demoAccess: "locked",
      },
    ],
    practice: {
      id: "part4-practice",
      eyebrow: "Exam practice",
      title: "Part 4 Task Library",
      copy: "Answer exam-style inference questions and review the evidence for each choice.",
      path: "/listening/part4",
      demoAccess: "locked",
    },
  },
];

export function getAptisListeningPart(number) {
  return APTIS_LISTENING_PARTS.find((part) => part.number === String(number));
}
