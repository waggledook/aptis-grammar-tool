// src/components/vocabulary/data/healthData.js

export const healthData = {
    sets: [
      {
        id: "health_problems_basic",
        title: "Health problems – basic",
        focus: "Common minor illnesses and problems you can describe in everyday conversation.",
  
        words: [
          "cold",
          "flu",
          "cough",
          "fever",
          "sore throat",
          "headache",
          "stomach ache",
          "backache",
          "earache",
          "rash",
          "allergy",
          "injury"
        ],
  
        pairs: [
          {
            term: "cold",
            definition:
              "A common, mild illness that makes you sneeze and cough with a blocked nose.",
            image: "/images/vocab/health/cold.png"
          },
          {
            term: "flu",
            definition:
              "A stronger illness like a bad cold, often with a high temperature and body pain.",
            image: "/images/vocab/health/flu.png"
          },
          {
            term: "cough",
            definition:
              "When you push air out of your mouth with a sudden sound because you are ill.",
            image: "/images/vocab/health/cough.png"
          },
          {
            term: "fever",
            definition:
              "A high body temperature when you are ill; you feel hot and weak.",
            image: "/images/vocab/health/fever.png"
          },
          {
            term: "sore throat",
            definition:
              "Pain in your throat, especially when you swallow or speak.",
            image: "/images/vocab/health/sore-throat.png"
          },
          {
            term: "headache",
            definition: "Pain in your head.",
            image: "/images/vocab/health/headache.png"
          },
          {
            term: "stomach ache",
            definition: "Pain in your stomach or belly area.",
            image: "/images/vocab/health/stomach-ache.png"
          },
          {
            term: "backache",
            definition: "Pain in your back.",
            image: "/images/vocab/health/backache.png"
          },
          {
            term: "earache",
            definition: "Pain inside your ear.",
            image: "/images/vocab/health/earache.png"
          },
          {
            term: "rash",
            definition:
              "Red or itchy marks on your skin, often caused by an allergy or illness.",
            image: "/images/vocab/health/rash.png"
          },
          {
            term: "allergy",
            definition:
              "A medical condition where something like pollen or food makes you ill or itchy.",
            image: "/images/vocab/health/allergy.png"
          },
          {
            term: "injury",
            definition:
              "Damage to your body, for example a cut, a broken bone or a bruise.",
            image: "/images/vocab/health/injury.png"
          }
        ],
  
        // Two extra options in the matching list
        distractors: ["healthy", "appointment"],
  
        review: [
          { sentence: "I think I’ve got a __________ — my nose is blocked and I keep sneezing.", answer: "cold" },
          { sentence: "I had the __________ last week and I felt weak with a high temperature.", answer: "flu" },
          { sentence: "He’s got a bad __________ and he can’t stop making that sound.", answer: "cough" },
          { sentence: "She stayed in bed because she had a __________ and felt very hot.", answer: "fever" },
          { sentence: "I’ve got a __________, so it hurts when I swallow.", answer: "sore throat" },
          { sentence: "I’ve got a terrible __________. My head really hurts and I can’t concentrate.", answer: "headache" },
          { sentence: "I’ve got a __________ — my stomach hurts after that meal.", answer: "stomach ache" },
          { sentence: "After lifting something heavy, I had a __________ for two days.", answer: "backache" },
          { sentence: "My son has an __________, so he’s been crying and touching his ear.", answer: "earache" },
          {
            sentence: "I’ve got a __________ on my arm — it’s red and really itchy.",
            answer: "rash"
          },
          { sentence: "If you have an __________ to nuts, you shouldn’t eat this cake.", answer: "allergy" },
          { sentence: "He fell off his bike and had an __________ to his leg.", answer: "injury" },
        ],
  
        tips: [
          "We say 'have a headache / backache / toothache', not *'I am headache'.",
          "Use 'allergy to' + noun: 'an allergy to pollen', not *'allergy of pollen'.",
          "Use 'a cold' for the mild illness and 'the flu' for the stronger one."
        ]
      },
  
      {
        id: "health_symptoms",
        title: "Symptoms and how you feel",
        focus: "Words to describe physical and emotional symptoms to a doctor or friend.",
  
        words: [
          "dizzy",
          "weak",
          "ill / sick",
          "nauseous",
          "swollen",
          "itchy",
          "bleeding",
          "stressed",
          "sore",
          "cut",
          "burnt / burned",
          "sprained"
        ],
  
        pairs: [
          {
            term: "dizzy",
            definition:
              "Feeling that everything is turning around and you might fall.",
            image: "/images/vocab/health/dizzy.png",
            collocation: "feel __________ when you stand up"
          },
          {
            term: "weak",
            definition:
              "Not strong, with very little energy or physical power.",
            image: "/images/vocab/health/weak.png",
            collocation: "feel __________ after being ill"
          },
          {
            term: "ill / sick",
            definition:
              "Not well; feeling unhealthy or unwell.",
            image: "/images/vocab/health/sick.png",
            collocation: "feel __________ and stay at home"
          },
          {
            term: "nauseous",
            definition:
              "Feeling as if you might vomit; your stomach feels very uncomfortable.",
            image: "/images/vocab/health/nauseous.png",
            collocation: "feel __________ after eating"
          },
          {
            term: "swollen",
            definition:
              "Larger than normal because of an injury, infection or insect bite.",
            image: "/images/vocab/health/swollen.png",
            collocation: "a __________ ankle / hand"
          },
          {
            term: "itchy",
            definition:
              "Uncomfortable and making you want to scratch your skin.",
            image: "/images/vocab/health/itchy.png",
            collocation: "an __________ rash / skin"
          },
          {
            term: "bleeding",
            definition:
              "Losing blood from part of your body.",
            image: "/images/vocab/health/bleeding.png",
            collocation: "a __________ cut"
          },
          {
            term: "stressed",
            definition:
              "Feeling worried, nervous or under a lot of pressure.",
            image: "/images/vocab/health/stressed.png",
            collocation: "feel __________ at work"
          },
          {
            term: "sore",
            definition:
              "Painful or uncomfortable, especially in muscles or joints.",
            image: "/images/vocab/health/sore.png",
            collocation: "__________ muscles / throat"
          },
          {
            term: "cut",
            definition:
              "Having a small injury where the skin is broken.",
            image: "/images/vocab/health/cut.png",
            collocation: "a __________ finger / hand"
          },
          {
            term: "burnt / burned",
            definition:
              "Injured by heat, fire or something very hot.",
            image: "/images/vocab/health/burn.png",
            collocation: "a __________ hand"
          },
          {
            term: "sprained",
            definition:
              "Injured by twisting a joint, such as an ankle or wrist.",
            image: "/images/vocab/health/sprained.png",
            collocation: "a __________ ankle"
          }
        ],
  
        distractors: ["relaxed", "energetic"],
  
        review: [
          {
            sentence: "I stood up too fast and I felt __________.",
            answer: "dizzy"
          },
          {
            sentence: "After the illness, he still feels very __________ and can’t do much.",
            answer: "weak"
          },
          {
            sentence: "I’m feeling __________, so I’m going to stay at home today.",
            answer: "ill / sick"
          },
          {
            sentence: "The smell of that food made me feel __________.",
            answer: "nauseous"
          },
          {
            sentence: "My ankle is __________ after I twisted it during football.",
            answer: "swollen"
          },
          {
            sentence: "This cream helped, but my skin is still very __________.",
            answer: "itchy"
          },
          {
            sentence: "The cut won’t stop __________. I think I need a bandage.",
            answer: "bleeding"
          },
          {
            sentence: "He felt __________ at work because of the deadline and his noisy office.",
            answer: "stressed"
          },
          {
            sentence: "After the gym, I’ve got really __________ muscles.",
            answer: "sore"
          },
          {
            sentence: "I __________ my finger while cooking dinner.",
            answer: "cut"
          },
          {
            sentence: "She touched the pan and __________ her hand.",
            answer: "burnt / burned"
          },
          {
            sentence: "He __________ his ankle during the match and had to stop playing.",
            answer: "sprained"
          }
        ],
        
  
        tips: [
          "Use 'be' with adjectives: 'I am dizzy / tired / stressed', not *'I have dizzy'.",
          "Use 'have' with nouns: 'I have pain in my back', 'I have a pain in my chest'.",
          "'Sick' can mean 'ill' in British English, and 'feeling like you want to vomit' in many contexts."
        ]
      },
  
      {
        id: "health_treatment",
        title: "Treatments and medical care",
        focus: "People, places and things connected with medical treatment.",
  
        words: [
          "doctor",
          "nurse",
          "appointment",
          "prescription",
          "medicine",
          "tablet / pill",
          "antibiotics",
          "injection",
          "operation",
          "bandage",
          "plaster / band-aid",
          "check-up"
        ],
  
        pairs: [
          {
            term: "doctor",
            definition:
              "Medical professional who examines you, gives you medicine and explains your illness.",
            image: "/images/vocab/health/doctor.png",
          },
          {
            term: "nurse",
            definition:
              "Person who looks after patients in a hospital or clinic and helps the doctor.",
            image: "/images/vocab/health/nurse.png",
          },
          {
            term: "appointment",
            definition:
              "A fixed time to see a doctor or other professional.",
            image: "/images/vocab/health/appointment.png",
            collocation: "make an __________"
          },
          {
            term: "prescription",
            definition:
              "A piece of paper or electronic note from a doctor telling the pharmacy what medicine you need.",
            image: "/images/vocab/health/prescription.png",
            collocation: "get a __________"
          },
          {
            term: "medicine",
            definition:
              "A general word for substances you take to treat an illness.",
            image: "/images/vocab/health/medicine.png",
            collocation: "take __________"
          },
          {
            term: "tablet / pill",
            definition:
              "A small piece of medicine that you swallow.",
            image: "/images/vocab/health/tablet.png",
            collocation: "take a __________"
          },
          {
            term: "antibiotics",
            definition:
              "Strong medicine used to treat infections caused by bacteria.",
            image: "/images/vocab/health/antibiotics.png",
            collocation: "take __________ for an infection"
          },
          {
            term: "injection",
            definition:
              "Medicine that is pushed into your body with a needle.",
            image: "/images/vocab/health/injection.png",
            collocation: "have an __________"
          },
          {
            term: "operation",
            definition:
              "Medical treatment where a doctor cuts into your body, usually in a hospital.",
            image: "/images/vocab/health/operation.png",
            collocation: "have an __________"
          },
          {
            term: "bandage",
            definition:
              "Long piece of soft material that you wrap around a part of the body to protect or support it.",
            image: "/images/vocab/health/bandage.png",
            collocation: "put on a __________"
          },
          {
            term: "plaster / band-aid",
            definition:
              "Small sticky bandage that you put on a cut on your skin. (US: band-aid)",
            image: "/images/vocab/health/plaster.png",
            collocation: "put a __________ on a cut"
          },
          {
            term: "check-up",
            definition:
              "Regular medical examination when you are not very ill, just to make sure you are healthy.",
            image: "/images/vocab/health/check-up.png",
            collocation: "have a __________"
          }
        ],
  
        distractors: ["waiting room", "clinic"],
  
        review: [
          { sentence: "The __________ examined my throat and told me to rest at home.", answer: "doctor" },
          { sentence: "A __________ checked my temperature and asked me some questions.", answer: "nurse" },
          { sentence: "I’ve got an __________ with the doctor tomorrow morning.", answer: "appointment" },
          { sentence: "The doctor gave me a __________ so I can buy the medicine at the pharmacy.", answer: "prescription" },
          { sentence: "This __________ should help your cough, but read the instructions carefully.", answer: "medicine" },
          { sentence: "Take one __________ after lunch and one after dinner.", answer: "tablet / pill" },
          { sentence: "He has to take these __________ twice a day for a week for the infection.", answer: "antibiotics" },
          { sentence: "The nurse gave me an __________ in my arm.", answer: "injection" },
          { sentence: "He was nervous before his knee __________, but it went well.", answer: "operation / surgery" },
          { sentence: "If the cut is bleeding, put a __________ on it to protect it.", answer: "bandage" },
          { sentence: "I put a __________ on the small cut on my finger.", answer: "plaster / band-aid" },
          { sentence: "She goes for a __________ at the dentist every six months.", answer: "check-up / check up" },
        ],
  
        tips: [
          "In British English, 'plaster' is common; in American English, people often say 'band-aid' (a brand name).",
          "Use 'have an operation' or 'need an operation', not *'do an operation' when you are the patient.",
          "An 'appointment' is for a specific time; use 'I have an appointment at 10:30', not *'I have a visit'."
        ]
      },
  
      {
        id: "health_verbs",
        title: "health-related verbs",
        focus: "Actions and habits that help you stay healthy in daily life.",
  
        words: [
          "work out",
          "give up",
          "cut down",
          "pass out / faint",
          "sneeze",
          "throw up / vomit",
          "get better",
          "rest",
          "come down with",
          "heal"
        ],
  
        pairs: [
          {
            term: "work out",
            definition:
              "Do physical exercise, usually to improve your fitness or health.",
            image: "/images/vocab/health/work-out.png",
            collocation: "__________ at the gym"
          },
          {
            term: "give up",
            definition:
              "Stop doing something, especially a bad or unhealthy habit.",
            image: "/images/vocab/health/give-up.png",
            collocation: "__________ smoking"
          },
          {
            term: "cut down",
            definition:
              "Reduce the amount of something you do or consume.",
            image: "/images/vocab/health/cut-down.png",
            collocation: "__________ on sugar"
          },
          {
            term: "pass out / faint",
            definition:
              "Lose consciousness for a short time, often because of heat, illness or shock.",
            image: "/images/vocab/health/pass-out.png",
            collocation: "__________ in the heat"
          },
          {
            term: "sneeze",
            definition:
              "Send air suddenly out of your nose and mouth, often because of dust or an allergy.",
            image: "/images/vocab/health/sneeze.png",
            collocation: "__________ because of dust"
          },
          {
            term: "throw up / vomit",
            definition:
              "Bring food back up from your stomach through your mouth.",
            image: "/images/vocab/health/vomit.png",
            collocation: "__________ after eating"
          },
          {
            term: "get better",
            definition:
              "Recover from an illness or start to feel healthier.",
            image: "/images/vocab/health/get-better.png",
            collocation: "__________ after a few days"
          },
          {
            term: "rest",
            definition:
              "Stop working or moving in order to relax or recover.",
            image: "/images/vocab/health/rest.png",
            collocation: "__________ for a few days"
          },
          {
            term: "come down with",
            definition:
              "Become ill, especially suddenly.",
            image: "/images/vocab/health/come-down-with.png",
            collocation: "__________ the flu"
          },
          {
            term: "heal",
            definition:
              "Become healthy again after an injury or illness.",
            image: "/images/vocab/health/heal.png",
            collocation: "__________ completely"
          }
        ],
  
        distractors: ["put on weight", "stay up late"],
  
        review: [
          {
            sentence: "I usually __________ at the gym three times a week.",
            answer: "work out"
          },
          {
            sentence: "He decided to __________ smoking after his doctor warned him.",
            answer: "give up"
          },
          {
            sentence: "I’m trying to __________ on sugar and eat more healthily.",
            answer: "cut down"
          },
          {
            sentence: "She __________ on the bus because of the heat.",
            answer: "passed out / fainted / pass out / faint"
          },
          {
            sentence: "I always __________ when I’m around cats because of my allergy.",
            answer: "sneeze"
          },
          {
            sentence: "He felt so sick that he __________ after dinner.",
            answer: "threw up / vomited / throw up / vomit"
          },
          {
            sentence: "After a few days of rest, she started to __________.",
            answer: "get better / recover"
          },
          {
            sentence: "The doctor told him to __________ for a few days and avoid exercise.",
            answer: "rest"
          },
          {
            sentence: "I’ve __________ the flu, so I won’t be coming to work today.",
            answer: "come down with"
          },
          {
            sentence: "It took weeks for his ankle to __________ completely.",
            answer: "heal"
          }
        ],
  
        tips: [
          "Use 'cut down on' + noun: 'cut down on sugar / coffee / junk food'.",
          "'Give up' is followed by a noun or -ing form: 'give up smoking', 'give up sweets'.",
          "A simple habit like 'go for a walk' is a good B1–B2 phrase for speaking about health."
        ]
      }
    ]
  };
  