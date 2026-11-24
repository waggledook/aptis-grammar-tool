// The more-inference bank. Accessible alternatives will be added with their recordings.
export const APTIS_OPINION_STRATEGY_GAME_TYPE = "aptis-listening-part3-strategy";
export const APTIS_OPINION_STRATEGY_PATH = "/teacher-resources/listening-part3-opinion-training";
export const APTIS_OPINION_STRATEGY_TITLE = "Who thinks what?";

// Add the extract ID here when its final recording is supplied.
const recordedExtractIds = new Set([
  "extract-01", "extract-02", "extract-03", "extract-04",
  "extract-05", "extract-06", "extract-07", "extract-08",
  "extract-09", "extract-10",
]);
const definitions = [
  {
    "id": "extract-01",
    "number": 1,
    "title": "Name badges at a social event",
    "stage": "Worked model",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Worked model with explicit agreement and paraphrase",
    "difficulty": "1",
    "script": [
      {
        "speaker": "Woman",
        "text": "I was relieved they gave us name badges at that neighbourhood evening. I never know how to approach someone I've just met."
      },
      {
        "speaker": "Man",
        "text": "Me too. Having a name to use makes that first sentence much less awkward."
      },
      {
        "speaker": "Woman",
        "text": "Exactly. After that, you can usually find something else to talk about."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "1",
        "text": "Name badges make it easier to start conversations with unfamiliar people.",
        "answer": "both",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "Having a name to use makes that first sentence much less awkward.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 2,
            "quote": "Exactly.",
            "kind": "support"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "A name makes the opening sentence less awkward."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "“Exactly” endorses that same benefit."
            ]
          }
        ],
        "keyPoint": "Different wording; the same opinion."
      }
    ],
    "discussion": "What evidence shows that the two speakers share the opinion?",
    "likelyError": "Choosing only the woman because she introduces the topic."
  },
  {
    "id": "extract-02",
    "number": 2,
    "title": "A pottery workshop",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Both criticise an object; they value the experience differently",
    "difficulty": "3",
    "script": [
      {
        "speaker": "Man",
        "text": "Thirty-five pounds, and I spent half the workshop waiting for the wheel. I could have bought a bowl like mine for eight."
      },
      {
        "speaker": "Woman",
        "text": "Mine wouldn't sell for eight pence. But I booked another afternoon with the same potter, at the same price. By the end, I'd made something without her touching it."
      },
      {
        "speaker": "Man",
        "text": "That was satisfying. If we'd had another half-hour actually making things, I might have joined you."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "2",
        "text": "The pottery workshop costs more than it is worth.",
        "answer": "man",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "Thirty-five pounds, and I spent half the workshop waiting for the wheel.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 2,
            "quote": "If we'd had another half-hour actually making things, I might have joined you.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "But I booked another afternoon with the same potter, at the same price.",
            "kind": "context"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "By the end, I'd made something without her touching it.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "£35, but half the workshop spent waiting.",
              "More making time might persuade him to book again."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "opposes",
            "notes": [
              "Books again at the same price.",
              "Values making something independently, despite the poor bowl."
            ]
          }
        ],
        "keyPoint": "Criticising the bowl is different from judging the workshop poor value."
      }
    ],
    "discussion": "What would need to change before the man booked again? What has the woman paid for beyond the finished bowl?",
    "likelyError": "Choosing Both because both criticise their bowls, or excluding the man because he also found making something satisfying."
  },
  {
    "id": "extract-03",
    "number": 3,
    "title": "A planetarium visit",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Experienced discomfort versus engagement with reported complaints",
    "difficulty": "3",
    "script": [
      {
        "speaker": "Woman",
        "text": "The stars looked amazing. I missed some of the final section, though; I was too busy trying to find a way to sit."
      },
      {
        "speaker": "Man",
        "text": "A couple of reviewers said they couldn't get comfortable either. Was that about the distance between the rows or the way the seats lean back?"
      },
      {
        "speaker": "Woman",
        "text": "For me, the backrest. I ended up perched on the front edge and was glad when we could stand up."
      },
      {
        "speaker": "Man",
        "text": "Does the booking plan show whether all the rows have that design? I'm choosing tickets for next week."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "3",
        "text": "The planetarium seats are uncomfortable.",
        "answer": "woman",
        "evidence": [
          {
            "speaker": "Woman",
            "lineIndex": 0,
            "quote": "I was too busy trying to find a way to sit.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 2,
            "quote": "I ended up perched on the front edge and was glad when we could stand up.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "A couple of reviewers said they couldn't get comfortable either.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "unclear",
            "notes": [
              "Reports the reviewers’ discomfort; gives no assessment of his own.",
              "Questions about seat design do not establish agreement."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Struggles to find a way to sit.",
              "Perches on the edge; feels relieved to stand up."
            ]
          }
        ],
        "keyPoint": "Reporting a complaint is different from expressing it as your own view."
      }
    ],
    "discussion": "What is the source of each speaker's information? Which speaker actually evaluates sitting in the seats?",
    "likelyError": "Treating a report of other people's complaints, or a practical question prompted by them, as personal endorsement."
  },
  {
    "id": "extract-04",
    "number": 4,
    "title": "Booking a haircut",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Reported criticism, limited acceptance and an argument for a uniform policy",
    "difficulty": "3–4",
    "script": [
      {
        "speaker": "Woman",
        "text": "Six years I've been going to Rosa, and I've never missed an appointment. Now she won't put me in the diary until I've transferred ten pounds."
      },
      {
        "speaker": "Man",
        "text": "My sister calls that paying for nothing, although it comes off the bill. And Rosa can't sell the same hour again if someone doesn't turn up."
      },
      {
        "speaker": "Woman",
        "text": "For someone who's let her down, perhaps. After six years, I shouldn't have to prove I'll come."
      },
      {
        "speaker": "Man",
        "text": "Then she'd have to tell one regular customer their promise was enough and another that it wasn't. I'd rather she kept the same arrangement for everyone."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "4",
        "text": "Customers who have always kept their appointments should not have to pay the booking deposit.",
        "answer": "woman",
        "evidence": [
          {
            "speaker": "Woman",
            "lineIndex": 0,
            "quote": "I've never missed an appointment.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 2,
            "quote": "After six years, I shouldn't have to prove I'll come.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "My sister calls that paying for nothing",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 3,
            "quote": "I'd rather she kept the same arrangement for everyone.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "opposes",
            "notes": [
              "The initial criticism belongs to his sister.",
              "His own preference: the same deposit rule for everyone."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Has never missed an appointment.",
              "Objects to proving she will attend after six reliable years."
            ]
          }
        ],
        "keyPoint": "She wants an exception for reliable customers, not an end to all deposits."
      }
    ],
    "discussion": "Which customers would the woman treat differently, and why does the man resist making that distinction?",
    "likelyError": "Attributing the sister's view to the man; treating the woman's limited acceptance of deposits as acceptance of this policy for regular customers; overlooking the referent of everyone."
  },
  {
    "id": "extract-05",
    "number": 5,
    "title": "Meal kits",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Reconstruct the time comparison and retain it despite price and washing-up complaints",
    "difficulty": "3",
    "script": [
      {
        "speaker": "Man",
        "text": "The recipe card says forty minutes. Same as my usual dinner, apparently. It doesn't mention that I used to spend another twenty finding ingredients and measuring everything out."
      },
      {
        "speaker": "Woman",
        "text": "I didn't order a second box. Too much money for two meals. Though on Tuesday I had the vegetables in the pan before my husband had finished getting changed. That never happens when I start from the cupboard."
      },
      {
        "speaker": "Man",
        "text": "I still had the washing-up afterwards."
      },
      {
        "speaker": "Woman",
        "text": "So did I. The little bags don't solve that."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "5",
        "text": "Meal kits reduce the time needed to prepare an evening meal.",
        "answer": "both",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "Same as my usual dinner, apparently.",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "I used to spend another twenty finding ingredients and measuring everything out.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "I had the vegetables in the pan before my husband had finished getting changed. That never happens when I start from the cupboard.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "Too much money for two meals.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "The card’s 40 minutes initially sounds unchanged.",
              "His usual routine also needed 20 minutes finding and measuring ingredients."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Gets the vegetables into the pan sooner than in her normal routine.",
              "Stops ordering over price, not preparation time."
            ]
          }
        ],
        "keyPoint": "Same cooking time and later washing-up do not cancel a preparation-time saving."
      }
    ],
    "discussion": "What belongs in the man's before-and-after comparison? Which part of the woman's experience matters to this statement?",
    "likelyError": "Using the cooking time on the card as the whole comparison; treating cancellation over price as rejection of the time benefit; letting the closing complaint replace the target judgement."
  },
  {
    "id": "extract-06",
    "number": 6,
    "title": "A new escape room",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Shared approval of puzzle content masks different views about knowing the activity's conventions",
    "difficulty": "3–4",
    "script": [
      {
        "speaker": "Man",
        "text": "I'm taking the accounts team to the new escape room. Not one of them has done one before. We got through it without needing any history or maths."
      },
      {
        "speaker": "Woman",
        "text": "I liked that about it. But nobody told us we could ask for a hint until you pressed the button. You knew what it was for."
      },
      {
        "speaker": "Man",
        "text": "The host explains it if you ask."
      },
      {
        "speaker": "Woman",
        "text": "That's the problem: we knew what to ask. I'd save this one for their second visit."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "6",
        "text": "The new escape room is a good choice for a group of complete beginners.",
        "answer": "man",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "I'm taking the accounts team to the new escape room. Not one of them has done one before.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "I liked that about it.",
            "kind": "context"
          },
          {
            "speaker": "Woman",
            "lineIndex": 3,
            "quote": "That's the problem: we knew what to ask. I'd save this one for their second visit.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "Chooses the room for a team who have never tried one.",
              "No history or maths needed: his reason for that choice."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "opposes",
            "notes": [
              "Approves of the puzzle content, not its suitability for newcomers.",
              "Beginners may not know to ask for hints; wants them to try another room first."
            ]
          }
        ],
        "keyPoint": "No specialist knowledge needed is different from no previous escape-room experience needed."
      }
    ],
    "discussion": "What kind of knowledge is each speaker considering? Why doesn't the offer of an explanation settle her concern?",
    "likelyError": "Extending the woman's initial agreement to the man's recommendation without identifying what that refers to."
  },
  {
    "id": "extract-07",
    "number": 7,
    "title": "A personalised present",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Infer an accepted trade-off; separate the seller's claim and practical questions from endorsement",
    "difficulty": "3",
    "script": [
      {
        "speaker": "Woman",
        "text": "Dad's birthday is Monday. The mug with a drawing of his old boat won't arrive for three weeks. I've ordered it anyway; he'll know I haven't just grabbed the first thing on a shelf."
      },
      {
        "speaker": "Man",
        "text": "The website says that's why people keep them. Do you send the picture yourself or choose one of their designs?"
      },
      {
        "speaker": "Woman",
        "text": "I've sent a photo from years ago. Otherwise I could just get an ordinary mug tomorrow."
      },
      {
        "speaker": "Man",
        "text": "Do the three weeks include approving the drawing? My colleague was looking at that company for a retirement present."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "7",
        "text": "A personalised present is worth waiting longer for.",
        "answer": "woman",
        "evidence": [
          {
            "speaker": "Woman",
            "lineIndex": 0,
            "quote": "won't arrive for three weeks. I've ordered it anyway",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 0,
            "quote": "he'll know I haven't just grabbed the first thing on a shelf.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 2,
            "quote": "Otherwise I could just get an ordinary mug tomorrow.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "The website says that's why people keep them.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "unclear",
            "notes": [
              "The claim about keeping the gift comes from the website.",
              "Asks about ordering and timing; does not judge the extra wait."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Orders despite the three-week delay.",
              "Chooses personal meaning over an ordinary mug available tomorrow."
            ]
          }
        ],
        "keyPoint": "Interest in the gift or ordering process does not establish acceptance of the wait."
      }
    ],
    "discussion": "What disadvantage has the woman accepted, and what compensates for it? Does the man make that comparison himself?",
    "likelyError": "Treating the seller's claim as the man's opinion; interpreting detailed interest in the ordering process as approval of the woman's trade-off."
  },
  {
    "id": "extract-08",
    "number": 8,
    "title": "Telephone menus",
    "stage": "Core practice",
    "guided": true,
    "prompt": "Read the exact opinion. Listen to both speakers before deciding who expresses it.",
    "focus": "Defence of full explanations does not reject a shortcut for callers who know the option",
    "difficulty": "3",
    "script": [
      {
        "speaker": "Man",
        "text": "With my bank, I know it's option four, but pressing it early just starts the recording again. By the time I reach it, I've heard about mortgages, savings and travel insurance. I'm only trying to report a damaged card."
      },
      {
        "speaker": "Woman",
        "text": "The explanations at my electricity company are longer. I wouldn't cut them; my dad needs every step. I just press three as soon as they start."
      },
      {
        "speaker": "Man",
        "text": "That's what my bank used to allow. Now I get punished for remembering the number."
      },
      {
        "speaker": "Woman",
        "text": "My dad and I don't need to take the same route to reach the same department."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "8",
        "text": "Callers should be able to select a known option without hearing the whole telephone menu.",
        "answer": "both",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "I know it's option four, but pressing it early just starts the recording again.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 2,
            "quote": "Now I get punished for remembering the number.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "I just press three as soon as they start.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 3,
            "quote": "My dad and I don't need to take the same route to reach the same department.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "I wouldn't cut them; my dad needs every step.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "Knows option four but cannot select it early.",
              "Calls that restriction being “punished” for remembering the number."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Selects her own option as soon as the recording starts.",
              "Wants different routes for herself and her dad, who needs the explanations."
            ]
          }
        ],
        "keyPoint": "Keeping explanations available is different from making every caller hear them."
      }
    ],
    "discussion": "Why can the woman defend the explanations and still share the preference in the statement?",
    "likelyError": "Treating the woman's defence of long explanations as opposition to a shortcut; expanding the claim into removing recorded explanations altogether."
  },
  {
    "id": "extract-09",
    "number": 9,
    "title": "An outdoor film screening",
    "stage": "Mixed practice",
    "guided": false,
    "prompt": "Read both opinions. Keep a separate answer in mind for each one.",
    "focus": "Revise an initial attribution using a later proposal and its rationale after an intervening topic Interpret a challenging question and distinguish a partial concession from acceptance of the proposal",
    "difficulty": "4 / 3–4",
    "script": [
      {
        "speaker": "Woman",
        "text": "I'd put a seat number on each booking for the outdoor screening. Friends could choose a row together before they came."
      },
      {
        "speaker": "Man",
        "text": "I'd have left people to choose on arrival. And someone could take snacks round during the film, so nobody missed a scene buying something."
      },
      {
        "speaker": "Woman",
        "text": "Last year, saving chairs caused arguments. We needed two volunteers just to sort them out. As for the snacks, how would anyone see past the seller while the change was being counted?"
      },
      {
        "speaker": "Man",
        "text": "People could pay when they book. The seller would only have to hand things over."
      },
      {
        "speaker": "Woman",
        "text": "That takes the money out of it. I'd still spend part of the scene looking at someone's back."
      },
      {
        "speaker": "Man",
        "text": "On the seating, let people pick their seat on the booking page. They keep a choice, and the volunteers can actually watch the film this time."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "9a",
        "text": "Seats should be reserved when tickets are booked.",
        "answer": "both",
        "evidence": [
          {
            "speaker": "Woman",
            "lineIndex": 0,
            "quote": "I'd put a seat number on each booking",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "I'd have left people to choose on arrival.",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 5,
            "quote": "let people pick their seat on the booking page.",
            "kind": "support"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "Initially favours choosing on arrival.",
              "Later proposes choosing on the booking page to avoid the arguments."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Proposes a seat number for each booking."
            ]
          }
        ],
        "keyPoint": "Use his revised view, not his first preference.",
        "discussion": "Which later words show the man's revised seating preference?"
      },
      {
        "key": "b",
        "number": "9b",
        "text": "Sellers should bring snacks to people in their seats while the film is playing.",
        "answer": "man",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 1,
            "quote": "someone could take snacks round during the film",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 2,
            "quote": "how would anyone see past the seller while the change was being counted?",
            "kind": "context"
          },
          {
            "speaker": "Woman",
            "lineIndex": 4,
            "quote": "That takes the money out of it.",
            "kind": "context"
          },
          {
            "speaker": "Woman",
            "lineIndex": 4,
            "quote": "I'd still spend part of the scene looking at someone's back.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "Proposes bringing snacks round during the film.",
              "Advance payment is his way to make that service work."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "opposes",
            "notes": [
              "Her question challenges the blocked view.",
              "Accepts removing cash payments; still objects to someone in front of the screen."
            ]
          }
        ],
        "keyPoint": "Accepting a payment improvement does not mean accepting the snack service.",
        "discussion": "What objection remains after advance payment is suggested?"
      }
    ],
    "discussion": "How does the man's last turn alter the seating answer? Which part of the snack proposal remains objectionable after the payment issue is addressed?",
    "likelyError": "Keeping the man's first seating preference as his final position; interpreting the woman's question as neutral information-seeking; treating her acceptance of advance payment as agreement with the snack service; applying one opinion to both statements."
  },
  {
    "id": "extract-10",
    "number": 10,
    "title": "Looking after cats",
    "stage": "Mixed practice",
    "guided": false,
    "prompt": "Read both opinions. Keep a separate answer in mind for each one.",
    "focus": "Compare different priorities and distinguish a fallback arrangement from a preference Shared recognition of a commitment leads to different views about money and reciprocity",
    "difficulty": "3–4 / 3–4",
    "script": [
      {
        "speaker": "Man",
        "text": "At the boarding place, Leo hid under a blanket. Put a cat somewhere familiar and you've removed a lot of that. A neighbour with a key would be my starting point."
      },
      {
        "speaker": "Woman",
        "text": "Mine stayed home last summer. Two visits a day left him alone most of the time. At the boarding place, there's company and someone to notice problems."
      },
      {
        "speaker": "Man",
        "text": "Does Amira still help if you can't get a place there?"
      },
      {
        "speaker": "Woman",
        "text": "Yes. She wouldn't name a price, but I left forty pounds. I'd budget for that whoever took the key. They're giving up their time, even if they live next door."
      },
      {
        "speaker": "Man",
        "text": "Tom takes our key, and I keep weekends free to look after his cat. We don't count the visits."
      },
      {
        "speaker": "Woman",
        "text": "Amira hardly travels. I wouldn't have her doing it year after year without getting something back."
      },
      {
        "speaker": "Man",
        "text": "If that changed, I'd take Tom for a meal. Handing over cash would make it feel like booking a service whenever I asked."
      }
    ],
    "statements": [
      {
        "key": "a",
        "number": "10a",
        "text": "Home visits would be the first choice for their cat.",
        "answer": "man",
        "evidence": [
          {
            "speaker": "Man",
            "lineIndex": 0,
            "quote": "A neighbour with a key would be my starting point.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 1,
            "quote": "At the boarding place, there's company and someone to notice problems.",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 2,
            "quote": "Does Amira still help if you can't get a place there?",
            "kind": "context"
          },
          {
            "speaker": "Woman",
            "lineIndex": 3,
            "quote": "Yes.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "supports",
            "notes": [
              "Familiar surroundings reduce the cat’s distress.",
              "Makes a neighbour with a key his starting point."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "opposes",
            "notes": [
              "Values company and observation at the boarding place.",
              "Confirms home visits as the fallback when a boarding place is unavailable."
            ]
          }
        ],
        "keyPoint": "Using home visits as a fallback is different from preferring them.",
        "discussion": "How do we know home visits are a fallback for the woman?"
      },
      {
        "key": "b",
        "number": "10b",
        "text": "Friends should be given money for looking after someone's pets.",
        "answer": "woman",
        "evidence": [
          {
            "speaker": "Woman",
            "lineIndex": 3,
            "quote": "She wouldn't name a price, but I left forty pounds.",
            "kind": "support"
          },
          {
            "speaker": "Woman",
            "lineIndex": 3,
            "quote": "I'd budget for that whoever took the key.",
            "kind": "support"
          },
          {
            "speaker": "Man",
            "lineIndex": 4,
            "quote": "I keep weekends free to look after his cat.",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 6,
            "quote": "If that changed, I'd take Tom for a meal.",
            "kind": "context"
          },
          {
            "speaker": "Man",
            "lineIndex": 6,
            "quote": "Handing over cash would make it feel like booking a service whenever I asked.",
            "kind": "context"
          }
        ],
        "speakerNotes": [
          {
            "speaker": "Man",
            "stance": "opposes",
            "notes": [
              "Returns the favour through cat care; would offer a meal instead.",
              "Cash would make asking a friend feel like booking a service."
            ]
          },
          {
            "speaker": "Woman",
            "stance": "supports",
            "notes": [
              "Leaves £40 even though her friend names no price.",
              "Would budget money for whoever takes responsibility."
            ]
          }
        ],
        "keyPoint": "Both favour giving something back; only the woman favours giving money.",
        "discussion": "How can both value giving something back but differ about giving money?"
      }
    ],
    "discussion": "What does each speaker prioritise when choosing care? What obligation do they share, and where do their preferred ways of meeting it differ?",
    "likelyError": "Treating a fallback arrangement as the first choice; confusing recognition of a friend's effort with support for payment."
  }
];

export const aptisOpinionStrategyExtracts = definitions.map((extract) => ({
  ...extract,
  audioReady: recordedExtractIds.has(extract.id),
  audioSrc: recordedExtractIds.has(extract.id) ? `/audio/listening/part3/strategy/${extract.id}.mp3` : null,
}));

export function getAptisOpinionStrategyExtract(id) {
  return aptisOpinionStrategyExtracts.find((extract) => extract.id === id) || null;
}

export function selectAptisOpinionStrategyExtracts(ids) {
  const selected = new Set(Array.isArray(ids) ? ids : []);
  return aptisOpinionStrategyExtracts.filter((extract) => selected.has(extract.id));
}

export const aptisOpinionStrategyRoutes = [
  { id: "recorded", title: "Recorded starter", time: "8–12 min", description: "A shared model, a judgement about value and a speaker who leaves a view unclear.", extractIds: ["extract-01", "extract-02", "extract-03"] },
  { id: "core", title: "Core distinctions", time: "15–20 min", description: "Model the task, then distinguish reported views, partial agreement and the scope of a recommendation.", extractIds: ["extract-01", "extract-02", "extract-04", "extract-05", "extract-06", "extract-07"] },
  { id: "complete", title: "Complete lesson", time: "25–35 min", description: "Build towards two mixed extracts with a separate judgement for each opinion.", extractIds: aptisOpinionStrategyExtracts.map((extract) => extract.id) },
];

export function aptisOpinionStrategyRecordingText() {
  return aptisOpinionStrategyExtracts.map((extract) => `${extract.id}.mp3 — ${extract.title}\n\n${extract.script.map((line) => `${line.speaker}: ${line.text}`).join("\n\n")}`).join("\n\n---\n\n") + "\n";
}
