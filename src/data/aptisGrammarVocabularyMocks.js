function grammarQuestion(id, prompt, options, correctAnswer, target, difficulty) {
  return { id, prompt, options, correctAnswer, target, difficulty };
}

function vocabularyTask(id, range, type, instruction, optionLabels, rows, showEquals = false) {
  return {
    id,
    range,
    type,
    instruction,
    showEquals,
    options: optionLabels.map(([value, label]) => ({ value, label })),
    rows: rows.map(([number, prompt, correctAnswer]) => ({ number, prompt, correctAnswer })),
  };
}

export const APTIS_GRAMMAR_VOCABULARY_MOCKS = [
  {
    id: "mock-1",
    version: "001",
    title: "Aptis Grammar and Vocabulary Mock 1",
    grammarQuestions: [
      grammarQuestion("m1-g1", "Don’t call Marta now — she __________ a presentation.", ["gives", "is giving", "has given"], "B", "Present continuous", "Easy"),
      grammarQuestion("m1-g2", "The proposal, __________ was rejected last year, has been submitted again.", ["that", "what", "which"], "C", "Non-defining relative clause", "Medium"),
      grammarQuestion("m1-g3", "He __________ have written the note; he wasn’t even in the country.", ["can’t", "shouldn’t", "needn’t"], "A", "Modal perfect: deduction", "Hard"),
      grammarQuestion("m1-g4", "There were __________ mistakes in the second draft than in the first.", ["less", "fewer", "few"], "B", "Fewer / less", "Easy"),
      grammarQuestion("m1-g5", "The director had her assistant __________ the figures again.", ["check", "to check", "checked"], "A", "Causative have + person + bare infinitive", "Medium"),
      grammarQuestion("m1-g6", "Rarely __________ such a sharp fall in demand.", ["we have seen", "we saw", "have we seen"], "C", "Negative adverbial inversion", "Hard"),
      grammarQuestion("m1-g7", "She works as __________ interpreter for an international charity.", ["the", "an", "—"], "B", "Articles: profession", "Easy"),
      grammarQuestion("m1-g8", "I __________ much of a morning person, but that’s changed.", ["didn’t use to be", "wasn’t used to being", "wouldn’t be"], "A", "Used to + state", "Medium"),
      grammarQuestion("m1-g9", "If she’d accepted the offer, she __________ in Singapore now.", ["would have lived", "lived", "would be living"], "C", "Mixed conditional", "Hard"),
      grammarQuestion("m1-g10", "I’ll text you as soon as I __________ there.", ["will get", "get", "got"], "B", "Future time clause", "Easy"),
      grammarQuestion("m1-g11", "A series of delays __________ caused serious problems.", ["has", "have", "are"], "A", "Agreement: a series of", "Medium"),
      grammarQuestion("m1-g12", "The committee interviewed six candidates, none of __________ had the required experience.", ["them", "whom", "which"], "B", "None of whom", "Hard"),
      grammarQuestion("m1-g13", "She __________ four client meetings so far today.", ["has attended", "has been attending", "attends"], "A", "Present perfect: completed number", "Medium"),
      grammarQuestion("m1-g14", "I’m not very good __________ remembering people’s names.", ["in", "at", "on"], "B", "Dependent preposition", "Easy"),
      grammarQuestion("m1-g15", "The report, __________ by two independent experts, was finally approved.", ["reviewing", "reviewed", "having reviewed"], "B", "Participle clause: reduced passive relative", "Medium/Hard"),
      grammarQuestion("m1-g16", "We stopped __________ a coffee before continuing our journey.", ["to have", "having", "have"], "A", "Stop doing / stop to do", "Medium"),
      grammarQuestion("m1-g17", "There are two entrances. One is locked; __________ is open.", ["another", "other", "the other"], "C", "The other", "Easy"),
      grammarQuestion("m1-g18", "By next Friday, we __________ all the interviews.", ["will be completing", "will have completed", "have completed"], "B", "Future perfect", "Hard"),
      grammarQuestion("m1-g19", "That was dangerous — you __________ have driven home after drinking.", ["needn’t", "can’t", "shouldn’t"], "C", "Modal perfect: past criticism", "Medium"),
      grammarQuestion("m1-g20", "Let’s meet outside the station, __________?", ["shall we", "will we", "do we"], "A", "Question tags with Let’s", "Easy"),
      grammarQuestion("m1-g21", "More than one applicant __________ asked for extra time.", ["have", "has", "are"], "B", "More than one agreement", "Hard"),
      grammarQuestion("m1-g22", "The building __________ as a library for fifty years and still is.", ["has been used", "was used", "is using"], "A", "Present perfect passive", "Medium"),
      grammarQuestion("m1-g23", "She asked me where I __________ the keys.", ["had I left", "did I leave", "had left"], "C", "Reported question word order", "Medium"),
      grammarQuestion("m1-g24", "If only I __________ more attention at the time.", ["had paid", "would pay", "have paid"], "A", "If only + unreal past", "Hard"),
      grammarQuestion("m1-g25", "Several important questions have yet __________ satisfactorily.", ["been answered", "to answer", "to be answered"], "C", "Have yet to be + participle", "Hard"),
    ],
    vocabularyTasks: [
      vocabularyTask(
        "m1-v1",
        "Questions 1–5",
        "Synonyms",
        "Choose the word that is most similar in meaning to each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "decide"], ["B", "reply"], ["C", "follow"], ["D", "happen"], ["E", "build"], ["F", "explain"], ["G", "try"], ["H", "help"], ["J", "plan"], ["K", "start"]],
        [[1, "assist", "H"], [2, "construct", "E"], [3, "occur", "D"], [4, "respond", "B"], [5, "attempt", "G"]],
        true
      ),
      vocabularyTask(
        "m1-v2",
        "Questions 6–10",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "accept"], ["B", "admit"], ["C", "advise"], ["D", "allow"], ["E", "avoid"], ["F", "prevent"], ["G", "recommend"], ["H", "refuse"], ["J", "remind"], ["K", "warn"]],
        [
          [6, "I always forget my tablets, so please __________ me to take them after lunch.", "J"],
          [7, "Cyclists should __________ this road at rush hour because the traffic is extremely heavy.", "E"],
          [8, "This alarm is designed to __________ staff if smoke is detected.", "K"],
          [9, "The revised conditions were exactly what she wanted, so she decided to __________ the offer.", "A"],
          [10, "The new security system should __________ unauthorised users from accessing these files.", "F"],
        ]
      ),
      vocabularyTask(
        "m1-v3",
        "Questions 11–15",
        "Definitions",
        "Choose the word that matches each definition. Use each word once only. You will not need five of the words.",
        [["A", "adequate"], ["B", "apparent"], ["C", "cautious"], ["D", "conventional"], ["E", "essential"], ["F", "flexible"], ["G", "gradual"], ["H", "precise"], ["J", "relevant"], ["K", "stable"]],
        [
          [11, "Happening slowly over a period of time.", "G"],
          [12, "Directly connected with the subject being discussed.", "J"],
          [13, "Careful to avoid danger, problems or mistakes.", "C"],
          [14, "Enough for a particular need or purpose.", "A"],
          [15, "Not likely to change suddenly or become worse.", "K"],
        ]
      ),
      vocabularyTask(
        "m1-v4",
        "Questions 16–20",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "approach"], ["B", "concern"], ["C", "consequence"], ["D", "demand"], ["E", "estimate"], ["F", "intention"], ["G", "measures"], ["H", "priority"], ["J", "shortage"], ["K", "threat"]],
        [
          [16, "One possible __________ of the new policy is that rents could increase.", "C"],
          [17, "Reducing waiting times should be the hospital’s main __________.", "H"],
          [18, "There has been a sharp rise in __________ for electric cars this year.", "D"],
          [19, "The government introduced several new __________ to reduce air pollution.", "G"],
          [20, "Climate change poses a serious __________ to many coastal communities.", "K"],
        ]
      ),
      vocabularyTask(
        "m1-v5",
        "Questions 21–25",
        "Collocations",
        "Choose the word that is most often used with each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "debate"], ["B", "schedule"], ["C", "majority"], ["D", "method"], ["E", "permission"], ["F", "possibility"], ["G", "behaviour"], ["H", "feature"], ["J", "issue"], ["K", "income"]],
        [[21, "heated", "A"], [22, "remote", "F"], [23, "overwhelming", "C"], [24, "pressing", "J"], [25, "dominant", "H"]],
        true
      ),
    ],
  },
  {
    id: "mock-2",
    version: "002",
    title: "Aptis Grammar and Vocabulary Mock 2",
    grammarQuestions: [
      grammarQuestion("m2-g1", "I haven’t spoken to Maya __________ last Friday.", ["for", "since", "during"], "B", "Since / for", "Easy"),
      grammarQuestion("m2-g2", "Only after the lights went out __________ there was a problem.", ["we realised", "had we realised", "did we realise"], "C", "Only after inversion", "Hard"),
      grammarQuestion("m2-g3", "Neither of the explanations __________ completely convincing.", ["seems", "seem", "are seeming"], "A", "Agreement with neither of", "Medium"),
      grammarQuestion("m2-g4", "She suggested __________ the meeting until Monday.", ["postpone", "to postpone", "postponing"], "C", "Suggest + -ing", "Medium"),
      grammarQuestion("m2-g5", "I wish you __________ interrupting me. It’s really annoying.", ["will stop", "would stop", "stop"], "B", "Wish + would for behaviour", "Medium/Hard"),
      grammarQuestion("m2-g6", "Do you know how long __________ here?", ["she has worked", "has she worked", "does she work"], "A", "Indirect question word order", "Medium"),
      grammarQuestion("m2-g7", "By the time we get there, the film __________.", ["starts", "will start", "will have started"], "C", "Future perfect", "Medium/Hard"),
      grammarQuestion("m2-g8", "You __________ me earlier; I could have helped.", ["should have told", "must have told", "should tell"], "A", "Past modal criticism", "Medium"),
      grammarQuestion("m2-g9", "He denied __________ the confidential document.", ["to copy", "copying", "copy"], "B", "Deny + -ing", "Medium"),
      grammarQuestion("m2-g10", "She __________ the report for over an hour when the computer crashed.", ["was writing", "has been writing", "had been writing"], "C", "Past perfect continuous", "Hard"),
      grammarQuestion("m2-g11", "We had the kitchen __________ before moving into the house.", ["renovated", "to renovate", "renovate"], "A", "Have something done", "Medium"),
      grammarQuestion("m2-g12", "If she’d checked the address, she __________ to the wrong office.", ["wouldn’t go", "wouldn’t have gone", "hadn’t gone"], "B", "Third conditional", "Medium/Hard"),
      grammarQuestion("m2-g13", "I was so tired that I could __________ keep my eyes open.", ["hard", "harder", "hardly"], "C", "Hard / hardly", "Medium"),
      grammarQuestion("m2-g14", "I’d rather we __________ the decision until tomorrow.", ["left", "leave", "had left"], "A", "Would rather + past", "Hard"),
      grammarQuestion("m2-g15", "There were very __________ applicants with the right experience.", ["little", "few", "less"], "B", "Few with plural nouns", "Easy"),
      grammarQuestion("m2-g16", "The new system is nowhere near __________ the old one.", ["as reliable as", "more reliable than", "the most reliable"], "A", "Nowhere near as ... as", "Hard"),
      grammarQuestion("m2-g17", "Some of the equipment __________ damaged in transit.", ["have", "were", "was"], "C", "Uncountable noun agreement", "Medium"),
      grammarQuestion("m2-g18", "The minister is believed __________ about the problem before the announcement.", ["to know", "to have known", "having known"], "B", "Perfect reporting infinitive", "Hard"),
      grammarQuestion("m2-g19", "It was Anna __________ first noticed the discrepancy.", ["which", "what", "who"], "C", "Cleft sentence", "Medium"),
      grammarQuestion("m2-g20", "After several months abroad, I’m used to __________ at unusual times.", ["eating", "eat", "have eaten"], "A", "Be used to + -ing", "Medium"),
      grammarQuestion("m2-g21", "The proposal was rejected, __________ surprised no one.", ["that", "which", "what"], "B", "Sentential relative clause", "Medium/Hard"),
      grammarQuestion("m2-g22", "Had they warned us earlier, we __________ alternative arrangements.", ["could have made", "could make", "made"], "A", "Inverted third conditional", "Hard"),
      grammarQuestion("m2-g23", "She speaks French fluently, and so __________ her sister.", ["is", "speaks", "does"], "C", "So + auxiliary + subject", "Medium"),
      grammarQuestion("m2-g24", "The project is expected __________ by September.", ["being completed", "to be completed", "to complete"], "B", "Passive infinitive", "Medium/Hard"),
      grammarQuestion("m2-g25", "Nobody objected to the change, __________?", ["did they", "didn’t they", "did he"], "A", "Tag after negative subject", "Hard"),
    ],
    vocabularyTasks: [
      vocabularyTask(
        "m2-v1",
        "Questions 1–5",
        "Synonyms",
        "Choose the word that is most similar in meaning to each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "normal"], ["B", "ready"], ["C", "short"], ["D", "lucky"], ["E", "certain"], ["F", "calm"], ["G", "whole"], ["H", "early"], ["J", "polite"], ["K", "general"]],
        [[1, "brief", "C"], [2, "entire", "G"], [3, "usual", "A"], [4, "fortunate", "D"], [5, "peaceful", "F"]],
        true
      ),
      vocabularyTask(
        "m2-v2",
        "Questions 6–10",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "appointment"], ["B", "arrangement"], ["C", "complaint"], ["D", "opportunity"], ["E", "permission"], ["F", "recommendation"], ["G", "request"], ["H", "requirement"], ["J", "responsibility"], ["K", "warning"]],
        [
          [6, "You need written __________ from the owner before making changes to the flat.", "E"],
          [7, "Previous experience is not a __________ for this job, although it would be useful.", "H"],
          [8, "The manager has overall __________ for training new members of staff.", "J"],
          [9, "I have a dental __________ at half past ten tomorrow morning.", "A"],
          [10, "She made a formal __________ after waiting three months for her refund.", "C"],
        ]
      ),
      vocabularyTask(
        "m2-v3",
        "Questions 11–15",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "access"], ["B", "evidence"], ["C", "limit"], ["D", "outcome"], ["E", "permission"], ["F", "priority"], ["G", "response"], ["H", "shortage"], ["J", "source"], ["K", "tendency"]],
        [
          [11, "There is a serious __________ of qualified nurses in some rural areas.", "H"],
          [12, "The survey showed a clear __________ for younger customers to pay by phone.", "K"],
          [13, "We still don’t know the final __________ of the negotiations.", "D"],
          [14, "Only authorised staff have __________ to these records.", "A"],
          [15, "Investigators found no __________ linking the company to the fraud.", "B"],
        ]
      ),
      vocabularyTask(
        "m2-v4",
        "Questions 16–20",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "acknowledge"], ["B", "adapt"], ["C", "challenge"], ["D", "convince"], ["E", "establish"], ["F", "justify"], ["G", "preserve"], ["H", "recover"], ["J", "reject"], ["K", "restrict"]],
        [
          [16, "The company will need to __________ quickly to changing customer expectations.", "B"],
          [17, "The evidence is not strong enough to __________ such a serious accusation.", "F"],
          [18, "The new regulations will __________ the amount of personal data companies can collect.", "K"],
          [19, "After several unsuccessful attempts, researchers finally managed to __________ the cause of the problem.", "E"],
          [20, "The museum is working to __________ the building’s original features.", "G"],
        ]
      ),
      vocabularyTask(
        "m2-v5",
        "Questions 21–25",
        "Collocations",
        "Choose the word that is most often used with each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "shortage"], ["B", "outcome"], ["C", "responsibility"], ["D", "procedure"], ["E", "consensus"], ["F", "estimate"], ["G", "attitude"], ["H", "distinction"], ["J", "resource"], ["K", "status"]],
        [[21, "acute", "A"], [22, "sole", "C"], [23, "broad", "E"], [24, "rough", "F"], [25, "subtle", "H"]],
        true
      ),
    ],
  },
  {
    id: "mock-3",
    version: "003",
    title: "Aptis Grammar and Vocabulary Mock 3",
    grammarQuestions: [
      grammarQuestion("m3-g1", "We usually eat outside, but today it __________.", ["rains", "is raining", "has rained"], "B", "Present simple vs continuous", "Easy"),
      grammarQuestion("m3-g2", "The company employs over 200 people, most of __________ work remotely.", ["whom", "them", "which"], "A", "Quantified relative clause", "Hard"),
      grammarQuestion("m3-g3", "You __________ leave your bags here if you want to.", ["must", "ought", "may"], "C", "Permission with modal verbs", "Easy"),
      grammarQuestion("m3-g4", "I’ll have the documents __________ before the meeting.", ["print", "printed", "to print"], "B", "Causative have something done", "Medium"),
      grammarQuestion("m3-g5", "No sooner __________ the announcement than complaints began to arrive.", ["they had made", "did they make", "had they made"], "C", "No sooner inversion", "Hard"),
      grammarQuestion("m3-g6", "There isn’t __________ milk left, so I’ll buy some.", ["many", "much", "several"], "B", "Countability / much", "Easy"),
      grammarQuestion("m3-g7", "I didn’t recognise Leo because he __________ a beard since I last saw him.", ["had grown", "grew", "has grown"], "A", "Past perfect", "Medium"),
      grammarQuestion("m3-g8", "She admitted __________ the figures without checking them first.", ["changing", "to change", "change"], "A", "Admit + -ing", "Medium"),
      grammarQuestion("m3-g9", "The two proposals are similar, but __________ is considerably cheaper.", ["another", "other", "one"], "C", "Pronoun substitution", "Medium"),
      grammarQuestion("m3-g10", "If you __________ me earlier, I could have changed the booking.", ["told", "had told", "would tell"], "B", "Third conditional", "Medium"),
      grammarQuestion("m3-g11", "I’m not accustomed to __________ such long hours.", ["work", "have worked", "working"], "C", "Accustomed to + -ing", "Medium"),
      grammarQuestion("m3-g12", "The amount of waste we produce __________ dramatically in recent years.", ["has increased", "have increased", "increased"], "A", "Agreement with amount of", "Medium"),
      grammarQuestion("m3-g13", "We’d better __________ now if we want to catch the last bus.", ["leave", "to leave", "leaving"], "A", "Had better + bare infinitive", "Easy"),
      grammarQuestion("m3-g14", "The film was much better than I __________ it to be.", ["have expected", "would expect", "had expected"], "C", "Past perfect in comparison", "Medium/Hard"),
      grammarQuestion("m3-g15", "The longer the meeting went on, __________ difficult it became to reach a decision.", ["more", "the more", "the most"], "B", "The + comparative..., the + comparative...", "Medium/Hard"),
      grammarQuestion("m3-g16", "She asked whether I __________ attending the conference the following week.", ["was", "am", "will be"], "A", "Reported question / future in past", "Medium"),
      grammarQuestion("m3-g17", "Each of the rooms __________ its own private balcony.", ["have", "are having", "has"], "C", "Each of + singular verb", "Medium"),
      grammarQuestion("m3-g18", "He speaks as though he __________ everything about the subject.", ["knows", "knew", "had known"], "B", "As though + unreal past", "Hard"),
      grammarQuestion("m3-g19", "This is the first time I __________ this software.", ["use", "have used", "used"], "B", "First time + present perfect", "Medium"),
      grammarQuestion("m3-g20", "The new rules are intended to prevent people __________ confidential information.", ["revealing", "to reveal", "reveal"], "A", "Prevent + object + -ing", "Medium"),
      grammarQuestion("m3-g21", "The road was closed, so we had no choice __________ another route.", ["taking", "but take", "but to take"], "C", "No choice but to", "Hard"),
      grammarQuestion("m3-g22", "Were the situation __________ worse, we would have to reconsider the whole plan.", ["get", "getting", "to get"], "C", "Formal conditional were ... to", "Hard"),
      grammarQuestion("m3-g23", "She knew about the change before it was announced, so someone __________ her.", ["must have told", "should tell", "can be telling"], "A", "Modal perfect: past deduction", "Medium/Hard"),
      grammarQuestion("m3-g24", "Only one of the applicants __________ all the required qualifications.", ["have", "has", "having"], "B", "Only one of + singular agreement", "Medium"),
      grammarQuestion("m3-g25", "Much as I __________ to agree with you, I don’t think the figures support that conclusion.", ["would like", "will like", "had liked"], "A", "Concessive much as + would like", "Hard"),
    ],
    vocabularyTasks: [
      vocabularyTask(
        "m3-v1",
        "Questions 1–5",
        "Synonyms",
        "Choose the word that is most similar in meaning to each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "camera"], ["B", "tale"], ["C", "adult"], ["D", "picture"], ["E", "market"], ["F", "start"], ["G", "book"], ["H", "store"], ["J", "kid"], ["K", "ending"]],
        [[1, "child", "J"], [2, "photo", "D"], [3, "beginning", "F"], [4, "story", "B"], [5, "shop", "H"]],
        true
      ),
      vocabularyTask(
        "m3-v2",
        "Questions 6–10",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "blunt"], ["B", "deep"], ["C", "flat"], ["D", "loose"], ["E", "narrow"], ["F", "shallow"], ["G", "sharp"], ["H", "steep"], ["J", "tight"], ["K", "wide"]],
        [
          [6, "The doorway is too __________ for this sofa to fit through.", "E"],
          [7, "Be careful with that knife — it’s extremely __________.", "G"],
          [8, "The road becomes very __________ as it climbs the mountain.", "H"],
          [9, "One of the buttons on your jacket is __________ and may fall off.", "D"],
          [10, "The water is quite __________ here, so young children shouldn’t swim alone.", "B"],
        ]
      ),
      vocabularyTask(
        "m3-v3",
        "Questions 11–15",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "assess"], ["B", "assume"], ["C", "confirm"], ["D", "decline"], ["E", "estimate"], ["F", "identify"], ["G", "maintain"], ["H", "require"], ["J", "reveal"], ["K", "withdraw"]],
        [
          [11, "Before approving the loan, the bank will __________ the applicant’s financial situation.", "A"],
          [12, "Please __________ your booking by replying to this email before Friday.", "C"],
          [13, "Police are trying to __________ the man seen leaving the building.", "F"],
          [14, "The investigation may __________ information that was previously confidential.", "J"],
          [15, "This position will __________ you to travel several times a month.", "H"],
        ]
      ),
      vocabularyTask(
        "m3-v4",
        "Questions 16–20",
        "Vocabulary in Context",
        "Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.",
        [["A", "beneficial"], ["B", "considerable"], ["C", "effective"], ["D", "inevitable"], ["E", "limited"], ["F", "practical"], ["G", "reasonable"], ["H", "relevant"], ["J", "temporary"], ["K", "widespread"]],
        [
          [16, "The scheme was only a __________ solution while the main building was being repaired.", "J"],
          [17, "There is now __________ concern about the amount of plastic entering the oceans.", "K"],
          [18, "The new treatment appears to be highly __________ in reducing the symptoms.", "C"],
          [19, "We have only __________ information, so it would be unwise to make a decision yet.", "E"],
          [20, "The price seems __________ considering the quality of the materials used.", "G"],
        ]
      ),
      vocabularyTask(
        "m3-v5",
        "Questions 21–25",
        "Collocations",
        "Choose the word that is most often used with each word on the left. Use each word once only. You will not need five of the words.",
        [["A", "concern"], ["B", "sector"], ["C", "improvement"], ["D", "schedule"], ["E", "measures"], ["F", "method"], ["G", "dependence"], ["H", "role"], ["J", "diagnosis"], ["K", "context"]],
        [[21, "grave", "A"], [22, "marked", "C"], [23, "stringent", "E"], [24, "chronic", "G"], [25, "definitive", "J"]],
        true
      ),
    ],
  },
];

export function getAptisGrammarVocabularyMock(mockId) {
  return APTIS_GRAMMAR_VOCABULARY_MOCKS.find((mock) => mock.id === mockId) || null;
}
