const IMAGE_BASE = "/images/speaking/workshops/education-learning";

const setAItems = [
  { id: "revise-exam", term: "revise for an exam", meaning: "study material again in preparation for an exam", example: "I usually start revising for an exam a few weeks beforehand.", gap: "I need to _____ this weekend because the test is on Monday.", image: `${IMAGE_BASE}/preparation/revise-exam.webp` },
  { id: "pass-exam", term: "pass an exam", meaning: "achieve the result needed to be successful in an exam", example: "She studied hard and passed the exam.", gap: "I was really pleased when I _____ my final exam.", image: `${IMAGE_BASE}/preparation/pass-exam.webp` },
  { id: "fail-exam", term: "fail an exam", meaning: "not achieve the result needed to be successful in an exam", example: "He failed the exam and had to take it again.", gap: "I was worried that I might _____ the exam.", image: `${IMAGE_BASE}/preparation/fail-exam.webp` },
  { id: "work-group", term: "work in a group", meaning: "work together with other people on the same task", example: "We often work in a group during class.", gap: "Some students prefer to _____ rather than work alone.", image: `${IMAGE_BASE}/preparation/work-group.webp` },
  { id: "study-independently", term: "study independently", meaning: "study by yourself and take responsibility for your own learning", example: "University students need to be able to study independently.", gap: "Online courses often require students to _____.", image: `${IMAGE_BASE}/preparation/study-independently.webp` },
  { id: "learn-doing", term: "learn by doing", meaning: "develop a skill through practical experience", example: "I find it easier to learn by doing than by reading instructions.", gap: "For practical skills, many people prefer to _____.", image: `${IMAGE_BASE}/preparation/learn-doing.webp` },
  { id: "keep-up-with", term: "keep up with", meaning: "continue to understand or complete work at the same rate as other people", example: "The course moved quickly, but I managed to keep up with the class.", gap: "I missed several lessons and found it difficult to _____ the rest of the group.", image: `${IMAGE_BASE}/preparation/keep-up-with.webp` },
  { id: "fall-behind", term: "fall behind", meaning: "make less progress than expected or than other people", example: "If you miss too many classes, you can easily fall behind.", gap: "She was ill for two weeks and started to _____.", image: `${IMAGE_BASE}/preparation/fall-behind.webp` },
];

const setBItems = [
  { id: "practical", term: "practical", meaning: "connected with real situations or doing things rather than only studying theory", example: "The course includes plenty of practical activities.", gap: "I prefer _____ lessons where I can actually practise the skill.", image: `${IMAGE_BASE}/preparation/practical.webp` },
  { id: "challenging", term: "challenging", meaning: "difficult in an interesting way that requires effort", example: "The course was challenging, but I learned a lot.", gap: "I found the final project quite _____.", image: `${IMAGE_BASE}/preparation/challenging.webp` },
  { id: "useful", term: "useful", meaning: "helping you do something or giving you knowledge that you need", example: "The teacher gave us some very useful advice.", gap: "The course taught me several _____ skills.", image: `${IMAGE_BASE}/preparation/useful.webp` },
  { id: "enjoyable", term: "enjoyable", meaning: "pleasant and giving you enjoyment", example: "Group activities made the lessons more enjoyable.", gap: "The teacher made even difficult subjects _____.", image: `${IMAGE_BASE}/preparation/enjoyable.webp` },
  { id: "stressful", term: "stressful", meaning: "making you feel worried or under pressure", example: "Exam periods can be very stressful.", gap: "Preparing for several tests at once was quite _____.", image: `${IMAGE_BASE}/preparation/stressful.webp` },
  { id: "flexible", term: "flexible", meaning: "able to change or adapt to different needs or situations", example: "Online courses can offer a more flexible timetable.", gap: "I need a _____ course that I can fit around work.", image: `${IMAGE_BASE}/preparation/flexible.webp` },
  { id: "motivating", term: "motivating", meaning: "making you want to continue working or learning", example: "Getting regular feedback can be very motivating.", gap: "Seeing your improvement is really _____.", image: `${IMAGE_BASE}/preparation/motivating.webp` },
  { id: "effective", term: "effective", meaning: "successful in producing the result you want", example: "Regular practice is an effective way to learn vocabulary.", gap: "Everyone has to find the most _____ study method for them.", image: `${IMAGE_BASE}/preparation/effective.webp` },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const educationLearningPreparationConfig = {
  storageVersion: "v1",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Studying and exams",
      introduction: "Useful expressions for talking about studying, exams and progress on a course.",
      items: setAItems,
      practice: [
        practice("a1", "I've got a test next week, so I need to _____ this weekend.", ["revise for the exam", "work in a group", "fall behind"], "revise for the exam", "Revise for an exam means study material again in preparation for the test."),
        practice("a2", "She needed 60% to _____, and she got 72%.", ["pass the exam", "fail the exam", "keep up with the exam"], "pass the exam", "Pass an exam means achieve the required result."),
        practice("a3", "If you don't get the minimum mark, you may _____ and have to take it again.", ["fail the exam", "study independently", "learn by doing"], "fail the exam", "Fail an exam means not achieve the required result."),
        practice("a4", "For this project, four students have to _____ and produce one presentation.", ["work in a group", "revise for an exam", "fall behind"], "work in a group", "Working in a group means collaborating on the same task."),
        practice("a5", "At university, students are expected to _____ much more than at school.", ["study independently", "pass an exam", "work in a group"], "study independently", "Study independently means take responsibility for your own study."),
        practice("a6", "I understand practical skills much better when I can _____.", ["learn by doing", "fail an exam", "keep up with"], "learn by doing", "Learn by doing means learn through practical experience."),
        practice("a7", "The teacher was moving very quickly, and I found it difficult to _____.", ["keep up with the class", "fall behind the class", "revise for the class"], "keep up with the class", "Keep up with means continue at the same rate as other people."),
        practice("a8", "If you miss several weeks of lessons, it's easy to _____.", ["fall behind", "learn by doing", "pass an exam"], "fall behind", "Fall behind means make less progress than expected."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Evaluating learning",
      introduction: "Flexible adjectives for evaluating courses, lessons, study methods and learning experiences.",
      items: setBItems,
      practice: [
        practice("b1", "The course is very _____: we spend most of the time actually practising the skill.", ["practical", "stressful", "flexible"], "practical", "Practical learning involves real activities rather than only theory."),
        practice("b2", "The subject is quite _____, but I enjoy having to think hard.", ["challenging", "useful", "enjoyable"], "challenging", "Challenging means difficult in a way that requires effort."),
        practice("b3", "Learning how to give presentations has been really _____ for my job.", ["useful", "stressful", "motivating"], "useful", "Useful knowledge or skills help you in real situations."),
        practice("b4", "The teacher uses games and discussions to make the lessons more _____.", ["enjoyable", "effective", "challenging"], "enjoyable", "Enjoyable means pleasant and fun to experience."),
        practice("b5", "Having three exams in the same week was extremely _____.", ["stressful", "flexible", "practical"], "stressful", "Stressful situations create worry or pressure."),
        practice("b6", "The online course is very _____ because I can choose when to study.", ["flexible", "motivating", "challenging"], "flexible", "A flexible course can adapt to different schedules or needs."),
        practice("b7", "It's very _____ when you can see that your English is improving.", ["motivating", "stressful", "practical"], "motivating", "Something motivating makes you want to continue."),
        practice("b8", "For me, short daily study sessions are more _____ than studying for hours once a week.", ["effective", "enjoyable", "flexible"], "effective", "Effective means successful in achieving the result you want."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "I missed two weeks of the course and started to _____.", ["fall behind", "pass an exam", "work in a group"], "fall behind", "Missing lessons can cause you to make less progress than the rest of the class."),
    practice("m2", "The course was _____, but completing it gave me a real sense of achievement.", ["challenging", "flexible", "stressful"], "challenging", "Challenging suggests difficulty that requires effort and can still be positive."),
    practice("m3", "Some people prefer to _____ because they can organise their own time.", ["study independently", "fail an exam", "learn in a group"], "study independently", "Independent learners manage much of their own study."),
    practice("m4", "Regular practice is usually more _____ than studying everything the night before an exam.", ["effective", "enjoyable", "flexible"], "effective", "Effective describes a method that produces good results."),
    practice("m5", "I find practical subjects easier because I prefer to _____.", ["learn by doing", "keep up with", "revise for an exam"], "learn by doing", "Learning by doing means developing a skill through practical experience."),
    practice("m6", "It can be very _____ waiting to find out whether you have passed an important exam.", ["stressful", "practical", "useful"], "stressful", "Stressful describes something that creates worry or pressure."),
    practice("m7", "I was worried at first, but I managed to _____ the rest of the class.", ["keep up with", "fall behind", "fail"], "keep up with", "Keep up with means continue at the same pace as other people."),
    practice("m8", "Working with classmates can be _____ because other people give you new ideas.", ["motivating", "flexible", "stressful"], "motivating", "Other people can encourage you to continue and make an effort."),
  ],
  writeTest: {
    title: "Write the key words",
    introduction: "Complete each sentence with one important word from the expressions you have learned. Four items come from each set.",
    items: [
      { id: "write-revise", prompt: "I need to _____ for my exam this weekend.", answer: "revise", acceptedAnswers: ["study"], feedback: "The target expression is ‘revise for an exam’; ‘study for an exam’ is also natural.", image: `${IMAGE_BASE}/preparation/revise-exam.webp` },
      { id: "write-pass", prompt: "You need at least 60% to _____ the exam.", answer: "pass", feedback: "The collocation is ‘pass an exam’.", image: `${IMAGE_BASE}/preparation/pass-exam.webp` },
      { id: "write-keep-up", prompt: "The course moves quickly, so you have to keep _____ with the work.", answer: "up", feedback: "The full expression is ‘keep up with’.", image: `${IMAGE_BASE}/preparation/keep-up-with.webp` },
      { id: "write-fall-behind", prompt: "If you miss too many lessons, you may fall _____.", answer: "behind", feedback: "The full expression is ‘fall behind’.", image: `${IMAGE_BASE}/preparation/fall-behind.webp` },
      { id: "write-challenging", prompt: "The course was difficult but really _____.", answer: "challenging", acceptedAnswers: ["rewarding"], feedback: "The target word is ‘challenging’; ‘rewarding’ can also work in this sentence, although the meaning is slightly different.", image: `${IMAGE_BASE}/preparation/challenging.webp` },
      { id: "write-stressful", prompt: "Exam periods can be very _____.", answer: "stressful", acceptedAnswers: ["stress-inducing"], feedback: "The target word is ‘stressful’.", image: `${IMAGE_BASE}/preparation/stressful.webp` },
      { id: "write-flexible", prompt: "Online learning can offer a more _____ timetable.", answer: "flexible", feedback: "Flexible means able to adapt to different needs or schedules.", image: `${IMAGE_BASE}/preparation/flexible.webp` },
      { id: "write-effective", prompt: "Regular practice is an _____ way to improve.", answer: "effective", acceptedAnswers: ["efficient"], feedback: "The target word is ‘effective’: it produces the intended result.", image: `${IMAGE_BASE}/preparation/effective.webp` },
    ],
  },
  ideaTasks: [
    {
      id: "learning-style",
      question: "What kind of learning works best for you?",
      instruction: "Choose the points that would be easiest for you to talk about.",
      minimum: 3,
      ideas: ["work in a group", "study independently", "learn by doing", "practical lessons", "challenging but enjoyable work"],
    },
    {
      id: "course-progress",
      question: "What helps a student make progress on a course?",
      instruction: "Choose points you could explain with a reason or example.",
      minimum: 3,
      ideas: ["revise for an exam", "keep up with the class", "avoid falling behind", "a motivating course", "an effective study method"],
    },
  ],
  rehearsal: {
    question: "Do you prefer to study independently or work in a group? Why?",
    image: `${IMAGE_BASE}/part2_task05_studying_at_home.webp`,
    imageAlt: "A person studying independently at home",
    ideaPrompts: ["learning by doing", "practical or challenging work", "keeping up with the course", "an enjoyable, motivating or effective method"],
    usefulChunks: ["I prefer to…", "One advantage is…", "For example…"],
  },
};
