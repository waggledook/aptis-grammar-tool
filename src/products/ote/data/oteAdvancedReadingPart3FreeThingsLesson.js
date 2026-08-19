import { advancedReadingPart3ClassroomTasks } from "./oteAdvancedReadingPart3ClassroomTasks.js";

export const FREE_THINGS_LESSON_GAME_TYPE = "ote-advanced-reading-part3-free-things-lesson";
export const FREE_THINGS_LESSON_TASK_ID = "c1-free-things";

export const freeThingsLessonTask = advancedReadingPart3ClassroomTasks[FREE_THINGS_LESSON_TASK_ID];

export const freeThingsLesson = {
  id: FREE_THINGS_LESSON_TASK_ID,
  title: freeThingsLessonTask.title,
  gistSeconds: 180,
  placementSeconds: 360,
  gistPrompt: "Read quickly for the writer’s overall message. Do not try to solve the gaps yet.",
  sentenceFocus: [
    {
      letter: "D",
      keyPhrases: ["absence of a price", "demand harder to interpret", "because requesting something no longer reveals how strongly it is wanted"],
      explanation: "‘The absence of a price’ points back to a price being removed. The sentence then states a problem—demand is harder to interpret—and the clause beginning ‘because’ explains why. Look for a passage that moves from removing a price to uncertainty about what demand really means.",
    },
    {
      letter: "E",
      keyPhrases: ["not whether free provision is good or bad, but", "which barrier is being removed", "what replaces it"],
      explanation: "The ‘not … but …’ structure rejects a simple judgement and replaces it with two questions: what improves and what new barrier appears. This kind of sentence is likely to guide a balanced conclusion rather than add another example.",
    },
  ],
  gaps: {
    1: {
      beforeHighlights: [
        "a limited number of places on a course",
        "Make the same course free and many of them may register",
      ],
      afterHighlights: ["With supply unchanged", "the increase in applications"],
      explanation: "‘A limited number of places’ establishes fixed supply, while ‘many … may register’ establishes rising demand. After the gap, ‘supply unchanged’ and ‘increase in applications’ restate the same contrast. The missing sentence must bring those two sides together.",
    },
    2: {
      beforeHighlights: [
        "Removing that mechanism",
      ],
      afterHighlights: ["therefore", "no longer a reliable measure of need", "cost almost nothing"],
      explanation: "‘Removing that mechanism’ means removing price. After the gap, ‘therefore’ shows that the missing sentence must supply a reason, and ‘no longer a reliable measure of need’ states its consequence. The final reference to applying because it ‘cost almost nothing’ explains why requests no longer show strength of demand.",
    },
    3: {
      beforeHighlights: [
        "a limited number of water-saving devices",
        "demand exceeds supply",
        "decide who receives them",
      ],
      afterHighlights: ["barrier that once consisted of money", "may reappear as"],
      explanation: "‘Limited number’ and ‘demand exceeds supply’ establish continuing scarcity; ‘decide who receives them’ shows that access must still be rationed. After the gap, the old money barrier ‘may reappear’ in other forms. The missing sentence must name that replacement rather than claim that scarcity has disappeared.",
    },
    4: {
      beforeHighlights: ["the cost of abandoning a free reservation is normally small"],
      afterHighlights: ["Lower commitment at the point of booking", "a person who has paid", "somebody holding a free place"],
      explanation: "The sentence before the gap says that abandoning a free reservation has little cost. ‘Lower commitment’ then names the result, while the contrast between someone who ‘has paid’ and someone ‘holding a free place’ explains it. The missing sentence must connect free booking with a more provisional decision.",
    },
    5: {
      beforeHighlights: [
        "without making a direct payment",
        "None is costless to provide",
        "The cost may instead be covered",
      ],
      afterHighlights: ["Recognising this", "financing arrangement visible"],
      explanation: "‘Without making a direct payment’ contrasts with ‘None is costless to provide’, and ‘the cost may instead be covered’ identifies other payers. Crucially, ‘Recognising this’ points back to the distinction stated in the missing sentence: free at the point of use does not mean costless. ‘Financing arrangement’ confirms that this is the idea being developed.",
    },
    6: {
      beforeHighlights: [
        "None of these problems overturns the case for removing prices",
        "would be impossible if every recipient had to pay",
      ],
      afterHighlights: [
        "financial barrier",
        "impossible booking process",
        "equally",
        "does not prove",
      ],
      explanation: "The writer first says that the problems do not defeat the case for removing prices, and the vaccination example shows a real benefit. After the gap, the contrast between ‘financial barrier’ and ‘impossible booking process’ weighs a removed barrier against a new one. ‘Equally’ and ‘does not prove’ then prevent the opposite overstatement. The missing sentence must introduce this balanced test rather than argue simply for or against free provision.",
    },
  },
};
