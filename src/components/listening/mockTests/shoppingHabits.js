// Aptis Listening Mock 1, Question 14. Authored task and recording supplied by the user.
export const SHOPPING_HABITS_QUESTION = {
  id: "q14",
  number: 14,
  type: "speaker-matching",
  part: 2,
  prompt: "Four people are talking about their shopping habits. Complete the sentences below.",
  audioSrc: "/audio/listening/mock-1/complete/q14.mp3",
  options: [
    "values convenience most",
    "often buys second-hand",
    "plans purchases in advance",
    "usually shops with friends",
    "compares prices carefully",
    "prefers seeing products first",
  ],
  items: [
    { id: "speaker-1", label: "Speaker 1", answer: "plans purchases in advance" },
    { id: "speaker-2", label: "Speaker 2", answer: "values convenience most" },
    { id: "speaker-3", label: "Speaker 3", answer: "prefers seeing products first" },
    { id: "speaker-4", label: "Speaker 4", answer: "compares prices carefully" },
  ],
  script: [
    { speaker: "Speaker 1", text: "I’m fairly careful about what I buy, especially if it costs more than usual. I normally make a list before I go out, and if something catches my eye that wasn’t on it, I tend to leave it and see if I still want it a few days later. I like looking around second-hand shops, particularly for books and furniture, but I don’t actually buy much there. I’d rather come home without something than realise later that I never really needed it." },
    { speaker: "Speaker 2", text: "I used to compare prices in different shops and would sometimes visit three places just to save a little. I don’t have the patience for that now. Most weeks I order the everyday things I need online and have them delivered together. It may cost slightly more, especially once delivery is added, but with work and everything else I’ve got to do, that doesn’t bother me much. If I can sort the shopping out quickly, I’m happy." },
    { speaker: "Speaker 3", text: "I do quite a lot of looking online before I buy anything. I read reviews, check what different shops have, and sometimes even choose the exact model I want. But for clothes or anything expensive, I still prefer to go and see it myself. I’ve had things arrive looking very different from the photos. A friend sometimes comes into town with me, which is nice, though I’ll happily go alone. I just don’t like paying for something I haven’t properly looked at." },
    { speaker: "Speaker 4", text: "If I’m buying something expensive, I rarely get it from the first place I see it. I’ll check a few websites, look in one or two shops, and sometimes wait for a sale if there’s no hurry. I’ve bought second-hand furniture and a used phone before, so I’m open to that too, but only when the condition is good. The interesting thing is how much prices can vary for exactly the same product, even between shops that are quite close to each other." },
  ],
};
