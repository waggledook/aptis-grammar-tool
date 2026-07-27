const assetRoot = "/images/ote/listening/advanced/part-1/set-1";
const audioRoot = "/audio/ote/listening/advanced/part-1/set-1";
const setTwoAssetRoot = "/images/ote/listening/advanced/part-1/set-2";
const setTwoAudioRoot = "/audio/ote/listening/advanced/part-1/set-2";

export const advancedListeningPart1Sets = [
  {
    id: "set-1",
    title: "Set 1",
    description: "Five short extracts with picture and text answer options.",
    assetsReady: true,
    audioReady: true,
    questions: [
      {
        id: "refreshments",
        context: "Two colleagues are discussing refreshments for a training day.",
        prompt: "What has the woman ordered?",
        kind: "pictures",
        answer: 2,
        instructionAudioSrc: `${audioRoot}/question-1.mp3`,
        audioSrc: `${audioRoot}/item-1.mp3`,
        options: [
          { text: "several sandwich platters", image: `${assetRoot}/item1a.webp` },
          { text: "plates of croissants and pastries", image: `${assetRoot}/item1b.webp` },
          { text: "trays of mixed fresh fruit", image: `${assetRoot}/item1c.webp` },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The café couldn't get the sandwich platters there until midday, by which time the first session will be over.",
            note: "The sandwiches were considered, but they cannot arrive in time.",
          },
          {
            option: 1,
            quote: "The venue already includes pastries with the tea and coffee, so adding more of those wouldn't solve much",
            note: "Pastries are already provided, so the woman rejects ordering more.",
          },
          {
            option: 2,
            quote: "The café can deliver the fruit trays first thing and keep the different types separate.",
            note: "This is the workable delivery arrangement, and her request for thirty portions confirms the final choice.",
          },
        ],
        script: [
          { speaker: "Man", text: "Have you sorted out the refreshments for Friday's training day?" },
          {
            speaker: "Woman",
            text: "More or less. The café couldn't get the sandwich platters there until midday, by which time the first session will be over. The venue already includes pastries with the tea and coffee, so adding more of those wouldn't solve much, especially with the dietary requirements people sent in. The café can deliver the fruit trays first thing and keep the different types separate. I've asked them to provide enough for about thirty people.",
          },
        ],
        profile: {
          level: "B2",
          words: 85,
          focus: "Tracking alternatives and arrangements",
          distractors: "A cannot arrive in time; B is already included by the venue.",
        },
        explanation:
          "The sandwich platters cannot arrive before the first session, and pastries are already included. The woman's delivery arrangements and request for thirty portions refer to the fruit trays.",
      },
      {
        id: "museum-guide",
        context: "A museum director is describing a new audio guide.",
        prompt: "Why has the museum introduced the new guide?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${audioRoot}/question-2.mp3`,
        audioSrc: `${audioRoot}/item-2.mp3`,
        options: [
          { text: "to stop visitors becoming disorientated" },
          { text: "to change how visitors engage with exhibits" },
          { text: "to reduce demand for specialist assistance" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The replacement still provides basic directions and practical information",
            note: "Directions remain a feature, but the director does not present navigation as the main reason for the redesign.",
          },
          {
            option: 1,
            quote: "many spent more time looking at the screen than at the objects in front of them. The replacement still provides basic directions and practical information, but much of the commentary has been replaced by prompts followed by a few seconds of silence.",
            note: "The redesign directs attention back to the exhibits and gives visitors space to form their own impressions.",
          },
          {
            option: 2,
            quote: "Some colleagues wondered whether this might reduce the need for gallery staff. Early trials suggest the opposite",
            note: "Reduced staffing is explicitly raised and then contradicted by the trial results.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "The old audio guide was remarkably comprehensive, and visitors often praised the amount of information it contained. When we observed people using it, though, many spent more time looking at the screen than at the objects in front of them. The replacement still provides basic directions and practical information, but much of the commentary has been replaced by prompts followed by a few seconds of silence. Some colleagues wondered whether this might reduce the need for gallery staff. Early trials suggest the opposite: visitors tend to ask more questions once they have formed impressions of their own.",
          },
        ],
        profile: {
          level: "C1",
          words: 98,
          focus: "Inferring purpose across the recording",
          distractors: "A remains a practical feature; C is discussed but contradicted by the trials.",
        },
        explanation:
          "Basic directions remain available, but the main redesign replaces commentary with prompts and silence so visitors form their own impressions. Trials contradict the idea that less staff assistance will be needed.",
      },
      {
        id: "research-project",
        context: "A student is discussing a research project with her professor.",
        prompt: "What does the professor want her to reconsider?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${audioRoot}/question-3.mp3`,
        audioSrc: `${audioRoot}/item-3.mp3`,
        options: [
          { text: "whether the study starts from a neutral position" },
          { text: "whether question order could influence responses" },
          { text: "whether the sample includes a sufficiently wide range of commuters" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Calling it a study of why commuters oppose the charge assumes you already know their position.",
            note: "The professor identifies the assumption of opposition as the fundamental problem.",
          },
          {
            option: 1,
            quote: "Varying the order is sensible too",
            note: "The professor approves this part of the questionnaire rather than asking her to reconsider it.",
          },
          {
            option: 2,
            quote: "The range sounds broad enough",
            note: "The range is explicitly described as sufficient, although balanced representation still needs attention.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "I've drafted the questionnaire for my project on why commuters oppose the city-centre congestion charge.",
          },
          { speaker: "Man", text: "And who are you planning to survey?" },
          {
            speaker: "Woman",
            text: "Drivers, cyclists and bus passengers from several districts. I've also varied the question order so earlier answers don't influence later ones.",
          },
          {
            speaker: "Man",
            text: "The range sounds broad enough, although you'll need to make sure one group doesn't dominate. Varying the order is sensible too, though I'd pilot the questionnaire first.",
          },
          { speaker: "Woman", text: "So what concerns you?" },
          {
            speaker: "Man",
            text: "The project's starting point. Calling it a study of why commuters oppose the charge assumes you already know their position. You may find that opposition is far from universal.",
          },
        ],
        profile: {
          level: "C1",
          words: 109,
          focus: "Distinguishing a fundamental flaw from secondary issues",
          distractors: "B is described as sensible; the range in C is explicitly described as broad enough.",
        },
        explanation:
          "The professor raises minor practical considerations, but his central concern is that the project assumes opposition before any attitudes have been measured.",
      },
      {
        id: "interview-journey",
        context: "Two friends are discussing a journey to an interview.",
        prompt: "How will the man travel to the interview?",
        kind: "pictures",
        answer: 2,
        instructionAudioSrc: `${audioRoot}/question-4.mp3`,
        audioSrc: `${audioRoot}/item-4.mp3`,
        options: [
          { text: "by train", image: `${assetRoot}/item4a.webp` },
          { text: "by bicycle", image: `${assetRoot}/item4b.webp` },
          { text: "by taxi", image: `${assetRoot}/item4c.webp` },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "I'd planned to take the train, but the strike has made the replacement buses hopelessly unreliable.",
            note: "The train was the original plan, not the final arrangement.",
          },
          {
            option: 1,
            quote: "Twelve kilometres in this suit? I don't think arriving red-faced and exhausted would create the right impression.",
            note: "Cycling is suggested, but the man rejects it because of the distance and his interview clothes.",
          },
          {
            option: 2,
            quote: "I checked the fare, and it's more than I wanted to pay, but the driver's collecting me at two.",
            note: "The references to a fare and a driver collecting him identify the taxi without naming it directly.",
          },
        ],
        script: [
          { speaker: "Woman", text: "Aren't you supposed to be at that job interview across town this afternoon?" },
          {
            speaker: "Man",
            text: "Yes. I'd planned to take the train, but the strike has made the replacement buses hopelessly unreliable.",
          },
          { speaker: "Woman", text: "You could cycle. You'd probably get there faster." },
          {
            speaker: "Man",
            text: "Twelve kilometres in this suit? I don't think arriving red-faced and exhausted would create the right impression. I checked the fare, and it's more than I wanted to pay, but the driver's collecting me at two. At least that removes the uncertainty.",
          },
        ],
        profile: {
          level: "B2",
          words: 84,
          focus: "Inferring the final transport choice",
          distractors: "A was the original plan; B is suggested but rejected.",
        },
        explanation:
          "The train is unavailable and cycling is rejected. The fare and the driver collecting him indicate that he will travel by taxi, although the word itself is never used.",
      },
      {
        id: "wearable-technology",
        context: "A sports scientist is discussing wearable technology.",
        prompt: "What does she find most significant about it?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${audioRoot}/question-5.mp3`,
        audioSrc: `${audioRoot}/item-5.mp3`,
        options: [
          { text: "the reliability of the measurements collected" },
          { text: "the redistribution of authority within coaching teams" },
          { text: "the temporary motivation provided to athletes" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Wearable technology is becoming more accurate, and the latest devices can collect an extraordinary amount of information.",
            note: "Accuracy is acknowledged, but it is background information rather than the effect she finds most significant.",
          },
          {
            option: 1,
            quote: "decisions that once belonged almost entirely to the coach are now shared with analysts and medical staff.",
            note: "This directly describes authority being redistributed across the coaching team.",
          },
          {
            option: 2,
            quote: "that initial burst of motivation tends to fade.",
            note: "Motivation is explicitly temporary, which makes it secondary to the change in decision-making.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Wearable technology is becoming more accurate, and the latest devices can collect an extraordinary amount of information. Athletes often enjoy having daily targets too, although that initial burst of motivation tends to fade. The figures don't interpret themselves, of course. A device may recommend rest while an experienced coach sees an athlete who appears ready to compete. What follows is not simply a technical discussion about accuracy; it becomes a negotiation over whose judgement carries more weight. In some teams, decisions that once belonged almost entirely to the coach are now shared with analysts and medical staff.",
          },
        ],
        profile: {
          level: "C1",
          words: 98,
          focus: "Conceptual paraphrase and implied significance",
          distractors: "A is acknowledged but not central; C is explicitly described as temporary.",
        },
        explanation:
          "Accuracy and motivation are acknowledged, but the most significant effect is that decisions once made by coaches alone are now shared with analysts and medical staff.",
      },
    ],
  },
  {
    id: "set-2",
    title: "Set 2",
    description: "Five higher-level extracts testing criticism, decisions, purpose, and inference.",
    assetsReady: true,
    audioReady: true,
    questions: [
      {
        id: "article-criticism",
        context: "Two editors are discussing an article.",
        prompt: "What criticism does the woman make?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${setTwoAudioRoot}/question-1.mp3`,
        audioSrc: `${setTwoAudioRoot}/item-1.mp3`,
        options: [
          { text: "Its examples obscure the central argument." },
          { text: "Its evidence no longer reflects current practice." },
          { text: "Its tone is unsuitable for the intended audience." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "there are so many that the main claim almost disappears.",
            note: "The number of case studies prevents the central argument from remaining clear.",
          },
          {
            option: 1,
            quote: "the research is recent enough; most of the figures come from studies published this year.",
            note: "The woman explicitly defends the currency of the evidence.",
          },
          {
            option: 2,
            quote: "the style is lively without being patronising.",
            note: "She approves the tone for its non-specialist audience.",
          },
        ],
        script: [
          { speaker: "Man", text: "I've read your comments on the article. You thought the tone was too informal?" },
          {
            speaker: "Woman",
            text: "Actually, no. For an online magazine aimed at non-specialists, the style is lively without being patronising. And the research is recent enough; most of the figures come from studies published this year.",
          },
          { speaker: "Man", text: "So what's the problem?" },
          {
            speaker: "Woman",
            text: "The case studies. Individually they're fascinating, especially the interview with the architect, but there are so many that the main claim almost disappears. A reader may remember three unusual buildings and still be unclear about what the article is arguing. I'd keep one example and use the space to develop the analysis.",
          },
        ],
        profile: {
          level: "C1",
          words: 102,
          focus: "Distinguishing the central criticism from explicitly rejected concerns",
          distractors: "The tone and the age of the research are both explicitly defended.",
        },
        explanation:
          "The woman approves the tone and says the research is recent. Her criticism is that the number of case studies prevents the main argument from emerging clearly.",
      },
      {
        id: "home-office",
        context: "A couple are discussing a home office.",
        prompt: "Which room will become the home office?",
        kind: "pictures",
        answer: 2,
        instructionAudioSrc: `${setTwoAudioRoot}/question-2.mp3`,
        audioSrc: `${setTwoAudioRoot}/item-2.mp3`,
        options: [
          { text: "the spare bedroom", image: `${setTwoAssetRoot}/item2a.webp` },
          { text: "the dining room", image: `${setTwoAssetRoot}/item2b.webp` },
          { text: "the garage", image: `${setTwoAssetRoot}/item2c.webp` },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "while the spare bedroom was the obvious fallback, my parents stay there too frequently for that to be practical.",
            note: "The bedroom is available in principle, but regular guests make it impractical.",
          },
          {
            option: 1,
            quote: "I'd initially considered the dining room because of the lovely natural light, but clearing away my work every time we host dinner is a non-starter.",
            note: "The dining room is attractive but explicitly rejected.",
          },
          {
            option: 2,
            quote: "we've gone ahead and insulated the garage and added a proper window. It still needs painting and the desk hasn't arrived, but that's where I'll be based.",
            note: "Work on the garage has already begun, and she directly states that this is where she will work.",
          },
        ],
        script: [
          { speaker: "Man", text: "Have you decided where you're going to set up your home office?" },
          {
            speaker: "Woman",
            text: "Well, we've gone ahead and insulated the garage and added a proper window. It still needs painting and the desk hasn't arrived, but that's where I'll be based. It's far quieter than the rest of the house, too. I'd initially considered the dining room because of the lovely natural light, but clearing away my work every time we host dinner is a non-starter. And while the spare bedroom was the obvious fallback, my parents stay there too frequently for that to be practical.",
          },
        ],
        profile: {
          level: "B2",
          words: 95,
          focus: "Retaining an early decision while processing later alternatives",
          distractors: "The dining room and spare bedroom are plausible but explicitly rejected.",
        },
        explanation:
          "The garage has already been insulated and fitted with a window, and the woman says that is where she will be based. The other rooms are rejected afterwards.",
      },
      {
        id: "four-day-week",
        context: "An economist is discussing a four-day-week trial.",
        prompt: "Why does he mention small companies?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${setTwoAudioRoot}/question-3.mp3`,
        audioSrc: `${setTwoAudioRoot}/item-3.mp3`,
        options: [
          { text: "to explain why productivity gains may be exaggerated" },
          { text: "to show why the findings may not apply universally" },
          { text: "to identify where shorter weeks are easiest to introduce" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The four-day-week trial produced some impressive figures",
            note: "The speaker treats the reported gains as impressive; he does not claim that they are false or exaggerated.",
          },
          {
            option: 1,
            quote: "their specific constraints simply weren't accounted for in this dataset.",
            note: "Small companies expose a limitation in the sample, so the findings cannot automatically be applied everywhere.",
          },
          {
            option: 2,
            quote: "It doesn't render shorter weeks unworkable for smaller outfits",
            note: "The speaker does not identify small firms as the easiest setting; he only says shorter weeks are not necessarily impossible there.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "The four-day-week trial produced some impressive figures, particularly on staff retention and reported wellbeing, with several participating organisations reporting higher productivity. However, we need to exercise caution before assuming these outcomes can be extrapolated across the board. The vast majority of employers involved were larger firms capable of reallocating duties seamlessly during absences. For an enterprise with a single payroll specialist or technician, there's far less operational slack. It doesn't render shorter weeks unworkable for smaller outfits, but their specific constraints simply weren't accounted for in this dataset.",
          },
        ],
        profile: {
          level: "C1",
          words: 88,
          focus: "Understanding rhetorical purpose and limits on generalisation",
          distractors: "The figures are not described as false, and small firms are not presented as the easiest setting.",
        },
        explanation:
          "Small companies illustrate a limitation in the sample: their operational constraints were not represented, so the findings cannot automatically be applied to every workplace.",
      },
      {
        id: "oral-history",
        context: "A student is discussing an oral-history project with her professor.",
        prompt: "What does the professor suggest she focus on?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${setTwoAudioRoot}/question-4.mp3`,
        audioSrc: `${setTwoAudioRoot}/item-4.mp3`,
        options: [
          { text: "how accurately people remember dates" },
          { text: "why personal accounts conflict with official records" },
          { text: "whether she needs to interview more people" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Not entirely. The disagreement may be the most interesting part.",
            note: "The professor moves her away from deciding which account is simply accurate.",
          },
          {
            option: 1,
            quote: "Ask why one version has survived within a family or neighbourhood and another hasn't.",
            note: "He recommends investigating why conflicting versions developed and persisted.",
          },
          {
            option: 2,
            quote: "More interviews might be useful, but they won't necessarily make those differences disappear.",
            note: "A larger sample may help, but it is explicitly rejected as the solution or central focus.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "The interviews for my oral-history project don't always match the official records. People remember the factory closing in different years, and some insist there were protests that the local newspaper never mentioned. I'm wondering whether I need a larger sample.",
          },
          {
            speaker: "Man",
            text: "More interviews might be useful, but they won't necessarily make those differences disappear.",
          },
          { speaker: "Woman", text: "Then should I concentrate on checking which account is accurate?" },
          {
            speaker: "Man",
            text: "Not entirely. The disagreement may be the most interesting part. Ask why one version has survived within a family or neighbourhood and another hasn't. Memory reflects identity and later experience as well as the original event. That tension could become the focus of the project.",
          },
        ],
        profile: {
          level: "C1",
          words: 108,
          focus: "Interpreting conflicting evidence as the focus of the research",
          distractors: "Accuracy and sample size are discussed but rejected as the central focus.",
        },
        explanation:
          "The professor treats the disagreement as useful evidence and recommends investigating why different versions developed or survived.",
      },
      {
        id: "presentation-venue",
        context: "Two colleagues are discussing a presentation venue.",
        prompt: "Where will the presentation take place?",
        kind: "pictures",
        answer: 0,
        instructionAudioSrc: `${setTwoAudioRoot}/question-5.mp3`,
        audioSrc: `${setTwoAudioRoot}/item-5.mp3`,
        options: [
          { text: "in a computer room", image: `${setTwoAssetRoot}/item5a.webp` },
          { text: "in a lecture theatre", image: `${setTwoAssetRoot}/item5b.webp` },
          { text: "in an outdoor courtyard", image: `${setTwoAssetRoot}/item5c.webp` },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The technicians rearranged the rows of desktop computers and cleared the extra tables this morning.",
            note: "The desktop computers identify the selected room, and the rearrangement shows that preparations are complete.",
          },
          {
            option: 1,
            quote: "The lecture theatre would have been ideal, but another department had already booked it.",
            note: "The theatre was preferred but is unavailable.",
          },
          {
            option: 2,
            quote: "with heavy rain forecast, taking that gamble didn't seem worthwhile.",
            note: "The courtyard is considered and rejected because of the weather risk.",
          },
        ],
        script: [
          { speaker: "Man", text: "Is everything arranged for tomorrow's presentation?" },
          {
            speaker: "Woman",
            text: "The lecture theatre would have been ideal, but another department had already booked it.",
          },
          { speaker: "Man", text: "What about the outdoor courtyard?" },
          {
            speaker: "Woman",
            text: "I considered it, but with heavy rain forecast, taking that gamble didn't seem worthwhile.",
          },
          { speaker: "Man", text: "Will the alternative be big enough?" },
          {
            speaker: "Woman",
            text: "The technicians rearranged the rows of desktop computers and cleared the extra tables this morning. Capacity is tighter than in the theatre, but everyone will still get a seat, and the display screen is excellent.",
          },
          { speaker: "Man", text: "Good. Have you told everyone about the change?" },
          { speaker: "Woman", text: "Yes, I updated the invitation this afternoon." },
        ],
        profile: {
          level: "B2",
          words: 95,
          focus: "Inferring the venue from equipment and rejected alternatives",
          distractors: "The lecture theatre is unavailable and the courtyard is rejected because of the weather.",
        },
        explanation:
          "The lecture theatre is booked and the courtyard is too risky in the forecast rain. Rows of desktop computers identify the remaining venue as the computer room.",
      },
    ],
  },
];

export function getAdvancedListeningPart1Set(setId = "set-1") {
  return advancedListeningPart1Sets.find((set) => set.id === setId) || advancedListeningPart1Sets[0];
}
