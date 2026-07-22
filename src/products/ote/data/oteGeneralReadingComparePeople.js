const drivingProfiles = [
  {
    id: "A",
    name: "Maya",
    paragraphs: [
      "I began learning to drive last autumn because I wanted more independence. At first, I booked an intensive course, thinking that daily lessons would help me improve quickly. In reality, I found it difficult to concentrate for several hours at a time, and by the end of each day I was repeating the same mistakes. I changed to one lesson a week and started enjoying the process much more.",
      "My instructor is quite direct, but I appreciate knowing immediately when I have done something unsafe. Between lessons, I practise parking with my aunt in a quiet industrial area. She is patient, although she sometimes gives me different advice from my instructor, which can be confusing.",
      "I have not taken the test yet, but I no longer feel in a hurry. I would rather become a confident driver than pass quickly under pressure from anyone else.",
    ],
  },
  {
    id: "B",
    name: "Leo",
    paragraphs: [
      "My father offered to teach me, and at first I thought this would save money. He is an experienced driver, but he found it hard to explain things calmly, especially when I made the same mistake twice. We began arguing, so after a month I joined a driving school instead.",
      "The professional lessons were less stressful, although I still practised with my father at weekends once we had agreed that he would not comment on every small decision. After each lesson, I wrote down what had gone well and what I needed to improve. Looking back at those notes before the next lesson helped me focus.",
      "I passed my test on the first attempt, but I do not think that was because I was naturally good at driving. Regular practice between lessons made the biggest difference, even when the practice sessions were short and easy to repeat.",
    ],
  },
  {
    id: "C",
    name: "Nina",
    paragraphs: [
      "I avoided learning to drive for years because buses and trains were enough for me. Then I was offered a job in a place that was difficult to reach by public transport, so driving suddenly became necessary.",
      "I completed the theory course online and liked being able to repeat the videos whenever I wanted. However, understanding the rules on a screen did not make me feel comfortable in traffic. I became especially nervous at busy roundabouts and failed my first practical test after hesitating for too long.",
      "My instructor says my driving is safe, but I need to make decisions more confidently. I am now considering taking the test in an automatic car. I originally wanted to learn in a manual because it gives drivers more choice, but at the moment reducing the number of things I have to think about seems much more important to me.",
    ],
  },
];

const drivingQuestions = [
  {
    id: "slower-progress",
    title: "Slower progress",
    question: "Who decided that making slower progress suited them better?",
    answer: "A",
    distinction: "Changing the kind of lesson or car is not the same as deliberately slowing the pace of progress.",
    candidates: {
      A: { diagnosis: "full", reason: "Maya changed from daily lessons to one lesson a week and stopped feeling in a hurry.", highlights: ["I changed to one lesson a week and started enjoying the process much more", "I no longer feel in a hurry"] },
      B: { diagnosis: "related", reason: "Leo changed from learning with his father to using a driving school, not to a slower course.", highlights: ["after a month I joined a driving school instead"] },
      C: { diagnosis: "related", reason: "Nina is considering changing the type of car, not the speed of her progress.", highlights: ["I am now considering taking the test in an automatic car"] },
    },
  },
  {
    id: "relative-limits",
    title: "Practising with a relative",
    question: "Who found that practising with a relative improved after they agreed on some limits?",
    answer: "B",
    distinction: "Simply practising with a relative is not enough; the relationship must improve after a clear agreement.",
    candidates: {
      A: { diagnosis: "related", reason: "Maya practises with her aunt, but their different advice remains confusing.", highlights: ["She is patient, although she sometimes gives me different advice from my instructor, which can be confusing"] },
      B: { diagnosis: "full", reason: "Practising with Leo's father became less stressful once his father agreed not to comment constantly.", highlights: ["once we had agreed that he would not comment on every small decision"] },
      C: { diagnosis: "ruled", reason: "No relative is involved in Nina's practice.", highlights: [] },
    },
  },
  {
    id: "new-opportunity",
    title: "A new opportunity",
    question: "Who began learning because a new opportunity made driving necessary?",
    answer: "C",
    distinction: "Wanting more independence is a personal aim; needing to reach a new job is a practical necessity.",
    candidates: {
      A: { diagnosis: "related", reason: "Maya wanted greater independence, but driving was not presented as necessary.", highlights: ["because I wanted more independence"] },
      B: { diagnosis: "ruled", reason: "Leo explains who taught him, but not why he needed to drive.", highlights: [] },
      C: { diagnosis: "full", reason: "A new job that was difficult to reach by public transport created the need.", highlights: ["I was offered a job in a place that was difficult to reach by public transport, so driving suddenly became necessary"] },
    },
  },
  {
    id: "written-record",
    title: "A written record",
    question: "Who used a written record to prepare for later lessons?",
    answer: "B",
    distinction: "Repeating provided course material is different from recording and reviewing your own performance.",
    candidates: {
      A: { diagnosis: "ruled", reason: "Maya mentions practice but no written record.", highlights: [] },
      B: { diagnosis: "full", reason: "Leo wrote down strengths and weaknesses and reviewed the notes before the next lesson.", highlights: ["After each lesson, I wrote down what had gone well and what I needed to improve", "Looking back at those notes before the next lesson helped me focus"] },
      C: { diagnosis: "related", reason: "Nina repeated online videos, but did not record her own progress in writing.", highlights: ["liked being able to repeat the videos whenever I wanted"] },
    },
  },
  {
    id: "immediate-correction",
    title: "Immediate correction",
    question: "Who believes that immediate correction is useful?",
    answer: "A",
    distinction: "Receiving general advice is not the same as valuing correction at the moment a mistake happens.",
    candidates: {
      A: { diagnosis: "full", reason: "Maya appreciates being told immediately when she does something unsafe.", highlights: ["I appreciate knowing immediately when I have done something unsafe"] },
      B: { diagnosis: "ruled", reason: "Constant comments from Leo's father made practice stressful.", highlights: ["he would not comment on every small decision"] },
      C: { diagnosis: "related", reason: "Nina's instructor identified a confidence problem, but she does not discuss immediate correction.", highlights: ["I need to make decisions more confidently"] },
    },
  },
  {
    id: "reduce-demands",
    title: "Reducing the demands",
    question: "Who plans to reduce the practical demands of taking the test?",
    answer: "C",
    distinction: "Reducing lesson frequency is different from reducing the number of actions required during the test.",
    candidates: {
      A: { diagnosis: "related", reason: "Maya reduced the frequency of her lessons, not the complexity of the test.", highlights: ["I changed to one lesson a week"] },
      B: { diagnosis: "ruled", reason: "Leo has already passed and describes no planned change.", highlights: ["I passed my test on the first attempt"] },
      C: { diagnosis: "full", reason: "An automatic car would reduce the number of things Nina must manage while driving.", highlights: ["reducing the number of things I have to think about seems much more important"] },
    },
  },
];

const programmes = [
  {
    id: "A",
    name: "CoastWatch Weekend",
    paragraphs: [
      "CoastWatch Weekend combines beach cleaning with simple wildlife surveys along a protected stretch of coast. Volunteers work outdoors in small groups, recording seabirds and removing rubbish from areas that are difficult for local staff to reach.",
      "No previous conservation experience is needed, and all equipment is supplied. The work involves several kilometres of walking on uneven ground, so participants should be reasonably fit.",
      "The project runs from Friday evening to Sunday afternoon. Volunteers sleep in shared tents and prepare meals together. A coach leaves from the city centre on Friday and returns there after the final session, making the programme suitable for people without their own transport.",
    ],
  },
  {
    id: "B",
    name: "Heritage Helpers",
    paragraphs: [
      "Heritage Helpers supports the restoration of historic buildings in small towns. Participants may repair wooden fittings, prepare walls for painting or help clear overgrown outdoor areas.",
      "Full instruction is given, although people with some practical experience often progress to more detailed work. Projects last from Monday to Friday and include shared hostel accommodation. Breakfast is provided, but volunteers buy or prepare their other meals.",
      "The days can be physically demanding, yet evening talks from local historians offer a quieter side to the programme. Transport to the project town is not included, though volunteers are collected from the nearest railway station.",
    ],
  },
  {
    id: "C",
    name: "Community Kitchen Project",
    paragraphs: [
      "The Community Kitchen Project prepares affordable meals for older residents and families experiencing financial difficulty. Volunteers attend on Saturday mornings for six consecutive weeks, working in an accessible city-centre kitchen.",
      "Tasks include preparing ingredients, packing meals and speaking with visitors who collect them. No cooking experience is necessary, as the first session includes practical training. Participants who complete the programme receive a basic food-hygiene certificate.",
      "The work is indoors and most tasks can be adapted for people who cannot stand for long periods. Volunteers must be at least sixteen, and they are responsible for travelling to the kitchen themselves each week.",
    ],
  },
  {
    id: "D",
    name: "Digital Access Volunteers",
    paragraphs: [
      "Digital Access Volunteers helps older adults become more confident using phones, tablets and everyday online services. Volunteers provide support from home through scheduled video calls, usually on weekday evenings.",
      "They do not need professional technical qualifications, but they should be patient and comfortable explaining simple digital tasks. Online training and sample sessions are provided before volunteers meet participants.",
      "Because trust develops gradually, the organisation asks for a minimum commitment of three months, with one call each week. Volunteers may occasionally help with online forms, but they are never expected to handle another person's passwords, banking details or private documents directly.",
    ],
  },
];

const programmePeople = [
  {
    id: "sofia",
    title: "Sofia",
    question: "Which programme is the complete fit for Sofia?",
    prompt: "Sofia wants to spend one weekend doing environmental work outdoors. She is fit enough for an active project and is happy to camp. She does not have a car.",
    requirements: ["One weekend", "Outdoor environmental work", "Transport provided"],
    answer: "A",
    candidates: {
      A: { diagnosis: "complete", reason: "It is a weekend environmental project with city-centre coach transport.", checks: ["yes", "yes", "yes"], highlights: ["beach cleaning with simple wildlife surveys", "Friday evening to Sunday afternoon", "A coach leaves from the city centre"] },
      B: { diagnosis: "partial", reason: "It is active and residential, but lasts from Monday to Friday and focuses on buildings.", checks: ["no", "partial", "partial"], highlights: ["clear overgrown outdoor areas", "Monday to Friday", "collected from the nearest railway station"] },
      C: { diagnosis: "ruled", reason: "It is an indoor six-week programme.", checks: ["no", "no", "no"], highlights: ["Saturday mornings for six consecutive weeks", "The work is indoors"] },
      D: { diagnosis: "ruled", reason: "It is remote, long-term and technology-based.", checks: ["no", "no", "no"], highlights: ["support from home", "minimum commitment of three months"] },
    },
  },
  {
    id: "marcus",
    title: "Marcus",
    question: "Which programme is the complete fit for Marcus?",
    prompt: "Marcus has some basic DIY experience and would like to help restore an old building. He can take a full working week off and wants accommodation included. He will travel by train.",
    requirements: ["Historic restoration", "Monday-to-Friday availability", "Accommodation and railway access"],
    answer: "B",
    candidates: {
      A: { diagnosis: "partial", reason: "It is residential and practical, but concerns nature conservation and runs at the weekend.", checks: ["no", "no", "partial"], highlights: ["beach cleaning with simple wildlife surveys", "Friday evening to Sunday afternoon", "sleep in shared tents"] },
      B: { diagnosis: "complete", reason: "It provides restoration work, weekday accommodation and collection from the railway station.", checks: ["yes", "yes", "yes"], highlights: ["restoration of historic buildings", "Monday to Friday", "shared hostel accommodation", "collected from the nearest railway station"] },
      C: { diagnosis: "ruled", reason: "It involves food preparation in a city kitchen.", checks: ["no", "no", "no"], highlights: ["prepares affordable meals", "Saturday mornings"] },
      D: { diagnosis: "ruled", reason: "It is remote digital support.", checks: ["no", "no", "no"], highlights: ["support from home"] },
    },
  },
  {
    id: "leila",
    title: "Leila",
    question: "Which programme is the complete fit for Leila?",
    prompt: "Leila is seventeen and wants regular Saturday volunteering involving food and the local community. She would like to gain a useful qualification. A health condition means she may occasionally need to work sitting down.",
    requirements: ["Accepts younger volunteers", "Saturday food-related work", "Qualification and adaptable tasks"],
    answer: "C",
    candidates: {
      A: { diagnosis: "ruled", reason: "It is physically demanding and does not offer a qualification.", checks: ["no", "no", "no"], highlights: ["walking on uneven ground"] },
      B: { diagnosis: "ruled", reason: "It takes place during the working week and involves demanding restoration work.", checks: ["no", "no", "no"], highlights: ["Monday to Friday", "physically demanding"] },
      C: { diagnosis: "complete", reason: "It accepts volunteers from sixteen and offers Saturday kitchen work, adaptable tasks and a certificate.", checks: ["yes", "yes", "yes"], highlights: ["Saturday mornings", "food-hygiene certificate", "tasks can be adapted", "at least sixteen"] },
      D: { diagnosis: "partial", reason: "It supports older people and offers training, but does not involve food, Saturdays or a qualification.", checks: ["no", "no", "partial"], highlights: ["helps older adults", "weekday evenings", "Online training"] },
    },
  },
  {
    id: "owen",
    title: "Owen",
    question: "Which programme is the complete fit for Owen?",
    prompt: "Owen works during the day and wants to volunteer from home in the evenings. He is comfortable with everyday technology but has no professional IT qualifications. He is willing to make a regular commitment for several months.",
    requirements: ["Remote evening work", "Ordinary technical confidence", "Long-term commitment"],
    answer: "D",
    candidates: {
      A: { diagnosis: "ruled", reason: "It is an in-person weekend project.", checks: ["no", "no", "no"], highlights: ["Friday evening to Sunday afternoon"] },
      B: { diagnosis: "ruled", reason: "It requires a full week at the project location.", checks: ["no", "no", "no"], highlights: ["Monday to Friday", "shared hostel accommodation"] },
      C: { diagnosis: "partial", reason: "It involves regular community support, but is face-to-face on Saturday mornings.", checks: ["no", "no", "partial"], highlights: ["Saturday mornings for six consecutive weeks", "speaking with visitors"] },
      D: { diagnosis: "complete", reason: "It is remote, normally takes place in the evening and requires a three-month commitment.", checks: ["yes", "yes", "yes"], highlights: ["support from home", "weekday evenings", "do not need professional technical qualifications", "minimum commitment of three months"] },
    },
  },
  {
    id: "priya",
    title: "Priya",
    question: "Which programme is the complete fit for Priya?",
    prompt: "Priya wants a short residential project involving nature. She is interested in learning how to record wildlife and does not have previous experience. She would prefer not to organise her own journey to the project.",
    requirements: ["Short residential project", "Wildlife activity", "Beginners accepted and transport arranged"],
    answer: "A",
    candidates: {
      A: { diagnosis: "complete", reason: "It includes wildlife surveys, accepts beginners, provides camping and runs a coach.", checks: ["yes", "yes", "yes"], highlights: ["wildlife surveys", "No previous conservation experience is needed", "sleep in shared tents", "A coach leaves from the city centre"] },
      B: { diagnosis: "partial", reason: "It is residential and provides instruction, but focuses on historic buildings and requires travel to the town.", checks: ["partial", "no", "partial"], highlights: ["Full instruction is given", "shared hostel accommodation", "Transport to the project town is not included"] },
      C: { diagnosis: "ruled", reason: "It is a non-residential kitchen programme.", checks: ["no", "no", "partial"], highlights: ["No cooking experience is necessary", "travelling to the kitchen themselves"] },
      D: { diagnosis: "ruled", reason: "It is remote and unrelated to nature.", checks: ["no", "no", "partial"], highlights: ["Online training", "support from home"] },
    },
  },
  {
    id: "daniel",
    title: "Daniel",
    question: "Which programme is the complete fit for Daniel?",
    prompt: "Daniel wants regular, face-to-face volunteering that helps older people or families. He is only free at weekends and would value a certificate that could support future job applications. He cannot comfortably stand for an entire session.",
    requirements: ["Direct community contact", "Weekends", "Certificate and accessible duties"],
    answer: "C",
    candidates: {
      A: { diagnosis: "ruled", reason: "It does not involve direct community support and is physically demanding.", checks: ["no", "partial", "no"], highlights: ["walking on uneven ground", "Friday evening to Sunday afternoon"] },
      B: { diagnosis: "ruled", reason: "It runs during the working week and offers no certificate.", checks: ["no", "no", "no"], highlights: ["Monday to Friday", "physically demanding"] },
      C: { diagnosis: "complete", reason: "It provides Saturday community work, a certificate and tasks that can be adapted.", checks: ["yes", "yes", "yes"], highlights: ["older residents and families", "Saturday mornings", "food-hygiene certificate", "tasks can be adapted"] },
      D: { diagnosis: "partial", reason: "It helps older adults regularly, but contact is remote, normally on weekdays, and no certificate is offered.", checks: ["partial", "no", "no"], highlights: ["helps older adults", "support from home", "weekday evenings"] },
    },
  },
];

export const generalCompareModes = [
  {
    id: "people",
    label: "Mode 1",
    title: "Compare the People",
    level: "B1",
    description: "Six questions about three people learning to drive.",
    intro: "Skim all three profiles first. During the questions, one useful extract from every profile will be highlighted.",
    texts: drivingProfiles,
    items: drivingQuestions,
    diagnoses: [
      { id: "full", label: "Full match", description: "The person's meaning answers every important part of the question." },
      { id: "related", label: "Related, but different", description: "The same topic appears, but an important detail or meaning is different." },
      { id: "ruled", label: "Ruled out", description: "The profile does not provide the required information or clearly cannot answer the question." },
    ],
  },
  {
    id: "programmes",
    label: "Mode 2",
    title: "Check the Complete Fit",
    level: "B2",
    description: "Match six volunteers with four programmes by checking every requirement.",
    intro: "Read the six people first. For each one, you will compare all four programmes against three essential requirements.",
    texts: programmes,
    items: programmePeople,
    diagnoses: [
      { id: "complete", label: "Complete fit", description: "The programme meets all the person's essential requirements." },
      { id: "partial", label: "Partial fit", description: "Some details fit, but at least one essential requirement is missing." },
      { id: "ruled", label: "Ruled out", description: "The programme is unsuitable in several important ways." },
    ],
  },
];
