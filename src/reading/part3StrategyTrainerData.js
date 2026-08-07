export const PHONE_SPEAKERS = [
  {
    name: "Grace",
    text: "I switched off almost all notifications a few months ago because every little sound was breaking my concentration. Now I check messages and email when I finish what I’m doing rather than whenever an app demands my attention. At first, I worried I might miss something important, but my family know to call if it’s urgent. I still check my phone regularly; I just prefer deciding for myself when to do it. It’s surprising how much easier it is to focus without constant interruptions.",
  },
  {
    name: "Leo",
    text: "I need to see work messages fairly quickly during the day. Clients sometimes need an answer before they can continue with something, so ignoring notifications for hours simply wouldn’t work in my job. The problem was that I used to keep responding long after work had finished. Now my phone automatically goes into Do Not Disturb at six, except for calls from a few close contacts. I haven’t become less available at work; I’ve just become much stricter about when the working day ends.",
  },
  {
    name: "Nadia",
    text: "I don’t mind notifications if they come from actual people. Messages from friends and group chats help me keep up with what everyone’s doing, and I’d probably miss quite a few plans without them. What I’ve turned off are alerts from shopping apps, games and news sites. Most of those seem designed to make you open the app rather than tell you something you genuinely need to know. So I’m selective: personal messages stay, while most organisations have to wait until I choose to look.",
  },
  {
    name: "Ethan",
    text: "I tried switching notifications off completely, but I didn’t like having to remember which apps I needed to check. Instead, I use the summary feature on my phone. Most alerts still arrive, but I don’t see them individually; they’re collected together and shown to me at lunchtime and again in the evening. That way I still get the information without reaching for my phone every few minutes. It hasn’t reduced the number of messages I receive, but it has definitely reduced how often they interrupt me.",
  },
];

export const PHONE_QUESTIONS = [
  {
    id: 1,
    text: "Who has to respond promptly so that other people can continue working?",
    answer: "Leo",
    evidenceParts: [
      "I need to see work messages fairly quickly during the day",
      "Clients sometimes need an answer before they can continue with something",
    ],
    explanation:
      "Leo’s clients may be unable to continue until he answers. Respond promptly therefore paraphrases his need to see and answer work messages fairly quickly.",
  },
  {
    id: 2,
    text: "Who receives alerts in groups at set times rather than as they arrive?",
    answer: "Ethan",
    evidence:
      "they’re collected together and shown to me at lunchtime and again in the evening",
    explanation:
      "Ethan’s alerts accumulate and are shown together at lunchtime and in the evening, rather than interrupting him individually as they arrive.",
  },
  {
    id: 3,
    text: "Who relies on another form of contact for genuinely urgent matters?",
    answer: "Grace",
    evidence: "my family know to call if it’s urgent",
    explanation:
      "Grace has disabled most notifications, but her family use a different method—a phone call—when something is genuinely urgent.",
  },
  {
    id: 4,
    text: "Who keeps notifications mainly for maintaining social contact?",
    answer: "Nadia",
    evidenceParts: [
      "Messages from friends and group chats help me keep up with what everyone’s doing",
      "I’d probably miss quite a few plans without them",
    ],
    explanation:
      "Friends, group chats and plans all relate to Nadia’s social life. She keeps personal-message notifications because they help her stay connected.",
  },
  {
    id: 5,
    text: "Who limits their availability according to the time of day?",
    answer: "Leo",
    evidenceParts: [
      "my phone automatically goes into Do Not Disturb at six",
      "I’ve just become much stricter about when the working day ends",
    ],
    explanation:
      "Leo remains available for work during the day but uses Do Not Disturb from six. His availability therefore changes according to the time.",
  },
  {
    id: 6,
    text: "Who thinks frequent alerts make it harder to concentrate?",
    answer: "Grace",
    evidenceParts: [
      "every little sound was breaking my concentration",
      "It’s surprising how much easier it is to focus without constant interruptions",
    ],
    explanation:
      "Ethan also mentions interruptions, which makes him a plausible distractor. Grace is the stronger answer because she explicitly connects frequent sounds with broken concentration and says that fewer interruptions make focusing easier.",
  },
  {
    id: 7,
    text: "Who found that the most complete solution created a new responsibility?",
    answer: "Ethan",
    evidence:
      "I tried switching notifications off completely, but I didn’t like having to remember which apps I needed to check",
    explanation:
      "The most complete solution means turning every notification off. Ethan rejected it because it made checking each necessary app his responsibility.",
  },
];
