// Remaining draft content. Replace each prompt, option set, audioSrc and answer
// key together when a complete original mock recording is ready.
import { FLEXIBLE_WORKING_HOURS_QUESTION } from "./flexibleWorkingHours.js";
const shortScenarios = [
  ["A caller leaves a message about a meeting. What has changed?", "The day", "The time", "The room"],
  ["A customer asks about a delivery. What does the assistant confirm?", "The address", "The price", "The arrival time"],
  ["Two friends discuss a weekend trip. What will they do first?", "Buy tickets", "Check the weather", "Call a friend"],
  ["A teacher gives an announcement. What should students bring?", "A notebook", "A photograph", "A form"],
  ["A woman talks about a new café. What does she like most?", "The food", "The service", "The location"],
  ["A man describes his journey to work. How does he usually travel?", "By bus", "By train", "By bicycle"],
  ["A caller asks about a sports class. What information does she need?", "The start time", "The instructor's name", "The equipment"],
  ["Two colleagues discuss a presentation. What do they agree to change?", "The title", "The order", "The images"],
  ["A visitor asks for directions. Where should she go?", "The library", "The reception desk", "The café"],
  ["A student talks about a course. Why did he choose it?", "The schedule", "The subject", "The teacher"],
  ["A radio presenter describes an event. When will it take place?", "Friday morning", "Saturday afternoon", "Sunday evening"],
  ["A woman talks about a gift. Who is it for?", "Her brother", "Her colleague", "Her neighbour"],
  ["Two people discuss a film. What do they both think?", "It is too long", "The acting is good", "The ending is surprising"],
];

const shortQuestions = shortScenarios.map(([prompt, ...options], index) => ({
  id: `q${index + 1}`,
  number: index + 1,
  type: "multiple-choice",
  part: 1,
  prompt,
  audioSrc: null,
  items: [{ id: "main", prompt: "", options }],
}));

export const LISTENING_MOCK = {
  id: "listening-mock-1",
  title: "Aptis General Listening Mock 1",
  durationSeconds: 40 * 60,
  questions: [
    ...shortQuestions,
    {
      id: "q14",
      number: 14,
      type: "speaker-matching",
      part: 2,
      prompt: "Four people are talking about learning a new skill. Complete the sentences below.",
      audioSrc: null,
      options: [
        "enjoyed learning with friends.",
        "found the first lessons difficult.",
        "wants to practise more often.",
        "prefers learning independently.",
        "was encouraged by a family member.",
        "uses the skill at work.",
      ],
      items: ["Speaker A", "Speaker B", "Speaker C", "Speaker D"].map((label, index) => ({ id: `speaker-${index + 1}`, label })),
    },
    FLEXIBLE_WORKING_HOURS_QUESTION,
    {
      id: "q16",
      number: 16,
      type: "multiple-choice",
      part: 4,
      prompt: "Listen to a speaker discussing a new community transport plan and answer the questions below.",
      audioSrc: null,
      items: [
        { id: "overall", prompt: "What is the speaker's opinion of the plan overall?", options: ["It needs wider consultation.", "It is already working well.", "It is too similar to an earlier plan."] },
        { id: "media", prompt: "What does the speaker say about the media's response?", options: ["It has focused on the wrong details.", "It has been more positive than expected.", "It has helped residents understand the plan."] },
      ],
    },
    {
      id: "q17",
      number: 17,
      type: "multiple-choice",
      part: 4,
      prompt: "Listen to a speaker discussing changes at a local museum and answer the questions below.",
      audioSrc: null,
      items: [
        { id: "aim", prompt: "What was the main aim of the changes?", options: ["To attract new visitors", "To protect the collection", "To reduce running costs"] },
        { id: "reaction", prompt: "How does the speaker feel about visitors' reactions?", options: ["Surprised", "Encouraged", "Concerned"] },
      ],
    },
  ],
};
