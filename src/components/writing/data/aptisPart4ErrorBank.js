export const PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE = "aptis-writing-part4-error-detective";

export const APTIS_PART4_ERROR_BANK = [
  // =========================================================
  // 1. YOUR / YOU SINCERELY / FAITHFULLY
  // High-frequency recurring pattern
  // =========================================================

  {
    id: "err-01",
    sentence: "I hope you will consider my suggestions. Your sincerely,",
    target: "Your sincerely",
    correction: "Yours sincerely",
    correctedSentence: "I hope you will consider my suggestions. Yours sincerely,",
    category: "email_conventions",
    family: "YOURS_SIGNOFF",
    explanation: "The conventional closing is 'Yours sincerely', not 'Your sincerely'.",
  },

  {
    id: "err-02",
    sentence: "Thank you for taking my comments into consideration. Your faithfully,",
    target: "Your faithfully",
    correction: "Yours faithfully",
    correctedSentence: "Thank you for taking my comments into consideration. Yours faithfully,",
    category: "email_conventions",
    family: "YOURS_SIGNOFF",
    explanation: "Use 'Yours faithfully', with the possessive form 'Yours'.",
  },

  {
    id: "err-03",
    sentence: "I hope this information is useful. You sincerely,",
    target: "You sincerely",
    correction: "Yours sincerely",
    correctedSentence: "I hope this information is useful. Yours sincerely,",
    category: "email_conventions",
    family: "YOURS_SIGNOFF",
    explanation: "The standard email closing is 'Yours sincerely'.",
  },

  // =========================================================
  // 2. WRITE + TO + PERSON
  // =========================================================

  {
    id: "err-04",
    sentence: "I am writing you regarding the temporary closure of the cinema room.",
    target: "writing you",
    correction: "writing to you",
    correctedSentence: "I am writing to you regarding the temporary closure of the cinema room.",
    category: "grammar",
    family: "WRITE_TO_PERSON",
    explanation: "When 'write' is followed by the person receiving the message, use 'write to someone'.",
  },

  {
    id: "err-05",
    sentence: "I am writing you with reference to your recent email about the project.",
    target: "writing you",
    correction: "writing to you",
    correctedSentence: "I am writing to you with reference to your recent email about the project.",
    category: "grammar",
    family: "WRITE_TO_PERSON",
    explanation: "We normally say 'write to someone', not 'write someone', in British English.",
  },

  // =========================================================
  // 3. A / AN
  // =========================================================

  {
    id: "err-06",
    sentence: "I think we could organise a event to raise money for the club.",
    target: "a event",
    correction: "an event",
    correctedSentence: "I think we could organise an event to raise money for the club.",
    category: "grammar",
    family: "A_AN",
    explanation: "Use 'an' before a vowel sound: 'an event'.",
  },

  {
    id: "err-07",
    sentence: "Thank you for giving me a opportunity to take part in this project.",
    target: "a opportunity",
    correction: "an opportunity",
    correctedSentence: "Thank you for giving me an opportunity to take part in this project.",
    category: "grammar",
    family: "A_AN",
    explanation: "Use 'an' before the vowel sound at the beginning of 'opportunity'.",
  },

  // =========================================================
  // 4. AUXILIARY / MODAL + CORRECT VERB FORM
  // =========================================================

  {
    id: "err-08",
    sentence: "Have you see the latest news from the club?",
    target: "Have you see",
    correction: "Have you seen",
    correctedSentence: "Have you seen the latest news from the club?",
    category: "grammar",
    family: "AUXILIARY_VERB_FORM",
    explanation: "The present perfect uses 'have + past participle': 'have seen'.",
  },

  {
    id: "err-09",
    sentence: "Did you heard about the new location for the project?",
    target: "Did you heard",
    correction: "Did you hear",
    correctedSentence: "Did you hear about the new location for the project?",
    category: "grammar",
    family: "AUXILIARY_VERB_FORM",
    explanation: "After 'did', use the base form of the verb: 'hear'.",
  },

  {
    id: "err-10",
    sentence: "I think this experience may helps me improve my confidence.",
    target: "may helps",
    correction: "may help",
    correctedSentence: "I think this experience may help me improve my confidence.",
    category: "grammar",
    family: "AUXILIARY_VERB_FORM",
    explanation: "Modal verbs such as 'may' are followed by the base form: 'may help'.",
  },

  // =========================================================
  // 5. DUE TO + NO FINITE CLAUSE
  // =========================================================

  {
    id: "err-11",
    sentence: "I joined the debate club due to I wanted to improve my communication skills.",
    target: "due to I wanted",
    correction: "because I wanted",
    correctedSentence: "I joined the debate club because I wanted to improve my communication skills.",
    category: "grammar",
    family: "DUE_TO_CLAUSE",
    explanation: "'Due to' is normally followed by a noun phrase. Before a full clause, use 'because'.",
  },

  {
    id: "err-12",
    sentence: "I agree with the decision due to we do not have the necessary equipment.",
    target: "due to we do not have",
    correction: "because we do not have",
    correctedSentence: "I agree with the decision because we do not have the necessary equipment.",
    category: "grammar",
    family: "DUE_TO_CLAUSE",
    explanation: "Use 'because + subject + verb'. 'Due to' should not normally introduce this type of clause.",
  },

  // =========================================================
  // 6. ADVICE IS UNCOUNTABLE
  // =========================================================

  {
    id: "err-13",
    sentence: "I could give new members some useful advices about travelling safely.",
    target: "advices",
    correction: "advice",
    correctedSentence: "I could give new members some useful advice about travelling safely.",
    category: "vocabulary",
    family: "ADVICE_UNCOUNTABLE",
    explanation: "'Advice' is uncountable in English, so it does not normally have a plural form.",
  },

  {
    id: "err-14",
    sentence: "I would like to include some advices I have learned during the course.",
    target: "advices",
    correction: "advice",
    correctedSentence: "I would like to include some advice I have learned during the course.",
    category: "vocabulary",
    family: "ADVICE_UNCOUNTABLE",
    explanation: "Say 'some advice', not 'some advices'.",
  },

  // =========================================================
  // 7. KIND REGARDS — MALFORMED FIXED PHRASE
  // =========================================================

  {
    id: "err-15",
    sentence: "Thank you for your time and consideration. King regards,",
    target: "King regards",
    correction: "Kind regards",
    correctedSentence: "Thank you for your time and consideration. Kind regards,",
    category: "email_conventions",
    family: "KIND_REGARDS",
    explanation: "The fixed email closing is 'Kind regards'.",
  },

  {
    id: "err-16",
    sentence: "I would like to hear your opinion on this matter. Kinds regards,",
    target: "Kinds regards",
    correction: "Kind regards",
    correctedSentence: "I would like to hear your opinion on this matter. Kind regards,",
    category: "email_conventions",
    family: "KIND_REGARDS",
    explanation: "'Kind regards' is a fixed expression: 'kind' does not take a plural '-s'.",
  },

  // =========================================================
  // 8. BECAUSE + SUBJECT
  // =========================================================

  {
    id: "err-17",
    sentence: "I will keep attending the club because is very cheap.",
    target: "because is",
    correction: "because it is",
    correctedSentence: "I will keep attending the club because it is very cheap.",
    category: "grammar",
    family: "BECAUSE_MISSING_SUBJECT",
    explanation: "A clause after 'because' normally needs its own subject: 'because it is...'.",
  },

  {
    id: "err-18",
    sentence: "I think the club is worth joining because is a great opportunity to meet new people.",
    target: "because is",
    correction: "because it is",
    correctedSentence: "I think the club is worth joining because it is a great opportunity to meet new people.",
    category: "grammar",
    family: "BECAUSE_MISSING_SUBJECT",
    explanation: "English normally requires an explicit subject before the verb: 'because it is'.",
  },

  // =========================================================
  // 9. THIS + PLURAL NOUN
  // =========================================================

  {
    id: "err-19",
    sentence: "This activities give members a wide range of useful skills.",
    target: "This activities",
    correction: "These activities",
    correctedSentence: "These activities give members a wide range of useful skills.",
    category: "grammar",
    family: "DEMONSTRATIVE_AGREEMENT",
    explanation: "Use 'these' with a plural noun: 'these activities'.",
  },

  // =========================================================
  // 10. JOIN / ATTEND + NO TO
  // =========================================================

  {
    id: "err-20",
    sentence: "I hope this initiative will encourage more people to join to our club.",
    target: "join to our club",
    correction: "join our club",
    correctedSentence: "I hope this initiative will encourage more people to join our club.",
    category: "grammar",
    family: "JOIN_ATTEND_PREPOSITION",
    explanation: "'Join' takes a direct object: 'join a club', not 'join to a club'.",
  },

  {
    id: "err-21",
    sentence: "I am still planning to attend to the activity this weekend.",
    target: "attend to the activity",
    correction: "attend the activity",
    correctedSentence: "I am still planning to attend the activity this weekend.",
    category: "grammar",
    family: "JOIN_ATTEND_PREPOSITION",
    explanation: "When 'attend' means go to an event, no 'to' is needed: 'attend the activity'.",
  },

  // =========================================================
  // 11. LOOK FORWARD — MISSING / WRONG TO
  // =========================================================

  {
    id: "err-22",
    sentence: "I look forward your reply.",
    target: "look forward your reply",
    correction: "look forward to your reply",
    correctedSentence: "I look forward to your reply.",
    category: "grammar",
    family: "LOOK_FORWARD_TO",
    explanation: "The expression is 'look forward to something'.",
  },

  {
    id: "err-23",
    sentence: "I look forward for your response.",
    target: "look forward for",
    correction: "look forward to",
    correctedSentence: "I look forward to your response.",
    category: "grammar",
    family: "LOOK_FORWARD_TO",
    explanation: "'Look forward' is followed by the preposition 'to', not 'for'.",
  },

  // =========================================================
  // 12. EQUIPMENT IS UNCOUNTABLE
  // =========================================================

  {
    id: "err-24",
    sentence: "The club needs money for maintenance and new equipments.",
    target: "equipments",
    correction: "equipment",
    correctedSentence: "The club needs money for maintenance and new equipment.",
    category: "vocabulary",
    family: "EQUIPMENT_UNCOUNTABLE",
    explanation: "'Equipment' is normally uncountable, so we do not usually say 'equipments'.",
  },

  // =========================================================
  // 13. LOOK FORWARD TO + -ING
  // =========================================================

  {
    id: "err-25",
    sentence: "I look forward to hear from you soon.",
    target: "to hear",
    correction: "to hearing",
    correctedSentence: "I look forward to hearing from you soon.",
    category: "grammar",
    family: "LOOK_FORWARD_ING",
    explanation: "In 'look forward to', 'to' is a preposition, so a following verb takes '-ing'.",
  },

  // =========================================================
  // 14. ON THE OTHER HAND
  // =========================================================

  {
    id: "err-26",
    sentence: "In the other hand, I think the monthly fee is too expensive.",
    target: "In the other hand",
    correction: "On the other hand",
    correctedSentence: "On the other hand, I think the monthly fee is too expensive.",
    category: "vocabulary",
    family: "ON_THE_OTHER_HAND",
    explanation: "The fixed linking expression is 'on the other hand'.",
  },

  // =========================================================
  // 15. THE SAME ... AS
  // =========================================================

  {
    id: "err-27",
    sentence: "Members would continue paying the same price than before.",
    target: "the same price than",
    correction: "the same price as",
    correctedSentence: "Members would continue paying the same price as before.",
    category: "grammar",
    family: "SAME_AS",
    explanation: "Use 'the same ... as', not 'the same ... than'.",
  },

  // =========================================================
  // 16. REGARDING + NO TO
  // =========================================================

  {
    id: "err-28",
    sentence: "I am writing regarding to the changes to the club website.",
    target: "regarding to",
    correction: "regarding",
    correctedSentence: "I am writing regarding the changes to the club website.",
    category: "grammar",
    family: "REGARDING_NO_TO",
    explanation: "'Regarding' is followed directly by a noun phrase. Do not add 'to'.",
  },

  // =========================================================
  // 17. SUGGEST + -ING / THAT-CLAUSE
  // =========================================================

  {
    id: "err-29",
    sentence: "I suggest to bring some printed photos to make the talk more interesting.",
    target: "suggest to bring",
    correction: "suggest bringing",
    correctedSentence: "I suggest bringing some printed photos to make the talk more interesting.",
    category: "grammar",
    family: "SUGGEST_VERB_PATTERN",
    explanation: "'Suggest' is normally followed by '-ing' or a 'that'-clause, not 'to + infinitive'.",
  },

  // =========================================================
  // 18. DESPITE + NO FINITE CLAUSE
  // =========================================================

  {
    id: "err-30",
    sentence: "Despite I understand the reasons for the change, I would prefer printed books.",
    target: "Despite I understand",
    correction: "Although I understand",
    correctedSentence: "Although I understand the reasons for the change, I would prefer printed books.",
    category: "grammar",
    family: "DESPITE_CLAUSE",
    explanation: "'Despite' is followed by a noun phrase or '-ing' form. Use 'although' before a full clause.",
  },

  // =========================================================
  // 19. PEOPLE + PLURAL VERB
  // =========================================================

  {
    id: "err-31",
    sentence: "I think people is more disconnected when the meetings are held online.",
    target: "people is",
    correction: "people are",
    correctedSentence: "I think people are more disconnected when the meetings are held online.",
    category: "grammar",
    family: "PEOPLE_PLURAL",
    explanation: "'People' is a plural noun, so use 'are', not 'is'.",
  },

  // =========================================================
  // 20. IN RESPONSE / REPLY TO
  // =========================================================

  {
    id: "err-32",
    sentence: "I am writing in response of your recent email about the membership fee.",
    target: "in response of",
    correction: "in response to",
    correctedSentence: "I am writing in response to your recent email about the membership fee.",
    category: "grammar",
    family: "RESPONSE_TO",
    explanation: "The fixed expression is 'in response to something'.",
  },
];
