function heading(key, text) {
  return { key, text };
}

function paragraph(id, answer, text, summary, evidence, explanation) {
  return { id, answer, text, summary, evidence, explanation };
}

const firstDayAtWork = {
  id: "first-day-at-work",
  kind: "part1",
  part: 1,
  title: "First day at work",
  prompt: "Read the email from Jamie to Alex. Choose one word from the three options for each gap. The first one is done for you.",
  lines: [
    [{ text: "Hi Alex," }],
    [{ text: "I " }, { fixed: "start" }, { text: " my new job on Monday." }],
    [{ text: "I " }, { gap: 1 }, { text: " a black shirt and dark trousers." }],
    [{ text: "The café gets very " }, { gap: 2 }, { text: " at lunchtime, with queues outside." }],
    [{ text: "My manager is " }, { gap: 3 }, { text: " and answers all my questions." }],
    [{ text: "I finish at five, so we can meet " }, { gap: 4 }, { text: "." }],
    [{ text: "Message me " }, { gap: 5 }, { text: " you are free." }],
    [{ text: "Jamie" }],
  ],
  gaps: [
    { id: 1, answer: "wear", options: ["wear", "carry", "hold"], explanation: "You wear clothes on your body. Carry and hold describe having something in your hands rather than being dressed in it." },
    { id: 2, answer: "busy", options: ["busy", "quiet", "empty"], explanation: "Queues outside show that the café has many customers. Busy expresses that idea; quiet and empty contradict the contextual evidence." },
    { id: 3, answer: "helpful", options: ["helpful", "serious", "tired"], explanation: "The manager answers Jamie’s questions, which is evidence that the manager is helpful. Serious and tired are possible descriptions of a manager, but the sentence gives no evidence for them." },
    { id: 4, answer: "afterwards", options: ["afterwards", "earlier", "yesterday"], explanation: "Jamie finishes at five and proposes meeting after that event. Afterwards means after the time or event just mentioned." },
    { id: 5, answer: "if", options: ["if", "where", "what"], explanation: "If introduces the condition for messaging: Alex should message only if Alex is free. Where asks about place and what asks for information." },
  ],
};

const laptopProblem = {
  id: "laptop-problem",
  kind: "part1",
  part: 1,
  title: "Laptop problem",
  prompt: "Read the email from Emma to Noah. Choose one word from the three options for each gap. The first one is done for you.",
  lines: [
    [{ text: "Hi Noah," }],
    [{ text: "Can I " }, { fixed: "borrow" }, { text: " your laptop for the evening?" }],
    [{ text: "Mine stopped working this morning and the screen is " }, { gap: 1 }, { text: "." }],
    [{ text: "I need to finish a report " }, { gap: 2 }, { text: " tomorrow." }],
    [{ text: "The repair shop won't open again " }, { gap: 3 }, { text: " Monday." }],
    [{ text: "Please bring the " }, { gap: 4 }, { text: " because my battery is low." }],
    [{ text: "I can return it " }, { gap: 5 }, { text: " I finish." }],
    [{ text: "Thanks," }],
    [{ text: "Emma" }],
  ],
  gaps: [
    { id: 1, answer: "black", options: ["black", "bright", "clean"], explanation: "A black screen is a common sign that a laptop has stopped working. Bright and clean do not explain the technical problem." },
    { id: 2, answer: "before", options: ["before", "after", "during"], explanation: "The report must be completed earlier than tomorrow. Before expresses that deadline; after reverses it, and during cannot be followed by the time word tomorrow in this structure." },
    { id: 3, answer: "until", options: ["until", "since", "for"], explanation: "In a negative sentence, won't open until Monday means Monday is the point when the shop will next open. Since marks a starting point in the past and for introduces a duration." },
    { id: 4, answer: "charger", options: ["charger", "case", "mouse"], explanation: "A charger supplies power when a battery is low. A case protects the laptop and a mouse controls the pointer, so neither solves the stated problem." },
    { id: 5, answer: "when", options: ["when", "where", "what"], explanation: "When introduces the time at which Emma can return the laptop: after she finishes the report. Where refers to place and what cannot link these two clauses." },
  ],
};

function reorderTask(id, title, genre, difficulty, fixed, sentences, candidateOrder) {
  return {
    id,
    kind: "part2",
    part: 2,
    title,
    genre,
    difficulty,
    fixed,
    candidateOrder,
    instruction: "The sentences below are from a text. Put the sentences in the right order. The first sentence is done for you.",
    sentences: sentences.map(([sentenceId, text, explanation], index) => ({ id: sentenceId, text, order: index + 1, explanation })),
  };
}

const riversideFootbridge = reorderTask(
  "riverside-footbridge",
  "Riverside footbridge",
  "Local report",
  "Moderate–stretch",
  "A riverside footbridge has reopened after being closed for repairs throughout the winter.",
  [
    ["a", "Engineers found damage to several wooden sections after heavy rain last December.", "The opening mentions winter repairs; this sentence explains why those repairs were needed by identifying damage and when it occurred."],
    ["b", "These parts were replaced with stronger materials designed to last longer in wet weather.", "These parts refers directly to the damaged wooden sections in the previous sentence, making this a firm pair."],
    ["c", "The work also included new lighting along the path on both sides of the bridge.", "The work refers to the repairs already described, while also introduces a second improvement after the replacement of the damaged sections."],
    ["d", "This change has made the route safer for people walking home after dark.", "This change specifically refers to the new lighting. After dark confirms why lighting improves safety."],
    ["e", "Because of the improvements, the council expects more residents to use the riverside path this autumn.", "The improvements summarises both the stronger materials and new lighting, so this consequence belongs at the end."],
  ],
  ["c", "e", "a", "d", "b"],
);

const returningHireBike = reorderTask(
  "returning-hire-bike",
  "Returning a hire bike",
  "Instructions",
  "Moderate",
  "Please follow these instructions when returning a bicycle to one of the town's hire stations.",
  [
    ["a", "Choose an empty space and push the front wheel firmly into the metal stand.", "This is the first physical action needed to return the bicycle to a hire station."],
    ["b", "A green light will appear when the bicycle has been locked correctly.", "The green light is the result of pushing the bicycle into the stand and confirms that the first action succeeded."],
    ["c", "If you do not see this signal, remove the bike and try another space.", "This signal refers directly to the green light. The conditional instruction explains what to do when it does not appear."],
    ["d", "Once it is secure, check the hire app to make sure your journey has ended.", "Once it is secure can only follow the locking check. It then introduces the final app check."],
    ["e", "This final check is important because charges continue until the system records the return.", "This final check refers to checking the app in the previous sentence and explains why that last step matters."],
  ],
  ["d", "b", "e", "a", "c"],
);

const harbourRadio = reorderTask(
  "harbour-radio",
  "Harbour Radio",
  "Factual history",
  "Moderate–stretch",
  "Harbour Radio began as a small local station run by volunteers in the early 1990s.",
  [
    ["a", "At first, its programmes were only available to people living near the town centre.", "At first continues the early history introduced by began and explains how limited the original local station was."],
    ["b", "A new transmitter later allowed the station to reach villages along the coast.", "Later moves the history forward, while the new transmitter explains how the station expanded beyond the town centre."],
    ["c", "This larger audience encouraged local businesses to advertise during the most popular shows.", "This larger audience is the direct result of reaching the coastal villages in the previous sentence."],
    ["d", "The extra income paid for better equipment and a larger studio near the harbour.", "The extra income comes from the advertising just mentioned and finances the next stage of the station's development."],
    ["e", "Today, the station still uses that building and produces news, music, and interviews every day.", "Today closes the chronology, and that building refers specifically to the larger studio in the previous sentence."],
  ],
  ["c", "a", "e", "b", "d"],
);

const schoolCafeteriaChanges = reorderTask(
  "school-cafeteria-changes",
  "School cafeteria changes",
  "Survey report",
  "Stretch",
  "A recent survey asked students what they thought about meals served in the school cafeteria.",
  [
    ["a", "Many said the food was good, but they wanted a wider choice of fresh dishes.", "Many refers to the students in the survey and reports the feedback that begins the chain of changes."],
    ["b", "In response, the school added two new options to the lunch menu each day.", "In response links the new menu options directly to the students' request for a wider choice."],
    ["c", "The change was popular, and more students began buying lunch instead of bringing food from home.", "The change refers to adding the new options and gives the positive result of that decision."],
    ["d", "However, longer queues soon formed because more people were using the cafeteria.", "However introduces an unintended negative consequence of the preceding success: increased use produced longer queues."],
    ["e", "To reduce this problem, an extra serving point will open near the main entrance next month.", "This problem refers to the longer queues, and the new serving point is the response that completes the sequence."],
  ],
  ["d", "b", "e", "a", "c"],
);

function matchingTask(id, title, intro, comments, questions) {
  return {
    id,
    kind: "part3",
    part: 3,
    title,
    instruction: intro,
    comments: comments.map(([name, text]) => ({ name, text })),
    questions: questions.map(([questionId, text, answer, evidence, explanation]) => ({ id: questionId, text, answer, evidence, explanation })),
  };
}

const phoneHabits = matchingTask(
  "phone-habits",
  "Trying to Use My Phone Less",
  "Four people were interviewed about attempts to change their phone habits. Read the texts and answer Questions 1–7.",
  [
    ["Sofia", "I used to tell myself I was checking just one message before going to sleep, but twenty minutes later I would still be reading news or watching videos. I eventually realised that relying on self-control was not working while the phone remained beside my bed. I bought an ordinary alarm clock and now leave the phone charging in the kitchen. The first few evenings felt strange, but I fall asleep sooner and no longer wake up to check notifications. I have not introduced strict limits during the day, so my overall use is probably still quite high. Even so, I feel much less tired in the morning."],
    ["Ben", "As a graphic designer, I receive messages from clients and colleagues throughout the working day. I used to respond immediately, even when nothing was urgent, and it became difficult to concentrate on complicated tasks. Rather than removing any apps, I switched off almost all notifications and now check messages at three planned times. I explained that people should call if something genuinely cannot wait. I finish work more quickly and make fewer mistakes, although my weekly screen-time report has not fallen much. I often catch up on messages later and still use my phone for music and news. My aim was to control interruptions, not achieve the lowest possible total."],
    ["Aisha", "I removed my social-media apps after noticing that endless updates about other people’s lives often left me dissatisfied with my own. I did not close the accounts and can still reach them through a browser, but the extra effort prevents me from opening them automatically. I expected to lose touch with people. Instead, because I no longer receive general updates from hundreds of contacts, I send individual messages and voice notes more often and arrange proper calls. I probably communicate with fewer people now, but the conversations feel more substantial. I briefly reinstalled one app while travelling, then removed it again. I want my use to be deliberate rather than completely forbidden."],
    ["Mateo", "Our family’s first idea was to have completely screen-free Sundays. It lasted two weeks. We needed phones for maps, train tickets, banking and coordinating the children’s activities, so the rule created more inconvenience than enjoyment. We replaced it with a much smaller agreement: everyone leaves their phone out of reach during meals. The children protested initially, and the adults occasionally invented reasons why they should be exceptions. Once we all followed it consistently, however, conversation improved and meals felt less rushed. We still make exceptions if somebody is expecting an urgent call. The rule works because it is specific and shared, not because it has transformed our phone use for the entire day."],
  ],
  [
    [1, "Who changes their surroundings to make an unwanted habit less convenient?", "Sofia", "Sofia bought a separate alarm clock and leaves her phone charging in the kitchen rather than beside her bed.", "She changes the physical situation so checking the phone in bed is no longer easy. Aisha changes access to particular platforms, but not her physical surroundings."],
    [2, "Who became more efficient at work without substantially reducing their total phone use?", "Ben", "I finish work more quickly and make fewer mistakes, although my weekly screen-time report has not fallen much.", "Ben improves both the speed and quality of his work even though his overall usage changes very little."],
    [3, "Who found that receiving fewer general updates led to more personal communication?", "Aisha", "Without general updates from hundreds of contacts, Aisha sends individual messages and voice notes and arranges proper calls.", "Receiving less broad social-media information encourages Aisha to communicate more directly with particular friends."],
    [4, "Who achieved more with a limited household agreement than with a more ambitious restriction?", "Mateo", "Screen-free Sundays lasted only two weeks, while putting phones away during meals improved conversation.", "The family gets a positive result from a smaller, specific rule after the more ambitious restriction proves impractical."],
    [5, "Who feels better in the morning after changing an evening habit?", "Sofia", "I fall asleep sooner … Even so, I feel much less tired in the morning.", "Moving the phone out of the bedroom improves Sofia’s night-time habits and how she feels the following morning."],
    [6, "Who protects periods of concentration by postponing communication?", "Ben", "I switched off almost all notifications and now check messages at three planned times.", "Ben delays non-urgent communication so messages do not repeatedly interrupt complicated tasks."],
    [7, "Who discovered that practical arrangements made a complete break from the device unrealistic?", "Mateo", "We needed phones for maps, train tickets, banking and coordinating the children’s activities.", "Dependence on several practical phone functions made spending an entire day without the devices unrealistic."],
  ],
);

const travellingAlone = matchingTask(
  "travelling-alone",
  "Travelling Alone",
  "Four people were interviewed about their experiences of travelling alone. Read the texts and answer Questions 1–7.",
  [
    ["Nina", "My first solo trip happened by accident when the friend who was supposed to join me became ill. I nearly cancelled because I had never organised an entire journey by myself. To avoid uncertainty, I booked nearly everything in advance. Even so, one train was cancelled, I misunderstood the directions to my accommodation and I had to explain a booking problem in a language I barely spoke. None of that was enjoyable at the time, but I dealt with each situation somehow. I returned feeling more capable, not only as a traveller but generally. I still prefer company on longer holidays, but I no longer assume that I need somebody else in order to cope."],
    ["Omar", "When I travel with friends, a surprising amount of time is spent negotiating. One person wants to visit a museum while another wants to sit on the beach, and changing a reservation can become a group discussion. Alone, I can stay somewhere longer if I like it or leave immediately if I do not. That freedom is the main attraction for me. The disadvantage is price. Many hotel rooms cost almost the same whether they contain one guest or two, and I no longer enjoy sharing hostel rooms. I sometimes take a shorter trip because my accommodation budget will not stretch any further. Nevertheless, I would rather travel for fewer days than surrender control of the itinerary."],
    ["Grace", "I expected travelling alone to be lonely, but I have actually spoken to more people than I usually do when accompanied by a friend. When there is nobody familiar beside you, you are more likely to ask another traveller for advice, join a walking tour or accept an invitation to share a table. Several people I met this way are still friends. However, constant introductions can become tiring, particularly when every conversation begins with the same questions about where you come from and where you are going. On longer trips, I now keep one day free from organised activities and spend it entirely by myself. I enjoy meeting people more when I can also choose when to withdraw."],
    ["Pavel", "I frequently travel alone for work, so unfamiliar places no longer make me particularly nervous. Even so, I send my itinerary to my partner, avoid arriving in unknown cities very late and check how I will reach my accommodation before setting off. These habits are not signs that I expect something bad to happen; they simply prevent unnecessary risks and difficult decisions when I am tired. The part I still dislike is eating dinner alone in a formal restaurant. Exploring a city by myself feels completely natural, but sitting at a table with an empty chair opposite me does not. I often choose food markets, counter seating or an evening cookery class instead."],
  ],
  [
    [1, "Who became more confident after managing unexpected difficulties independently?", "Nina", "Nina dealt with a cancelled train, incorrect directions and a booking problem, then returned feeling more capable.", "Handling several unexpected difficulties by herself increased Nina’s confidence. Pavel was already an experienced solo traveller."],
    [2, "Who prefers not to consult other people when altering an itinerary?", "Omar", "Alone, I can stay somewhere longer if I like it or leave immediately if I do not.", "Omar values control of the itinerary and the freedom to alter plans without negotiating with companions."],
    [3, "Who communicates with more unfamiliar people when travelling without a companion?", "Grace", "I have actually spoken to more people than I usually do when accompanied by a friend.", "Travelling without somebody familiar encourages Grace to approach other travellers and join shared activities."],
    [4, "Who continues to follow precautions despite being an experienced solo traveller?", "Pavel", "Pavel shares his itinerary, avoids arriving very late and plans how to reach his accommodation.", "Pavel travels alone frequently but still follows several precautions. Nina plans in advance because she is inexperienced."],
    [5, "Who sometimes reduces the duration of a journey because of an additional expense?", "Omar", "Hotel rooms often cost almost the same for one guest as for two, so Omar sometimes takes a shorter trip.", "Paying for accommodation alone raises the individual cost and can reduce how many days Omar can afford."],
    [6, "Who deliberately includes some time away from new acquaintances?", "Grace", "On longer trips, I now keep one day free from organised activities and spend it entirely by myself.", "Grace enjoys meeting people but intentionally creates a break from repeated social interaction."],
    [7, "Who feels uncomfortable doing one everyday activity alone?", "Pavel", "Pavel feels comfortable exploring alone but dislikes eating dinner alone in a formal restaurant.", "His discomfort relates specifically to eating dinner, not to solo travel generally."],
  ],
);

export const APTIS_READING_MOCKS = [
  {
    id: "reading-mock-1",
    version: "001",
    title: "Aptis General Reading Mock 1",
    part1: firstDayAtWork,
    part2Tasks: [riversideFootbridge, returningHireBike],
    part3: phoneHabits,
    sections: [firstDayAtWork, riversideFootbridge, returningHireBike, phoneHabits],
    part4: {
      id: "shipping-container-revolution",
      part: 4,
      title: "The Shipping Container Revolution",
      instruction: "Read the passage quickly. Choose a heading for each numbered paragraph (1–7). There is one more heading than you need.",
      headings: [
        heading("A", "Moving the box instead of everything inside"),
        heading("B", "Protecting goods from damage and theft"),
        heading("C", "Agreement turns one design into a world standard"),
        heading("D", "The high price of loading everything separately"),
        heading("E", "An adaptable structure begins a different career"),
        heading("F", "The weakness of a tightly connected system"),
        heading("G", "Faster ports require far fewer workers"),
        heading("H", "A metal box transforms where goods are made"),
      ],
      unusedHeading: "B",
      unusedExplanation: "Damage and theft appear in paragraph 1, but only as effects of repeated handling. The paragraph’s central idea is the cost and inefficiency of loading separate pieces, so D is the stronger heading.",
      paragraphs: [
        paragraph(1, "D", "A photograph of an early twentieth-century port shows intense activity but little of the speed associated with modern trade. Sacks, cases, barrels and machinery arrived in different shapes and were handled separately, while a ship might spend longer waiting beside the quay than travelling across the ocean. The repeated handling also created opportunities for goods to be broken, misplaced or stolen. Shipping itself was not always the largest expense; moving cargo between a train, a warehouse, a lorry and the ship could cost far more. Any improvement would therefore have to change what happened on land as well as at sea.", "Separate handling made ports slow and unexpectedly expensive.", "Shipping itself was not always the largest expense; moving cargo … could cost far more.", "D captures the whole paragraph: it contrasts the sea journey with the greater cost of repeatedly moving separate items on land. B mentions a real detail, but damage and theft are supporting consequences rather than the main idea."),
        paragraph(2, "A", "Malcolm McLean understood this problem from the road. As the owner of an American trucking company, he saw how much time was lost while workers unloaded vehicles and transferred their contents onto ships. Metal cargo boxes already existed, so his breakthrough was not simply inventing another one but moving the sealed box between lorry, train and ship without unpacking it at every stage. In 1956, a converted vessel called the Ideal-X carried 58 such containers from New Jersey to Texas. Loading required expensive cranes and redesigned docks, but once those were available, the time and labour needed for each journey fell dramatically.", "McLean’s innovation was transferring one sealed box between forms of transport.", "moving the sealed box between lorry, train and ship without unpacking it", "A paraphrases the key contrast: the contents no longer had to be unloaded and handled at each transfer; the complete box moved instead."),
        paragraph(3, "G", "What looked like a technical improvement to shipping companies threatened an established way of life on the waterfront. Traditional ports employed large teams when vessels arrived, and dockworkers had developed specialist skills and strong unions. Containers replaced much of their physical work with cranes, vehicles and smaller permanent teams. Resistance was therefore not merely fear of unfamiliar machinery: thousands of jobs and whole dockside communities were at risk. Negotiations produced compensation, retirement arrangements and guarantees for some existing workers. New occupations also appeared, including crane operation and equipment maintenance, but they required different training and never employed everyone displaced by the change.", "Container ports became faster but displaced many dockworkers.", "cranes, vehicles and smaller permanent teams", "G combines the operational change with its human consequence. The paragraph repeatedly focuses on fewer workers, lost jobs and the smaller teams required by container ports."),
        paragraph(4, "C", "Shipping companies initially developed boxes of several sizes with different lifting devices. A container that suited one company’s ship might not fit another firm’s railway wagon or crane, limiting the idea’s value. During the 1960s, international committees agreed specifications covering dimensions, strength and lifting fittings, while McLean helped by making relevant patents available without charging royalties. Manufacturers could then build ships, cranes, trains and lorries around the same basic unit. Standardisation may have attracted less public attention than the first voyage, but it allowed containers to travel through an international network rather than remain part of separate private systems.", "International standards made containers compatible across one network.", "international committees agreed specifications", "C matches both the action—agreement on specifications—and its result: one compatible design could operate internationally instead of inside separate company systems."),
        paragraph(5, "H", "Once transport became cheaper and more predictable, companies no longer needed to place every stage of production near the final customer. Components could be manufactured in several countries, packed once and transferred between vehicles with little delay. Ports changed as well. Traditional city-centre docks, with narrow spaces and waterside warehouses, could not accommodate vast storage yards or large container cranes. New terminals developed on cheaper land farther from urban centres, while some former dock districts declined or found new uses. The container did not create globalisation alone, but it provided the dependable physical system on which long international supply chains could grow.", "Reliable container transport enabled international production chains.", "Components could be manufactured in several countries", "H expresses the paragraph’s broad effect on manufacturing geography. Cheaper, predictable transport allowed production stages to be distributed across different countries."),
        paragraph(6, "F", "The system connecting distant producers can also spread disruption rapidly, while regular container deliveries allow firms to operate with limited stocks of parts. If a major port closes, a canal is blocked or containers accumulate in the wrong region, factories and shops thousands of kilometres away may soon experience shortages. Larger ships and concentrated terminals reduce costs in normal conditions, yet they also place more activity at fewer critical points. Following recent supply-chain crises, some businesses have begun keeping additional stock or using several suppliers. These choices provide protection, but they also surrender part of the efficiency that containerisation originally promised.", "An efficient global network can transmit disruption and create vulnerable points.", "place more activity at fewer critical points", "F captures the trade-off developed throughout the paragraph: close connections and concentrated infrastructure improve efficiency in normal times but make distant businesses vulnerable when one point fails."),
        paragraph(7, "E", "After years of salt water and heavy loads, a container may no longer be suitable for international transport, but its regular shape suggests other possibilities. Retired boxes have become workshops, cafés, temporary shops and even homes. They are strong, widely available and easy to move, and units can be joined into larger structures. Nevertheless, converting one is not automatically cheap or environmentally friendly. Steel walls conduct heat and provide little ventilation, and cutting openings for doors or windows can weaken the frame unless it is reinforced. Reuse works best when the design takes account of the object’s limitations rather than assuming that an unwanted box is already a finished building.", "Retired containers can be adapted for new uses, although conversion has limits.", "Retired boxes have become workshops, cafés, temporary shops and even homes.", "E describes a structure ending its shipping career and being adapted for a new one. The warnings about conversion qualify that main idea rather than replacing it."),
      ],
    },
  },
  {
    id: "reading-mock-2",
    version: "002",
    title: "Aptis General Reading Mock 2",
    part1: laptopProblem,
    part2Tasks: [harbourRadio, schoolCafeteriaChanges],
    part3: travellingAlone,
    sections: [laptopProblem, harbourRadio, schoolCafeteriaChanges, travellingAlone],
    part4: {
      id: "svalbard-global-seed-vault",
      part: 4,
      title: "The Svalbard Global Seed Vault",
      instruction: "Read the passage quickly. Choose a heading for each numbered paragraph (1–7). There is one more heading than you need.",
      headings: [
        heading("A", "A reserve is used for the first time"),
        heading("B", "Why valuable collections need a second home"),
        heading("C", "Several defences protect the stored material"),
        heading("D", "A changing climate exposes a weakness"),
        heading("E", "Remote but still possible to reach"),
        heading("F", "Countries place their seeds under shared control"),
        heading("G", "Cooperation without giving up ownership"),
        heading("H", "One vault cannot protect crops by itself"),
      ],
      unusedHeading: "F",
      unusedExplanation: "Paragraph 4 describes international cooperation, but explicitly says that each depositor keeps control of its own material. Heading F reverses that relationship; G states it accurately.",
      paragraphs: [
        paragraph(1, "B", "A field planted with a single modern variety may produce an impressive harvest, yet uniformity carries a hidden risk. A disease, pest or change in climate that harms one plant can affect every other plant with identical characteristics. Older local varieties may contain useful resistance, but many disappear when farmers replace them with more profitable crops, so gene banks preserve seeds for breeders to use in the future. These collections, however, remain vulnerable to equipment failure, natural disaster, war and inadequate funding. Just as important computer files are stored in more than one place, valuable seeds need duplicate copies beyond the institution that uses them.", "Gene-bank collections are valuable but vulnerable, so they need duplicates elsewhere.", "valuable seeds need duplicate copies beyond the institution that uses them", "B states the paragraph’s conclusion and preserves its backup metaphor: collections need a second location because the originals can be lost through conflict, disaster or technical failure."),
        paragraph(2, "E", "A secure vault must be separated from conflict and natural hazards without becoming impossible to reach, and Svalbard offered an unusual balance. The archipelago lies deep inside the Arctic Circle, away from major military and industrial activity, yet regular flights connect its main settlement to mainland Norway. The surrounding rock is stable, the cold climate reduces the artificial cooling required, and the site is high enough above the sea to resist projected rises in water level. Political stability and reliable local infrastructure were as important as the ice. Remoteness would be of little value if staff and new deposits could never reach the facility safely.", "Svalbard combines useful isolation with practical access.", "away from major military and industrial activity, yet regular flights connect its main settlement", "E mirrors the central contrast signalled by “yet”: the site is remote enough for security but accessible enough for staff and deposits."),
        paragraph(3, "C", "Visitors see a narrow concrete entrance emerging from a snowy mountainside, but the storage chambers lie more than one hundred metres inside the rock. Seeds are dried, sealed in special packets and packed into boxes before arriving. Refrigeration maintains the chambers at approximately minus 18 degrees Celsius, the recommended temperature for long-term storage, while the mountain’s natural cold should slow warming if the machinery stops. The long access tunnel, restricted entry and thick rock provide further protection from events outside. Rather than trusting a single dramatic feature, the design places a series of physical and environmental defences around the collection.", "Layers of preparation, cooling, access control and rock protect the seeds.", "a series of physical and environmental defences", "C is an overview of the paragraph’s list. The design does not depend on one defence: packaging, refrigeration, natural cold, distance, restricted entry and rock all contribute."),
        paragraph(4, "G", "Although the Norwegian government owns the building, it does not own the material stored on its shelves. National and international gene banks send duplicate samples under what are called black-box conditions. Staff in Svalbard do not open the packages, and an institution cannot request seeds deposited by somebody else. Only the original depositor can withdraw its boxes. Storage is provided without charge, while Norway, the Nordic Genetic Resource Center and the Crop Trust share responsibility for management and support. This arrangement encourages participation by allowing countries to cooperate without transferring control of valuable genetic resources to a new international authority.", "Depositors cooperate through the vault while retaining ownership and control.", "cooperate without transferring control", "G accurately combines the two ideas the paragraph insists upon: shared international management and individual ownership. F is the distractor because it claims that control is shared."),
        paragraph(5, "A", "For several years, withdrawals remained a possibility rather than an actual event. That changed after conflict made ICARDA’s gene bank in Aleppo, Syria, impossible to operate normally. Fortunately, the organisation had already sent duplicates of much of its collection to Svalbard. In 2015 it became the first depositor to request their return, sending the material to new facilities in Morocco and Lebanon. Staff grew the plants, produced fresh seeds and later deposited new duplicates in the Arctic. The episode demonstrated that the vault was not a museum merely preserving old varieties: its contents could help rebuild a working collection when the original location was lost.", "The Syrian conflict led to the vault’s first withdrawal and helped rebuild a collection.", "the first depositor to request their return", "A focuses on the paragraph’s defining event: for the first time, a reserve held in Svalbard was withdrawn and put back into practical use."),
        paragraph(6, "D", "The Arctic later exposed a weakness in a building chosen partly for its frozen surroundings. During unusually warm and wet weather in 2016, water entered the access tunnel and froze before reaching the storage chambers. No seeds were damaged, but the incident challenged assumptions about the local climate. Norway responded with improvements including better drainage, waterproof barriers and the removal of heat-producing equipment from the tunnel. Refrigeration had always been necessary because the natural permafrost was not cold enough for ideal storage. A changing climate has made active engineering and monitoring even more important to a project whose popular image depends on permanent ice.", "Warm, wet conditions revealed a design weakness and prompted improvements.", "A changing climate has made active engineering and monitoring even more important", "D links the unusual weather to the vulnerability it exposed. The paragraph then explains how engineering changes responded to that climate-related weakness."),
        paragraph(7, "H", "Rows of sealed boxes suggest that the future of the world’s food has been secured, but the vault protects only part of a much larger system. Some important crops do not produce seeds that can be stored successfully in this way. Other collections must regularly plant stored material to produce fresh seeds, while breeders need access to living collections in order to develop new varieties. Farmers also preserve diversity by continuing to grow locally adapted crops. Svalbard supplies essential insurance when another collection is damaged, but it cannot perform all these roles. Long-term security therefore depends on the vault remaining part of an active international system rather than being treated as its replacement.", "Svalbard is valuable insurance, but crop diversity depends on a wider living system.", "it cannot perform all these roles", "H expresses the limitation developed through the whole paragraph. The vault is one important backup, not a complete replacement for gene banks, breeders and farmers."),
      ],
    },
  },
];

export function getAptisReadingMock(mockId) {
  return APTIS_READING_MOCKS.find((mock) => mock.id === mockId) || APTIS_READING_MOCKS[0];
}
