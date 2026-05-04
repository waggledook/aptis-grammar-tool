function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanTopic(topic) {
  return String(topic || "general").replace(/-/g, " ");
}

function exampleForCollocation(collocation, pattern) {
  const phrase = collocation.toLowerCase();

  if (phrase.startsWith("of ")) {
    return `She gave me a useful piece ${phrase} before the meeting.`;
  }

  if (phrase.startsWith("for ")) {
    return `There is still room ${phrase} in this area.`;
  }

  if (phrase.startsWith("piece of ")) {
    return `She gave me a useful ${phrase} before the meeting.`;
  }

  if (phrase.includes(" of ")) {
    return `The article referred to the ${phrase} in its conclusion.`;
  }

  if (pattern === "noun + noun") {
    return `The article referred to the ${phrase} in its conclusion.`;
  }

  return `The article referred to the ${phrase} in its conclusion.`;
}

const CURATED_COLLOCATION_CONTENT = {
  "absolute agony": {
    definition: "Extreme physical or mental pain.",
    example: "Waiting for the test results was absolute agony for the whole family.",
  },
  "absolute despair": {
    definition: "A complete loss of all hope.",
    example: "He felt a sense of absolute despair when he realized he had lost all his research data.",
  },
  "absolute certainty": {
    definition: "Being 100% sure without any doubt.",
    example: "I can say with absolute certainty that we will meet our deadline this time.",
  },
  "absolute necessity": {
    definition: "Something that is essential and cannot be done without.",
    example: "In this job, having a high level of attention to detail is an absolute necessity.",
  },
  "active ingredient": {
    definition: "The specific part of a substance that produces its biological effect.",
    example: "The active ingredient in this medication is known to cause drowsiness in some patients.",
  },
  "active role": {
    definition: "Taking a significant or influential part in a process or activity.",
    example: "Parents are encouraged to play an active role in their children's school activities.",
  },
  "active lifestyle": {
    definition: "A way of living that includes regular physical exercise and movement.",
    example: "Maintaining an active lifestyle is crucial for long-term cardiovascular health.",
  },
  "active participation": {
    definition: "Being involved and engaged in an activity rather than just watching.",
    example: "The success of the workshop depends on the active participation of everyone in the room.",
  },
  "alternative energy": {
    definition: "Power generated from sources that do not deplete natural resources, such as solar or wind.",
    example: "The government is investing heavily in alternative energy sources like wind and solar power.",
  },
  "alternative medicine": {
    definition: "Medical treatments used instead of, or alongside, standard scientific medicine.",
    example: "Many people turn to alternative medicine when conventional treatments don't provide relief.",
  },
  "alternative route": {
    definition: "Another way to get somewhere if the usual path is blocked or unavailable.",
    example: "The main highway was closed due to an accident, so we had to take an alternative route.",
  },
  "alternative strategy": {
    definition: "A different plan of action to achieve a goal if the first one fails.",
    example: "If this marketing plan doesn't work, we need to have an alternative strategy ready to go.",
  },
  "alternative way": {
    definition: "A different method or approach for doing something.",
    example: "We need to find an alternative way to explain the grammar point to weaker students.",
  },
  "alternative treatment": {
    definition: "A different form of medical care or therapy from the usual one.",
    example: "The doctor discussed an alternative treatment after the first medication caused side effects.",
  },
  "artificial limb": {
    definition: "A man-made replacement for a missing arm or leg.",
    example: "Modern technology has allowed for the creation of an artificial limb that responds to nerve signals.",
  },
  "artificial intelligence": {
    definition: "Computer systems designed to perform tasks that normally require human intelligence.",
    example: "Many companies are using artificial intelligence to automate their customer service departments.",
  },
  "artificial light": {
    definition: "Light produced by man-made sources rather than the sun.",
    example: "Plants often struggle to grow without natural sunlight, even if they have plenty of artificial light.",
  },
  "artificial sweetener": {
    definition: "A chemical substance used instead of sugar to make food or drink taste sweet.",
    example: "I prefer using an artificial sweetener in my coffee to reduce my daily calorie intake.",
  },
  "bad breath": {
    definition: "An unpleasant smell coming from a person's mouth.",
    example: "Eating garlic is delicious, but it often leads to bad breath the next morning.",
  },
  "bad diet": {
    definition: "A routine of eating food that is unhealthy or lacking in necessary nutrients.",
    example: "A bad diet combined with a lack of exercise can lead to serious health issues later in life.",
  },
  "bad habit": {
    definition: "A regular behavior that is considered harmful, annoying, or undesirable.",
    example: "Biting your nails is a common bad habit that can be very difficult to break.",
  },
  "bad mood": {
    definition: "A temporary state of feeling unhappy, annoyed, or irritable.",
    example: "Don't take it personally; he's just in a bad mood because he didn't sleep well.",
  },
  "bad temper": {
    definition: "A tendency to become angry or annoyed very easily.",
    example: "His bad temper often caused arguments with colleagues over small problems.",
  },
  "balanced diet": {
    definition: "Eating a variety of foods in the right amounts to maintain good health.",
    example: "The doctor emphasized that a balanced diet is the foundation of a healthy immune system.",
  },
  "balanced budget": {
    definition: "A financial plan where the money spent does not exceed the money earned.",
    example: "The city council worked through the night to ensure they could present a balanced budget.",
  },
  "balanced view": {
    definition: "A perspective that considers all sides of an issue fairly and objectively.",
    example: "To write a good essay, you need to present a balanced view of the argument.",
  },
  "balanced perspective": {
    definition: "A way of looking at a situation that is sensible and not extreme.",
    example: "Having children gave him a more balanced perspective on what is truly important in life.",
  },
  "bare essentials": {
    definition: "The most basic things you need to survive or complete a specific task.",
    example: "When we went backpacking, we only packed the bare essentials to keep our bags light.",
  },
  "bare minimum": {
    definition: "The smallest possible amount of something that is required or acceptable.",
    example: "He only does the bare minimum at work, never staying a minute later than necessary.",
  },
  "bare feet": {
    definition: "Feet that are not covered by any shoes, socks, or stockings.",
    example: "There is nothing better than walking through the cool grass in bare feet on a summer morning.",
  },
  "bare walls": {
    definition: "Walls that have no pictures, decorations, or paint on them.",
    example: "The apartment felt cold and empty with nothing but bare walls and no furniture.",
  },
  "basic right": {
    definition: "A fundamental legal or moral entitlement that every human being should have.",
    example: "Access to clean drinking water should be considered a basic right for everyone on the planet.",
  },
  "basic skill": {
    definition: "A simple but necessary ability, such as reading, writing, or basic arithmetic.",
    example: "Learning how to manage your finances is a basic skill that should be taught in every school.",
  },
  "basic need": {
    definition: "Something that is absolutely necessary for survival, like food, water, or shelter.",
    example: "The charity focuses on providing for the basic needs of families affected by the flood.",
  },
  "basic principle": {
    definition: "A fundamental rule, law, or belief that forms the foundation of a system.",
    example: "The basic principle of the experiment is to observe how plants react to different levels of light.",
  },
  "best friends": {
    definition: "The people you know the best, like the most, and trust completely.",
    example: "We have been best friends since primary school and still talk every single day.",
  },
  "best interests": {
    definition: "What will bring the most advantage or benefit to a person in the long run.",
    example: "The lawyer assured her that he was acting in her best interests during the negotiations.",
  },
  "best effort": {
    definition: "Doing something with as much energy, care, and hard work as you possibly can.",
    example: "Even though we didn't win the match, I am proud of the team because everyone gave their best effort.",
  },
  "best scenario": {
    definition: "The most positive or ideal outcome that could possibly happen in a situation.",
    example: "In the best scenario, the weather clears up and we can hold the wedding ceremony outdoors.",
  },
  "big decision": {
    definition: "A choice that is very important and will have a significant impact on your life.",
    example: "Choosing which university to attend is a big decision that requires a lot of thought.",
  },
  "big disappointment": {
    definition: "A feeling of great sadness or dissatisfaction when something is not as good as hoped.",
    example: "Failing the driving test for the third time was a big disappointment for Sarah.",
  },
  "big mistake": {
    definition: "A serious error that leads to significant problems or negative consequences.",
    example: "I realized I made a big mistake by deleting the file before making a backup copy.",
  },
  "big surprise": {
    definition: "An unexpected event or piece of news that causes a lot of excitement or shock.",
    example: "The party was a big surprise; I had no idea all my friends were hiding in the living room!",
  },
  "blind faith": {
    definition: "Complete trust in something or someone without asking for proof or considering the risks.",
    example: "Investment is about data and research; you should never put blind faith in a 'hot tip' from the internet.",
  },
  "blind loyalty": {
    definition: "Devotion to a person or cause that continues even when they are wrong or doing something harmful.",
    example: "The manager expected blind loyalty from his staff, which made it impossible for anyone to point out his mistakes.",
  },
  "blind obedience": {
    definition: "Following orders immediately without questioning whether they are right or sensible.",
    example: "Military training often emphasizes blind obedience to ensure that orders are followed during a crisis.",
  },
  "blind spot": {
    definition: "An area where a person's view is obstructed, or a subject about which someone lacks understanding or impartial judgment.",
    example: "Even the best drivers have a blind spot, so it's essential to check over your shoulder before changing lanes.",
  },
  "brief chat": {
    definition: "A very short and informal conversation.",
    example: "Do you have five minutes? I'd like to have a brief chat about the upcoming project.",
  },
  "brief meeting": {
    definition: "A formal gathering that lasts for only a short period to discuss specific points.",
    example: "The CEO called a brief meeting this morning to announce the new department head.",
  },
  "brief description": {
    definition: "A short account that gives the main details of something without being too specific.",
    example: "The brochure provides a brief description of all the hotel facilities and local attractions.",
  },
  "brief visit": {
    definition: "A short stay or stop at a place.",
    example: "We only had time for a brief visit to the museum, but we saw the main gallery.",
  },
  "bright future": {
    definition: "A situation where someone is likely to be very successful or happy in the years to come.",
    example: "With her talent and work ethic, there is no doubt she has a bright future in the tech industry.",
  },
  "bright idea": {
    definition: "A clever or innovative thought or plan.",
    example: "Max had the bright idea of using solar-powered lights for the garden party.",
  },
  "bright colour": {
    definition: "A shade that is strong, intense, and easy to see, like vivid red or yellow.",
    example: "The nursery was painted in bright colours to create a cheerful environment for the children.",
  },
  "bright smile": {
    definition: "A look of happiness that is very noticeable and makes the person's face light up.",
    example: "She greeted every guest with a bright smile as they walked through the door.",
  },
  "casual clothes": {
    definition: "Informal clothing that is comfortable and not intended for special or formal occasions.",
    example: "The invitation says 'business casual,' so you don't need a suit, but don't wear your gym casual clothes either.",
  },
  "casual relationship": {
    definition: "A romantic or sexual involvement between two people who do not intend to be committed to each other long-term.",
    example: "They decided to keep it a casual relationship since both of them are moving to different cities soon.",
  },
  "casual acquaintance": {
    definition: "Someone you know slightly, but who is not a close friend.",
    example: "I wouldn't say we're friends; he's more of a casual acquaintance I see at the gym sometimes.",
  },
  "clean energy": {
    definition: "Energy that comes from renewable, zero-emission sources that do not pollute the atmosphere.",
    example: "The transition to clean energy is essential to meeting our global climate targets.",
  },
  "clean record": {
    definition: "A history of behavior, especially professional or legal, that contains no mistakes, crimes, or complaints.",
    example: "She was offered the high-level security job because of her clean record and years of experience.",
  },
  "clean break": {
    definition: "A complete and sudden separation from a person, organization, or situation.",
    example: "After the company was sold, he decided to make a clean break and move to a different industry entirely.",
  },
  "clean conscience": {
    definition: "A feeling of being free from guilt because you know you have done nothing wrong.",
    example: "He told the truth to the investigators so he could go home with a clean conscience.",
  },
  "clean power": {
    definition: "Electricity produced by methods that do not harm the environment (similar to clean energy).",
    example: "Investments in clean power infrastructure have doubled in the last decade.",
  },
  "clean air": {
    definition: "Air that is free from smoke, chemicals, or other pollutants.",
    example: "Moving from the city to the mountains allowed them to finally enjoy some clean air.",
  },
  "clear message": {
    definition: "A piece of information or an idea that is easy to understand and has no hidden meaning.",
    example: "The principal sent a clear message that bullying would not be tolerated in the school.",
  },
  "clear understanding": {
    definition: "A complete and accurate grasp of a particular subject or situation.",
    example: "Before we start the project, I want to make sure everyone has a clear understanding of their role.",
  },
  "clear evidence": {
    definition: "Facts or information that prove something is true beyond any doubt.",
    example: "There is clear evidence that regular exercise improves mental health and focus.",
  },
  "clear view": {
    definition: "A sight of something that is not blocked by anything.",
    example: "We hiked to the top of the hill to get a clear view of the valley below.",
  },
  "common knowledge": {
    definition: "Something that is known by almost everyone.",
    example: "It is common knowledge that you should wash your hands before preparing food.",
  },
  "common language": {
    definition: "A shared way of communicating, or technical terms that people in the same field all understand.",
    example: "Music is often called a common language because it can be understood by people from all cultures.",
  },
  "common sense": {
    definition: "The ability to use good judgment and think in a practical way about everyday situations.",
    example: "You don't need a degree to know that-it's just common sense.",
  },
  "common goal": {
    definition: "A target or objective that two or more people are working together to achieve.",
    example: "Despite their political differences, the two leaders worked toward the common goal of improving the local economy.",
  },
  "complete agreement": {
    definition: "When everyone involved has exactly the same opinion about something.",
    example: "The committee was in complete agreement that the budget needed to be increased.",
  },
  "complete idiot": {
    definition: "A very informal (and slightly rude) way to describe someone who has done something very foolish.",
    example: "I felt like a complete idiot when I realized I had been wearing my shirt inside out all day.",
  },
  "complete surprise": {
    definition: "An event or piece of news that was totally unexpected.",
    example: "Winning the award was a complete surprise; I didn't even know I had been nominated.",
  },
  "complete silence": {
    definition: "A state where there is absolutely no noise at all.",
    example: "The audience sat in complete silence as the pianist began the final movement.",
  },
  "dead end": {
    definition: "A road or passage with no exit; or a situation where no further progress is possible.",
    example: "The investigation reached a dead end when the lead witness refused to testify.",
  },
  "dead body": {
    definition: "A person or animal that is no longer living.",
    example: "The hikers were shocked to find a dead body near the trail and immediately called the police.",
  },
  "dead silence": {
    definition: "A state of absolute, total quietness.",
    example: "When the teacher asked who had broken the window, there was dead silence in the classroom.",
  },
  "dead battery": {
    definition: "A battery that has no electrical power left in it.",
    example: "I couldn't call for help because my phone had a dead battery.",
  },
  "deadly weapon": {
    definition: "An object, such as a gun or knife, that is capable of causing death.",
    example: "The suspect was charged with assault with a deadly weapon after the confrontation.",
  },
  "deadly poison": {
    definition: "A substance that is extremely likely to cause death if ingested or touched.",
    example: "Certain mushrooms found in this forest contain a deadly poison that has no known cure.",
  },
  "deadly silence": {
    definition: "A silence that feels tense, ominous, or suggests something bad is about to happen.",
    example: "After the verdict was read, a deadly silence fell over the courtroom.",
  },
  "deadly disease": {
    definition: "An illness that is very likely to result in the death of the person who has it.",
    example: "Medical researchers are working tirelessly to find a vaccine for this deadly disease.",
  },
  "early days": {
    definition: "The beginning stages of a project, process, or period of time.",
    example: "It's still early days, but the initial feedback on the new software has been very positive.",
  },
  "early riser": {
    definition: "A person who habitually wakes up early in the morning.",
    example: "Being an early riser allows me to get two hours of work done before the rest of the office arrives.",
  },
  "early start": {
    definition: "Beginning an activity or journey at an early hour.",
    example: "We need an early start tomorrow if we want to beat the traffic and reach the coast by noon.",
  },
  "early retirement": {
    definition: "Leaving one's career permanently before reaching the standard age of retirement.",
    example: "He was able to take early retirement at fifty-five thanks to a successful career in finance.",
  },
  "easy answer": {
    definition: "A solution or explanation that is simple to understand but may be oversimplified.",
    example: "There is no easy answer to the global housing crisis; it requires a complex, multi-faceted approach.",
  },
  "easy money": {
    definition: "Money that is earned quickly and with very little effort, sometimes in a suspicious way.",
    example: "He thought gambling was easy money, but he ended up losing his entire savings.",
  },
  "easy target": {
    definition: "Someone or something that is easy to criticize, deceive, or attack.",
    example: "Tourists who don't pay attention to their surroundings are often an easy target for pickpockets.",
  },
  "easy victory": {
    definition: "A win that is achieved without much struggle, effort, or competition.",
    example: "The team's superior training led to an easy victory in the first round of the tournament.",
  },
  "empty promises": {
    definition: "Vows or assurances that the speaker has no intention of keeping.",
    example: "The voters are tired of hearing empty promises from politicians who never follow through.",
  },
  "empty words": {
    definition: "Statements that sound sincere or impressive but lack any real meaning or action behind them.",
    example: "Without a concrete plan for improvement, his apology felt like empty words.",
  },
  "empty threat": {
    definition: "A warning of punishment or trouble that the person does not actually intend to carry out.",
    example: "He told the kids he'd cancel the trip if they didn't behave, but they knew it was an empty threat.",
  },
  "empty stomach": {
    definition: "A state of being hungry because one has not eaten for a while.",
    example: "It is never a good idea to go grocery shopping on an empty stomach, as you'll end up buying things you don't need.",
  },
  "essential services": {
    definition: "Public utilities and industries necessary for health and safety, such as hospitals and electricity.",
    example: "Even during the blizzard, workers in essential services were required to report to their posts.",
  },
  "essential components": {
    definition: "The fundamental parts required for a machine, system, or plan to function correctly.",
    example: "Trust and communication are the essential components of any successful partnership.",
  },
  "essential ingredients": {
    definition: "The most important items needed to cook a specific dish or to achieve a particular result.",
    example: "Fresh basil and high-quality olive oil are the essential ingredients for a traditional pesto.",
  },
  "essential skills": {
    definition: "The core abilities required to perform a job or navigate life effectively.",
    example: "The workshop focuses on teaching essential skills like time management and digital literacy.",
  },
  "ethical standards": {
    definition: "The principles of right and wrong that govern the behavior of individuals or organizations.",
    example: "The company was praised for maintaining high ethical standards in its dealings with overseas suppliers.",
  },
  "ethical investment": {
    definition: "Putting money into companies or funds that are considered morally responsible or environmentally friendly.",
    example: "She shifted her portfolio toward ethical investment to ensure her money wasn't supporting the tobacco industry.",
  },
  "ethical dilemma": {
    definition: "A complex situation that involves a mental conflict between moral imperatives.",
    example: "The journalist faced an ethical dilemma when asked to reveal a confidential source.",
  },
  "ethical issues": {
    definition: "Problems or topics that require a choice between right and wrong, often involving societal values.",
    example: "The committee met to discuss the ethical issues surrounding the use of facial recognition technology.",
  },
  "ethical conduct": {
    definition: "Behaviour that follows accepted principles of right and wrong.",
    example: "The organisation expects ethical conduct from all employees, especially when handling public funds.",
  },
  "ethnic minority": {
    definition: "A group within a community which has different national or cultural traditions from the main population.",
    example: "Policies were implemented to ensure that every ethnic minority was fairly represented in the local government.",
  },
  "ethnic tensions": {
    definition: "Strained relations or conflicts between different ethnic groups within a region.",
    example: "The peace treaty aimed to reduce ethnic tensions that had plagued the border region for decades.",
  },
  "ethnic diversity": {
    definition: "The presence of various ethnic backgrounds and cultures within a specific environment.",
    example: "The university prides itself on its ethnic diversity, hosting students from over a hundred different countries.",
  },
  "ethnic food": {
    definition: "Cuisine that is characteristic of a specific cultural or national group.",
    example: "The downtown market is famous for its wide variety of ethnic food, ranging from Ethiopian to Vietnamese.",
  },
  "express bus": {
    definition: "A public bus that travels faster by stopping at only a few selected places.",
    example: "If you take the express bus, you can get to the city center in half the time it takes the regular one.",
  },
  "express service": {
    definition: "A faster version of a standard service, often for an extra fee (e.g., mail or dry cleaning).",
    example: "I paid for express service to make sure the legal documents reached the office by tomorrow morning.",
  },
  "express wish": {
    definition: "A clearly stated or specific desire for something to happen.",
    example: "It was her express wish that the donations be given to the local animal shelter.",
  },
  "express purpose": {
    definition: "The specific and primary reason for doing something.",
    example: "I came here for the express purpose of discussing the merger, not to chat about the weather.",
  },
  "false impression": {
    definition: "A wrong or inaccurate idea or opinion about someone or something.",
    example: "I don't want to give you the false impression that this job is easy; it requires a lot of overtime.",
  },
  "false teeth": {
    definition: "A set of artificial teeth worn by someone who has lost their natural ones.",
    example: "Technology has improved so much that false teeth now look and feel almost exactly like the real thing.",
  },
  "false alarm": {
    definition: "A warning or signal of danger that turns out to be unnecessary because there is no actual threat.",
    example: "The fire department arrived quickly, but it turned out to be a false alarm caused by a burnt piece of toast.",
  },
  "false identity": {
    definition: "A completely made-up name and background used to hide who someone really is.",
    example: "The spy lived in the city for three years under a false identity before he was finally caught.",
  },
  "fatal accident": {
    definition: "A crash or mishap that results in at least one person's death.",
    example: "The authorities are investigating the fatal accident that occurred on the highway late last night.",
  },
  "fatal mistake": {
    definition: "A very serious error that leads to total failure or a disastrous outcome.",
    example: "The company made a fatal mistake by ignoring the shift in consumer behavior toward online shopping.",
  },
  "fatal flaw": {
    definition: "A specific weakness or defect that causes something (or someone) to fail eventually.",
    example: "The protagonist's fatal flaw was his overwhelming pride, which eventually led to his downfall.",
  },
  "fatal blow": {
    definition: "An event or action that causes the sudden end or failure of something.",
    example: "Losing their biggest client was the fatal blow that forced the small firm into bankruptcy.",
  },
  "fatal injury": {
    definition: "An injury that causes someone to die.",
    example: "The driver suffered a fatal injury in the crash despite wearing a seat belt.",
  },
  "flat battery": {
    definition: "(British English) A battery that has no power left (Same as \"dead battery\").",
    example: "I left the car lights on all night, and now I have a flat battery.",
  },
  "flat tyre": {
    definition: "A tire that has lost its air pressure, making it impossible or dangerous to drive.",
    example: "We were halfway to the wedding when we got a flat tyre and had to stop on the shoulder.",
  },
  "flat rate": {
    definition: "A single fixed price that does not change regardless of the amount of use or work done.",
    example: "The taxi driver offered us a flat rate of $40 to take us from the airport to the hotel.",
  },
  "flat surface": {
    definition: "A level area that has no curves, bumps, or holes.",
    example: "To assemble the bookshelf correctly, you need to lay all the pieces out on a flat surface.",
  },
  "foreign policy": {
    definition: "A government's strategy in dealing with other nations.",
    example: "The country's foreign policy focuses on strengthening trade ties with neighboring states.",
  },
  "foreign language": {
    definition: "A language that is not the native language of the speaker or the primary language of the country.",
    example: "Learning a foreign language at a young age can significantly improve cognitive development.",
  },
  "foreign exchange": {
    definition: "The system or market where one currency is traded for another.",
    example: "Frequent travelers often keep an eye on foreign exchange rates to get the best value for their money.",
  },
  "foreign student": {
    definition: "A student who travels to another country to study at an educational institution.",
    example: "The university organizes a weekly social event to help every foreign student feel at home.",
  },
  "free speech": {
    definition: "The right to express any opinions without censorship, interference, or restraint.",
    example: "Many consider free speech to be the most fundamental pillar of a democratic society.",
  },
  "free spirit": {
    definition: "A person who lives according to their own wishes and beliefs, unconstrained by society's conventions.",
    example: "She was always a free spirit, traveling the world with nothing but a backpack and a camera.",
  },
  "free time": {
    definition: "Time when one is not working or has no specific duties or obligations to perform.",
    example: "In my free time, I enjoy hiking and experimenting with new recipes in the kitchen.",
  },
  "free sample": {
    definition: "A small portion of a product given to consumers for free so they can try it before buying.",
    example: "The supermarket was handing out free samples of a new organic cheese they just started stocking.",
  },
  "front page": {
    definition: "The first page of a newspaper, typically containing the most important or sensational news stories.",
    example: "The scandal was so massive that it stayed on the front page for an entire week.",
  },
  "front door": {
    definition: "The main entrance to a house, apartment, or building.",
    example: "I accidentally left my keys in the front door after coming home from work.",
  },
  "front seat": {
    definition: "A seat in the front of a vehicle, such as a car, bus, or airplane.",
    example: "The kids always argue over who gets to sit in the front seat during long car rides.",
  },
  "front row": {
    definition: "The row of seats closest to the stage, screen, or field in a theater, cinema, or stadium.",
    example: "We were lucky enough to get tickets for the front row of the concert.",
  },
  "good cause": {
    definition: "A charity or activity that helps people and is considered worth supporting.",
    example: "All the proceeds from the bake sale will go to a good cause, specifically the local children's hospital.",
  },
  "good chance": {
    definition: "A high probability or likelihood that something will happen.",
    example: "Since you've been practicing so much, there is a good chance you'll win the competition.",
  },
  "good company": {
    definition: "A person or group of people who are pleasant, interesting, and enjoyable to be with.",
    example: "The dinner was lovely, but it was the good company that made the evening truly memorable.",
  },
  "good deal": {
    definition: "A situation where you buy something at a very favorable price or reach a fair agreement.",
    example: "I got a good deal on this laptop because I bought it during the end-of-year sale.",
  },
  "great detail": {
    definition: "Giving a lot of information, including even the smallest points.",
    example: "The architect explained the plans for the new library in great detail during the presentation.",
  },
  "great skill": {
    definition: "A high level of ability or expertise in a particular activity or field.",
    example: "It takes great skill to play the violin at such a professional level.",
  },
  "great wealth": {
    definition: "A very large amount of money, property, or valuable possessions.",
    example: "He used his great wealth to fund several environmental conservation projects around the world.",
  },
  "great admiration": {
    definition: "A feeling of deep respect and approval for someone or something.",
    example: "I have great admiration for the volunteers who spend their weekends cleaning up the local park.",
  },
  "guilty conscience": {
    definition: "A feeling of shame or regret because you know you have done something wrong.",
    example: "He couldn't sleep because of his guilty conscience after lying to his best friend.",
  },
  "guilty party": {
    definition: "The person or group responsible for a mistake, crime, or negative situation.",
    example: "After a thorough investigation, the insurance company identified the guilty party in the accident.",
  },
  "guilty verdict": {
    definition: "A formal decision in a court of law stating that someone has committed a crime.",
    example: "The jury returned a guilty verdict after only three hours of deliberation.",
  },
  "guilty pleasure": {
    definition: "Something that you enjoy even though it is considered slightly shameful or not very high-quality.",
    example: "Watching cheesy reality TV shows is my favorite guilty pleasure after a long week at work.",
  },
  "hard work": {
    definition: "Activities that require a lot of physical or mental effort.",
    example: "Getting the promotion was the result of years of hard work and dedication.",
  },
  "hard evidence": {
    definition: "Clear, undeniable facts or proof that something is true.",
    example: "Without hard evidence, the police cannot make an arrest in this case.",
  },
  "hard day": {
    definition: "A period of time that was physically or mentally exhausting or difficult to get through.",
    example: "After a hard day at the office, I just want to sit on the sofa and relax.",
  },
  "hard exam": {
    definition: "A test that is very difficult to pass or requires a deep understanding of the subject.",
    example: "Everyone was worried about the chemistry final because it is known for being a very hard exam.",
  },
  "healthy diet": {
    definition: "Eating a variety of nutritious foods in the right proportions to maintain good health.",
    example: "The nutritionist recommended a healthy diet rich in vegetables, lean proteins, and whole grains.",
  },
  "healthy lifestyle": {
    definition: "A way of living that lowers the risk of being seriously ill or dying early.",
    example: "Regular exercise and adequate sleep are essential parts of a healthy lifestyle.",
  },
  "healthy appetite": {
    definition: "A natural and strong desire to eat, often indicating that a person is in good health.",
    example: "The kids always come home from soccer practice with a healthy appetite.",
  },
  "healthy competition": {
    definition: "A situation where people or teams try to be more successful than others in a positive and motivating way.",
    example: "The healthy competition between the two sales teams helped increase the company's overall revenue.",
  },
  "healthy food": {
    definition: "Food that is good for your body and helps maintain good health.",
    example: "The school cafeteria is trying to offer more healthy food at lunchtime.",
  },
  "healthy living": {
    definition: "A way of life that supports good health through diet, exercise, and other positive habits.",
    example: "The campaign encourages healthy living through regular exercise and balanced meals.",
  },
  "high quality": {
    definition: "Of a very good standard or excellence.",
    example: "The company is known for producing high quality leather goods that last a lifetime.",
  },
  "high price": {
    definition: "A large amount of money that must be paid for something.",
    example: "Many customers complained about the high price of tickets for the concert.",
  },
  "high standard": {
    definition: "A level of quality or achievement that is very good.",
    example: "The restaurant maintains a high standard of service, regardless of how busy they are.",
  },
  "high level": {
    definition: "A position of importance or a great amount of something.",
    example: "Negotiations are currently taking place at a high level between the two governments.",
  },
  "high pressure": {
    definition: "A situation involving a lot of stress or urgent demands.",
    example: "Working in the emergency room is a high pressure job that requires quick decision-making.",
  },
  "icy wind": {
    definition: "A very cold wind that feels like ice.",
    example: "The icy wind cut through my thin jacket as soon as I stepped off the train.",
  },
  "icy stare": {
    definition: "A look that shows strong dislike or lack of friendliness.",
    example: "When I suggested we cancel the project, the manager gave me an icy stare.",
  },
  "icy patch": {
    definition: "A small area of a surface, especially a road, covered in ice.",
    example: "Be careful driving over the bridge; there is often an icy patch near the entrance.",
  },
  "icy water": {
    definition: "Water that is extremely cold, often near freezing.",
    example: "The brave swimmers dove into the icy water for their annual New Year's Day dip.",
  },
  "ill health": {
    definition: "The state of being physically or mentally unwell for a long period.",
    example: "He was forced to take early retirement due to ill health.",
  },
  "ill effects": {
    definition: "The negative or harmful results of something.",
    example: "Many people suffer the ill effects of air pollution in major industrial cities.",
  },
  "ill feeling": {
    definition: "A feeling of anger, resentment, or animosity between people.",
    example: "I hope there is no ill feeling between us after our disagreement during the meeting.",
  },
  "ill temper": {
    definition: "A habit of becoming angry or irritable very easily.",
    example: "His ill temper made it difficult for him to keep a steady job for more than a few months.",
  },
  "immediate action": {
    definition: "Something that must be done right away without any delay.",
    example: "The leaking pipe requires immediate action before the kitchen floor is completely ruined.",
  },
  "immediate family": {
    definition: "Your closest relatives, typically including parents, siblings, spouse, and children.",
    example: "The wedding was a small affair, attended only by the couple's immediate family.",
  },
  "immediate future": {
    definition: "The period of time that is just about to happen.",
    example: "We don't have any plans to move house in the immediate future.",
  },
  "immediate effect": {
    definition: "A result that happens instantly as soon as a change is made.",
    example: "The new law went into immediate effect, meaning shops had to stop providing plastic bags today.",
  },
  "immediate result": {
    definition: "An outcome that happens straight away after an action or event.",
    example: "The new treatment produced an immediate result, and the patient's pain began to ease within minutes.",
  },
  "inside information": {
    definition: "Facts or data known only by people within a particular organization or group, often giving them an advantage.",
    example: "He was accused of using inside information to buy shares before the merger was announced.",
  },
  "inside lane": {
    definition: "The lane on a road that is closest to the edge (in the UK, the left lane; in the US, the right lane), usually for slower traffic.",
    example: "If you aren't planning to overtake anyone, you should stay in the inside lane.",
  },
  "inside job": {
    definition: "A crime, such as a theft, committed by someone who works at the place where the crime occurred.",
    example: "The police suspect the warehouse robbery was an inside job because the security codes were bypassed.",
  },
  "inside knowledge": {
    definition: "Detailed information or understanding gained through being part of a specific group or organization.",
    example: "Her inside knowledge of the publishing industry helped her find a literary agent very quickly.",
  },
  "intense pressure": {
    definition: "A very strong or extreme feeling of stress or the need to perform well.",
    example: "Medical students are under intense pressure to pass their final exams with high marks.",
  },
  "intense heat": {
    definition: "An extreme or very high level of temperature.",
    example: "The glassblower worked carefully, shielded from the intense heat of the furnace.",
  },
  "intense debate": {
    definition: "A very serious, passionate, and sometimes heated public discussion about a topic.",
    example: "There is currently an intense debate regarding the use of AI in creative writing.",
  },
  "intense interest": {
    definition: "A very strong and deep feeling of wanting to know or learn about something.",
    example: "The discovery of a new planet has sparked intense interest among the scientific community.",
  },
  "internal injury": {
    definition: "Damage to the organs or tissues inside the body that is not visible on the surface.",
    example: "Even though he looked fine after the fall, the doctors kept him overnight to check for any internal injury.",
  },
  "internal organ": {
    definition: "A major part of the body located inside, such as the heart, lungs, or liver.",
    example: "Excessive alcohol consumption can cause significant damage to your internal organs over time.",
  },
  "internal affairs": {
    definition: "Issues relating to the inner workings of a country or organization; often refers to a police department branch that investigates officers.",
    example: "The officer was placed under investigation by internal affairs following the complaint.",
  },
  "internal clock": {
    definition: "The body's natural, biological rhythm that regulates sleep and wakefulness.",
    example: "Traveling across multiple time zones can really mess up your internal clock.",
  },
  "irreparable damage": {
    definition: "Harm that is so severe that it can never be fixed or returned to its original condition.",
    example: "The floods caused irreparable damage to the ancient manuscripts stored in the basement.",
  },
  "irreparable harm": {
    definition: "A loss or injury that is so significant it cannot be undone or adequately compensated for.",
    example: "The court issued an injunction to prevent the construction, arguing it would cause irreparable harm to the local ecosystem.",
  },
  "irreparable loss": {
    definition: "A loss, often of a loved one or a unique item, that can never be replaced.",
    example: "The death of the legendary artist is an irreparable loss to the world of modern art.",
  },
  "irreparable rift": {
    definition: "A serious disagreement or break in a relationship that can never be mended.",
    example: "The argument over the inheritance created an irreparable rift between the two brothers.",
  },
  "joint account": {
    definition: "A bank account held by two or more people, typically a married couple or business partners.",
    example: "After they got married, they decided to open a joint account to manage their household expenses together.",
  },
  "joint effort": {
    definition: "An activity or project carried out by two or more people working together.",
    example: "The success of the fundraiser was a joint effort between the local school and the neighborhood council.",
  },
  "joint venture": {
    definition: "A business arrangement in which two or more parties agree to pool their resources for a specific task.",
    example: "The two tech giants announced a joint venture to develop next-generation battery technology.",
  },
  "joint owners": {
    definition: "Two or more people who own a property or business together.",
    example: "As joint owners of the cafe, they share both the profits and the daily management responsibilities.",
  },
  "key issue": {
    definition: "The most important problem or topic that needs to be discussed or solved.",
    example: "The key issue in the negotiations was the disagreement over the new environmental regulations.",
  },
  "key role": {
    definition: "A very important part or position within a project, organization, or process.",
    example: "She played a key role in designing the software that the company now uses worldwide.",
  },
  "key element": {
    definition: "A crucial part or feature of something that is necessary for it to work or be successful.",
    example: "Transparency is a key element in building trust between a business and its customers.",
  },
  "key player": {
    definition: "An individual or organization that has a lot of influence or importance in a particular field.",
    example: "By acquiring the smaller startup, the corporation cemented its status as a key player in the telecommunications industry.",
  },
  "large amount": {
    definition: "A great quantity or extent of something, often used with uncountable nouns like money or time.",
    example: "You don't need to spend a large amount of money to get a high-quality pair of running shoes.",
  },
  "large scale": {
    definition: "Involving a lot of people, effort, or money over a wide area.",
    example: "The supermarket chain is planning a large scale renovation of all its stores across the country.",
  },
  "large number": {
    definition: "A great many of something, used with plural countable nouns.",
    example: "A large number of customers complained about the delay in shipping during the holiday season.",
  },
  "large quantity": {
    definition: "A big amount of something, typically referring to physical goods or materials.",
    example: "The bakery buys flour in large quantities to keep up with the daily demand for fresh bread.",
  },
  "late night": {
    definition: "The period of time very far into the night, often after midnight.",
    example: "I had a late night finishing the report, so I'm feeling a bit tired this morning.",
  },
  "late departure": {
    definition: "A situation where a plane, train, or bus leaves later than its scheduled time.",
    example: "Due to the heavy fog, the airline announced a late departure for all morning flights.",
  },
  "late arrival": {
    definition: "Someone or something that reaches a destination after the expected or scheduled time.",
    example: "We missed the beginning of the play because of our late arrival at the theater.",
  },
  "late fee": {
    definition: "An extra charge paid for returning an item or making a payment after the deadline.",
    example: "Make sure to return the library books on time so you don't have to pay a late fee.",
  },
  "legal advice": {
    definition: "Professional guidance given by a lawyer regarding a legal matter.",
    example: "You should seek professional legal advice before signing a contract with such complex terms.",
  },
  "legal action": {
    definition: "The process of using a court of law to settle a dispute or punish a crime.",
    example: "The company threatened to take legal action if the payment was not received by the end of the week.",
  },
  "legal system": {
    definition: "The set of laws and the process of enforcing them within a specific country.",
    example: "Understanding the legal system of a foreign country can be a daunting task for many immigrants.",
  },
  "legal requirement": {
    definition: "Something that you must do according to the law.",
    example: "In many countries, having car insurance is a legal requirement for all drivers.",
  },
  "live music": {
    definition: "Musical performances that are played in front of an audience in real-time.",
    example: "The local pub is famous for hosting excellent live music every Friday night.",
  },
  "live broadcast": {
    definition: "A television or radio program transmitted at the same time it is happening.",
    example: "Millions of people tuned in for the live broadcast of the championship game.",
  },
  "live performance": {
    definition: "An act of performing music, drama, or dance in front of an audience.",
    example: "There is an energy in a live performance that you just can't capture in a studio recording.",
  },
  "live show": {
    definition: "An entertainment event, such as a concert or play, performed for a physical audience.",
    example: "The comedian is touring the country with a brand-new live show this autumn.",
  },
  "long time": {
    definition: "A significant or extended period of time.",
    example: "I haven't seen my cousin for a very long time, so I'm excited to visit her this summer.",
  },
  "long distance": {
    definition: "Spanning a great amount of physical space between two points.",
    example: "Maintaining a long distance relationship requires a lot of trust and frequent communication.",
  },
  "long term": {
    definition: "Relating to a period of time far into the future.",
    example: "When investing, it's important to focus on long term growth rather than short-term fluctuations.",
  },
  "long run": {
    definition: "Over a long period of time, or in the end.",
    example: "It might be more expensive now, but buying high-quality tools will save you money in the long run.",
  },
  "maiden voyage": {
    definition: "The first journey made by a ship after its completion.",
    example: "The luxury liner set sail on its maiden voyage from Southampton to New York yesterday.",
  },
  "maiden flight": {
    definition: "The first flight of a new aircraft.",
    example: "The aerospace company celebrated the successful maiden flight of their latest commercial jet.",
  },
  "maiden speech": {
    definition: "The first formal speech made by a person in a particular role, especially by a new member of parliament.",
    example: "In her maiden speech, the new MP focused on the importance of local education reform.",
  },
  "maiden name": {
    definition: "The surname a woman has before she is married.",
    example: "Even after twenty years of marriage, she still uses her maiden name for all her professional work.",
  },
  "main course": {
    definition: "The largest or most important part of a meal.",
    example: "For the main course, I'll have the grilled salmon with seasonal vegetables.",
  },
  "main road": {
    definition: "A primary route that carries a lot of traffic between towns or cities.",
    example: "The hotel is located just off the main road, so it's very easy to find by car.",
  },
  "main thing": {
    definition: "The most important fact, aspect, or priority in a situation.",
    example: "We missed the train, but the main thing is that we are all safe and together.",
  },
  "main reason": {
    definition: "The primary cause or motivation for something happening.",
    example: "The main reason I moved to this city was to be closer to my family.",
  },
  "major problem": {
    definition: "A very serious or significant difficulty that requires immediate attention.",
    example: "A major problem with the current software is that it crashes whenever we try to save large files.",
  },
  "major issue": {
    definition: "A significant topic of concern or a large-scale challenge.",
    example: "Affordable housing has become a major issue for young professionals living in urban areas.",
  },
  "major role": {
    definition: "A significant or influential part played in an activity or event.",
    example: "Renewable energy will play a major role in reducing global carbon emissions over the next decade.",
  },
  "major concern": {
    definition: "A serious worry or a matter of great importance to someone.",
    example: "The safety of the construction site is a major concern for the local residents.",
  },
  "medical history": {
    definition: "A record of a person's past illnesses, treatments, and health conditions.",
    example: "The doctor asked me to fill out a form detailing my medical history before the examination.",
  },
  "medical condition": {
    definition: "A specific health problem or illness that a person has.",
    example: "He has a pre-existing medical condition that requires him to take medication daily.",
  },
  "medical record": {
    definition: "A collection of documents that track a patient's healthcare over time.",
    example: "All patient medical records are now stored electronically to ensure they can be accessed quickly in an emergency.",
  },
  "medical treatment": {
    definition: "The care or medicine given to someone who is sick or injured.",
    example: "She traveled abroad to receive a specialized medical treatment that wasn't available in her home country.",
  },
  "mental illness": {
    definition: "A health condition that changes a person's thinking, feelings, or behavior and causes distress.",
    example: "Society is becoming much more open about discussing mental illness and the importance of support.",
  },
  "mental health": {
    definition: "A person's emotional, psychological, and social well-being.",
    example: "Taking regular breaks from social media can have a very positive impact on your mental health.",
  },
  "mental ability": {
    definition: "The capacity of a person's mind to perform tasks like reasoning, learning, and problem-solving.",
    example: "The test is designed to measure a child's mental ability and potential for future academic success.",
  },
  "mental state": {
    definition: "The current condition of a person's thoughts and feelings.",
    example: "After working twenty hours straight, his mental state was one of complete exhaustion.",
  },
  "mixed feelings": {
    definition: "A combination of conflicting emotions, such as being both happy and sad at the same time.",
    example: "I have mixed feelings about moving; I'm excited for the new job, but I'll really miss my friends here.",
  },
  "mixed message": {
    definition: "A set of instructions or signals that are contradictory or confusing.",
    example: "The manager is sending a mixed message by asking for innovation while strictly punishing every small mistake.",
  },
  "mixed results": {
    definition: "A situation where some outcomes are positive while others are negative or unsuccessful.",
    example: "The new marketing campaign had mixed results, increasing website traffic but failing to boost actual sales.",
  },
  "mixed reaction": {
    definition: "A response from a group where some people like an idea and others dislike it.",
    example: "The architect's modern design for the library met with a mixed reaction from the local community.",
  },
  "moral obligation": {
    definition: "A duty to do something because it is the right thing to do, even if it isn't a legal requirement.",
    example: "As a wealthy nation, we have a moral obligation to provide aid to countries facing famine.",
  },
  "moral duty": {
    definition: "A responsibility rooted in one's principles of right and wrong.",
    example: "He felt it was his moral duty to speak up when he witnessed the unfair treatment of his colleague.",
  },
  "moral support": {
    definition: "Giving someone encouragement and emotional help rather than practical or financial assistance.",
    example: "I can't help you move the furniture, but I'll come over and provide moral support and coffee.",
  },
  "moral standard": {
    definition: "The level of behavior that a person or society considers to be right and acceptable.",
    example: "The public expects a higher moral standard from their elected officials than from the average citizen.",
  },
  "native speaker": {
    definition: "Someone who has spoken a particular language since they were a baby.",
    example: "To get a job as a translator, you often need to be a native speaker of at least one of the languages.",
  },
  "native country": {
    definition: "The country where a person was born.",
    example: "After living abroad for twenty years, he finally decided to return to his native country to retire.",
  },
  "native land": {
    definition: "A more poetic or formal way to refer to the country or region where one was born.",
    example: "The poet wrote many verses expressing his deep longing for the rugged hills of his native land.",
  },
  "native tongue": {
    definition: "A person's first language; the language they grew up speaking at home.",
    example: "Though she is fluent in five languages, she still feels most comfortable expressing her emotions in her native tongue.",
  },
  "natural disaster": {
    definition: "A major adverse event resulting from natural processes of the Earth, such as a flood, earthquake, or hurricane.",
    example: "The government has released emergency funds to help the victims of the recent natural disaster.",
  },
  "natural resources": {
    definition: "Materials or substances such as minerals, forests, water, and fertile land that occur in nature and can be used for economic gain.",
    example: "The country's economy relies heavily on its vast natural resources, particularly oil and timber.",
  },
  "natural causes": {
    definition: "A way of dying that is due to illness or old age rather than an accident or violence.",
    example: "The coroner confirmed that the elderly musician had passed away from natural causes.",
  },
  "natural ability": {
    definition: "A skill or talent that someone is born with rather than one they have had to learn.",
    example: "She has a natural ability for mathematics and was solving complex equations by the age of ten.",
  },
  "negative attitude": {
    definition: "A way of thinking that focuses on the bad side of things and lacks hope or confidence.",
    example: "If you go into the interview with a negative attitude, it's unlikely you'll impress the recruiters.",
  },
  "negative impact": {
    definition: "A harmful or bad effect that an event or situation has on someone or something.",
    example: "The closure of the local factory has had a significant negative impact on the town's economy.",
  },
  "negative reaction": {
    definition: "An unpleasant or disapproving response to an action, event, or statement.",
    example: "The new tax policy met with a strong negative reaction from small business owners.",
  },
  "negative effect": {
    definition: "A result or consequence that is bad or harmful.",
    example: "Lack of sleep can have a very negative effect on your ability to concentrate at school.",
  },
  "net profit": {
    definition: "The actual profit made by a business after all expenses and taxes have been paid.",
    example: "The company reported a record net profit this year despite the increase in material costs.",
  },
  "net income": {
    definition: "The total amount of money an individual or company earns after deductions and taxes.",
    example: "After taxes and insurance were taken out, my monthly net income was lower than I expected.",
  },
  "net worth": {
    definition: "The total value of everything a person or company owns, minus all their debts.",
    example: "The entrepreneur's net worth grew significantly after the sale of his third startup.",
  },
  "net result": {
    definition: "The final outcome or consequence of a situation or process.",
    example: "Although the team changed several players, the net result was the same-another win for the season.",
  },
  "occupational hazard": {
    definition: "A risk or danger that is naturally associated with a particular job or profession.",
    example: "For firefighters, dealing with smoke inhalation is unfortunately a regular occupational hazard.",
  },
  "occupational therapy": {
    definition: "A type of treatment that helps people recover the skills needed for daily living after an injury or illness.",
    example: "After her stroke, she attended occupational therapy to relearn how to use a keyboard and write.",
  },
  "occupational health": {
    definition: "The branch of medicine concerned with the physical and mental well-being of people in the workplace.",
    example: "The company's occupational health department offers ergonomic assessments for all office staff.",
  },
  "occupational risk": {
    definition: "The likelihood that a person may experience harm or adverse health effects due to their work environment.",
    example: "Nurses face a high occupational risk of back injury due to the physical nature of lifting patients.",
  },
  "odd number": {
    definition: "Any whole number that cannot be divided exactly by two (e.g., 1, 3, 5, 7).",
    example: "In some cities, you can only park on this side of the street on dates with an odd number.",
  },
  "odd socks": {
    definition: "A pair of socks that do not match each other in color or pattern.",
    example: "I was in such a rush this morning that I ended up wearing odd socks to work.",
  },
  "odd job": {
    definition: "A small, simple task or piece of work, often of a practical nature.",
    example: "He earns a little extra money by doing odd jobs like painting fences and fixing leaky taps for his neighbors.",
  },
  "odd one": {
    definition: "Someone or something that is different from the others in a group or set.",
    example: "Of all the siblings, he was always the odd one because he preferred reading to playing sports.",
  },
  "optional extras": {
    definition: "Items that are available for an additional cost but are not necessary for the basic product to function.",
    example: "When buying a new car, things like leather seats and a sunroof are usually considered optional extras.",
  },
  "optional features": {
    definition: "Specific functions or characteristics of a product that a user can choose to enable or include.",
    example: "The software comes with several optional features, such as advanced data encryption, for professional users.",
  },
  "optional subjects": {
    definition: "Classes or courses at school that students can choose to take based on their interests, rather than being required.",
    example: "In the final year of high school, students can select two optional subjects alongside their core curriculum.",
  },
  "optional equipment": {
    definition: "Tools or machinery that can be added to a basic model to improve performance or comfort.",
    example: "The basic tractor model is efficient, but you can add optional equipment like a GPS navigation system for precision farming.",
  },
  "painful memory": {
    definition: "A past event that causes emotional distress or sadness when remembered.",
    example: "Looking at the old photographs brought back a painful memory of the day her family had to leave their home.",
  },
  "painful reminder": {
    definition: "Something that makes you think about an unpleasant or sad situation from the past.",
    example: "The empty chair at the dinner table was a painful reminder of his brother's absence.",
  },
  "painful experience": {
    definition: "An event that was physically or emotionally difficult and distressing to go through.",
    example: "Going through a divorce can be an incredibly painful experience for everyone involved.",
  },
  "painful lesson": {
    definition: "A difficult realization or piece of wisdom gained through making a mistake or suffering a loss.",
    example: "Losing all his savings in the stock market was a painful lesson in the importance of diversifying investments.",
  },
  "personal belongings": {
    definition: "The items that a person owns and typically carries with them, such as clothes, jewelry, or a phone.",
    example: "Please make sure you take all your personal belongings with you when you leave the train.",
  },
  "personal details": {
    definition: "Information about an individual, such as their name, address, date of birth, or phone number.",
    example: "For security reasons, you should never share your personal details with someone you don't trust online.",
  },
  "personal interest": {
    definition: "A hobby or subject that someone enjoys or feels passionate about in their private time.",
    example: "Outside of work, he has a strong personal interest in amateur astronomy and bird watching.",
  },
  "personal space": {
    definition: "The physical distance around a person that they feel is theirs and which others should not enter without permission.",
    example: "I find it very uncomfortable when people stand too close to me; I really value my personal space.",
  },
  "political prisoner": {
    definition: "A person who is put in prison because their views or activities are seen as a threat to the government.",
    example: "The international community called for the immediate release of the political prisoner who had been held without trial.",
  },
  "political party": {
    definition: "An organized group of people with at least roughly similar political aims and opinions.",
    example: "He has been a loyal member of the same political party for over thirty years.",
  },
  "political system": {
    definition: "The set of formal legal institutions that constitute a \"government\" or a \"state.\"",
    example: "The country transitioned from a monarchy to a democratic political system in the late twentieth century.",
  },
  "political leader": {
    definition: "A person who has a position of power or influence within a government or political organization.",
    example: "The political leader gave a televised address to the nation to discuss the new economic reforms.",
  },
  "poor eyesight": {
    definition: "A condition where a person cannot see clearly, often requiring glasses or contact lenses.",
    example: "Despite his poor eyesight, he refused to wear glasses until he found it difficult to read road signs.",
  },
  "poor health": {
    definition: "A state of being frequently ill or having a weak physical condition over a long period.",
    example: "He had to resign from his position as chairman due to poor health and the need for more rest.",
  },
  "poor performance": {
    definition: "A level of work or achievement that is below the expected or required standard.",
    example: "The athlete was disappointed by his poor performance in the qualifying rounds of the competition.",
  },
  "poor quality": {
    definition: "Being of a low standard, badly made, or using inferior materials.",
    example: "I wouldn't recommend that brand; their clothes are often of poor quality and shrink after the first wash.",
  },
  "popular belief": {
    definition: "An idea or opinion that many people hold, though it may not necessarily be true.",
    example: "Contrary to popular belief, camels do not actually store water in their humps.",
  },
  "popular culture": {
    definition: "The set of practices, beliefs, and objects that are dominant or ubiquitous in a society at a given point in time (e.g., music, film, fashion).",
    example: "The museum's new exhibit explores how superhero movies have influenced popular culture over the last decade.",
  },
  "popular demand": {
    definition: "When something is provided or repeated because a large number of people have asked for it.",
    example: "By popular demand, the bakery has decided to bring back its signature cinnamon rolls every weekend.",
  },
  "popular opinion": {
    definition: "The general view or feeling of the majority of people on a particular subject.",
    example: "While the move was controversial among experts, popular opinion was firmly in favor of the new park.",
  },
  "private life": {
    definition: "The part of a person's life that involves their family and personal relationships, rather than their work.",
    example: "Despite being a famous actor, he works very hard to keep his private life out of the tabloids.",
  },
  "private property": {
    definition: "Land or buildings that belong to an individual or a company rather than the government.",
    example: "There were several signs posted along the fence warning that the land was private property.",
  },
  "private sector": {
    definition: "The part of a country's economy that consists of businesses and organizations not run by the government.",
    example: "After years of working for the city council, she decided to move to the private sector for a higher salary.",
  },
  "private conversation": {
    definition: "A discussion between two or more people that is not intended for others to hear.",
    example: "They stepped into the hallway to have a private conversation about the confidential legal documents.",
  },
  "public opinion": {
    definition: "The views or attitudes held by the general population regarding a specific issue or person.",
    example: "The government's decision was heavily influenced by the sudden shift in public opinion regarding climate change.",
  },
  "public transport": {
    definition: "A system of vehicles, such as buses and trains, that operate at regular times on fixed routes and are used by the general public.",
    example: "Using public transport is often much faster and cheaper than trying to find parking in the city center.",
  },
  "public service": {
    definition: "A service provided by the government to the people living in its jurisdiction, such as healthcare, education, or waste collection.",
    example: "He dedicated his entire career to public service, eventually becoming the head of the national health department.",
  },
  "public holiday": {
    definition: "A day off from work or school that is officially recognized by the government, often to celebrate a national event.",
    example: "Since Monday is a public holiday, all banks and post offices will be closed for the day.",
  },
  "quick fix": {
    definition: "A fast and easy solution to a problem, though it may only be temporary or superficial.",
    example: "Painting over the damp patch is just a quick fix; we need to find the actual source of the leak.",
  },
  "quick reply": {
    definition: "A fast answer to a message or question.",
    example: "I sent her an email this morning and was pleasantly surprised by her quick reply.",
  },
  "quick response": {
    definition: "An immediate action or answer in reaction to a situation or request.",
    example: "The emergency services earned praise for their quick response to the accident on the highway.",
  },
  "quick snack": {
    definition: "A small amount of food eaten between meals that is fast to prepare or buy.",
    example: "I didn't have time for a full lunch, so I just grabbed a quick snack at the station.",
  },
  "quiet life": {
    definition: "A way of living that is peaceful, simple, and free from stress or excitement.",
    example: "After years of working in the city, they moved to the countryside in search of a quiet life.",
  },
  "quiet night": {
    definition: "An evening spent in a calm way, usually at home, without much activity or noise.",
    example: "We decided to stay in for a quiet night and watch a movie instead of going to the party.",
  },
  "quiet neighborhood": {
    definition: "An area where people live that is peaceful and does not have much traffic or noise.",
    example: "They specifically looked for a house in a quiet neighborhood so the kids could play safely outside.",
  },
  "quiet voice": {
    definition: "A way of speaking that is soft and not loud.",
    example: "She spoke in a quiet voice so as not to wake the sleeping baby in the next room.",
  },
  "radical reform": {
    definition: "Significant and fundamental changes made to a system or law to improve it.",
    example: "The new government has promised radical reform of the healthcare system to reduce waiting times.",
  },
  "radical change": {
    definition: "A complete and extreme shift in the way something is done or organized.",
    example: "The transition to remote work represented a radical change for many traditional office-based companies.",
  },
  "radical shift": {
    definition: "A sudden and significant movement in opinion, policy, or direction.",
    example: "Recent years have seen a radical shift in public attitudes toward plastic consumption.",
  },
  "radical idea": {
    definition: "A thought or suggestion that is very new, different, and against traditional ways of thinking.",
    example: "At the time, the suggestion of a four-day work week was considered a radical idea.",
  },
  "rave review": {
    definition: "An extremely enthusiastic and positive report from a critic or user about a book, film, or product.",
    example: "The new restaurant received a rave review in the national newspaper, and now it's impossible to get a table.",
  },
  "rave reception": {
    definition: "A very warm and enthusiastic welcome or response from an audience.",
    example: "The band's latest album met with a rave reception during their first live performance in London.",
  },
  "rave notice": {
    definition: "A highly favorable written comment or review in a publication.",
    example: "Despite the low budget, the independent film earned rave notices at every festival it played.",
  },
  "rave report": {
    definition: "A very positive account or update regarding a situation or performance.",
    example: "The manager gave a rave report on the team's progress during the quarterly meeting.",
  },
  "real life": {
    definition: "The events and situations that happen to actual people, as opposed to stories in books or movies.",
    example: "In real life, problems aren't always solved in ninety minutes like they are in the cinema.",
  },
  "real wages": {
    definition: "Wages as measured by the quantity of goods and services that can be bought with them.",
    example: "Inflation has risen so sharply that real wages have actually decreased for many workers this year.",
  },
  "real world": {
    definition: "The actual world where people live and work, often contrasted with a sheltered or academic environment.",
    example: "The internship is designed to give students a taste of how the industry operates in the real world.",
  },
  "real problem": {
    definition: "A serious or genuine difficulty that exists, rather than a minor or imaginary one.",
    example: "We can keep debating the theory, but the real problem is that we simply don't have enough funding.",
  },
  "reasonable explanation": {
    definition: "A logical or sensible reason given to justify an action or event.",
    example: "I'm sure there is a reasonable explanation for why he missed the meeting, so let's wait to hear from him.",
  },
  "reasonable price": {
    definition: "A cost that is fair and not too expensive for the value of the item.",
    example: "We were able to find a high-quality hotel right in the city center for a very reasonable price.",
  },
  "reasonable excuse": {
    definition: "A justification for a mistake or absence that is likely to be accepted as valid.",
    example: "Traffic congestion is usually considered a reasonable excuse for being a few minutes late to class.",
  },
  "reasonable doubt": {
    definition: "A standard of proof used in criminal trials; if there is any sensible reason to doubt guilt, the defendant must be acquitted.",
    example: "The jury was instructed to acquit the suspect if they felt there was any reasonable doubt about his involvement.",
  },
  "regular exercise": {
    definition: "Physical activity performed on a consistent basis to maintain health and fitness.",
    example: "The doctor emphasized that regular exercise is just as important as a healthy diet for heart health.",
  },
  "regular interval": {
    definition: "A fixed and consistent amount of time or space between events.",
    example: "Bus services run at regular intervals throughout the day, so you won't have to wait long.",
  },
  "regular check-up": {
    definition: "A routine visit to a doctor or dentist to ensure one remains in good health.",
    example: "It is recommended that you visit the dentist for a regular check-up every six months.",
  },
  "regular meeting": {
    definition: "A gathering of people that happens consistently at a scheduled time (e.g., weekly or monthly).",
    example: "We have our regular meeting every Monday morning to discuss the upcoming tasks for the week.",
  },
  "rich history": {
    definition: "A past that is full of interesting, significant, or varied events.",
    example: "The city of Rome has such a rich history that you can find ancient ruins on almost every street corner.",
  },
  "rich culture": {
    definition: "A society that has a deep and diverse range of traditions, arts, and customs.",
    example: "Travelers are often drawn to the region because of its rich culture and world-famous cuisine.",
  },
  "rich vocabulary": {
    definition: "A wide and diverse range of words that a person knows and can use effectively.",
    example: "Reading classic literature is one of the best ways to develop a rich vocabulary.",
  },
  "rich source": {
    definition: "A person, book, or place that provides a large amount of useful information or materials.",
    example: "The national archives are a rich source of information for anyone researching their family tree.",
  },
  "rough draft": {
    definition: "A first version of a piece of writing that is not yet finished or polished.",
    example: "I've finished the rough draft of my essay, but I still need to go back and check the citations.",
  },
  "rough estimate": {
    definition: "An approximate calculation or guess of an amount or value.",
    example: "The contractor gave us a rough estimate of the renovation costs, but the final price may vary.",
  },
  "rough idea": {
    definition: "A general or basic understanding of something, without knowing all the specific details.",
    example: "I have a rough idea of where the restaurant is, but I should probably check the map just in case.",
  },
  "rough sea": {
    definition: "A condition of the ocean characterized by large waves and turbulent water, often due to strong winds.",
    example: "The ferry crossing was delayed because of the rough sea and gale-force winds.",
  },
  "safe distance": {
    definition: "A physical gap between two things that is large enough to prevent danger or an accident.",
    example: "Always maintain a safe distance from the car in front of you, especially when driving in the rain.",
  },
  "safe bet": {
    definition: "Something that is very likely to happen or be successful.",
    example: "It's a safe bet that the park will be crowded this weekend if the weather stays sunny.",
  },
  "safe hands": {
    definition: "Being in the care of someone who is reliable, competent, and trustworthy.",
    example: "With thirty years of experience in pediatric medicine, your daughter is in safe hands with Dr. Miller.",
  },
  "safe haven": {
    definition: "A place where someone can go to be protected from danger or trouble.",
    example: "The local library has become a safe haven for students looking for a quiet place to study after school.",
  },
  "serious accident": {
    definition: "A crash or mishap that results in significant damage or severe injury.",
    example: "Traffic was backed up for miles following a serious accident involving two trucks on the motorway.",
  },
  "serious illness": {
    definition: "A health condition that is severe and potentially life-threatening.",
    example: "Thankfully, modern medicine can now treat many serious illnesses that were once fatal.",
  },
  "serious injury": {
    definition: "Physical harm to the body that requires significant medical attention and recovery time.",
    example: "The helmet protected the cyclist from a serious injury when he fell off his bike.",
  },
  "serious relationship": {
    definition: "A romantic involvement where both people are committed to each other for the long term.",
    example: "They have been in a serious relationship for three years and are now thinking about moving in together.",
  },
  "severe weather": {
    definition: "Extreme atmospheric conditions, such as heavy storms, heatwaves, or blizzards, that can cause damage.",
    example: "The city issued a warning for severe weather, advising residents to stay indoors until the storm passed.",
  },
  "severe penalty": {
    definition: "A very harsh punishment for breaking a law or rule.",
    example: "The new legislation introduces a severe penalty for companies caught dumping chemical waste in the river.",
  },
  "severe shortage": {
    definition: "A critical lack of something that is needed, such as food, water, or labor.",
    example: "The region is currently facing a severe shortage of clean drinking water due to the prolonged drought.",
  },
  "severe pressure": {
    definition: "An extreme amount of stress or a strong demand to perform or succeed.",
    example: "Retailers are under severe pressure to lower their prices as consumer spending continues to drop.",
  },
  "severe pain": {
    definition: "Very strong physical pain.",
    example: "She was taken to hospital after complaining of severe pain in her chest.",
  },
  "speedy recovery": {
    definition: "The process of getting better quickly after being ill or having an operation.",
    example: "We sent her a bouquet of flowers with a card wishing her a speedy recovery after her surgery.",
  },
  "speedy response": {
    definition: "An answer or reaction that is provided very quickly.",
    example: "The customer support team is known for their speedy response, usually replying to tickets within an hour.",
  },
  "speedy trial": {
    definition: "A legal principle ensuring that a person accused of a crime is tried without undue delay.",
    example: "In many legal systems, the right to a speedy trial is a fundamental protection for the accused.",
  },
  "speedy exit": {
    definition: "A very quick departure from a place or a situation.",
    example: "When the fire alarm went off, the audience made a speedy exit through the designated emergency doors.",
  },
  "steady job": {
    definition: "A reliable position of employment that is likely to continue for a long time.",
    example: "After years of freelance work, he was finally able to land a steady job with a local architecture firm.",
  },
  "steady relationship": {
    definition: "A stable and long-term romantic commitment between two people.",
    example: "They have been in a steady relationship for five years and are now planning to buy a house together.",
  },
  "steady progress": {
    definition: "Development or improvement that happens at a consistent and reliable pace.",
    example: "While the project is complex, the team is making steady progress and expects to meet the deadline.",
  },
  "steady hand": {
    definition: "A hand that does not shake, which is necessary for tasks requiring great precision.",
    example: "A surgeon needs a steady hand and nerves of steel to perform such a delicate operation.",
  },
  "stiff competition": {
    definition: "Very strong or difficult opposition in a contest, race, or business environment.",
    example: "Small local shops often face stiff competition from large international supermarket chains.",
  },
  "stiff breeze": {
    definition: "A strong, cool wind that is noticeable but not quite a gale.",
    example: "A stiff breeze was blowing off the ocean, making the afternoon feel much colder than it actually was.",
  },
  "stiff drink": {
    definition: "A strong alcoholic beverage, usually served without much mixer.",
    example: "After a particularly stressful day at the office, he felt he needed a stiff drink to help him relax.",
  },
  "stiff neck": {
    definition: "A condition where the muscles in the neck are tight and painful, making it difficult to turn the head.",
    example: "I woke up with a stiff neck this morning, probably because I slept in an awkward position.",
  },
  "subject matter": {
    definition: "The specific topic, theme, or information that is being discussed, studied, or written about.",
    example: "While the writing style was beautiful, I found the subject matter of the book to be quite depressing.",
  },
  "subject change": {
    definition: "A shift in the conversation or focus from one topic to another.",
    example: "Noticing that the atmosphere was becoming tense, she initiated a subject change to something more lighthearted.",
  },
  "subject debate": {
    definition: "A formal discussion or argument concerning a specific topic.",
    example: "There has been an ongoing subject debate among scientists regarding the long-term effects of this new technology.",
  },
  "subject opinion": {
    definition: "(Often used as \"subjective opinion\") A personal view on a topic that is based on feelings rather than external facts.",
    example: "Whether the painting is a masterpiece or a mess is a matter of subject opinion rather than objective fact.",
  },
  "substantial amount": {
    definition: "A large or significant quantity of something, such as money or time.",
    example: "The company invested a substantial amount of money into research and development this year.",
  },
  "substantial increase": {
    definition: "A large and noticeable growth in size, amount, or degree.",
    example: "There has been a substantial increase in the number of people working from home since 2020.",
  },
  "substantial portion": {
    definition: "A large part or share of a whole.",
    example: "A substantial portion of the city's budget is dedicated to improving public infrastructure.",
  },
  "substantial change": {
    definition: "A significant or fundamental shift in a situation, policy, or structure.",
    example: "The new management team plans to make a substantial change to the company's internal culture.",
  },
  "superficial wound": {
    definition: "A physical injury that only affects the surface of the skin and is not deep or serious.",
    example: "The cyclist was lucky to walk away with only a superficial wound on his knee after the fall.",
  },
  "superficial knowledge": {
    definition: "A basic or shallow understanding of a subject that lacks depth or detail.",
    example: "He has a superficial knowledge of French, but he isn't fluent enough to hold a complex conversation.",
  },
  "superficial relationship": {
    definition: "A connection between people that is shallow, lacking in deep emotion or trust.",
    example: "While they are friendly at work, it remains a superficial relationship as they never meet outside the office.",
  },
  "superficial link": {
    definition: "A connection between two things that is not deep, strong, or fundamentally important.",
    example: "The researchers found only a superficial link between the two events, suggesting they were largely unrelated.",
  },
  "tight schedule": {
    definition: "A plan where activities are timed very closely together, leaving very little free time or room for error.",
    example: "We are on a very tight schedule, so we need to make sure every meeting starts exactly on time.",
  },
  "tight grip": {
    definition: "A firm and strong hold on something with your hand.",
    example: "The child kept a tight grip on his mother's hand as they walked through the crowded market.",
  },
  "tight budget": {
    definition: "A financial plan where there is very little extra money available for non-essential spending.",
    example: "As a student living on a tight budget, she had to learn how to cook healthy meals for very little money.",
  },
  "tight corner": {
    definition: "A difficult or awkward situation that is hard to get out of.",
    example: "The unexpected bill really put us in a tight corner, but we managed to find a way to pay it.",
  },
  "total bliss": {
    definition: "A state of complete and perfect happiness or joy.",
    example: "Lying on the beach with a good book was a moment of total bliss.",
  },
  "total failure": {
    definition: "A situation that is completely unsuccessful and does not achieve any of its goals.",
    example: "The experiment was a total failure, but the scientists learned a lot from the mistakes they made.",
  },
  "total disaster": {
    definition: "An event or situation that is completely unsuccessful or goes extremely wrong.",
    example: "The surprise party turned into a total disaster when the guest of honor arrived two hours early.",
  },
  "total disbelief": {
    definition: "A state of being completely unable to believe that something is true or has happened.",
    example: "She stared at the winning lottery ticket in total disbelief, unable to process her good luck.",
  },
  "typical example": {
    definition: "A specific case that shows the usual characteristics of a group or situation.",
    example: "The Victorian house on the corner is a typical example of the architecture from that era.",
  },
  "typical behavior": {
    definition: "The way a person or animal usually acts in a given situation.",
    example: "Arriving ten minutes early for every meeting is typical behavior for someone as organized as Sarah.",
  },
  "typical day": {
    definition: "A normal day where nothing unusual or unexpected happens.",
    example: "On a typical day, I wake up at 7:00 AM, have a coffee, and start work by 8:30 AM.",
  },
  "typical symptom": {
    definition: "A physical or mental sign that is commonly associated with a specific illness.",
    example: "A high fever and a persistent cough are typical symptoms of the flu.",
  },
  "ulterior motive": {
    definition: "A secret or hidden reason for doing something, often a selfish one.",
    example: "He offered to help me with the project, but I suspect he has an ulterior motive, like wanting a promotion.",
  },
  "ulterior reason": {
    definition: "A hidden justification for an action that is not immediately obvious.",
    example: "She claimed she was leaving the company for personal growth, but the ulterior reason was her disagreement with the new CEO.",
  },
  "ulterior purpose": {
    definition: "A secondary or concealed objective behind a specific action or event.",
    example: "The charity event was successful, though some critics argued it served an ulterior purpose of improving the sponsor's public image.",
  },
  "uncertain future": {
    definition: "A situation where it is not clear what will happen in the time to come.",
    example: "After the factory closed, many families in the town were left facing an uncertain future.",
  },
  "uncertain outcome": {
    definition: "A result that cannot be predicted with any confidence.",
    example: "With both candidates polling so closely, the election remains an uncertain outcome until the final votes are counted.",
  },
  "uncertain times": {
    definition: "Periods characterized by a lack of stability, security, or predictability.",
    example: "In these uncertain times, people tend to save more money and avoid making large, risky investments.",
  },
  "uncertain terms": {
    definition: "To speak or write in a way that is not clear, or (if used as \"in no uncertain terms\") to speak very clearly and forcefully.",
    example: "The manager told the team in no uncertain terms that the project must be finished by Friday.",
  },
  "unfair dismissal": {
    definition: "When an employer ends a worker's employment in a way that is illegal or breaches the contract.",
    example: "The former employee sued the company for unfair dismissal after being fired without a valid reason.",
  },
  "unfair advantage": {
    definition: "A benefit or edge that someone has over others which is considered dishonest or unequal.",
    example: "Using performance-enhancing drugs gives athletes an unfair advantage over those who compete cleanly.",
  },
  "unfair treatment": {
    definition: "Being dealt with in a way that is not just, impartial, or equal to others.",
    example: "The students complained of unfair treatment after the teacher graded the same assignment differently for different groups.",
  },
  "urban sprawl": {
    definition: "The uncontrolled expansion of urban areas into the surrounding countryside.",
    example: "Urban sprawl has led to longer commute times and the loss of significant wildlife habitats.",
  },
  "urban area": {
    definition: "A region surrounding a city, characterized by high population density and many man-made structures.",
    example: "Most people in developed countries now live in an urban area rather than in rural villages.",
  },
  "urban planning": {
    definition: "The technical and political process concerned with the development and design of land use in a city.",
    example: "Better urban planning is required to ensure that the city can handle the projected population growth.",
  },
  "urban development": {
    definition: "The social, cultural, and economic growth of cities, as well as the physical expansion of the built environment.",
    example: "The new urban development project includes the creation of three new parks and a community center.",
  },
  "utter catastrophe": {
    definition: "A complete and total disaster.",
    example: "The launch of the new product was an utter catastrophe due to several major technical glitches.",
  },
  "utter failure": {
    definition: "A situation that is completely unsuccessful in every way.",
    example: "Despite all the preparation, the peace talks were considered an utter failure by both sides.",
  },
  "utter chaos": {
    definition: "A state of total confusion and lack of order.",
    example: "The power outage caused utter chaos at the airport, with thousands of passengers stranded.",
  },
  "utter loathing": {
    definition: "A feeling of intense, absolute hatred or disgust.",
    example: "The two rivals looked at each other with utter loathing during the final match.",
  },
  "vague idea": {
    definition: "A general or rough thought about something that lacks specific details.",
    example: "I have a vague idea of how the engine works, but I couldn't explain the details to you.",
  },
  "vague memory": {
    definition: "A faint or unclear recollection of a past event.",
    example: "I have a vague memory of visiting this park as a child, but I don't remember much else.",
  },
  "vague description": {
    definition: "A report or account of something that is not clear or specific enough.",
    example: "The witness could only give a vague description of the suspect, making the investigation difficult.",
  },
  "vague recollection": {
    definition: "An unclear or hazy memory of something (similar to a vague memory).",
    example: "She had a vague recollection of meeting him before, but she couldn't remember his name.",
  },
  "valid point": {
    definition: "An argument or statement that is logical, reasonable, and based on fact.",
    example: "You make a valid point about the budget; we should definitely look into those costs again.",
  },
  "valid reason": {
    definition: "A justification for an action that is officially acceptable or logical.",
    example: "Missing the exam because of a family emergency is considered a valid reason for a retake.",
  },
  "valid argument": {
    definition: "A set of reasons or logic that is sound and difficult to dispute.",
    example: "The lawyer presented a valid argument for why the contract should be considered void.",
  },
  "valid passport": {
    definition: "A passport that is officially recognized and has not expired.",
    example: "You must have a valid passport with at least six months of remaining validity to enter the country.",
  },
  "valuable contribution": {
    definition: "A helpful or important addition to a project, discussion, or organization.",
    example: "Her research made a valuable contribution to our understanding of renewable energy sources.",
  },
  "valuable information": {
    definition: "Facts or data that are very useful or important.",
    example: "The whistleblower provided the journalists with valuable information regarding the company's finances.",
  },
  "valuable lesson": {
    definition: "A useful experience that teaches you something important for the future.",
    example: "Failing the first exam was a valuable lesson in the importance of consistent study habits.",
  },
  "valuable asset": {
    definition: "A person or thing that is very useful or beneficial to a group or organization.",
    example: "His ability to speak four languages fluently makes him a valuable asset to our international sales team.",
  },
  "vital role": {
    definition: "A part in a process or activity that is absolutely necessary for success.",
    example: "Technology plays a vital role in modern healthcare, from patient records to robotic surgery.",
  },
  "vital organs": {
    definition: "The body's most important internal organs, such as the heart, lungs, and brain, which are necessary for life.",
    example: "The paramedics worked quickly to stabilize the patient and protect his vital organs after the accident.",
  },
  "vital information": {
    definition: "Data or facts that are essential for a specific purpose or decision.",
    example: "Please ensure you have all the vital information before you sign the mortgage agreement.",
  },
  "vital statistic": {
    definition: "A quantitative datum on births, deaths, marriages, or other aspects of a population.",
    example: "The government tracks vital statistics to plan for future housing and school requirements.",
  },
  "welcome change": {
    definition: "A modification or shift that is pleasing and appreciated.",
    example: "The cooler weather this week has been a welcome change after the intense heatwave.",
  },
  "welcome relief": {
    definition: "A feeling of happiness or comfort when something unpleasant stops or is avoided.",
    example: "The news that the surgery was successful brought a welcome relief to the entire family.",
  },
  "welcome break": {
    definition: "A short period of rest or relaxation that is much needed.",
    example: "We took a welcome break from our hike to sit by the river and have some lunch.",
  },
  "welcome addition": {
    definition: "A person or thing that has recently joined a group and is considered a good improvement.",
    example: "The new library has been a welcome addition to the neighborhood, especially for the local students.",
  },
  "wrong number": {
    definition: "An incorrect telephone number that has been dialed.",
    example: "I'm sorry, I think you have the wrong number; there is no one by that name living here.",
  },
  "wrong way": {
    definition: "Moving or facing in a direction that is not the intended or correct one.",
    example: "We realized we were going the wrong way on the highway and had to wait for the next exit to turn around.",
  },
  "wrong impression": {
    definition: "An inaccurate or incorrect idea or opinion about someone or something.",
    example: "I don't want to give you the wrong impression; the project is difficult, but it's not impossible.",
  },
  "wrong answer": {
    definition: "An answer that is not correct.",
    example: "She knew immediately that she had given the wrong answer in the interview.",
  },
  "zero tolerance": {
    definition: "A strict policy of not allowing any amount of a particular activity or behavior, usually involving immediate punishment.",
    example: "The school has a zero tolerance policy regarding bullying, and any student caught will be suspended immediately.",
  },
  "zero visibility": {
    definition: "A condition where it is impossible to see anything at all, often due to extreme weather like thick fog or a blizzard.",
    example: "The highway was closed after a sudden sandstorm created zero visibility for drivers.",
  },
  "zero growth": {
    definition: "A situation where an economy, population, or company does not increase in size or value over a period of time.",
    example: "The report predicts zero growth for the manufacturing sector over the next fiscal year.",
  },
  "zero chance": {
    definition: "A total and complete lack of any possibility that something will happen.",
    example: "If we don't submit the application by the deadline tonight, there is zero chance we will be considered for the grant.",
  },
  "account manager": {
    definition: "A person whose job is to manage the relationship between a company and one or more customers or clients.",
    example: "Our account manager called to discuss the renewal of the software contract.",
  },
  "account executive": {
    definition: "A person whose job is to manage client accounts, especially in sales, advertising, or public relations.",
    example: "She started her career as an account executive at a small advertising agency.",
  },
  "account balance": {
    definition: "The amount of money currently available in a bank account or financial account.",
    example: "You can check your account balance online before making the payment.",
  },
  "child protection": {
    definition: "Systems and actions designed to keep children safe from harm, abuse, or neglect.",
    example: "The school introduced a new child protection policy for all staff and volunteers.",
  },
  "day break": {
    definition: "The time in the morning when daylight first appears.",
    example: "We left the campsite at daybreak to avoid walking during the hottest part of the day.",
  },
  "day time": {
    definition: "The part of the day when it is light outside.",
    example: "The shop is open during the daytime but closes before evening.",
  },
  "desk top": {
    definition: "The main screen area of a computer, or a computer designed to stay on a desk.",
    example: "Save the file to your desktop so you can find it quickly later.",
  },
  "jail bird": {
    definition: "An informal word for someone who has been in prison, especially repeatedly.",
    example: "The old newspaper described him as a jailbird with a long criminal record.",
  },
  "jail break": {
    definition: "An escape from prison.",
    example: "The film is based on a dramatic jailbreak that happened in the 1960s.",
  },
  "road works": {
    definition: "Repairs or construction work being done on a road.",
    example: "The road works caused long delays on the way into town.",
  },
  "stock broker": {
    definition: "A person or company that buys and sells stocks and shares for clients.",
    example: "He contacted his stock broker before investing in the technology company.",
  },
  "tea spoon": {
    definition: "A small spoon used for stirring tea or coffee, or a small unit of measurement in cooking.",
    example: "Add one teaspoon of sugar and stir until it dissolves.",
  },
  "work force": {
    definition: "All the people who work for a company, industry, or country.",
    example: "The company plans to train its workforce in new digital skills.",
  },
  "work place": {
    definition: "The place where someone works.",
    example: "The new rules are designed to improve safety in the workplace.",
  },
  "work load": {
    definition: "The amount of work that a person or team has to do.",
    example: "Her workload increased dramatically after two colleagues left the department.",
  },
  "work experience": {
    definition: "Practical experience of a job or workplace, often done by students or trainees.",
    example: "Applicants with previous work experience are more likely to be invited for an interview.",
  },
  "package holiday": {
    definition: "A holiday at a fixed price in which all travel, hotels, and sometimes meals are arranged by a travel agent.",
    example: "We decided to book a package holiday to Greece so we wouldn't have to worry about organizing flights and accommodation separately.",
  },
  "package deal": {
    definition: "A set of several related items or services that are sold together as a single unit.",
    example: "The gym is offering a package deal that includes a monthly membership, three personal training sessions, and a nutrition plan.",
  },
  "package tour": {
    definition: "An organized holiday with a fixed itinerary and a guide, often traveling with a group of other people.",
    example: "My grandparents prefer a package tour because it takes away the stress of navigating a foreign country on their own.",
  },
  "parking ticket": {
    definition: "A notice of a fine imposed for parking a motor vehicle in an area where it is not allowed or for staying too long.",
    example: "I was only gone for five minutes, but I still came back to find a parking ticket on my windshield.",
  },
  "parking space": {
    definition: "A specific area designated for parking a single vehicle.",
    example: "Finding an available parking space in the city center on a Saturday afternoon is almost impossible.",
  },
  "parking meter": {
    definition: "A coin-operated (or digital) device placed next to a parking space, used to collect fees for the right to park there.",
    example: "Don't forget to put some change in the parking meter, or you might end up with a fine.",
  },
  "parking permit": {
    definition: "An official document or sticker that allows a person to park their vehicle in a specific restricted area.",
    example: "Residents of this street are required to display a valid parking permit on their dashboard at all times.",
  },
  "pay increase": {
    definition: "An addition to the amount of money a person is paid for their work.",
    example: "After her excellent performance review, she was thrilled to receive a five percent pay increase.",
  },
  "pay rise": {
    definition: "(British English) A synonym for pay increase; an increase in salary or wages.",
    example: "The union is currently negotiating with the management for a significant pay rise to match the cost of living.",
  },
  "pay scale": {
    definition: "A system or range of different levels of pay for different jobs or at different levels within a company.",
    example: "As a new teacher, your salary will be determined by the standard pay scale for the district.",
  },
  "pay cut": {
    definition: "A reduction in the amount of money a person is paid for their work.",
    example: "To avoid laying off staff during the economic downturn, the company's directors all agreed to take a pay cut.",
  },
  "piece of advice": {
    definition: "A single suggestion or recommendation about what someone should do.",
    example: "If I could give you one piece of advice, it would be to start saving for your retirement as early as possible.",
  },
  "piece of equipment": {
    definition: "A single item of tools or machinery needed for a particular activity or purpose.",
    example: "The most expensive piece of equipment in the new science lab is the electron microscope.",
  },
  "piece of information": {
    definition: "A single fact or detail about something or someone.",
    example: "That was a very interesting piece of information; I had no idea that the city was founded so long ago.",
  },
  "piece of music": {
    definition: "A single musical composition, such as a song or a symphony.",
    example: "He spent months composing a beautiful piece of music for his sister's wedding.",
  },
  "post office": {
    definition: "A building where you can buy stamps and send letters or packages.",
    example: "I need to stop by the post office to mail this birthday present to my sister.",
  },
  "post card": {
    definition: "A card for sending a message by mail without an envelope, usually having a photograph or illustration on one side.",
    example: "She sent us a colorful post card from her summer vacation in Rome.",
  },
  "post code": {
    definition: "(British English) A group of letters and numbers added to a postal address to assist the sorting of mail.",
    example: "Please make sure you write the correct post code on the envelope so the letter arrives on time.",
  },
  "post box": {
    definition: "(British English) A large metal box in a public place where you can put letters to be collected and sent.",
    example: "I dropped the invitation into the post box on the corner this morning.",
  },
  "price competition": {
    definition: "Rivalry between companies based on the prices of their products rather than their quality or features.",
    example: "Intense price competition between the two airlines has led to significantly cheaper flights for travelers.",
  },
  "price tag": {
    definition: "A label on an item showing its price.",
    example: "I liked the dress, but when I saw the price tag, I realized it was way out of my budget.",
  },
  "price war": {
    definition: "A situation in which companies continuously lower prices to compete with each other.",
    example: "The supermarket chains are engaged in a price war, cutting the cost of milk and bread to attract more customers.",
  },
  "price increase": {
    definition: "A rise in the amount of money you must pay for something.",
    example: "There has been a steady price increase in gasoline over the last few months.",
  },
  "production cost": {
    definition: "The total amount of money spent to manufacture a product.",
    example: "The company is looking for ways to reduce its production cost without sacrificing quality.",
  },
  "production line": {
    definition: "A sequence of machines and workers in a factory that assembles a product step by step.",
    example: "He spent his summer working on the production line at the car manufacturing plant.",
  },
  "production target": {
    definition: "A specific amount of a product that a factory or team is required to produce within a certain timeframe.",
    example: "The team worked overtime to ensure they met their production target for the quarter.",
  },
  "production manager": {
    definition: "A person responsible for overseeing and managing the manufacturing process in a factory.",
    example: "As a production manager, her job is to ensure that the factory runs efficiently and safely.",
  },
  "profit margin": {
    definition: "The difference between the cost of making or buying something and the price at which it is sold.",
    example: "The software company enjoys a high profit margin because its products are cheap to distribute.",
  },
  "profit share": {
    definition: "A system in which employees receive a percentage of the company's profits as a bonus.",
    example: "The profit share scheme encourages staff to work harder to ensure the business is successful.",
  },
  "profit forecast": {
    definition: "A prediction of how much money a company will make in the future.",
    example: "The CEO revised the profit forecast upward following a record-breaking holiday sales season.",
  },
  "quality of life": {
    definition: "The standard of health, comfort, and happiness experienced by an individual or group.",
    example: "Many people move away from big cities to the countryside in search of a better quality of life.",
  },
  "quality assurance": {
    definition: "The maintenance of a desired level of quality in a service or product, especially by means of attention to every stage of the process.",
    example: "The quality assurance team tests the software for weeks to ensure there are no bugs before it is released to the public.",
  },
  "quality control": {
    definition: "A system of maintaining standards in manufactured products by testing a sample of the output against the specification.",
    example: "Every single car that leaves the factory must pass a strict quality control inspection.",
  },
  "rate of return": {
    definition: "The gain or loss of an investment over a specified period of time, expressed as a percentage of the investment's cost.",
    example: "Real estate often offers a higher rate of return compared to keeping your money in a standard savings account.",
  },
  "rate of exchange": {
    definition: "The value of one currency for the purpose of conversion to another.",
    example: "You should check the current rate of exchange before you convert your euros into dollars for your trip.",
  },
  "rate of pay": {
    definition: "The amount of money a worker is paid per unit of time (e.g., per hour or per month).",
    example: "The company offers a competitive rate of pay along with excellent benefits and a yearly bonus.",
  },
  "rental income": {
    definition: "The money collected by a landlord from tenants for the use of a property.",
    example: "The rental income from his two apartments is enough to cover his mortgage and basic living expenses.",
  },
  "rental agreement": {
    definition: "A legal contract between a landlord and a tenant that outlines the terms of renting a property.",
    example: "Make sure to read every page of the rental agreement before you sign it and pay the deposit.",
  },
  "rental property": {
    definition: "A house, apartment, or commercial building that is owned by someone and leased to others.",
    example: "Investing in a rental property near a university is usually a safe bet because there is always a demand for student housing.",
  },
  "return address": {
    definition: "The address of the person sending a letter or package, typically written on the back of the envelope.",
    example: "Don't forget to include a return address in case the post office is unable to deliver the letter.",
  },
  "return flight": {
    definition: "The flight that takes you back to the place you started from at the end of a trip.",
    example: "Our return flight was delayed by three hours, so we didn't get home until after midnight.",
  },
  "return ticket": {
    definition: "(British English) A ticket that allows you to travel to a place and back again.",
    example: "A return ticket is usually much cheaper than buying two separate one-way tickets.",
  },
  "return journey": {
    definition: "The trip back to your starting point.",
    example: "The return journey felt much shorter than the trip there, probably because we weren't as excited anymore.",
  },
  "road safety": {
    definition: "The state or condition of being safe on the road, or the measures taken to prevent accidents.",
    example: "The government has launched a new campaign to improve road safety and reduce the number of accidents involving cyclists.",
  },
  "road rage": {
    definition: "Violent anger caused by the stress and frustration of driving in heavy traffic.",
    example: "The driver was arrested after a terrifying incident of road rage where he chased another car for several miles.",
  },
  "road map": {
    definition: "A map, especially one designed for motorists, showing the roads of a country or area.",
    example: "Before GPS became common, everyone kept a folded road map in the glove compartment of their car.",
  },
  "room for improvement": {
    definition: "A situation or area where it is possible for something or someone to get better.",
    example: "Your essay was quite good, but there is still some room for improvement in your grammar and punctuation.",
  },
  "room temperature": {
    definition: "The typical temperature of a room, neither notably hot nor cold (usually around 20°C).",
    example: "Red wine is best served at room temperature, while white wine should be chilled.",
  },
  "room service": {
    definition: "A service in a hotel where guests can have food and drinks delivered to their rooms.",
    example: "We were feeling too tired to go out to a restaurant, so we decided to order room service instead.",
  },
  "savings bond": {
    definition: "A government bond that offers a fixed rate of interest over a fixed period of time.",
    example: "Her grandmother gave her a savings bond for her eighteenth birthday to help pay for university.",
  },
  "savings account": {
    definition: "A bank account that earns interest and is used for keeping money that you do not intend to spend immediately.",
    example: "I try to put twenty percent of my salary into my savings account every month.",
  },
  "savings bank": {
    definition: "A financial institution that primarily accepts savings deposits and pays interest on them.",
    example: "The local savings bank has been serving the community for over a hundred years.",
  },
  "search warrant": {
    definition: "A legal document authorizing a police officer or other official to enter and search a premises.",
    example: "The police cannot enter your house without a search warrant signed by a judge.",
  },
  "search engine": {
    definition: "A program that searches for and identifies items in a database that correspond to keywords specified by the user.",
    example: "Google is the most widely used search engine in the world, processing billions of queries every day.",
  },
  "search party": {
    definition: "A group of people organized to find someone who is lost or missing.",
    example: "A search party was sent out into the woods to look for the missing hikers.",
  },
  "security forces": {
    definition: "Military or police organizations responsible for maintaining order and protecting a country or region.",
    example: "The government deployed security forces to the border to monitor the situation during the international summit.",
  },
  "security blanket": {
    definition: "An object (like a literal blanket) or a person/policy that provides a sense of safety and comfort.",
    example: "For the toddler, his worn-out teddy bear acts as a security blanket whenever he is in a new environment.",
  },
  "security guard": {
    definition: "A person employed to protect a building or people.",
    example: "The security guard at the entrance asked everyone to show their ID before entering the office building.",
  },
  "security system": {
    definition: "A collection of devices, such as alarms and cameras, used to protect a property against intruders.",
    example: "We installed a modern security system that sends an alert to our phones if a door is opened unexpectedly.",
  },
  "service charge": {
    definition: "An extra amount of money added to a bill (usually in a restaurant or hotel) for the work done by the staff.",
    example: "The restaurant bill includes a 12% service charge, so you don't necessarily need to leave an additional tip.",
  },
  "service industry": {
    definition: "The sector of the economy that provides services rather than producing goods, such as hospitality or banking.",
    example: "Tourism is a major part of the service industry in many coastal Mediterranean towns.",
  },
  "service station": {
    definition: "(British English) A place on a highway where you can buy fuel, food, and use the restroom.",
    example: "We stopped at a service station halfway through our road trip to stretch our legs and get some coffee.",
  },
  "service provider": {
    definition: "A company that provides a specific service to customers, such as internet or electricity.",
    example: "If you are unhappy with your current internet speed, you might want to switch to a different service provider.",
  },
  "service work": {
    definition: "Labor that involves providing a service to others, often in the retail or hospitality sectors.",
    example: "Doing service work like waiting tables can be physically demanding but helps develop great communication skills.",
  },
  "sore throat": {
    definition: "A condition where your throat is painful, usually because of a cold or infection.",
    example: "I woke up with a sore throat and a slight fever, so I decided to stay home from work today.",
  },
  "sore point": {
    definition: "A subject that makes someone feel angry, upset, or embarrassed when it is mentioned.",
    example: "Don't ask him about his old car; it's a bit of a sore point since it broke down right after he paid for repairs.",
  },
  "sore loser": {
    definition: "A person who becomes angry or complains when they lose a game or competition.",
    example: "He's such a sore loser; he refused to shake hands after the tennis match just because he lost the final set.",
  },
  "sore head": {
    definition: "(Informal) A person who is feeling irritable or suffering from a headache, often due to a hangover.",
    example: "He had a bit of a sore head this morning after staying out late at the party last night.",
  },
  "speed limit": {
    definition: "The maximum legal speed at which a vehicle is allowed to travel on a particular road.",
    example: "The speed limit on this section of the highway is 100 km/h, but many drivers tend to go faster.",
  },
  "speed camera": {
    definition: "A camera used by the police to record the speed of passing vehicles and identify those breaking the limit.",
    example: "I received a fine in the mail because a speed camera caught me going slightly over the limit in the school zone.",
  },
  "speed trap": {
    definition: "A place on a road where police hidden from view use equipment to catch drivers who are speeding.",
    example: "Local drivers know there is usually a speed trap at the bottom of the hill, so they always slow down there.",
  },
  "stock option": {
    definition: "A benefit in the form of an option to buy shares in the company at a discount or at a fixed price.",
    example: "As part of her executive compensation package, she was granted a significant number of stock options.",
  },
  "stock market": {
    definition: "A system in which shares of publicly held companies are issued, bought, and sold.",
    example: "Investors were nervous this morning as the stock market saw a sharp decline following the inflation report.",
  },
  "stock exchange": {
    definition: "A market in which securities are bought and sold; the physical or electronic place where this trading happens.",
    example: "The New York stock exchange is the largest in the world by market capitalization of its listed companies.",
  },
  "tax break": {
    definition: "A tax advantage or reduction in tax liability granted by the government to certain individuals or businesses.",
    example: "The government is offering a tax break to companies that invest heavily in green technology.",
  },
  "tax shelter": {
    definition: "A legal way of minimizing taxable income, often by investing in specific assets or using certain financial arrangements.",
    example: "While some people use offshore accounts as a tax shelter, the authorities are becoming much stricter about reporting such assets.",
  },
  "tax return": {
    definition: "A form on which a taxpayer makes an official statement of income and personal circumstances, used to assess tax liability.",
    example: "I spent the entire weekend gathering my receipts and documents to finish my annual tax return before the deadline.",
  },
  "tax deduction": {
    definition: "A reduction in the gross amount of income on which a person is taxed, usually based on specific expenses.",
    example: "You may be eligible for a tax deduction on the interest you paid for your student loans last year.",
  },
  "tea leaf": {
    definition: "The dried, prepared leaf of the tea plant, used to make the beverage.",
    example: "She prefers brewing her tea with loose tea leaves rather than using pre-packaged bags for a better flavor.",
  },
  "tea bag": {
    definition: "A small porous sachet containing tea leaves, used for brewing tea conveniently.",
    example: "I was in a rush, so I just dropped a tea bag into a mug and added boiling water.",
  },
  "tea time": {
    definition: "The time in the afternoon or evening when tea is served, or a light meal eaten in the late afternoon.",
    example: "In many British households, tea time is a tradition that involves sandwiches, scones, and a hot pot of tea.",
  },
  "television reporter": {
    definition: "A person who investigates and reports news stories for a TV station.",
    example: "The television reporter stood out in the pouring rain to give a live update on the approaching hurricane.",
  },
  "television show": {
    definition: "A program broadcast on television, such as a sitcom, documentary, or game show.",
    example: "My favorite television show was unfortunately canceled after only two seasons despite having a loyal fanbase.",
  },
  "television series": {
    definition: "A set of programs broadcast in regular installments, typically featuring a continuing story or characters.",
    example: "She is currently binge-watching a historical television series about the Tudor dynasty.",
  },
  "television station": {
    definition: "A local or national organization that broadcasts programs via television.",
    example: "The local television station provides coverage of community events and high school sports.",
  },
  "television news": {
    definition: "The broadcast of current events on television.",
    example: "He always turns on the television news at 6:00 PM to catch the headlines before dinner.",
  },
  "television movie": {
    definition: "A feature-length motion picture that is produced for and originally distributed by a television network.",
    example: "The actress got her big break after starring in a popular television movie about a true crime case.",
  },
  "term paper": {
    definition: "A long essay written by a student on a particular subject during an academic term.",
    example: "I need to spend all weekend in the library to finish my history term paper before Monday's deadline.",
  },
  "term time": {
    definition: "The period of the year during which students are required to be at school or university.",
    example: "The town is much livelier during term time when thousands of students return to the local campus.",
  },
  "term limit": {
    definition: "A legal restriction that limits the number of terms an officeholder may serve in a particular elected office.",
    example: "Many citizens argue that a term limit for senators would encourage fresh ideas in the government.",
  },
  "trade route": {
    definition: "A logistical network identified as a series of pathways and stoppages used for the commercial transport of cargo.",
    example: "The Silk Road was an ancient trade route that connected the East and the West for centuries.",
  },
  "trade union": {
    definition: "An organized association of workers formed to protect and further their rights and interests.",
    example: "The trade union is threatening to go on strike if the company does not improve safety conditions.",
  },
  "trade secret": {
    definition: "A secret device or technique used by a company in manufacturing its products.",
    example: "The recipe for the world-famous soda is a closely guarded trade secret that only a few people know.",
  },
  "trade gap": {
    definition: "The difference between the value of a country's imports and its exports.",
    example: "Economists are concerned that the widening trade gap could lead to a weaker national currency.",
  },
  "trial court": {
    definition: "A court in which most cases begin and in which questions of fact are examined.",
    example: "The trial court's decision was later overturned by the higher court of appeals.",
  },
  "trial lawyer": {
    definition: "A lawyer who specializes in defending or prosecuting clients in a court of law.",
    example: "To be a successful trial lawyer, you need to be an excellent public speaker and quick on your feet.",
  },
  "trial run": {
    definition: "A preliminary testing of a new product or system to see if it works correctly.",
    example: "We're going to do a trial run of the new software with a small group of users before the global launch.",
  },
  "trial period": {
    definition: "A specific amount of time during which someone or something is tested.",
    example: "Most new employees have a three-month trial period before their position becomes permanent.",
  },
  "voting booth": {
    definition: "A small, partly enclosed area in a polling station where a person can cast their vote in private.",
    example: "She stepped into the voting booth and pulled the curtain shut to make her selection in secret.",
  },
  "voting machine": {
    definition: "A machine used to record and tabulate votes in an election.",
    example: "The county upgraded to digital voting machines to speed up the counting process on election night.",
  },
  "voting right": {
    definition: "The legal right to participate in an election by casting a ballot.",
    example: "The civil rights movement fought tirelessly to ensure that every citizen could exercise their voting right.",
  },
  "voting age": {
    definition: "The minimum age established by law at which a person is allowed to vote in a public election.",
    example: "In many countries, the voting age was lowered from 21 to 18 during the 20th century.",
  },
  "war crime": {
    definition: "An action carried out during a war that violates international rules of war (e.g., attacking civilians).",
    example: "The international tribunal was established to prosecute individuals accused of committing a war crime.",
  },
  "war zone": {
    definition: "A region in which a war is being fought.",
    example: "Journalists often put their lives at risk to report from the middle of a war zone.",
  },
  "war game": {
    definition: "A military exercise carried out to test tactical theories or training without actual combat.",
    example: "The navy is conducting a massive war game in the Pacific to prepare for potential maritime threats.",
  },
  "war hero": {
    definition: "A person who has performed an act of great bravery or sacrifice during a war.",
    example: "The veteran was honored as a war hero for saving his entire platoon during the battle.",
  },
  "water cannon": {
    definition: "A device that ejects a powerful jet of water, typically used to disperse crowds or fight fires.",
    example: "The police used a water cannon to break up the protest after it turned violent.",
  },
  "water heater": {
    definition: "A device that heats water and stores it for use in a building.",
    example: "We had to take cold showers this morning because the water heater in the basement broke down.",
  },
  "water level": {
    definition: "The height of the surface of a body of water.",
    example: "Following the heavy rains, the water level in the reservoir has risen to its highest point in a decade.",
  },
  "water tank": {
    definition: "A container for storing water, often found on the roof or in the basement of a building.",
    example: "The desert community relies on a giant water tank to provide fresh water during the dry season.",
  },
  "word blindness": {
    definition: "An older term for dyslexia; the inability to recognize or understand written words.",
    example: "As a child, he struggled with word blindness, but with special tutoring, he eventually became an avid reader.",
  },
  "word salad": {
    definition: "A confused or unintelligible mixture of seemingly random words and phrases.",
    example: "In some psychological disorders, a patient's speech may become a word salad that is impossible to follow.",
  },
  "word choice": {
    definition: "The specific words a writer or speaker uses to convey their meaning effectively.",
    example: "The poet's careful word choice creates a vivid and haunting atmosphere in every stanza.",
  },
  "work permit": {
    definition: "An official document giving a foreigner permission to take a job in a country.",
    example: "You cannot legally start your new job in London until your work permit has been approved.",
  },
  "air attack": {
    definition: "An offensive action carried out by aircraft against a target on the ground or at sea.",
    example: "The historical documentary detailed the strategic air attack that changed the course of the battle.",
  },
  "air raid": {
    definition: "An attack by military aircraft on a specific place, often involving the dropping of bombs.",
    example: "During the war, the city's residents were frequently alerted to an impending air raid by loud sirens.",
  },
  "air gun": {
    definition: "A weapon that uses compressed air or gas to fire projectiles, typically used for sport or pest control.",
    example: "He practiced his aim at the shooting range using a high-precision air gun.",
  },
  "air conditioning": {
    definition: "A system for controlling the humidity, ventilation, and temperature in a building or vehicle.",
    example: "I couldn't have survived the summer heatwave without the air conditioning in my office.",
  },
  "auto maker": {
    definition: "A company that designs, develops, and manufactures motor vehicles.",
    example: "The leading Japanese auto maker announced plans to transition entirely to electric vehicles by 2035.",
  },
  "auto manufacturer": {
    definition: "A synonym for auto maker; a company involved in the industrial production of cars.",
    example: "Supply chain disruptions have forced the auto manufacturer to temporarily halt production at three of its plants.",
  },
  "auto industry": {
    definition: "The global sector that includes the design, manufacture, marketing, and selling of motor vehicles.",
    example: "The auto industry is currently undergoing a massive transformation toward automation and sustainability.",
  },
  "bank draft": {
    definition: "A check guaranteed by a bank, drawn on the bank's own funds rather than an individual's account.",
    example: "The seller requested payment via bank draft to ensure the funds were secure before releasing the title of the house.",
  },
  "bank rate": {
    definition: "The interest rate at which a central bank lends money to domestic banks.",
    example: "The central bank decided to raise the bank rate to combat rising inflation across the country.",
  },
  "bank account": {
    definition: "An arrangement made with a bank whereby one may deposit and withdraw money.",
    example: "It is important to check your bank account regularly to monitor for any unauthorized transactions.",
  },
  "bank statement": {
    definition: "A printed or digital record of the balance in a bank account and the amounts that have been paid into it and withdrawn from it.",
    example: "You will need to provide a recent bank statement as proof of funds for your visa application.",
  },
  "bank note": {
    definition: "A piece of paper money issued by a central bank.",
    example: "The new bank note features advanced security features to prevent counterfeiting.",
  },
  "bargain hunters": {
    definition: "People who look for goods that are being sold at a price lower than usual.",
    example: "The store was packed with bargain hunters as soon as the winter clearance sale began.",
  },
  "bargain price": {
    definition: "A very low and favorable price for an item.",
    example: "I managed to pick up this designer coat at a bargain price because it was the last one in stock.",
  },
  "bargain sale": {
    definition: "An event where goods are sold at significantly reduced prices.",
    example: "The local bookstore is holding a bargain sale this weekend to clear out older editions.",
  },
  "beauty industry": {
    definition: "The global sector focused on products and services related to cosmetics, hair care, and skincare.",
    example: "The beauty industry has seen a massive shift toward sustainable and vegan products in recent years.",
  },
  "beauty salon": {
    definition: "An establishment where a person can receive various cosmetic treatments (hair, nails, skin).",
    example: "She booked an appointment at the beauty salon to get her hair and makeup done for the wedding.",
  },
  "beauty shop": {
    definition: "A common alternative term for a beauty salon or a store selling cosmetics.",
    example: "The small beauty shop on the corner is famous for its handmade organic soaps.",
  },
  "beauty parlor": {
    definition: "A slightly more traditional or formal term for a beauty salon.",
    example: "My grandmother has been going to the same beauty parlor every Saturday morning for forty years.",
  },
  "birth certificate": {
    definition: "An official document issued by the government recording the details of a person's birth.",
    example: "You will need to provide an original copy of your birth certificate to apply for a new passport.",
  },
  "birth rate": {
    definition: "The number of live births per thousand of population per year.",
    example: "Economists are worried about the declining birth rate in many developed nations.",
  },
  "birth control": {
    definition: "The use of various methods or devices to prevent pregnancy.",
    example: "Access to affordable birth control is considered a fundamental aspect of modern reproductive healthcare.",
  },
  "block of flats": {
    definition: "(British English) A large building that contains many individual apartments.",
    example: "They live on the fourth floor of a modern block of flats overlooking the park.",
  },
  "block grant": {
    definition: "A large sum of money granted by a central government to a regional government with few strings attached.",
    example: "The state received a block grant from the federal government to improve local infrastructure and schools.",
  },
  "block booking": {
    definition: "The practice of reserving a large number of tickets or rooms at the same time.",
    example: "The travel agency made a block booking at the hotel for the entire tour group.",
  },
  "board game": {
    definition: "A game played on a marked surface or board, usually involving pieces that are moved according to rules.",
    example: "\"During the rainy weekend, the family stayed inside and played a classic board game together\".",
  },
  "board meeting": {
    definition: "A formal gathering of the directors of an organization to discuss policy and performance.",
    example: "\"The CEO presented the annual financial results during the quarterly board meeting\".",
  },
  "board member": {
    definition: "A person who serves on the governing board of a corporation or non-profit organization.",
    example: "\"As a board member, she has a significant say in the long-term strategy of the charity\".",
  },
  "body armor": {
    definition: "Protective clothing designed to absorb or deflect physical attacks, often used by police or military personnel.",
    example: "\"Modern body armor is lightweight but strong enough to protect officers from ballistic threats\".",
  },
  "body double": {
    definition: "A person who substitutes for an actor in scenes that do not require the actor's face, often for stunts or nudity.",
    example: "\"The movie used a professional body double for the high-speed motorcycle chase scene\".",
  },
  "body language": {
    definition: "The non-verbal signals that we use to communicate, such as gestures, posture, and facial expressions.",
    example: "\"Even though he said he was fine, his body language suggested he was actually very nervous\".",
  },
  "call center": {
    definition: "A centralized office used for receiving or transmitting a large volume of inquiries by telephone.",
    example: "\"Many companies outsource their customer support to a call center in a different time zone to provide 24/7 service\".",
  },
  "call option": {
    definition: "A financial contract that gives the buyer the right to purchase a stock or bond at a specified price.",
    example: "\"He decided to buy a call option, betting that the tech company's stock price would rise next month\".",
  },
  "call card": {
    definition: "A physical or digital card used to pay for telephone calls, typically for long-distance or international use.",
    example: "\"Before smartphones were common, travelers often bought a call card to contact their families from abroad\".",
  },
  "capital gain": {
    definition: "A profit from the sale of property or an investment.",
    example: "\"If you sell your house for more than you paid for it, you may be required to pay tax on the capital gain\".",
  },
  "capital city": {
    definition: "The municipality exercising primary status in a country, usually being its seat of government.",
    example: "\"Madrid is the capital city of Spain and serves as the country's political and cultural hub\".",
  },
  "capital punishment": {
    definition: "The legally authorized killing of someone as punishment for a crime.",
    example: "\"The debate over capital punishment continues to be a highly controversial topic in international human rights law\".",
  },
  "car manufacturer": {
    definition: "A company that produces cars on a large scale.",
    example: "The German car manufacturer is known for producing some of the most reliable luxury vehicles in the world.",
  },
  "car park": {
    definition: "(British English) An area or building where cars may be left temporarily.",
    example: "The shopping center has a multi-story car park that can hold up to five hundred vehicles.",
  },
  "car pool": {
    definition: "An arrangement between people to make a regular journey in a single vehicle, typically to work.",
    example: "To save money on gas and reduce their carbon footprint, the neighbors decided to start a car pool.",
  },
  "case law": {
    definition: "The law as established by the outcome of former cases rather than statutory law.",
    example: "The lawyer spent hours researching case law to find a precedent that would support his client's defense.",
  },
  "case study": {
    definition: "A particular instance of something used or analyzed in order to illustrate a thesis or principle.",
    example: "During the business course, we analyzed a case study of a startup that failed despite having a great product.",
  },
  "case work": {
    definition: "Social work involving direct contact with individuals and their families.",
    example: "Most of her day is spent on case work, visiting families to ensure the children are being well-cared for.",
  },
  "cash cow": {
    definition: "A business, investment, or product that provides a steady income or profit.",
    example: "The classic video game franchise remains a cash cow for the company, generating millions in merchandise sales every year.",
  },
  "cash flow": {
    definition: "The total amount of money being transferred into and out of a business.",
    example: "Small businesses often struggle with cash flow during their first year of operation.",
  },
  "cash desk": {
    definition: "(British English) The place in a shop where you pay for your goods.",
    example: "Please take your items to the cash desk at the front of the store to complete your purchase.",
  },
  "child care": {
    definition: "The care of children, especially by a crèche, nursery, or babysitter while parents are at work.",
    example: "The rising cost of child care has made it difficult for many parents to return to full-time work.",
  },
  "child benefit": {
    definition: "A regular payment made by the government to parents of children.",
    example: "Families can apply for child benefit to help with the costs of raising their children until they finish school.",
  },
  "comfort food": {
    definition: "Food that provides a feeling of well-being, often associated with childhood or home cooking.",
    example: "When it's cold and raining outside, a big bowl of mashed potatoes is my favorite comfort food.",
  },
  "comfort zone": {
    definition: "A settled state or place where a person feels safe and at ease, without being challenged.",
    example: "Public speaking really pushes me out of my comfort zone, but I know it's a skill I need to practice.",
  },
  "comfort level": {
    definition: "The degree of physical or psychological ease a person feels in a particular situation.",
    example: "Before we start the training, I want to gauge everyone's comfort level with the new software.",
  },
  "computer business": {
    definition: "The industry or sector involved in the manufacturing, selling, or repair of computers.",
    example: "His father started a small computer business in the 1980s that eventually grew into a national chain.",
  },
  "computer programmer": {
    definition: "A person who writes, tests, and maintains the code for computer software.",
    example: "She decided to study computer science because she wanted to become a professional computer programmer.",
  },
  "computer virus": {
    definition: "A piece of code which is capable of copying itself and typically has a detrimental effect, such as corrupting the system.",
    example: "Make sure your antivirus software is updated so you don't accidentally download a computer virus.",
  },
  "computer keyboard": {
    definition: "A panel of keys that operate a computer or typewriter.",
    example: "He spilled coffee on his computer keyboard, and now several of the letters don't work properly.",
  },
  "contact details": {
    definition: "Information such as a phone number or email address used to get in touch with someone.",
    example: "Please leave your contact details with the receptionist so we can call you when your order is ready.",
  },
  "contact lens": {
    definition: "A thin plastic or glass lens placed directly on the surface of the eye to correct vision.",
    example: "I prefer wearing a contact lens to glasses when I'm playing sports because they don't fog up.",
  },
  "contact sport": {
    definition: "A sport in which players necessarily come into bodily contact with each other (e.g., rugby, wrestling).",
    example: "Basketball is technically a non-contact sport, though players often bump into each other under the hoop.",
  },
  "contact person": {
    definition: "A specific individual who serves as the primary point of communication for an organization or project.",
    example: "If you have any questions about the conference schedule, Sarah is the main contact person.",
  },
  "core values": {
    definition: "The fundamental beliefs or guiding principles that person or organization lives by.",
    example: "Integrity and innovation are the two core values that define our company's mission.",
  },
  "core competency": {
    definition: "A defining capability or advantage that distinguishes an enterprise from its competitors.",
    example: "The firm's core competency is its ability to design highly efficient microchips at a low cost.",
  },
  "core subject": {
    definition: "A branch of knowledge that is studied in a school or college and is considered essential for all students.",
    example: "Mathematics and English are the two most important core subjects in the primary school curriculum.",
  },
  "day shift": {
    definition: "A period of time worked during the day, typically in a factory, hospital, or office.",
    example: "I prefer working the day shift because it allows me to spend my evenings with my family.",
  },
  "day trip": {
    definition: "A journey or excursion that is completed within a single day.",
    example: "We took a day trip to the coast last Saturday to enjoy the sunny weather.",
  },
  "death tax": {
    definition: "A common (often critical) term for inheritance tax or estate tax paid on the property of someone who has died.",
    example: "The political debate centered on whether the death tax unfairly burdens family-owned farms.",
  },
  "death wish": {
    definition: "A desire, often unconscious, for one's own death or a tendency to take extreme, life-threatening risks.",
    example: "Driving that fast on such narrow, winding roads is practically a death wish.",
  },
  "death penalty": {
    definition: "The punishment of execution, legally administered to someone convicted of a capital crime.",
    example: "Many human rights organizations are campaigning globally to abolish the death penalty.",
  },
  "departure time": {
    definition: "The scheduled time at which a plane, train, or bus is set to leave.",
    example: "Please check the monitor to see if there has been any change to our departure time.",
  },
  "departure lounge": {
    definition: "The area in an airport where passengers wait after check-in before boarding their flight.",
    example: "We spent an hour in the departure lounge browsing the duty-free shops.",
  },
  "departure gate": {
    definition: "The specific gate through which passengers leave the terminal to get onto their aircraft.",
    example: "Passengers for the flight to Rome are requested to proceed to departure gate 12 immediately.",
  },
  "desk job": {
    definition: "A type of employment where the worker remains at a desk, usually in an office setting.",
    example: "After years of working as a landscape gardener, he decided to look for a desk job to avoid the physical strain.",
  },
  "desk officer": {
    definition: "An official, especially in a government or intelligence agency, who handles a specific region or subject from an office.",
    example: "The desk officer for Southeast Asia briefed the ambassador on the latest political developments.",
  },
  "driving licence": {
    definition: "An official document that permits a person to operate a motor vehicle.",
    example: "You must carry your driving licence with you whenever you are behind the wheel.",
  },
  "driving test": {
    definition: "A formal assessment of a person's ability to drive a vehicle safely and according to the law.",
    example: "He was very nervous before his driving test, but he passed on his first attempt.",
  },
  "driving instructor": {
    definition: "A person whose job is to teach others how to drive a motor vehicle.",
    example: "My driving instructor was very patient and helped me master parallel parking.",
  },
  "health club": {
    definition: "An establishment that provides equipment and facilities for exercise and physical fitness.",
    example: "She joined a local health club to have access to a swimming pool and yoga classes.",
  },
  "health care": {
    definition: "The maintenance or improvement of health via the prevention, diagnosis, and treatment of disease or injury.",
    example: "The debate over universal health care is a major political issue in many countries.",
  },
  "health system": {
    definition: "The organization of people, institutions, and resources that deliver health care services to populations.",
    example: "The country's health system struggled to cope with the sudden influx of patients during the pandemic.",
  },
  "health insurance": {
    definition: "A type of coverage that pays for medical and surgical expenses incurred by the insured.",
    example: "Many people receive health insurance through their employer as part of their benefits package.",
  },
  "health office": {
    definition: "A department or room in a school or workplace dedicated to medical needs or administration.",
    example: "The student went to the school health office because he felt dizzy during lunch.",
  },
  "history department": {
    definition: "The administrative division of a school or university responsible for teaching and research in history.",
    example: "The history department is hosting a guest lecture on the French Revolution this Friday.",
  },
  "history teacher": {
    definition: "An educator who specializes in teaching historical events and analysis.",
    example: "My history teacher made the past come alive by telling fascinating stories about ancient civilizations.",
  },
  "history book": {
    definition: "A non-fiction book that records and explains past events.",
    example: "I found an old history book in the attic that belonged to my grandfather.",
  },
  "history lesson": {
    definition: "A specific period of instruction focused on a historical topic.",
    example: "Today's history lesson focused on the impact of the Industrial Revolution on urban life.",
  },
  "history section": {
    definition: "A specific area in a library or bookstore dedicated to historical literature.",
    example: "You can find biographies of famous leaders in the history section at the back of the store.",
  },
  "hit list": {
    definition: "A list of people or things targeted for elimination, criticism, or special attention.",
    example: "The investigative journalist was shocked to find his name on a hit list compiled by a local gang.",
  },
  "hit man": {
    definition: "A person who is paid to murder someone.",
    example: "The thriller movie is about a retired hit man who is forced back into action.",
  },
  "hit song": {
    definition: "A musical track that becomes very popular and sells a large number of copies.",
    example: "That hit song from the summer is still being played on every radio station.",
  },
  "hit rate": {
    definition: "The frequency of successful attempts or the number of visitors to a website.",
    example: "The marketing team was pleased with the high hit rate on their latest online advertisement.",
  },
  "identity crisis": {
    definition: "A period of uncertainty and confusion in which a person's sense of self becomes insecure.",
    example: "Many teenagers go through a minor identity crisis as they try to figure out who they want to be.",
  },
  "identity card": {
    definition: "An official document that proves who a person is, often containing a photo and birth date.",
    example: "You will need to show your identity card at the security desk before you can enter the building.",
  },
  "identity theft": {
    definition: "The fraudulent practice of using another person's name and personal information to obtain credit or loans.",
    example: "Using a strong password and two-factor authentication can help protect you against identity theft.",
  },
  "identity fraud": {
    definition: "A crime where someone uses another person's personal data to deceive others, typically for financial gain.",
    example: "The bank has a dedicated department to investigate cases of identity fraud and protect its customers.",
  },
  "insurance broker": {
    definition: "A person or company that searches for the best insurance policy for their clients.",
    example: "We consulted an insurance broker to help us find the most affordable coverage for our new office.",
  },
  "insurance policy": {
    definition: "A contract between an individual and an insurance company that outlines the details of the coverage.",
    example: "It is important to read the fine print of your insurance policy to understand what is not covered.",
  },
  "insurance claim": {
    definition: "A formal request to an insurance company asking for payment based on the terms of the policy.",
    example: "After the storm damaged the roof, the homeowners filed an insurance claim to cover the repair costs.",
  },
  "insurance premium": {
    definition: "The amount of money that an individual or business must pay for an insurance policy.",
    example: "If you have a history of safe driving, your monthly insurance premium is likely to be lower.",
  },
  "interest group": {
    definition: "A group of people that seeks to influence public policy on the basis of a particular common interest.",
    example: "The environmental interest group lobbied the government to pass stricter laws on carbon emissions.",
  },
  "interest rate": {
    definition: "The proportion of a loan that is charged as interest to the borrower, typically expressed as an annual percentage.",
    example: "When the central bank raises the interest rate, it becomes more expensive for people to take out mortgages.",
  },
  "interest payment": {
    definition: "The specific amount of money paid regularly to a lender for the use of borrowed money.",
    example: "The company struggled to make its monthly interest payment after sales dropped unexpectedly.",
  },
  "interest charges": {
    definition: "The total cost of borrowing money, including interest and any associated fees.",
    example: "If you don't pay your credit card balance in full, you will be subject to high interest charges.",
  },
  "jail cell": {
    definition: "A small room in a prison where a prisoner is locked up.",
    example: "The movie depicts the harsh reality of spending twenty hours a day inside a cramped jail cell.",
  },
  "jail sentence": {
    definition: "The period of time that a person is legally required to spend in prison as punishment for a crime.",
    example: "The judge handed down a five-year jail sentence for the defendant's role in the robbery.",
  },
  "jury system": {
    definition: "The legal framework in which a group of citizens is chosen to hear evidence and make a decision in a court of law.",
    example: "Many legal experts argue that the jury system is a vital safeguard against government overreach.",
  },
  "jury duty": {
    definition: "The legal obligation of a citizen to serve as a juror in a court case.",
    example: "She had to take a week off work because she was called for jury duty at the local courthouse.",
  },
  "jury service": {
    definition: "The actual period of time or act of serving as a member of a jury.",
    example: "He found his recent jury service to be a fascinating, albeit exhausting, look into the criminal justice system.",
  },
  "jury trial": {
    definition: "A legal proceeding in which a jury makes a decision or findings of fact.",
    example: "The defendant exercised his right to a jury trial rather than having his case decided by a judge alone.",
  },
  "jury box": {
    definition: "The designated area in a courtroom where the members of the jury sit during a trial.",
    example: "The lawyer walked slowly toward the jury box to make his final, impassioned closing argument.",
  },
  "kitchen cabinet": {
    definition: "A built-in furniture item installed in a kitchen for storing food, cooking equipment, and silverware.",
    example: "We decided to paint our old kitchen cabinet doors white to give the room a brighter, more modern feel.",
  },
  "kitchen table": {
    definition: "A table specifically designed for use in a kitchen, often used for casual family meals.",
    example: "Most of our important family decisions are made while sitting around the kitchen table on Sunday mornings.",
  },
  "kitchen sink": {
    definition: "A fixed basin in a kitchen with a water supply and drain, used for washing dishes and food.",
    example: "After the dinner party, the kitchen sink was piled high with dirty plates and glasses.",
  },
  "kitchen appliances": {
    definition: "Electrical machines used in the kitchen for tasks like cooking or cleaning, such as toasters, blenders, or refrigerators.",
    example: "When we moved into the new house, we had to buy all new kitchen appliances, including a dishwasher and a microwave.",
  },
  "knowledge base": {
    definition: "A centralized repository for information, such as an online library or a database used for sharing expertise.",
    example: "The company's internal knowledge base contains thousands of articles to help employees solve technical issues.",
  },
  "knowledge gap": {
    definition: "The difference between what someone knows and what they need to know to perform a task or understand a concept.",
    example: "The training program was specifically designed to bridge the knowledge gap between junior and senior engineers.",
  },
  "knowledge economy": {
    definition: "An economic system in which the production and use of knowledge are the primary engines of growth.",
    example: "Governments are investing heavily in higher education to remain competitive in the global knowledge economy.",
  },
  "knowledge sharing": {
    definition: "The process of exchanging information, skills, or expertise between people or organizations.",
    example: "The conference was a great opportunity for knowledge sharing among researchers from around the world.",
  },
  "labour camp": {
    definition: "A place where prisoners are forced to perform hard physical labor.",
    example: "Historical accounts describe the brutal conditions faced by those sent to a labour camp during the mid-20th century.",
  },
  "labour force": {
    definition: "The total number of people in a country or region who are employed or actively seeking work.",
    example: "As the population ages, the government is looking for ways to encourage more people to stay in the labour force.",
  },
  "labour market": {
    definition: "The supply of people available to work in relation to the demand for them from employers.",
    example: "Graduates are finding it difficult to enter the labour market due to the current economic slowdown.",
  },
  "labour union": {
    definition: "An organized association of workers formed to protect and further their rights and interests.",
    example: "The labour union successfully negotiated a five percent pay increase for all factory employees.",
  },
  "law officer": {
    definition: "A person, such as a policeman or sheriff, who is responsible for enforcing the law.",
    example: "The law officer requested to see the driver's identification before issuing a warning for the broken taillight.",
  },
  "law firm": {
    definition: "A business entity formed by one or more lawyers to engage in the practice of law.",
    example: "She recently accepted a position as a junior associate at a prestigious law firm specializing in intellectual property.",
  },
  "law case": {
    definition: "A specific legal dispute or matter that is being decided in a court of law.",
    example: "The supreme court's ruling on this law case will likely set a major precedent for future privacy rights.",
  },
  "law enforcement": {
    definition: "The department of people who enforce laws, investigate crimes, and make arrests (e.g., the police).",
    example: "There was a heavy law enforcement presence at the stadium to ensure the safety of the spectators during the match.",
  },
  "lead singer": {
    definition: "The member of a band or musical group who sings the primary vocals.",
    example: "The lead singer's powerful voice and charismatic stage presence are the main reasons for the band's success.",
  },
  "lead time": {
    definition: "The amount of time that elapses between the start and completion of a process (e.g., between ordering and receiving an item).",
    example: "Because the components are custom-made, the lead time for delivery is approximately six weeks.",
  },
  "lead role": {
    definition: "The most important character or part in a play, movie, or television show.",
    example: "After years of playing minor characters, she was finally cast in the lead role of a major Hollywood production.",
  },
  "lead guitar": {
    definition: "The guitar part that plays melodies and solos, rather than just chords and rhythm.",
    example: "He has been practicing for hours every day to perfect the difficult lead guitar solo at the end of the song.",
  },
  "lead position": {
    definition: "The first or most prominent place in a race, competition, or organization.",
    example: "The runner moved into the lead position during the final lap and managed to hold it until the finish line.",
  },
  "market economy": {
    definition: "An economic system in which production and prices are determined by unrestricted competition between privately owned businesses.",
    example: "In a market economy, the laws of supply and demand generally dictate the cost of goods and services.",
  },
  "market gardening": {
    definition: "The commercial production of vegetables, fruits, and flowers on a small scale for sale in local markets.",
    example: "The region is famous for its market gardening, with dozens of local farms selling fresh produce every Saturday.",
  },
  "market research": {
    definition: "The action or activity of gathering information about consumers' needs and preferences.",
    example: "The company conducted extensive market research before launching the new drink to see if people liked the flavor.",
  },
  "market share": {
    definition: "The portion of a market controlled by a particular company or product.",
    example: "By offering a more affordable subscription plan, the streaming service was able to increase its market share significantly.",
  },
  "money order": {
    definition: "A printed order for the payment of a specified sum, issued by a bank or post office.",
    example: "If you don't have a checking account, you can pay your rent using a money order from the local post office.",
  },
  "money laundering": {
    definition: "The concealment of the origins of illegally obtained money, typically by means of transfers involving foreign banks or legitimate businesses.",
    example: "The authorities arrested several individuals suspected of money laundering through a network of shell companies.",
  },
  "money management": {
    definition: "The process of budgeting, saving, investing, spending, or otherwise overseeing the capital usage of an individual or group.",
    example: "Learning effective money management at a young age can help prevent debt and financial stress in the future.",
  },
  "music department": {
    definition: "The section of a school, university, or store dedicated to the study or sale of music.",
    example: "The university's music department is famous for its world-class jazz program and state-of-the-art recording studios.",
  },
  "music school": {
    definition: "An educational institution specialized in the study, training, and research of music.",
    example: "After showing great talent on the violin, she was accepted into a prestigious music school in Vienna.",
  },
  "music industry": {
    definition: "The companies and individuals that make money by creating and selling music.",
    example: "Digital streaming services have completely transformed the way the music industry generates revenue.",
  },
  "music teacher": {
    definition: "A person who instructs others in playing instruments, singing, or music theory.",
    example: "My music teacher taught me not only how to read notes but also how to appreciate the history of classical music.",
  },
  "news organization": {
    definition: "A company or group (like a newspaper or TV network) that gathers and reports news.",
    example: "Reliable news organizations fact-check their stories thoroughly before publishing them online.",
  },
  "news show": {
    definition: "A television or radio program that broadcasts current events.",
    example: "I usually watch the evening news show to stay informed about what is happening around the world.",
  },
  "news agency": {
    definition: "An organization that gathers news reports and sells them to various subscribing newspapers and broadcasters.",
    example: "Major global events are often first reported by a national news agency before being picked up by international media.",
  },
  "news report": {
    definition: "A spoken or written account of something that has happened, intended for the public.",
    example: "The local news report warned residents about the upcoming storm and suggested they stay indoors.",
  },
  "office block": {
    definition: "A large building that contains many different offices.",
    example: "The new office block in the city center is made almost entirely of glass and steel.",
  },
  "office hours": {
    definition: "The specific hours during the day when business is conducted or a person is available for work.",
    example: "If you have any questions about the syllabus, you can visit me during my office hours on Tuesday mornings.",
  },
  "office job": {
    definition: "A type of work that is done while sitting at a desk in an office.",
    example: "He found that he preferred an office job over manual labor because he enjoyed working in a quiet, climate-controlled environment.",
  },
  "office space": {
    definition: "A room or set of rooms used as a place of business for non-manual work.",
    example: "Many startups are choosing to rent shared office space to save money on overhead costs.",
  },
  "opinion poll": {
    definition: "An assessment of public opinion by questioning a representative sample of people.",
    example: "The latest opinion poll suggests that the majority of citizens are in favor of the new environmental law.",
  },
  "opinion piece": {
    definition: "An article in a newspaper or magazine that mainly reflects the author's personal views on a subject.",
    example: "The editor wrote a strong opinion piece arguing for more funding for public transportation.",
  },
  "opinion leader": {
    definition: "A person whose ideas and interpretations are followed by others in a particular community or social group.",
    example: "Social media influencers have become significant opinion leaders for the younger generation when it comes to fashion and lifestyle.",
  },
  "achieve a result": {
    definition: "To reach a particular outcome, especially through effort or skill.",
    example: "Success in achieving a positive result depends on consistent daily effort.",
  },
  "achieve an objective": {
    definition: "To succeed in reaching a specific goal or aim.",
    example: "The manager outlined the steps necessary to achieve the quarterly objective.",
  },
  "achieve a target": {
    definition: "To reach a particular level or amount that has been set as a goal.",
    example: "The sales team worked overtime to ensure they could achieve their annual target.",
  },
  "acknowledge defeat": {
    definition: "To admit that you have been unsuccessful or have lost a contest.",
    example: "The candidate was forced to acknowledge defeat after the final votes were counted.",
  },
  "acknowledge victory": {
    definition: "To recognize formally that someone has won.",
    example: "The defeated player smiled and acknowledged victory in her opponent's post-match speech.",
  },
  "acknowledge receipt": {
    definition: "To confirm formally that you have received something such as a letter, payment, or document.",
    example: "We would like to acknowledge receipt of your formal application and documents.",
  },
  "address a problem": {
    definition: "To think about and begin to deal with a difficult situation.",
    example: "The government is introducing new measures to address the problem of unemployment.",
  },
  "address an issue": {
    definition: "To direct your attention or efforts towards a specific topic of concern.",
    example: "The meeting was called specifically to address the issue of workplace safety.",
  },
  "address concerns": {
    definition: "To deal with or respond to the things that people are worried about.",
    example: "The CEO met with staff to address concerns regarding the upcoming restructuring.",
  },
  "address needs": {
    definition: "To provide what is necessary for a particular person, group, or situation.",
    example: "This new policy aims to address the needs of low-income families in the area.",
  },
  "arouse interest": {
    definition: "To cause someone to feel curious or want to know more about something.",
    example: "The mysterious trailer was designed to arouse interest in the upcoming film.",
  },
  "arouse hostility": {
    definition: "To cause people to feel or show strong opposition or unfriendliness.",
    example: "His aggressive tone during the debate managed to arouse hostility among the audience.",
  },
  "arouse passion": {
    definition: "To cause someone to have very strong feelings or enthusiasm.",
    example: "The speaker's words were intended to arouse passion for environmental conservation.",
  },
  "arouse suspicion": {
    definition: "To make someone think that something wrong or illegal is happening.",
    example: "Leaving the house in the middle of the night is sure to arouse suspicion.",
  },
  "bear a grudge": {
    definition: "To continue feeling resentful or angry toward someone for a long period.",
    example: "He still bears a grudge against his former business partner over their disagreement.",
  },
  "bear the cost": {
    definition: "To be responsible for paying for something.",
    example: "The shipping company agreed to bear the cost of the damaged goods.",
  },
  "bear responsibility": {
    definition: "To accept that you are the one who should be blamed or praised for something.",
    example: "As the project lead, you must bear responsibility for the final outcome.",
  },
  "bear weight": {
    definition: "To support a heavy load or provide evidence for an argument.",
    example: "The old bridge is no longer strong enough to bear the weight of heavy trucks.",
  },
  "bear fruit": {
    definition: "To produce successful results after a period of effort.",
    example: "Our long-term investment strategy is finally starting to bear fruit.",
  },
  "break a habit": {
    definition: "To stop doing something that you do regularly.",
    example: "It takes an average of sixty-six days to permanently break a habit.",
  },
  "break a record": {
    definition: "To do something faster, better, or more often than anyone has done before.",
    example: "The young swimmer managed to break the national record for the 100m freestyle.",
  },
  "break the silence": {
    definition: "To speak or make a noise after a period of quiet.",
    example: "She finally broke the silence by asking if anyone wanted coffee.",
  },
  "break a rule": {
    definition: "To do something that is not allowed by a specific regulation.",
    example: "If you break a rule in this school, you will be given a detention.",
  },
  "break the law": {
    definition: "To do something illegal.",
    example: "He claimed he didn't realize he was breaking the law by downloading the files.",
  },
  "build a company": {
    definition: "To create and develop a business over time.",
    example: "She worked for years to build a company that reflected her values.",
  },
  "build a friendship": {
    definition: "To develop a close and positive relationship with someone.",
    example: "Shared experiences can help people build a friendship quite quickly.",
  },
  "build a future": {
    definition: "To create the conditions for a successful life later on.",
    example: "Many students move abroad to build a future with more opportunities.",
  },
  "chair a committee": {
    definition: "To lead a formal group of people appointed for a specific purpose.",
    example: "She was asked to chair a committee on school safety.",
  },
  "chair a meeting": {
    definition: "To lead or preside over a formal meeting.",
    example: "The deputy director chaired the meeting while the manager was away.",
  },
  "chair a task force": {
    definition: "To lead a temporary group created to deal with a particular issue.",
    example: "He was appointed to chair a task force on public transport reform.",
  },
  "close a deal": {
    definition: "To complete a business agreement successfully.",
    example: "The sales team stayed late to close a deal with the new client.",
  },
  "close the discussion": {
    definition: "To bring a conversation or debate to an end.",
    example: "The chair decided to close the discussion and move to the vote.",
  },
  "close a sale": {
    definition: "To complete a transaction successfully.",
    example: "A good salesperson knows when to stop talking and close a sale.",
  },
  "conduct an experiment": {
    definition: "To perform a scientific test.",
    example: "The scientists conducted an experiment to test the effects of gravity on plant growth.",
  },
  "conduct research": {
    definition: "To carry out a systematic study to find out new information.",
    example: "The university is conducting research into new forms of renewable energy.",
  },
  "conduct a meeting": {
    definition: "To lead or manage a formal gathering.",
    example: "The chairman conducted the meeting with great efficiency.",
  },
  "conduct an orchestra": {
    definition: "To direct the performance of a group of musicians.",
    example: "It was his lifelong dream to conduct a world-class orchestra.",
  },
  "crave attention": {
    definition: "To have a very strong desire to be noticed by others.",
    example: "The toddler began to misbehave simply because he craved attention.",
  },
  "crave respect": {
    definition: "To deeply want to be admired or treated as important.",
    example: "After years of being ignored, she still craved respect from her colleagues.",
  },
  "crave fame": {
    definition: "To have an intense desire to be famous.",
    example: "Many young people crave fame through social media platforms.",
  },
  "crave love": {
    definition: "To feel a powerful need for affection and emotional connection.",
    example: "The abandoned puppy seemed to crave love from everyone it met.",
  },
  "crave excitement": {
    definition: "To want a feeling of high energy or thrill.",
    example: "Living in a small village made him crave the excitement of the big city.",
  },
  "curb growth": {
    definition: "To slow down or limit an increase in size, number, or activity.",
    example: "The new policy was introduced to curb growth in public spending.",
  },
  "curb inflation": {
    definition: "To reduce or control the rate at which prices rise.",
    example: "The central bank raised interest rates to curb inflation.",
  },
  "curb interest rates": {
    definition: "To limit or control how quickly interest rates rise.",
    example: "The finance minister announced new measures to curb interest rates.",
  },
  "curb violence": {
    definition: "To reduce or control violent behavior.",
    example: "Community leaders are working together to curb violence in the area.",
  },
  "deliver a presentation": {
    definition: "To give a formal talk to an audience.",
    example: "She had to deliver a presentation to the board on Monday morning.",
  },
  "deliver a speech": {
    definition: "To give a formal spoken address.",
    example: "The mayor delivered a speech at the opening ceremony.",
  },
  "deliver a letter": {
    definition: "To take a letter to the person or place it is meant for.",
    example: "The courier was asked to deliver a letter by hand.",
  },
  "deliver a parcel": {
    definition: "To bring a package to its destination.",
    example: "The driver managed to deliver the parcel before lunchtime.",
  },
  "divulge information": {
    definition: "To make secret or private facts known to others.",
    example: "The journalist refused to divulge the information provided by her source.",
  },
  "divulge a secret": {
    definition: "To tell someone something that was supposed to be kept private.",
    example: "I promise not to divulge your secret to anyone else.",
  },
  "divulge details": {
    definition: "To provide specific pieces of information about a situation.",
    example: "The police have yet to divulge details regarding the ongoing investigation.",
  },
  "divulge identity": {
    definition: "To reveal who someone is, especially when they want to remain anonymous.",
    example: "The whistleblower's lawyer fought to ensure the company could not divulge his identity.",
  },
  "draw attention": {
    definition: "To make people notice something or someone.",
    example: "The bright neon sign was designed to draw attention to the new store.",
  },
  "draw a crowd": {
    definition: "To attract a large number of people to a place or event.",
    example: "The street performer's incredible skills managed to draw a crowd within minutes.",
  },
  "draw an audience": {
    definition: "To attract people to watch a performance or listen to a speaker.",
    example: "The controversial documentary is expected to draw an audience tonight.",
  },
  "draw a conclusion": {
    definition: "To decide that something is true after considering the facts.",
    example: "What conclusion can we draw from these experimental results?",
  },
  "formulate an idea": {
    definition: "To develop a thought or concept in a clear and organized way.",
    example: "She needed some time alone to formulate an idea for her next novel.",
  },
  "formulate a question": {
    definition: "To put a question into specific words.",
    example: "He struggled to formulate a question that would not sound rude.",
  },
  "formulate an answer": {
    definition: "To create a response or solution to a problem.",
    example: "The spokesperson took a moment to formulate an answer to the reporter's query.",
  },
  "formulate a plan": {
    definition: "To prepare a detailed method for achieving something.",
    example: "We need to formulate a plan to increase our sales over the next six months.",
  },
  "generate interest": {
    definition: "To cause people to feel curious or want to be involved.",
    example: "The marketing campaign failed to generate much interest in the new product.",
  },
  "generate ideas": {
    definition: "To produce new thoughts or suggestions.",
    example: "The brainstorming session was intended to generate ideas for the office Christmas party.",
  },
  "generate electricity": {
    definition: "To produce electrical power.",
    example: "The wind farm is capable of generating enough electricity for the entire town.",
  },
  "generate profit": {
    definition: "To produce a financial gain.",
    example: "It took three years for the startup to finally begin generating a profit.",
  },
  "generate revenue": {
    definition: "To produce income, especially for a company or government.",
    example: "The new tax is expected to generate significant revenue for the city council.",
  },
  "grant access": {
    definition: "To give someone permission to enter a place or use a particular resource, such as a building or a database.",
    example: "The administrator will grant access to the secure server once your identity is verified.",
  },
  "grant custody": {
    definition: "To give someone the legal right to look after a child.",
    example: "Following the divorce, the court decided to grant custody of the children to their mother.",
  },
  "grant permission": {
    definition: "To formally allow someone to do something.",
    example: "The city council refused to grant permission for the new shopping mall to be built.",
  },
  "grant a request": {
    definition: "To agree to do something that someone has formally asked for.",
    example: "The manager was happy to grant a request for two weeks of unpaid leave.",
  },
  "grant asylum": {
    definition: "To give protection to someone who has left their own country for political reasons.",
    example: "The government has agreed to grant asylum to the refugees fleeing the conflict.",
  },
  "hold a meeting": {
    definition: "To organize and lead a formal gathering of people.",
    example: "The department manager decided to hold a meeting every Monday morning to track progress.",
  },
  "hold an opinion": {
    definition: "To have a particular belief or feeling about something.",
    example: "While many hold a different opinion, I believe this is the best course of action.",
  },
  "hold a record": {
    definition: "To be the person or group that has achieved the best result in a particular activity.",
    example: "She has continued to hold the world record for the marathon for over five years.",
  },
  "hold a reception": {
    definition: "To organize a formal party to welcome someone or celebrate an event.",
    example: "The embassy will hold a reception for the visiting dignitaries tomorrow evening.",
  },
  "incur a debt": {
    definition: "To do something that results in you owing money to a person or bank.",
    example: "You should avoid using credit cards for daily expenses so you do not incur a large debt.",
  },
  "incur a fee": {
    definition: "To become liable for a specific charge due to an action or delay.",
    example: "Please be aware that late returns of library books will incur a small daily fee.",
  },
  "incur a charge": {
    definition: "To cause a cost to be added to your bill.",
    example: "Using the hotel's mini-bar will incur an additional charge on your final bill.",
  },
  "incur damage": {
    definition: "To experience physical harm, especially to property or a vehicle.",
    example: "The car incurred significant damage during the storm when a tree branch fell on it.",
  },
  "incur the anger": {
    definition: "To make someone angry by what you do.",
    example: "His decision to cancel the project at the last minute was bound to incur the anger of the staff.",
  },
  "invest money": {
    definition: "To put capital into a business or property to make a profit.",
    example: "She decided to invest money in a diverse range of stocks to minimize risk.",
  },
  "invest time": {
    definition: "To spend a lot of hours on a task because you think it is important.",
    example: "You need to invest time in learning the basics before you can master the advanced techniques.",
  },
  "invest energy": {
    definition: "To put a lot of personal effort and enthusiasm into a project.",
    example: "The team invested all their energy into making the product launch a success.",
  },
  "keep a promise": {
    definition: "To do exactly what you said you would do.",
    example: "If you want people to trust you, it is essential that you always keep a promise.",
  },
  "keep a secret": {
    definition: "To not tell anyone else a piece of private information.",
    example: "I know I can trust her to keep a secret, no matter how exciting the news is.",
  },
  "keep your word": {
    definition: "To be reliable and follow through on your commitments.",
    example: "He gave me his word that the repairs would be finished by Friday, and he kept his word.",
  },
  "lose confidence": {
    definition: "To stop believing in your own abilities or in the success of something.",
    example: "After failing the first two tests, the student began to lose confidence in his study habits.",
  },
  "lose control": {
    definition: "To no longer be able to manage a situation or your own emotions.",
    example: "The driver lost control of the vehicle on the icy road and slid into a ditch.",
  },
  "lose patience": {
    definition: "To become annoyed or angry because something is taking too long.",
    example: "I am starting to lose patience with this slow internet connection.",
  },
  "lose money": {
    definition: "To experience a financial loss in a business or investment.",
    example: "The company reported that they continue to lose money on their international shipping route.",
  },
  "lose weight": {
    definition: "To become thinner through diet or exercise.",
    example: "He managed to lose weight by cutting out sugar and walking for thirty minutes every day.",
  },
  "make headway": {
    definition: "To make progress, especially when it is slow or difficult.",
    example: "After hours of troubleshooting, the technicians are finally starting to make headway.",
  },
  "make money": {
    definition: "To earn a profit or receive a salary.",
    example: "The goal of any new business is to start making money as quickly as possible.",
  },
  "make progress": {
    definition: "To improve or move closer to completing a task.",
    example: "The students are making steady progress in their understanding of complex grammar.",
  },
  "make a difference": {
    definition: "To have a positive effect on a person or situation.",
    example: "Even small donations can make a huge difference to the local charity.",
  },
  "make a living": {
    definition: "To earn enough money to pay for your basic needs.",
    example: "It is difficult to make a living as a freelance artist in such an expensive city.",
  },
  "meet a challenge": {
    definition: "To deal with a difficult situation successfully.",
    example: "The team is prepared to meet the challenge of completing the project ahead of schedule.",
  },
  "meet a deadline": {
    definition: "To finish a task by the time it is required.",
    example: "We had to work through the weekend to ensure we could meet the deadline.",
  },
  "meet expectations": {
    definition: "To be as good as someone hoped or expected.",
    example: "The final product was excellent, but it failed to meet the client's high expectations.",
  },
  "meet requirements": {
    definition: "To fulfill all the necessary conditions or rules.",
    example: "To be eligible for the grant, your application must meet all the legal requirements.",
  },
  "orchestrate a campaign": {
    definition: "To carefully plan and coordinate a series of activities.",
    example: "The marketing firm was hired to orchestrate a campaign for the upcoming election.",
  },
  "orchestrate an attack": {
    definition: "To plan and organize a military or violent strike.",
    example: "The documentary explains how they managed to orchestrate an attack on the fortress.",
  },
  "orchestrate a hold-up": {
    definition: "To plan a robbery, usually involving weapons.",
    example: "The group spent weeks planning how to orchestrate a hold-up at the city bank.",
  },
  "orchestrate an event": {
    definition: "To organize all the complex details of a large gathering.",
    example: "It takes a huge team of volunteers to orchestrate an event of this scale.",
  },
  "pay attention": {
    definition: "To listen, watch, or consider something very carefully.",
    example: "You need to pay attention to the safety warnings before you enter the factory.",
  },
  "pay a compliment": {
    definition: "To say something nice to someone to praise them.",
    example: "He paid her a lovely compliment on her presentation during the meeting.",
  },
  "pay a visit": {
    definition: "To go and see someone or a place.",
    example: "We decided to pay a visit to the new museum that opened downtown last week.",
  },
  "raise a child": {
    definition: "To care for a child and help them grow into an adult.",
    example: "It takes a lot of patience and dedication to raise a child in a busy city.",
  },
  "raise animals": {
    definition: "To keep and care for animals, usually on a farm, for food or profit.",
    example: "My grandparents moved to the countryside to raise animals and grow their own vegetables.",
  },
  "raise expectations": {
    definition: "To make someone hope for or expect more than before.",
    example: "The initial success of the product managed to raise expectations for the second version.",
  },
  "raise an issue": {
    definition: "To mention a problem or subject so that people can discuss it.",
    example: "I would like to raise an issue regarding the lack of parking spaces at the office.",
  },
  "reach a conclusion": {
    definition: "To make a decision after considering all the available facts.",
    example: "After hours of deliberation, the committee was finally able to reach a conclusion.",
  },
  "reach a destination": {
    definition: "To arrive at the place where you were traveling to.",
    example: "We were exhausted by the time we reached our destination after the ten-hour flight.",
  },
  "reach a goal": {
    definition: "To succeed in achieving something that you have been working toward.",
    example: "With enough hard work and focus, you will eventually reach your goal of becoming a pilot.",
  },
  "reach a verdict": {
    definition: "To arrive at the formal decision in a court case.",
    example: "The jury took three days to reach a verdict in the high-profile case.",
  },
  "save time": {
    definition: "To do something more quickly so that you have more time available.",
    example: "Taking the express train will save time on your morning commute.",
  },
  "save money": {
    definition: "To avoid spending money or to keep money for future use.",
    example: "You can save money by cooking at home instead of eating out every night.",
  },
  "save space": {
    definition: "To use an area efficiently so that it does not become crowded.",
    example: "The new foldable furniture is designed specifically to save space in small apartments.",
  },
  "save a life": {
    definition: "To stop someone from dying.",
    example: "The quick actions of the lifeguard managed to save a life at the beach today.",
  },
  "save the situation": {
    definition: "To do something that prevents a difficult situation from becoming a disaster.",
    example: "His clever thinking managed to save the situation when the presentation file would not open.",
  },
  "stand trial": {
    definition: "To be judged in a court of law for a crime.",
    example: "The suspect is expected to stand trial for the robbery early next year.",
  },
  "stand a chance": {
    definition: "To have a possibility of being successful or achieving something.",
    example: "Without proper training, the team does not stand a chance against the national champions.",
  },
  "stand comparison": {
    definition: "To be as good as someone or something else when compared.",
    example: "The new model is good, but it does not stand comparison with the original version.",
  },
  "stand your ground": {
    definition: "To refuse to change your opinion or move from your position when someone is attacking you.",
    example: "Even though everyone disagreed with him, he decided to stand his ground and defend his plan.",
  },
  "stand to attention": {
    definition: "To stand very straight with your feet together and arms at your sides, especially in the military.",
    example: "The soldiers were ordered to stand to attention as the general walked past.",
  },
  "tackle a problem": {
    definition: "To make a determined effort to deal with a difficult situation.",
    example: "The government needs to tackle the problem of rising energy costs immediately.",
  },
  "tackle an issue": {
    definition: "To begin dealing with a specific topic of concern.",
    example: "The new legislation is intended to tackle the issue of plastic pollution in the oceans.",
  },
  "tackle a task": {
    definition: "To start doing a piece of work, especially one that is large or difficult.",
    example: "I usually tackle the most difficult task in the morning when I have the most energy.",
  },
  "tackle a crisis": {
    definition: "To take action to resolve an extremely dangerous or difficult situation.",
    example: "The emergency team was called in to tackle the crisis at the chemical plant.",
  },
  "take control": {
    definition: "To take over the management or direction of something.",
    example: "The new manager decided to take control of the department's budget personally.",
  },
  "take a seat": {
    definition: "A polite way to ask someone to sit down.",
    example: "Please take a seat in the waiting area, and the doctor will be with you shortly.",
  },
  "take a stand": {
    definition: "To publicly express a strong opinion for or against something.",
    example: "The organization decided to take a stand against the proposed new highway.",
  },
  "take steps": {
    definition: "To take a series of actions to achieve a particular goal.",
    example: "The company is taking steps to reduce its carbon footprint over the next five years.",
  },
  "take a risk": {
    definition: "To do something although you know that something unpleasant or dangerous could happen.",
    example: "You have to be willing to take a risk if you want to start your own business.",
  },
  "take a test": {
    definition: "To complete an exam or assessment.",
    example: "I have to take a test tomorrow to see if I am ready for the advanced course.",
  },
  "throw doubt": {
    definition: "To make something seem less certain or less likely to be true.",
    example: "The new evidence managed to throw doubt on the witness's original story.",
  },
  "throw light": {
    definition: "To provide new information that makes a situation easier to understand.",
    example: "The discovery of the old diary managed to throw light on the family's mysterious past.",
  },
  "throw a party": {
    definition: "To organize and hold a social gathering.",
    example: "We decided to throw a party to celebrate our ten-year wedding anniversary.",
  },
  "throw a tantrum": {
    definition: "To have a sudden period of uncontrolled anger, typically by a child.",
    example: "The toddler threw a tantrum in the middle of the store because he could not have the toy.",
  },
  "ask a question": {
    definition: "To say something to someone because you want to know something.",
    example: "If you do not understand the instructions, please feel free to ask a question.",
  },
  "ask a favour": {
    definition: "To request that someone does something kind or helpful for you.",
    example: "I am sorry to bother you, but I was wondering if I could ask a favour.",
  },
  "ask permission": {
    definition: "To request to be allowed to do something.",
    example: "You must ask permission from your manager before you take a day off.",
  },
  "ask for advice": {
    definition: "To request someone's opinion about what you should do in a situation.",
    example: "I usually ask my older brother for advice when I have a problem at work.",
  },
  "ask for help": {
    definition: "To request assistance with a task or problem.",
    example: "Do not be afraid to ask for help if the project becomes too difficult.",
  },
  "do homework": {
    definition: "To complete school assignments at home.",
    example: "The children are in their room doing their homework before dinner.",
  },
  "do housework": {
    definition: "To perform regular tasks such as cleaning and washing inside a home.",
    example: "We usually spend Saturday mornings doing the housework together.",
  },
  "do business": {
    definition: "To engage in commercial activity or trade with a person or company.",
    example: "Our firm has been doing business with that Japanese manufacturer for ten years.",
  },
  "do yoga": {
    definition: "To perform the physical and mental exercises of yoga.",
    example: "I try to do yoga for twenty minutes every morning to stay flexible.",
  },
  "do the dishes": {
    definition: "To wash the plates, cups, and cutlery after a meal.",
    example: "If you cook the meal, I will be happy to do the dishes afterwards.",
  },
  "have a chat": {
    definition: "To have a short, informal conversation with someone.",
    example: "Do you have five minutes to have a chat about the weekend plans?",
  },
  "have a rest": {
    definition: "To stop working or being active in order to relax or sleep.",
    example: "You look exhausted; why do you not go and have a rest for an hour?",
  },
  "have a bath": {
    definition: "To wash your body while sitting in a bathtub full of water.",
    example: "After a long hike, there is nothing better than having a hot bath.",
  },
  "have a look": {
    definition: "To examine or check something.",
    example: "The mechanic said he would have a look at the engine to find the problem.",
  },
  "have a party": {
    definition: "To organize and hold a social celebration.",
    example: "We are planning to have a party to celebrate his graduation from university.",
  },
  "tell the truth": {
    definition: "To say what really happened or what is actually real.",
    example: "It is always better to tell the truth, even if it is difficult.",
  },
  "tell a lie": {
    definition: "To say something that you know is not true.",
    example: "I knew he was telling a lie because he could not look me in the eye.",
  },
  "tell a story": {
    definition: "To give an account of events, whether real or imaginary.",
    example: "The grandfather sat by the fire to tell a story about his time at sea.",
  },
  "tell a joke": {
    definition: "To say something funny to make people laugh.",
    example: "He is great at telling a joke and always keeps everyone entertained.",
  },
  "tell the time": {
    definition: "To be able to read a clock and know what time it is.",
    example: "Most children learn how to tell the time by the age of six or seven.",
  },
  "give advice": {
    definition: "To tell someone what you think they should do.",
    example: "Teachers often give advice to students about how to prepare for exams.",
  },
  "give permission": {
    definition: "To allow someone to do something.",
    example: "Her parents would not give permission for the trip until they saw the full plan.",
  },
  "give a speech": {
    definition: "To speak formally to an audience.",
    example: "The director was invited to give a speech at the graduation ceremony.",
  },
  "give a presentation": {
    definition: "To talk formally to a group while explaining information.",
    example: "Each team had to give a presentation on their proposed marketing strategy.",
  },
  "give an example": {
    definition: "To mention something that shows what you mean.",
    example: "Could you give an example of how this grammar structure is used in real life?",
  },
  "gain experience": {
    definition: "To get practical knowledge or skill through doing something.",
    example: "Volunteering abroad can help you gain experience before applying for your first job.",
  },
  "gain confidence": {
    definition: "To become more sure of your own ability.",
    example: "She began to gain confidence after speaking English every day at work.",
  },
  "gain weight": {
    definition: "To become heavier.",
    example: "Some people gain weight quickly if they stop exercising and change their diet.",
  },
  "gain access": {
    definition: "To succeed in entering a place or using a system.",
    example: "Hackers tried to gain access to the company's internal network.",
  },
  "gain control": {
    definition: "To take charge of a situation or system.",
    example: "Firefighters worked quickly to gain control of the blaze before it spread.",
  },
  "offer advice": {
    definition: "To tell someone what you think they should do in a situation.",
    example: "The lawyer was careful not to offer advice until she had seen all the documents.",
  },
  "offer help": {
    definition: "To say that you are willing to assist someone.",
    example: "Several neighbors offered help after the family lost power in the storm.",
  },
  "offer support": {
    definition: "To provide encouragement or practical assistance.",
    example: "The school has promised to offer support to students who are struggling.",
  },
  "offer an explanation": {
    definition: "To give a reason for why something happened.",
    example: "He refused to offer an explanation for his sudden resignation.",
  },
  "offer a solution": {
    definition: "To suggest a way to solve a problem.",
    example: "The consultant was hired to offer a solution to the company's staffing problems.",
  },
  "set a goal": {
    definition: "To decide on something you want to achieve.",
    example: "At the start of the course, each student was asked to set a goal for the term.",
  },
  "set a deadline": {
    definition: "To decide the latest time by which something must be finished.",
    example: "The editor set a deadline for all articles to be submitted by Friday afternoon.",
  },
  "set an example": {
    definition: "To behave in a way that other people should copy.",
    example: "Teachers should set an example by arriving on time and treating everyone fairly.",
  },
  "set a record": {
    definition: "To achieve the best result so far in an activity.",
    example: "The athlete set a record in the 200-meter final at the national championships.",
  },
  "set standards": {
    definition: "To establish the level of quality or behavior that others are expected to follow.",
    example: "The company aims to set standards for customer care in the industry.",
  },
  "provide information": {
    definition: "To give facts or details that people need.",
    example: "The website provides information about visa requirements for international students.",
  },
  "provide evidence": {
    definition: "To give facts, objects, or signs that show something is true.",
    example: "Witnesses were called to provide evidence during the court hearing.",
  },
  "provide support": {
    definition: "To give help, encouragement, or assistance.",
    example: "The charity was established to provide support for families in financial difficulty.",
  },
  "provide services": {
    definition: "To supply work or assistance that people or businesses need.",
    example: "Several local firms provide services to tourists during the summer season.",
  },
  "provide access": {
    definition: "To make it possible for someone to enter a place or use something.",
    example: "The new ramp will provide access to the building for wheelchair users.",
  },
  "win a prize": {
    definition: "To receive an award in a competition.",
    example: "She was thrilled to win a prize for her short story at the school festival.",
  },
  "win a game": {
    definition: "To be the successful side in a game.",
    example: "You need both skill and luck to win a game against such strong opponents.",
  },
  "win a match": {
    definition: "To defeat another person or team in a sports contest.",
    example: "They were delighted to win the match after training so hard all season.",
  },
  "win a race": {
    definition: "To finish first in a competition of speed.",
    example: "He trained for months in the hope of winning the race this year.",
  },
  "win support": {
    definition: "To persuade people to approve of or help you.",
    example: "The candidate worked hard to win support from undecided voters before the election.",
  },
  "get a job": {
    definition: "To obtain employment.",
    example: "After months of applying, she finally managed to get a job at a local design studio.",
  },
  "get permission": {
    definition: "To be allowed to do something by someone in authority.",
    example: "You need to get permission from the teacher before leaving the classroom.",
  },
  "get advice": {
    definition: "To receive suggestions about what you should do.",
    example: "If you are unsure which course to choose, it is a good idea to get advice first.",
  },
  "get information": {
    definition: "To obtain facts or details about something.",
    example: "Tourists can get information about local attractions at the station.",
  },
  "get results": {
    definition: "To achieve outcomes, especially after effort.",
    example: "If you study regularly, you are much more likely to get results.",
  },
  "get experience": {
    definition: "To gain practical knowledge or skill by doing something.",
    example: "Many students work part-time to get experience before graduating.",
  },
  "get confidence": {
    definition: "To become more self-assured.",
    example: "The best way to get confidence in speaking is to practise often.",
  },
  "get access": {
    definition: "To obtain the right or ability to enter a place or use something.",
    example: "Only staff with the correct password can get access to the secure files.",
  },
  "get support": {
    definition: "To receive help, encouragement, or assistance.",
    example: "Small businesses can get support from local enterprise schemes.",
  },
  "get attention": {
    definition: "To make people notice you or what you are doing.",
    example: "The campaign used bright colors to get attention online.",
  },
};

function makeValidOption(prompt, word, topic) {
  const collocation = `${prompt.toLowerCase()} ${word.toLowerCase()}`;
  const curated = CURATED_COLLOCATION_CONTENT[collocation];
  return {
    word: word.toLowerCase(),
    isCorrect: true,
    collocation,
    definition: curated?.definition || `a natural adjective + noun collocation used in ${humanTopic(topic)} contexts`,
    example: curated?.example || exampleForCollocation(collocation, "adjective + noun"),
  };
}

function makeTrapOption(prompt, word) {
  return {
    word: word.toLowerCase(),
    isCorrect: false,
    note: `${prompt.toLowerCase()} ${word.toLowerCase()} is not a common collocation in English.`,
  };
}

function makeAdjectiveNounItem(prompt, validCollocates, distractors, level, topics) {
  const [topic, ...secondaryTopics] = topics;
  return {
    itemId: `coll-prec-${slugify(prompt)}-001`,
    prompt: prompt.toLowerCase(),
    level: level.toLowerCase(),
    topic,
    ...(secondaryTopics.length ? { secondaryTopics } : {}),
    pattern: "adjective + noun",
    question: `Which words form natural collocations with ${prompt.toLowerCase()}?`,
    options: [
      ...validCollocates.map((word) => makeValidOption(prompt, word, topic)),
      ...distractors.map((word) => makeTrapOption(prompt, word)),
    ],
  };
}

function entryWord(entry) {
  return typeof entry === "string" ? entry : entry.word;
}

function makeCompoundValidOption(prompt, entry, topic) {
  const word = entryWord(entry).toLowerCase();
  const collocation = (typeof entry === "string" ? `${prompt.toLowerCase()} ${word}` : entry.collocation).toLowerCase();
  const curated = CURATED_COLLOCATION_CONTENT[collocation];
  return {
    word,
    isCorrect: true,
    collocation,
    definition: curated?.definition || `a natural noun + noun compound or fixed noun phrase used in ${humanTopic(topic)} contexts`,
    example: curated?.example || exampleForCollocation(collocation, "noun + noun"),
  };
}

function makeCompoundNounItem(prompt, validCollocates, distractors, level, topics) {
  const [topic, ...secondaryTopics] = topics;
  return {
    itemId: `coll-prec-${slugify(prompt)}-noun-001`,
    prompt: prompt.toLowerCase(),
    level: level.toLowerCase(),
    topic,
    ...(secondaryTopics.length ? { secondaryTopics } : {}),
    pattern: "noun + noun",
    question: `Which words form natural compounds or fixed noun phrases with ${prompt.toLowerCase()}?`,
    options: [
      ...validCollocates.map((entry) => makeCompoundValidOption(prompt, entry, topic)),
      ...distractors.map((word) => makeTrapOption(prompt, word)),
    ],
  };
}

function makeVerbNounValidOption(prompt, entry, topic) {
  const word = entryWord(entry).toLowerCase();
  const collocation = (typeof entry === "string" ? `${prompt.toLowerCase()} ${word}` : entry.collocation).toLowerCase();
  const curated = CURATED_COLLOCATION_CONTENT[collocation];
  return {
    word,
    isCorrect: true,
    collocation,
    definition: curated?.definition || `a natural verb + noun collocation used in ${humanTopic(topic)} contexts`,
    example: curated?.example || exampleForCollocation(collocation, "verb + noun"),
  };
}

function makeVerbNounItem(prompt, validCollocates, distractors, level, topics, variant = "001") {
  const [topic, ...secondaryTopics] = topics;
  return {
    itemId: `coll-prec-${slugify(prompt)}-verb-${variant}`,
    prompt: prompt.toLowerCase(),
    level: level.toLowerCase(),
    topic,
    ...(secondaryTopics.length ? { secondaryTopics } : {}),
    pattern: "verb + noun",
    question: `Which nouns form natural collocations with ${prompt.toLowerCase()}?`,
    options: [
      ...validCollocates.map((entry) => makeVerbNounValidOption(prompt, entry, topic)),
      ...distractors.map((word) => makeTrapOption(prompt, word)),
    ],
  };
}

const ADJECTIVE_NOUN_BATCH = [
  makeAdjectiveNounItem("Absolute", ["Agony", "Despair", "Certainty", "Necessity"], ["Sadness", "Pain", "Soup"], "C1", ["feelings"]),
  makeAdjectiveNounItem("Active", ["Ingredient", "Role", "Lifestyle", "Participation"], ["Part", "Action", "Meeting"], "B2", ["health", "work"]),
  makeAdjectiveNounItem("Alternative", ["Energy", "Medicine", "Route", "Strategy", "Way", "Treatment"], ["Salary", "Deadline", "Committee"], "B2", ["environment"]),
  makeAdjectiveNounItem("Artificial", ["Limb", "Intelligence", "Light", "Sweetener"], ["Desk", "Garden", "Bottle"], "B1", ["technology"]),
  makeAdjectiveNounItem("Bad", ["Breath", "Diet", "Habit", "Mood", "Temper"], ["Schedule", "Window", "Budget"], "B1", ["health"]),
  makeAdjectiveNounItem("Balanced", ["Diet", "Budget", "View", "Perspective"], ["Schedule", "Window", "Meeting"], "B1", ["health", "work"]),
  makeAdjectiveNounItem("Bare", ["Essentials", "Minimum", "Feet", "Walls"], ["Schedule", "Window", "Meeting"], "B2", ["daily-life"]),
  makeAdjectiveNounItem("Basic", ["Right", "Skill", "Need", "Principle"], ["Schedule", "Window", "Meeting"], "B1", ["education"]),
  makeAdjectiveNounItem("Best", ["Friends", "Interests", "Effort", "Scenario"], ["Traffic", "Furniture", "Weather"], "B1", ["people"]),
  makeAdjectiveNounItem("Big", ["Decision", "Disappointment", "Mistake", "Surprise"], ["Schedule", "Window", "Meeting"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Blind", ["Faith", "Loyalty", "Obedience", "Spot"], ["Carpet", "Pencil", "Kitchen"], "C1", ["people"]),
  makeAdjectiveNounItem("Brief", ["Chat", "Meeting", "Description", "Visit"], ["Schedule", "Window", "Budget"], "B1", ["work"]),
  makeAdjectiveNounItem("Bright", ["Future", "Idea", "Colour", "Smile"], ["Window", "Bottle", "Carpet"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Casual", ["Clothes", "Relationship", "Acquaintance"], ["Schedule", "Window", "Budget"], "B1", ["people"]),
  makeAdjectiveNounItem("Clean", ["Energy", "Record", "Break", "Conscience", "Power", "Air"], ["Opinion", "Result", "Story"], "B2", ["environment"]),
  makeAdjectiveNounItem("Clear", ["Message", "Understanding", "Evidence", "View"], ["Schedule", "Person", "Meeting"], "B1", ["education"]),
  makeAdjectiveNounItem("Common", ["Knowledge", "Language", "Sense", "Goal"], ["Schedule", "Window", "Meeting"], "B1", ["education"]),
  makeAdjectiveNounItem("Complete", ["Agreement", "Idiot", "Surprise", "Silence"], ["Promise", "Person", "Window"], "B2", ["daily-life"]),
  makeAdjectiveNounItem("Dead", ["End", "Body", "Silence", "Battery"], ["Road", "Situation", "Noise"], "B2", ["daily-life"]),
  makeAdjectiveNounItem("Deadly", ["Weapon", "Poison", "Silence", "Disease"], ["Person", "Schedule", "Window"], "B2", ["health"]),
  makeAdjectiveNounItem("Early", ["Days", "Riser", "Start", "Retirement"], ["Schedule", "Window", "Budget"], "B1", ["work"]),
  makeAdjectiveNounItem("Easy", ["Answer", "Money", "Target", "Victory"], ["Schedule", "Window", "Budget"], "B1", ["shopping"]),
  makeAdjectiveNounItem("Empty", ["Promises", "Words", "Threat", "Stomach"], ["Schedule", "Window", "Budget"], "B2", ["daily-life"]),
  makeAdjectiveNounItem("Essential", ["Services", "Components", "Ingredients", "Skills"], ["Schedule", "Window", "Budget"], "B2", ["work"]),
  makeAdjectiveNounItem("Ethical", ["Standards", "Investment", "Dilemma", "Issues", "Conduct"], ["Minority", "Schedule", "Window"], "C1", ["politics"]),
  makeAdjectiveNounItem("Ethnic", ["Minority", "Tensions", "Diversity", "Food"], ["Standards", "Issues", "Views"], "C1", ["politics"]),
  makeAdjectiveNounItem("Express", ["Bus", "Service", "Wish", "Purpose"], ["Road", "Chair", "Speed"], "B1", ["travel", "work"]),
  makeAdjectiveNounItem("False", ["Impression", "Teeth", "Alarm", "Identity"], ["Schedule", "Window", "Budget"], "B1", ["people"]),
  makeAdjectiveNounItem("Fatal", ["Accident", "Mistake", "Flaw", "Blow", "Injury"], ["Schedule", "Window", "Budget"], "C1", ["daily-life"]),
  makeAdjectiveNounItem("Flat", ["Battery", "Tyre", "Rate", "Surface"], ["Bag", "Ticket", "Soup"], "B1", ["travel"]),
  makeAdjectiveNounItem("Foreign", ["Policy", "Language", "Exchange", "Student"], ["Way", "Deadline", "Salary"], "B2", ["politics"]),
  makeAdjectiveNounItem("Free", ["Speech", "Spirit", "Time", "Sample"], ["Deadline", "Salary", "Committee"], "B1", ["politics"]),
  makeAdjectiveNounItem("Front", ["Page", "Door", "Seat", "Row"], ["Side", "Back", "Start"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Good", ["Cause", "Chance", "Company", "Deal"], ["Window", "Traffic", "Furniture"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Great", ["Detail", "Skill", "Wealth", "Admiration"], ["Window", "Bottle", "Carpet"], "B1", ["work"]),
  makeAdjectiveNounItem("Guilty", ["Conscience", "Party", "Verdict", "Pleasure"], ["Mind", "Bottle", "Feeling"], "B2", ["feelings"]),
  makeAdjectiveNounItem("Hard", ["Work", "Evidence", "Day", "Exam"], ["Window", "Traffic", "Furniture"], "B1", ["work"]),
  makeAdjectiveNounItem("Healthy", ["Diet", "Lifestyle", "Appetite", "Competition", "Food", "Living"], ["Deadline", "Salary", "Window"], "B1", ["health"]),
  makeAdjectiveNounItem("High", ["Quality", "Standard", "Level", "Pressure", "Price"], ["Way", "Window", "Meeting"], "B1", ["work"]),
  makeAdjectiveNounItem("Icy", ["Wind", "Stare", "Patch", "Water"], ["Deadline", "Meeting", "Salary"], "B2", ["weather"]),
  makeAdjectiveNounItem("Ill", ["Health", "Effects", "Feeling", "Temper"], ["Sick", "Pain", "Result"], "B2", ["health"]),
  makeAdjectiveNounItem("Immediate", ["Action", "Family", "Future", "Effect", "Result"], ["Work", "Meeting", "Task"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Inside", ["Information", "Lane", "Job", "Knowledge"], ["Deadline", "Salary", "Window"], "B2", ["work"]),
  makeAdjectiveNounItem("Intense", ["Pressure", "Heat", "Debate", "Interest"], ["Schedule", "Window", "Salary"], "C1", ["education"]),
  makeAdjectiveNounItem("Internal", ["Injury", "Organ", "Affairs", "Clock"], ["Salary", "Window", "Meeting"], "B2", ["health"]),
  makeAdjectiveNounItem("Irreparable", ["Damage", "Harm", "Loss", "Rift"], ["Break", "Error", "Pain"], "C1", ["daily-life"]),
  makeAdjectiveNounItem("Joint", ["Account", "Effort", "Venture", "Owners"], ["Invoice", "Department", "Salary"], "B2", ["work"]),
  makeAdjectiveNounItem("Key", ["Issue", "Role", "Element", "Player"], ["Main", "Big", "Door"], "B2", ["work"]),
  makeAdjectiveNounItem("Large", ["Amount", "Scale", "Number", "Quantity"], ["Deadline", "Idea", "Evidence"], "B1", ["shopping"]),
  makeAdjectiveNounItem("Late", ["Night", "Departure", "Arrival", "Fee"], ["Time", "Slow", "End"], "B1", ["travel"]),
  makeAdjectiveNounItem("Legal", ["Advice", "Action", "System", "Requirement"], ["Office", "Salary", "Window"], "B2", ["politics"]),
  makeAdjectiveNounItem("Live", ["Music", "Broadcast", "Performance", "Show"], ["Window", "Salary", "Deadline"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Long", ["Time", "Distance", "Term", "Run"], ["Way", "Space", "High"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Maiden", ["Voyage", "Flight", "Speech", "Name"], ["Trip", "Start", "First"], "C1", ["travel", "people"]),
  makeAdjectiveNounItem("Main", ["Course", "Road", "Thing", "Reason"], ["Way", "Street", "Part"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Major", ["Problem", "Issue", "Role", "Concern"], ["Window", "Bottle", "Garden"], "B2", ["work"]),
  makeAdjectiveNounItem("Medical", ["History", "Condition", "Record", "Treatment"], ["Health", "Sick", "Illness"], "B1", ["health"]),
  makeAdjectiveNounItem("Mental", ["Illness", "Health", "Ability", "State"], ["Sick", "Mind", "Brain"], "B2", ["health"]),
  makeAdjectiveNounItem("Mixed", ["Feelings", "Message", "Results", "Reaction"], ["Different", "Double", "Blended"], "B2", ["feelings"]),
  makeAdjectiveNounItem("Moral", ["Obligation", "Duty", "Support", "Standard"], ["Right", "Ethics", "Mind"], "C1", ["politics"]),
  makeAdjectiveNounItem("Native", ["Speaker", "Country", "Land", "Tongue"], ["Local", "Original", "Home"], "B2", ["people"]),
  makeAdjectiveNounItem("Natural", ["Disaster", "Resources", "Causes", "Ability"], ["Real", "Normal", "Nature"], "B1", ["environment"]),
  makeAdjectiveNounItem("Negative", ["Attitude", "Impact", "Reaction", "Effect"], ["Chair", "Window", "Bottle"], "B1", ["people"]),
  makeAdjectiveNounItem("Net", ["Profit", "Income", "Worth", "Result"], ["Clean", "Pure", "Real"], "B2", ["work"]),
  makeAdjectiveNounItem("Occupational", ["Hazard", "Therapy", "Health", "Risk"], ["Job", "Work", "Professional"], "C1", ["work"]),
  makeAdjectiveNounItem("Odd", ["Number", "Socks", "Job", "One"], ["Strange", "Single", "Different"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Optional", ["Extras", "Features", "Subjects", "Equipment"], ["Choice", "Price", "Receipt"], "B2", ["shopping"]),
];

const ADJECTIVE_NOUN_BATCH_2 = [
  makeAdjectiveNounItem("Painful", ["Memory", "Reminder", "Experience", "Lesson"], ["Schedule", "Window", "Salary"], "B2", ["feelings"]),
  makeAdjectiveNounItem("Personal", ["Belongings", "Details", "Interest", "Space"], ["Weather", "Traffic", "Furniture"], "B1", ["people"]),
  makeAdjectiveNounItem("Political", ["Prisoner", "Party", "System", "Leader"], ["Window", "Salary", "Furniture"], "B2", ["politics"]),
  makeAdjectiveNounItem("Poor", ["Eyesight", "Health", "Performance", "Quality"], ["Schedule", "Window", "Salary"], "B2", ["health"]),
  makeAdjectiveNounItem("Popular", ["Belief", "Culture", "Demand", "Opinion"], ["Schedule", "Window", "Salary"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Private", ["Life", "Property", "Sector", "Conversation"], ["Schedule", "Weather", "Traffic"], "B1", ["people"]),
  makeAdjectiveNounItem("Public", ["Opinion", "Transport", "Service", "Holiday"], ["Sight", "Way", "Look"], "B1", ["politics"]),
  makeAdjectiveNounItem("Quick", ["Fix", "Reply", "Response", "Snack"], ["Way", "Fast", "Fastness"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Quiet", ["Life", "Night", "Neighborhood", "Voice"], ["Budget", "Deadline", "Salary"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Radical", ["Reform", "Change", "Shift", "Idea"], ["Start", "Move", "Begin"], "C1", ["politics"]),
  makeAdjectiveNounItem("Rave", ["Review", "Reception", "Notice", "Report"], ["Look", "Talk", "Sight"], "C1", ["daily-life"]),
  makeAdjectiveNounItem("Real", ["Life", "Wages", "World", "Problem"], ["Traffic", "Furniture", "Weather"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Reasonable", ["Explanation", "Price", "Excuse", "Doubt"], ["Say", "Thought", "Word"], "B2", ["education"]),
  makeAdjectiveNounItem("Regular", ["Exercise", "Interval", "Check-up", "Meeting"], ["Window", "Salary", "Furniture"], "B1", ["health", "work"]),
  makeAdjectiveNounItem("Rich", ["History", "Culture", "Vocabulary", "Source"], ["Window", "Bottle", "Carpet"], "B2", ["people", "education"]),
  makeAdjectiveNounItem("Rough", ["Draft", "Estimate", "Idea", "Sea"], ["Window", "Bottle", "Garden"], "B2", ["work", "travel"]),
  makeAdjectiveNounItem("Safe", ["Distance", "Bet", "Hands", "Haven"], ["Budget", "Deadline", "Salary"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Serious", ["Accident", "Illness", "Injury", "Relationship"], ["Window", "Furniture", "Weather"], "B2", ["health"]),
  makeAdjectiveNounItem("Severe", ["Weather", "Penalty", "Shortage", "Pressure", "Pain"], ["Window", "Meeting", "Salary"], "C1", ["environment"]),
  makeAdjectiveNounItem("Speedy", ["Recovery", "Response", "Trial", "Exit"], ["Fastness", "Bottle", "Move"], "B2", ["health", "work"]),
  makeAdjectiveNounItem("Steady", ["Job", "Relationship", "Progress", "Hand"], ["Deadline", "Window", "Salary"], "B2", ["work", "people"]),
  makeAdjectiveNounItem("Stiff", ["Competition", "Breeze", "Drink", "Neck"], ["Hard", "Rigid", "Match"], "C1", ["work", "daily-life"]),
  makeAdjectiveNounItem("Subject", ["Matter", "Change", "Debate", "Opinion"], ["Window", "Salary", "Furniture"], "C1", ["education"]),
  makeAdjectiveNounItem("Substantial", ["Amount", "Increase", "Portion", "Change"], ["Window", "Bottle", "Deadline"], "C1", ["shopping", "work"]),
  makeAdjectiveNounItem("Superficial", ["Wound", "Knowledge", "Relationship", "Link"], ["Skin", "Top", "Fast"], "C1", ["health", "people"]),
  makeAdjectiveNounItem("Tight", ["Schedule", "Grip", "Budget", "Corner"], ["Window", "Salary", "Meeting"], "B2", ["work", "daily-life"]),
  makeAdjectiveNounItem("Total", ["Bliss", "Failure", "Disaster", "Disbelief"], ["Window", "Salary", "Meeting"], "B2", ["feelings", "daily-life"]),
  makeAdjectiveNounItem("Typical", ["Example", "Behavior", "Day", "Symptom"], ["Window", "Bottle", "Garden"], "B1", ["education", "health"]),
  makeAdjectiveNounItem("Ulterior", ["Motive", "Reason", "Purpose"], ["Window", "Salary", "Meeting"], "C1", ["people"]),
  makeAdjectiveNounItem("Uncertain", ["Future", "Outcome", "Times", "Terms"], ["Way", "Life", "Space"], "B2", ["politics", "daily-life"]),
  makeAdjectiveNounItem("Unfair", ["Dismissal", "Advantage", "Treatment"], ["Fire", "Window", "Salary"], "B2", ["work", "politics"]),
  makeAdjectiveNounItem("Urban", ["Sprawl", "Area", "Planning", "Development"], ["Salary", "Deadline", "Furniture"], "B2", ["environment"]),
  makeAdjectiveNounItem("Utter", ["Catastrophe", "Failure", "Chaos", "Loathing"], ["Window", "Salary", "Meeting"], "C1", ["feelings", "daily-life"]),
  makeAdjectiveNounItem("Vague", ["Idea", "Memory", "Description", "Recollection"], ["Empty", "Light", "Thought"], "B2", ["education", "daily-life"]),
  makeAdjectiveNounItem("Valid", ["Point", "Reason", "Argument", "Passport"], ["Window", "Salary", "Meeting"], "B2", ["education", "travel"]),
  makeAdjectiveNounItem("Valuable", ["Contribution", "Information", "Lesson", "Asset"], ["Money", "Good", "Big"], "B2", ["work", "education"]),
  makeAdjectiveNounItem("Vital", ["Role", "Organs", "Information", "Statistic"], ["Big", "Main", "Great"], "B2", ["health", "work"]),
  makeAdjectiveNounItem("Welcome", ["Change", "Relief", "Break", "Addition"], ["Window", "Bottle", "Carpet"], "B2", ["daily-life"]),
  makeAdjectiveNounItem("Wrong", ["Number", "Way", "Impression", "Answer"], ["Table", "Garden", "Bottle"], "B1", ["daily-life"]),
  makeAdjectiveNounItem("Zero", ["Tolerance", "Visibility", "Growth", "Chance"], ["Chair", "Window", "Bottle"], "B2", ["politics", "environment"]),
];

const NOUN_NOUN_BATCH = [
  makeCompoundNounItem("Account", ["Executive", "Manager", "Balance"], ["Worker", "Boss", "Money"], "B2", ["work"]),
  makeCompoundNounItem("Air", ["Attack", "Raid", "Gun", "Conditioning"], ["Wind", "Cloud", "Sky"], "B2", ["daily-life"]),
  makeCompoundNounItem("Auto", ["Maker", "Manufacturer", "Industry"], ["Car", "Motor", "Machine"], "B2", ["work"]),
  makeCompoundNounItem("Bank", ["Draft", "Rate", "Account", "Statement", "Note"], ["Cash", "Money", "Desk"], "B2", ["work"]),
  makeCompoundNounItem("Bargain", ["Hunters", "Price", "Sale"], ["Buyers", "Shop", "Cost"], "B2", ["shopping"]),
  makeCompoundNounItem("Beauty", ["Industry", "Salon", "Shop", "Parlor"], ["Person", "Face", "Look"], "B2", ["daily-life"]),
  makeCompoundNounItem("Birth", ["Certificate", "Rate", "Control"], ["Paper", "Start", "Beginning"], "B2", ["politics", "health"]),
  makeCompoundNounItem("Block", [{ word: "of flats", collocation: "block of flats" }, "Grant", "Booking"], ["House", "Group", "Area"], "B2", ["daily-life"]),
  makeCompoundNounItem("Board", ["Game", "Meeting", "Member"], ["Table", "Group", "Play"], "B2", ["daily-life"]),
  makeCompoundNounItem("Body", ["Armor", "Double", "Language"], ["Person", "Skin", "People"], "B2", ["people"]),
  makeCompoundNounItem("Call", ["Center", "Option", "Card"], ["Talk", "Budget", "Window"], "B2", ["work"]),
  makeCompoundNounItem("Capital", ["Gain", "City", "Punishment"], ["Money", "Work", "Desk"], "B2", ["politics"]),
  makeCompoundNounItem("Car", ["Manufacturer", "Park", "Pool"], ["Road", "Drive", "Way"], "B2", ["travel"]),
  makeCompoundNounItem("Case", ["Law", "Study", "Work"], ["Fact", "Item", "Point"], "B2", ["education", "work"]),
  makeCompoundNounItem("Cash", ["Cow", "Flow", "Desk"], ["Ticket", "Win", "Garden"], "B2", ["work"]),
  makeCompoundNounItem("Child", ["Care", "Benefit", "Protection"], ["Person", "Work", "Kid"], "B2", ["people"]),
  makeCompoundNounItem("Comfort", ["Food", "Zone", "Level"], ["Home", "Bed", "Chair"], "B2", ["daily-life"]),
  makeCompoundNounItem("Computer", ["Business", "Programmer", "Virus", "Keyboard"], ["Machine", "Bottle", "Garden"], "B1", ["technology"]),
  makeCompoundNounItem("Contact", ["Details", "Lens", "Sport", "Person"], ["News", "Mood", "Story"], "B2", ["people"]),
  makeCompoundNounItem("Core", ["Values", "Competency", "Subject"], ["Heart", "Window", "Center"], "C1", ["education", "work"]),
  makeCompoundNounItem("Day", ["Shift", "Trip", "Break", "Time"], ["Chair", "Bottle", "Engine"], "B2", ["daily-life"]),
  makeCompoundNounItem("Death", ["Tax", "Wish", "Penalty"], ["End", "Fear", "Life"], "C1", ["politics"]),
  makeCompoundNounItem("Departure", ["Time", "Lounge", "Gate"], ["Start", "Room", "Flight"], "B2", ["travel"]),
  makeCompoundNounItem("Desk", ["Job", "Officer", "Top"], ["Table", "Bottle", "Holiday"], "B2", ["work"]),
  makeCompoundNounItem("Driving", ["Licence", "Test", "Instructor"], ["Car", "Road", "Way"], "B1", ["travel"]),
];

const NOUN_NOUN_BATCH_2 = [
  makeCompoundNounItem("Health", ["Club", "Care", "System", "Insurance", "Office"], ["Building", "Desk", "Boss"], "B2", ["health"]),
  makeCompoundNounItem("History", ["Department", "Teacher", "Book", "Lesson", "Section"], ["Office", "Area", "Desk"], "B2", ["education"]),
  makeCompoundNounItem("Hit", ["List", "Man", "Song", "Rate"], ["Person", "Point", "Way"], "B2", ["daily-life"]),
  makeCompoundNounItem("Identity", ["Crisis", "Card", "Theft", "Fraud"], ["Face", "Name", "Badge"], "B2", ["people"]),
  makeCompoundNounItem("Insurance", ["Broker", "Policy", "Claim", "Premium"], ["Officer", "Seller", "Note"], "B2", ["work"]),
  makeCompoundNounItem("Interest", ["Group", "Rate", "Payment", "Charges"], ["Money", "Cash", "Number"], "B2", ["work"]),
  makeCompoundNounItem("Jail", ["Cell", "Sentence", "Bird", "Break"], ["Room", "Box", "Place"], "B2", ["politics"]),
  makeCompoundNounItem("Jury", ["System", "Duty", "Service", "Trial", "Box"], ["Group", "Meeting", "Plan"], "B2", ["politics"]),
  makeCompoundNounItem("Kitchen", ["Cabinet", "Table", "Sink", "Appliances"], ["Board", "Hall", "Bottle"], "B1", ["daily-life"]),
  makeCompoundNounItem("Knowledge", ["Base", "Gap", "Economy", "Sharing"], ["Area", "Block", "File"], "C1", ["education", "work"]),
  makeCompoundNounItem("Labour", ["Camp", "Force", "Market", "Union"], ["Group", "Grouping", "Shift"], "B2", ["work", "politics"]),
  makeCompoundNounItem("Law", ["Officer", "Firm", "Case", "Enforcement"], ["Person", "Task", "Room"], "B2", ["politics"]),
  makeCompoundNounItem("Lead", ["Singer", "Time", "Role", "Guitar", "Position"], ["Man", "Start", "Plan"], "B2", ["daily-life"]),
  makeCompoundNounItem("Market", ["Economy", "Research", "Share", "Leader"], ["House", "Shop", "Room"], "B2", ["work", "shopping"]),
  makeCompoundNounItem("Money", ["Order", "Laundering", "Management"], ["Task", "Work", "Note"], "B2", ["work"]),
  makeCompoundNounItem("Music", ["Department", "School", "Industry", "Teacher"], ["Pro", "Group", "Work"], "B1", ["education", "daily-life"]),
  makeCompoundNounItem("News", ["Organization", "Show", "Agency", "Report"], ["Gossip", "Talk", "Desk"], "B2", ["daily-life"]),
  makeCompoundNounItem("Office", ["Block", "Hours", "Job", "Space"], ["Meal", "Garden", "Holiday"], "B2", ["work"]),
  makeCompoundNounItem("Opinion", ["Poll", "Piece", "Leader"], ["Thought", "Idea", "View"], "B2", ["politics"]),
  makeCompoundNounItem("Package", ["Holiday", "Deal", "Tour"], ["Box", "Journey", "Route"], "B2", ["travel", "shopping"]),
  makeCompoundNounItem("Parking", ["Ticket", "Space", "Meter", "Permit"], ["Room", "Door", "Way"], "B1", ["travel"]),
  makeCompoundNounItem("Pay", ["Increase", "Rise", "Scale", "Cut"], ["Bonus", "Work", "Gift"], "B2", ["work"]),
  makeCompoundNounItem("Piece", [{ word: "of advice", collocation: "piece of advice" }, { word: "of equipment", collocation: "piece of equipment" }, { word: "of information", collocation: "piece of information" }, { word: "of music", collocation: "piece of music" }], ["of detail", "of fact", "of item"], "B1", ["education"]),
  makeCompoundNounItem("Post", ["Office", "Card", "Code", "Box"], ["House", "Room", "Letter"], "B1", ["daily-life"]),
  makeCompoundNounItem("Price", ["Competition", "Tag", "War", "Increase"], ["Cost", "Money", "Goal"], "B2", ["shopping", "work"]),
  makeCompoundNounItem("Production", ["Cost", "Line", "Target", "Manager"], ["Work", "Task", "Result"], "B2", ["work"]),
  makeCompoundNounItem("Profit", ["Margin", "Share", "Forecast"], ["Win", "Money", "Gain"], "B2", ["work"]),
];

const NOUN_NOUN_BATCH_3 = [
  makeCompoundNounItem("Quality", [{ word: "of life", collocation: "quality of life" }, "Assurance", "Control"], ["of way", "of budget", "of person"], "B2", ["daily-life", "work"]),
  makeCompoundNounItem("Rate", [{ word: "of return", collocation: "rate of return" }, { word: "of exchange", collocation: "rate of exchange" }, { word: "of pay", collocation: "rate of pay" }], ["of goal", "of way", "of person"], "B2", ["work"]),
  makeCompoundNounItem("Rental", ["Income", "Agreement", "Property"], ["Money", "Job", "Place"], "B2", ["work"]),
  makeCompoundNounItem("Return", ["Address", "Flight", "Ticket", "Journey"], ["Way", "Path", "Road"], "B1", ["travel", "daily-life"]),
  makeCompoundNounItem("Road", ["Safety", "Rage", "Map", "Works"], ["Way", "Street", "Path"], "B1", ["travel"]),
  makeCompoundNounItem("Room", [{ word: "for improvement", collocation: "room for improvement" }, "Temperature", "Service"], ["for work", "for better", "for area"], "B1", ["daily-life"]),
  makeCompoundNounItem("Savings", ["Bond", "Account", "Bank"], ["Money", "Cash", "Note"], "B2", ["work"]),
  makeCompoundNounItem("Search", ["Warrant", "Engine", "Party"], ["Book", "Task", "Way"], "B1", ["technology", "politics"]),
  makeCompoundNounItem("Security", ["Forces", "Blanket", "Guard", "System"], ["Person", "Task", "Meal"], "B2", ["politics", "work"]),
  makeCompoundNounItem("Service", ["Charge", "Industry", "Station", "Provider", "Work"], ["Help", "Meal", "Holiday"], "B2", ["work"]),
  makeCompoundNounItem("Sore", ["Throat", "Point", "Loser", "Head"], ["Pain", "Injury", "Damage"], "B2", ["health", "people"]),
  makeCompoundNounItem("Speed", ["Limit", "Camera", "Trap"], ["Boat", "Way", "Pace"], "B1", ["travel"]),
  makeCompoundNounItem("Stock", ["Option", "Market", "Exchange", "Broker"], ["Choice", "Money", "Deal"], "B2", ["work"]),
  makeCompoundNounItem("Tax", ["Break", "Shelter", "Return", "Deduction"], ["Money", "Gift", "Loss"], "B2", ["politics", "work"]),
  makeCompoundNounItem("Tea", ["Leaf", "Bag", "Time", "Spoon"], ["Water", "Shelf", "Plate"], "B1", ["daily-life"]),
  makeCompoundNounItem("Television", ["Reporter", "Show", "Series", "Station", "News", "Movie"], ["Box", "Chair", "Table"], "B1", ["daily-life"]),
  makeCompoundNounItem("Term", ["Paper", "Time", "Limit"], ["Work", "Book", "Goal"], "B2", ["education"]),
  makeCompoundNounItem("Trade", ["Route", "Union", "Secret", "Gap"], ["Path", "Road", "Way"], "B2", ["work", "politics"]),
  makeCompoundNounItem("Trial", ["Court", "Lawyer", "Run", "Period"], ["Task", "Job", "Goal"], "B2", ["politics", "work"]),
  makeCompoundNounItem("Voting", ["Booth", "Machine", "Right", "Age"], ["Box", "Paper", "Person"], "B2", ["politics"]),
  makeCompoundNounItem("War", ["Crime", "Zone", "Game", "Hero"], ["Fight", "Work", "Battle"], "B2", ["politics"]),
  makeCompoundNounItem("Water", ["Cannon", "Heater", "Level", "Tank"], ["Drink", "Rain", "Ocean"], "B1", ["daily-life", "environment"]),
  makeCompoundNounItem("Word", ["Blindness", "Salad", "Choice"], ["Talk", "Book", "Speak"], "C1", ["education"]),
  makeCompoundNounItem("Work", ["Force", "Place", "Load", "Permit", "Experience"], ["Task", "Chair", "Meal"], "B1", ["work"]),
];

const VERB_NOUN_BATCH_1 = [
  makeVerbNounItem("Achieve", ["a result", "an objective", "a target"], ["an exam", "homework", "a task"], "B2", ["work"]),
  makeVerbNounItem("Acknowledge", ["defeat", "victory", "receipt"], ["a gift", "a promise", "an opinion"], "C1", ["politics", "work"]),
  makeVerbNounItem("Address", ["a problem", "an issue", "concerns", "needs"], ["a talk", "a conversation", "a speech"], "B2", ["work", "politics"]),
  makeVerbNounItem("Arouse", ["interest", "hostility", "passion", "suspicion"], ["a budget", "a meeting", "a task"], "C1", ["feelings"]),
  makeVerbNounItem("Bear", ["a grudge", "the cost", "responsibility", "weight", "fruit"], ["money", "a salary", "a price"], "C1", ["people", "feelings"]),
  makeVerbNounItem("Break", ["a habit", "a record", "the silence", "a rule", "the law"], ["homework", "paperwork", "a salary"], "B1", ["daily-life", "politics"]),
  makeVerbNounItem("Build", ["a company", "a friendship", "a future"], ["a salary", "paperwork", "an opinion"], "B1", ["work", "people"]),
  makeVerbNounItem("Chair", ["a committee", "a meeting", "a task force"], ["a desk", "an office", "a job"], "B2", ["work"]),
  makeVerbNounItem("Close", ["a deal", "the discussion", "a sale"], ["furniture", "homework", "a salary"], "B2", ["work", "shopping"]),
  makeVerbNounItem("Conduct", ["an experiment", "research", "a meeting", "an orchestra"], ["homework", "a salary", "a budget"], "B2", ["education", "work"]),
  makeVerbNounItem("Crave", ["attention", "respect", "fame", "love", "excitement"], ["paperwork", "an office", "a meeting"], "C1", ["feelings", "people"]),
  makeVerbNounItem("Curb", ["growth", "inflation", "interest rates", "violence"], ["paperwork", "a salary", "friendship"], "C1", ["politics", "work"]),
  makeVerbNounItem("Deliver", ["a presentation", "a speech", "a letter", "a parcel"], ["homework", "a salary", "advice"], "B1", ["work", "travel"]),
  makeVerbNounItem("Divulge", ["information", "a secret", "details", "identity"], ["homework", "a salary", "furniture"], "C1", ["politics", "work"]),
  makeVerbNounItem("Draw", ["attention", "a crowd", "an audience", "a conclusion"], ["homework", "paperwork", "furniture"], "B2", ["daily-life", "education"]),
  makeVerbNounItem("Formulate", ["an idea", "a question", "an answer", "a plan"], ["homework", "a salary", "furniture"], "C1", ["education", "work"]),
  makeVerbNounItem("Generate", ["interest", "ideas", "electricity", "profit", "revenue"], ["a meeting", "paperwork", "furniture"], "B2", ["work", "technology"]),
  makeVerbNounItem("Grant", ["access", "custody", "permission", "a request", "asylum"], ["homework", "a salary", "furniture"], "C1", ["politics", "work"]),
];

const VERB_NOUN_BATCH_2 = [
  makeVerbNounItem("Hold", ["a meeting", "an opinion", "a record", "a reception"], ["homework", "a salary", "furniture"], "B2", ["work", "politics"]),
  makeVerbNounItem("Incur", ["a debt", "a fee", "a charge", "damage", "the anger"], ["a salary", "furniture", "homework"], "C1", ["work", "shopping"]),
  makeVerbNounItem("Invest", ["money", "time", "energy"], ["furniture", "a salary", "paperwork"], "B2", ["work", "daily-life"]),
  makeVerbNounItem("Keep", ["a promise", "a secret", { word: "your word", collocation: "keep your word" }], ["homework", "furniture", "a salary"], "B1", ["people", "feelings"]),
  makeVerbNounItem("Lose", ["confidence", "control", "patience", "money", "weight"], ["furniture", "paperwork", "a salary"], "B1", ["feelings", "health"]),
  makeVerbNounItem("Make", ["headway", "money", "progress", { word: "a difference", collocation: "make a difference" }, { word: "a living", collocation: "make a living" }], ["paperwork", "traffic", "a salary"], "B1", ["work", "daily-life"]),
  makeVerbNounItem("Meet", ["a challenge", "a deadline", "expectations", "requirements"], ["furniture", "paperwork", "a salary"], "B2", ["work", "education"]),
  makeVerbNounItem("Orchestrate", ["a campaign", "an attack", { word: "a hold-up", collocation: "orchestrate a hold-up" }, "an event"], ["furniture", "homework", "a salary"], "C1", ["politics", "work"]),
  makeVerbNounItem("Pay", ["attention", { word: "a compliment", collocation: "pay a compliment" }, { word: "a visit", collocation: "pay a visit" }], ["a rule", "the law", "a mistake"], "B1", ["people", "daily-life"]),
];

const VERB_NOUN_BATCH_3 = [
  makeVerbNounItem("Raise", ["a child", "animals", "expectations", "an issue"], ["an exam", "homework", "a task"], "B1", ["people", "work"]),
  makeVerbNounItem("Reach", ["a conclusion", "a destination", "a goal", "a verdict"], ["furniture", "homework", "a salary"], "B2", ["travel", "work"]),
  makeVerbNounItem("Save", ["time", "money", "space", "a life", "the situation"], ["furniture", "paperwork", "a salary"], "B1", ["daily-life", "work"]),
  makeVerbNounItem("Stand", ["trial", "a chance", "comparison", { word: "your ground", collocation: "stand your ground" }, { word: "to attention", collocation: "stand to attention" }], ["furniture", "paperwork", "a salary"], "C1", ["politics", "people"]),
  makeVerbNounItem("Tackle", ["a problem", "an issue", "a task", "a crisis"], ["furniture", "a salary", "paperwork"], "B2", ["work", "politics"]),
  makeVerbNounItem("Take", ["control", "a seat", "a stand", "steps", "a risk", "a test"], ["furniture", "paperwork", "a salary"], "B1", ["daily-life", "work"]),
  makeVerbNounItem("Throw", ["doubt", "light", "a party", "a tantrum"], ["furniture", "paperwork", "a salary"], "B2", ["feelings", "daily-life"]),
];

const VERB_NOUN_EASY_BATCH = [
  makeVerbNounItem("Ask", [{ word: "a question", collocation: "ask a question" }, { word: "a favour", collocation: "ask a favour" }, "permission", { word: "for advice", collocation: "ask for advice" }, { word: "for help", collocation: "ask for help" }], ["information", "advice", "help"], "B1", ["daily-life"]),
  makeVerbNounItem("Do", ["homework", "housework", "business", "yoga", { word: "the dishes", collocation: "do the dishes" }], ["a mistake", "a decision", "progress"], "B1", ["daily-life", "work"]),
  makeVerbNounItem("Have", [{ word: "a chat", collocation: "have a chat" }, { word: "a rest", collocation: "have a rest" }, { word: "a bath", collocation: "have a bath" }, { word: "a look", collocation: "have a look" }, { word: "a party", collocation: "have a party" }], ["progress", "a salary", "a mistake"], "B1", ["daily-life"]),
  makeVerbNounItem("Tell", [{ word: "the truth", collocation: "tell the truth" }, { word: "a lie", collocation: "tell a lie" }, { word: "a story", collocation: "tell a story" }, { word: "a joke", collocation: "tell a joke" }, { word: "the time", collocation: "tell the time" }], ["a word", "a speech", "a presentation"], "B1", ["people", "daily-life"]),
];

const VERB_NOUN_BATCH_4 = [
  makeVerbNounItem("Give", ["advice", "permission", "a speech", "a presentation", "an example"], ["homework", "furniture", "a salary"], "B1", ["work", "education"]),
  makeVerbNounItem("Gain", ["experience", "confidence", "weight", "access", "control"], ["homework", "furniture", "a salary"], "B2", ["work", "daily-life"]),
  makeVerbNounItem("Offer", ["advice", "help", "support", "an explanation", "a solution"], ["homework", "furniture", "a salary"], "B2", ["work", "people"]),
];

const VERB_NOUN_BATCH_5 = [
  makeVerbNounItem("Set", ["a goal", "a deadline", "an example", "a record", "standards"], ["homework", "furniture", "a salary"], "B2", ["work", "education"]),
  makeVerbNounItem("Provide", ["information", "evidence", "support", "services", "access"], ["homework", "furniture", "a salary"], "B2", ["work", "daily-life"]),
  makeVerbNounItem("Win", ["a prize", "a game", "a match", "a race", "support"], ["homework", "furniture", "a salary"], "B1", ["daily-life", "people"]),
];

const VERB_NOUN_BATCH_GET = [
  makeVerbNounItem("Get", ["a job", "permission", "advice", "information", "results"], ["geometry", "brickwork", "thunder"], "B1", ["work", "daily-life"], "work"),
  makeVerbNounItem("Get", ["experience", "confidence", "access", "support", "attention"], ["carpentry", "thunder", "brickwork"], "B2", ["work", "people"], "abstract"),
];

const RAW_ITEMS = [
  {
    itemId: "coll-prec-adverse-001",
    prompt: "adverse",
    level: "c1",
    topic: "work",
    pattern: "adjective + noun",
    question: "Which words form natural collocations with adverse?",
    options: [
      {
        word: "effects",
        isCorrect: true,
        collocation: "adverse effects",
        definition: "negative effects or results",
        example: "The policy had adverse effects on small businesses.",
        note: "A very common formal collocation.",
      },
      {
        word: "conditions",
        isCorrect: true,
        collocation: "adverse conditions",
        definition: "difficult or unfavourable conditions",
        example: "The rescue team worked in adverse conditions.",
        note: "Often used for weather, travel, work, or safety contexts.",
      },
      {
        word: "weather",
        isCorrect: true,
        collocation: "adverse weather",
        definition: "bad weather that creates problems",
        example: "Flights were delayed because of adverse weather.",
        note: "Common in travel reports and official announcements.",
      },
      {
        word: "response",
        isCorrect: false,
        note: "Use negative response, poor response, or unfavourable response instead.",
      },
      {
        word: "result",
        isCorrect: false,
        note: "Adverse result is possible in specialist contexts, but adverse effects/results is much more natural.",
      },
    ],
  },
  {
    itemId: "coll-prec-heavy-001",
    prompt: "heavy",
    level: "b1",
    topic: "weather",
    pattern: "adjective + noun",
    question: "Which words form natural collocations with heavy?",
    options: [
      {
        word: "rain",
        isCorrect: true,
        collocation: "heavy rain",
        definition: "a lot of rain",
        example: "The match was cancelled because of heavy rain.",
        note: "Heavy is commonly used with rain, snow, traffic, and losses.",
      },
      {
        word: "traffic",
        isCorrect: true,
        collocation: "heavy traffic",
        definition: "a large amount of traffic",
        example: "I was late because of heavy traffic.",
        note: "A high-frequency travel collocation.",
      },
      {
        word: "sleeper",
        isCorrect: true,
        collocation: "heavy sleeper",
        definition: "someone who does not wake up easily",
        example: "I am such a heavy sleeper that I never hear my alarm.",
        note: "A common people and daily-life collocation.",
      },
      {
        word: "workload",
        isCorrect: true,
        collocation: "heavy workload",
        definition: "a large amount of work",
        example: "Teachers often have a heavy workload during exam season.",
        note: "Useful for work and study contexts.",
      },
      {
        word: "snow",
        isCorrect: true,
        collocation: "heavy snow",
        definition: "a large amount of snow falling or lying on the ground",
        example: "Heavy snow caused major delays on roads across the region.",
        note: "A standard weather collocation, especially in forecasts and travel updates.",
      },
      {
        word: "volume",
        isCorrect: false,
        note: "Use high volume or loud volume, not heavy volume.",
      },
      {
        word: "sound",
        isCorrect: false,
        note: "Use loud sound or heavy metal for music; heavy sound is not the target collocation here.",
      },
    ],
  },
  {
    itemId: "coll-prec-congested-001",
    prompt: "congested",
    level: "c1",
    topic: "travel",
    secondaryTopics: ["health"],
    pattern: "adjective + noun",
    question: "Which words form natural collocations with congested?",
    options: [
      {
        word: "roads",
        isCorrect: true,
        collocation: "congested roads",
        definition: "roads with too many vehicles, causing slow movement",
        example: "Commuters were delayed by heavily congested roads this morning.",
        note: "A common transport collocation, especially in formal reports.",
      },
      {
        word: "thoroughfares",
        isCorrect: true,
        collocation: "congested thoroughfares",
        definition: "busy main roads or routes through a city",
        example: "The city's main congested thoroughfares are being expanded next year.",
        note: "More formal than congested roads.",
      },
      {
        word: "airways",
        isCorrect: true,
        collocation: "congested airways",
        definition: "breathing passages blocked or narrowed by illness or allergy",
        example: "The doctor confirmed that his congested airways were caused by an allergy.",
        note: "A medical use of congested.",
      },
      {
        word: "path",
        isCorrect: false,
        note: "Use blocked path, narrow path, or crowded path depending on the meaning.",
      },
      {
        word: "traffic",
        isCorrect: false,
        note: "We normally say heavy traffic or traffic congestion, not congested traffic.",
      },
      {
        word: "crowd",
        isCorrect: false,
        note: "Use large crowd, dense crowd, or crowded area. Congested is normally used for roads, routes, or airways.",
      },
    ],
  },
  {
    itemId: "coll-prec-unanimous-001",
    prompt: "unanimous",
    level: "c1",
    topic: "politics",
    secondaryTopics: ["work"],
    pattern: "adjective + noun",
    question: "Which words form natural collocations with unanimous?",
    options: [
      {
        word: "agreement",
        isCorrect: true,
        collocation: "unanimous agreement",
        definition: "complete agreement from everyone involved",
        example: "There was unanimous agreement among the board members to sell the firm.",
        note: "Common in meetings, committees, and formal decision-making.",
      },
      {
        word: "decision",
        isCorrect: true,
        collocation: "unanimous decision",
        definition: "a decision supported by everyone",
        example: "The jury reached a unanimous decision after only two hours.",
        note: "Often used in legal, board, and committee contexts.",
      },
      {
        word: "vote",
        isCorrect: true,
        collocation: "unanimous vote",
        definition: "a vote where everyone votes the same way",
        example: "The new law was passed following a unanimous vote in parliament.",
        note: "Useful for politics and organisations.",
      },
      {
        word: "opinion",
        isCorrect: false,
        note: "Use shared opinion or common opinion. Unanimous opinion is much less natural.",
      },
      {
        word: "consensus",
        isCorrect: false,
        note: "Consensus already means general agreement, so unanimous consensus is usually redundant.",
      },
      {
        word: "idea",
        isCorrect: false,
        note: "Use shared idea, common idea, or popular idea. Unanimous normally describes agreement, decisions, or votes.",
      },
    ],
  },
  {
    itemId: "coll-prec-frantic-001",
    prompt: "frantic",
    level: "c1",
    topic: "daily-life",
    secondaryTopics: ["work"],
    pattern: "adjective + noun",
    question: "Which words form natural collocations with frantic?",
    options: [
      {
        word: "efforts",
        isCorrect: true,
        collocation: "frantic efforts",
        definition: "urgent, energetic attempts to do something",
        example: "Rescue workers made frantic efforts to reach the trapped miners.",
        note: "Often used when people are under pressure.",
      },
      {
        word: "search",
        isCorrect: true,
        collocation: "frantic search",
        definition: "an urgent and worried search",
        example: "Police launched a frantic search for the missing child.",
        note: "Common in news and emergency contexts.",
      },
      {
        word: "activity",
        isCorrect: true,
        collocation: "frantic activity",
        definition: "a lot of fast, busy activity",
        example: "The office was a scene of frantic activity just before the deadline.",
        note: "Useful for describing busy workplaces or stressful situations.",
      },
      {
        word: "work",
        isCorrect: false,
        note: "Use frantic activity or frantic efforts. Frantic work is understandable but less natural.",
      },
      {
        word: "speed",
        isCorrect: false,
        note: "Use high speed, great speed, or breakneck speed instead.",
      },
      {
        word: "hurry",
        isCorrect: false,
        note: "Use in a hurry or a frantic rush. Frantic hurry is not a natural collocation.",
      },
    ],
  },
  {
    itemId: "coll-prec-vacant-001",
    prompt: "vacant",
    level: "b2",
    topic: "work",
    secondaryTopics: ["daily-life"],
    pattern: "adjective + noun",
    question: "Which words form natural collocations with vacant?",
    options: [
      {
        word: "property",
        isCorrect: true,
        collocation: "vacant property",
        definition: "a building or place that is empty and unused",
        example: "The city council is trying to find a use for the vacant property downtown.",
        note: "Common in housing, business, and local-government contexts.",
      },
      {
        word: "post",
        isCorrect: true,
        collocation: "vacant post",
        definition: "a job or position that no one currently has",
        example: "We are currently looking for a qualified candidate to fill the vacant post.",
        note: "A formal work collocation.",
      },
      {
        word: "lot",
        isCorrect: true,
        collocation: "vacant lot",
        definition: "an empty piece of land, especially in a town or city",
        example: "The children often play football in the vacant lot behind the school.",
        note: "Especially common in American English.",
      },
      {
        word: "bicycle",
        isCorrect: false,
        note: "Vacant is used for empty land, property, rooms, posts, or positions, not for a bicycle.",
      },
      {
        word: "job",
        isCorrect: false,
        note: "Use vacant post or vacant position. A job can be available, but vacant job sounds less natural.",
      },
      {
        word: "space",
        isCorrect: false,
        note: "Use empty space, available space, or free space. Vacant space is possible in property contexts, but less useful than vacant property, post, or lot.",
      },
    ],
  },
  {
    itemId: "coll-prec-make-001",
    prompt: "make",
    level: "b1",
    topic: "work",
    pattern: "verb + noun",
    question: "Which words form natural collocations with make?",
    options: [
      {
        word: "a decision",
        isCorrect: true,
        collocation: "make a decision",
        definition: "decide something",
        example: "We need to make a decision by Friday.",
        note: "Use make when the focus is creating or reaching the decision.",
      },
      {
        word: "progress",
        isCorrect: true,
        collocation: "make progress",
        definition: "improve or move forward",
        example: "She has made good progress this month.",
        note: "Very common in study and work feedback.",
      },
      {
        word: "a mistake",
        isCorrect: true,
        collocation: "make a mistake",
        definition: "do something incorrectly",
        example: "It is normal to make mistakes when you learn.",
        note: "A core make collocation.",
      },
      {
        word: "homework",
        isCorrect: false,
        note: "Use do homework, not make homework.",
      },
      {
        word: "an exam",
        isCorrect: false,
        note: "Use take an exam or sit an exam, not make an exam.",
      },
    ],
  },
  {
    itemId: "coll-prec-take-001",
    prompt: "take",
    level: "b1",
    topic: "education",
    pattern: "verb + noun",
    question: "Which words form natural collocations with take?",
    options: [
      {
        word: "an exam",
        isCorrect: true,
        collocation: "take an exam",
        definition: "do an exam",
        example: "I am taking my Aptis exam next month.",
        note: "Sit an exam is also possible, especially in British English.",
      },
      {
        word: "notes",
        isCorrect: true,
        collocation: "take notes",
        definition: "write down important information",
        example: "Take notes while you listen to the lecture.",
        note: "A useful academic collocation.",
      },
      {
        word: "responsibility",
        isCorrect: true,
        collocation: "take responsibility",
        definition: "accept that you are responsible",
        example: "Managers should take responsibility for their decisions.",
        note: "Common in work and formal writing.",
      },
      {
        word: "a favour",
        isCorrect: false,
        note: "Use do someone a favour, not take a favour.",
      },
      {
        word: "a party",
        isCorrect: false,
        note: "Use have a party, throw a party, or organise a party.",
      },
    ],
  },
  {
    itemId: "coll-prec-strong-001",
    prompt: "strong",
    level: "b2",
    topic: "people",
    pattern: "adjective + noun",
    question: "Which words form natural collocations with strong?",
    options: [
      {
        word: "accent",
        isCorrect: true,
        collocation: "strong accent",
        definition: "an accent that is very noticeable",
        example: "He speaks English fluently but with a strong accent.",
        note: "A common people and language collocation.",
      },
      {
        word: "coffee",
        isCorrect: true,
        collocation: "strong coffee",
        definition: "coffee with a powerful taste or a lot of caffeine",
        example: "I need a strong coffee before work.",
        note: "Do not usually say powerful coffee.",
      },
      {
        word: "criticism",
        isCorrect: true,
        collocation: "strong criticism",
        definition: "criticism expressed forcefully",
        example: "The proposal received strong criticism from local residents.",
        note: "Useful for reports, debates, and opinion writing.",
      },
      {
        word: "influence",
        isCorrect: true,
        collocation: "strong influence",
        definition: "a powerful effect on someone or something",
        example: "Her first teacher had a strong influence on her career.",
        note: "A common collocation for people, culture, and ideas.",
      },
      {
        word: "traffic",
        isCorrect: false,
        note: "Use heavy traffic, not strong traffic.",
      },
      {
        word: "chair",
        isCorrect: false,
        note: "Strong chair is not a natural collocation.",
      },
      {
        word: "window",
        isCorrect: false,
        note: "Strong window is not a natural collocation.",
      },
      {
        word: "bottle",
        isCorrect: false,
        note: "Strong bottle is not a natural collocation.",
      },
    ],
  },
  {
    itemId: "coll-prec-deep-001",
    prompt: "deep",
    level: "b2",
    topic: "feelings",
    pattern: "adjective + noun",
    question: "Which words form natural collocations with deep?",
    options: [
      {
        word: "sleep",
        isCorrect: true,
        collocation: "deep sleep",
        definition: "a state of sleeping very soundly",
        example: "Noise outside woke me from a deep sleep.",
        note: "A common everyday collocation.",
      },
      {
        word: "trouble",
        isCorrect: true,
        collocation: "deep trouble",
        definition: "a serious or difficult situation, often because someone has done something wrong.",
        example: "If we miss the final deadline, the whole team will be in deep trouble.",
        note: "A common fixed phrase, often used as in deep trouble.",
      },
      {
        word: "thought",
        isCorrect: true,
        collocation: "deep thought",
        definition: "serious or careful thinking",
        example: "She sat in deep thought before answering the question.",
        note: "Useful for describing concentration or reflection.",
      },
      {
        word: "pockets",
        isCorrect: true,
        collocation: "deep pockets",
        definition: "a lot of money or financial resources",
        example: "The project needs an investor with deep pockets.",
        note: "Often used idiomatically in business and finance.",
      },
      {
        word: "rain",
        isCorrect: false,
        note: "Use heavy rain, not deep rain.",
      },
      {
        word: "noise",
        isCorrect: false,
        note: "Use loud noise or background noise, not deep noise in this sense.",
      },
      {
        word: "depression",
        isCorrect: false,
        note: "Deep depression is possible, but this set is focusing on more reusable everyday collocations.",
      },
    ],
  },
  {
    itemId: "coll-prec-raise-001",
    prompt: "raise",
    level: "b2",
    topic: "work",
    pattern: "verb + noun",
    question: "Which words form natural collocations with raise?",
    options: [
      {
        word: "money",
        isCorrect: true,
        collocation: "raise money",
        definition: "collect money for a purpose",
        example: "The students raised money for a local charity.",
        note: "Often used for charities, campaigns, and projects.",
      },
      {
        word: "awareness",
        isCorrect: true,
        collocation: "raise awareness",
        definition: "make more people know about an issue",
        example: "The campaign aims to raise awareness of online safety.",
        note: "Very common in formal writing.",
      },
      {
        word: "a question",
        isCorrect: true,
        collocation: "raise a question",
        definition: "mention a question or issue",
        example: "The report raises an important question about fairness.",
        note: "Also raise an issue or raise concerns.",
      },
      {
        word: "a party",
        isCorrect: false,
        note: "Use throw a party, have a party, or organise a party.",
      },
      {
        word: "a mistake",
        isCorrect: false,
        note: "Use make a mistake.",
      },
    ],
  },
  {
    itemId: "coll-prec-commit-001",
    prompt: "commit",
    level: "c1",
    topic: "society",
    pattern: "verb + noun",
    question: "Which words form natural collocations with commit?",
    options: [
      {
        word: "a crime",
        isCorrect: true,
        collocation: "commit a crime",
        definition: "do something illegal",
        example: "People who commit serious crimes should face consequences.",
        note: "A standard legal collocation.",
      },
      {
        word: "an offence",
        isCorrect: true,
        collocation: "commit an offence",
        definition: "break a law or rule",
        example: "Drivers who commit an offence may have to pay a fine.",
        note: "More formal and legal than do something wrong.",
      },
      {
        word: "resources",
        isCorrect: true,
        collocation: "commit resources",
        definition: "promise or use resources for a purpose",
        example: "The council committed more resources to public transport.",
        note: "Common in formal work and policy contexts.",
      },
      {
        word: "homework",
        isCorrect: false,
        note: "Use do homework.",
      },
      {
        word: "a decision",
        isCorrect: false,
        note: "Use make a decision. Commit to a decision is possible, but commit a decision is not.",
      },
    ],
  },
  ...VERB_NOUN_BATCH_1,
  ...VERB_NOUN_BATCH_2,
  ...VERB_NOUN_BATCH_3,
  ...VERB_NOUN_EASY_BATCH,
  ...VERB_NOUN_BATCH_4,
  ...VERB_NOUN_BATCH_5,
  ...VERB_NOUN_BATCH_GET,
  ...ADJECTIVE_NOUN_BATCH,
  ...ADJECTIVE_NOUN_BATCH_2,
  ...NOUN_NOUN_BATCH,
  ...NOUN_NOUN_BATCH_2,
  ...NOUN_NOUN_BATCH_3,
];

const DEFAULTS = {
  status: "approved",
};

const collocationPrecisionItems = RAW_ITEMS.map((item) => ({
  ...DEFAULTS,
  ...item,
}));

export default collocationPrecisionItems;
