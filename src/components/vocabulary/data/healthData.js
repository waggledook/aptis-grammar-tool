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
          "toothache",
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
            term: "toothache",
            definition: "Pain in a tooth or in your teeth.",
            image: "/images/vocab/health/toothache.png"
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
          { sentence: "I can’t chew on this side because I’ve got a __________.", answer: "toothache" },
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
          "pain",
          "dizzy",
          "tired",
          "weak",
          "sick",
          "nauseous",
          "swollen",
          "itchy",
          "bleeding",
          "out of breath",
          "stressed",
          "exhausted"
        ],
  
        pairs: [
          {
            term: "pain",
            definition:
              "An unpleasant feeling in part of your body; something hurts.",
            image: "/images/vocab/health/pain.png"
          },
          {
            term: "dizzy",
            definition:
              "Feeling that everything is turning around and you might fall.",
            image: "/images/vocab/health/dizzy.png"
          },
          {
            term: "tired",
            definition: "Needing rest or sleep; with low energy.",
            image: "/images/vocab/health/tired.png"
          },
          {
            term: "weak",
            definition:
              "Not strong, with very little energy or physical power.",
            image: "/images/vocab/health/weak.png"
          },
          {
            term: "sick",
            definition:
              "Not well; you feel ill. In some varieties of English it can also mean feeling like you want to vomit.",
            image: "/images/vocab/health/sick.png"
          },
          {
            term: "nauseous",
            definition:
              "Feeling as if you might vomit; your stomach feels very uncomfortable.",
            image: "/images/vocab/health/nauseous.png"
          },
          {
            term: "swollen",
            definition:
              "Larger than normal because of an injury, infection or insect bite.",
            image: "/images/vocab/health/swollen.png"
          },
          {
            term: "itchy",
            definition:
              "Uncomfortable and making you want to scratch your skin.",
            image: "/images/vocab/health/itchy.png"
          },
          {
            term: "bleeding",
            definition: "Losing blood from part of your body.",
            image: "/images/vocab/health/bleeding.png"
          },
          {
            term: "out of breath",
            definition:
              "Breathing very fast and with difficulty, usually after exercise.",
            image: "/images/vocab/health/out-of-breath.png"
          },
          {
            term: "stressed",
            definition:
              "Feeling worried, nervous or under a lot of pressure.",
            image: "/images/vocab/health/stressed.png"
          },
          {
            term: "exhausted",
            definition:
              "Extremely tired; with almost no energy left.",
            image: "/images/vocab/health/exhausted.png"
          }
        ],
  
        distractors: ["relaxed", "energetic"],
  
        review: [
          { sentence: "I’ve got a sharp __________ in my chest when I breathe in.", answer: "pain" },
          { sentence: "I stood up too fast and I felt __________.", answer: "dizzy" },
          { sentence: "I’m really __________ today — I didn’t sleep much last night.", answer: "tired" },
          { sentence: "After the illness, he still feels very __________ and can’t do much.", answer: "weak" },
          { sentence: "I’m feeling __________, so I’m going to stay at home today.", answer: "sick" },
          { sentence: "The smell of that food made me feel __________.", answer: "nauseous" },
          { sentence: "My ankle is __________ after I twisted it during football.", answer: "swollen" },
          { sentence: "This cream helped, but my skin is still very __________.", answer: "itchy" },
          { sentence: "The cut won’t stop __________. I think I need a bandage.", answer: "bleeding" },
          { sentence: "After running up the stairs, I was __________ and couldn’t speak.", answer: "out of breath" },
          { sentence: "He felt __________ at work because of the deadline and his noisy office.", answer: "stressed" },
          { sentence: "By the end of the week she was __________ and just wanted to sleep.", answer: "exhausted" },
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
          "tablet",
          "antibiotic",
          "injection",
          "operation",
          "bandage",
          "plaster",
          "check-up"
        ],
  
        pairs: [
          {
            term: "doctor",
            definition:
              "Medical professional who examines you, gives you medicine and explains your illness.",
            image: "/images/vocab/health/doctor.png"
          },
          {
            term: "nurse",
            definition:
              "Person who looks after patients in a hospital or clinic and helps the doctor.",
            image: "/images/vocab/health/nurse.png"
          },
          {
            term: "appointment",
            definition:
              "A fixed time to see a doctor or other professional.",
            image: "/images/vocab/health/appointment.png"
          },
          {
            term: "prescription",
            definition:
              "A piece of paper or electronic note from a doctor telling the pharmacy what medicine you need.",
            image: "/images/vocab/health/prescription.png"
          },
          {
            term: "medicine",
            definition:
              "A general word for substances you take to treat an illness.",
            image: "/images/vocab/health/medicine.png"
          },
          {
            term: "tablet",
            definition:
              "A small, hard piece of medicine that you swallow.",
            image: "/images/vocab/health/tablet.png"
          },
          {
            term: "antibiotic",
            definition:
              "Strong medicine used to treat infections caused by bacteria.",
            image: "/images/vocab/health/antibiotic.png"
          },
          {
            term: "injection",
            definition:
              "Medicine that is pushed into your body with a needle.",
            image: "/images/vocab/health/injection.png"
          },
          {
            term: "operation",
            definition:
              "Medical treatment where a doctor cuts into your body, usually in a hospital.",
            image: "/images/vocab/health/operation.png"
          },
          {
            term: "bandage",
            definition:
              "Long piece of soft material that you wrap around a part of the body to protect or support it.",
            image: "/images/vocab/health/bandage.png"
          },
          {
            term: "plaster",
            definition:
              "Small sticky bandage that you put on a cut on your skin. (US: band-aid)",
            image: "/images/vocab/health/plaster.png"
          },
          {
            term: "check-up",
            definition:
              "Regular medical examination when you are not very ill, just to make sure you are healthy.",
            image: "/images/vocab/health/check-up.png"
          }
        ],
  
        distractors: ["waiting room", "clinic"],
  
        review: [
          { sentence: "The __________ examined my throat and told me to rest at home.", answer: "doctor" },
          { sentence: "A __________ checked my temperature and asked me some questions.", answer: "nurse" },
          { sentence: "I’ve got an __________ with the doctor tomorrow morning.", answer: "appointment" },
          { sentence: "The doctor gave me a __________ so I can buy the medicine at the pharmacy.", answer: "prescription" },
          { sentence: "This __________ should help your cough, but read the instructions carefully.", answer: "medicine" },
          { sentence: "Take one __________ after lunch and one after dinner.", answer: "tablet" },
          { sentence: "He has to take this __________ twice a day for a week for the infection.", answer: "antibiotic" },
          { sentence: "The nurse gave me an __________ in my arm.", answer: "injection" },
          { sentence: "He was nervous before his knee __________, but it went well.", answer: "operation" },
          { sentence: "If the cut is bleeding, put a __________ on it to protect it.", answer: "bandage" },
          { sentence: "I put a __________ on the small cut on my finger.", answer: "plaster" },
          { sentence: "She goes for a __________ at the dentist every six months.", answer: "check-up / check up" },
        ],
  
        tips: [
          "In British English, 'plaster' is common; in American English, people often say 'band-aid' (a brand name).",
          "Use 'have an operation' or 'need an operation', not *'do an operation' when you are the patient.",
          "An 'appointment' is for a specific time; use 'I have an appointment at 10:30', not *'I have a visit'."
        ]
      },
  
      {
        id: "healthy_habits",
        title: "Healthy lifestyle and habits",
        focus: "Actions and habits that help you stay healthy in daily life.",
  
        words: [
          "exercise regularly",
          "work out",
          "go for a walk",
          "get enough sleep",
          "drink plenty of water",
          "eat healthily",
          "eat fruit and vegetables",
          "cut down on sugar",
          "avoid junk food",
          "give up smoking",
          "manage stress",
          "relax"
        ],
  
        pairs: [
          {
            term: "exercise regularly",
            definition:
              "Do physical activity several times a week to keep your body healthy.",
            image: "/images/vocab/health/exercise-regularly.png"
          },
          {
            term: "work out",
            definition:
              "Do physical exercise, often in a gym.",
            image: "/images/vocab/health/work-out.png"
          },
          {
            term: "go for a walk",
            definition:
              "Walk for pleasure or health, not just to go somewhere.",
            image: "/images/vocab/health/go-for-a-walk.png"
          },
          {
            term: "get enough sleep",
            definition:
              "Sleep for the number of hours your body needs to feel good and have energy.",
            image: "/images/vocab/health/get-enough-sleep.png"
          },
          {
            term: "drink plenty of water",
            definition:
              "Drink enough water during the day so that your body stays hydrated.",
            image: "/images/vocab/health/drink-water.png"
          },
          {
            term: "eat healthily",
            definition:
              "Have a diet with good food, not too much fat, sugar or salt.",
            image: "/images/vocab/health/eat-healthily.png"
          },
          {
            term: "eat fruit and vegetables",
            definition:
              "Include fruit and vegetables in your meals every day.",
            image: "/images/vocab/health/eat-fruit-veg.png"
          },
          {
            term: "cut down on sugar",
            definition:
              "Eat or drink less sugar than before.",
            image: "/images/vocab/health/cut-down-on-sugar.png"
          },
          {
            term: "avoid junk food",
            definition:
              "Try not to eat unhealthy fast food or snacks very often.",
            image: "/images/vocab/health/avoid-junk-food.png"
          },
          {
            term: "give up smoking",
            definition:
              "Stop smoking permanently.",
            image: "/images/vocab/health/give-up-smoking.png"
          },
          {
            term: "manage stress",
            definition:
              "Control your stress levels using healthy strategies.",
            image: "/images/vocab/health/manage-stress.png"
          },
          {
            term: "relax",
            definition:
              "Do something calm and enjoyable to rest your body and mind.",
            image: "/images/vocab/health/relax.png"
          }
        ],
  
        distractors: ["put on weight", "stay up late"],
  
        review: [
          { sentence: "If you want to lose weight, you should __________ three times a week.", answer: "exercise regularly" },
          { sentence: "I usually __________ at the gym after work.", answer: "work out" },
          { sentence: "After dinner we often __________ around the neighbourhood.", answer: "go for a walk" },
          { sentence: "I try to __________ by going to bed earlier during the week.", answer: "get enough sleep" },
          { sentence: "On hot days you should __________ to stay hydrated.", answer: "drink plenty of water" },
          { sentence: "He’s trying to __________ and cook more at home.", answer: "eat healthily" },
          { sentence: "Doctors advise people to __________ every day.", answer: "eat fruit and vegetables" },
          { sentence: "I’m trying to __________, so I don’t drink fizzy drinks anymore.", answer: "cut down on sugar" },
          { sentence: "If you want to be healthier, try to __________ during the week.", answer: "avoid junk food" },
          { sentence: "He decided to __________ after the doctor warned him about his lungs.", answer: "give up smoking" },
          { sentence: "Breathing exercises can help you __________ before an exam.", answer: "manage stress" },
          { sentence: "At the weekend, I like to __________ with a book or a film.", answer: "relax" },
        ],
  
        tips: [
          "Use 'cut down on' + noun: 'cut down on sugar / coffee / junk food'.",
          "'Give up' is followed by a noun or -ing form: 'give up smoking', 'give up sweets'.",
          "A simple habit like 'go for a walk' is a good B1–B2 phrase for speaking about health."
        ]
      }
    ]
  };
  