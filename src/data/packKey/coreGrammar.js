export const coreGrammarKey = {
    chapterId: "core-grammar",
    title: "Core Grammar",
    sections: [
      {
        sectionId: "training",
        title: "Training",
        items: [
          {
            id: "CG-T01",
            title: "Grammar Prediction Task 1",
            type: "MCQ (circle the correct option)",
            qa: [
              {
                label: "A",
                prompt: "The neighbour ___ fixed our Wi-Fi is an engineer.",
                answer: "that",
                explanation:
                  "We need a relative pronoun for a person acting as the subject of ‘fixed’. ‘Whom’ is object-only; ‘which’ is for things."
              },
              {
                label: "B",
                prompt: "We ___ the latest episode when the power went out.",
                answer: "were watching",
                explanation:
                  "Past continuous for an action in progress interrupted by a past event (‘went out’)."
              },
              {
                label: "C",
                prompt: "If we ___ to pack our camera, we would have taken photos.",
                answer: "had remembered",
                explanation:
                  "Third conditional: If + past perfect → would have + past participle."
              },
              {
                label: "D",
                prompt: "The contract ___ by the board of directors later this week.",
                answer: "will be signed",
                explanation:
                  "Future time + passive (the contract receives the action)."
              },
              {
                label: "E",
                prompt: "They invited 100s of guests, but ___ people actually turned up.",
                answer: "few",
                explanation:
                  "‘People’ is countable plural; contrast implies a small number."
              }
            ]
          },
          {
            id: "CG-T02",
            title: "Grammar Prediction Task 2 (C1 focus)",
            type: "MCQ (circle the correct option)",
            qa: [
              {
                label: "A",
                prompt: "It’s high time ___ studying harder. The exam is in two days!",
                answer: "you started",
                explanation:
                  "‘It’s high time…’ commonly uses past simple to express present urgency (an ‘unreal’ form)."
              },
              {
                label: "B",
                prompt: "You ___ brought food — there was loads already!",
                answer: "needn’t have",
                explanation:
                  "Past regret/criticism: you did it, but it wasn’t necessary."
              },
              {
                label: "C",
                prompt: "Seldom ___ so cold during the month of May.",
                answer: "has it been",
                explanation:
                  "Negative adverb fronting triggers inversion: has + subject + been."
              },
              {
                label: "D",
                prompt: "She recommended ___ more alternative sources of protein.",
                answer: "eating",
                explanation:
                  "Verb pattern: recommend + V-ing (not ‘recommend someone to…’)."
              },
              {
                label: "E",
                prompt: "In those days, they ___ in their mountain house every summer.",
                answer: "would stay",
                explanation:
                  "Past habitual: ‘would’ + base verb. (‘use to’ is incorrect; it must be ‘used to’.)"
              }
            ]
          },
          {
            id: "CG-T03",
            title: "Rejecting Incorrect Options",
            type: "Provide a correct alternative",
            qa: [
              {
                label: "A",
                prompt: "He is having dinner when I called.",
                answer: "He was having dinner when I called.",
                explanation:
                  "Past continuous fits a background action interrupted by a past event."
              },
              {
                label: "B",
                prompt: "The house is built right now. It should be finished in two weeks.",
                answer: "The house is being built right now.",
                explanation:
                  "‘Right now’ → present continuous passive (is being built)."
              },
              {
                label: "C",
                prompt: "Mary has decided that she needs other job as soon as possible.",
                answer: "Mary has decided that she needs another job as soon as possible.",
                explanation:
                  "Singular countable noun (‘job’) → ‘another’, not ‘other’."
              },
              {
                label: "D",
                prompt: "Despite it was raining heavily, the match went on as planned.",
                answer: "Although it was raining heavily, the match went on as planned.",
                explanation:
                  "‘Despite’ needs a noun/gerund: ‘Despite the rain / Despite it raining…’. ‘Although’ correctly takes a clause."
              },
              {
                label: "E",
                prompt: "If I had passed the speaking exam, I would have worked there today.",
                answer: "If I had passed the speaking exam, I would be working there today.",
                explanation:
                  "Mixed conditional: past condition → present result (‘today’)."
              },
              {
                label: "F",
                prompt: "Jane and Pete eat out a lot. None of them likes cooking very much.",
                answer: "Jane and Pete eat out a lot. Neither of them likes cooking very much.",
                explanation:
                  "Two people → ‘neither (of them)’, not ‘none’."
              },
              {
                label: "G",
                prompt: "The choice of dishes was poor. However, the service was awful.",
                answer: "The choice of dishes was poor. What’s more, the service was awful.",
                explanation:
                  "Second sentence reinforces the negative; additive linkers fit best (‘What’s more’, ‘On top of that’, ‘To make matters worse’)."
              }
            ]
          }
        ]   // closes the TRAINING items array
    },    // closes the TRAINING section object

  // ✅ NEW SECTION GOES HERE (same level as "training")
  {
        sectionId: "examPractice",
        title: "Grammar Exam Practice — Key",
        items: [
          {
            id: "cg_exam_01",
            type: "Exam practice",
            title: "Exam Practice Set 1 (Q1–Q25)",
            qa: [
              {
                label: "1",
                prompt: "Dave ______ for twelve years now.",
                answer: "has worked",
                explanation:
                  "Correct: 'for twelve years now' suggests a state/period continuing up to the present → present perfect. 'Works' is not framed as a continuing period here; 'is working' sounds temporary and doesn’t match the long duration as well."
              },
              {
                label: "2",
                prompt: "He told me he ______ yesterday’s meeting. I wonder what happened.",
                answer: "was going to attend",
                explanation:
                  "Correct: reported speech about a past plan/intention → 'was going to'. 'Has attended' doesn’t match the past narrative; 'is going to attend' doesn’t fit after 'told me' (past reporting)."
              },
              {
                label: "3",
                prompt: "By the time I arrived, they ______ for nearly an hour.",
                answer: "had been waiting",
                explanation:
                  "Correct: an action in progress before a past point → past perfect continuous. 'Were waiting' doesn’t show it started earlier; 'have waited' doesn’t fit with a finished past time reference."
              },
              {
                label: "4",
                prompt: "You ______ park here; it’s for residents only.",
                answer: "mustn’t",
                explanation:
                  "Correct: strong prohibition → 'mustn’t'. 'Don’t have to' means no obligation (permission is possible), and 'oughtn’t' is advice, not a clear rule."
              },
              {
                label: "5",
                prompt: "I’m not very good ______ remembering names.",
                answer: "at",
                explanation:
                  "Correct collocation: 'good at + -ing'. 'In' and 'of' don’t form the standard structure here."
              },
              {
                label: "6",
                prompt: "We studied this when we were at ______ university.",
                answer: "—",
                explanation:
                  "Correct (BrE general institution use): 'at university' (no article) for the experience of being a student. 'A/the' would refer to a specific university."
              },
              {
                label: "7",
                prompt: "He denied ______ the classified documents from the office.",
                answer: "stealing",
                explanation:
                  "Correct: 'deny' is followed by a gerund (-ing). 'To steal' and 'to have stolen' are not the standard pattern with 'deny'."
              },
              {
                label: "8",
                prompt: "I’d rather ______ before it gets too late.",
                answer: "we left",
                explanation:
                  "Correct: 'I’d rather + past simple' for a preference about another subject (or a shared action): 'I’d rather we left'. 'To leave' is not used after 'rather' like this; 'we leave' sounds like a present tense statement."
              },
              {
                label: "9",
                prompt: "If you ______ to the instructions, you won’t have any problems.",
                answer: "listen",
                explanation:
                  "Correct: first conditional → present simple in the if-clause. 'Listened' changes it to past; 'will listen' is not used in the if-clause in standard conditional structure."
              },
              {
                label: "10",
                prompt: "The colleague to ______ I spoke was very helpful.",
                answer: "whom",
                explanation:
                  "Correct: after a preposition ('to'), formal relative pronoun for a person is 'whom'. 'Who' is informal and usually appears without preposition fronting; 'which' is for things."
              },
              {
                label: "11",
                prompt: "You have your own car, ______?",
                answer: "don’t you",
                explanation:
                  "Correct: statement is positive ('You have...') → negative tag with auxiliary 'do' in BrE-style tagging: 'don’t you?'. 'Haven’t you' would fit 'You’ve got...' / 'You have got...' (different structure); 'have you' is the wrong polarity."
              },
              {
                label: "12",
                prompt: "Rarely ______ such a convincing argument.",
                answer: "have I heard",
                explanation:
                  "Correct: negative adverb fronting → inversion (auxiliary before subject): 'Rarely have I heard...'. 'I have heard' has no inversion; 'heard I' is incorrect word order."
              },
              {
                label: "13",
                prompt: "A: I usually do my homework just before class. B: So ______ I!",
                answer: "do",
                explanation:
                  "Correct: agreement uses the same auxiliary as the main clause → 'So do I'. 'Am' doesn't match; 'have' would match present perfect, not present simple."
              },
              {
                label: "14",
                prompt: "I wish ______ enough to buy my own house.",
                answer: "were paid",
                explanation:
                  "Correct: 'wish' about the present uses past form; for passive, 'were paid' fits: 'I wish I were paid...'. 'Was pay' is ungrammatical; 'am paid' doesn’t match the wish/unreal structure."
              },
              {
                label: "15",
                prompt: "Petra ______ in New Mexico.",
                answer: "lives",
                explanation:
                  "Correct: present simple for a permanent/typical situation: 'lives'. 'Living' needs an auxiliary ('is living'); 'live' is base form and doesn’t agree with the subject."
              },
              {
                label: "16",
                prompt: "You really ______ to study harder if you hope to pass the exam!",
                answer: "should",
                explanation:
                  "Correct: advice/recommendation → 'should'. 'Must' is stronger (obligation); 'ought' is possible but normally 'ought to' is needed, so the option 'ought' alone doesn’t fit."
              },
              {
                label: "17",
                prompt: "Apparently, she’s ______ start university in September.",
                answer: "going to",
                explanation:
                  "Correct future plan/intention: 'going to start'. 'Going' is incomplete; 'go to' is the infinitive and doesn’t fit after 'she’s'."
              },
              {
                label: "18",
                prompt: "I ______ it doesn’t rain on your trip next weekend.",
                answer: "hope",
                explanation:
                  "Correct: 'hope' for a desired future outcome. 'Wish' is normally used for unreal/imagined situations ('I wish it didn’t...'); 'want' needs an object or different structure."
              },
              {
                label: "19",
                prompt: "______ Mont Blanc is the highest mountain in the Alps.",
                answer: "—",
                explanation:
                  "Correct: proper names usually take no article: 'Mont Blanc is...'. 'The' would imply a descriptive name (not used here); 'A' is impossible for a unique, named mountain."
              },
              {
                label: "20",
                prompt: "If you did more exercise, you ______ a lot more energy.",
                answer: "would have",
                explanation:
                  "Correct: second conditional → 'would + base verb' (state/result in the present): 'would have'. 'Will have' is first conditional; 'had have' is ungrammatical."
              },
              {
                label: "21",
                prompt: "Each candidate ______ to provide full references in their application.",
                answer: "is required",
                explanation:
                  "Correct: 'each' is singular → 'is required'. 'Are required' doesn’t agree; 'requires' would need an object ('requires candidates to...')."
              },
              {
                label: "22",
                prompt: "David invited all his friends, but ______ came.",
                answer: "nobody",
                explanation:
                  "Correct contrast: invited many, but none arrived → 'nobody'. 'Anyone' would mean at least one person; 'somebody' contradicts the idea of disappointment."
              },
              {
                label: "23",
                prompt: "Nowadays, our children show ______ interest in reading.",
                answer: "little",
                explanation:
                  "Correct: 'interest' is uncountable → 'little interest'. 'Few/fewer' are used with countable plurals."
              },
              {
                label: "24",
                prompt: "By the time you get here, the film ______.",
                answer: "will have finished",
                explanation:
                  "Correct: future perfect for an action completed before a future point: 'will have finished'. 'Will finish' is not the right timing nuance; 'is finishing' suggests an action in progress at that future moment."
              },
              {
                label: "25",
                prompt: "After many hours, they finally succeeded ______ fixing the gate.",
                answer: "in",
                explanation:
                  "Correct pattern: 'succeed in + -ing'. 'At' and 'on' don’t fit this verb pattern."
              }
            ]
          }
        ]
      }
    ]
};