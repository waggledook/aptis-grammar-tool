// src/components/vocabulary/data/emotionsData.js

export const emotionsData = {
    topicKey: "emotions",
    topicTitle: "Feelings & emotions",
    sets: [
      // -------------------------
      // SET 1: BASIC FEELINGS
      // -------------------------
      {
        id: "emotions_basic",
        title: "Basic feelings",
        focus: "Everyday emotions you can easily describe in photos and stories.",
        words: [
          "happy",
          "sad",
          "angry",
          "scared",
          "surprised",
          "bored",
          "excited",
          "nervous",
          "relaxed",
          "tired",
        ],
        pairs: [
            {
              term: "happy",
              definition: "feeling pleased or cheerful",
              image: "/images/vocab/emotions/happy.png",
              collocation: "because you got some good news",
            },
            {
              term: "sad",
              definition: "feeling unhappy or upset",
              image: "/images/vocab/emotions/sad.png",
              collocation: "because something didn’t go well",
            },
            {
              term: "angry",
              definition: "feeling annoyed or furious",
              image: "/images/vocab/emotions/angry.png",
              collocation: "because someone treated you unfairly",
            },
            {
              term: "scared",
              definition: "feeling afraid or frightened",
              image: "/images/vocab/emotions/scared.png",
              collocation: "after a horror movie",
            },
            {
              term: "surprised",
              definition: "not expecting something and reacting to it",
              image: "/images/vocab/emotions/surprised.png",
              collocation: "because you didn’t expect it at all",
            },
            {
              term: "bored",
              definition: "not interested; having nothing enjoyable to do",
              image: "/images/vocab/emotions/bored.png",
              collocation: "as the class is not interesting",
            },
            {
              term: "excited",
              definition: "feeling enthusiastic and looking forward to something",
              image: "/images/vocab/emotions/excited.png",
              collocation: "before doing a fun activity",
            },
            {
              term: "nervous",
              definition: "worried and not relaxed, often before something important",
              image: "/images/vocab/emotions/nervous.png",
              collocation: "because your exam/interview is today",
            },
            {
              term: "relaxed",
              definition: "calm and free from stress",
              image: "/images/vocab/emotions/relaxed.png",
              collocation: "at the weekend with no work",
            },
            {
              term: "tired",
              definition: "needing rest or sleep",
              image: "/images/vocab/emotions/tired.png",
              collocation: "and you feel like you need to sleep",
            },
          ],

        distractors: ["confused", "proud"],
        review: [
          { sentence: "She’s smiling and laughing, so she looks __________.", answer: "happy" },
          { sentence: "He looks __________ because he’s been crying.", answer: "sad" },
          { sentence: "I felt __________ when they cancelled our plans at the last minute.", answer: "angry" },
          { sentence: "She was __________ to walk home alone late at night.", answer: "scared" },
          { sentence: "He looked __________ when he opened the present. He hadn't expected anything like that.", answer: "surprised" },
          { sentence: "I’m __________. This meeting is going on forever.", answer: "bored" },
          { sentence: "They’re __________ about their holiday next week.", answer: "excited" },
          { sentence: "I always feel __________ before an exam.", answer: "nervous" },
          { sentence: "After the massage, she felt really __________.", answer: "relaxed" },
          { sentence: "He was __________ after working a double shift.", answer: "tired" },
        ],
        tips: [
          "In photos: use “look” + adjective (He looks tired / She looks nervous).",
          "“Bored” describes the person; “boring” describes the thing (I’m bored / It’s boring).",
          "For speaking, soften statements with “a bit / quite / really” (She looks quite excited).",
          "“Scared” and “afraid” are close in meaning (I’m scared / I’m afraid).",
        ],
      },
  
      // -------------------------
      // SET 2: REACTIONS
      // -------------------------
      {
        id: "emotions_reactions",
        title: "Reactions in common situations",
        focus: "More specific emotions for explaining what happened and how someone reacted.",
        words: [
          "relieved",
          "disappointed",
          "embarrassed",
          "frustrated",
          "shocked",
          "worried",
          "jealous",
          "grateful",
          "lonely",
          "stressed",
        ],
        pairs: [
            {
              term: "relieved",
              definition: "happy because something unpleasant is over",
              image: "/images/vocab/emotions/relieved.png",
              collocation: "because the difficult part is finally over",
            },
            {
              term: "disappointed",
              definition: "sad because something was not as good as you hoped",
              image: "/images/vocab/emotions/disappointed.png",
              collocation: "because it didn’t meet your expectations",
            },
            {
              term: "embarrassed",
              definition: "feeling awkward because you did something silly or people noticed you",
              image: "/images/vocab/emotions/embarrassed.png",
              collocation: "because everyone is watching and you made a mistake",
            },
            {
              term: "frustrated",
              definition: "annoyed because something is difficult or not working",
              image: "/images/vocab/emotions/frustrated.png",
              collocation: "because you keep trying but it still won’t work",
            },
            {
              term: "shocked",
              definition: "very surprised and upset by something unexpected",
              image: "/images/vocab/emotions/shocked.png",
              collocation: "because you really didn’t see it coming",
            },
            {
              term: "worried",
              definition: "anxious because you think something bad might happen",
              image: "/images/vocab/emotions/worried.png",
              collocation: "because you’re imagining the worst",
            },
            {
              term: "jealous",
              definition: "unhappy because someone has something you want",
              image: "/images/vocab/emotions/jealous.png",
              collocation: "because someone else has what you want",
            },
            {
              term: "grateful",
              definition: "thankful for help or kindness",
              image: "/images/vocab/emotions/grateful.png",
              collocation: "because someone helped you when you needed it",
            },
            {
              term: "lonely",
              definition: "sad because you are alone or feel isolated",
              image: "/images/vocab/emotions/lonely.png",
              collocation: "because you feel like you have nobody to talk to",
            },
            {
              term: "stressed",
              definition: "worried and tense because there is too much to do or think about",
              image: "/images/vocab/emotions/stressed.png",
              collocation: "because you have too much to do at once",
            },
          ],
        distractors: ["annoyed", "confident"],
        review: [
          { sentence: "When the exam finished, I felt __________.", answer: "relieved" },
          { sentence: "She was __________ because she didn’t get the job.", answer: "disappointed" },
          { sentence: "He felt __________ after calling the teacher “Mum”.", answer: "embarrassed" },
          { sentence: "I get __________ when the internet stops working.", answer: "frustrated" },
          { sentence: "They were __________ to hear the news.", answer: "shocked" },
          { sentence: "She looks __________ about her daughter’s flight.", answer: "worried" },
          { sentence: "He felt __________ when his friend bought a new car.", answer: "jealous" },
          { sentence: "I’m really __________ for your help.", answer: "grateful" },
          { sentence: "He moved to a new city and felt __________ at first.", answer: "lonely" },
          { sentence: "I’ve got three deadlines, so I’m really __________.", answer: "stressed" },
        ],
        tips: [
          "“Worried” is common; “stressed” often means too much pressure or too many tasks.",
          "“Embarrassed” is usually about a social mistake; “frustrated” is about something not working.",
          "Good speaking patterns: “He looks… because…” / “She might be… as…”",
          "“Relieved” is often followed by a clause: “relieved that…”",
        ],
      },
  
      // -------------------------
      // SET 3: STRONGER / MORE PRECISE FEELINGS
      // -------------------------
      {
        id: "emotions_intensity",
        title: "Stronger feelings (intensity upgrade)",
        focus: "More powerful words to avoid repeating ‘very + basic adjective’.",
        words: [
          "delighted",
          "thrilled",
          "devastated",
          "furious",
          "terrified",
          "exhausted",
          "overwhelmed",
          "anxious",
          "confident",
          "ashamed",
        ],
        pairs: [
            {
              term: "delighted",
              definition: "very happy and pleased",
              image: "/images/vocab/emotions/delighted.png",
              collocation: "something went even better than you expected",
            },
            {
              term: "thrilled",
              definition: "extremely excited and happy",
              image: "/images/vocab/emotions/thrilled.png",
              collocation: "you can’t wait and you’re full of energy",
            },
            {
              term: "devastated",
              definition: "extremely sad and shocked",
              image: "/images/vocab/emotions/devastated.png",
              collocation: "because something terrible happened to you",
            },
            {
              term: "furious",
              definition: "extremely angry",
              image: "/images/vocab/emotions/furious.png",
              collocation: "very angry",
            },
            {
              term: "terrified",
              definition: "extremely scared",
              image: "/images/vocab/emotions/terrified.png",
              collocation: "very afraid",
            },
            {
              term: "exhausted",
              definition: "extremely tired",
              image: "/images/vocab/emotions/exhausted.png",
              collocation: "very tired",
            },
            {
              term: "overwhelmed",
              definition: "feeling you have too much to deal with",
              image: "/images/vocab/emotions/overwhelmed.png",
              collocation: "too many things to do at the same time",
            },
            {
              term: "anxious",
              definition: "very worried, often for a long time",
              image: "/images/vocab/emotions/anxious.png",
              collocation: "worrying all the time",
            },
            {
              term: "confident",
              definition: "sure you can do something well",
              image: "/images/vocab/emotions/confident.png",
              collocation: "well prepared for your exam!",
            },
            {
              term: "ashamed",
              definition: "feeling guilty or embarrassed about something you did",
              image: "/images/vocab/emotions/ashamed.png",
              collocation: "because you know you did something wrong",
            },
          ],
        distractors: ["proud", "annoyed"],
        review: [
          { sentence: "She was __________ to hear she had passed the interview.", answer: "delighted" },
          { sentence: "He’s __________ about going to see his favourite band live.", answer: "thrilled" },
          { sentence: "They were __________ when they lost their home in the fire.", answer: "devastated" },
          { sentence: "My boss was __________ when I arrived an hour late.", answer: "furious" },
          { sentence: "She was __________ during the turbulence on the plane.", answer: "terrified" },
          { sentence: "After the marathon, he was completely __________.", answer: "exhausted" },
          { sentence: "I felt __________ by the amount of work I had to do.", answer: "overwhelmed" },
          { sentence: "He felt __________ for weeks before the operation.", answer: "anxious" },
          { sentence: "She sounds __________ that she’ll pass the exam.", answer: "confident" },
          { sentence: "He felt __________ after lying to his friend.", answer: "ashamed" },
        ],
        tips: [
          "Upgrade trick: delighted = very happy; furious = very angry; exhausted = very tired.",
          "“Anxious” often sounds more serious/long-lasting than “nervous”.",
          "In writing, these words make tone clearer (devastated, thrilled, ashamed).",
          "Careful: “ashamed” is about guilt; “embarrassed” is usually about an awkward moment.",
        ],
      },
    ],
  };