const assetRoot = "/images/ote/listening/advanced/part-1/set-1";
const audioRoot = "/audio/ote/listening/advanced/part-1/set-1";
const setTwoAssetRoot = "/images/ote/listening/advanced/part-1/set-2";
const setTwoAudioRoot = "/audio/ote/listening/advanced/part-1/set-2";
const setThreeAudioRoot = "/audio/ote/listening/advanced/part-1/set-3";
const setFourAudioRoot = "/audio/ote/listening/advanced/part-1/set-4";

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
        optionsAudioSrc: `${audioRoot}/options-2.mp3`,
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
        optionsAudioSrc: `${audioRoot}/options-3.mp3`,
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
        optionsAudioSrc: `${audioRoot}/options-5.mp3`,
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
        optionsAudioSrc: `${setTwoAudioRoot}/options-1.mp3`,
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
        optionsAudioSrc: `${setTwoAudioRoot}/options-3.mp3`,
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
        optionsAudioSrc: `${setTwoAudioRoot}/options-4.mp3`,
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
  {
    id: "set-3",
    title: "Set 3 · C1 Challenge",
    level: "C1",
    description: "Five upper-range C1 extracts testing subtle purpose, attitude, emphasis, and implied meaning. Deliberately harder than many test-day items.",
    hiddenFromStudentMenu: true,
    assetsReady: true,
    audioReady: true,
    instructionAudioReady: true,
    questions: [
      {
        id: "dissertation-case-studies",
        context: "A student is discussing a dissertation chapter with her supervisor.",
        prompt: "What does the supervisor particularly want her to improve?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${setThreeAudioRoot}/question-1.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-1.mp3`,
        audioSrc: `${setThreeAudioRoot}/item-1.mp3`,
        options: [
          { text: "the selection of case studies included" },
          { text: "the way the case studies contribute to a developing argument" },
          { text: "the treatment of inconsistencies in the interview evidence" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "One may eventually have to go, but I'd decide that only once the line of argument is visible.",
            note: "Removing a case study is presented as a possible later decision, not the present priority.",
          },
          {
            option: 1,
            quote: "Each one is interesting in isolation, yet I'm not always clear what the second makes us reconsider about the first, or how the third changes the picture again.",
            note: "The supervisor wants the examples to build and reshape one developing line of argument.",
          },
          {
            option: 2,
            quote: "the interviews are useful precisely because they don't always agree.",
            note: "The inconsistencies are treated as useful evidence rather than a weakness to correct.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "I've read the new chapter. The historical background is substantial, but it earns its place, and the interviews are useful precisely because they don't always agree. What I'm less certain about is the movement between the case studies. Each one is interesting in isolation, yet I'm not always clear what the second makes us reconsider about the first, or how the third changes the picture again.",
          },
          {
            speaker: "Man",
            text: "So the problem is the number of examples?",
          },
          {
            speaker: "Woman",
            text: "Not necessarily. One may eventually have to go, but I'd decide that only once the line of argument is visible. Cutting material now could simply leave you with fewer disconnected sections.",
          },
        ],
        profile: {
          level: "C1",
          words: 105,
          focus: "Distinguishing the main revision priority from secondary possibilities",
          distractors: "Conflicting evidence is approved, while reducing the number of examples remains a plausible later step.",
        },
        explanation:
          "The supervisor approves the conflicting interview evidence and does not yet recommend cutting examples. She wants the case studies to function as a cumulative argument rather than isolated sections.",
      },
      {
        id: "waterfront-proposal",
        context: "An architect is commenting on a waterfront development proposal.",
        prompt: "How does she feel about the revised proposal?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${setThreeAudioRoot}/question-2.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-2.mp3`,
        audioSrc: `${setThreeAudioRoot}/item-2.mp3`,
        options: [
          { text: "relieved that the consultation process has been extended" },
          { text: "encouraged by the developers' willingness to alter their plans" },
          { text: "unconvinced that environmental gains compensate for what will be lost" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "the new consultation period is welcome.",
            note: "She welcomes the extension, but it is one positive detail rather than her overall judgement.",
          },
          {
            option: 1,
            quote: "Moving the access road away from the school is sensible",
            note: "She approves one alteration without expressing general confidence in the revised scheme.",
          },
          {
            option: 2,
            quote: "Perhaps the new planting will work well in twenty years; that doesn't solve the immediate loss.",
            note: "Her cumulative position is that the promised future planting does not compensate for removing mature trees now.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "The developers have revised the waterfront proposal again. Does this version address your concerns?",
          },
          {
            speaker: "Woman",
            text: "Some of them. Moving the access road away from the school is sensible, and the new consultation period is welcome. I'm less persuaded by the environmental claims. The drawings make the roof gardens look generous, but they're being offered as compensation for removing mature trees that already cool the site and absorb rainwater. Perhaps the new planting will work well in twenty years; that doesn't solve the immediate loss.",
          },
          {
            speaker: "Man",
            text: "At least the public can respond before a final decision.",
          },
          {
            speaker: "Woman",
            text: "Yes, and given the scale of the scheme, taking another month is hardly excessive.",
          },
        ],
        profile: {
          level: "C1",
          words: 107,
          focus: "Recovering an overall attitude from mixed positive and negative evaluation",
          distractors: "The final exchange returns to a genuine positive feature after the central environmental reservation.",
        },
        explanation:
          "She welcomes individual revisions, including the longer consultation, but remains unconvinced that roof gardens and future planting offset the immediate loss of mature trees.",
      },
      {
        id: "volunteer-theatres",
        context: "Two researchers are discussing a report on online ticketing.",
        prompt: "Why does the man mention volunteer-run theatres?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${setThreeAudioRoot}/question-3.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-3.mp3`,
        audioSrc: `${setThreeAudioRoot}/item-3.mp3`,
        options: [
          { text: "to question whether a reported saving represents genuine efficiency" },
          { text: "to show why different staffing models complicate organisational comparisons" },
          { text: "to show why official employment figures exclude unpaid work" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Some of the work has changed hands rather than disappeared.",
            note: "The example challenges whether the reduction in paid staff time represents work genuinely being eliminated.",
          },
          {
            option: 1,
            quote: "That also makes comparisons between organisations rather awkward, since the amount of unpaid support varies enormously.",
            note: "This is a true consequence of the example, but it is not the immediate reason the man introduces it.",
          },
          {
            option: 2,
            quote: "Official employment figures won't show any of it, of course",
            note: "This later consequence is memorable but secondary to the man's challenge to the report's efficiency claim.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "This report says online ticketing reduced administrative work by nearly a third.",
          },
          {
            speaker: "Man",
            text: "In the organisations studied, yes. But look at the volunteer-run theatres. Paid staff spent fewer hours processing bookings because volunteers began answering customer emails and resolving payment problems from home.",
          },
          {
            speaker: "Woman",
            text: "So the system was still more efficient?",
          },
          {
            speaker: "Man",
            text: "Possibly, but the saving isn't quite where the headline suggests. Some of the work has changed hands rather than disappeared. That also makes comparisons between organisations rather awkward, since the amount of unpaid support varies enormously. Official employment figures won't show any of it, of course, which is another reason to treat the result cautiously.",
          },
        ],
        profile: {
          level: "C1",
          words: 104,
          focus: "Distinguishing an example's rhetorical purpose from its valid consequences",
          distractors: "All three options reflect true implications, but the later consequences are not the example's immediate argumentative function.",
        },
        explanation:
          "The theatres show that a reduction in paid staff time may reflect work being transferred to volunteers rather than genuine efficiency. Comparability and employment statistics are later consequences of that same example.",
      },
      {
        id: "coastal-field-project",
        context: "A university supervisor is talking about a coastal field project.",
        prompt: "What is the supervisor mainly doing?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${setThreeAudioRoot}/question-4.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-4.mp3`,
        audioSrc: `${setThreeAudioRoot}/item-4.mp3`,
        options: [
          { text: "warning that participants will need to work with limited guidance" },
          { text: "encouraging less experienced students to apply" },
          { text: "explaining why competition for places will be high" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "You'll have a timetable, but not someone checking each stage of your work.",
            note: "Her practical message is that students must be comfortable working independently.",
          },
          {
            option: 1,
            quote: "Some of last year's strongest applications came from first years.",
            note: "Less experienced students are not excluded, but encouraging them is not the supervisor's main purpose.",
          },
          {
            option: 2,
            quote: "Places are limited, but that isn't why I'm spelling this out.",
            note: "Competition is mentioned and then explicitly rejected as the reason for the warning.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "Before you apply for the coastal field project, be clear about what the week involves. The research station is small, weather can cancel boat trips at short notice, and there may be long periods when the senior staff are working elsewhere. You'll have a timetable, but not someone checking each stage of your work.",
          },
          {
            speaker: "Man",
            text: "Are you saying first-year students shouldn't apply?",
          },
          {
            speaker: "Woman",
            text: "No. Some of last year's strongest applications came from first years. I'm saying that anyone expecting a tightly supervised course may find the experience unsettling. Places are limited, but that isn't why I'm spelling this out. If the uncertainty sounds appealing rather than alarming, the forms are online.",
          },
        ],
        profile: {
          level: "C1",
          words: 109,
          focus: "Interpreting a pragmatic warning beneath a literal invitation",
          distractors: "The ending permits applications and mentions both first-year success and limited places.",
        },
        explanation:
          "The supervisor does not discourage first-year applicants, but she is managing expectations about independence and the limited guidance available during the project.",
      },
      {
        id: "documentary-podcast",
        context: "A reviewer is discussing a documentary podcast series.",
        prompt: "What criticism does he make?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${setThreeAudioRoot}/question-5.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-5.mp3`,
        audioSrc: `${setThreeAudioRoot}/item-5.mp3`,
        options: [
          { text: "It gives opposing positions unequal attention." },
          { text: "It allows one contributor to exercise too much influence." },
          { text: "It generalises too readily from individual experiences." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "the presenter gives both sides of the debate more time than I expected.",
            note: "The reviewer explicitly praises the balance between opposing sides.",
          },
          {
            option: 1,
            quote: "Nor is it a problem that Professor Hale appears in three episodes; her claims are challenged rather than simply accepted.",
            note: "The recurring contributor is prominent, but the reviewer does not believe she has excessive influence.",
          },
          {
            option: 2,
            quote: "the programme moves from them to claims about whole communities with very little in between.",
            note: "His criticism is that vivid personal stories are treated as though they were representative evidence.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "The series is beautifully produced, and the presenter gives both sides of the debate more time than I expected. Nor is it a problem that Professor Hale appears in three episodes; her claims are challenged rather than simply accepted. My reservation is about the personal accounts. They're vivid, and several are genuinely moving, but the programme moves from them to claims about whole communities with very little in between. A story can reveal what a policy feels like without showing how typical that experience is.",
          },
          {
            speaker: "Woman",
            text: "Would you still recommend it?",
          },
          {
            speaker: "Man",
            text: "Certainly. Hale is an engaging speaker, and the final episode raises questions most programmes would avoid.",
          },
        ],
        profile: {
          level: "C1",
          words: 106,
          focus: "Identifying a precise criticism followed by a positive concession",
          distractors: "The first two options are explicitly activated and rejected, while the closing recommendation returns attention to Professor Hale.",
        },
        explanation:
          "The reviewer approves the balance and does not object to Professor Hale's prominence. He criticises the leap from individual stories to claims about whole communities.",
      },
    ],
  },
  {
    id: "set-4",
    title: "Set 4 · C1 Challenge (revised)",
    level: "C1",
    description: "A revised upper-range C1 set with fully supported distractors and closer competition between plausible interpretations.",
    hiddenFromStudentMenu: true,
    assetsReady: true,
    audioReady: true,
    instructionAudioReady: true,
    questions: [
      {
        id: "dissertation-case-studies-revised",
        context: "A student is discussing a dissertation chapter with her supervisor.",
        prompt: "What does the supervisor particularly want her to improve?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${setThreeAudioRoot}/question-1.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-1.mp3`,
        audioSrc: `${setFourAudioRoot}/item-1.mp3`,
        options: [
          { text: "the selection of case studies included" },
          { text: "the way the case studies contribute to a developing argument" },
          { text: "the treatment of inconsistencies in the interview evidence" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "If the word limit forces a cut, that would be the obvious candidate.",
            note: "The harbour interview is a plausible candidate for removal, but only if the word limit eventually requires a cut.",
          },
          {
            option: 1,
            quote: "The cooperative raises the question of who gets heard, but the market section opens with fresh background rather than making use of it.",
            note: "The supervisor's chapter-wide concern is that each case study restarts the discussion instead of developing the argument raised by the previous one.",
          },
          {
            option: 2,
            quote: "A little more context might help the reader judge whether they come from memory, position or simply the questions you asked.",
            note: "The inconsistent interviews do need more context, but the supervisor treats their disagreement as a strength rather than the main structural weakness.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "I've reworked the chapter and added more from the interviews. I'm still not sure what to do where people remember the same event differently.",
          },
          {
            speaker: "Man",
            text: "Those disagreements give the chapter energy. A little more context might help the reader judge whether they come from memory, position or simply the questions you asked.",
          },
          {
            speaker: "Woman",
            text: "I wondered whether the harbour interview was the weakest.",
          },
          {
            speaker: "Man",
            text: "It is less vivid, though it gives you the only view from seasonal workers. I also noticed how often the discussion seemed to begin again. The cooperative raises the question of who gets heard, but the market section opens with fresh background rather than making use of it. The conclusion eventually supplies the links, though rather late.",
          },
          {
            speaker: "Woman",
            text: "So the harbour section may have to go?",
          },
          {
            speaker: "Man",
            text: "If the word limit forces a cut, that would be the obvious candidate.",
          },
        ],
        profile: {
          level: "C1",
          words: 138,
          focus: "Ranking several genuine revision concerns by scope and emphasis",
          distractors: "All three issues receive support, and the final exchange deliberately strengthens the possible case-study cut.",
        },
        explanation:
          "The supervisor raises legitimate concerns about contextualising inconsistencies and possibly removing one case study. His broader criticism, however, is that the case studies restart rather than progressively develop the chapter's argument.",
      },
      {
        id: "waterfront-proposal-revised",
        context: "An architect is commenting on a waterfront development proposal.",
        prompt: "How does she feel about the revised proposal?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${setThreeAudioRoot}/question-2.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-2.mp3`,
        audioSrc: `${setFourAudioRoot}/item-2.mp3`,
        options: [
          { text: "relieved that the consultation process has been extended" },
          { text: "encouraged by the developers' willingness to alter their plans" },
          { text: "unconvinced that environmental gains compensate for what will be lost" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "residents have another month to comment",
            note: "She recognises the longer consultation as one improvement, but does not make it the basis of her overall response.",
          },
          {
            option: 1,
            quote: "The willingness to listen is better than I expected.",
            note: "Her closing remark genuinely praises the developers' responsiveness, making this a plausible but incomplete summary of her attitude.",
          },
          {
            option: 2,
            quote: "The revised drainage helps, but only after soil that already absorbs water has been removed.",
            note: "Despite several improvements, she remains unconvinced that the proposed environmental measures are equivalent to the mature trees and absorbing soil being lost.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "The developers have submitted another version of the waterfront scheme. Has it changed your view?",
          },
          {
            speaker: "Woman",
            text: "It's a much more serious response than the first one. The access road has moved away from the school, residents have another month to comment, and the roof gardens are deeper than before. They've enlarged the flood-storage area as well.",
          },
          {
            speaker: "Man",
            text: "You sound almost won over.",
          },
          {
            speaker: "Woman",
            text: "Not quite. The figures place mature trees beside planted roof space as though the same number of square metres meant the same thing. One provides shade and holds rainwater from day one; the other depends on years of growth and careful maintenance. The revised drainage helps, but only after soil that already absorbs water has been removed.",
          },
          {
            speaker: "Man",
            text: "Still, they've shifted a long way.",
          },
          {
            speaker: "Woman",
            text: "They have. The willingness to listen is better than I expected.",
          },
        ],
        profile: {
          level: "C1",
          words: 134,
          focus: "Separating approval of the response process from the overall evaluation of the proposal",
          distractors: "The consultation is extended, substantial revisions are praised, and the recording ends on a positive concession.",
        },
        explanation:
          "She welcomes the extended consultation and is impressed by the willingness to revise the plans. Even so, her evaluation of the proposal remains that its future environmental measures do not compensate for the immediate losses.",
      },
      {
        id: "volunteer-theatres-revised",
        context: "Two researchers are discussing a report on online ticketing.",
        prompt: "Why does the man mention volunteer-run theatres?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${setThreeAudioRoot}/question-3.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-3.mp3`,
        audioSrc: `${setFourAudioRoot}/item-3.mp3`,
        options: [
          { text: "to question whether a reported saving represents genuine efficiency" },
          { text: "to show why different staffing models complicate organisational comparisons" },
          { text: "to show why official employment figures exclude unpaid work" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Yet the same kinds of enquiries were still being dealt with; they had simply moved outside paid hours.",
            note: "The example is introduced in response to the reported reduction in administrative work and shows that work was transferred rather than eliminated.",
          },
          {
            option: 1,
            quote: "It also makes those theatres awkward to compare with venues where every hour of support is salaried",
            note: "The staffing models do create a real comparison problem, but the man presents this as an additional consequence after challenging the claimed saving.",
          },
          {
            option: 2,
            quote: "Officially, those hours are almost invisible.",
            note: "The exchange ends by strongly confirming that official figures omit volunteer hours, but this is not why the man first introduces the example.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "The report says online ticketing cut administrative work by almost a third.",
          },
          {
            speaker: "Man",
            text: "Take the volunteer-run theatres. Their paid staff spent fewer hours processing bookings, but volunteers began answering evening emails, sorting out failed payments and helping customers who could not use the system.",
          },
          {
            speaker: "Woman",
            text: "The theatres still saved money.",
          },
          {
            speaker: "Man",
            text: "On payroll, certainly. Yet the same kinds of enquiries were still being dealt with; they had simply moved outside paid hours. It also makes those theatres awkward to compare with venues where every hour of support is salaried, because the two organisations are counting rather different things.",
          },
          {
            speaker: "Woman",
            text: "National employment figures would miss the volunteers too.",
          },
          {
            speaker: "Man",
            text: "Completely. Officially, those hours are almost invisible.",
          },
        ],
        profile: {
          level: "C1",
          words: 110,
          focus: "Identifying an example's initial rhetorical function among later valid implications",
          distractors: "The comparison problem is explicitly developed and the employment-statistics point receives emphatic confirmation at the end.",
        },
        explanation:
          "The man introduces the volunteer-run theatres directly after the claim that administrative work fell. Their example questions whether this represents genuine efficiency, because the work moved to volunteers. Comparability and official statistics are both valid later implications.",
      },
      {
        id: "coastal-field-project-revised",
        context: "A university supervisor is talking about a coastal field project.",
        prompt: "What is the supervisor mainly doing?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${setThreeAudioRoot}/question-4.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-4.mp3`,
        audioSrc: `${setFourAudioRoot}/item-4.mp3`,
        options: [
          { text: "warning that participants will need to work with limited guidance" },
          { text: "encouraging less experienced students to apply" },
          { text: "explaining why competition for places will be high" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "senior researchers may be away from the station for most of a day, and the timetable does not tell you what to do with every spare hour.",
            note: "The supervisor's longest and most developed point is that participants must cope independently when plans change and senior staff are unavailable.",
          },
          {
            option: 1,
            quote: "Your laboratory results are strong, and the proposal you've outlined would be competitive.",
            note: "He ends by encouraging this particular first-year student, but that reassurance follows his central explanation of how independently the project operates.",
          },
          {
            option: 2,
            quote: "There are about five applicants for each place",
            note: "Competition is prominent at the start, but the supervisor immediately shifts to what catches participants out once they are selected.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "I'm thinking of applying for the coastal field project, but I'm only in my first year. Are places usually taken by older students?",
          },
          {
            speaker: "Man",
            text: "There are about five applicants for each place, although the panel does not favour people simply because they are further through a degree. What catches people out is the way the week runs. Boat trips move when the weather changes, senior researchers may be away from the station for most of a day, and the timetable does not tell you what to do with every spare hour.",
          },
          {
            speaker: "Woman",
            text: "I've only done fieldwork once.",
          },
          {
            speaker: "Man",
            text: "Experience helps, but last year some first-year students adapted faster than people who had done several projects. They asked sensible questions before the boats left, then found useful work when the original plan collapsed.",
          },
          {
            speaker: "Woman",
            text: "Would applying be unrealistic?",
          },
          {
            speaker: "Man",
            text: "Your laboratory results are strong, and the proposal you've outlined would be competitive.",
          },
        ],
        profile: {
          level: "C1",
          words: 146,
          focus: "Identifying the dominant communicative purpose across framing and closing reassurance",
          distractors: "The dialogue opens with competition and ends by encouraging a less experienced applicant.",
        },
        explanation:
          "The supervisor mentions strong competition and ultimately encourages this first-year student. His main intervention, however, is to explain that the field project requires participants to manage changing plans with limited supervision.",
      },
      {
        id: "documentary-podcast-revised",
        context: "A reviewer is discussing a documentary podcast series.",
        prompt: "What criticism does he make?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${setThreeAudioRoot}/question-5.mp3`,
        optionsAudioSrc: `${setThreeAudioRoot}/options-5.mp3`,
        audioSrc: `${setFourAudioRoot}/item-5.mp3`,
        options: [
          { text: "It gives opposing positions unequal attention." },
          { text: "It allows one contributor to exercise too much influence." },
          { text: "It generalises too readily from individual experiences." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Tenants, landlords and council officers receive roughly comparable time",
            note: "The reviewer explicitly considers the distribution of time broadly balanced, although he notes that one side is edited more memorably.",
          },
          {
            option: 1,
            quote: "Her claims are challenged, and the editors do not simply adopt her conclusions.",
            note: "Professor Hale shapes the vocabulary and remains memorable, but the reviewer rejects the suggestion that she controls the argument.",
          },
          {
            option: 2,
            quote: "the narration has shifted to statements about renters nationally.",
            note: "His criticism is that three stories from one city and one campaign group are used to support national claims.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "You listened to the documentary podcast series on housing policy. Did it seem balanced?",
          },
          {
            speaker: "Man",
            text: "More than the publicity suggested. Tenants, landlords and council officers receive roughly comparable time, although the tenants' accounts are edited more memorably. Professor Hale appears in every episode, and later contributors are often asked questions using terms she introduced.",
          },
          {
            speaker: "Woman",
            text: "So she controls the argument?",
          },
          {
            speaker: "Man",
            text: "I wouldn't say that. Her claims are challenged, and the editors do not simply adopt her conclusions. The three tenant stories all come from one city and were found through the same campaign group, yet by the final episode the narration has shifted to statements about renters nationally.",
          },
          {
            speaker: "Woman",
            text: "Would you recommend it?",
          },
          {
            speaker: "Man",
            text: "Yes. Hale remains the clearest contributor, which may be why her voice stays with you afterwards.",
          },
        ],
        profile: {
          level: "C1",
          words: 126,
          focus: "Distinguishing a sampling criticism from related questions of balance and influence",
          distractors: "One side is more memorable and one contributor shapes the vocabulary, but both associated criticisms are explicitly qualified or rejected.",
        },
        explanation:
          "The reviewer sees broadly comparable coverage and does not think Professor Hale controls the argument. He criticises the move from three locally sourced personal accounts to national claims about renters.",
      },
    ],
  },
];

export function getAdvancedListeningPart1Set(setId = "set-1") {
  return advancedListeningPart1Sets.find((set) => set.id === setId) || advancedListeningPart1Sets[0];
}
