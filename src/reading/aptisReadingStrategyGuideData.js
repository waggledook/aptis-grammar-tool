export const APTIS_READING_STRATEGY_GUIDES = {
  "1": {
    number: "1",
    title: "Sentence Comprehension",
    seoDescription:
      "Learn a simple four-step strategy for Aptis Reading Part 1 and check your understanding with a short quiz.",
    progressId: "part1-strategy-guide",
    menuPath: "/reading/parts/1",
    practicePath: "/reading/part1",
    facts: [
      { value: "5 gaps", label: "in a short note or email" },
      { value: "3 choices", label: "for each missing word" },
      { value: "Sentence meaning", label: "is the main focus" },
    ],
    task: [
      "In Part 1, you read a short text, usually a note or email. Five sentences contain a gap. For each gap, you choose the correct word from three options.",
      "This part tests whether you can understand a simple sentence and choose the word that completes its meaning correctly. Each sentence can be answered independently, so you do not need to understand the whole text to solve each gap.",
    ],
    steps: [
      {
        title: "Read the complete sentence first",
        body: "Do not look only at the words immediately before and after the gap. Make sure you understand what the sentence is saying.",
      },
      {
        title: "Read all three options",
        body: "Do not select the first word that looks possible. Two options may seem reasonable until you consider the meaning of the whole sentence.",
      },
      {
        title: "Choose the word that makes the sentence work",
        body: "Meaning comes first. Then use grammar, prepositions and common word combinations to confirm your choice.",
        prompts: [
          "Does it give the sentence the right meaning?",
          "Does it fit naturally with the surrounding words?",
          "Is it grammatically possible here?",
        ],
      },
      {
        title: "Read the completed sentence again",
        body: "Put your chosen word into the gap mentally. Check that the whole sentence sounds natural and makes sense.",
      },
    ],
    warnings: [
      {
        title: "Reading too much",
        body: "The sentences belong to the same message, but you normally do not need information from the other sentences. Focus on the sentence you are answering.",
      },
      {
        title: "Choosing by grammar alone",
        body: "More than one option may look grammatically possible. You still need to understand the meaning.",
      },
      {
        title: "Choosing a familiar word",
        body: "A familiar word is not necessarily correct. Read the complete sentence and every option carefully.",
      },
    ],
    reminder: "Understand the sentence → compare all three options → choose the best meaning → check it again.",
    quiz: [
      {
        id: "focus",
        prompt: "When answering a gap, what should you focus on first?",
        options: [
          { id: "A", label: "The grammar of the missing word" },
          { id: "B", label: "The meaning of the complete sentence" },
          { id: "C", label: "The topic of the whole email" },
        ],
        answer: "B",
        feedback: "Exactly. First understand what the sentence means. Grammar and common word combinations can then help you confirm the best option.",
      },
      {
        id: "two-options",
        prompt: "Two options are grammatically possible. What should you do?",
        options: [
          { id: "A", label: "Choose the more difficult word" },
          { id: "B", label: "Choose the one that appeared elsewhere in the text" },
          { id: "C", label: "Decide which one gives the sentence the correct meaning" },
        ],
        answer: "C",
        feedback: "Right. A word can fit grammatically but still give the sentence the wrong meaning.",
      },
      {
        id: "final-check",
        prompt: "What is a useful final check after choosing an answer?",
        options: [
          { id: "A", label: "Read the completed sentence again" },
          { id: "B", label: "Translate the whole message" },
          { id: "C", label: "Change your answer if another option looks more familiar" },
        ],
        answer: "A",
        feedback: "Yes. Put your choice back into the sentence and make sure the complete sentence sounds natural and makes sense.",
      },
    ],
  },
  "2": {
    number: "2",
    title: "Text Cohesion",
    seoDescription:
      "Learn how to order sentences in Aptis Reading Part 2 by following references, linking words and connected ideas.",
    progressId: "part2-strategy-guide",
    menuPath: "/reading/parts/2",
    practicePath: "/reading/part2",
    facts: [
      { value: "2 texts", label: "in the complete task" },
      { value: "6 sentences", label: "in each short text" },
      { value: "Sentence 1", label: "is already in position" },
    ],
    task: [
      "In Part 2, there are two short texts. Each text has six sentences. The first sentence is already in the correct position, but the other five are mixed up. You need to put them in order to create a complete, logical text.",
      "This part tests text cohesion: how well you understand the connection from one sentence to the next. You are looking for a clear, linked sequence rather than a complicated text structure.",
    ],
    steps: [
      {
        title: "Read all six sentences",
        body: "Read once to get a general idea of the text. The first sentence is fixed, so use it as your anchor and ask: what could logically come next?",
      },
      {
        title: "Look for clear connections",
        body: "Notice pronouns and references, linking words, time expressions, and repeated or related ideas.",
        prompts: [
          "References: he, she, it, they, this, these",
          "Links: however, so, then, afterwards",
          "Sequence: first, later, eventually, the next day",
          "Related ideas: a problem → this difficulty",
        ],
      },
      {
        title: "Build small chains",
        body: "You do not have to solve all five positions immediately. If two sentences clearly belong together, keep them together and build from that connection.",
        example: {
          first: "She decided to apply for the job.",
          second: "A week later, she was invited for an interview.",
        },
      },
      {
        title: "Check the complete text",
        body: "Read all six sentences from beginning to end. Make sure every sentence follows naturally from the one before it.",
      },
    ],
    warnings: [
      {
        title: "Ordering by topic alone",
        body: "Two sentences can discuss the same subject without belonging next to each other. Look for a specific connection.",
      },
      {
        title: "Ignoring reference words",
        body: "A sentence beginning with “This problem…” cannot normally come before the problem has been introduced.",
      },
      {
        title: "Solving everything at once",
        body: "Finding one or two strong sentence pairs is often easier than guessing the complete order immediately.",
      },
    ],
    reminder: "Read all the sentences → start from sentence 1 → build strong connections → check the complete text.",
    quiz: [
      {
        id: "reference",
        prompt: "A sentence begins: “This problem became worse the following year.” What should you look for?",
        options: [
          { id: "A", label: "An earlier sentence introducing a problem" },
          { id: "B", label: "A sentence containing exactly the word “year”" },
          { id: "C", label: "The final sentence of the text" },
        ],
        answer: "A",
        feedback: "Exactly. Words such as “this” refer back to information that has already been introduced.",
      },
      {
        id: "small-chain",
        prompt: "You are unsure about the complete order, but two sentences clearly connect. What should you do?",
        options: [
          { id: "A", label: "Ignore them until you know the whole order" },
          { id: "B", label: "Keep them together and build from that connection" },
          { id: "C", label: "Put them at the beginning of the text" },
        ],
        answer: "B",
        feedback: "Right. Strong sentence pairs or short chains can help you gradually build the complete text.",
      },
      {
        id: "complete-check",
        prompt: "You think all six sentences are in the correct order. What next?",
        options: [
          { id: "A", label: "Move on immediately" },
          { id: "B", label: "Check only the first and last sentences" },
          { id: "C", label: "Read the complete text from beginning to end" },
        ],
        answer: "C",
        feedback: "Yes. A final read helps you spot connections that seemed possible individually but do not work in the complete text.",
      },
    ],
  },
  "3": {
    number: "3",
    title: "Opinion Matching",
    seoDescription:
      "Learn how to match ideas and attitudes in Aptis Reading Part 3 without relying on repeated words.",
    progressId: "part3-strategy-guide",
    menuPath: "/reading/parts/3",
    practicePath: "/reading/part3",
    facts: [
      { value: "4 people", label: "give opinions on one topic" },
      { value: "7 statements", label: "to match to the speakers" },
      { value: "2–2–2–1", label: "each person is used once or twice" },
    ],
    task: [
      "In Part 3, you read four short paragraphs about the same topic. Each paragraph gives one person’s ideas, opinions or preferences.",
      "You then read seven statements and choose which person each statement matches. Three people are the answer twice and one person is the answer once, giving a 2–2–2–1 balance. The order varies from task to task.",
      "The answer may not be stated directly, so you sometimes need to connect information from different parts of a paragraph and recognise the same idea in different words.",
    ],
    steps: [
      {
        title: "Analyse all seven statements first",
        body: "Work out exactly what each statement means before you read the four paragraphs. Identify the opinion, attitude, reason or preference you need to find.",
        prompts: [
          "What is the main topic?",
          "Is the attitude positive, negative or mixed?",
          "Is there an important reason, condition or comparison?",
        ],
      },
      {
        title: "Say each idea in simpler words",
        body: "Briefly paraphrase each statement so that you know what evidence would prove the match. Focus on the complete meaning, not one keyword.",
        example: {
          first: "Statement: Who thinks the activity helps people make friends?",
          second: "Simpler idea: the activity has a social benefit.",
        },
      },
      {
        title: "Read one person’s paragraph at a time",
        body: "After reading Person A, compare that paragraph with all seven statements and match every complete idea it supports. Then repeat the process with B, C and D.",
      },
      {
        title: "Prove the matches and check the balance",
        body: "Find the evidence for every answer. If two people mention the same topic, compare their attitudes carefully. At the end, check that your answers follow the 2–2–2–1 pattern and that nobody has more than two.",
      },
    ],
    warnings: [
      {
        title: "Matching the same words",
        body: "A person may repeat a word from the statement without expressing the same idea. Match meanings and attitudes, not identical words.",
      },
      {
        title: "Stopping at one sentence",
        body: "The answer may depend on information from different parts of the paragraph. Read enough to understand the person’s overall point.",
      },
      {
        title: "Forcing the 2–2–2–1 pattern",
        body: "Use the balance as a final check, not as proof. Every answer still needs clear support from the paragraph.",
      },
    ],
    reminder: "Analyse all seven statements → simplify each idea → read one person at a time → prove every match → check 2–2–2–1.",
    quiz: [
      {
        id: "question-first",
        prompt: "Why should you analyse all seven statements before reading the paragraphs?",
        options: [
          { id: "A", label: "To create clear ideas to search for in each paragraph" },
          { id: "B", label: "To predict which person must be the answer" },
          { id: "C", label: "To memorise the keywords in every statement" },
        ],
        answer: "A",
        feedback: "Exactly. Understanding each complete idea gives you a clear search target when you read each person’s paragraph.",
      },
      {
        id: "one-person",
        prompt: "After reading Person A’s paragraph, what should you do?",
        options: [
          { id: "A", label: "Choose the first statement that repeats a word from the paragraph" },
          { id: "B", label: "Compare the paragraph with all seven statements and match every supported idea" },
          { id: "C", label: "Move to Person B after finding exactly one answer" },
        ],
        answer: "B",
        feedback: "Right. One person may match two statements, so check the paragraph against every idea before moving on.",
      },
      {
        id: "answer-balance",
        prompt: "What does the 2–2–2–1 balance mean?",
        options: [
          { id: "A", label: "Every person must be used twice" },
          { id: "B", label: "Three people match two statements each, and one person matches one" },
          { id: "C", label: "The first person must match two statements and the last person only one" },
        ],
        answer: "B",
        feedback: "Exactly. The order can vary, but each person is used once or twice and nobody is used more than twice. Use this as a final check after finding evidence.",
      },
    ],
  },
  "4": {
    number: "4",
    title: "Long Text Comprehension",
    seoDescription:
      "Learn how to match headings to paragraphs in Aptis Reading Part 4 by identifying each paragraph's main idea.",
    progressId: "part4-strategy-guide",
    menuPath: "/reading/parts/4",
    practicePath: "/reading/part4",
    facts: [
      { value: "About 750 words", label: "in one longer text" },
      { value: "7 paragraphs", label: "need a heading" },
      { value: "1 extra heading", label: "is not used" },
    ],
    task: [
      "In Part 4, you read a long text of about 750 words. You match seven of eight headings to the seven numbered paragraphs. One heading is extra and is not used.",
      "This part tests whether you can identify the main idea of each paragraph. The best heading summarises what the paragraph is mainly about—not simply something it mentions.",
    ],
    steps: [
      {
        title: "Read the whole text quickly first",
        body: "Get a general idea of the topic and how the text develops. You do not need to understand every word.",
      },
      {
        title: "Read the headings carefully",
        body: "Make sure you understand the difference between similar headings. Identify the central idea in each one.",
      },
      {
        title: "Find each paragraph’s main idea",
        body: "After reading a paragraph, ask: what is this paragraph mainly saying? Summarise it in a few words before choosing a heading.",
        example: {
          first: "Paragraph: mentions several problems with a plan",
          second: "Short summary: why the plan failed",
        },
      },
      {
        title: "Match by meaning and use elimination",
        body: "Choose the heading that expresses the same main idea, even if it uses different words. Remove confident matches from consideration as you go.",
      },
    ],
    warnings: [
      {
        title: "Matching one detail",
        body: "A paragraph may mention several things. The heading must describe the main point of the whole paragraph, not just one sentence.",
      },
      {
        title: "Following repeated vocabulary",
        body: "Seeing the same word in a paragraph and a heading does not prove they match. Compare their complete meanings.",
      },
      {
        title: "Forcing the extra heading",
        body: "One heading is deliberately unused. If it never matches a paragraph well, it may simply be the distractor.",
      },
    ],
    reminder: "Read for the big picture → summarise each paragraph → match the main idea → use elimination.",
    quiz: [
      {
        id: "main-idea",
        prompt: "A paragraph mentions a new technology, its price and several problems using it. Which should determine the heading?",
        options: [
          { id: "A", label: "Whichever detail appears first" },
          { id: "B", label: "The paragraph’s main overall idea" },
          { id: "C", label: "The word that also appears in a heading" },
        ],
        answer: "B",
        feedback: "Exactly. The correct heading summarises the paragraph as a whole, not simply one detail it contains.",
      },
      {
        id: "vocabulary",
        prompt: "Why can matching the same vocabulary in a paragraph and heading be dangerous?",
        options: [
          { id: "A", label: "Aptis headings never repeat vocabulary from the text" },
          { id: "B", label: "Similar words may appear even when the main ideas are different" },
          { id: "C", label: "Headings should only contain synonyms" },
        ],
        answer: "B",
        feedback: "Right. Shared vocabulary can be a useful clue, but it does not prove that the heading matches the paragraph’s main idea.",
      },
      {
        id: "extra-heading",
        prompt: "One heading does not seem to fit any paragraph well. What should you remember?",
        options: [
          { id: "A", label: "Every heading must be used" },
          { id: "B", label: "It should automatically go with the final paragraph" },
          { id: "C", label: "One heading is deliberately extra" },
        ],
        answer: "C",
        feedback: "Exactly. Do not force a weak match just because you have a heading left over.",
      },
    ],
  },
};

export function getAptisReadingStrategyGuide(partNumber) {
  return APTIS_READING_STRATEGY_GUIDES[String(partNumber)] || null;
}
