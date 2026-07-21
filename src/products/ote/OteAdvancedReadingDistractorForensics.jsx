import React from "react";
import OteReadingDistractorTrainer from "./OteReadingDistractorTrainer.jsx";

const DIAGNOSES = [
  { id: "different-question", label: "Answers a different question", description: "The option contains a true detail, but not the information requested." },
  { id: "too-strong", label: "Too strong", description: "The option removes a limit such as may, some, partly or not necessarily." },
  { id: "partly-supported", label: "Only partly supported", description: "One part is accurate, but the complete statement goes beyond the evidence." },
  { id: "not-supported", label: "Not supported", description: "The option sounds plausible, but the text gives no evidence for it." },
  { id: "reverses", label: "Reverses the meaning", description: "The option turns the writer’s meaning into its opposite." },
  { id: "wrong-link", label: "Wrong person, reason or time", description: "The view belongs to somebody else, or the option changes the cause, person or stage." },
];

const CASES = [
  {
    id: "borrowed-light",
    title: "Borrowed Light",
    source: "Exhibition review",
    question: "What does the reviewer particularly admire about the exhibition?",
    paragraphs: [
      "Borrowed Light follows people who work while most of the city is asleep: cleaners, bakers, couriers and hospital staff. Rao’s technical control is impressive. Difficult pools of artificial light remain clear without making the workplaces look unreal.",
      "A few captions explain the photographs’ symbolism more firmly than the images require, as though visitors could not be trusted to notice repeated gestures for themselves.",
      "Yet the exhibition’s real achievement emerges across the sequence. No single routine is presented as remarkable, but together the images form a patient portrait of work that the city depends on and rarely sees.",
    ],
    options: [
      { id: "A", text: "The technical skill used to photograph difficult night-time conditions" },
      { id: "B", text: "The way ordinary routines combine into a wider picture of unnoticed work" },
      { id: "C", text: "The captions used to direct visitors towards the photographs’ symbolism" },
    ],
    answer: "B",
    why: "The reviewer calls the cumulative portrait of unnoticed work the exhibition’s ‘real achievement’.",
    distractors: [
      {
        option: "A",
        diagnosis: "different-question",
        evidence: ["technical control is impressive", "real achievement emerges across the sequence"],
        note: "True detail, wrong importance",
        explanation: "The reviewer genuinely praises Rao’s technical control. However, the question asks what is particularly admired, and the text identifies the exhibition’s wider cumulative effect as its real achievement.",
      },
      {
        option: "C",
        diagnosis: "reverses",
        evidence: ["captions explain the photographs’ symbolism more firmly than the images require", "visitors could not be trusted"],
        note: "Correct feature, opposite evaluation",
        explanation: "The captions do direct attention to symbolism, but the reviewer thinks they explain too much. The option turns a criticism into praise.",
      },
    ],
  },
  {
    id: "drawing-meanings",
    title: "Drawing new meanings",
    source: "Research extract",
    question: "What do the findings suggest?",
    paragraphs: [
      "Researchers asked adult learners to study twenty-four unfamiliar symbols and their meanings. One group copied written definitions, a second created an original example for each symbol, and a third produced a quick drawing that represented its meaning.",
      "Immediate test scores were similar across the three groups. One week later, however, the drawing group remembered significantly more. A follow-up task showed that this advantage disappeared when participants produced decorative images that had no clear connection with the meaning.",
      "The study involved learners from one evening course, and the material was particularly suitable for visual representation. The findings should therefore not be assumed to apply equally to every subject or learner.",
    ],
    options: [
      { id: "A", text: "Adding any kind of drawing to study material improves long-term memory." },
      { id: "B", text: "Creating examples supports immediate understanding but not later recall." },
      { id: "C", text: "Representing meaning visually may strengthen the retention of new information." },
    ],
    answer: "C",
    why: "C preserves the study’s limits: meaningful visual representation may improve later retention in this kind of task.",
    distractors: [
      {
        option: "A",
        diagnosis: "too-strong",
        evidence: ["advantage disappeared", "no clear connection with the meaning", "should therefore not be assumed to apply equally to every subject or learner"],
        note: "The option has lost the qualifications",
        explanation: "The benefit appeared only when the drawing represented the meaning, and the researchers warn against applying the result to every subject or learner. A turns a limited finding into a general rule.",
      },
      {
        option: "B",
        diagnosis: "partly-supported",
        evidence: ["Immediate test scores were similar across the three groups", "drawing group remembered significantly more"],
        note: "A possible comparison becomes a definite absence of benefit",
        explanation: "The immediate part is compatible with the results. The text does not, however, establish that creating examples produced no later recall or no lasting value at all.",
      },
    ],
  },
  {
    id: "quotation",
    title: "An identifiable quotation",
    source: "Formal letter",
    question: "Why does Dana ask for the quotation to be removed?",
    paragraphs: [
      "Dear Dr Malik,",
      "Thank you for sending me the proof of your article based on the oral-history interviews about the Hartwell factory. I am pleased that my contribution has been included, and I do not object to your summary of the closure.",
      "I am concerned, however, about the passage quoting a former supervisor. I mentioned his comments only after being assured that individuals discussed in the interviews would not be identifiable. The quotation itself is accurate and not defamatory, but the combination of his exact role, department and words would make him immediately recognisable to many local readers.",
      "As he was not interviewed or asked for consent, could the quotation be removed before publication? I would be happy for the broader point to remain in anonymous form.",
      "Yours sincerely,\nDana Reeves",
    ],
    options: [
      { id: "A", text: "It may break an assurance that another person would remain unidentifiable." },
      { id: "B", text: "It does not accurately reflect what she said during the original interview." },
      { id: "C", text: "It may distract readers from the article’s main argument." },
    ],
    answer: "A",
    why: "Dana had been promised that people discussed in the interviews would not be identifiable, but the details could reveal who the supervisor is.",
    distractors: [
      {
        option: "B",
        diagnosis: "reverses",
        evidence: ["The quotation itself is accurate"],
        note: "Explicit confirmation becomes criticism",
        explanation: "Dana directly accepts the quotation’s accuracy. Her concern is identification and consent, not misquotation.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["I would be happy for the broader point to remain in anonymous form"],
        note: "Plausible editorial concern, absent evidence",
        explanation: "The letter never says that the quotation weakens or distracts from the article’s argument. Dana is happy for the broader point to remain; she only wants the identifying details removed.",
      },
    ],
  },
  {
    id: "apology",
    title: "Rewriting the apology",
    source: "Extract from a novel",
    question: "What does Elias realise about his earlier messages?",
    paragraphs: [
      "By midnight, Elias had rewritten the message four times. Each version began with the cancelled train, the impossible deadline and the battery failure—facts, all of them, and each placed carefully before the sentence admitting that he had forgotten Mara’s performance.",
      "Reading the latest draft aloud, he noticed that it asked for understanding before it offered regret. He deleted the first paragraph, then the second. The remaining line looked embarrassingly small:",
      "I said I would be there, and I wasn’t.",
      "For the first time that evening, Elias understood that his revisions had not really been attempts to explain the mistake. They had been attempts to control the verdict.",
    ],
    options: [
      { id: "A", text: "He has spent too much time explaining the circumstances of his absence." },
      { id: "B", text: "He has been shaping the apology to control how Mara judges him." },
      { id: "C", text: "Mara is unlikely to accept an apology delivered in a written message." },
    ],
    answer: "B",
    why: "Elias realises that he arranged the apology to secure understanding and influence Mara’s judgement before fully accepting responsibility.",
    distractors: [
      {
        option: "A",
        diagnosis: "partly-supported",
        evidence: ["cancelled train, the impossible deadline and the battery failure", "attempts to control the verdict"],
        note: "Accurate behaviour, incomplete interpretation",
        explanation: "A accurately describes what Elias did, but not what he now understands about his motive. He was not simply writing too much; he was trying to control Mara’s judgement.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["attempts to control the verdict"],
        note: "Reasonable prediction, absent evidence",
        explanation: "The extract gives no information about Mara’s preferred form of communication or whether she will accept the apology. The question concerns Elias’s self-realisation.",
      },
    ],
  },
  {
    id: "emergency-alerts",
    title: "Measuring emergency alerts",
    source: "Professional article",
    question: "Why does the writer mention the Redbank fire?",
    paragraphs: [
      "Emergency-warning systems are often judged by their delivery rate. During the Redbank fire, 96 per cent of phones in the target area received an alert within two minutes, a figure initially celebrated as a success.",
      "Follow-up interviews produced a less reassuring picture. Many residents did not understand the instruction to ‘prepare to relocate from Zone C’, and some did not know whether their homes were inside that zone. Evacuation therefore began slowly despite the rapid delivery.",
      "In our new trials, we measure whether recipients can identify the required action and location, not simply whether the message reaches their device. Alerts are also tested with residents unfamiliar with official terminology before being approved.",
    ],
    options: [
      { id: "A", text: "To show that delayed transmission reduced the practical value of the warning" },
      { id: "B", text: "To suggest that residents understood the message but chose not to follow it" },
      { id: "C", text: "To explain why successful alerts should be measured by understanding as well as delivery" },
    ],
    answer: "C",
    why: "The Redbank case shows that rapid delivery can look successful even when recipients do not understand what to do.",
    distractors: [
      {
        option: "A",
        diagnosis: "reverses",
        evidence: ["received an alert within two minutes", "despite the rapid delivery"],
        note: "Right result, opposite cause",
        explanation: "The message arrived quickly. The practical problem came after delivery because residents did not understand it. A reverses the article’s central contrast.",
      },
      {
        option: "B",
        diagnosis: "wrong-link",
        evidence: ["did not understand the instruction", "did not know whether their homes were inside that zone"],
        note: "Correct event, incorrect reason",
        explanation: "Residents were slow to act, but the writer attributes this to confusion, not a decision to ignore a message they understood.",
      },
    ],
  },
  {
    id: "rialto",
    title: "The Rialto’s empty seats",
    source: "Blog entry",
    question: "What does the blogger see as the main reason for the cinema’s decline?",
    paragraphs: [
      "Attendance at the Rialto cinema has fallen again, and the explanations appearing beneath every local-news article are predictable. Some blame streaming services; others say ticket prices have become unreasonable. A few insist that the cinema no longer shows films worth seeing.",
      "None of these claims explains why the independent cinema across town, which charges slightly more and screens many of the same releases, is regularly full.",
      "The Rialto’s real difficulty is that customers can no longer rely on it. Weekly programmes are sometimes published only two days in advance. Screenings disappear without warning, and opening times change from one week to the next. People stop building an evening around a venue when they cannot be confident that the advertised evening will happen.",
    ],
    options: [
      { id: "A", text: "The difficulty of relying on its programme from one week to the next" },
      { id: "B", text: "The growing preference for watching newly released films at home" },
      { id: "C", text: "The Rialto is less conveniently located than the independent cinema across town" },
    ],
    answer: "A",
    why: "The blogger calls reliability the cinema’s real difficulty and supports this with late programmes, cancelled screenings and changing opening times.",
    distractors: [
      {
        option: "B",
        diagnosis: "wrong-link",
        evidence: ["Some blame streaming services", "None of these claims explains"],
        note: "Somebody says it, but not the writer",
        explanation: "Streaming is an explanation offered by commenters, not one accepted by the blogger. The successful cinema across town helps the writer challenge that view.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["independent cinema across town"],
        note: "Plausible comparison, absent evidence",
        explanation: "The text tells us that another cinema is across town, but says nothing about whether either location is more convenient. The option adds a reason that the writer never gives.",
      },
    ],
  },
];

const DIAGNOSTIC_FEEDBACK = {
  "different-question": "You are spotting true information, but not always checking whether it answers the precise question.",
  "too-strong": "Watch for limits such as may, some, in this study and not necessarily.",
  "partly-supported": "Check every part of an option. One accurate phrase does not make the complete answer correct.",
  "not-supported": "Avoid filling gaps in the text with assumptions that seem reasonable in real life.",
  reverses: "Recheck contrasts, negatives and qualifications. The option may use the right topic but the opposite meaning.",
  "wrong-link": "Track who holds each view and distinguish the cause of an event from the event itself.",
};

const CONFIG = {
  cases: CASES,
  diagnoses: DIAGNOSES,
  diagnosticFeedback: DIAGNOSTIC_FEEDBACK,
  variant: "advanced",
  progressId: "reading.part1.advanced-distractor-forensics",
  mode: "distractor_forensics",
  taskId: "advanced-reading-part-1-distractor-forensics",
  taskTitle: "Distractor Forensics",
  title: "Distractor Forensics",
  seoTitle: "Distractor Forensics | OTE Advanced Reading Part 1 | Seif English",
  seoDescription: "Learn to identify exactly how realistic distractors change, overstate or misrepresent an Advanced Reading Part 1 text.",
  kicker: "Advanced Reading Part 1 · Skill trainer",
  intro: "Choose the best answer, then examine both wrong options and identify exactly where their meaning breaks down.",
  wording: {
    answerSummary: "Answer each Part 1 question before beginning the forensic examination.",
    evidenceSummary: "The relevant wording appears inside the original text, not in a duplicate.",
    successCopy: "You identified all twelve distractor patterns accurately.",
  },
};

export default function OteAdvancedReadingDistractorForensics({ nativeRoutes = false }) {
  return <OteReadingDistractorTrainer nativeRoutes={nativeRoutes} config={CONFIG} />;
}
