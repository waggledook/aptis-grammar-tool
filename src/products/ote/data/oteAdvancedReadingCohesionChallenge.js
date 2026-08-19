export const COHESION_CHALLENGE_GAME_TYPE = "ote_advanced_reading_cohesion_challenge";
export const COHESION_CHALLENGE_TASK_ID = "classroom-cohesion-challenge-1";

export const cohesionChallengeCases = [
  {
    id: "brightness",
    title: "More than brightness",
    before: [
      "Cities replacing old sodium street lamps with LEDs initially focused on the potential energy savings. The new lights were also popular with residents in some areas because streets appeared brighter and colours were easier to distinguish at night.",
    ],
    after: [
      "This distinction has become increasingly important to ecologists. Many insects are particularly sensitive to blue-rich light, meaning that two lamps producing similar levels of illumination may have very different effects on nocturnal behaviour.",
    ],
    options: {
      A: "Some councils have therefore reduced the number of hours for which street lighting remains switched on.",
      B: "The problem, researchers argue, is not simply how much light a lamp produces, but which wavelengths make up that light.",
      C: "Modern LEDs also tend to last considerably longer than the lamps they were designed to replace.",
    },
    answer: "B",
    clueChoices: [
      { id: "1", text: "The paragraph stays on the general topic of LEDs and street lighting." },
      { id: "2", text: "“This distinction” requires the gap to contrast two different features of light." },
      { id: "3", text: "The opening mentions that residents experienced the streets as brighter." },
    ],
    clueAnswer: "2",
    evidence: "“This distinction” requires a contrast between the amount of light and the wavelengths making it up.",
    explanation: "B establishes the exact distinction illustrated next: two equally bright lamps can have different ecological effects because their wavelengths differ.",
    why: {
      A: "It gives a plausible response to light pollution, but it establishes no distinction for “This distinction” to refer to.",
      C: "It continues the LED topic, but lamp longevity has nothing to do with the ecological distinction developed afterwards.",
    },
    clue: "Forward reference",
  },
  {
    id: "categories",
    title: "Categories under pressure",
    before: [
      "Early studies using chemical analysis of human remains sometimes compared the average dietary signatures found in different medieval burial grounds. Researchers then attempted to link these differences to broad categories such as wealth or social status.",
      "More recent studies, however, have revealed considerable variation between individuals buried in the same place.",
    ],
    after: [
      "Once factors such as age, migration history and changes in diet over a lifetime were taken into account, many apparently straightforward differences between social groups became much harder to sustain. The development has not made chemical analysis less useful; it has made simple interpretations of its results more difficult to defend.",
    ],
    options: {
      A: "Some medieval cemeteries nevertheless contain too few surviving remains for reliable chemical analysis to be carried out.",
      B: "The technique has consequently become one of the principal alternatives to written historical evidence.",
      C: "This led researchers to question whether the categories used to organise the evidence were concealing as much variation as they revealed.",
    },
    answer: "C",
    clueChoices: [
      { id: "1", text: "The paragraph moves from variation within groups to doubt about simple group-level conclusions." },
      { id: "2", text: "The topic is a scientific technique that can supplement other historical evidence." },
      { id: "3", text: "Some research evidence may be too limited to support reliable analysis." },
    ],
    clueAnswer: "1",
    evidence: "Variation within the groups leads into the later finding that individual factors weaken simple group-level conclusions.",
    explanation: "C extracts the consequence of the new variation: the categories themselves may conceal important individual differences.",
    why: {
      A: "It introduces a sample-size problem, while the paragraph continues with a problem of interpretation and categorisation.",
      B: "Its direction is wrong: the paragraph becomes more cautious about simple conclusions rather than claiming the technique has superseded other evidence.",
    },
    clue: "Paragraph direction",
  },
  {
    id: "restoration",
    title: "Interpretation without alteration",
    before: [
      "Digital technology has allowed galleries to experiment with reconstructions of damaged artworks without altering the original object. In one recent project, a projection recreated areas of colour that had disappeared from a large painted interior.",
      "Critics argued that some of the reconstructed details inevitably involved interpretation rather than certainty.",
    ],
    after: [
      "That status matters because future evidence may support a different interpretation, while the surviving historical surface remains available for re-examination.",
    ],
    options: {
      A: "Supporters responded that the projection should be understood as a reversible proposal rather than a permanent correction of the work.",
      B: "The team nevertheless based each reconstructed section on pigment analysis and contemporary descriptions.",
      C: "The projection also allowed visitors to compare reconstructed areas with sections where the original colour remained visible.",
    },
    answer: "A",
    clueChoices: [
      { id: "1", text: "The criticism invites a defence of the evidence used in the reconstruction." },
      { id: "2", text: "The final sentence needs the gap to define the reconstruction’s provisional, reversible status." },
      { id: "3", text: "The wider paragraph concerns what digital projections let gallery visitors see." },
    ],
    clueAnswer: "2",
    evidence: "“That status” needs an account of what status the reconstruction has; A defines it as a reversible proposal rather than a permanent correction.",
    explanation: "A accepts that the reconstruction is interpretative, then explains why that uncertainty is less problematic when the intervention is provisional and reversible.",
    why: {
      B: "It sensibly defends the evidence behind the interpretation, but it does not establish the reconstruction’s provisional status.",
      C: "It gives a legitimate scholarly advantage, but comparison with surviving colour does not supply the status developed in the final sentence.",
    },
    clue: "Reference plus argumentative response",
  },
  {
    id: "fairness",
    title: "Fair results, questionable route",
    before: [
      "A company testing an automated recruitment system reported that applicants from different demographic groups were being selected at broadly similar rates. On that measure, the system appeared to perform fairly.",
      "A later audit nevertheless found that some of the variables influencing its decisions acted as indirect substitutes for information the company had deliberately excluded, such as neighbourhood and educational background.",
    ],
    after: [
      "A system can therefore produce apparently balanced overall results while still relying on questionable pathways to reach them. The auditors consequently recommended examining not only who receives a positive decision, but also which factors contribute to it.",
    ],
    options: {
      A: "Removing these variables subsequently produced almost identical decisions for every applicant.",
      B: "The finding shifted the question from whether the final numbers looked fair to how those numbers had been produced.",
      C: "Applicants were generally more willing to accept automated decisions when companies explained how the technology worked.",
    },
    answer: "B",
    clueChoices: [
      { id: "1", text: "The audit changes the focus from balanced outcomes to the process that produced them." },
      { id: "2", text: "Applicants may respond more positively when automated decisions are transparent." },
      { id: "3", text: "The excluded variables need to be removed before the system can be judged." },
    ],
    clueAnswer: "1",
    evidence: "The paragraph moves from equal selection outcomes to the questionable process that produced them.",
    explanation: "B explicitly names the conceptual shift from judging the final numbers to examining the pathway behind them.",
    why: {
      A: "It effectively resolves the identified problem, whereas the following sentence insists that the questionable process remains important.",
      C: "It moves to applicant attitudes and transparency instead of the two different ways of evaluating fairness.",
    },
    clue: "Conceptual bridge",
  },
  {
    id: "language-use",
    title: "Knowing is not using",
    before: [
      "A project designed to support a declining regional language initially concentrated on digital resources. A searchable dictionary, pronunciation recordings and a vocabulary app attracted thousands of users, including many younger people who had previously had little contact with the language.",
      "Teachers were encouraged by the interest but noticed a persistent problem: learners could often recognise recently studied words without using them spontaneously in conversation.",
    ],
    after: [
      "Six months later, the organisers introduced weekly conversation groups. These attracted fewer participants than the app, but regular attendees gradually began producing longer and less rehearsed exchanges.",
      "The experience persuaded the organisers to retain the digital resources while treating them as preparation for interaction rather than a substitute for it.",
    ],
    options: {
      A: "In other words, the project had improved access to the language without yet creating many opportunities to communicate through it.",
      B: "The developers therefore added more vocabulary categories and a system allowing users to record their own pronunciation.",
      C: "This was partly because many older fluent speakers were unfamiliar with smartphone technology.",
    },
    answer: "A",
    clueChoices: [
      { id: "1", text: "The app attracted younger users who previously had little contact with the language." },
      { id: "2", text: "The recognition-versus-production problem creates a need for opportunities to communicate." },
      { id: "3", text: "Digital resources could be expanded to cover more words and pronunciation practice." },
    ],
    clueAnswer: "2",
    evidence: "A compresses the recognition-versus-production problem and creates the rationale for the conversation groups that follow.",
    explanation: "The paragraph needs a diagnosis at the right level: access has improved, but opportunities for genuine communication are still missing.",
    why: {
      B: "It proposes more of the digital provision that has not solved spontaneous language use, and it does not prepare the move to interaction.",
      C: "Older speakers’ smartphone familiarity may matter generally, but it does not explain the learners’ recognition-versus-production problem.",
    },
    clue: "Problem–solution structure",
  },
  {
    id: "beavers",
    title: "How far does the evidence go?",
    before: [
      "The reintroduction of beavers to several upland river systems has attracted attention well beyond wildlife conservation. In some monitored areas, dams created by the animals slowed the movement of water through the landscape, and downstream flood peaks were lower after certain storms.",
      "Such findings have sometimes been presented publicly as evidence that beavers provide a form of natural flood defence. Researchers involved in the projects are more cautious. The size of the effect differs considerably between locations and appears to depend on factors including the shape of the catchment, existing land use and the intensity of rainfall.",
    ],
    after: [
      "That assessment is why research teams generally describe beavers as one possible component of catchment management rather than as a replacement for conventional flood protection.",
    ],
    options: {
      A: "Some teams have therefore begun monitoring how individual dams respond to storms of different intensities.",
      B: "Researchers have also pointed out that the new wetlands created by beavers may bring ecological benefits unrelated to flooding.",
      C: "Taken together, the findings suggest that beaver activity can reduce flood peaks in some circumstances, but not that the same effect should be expected everywhere.",
    },
    answer: "C",
    clueChoices: [
      { id: "1", text: "The final sentence requires a calibrated assessment that preserves both the positive evidence and its limits." },
      { id: "2", text: "The variation between locations creates a clear reason for researchers to collect more data." },
      { id: "3", text: "Beaver reintroduction has consequences beyond the management of floods." },
    ],
    clueAnswer: "1",
    evidence: "“That assessment” requires a judgement about how far the flood evidence goes; C combines the positive result with its limits.",
    explanation: "C synthesises both propositions already established: an effect exists, but it is variable and conditional rather than dependable everywhere.",
    why: {
      A: "It is a natural methodological response to the uncertainty, but it describes further research rather than assessing the strength of the flood-defence claim.",
      B: "It is relevant and academically plausible, but it changes to ecological benefits instead of assessing the flood-management evidence.",
    },
    clue: "Global argument and calibrated stance",
  },
];

export const cohesionChallengeTask = {
  id: COHESION_CHALLENGE_TASK_ID,
  title: "Classroom Cohesion Challenge",
  cases: cohesionChallengeCases,
};

export function getCohesionChallengeCase(caseId) {
  return cohesionChallengeCases.find((item) => item.id === caseId) || null;
}
