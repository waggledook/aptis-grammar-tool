const setOneAudioRoot = "/audio/ote/listening/advanced/part-3/set-1";
const setTwoAudioRoot = "/audio/ote/listening/advanced/part-3/set-2";
const subscriptionServicesAudioRoot =
  "/audio/ote/listening/advanced/part-3/subscription-services";
const analogueMediaAudioRoot =
  "/audio/ote/listening/advanced/part-3/analogue-media";

export const advancedListeningPart3Sets = [
  {
    id: "set-1",
    level: "C1",
    title: "AI-generated feedback on student writing",
    description:
      "Match six opinions from an extended discussion to the woman, the man, or both speakers.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${setOneAudioRoot}/ai-generated-feedback-on-student-writing.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${setOneAudioRoot}/question.mp3`,
    instructions:
      "Listen to an education journalist and a university researcher discussing AI-generated feedback on student writing. Match the people—the woman, the man, or both—to the opinions below.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    speakers: [
      { id: "woman", label: "Woman", name: "Dr Maya Chen" },
      { id: "man", label: "Man", name: "Daniel Reed" },
      { id: "both", label: "Both", name: "Both speakers" },
    ],
    opinions: [
      {
        id: "less-personal-criticism",
        text: "Students may revise more readily when criticism does not come directly from a teacher.",
        answer: "woman",
        review: {
          explanation:
            "The woman reports greater willingness to return to a draft when the first response came from the system because it felt less personal. The man explicitly says his programme did not see that increase.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "Students who tended to take criticism personally were more willing to return to a draft when the first response came from the system. It felt less like being judged by a lecturer.",
              note:
                "This directly links non-teacher criticism with a greater willingness to revise.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "We didn’t see that increase",
              note:
                "The man contrasts his findings with the woman’s rather than sharing her opinion.",
            },
          ],
        },
      },
      {
        id: "polished-authority",
        text: "Professionally worded AI comments can make teachers less likely to question their accuracy.",
        answer: "man",
        review: {
          explanation:
            "The man argues that polished language gave the comments an authority their evidence did not deserve, leading staff to assume the underlying analysis was sound. The woman says her trained assessors were usually more cautious.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "Some comments sounded so polished that staff assumed the analysis behind them must be sound.",
              note:
                "The professional tone made staff less likely to test the accuracy of the analysis.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "The tone created an authority the evidence didn’t always deserve.",
              note:
                "This makes the man’s concern about misplaced confidence explicit.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "Our trained assessors were usually more cautious",
              note:
                "The woman reports a contrasting response from the assessors in her study.",
            },
          ],
        },
      },
      {
        id: "recurring-weaknesses",
        text: "AI feedback is most useful when it identifies recurring weaknesses in a student’s work.",
        answer: "both",
        review: {
          explanation:
            "Both speakers value pattern detection across a complete text and distrust exact sentence-level replacements. Their examples differ, but their judgement is the same.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "The systems were strongest when they looked across a complete piece of work.",
              note:
                "The woman values feedback that reveals a pattern across the whole text.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "It was far less dependable when it tried to repair a single sentence.",
              note:
                "This contrast rules out sentence-level correction as the main benefit.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote:
                "the clearest benefit was seeing that the same problem kept returning",
              note:
                "The man independently identifies recurring weaknesses as the clearest benefit.",
            },
          ],
        },
      },
      {
        id: "workload-not-enough",
        text: "Reducing teachers’ workload does not, by itself, justify using AI feedback.",
        answer: "man",
        review: {
          explanation:
            "The man says time saved proves little on its own and that adoption must begin with learning. The woman is more open to workload savings being sufficient in departments with long delays.",
          evidence: [
            {
              speaker: "Woman",
              type: "distractor",
              quote: "the time saved may be enough to make the system worth adopting",
              note:
                "The woman allows workload savings to justify adoption in some contexts.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "saving ten minutes proves very little on its own",
              note:
                "The man rejects workload reduction as a sufficient argument by itself.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "The decision has to start with learning, not the quickest spreadsheet result.",
              note:
                "He makes learning outcomes—not administrative efficiency—the deciding factor.",
            },
          ],
        },
      },
      {
        id: "disclose-ai",
        text: "Students should be informed whenever AI has contributed to their feedback.",
        answer: "woman",
        review: {
          explanation:
            "The woman answers the disclosure question directly and explains why students need to know the source. The man worries that prominent labels can cause automatic rejection and prioritises the quality of the advice.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "If a comment is partly generated by AI, students need that information before deciding how much weight to give it.",
              note:
                "This is a direct argument for disclosing AI involvement.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote:
                "I care more about whether the advice is accurate, useful and open to discussion.",
              note:
                "The man shifts the priority away from mandatory labelling.",
            },
          ],
        },
      },
      {
        id: "experienced-revisers",
        text: "AI feedback may benefit students who already know how to revise more than others.",
        answer: "both",
        review: {
          explanation:
            "The woman explains why experienced writers can evaluate and adapt a suggestion; the man reports that independent revisers gained the most in his trial. Both therefore identify an advantage for students with existing revision skills.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "Confident writers can compare a suggestion with their intentions, adapt it or reject it.",
              note:
                "The woman describes the judgement skills that let experienced writers use AI well.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote: "Students with less experience often treat every comment as an instruction",
              note:
                "Less experienced students are presented as less able to evaluate the feedback.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "The students already able to revise independently gained the most",
              note:
                "The man’s trial reaches the same conclusion directly.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Man",
        text: "Welcome to Learning Matters. I’m Daniel Reed, and today we’re looking at AI-generated feedback on student writing. Joining me is Dr Maya Chen, whose recent research examines how students use automated comments. Maya, universities often focus on speed, but faster feedback is not necessarily better feedback.",
      },
      {
        speaker: "Woman",
        text: "No. A student may read a comment, act on it, or simply accept it without understanding it. Those are very different outcomes.",
      },
      {
        speaker: "Man",
        text: "In the writing programme I used to run, students certainly opened automated comments more often than the notes tutors attached to marked work. Whether they revised more thoughtfully was less clear.",
      },
      {
        speaker: "Woman",
        text: "We found something slightly different. Students who tended to take criticism personally were more willing to return to a draft when the first response came from the system. It felt less like being judged by a lecturer. Their changes were not always better, but they made more of them.",
      },
      {
        speaker: "Man",
        text: "We didn’t see that increase, although our students already had to submit two revised versions.",
      },
      { speaker: "Woman", text: "That may have reduced the difference." },
      {
        speaker: "Man",
        text: "What concerned me more was the effect on tutors. Some comments sounded so polished that staff assumed the analysis behind them must be sound. When we asked tutors to identify the exact sentence supporting a comment, several struggled. The tone created an authority the evidence didn’t always deserve.",
      },
      {
        speaker: "Woman",
        text: "Our trained assessors were usually more cautious, though students were certainly influenced by confident wording.",
      },
      { speaker: "Man", text: "Students were another matter." },
      {
        speaker: "Woman",
        text: "The systems were strongest when they looked across a complete piece of work. A student might have six paragraphs with weak opening sentences, for example. A tutor could notice that too, but the software made the pattern visible immediately. It was far less dependable when it tried to repair a single sentence.",
      },
      {
        speaker: "Man",
        text: "In our classes, the clearest benefit was seeing that the same problem kept returning—perhaps vague references or paragraphs with no clear focus. Once the system started proposing exact replacements, the quality became much less consistent.",
      },
      {
        speaker: "Woman",
        text: "That distinction becomes important when workload enters the discussion.",
      },
      {
        speaker: "Man",
        text: "Workload is the argument administrators return to most often. Marking routine errors takes time, and teachers are under pressure.",
      },
      {
        speaker: "Woman",
        text: "That benefit shouldn’t be dismissed. In departments where students wait weeks for comments, the time saved may be enough to make the system worth adopting.",
      },
      {
        speaker: "Man",
        text: "The difficulty is that saving ten minutes proves very little on its own. If students learn less, or teachers spend those ten minutes checking unreliable comments, the efficiency is largely imaginary. The decision has to start with learning, not the quickest spreadsheet result.",
      },
      {
        speaker: "Woman",
        text: "The other issue students often ask about is authorship.",
      },
      {
        speaker: "Man",
        text: "Should they always be told how the feedback was produced?",
      },
      {
        speaker: "Woman",
        text: "They should. If a comment is partly generated by AI, students need that information before deciding how much weight to give it. They should also know that they can ask a tutor to explain or challenge it. Hiding the source risks presenting a suggestion as if it were a settled academic judgement.",
      },
      {
        speaker: "Man",
        text: "A prominent label can create its own problem. Some students reject anything marked as automated before reading it. I care more about whether the advice is accurate, useful and open to discussion.",
      },
      {
        speaker: "Woman",
        text: "The ability to judge that advice is uneven, though. Confident writers can compare a suggestion with their intentions, adapt it or reject it. Students with less experience often treat every comment as an instruction, especially when they don’t yet have the language to explain why a recommendation feels wrong.",
      },
      {
        speaker: "Man",
        text: "We saw that in our trial. Weaker writers sometimes waited for the system to supply a replacement sentence. When it only identified a problem, they were stuck. The students already able to revise independently gained the most, because they could turn a general observation into a practical change.",
      },
      {
        speaker: "Woman",
        text: "Which suggests that teaching students how to use feedback matters as much as generating it.",
      },
      { speaker: "Man", text: "Dr Maya Chen, thank you for joining me." },
      { speaker: "Woman", text: "My pleasure." },
    ],
  },
  {
    id: "set-2",
    level: "C1",
    title: "Citizen science",
    description:
      "Match six opinions from an extended discussion to the woman, the man, or both speakers.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${setTwoAudioRoot}/citizen-science.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${setTwoAudioRoot}/question.mp3`,
    instructions:
      "Listen to a science journalist and a conservation ecologist discussing citizen science. Match the people—the woman, the man, or both—to the opinions below.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    speakers: [
      { id: "woman", label: "Woman", name: "Nina Patel" },
      { id: "man", label: "Man", name: "Dr Owen Marsh" },
      { id: "both", label: "Both", name: "Both speakers" },
    ],
    opinions: [
      {
        id: "research-access",
        text: "Citizen science can collect valuable data from places professional researchers rarely reach.",
        answer: "both",
        review: {
          explanation:
            "Both speakers describe volunteers reaching locations or observing events beyond the normal coverage of professional teams. The man gives a general account; the woman supplies a separate flooding example.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "Gardens, footpaths and remote stretches of coast also enter the picture.",
              note:
                "The man explains how volunteers extend the geographical range of professional research.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "Local river groups supplied photographs from places the monitoring agency couldn’t reach.",
              note:
                "The woman gives independent evidence of volunteers reaching otherwise inaccessible places.",
            },
          ],
        },
      },
      {
        id: "training-barrier",
        text: "Demanding training can discourage the volunteers a project most needs to attract.",
        answer: "man",
        review: {
          explanation:
            "The man reports that lengthy compulsory preparation retained keen naturalists but lost families, younger volunteers and newcomers. The woman supports proportionate preparation and describes a brief session that helped newcomers.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "Families, younger volunteers and residents with no conservation background often vanished before making one observation.",
              note:
                "The people the project needed to broaden participation were the ones driven away by the demanding training.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "a brief live session made newcomers more confident because they could ask what counted as an acceptable record.",
              note:
                "The woman presents suitable preparation as supportive rather than discouraging.",
            },
          ],
        },
      },
      {
        id: "excluded-observations",
        text: "Volunteers should be told when their observations cannot be included in a study.",
        answer: "woman",
        review: {
          explanation:
            "The woman argues for record-specific feedback so that silence is not mistaken for indifference and contributors can avoid repeating mistakes. The man considers an individual explanation for every rejected entry unrealistic.",
          evidence: [
            {
              speaker: "Man",
              type: "distractor",
              quote:
                "a personal explanation for every rejected entry isn’t realistic.",
              note:
                "The man favours general guidance and aggregate information instead.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "If a record is excluded because the photograph is unclear or the location is missing, the contributor should be able to see that.",
              note:
                "The woman explicitly says contributors should see why their own record was excluded.",
            },
          ],
        },
      },
      {
        id: "large-dataset-weaknesses",
        text: "A large dataset may conceal weaknesses in how observations were collected.",
        answer: "both",
        review: {
          explanation:
            "Both speakers warn that quantity can create false confidence. The man identifies uneven timing and location; the woman adds device variation and self-selected monitoring sites.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "if most come from city parks on dry weekend mornings, the apparent coverage is much broader than the evidence really is.",
              note:
                "The man shows how a large total can hide a narrow and biased collection pattern.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "A huge spreadsheet can create false confidence unless the collection methods are examined alongside the results.",
              note:
                "The woman independently warns that dataset size does not guarantee sound methodology.",
            },
          ],
        },
      },
      {
        id: "understanding-uncertainty",
        text: "Participation can improve public understanding of uncertainty in scientific research.",
        answer: "woman",
        review: {
          explanation:
            "The woman believes well-run projects can demonstrate how evidence is challenged and conclusions change. The man doubts that most volunteers see enough of the scientific process to learn this.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "They learn that uncertainty is not a failure of science; it is part of the process.",
              note:
                "The woman directly links participation with a better understanding of scientific uncertainty.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote:
                "What they learn is how to use the app, not how scientific uncertainty works.",
              note:
                "The man explicitly rejects the woman’s claim as a typical outcome.",
            },
          ],
        },
      },
      {
        id: "existing-interest",
        text: "Citizen-science projects often attract people already interested in environmental issues.",
        answer: "man",
        review: {
          explanation:
            "The man argues that recruitment through established conservation channels produces an already-engaged audience. The woman counters with projects that reached people motivated by practical local concerns.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "you mostly reach people who already watch birds, identify plants or worry about habitat loss.",
              note:
                "The man says the usual recruitment channels primarily reach people with an existing environmental interest.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "Air-quality studies have attracted parents concerned about school streets, delivery riders and people who had never joined an environmental organisation.",
              note:
                "The woman offers counterexamples of projects reaching beyond the already-engaged audience.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Welcome to Science in Practice. I’m Nina Patel, and today we’re looking at citizen science, where members of the public help gather or classify research data. My guest is conservation ecologist Dr Owen Marsh. Owen, critics sometimes call it free labour for researchers. Is that fair?",
      },
      {
        speaker: "Man",
        text: "It can be, when volunteers collect information and never hear what becomes of it. At its best, though, it lets small research teams investigate questions on a remarkable scale.",
      },
      { speaker: "Woman", text: "Geography is part of that, presumably." },
      {
        speaker: "Man",
        text: "Very much so. Researchers may visit a woodland twice in a season; nearby residents can report what appears there every week. Gardens, footpaths and remote stretches of coast also enter the picture. Volunteers may even spot sudden events before a professional team knows to look.",
      },
      {
        speaker: "Woman",
        text: "I saw that after flooding in the north last year. Local river groups supplied photographs from places the monitoring agency couldn’t reach. Together, they showed how quickly conditions were changing.",
      },
      { speaker: "Man", text: "And then comes the difficult question of consistency." },
      { speaker: "Woman", text: "Which suggests training has to be fairly thorough." },
      {
        speaker: "Man",
        text: "Up to a point. One early project began with a long video, a handbook and a compulsory quiz. Keen naturalists completed them. Families, younger volunteers and residents with no conservation background often vanished before making one observation. We replaced most of it with short examples inside the task.",
      },
      {
        speaker: "Woman",
        text: "Some preparation is unavoidable, though. On projects I’ve reported on, a brief live session made newcomers more confident because they could ask what counted as an acceptable record.",
      },
      { speaker: "Man", text: "The task has to earn every demand it places on people." },
      {
        speaker: "Woman",
        text: "What about observations that fail the quality checks? Volunteers often say they submit photographs or measurements and hear nothing afterwards.",
      },
      {
        speaker: "Man",
        text: "Once thousands of records arrive, a personal explanation for every rejected entry isn’t realistic. A public dashboard can show how many were accepted, queried or removed, while the guidance should explain the checks from the beginning.",
      },
      {
        speaker: "Woman",
        text: "That still leaves people wondering about their own contribution. If a record is excluded because the photograph is unclear or the location is missing, the contributor should be able to see that. Otherwise silence looks like indifference, and the same mistake may be repeated.",
      },
      {
        speaker: "Man",
        text: "Numbers can be deceptive too. A project announces a million wildlife sightings, which sounds extraordinary. But if most come from city parks on dry weekend mornings, the apparent coverage is much broader than the evidence really is.",
      },
      {
        speaker: "Woman",
        text: "Different phones may also record air quality differently, while participants choose places where they already expect pollution. A huge spreadsheet can create false confidence unless the collection methods are examined alongside the results.",
      },
      { speaker: "Man", text: "That’s where professional researchers remain essential." },
      {
        speaker: "Woman",
        text: "There is an educational benefit too. In well-run projects, contributors see classifications revised, unusual records challenged and conclusions changed when new evidence arrives. They learn that uncertainty is not a failure of science; it is part of the process.",
      },
      {
        speaker: "Man",
        text: "I’m wary of claiming that. Most volunteers upload a photograph and move on; they never see classifications revised or conclusions debated. What they learn is how to use the app, not how scientific uncertainty works.",
      },
      { speaker: "Woman", text: "So participation needs interpretation around it." },
      {
        speaker: "Man",
        text: "Recruitment is another weakness. Put an invitation on a conservation website or circulate it through nature groups, and you mostly reach people who already watch birds, identify plants or worry about habitat loss. The database grows, but the community involved may remain narrow.",
      },
      {
        speaker: "Woman",
        text: "Some projects escape that. Air-quality studies have attracted parents concerned about school streets, delivery riders and people who had never joined an environmental organisation. Their starting point was a practical problem, not an existing enthusiasm for science.",
      },
      {
        speaker: "Man",
        text: "Reaching them usually requires partnerships outside the usual scientific networks.",
      },
      {
        speaker: "Woman",
        text: "So citizen science can expand research, but only when projects think as carefully about participation as they do about data.",
      },
      {
        speaker: "Man",
        text: "And when volunteers are treated as contributors rather than convenient measuring devices.",
      },
      { speaker: "Woman", text: "Dr Owen Marsh, thank you for joining me." },
      { speaker: "Man", text: "A pleasure." },
    ],
  },
  {
    id: "subscription-services",
    level: "C1",
    title: "Subscription services",
    description:
      "Match six opinions from an extended discussion to the woman, the man, or both speakers.",
    teacherOnly: true,
    assetsReady: true,
    audioReady: true,
    audioSrc: `${subscriptionServicesAudioRoot}/subscription-services.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${subscriptionServicesAudioRoot}/question.mp3`,
    instructions:
      "Listen to a consumer journalist and a consumer researcher discussing subscription services. Match the people—the woman, the man, or both—to the opinions below.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    speakers: [
      { id: "woman", label: "Woman", name: "Dr Hannah Price" },
      { id: "man", label: "Man", name: "Ben Mercer" },
      { id: "both", label: "Both", name: "Both speakers" },
    ],
    opinions: [
      {
        id: "hidden-total",
        text: "Regular small payments can make total spending difficult to judge.",
        answer: "both",
        review: {
          explanation:
            "Both speakers explain that individually manageable charges can hide the size of the combined commitment. The woman describes the general effect; the man confirms it through his own spending.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote: "the overall commitment slips out of view",
              note:
                "The woman explains why separate, manageable payments make the total harder to see.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote:
                "I wouldn’t have agreed to the combined figure quite so readily if it had appeared as one bill.",
              note:
                "The man independently says that seeing the payments as one total would have changed his judgement.",
            },
          ],
        },
      },
      {
        id: "infrequent-value",
        text: "Limited use does not necessarily mean a subscription offers poor value.",
        answer: "woman",
        review: {
          explanation:
            "The woman argues that occasional access can still be valuable when it solves an important problem. The man keeps regular use as his test and prefers paying only when the need arises.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "If it saves you hours on those occasions, its availability may justify the fee.",
              note:
                "Her example shows how infrequent use can still provide enough value to justify a subscription.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I’d still want it earning its keep regularly.",
              note:
                "The man maintains the opposite criterion: he expects value to be demonstrated through regular use.",
            },
          ],
        },
      },
      {
        id: "bundle-discovery",
        text: "Bundles can expose subscribers to options they would not otherwise consider.",
        answer: "man",
        review: {
          explanation:
            "The man says a reading bundle led him to try unfamiliar magazines that became favourites. The woman first describes unchanged habits and then questions how typical his experience is.",
          evidence: [
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "People may end up opening the same two publications they would have paid for separately.",
              note:
                "The woman presents a competing outcome in which the bundle does not broaden anybody’s choices.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "A reading package included magazines I’d never have sought out.",
              note:
                "The man directly describes discovering options he would not otherwise have considered.",
            },
          ],
        },
      },
      {
        id: "easy-cancellation",
        text: "Easy cancellation can make people more willing to try a subscription.",
        answer: "both",
        review: {
          explanation:
            "The woman argues that a straightforward exit lowers the perceived commitment. The man then describes choosing a service partly because he could cancel it online.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "knowing you can walk away without a tussle can make the initial commitment feel much smaller.",
              note:
                "The woman directly links easy cancellation with greater willingness to sign up.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote:
                "A competing service let me leave through my account page. I went with that one, even though I wasn’t sure I’d keep it.",
              note:
                "The man’s choice supplies a separate example of an easy exit encouraging a trial.",
            },
          ],
        },
      },
      {
        id: "price-return-warning",
        text: "Providers should warn customers before discounted subscriptions return to the full price.",
        answer: "woman",
        review: {
          explanation:
            "The woman specifically calls for a timely reminder when an introductory offer ends. The man thinks clear price and date information at sign-up is sufficient.",
          evidence: [
            {
              speaker: "Man",
              type: "distractor",
              quote:
                "If the introductory price, the later rate and the dates are clearly explained when I join, I reckon I’ve been given what I need.",
              note:
                "The man rejects the need for a fresh warning when the information was provided at the start.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "It’s the jump from an introductory offer to the standard rate that merits another message.",
              note:
                "The woman identifies the return to the full price as the point that requires a new warning.",
            },
          ],
        },
      },
      {
        id: "aspirational-subscription",
        text:
          "People sometimes keep subscriptions because cancelling would mean giving up on a personal ambition.",
        answer: "man",
        review: {
          explanation:
            "The man links his unused language-learning subscription with reluctance to abandon an imagined future self. The woman treats that explanation cautiously and offers more ordinary alternatives.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "Cancelling would have felt like admitting that the fluent version of me wasn’t going to materialise.",
              note:
                "The man explicitly connects keeping the subscription with preserving a personal ambition.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "I’d want to separate that from the more mundane explanations: forgetting an account exists, or postponing an administrative chore.",
              note:
                "The woman questions whether the ambition is what actually kept the payment going.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Man",
        text: "Welcome to Everyday Economics. I’m Ben Mercer, and today we’re discussing subscriptions, from streaming services to software and monthly deliveries. My guest is consumer researcher Dr Hannah Price. Hannah, I added up my subscriptions last week. Each looked harmless enough; together, they were rather less comforting.",
      },
      {
        speaker: "Woman",
        text: "That’s part of their appeal, isn’t it? You’re judging a manageable amount each time, while the overall commitment slips out of view. And when some payments are monthly and others annual, comparing them requires a bit of detective work.",
      },
      {
        speaker: "Man",
        text: "Exactly. I’d budgeted for the obvious ones, but several smaller charges had somehow become part of the scenery. I wouldn’t have agreed to the combined figure quite so readily if it had appeared as one bill.",
      },
      {
        speaker: "Woman",
        text: "Though seeing the total doesn’t settle whether it’s money well spent.",
      },
      {
        speaker: "Man",
        text: "Surely checking how often you use each service gets you most of the way there? If I barely open an app, it’s first on my cancellation list.",
      },
      {
        speaker: "Woman",
        text: "I’d hesitate over that rule. Take a specialist reference service you consult only when an awkward problem arises. If it saves you hours on those occasions, its availability may justify the fee. Frequency tells you something, but it doesn’t capture what having access is worth.",
      },
      {
        speaker: "Man",
        text: "I’d still want it earning its keep regularly. Otherwise, paying only when the need arises seems more sensible to me. What about bundles? People often dismiss them as a way of charging us for extras we don’t want.",
      },
      {
        speaker: "Woman",
        text: "They can simplify things, but a longer menu doesn’t necessarily change anybody’s habits. People may end up opening the same two publications they would have paid for separately.",
      },
      {
        speaker: "Man",
        text: "Mine actually changed. A reading package included magazines I’d never have sought out. Since there was no separate purchase to justify, I gave them a chance. A couple became favourites. The package made acting on a passing curiosity feel less of a gamble.",
      },
      {
        speaker: "Woman",
        text: "I’d be interested to see how typical that is. Another gamble is signing up in the first place. Providers sometimes seem to think making the exit difficult protects their income. Yet knowing you can walk away without a tussle can make the initial commitment feel much smaller.",
      },
      {
        speaker: "Man",
        text: "That rings true. I nearly abandoned a software subscription because ending it required a phone call during office hours. A competing service let me leave through my account page. I went with that one, even though I wasn’t sure I’d keep it.",
      },
      { speaker: "Woman", text: "So the exit helped sell the entrance." },
      {
        speaker: "Man",
        text: "Nicely put. Renewal reminders are another contentious area. I hear demands for messages before every payment. If the introductory price, the later rate and the dates are clearly explained when I join, I reckon I’ve been given what I need. Endless notifications would soon become wallpaper.",
      },
      {
        speaker: "Woman",
        text: "I’m less concerned about an ordinary monthly payment. It’s the jump from an introductory offer to the standard rate that merits another message. Giving the information months earlier isn’t enough. People should have a timely opportunity to reconsider what they’re paying.",
      },
      {
        speaker: "Man",
        text: "Although sometimes they know perfectly well and carry on anyway. I’ve kept a language-learning subscription through months when I did almost nothing with it. Cancelling would have felt like admitting that the fluent version of me wasn’t going to materialise. I suspect plenty of subscriptions survive because we’re reluctant to close the door on who we’d like to become.",
      },
      {
        speaker: "Woman",
        text: "I’d want to separate that from the more mundane explanations: forgetting an account exists, or postponing an administrative chore. A subscription can sit there for months without anybody making an active decision to keep it. An interview can produce a satisfying story about somebody’s aspirations; establishing what actually kept the payment going is harder.",
      },
      { speaker: "Man", text: "Fair challenge. So it’s worth examining the decision as well as the debit. Hannah, thanks for joining me." },
      { speaker: "Woman", text: "Thank you." },
    ],
  },
  {
    id: "analogue-media",
    level: "C1",
    title: "The appeal of analogue media",
    description:
      "Match six opinions from an extended discussion to the woman, the man, or both speakers.",
    teacherOnly: true,
    assetsReady: true,
    audioReady: true,
    audioSrc: `${analogueMediaAudioRoot}/analogue-media.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${analogueMediaAudioRoot}/question.mp3`,
    instructions:
      "Listen to a technology journalist and a cultural sociologist discussing vinyl records and film photography. Match the people—the woman, the man, or both—to the opinions below.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    speakers: [
      { id: "woman", label: "Woman", name: "Dr Leila Morgan" },
      { id: "man", label: "Man", name: "Oliver Grant" },
      { id: "both", label: "Both", name: "Both speakers" },
    ],
    opinions: [
      {
        id: "control-over-nostalgia",
        text: "The appeal of analogue media owes more to control than to nostalgia.",
        answer: "woman",
        review: {
          explanation:
            "The woman accepts that nostalgia can contribute, but explicitly ranks control over the process as the more convincing explanation. The man gives nostalgia greater importance.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "That’s a more convincing explanation to me than wanting to recreate the past.",
              note:
                "The woman directly places control over the experience above nostalgia.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote: "I’d give nostalgia more weight.",
              note:
                "The man states the opposite ranking, even for people who did not experience the original era.",
            },
          ],
        },
      },
      {
        id: "physical-significance",
        text:
          "Physical copies can make music or photographs feel more personally significant.",
        answer: "both",
        review: {
          explanation:
            "The man describes the personal meaning attached to an inscribed record, while the woman explains how a printed photograph can become part of a relationship.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "I have a record a friend gave me, with a message inside the sleeve. Playing the same album online wouldn’t carry quite the same significance.",
              note:
                "The physical record carries a personal association that the digital version would not reproduce.",
            },
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "The object becomes part of the relationship, not merely a container for the image.",
              note:
                "The woman independently links a physical photograph with greater personal meaning.",
            },
          ],
        },
      },
      {
        id: "analogue-limits",
        text:
          "The limitations of analogue equipment can encourage more careful creative choices.",
        answer: "man",
        review: {
          explanation:
            "The man says a limited number of film exposures made him consider light and framing more carefully. The woman distinguishes this from merely becoming cautious about wasting a shot.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "Having less room for manoeuvre made those choices more considered.",
              note:
                "The man attributes more deliberate creative decisions to the restriction itself.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "With film, worrying about wasting a shot can simply make someone cautious. That’s different from developing an eye.",
              note:
                "The woman rejects the idea that the limitation necessarily improves creative judgement.",
            },
          ],
        },
      },
      {
        id: "imperfection-quality",
        text:
          "Technical imperfections can be mistaken for evidence of artistic quality.",
        answer: "man",
        review: {
          explanation:
            "The man criticises treating blur or surface noise as automatic proof of merit. The woman argues that imperfections can add character and questions whether audiences are making that confusion.",
          evidence: [
            {
              speaker: "Man",
              type: "correct",
              quote:
                "A technical flaw seems to become a certificate of merit before anyone considers the work itself.",
              note:
                "The man directly argues that the format’s imperfections can be mistaken for artistic value.",
            },
            {
              speaker: "Woman",
              type: "distractor",
              quote:
                "The experience includes those qualities; people aren’t necessarily confusing them with anything.",
              note:
                "The woman defends the appeal of imperfection and disputes the man’s interpretation.",
            },
          ],
        },
      },
      {
        id: "online-communities",
        text:
          "Online communities can help people maintain an interest in analogue activities.",
        answer: "woman",
        review: {
          explanation:
            "The woman says practical advice and creative challenges sustain participation after the novelty fades. The man thinks online display and equipment talk can displace the activity itself.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "The conversation keeps the activity moving once the novelty has worn off.",
              note:
                "The woman directly links online communities with sustained engagement.",
            },
            {
              speaker: "Man",
              type: "distractor",
              quote:
                "The online activity can start replacing the hobby it’s supposedly supporting.",
              note:
                "The man describes online participation as a possible substitute for, rather than support for, the hobby.",
            },
          ],
        },
      },
      {
        id: "supplement-digital",
        text:
          "Analogue media will generally supplement digital formats rather than replace them.",
        answer: "both",
        review: {
          explanation:
            "Both speakers predict selective analogue use alongside everyday digital formats. The woman uses occasional film projects; the man contrasts special vinyl listening with portable digital music.",
          evidence: [
            {
              speaker: "Woman",
              type: "correct",
              quote:
                "I expect these formats to find a lasting place alongside digital ones.",
              note:
                "The woman explicitly predicts coexistence rather than replacement.",
            },
            {
              speaker: "Man",
              type: "correct",
              quote: "I’d envisage the same sort of arrangement.",
              note:
                "The man explicitly shares her view before contrasting special analogue occasions with digital routines.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Man",
        text: "Welcome to Everyday Futures. I’m Oliver Grant. Today we’re looking at vinyl records and film cameras: technologies people choose despite having convenient digital alternatives. With me is cultural sociologist Dr Leila Morgan. Leila, is this essentially nostalgia, even for people too young to remember these formats being normal?",
      },
      {
        speaker: "Woman",
        text: "There can be nostalgia involved, but I wouldn’t put it at the centre. What attracts people is having a process they can take charge of: choosing a record, turning it over, deciding when to take a photograph. The inconvenience becomes a way of setting the terms of the experience. That’s a more convincing explanation to me than wanting to recreate the past.",
      },
      {
        speaker: "Man",
        text: "I’d give nostalgia more weight. You don’t need to have lived through an era to romanticise it. A film camera can represent an imagined world that felt less hurried, whether that world ever existed or not. Though sometimes the attachment is quite specific. I have a record a friend gave me, with a message inside the sleeve. Playing the same album online wouldn’t carry quite the same significance.",
      },
      {
        speaker: "Woman",
        text: "A printed photograph can acquire that extra weight too. One image on your desk gets associated with a particular person or occasion in a way that a file among thousands may never do. The object becomes part of the relationship, not merely a container for the image.",
      },
      {
        speaker: "Man",
        text: "And with photography, having a limited number of exposures can change what happens before the image exists. When I tried film, I stopped firing away at everything. I started thinking about the light and the framing before pressing the button. Having less room for manoeuvre made those choices more considered.",
      },
      {
        speaker: "Woman",
        text: "I wouldn’t credit the restriction with that. Being able to review a digital image immediately can make the next decision more informed. With film, worrying about wasting a shot can simply make someone cautious. That’s different from developing an eye.",
      },
      {
        speaker: "Man",
        text: "Fair distinction. Deliberate choices don’t guarantee a good result either. What bothers me is seeing a blurred image described as artistic simply because it came from film. Or hearing surface noise taken as evidence that a recording has soul. A technical flaw seems to become a certificate of merit before anyone considers the work itself.",
      },
      {
        speaker: "Woman",
        text: "I’d be slower to dismiss those reactions. Something uneven or imperfect can give a photograph a character that a cleaner version lacks. The experience includes those qualities; people aren’t necessarily confusing them with anything.",
      },
      {
        speaker: "Man",
        text: "I still think the format gets too much credit in some of those judgements.",
      },
      {
        speaker: "Woman",
        text: "There’s a similar argument about people showing their collections online: that it’s all display and little actual engagement. Yet the groups I follow give people practical reasons to carry on. Someone explains a developing problem, or sets a monthly photography challenge. The conversation keeps the activity moving once the novelty has worn off.",
      },
      {
        speaker: "Man",
        text: "I’m not sure that describes much of what I see. People spend hours arranging records for photographs and discussing equipment, while actually listening or taking pictures seems to become an afterthought. The online activity can start replacing the hobby it’s supposedly supporting.",
      },
      {
        speaker: "Woman",
        text: "In those cases, perhaps. But when someone posts the results of a challenge, there has been an activity beyond arranging a collection. And getting advice after a disappointing first attempt can be what brings them back for a second. That matters more than whether their enthusiasm began with an attractive picture online.",
      },
      { speaker: "Man", text: "Where does that leave the longer-term future?" },
      {
        speaker: "Woman",
        text: "I expect these formats to find a lasting place alongside digital ones. People may choose film for a particular project without wanting it for every ordinary photograph. That selectiveness isn’t a sign that the interest has failed.",
      },
      {
        speaker: "Man",
        text: "I’d envisage the same sort of arrangement. Taking music everywhere on a phone will still make sense for someone who treasures an evening with a record. The special occasion can flourish while the everyday routine remains digital. Leila, thank you.",
      },
      { speaker: "Woman", text: "Thank you." },
    ],
  },
];

export function getAdvancedListeningPart3Set(setId) {
  return (
    advancedListeningPart3Sets.find((set) => set.id === setId) ||
    advancedListeningPart3Sets[0]
  );
}
