import React from "react";
import OteReadingDistractorTrainer from "./OteReadingDistractorTrainer.jsx";

const DIAGNOSES = [
  { id: "wrong-detail", label: "Wrong detail", description: "The option uses information from the text, but changes or mixes up one fact." },
  { id: "ignores-condition", label: "Ignores an important condition", description: "The option leaves out a rule such as only, before Friday, with an adult or if you cannot attend." },
  { id: "different-question", label: "Does not answer the question", description: "The information may be true, but it is not the message, purpose or detail being asked about." },
  { id: "partly-true", label: "Only partly true", description: "One part is correct, but the complete option is not supported by the text." },
  { id: "opposite", label: "Opposite meaning", description: "The option changes a positive idea into a negative one, or permission into prohibition." },
  { id: "wrong-link", label: "Wrong person, reason or time", description: "The idea is in the text, but it belongs to somebody else, another time or a different reason." },
];

const CASES = [
  {
    id: "family-climbing",
    round: "spot-problem",
    title: "Family climbing sessions",
    source: "Notice",
    question: "What does the notice say about children under 12?",
    paragraphs: [
      "Children under 12 may use the climbing wall during family sessions only. They must remain with an adult. Teenagers aged 12–17 may climb alone after completing a safety check.",
    ],
    options: [
      { id: "A", text: "They may climb alone after passing a safety check." },
      { id: "B", text: "They may climb during family sessions if an adult stays with them." },
      { id: "C", text: "They may use the wall whenever family sessions are taking place." },
    ],
    answer: "B",
    why: "B includes both rules: it must be a family session, and an adult must stay with the child.",
    distractors: [
      {
        option: "A",
        diagnosis: "wrong-link",
        evidence: ["Teenagers aged 12–17 may climb alone after completing a safety check"],
        note: "The rule belongs to a different age group",
        explanation: "The rule about climbing alone belongs to teenagers, not children under 12. A uses real information but gives it to the wrong group.",
      },
      {
        option: "C",
        diagnosis: "ignores-condition",
        evidence: ["They must remain with an adult"],
        note: "One important rule is missing",
        explanation: "C gives the correct type of session but leaves out the adult-supervision rule. The answer is incomplete.",
      },
    ],
  },
  {
    id: "appointment-time",
    round: "spot-problem",
    title: "New appointment time",
    source: "Email",
    question: "What should Noah do if the new appointment time is unsuitable?",
    paragraphs: [
      "Subject: Dental appointment",
      "Hi Noah,",
      "Your appointment has been moved from Wednesday morning to Thursday at 4:30. If you cannot attend at the new time, please reply by Tuesday. Otherwise, you do not need to contact us.",
    ],
    options: [
      { id: "A", text: "Reply to the clinic by Tuesday." },
      { id: "B", text: "Confirm that he is able to attend on Thursday." },
      { id: "C", text: "Contact the clinic after the original appointment time." },
    ],
    answer: "A",
    why: "Noah must contact the clinic by Tuesday if Thursday afternoon is unsuitable.",
    distractors: [
      {
        option: "B",
        diagnosis: "opposite",
        evidence: ["Otherwise, you do not need to contact us"],
        note: "The instruction is reversed",
        explanation: "Noah only needs to reply if he cannot attend. If he can attend on Thursday, he should take no action.",
      },
      {
        option: "C",
        diagnosis: "wrong-link",
        evidence: ["please reply by Tuesday"],
        note: "The time is wrong",
        explanation: "The clinic gives a clear deadline. Waiting until after the original Wednesday appointment would be too late.",
      },
    ],
  },
  {
    id: "missing-parcel",
    round: "spot-problem",
    title: "The missing parcel",
    source: "Message",
    question: "Why has Sam written to Farah?",
    paragraphs: [
      "Hi Farah. Thanks again for offering me a lift, but the trains are running normally now, so I’ll take one home. Could you collect my parcel from reception before it closes? I’ll get it from you tomorrow.",
    ],
    options: [
      { id: "A", text: "To thank her for offering him transport." },
      { id: "B", text: "To ask her to collect his parcel from the station before it closes." },
      { id: "C", text: "To ask her to collect something on his behalf." },
    ],
    answer: "C",
    why: "The main purpose of the message is to ask Farah to collect the parcel for Sam.",
    distractors: [
      {
        option: "A",
        diagnosis: "different-question",
        evidence: ["Thanks again for offering me a lift", "Could you collect my parcel from reception before it closes?"],
        note: "A true detail, but not the main purpose",
        explanation: "Sam does thank Farah, but that is not his main reason for writing. The important request comes afterwards.",
      },
      {
        option: "B",
        diagnosis: "wrong-detail",
        evidence: ["the trains are running normally now", "collect my parcel from reception"],
        note: "The place has been changed",
        explanation: "Sam mentions the train and asks Farah to collect a parcel, but the parcel is at reception, not at the station.",
      },
    ],
  },
  {
    id: "harbour-kitchen",
    round: "whole-text",
    title: "Harbour Kitchen",
    source: "Review",
    question: "What is the reviewer’s overall opinion of the restaurant?",
    paragraphs: [
      "Harbour Kitchen has a bright dining room and an excellent view of the river. Service was slow on the evening we visited, and we waited almost forty minutes for our main courses.",
      "Fortunately, the food was imaginative and carefully prepared. Despite the delay, I would happily return—though perhaps not when I was in a hurry.",
    ],
    options: [
      { id: "A", text: "It is worth visiting, although the service may require patience." },
      { id: "B", text: "Its attractive setting does not compensate for disappointing food." },
      { id: "C", text: "The slow service makes the whole experience difficult to recommend." },
    ],
    answer: "A",
    why: "A keeps the balance of the review: the restaurant is recommended, but the service may be slow.",
    distractors: [
      {
        option: "B",
        diagnosis: "partly-true",
        evidence: ["a bright dining room and an excellent view of the river", "the food was imaginative and carefully prepared"],
        note: "One part is true, but the conclusion is not",
        explanation: "The setting is attractive, but the reviewer praises the food. One correct idea does not make the complete option correct.",
      },
      {
        option: "C",
        diagnosis: "opposite",
        evidence: ["Despite the delay, I would happily return"],
        note: "One negative detail replaces a positive conclusion",
        explanation: "The service is criticised, but the reviewer’s overall opinion is positive. C changes that positive conclusion into a negative one.",
      },
    ],
  },
  {
    id: "fix-at-home",
    round: "whole-text",
    title: "FixAtHome bicycles",
    source: "Advertisement",
    question: "What makes FixAtHome different from most repair companies?",
    paragraphs: [
      "Most repair companies ask you to bring your bicycle to their workshop. We send a mechanic to your home or workplace and complete standard repairs there.",
      "Evening appointments are available, and our prices are similar to those charged by local bicycle shops.",
    ],
    options: [
      { id: "A", text: "It offers repairs outside normal working hours." },
      { id: "B", text: "Its mechanics repair bicycles at the customer’s location." },
      { id: "C", text: "Its services are cheaper than those of local workshops." },
    ],
    answer: "B",
    why: "Most companies ask customers to bring bicycles to a workshop. FixAtHome sends the mechanic to the customer.",
    distractors: [
      {
        option: "A",
        diagnosis: "different-question",
        evidence: ["Evening appointments are available", "Most repair companies ask you to bring your bicycle to their workshop", "We send a mechanic to your home or workplace"],
        note: "A true detail, but not the main contrast",
        explanation: "Evening appointments are available, but the advertisement says the main difference is where the repair happens.",
      },
      {
        option: "C",
        diagnosis: "opposite",
        evidence: ["our prices are similar to those charged by local bicycle shops"],
        note: "Similar does not mean cheaper",
        explanation: "The advertisement says the prices are similar. C changes equal prices into a price advantage.",
      },
    ],
  },
  {
    id: "saturday-market",
    round: "whole-text",
    title: "The Saturday market",
    source: "Blog entry",
    question: "What does the blogger believe is the main reason for the market’s decline?",
    paragraphs: [
      "The Saturday market has been losing customers, and residents offer several explanations. Some blame the lack of parking, while others say supermarket prices are lower.",
      "Neither explanation fully convinces me. The market beside the station has less parking and higher prices, yet remains busy.",
      "Our market’s real problem is unpredictability. Stalls often cancel at short notice, opening hours change each week and customers cannot be sure whether the products they need will be available.",
    ],
    options: [
      { id: "A", text: "Customers cannot rely on what the market will offer each week." },
      { id: "B", text: "Supermarkets sell similar products at more affordable prices." },
      { id: "C", text: "Shoppers find it difficult to park near the market." },
    ],
    answer: "A",
    why: "The blogger calls unpredictability the market’s ‘real problem’ and gives several examples of it.",
    distractors: [
      {
        option: "B",
        diagnosis: "wrong-link",
        evidence: ["others say supermarket prices are lower", "Neither explanation fully convinces me"],
        note: "This is somebody else’s explanation",
        explanation: "Other residents give the price explanation. The blogger reports it but does not accept it as the main cause.",
      },
      {
        option: "C",
        diagnosis: "wrong-link",
        evidence: ["Some blame the lack of parking", "Neither explanation fully convinces me", "less parking and higher prices, yet remains busy"],
        note: "The blogger challenges this opinion",
        explanation: "Other people blame parking. The blogger points to a successful market with even less parking, so this is not the writer’s conclusion.",
      },
    ],
  },
];

const DIAGNOSTIC_FEEDBACK = {
  "wrong-detail": "You are finding useful information, but sometimes mixing up details. Check names, places and objects carefully.",
  "ignores-condition": "Look carefully for words such as only, if, before, with and unless.",
  "different-question": "You are noticing true information, but it does not always answer the exact question.",
  "partly-true": "Check the complete option. One correct detail may hide an incorrect conclusion.",
  opposite: "Check negatives and contrast words such as but, however, although and despite.",
  "wrong-link": "Keep track of who says each idea, when something happens and what causes it.",
};

const CONFIG = {
  cases: CASES,
  diagnoses: DIAGNOSES,
  diagnosticFeedback: DIAGNOSTIC_FEEDBACK,
  variant: "general",
  progressId: "reading.part1.general-distractor-detective",
  mode: "distractor_detective",
  taskId: "general-reading-part-1-distractor-detective",
  taskTitle: "Distractor Detective",
  title: "Distractor Detective",
  seoTitle: "Distractor Detective | OTE General Reading Part 1 | Seif English",
  seoDescription: "Practise choosing the best OTE General Reading Part 1 answer and explaining why the other options are wrong.",
  kicker: "General Reading Part 1 · Two-round skill trainer",
  intro: "Choose the best answer, then investigate both wrong options. Find the exact detail that makes each one wrong.",
  rounds: [
    { id: "spot-problem", label: "Round 1 · Spot the Problem" },
    { id: "whole-text", label: "Round 2 · Read the Whole Text" },
  ],
  wording: {
    answerSummary: "Choose the best answer before you investigate the two wrong options.",
    diagnosisSummary: "Use the same six simple diagnoses in every case.",
    evidenceSummary: "After you check, the useful words are highlighted in the original text.",
    reportKicker: "Detective’s report complete",
    investigationLabel: "Investigate option",
    diagnosisQuestion: "What is wrong with this option?",
    successTitle: "Excellent detective work",
    successCopy: "You identified all twelve distractor problems correctly.",
  },
};

export default function OteGeneralReadingDistractorDetective({ nativeRoutes = false }) {
  return <OteReadingDistractorTrainer nativeRoutes={nativeRoutes} config={CONFIG} />;
}
