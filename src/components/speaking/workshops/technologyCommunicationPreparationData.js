const IMAGE_BASE = "/images/speaking/workshops/technology-communication";

const setAItems = [
  { id: "look-up", term: "look something up", meaning: "search for information, usually online", example: "I often look up directions on my phone.", gap: "I did not know the address, so I _____ it _____ online.", image: `${IMAGE_BASE}/preparation/look-up.webp` },
  { id: "keep-in-touch", term: "keep in touch", meaning: "continue communicating with someone regularly", example: "Technology makes it easy to keep in touch with people who live far away.", gap: "We use messages to _____ touch during the week.", image: `${IMAGE_BASE}/preparation/keep-in-touch.webp` },
  { id: "video-call", term: "make a video call", meaning: "speak to someone online while seeing them on screen", example: "I make a video call to my family every weekend.", gap: "We decided to _____ a video call instead of just speaking on the phone.", image: `${IMAGE_BASE}/preparation/video-call.webp` },
  { id: "contactless-payment", term: "make a contactless payment", meaning: "pay by tapping a card or device rather than using cash", example: "I usually make contactless payments with my phone.", gap: "You can _____ a contactless payment at the machine.", image: `${IMAGE_BASE}/preparation/contactless-payment.webp` },
  { id: "download-app", term: "download an app", meaning: "install an application on a phone, tablet or computer", example: "I downloaded an app to help me find my way around the city.", gap: "You need to _____ the app before you can use the service.", image: `${IMAGE_BASE}/preparation/download-app.webp` },
  { id: "set-up-device", term: "set up a device", meaning: "prepare a new device so that it is ready to use", example: "It took me about twenty minutes to set up my new phone.", gap: "Can you help me _____ this device?", image: `${IMAGE_BASE}/preparation/set-up-device.webp` },
  { id: "share-information", term: "share information", meaning: "send or give information to other people", example: "It is easy to share information with a group online.", gap: "The app allows users to _____ information quickly.", image: `${IMAGE_BASE}/preparation/share-information.webp` },
  { id: "rely-on-tech", term: "rely on technology", meaning: "depend on technology in order to do something", example: "I rely on technology for work, travel and everyday tasks.", gap: "Most people now _____ technology in some part of their daily lives.", image: `${IMAGE_BASE}/preparation/rely-on-tech.webp` },
];

const setBItems = [
  { id: "convenient", term: "convenient", meaning: "easy and suitable for your needs", example: "Paying by phone is quick and convenient.", gap: "Online banking is very _____ because I can use it anywhere.", image: `${IMAGE_BASE}/preparation/convenient.webp` },
  { id: "user-friendly", term: "user-friendly", meaning: "simple and easy for people to use", example: "The app is very user-friendly.", gap: "The website is clear and _____, even for new users.", image: `${IMAGE_BASE}/preparation/user-friendly.webp` },
  { id: "reliable", term: "reliable", meaning: "working well and consistently when you need it", example: "I need a reliable laptop for work.", gap: "The service is normally fast and _____.", image: `${IMAGE_BASE}/preparation/reliable.webp` },
  { id: "time-saving", term: "time-saving", meaning: "helping you do something more quickly", example: "Online check-in is a useful time-saving service.", gap: "Contactless payment can be very _____ when a shop is busy.", image: `${IMAGE_BASE}/preparation/time-saving.webp` },
  { id: "portable", term: "portable", meaning: "easy to carry and use in different places", example: "A tablet is portable enough to use while travelling.", gap: "Smartphones are small and _____.", image: `${IMAGE_BASE}/preparation/portable.webp` },
  { id: "distracting", term: "distracting", meaning: "making it difficult to concentrate on something else", example: "Constant phone notifications can be distracting.", gap: "I turn my phone off while studying because I find it _____.", image: `${IMAGE_BASE}/preparation/distracting.webp` },
  { id: "frustrating", term: "frustrating", meaning: "making you feel annoyed because something is difficult or does not work", example: "A slow internet connection can be extremely frustrating.", gap: "It is really _____ when an app stops working.", image: `${IMAGE_BASE}/preparation/frustrating.webp` },
  { id: "outdated", term: "outdated", meaning: "old-fashioned or no longer suitable because something newer is available", example: "The old computer still works, but the software is outdated.", gap: "Some older devices become _____ very quickly.", image: `${IMAGE_BASE}/preparation/outdated.webp` },
];

function practice(id, prompt, options, answer, feedback) {
  return { id, prompt, options, answer, feedback };
}

export const technologyCommunicationPreparationConfig = {
  storageVersion: "v2",
  sets: [
    {
      id: "a",
      label: "Set A",
      title: "Using technology",
      introduction: "Useful everyday phrases for talking about what we do with devices and digital services.",
      items: setAItems,
      practice: [
        practice("a1", "I did not recognise the word, so I _____ online.", ["looked it up", "set it up", "kept in touch"], "looked it up", "Look something up means search for information."),
        practice("a2", "My old university friends live in different countries, but we still _____.", ["keep in touch", "download an app", "make a payment"], "keep in touch", "Keep in touch means continue communicating regularly."),
        practice("a3", "It is easier to show my grandparents the children when we _____.", ["make a video call", "look something up", "share a device"], "make a video call", "A video call allows both people to see each other while speaking."),
        practice("a4", "I usually _____ with my phone instead of carrying cash.", ["make a contactless payment", "set up a device", "share information"], "make a contactless payment", "Contactless payments are made by tapping a card or device."),
        practice("a5", "I had to _____ before I could use the new banking service.", ["download an app", "rely on technology", "make a video call"], "download an app", "Downloading an app installs it on your device."),
        practice("a6", "My brother helped me _____ my new tablet.", ["set up", "look up", "keep in touch with"], "set up", "Set up means prepare a device so it is ready to use."),
        practice("a7", "Group chats make it easy to _____ with several people at once.", ["share information", "set up a device", "make a payment"], "share information", "Share information means send or give information to others."),
        practice("a8", "I _____ for directions, tickets and even paying for things.", ["rely on technology", "make a video call", "download an app"], "rely on technology", "Rely on technology means depend on it."),
      ],
    },
    {
      id: "b",
      label: "Set B",
      title: "Evaluating technology",
      introduction: "Flexible adjectives for explaining why technology is useful, difficult or sometimes problematic.",
      items: setBItems,
      practice: [
        practice("b1", "Being able to pay with my phone is extremely _____ when I do not have cash.", ["convenient", "distracting", "outdated"], "convenient", "Convenient means easy and practical for your needs."),
        practice("b2", "The controls are simple and clear, so the app is very _____.", ["user-friendly", "portable", "frustrating"], "user-friendly", "User-friendly technology is easy to understand and use."),
        practice("b3", "I use this laptop for work every day, so it needs to be _____.", ["reliable", "distracting", "outdated"], "reliable", "Reliable technology works properly when you need it."),
        practice("b4", "Booking tickets online is _____ because I do not have to queue.", ["time-saving", "portable", "frustrating"], "time-saving", "Something time-saving helps you complete a task more quickly."),
        practice("b5", "One advantage of a tablet is that it is light and _____.", ["portable", "reliable", "distracting"], "portable", "Portable technology is easy to carry and use in different places."),
        practice("b6", "Notifications can be very _____ when you are trying to concentrate.", ["distracting", "convenient", "user-friendly"], "distracting", "Something distracting takes your attention away from another activity."),
        practice("b7", "It is extremely _____ when the Wi-Fi stops working during an important task.", ["frustrating", "portable", "time-saving"], "frustrating", "Frustrating situations make you feel annoyed or impatient."),
        practice("b8", "The device is still usable, but the technology is becoming _____.", ["outdated", "reliable", "convenient"], "outdated", "Outdated technology is no longer modern or fully suitable."),
      ],
    },
  ],
  mixedReview: [
    practice("m1", "I did not know the opening time, so I _____ on my phone.", ["looked it up", "set it up", "shared it"], "looked it up", "Look something up means search for information."),
    practice("m2", "Contactless payment is popular partly because it is quick and _____.", ["convenient", "outdated", "distracting"], "convenient", "Convenient technology makes an everyday task easier."),
    practice("m3", "A smartphone is extremely _____ because you can carry it almost anywhere.", ["portable", "frustrating", "user-friendly"], "portable", "Portable means easy to carry and use in different places."),
    practice("m4", "My old tablet still works, but some of its software is now _____.", ["outdated", "reliable", "time-saving"], "outdated", "Outdated describes technology that is no longer modern."),
    practice("m5", "I need a _____ internet connection because I work online.", ["reliable", "distracting", "portable"], "reliable", "Reliable technology works consistently when required."),
    practice("m6", "Messages appearing constantly on screen can be very _____.", ["distracting", "convenient", "outdated"], "distracting", "Distracting things make it harder to concentrate."),
    practice("m7", "It took me nearly an hour to _____ my new phone and move all my information across.", ["set up", "keep in touch with", "look up"], "set up", "You set up a device when you prepare it for use."),
    practice("m8", "People now _____ for so many everyday tasks that technical problems can be very frustrating.", ["rely on technology", "make a video call", "download an app"], "rely on technology", "Rely on technology means depend on it."),
  ],
  writeTest: {
    title: "Write the key words",
    introduction: "Complete each sentence with one important word from the expressions you have learned. Four items come from each set.",
    items: [
      { id: "write-look-up", prompt: "I often look _____ directions on my phone.", answer: "up", acceptedAnswers: ["for"], feedback: "The target expression is ‘look up directions’; ‘look for directions’ is also natural here.", image: `${IMAGE_BASE}/preparation/look-up.webp` },
      { id: "write-keep-in-touch", prompt: "Technology makes it easy to keep in _____.", answer: "touch", acceptedAnswers: ["contact"], feedback: "Both ‘keep in touch’ and ‘keep in contact’ fit naturally.", image: `${IMAGE_BASE}/preparation/keep-in-touch.webp` },
      { id: "write-contactless-payment", prompt: "I usually make _____ payments with my phone.", answer: "contactless", acceptedAnswers: ["digital", "mobile"], feedback: "The target word is ‘contactless’; ‘digital’ and ‘mobile’ also describe this kind of payment.", image: `${IMAGE_BASE}/preparation/contactless-payment.webp` },
      { id: "write-rely-on", prompt: "I rely _____ technology for everyday tasks.", answer: "on", acceptedAnswers: ["upon"], feedback: "‘Rely on’ is more common, while ‘rely upon’ is also correct.", image: `${IMAGE_BASE}/preparation/rely-on-tech.webp` },
      { id: "write-user-friendly", prompt: "The app is very user-_____.", answer: "friendly", feedback: "The full adjective is ‘user-friendly’.", image: `${IMAGE_BASE}/preparation/user-friendly.webp` },
      { id: "write-time-saving", prompt: "Online check-in is a useful time-_____ service.", answer: "saving", feedback: "The full adjective is ‘time-saving’.", image: `${IMAGE_BASE}/preparation/time-saving.webp` },
      { id: "write-distracting", prompt: "Constant phone notifications can be _____.", answer: "distracting", acceptedAnswers: ["annoying", "disruptive"], feedback: "The target word is ‘distracting’; ‘annoying’ and ‘disruptive’ also fit this sentence.", image: `${IMAGE_BASE}/preparation/distracting.webp` },
      { id: "write-outdated", prompt: "The old computer works, but the software is _____.", answer: "outdated", acceptedAnswers: ["obsolete", "old-fashioned"], feedback: "The target word is ‘outdated’; close alternatives with the same meaning are also accepted.", image: `${IMAGE_BASE}/preparation/outdated.webp` },
    ],
  },
  ideaTasks: [
    {
      id: "phone-use",
      question: "What do you use your phone for most often?",
      instruction: "Choose the uses that would be easiest for you to develop.",
      minimum: 3,
      ideas: ["look things up", "keep in touch", "make payments", "use apps or maps", "share photos or information"],
    },
    {
      id: "useful-technology",
      question: "What makes technology useful in everyday life?",
      instruction: "Choose features you could explain with a reason or example.",
      minimum: 3,
      ideas: ["convenient", "time-saving", "reliable", "portable", "user-friendly"],
    },
  ],
  rehearsal: {
    question: "Which piece of technology do you rely on most, and why?",
    image: `${IMAGE_BASE}/part2_task01_using_smartphone.webp`,
    imageAlt: "A person using a smartphone while waiting for public transport",
    ideaPrompts: ["what the device is", "what you use it for", "why it is convenient or time-saving", "what happens when it does not work"],
    usefulChunks: ["I rely on…", "I mainly use it to…", "What makes it useful is…"],
  },
};
