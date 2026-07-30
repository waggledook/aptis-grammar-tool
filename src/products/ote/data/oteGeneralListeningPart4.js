const b1AudioRoot = "/audio/ote/listening/general/part-4/b1-set-1";
const b2AudioRoot = "/audio/ote/listening/general/part-4/b2-set-1";

export const generalListeningPart4Sets = [
  {
    id: "b1-set-1",
    level: "B1",
    title: "B1 Set 1 · Everyday situations",
    description:
      "Five short extracts testing attitude, purpose, programme type and overall evaluation.",
    assetsReady: true,
    audioReady: false,
    instructionAudioReady: false,
    questions: [
      {
        id: "walking-tour",
        context: "A woman is talking to a friend about a guided walking tour.",
        prompt: "What did she think of the tour?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${b1AudioRoot}/question-1.mp3`,
        optionsAudioSrc: `${b1AudioRoot}/options-1.mp3`,
        audioSrc: `${b1AudioRoot}/item-1.mp3`,
        options: [
          { text: "The guide gave too little information." },
          { text: "The route was harder than advertised." },
          { text: "The scenery was disappointing." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The guide knew a lot and stopped regularly to tell us about the area.",
            note: "She evaluates the guide's knowledge and explanations positively.",
          },
          {
            option: 1,
            quote: "they should be more honest about how much effort it takes.",
            note: "Her criticism is that the beginner description did not reflect the route's physical difficulty.",
          },
          {
            option: 2,
            quote: "The views from the top were wonderful",
            note: "The scenery is explicitly described as wonderful rather than disappointing.",
          },
        ],
        script: [
          { speaker: "Man", text: "How was the walking tour?" },
          {
            speaker: "Woman",
            text: "The guide knew a lot and stopped regularly to tell us about the area. The website said the walk was suitable for beginners, though. Halfway up the hill, several people were already exhausted, including me. The views from the top were wonderful, so I'm glad I continued, but they should be more honest about how much effort it takes.",
          },
        ],
        profile: {
          level: "B1",
          words: 64,
          focus: "Identifying an overall opinion from contrasting evaluations",
          distractors: "The guide and scenery are both discussed but evaluated positively.",
        },
        explanation:
          "She praises both the guide and the scenery. Her criticism is that the route required considerably more effort than the beginner description suggested.",
      },
      {
        id: "guitar-classes",
        context: "A man is leaving a voicemail message for a music school.",
        prompt: "Why is he phoning?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${b1AudioRoot}/question-2.mp3`,
        optionsAudioSrc: `${b1AudioRoot}/options-2.mp3`,
        audioSrc: `${b1AudioRoot}/item-2.mp3`,
        options: [
          { text: "to change the time of a lesson" },
          { text: "to complain that the advertisement is incomplete" },
          { text: "to find out what equipment he needs" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "Tuesdays would be ideal, although I may sometimes need to work late.",
            note: "He mentions the class day, but he has not enrolled or arranged a lesson to change.",
          },
          {
            option: 1,
            quote: "The advert gives the course fee and starting date, but not that detail.",
            note: "The missing information explains his question, but his purpose and tone are not a complaint.",
          },
          {
            option: 2,
            quote: "could you tell me whether students need to bring their own instrument?",
            note: "This direct question states the practical information he wants.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "Hi, I saw your advert for the evening guitar classes. Tuesdays would be ideal, although I may sometimes need to work late. Before I register, could you tell me whether students need to bring their own instrument? The advert gives the course fee and starting date, but not that detail. I have an old guitar at home, but I'm not sure if it would be suitable.",
          },
        ],
        profile: {
          level: "B1",
          words: 66,
          focus: "Identifying communicative purpose",
          distractors: "The class day and an omission from the advert are true details but not the reason for the call.",
        },
        explanation:
          "The man has not yet registered, so he is not changing an existing lesson. He mentions a missing detail without complaining and asks specifically whether he must bring a suitable instrument.",
      },
      {
        id: "television-programme",
        context: "Two friends are discussing a television programme.",
        prompt: "What sort of programme is it?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${b1AudioRoot}/question-3.mp3`,
        optionsAudioSrc: `${b1AudioRoot}/options-3.mp3`,
        audioSrc: `${b1AudioRoot}/item-3.mp3`,
        options: [
          { text: "a competition for amateur designers" },
          { text: "a documentary about a family business" },
          { text: "a drama set in the fashion industry" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The judges certainly liked it.",
            note: "Judges, several participants and a new assignment establish the competition format.",
          },
          {
            option: 1,
            quote: "the brother and sister",
            note: "The family relationship is a detail about two contestants, not the programme's genre.",
          },
          {
            option: 2,
            quote: "Next week they have to create clothes from recycled materials.",
            note: "Clothing is one future design task, but the speakers are not describing a fictional drama.",
          },
        ],
        script: [
          { speaker: "Woman", text: "Did you see Making It last night?" },
          {
            speaker: "Man",
            text: "Yes. I thought the brother and sister would argue when they were asked to redesign that shop window.",
          },
          { speaker: "Woman", text: "Me too, but their idea was brilliant. The judges certainly liked it." },
          {
            speaker: "Man",
            text: "They did, although the student from Leeds was better at explaining why she'd chosen those colours. Next week they have to create clothes from recycled materials.",
          },
        ],
        profile: {
          level: "B1",
          words: 63,
          focus: "Recognising programme type from contextual clues",
          distractors: "A family relationship and a clothing assignment activate the two competing genres.",
        },
        explanation:
          "The judges, different participants and weekly design assignments show that this is a competition for amateur designers.",
      },
      {
        id: "neighbour-ben",
        context: "A woman is talking about her neighbour Ben.",
        prompt: "How does she feel about him?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${b1AudioRoot}/question-4.mp3`,
        optionsAudioSrc: `${b1AudioRoot}/options-4.mp3`,
        audioSrc: `${b1AudioRoot}/item-4.mp3`,
        options: [
          { text: "grateful because he helped her move" },
          { text: "annoyed because he ignored what she said" },
          { text: "worried because he might have injured himself" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "I know he was trying to help",
            note: "She acknowledges his intention, but this concession is not her overall feeling.",
          },
          {
            option: 1,
            quote: "sometimes he just doesn't listen.",
            note: "Her final criticism and description of him ignoring the warning communicate annoyance.",
          },
          {
            option: 2,
            quote: "he wasn't hurt.",
            note: "The recording explicitly removes injury as a reason for concern.",
          },
        ],
        script: [
          { speaker: "Man", text: "How did the move go?" },
          {
            speaker: "Woman",
            text: "Mostly fine. Ben from upstairs offered to carry some boxes. I told him not to touch the one with the glasses because it was heavy and I was going to leave it for the removal company. Of course, he picked it up anyway and dropped it. Nothing broke, luckily, and he wasn't hurt. I know he was trying to help, but sometimes he just doesn't listen.",
          },
        ],
        profile: {
          level: "B1",
          words: 71,
          focus: "Inferring feeling from evaluation and tone",
          distractors: "His helpful intention is conceded, while possible injury is explicitly ruled out.",
        },
        explanation:
          "Although she recognises that Ben meant to help, her wording and final comment show annoyance that he ignored her instruction.",
      },
      {
        id: "photography-course",
        context: "A man is talking about an online photography course.",
        prompt: "What was his opinion of the course?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${b1AudioRoot}/question-5.mp3`,
        optionsAudioSrc: `${b1AudioRoot}/options-5.mp3`,
        audioSrc: `${b1AudioRoot}/item-5.mp3`,
        options: [
          { text: "The exercises were generally too easy." },
          { text: "The course did not offer good value for money." },
          { text: "The tutor's advice made the course worthwhile." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "The first few exercises felt basic",
            note: "Only the early exercises are described as basic, not the course generally.",
          },
          {
            option: 1,
            quote: "It cost more than some others I looked at",
            note: "The relative expense is acknowledged, but his final evaluation is that the course was worth the price.",
          },
          {
            option: 2,
            quote: "her advice about light completely changed how I take pictures.",
            note: "The tutor's later feedback is the benefit that supports his positive final evaluation.",
          },
        ],
        script: [
          { speaker: "Woman", text: "Did you finish the online photography course?" },
          {
            speaker: "Man",
            text: "Yes. It cost more than some others I looked at, but there were weekly comments from the tutor, not just recorded videos. The first few exercises felt basic, especially if you'd used a proper camera before. Later on, though, her advice about light completely changed how I take pictures. I wouldn't pay for another course immediately, but this one was worth it.",
          },
        ],
        profile: {
          level: "B1",
          words: 69,
          focus: "Weighing several true details to recover an overall evaluation",
          distractors: "The price and early difficulty are genuine details but are qualified by the final judgement.",
        },
        explanation:
          "The course was relatively expensive and began with basic exercises, but he says it was worthwhile because the tutor's advice changed his photography.",
      },
    ],
  },
  {
    id: "b2-set-1",
    level: "B2",
    title: "B2 Set 1 · Viewpoint and purpose",
    description:
      "Five B2 extracts requiring close attention to qualification, main purpose and overall viewpoint.",
    assetsReady: true,
    audioReady: true,
    instructionAudioReady: true,
    questions: [
      {
        id: "museum-exhibition",
        context: "Two colleagues are talking about a museum exhibition.",
        prompt: "What is the woman's opinion of the exhibition?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${b2AudioRoot}/question-1.mp3`,
        optionsAudioSrc: `${b2AudioRoot}/options-1.mp3`,
        audioSrc: `${b2AudioRoot}/item-1.mp3`,
        options: [
          { text: "It was too crowded to enjoy properly." },
          { text: "It became less engaging as it continued." },
          { text: "It was difficult to follow because it was badly organised." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "I thought it would be packed, but we got in quickly enough.",
            note: "Crowding was an expectation that the actual visit contradicted.",
          },
          {
            option: 1,
            quote: "After that, though, it became rather repetitive.",
            note: "The strong first section gives way to repetition and declining interest.",
          },
          {
            option: 2,
            quote: "There were rows of machines with long written explanations",
            note: "She criticises the presentation, but does not say the exhibition was hard to follow or badly organised.",
          },
        ],
        script: [
          { speaker: "Man", text: "So, was the museum exhibition any good?" },
          {
            speaker: "Woman",
            text: "Better in some ways than I expected. We went on Thursday evening and I thought it would be packed, but we got in quickly enough. And the first section was excellent—lots of old photographs and a guide who really knew his subject. After that, though, it became rather repetitive. There were rows of machines with long written explanations, and by the end I'd stopped reading most of them. I suppose I was hoping for something a bit more lively, especially for children.",
          },
        ],
        profile: {
          level: "B2",
          words: 90,
          focus: "Tracking a changing evaluation across the extract",
          distractors: "Expected crowds are contradicted, while presentation detail supports but does not establish an organisation problem.",
        },
        explanation:
          "She praises the beginning and says the exhibition was not crowded, but her interest declines as the displays become repetitive and less lively.",
      },
      {
        id: "delayed-meeting",
        context: "A man is leaving a voicemail for a colleague.",
        prompt: "Why is he calling?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${b2AudioRoot}/question-2.mp3`,
        optionsAudioSrc: `${b2AudioRoot}/options-2.mp3`,
        audioSrc: `${b2AudioRoot}/item-2.mp3`,
        options: [
          { text: "to ask her to begin part of a meeting without him" },
          { text: "to apologise for not bringing some printed documents" },
          { text: "to say he may have to cancel a meeting with a client" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "could you start with the sales overview instead of waiting for me?",
            note: "This request is the immediate practical purpose of the voicemail.",
          },
          {
            option: 1,
            quote: "I didn't manage to print the handouts before I left.",
            note: "The missing handouts are background information, and he has already emailed the figures.",
          },
          {
            option: 2,
            quote: "I can join by video from the service station.",
            note: "He provides an alternative way to attend rather than suggesting cancellation.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "Hi Nina, it's Oliver. I'm still on the motorway—there's been an accident just outside Leeds, so traffic's barely moving. I've emailed the final figures to everyone, though I didn't manage to print the handouts before I left. If the client gets there before I do, could you start with the sales overview instead of waiting for me? By the time you reach the budget section, I should be there—or, if not, I can join by video from the service station.",
          },
        ],
        profile: {
          level: "B2",
          words: 82,
          focus: "Distinguishing the purpose of a call from its supporting circumstances",
          distractors: "The delay and missing documents are salient, while the video alternative rules out cancellation.",
        },
        explanation:
          "The traffic delay and missing handouts explain the situation, but the man's request is for Nina to begin the sales overview if the client arrives first.",
      },
      {
        id: "urban-food-podcast",
        context: "Two friends are discussing a podcast episode.",
        prompt: "What was the episode mainly about?",
        kind: "text",
        answer: 2,
        instructionAudioSrc: `${b2AudioRoot}/question-3.mp3`,
        optionsAudioSrc: `${b2AudioRoot}/options-3.mp3`,
        audioSrc: `${b2AudioRoot}/item-3.mp3`,
        options: [
          { text: "the environmental effects of transporting food" },
          { text: "why more families are choosing vegetarian diets" },
          { text: "different ways of producing food in urban areas" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "the environmental benefit of food travelling less.",
            note: "Food transport is briefly mentioned as one benefit, not the episode's main subject.",
          },
          {
            option: 1,
            quote: "last week's episode about families cutting down on meat.",
            note: "Vegetarian diets belong to the previous episode.",
          },
          {
            option: 2,
            quote: "how towns can grow food in different ways",
            note: "The varied examples and the speakers' summary establish urban food production as the main topic.",
          },
        ],
        script: [
          { speaker: "Woman", text: "I thought today's podcast would just be about rooftop gardens." },
          {
            speaker: "Man",
            text: "Me too—especially after last week's episode about families cutting down on meat.",
          },
          {
            speaker: "Woman",
            text: "They briefly mentioned the environmental benefit of food travelling less. But it was much broader, wasn't it? They talked about school gardens, a housing-estate project and even a small farm beside a railway line.",
          },
          {
            speaker: "Man",
            text: "Yes, and although they mentioned problems like cost and lack of space, the main idea seemed to be how towns can grow food in different ways and make neighbourhoods stronger at the same time.",
          },
        ],
        profile: {
          level: "B2",
          words: 91,
          focus: "Separating the main topic from related benefits and a previous episode",
          distractors: "Food transport is a genuine side point, while diet is made salient through contrast with last week's programme.",
        },
        explanation:
          "The episode briefly covers shorter food journeys and follows an episode about eating less meat. Its main subject is the variety of ways towns can produce food.",
      },
      {
        id: "volunteer-tutoring",
        context: "A woman is talking about a volunteer tutoring scheme.",
        prompt: "What is her main concern about joining it?",
        kind: "text",
        answer: 1,
        instructionAudioSrc: `${b2AudioRoot}/question-4.mp3`,
        optionsAudioSrc: `${b2AudioRoot}/options-4.mp3`,
        audioSrc: `${b2AudioRoot}/item-4.mp3`,
        options: [
          { text: "the amount of travelling involved" },
          { text: "the limited preparation it offers" },
          { text: "the number of hours volunteers are expected to work" },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "They even refund bus fares, so getting there isn't really the problem.",
            note: "Travel is explicitly dismissed as her concern.",
          },
          {
            option: 1,
            quote: "I'd feel happier with more training at the beginning.",
            note: "She wants more preparation before supporting children independently.",
          },
          {
            option: 2,
            quote: "the hours would actually suit me—it's only Saturday mornings.",
            note: "She considers the time commitment suitable rather than problematic.",
          },
        ],
        script: [
          {
            speaker: "Woman",
            text: "I do like the idea of helping children with reading, and the hours would actually suit me—it's only Saturday mornings. They even refund bus fares, so getting there isn't really the problem. What makes me hesitate is that you're expected to start after just one online introduction. Some of the children apparently need quite a lot of support, so I assumed there'd be a chance to watch an experienced tutor first. They say advice is always available, but I'd feel happier with more training at the beginning.",
          },
        ],
        profile: {
          level: "B2",
          words: 88,
          focus: "Identifying a main concern after alternatives are explicitly qualified",
          distractors: "The hours and travel arrangements are both discussed and then dismissed.",
        },
        explanation:
          "The hours suit her and travel costs are refunded. She hesitates because volunteers begin after only one online introduction, without first observing an experienced tutor.",
      },
      {
        id: "cycle-lane-scheme",
        context: "A man is talking about the town's new cycle-lane scheme.",
        prompt: "What is his opinion of it?",
        kind: "text",
        answer: 0,
        instructionAudioSrc: `${b2AudioRoot}/question-5.mp3`,
        optionsAudioSrc: `${b2AudioRoot}/options-5.mp3`,
        audioSrc: `${b2AudioRoot}/item-5.mp3`,
        options: [
          { text: "It is a good idea, but residents were not properly informed about it." },
          { text: "It has caused too many problems by removing parking spaces." },
          { text: "It is unlikely to reduce traffic in the town centre." },
        ],
        reviewEvidence: [
          {
            option: 0,
            quote: "In principle, I'm in favour of the new cycle lanes.",
            note: "He supports the scheme itself before focusing his criticism on poor communication.",
          },
          {
            option: 1,
            quote: "that isn't really my complaint.",
            note: "He understands the parking concern but explicitly rejects it as his own objection.",
          },
          {
            option: 2,
            quote: "the centre could become less congested.",
            note: "He believes the scheme may reduce congestion rather than doubting that outcome.",
          },
        ],
        script: [
          {
            speaker: "Man",
            text: "In principle, I'm in favour of the new cycle lanes. The old road was dangerous, and if more people cycle to work, the centre could become less congested. I understand why some shop owners are annoyed about losing a few parking spaces, but that isn't really my complaint. What bothered me was how badly the changes were explained. Junctions were altered almost overnight, bus stops moved, and some delivery areas disappeared, yet the council website was vague and the signs appeared far too late. A clearer explanation would have prevented a lot of confusion.",
          },
        ],
        profile: {
          level: "B2",
          words: 94,
          focus: "Recovering an overall stance with a specific secondary criticism",
          distractors: "Parking is somebody else's complaint, while reduced congestion is presented as a possible benefit.",
        },
        explanation:
          "He supports the cycle lanes and thinks they could reduce congestion. His criticism is that residents received unclear and late information about the changes.",
      },
    ],
  },
];

export function getGeneralListeningPart4Set(setId = "b1-set-1") {
  return generalListeningPart4Sets.find((set) => set.id === setId) || generalListeningPart4Sets[0];
}
