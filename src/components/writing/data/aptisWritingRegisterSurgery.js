export const REGISTER_SURGERY_LIVE_GAME_TYPE = "aptis-writing-register-surgery";

export function hasRegisterSurgeryLiveSubmission(player, kind, mode) {
  const responseGroup = mode === "rewrite" ? "rewrites" : mode;
  return Boolean(player?.registerSurgery?.[responseGroup]?.[kind]);
}

export const REGISTER_SURGERY_SCENARIO = {
  title: "Walking Club — Summer Schedule",
  sourceTitle: "Email from the Walking Club Committee",
  source: [
    "Dear Member,",
    "During July and August, we are planning to start our Sunday walks at 7 a.m. instead of 10 a.m. because of the high temperatures. We believe this will make the walks safer and more comfortable.",
    "We realise the earlier time may be difficult for some members, so please tell us what you think and suggest any alternatives.",
    "Best wishes,\nThe Walking Club Committee",
  ],
};

export const REGISTER_SURGERY_EMAILS = {
  informal: {
    audience: "A friend",
    heading: "Find the language that is too formal",
    instruction: "This email is to a friend, but four expressions are too formal. Select the expressions that do not suit the reader.",
    targetCount: 4,
    blocks: [
      { id: "informal-greeting", chunks: [{ text: "Hi Marta," }] },
      {
        id: "informal-body-1",
        chunks: [
          { id: "informal-purpose", text: "I am writing to express my concern regarding the new walking time.", selectable: true, target: true },
          { text: " " },
          { id: "informal-too-early", text: "7 a.m. is way too early for me!", selectable: true },
          { text: " " },
          { id: "informal-preference", text: "I would prefer the committee to reconsider this arrangement", selectable: true, target: true },
          { text: " and " },
          { id: "informal-time", text: "start at 8:30 instead.", selectable: true },
          { text: " " },
          { id: "informal-reckon", text: "Do you reckon you'll still go?", selectable: true },
        ],
      },
      { id: "informal-closing-line", chunks: [{ id: "informal-hearing", text: "I look forward to hearing from you.", selectable: true, target: true }] },
      { id: "informal-signoff", chunks: [{ id: "informal-signoff-target", text: "Yours sincerely,", selectable: true, target: true }, { text: "\nAlex" }] },
    ],
    rewrites: [
      {
        id: "informal-purpose",
        original: "I am writing to express my concern regarding the new walking time.",
        suggestions: ["I'm not too happy about the new walking time.", "I'm a bit worried about the new walking time."],
        explanation: "A friend-to-friend email can be simpler and more direct. There is no need for a formal purpose phrase here.",
      },
      {
        id: "informal-preference",
        original: "I would prefer the committee to reconsider this arrangement.",
        suggestions: ["I think they should change it.", "I hope they change their minds."],
        explanation: "The original is grammatically correct, but unnecessarily formal for a close friend.",
      },
      {
        id: "informal-hearing",
        original: "I look forward to hearing from you.",
        suggestions: ["Let me know what you think.", "What do you think?"],
        explanation: "A direct, conversational ending normally sounds more natural when writing to a friend.",
      },
      {
        id: "informal-signoff-target",
        original: "Yours sincerely,",
        suggestions: ["See you soon,", "Cheers,", "Bye for now,", "Best,"],
        explanation: "The closing should reflect the personal relationship with the reader.",
      },
    ],
  },
  formal: {
    audience: "The club committee",
    heading: "Find the language that is too informal",
    instruction: "This email is to the club committee, but five expressions are too informal. Select the expressions that do not suit the reader.",
    targetCount: 5,
    blocks: [
      { id: "formal-greeting", chunks: [{ text: "Dear Club Committee," }] },
      {
        id: "formal-body-1",
        chunks: [
          { id: "formal-annoyed", text: "I'm just writing because I'm pretty annoyed about the new 7 a.m. starting time.", selectable: true, target: true },
          { text: " " },
          { id: "formal-understand", text: "I understand that the change is intended to make the walks safer during the summer, and I agree that avoiding the hottest part of the day is a sensible idea.", selectable: true },
          { text: " " },
          { id: "formal-however", text: "However,", selectable: true },
          { text: " getting to the meeting point that early would " },
          { id: "formal-nightmare", text: "be a nightmare for me", selectable: true, target: true },
          { text: ", as the first bus from my area does not arrive until 7:15." },
        ],
      },
      {
        id: "formal-body-2",
        chunks: [
          { id: "formal-suggestion", text: "Why don't you make it 8:30 instead?", selectable: true, target: true },
          { text: " " },
          { id: "formal-allow", text: "This would still allow members to finish the walk before temperatures become too high,", selectable: true },
          { text: " while making it easier for " },
          { id: "formal-transport", text: "people who rely on public transport", selectable: true },
          { text: " to attend. " },
          { id: "formal-alternative", text: "Another possibility would be to offer different starting times on particularly hot days.", selectable: true },
        ],
      },
      { id: "formal-closing-line", chunks: [{ id: "formal-let-know", text: "Let me know what you think.", selectable: true, target: true }] },
      { id: "formal-signoff", chunks: [{ id: "formal-cheers", text: "Cheers,", selectable: true, target: true }, { text: "\nAlex Morgan" }] },
    ],
    rewrites: [
      {
        id: "formal-annoyed",
        original: "I'm just writing because I'm pretty annoyed about the new 7 a.m. starting time.",
        suggestions: ["I am writing to express my concern about the new 7 a.m. starting time.", "I am writing regarding the proposed change to the starting time."],
        explanation: "Avoid strongly conversational language such as pretty annoyed. A neutral expression such as concerned is more appropriate.",
      },
      {
        id: "formal-nightmare",
        original: "be a nightmare for me",
        suggestions: ["be very difficult for me", "cause me considerable difficulty"],
        explanation: "Formal writing does not require complicated vocabulary. The main aim is to remove the exaggerated conversational expression a nightmare.",
      },
      {
        id: "formal-suggestion",
        original: "Why don't you make it 8:30 instead?",
        suggestions: ["I would suggest starting at 8:30 instead.", "Perhaps the walks could begin at 8:30 instead."],
        explanation: "Suggestions are often softened when writing to an organisation.",
      },
      {
        id: "formal-let-know",
        original: "Let me know what you think.",
        suggestions: ["I hope you will consider these suggestions.", "I would be grateful if you could consider this alternative."],
        explanation: "The committee is not a friend, so a slightly more polite and less conversational closing sentence is appropriate.",
      },
      {
        id: "formal-cheers",
        original: "Cheers,",
        suggestions: ["Kind regards,", "Best wishes,"],
        explanation: "Both are suitable neutral or formal endings here. Yours sincerely is not always required.",
      },
    ],
  },
};

export const REGISTER_SURGERY_COMPARISONS = [
  { area: "Vocabulary", informal: "a nightmare", formal: "very difficult" },
  { area: "Grammar / phrasing", informal: "Why don't you…?", formal: "I would suggest…" },
  { area: "Tone", informal: "pretty annoyed", formal: "concerned" },
  { area: "Email conventions", informal: "Cheers,", formal: "Kind regards," },
];
