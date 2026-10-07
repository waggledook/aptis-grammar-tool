const audioRoot = "/audio/ote/listening/advanced/part-2/set-1";
const setTwoAudioRoot = "/audio/ote/listening/advanced/part-2/set-2";
const spaceDebrisAudioRoot =
  "/audio/ote/listening/advanced/part-2/space-debris";
const dictionariesAudioRoot =
  "/audio/ote/listening/advanced/part-2/dictionaries";

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
  {
    id: "space-debris",
    level: "C1",
    title: "Removing Space Debris",
    description: "Complete six gaps in a set of lecture notes with words from the recording.",
    teacherOnly: true,
    assetsReady: true,
    audioReady: true,
    audioSrc: `${spaceDebrisAudioRoot}/removing-space-debris.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${spaceDebrisAudioRoot}/question.mp3`,
    instructions:
      "Listen to a lecture about removing space debris. Complete the gaps in the notes with a word or two-word phrase from the audio. Remember to check your spelling.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    gaps: [
      {
        id: "large-targets",
        answer: "large objects",
        section: "Choosing targets",
        before: "Removing",
        after:
          "is intended to prevent further fragmentation rather than collect existing fragments.",
        review: {
          explanation:
            "The lecture contrasts tiny existing fragments with the large intact objects selected for preventive removal. “Satellites” alone would exclude discarded rocket sections.",
          correctQuote: "large objects",
          distractors: [
            {
              quote: "thousands of tiny fragments",
              note:
                "These fragments pose a threat, but the lecturer says collecting them individually is extremely difficult.",
            },
            {
              quote: "complete satellites and the discarded sections of rockets",
              note:
                "These examples define the broader category required by the note: large objects.",
            },
          ],
        },
      },
      {
        id: "battery-isolation",
        answer: "solar panels",
        acceptedAnswers: ["panels"],
        section: "Preventing break-ups",
        before: "Discharged batteries must be separated from",
        after: "to prevent a renewed build-up of energy.",
        review: {
          explanation:
            "Discharging a battery is not necessarily permanent because solar panels may keep generating electricity. Physically separating the panels prevents the charge from rebuilding.",
          correctQuote: "Solar panels",
          distractors: [
            {
              quote: "unused fuel and charged batteries",
              note:
                "These are two stored-energy risks, but the gap asks what must be separated from the batteries afterwards.",
            },
            {
              quote: "switching off the instruments",
              note:
                "The lecturer explicitly says this does not remove the continuing source of energy.",
            },
          ],
        },
      },
      {
        id: "capture-distance",
        answer: "distance",
        section: "Capture methods",
        before: "Nets allow a greater",
        after: "between the spacecraft and its target during capture.",
        review: {
          explanation:
            "A vehicle using an arm must approach closely, whereas a net can be launched from farther away. The advantage applies specifically during capture, not necessarily afterwards.",
          correctQuote: "distance",
          distractors: [
            {
              quote: "approach closely",
              note:
                "This describes the requirement when using an arm, which the net avoids during capture.",
            },
            {
              quote: "does not necessarily make the subsequent operation easier",
              note:
                "The lecturer limits the advantage rather than claiming that distance improves the whole operation.",
            },
          ],
        },
      },
      {
        id: "model-validation",
        answer: "computer models",
        section: "Testing and control",
        before: "Experiment recordings helped engineers assess the accuracy of",
        after: "before designing equipment for a mission.",
        review: {
          explanation:
            "The recordings were compared with predictions from computer models. The small physical models were the targets used in the aircraft experiment, not the tools being validated.",
          correctQuote: "computer models",
          distractors: [
            {
              quote: "small physical models of satellites",
              note:
                "These were the experimental targets rather than the predictive design tools whose accuracy was assessed.",
            },
            {
              quote: "successful catches",
              note:
                "A catch supplied evidence, but proving that an operational system was ready was not the purpose of the test.",
            },
          ],
        },
      },
      {
        id: "cable-control",
        answer: "cable",
        acceptedAnswers: ["flexible link"],
        section: "Testing and control",
        before: "Immediate control of movement prevents the",
        after: "becoming wrapped around both craft.",
        review: {
          explanation:
            "A net leaves the two craft connected by a cable. If the target continues tumbling, this flexible link can wind around both spacecraft, so its motion must be controlled promptly.",
          correctQuote: "cable",
          distractors: [
            {
              quote: "an arm holds them together more firmly",
              note:
                "The arm is presented as the more controlled alternative; it is not the flexible connection at risk of wrapping around the craft.",
            },
            {
              quote: "the net",
              note:
                "The net encloses the target, while the cable or flexible link is the connection described as winding around both spacecraft.",
            },
          ],
        },
      },
      {
        id: "capture-handles",
        answer: "handles",
        section: "Future design",
        before: "Adding",
        after:
          "would give both removal and maintenance vehicles something secure to grip.",
        review: {
          explanation:
            "Visual markers help an approaching vehicle identify a satellite, but handles provide the physical attachment point needed for removal, repair or refuelling.",
          correctQuote: "Handles",
          distractors: [
            {
              quote: "Visual markers",
              note:
                "Markers help vehicles identify the satellite; they do not provide something secure to grip.",
            },
          ],
        },
      },
    ],
    supportingNotes: [],
    script: [
      {
        speaker: "Lecturer",
        text: "Today I want to look at how engineers might remove abandoned satellites from orbit. People often picture a machine sweeping up thousands of tiny fragments. Those fragments certainly pose a threat, but collecting them individually is extremely difficult. Much of the work on removal therefore concerns large objects: complete satellites and the discarded sections of rockets. The purpose is preventive. If one of these breaks apart in a collision, it can produce a whole new population of fragments. Taking it away beforehand avoids that multiplication.",
      },
      {
        speaker: "Lecturer",
        text: "Collisions are not the only cause of break-ups. A satellite can stop working while still containing unused fuel and charged batteries. Both can become dangerous if the craft overheats. Operators can reduce these risks before abandoning a satellite, by releasing fuel and discharging its batteries. That second measure needs to be permanent, though. Solar panels may continue producing electricity after the mission ends. Physically separating these from the batteries prevents the charge from building up again. Simply switching off the instruments does not deal with this source of energy.",
      },
      {
        speaker: "Lecturer",
        text: "An abandoned satellite may tumble, so a vehicle using an arm must approach closely and follow its movement accurately. A net offers a different arrangement. It can be launched while the vehicle remains much farther away. That distance is valuable during capture, although it does not necessarily make the subsequent operation easier.",
      },
      {
        speaker: "Lecturer",
        text: "One research programme tested nets inside an aircraft that briefly created weightless conditions. The targets were small physical models of satellites, and weights attached to the corners helped the nets spread around them. Cameras recorded the process. It is tempting to view successful catches as the whole point of the exercise. However, the researchers already had computer models predicting how a net would behave. The recordings allowed them to check those predictions against actual movement. Once they could trust these models, they could use them to design larger nets for a mission. A successful trial was therefore evidence for a design tool, rather than proof that an operational removal system was ready.",
      },
      {
        speaker: "Lecturer",
        text: "After capture, attention shifts to the connection between the two craft. With a net, this is a cable; an arm holds them together more firmly. The latter arrangement offers greater control once contact has been made. Returning to the net, its target may still be tumbling. Unless that motion is checked promptly, the flexible link could wind around both spacecraft. That is why an apparently successful catch may still require urgent action.",
      },
      {
        speaker: "Lecturer",
        text: "Finally, disposal should not just transfer danger from space to people below. Some material can survive the journey through the atmosphere, so the return of a large object may need careful control. Future satellites can also be designed to simplify capture. Visual markers help approaching vehicles identify them. Handles provide somewhere secure to attach. These are useful not only when removing failed equipment: a vehicle arriving to repair or refuel a working satellite can use them too.",
      },
    ],
    itemDesign: [
      "The first answer identifies a broad target category after tiny fragments and two examples compete for attention.",
      "The second answer follows references to stored energy, discharged batteries and a renewed charge.",
      "The third answer separates a capture-stage advantage from the difficulty of later control.",
      "The fourth answer distinguishes predictive computer models from the physical models used as targets.",
      "The fifth answer follows a comparison between an arm and a net, then a change of wording from cable to flexible link.",
      "The final answer distinguishes an identification aid from a physical attachment point.",
    ],
  },
  {
    id: "dictionaries",
    level: "C1",
    title: "How Dictionaries Select New Words",
    description: "Complete six gaps in a set of lecture notes with words from the recording.",
    teacherOnly: true,
    assetsReady: true,
    audioReady: true,
    audioSrc: `${dictionariesAudioRoot}/how-dictionaries-select-new-words.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${dictionariesAudioRoot}/question.mp3`,
    instructions:
      "Listen to a lecture about how dictionaries select new words. Complete the gaps in the notes with a word or two-word phrase from the audio. Remember to check your spelling.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    gaps: [
      {
        id: "search-records",
        answer: "search records",
        acceptedAnswers: ["records"],
        section: "Finding candidates",
        before: "Editors can identify gaps in existing coverage by examining",
        after: ".",
        review: {
          explanation:
            "Repeated unsuccessful searches on the dictionary website create records that reveal expressions visitors expect to find. They identify possible omissions without proving that a word deserves an entry.",
          correctQuote: "search records",
          distractors: [
            {
              quote: "Editors read widely",
              note:
                "Wide reading helps editors notice candidate words, but the note specifically asks about identifying gaps in the dictionary’s existing coverage.",
            },
            {
              quote: "readers send suggestions",
              note:
                "Suggestions are another source of candidates, but they are not the website evidence linked to omissions.",
            },
          ],
        },
      },
      {
        id: "press-release",
        answer: "press release",
        acceptedAnswers: ["release"],
        section: "Checking the evidence",
        before: "Some apparently separate news articles are copies of a company’s",
        after: ".",
        review: {
          explanation:
            "The wording across many news websites can create a misleading impression of broad use. Comparison shows that the articles repeat the company’s original press release.",
          correctQuote: "press release",
          distractors: [
            {
              quote: "product launch",
              note:
                "The launch is the event being promoted, not the written source copied by the articles.",
            },
            {
              quote: "advertisements were written for it later",
              note:
                "The advertisements add campaign appearances but are not the source repeated by the news articles.",
            },
          ],
        },
      },
      {
        id: "publication-dates",
        answer: "publication dates",
        acceptedAnswers: ["dates"],
        section: "Checking the evidence",
        before: "Recording",
        after: "helps establish whether use has continued over time.",
        review: {
          explanation:
            "Publication dates let editors arrange examples in sequence and distinguish sustained use from a brief burst of attention.",
          correctQuote: "publication dates",
          distractors: [
            {
              quote: "details of its source",
              note:
                "Source details identify where evidence appeared; the dates establish its distribution over time.",
            },
            {
              quote: "a fixed waiting period",
              note:
                "The lecturer explicitly says that continued use does not have to be assessed through one fixed delay.",
            },
          ],
        },
      },
      {
        id: "wider-circulation",
        answer: "news reports",
        section: "Checking the evidence",
        before:
          "For technical vocabulary, evidence of wider circulation can come from",
        after: ".",
        review: {
          explanation:
            "Research reports show specialist use, while news reports explaining a public issue demonstrate that the expression has moved into communication for a general audience.",
          correctQuote: "news reports",
          distractors: [
            {
              quote: "Research reports",
              note:
                "These may contain an expression for years without showing that it has circulated beyond the specialist field.",
            },
            {
              quote: "quote a scientist’s unusual terminology",
              note:
                "Merely quoting specialist language is contrasted with using the expression to explain events to the public.",
            },
          ],
        },
      },
      {
        id: "quotation-grammar",
        answer: "grammar",
        section: "Preparing the entry",
        before: "An ordinary quotation may provide essential information about",
        after: ".",
        review: {
          explanation:
            "Questions about whether a noun or preposition can follow a word concern its grammar. A less memorable quotation may reveal that relationship more clearly than one chosen only for its wording.",
          correctQuote: "grammar",
          distractors: [
            {
              quote: "Pronunciation, spelling",
              note:
                "These also require checking, but they are not the language relationship illustrated by nouns and prepositions.",
            },
            {
              quote: "captures the meaning beautifully",
              note:
                "A vivid illustration of meaning may still leave the practical grammatical question unresolved.",
            },
          ],
        },
      },
      {
        id: "usage-labels",
        answer: "usage labels",
        section: "Helping readers",
        before:
          "Readers can assess appropriateness for a particular situation by consulting",
        after: ".",
        review: {
          explanation:
            "Subject labels identify a field such as medicine, whereas usage labels show whether an expression is suitable for contexts such as formal writing or informal conversation.",
          correctQuote: "Usage labels",
          distractors: [
            {
              quote: "Subject labels",
              note:
                "These identify the field of an expression but do not tell readers which social situation it suits.",
            },
            {
              quote: "medicine",
              note:
                "This is an example of a subject field, not guidance about register or situational appropriateness.",
            },
          ],
        },
      },
    ],
    supportingNotes: [
      {
        section: "Finding candidates",
        text: "Dictionary entries describe language already used by the public.",
        beforeGap: "search-records",
      },
      {
        section: "Helping readers",
        text: "An entry may require revision as language changes.",
        afterGap: "usage-labels",
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Today I’d like to explain how editors decide which new words to include in a general English dictionary. Announcements about additions tend to attract attention to unusual expressions. Behind those announcements, however, lies a patient investigation into what people are already saying and writing.",
      },
      {
        speaker: "Woman",
        text: "Finding candidates involves more than noticing fashionable language. Editors read widely, and readers send suggestions, sometimes with very useful supporting material. Another clue comes from the dictionary website itself. When visitors repeatedly look for an expression and receive no result, their search records can reveal an omission. These tell editors where the dictionary may be failing its readers; they do not establish that the expression deserves an entry.",
      },
      {
        speaker: "Woman",
        text: "Suppose a company introduces an expression in a press release promoting a product launch. Editors subsequently find it on dozens of news websites, with further appearances in advertisements. That looks like an impressive range. Comparing the wording, though, reveals that the news articles repeat what the firm issued at the launch, whereas the advertisements were written for it later. The many appearances consequently describe a successful campaign, without showing that other people have adopted the expression for themselves.",
      },
      {
        speaker: "Woman",
        text: "The evidence also needs a time dimension. Each saved passage is accompanied by details of its source, including publication dates. These allow editors to arrange the material in sequence and distinguish a sudden burst of attention from use that continues after the original excitement has faded. This need not involve a fixed waiting period: an expression naming an important new reality may become established remarkably quickly.",
      },
      {
        speaker: "Woman",
        text: "Breadth is particularly important with vocabulary from specialised fields. Research reports can contain an expression for years without making it useful to readers outside that field. Now imagine it occurring in news reports about an issue affecting the public. The articles use it to explain events, rather than merely quote a scientist’s unusual terminology. That provides a different kind of evidence. The expression has moved into communication aimed at a general audience, even though its subject has not changed.",
      },
      {
        speaker: "Woman",
        text: "The next job is to prepare the entry. Pronunciation, spelling and grammar all need checking, alongside the definition. When choosing quotations, editors may find one that captures the meaning beautifully but leaves a practical uncertainty unresolved. Can the word be followed directly by a noun, or does a preposition have to come between them? A less memorable example may make that relationship visible. For learners trying to build their own sentences, this can be more useful than a striking quotation. The selection therefore depends on what the reader needs to discover.",
      },
      {
        speaker: "Woman",
        text: "Readers also need guidance about suitability. Subject labels, such as ‘medicine’, identify a field, but they cannot tell someone whether an expression belongs in a formal letter or a conversation with friends. Usage labels supply that information, marking expressions as informal, for instance. These distinctions help readers choose language for a situation; the fact that an expression has an entry does not settle that choice. Dictionaries document what people use, and their entries remain open to revision as the evidence changes.",
      },
    ],
    itemDesign: [
      "Website search records are explicitly linked with identifying omissions, not proving entry-worthiness.",
      "The second answer requires recovering the original written source behind apparently separate news coverage.",
      "Publication dates distinguish sustained use from a temporary burst of attention.",
      "News reports show movement beyond a specialist field, while research reports remain a competing source type.",
      "The fifth answer connects a later practical example involving nouns and prepositions with an earlier checklist category.",
      "The final answer distinguishes usage labels from subject labels by their function for readers.",
    ],
  },
];

export function getAdvancedListeningPart2Set(setId) {
  return advancedListeningPart2Sets.find((set) => set.id === setId) || advancedListeningPart2Sets[0];
}
