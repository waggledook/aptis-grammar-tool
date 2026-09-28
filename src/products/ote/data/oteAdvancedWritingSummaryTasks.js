const SUMMARY_SETUP =
  "You have been learning about an aspect of TOPIC for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.";

const SUMMARY_INSTRUCTIONS = [
  "Write one paragraph, combining information from the textbook extract and the lecture transcript to summarize the main ideas. Your summary should provide the reader with enough information to understand the main ideas from both texts.",
  "Write full sentences, using your own words where possible.",
  "Do NOT write more than 100 words.",
];

function createSummaryTask({ topic, ...task }) {
  return {
    type: "advancedSummary",
    typeLabel: "Summary",
    noun: "summary",
    timeSeconds: 20 * 60,
    minWords: 80,
    maxWords: 100,
    intro: "You have 20 minutes to write a summary. Write 80-100 words.",
    setup: SUMMARY_SETUP.replace("TOPIC", topic),
    instructions: SUMMARY_INSTRUCTIONS,
    instruction: "Write your summary.",
    ...task,
  };
}

const digitalArchives = createSummaryTask({
  id: "advanced-summary-digital-archives",
  title: "Advanced Summary Practice 3",
  topic: "information management",
  theme: "Information management",
  sources: [
    {
      title: "Textbook extract",
      text:
        "Digital preservation involves more than keeping a file on a computer. Files can be damaged without any obvious change to their names or appearance in a folder. Archives therefore keep copies in separate places and regularly compare each file with a recorded digital fingerprint, which reveals whether its contents have changed. These checks matter because a damaged version might otherwise be copied repeatedly until no sound version remains. Yet an intact file may still become impossible to use. It might depend on a program that is no longer available, or contain information in a format that newer software cannot interpret. Archivists may create a version in a more widely supported format while retaining the original. They record what conversion was carried out, since the new version may alter some features of the file. Long-term preservation consequently requires reliable storage and repeated decisions about whether files can still be opened and used.",
    },
    {
      title: "Lecture transcript",
      text:
        "‘Imagine a local archive receiving hundreds of digital photographs and short films from a community festival. It stores copies at two sites, and its routine checks reveal that one film has changed unexpectedly. Staff replace that damaged copy with an intact one. Several films were saved in a proprietary format that the archive's current software can barely open, so staff make viewable versions and keep the originals. But there's another problem. Some photographs have no dates or descriptions. The images still open, yet nobody can tell who appears in them or which part of the festival they show. Staff may need to ask the organisers while they still remember. So, to clarify, saving and opening the files are only two parts of preservation. The archive also needs records that help future visitors understand what they are looking at.’",
    },
  ],
  glossary: [
    { term: "fingerprint", definition: "here, a short digital value used to check whether a file has changed" },
    { term: "interpret", definition: "understand the meaning of something" },
    { term: "proprietary", definition: "owned or controlled by a particular company" },
    { term: "conversion", definition: "changing something from one form to another" },
  ],
  markingGuide: {
    overarchingIdea:
      "A digital collection remains useful only if its files survive unchanged, can still be accessed, and retain enough context to be understood.",
    mainIdeas: [
      {
        id: "idea-1",
        idea: "Archives must protect files against loss or unnoticed change.",
        supportingDetails: [
          { source: "textbook", detail: "Separate copies and regular fingerprint checks reveal damage." },
          { source: "lecture", detail: "A damaged film is detected and replaced from an intact copy." },
        ],
      },
      {
        id: "idea-2",
        idea: "A file that survives may become unusable when formats or software change.",
        supportingDetails: [
          { source: "textbook", detail: "Archives can create a supported version, retain the original and record the conversion." },
          { source: "lecture", detail: "Staff convert films in a proprietary format into viewable versions while keeping the originals." },
        ],
      },
      {
        id: "idea-3",
        idea: "Descriptions and other contextual records keep digital material intelligible.",
        supportingDetails: [
          { source: "lecture", detail: "Undated, undescribed photographs may open perfectly but be meaningless to future visitors." },
          { source: "lecture", detail: "Organisers can supply missing information while it is still available." },
        ],
      },
    ],
    crossTextLinks: [
      { mainIdeaId: "idea-1", explanation: "The lecture illustrates the textbook's storage and checking procedure." },
      { mainIdeaId: "idea-2", explanation: "Both sources distinguish preserving the original from creating a usable version." },
      { mainIdeaId: "idea-3", explanation: "The lecture extends the textbook's focus on technically usable files by showing that usable files can still lack meaning." },
    ],
    lowPriorityDetails: [
      { source: "lecture", detail: "The exact type of festival." },
      { source: "lecture", detail: "The number of photographs." },
      { source: "lecture", detail: "The distinction between photographs and films once the general problem is clear." },
    ],
    modelSummary:
      "Digital archives must protect files from unnoticed damage while keeping them usable and understandable over time. Separate copies and regular checks allow staff to detect changes and restore damaged material. An intact file may depend on obsolete software, so archives may create accessible versions while retaining originals and recording the conversion. They must also keep contextual records: photographs without dates or descriptions can still be opened, but future visitors may not know what they show. Staff may need to collect this information before it is lost. Preservation therefore involves checks, technical updates and documentation.",
    commonWeaknesses: [
      "Treating backups as the whole solution.",
      "Listing the festival materials without explaining the three preservation problems.",
      "Implying conversion replaces the original file.",
      "Leaving out the need for context.",
    ],
  },
});

const bridgeMovement = createSummaryTask({
  id: "advanced-summary-bridge-movement",
  title: "Advanced Summary Practice 4",
  topic: "engineering",
  theme: "Civil engineering",
  sources: [
    {
      title: "Textbook extract",
      text:
        "A bridge may appear rigid, but parts of it change position slightly during normal use. Its deck expands as its temperature rises and contracts when it cools. Passing vehicles can also cause temporary deflections, while wind places forces on the structure. If every part were held completely still, these changes could create damaging stresses. Engineers therefore design specific places where movement can occur safely. Bearings between the deck and its supports can allow it to shift or rotate, while expansion joints accommodate changes in its length. The movement is small and limited: the road surface must still carry traffic smoothly, and the supports must continue to bear the bridge's weight. The amount and direction of movement depend on a bridge's materials, size and structural design, so no single arrangement suits every bridge. Controlled flexibility is part of structural stability.",
    },
    {
      title: "Lecture transcript",
      text:
        "‘Look at the narrow gap across this bridge deck. On a cold morning it may be wider than it is on a hot afternoon, because the deck changes length with temperature. The joint allows that change without forcing the road surface hard against the structure beside it. Under the deck, bearings at the supports permit some movement or rotation as loads pass over the bridge. This does not mean the whole bridge is loose. Its movements are planned and limited. But here's something that can go wrong later: a gap can collect stones and other debris. Inspectors need to clear it and check whether bearings can still move as designed. If a joint cannot open and close properly, forces may build up in parts that were not meant to take them. So building in flexibility isn't the end of the job; those components have to keep working.’",
    },
  ],
  glossary: [
    { term: "rigid", definition: "unable to bend or change shape easily" },
    { term: "deflection", definition: "a small movement or bend caused by a force" },
    { term: "accommodate", definition: "allow enough space for something to happen" },
    { term: "debris", definition: "small pieces of unwanted material" },
  ],
  markingGuide: {
    overarchingIdea:
      "Bridges remain stable by allowing small, planned movements caused by temperature and loads, provided the components that allow movement keep working.",
    mainIdeas: [
      {
        id: "idea-1",
        idea: "Temperature changes and loads make parts of a bridge move.",
        supportingDetails: [
          { source: "textbook", detail: "Bridge decks expand, contract and temporarily deflect under traffic and wind." },
          { source: "lecture", detail: "A joint gap changes width with temperature and bearings respond to passing loads." },
        ],
      },
      {
        id: "idea-2",
        idea: "Designed flexibility prevents excessive stress.",
        supportingDetails: [
          { source: "textbook", detail: "Bearings allow shifting or rotation, while expansion joints allow changes in length." },
          { source: "lecture", detail: "A gap prevents an expanding deck pressing against the neighbouring structure." },
          { source: "both", detail: "Movement is planned and limited rather than uncontrolled." },
        ],
      },
      {
        id: "idea-3",
        idea: "Inspection and maintenance are needed to preserve controlled movement.",
        supportingDetails: [
          { source: "lecture", detail: "Debris may block joints and inspectors must check that bearings still move." },
          { source: "lecture", detail: "Restricted movement can transfer force to parts not designed to take it." },
        ],
      },
    ],
    crossTextLinks: [
      { mainIdeaId: "idea-1", explanation: "The lecture illustrates the movements explained in the textbook." },
      { mainIdeaId: "idea-2", explanation: "The textbook names the components, while the lecture shows how a joint prevents stress." },
      { mainIdeaId: "idea-3", explanation: "The lecture extends the textbook's planned-flexibility principle by explaining that the components must remain operational." },
    ],
    lowPriorityDetails: [
      { source: "lecture", detail: "Whether the observation is made in the morning or afternoon." },
      { source: "lecture", detail: "The exact position of the gap." },
      { source: "both", detail: "A full list of possible forces when a representative cause is enough." },
    ],
    modelSummary:
      "Bridges need controlled movement to remain stable. Their decks expand and contract with temperature; traffic loads and wind can also produce temporary movement. Bearings and expansion joints allow parts to shift, rotate or change length without creating excessive stress, as the changing width of a deck joint illustrates. Such flexibility is designed and limited. Regular inspection is also necessary: debris can block a joint, while bearings may stop working as intended. Inspectors need to check these components because restricted movement can transfer force to parts of the bridge that were not designed for it.",
    commonWeaknesses: [
      "Saying the entire bridge moves freely.",
      "Focusing only on temperature while ignoring loads.",
      "Presenting the joints as cracks or defects.",
      "Omitting the maintenance point.",
    ],
  },
});

const archaeologicalDating = createSummaryTask({
  id: "advanced-summary-archaeological-dating",
  title: "Dating Archaeological Finds",
  description: "Combine evidence from layers, radiocarbon analysis and excavation context without assuming that nearby finds share a date.",
  topic: "archaeology",
  theme: "Archaeology",
  sources: [
    {
      title: "Textbook extract",
      text:
        "The age of an archaeological object cannot always be read from the object itself. Excavators first examine its position in a sequence of layers: where the ground has remained undisturbed, material in a lower layer is generally older than material above it. This establishes an order of events rather than an exact date. Scientific methods can then provide another kind of evidence. Radiocarbon analysis estimates the age of once-living material, such as seeds or wood, by measuring the carbon it retains. The result is normally expressed as a range of possible dates rather than a precise year. Clay pots and stone tools cannot be dated directly by this method, even if they are found near a suitable sample. By combining the sequence of layers with dates from testable material, archaeologists can begin to place activity at a site in time. Each method answers a different question and has limits of its own.",
    },
    {
      title: "Lecture transcript",
      text:
        "‘Let's imagine a settlement with two floors, one built above the other. At first sight, the lower floor should be older. In a fireplace sealed beneath it, excavators find charred seeds, which can be tested using radiocarbon analysis. The result gives a range of possible dates for the seeds and helps place the fireplace's use in time. Now, suppose a piece of pottery is found nearby, but in soil disturbed when a later drain was dug. Nearby does not necessarily mean from the same period: the pot may have been moved. Or, more precisely, we need evidence linking it to the sealed fireplace before using the seeds' date to judge its age. Careful excavation records can show whether the finds really belong together. So the layers suggest an order, the seeds offer a date range, and the disturbed soil makes the pot's association uncertain.’",
    },
  ],
  glossary: [
    { term: "excavator", definition: "a person who carefully digs to study remains from the past" },
    { term: "undisturbed", definition: "left in its original position or condition" },
    { term: "charred", definition: "partly burned and made black" },
    { term: "settlement", definition: "a place where people live or once lived" },
  ],
  markingGuide: {
    overarchingIdea:
      "Archaeologists date finds by combining the order of layers with scientific dates from appropriate samples, while checking that those samples really belong with the finds in question.",
    mainIdeas: [
      {
        id: "idea-1",
        idea: "Layers usually establish a relative sequence rather than an exact date.",
        supportingDetails: [
          { source: "textbook", detail: "Lower undisturbed layers are generally older." },
          { source: "lecture", detail: "Two floors suggest an order of construction." },
        ],
      },
      {
        id: "idea-2",
        idea: "Radiocarbon analysis estimates the age of organic material associated with activity at a site.",
        supportingDetails: [
          { source: "textbook", detail: "Seeds or wood can be tested, whereas pottery or stone cannot be dated directly this way." },
          { source: "lecture", detail: "Charred seeds from a sealed fireplace provide a range of dates for its use." },
        ],
      },
      {
        id: "idea-3",
        idea: "Context matters because later disturbance can make apparent associations misleading.",
        supportingDetails: [
          { source: "lecture", detail: "A pot near dated seeds may have been moved by a later drain." },
          { source: "lecture", detail: "Excavation records are needed to establish that the pot and seeds genuinely belong together." },
        ],
      },
    ],
    crossTextLinks: [
      { mainIdeaId: "idea-1", explanation: "The lecture applies the textbook's general layering principle to two floors." },
      { mainIdeaId: "idea-2", explanation: "The lecture supplies a suitable sample that illustrates the textbook's explanation of radiocarbon analysis." },
      { mainIdeaId: "idea-3", explanation: "The lecture shows why the two methods described in the textbook cannot be combined without evidence of association." },
    ],
    lowPriorityDetails: [
      { source: "lecture", detail: "The precise number of floors." },
      { source: "lecture", detail: "The drain as an example once the principle of later disturbance is clear." },
    ],
    modelSummary:
      "Archaeologists use several kinds of evidence to date a site. In undisturbed ground, lower layers generally indicate earlier activity, although they establish a sequence rather than exact dates. Radiocarbon analysis can give a range of dates for organic remains, such as seeds from a sealed fireplace; it does not directly date pottery or stone objects. Context matters when combining these methods: pottery found near the seeds in soil disturbed by later work may have been moved. Excavation records must establish a genuine association before the sample's date can inform the pot's age.",
    commonWeaknesses: [
      "Claiming that radiocarbon directly dates pottery.",
      "Presenting a scientific date as exact.",
      "Assuming proximity proves association.",
      "Omitting the relative sequence supplied by the layers.",
    ],
  },
});

const researchReplication = createSummaryTask({
  id: "advanced-summary-research-replication",
  title: "Why Researchers Repeat Studies",
  description: "Evaluate how repeated studies strengthen or refine a claim when methods, effect sizes and results differ.",
  topic: "scientific research",
  theme: "Research methods",
  sources: [
    {
      title: "Textbook extract",
      text:
        "A study can produce an interesting result without settling a question. Researchers therefore repeat an investigation with new participants or observations to see whether a similar pattern appears again. Such a study is often called a replication. A result found across several settings may provide a more robust basis for a claim than one obtained in a single group. However, a different result does not automatically show that the first team made a mistake. People in the new sample may differ in relevant ways, or the setting and procedure may not be exactly the same. Even when teams follow the original protocol closely, random fluctuations can make results vary from sample to sample. Replication therefore tests how reliably an effect appears, but identical numbers are not the goal. A pattern that changes across settings may point to a narrower explanation than the first study suggested. Researchers must avoid treating any single replication as a final verdict.",
    },
    {
      title: "Lecture transcript",
      text:
        "‘Suppose one team reports that background noise increases errors in a proofreading task. A second team repeats the investigation in several workplaces. They find more errors overall when it's noisy, but the increase is smaller, and in one office there is almost no difference. Does that cancel out the first result? Well, not necessarily. We would check how the noise was produced and whether the texts were equally difficult. And when I say “more errors”, I mean we should also examine how large that difference was and how uncertain the estimate is, rather than simply calling each study a success or failure. Perhaps sustained noise matters more than brief sounds, but that is still a possible explanation, not a finding. If later studies compare these conditions carefully, they may show where the original claim holds. Repetition helps refine it.’",
    },
  ],
  glossary: [
    { term: "robust", definition: "supported by enough evidence to remain convincing under different conditions" },
    { term: "protocol", definition: "an agreed plan for carrying out an investigation" },
    { term: "fluctuations", definition: "small changes that occur over time or between cases" },
  ],
  markingGuide: {
    overarchingIdea:
      "Repeating studies with new data helps assess how dependable a result is and identify the circumstances in which it applies.",
    mainIdeas: [
      {
        id: "idea-1",
        idea: "Independent studies provide more evidence than a single finding.",
        supportingDetails: [
          { source: "textbook", detail: "A replication uses new participants or observations." },
          { source: "lecture", detail: "A second team tests a hypothetical noise-and-proofreading finding in several workplaces." },
        ],
      },
      {
        id: "idea-2",
        idea: "Results need not be identical because variation can reveal relevant conditions.",
        supportingDetails: [
          { source: "textbook", detail: "Participant, setting and procedural differences may matter." },
          { source: "lecture", detail: "The effect is smaller overall and almost absent in one office." },
          { source: "lecture", detail: "Noise duration is a possible explanation rather than an established finding." },
        ],
      },
      {
        id: "idea-3",
        idea: "The strength and uncertainty of findings must be compared alongside methods.",
        supportingDetails: [
          { source: "lecture", detail: "Researchers should check noise conditions and text difficulty." },
          { source: "lecture", detail: "They should compare the size and uncertainty of effects instead of assigning success or failure labels." },
        ],
      },
    ],
    crossTextLinks: [
      { mainIdeaId: "idea-1", explanation: "The lecture provides a concrete replication of the general process described in the textbook." },
      { mainIdeaId: "idea-2", explanation: "The lecture illustrates how varying results can help narrow the conditions under which an effect appears." },
      { mainIdeaId: "idea-3", explanation: "The lecture introduces the detailed evaluation needed to fulfil the textbook's broader purpose of testing reliability." },
    ],
    lowPriorityDetails: [
      { source: "lecture", detail: "The proofreading task as a particular example." },
      { source: "lecture", detail: "The exact number of workplaces." },
      { source: "lecture", detail: "Any assumption that the possible explanation has already been proved." },
    ],
    modelSummary:
      "Repeating a study with new participants or observations helps researchers judge whether a finding is dependable. Similar patterns across settings strengthen a claim, while different outcomes may reflect changes in people, procedures or conditions rather than an error in the original study. In the hypothetical proofreading example, background noise has a weaker effect in some workplaces. Researchers should compare how the studies were conducted, the size of the differences and uncertainty in their estimates. Further tests could establish whether the effect depends on particular kinds or durations of noise, refining the original claim.",
    commonWeaknesses: [
      "Describing replication as rerunning the same data.",
      "Claiming one different outcome disproves the original.",
      "Reporting the proofreading example without stating the purpose of repetition.",
      "Treating a possible explanation as a proven one.",
      "Omitting the lecture's comparison of effect size and uncertainty.",
    ],
  },
});

export const OTE_ADVANCED_WRITING_SUMMARY_STUDENT_TASKS = [digitalArchives, bridgeMovement];

export const OTE_ADVANCED_WRITING_SUMMARY_TEACHER_TASKS = [archaeologicalDating, researchReplication];

export function getOteAdvancedWritingSummaryTeacherTask(taskId = "") {
  return OTE_ADVANCED_WRITING_SUMMARY_TEACHER_TASKS.find((task) => task.id === taskId)
    || OTE_ADVANCED_WRITING_SUMMARY_TEACHER_TASKS[0];
}
