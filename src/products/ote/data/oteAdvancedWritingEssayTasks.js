const ESSAY_IDEA_INTRO = "Your essay must include at least two of the following ideas:";
const ESSAY_ORGANIZATION_INSTRUCTION =
  "Organize your essay clearly, introducing the topic, providing support for the points you make, and giving a conclusion.";

function createEssayTask({ topic, ...task }) {
  return {
    type: "advancedEssay",
    typeLabel: "Essay",
    noun: "essay",
    timeSeconds: 30 * 60,
    minWords: 220,
    maxWords: 280,
    intro: "You have 30 minutes to write an essay. Write 220-280 words.",
    setup: `You have been discussing the topic of ${topic} in your class. Your tutor has asked you to write an essay on the following:`,
    ideasIntro: ESSAY_IDEA_INTRO,
    organizationInstruction: ESSAY_ORGANIZATION_INSTRUCTION,
    instruction: "Write your essay.",
    ...task,
  };
}

const workplaceAi = createEssayTask({
  id: "advanced-essay-workplace-ai",
  title: "Advanced Essay Practice 3",
  topic: "artificial intelligence in the workplace",
  theme: "Work and technology",
  prompt: "Companies are increasingly using artificial intelligence to carry out routine administrative tasks.",
  question: "Do you think that this is a positive or a negative development?",
  ideas: [
    "impact on job security",
    "impact on work accuracy",
    "importance of human creativity",
  ],
});

const youthSocialMedia = createEssayTask({
  id: "advanced-essay-youth-social-media",
  title: "Advanced Essay Practice 4",
  topic: "young people and social media",
  theme: "Young people and technology",
  prompt: "Social media platforms should not allow children under sixteen to create accounts.",
  question: "How far do you agree or disagree with this statement?",
  ideas: [
    "impact on youth mental health",
    "impact on social connections",
    "importance of parental supervision",
  ],
});

const cashlessSociety = createEssayTask({
  id: "advanced-essay-cashless-society",
  title: "Cashless Society",
  description: "Evaluate cash-free businesses through convenience, privacy and the different needs of consumers.",
  topic: "cashless payments",
  theme: "Money and society",
  prompt: "More businesses are choosing not to accept cash.",
  question: "Do the advantages of this development outweigh the disadvantages?",
  ideas: [
    "impact on consumer convenience",
    "impact on personal privacy",
    "impact on different social groups",
  ],
});

const onlineRetail = createEssayTask({
  id: "advanced-essay-online-retail-high-streets",
  title: "Online Retail and High Streets",
  description: "Compare the benefits of online shopping with its effects on local economies and community town centres.",
  topic: "online shopping and town centres",
  theme: "Retail and communities",
  prompt:
    "Some people say that online shopping is harming town centres. However, others argue that it offers important benefits to shoppers.",
  question: "Which opinion do you agree with?",
  ideas: [
    "impact on local economies",
    "impact on shopping convenience",
    "importance of town centres to communities",
  ],
});

export const OTE_ADVANCED_WRITING_ESSAY_STUDENT_TASKS = [workplaceAi, youthSocialMedia];

export const OTE_ADVANCED_WRITING_ESSAY_TEACHER_TASKS = [cashlessSociety, onlineRetail];

export function getOteAdvancedWritingEssayTeacherTask(taskId = "") {
  return OTE_ADVANCED_WRITING_ESSAY_TEACHER_TASKS.find((task) => task.id === taskId)
    || OTE_ADVANCED_WRITING_ESSAY_TEACHER_TASKS[0];
}
