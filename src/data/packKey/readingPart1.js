// src/data/packKey/readingPart1.js

export const readingPart1Key = {
    chapterId: "reading-part-1",
    title: "Reading Part 1",
    sections: [
      {
        sectionId: "part1_guided",
        title: "Guided Reading Tasks — Part 1 (Word choices)",
        items: [
          {
            id: "R1-G01",
            title: "Task 1: Party invitation",
            type: "MCQ (choose one word per gap)",
            qa: [
              {
                label: "0",
                prompt: "I’d like to ___ you to my birthday dinner.",
                answer: "invite",
                explanation:
                  "‘Invite’ is the verb used to ask someone to an event. ‘Invent’ = create; ‘involve’ = include (not used like this)."
              },
              {
                label: "1",
                prompt: "It’s ___ Saturday evening at 8.",
                answer: "on",
                explanation:
                  "We use **on** with days/dates: on Saturday / on 12th May. ‘At’ is for times; ‘in’ is for months/years/parts of the day."
              },
              {
                label: "2",
                prompt: "Can you ___ a dessert, if you have time?",
                answer: "bring",
                explanation:
                  "‘Bring’ = take something to a place (towards the speaker/event). ‘Take’ focuses on away from the speaker; ‘carry’ is about physical carrying, not the usual verb for food to a dinner."
              },
              {
                label: "3",
                prompt: "We already have ___ drinks.",
                answer: "some",
                explanation:
                  "Affirmative statement + plural countable → **some**. ‘Any’ is typical in negatives/questions; ‘much’ is for uncountable nouns."
              },
              {
                label: "4",
                prompt: "I can’t cook everything, ___ help would be great.",
                answer: "so",
                explanation:
                  "This expresses **result**: I can’t do everything → **so** help would be great. ‘Because’ gives a reason; ‘such’ needs a noun phrase like ‘such help’ but wouldn’t express the same clear result link here."
              },
              {
                label: "5",
                prompt: "The restaurant is ___ to the metro station.",
                answer: "close",
                explanation:
                  "Because the sentence already has **to**, the best fit is **close to**. ‘Near’ is usually used without ‘to’ (near the station), and ‘between’ needs two reference points."
              }
            ]
          },
          {
            id: "R1-G02",
            title: "Task 2: Shopping note",
            type: "MCQ (choose one word per gap)",
            qa: [
              {
                label: "0",
                prompt: "Can you ___ some bread on your way home?",
                answer: "buy",
                explanation:
                  "‘Buy’ is the natural verb for purchasing bread. ‘Bring’ would mean you already have it; ‘pick’ needs ‘pick up’ to mean collect."
              },
              {
                label: "1",
                prompt: "We need it for ___ week’s lunches.",
                answer: "next",
                explanation:
                  "Common phrase: **next week**. ‘Following’ is possible but more formal and less natural here; ‘first’ doesn’t fit the meaning."
              },
              {
                label: "2",
                prompt: "It’s a ___ day, so maybe we can eat outside.",
                answer: "warm",
                explanation:
                  "Eating outside suggests pleasant weather → **warm**. ‘Cold’ contradicts that idea; ‘sun’ would need an adjective (‘sunny’), not the noun ‘sun’."
              },
              {
                label: "3",
                prompt: "I’m ___ work early today.",
                answer: "leaving",
                explanation:
                  "Correct structure: **I’m leaving** work early today. ‘Arriving’ changes the meaning; ‘finish’ would need ‘finishing’ or a different structure."
              },
              {
                label: "4",
                prompt: "Don’t forget your ___! It might rain later.",
                answer: "umbrella",
                explanation:
                  "Rain → umbrella. ‘Wallet’ and ‘keys’ don’t connect to the weather clue."
              },
              {
                label: "5",
                prompt: "I’ll be home ___ 5:30.",
                answer: "around",
                explanation:
                  "Approximate time → **around** 5:30. ‘Exactly’ means precise; ‘near’ is more natural for location than time here."
              }
            ]
          }
        ]
      },
  
      {
        sectionId: "part1_practice",
        title: "Practice Reading Tasks — Part 1 (Word choices)",
        items: [
          {
            id: "R1-P01",
            title: "Task 1: Reservation",
            type: "MCQ (choose one word per gap)",
            qa: [
              {
                label: "0",
                prompt: "How’s it ___?",
                answer: "going",
                explanation:
                  "Fixed phrase: **How’s it going?** ‘How’s it go?’ is not used; ‘been’ would need a different structure."
              },
              {
                label: "1",
                prompt: "Can you ___ a table for us at the Italian restaurant tonight?",
                answer: "book",
                explanation:
                  "We **book** a table (or ‘reserve’). ‘Buy’ and ‘make’ don’t fit this collocation."
              },
              {
                label: "2",
                prompt: "Please call ___ 6 pm because they get busy.",
                answer: "before",
                explanation:
                  "Calling earlier makes sense because they get busy later → **before** 6 pm. ‘After’ is the opposite; ‘until’ doesn’t fit the instruction."
              },
              {
                label: "3",
                prompt: "Don’t ___ to ask for a table by the window.",
                answer: "forget",
                explanation:
                  "Fixed phrase: **Don’t forget to…** ‘Remind’ would need an object (‘Remind me to…’); ‘worry’ doesn’t fit."
              },
              {
                label: "4",
                prompt: "The restaurant ___ at 11 pm.",
                answer: "shuts",
                explanation:
                  "Restaurants **shut/close** at a time. ‘Opens’ is the opposite; ‘sets up’ is unrelated."
              },
              {
                label: "5",
                prompt: "I’ll meet you outside your ___ at 7:30.",
                answer: "office",
                explanation:
                  "‘Outside your office’ is a natural meeting point. ‘Outside your kitchen/desk’ is unnatural in this context."
              }
            ]
          },
  
          {
            id: "R1-P02",
            title: "Task 2: Work email",
            type: "MCQ (choose one word per gap)",
            qa: [
              {
                label: "0",
                prompt: "Could you ___ me the notes from yesterday’s meeting?",
                answer: "send",
                explanation:
                  "We **send** notes. ‘Receive’ is what the other person would do; ‘make’ doesn’t fit."
              },
              {
                label: "1",
                prompt: "Is the next meeting in the ___ room?",
                answer: "same",
                explanation:
                  "Common phrase: **the same room** (the room already known). ‘Similar/alike’ don’t fit this structure naturally."
              },
              {
                label: "2",
                prompt: "I don’t ___ the date for it.",
                answer: "recall",
                explanation:
                  "‘Recall’ = remember. ‘Remind’ needs an object (‘remind me’); ‘write’ doesn’t fit the meaning."
              },
              {
                label: "3",
                prompt: "Please call me ___ lunch if you can.",
                answer: "before",
                explanation:
                  "Natural meaning: call earlier in the day → **before lunch**. ‘While’ is odd with a phone call here; ‘when’ doesn’t fit."
              },
              {
                label: "4",
                prompt: "I’ll be studying in the ___ this afternoon.",
                answer: "library",
                explanation:
                  "Studying in the **library** is the natural collocation; cinema/metro don’t fit."
              },
              {
                label: "5",
                prompt: "I ___ to finish this report by Friday.",
                answer: "need",
                explanation:
                  "‘Need to’ expresses necessity/requirement. ‘Must’ is possible but stronger/more formal; ‘should’ is advice, not necessity."
              }
            ]
          }
        ]
      }
    ]
  };
  