export const APTIS_WRITING_STRATEGY_GUIDES = {
  "1": {
    number: "1",
    title: "Short Answers",
    seoDescription:
      "Learn how to answer Aptis Writing Part 1 questions clearly, briefly and accurately, then check your strategy with a short quiz.",
    menuPath: "/writing/parts/1",
    practicePath: "/writing/part1",
    facts: [
      { value: "5 questions", label: "about personal information" },
      { value: "1–5 words", label: "for each answer" },
      { value: "About 3 minutes", label: "recommended time" },
    ],
    task: [
      "In Part 1, you answer five short messages from another member of a club, course or group. For each question, you write only 1–5 words—usually a single word or short phrase.",
      "The aim is simple: give a clear answer that provides the information requested. You do not need complicated grammar or vocabulary here.",
    ],
    steps: [
      {
        title: "Read the question carefully",
        body: "Identify exactly what information you need to give. Look at both the question word and any words that tell you when something happens.",
        prompts: [
          "Where…? → a place",
          "When…? → a time or date",
          "How often…? → a frequency",
          "did / yesterday → past",
          "usually / every week → routine",
          "going to / next weekend → future",
        ],
      },
      {
        title: "Give the simplest clear answer",
        body: "You only have 1–5 words, so do not add a long explanation. A single word or short phrase is often enough.",
        example: {
          first: "What do you do?",
          second: "An English teacher.",
        },
      },
      {
        title: "Make sure it answers this question",
        body: "A correct English phrase is not useful if it gives the wrong information. Check that your answer matches the exact question and its time reference.",
        example: {
          first: "What did you do last weekend?",
          second: "Went to the beach.",
        },
      },
      {
        title: "Do not spend too long here",
        body: "Part 1 should be quick. If your answer is clear, relevant and short, move on and save time for the longer writing tasks.",
      },
    ],
    warnings: [
      {
        title: "Writing too much",
        body: "This task asks for 1–5 words. Give the key information instead of trying to impress with a full explanation.",
      },
      {
        title: "Missing the time reference",
        body: "If the question asks about yesterday, do not answer with something you usually do or plan to do tomorrow.",
      },
      {
        title: "Trying to use difficult language",
        body: "Simple and clear is exactly what you need. Complicated vocabulary does not improve an answer that is already complete.",
      },
    ],
    reminder: "Understand the question → give the key information → keep it short → move on.",
    quiz: [
      {
        id: "past-answer",
        prompt: "The question is: “What did you do yesterday?” Which is the best answer?",
        options: [
          { id: "A", label: "Usually at home" },
          { id: "B", label: "Went shopping" },
          { id: "C", label: "Tomorrow afternoon" },
        ],
        answer: "B",
        feedback: "Exactly. The question asks about the past, so the answer needs to give an activity you did yesterday.",
      },
      {
        id: "short-answer",
        prompt: "You have a clear three-word answer. What should you do?",
        options: [
          { id: "A", label: "Add a longer sentence to show more English" },
          { id: "B", label: "Use the short answer and move on" },
          { id: "C", label: "Replace it with more advanced vocabulary" },
        ],
        answer: "B",
        feedback: "Right. Part 1 needs a short, clear response. Extra language does not make a complete answer better.",
      },
      {
        id: "main-aim",
        prompt: "What is most important in Part 1?",
        options: [
          { id: "A", label: "Using complex grammar" },
          { id: "B", label: "Giving five clear answers to the questions" },
          { id: "C", label: "Linking all five answers together" },
        ],
        answer: "B",
        feedback: "Exactly. Each answer should be clear, easy to understand and relevant to its question.",
      },
    ],
  },
  "2": {
    number: "2",
    title: "Short Text",
    seoDescription:
      "Learn how to plan and write a clear, connected response for Aptis Writing Part 2, then check your strategy with a short quiz.",
    menuPath: "/writing/parts/2",
    practicePath: "/writing/part2",
    facts: [
      { value: "1 response", label: "to an online form question" },
      { value: "20–30 words", label: "suggested range" },
      { value: "About 7 minutes", label: "recommended time" },
    ],
    task: [
      "In Part 2, you answer one question in an online form connected to the club, course or activity in the test. Write 20–30 words using complete sentences. The question may ask for more than one piece of information.",
      "Your response should be clear, relevant and easy to follow. Answer everything requested and connect your sentences so they read as one short text.",
    ],
    steps: [
      {
        title: "Check exactly what the question asks",
        body: "Before writing, identify every part of the prompt. If it asks what you enjoy and how often you attend, your answer needs to include both ideas.",
        prompts: [
          "What information must I include?",
          "Is there more than one question?",
          "Which details are relevant?",
        ],
      },
      {
        title: "Aim for two or three clear sentences",
        body: "Keep your ideas simple and relevant. You do not need an introduction or conclusion for such a short response.",
        example: {
          first: "What do you enjoy, and how often do you attend?",
          second: "I enjoy meeting the friendly members. I usually attend twice a week.",
        },
      },
      {
        title: "Connect your ideas simply",
        body: "Make the response feel like one short text rather than a list of unrelated sentences. Useful words include “and”, “but”, “because”, “so” and “also”.",
      },
      {
        title: "Choose language you can write accurately",
        body: "A simple sentence you can control is better than a complicated sentence with several mistakes. Use more ambitious language when it helps you express your idea clearly—not simply to show it off.",
      },
      {
        title: "Check before moving on",
        body: "Take a few seconds to confirm that you answered every part, your verbs and spelling are clear, and the response is close to the suggested length.",
      },
    ],
    wordCountNote:
      "Aim for 20–30 words, but do not panic if a clear, complete answer is slightly longer. Going over does not automatically reduce your score. Make sure any extra writing is relevant and accurate, and do not let it take time from the later tasks.",
    warnings: [
      {
        title: "Answering only one part",
        body: "Read the complete prompt before writing. A well-written answer is still incomplete if it misses one of the questions.",
      },
      {
        title: "Disconnected sentences",
        body: "Use simple links where they help so that your ideas work together as a short, natural response.",
      },
      {
        title: "Writing much more than you need",
        body: "A little extra is fine, but longer is not automatically better. Extra writing takes time and creates more opportunities for mistakes.",
      },
    ],
    reminder: "Answer every part → write two or three connected sentences → keep it clear and accurate → manage your time.",
    quiz: [
      {
        id: "two-parts",
        prompt: "The question asks why you joined a club and what you hope to learn. What must your answer include?",
        options: [
          { id: "A", label: "Only why you joined" },
          { id: "B", label: "Only what you hope to learn" },
          { id: "C", label: "Both pieces of information" },
        ],
        answer: "C",
        feedback: "Exactly. Identify and answer every part of the question before you move on.",
      },
      {
        id: "best-shape",
        prompt: "Which approach is best for a Part 2 response?",
        options: [
          { id: "A", label: "Two or three clear, connected sentences" },
          { id: "B", label: "A formal introduction and conclusion" },
          { id: "C", label: "As many advanced structures as possible" },
        ],
        answer: "A",
        feedback: "Right. Part 2 is a short text. Answer the question clearly and connect your ideas naturally.",
      },
      {
        id: "word-count",
        prompt: "Your clear, accurate answer is slightly over 30 words. What should you do?",
        options: [
          { id: "A", label: "Panic and delete words at random" },
          { id: "B", label: "Check that everything is relevant, then move on" },
          { id: "C", label: "Double its length to show more English" },
        ],
        answer: "B",
        feedback: "Yes. The word range is a useful target, but a slightly longer answer is not automatically penalised. Prioritise relevance, accuracy and time.",
      },
    ],
  },
  "3": {
    number: "3",
    title: "Three Online Responses",
    seoDescription:
      "Learn how to write three clear, natural online responses for Aptis Writing Part 3, then check your strategy with a short quiz.",
    menuPath: "/writing/parts/3",
    practicePath: "/writing/part3",
    facts: [
      { value: "3 questions", label: "in an online interaction" },
      { value: "30–40 words each", label: "suggested range" },
      { value: "About 10 minutes", label: "recommended time" },
    ],
    task: [
      "In Part 3, you take part in an online interaction connected to the same club, course or activity as the rest of the Writing test. You answer three separate questions, writing about 30–40 words for each response.",
      "Each answer should be relevant, clear and natural for an informal online setting. Treat the three questions separately: every response should make sense on its own.",
    ],
    steps: [
      {
        title: "Treat each question as a separate response",
        body: "You are not writing one long text. Before each answer, identify exactly what that question asks and make the response complete in itself.",
      },
      {
        title: "Answer every part of the question",
        body: "If a question asks what you like and what you would change, include both ideas. Otherwise, your answer is incomplete.",
        prompts: [
          "What is the first thing I need to answer?",
          "Is there a second question or instruction?",
          "Have I included both before moving on?",
        ],
      },
      {
        title: "Write a short, natural paragraph",
        body: "Two to four connected sentences are usually enough. Words such as “because”, “but”, “so”, “also”, “although” and “for example” can help, but only use them where they sound natural.",
      },
      {
        title: "Keep the tone friendly and natural",
        body: "You are interacting with other members online, so contractions, personal opinions, everyday vocabulary and friendly expressions are appropriate. Keep the meaning clear.",
      },
      {
        title: "Use variety without forcing complexity",
        body: "A range of vocabulary and grammar is useful when you can control it. Clear, natural English is more effective than a complicated structure that produces several mistakes.",
      },
      {
        title: "Manage your time across all three answers",
        body: "Do not spend too long perfecting the first response and then rush the other two. Aim to give each question enough time and leave a moment to check your work.",
      },
    ],
    wordCountNote:
      "Aim for 30–40 words per answer, but do not worry if a clear, complete response is slightly longer. Going over does not automatically reduce your score. Keep any extra writing relevant and accurate, and protect the time you need for all three answers.",
    warnings: [
      {
        title: "Making the answers depend on each other",
        body: "The three responses are separate. Each one should answer its own question and make sense without the other two.",
      },
      {
        title: "Going off-topic",
        body: "Stay close to the exact question. Interesting extra information does not help if it replaces something you were asked to include.",
      },
      {
        title: "Forcing advanced language",
        body: "Variety is useful, but natural, controlled English is better than unnecessary complexity. Longer is not automatically better either.",
      },
    ],
    reminder: "Answer each question fully → write a short connected response → keep the tone natural → share your time fairly.",
    quiz: [
      {
        id: "complete-question",
        prompt: "The first question asks what you enjoy about the club and what you would improve. What should you include?",
        options: [
          { id: "A", label: "Only what you enjoy" },
          { id: "B", label: "Both ideas" },
          { id: "C", label: "A general description of the club" },
        ],
        answer: "B",
        feedback: "Exactly. Answer every part of the question, not only the easiest part.",
      },
      {
        id: "separate-responses",
        prompt: "How should you treat the three Part 3 responses?",
        options: [
          { id: "A", label: "As one continuous essay" },
          { id: "B", label: "As three separate short responses" },
          { id: "C", label: "As three lists of ideas" },
        ],
        answer: "B",
        feedback: "Right. Each response should work as a complete short paragraph on its own.",
      },
      {
        id: "best-language",
        prompt: "Which is the better approach?",
        options: [
          { id: "A", label: "Use difficult grammar even when you are unsure of it" },
          { id: "B", label: "Use clear, natural language with some variety" },
          { id: "C", label: "Avoid all linking words" },
        ],
        answer: "B",
        feedback: "Yes. Variety is useful, but clarity and control matter more than forcing complicated structures.",
      },
    ],
  },
  "4": {
    number: "4",
    title: "Formal and Informal Emails",
    seoDescription:
      "Learn how to plan two Aptis Writing Part 4 emails, adapt your language to each reader and check your strategy with a short quiz.",
    menuPath: "/writing/parts/4",
    practicePath: "/writing/part4",
    facts: [
      { value: "2 emails", label: "about the same situation" },
      { value: "40–50 + 120–150", label: "suggested word ranges" },
      { value: "About 30 minutes", label: "recommended time" },
    ],
    task: [
      "In Part 4, you respond to the same situation in two emails: an informal email of 40–50 words to a friend and a formal email of 120–150 words to a person in authority.",
      "The main challenge is choosing the right style for each reader. This is called register. Your message to a friend should sound personal and relaxed, while the formal email should sound clear, polite and professional.",
    ],
    steps: [
      {
        title: "Understand the situation before writing",
        body: "Read the information carefully and check the instructions for both emails. Do not start until you know what has happened, how it affects you, and what each reader needs to know.",
      },
      {
        title: "Think: Who am I writing to, and why?",
        body: "Your reader and purpose should control your style. The two emails discuss the same situation, but their language should clearly sound different.",
        example: {
          first: "I can’t believe they’ve cancelled it!",
          second: "I was disappointed to hear that the event has been cancelled.",
        },
      },
      {
        title: "Make the informal email short and natural",
        body: "Get to the point and write as you would to a friend. Contractions, everyday vocabulary, personal reactions and friendly questions or suggestions can all sound natural here.",
      },
      {
        title: "Organise the formal email clearly",
        body: "Use paragraphs to help the reader follow your response. Adapt the structure to the task rather than forcing every email into the same template.",
        prompts: [
          "Paragraph 1: explain why you are writing",
          "Paragraph 2: develop the situation or your reaction",
          "Paragraph 3: make a request, ask questions or suggest a solution",
        ],
      },
      {
        title: "Adapt the message, not only the vocabulary",
        body: "Do not simply rewrite the informal email with a few formal synonyms. Your friend may need your personal reaction, while the organisation may need relevant details and a specific request.",
      },
      {
        title: "Leave time to check both emails",
        body: "Confirm that both tasks are complete, the two styles are clearly different, your ideas are connected, and your grammar, spelling and punctuation are accurate.",
      },
    ],
    wordCountNote:
      "Aim for 40–50 words in the informal email and 120–150 in the formal email. Do not panic if a complete, accurate email is slightly longer: going over does not automatically reduce your score. Keep any extra content relevant, and do not let it reduce your checking time.",
    warnings: [
      {
        title: "Making both emails sound the same",
        body: "A formal email is not simply a longer version of the message to your friend. Make the reader, purpose and style clear in each one.",
      },
      {
        title: "Making formal language unnatural",
        body: "Formal does not mean filling the email with grand expressions. Clear, polite and neutral English is much more effective.",
      },
      {
        title: "Forgetting part of the task",
        body: "Good language cannot replace missing information or a required request. Check every instruction before finishing.",
      },
    ],
    reminder: "Understand the situation → identify each reader and purpose → make the styles clearly different → organise and check both emails.",
    quiz: [
      {
        id: "main-difference",
        prompt: "What is the most important difference between the two Part 4 emails?",
        options: [
          { id: "A", label: "The formal email must use much more difficult grammar" },
          { id: "B", label: "The language should suit two different readers and purposes" },
          { id: "C", label: "The informal email should contain no linking words" },
        ],
        answer: "B",
        feedback: "Exactly. The style of language you choose is called register, and it should clearly suit the reader and purpose.",
      },
      {
        id: "formal-approach",
        prompt: "Which is the best approach to the formal email?",
        options: [
          { id: "A", label: "Copy the informal email and replace a few words" },
          { id: "B", label: "Use as many formal expressions as possible" },
          { id: "C", label: "Organise the information and use polite, appropriate language" },
        ],
        answer: "C",
        feedback: "Right. Formal does not mean complicated. Write a clear, well-organised response that suits the reader and purpose.",
      },
      {
        id: "final-check",
        prompt: "Before finishing Part 4, what should you check?",
        options: [
          { id: "A", label: "Only your spelling" },
          { id: "B", label: "That you used at least five advanced linkers" },
          { id: "C", label: "That both tasks are complete, appropriate and accurate" },
        ],
        answer: "C",
        feedback: "Exactly. Check that you answered both tasks fully, used a suitable style for each reader and corrected any language errors you notice.",
      },
    ],
  },
};

export function getAptisWritingStrategyGuide(number) {
  return APTIS_WRITING_STRATEGY_GUIDES[String(number)] || null;
}
