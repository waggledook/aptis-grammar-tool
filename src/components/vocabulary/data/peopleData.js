// src/components/vocabulary/data/peopleData.js
export const peopleData = {
    sets: [
        {
            id: "appearance_general",
            title: "General appearance",
            focus: "Adjectives and phrases describing height, build, and overall appearance.",
            words: [
              "tall",
              "short",
              "medium-height",
              "slim",
              "overweight",
              "well-built",
              "good-looking",
              "middle-aged",
              "elderly",
              "in his twenties",
              "in her forties"
            ],
            pairs: [
              {
                term: "tall",
                definition: "Someone who is much higher than most people.",
                image: "/images/vocab/people/tall.png",
                collocation: "a very __________ woman"
              },
              {
                term: "short",
                definition: "Someone who is not very tall.",
                image: "/images/vocab/people/short.png",
                collocation: "a rather __________ woman"
              },
              {
                term: "medium-height",
                definition: "Neither tall nor short; in the middle.",
                image: "/images/vocab/people/medium-height.png",
                collocation: "a __________ woman"
              },
              {
                term: "slim",
                definition: "Thin in a healthy, attractive way.",
                image: "/images/vocab/people/slim.png",
                collocation: "quite __________ and sporty"
              },
              {
                term: "overweight",
                definition: "Weighing more than is healthy; more polite than saying 'fat'.",
                image: "/images/vocab/people/overweight.png",
                collocation: "a little __________"
              },
              {
                term: "well-built",
                definition: "Strong and with a solid, muscular body.",
                image: "/images/vocab/people/well-built.png",
                collocation: "a __________ athlete"
              },
              {
                term: "good-looking",
                definition: "Physically attractive (used for men and women).",
                image: "/images/vocab/people/good-looking.png",
                collocation: "a very __________ actor"
              },
              {
                term: "middle-aged",
                definition: "Between about 40 and 60 years old.",
                image: "/images/vocab/people/middle-aged.png",
                collocation: "a __________ man"
              },
              {
                term: "elderly",
                definition: "Old, but more polite and respectful than 'old'.",
                image: "/images/vocab/people/elderly.png",
                collocation: "an __________ neighbour"
              }
            ],
          
            // Extra terms added to the word bank as distractors
            distractors: [
              "skinny",   // distractor – contrasts nicely with 'slim'
              "teenage"    // distractor – size word, but no matching picture in this set
            ],
          
            practice: [
              {
                sentence: "He's quite __________ – almost two metres tall.",
                answer: "tall"
              },
              {
                sentence: "My sister is __________ as she eats well and does regular exercise.",
                answer: "slim"
              },
              {
                sentence:
                  "My grandfather is quite __________ now and struggles with stairs.",
                answer: "elderly"
              },
              {
                sentence:
                  "The doctor told me I'm slightly __________ and should do more exercise.",
                answer: "overweight"
              },
              {
                sentence:
                  "The security guard is really __________ and looks very strong.",
                answer: "well-built"
              },
              {
                sentence:
                  "He's are very __________, which explains why he's a model.",
                answer: "good-looking / attractive"
              },
              {
                sentence:
                  "He's __________ — not tall or short, just in the middle.",
                answer: "medium-height"
              },
              {
                sentence:
                  "The manager is __________ – probably around fifty years old.",
                answer: "middle-aged"
              },
              {
                sentence:
                  "His brother is quite __________: Only about a metre 65.",
                answer: "short"
              }
            ],
          
            tips: [
              "We usually say 'medium-height', not *'normal height'* or *'middle height'*. ",
              "'Slim' is more positive than 'thin'; 'skinny' can sound too negative.",
              "'Overweight' is more polite and neutral than 'fat', especially in formal or professional contexts.",
              "'Elderly' is generally more polite than 'old' when we talk about older people, especially in formal or professional contexts."
            ]
          },    
          {
            id: "face_hair",
            title: "Face and hair",
            focus: "Vocabulary for hair, facial features and typical combinations.",
            
            words: [
              "curly hair",
              "straight hair",
              "wavy hair",
              "medium-length hair",
              "beard",
              "moustache",
              "freckles",
              "wrinkles",
              "dark hair",
              "fair hair"
            ],
          
            pairs: [
              {
                term: "curly",
                definition: "Hair that forms lots of small curves or rings.",
                image: "/images/vocab/people/curly-hair.png",
                collocation: "have __________ hair"
              },
              {
                term: "straight",
                definition: "Hair with no waves or curves; smooth and flat.",
                image: "/images/vocab/people/straight-hair.png",
                collocation: "long __________ hair"
              },
              {
                term: "wavy",
                definition: "Hair that is not straight but has gentle curves.",
                image: "/images/vocab/people/wavy-hair.png",
                collocation: "long __________ hair"
              },
              {
                term: "medium-length",
                definition: "Hair that is not very short and not very long.",
                image: "/images/vocab/people/medium-hair.png",
                collocation: "have __________ hair to the shoulders"
              },
              {
                term: "freckles",
                definition: "Small, light brown spots on the skin, often on the face.",
                image: "/images/vocab/people/freckles.png",
                collocation: "have lots of __________"
              },
              {
                term: "wrinkles",
                definition: "Lines on the skin, often because of age or sun.",
                image: "/images/vocab/people/wrinkles.png",
                collocation: "have __________ around the eyes"
              },
              {
                term: "beard",
                definition: "Hair that grows on a man's chin and cheeks.",
                image: "/images/vocab/people/beard.png",
                collocation: "grow a __________"
              },
              {
                term: "moustache",
                definition: "Hair that grows above a man's upper lip.",
                image: "/images/vocab/people/moustache.png",
                collocation: "have a __________"
              },
              {
                term: "fair",
                definition: "Light-coloured hair, often blond or pale.",
                image: "/images/vocab/people/fair-hair.png",
                collocation: "have __________ hair"
              },
              {
                term: "bald",
                definition: "Have no hair on your head.",
                image: "/images/vocab/people/bald.png",
                collocation: "be __________ "
              }
            ],
          
            // Two distractors, NOT too similar: 
            distractors: ["dark", "sideburns"],
          
            practice: [
                {
                  sentence: "Her hair forms tight little loops — it's very __________.",
                  answer: "curly"
                },
                {
                  sentence: "He used to have long __________ hair, so it was easy to brush.",
                  answer: "straight"
                },
                {
                  sentence: "I love her soft, __________ hair — it has gentle curves but isn't curly.",
                  answer: "wavy"
                },
                {
                  sentence: "I cut my long hair last month, so now it's __________ and comes to my shoulders.",
                  answer: "medium-length / medium length"
                },
                {
                  sentence: "In the summer my __________ always stand out more because of the sun.",
                  answer: "freckles"
                },
                {
                  sentence: "As he’s got older, he’s developed more __________ around his eyes.",
                  answer: "wrinkles"
                },
                {
                  sentence: "He's been trying to grow a __________  for months, but he only has a few hairs on his cheeks.",
                  answer: "beard"
                },
                {
                  sentence: "My uncle has a big __________ that he trims carefully every morning.",
                  answer: "moustache"
                },
                {
                  sentence: "She has __________ hair and light blue eyes, which is common in her region.",
                  answer: "fair"
                },
                {
                  sentence: "He started to go __________ in his twenties and now shaves his head completely.",
                  answer: "bald"
                }
              ],    
          
            tips: [
              "We say 'curly hair', 'wavy hair' and 'straight hair', not *'hairs'*.",
              "'Fair hair' is common in British English for naturally light hair.",
              "Avoid literal translations like *'half-long hair'* — say 'medium-length hair' instead.",
              "A 'moustache' is only above the lip; a 'beard' covers the chin and cheeks."
            ]
          },
          {
            id: "personality_basic",
            title: "Personality 1 – Basic",
            focus: "Common adjectives to describe people’s general personality.",
            words: [
              "outgoing",
              "shy",
              "talkative",
              "friendly",
              "lazy",
              "selfish",
              "clever",
              "generous",
              "mean",
              "hard-working"
            ],
          
            pairs: [
              {
                term: "outgoing",
                definition: "Friendly and confident; likes meeting and talking to new people.",
                image: "/images/vocab/people/outgoing.png",
                collocation: "very __________ and sociable"
              },
              {
                term: "shy",
                definition: "Nervous and uncomfortable with people; does not like being the centre of attention.",
                image: "/images/vocab/people/shy.png",
                collocation: "a rather __________ teenager"
              },
              {
                term: "talkative",
                definition: "Likes talking a lot and easily starts conversations.",
                image: "/images/vocab/people/talkative.png",
                collocation: "quite __________ in class"
              },
              {
                term: "friendly",
                definition: "Kind and pleasant to other people; easy to talk to.",
                image: "/images/vocab/people/friendly.png",
                collocation: "very __________ with new colleagues"
              },
              {
                term: "lazy",
                definition: "Doesn’t like working or making an effort.",
                image: "/images/vocab/people/lazy.png",
                collocation: "too __________ to do his homework"
              },
              {
                term: "selfish",
                definition: "Only thinks about their own needs or wishes, not other people's.",
                image: "/images/vocab/people/selfish.png",
                collocation: "a bit __________ at times"
              },
              {
                term: "clever",
                definition: "Good at learning and understanding things quickly; intelligent.",
                image: "/images/vocab/people/clever.png",
                collocation: "a very __________ student"
              },
              {
                term: "generous",
                definition: "Happy to give time, money or help to other people.",
                image: "/images/vocab/people/generous.png",
                collocation: "really __________ with his time"
              },
              {
                term: "mean",
                definition: "Not generous; unwilling to give or share things with others.",
                image: "/images/vocab/people/mean.png",
                collocation: "quite __________ with his money and possessions."
              },
              {
                term: "hard-working",
                definition: "Does a lot of work and makes a big effort.",
                image: "/images/vocab/people/hard-working.png",
                collocation: "a very __________ employee"
              }
            ],
          
            distractors: ["optimistic", "serious"],
          
            practice: [
              {
                sentence: "She makes friends easily because she’s very __________ and loves meeting new people.",
                answer: "outgoing"
              },
              {
                sentence: "He’s quite __________ and doesn’t like speaking in front of the whole class.",
                answer: "shy"
              },
              {
                sentence: "My cousin is really __________ – once he starts telling a story, he never stops.",
                answer: "talkative"
              },
              {
                sentence: "Everyone in the office likes her because she’s so __________ and helpful.",
                answer: "friendly"
              },
              {
                sentence: "He’s a bit __________ – he just sits on the sofa while other people do the work.",
                answer: "lazy"
              },
              {
                sentence: "Don’t be so __________ – share your sweets with your sister.",
                answer: "selfish"
              },
              {
                sentence: "She’s very __________ and always gets top marks in her exams.",
                answer: "clever"
              },
              {
                sentence: "Our neighbours are really __________ and often invite us for dinner.",
                answer: "generous"
              },
              {
                sentence: "He's pretty __________ despite being rich. He never buys drinks for his friends.",
                answer: "mean"
              },
              {
                sentence: "She’s extremely __________ and always stays late to finish her work.",
                answer: "hard-working / hard working"
              }
            ],
          
            tips: [
              "We usually say someone *is* outgoing / shy / friendly / lazy, etc.",
              "'Clever' is common in British English; 'smart' is also used, especially in American English.",
              "Be careful with 'mean': it can mean 'unkind' or 'not generous', depending on context."
            ]
          },
    
          {
            id: "personality_medium",
            title: "Personality 2 – Medium",
            focus: "More detailed adjectives for describing character and behaviour.",
            words: [
              "sensitive",
              "sensible",
              "moody",
              "stubborn",
              "reliable",
              "charming",
              "bossy",
              "spoilt",
              "insecure"
            ],
          
            pairs: [
              {
                term: "sensitive",
                definition: "Easily affected by what other people say or feel; can be emotional.",
                image: "/images/vocab/people/sensitive.png",
                collocation: "quite __________ about criticism"
              },
              {
                term: "sensible",
                definition: "Has good judgement and makes practical, reasonable decisions.",
                image: "/images/vocab/people/sensible.png",
                collocation: "a very __________ decision"
              },
              {
                term: "moody",
                definition: "Often changes mood quickly and can become unhappy without a clear reason.",
                image: "/images/vocab/people/moody.png",
                collocation: "a bit __________ in the mornings"
              },
              {
                term: "stubborn",
                definition: "Refuses to change their mind, even when they are wrong.",
                image: "/images/vocab/people/stubborn.png",
                collocation: "too __________ to admit he was wrong"
              },
              {
                term: "reliable",
                definition: "You can trust this person to do what they say they will do.",
                image: "/images/vocab/people/reliable.png",
                collocation: "very __________ and always on time"
              },
              {
                term: "charming",
                definition: "Very pleasant and attractive in the way they behave and speak.",
                image: "/images/vocab/people/charming.png",
                collocation: "a __________ host"
              },
              {
                term: "bossy",
                definition: "Likes telling other people what to do in an annoying way.",
                image: "/images/vocab/people/bossy.png",
                collocation: "a bit __________ with her younger brother"
              },
              {
                term: "spoilt",
                definition: "Behaves badly because people have always given them everything they want.",
                image: "/images/vocab/people/spoilt.png",
                collocation: "a __________ only child"
              },
              {
                term: "insecure",
                definition: "Lacks confidence and worries about what others think.",
                image: "/images/vocab/people/insecure.png",
                collocation: "feel __________ about her appearance"
              }
            ],
          
            distractors: ["independent", "friendly"],
          
            practice: [
              {
                sentence: "He’s very __________ and gets upset easily if you criticise him.",
                answer: "sensitive"
              },
              {
                sentence: "That was a very __________ choice – you saved money and avoided problems later.",
                answer: "sensible"
              },
              {
                sentence: "She can be quite __________ – one minute happy, the next minute angry.",
                answer: "moody"
              },
              {
                sentence: "He’s too __________ to apologise, even though he knows he made a mistake.",
                answer: "stubborn"
              },
              {
                sentence: "You can always count on her – she’s really __________ and never cancels plans.",
                answer: "reliable"
              },
              {
                sentence: "Everyone liked him at the party because he was so __________ and funny.",
                answer: "charming"
              },
              {
                sentence: "My little sister is quite __________ and is always telling me what to do.",
                answer: "bossy"
              },
              {
                sentence: "The children are completely __________ – they cry if they don’t get what they want.",
                answer: "spoilt"
              },
              {
                sentence: "He seems confident, but he actually feels very __________ about his English.",
                answer: "insecure"
              }
            ],
          
            tips: [
              "Be careful: 'sensitive' (emotional) is different from 'sensible' (practical and reasonable).",
              "'Spoilt' is the usual British spelling; 'spoiled' is also possible, especially in American English.",
              "We normally say someone *is* moody / reliable / charming / bossy / insecure, etc."
            ]
          }          
    ]
  };
  