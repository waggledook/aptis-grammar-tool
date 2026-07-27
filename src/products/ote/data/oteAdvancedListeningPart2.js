const audioRoot = "/audio/ote/listening/advanced/part-2/set-1";
const setTwoAudioRoot = "/audio/ote/listening/advanced/part-2/set-2";

export const advancedListeningPart2Sets = [
  {
    id: "set-1",
    title: "Restoring Historic Sound Recordings",
    description: "Complete six gaps in a set of lecture notes with words from the recording.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${audioRoot}/restoring-historic-sound-recordings.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${audioRoot}/question.mp3`,
    instructions:
      "Listen to a lecture about restoring historic sound recordings. Complete the gaps in the notes with a word or two-word phrase from the audio. Remember to check your spelling.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    gaps: [
      {
        id: "earliest-format",
        answer: "wax cylinders",
        section: "The collection",
        before: "The archive’s earliest material was recorded on",
        after: ".",
        review: {
          explanation: "The lecture contrasts later formats with the archive’s earliest format. “Flat discs and magnetic tape” describe later material; the contrast marker “however” introduces the required answer.",
          correctQuote: "wax cylinders",
          distractors: [
            {
              quote: "flat discs and magnetic tape",
              note: "These are later formats, not the archive’s earliest material.",
            },
          ],
        },
      },
      {
        id: "damp-storage",
        answer: "mould growth",
        section: "The collection",
        before: "Damp storage can result in",
        after: ", as well as detached labels.",
        review: {
          explanation: "Several kinds of damage are mentioned, but only mould growth is directly caused by moisture on the recordings themselves and fits the note grammatically.",
          correctQuote: "mould growth",
          distractors: [
            {
              quote: "scratches and surface dust",
              note: "These affect playback, but the speaker contrasts them with problems caused by poor storage.",
            },
            {
              quote: "cardboard containers had collapsed and labels had come away",
              note: "These are additional effects of damp storage, but the note already supplies the detached-label clue.",
            },
          ],
        },
      },
      {
        id: "groove-capture",
        answer: "digital photographs",
        section: "Recovering the sound",
        before: "The grooves are captured without physical contact by taking",
        after: ".",
        review: {
          explanation: "The cameras create thousands of digital photographs, which software combines into a map of the grooves. The note changes “are produced” into the phrase “by taking”.",
          correctQuote: "digital photographs",
          distractors: [
            {
              quote: "an ordinary needle",
              note: "A needle is the damaging physical-contact method that engineers avoid.",
            },
            {
              quote: "cameras record it from a series of angles",
              note: "This describes the process, but the gap asks what is taken or produced.",
            },
          ],
        },
      },
      {
        id: "identification-clues",
        answer: "paper labels",
        section: "Identification and preservation",
        before: "Researchers sometimes rely on",
        after: "attached to the original containers.",
        review: {
          explanation: "Handwritten lists are useful but potentially unreliable. The speaker then identifies paper labels on the original containers as the most dependable clues.",
          correctQuote: "paper labels",
          distractors: [
            {
              quote: "Handwritten lists supplied by collectors",
              note: "The lists are useful, but their titles may have been copied inaccurately or added later.",
            },
          ],
        },
      },
      {
        id: "storage-conditions",
        answer: "cool rooms",
        section: "Identification and preservation",
        before: "The recordings are therefore kept in",
        after: ", where conditions remain stable.",
        review: {
          explanation: "Freezing initially sounds safe, but temperature changes can damage the material. Cool rooms provide the stable temperature and humidity required by the note.",
          correctQuote: "cool rooms",
          distractors: [
            {
              quote: "Freezing them",
              note: "Freezing is introduced as plausible and then rejected.",
            },
            {
              quote: "repeated changes in temperature",
              note: "This is a source of damage, not a storage location.",
            },
          ],
        },
      },
      {
        id: "linguistic-value",
        answer: "regional accents",
        section: "Research value",
        before: "Linguists are particularly interested in examples of",
        after: "preserved in the recordings.",
        review: {
          explanation: "The speaker separates the interests of social historians, music researchers and linguists. Regional accents are the feature explicitly connected with linguists.",
          correctQuote: "regional accents",
          distractors: [
            {
              quote: "Famous speeches and performances",
              note: "These attract public attention, but they are not identified as the linguists’ particular interest.",
            },
            {
              quote: "local singing traditions",
              note: "These are connected with music researchers rather than linguists.",
            },
          ],
        },
      },
    ],
    supportingNotes: [
      {
        section: "Recovering the sound",
        text: "Software uses the resulting images to reconstruct the recorded sound.",
        afterGap: "groove-capture",
      },
      {
        section: "Identification and preservation",
        text: "Repeated changes in temperature can damage fragile recording materials.",
        afterGap: "identification-clues",
      },
      {
        section: "Research value",
        text: "The collection is useful to social historians and music researchers.",
        beforeGap: "linguistic-value",
      },
    ],
    script: [
      {
        speaker: "Man",
        text: "Today I’d like to look at the work of an archive that restores historic sound recordings. The collection contains everything from political speeches to songs recorded at home, and the objects themselves vary considerably. Some were made commercially, while others were created by families, schools or local clubs and were never intended to survive for generations.",
      },
      {
        speaker: "Man",
        text: "Some of the later material survives on flat discs and magnetic tape. The archive’s earliest recordings, however, were made using a very different format: wax cylinders. These small hollow objects rotated while sound was being recorded and were widely used before discs became the standard format.",
      },
      {
        speaker: "Man",
        text: "People often assume that scratches and surface dust are the archivists’ greatest concerns. They certainly affect playback, but poor storage creates less obvious problems. In several collections, cardboard containers had collapsed and labels had come away after years in damp cupboards. More seriously, moisture had encouraged mould growth on the recordings themselves. Cleaning that safely requires considerable care because the wax can soften or crack.",
      },
      {
        speaker: "Man",
        text: "Playing a fragile recording with an ordinary needle may cause further damage, so engineers increasingly avoid touching the surface at all. The cylinder is placed on a slowly rotating support while cameras record it from a series of angles. Thousands of digital photographs are produced. Software then combines them into a detailed map of the grooves and converts that pattern into sound. The result is not always perfect, but sections that would once have been considered unplayable can often be recovered.",
      },
      {
        speaker: "Man",
        text: "Restoring the sound is only part of the job. Many recordings begin without an announcement, so identifying the speaker or performer can be surprisingly difficult. Handwritten lists supplied by collectors are useful, although titles were sometimes copied inaccurately or added years later. The most dependable clues are often paper labels fixed to the original boxes or sleeves. A name, place and date written there may allow researchers to connect an anonymous voice with other archive records.",
      },
      {
        speaker: "Man",
        text: "Once cleaned and catalogued, the objects need suitable conditions. Freezing them might sound like the safest approach, but repeated changes in temperature can damage wax and other materials. Instead, most are transferred to cool rooms, where both temperature and humidity remain steady. They are placed in new containers, but not sealed so tightly that trapped moisture becomes another problem.",
      },
      {
        speaker: "Man",
        text: "Why devote so much effort to recordings that may last only a few minutes? Famous speeches and performances attract public attention, but ordinary voices often have greater research value. Social historians can hear descriptions of work and family life that were never written down. Music researchers can compare local singing traditions. For linguists, however, the exceptional feature is the range of regional accents preserved from periods before radio and television began making speech more uniform. The archive therefore records not only what people said, but how communities once sounded.",
      },
    ],
    itemDesign: [
      "Flat discs and magnetic tape appear immediately before the first answer.",
      "Scratches, dust, collapsed containers, and detached labels compete with the second answer.",
      "The note and recording use different grammatical framing around digital photographs.",
      "Handwritten lists are presented as useful before paper labels are identified as more dependable.",
      "Freezing is introduced as plausible before being rejected in favour of cool rooms.",
      "Historical, musical, and linguistic uses are discussed before regional accents are selected.",
    ],
  },
  {
    id: "set-2",
    title: "Managing Visitor Flow in Large Museums",
    description: "Complete six gaps in a set of lecture notes with words from the recording.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${setTwoAudioRoot}/managing-visitor-flow-in-large-museums.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${setTwoAudioRoot}/question.mp3`,
    instructions:
      "Listen to a lecture about managing visitors in large museums. Complete the gaps in the notes with a word or two-word phrase from the audio. Remember to check your spelling.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    gaps: [
      {
        id: "arrival-analysis",
        answer: "arrival patterns",
        section: "Planning visitor flow",
        before: "Records and sensors help managers establish",
        after: ".",
        review: {
          explanation: "Daily attendance totals hide when pressure occurs. Ticket records and entrance sensors are used to identify arrival patterns across different groups and times.",
          correctQuote: "arrival patterns",
          distractors: [
            {
              quote: "Total attendance matters, of course, but it tells managers surprisingly little on its own.",
              note: "Total attendance is relevant background, but the speaker says it is insufficient for planning flow.",
            },
          ],
        },
      },
      {
        id: "congestion-point",
        answer: "central staircase",
        section: "Building layout",
        before: "Crowding frequently develops around a",
        after: ".",
        review: {
          explanation: "The staircase itself is wide enough; congestion develops because visitors stop beside it to make decisions, wait and take photographs.",
          correctQuote: "central staircase",
          distractors: [
            {
              quote: "Narrow doorways and celebrated exhibits",
              note: "These are the causes people usually blame before the lecturer gives the observed example.",
            },
          ],
        },
      },
      {
        id: "route-trials",
        answer: "floor markings",
        section: "Building layout",
        before: "Temporary",
        after: "can test alternative routes before permanent changes are made.",
        review: {
          explanation: "Movable arrows and coloured lines allow several routes to be tested before a museum commits to a permanent alteration.",
          correctQuote: "floor markings",
          distractors: [
            {
              quote: "moving walls or installing fixed barriers",
              note: "These are permanent and expensive measures that the trials are intended to avoid.",
            },
            {
              quote: "Ropes",
              note: "Ropes control a queue but do not reveal how visitors behave once the queue disappears.",
            },
          ],
        },
      },
      {
        id: "delay-information",
        answer: "waiting times",
        section: "Managing delays",
        before: "Reliable information about",
        after: "can make delays seem more acceptable.",
        review: {
          explanation: "Entertainment may reduce boredom, but accurate waiting times address uncertainty—the factor that makes an unexplained delay especially frustrating.",
          correctQuote: "waiting times",
          distractors: [
            {
              quote: "Interactive displays and short videos",
              note: "These occupy visitors but do not tell them how long the delay will last.",
            },
          ],
        },
      },
      {
        id: "priority-access",
        answer: "priority tickets",
        section: "Access and disruption",
        before: "Allowing holders of",
        after: "to bypass the main queue may cause resentment.",
        review: {
          explanation: "Several groups may use separate entrances, but visible queue-jumping and resentment are linked specifically to people holding priority tickets.",
          correctQuote: "priority tickets",
          distractors: [
            {
              quote: "school groups, wheelchair users or annual members",
              note: "These groups may also receive separate access, but they are not the group tied to the resentment described next.",
            },
          ],
        },
      },
      {
        id: "closure-response",
        answer: "clear explanations",
        section: "Access and disruption",
        before: "During unexpected closures, visitors particularly value",
        after: ".",
        review: {
          explanation: "Apologies and vouchers may help, but survey evidence shows that visitors value a clear account of what happened, what is affected and what remains available.",
          correctQuote: "clear explanations",
          distractors: [
            {
              quote: "repeated apologies",
              note: "Apologies are a plausible response, but visitors place greater value on information.",
            },
            {
              quote: "vouchers for the café",
              note: "Vouchers may help, but they are secondary to an explanation of the disruption.",
            },
          ],
        },
      },
    ],
    supportingNotes: [
      {
        section: "Planning visitor flow",
        text: "Daily totals may hide periods of severe pressure.",
        beforeGap: "arrival-analysis",
      },
      {
        section: "Building layout",
        text: "Protected buildings cannot always be altered permanently.",
        beforeGap: "congestion-point",
      },
      {
        section: "Managing delays",
        text: "Entertainment reduces boredom but not uncertainty.",
        beforeGap: "delay-information",
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Today I’m going to discuss how large museums manage the movement of visitors through their buildings. People often assume the main problem is simply the number of people who enter each day. Total attendance matters, of course, but it tells managers surprisingly little on its own. A museum receiving six thousand visitors evenly across ten hours may function better than one receiving half that number in two sudden waves. For that reason, planners increasingly begin with arrival patterns, using ticket records and entrance sensors to identify when school groups, tourists and local visitors tend to appear.",
      },
      {
        speaker: "Woman",
        text: "The building itself can create difficulties that are not obvious from a floor plan. Narrow doorways and celebrated exhibits are usually blamed for congestion, yet observation sometimes reveals a different cause. In one gallery, for example, visitors repeatedly stopped beside the central staircase to check maps, wait for companions or take photographs. The staircase was wide enough, but the decisions people made around it turned the area into a bottleneck.",
      },
      {
        speaker: "Woman",
        text: "Permanent rebuilding is expensive and may be impossible in a protected building. Before moving walls or installing fixed barriers, museums can test alternatives cheaply. Ropes are useful for controlling a queue, though they do not show how people will behave once the queue disappears. Temporary floor markings are often more revealing. Arrows and coloured lines can be moved between trials, allowing staff to compare several routes before committing to a lasting change.",
      },
      {
        speaker: "Woman",
        text: "Information also affects how a delay is experienced. Interactive displays and short videos can occupy visitors, but entertainment does not remove uncertainty. Research suggests that people are less frustrated by a twenty-minute delay they know about than by a shorter wait with no indication of when it will end. This is why accurate waiting times displayed at entrances or gallery doors can be so effective. An optimistic estimate that proves wrong, however, tends to make matters worse.",
      },
      {
        speaker: "Woman",
        text: "Attempts to provide faster access create another issue. Museums may need separate entrances for school groups, wheelchair users or annual members. The greatest irritation often arises when people with priority tickets are seen entering immediately while a standard queue barely moves. Even visitors who accepted the arrangement when booking may question whether it is fair once they are standing in line.",
      },
      {
        speaker: "Woman",
        text: "Finally, staff behaviour becomes particularly important when something unexpected happens, such as a gallery closing because of a technical fault. Managers sometimes focus on repeated apologies or offer vouchers for the café. These gestures may help, but surveys indicate that visitors place greater value on clear explanations: what has happened, which areas are affected and what alternatives remain open. Good crowd management, then, depends not only on architecture and numbers, but on understanding how people interpret the situation around them.",
      },
    ],
    itemDesign: [
      "Total attendance is discussed before the lecture shifts to the distribution of visitors over time.",
      "Narrow doorways and celebrated exhibits are presented as plausible causes before the actual bottleneck is identified.",
      "Walls, fixed barriers, and ropes compete with the temporary measure used to compare routes.",
      "Displays and videos address boredom, whereas reliable waiting times reduce uncertainty.",
      "Several groups receive separate access, but priority-ticket holders are the group connected with resentment.",
      "Apologies and café vouchers are plausible distractors before clear explanations are valued more highly.",
    ],
  },
];

export function getAdvancedListeningPart2Set(setId) {
  return advancedListeningPart2Sets.find((set) => set.id === setId) || advancedListeningPart2Sets[0];
}
