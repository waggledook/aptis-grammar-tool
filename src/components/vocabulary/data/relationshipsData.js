// src/components/vocabulary/data/relationshipsData.js

export const relationshipsData = {
    sets: [
      {
        id: "family_basic",
        title: "Family members – basic",
        focus: "The most common family members you need to talk about your family.",
  
        words: [
          "mother",
          "father",
          "sister",
          "brother",
          "parents",
          "children",
          "son",
          "daughter",
          "grandmother",
          "grandfather",
          "aunt",
          "uncle"
        ],
  
        pairs: [
          {
            term: "mother",
            definition: "Your female parent.",
            image: "/images/vocab/relationships/mother.png"
          },
          {
            term: "father",
            definition: "Your male parent.",
            image: "/images/vocab/relationships/father.png"
          },
          {
            term: "sister",
            definition: "A girl or woman who has the same parents as you.",
            image: "/images/vocab/relationships/sister.png"
          },
          {
            term: "brother",
            definition: "A boy or man who has the same parents as you.",
            image: "/images/vocab/relationships/brother.png"
          },
          {
            term: "parents",
            definition: "Your mother and father together.",
            image: "/images/vocab/relationships/parents.png"
          },
          {
            term: "children",
            definition: "Sons and daughters; the young people in a family.",
            image: "/images/vocab/relationships/children.png"
          },
          {
            term: "son",
            definition: "A male child in relation to his parents.",
            image: "/images/vocab/relationships/son.png"
          },
          {
            term: "daughter",
            definition: "A female child in relation to her parents.",
            image: "/images/vocab/relationships/daughter.png"
          },
          {
            term: "grandmother",
            definition: "The mother of your mother or father.",
            image: "/images/vocab/relationships/grandmother.png"
          },
          {
            term: "grandfather",
            definition: "The father of your mother or father.",
            image: "/images/vocab/relationships/grandfather.png"
          },
          {
            term: "aunt",
            definition: "The sister of your father or mother, or the wife of your uncle.",
            image: "/images/vocab/relationships/aunt.png"
          },
          {
            term: "uncle",
            definition: "The brother of your father or mother, or the husband of your aunt.",
            image: "/images/vocab/relationships/uncle.png"
          }
        ],
  
        // Two family-related words that don't have pictures in this set
        distractors: ["cousin", "relatives"],
  
        review: [
            {
              sentence: "My __________ is helping me plan a trip for the holidays, while dad cooks dinner.",
              answer: "mother / mum"
            },
            {
              sentence: "My __________ is meeting me later so we can go for a walk together, but my mum is busy.",
              answer: "father / dad"
            },
            {
              sentence: "I have one __________ and two brothers.",
              answer: "sister"
            },
            {
              sentence: "I have an older __________ and he always helps me with my homework.",
              answer: "brother"
            },
            {
              sentence: "I still live with my __________ but they make me pay rent!",
              answer: "parents"
            },
            {
              sentence: "We have two __________ - a boy and a girl.",
              answer: "children"
            },
            {
              sentence: "Her __________ is starting school this year, and he's a bit nervous.",
              answer: "son"
            },
            {
              sentence: "Their __________ loves drawing. She's very creative.",
              answer: "daughter"
            },
            {
              sentence: "My __________ tells great stories about her childhood.",
              answer: "grandmother"
            },
            {
              sentence: "My __________ is getting pretty old, but he's still very active.",
              answer: "grandfather"
            },
            {
              sentence: "My __________ is my mum’s sister, and she always remembers my birthday.",
              answer: "aunt"
            },
            {
              sentence: "My __________ is my dad’s brother and takes me fishing every summer.",
              answer: "uncle"
            }
          ],
          
  
        tips: [
          "We normally say 'my parents', not *'the parents of me'.",
          "'Children' is the plural of 'child', not *'childs'.",
          "Use 'grandmother' / 'grandfather' in careful speech; many people say 'grandma' / 'grandpa' in informal English."
        ]
      },
  
      {
        id: "family_extended",
        title: "Family members – extended",
        focus: "More detailed family vocabulary for talking about different family situations.",
      
        words: [
          "cousin",
          "niece",
          "nephew",
          "in-laws",
          "mother-in-law",
          "father-in-law",
          "stepmother",
          "stepfather",
          "half-brother",
          "half-sister",
          "adopted",
          "single parent"
        ],
      
        pairs: [
            {
              term: "cousin",
              definition: "The child of your aunt or uncle.",
              image: "/images/vocab/relationships/cousin.png",
              collocation: "my uncle’s daughter / my aunt’s son"
            },
            {
              term: "niece",
              definition: "Your brother’s or sister’s daughter.",
              image: "/images/vocab/relationships/niece.png",
              collocation: "my sister’s daughter"
            },
            {
              term: "nephew",
              definition: "Your brother’s or sister’s son.",
              image: "/images/vocab/relationships/nephew.png",
              collocation: "my brother’s son"
            },
            {
              term: "in-laws",
              definition: "The close relatives of your spouse or long-term partner, for example their parents or siblings.",
              image: "/images/vocab/relationships/in-laws.png",
              collocation: "my partner’s family"
            },
            {
              term: "mother-in-law",
              definition: "The mother of your spouse or long-term partner.",
              image: "/images/vocab/relationships/mother-in-law.png",
              collocation: "my partner’s mother"
            },
            {
              term: "father-in-law",
              definition: "The father of your spouse or long-term partner.",
              image: "/images/vocab/relationships/father-in-law.png",
              collocation: "my partner’s father"
            },
            {
              term: "stepmother",
              definition: "A woman who is married to one of your parents but is not your biological mother.",
              image: "/images/vocab/relationships/stepmother.png",
              collocation: "my dad’s wife"
            },
            {
              term: "stepfather",
              definition: "A man who is married to one of your parents but is not your biological father.",
              image: "/images/vocab/relationships/stepfather.png",
              collocation: "my mum’s husband"
            },
            {
              term: "half-brother",
              definition: "A brother who shares one parent with you, but not both.",
              image: "/images/vocab/relationships/half-brother.png",
              collocation: "same mother, different father"
            },
            {
              term: "half-sister",
              definition: "A sister who shares one parent with you, but not both.",
              image: "/images/vocab/relationships/half-sister.png",
              collocation: "same father, different mother"
            },
            {
              term: "adopted",
              definition: "Legally taken into a family and brought up as their child.",
              image: "/images/vocab/relationships/adopted.png",
              collocation: "______ into another family"
            },
            {
              term: "single parent",
              definition: "A mother or father who raises a child or children alone.",
              image: "/images/vocab/relationships/single-parent.png",
              collocation: "raise children alone"
            }
          ],
          
      
        distractors: ["grandparents", "siblings"],
      
        review: [
          {
            sentence: "My parents siblings have lots of children so I have many __________.",
            answer: "cousin / cousins"
          },
          {
            sentence: "My sister has a baby girl, so now I have a __________.",
            answer: "niece"
          },
          {
            sentence: "My brother has a baby boy, so I’m really happy to have a __________.",
            answer: "nephew"
          },
          {
            sentence: "We spent the weekend with my __________ (my husband's family).",
            answer: "in-laws"
          },
          {
            sentence: "My __________ wasn't happy when I married her daughter!",
            answer: "mother-in-law"
          },
          {
            sentence: "My __________ showed me some great pictures of my husband (his son) as a child.",
            answer: "father-in-law"
          },
          {
            sentence: "After my parents got divorced, my dad met my __________ online. We don't get on very well.",
            answer: "stepmother"
          },
          {
            sentence: "I live with my mum and my __________ (her new husband), but I see my dad at weekends.",
            answer: "stepfather"
          },
          {
            sentence: "My __________ is ten years older than me and we share the same mother.",
            answer: "half-brother"
          },
          {
            sentence: "My __________ is very close to me, even though we only share the same father.",
            answer: "half-sister"
          },
          {
            sentence: "She was __________ when she was a baby and grew up with her new family.",
            answer: "adopted"
          },
          {
            sentence: "As a __________, he organises work and family life on his own.",
            answer: "single parent"
          }
        ],
      
        tips: [
          "Use 'in-laws' to talk about your partner’s family as a group: 'I’m having dinner with my in-laws.'",
          "A stepmother or stepfather is married to one of your parents, but is not your biological parent.",
          "A half-brother or half-sister shares only one parent with you.",
          "The term 'single parent' can refer to any gender."
        ]
      },
      
  
      {
        id: "romantic_verbs",
        title: "Romantic relationship verbs",
        focus: "Common verbs and phrasal verbs for starting, having, and ending romantic relationships.",
      
        words: [
          "flirt",
          "ask out",
          "go out",
          "fall in love",
          "get engaged",
          "get married",
          "move in",
          "break up",
          "get divorced",
          "get over"
        ],
      
        pairs: [
          {
            term: "flirt",
            definition: "Behave in a playful way that shows you are attracted to someone.",
            image: "/images/vocab/relationships/flirt.png",
            collocation: "________ with someone at a bar"
          },
          {
            term: "ask out",
            definition: "Invite someone to go on a date.",
            image: "/images/vocab/relationships/ask-out.png",
            collocation: "_____ someone ____ on a date"
          },
          {
            term: "go out",
            definition: "Be in a romantic relationship with someone; date them regularly.",
            image: "/images/vocab/relationships/go-out.png",
            collocation: "__________ with someone you met online"
          },
          {
            term: "fall in love",
            definition: "Begin to love someone in a strong romantic way.",
            image: "/images/vocab/relationships/fall-in-love.png",
            collocation: "________ with someone"
          },
          {
            term: "get engaged",
            definition: "Agree to marry someone.",
            image: "/images/vocab/relationships/get-engaged.png",
            collocation: " __________ in a proposal"
          },
          {
            term: "get married",
            definition: "Have a wedding and become a married couple.",
            image: "/images/vocab/relationships/get-married.png",
            collocation: " __________ in a large/small ceremony"
          },
          {
            term: "move in",
            definition: "Start living in the same home as your partner.",
            image: "/images/vocab/relationships/move-in.png",
            collocation: "________ together"
          },
          {
            term: "break up",
            definition: "End a romantic relationship.",
            image: "/images/vocab/relationships/break-up.png",
            collocation: "________ with someone"
          },
          {
            term: "get divorced",
            definition: "Legally end a marriage.",
            image: "/images/vocab/relationships/get-divorced.png",
            collocation: " __________ from your spouse"
          },
          {
            term: "get over",
            definition: "Stop feeling sad about the end of a relationship.",
            image: "/images/vocab/relationships/get-over.png",
            collocation: "__________ a bad relationship"
          }
        ],
      
        distractors: ["cheat on", "get back together"],
      
        review: [
          {
            sentence: "He likes to __________ with people, but he never takes it seriously.",
            answer: "flirt"
          },
          {
            sentence: "After talking for a while, he decided to __________ her _______ on Friday.",
            answer: "ask out"
          },
          {
            sentence: "They started to __________ after meeting at a friend’s birthday party.",
            answer: "go out"
          },
          {
            sentence: "They met at work and quickly __________, spending a lot of time together.",
            answer: "fell in love / fall in love"
          },
          {
            sentence: "They __________ during their holiday and plan to marry next year.",
            answer: "got engaged / get engaged"
          },
          {
            sentence: "They __________ last summer in a small ceremony with close friends.",
            answer: "got married / get married"
          },
          {
            sentence: "After two years of long distance, they decided to __________ together.",
            answer: "move in"
          },
          {
            sentence: "They __________ after several years together, but they stayed friends.",
            answer: "broke up / split up / break up"
          },
          {
            sentence: "After many problems, they finally __________ and both of them have since remarried.",
            answer: "got divorced / get divorced"
          },
          {
            sentence: "It took her months to __________ her ex, but she eventually felt better.",
            answer: "get over"
          }
        ],
      
        tips: [
          "'Ask out' = invite someone on a date.",
          "'Go out' = be in a romantic relationship.",
          "'Move in' almost always appears as 'move in together' when used romantically.",
          "'Break up' and 'split up' have almost the same meaning.",
          "'Get engaged' → 'get married' → 'get divorced' describes a common sequence."
        ]
      },      
  
      {
        id: "relationship_phrasal_verbs",
        title: "Other relationship verb phrases",
        focus: "Phrasal verbs and expressions for friendships and general relationships.",
      
        words: [
          "get on",
          "fall out",
          "make up",
          "grow apart",
          "keep in touch",
          "lose touch",
          "rely on",
          "get to know",
          "trust",
          "argue"
        ],
      
        pairs: [
          {
            term: "get on",
            definition: "Have a good, friendly relationship with someone.",
            image: "/images/vocab/relationships/get-on.png",
            collocation: "________ (well/badly) with someone"
          },
          {
            term: "fall out",
            definition: "Argue and stop being friendly with someone.",
            image: "/images/vocab/relationships/fall-out.png",
            collocation: "________ with someone after a fight"
          },
          {
            term: "make up",
            definition: "Become friends again after an argument.",
            image: "/images/vocab/relationships/make-up.png",
            collocation: "________ after an argument"
          },
          {
            term: "grow apart",
            definition: "Slowly become less close over time.",
            image: "/images/vocab/relationships/grow-apart.png",
            collocation: "________ over time"
          },
          {
            term: "keep in touch",
            definition: "Continue to communicate with someone regularly.",
            image: "/images/vocab/relationships/keep-in-touch.png",
            collocation: "________ with someone"
          },
          {
            term: "lose touch",
            definition: "Stop communicating with someone and no longer see them.",
            image: "/images/vocab/relationships/lose-touch.png",
            collocation: "________ with someone"
          },
          {
            term: "rely on",
            definition: "Trust someone to help you or do what they say.",
            image: "/images/vocab/relationships/rely-on.png",
            collocation: "________ someone for support"
          },
          {
            term: "get to know",
            definition: "Spend time with someone so you slowly learn more about them.",
            image: "/images/vocab/relationships/get-to-know.png",
            collocation: " ________ someone over time"
          },
          {
            term: "trust",
            definition: "Believe that someone is honest and will not harm or cheat you.",
            image: "/images/vocab/relationships/trust.png",
            collocation: "________ someone completely"
          },
          {
            term: "argue",
            definition: "Talk angrily with someone because you disagree.",
            image: "/images/vocab/relationships/argue.png",
            collocation: "________ with someone about something"
          }
        ],
      
        distractors: ["hang out with", "look after"],
      
        review: [
          {
            sentence: "I really __________ with my colleagues – we hardly ever disagree.",
            answer: "get on / get on well"
          },
          {
            sentence: "We used to be close friends, but we __________ last year and stopped talking.",
            answer: "fell out / fall out"
          },
          {
            sentence: "They had a big argument, but later they apologised and __________.",
            answer: "made up / make up"
          },
          {
            sentence: "We were best friends at school, but we __________ when we went to different universities.",
            answer: "grew apart / grow apart"
          },
          {
            sentence: "Even after I moved abroad, I tried to __________ with my old classmates.",
            answer: "keep in touch"
          },
          {
            sentence: "We __________ completely and I haven’t spoken to her for years.",
            answer: "lost touch / lose touch"
          },
          {
            sentence: "You can always __________ me if you need help.",
            answer: "rely on / count on"
          },
          {
            sentence: "I’d like to __________ my new neighbours better before inviting them over.",
            answer: "get to know"
          },
          {
            sentence: "I __________ him completely; he has never lied to me.",
            answer: "trust"
          },
          {
            sentence: "They often __________ about small things, but they still care about each other.",
            answer: "argue"
          }
        ],
      
  
        tips: [
          "We usually say 'get on (well) with someone', not *'get good with someone'.",
          "'Keep in touch with' is the opposite of 'lose touch with'.",
          "'Rely on' and 'depend on' are similar, but 'depend on' can suggest a stronger need."
        ]
      }
    ]
  };
  