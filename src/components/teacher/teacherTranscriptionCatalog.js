import { PART1_QUESTIONS } from "../speaking/banks/part1.js";
import { PART2_TASKS } from "../speaking/banks/part2.js";
import { PART3_TASKS } from "../speaking/banks/part3.js";
import { PART4_TASKS } from "../speaking/banks/part4.js";
import { OTE_ADVANCED_VOICEMAIL_TEACHER_TASKS } from "../../products/ote/data/oteAdvancedVoicemailTeacherTasks.js";
import { PRACTICE_SETS as OTE_GENERAL_VOICEMAIL_SETS, ADVANCED_PRACTICE_SETS as OTE_ADVANCED_VOICEMAIL_SETS } from "../../products/ote/data/oteVoicemailPracticeSets.js";
import { SUMMARY_PRACTICE_SETS, SUMMARY_TEACHER_SETS } from "../../products/ote/data/oteSummaryPracticeSets.js";
import { PRACTICE_SETS as OTE_GENERAL_INTERVIEW_SETS, ADVANCED_PRACTICE_SETS as OTE_ADVANCED_INTERVIEW_SETS } from "../../products/ote/data/oteInterviewPracticeSets.js";
import { PRACTICE_SETS as OTE_TALK_SETS } from "../../products/ote/data/oteTalkPracticeSets.js";
import { DEBATE_PRACTICE_SETS as OTE_DEBATE_SETS } from "../../products/ote/data/oteDebatePracticeSets.js";

function voicemailTasks(sets) {
  return sets.flatMap((set) => set.tasks.map((task) => ({
    id: task.id,
    title: `${set.id.replace(/-/g, " ")} · ${set.title} · ${task.title}`,
    prompt: `${task.lead} ${task.bullets.join("; ")}`,
    context: { ...task, setTitle: set.title },
  })));
}

const OTE_INTERVIEW_PRACTICE_QUESTIONS = [
  "What's your name?",
  "Which country do you come from?",
];

export const TRANSCRIPTION_APPS = [
  { id: "", label: "Transcription only" },
  { id: "aptis", label: "Aptis Trainer" },
  { id: "ote-general", label: "OTE General" },
  { id: "ote-advanced", label: "OTE Advanced" },
  { id: "other", label: "Other speaking task" },
];

export const TRANSCRIPTION_TASK_GROUPS = [
  {
    id: "aptis_part1", app: "aptis", label: "Part 1 · personal questions", credits: 2,
    tasks: PART1_QUESTIONS.map((question) => ({
      id: question.id, title: question.text, prompt: question.text,
      context: { id: question.id, title: question.text },
    })),
  },
  {
    id: "aptis_part2", app: "aptis", label: "Part 2 · describe a photograph", credits: 3,
    tasks: PART2_TASKS.map((task) => ({
      id: task.id, title: task.title,
      context: task,
      questions: ["Describe the photograph.", ...task.questions],
    })),
  },
  {
    id: "aptis_part3", app: "aptis", label: "Part 3 · compare two pictures", credits: 4,
    tasks: PART3_TASKS.map((task) => ({
      id: task.id, title: task.title,
      context: task,
      questions: ["Compare the two pictures.", ...task.questions],
    })),
  },
  {
    id: "aptis_part4", app: "aptis", label: "Part 4 · extended answer", credits: 5,
    tasks: PART4_TASKS.map((task) => ({
      id: task.id, title: task.title,
      prompt: (task.questions || task.qs || []).join(" / "),
      context: { ...task, questions: task.questions || task.qs || [] },
    })),
  },
  {
    id: "ote_general_interview", app: "ote-general", label: "Part 1 · interview", credits: 4,
    tasks: OTE_GENERAL_INTERVIEW_SETS.map((set) => ({
      id: set.id, title: `${set.id.replace(/-/g, " ")} · ${set.title}`,
      questions: [...OTE_INTERVIEW_PRACTICE_QUESTIONS, ...set.topics.flatMap((topic) => topic.questions)],
      practiceQuestionCount: 2,
      context: set,
    })),
  },
  {
    id: "ote_general_voicemail", app: "ote-general", label: "Part 2 · voicemails", credits: 4,
    tasks: voicemailTasks(OTE_GENERAL_VOICEMAIL_SETS),
  },
  {
    id: "ote_general_talk", app: "ote-general", label: "Part 3 · extended talk", credits: 4,
    tasks: OTE_TALK_SETS.map((set) => ({
      id: set.id, title: set.title, prompt: set.talkPrompt, context: set,
    })),
  },
  {
    id: "ote_general_followup", app: "ote-general", label: "Part 4 · follow-up questions", credits: 4,
    tasks: OTE_TALK_SETS.map((set) => ({
      id: set.id, title: set.title, questions: set.questions.map((question) => question.prompt), context: set,
    })),
  },
  {
    id: "ote_advanced_interview", app: "ote-advanced", label: "Part 1 · interview", credits: 4,
    tasks: OTE_ADVANCED_INTERVIEW_SETS.map((set) => ({
      id: set.id, title: `${set.id.replace(/-/g, " ")} · ${set.title}`,
      questions: [...OTE_INTERVIEW_PRACTICE_QUESTIONS, ...set.questions],
      practiceQuestionCount: 2,
      context: set,
    })),
  },
  {
    id: "ote_advanced_voicemail", app: "ote-advanced", label: "Part 2 · diplomatic voice message", credits: 4,
    tasks: voicemailTasks([...OTE_ADVANCED_VOICEMAIL_SETS, ...OTE_ADVANCED_VOICEMAIL_TEACHER_TASKS]),
  },
  {
    id: "ote_advanced_summary", app: "ote-advanced", label: "Part 3 · summary", credits: 4,
    tasks: [...SUMMARY_PRACTICE_SETS, ...SUMMARY_TEACHER_SETS].map((task) => ({
      id: task.id, title: task.title,
      prompt: `${task.prompt} ${task.requirements.join(" ")}`,
      context: task,
    })),
  },
  {
    id: "ote_advanced_debate", app: "ote-advanced", label: "Part 4 · debate", credits: 4,
    tasks: OTE_DEBATE_SETS.map((set) => ({
      id: set.id, title: set.title,
      prompt: `Your tutor says: “${set.statement}” Give a talk for or against the statement. Use two or three ideas: ${set.mindMapIdeas.join(", ")}.`,
      context: set,
    })),
  },
  {
    id: "ote_advanced_followup", app: "ote-advanced", label: "Part 5 · follow-up questions", credits: 4,
    tasks: OTE_DEBATE_SETS.map((set) => ({
      id: set.id, title: set.title, questions: set.questions, context: set,
    })),
  },
  { id: "general", app: "other", label: "Custom speaking response", credits: 4, tasks: [] },
];
