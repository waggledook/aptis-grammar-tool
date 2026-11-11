export const LISTENING_STRATEGY_GAME_TYPE = "ote-listening-part2-strategy";
export const LISTENING_STRATEGY_TITLE = "Finding the right detail";
export const LISTENING_STRATEGY_PATH = "/listening/advanced/part-2-note-completion/strategy-lesson";
export const LISTENING_STRATEGY_AUDIO_ROOT = "/audio/ote/listening/advanced/part-2/strategy";

// These are teaching extracts, not calibrated C1 items. Keep this bank as the
// single source for the lesson, live rooms and generated recording documents.
export const listeningStrategyExtracts = [
  {
    id: "extract-01", number: 1, title: "Designing public seating", stage: "Start here",
    audioReady: true,
    focus: "Identify the information category", guided: true,
    prompt: "What kind of material could complete the note? Predict a category, not a word.",
    script: "When we design a new bench, our first concern is how it fits the space around it. A drawing can make a seat look comfortable without showing how much room someone's legs will need. So we start with small models, using cardboard because it is easy to cut and fold. These early versions let us change the angle of a backrest or the distance between seats before anyone invests time in a full-size version.",
    discussion: "Which words helped you know what to listen for? A clear match does not need a contrast word or a distractor.",
    gaps: [{ id: "gap-1", number: 1, before: "The designers use", after: "to make their first small models of the benches.", answer: "cardboard", prediction: "A material; an uncountable material noun can fit here.", evidence: ["small models, using cardboard"], explanation: "The note asks what the models are made from. The phrase supplies a straightforward material detail.", competing: "There is no deliberate competing material in this extract." }],
  },
  {
    id: "extract-02", number: 2, title: "Organising volunteers", stage: "Start here",
    audioReady: true,
    focus: "Match a paraphrased purpose", guided: true,
    prompt: "What unwanted situation does the calendar help prevent?",
    script: "A volunteer group can look extremely busy without making the best use of its time. In one neighbourhood project, two people independently contacted the same supplier, while another pair each prepared a list of venues. Nobody was being careless; they simply couldn't see what the others had already done. The shared calendar was introduced to prevent this duplication. Volunteers still choose their own working hours, but they can now see which jobs somebody else has taken on.",
    discussion: "Did you understand the examples before recognising the noun? If so, replay the answer-bearing clause as a short dictation after feedback.",
    gaps: [{ id: "gap-2", number: 2, before: "The shared calendar helps the volunteers avoid", after: ".", answer: "duplication", prediction: "An unwanted situation or problem. 'Avoid' does not by itself tell you whether the noun is uncountable or plural.", evidence: ["prevent this duplication"], explanation: "'Prevent' matches 'avoid'. The repeated calls and lists explain duplication, but the response uses the noun heard in the recording.", competing: "The calendar makes completed work visible; it does not remove volunteers' freedom to choose their hours." }],
  },
  {
    id: "extract-03", number: 3, title: "Access to museum tours", stage: "Start here",
    audioReady: true,
    focus: "Capture the complete phrase", guided: true,
    prompt: "Read the complete note. What form of communication could a live tour be delivered in?",
    script: "Making a museum accessible involves more than providing written information beside the objects. Written information gives visitors considerable freedom, but it doesn't let them question a guide or follow a conversation as it develops. The museum has therefore introduced tours in sign language, led by a guide who uses it throughout. Participants can ask questions directly and respond to one another, rather than having to rely on a written summary of what the group has discussed.",
    discussion: "What information is lost if you write only 'sign' or only 'language'? Both words are needed here; other answers may need just one.",
    gaps: [{ id: "gap-3", number: 3, before: "Visitors can now join a live tour delivered in", after: ".", answer: "sign language", prediction: "A language or form of communication. The complete note establishes this category, not the preposition alone.", evidence: ["tours in sign language"], explanation: "Both words identify the communication used. The opportunity to ask questions distinguishes the tour from written information.", competing: "Written information and written summaries do not provide the live interaction described." }],
  },
  {
    id: "extract-04", number: 4, title: "Participation in evening classes", stage: "Follow the relationship",
    audioReady: true,
    focus: "Separate current and earlier findings", guided: true,
    prompt: "Which words in the note tell you exactly which finding is needed?",
    script: "When the college first investigated low enrolment in evening classes, transport dominated the responses. Several bus routes finished before the classes did, so the timetable was changed. In this year's survey, most prospective students said the journey would now be manageable. Childcare was another matter: even with an earlier finish, they couldn't find anyone to stay with their children. A further timetable adjustment would do little to help, so the college is considering what support it could offer.",
    discussion: "Why was transport plausible? Explain what changed and which finding the note asks for.",
    gaps: [{ id: "gap-4", number: 4, before: "The main obstacle reported by prospective students this year was", after: ".", answer: "childcare", acceptedAnswers: ["child care"], precision: "The two-word spelling 'child care' is also accepted for this classroom activity.", prediction: "A barrier to participation. 'This year' limits the answer; it does not predict number or word count.", evidence: ["In this year's survey", "Childcare was another matter"], explanation: "The journey is now manageable. Finding someone to stay with the children remains a problem, so childcare is the current obstacle.", competing: "Transport dominated the earlier responses, before the timetable changed." }],
  },
  {
    id: "extract-05", number: 5, title: "Improving a study centre", stage: "Follow the relationship",
    audioReady: true,
    focus: "Connect a request to the right group", guided: true,
    prompt: "Whose request matters here? Predict the kind of resource, without guessing its name.",
    script: "The study centre's consultation produced quite different requests from its users. Discussion groups wanted more chairs so they could sit in larger circles. For those working independently, extra power sockets came first: finding somewhere to connect a laptop mattered more than changing the furniture. Tutors who booked the seminar room were mainly interested in better lighting. The centre couldn't fund every request immediately, so its managers had to decide how to balance these different priorities.",
    discussion: "Connect each request to its users. A competing detail can be true and useful while answering a different question.",
    gaps: [{ id: "gap-5", number: 5, before: "People studying on their own gave the highest priority to additional", after: ".", answer: "power sockets", acceptedAnswers: ["sockets"], precision: "'Sockets' is accepted for this classroom activity because it retains the relevant meaning. 'Power sockets' is the preferred complete phrase.", prediction: "A resource or facility. 'Additional' alone does not force a plural noun.", evidence: ["For those working independently, extra power sockets came first"], explanation: "'Working independently' matches 'studying on their own'; 'came first' matches 'gave the highest priority'.", competing: "Chairs were requested by discussion groups; lighting was requested by tutors using the seminar room." }],
  },
  {
    id: "extract-06", number: 6, title: "A neighbourhood equipment scheme", stage: "Follow the relationship",
    audioReady: true,
    focus: "Keep an early answer in mind", guided: true,
    prompt: "What does 'established primarily' tell you to distinguish?",
    script: "Storage was the issue that kept coming up at the residents' meetings. People were happy to buy equipment they used only occasionally, but had nowhere to put it between uses. That's why the neighbourhood set up a central collection of tools that members could borrow and return. Membership also reduced the cost of doing small jobs. Those savings have since featured in publicity for the scheme, alongside stories of neighbours helping one another with repairs.",
    discussion: "Which detail explains the original decision, and which details describe benefits noticed afterwards? The answer need not be the last relevant noun.",
    gaps: [{ id: "gap-6", number: 6, before: "The scheme was established primarily to address residents' lack of", after: ".", answer: "storage", prediction: "Something residents lack. The original reason matters more than later benefits.", evidence: ["Storage was the issue", "had nowhere to put it between uses. That's why"], explanation: "The opening noun is explained before 'That's why' connects it to establishing the collection.", competing: "Lower costs and neighbours helping with repairs are benefits described after the collection was set up." }],
  },
  {
    id: "extract-07", number: 7, title: "Planning sheltered seating", stage: "Apply independently",
    audioReady: true,
    audioRevision: "2",
    focus: "Follow two planning decisions", guided: false,
    prompt: "Read both notes and keep following the recording if one answer is uncertain.",
    script: "The first sketches placed the covered seating in a line with the square's main path. Field notes on wind direction revealed a problem with that arrangement: cold gusts would enter through the openings and pass straight across the seats. Turning the shelters offered better protection without requiring a larger roof. Pedestrian counts were useful when deciding how many seats to provide. Businesses then examined the proposed layout. Deliveries could still reach the rear service road, but two shelters stood directly in front of shop entrances. Those were moved before the plan was approved.",
    discussion: "Explain how the field notes, cold gusts and turning the shelters connect to their orientation. Then explain what 'Those' refers to in the final sentence.",
    gaps: [
      { id: "gap-7", number: 7, before: "The designers recorded", after: "to decide the shelters' orientation.", answer: "wind direction", prediction: "Information used to decide which way the shelters face.", evidence: ["Field notes on wind direction", "cold gusts would enter through the openings and pass straight across the seats", "Turning the shelters offered better protection"], explanation: "The field notes contain the recorded information. Cold gusts exposed a problem with the proposed arrangement, and turning the shelters addressed it. Connecting these ideas explains how wind direction informed the shelters' orientation.", competing: "Pedestrian counts informed how many seats to provide. The larger roof is a design change that turning the shelters made unnecessary." },
      { id: "gap-8", number: 8, before: "The final layout was adjusted to keep", after: "accessible.", answer: "shop entrances", prediction: "Access points that the proposed layout would block.", evidence: ["two shelters stood directly in front of shop entrances", "Those were moved before the plan was approved"], explanation: "The shelters blocking the entrances were moved. The note expresses the result of this change as keeping the entrances accessible.", competing: "The rear service road was already accessible to deliveries; it did not require the adjustment." },
    ],
  },
  {
    id: "extract-08", number: 8, title: "Researching a night bus service", stage: "Apply independently",
    audioReady: true,
    focus: "Track a group and a research method", guided: false,
    prompt: "Read both notes. Use the second listen to check specific uncertainty.",
    script: "For the night bus study, we first considered hotel staff, whose employers generally arranged transport once regular services stopped. Hospital staff were more dependent on lifts from relatives or expensive taxis. It was their journeys home that we followed over the next month. Passenger counts would tell us how many people might use a new route, but not why existing options failed them. We used interviews, allowing participants to describe a journey and us to pursue unexpected points. A fixed questionnaire would have left little room for that.",
    discussion: "What does 'their' refer to? Which feature of the research method explains the choice? If the first answer was uncertain, did you still attend to the second?",
    gaps: [
      { id: "gap-9", number: 9, before: "The research focused particularly on the travel needs of", after: ".", answer: "hospital staff", prediction: "A group of travellers. Do not guess an occupation in advance.", evidence: ["Hospital staff were more dependent on lifts from relatives or expensive taxis", "It was their journeys home that we followed"], explanation: "'Their journeys' refers to hospital staff. Following those journeys establishes which group was studied in detail.", competing: "Hotel staff were considered, but their employers generally arranged transport. 'Staff' alone cannot distinguish the groups." },
      { id: "gap-10", number: 10, before: "The researchers chose", after: "so they could explore issues raised by participants.", answer: "interviews", prediction: "A method that allows researchers to follow up on what a participant says.", evidence: ["We used interviews", "us to pursue unexpected points"], explanation: "Exploring issues raised by participants paraphrases pursuing unexpected points during the interviews.", competing: "Passenger counts give numbers. A fixed questionnaire does not offer the same scope for follow-up questions." },
    ],
  },
].map((extract) => ({ audioReady: false, ...extract, audioSrc: `${LISTENING_STRATEGY_AUDIO_ROOT}/${extract.id}.mp3${extract.audioRevision ? `?v=${extract.audioRevision}` : ""}` }));

export const listeningStrategyRoutes = [
  { id: "quick", title: "Quick focus", time: "8–12 min", description: "One model, a competing detail and an independent finish.", extractIds: ["extract-01", "extract-04", "extract-08"] },
  { id: "core", title: "Core lesson", time: "15–20 min", description: "Build from prediction and complete phrases to two ordered gaps.", extractIds: ["extract-01", "extract-03", "extract-04", "extract-05", "extract-08"] },
  { id: "complete", title: "Complete activity", time: "20–30 min", description: "All eight extracts, with discussion and transcript work as needed.", extractIds: listeningStrategyExtracts.map((extract) => extract.id) },
];

export const listeningStrategyFollowUps = [
  { difficulty: "I misunderstood the note", action: "Underline the words limiting time, group, purpose or relationship. Explain the question in simpler language." },
  { difficulty: "I understood the idea but missed the spoken phrase", action: "Replay the answer-bearing clause, do a short dictation, then compare with the script." },
  { difficulty: "I chose the wrong group, time or purpose", action: "Label the relationship attached to each candidate in the script." },
  { difficulty: "I heard only part of the answer", action: "Replay the phrase in its clause and explain what the omitted word contributes." },
  { difficulty: "I missed the next gap", action: "Practise shifting attention once you have entered a provisional answer." },
  { difficulty: "I heard the answer but wrote it inaccurately", action: "Check spelling, plural endings and the fit of the completed note." },
];

export function getListeningStrategyExtract(id) {
  return listeningStrategyExtracts.find((extract) => extract.id === id) || null;
}

export function selectListeningStrategyExtracts(ids) {
  const wanted = new Set(Array.isArray(ids) ? ids : []);
  return listeningStrategyExtracts.filter((extract) => wanted.has(extract.id));
}

export function listeningStrategyRecordingText() {
  return listeningStrategyExtracts.map((extract) => `${extract.id}.mp3 — ${extract.title}\n\n${extract.script}`).join("\n\n---\n\n") + "\n";
}
