// src/data/packKey/readingPart2.js

export const readingPart2Key = {
    chapterId: "reading-part-2",
    title: "Reading Part 2",
    sections: [
  
      {
        sectionId: "part2_guided",
        title: "Guided Reading Tasks — Part 2 (Sentence order)",
        items: [
  
          {
            id: "R2-G01",
            title: "Task 1: Collecting a parcel from a locker",
            type: "Ordering (put the sentences in the correct order)",
            qa: [
              {
                label: "Correct order",
                prompt: "Put A–E in order after the given first sentence.",
                answer: "D → B → E → A → C",
                explanation:
                  "D starts the process (tap ‘Collect’ and enter your code). B follows because 'It will then…' refers to the previous action. E continues with 'Next…'. A refers to trying the door after this step. C is a final reminder after collecting the parcel."
              }
            ]
          },
  
          {
            id: "R2-G02",
            title: "Task 2: Noise in the town library",
            type: "Ordering (put the sentences in the correct order)",
            qa: [
              {
                label: "Correct order",
                prompt: "Put A–E in order after the given first sentence.",
                answer: "E → A → B → D → C",
                explanation:
                  "E gives a positive general comment. A introduces contrast ('However…'). B adds a specific example ('In particular…'). D explains the action taken as a result. C adds an additional measure ('also'), so it logically follows."
              }
            ]
          }
  
        ]
      },
  
  
  
      {
        sectionId: "part2_practice",
        title: "Practice Reading Tasks — Part 2 (Sentence order)",
        items: [
  
          {
            id: "R2-P01",
            title: "Task 1: New booking system notice",
            type: "Ordering (put the sentences in the correct order)",
            qa: [
              {
                label: "Correct order",
                prompt: "Put A–E in order after the given first sentence.",
                answer: "D → C → B → A → E",
                explanation:
                  "D explains the reason for the new system. C introduces the main rule. B contrasts with people who cannot use the internet. A provides additional help. E is the final instruction when attending."
              }
            ]
          },
  
          {
            id: "R2-P02",
            title: "Task 2: Workplace wellbeing survey",
            type: "Ordering (put the sentences in the correct order)",
            qa: [
              {
                label: "Correct order",
                prompt: "Put A–E in order after the given first sentence.",
                answer: "D → A → C → E → B",
                explanation:
                  "D gives the positive overall result. A introduces a concern ('Nevertheless…'). C expands on suggestions. E explains the action being taken as a result. B adds an additional action ('also'), so it comes last."
              }
            ]
          }
  
        ]
      }
  
    ]
  };
  