export const APTIS_LISTENING_STRATEGY_GUIDES = {
  "1": {
    number: "1",
    title: "Information Recognition",
    seoDescription:
      "Learn how to approach Aptis Listening Part 1, manage your two listens and check your understanding with a short quiz.",
    menuPath: "/listening/parts/1",
    practicePath: "/listening/part1",
    facts: [
      { value: "13 recordings", label: "with one question each" },
      { value: "3 options", label: "for every question" },
      { value: "Up to 2 listens", label: "for each recording" },
    ],
    task: [
      "In Part 1, you listen to 13 short recordings. These may be messages, announcements, monologues or short conversations. For each recording, you answer one multiple-choice question with three options.",
      "The questions ask you to identify factual information such as a time, place, number, plan or decision. The first questions are usually more direct, while later questions require more careful understanding.",
    ],
    steps: [
      {
        title: "Read the question and all three options first",
        body: "Before you press play, make sure you know exactly what information you need. Are you listening for where, when, what happened or what someone finally decided?",
      },
      {
        title: "Listen to the whole recording before choosing",
        body: "Do not click an answer simply because you hear one option. A speaker may suggest, reject, change or correct an idea before reaching the final answer.",
        example: {
          first: "We could take the bus, but it doesn’t run late enough.",
          second: "Let’s get the train.",
        },
      },
      {
        title: "Expect the later questions to require more understanding",
        body: "The first five questions are usually very direct. The next five may mention incorrect options too, and the final three can require you to connect information from different parts of a conversation.",
        prompts: [
          "Several possible answers may be mentioned.",
          "A suggestion may be followed by a different decision.",
          "The correct idea may be expressed in different words.",
        ],
      },
      {
        title: "Use your second listen only when you need it",
        body: "You can play every recording twice, but the whole Listening test shares one overall time limit. If you are completely confident after one listen, move on. Avoiding an unnecessary replay leaves more time for difficult questions later. If you are unsure, use the second listen to check one specific detail or confirm your answer.",
      },
    ],
    warnings: [
      {
        title: "The first option you hear",
        body: "An idea may be mentioned and then rejected, corrected or replaced. Keep listening before you decide.",
      },
      {
        title: "Matching words only",
        body: "Especially in the final questions, the correct answer may be paraphrased rather than repeated exactly.",
      },
      {
        title: "Automatically listening twice",
        body: "A second listen is available, not compulsory. Use it when it will genuinely help you check an uncertain answer.",
      },
    ],
    reminder: "Know what you need → listen to the whole recording → understand the final message → replay only when it helps.",
    quiz: [
      {
        id: "first-option",
        prompt: "You hear one of the answer options near the beginning of the recording. What should you do?",
        options: [
          { id: "A", label: "Choose it immediately" },
          { id: "B", label: "Keep listening before deciding" },
          { id: "C", label: "Ignore that option completely" },
        ],
        answer: "B",
        feedback: "Exactly. Particularly in the later questions, an option may be mentioned and then rejected, corrected or replaced.",
      },
      {
        id: "later-questions",
        prompt: "Why can the final Part 1 questions be more difficult?",
        options: [
          { id: "A", label: "You may need to connect information from different parts of the recording" },
          { id: "B", label: "They always contain unfamiliar vocabulary" },
          { id: "C", label: "You are only allowed to hear them once" },
        ],
        answer: "A",
        feedback: "Right. Later questions can require you to combine information across different parts of a conversation rather than recognise one word or phrase.",
      },
      {
        id: "second-listen",
        prompt: "You are completely confident about an easy question after one listen. What is a sensible strategy?",
        options: [
          { id: "A", label: "Play it again because every recording must be heard twice" },
          { id: "B", label: "Move on and leave more time for difficult questions" },
          { id: "C", label: "Change your answer before moving on" },
        ],
        answer: "B",
        feedback: "Yes. A second listen is available, not compulsory. Replay when you need to check or confirm an answer.",
      },
    ],
  },
  "2": {
    number: "2",
    title: "Information Matching",
    seoDescription:
      "Learn how to match four speakers in Aptis Listening Part 2 by following meaning, contrast and paraphrase.",
    menuPath: "/listening/parts/2",
    practicePath: "/listening/part2",
    facts: [
      { value: "4 speakers", label: "on one general topic" },
      { value: "6 options", label: "to compare before listening" },
      { value: "2 extra", label: "options are not used" },
    ],
    task: [
      "In Part 2, you listen to four short monologues on the same general topic. You match each speaker to the correct piece of information from six options, so two options are extra.",
      "All four speakers discuss the same subject, so you need to understand what distinguishes one person from another. Expect overlapping information and the same ideas expressed in different words.",
    ],
    steps: [
      {
        title: "Read all six options before listening",
        body: "Make sure you understand what makes each option different. Focus on the complete idea rather than underlining isolated keywords.",
        prompts: [
          "What reason, preference or experience does the option describe?",
          "How is it different from the other options?",
          "What evidence would prove this match?",
        ],
      },
      {
        title: "Listen for what best identifies each speaker",
        body: "A speaker may mention several ideas from the options. Ask which option best describes the information this person gives—not simply whether an idea was mentioned.",
        example: {
          first: "My friends go together, but that never appealed to me.",
          second: "I go because it’s close to my office.",
        },
      },
      {
        title: "Match meaning, not exact words",
        body: "The correct option will often be paraphrased. Listen to the whole speaker and recognise the same information expressed using different language.",
        example: {
          first: "Option: It saves her money.",
          second: "Now it hardly costs me anything.",
        },
      },
      {
        title: "Use the second listen to confirm difficult matches",
        body: "Make your best matches on the first listen. On the second, focus on uncertain speakers and compare the remaining possibilities. Elimination can help, but confirm that the option genuinely matches before choosing it.",
      },
    ],
    warnings: [
      {
        title: "Keyword matching",
        body: "Hearing a word from an option does not prove the match. Compare the speaker’s complete meaning.",
      },
      {
        title: "Information that is only mentioned",
        body: "A speaker may refer to an idea while explaining that it does not describe them. Listen for what actually characterises that person.",
      },
      {
        title: "Forcing the extra options",
        body: "Two options are not used. Do not try to make every option fit a speaker.",
      },
    ],
    reminder: "Understand the six options → listen for what distinguishes each speaker → match meanings → confirm uncertain answers.",
    quiz: [
      {
        id: "overlap",
        prompt: "Two speakers both mention travelling by car. What should you do?",
        options: [
          { id: "A", label: "Choose the car option for the first speaker who mentions it" },
          { id: "B", label: "Decide what information actually distinguishes each speaker" },
          { id: "C", label: "Assume one of the speakers must be a distractor" },
        ],
        answer: "B",
        feedback: "Exactly. Speakers can mention overlapping information. A topic being mentioned does not automatically make it the correct match.",
      },
      {
        id: "paraphrase",
        prompt: "An option says “wanted a cheaper alternative”, but the speaker says “I couldn’t afford to keep paying so much.” What should you notice?",
        options: [
          { id: "A", label: "The meanings match even though the words are different" },
          { id: "B", label: "The option is wrong because “cheaper” is never said" },
          { id: "C", label: "You need to hear the word “alternative” before choosing it" },
        ],
        answer: "A",
        feedback: "Right. The target information is normally paraphrased, so listen for the same meaning rather than identical vocabulary.",
      },
      {
        id: "confirm",
        prompt: "You are confident about three speakers but unsure about the fourth. How should you use the second listen?",
        options: [
          { id: "A", label: "Focus especially on the uncertain match and the remaining possibilities" },
          { id: "B", label: "Ignore your first answers and start again" },
          { id: "C", label: "Automatically choose whichever option is still unused" },
        ],
        answer: "A",
        feedback: "Yes. Check the uncertain match. Elimination can help, but the remaining option must still match what the speaker says.",
      },
    ],
  },
  "3": {
    number: "3",
    title: "Inference: Discussion",
    seoDescription:
      "Learn how to identify the man, woman or both speakers in Aptis Listening Part 3 by following opinions in order.",
    menuPath: "/listening/parts/3",
    practicePath: "/listening/part3",
    facts: [
      { value: "1 discussion", label: "between two speakers" },
      { value: "4 opinions", label: "appear in order" },
      { value: "3 choices", label: "man, woman or both" },
    ],
    task: [
      "In Part 3, you listen to a man and a woman discussing a topic. You see four statements expressing opinions and decide whether each view belongs to the man, the woman or both.",
      "The opinions are expressed in the same order as the four statements on screen. They are normally paraphrased, so you need to follow the conversation and work out what each speaker really thinks.",
    ],
    steps: [
      {
        title: "Read all four statements before listening",
        body: "Reduce each statement to its essential meaning. This gives you four clear opinions to listen for instead of a list of individual words.",
      },
      {
        title: "Follow the statements in order",
        body: "The four target opinions appear in order. Once the discussion has clearly moved on from Statement 1, start listening for Statement 2 rather than continuing to search backwards.",
      },
      {
        title: "Listen to both speakers before deciding",
        body: "One person may introduce an opinion, but the other person’s response determines whether the answer is one speaker or both.",
        example: {
          first: "Man: The system will save people time.",
          second: "Woman: Definitely. That’s its biggest advantage.",
        },
      },
      {
        title: "Notice agreement, disagreement and qualification",
        body: "Expressions such as “Exactly” can show agreement. However, phrases such as “I see what you mean, but…” or “That’s true to an extent…” often introduce disagreement. Use the second listen to check uncertain answers, especially when choosing between one speaker and both.",
      },
    ],
    warnings: [
      {
        title: "Choosing BOTH too quickly",
        body: "Both speakers must show that they share the view. A neutral acknowledgement is not enough evidence of agreement.",
      },
      {
        title: "Confusing the topic with the opinion",
        body: "Both people may discuss the same issue while holding different views. Match the particular opinion, not the general subject.",
      },
      {
        title: "Waiting for the exact statement",
        body: "The same opinion will normally be expressed through paraphrase and clues from more than one sentence.",
      },
    ],
    reminder: "Understand the four opinions → follow them in order → listen to both speakers → check the response.",
    quiz: [
      {
        id: "agreement",
        prompt: "The man expresses an opinion and the woman replies, “Yes, that’s exactly what I was thinking.” What is the likely answer?",
        options: [
          { id: "A", label: "The man" },
          { id: "B", label: "The woman" },
          { id: "C", label: "Both" },
        ],
        answer: "C",
        feedback: "Exactly. The woman does not repeat the opinion, but her response clearly shows that she shares it.",
      },
      {
        id: "disagreement",
        prompt: "The woman says, “I understand why people think that, but I don’t really agree.” What does this show?",
        options: [
          { id: "A", label: "She shares the opinion" },
          { id: "B", label: "She acknowledges the opinion but disagrees with it" },
          { id: "C", label: "Her view cannot be identified" },
        ],
        answer: "B",
        feedback: "Right. Recognising another person’s argument is not the same as agreeing with it. Pay attention to what follows words such as “but” and “although”.",
      },
      {
        id: "order",
        prompt: "You have just identified the opinion in Statement 2. Where should you focus next?",
        options: [
          { id: "A", label: "Statement 1 again" },
          { id: "B", label: "Statement 3" },
          { id: "C", label: "Any statement containing vocabulary you hear" },
        ],
        answer: "B",
        feedback: "Yes. The four target opinions occur in order, so you can follow the discussion without searching for all four answers at once.",
      },
    ],
  },
  "4": {
    number: "4",
    title: "Inference: Longer Monologues",
    seoDescription:
      "Learn how to follow attitude and opinion across longer recordings in Aptis Listening Part 4.",
    menuPath: "/listening/parts/4",
    practicePath: "/listening/part4",
    facts: [
      { value: "2 monologues", label: "on different topics" },
      { value: "2 questions", label: "for each recording" },
      { value: "Overall meaning", label: "comes from several clues" },
    ],
    task: [
      "In Part 4, you listen to two longer monologues on different topics. Each recording has two multiple-choice questions, giving four questions in total.",
      "The questions focus on the speaker’s opinion, attitude or intention. The answer is not usually contained in one obvious sentence, so you often need to combine clues from different parts of the recording.",
    ],
    steps: [
      {
        title: "Read both questions and all the options first",
        body: "Identify the important difference between the options. Are they describing a speaker who is enthusiastic or doubtful, surprised or disappointed, critical or generally supportive?",
      },
      {
        title: "Follow the speaker’s position across the recording",
        body: "Do not search for one matching sentence. Notice how the speaker’s view develops and combine comments made at different points.",
        example: {
          first: "At first I was sceptical, and there are still problems…",
          second: "Overall, it has worked better than I expected.",
        },
      },
      {
        title: "Notice changes and wait for the overall view",
        body: "Words such as “however”, “although”, “at first”, “in the end” and “overall” can signal a change or qualification. The second question usually asks about the speaker’s general attitude, so do not answer it too early. Use clues from across the recording.",
      },
      {
        title: "Use the second listen to test your interpretation",
        body: "On the first listen, follow the whole argument and choose your most likely answers. On the second, listen for evidence that confirms or contradicts those choices.",
      },
    ],
    warnings: [
      {
        title: "Deciding too early",
        body: "The speaker’s attitude may change or become clearer later. Listen to the whole recording before making your final choice.",
      },
      {
        title: "A true detail that does not answer the question",
        body: "An option may describe something genuinely mentioned without representing the opinion or attitude being tested.",
      },
      {
        title: "Matching individual words",
        body: "Correct answers and distractors can both use ideas from the recording. Follow the speaker’s complete meaning rather than isolated vocabulary.",
      },
    ],
    reminder: "Read both questions → follow how the view develops → combine clues → decide on the overall meaning.",
    quiz: [
      {
        id: "overall-position",
        prompt: "A speaker begins negatively but finishes by saying that, overall, the experience was worthwhile. What should guide your answer about their general attitude?",
        options: [
          { id: "A", label: "Their negative first reaction" },
          { id: "B", label: "Their overall position across the recording" },
          { id: "C", label: "Whichever option repeats vocabulary from the recording" },
        ],
        answer: "B",
        feedback: "Exactly. Part 4 often requires you to combine information from different parts of the monologue rather than rely on one comment.",
      },
      {
        id: "familiar-distractor",
        prompt: "Why might an incorrect option still sound familiar?",
        options: [
          { id: "A", label: "It can refer to a real idea mentioned in the recording" },
          { id: "B", label: "Incorrect options always repeat the speaker’s exact words" },
          { id: "C", label: "Every option describes part of the speaker’s final opinion" },
        ],
        answer: "A",
        feedback: "Right. A distractor may describe something genuinely mentioned but still fail to answer the question about the speaker’s opinion or attitude.",
      },
      {
        id: "broad-question",
        prompt: "What is particularly important when answering the broader question about the speaker’s general attitude?",
        options: [
          { id: "A", label: "Choose as soon as you hear an attitude word" },
          { id: "B", label: "Concentrate only on the final sentence" },
          { id: "C", label: "Consider evidence from different parts of the monologue" },
        ],
        answer: "C",
        feedback: "Yes. The broader question tests whole-text understanding, so the answer may depend on several parts of the recording.",
      },
    ],
  },
};

export function getAptisListeningStrategyGuide(partNumber) {
  return APTIS_LISTENING_STRATEGY_GUIDES[String(partNumber)] || null;
}
