export const APTIS_SPEAKING_STRATEGY_GUIDES = {
  "1": {
    number: "1",
    title: "Personal Questions",
    seoDescription:
      "Learn how to develop clear, natural answers in Aptis Speaking Part 1, then check your strategy with a short quiz.",
    menuPath: "/speaking/parts/1",
    practicePath: "/speaking/part1",
    facts: [
      { value: "3 questions", label: "about you and familiar topics" },
      { value: "Up to 30 seconds", label: "for each answer" },
      { value: "No preparation", label: "answer when the recording begins" },
    ],
    task: [
      "In Part 1, you answer three questions about yourself and familiar everyday topics, such as your free time, home, routines, experiences or preferences. You can speak for up to 30 seconds for each answer, with no preparation time.",
      "The aim is simple: answer the question clearly and develop your answer naturally. Try to use most of the available time instead of stopping after one short sentence.",
    ],
    steps: [
      {
        title: "Answer the question immediately",
        body: "Start with a clear, direct response. Do not spend several seconds introducing the topic before reaching your answer.",
        example: {
          first: "What do you like doing at weekends?",
          second: "I usually like going out with my family…",
        },
      },
      {
        title: "Use answer → reason → detail or example",
        body: "This gives you a simple way to continue without making the answer complicated. It is a useful guide, not a script you must follow mechanically.",
        example: {
          first: "I really enjoy running because it helps me relax.",
          second: "I usually go in the evening, and at weekends I sometimes run in the countryside with a friend.",
        },
      },
      {
        title: "Ask yourself simple follow-up questions",
        body: "If you run out of ideas, use one or two quick questions to find another relevant detail.",
        prompts: ["Why?", "When?", "Where?", "Who with?", "How often?", "Can I give an example?"],
      },
      {
        title: "Connect your ideas naturally",
        body: "Avoid a list of separate short sentences. Words such as “because”, “but”, “so”, “when” and “although” can help your answer flow.",
        example: {
          first: "I like football. I play on Saturdays. I play with my friends.",
          second: "I really like football, and I normally play with some friends on Saturdays because it’s a good way to relax.",
        },
      },
      {
        title: "Practise topics, not scripts",
        body: "Practise speaking about familiar areas such as holidays, hobbies, work, family and weekend activities. Do not memorise complete answers: the real question may be different from the one you prepared.",
      },
    ],
    warnings: [
      {
        title: "Giving a one-sentence answer",
        body: "Even if it is correct, you are missing a chance to show more of your English. Add a reason, detail or example.",
      },
      {
        title: "Talking around the question",
        body: "Answer first, then develop. Do not give a long introduction before you reach your point.",
      },
      {
        title: "Forcing complicated language",
        body: "Use language you can control and concentrate on speaking clearly and continuously.",
      },
    ],
    reminder: "Answer directly → explain why → add details or an example → keep going naturally.",
    quiz: [
      {
        id: "develop-answer",
        prompt: "You answer a question clearly after about eight seconds. What should you do next?",
        options: [
          { id: "A", label: "Stop the recording" },
          { id: "B", label: "Add a reason, detail or example" },
          { id: "C", label: "Repeat the same answer in different words" },
        ],
        answer: "B",
        feedback: "Exactly. Once you have answered the question, use the remaining time to develop your response naturally.",
      },
      {
        id: "follow-up",
        prompt: "You cannot think of anything else to say. What is a useful strategy?",
        options: [
          { id: "A", label: "Think about where, when, why, who with or how often" },
          { id: "B", label: "Change to a completely different topic" },
          { id: "C", label: "Repeat the question aloud" },
        ],
        answer: "A",
        feedback: "Right. Simple follow-up questions can quickly give you extra details to talk about.",
      },
      {
        id: "prepare-topics",
        prompt: "What is the best way to prepare for Part 1?",
        options: [
          { id: "A", label: "Memorise complete answers to as many questions as possible" },
          { id: "B", label: "Practise speaking spontaneously about familiar topics" },
          { id: "C", label: "Prepare one long answer that can work for any question" },
        ],
        answer: "B",
        feedback: "Yes. Familiarity with common topics helps you respond quickly while still answering the question you actually receive.",
      },
    ],
  },
  "2": {
    number: "2",
    title: "Describing a Photograph",
    seoDescription:
      "Learn how to describe a photograph and develop the follow-up answers in Aptis Speaking Part 2, then take a short quiz.",
    menuPath: "/speaking/parts/2",
    practicePath: "/speaking/part2",
    facts: [
      { value: "1 photograph", label: "followed by related questions" },
      { value: "3 questions", label: "picture → you → people in general" },
      { value: "Up to 45 seconds", label: "for each answer" },
    ],
    task: [
      "In Part 2, you see one photograph and answer three questions. You can speak for up to 45 seconds for each answer, with no preparation time.",
      "The questions move from describing the photograph to discussing the topic in your own experience and then giving a more general opinion. Think: picture → you → people in general.",
    ],
    steps: [
      {
        title: "Start Question 1 with the big picture",
        body: "Give a simple overview before moving to the people, actions, setting and important details. This gives your description a clear structure instead of turning it into a list of objects.",
        example: {
          first: "What can you see in the photograph?",
          second: "The photo shows a group of people having a meal together outdoors.",
        },
      },
      {
        title: "Use careful guesses to develop your description",
        body: "You can make plausible guesses about what you see, but make it clear that you are not certain. Keep your ideas connected to the picture instead of inventing a long story.",
        prompts: [
          "They might be celebrating something.",
          "It looks as though they’re having a good time.",
          "They seem to be friends or relatives.",
          "The photo was probably taken in summer.",
        ],
      },
      {
        title: "In Question 2, move away from the photograph",
        body: "The second question normally asks about your own experience or situation. Answer directly, then add a reason, detail or example.",
        example: {
          first: "Do you often eat outdoors?",
          second: "I don’t eat outdoors very often, but in summer my family sometimes has lunch in the garden because…",
        },
      },
      {
        title: "In Question 3, think more generally",
        body: "Now the focus moves beyond you. State your view clearly and develop it with reasons or examples instead of stopping after an opinion phrase.",
        example: {
          first: "Is eating together important?",
          second: "I think it is important because it gives people a chance to talk properly. These days, a lot of families…",
        },
      },
      {
        title: "Use the available time to develop, not repeat",
        body: "If you finish your basic answer quickly, add a reason, example, contrast, advantage, disadvantage or another relevant detail. Aim to use most of the time naturally.",
      },
    ],
    warnings: [
      {
        title: "Describing the photo as a list",
        body: "Connect the people, actions and setting instead of producing a series of separate “There is…” sentences.",
      },
      {
        title: "Speculating too much",
        body: "Careful guesses are useful, but keep them plausible and based on something you can see.",
      },
      {
        title: "Keeping the same focus",
        body: "After Question 1, listen carefully and move from the photograph to your experience and then to the wider topic.",
      },
      {
        title: "Giving an opinion without support",
        body: "An opinion phrase is only the beginning. Explain why you think that and add useful support.",
      },
    ],
    reminder: "Describe clearly and speculate carefully → talk about your experience → give a general opinion and explain it.",
    quiz: [
      {
        id: "overview",
        prompt: "What is a good way to begin your photograph description?",
        options: [
          { id: "A", label: "List every object you can see" },
          { id: "B", label: "Give a short overview of the main scene" },
          { id: "C", label: "Invent a story about the people" },
        ],
        answer: "B",
        feedback: "Exactly. Start with the overall scene, then add useful details and careful speculation.",
      },
      {
        id: "speculation",
        prompt: "You say, “They look as though they’re waiting for somebody.” Why can this be useful?",
        options: [
          { id: "A", label: "It lets you speculate naturally about what you can see" },
          { id: "B", label: "It means you do not need to describe the photograph" },
          { id: "C", label: "It proves exactly what the people are doing" },
        ],
        answer: "A",
        feedback: "Right. Expressions such as “seem to”, “might” and “look as though” help you develop the description without pretending your interpretation is certain.",
      },
      {
        id: "question-progression",
        prompt: "What change should you expect across the three questions?",
        options: [
          { id: "A", label: "Description → personal experience → general opinion" },
          { id: "B", label: "Description → description → description" },
          { id: "C", label: "Personal opinion → photograph description → grammar question" },
        ],
        answer: "A",
        feedback: "Yes. Remembering picture → you → people in general helps you change focus as the questions become broader.",
      },
    ],
  },
  "3": {
    number: "3",
    title: "Comparing Photographs",
    seoDescription:
      "Learn how to describe, compare and evaluate two photographs in Aptis Speaking Part 3, then check your strategy with a short quiz.",
    menuPath: "/speaking/parts/3",
    practicePath: "/speaking/part3",
    facts: [
      { value: "2 photographs", label: "on one related topic" },
      { value: "3 questions", label: "describe → compare → evaluate" },
      { value: "Up to 45 seconds", label: "for each answer" },
    ],
    task: [
      "In Part 3, you see two photographs and answer three questions. You can speak for up to 45 seconds for each answer, with no preparation time.",
      "The questions normally ask you to describe both photographs, compare an aspect of them, and then give an opinion or preference with reasons. Think: describe → compare → evaluate.",
    ],
    steps: [
      {
        title: "In Question 1, describe both photographs",
        body: "Start with a quick overview of what each picture shows, then add useful details about the people, places, actions and atmosphere. Keep the two pictures balanced.",
        example: {
          first: "Both photos show people travelling.",
          second: "In the first picture they’re on a crowded train, whereas the second shows a family travelling by car.",
        },
      },
      {
        title: "Use comparison language naturally",
        body: "In Question 2, focus directly on the similarity or difference in the question instead of describing both photographs again.",
        prompts: [
          "Both pictures show…",
          "Whereas / while…",
          "In contrast…",
          "Compared with…",
          "The first situation seems more…",
          "One advantage of… is…",
        ],
      },
      {
        title: "Use careful speculation",
        body: "When you cannot know something for certain, careful guesses help you discuss feelings, reasons, advantages and disadvantages accurately.",
        prompts: ["They might be…", "They could be…", "It looks as though…", "They seem to…", "I’d imagine…", "They’re probably…"],
      },
      {
        title: "Answer Questions 2 and 3 directly",
        body: "If the question asks which situation would be more enjoyable, begin with your choice. Then develop it with reasons, comparisons, examples or speculation.",
        example: {
          first: "Which situation would be more enjoyable?",
          second: "I’d definitely prefer the second situation because…",
        },
      },
      {
        title: "Use the available time to develop your ideas",
        body: "A useful pattern is answer → reason → comparison → extra detail or example. Keep the answer clear and connect your ideas naturally.",
      },
    ],
    warnings: [
      {
        title: "Describing for the whole answer",
        body: "In Question 2 especially, the comparison matters more than another general description.",
      },
      {
        title: "Ignoring one photograph",
        body: "Both images matter. Use details from both situations when the question asks you to compare them.",
      },
      {
        title: "Being too certain",
        body: "Say people “might be” celebrating when the picture does not prove exactly what is happening.",
      },
      {
        title: "Giving an opinion without a reason",
        body: "Your choice is the starting point. Explain why and compare it with the alternative.",
      },
    ],
    reminder: "Describe both → compare directly → speculate where useful → give an opinion and explain why.",
    quiz: [
      {
        id: "direct-comparison",
        prompt: "Question 2 asks which situation looks more stressful. What is the best way to begin?",
        options: [
          { id: "A", label: "Describe everything you can see in Picture 1" },
          { id: "B", label: "Choose the more stressful situation and begin explaining why" },
          { id: "C", label: "Talk about a stressful experience from your own life" },
        ],
        answer: "B",
        feedback: "Exactly. Answer the comparison directly, then use details from both photographs to explain your choice.",
      },
      {
        id: "uncertain-detail",
        prompt: "You think the people are waiting for a flight, but you are not certain. What should you say?",
        options: [
          { id: "A", label: "They are definitely waiting for a flight" },
          { id: "B", label: "Avoid mentioning it because you cannot be certain" },
          { id: "C", label: "They might be waiting for a flight" },
        ],
        answer: "C",
        feedback: "Right. Speculative language lets you develop what you see without presenting your interpretation as a fact.",
      },
      {
        id: "develop-preference",
        prompt: "You say, “I’d prefer the first situation.” What should you do next?",
        options: [
          { id: "A", label: "Explain why and compare it with the other situation" },
          { id: "B", label: "Repeat your preference using different words" },
          { id: "C", label: "Return to describing objects in the photographs" },
        ],
        answer: "A",
        feedback: "Yes. Your opinion is the starting point. Reasons, comparisons and examples turn it into a developed answer.",
      },
    ],
  },
  "4": {
    number: "4",
    title: "Extended Speaking",
    seoDescription:
      "Learn how to plan and deliver a connected two-minute response in Aptis Speaking Part 4, then take a short strategy quiz.",
    menuPath: "/speaking/parts/4",
    practicePath: "/speaking/part4",
    facts: [
      { value: "3 linked questions", label: "on one topic" },
      { value: "1 minute", label: "to prepare and make notes" },
      { value: "Up to 2 minutes", label: "for one complete response" },
    ],
    task: [
      "In Part 4, you see a picture and three questions on one topic. You have one minute to prepare and make notes, then up to two minutes to answer all three questions in one response.",
      "The picture only introduces the topic, so you do not need to describe it. The questions move from a personal experience to your opinion and then a broader discussion. Think: experience → opinion → wider perspective.",
    ],
    steps: [
      {
        title: "Use the preparation minute to plan all three questions",
        body: "Write keywords and short notes instead of complete sentences. Give each question at least one main idea before you start speaking.",
        prompts: ["Q1: example + details", "Q2: opinion + reason", "Q3: main idea + reasons, advantages or disadvantages"],
      },
      {
        title: "Develop your personal example",
        body: "The first question usually asks about an experience. Add what happened, when, who was involved, how you felt and what happened afterwards instead of giving only the basic answer.",
        example: {
          first: "Yes, this happened to me once.",
          second: "A few years ago, I had to make a difficult decision about changing jobs. I found it stressful because…",
        },
      },
      {
        title: "Move from the experience to your opinion",
        body: "Use the second question to explain what you think and why. A short transition can help the ideas connect naturally.",
        prompts: ["That experience made me realise that…", "Because of that, I think…", "Personally, I’d say…"],
      },
      {
        title: "Make Question 3 broader",
        body: "Move beyond your individual experience and discuss the wider issue. You might consider reasons, consequences, different groups, changes over time, possible solutions or both sides of an argument.",
      },
      {
        title: "Connect the three answers into one talk",
        body: "Cover all three questions, but make the response sound like one developed talk rather than three separate recordings.",
        prompts: ["As for whether…", "More generally…", "Another point is that…", "On the other hand…", "Overall, I’d say…"],
      },
      {
        title: "Keep speaking for most of the two minutes",
        body: "Develop every question and manage your time. Do not spend so long on your first experience that you have no time for the broader final question.",
      },
    ],
    warnings: [
      {
        title: "Describing the picture",
        body: "The picture only introduces the topic. Use your speaking time to answer the three questions.",
      },
      {
        title: "Giving three unrelated answers",
        body: "Cover all three questions, but connect your ideas so the response develops naturally.",
      },
      {
        title: "Writing a script during preparation",
        body: "Use keywords and short notes. Your minute is for planning ideas, not writing sentences to read aloud.",
      },
      {
        title: "Waiting for a perfect real example",
        body: "If you cannot remember an exact example, use a similar experience or explain what you would probably do.",
      },
    ],
    reminder: "Plan all three → experience → opinion → wider perspective → connect your ideas → keep developing.",
    quiz: [
      {
        id: "use-picture",
        prompt: "What should you do with the picture in Part 4?",
        options: [
          { id: "A", label: "Spend the first 30 seconds describing it" },
          { id: "B", label: "Use it to understand the topic, but answer the three questions" },
          { id: "C", label: "Compare it with a personal photograph" },
        ],
        answer: "B",
        feedback: "Exactly. The picture provides context for the topic. Your response should focus on the three questions.",
      },
      {
        id: "preparation",
        prompt: "What is the best use of your one-minute preparation time?",
        options: [
          { id: "A", label: "Write your complete opening paragraph" },
          { id: "B", label: "Prepare a few keywords and ideas for all three questions" },
          { id: "C", label: "Plan Question 1 carefully and improvise the other two" },
        ],
        answer: "B",
        feedback: "Right. Short notes help you organise the whole response without turning preparation into a script-writing exercise.",
      },
      {
        id: "wider-view",
        prompt: "After giving a personal experience and your opinion, what should you be ready to do?",
        options: [
          { id: "A", label: "Discuss the topic from a wider point of view" },
          { id: "B", label: "Describe the photograph in more detail" },
          { id: "C", label: "Tell a second personal story" },
        ],
        answer: "A",
        feedback: "Yes. The final question normally broadens the topic, so think beyond your own experience and consider people or society more generally.",
      },
    ],
  },
};

export function getAptisSpeakingStrategyGuide(number) {
  return APTIS_SPEAKING_STRATEGY_GUIDES[String(number)] || null;
}
