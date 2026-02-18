export const coreVocabularyKey = {
  chapterId: "core-vocabulary",
  title: "Core Vocabulary",
  sections: [
    // =========================
    // 1) Rejecting Incorrect Options
    // =========================
    {
      sectionId: "rejectingIncorrectOptions",
      title: "Rejecting Incorrect Options",
      items: [
        {
          id: "CV-T01",
          title: "Rejecting Incorrect Options (A–G)",
          type: "Provide a better option",
          qa: [
            {
              label: "A",
              prompt: "He ___ a lot of money at his job. (wins)",
              answer: "earns / makes",
              explanation:
                "In English, you usually ‘win’ prizes/competitions/games (e.g., win a match, win a prize). For money from work, we say ‘earn money’ or ‘make money’."
            },
            {
              label: "B",
              prompt: "Hurry, or you’ll ___ the bus. (lose)",
              answer: "miss",
              explanation:
                "‘Lose’ means you can’t find something anymore (lose your keys) or you fail to win (lose a game). For transport, we say ‘miss the bus/train/flight’ (= arrive too late)."
            },
            {
              label: "C",
              prompt: "Can you ___ me a pen please? (borrow)",
              answer: "lend",
              explanation:
                "‘Borrow’ = take something from someone for a short time. ‘Lend’ = give something to someone for a short time. So: ‘Can you lend me a pen?’"
            },
            {
              label: "D",
              prompt: "I can’t ___ with this noise anymore. (tolerate)",
              answer: "tolerate this noise / put up with this noise",
              explanation:
                "‘Tolerate’ is a transitive verb (it takes a direct object): ‘tolerate this noise.’ If you want ‘with’, use a phrasal verb like ‘put up with’."
            },
            {
              label: "E",
              prompt: "I’m very ___ to loud noises. (sensible)",
              answer: "sensitive",
              explanation:
                "‘Sensible’ means practical/reasonable (a sensible decision). ‘Sensitive’ means easily affected by something (sensitive to loud noises)."
            },
            {
              label: "F",
              prompt: "Trim your ___ regularly so it doesn’t get in your eyes. (beard)",
              answer: "hair / fringe",
              explanation:
                "A beard doesn’t normally ‘get in your eyes’ (it’s on your face). The sentence ending suggests something that can fall over your eyes: ‘hair’ or ‘fringe’."
            },
            {
              label: "G",
              prompt: "We finally ___ at an agreement. (reached)",
              answer: "reached an agreement",
              explanation:
                "‘Reach’ is transitive here: ‘reach an agreement’ (no preposition). We say ‘arrive at an agreement’ or ‘come to an agreement’, but not ‘reach at’."
            }
          ]
        }
      ]
    },

    // =========================
    // 2) Identifying Synonyms
    // =========================
    {
      sectionId: "identifyingSynonyms",
      title: "Identifying Synonyms",
      items: [
        {
          id: "CV-T02",
          title: "Task 1 — Nouns",
          type: "Choose the closest meaning",
          qa: [
            {
              label: "A",
              prompt: "Proposal → (Warning / Suggestion / Explanation / Report)",
              answer: "Suggestion",
              explanation:
                "A ‘proposal’ is an idea/plan you put forward — closest to ‘suggestion’."
            },
            {
              label: "B",
              prompt: "Accommodation → (House / Landlord / Location / Lodging)",
              answer: "Lodging",
              explanation:
                "‘Accommodation’ means a place to stay — ‘lodging’ is the best match."
            },
            {
              label: "C",
              prompt: "Benefit → (Advantage / Profit / Prize / Drawback)",
              answer: "Advantage",
              explanation:
                "A ‘benefit’ is a positive effect — closest to ‘advantage’."
            },
            {
              label: "D",
              prompt: "Outcome → (Cause / Condition / Result / Decision)",
              answer: "Result",
              explanation:
                "An ‘outcome’ is what happens in the end — a ‘result’."
            },
            {
              label: "E",
              prompt: "Evidence → (Rumour / Findings / Proof / Research)",
              answer: "Proof",
              explanation:
                "‘Evidence’ is information that supports a claim — closest to ‘proof’."
            }
          ]
        },
        {
          id: "CV-T03",
          title: "Task 2 — Adjectives",
          type: "Choose the closest meaning",
          qa: [
            {
              label: "A",
              prompt: "Reliable → (Sensible / Accurate / Dependable / Punctual)",
              answer: "Dependable",
              explanation:
                "‘Reliable’ means you can trust it/person — ‘dependable’ is closest."
            },
            {
              label: "B",
              prompt: "Exhausted → (Worn out / Relaxed / Sleepy / Fed up)",
              answer: "Worn out",
              explanation:
                "‘Exhausted’ = extremely tired — ‘worn out’ matches best."
            },
            {
              label: "C",
              prompt: "Familiar → (Related / Friendly / Intimate / Well-known)",
              answer: "Well-known",
              explanation:
                "‘Familiar’ means known/recognisable — closest to ‘well-known’."
            },
            {
              label: "D",
              prompt: "Awkward → (Rare / Shameful / Harmful / Uncomfortable)",
              answer: "Uncomfortable",
              explanation:
                "‘Awkward’ situations often feel socially uncomfortable — best match."
            },
            {
              label: "E",
              prompt: "Mild → (Unimportant / Extreme / Gentle / Serious)",
              answer: "Gentle",
              explanation:
                "‘Mild’ means not strong/harsh — closest to ‘gentle’."
            }
          ]
        },
        {
          id: "CV-T04",
          title: "Task 3 — Verbs",
          type: "Choose the closest meaning",
          qa: [
            {
              label: "A",
              prompt: "Put off → (Call off / Delay / Cancel / Put away)",
              answer: "Delay",
              explanation:
                "‘Put off’ = postpone — closest to ‘delay’."
            },
            {
              label: "B",
              prompt: "Fix → (Adjust / Mend / Release / Edit)",
              answer: "Mend",
              explanation:
                "‘Fix’ (repair) is closest to ‘mend’."
            },
            {
              label: "C",
              prompt: "Reject → (Demand / Doubt / Turn down / Avoid)",
              answer: "Turn down",
              explanation:
                "To ‘reject’ an offer/request = ‘turn it down’."
            },
            {
              label: "D",
              prompt: "Guarantee → (Ensure / Predict / Warrant / Assess)",
              answer: "Ensure",
              explanation:
                "To ‘guarantee’ something is to make sure it happens — ‘ensure’."
            },
            {
              label: "E",
              prompt: "Claim → (Admit / Refuse / Explain / Allege)",
              answer: "Allege",
              explanation:
                "‘Claim’ (state something is true, sometimes without proof) matches ‘allege’ best."
            }
          ]
        }
      ]
    },

    // =========================
    // 3) Vocabulary Exam Practice
    // =========================
    {
      sectionId: "vocabExamPractice",
      title: "Vocabulary Exam Practice — Key",
      items: [
        {
          id: "CV-EX01",
          title: "Exam Practice (Q1–Q25)",
          type: "Exam practice",
          qa: [
            // Task 1 (1–5)
            {
              label: "1",
              prompt: "command",
              answer: "e. order",
              explanation: "‘Command’ is closest to ‘order’ here."
            },
            {
              label: "2",
              prompt: "permission",
              answer: "g. approval",
              explanation: "Permission = approval/allowance."
            },
            {
              label: "3",
              prompt: "issue",
              answer: "j. problem",
              explanation: "An issue is a problem/topic of concern."
            },
            {
              label: "4",
              prompt: "scarcity",
              answer: "b. shortage",
              explanation: "Scarcity = shortage/lack."
            },
            {
              label: "5",
              prompt: "wealth",
              answer: "i. fortune",
              explanation: "Wealth = fortune (a lot of money)."
            },

            // Task 2 (6–10)
            {
              label: "6",
              prompt: "To cancel something is to _____.",
              answer: "f. call off",
              explanation: "Call off = cancel (an event/plan)."
            },
            {
              label: "7",
              prompt: "To learn new information is to _____.",
              answer: "j. find out",
              explanation: "Find out = discover/learn information."
            },
            {
              label: "8",
              prompt: "To act like something you are not is to _____.",
              answer: "g. pretend",
              explanation: "Pretend = act as if something is true."
            },
            {
              label: "9",
              prompt: "To start a product officially is to _____.",
              answer: "d. launch",
              explanation: "Launch = introduce/start officially."
            },
            {
              label: "10",
              prompt: "To remove writing or marks is to _____.",
              answer: "b. erase",
              explanation: "Erase = remove writing/marks."
            },

            // Task 3 (11–15)
            {
              label: "11",
              prompt: "Your instructions are too ___. Be precise!",
              answer: "b. vague",
              explanation: "Vague = not clear/specific."
            },
            {
              label: "12",
              prompt: "She made ___ decisions without thinking.",
              answer: "g. impulsive",
              explanation: "Impulsive decisions are made quickly without thinking."
            },
            {
              label: "13",
              prompt: "She gave a very ___, clear explanation.",
              answer: "d. thorough",
              explanation: "Thorough = detailed and complete."
            },
            {
              label: "14",
              prompt: "It was comfortable but ___ — no luxuries.",
              answer: "j. basic",
              explanation: "Basic = simple, without extras."
            },
            {
              label: "15",
              prompt: "His points were completely ___ to the discussion.",
              answer: "f. irrelevant",
              explanation: "Irrelevant = not connected to the topic."
            },

            // Task 4 (16–20)
            {
              label: "16",
              prompt: "Bear in ___ that the office closes at 5 pm.",
              answer: "h. mind",
              explanation: "Fixed phrase: bear in mind."
            },
            {
              label: "17",
              prompt: "I waited in a long ___ at the market.",
              answer: "e. queue",
              explanation: "Queue = line of people waiting (BrE)."
            },
            {
              label: "18",
              prompt: "I’ve got a doctor’s ___ this afternoon.",
              answer: "g. appointment",
              explanation: "Appointment = arranged meeting time."
            },
            {
              label: "19",
              prompt: "His breaking my phone was the last ___.",
              answer: "b. straw",
              explanation: "Idiom: the last straw."
            },
            {
              label: "20",
              prompt: "She asked for a ___ and got her money back.",
              answer: "j. refund",
              explanation: "Refund = money returned."
            },

            // Task 5 (21–25)
            {
              label: "21",
              prompt: "career",
              answer: "e. prospects",
              explanation: "Career prospects = future opportunities in your career."
            },
            {
              label: "22",
              prompt: "heavy",
              answer: "j. workload",
              explanation: "Heavy workload = a lot of work to do."
            },
            {
              label: "23",
              prompt: "strong",
              answer: "h. argument",
              explanation: "Strong argument = convincing reasoning."
            },
            {
              label: "24",
              prompt: "civil",
              answer: "a. servant",
              explanation: "Civil servant = government/public-sector worker."
            },
            {
              label: "25",
              prompt: "breathtaking",
              answer: "g. scenery",
              explanation: "Breathtaking scenery = extremely beautiful views."
            }
          ]
        }
      ]
    }
  ]
};
