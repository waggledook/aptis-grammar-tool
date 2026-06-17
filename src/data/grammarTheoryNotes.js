export const grammarTheoryNotes = {
  Adverbs: {
    title: "Adverbs",
    subtitle: "Form, position and common mistakes",
    intro:
      "Adverbs give extra information about how, when, where, how often or to what degree something happens.",
    examples: [
      "She spoke quietly.",
      "I often work from home.",
      "They will probably arrive late.",
      "The children played upstairs.",
    ],
    focus:
      "This guide focuses on adverb formation, word order, degree, easily confused forms and advanced inversion.",
    sections: [
      {
        title: "Adjectives or adverbs?",
        body: [
          "An adjective describes a noun. An adverb usually describes a verb.",
          "Many adverbs are formed by adding -ly.",
        ],
        examples: [
          { label: "Adjective", text: "She has a beautiful voice." },
          { label: "Adverb", text: "She sings beautifully." },
          { label: "Adjective", text: "He is a good speaker." },
          { label: "Adverb", text: "He speaks English well." },
        ],
        table: {
          headers: ["Adjective", "Adverb"],
          rows: [
            ["quiet", "quietly"],
            ["careful", "carefully"],
            ["beautiful", "beautifully"],
            ["happy", "happily"],
          ],
        },
        note: "Good is an adjective, but its usual adverb is well. Some words have the same adjective and adverb form: fast, hard and high.",
      },
      {
        title: "Adverbs of frequency",
        body: [
          "Always, usually, often, sometimes, rarely and never tell us how frequently something happens.",
          "They normally go before most main verbs, after be, and after the first auxiliary or modal verb.",
        ],
        examples: [
          { label: "Before main verb", text: "She often does her homework in the library." },
          { label: "After be", text: "I am often late for work." },
          { label: "After auxiliary", text: "I have never seen that film." },
          { label: "After modal", text: "She can hardly understand him." },
        ],
      },
      {
        title: "Adverbs of certainty",
        body: [
          "Probably, definitely, certainly and possibly show how certain the speaker is.",
          "In affirmative sentences, they normally come after an auxiliary verb. With be, they normally come after be.",
          "Probably usually comes before a negative auxiliary.",
        ],
        examples: [
          { label: "Affirmative", text: "I will probably be able to finish." },
          { label: "With be", text: "He is definitely the best candidate." },
          { label: "Negative", text: "They probably won't go on holiday." },
        ],
        avoid: "They won't probably go.",
      },
      {
        title: "Adverbs of manner",
        body: [
          "Adverbs of manner describe how an action is performed: carefully, slowly, happily, quietly, clearly.",
          "They usually come after the verb or after the object.",
          "Do not normally place the adverb between a verb and its object.",
        ],
        examples: [
          { label: "No object", text: "The baby is sleeping quietly." },
          { label: "No object", text: "She sang beautifully." },
          { label: "With object", text: "He speaks English very well." },
          { label: "With object", text: "Please write your name clearly." },
        ],
        avoid: "He speaks well English.",
      },
      {
        title: "Manner, place and time",
        body: [
          "When several adverbial expressions appear together, the usual order is manner, place, time.",
          "This is a useful general rule, although English word order can change for emphasis.",
        ],
        examples: [
          {
            label: "Order",
            text: "The children played happily upstairs all afternoon.",
          },
          {
            label: "Order",
            text: "She worked quietly in the library yesterday evening.",
          },
        ],
        chips: ["happily = manner", "upstairs = place", "all afternoon = time"],
      },
      {
        title: "Very, too and enough",
        body: [
          "Very makes an adjective or adverb stronger. It does not necessarily suggest a problem.",
          "Too means more than is acceptable, necessary or safe. It often suggests a negative consequence.",
          "Enough comes after an adjective or adverb.",
        ],
        examples: [
          { label: "Very", text: "He drives very fast." },
          { label: "Too", text: "He drives too fast for these narrow roads." },
          { label: "Enough", text: "She didn't speak clearly enough." },
        ],
        compare: ["He is very old.", "He is too old to compete.", "He is old enough to compete."],
      },
      {
        title: "Easily confused adverbs",
        body: [
          "Hard means with a lot of effort or force. Hardly means almost not.",
          "High usually refers to physical position. Highly is more abstract and often means very or to a great degree.",
        ],
        examples: [
          { label: "Hard", text: "She works hard during the week." },
          { label: "Hardly", text: "I can hardly hear you." },
          { label: "High", text: "The birds were flying high above the lake." },
          { label: "Highly", text: "She is a highly respected scientist." },
        ],
        note: "He works hard means he makes a lot of effort. He hardly works means he does almost no work.",
      },
      {
        title: "Advanced structures: inversion",
        body: [
          "Some negative or limiting adverbs can be placed at the beginning of a sentence for emphasis.",
          "This causes inversion: the auxiliary verb comes before the subject.",
        ],
        examples: [
          {
            label: "No sooner ... than",
            text: "No sooner had we started lunch than the doorbell rang.",
          },
          {
            label: "Hardly ... when",
            text: "Hardly had we started lunch when the doorbell rang.",
          },
        ],
        chips: [
          "No sooner + auxiliary + subject + verb + than",
          "Hardly + auxiliary + subject + verb + when",
        ],
      },
    ],
    checklist: [
      "Am I describing a noun or a verb?",
      "Is this frequency, manner, certainty, place, time or degree?",
      "Does it go before the main verb, after be, or after an auxiliary?",
      "Is there an object that must stay directly after the verb?",
      "Am I confusing hard/hardly, high/highly or good/well?",
    ],
  },
  Articles: {
    title: "Articles",
    subtitle: "A, an, the or no article?",
    intro:
      "English has three main article choices: a/an for one non-specific thing, the for a particular or identifiable thing, and no article for general ideas, plural nouns, uncountable nouns and many names.",
    examples: [
      "I saw an elephant at the zoo.",
      "We stayed in a hotel near the centre.",
      "She gave me the book you recommended.",
      "Spanish people often eat dinner quite late.",
    ],
    focus:
      "This guide focuses on choosing between a, an, the and no article according to meaning, context and noun type.",
    sections: [
      {
        title: "Singular countable nouns",
        body: [
          "A singular countable noun cannot normally appear alone.",
          "It usually needs an article, a possessive, or another determiner before it.",
        ],
        examples: [
          { label: "Article", text: "I bought a book." },
          { label: "Specific", text: "I bought the book you recommended." },
          { label: "Possessive", text: "I bought my book." },
          { label: "Fixed phrase", text: "Would you like a cup of tea?" },
        ],
        note: "This is one of the most important article rules in English.",
      },
      {
        title: "A or an?",
        body: [
          "Use a/an with a singular countable noun when it is not yet specific or has not been mentioned before.",
          "The choice depends on the sound, not simply the first letter.",
        ],
        examples: [
          { label: "A", text: "a hotel / a book / a university" },
          { label: "A", text: "a European country" },
          { label: "An", text: "an apple / an elephant / an engineer" },
          { label: "An", text: "an hour" },
        ],
        note: "A university begins with a /j/ sound. An hour takes an because the h is silent.",
      },
      {
        title: "Jobs and roles",
        body: [
          "We normally use a/an when describing someone's profession or role.",
          "Use the only when referring to a particular person whose role identifies them.",
        ],
        examples: [
          { label: "Profession", text: "She is a teacher." },
          { label: "Profession", text: "He works as an engineer." },
          { label: "Specific role", text: "She is the manager of this branch." },
          { label: "Specific role", text: "He is the engineer responsible for the project." },
        ],
      },
      {
        title: "First and later mention",
        body: [
          "We often use a/an when introducing something for the first time.",
          "We then use the because the listener now knows which thing we mean.",
        ],
        examples: [
          { label: "First", text: "We stayed in a hotel near the centre." },
          { label: "Later", text: "The hotel had a wonderful restaurant." },
          { label: "First", text: "I bought a book yesterday." },
          { label: "Later", text: "The book is about climate change." },
        ],
        chips: ["a/an = one, but not a particular known one", "the = the particular one we can identify"],
      },
      {
        title: "When do we use the?",
        body: [
          "Use the when the noun is specific or identifiable.",
          "The noun may be previously mentioned, defined by extra information, clear from the situation, or unique in context.",
        ],
        examples: [
          { label: "Mentioned", text: "I saw a dog outside. The dog was wearing a red collar." },
          { label: "Defined", text: "He gave me the book you recommended." },
          { label: "Situation", text: "Could you close the door?" },
          { label: "Unique", text: "The moon looked especially bright last night." },
        ],
      },
      {
        title: "No article for general meaning",
        body: [
          "We normally use no article with plural countable nouns when speaking generally.",
          "We also normally use no article with uncountable nouns when speaking generally.",
        ],
        examples: [
          { label: "Plural general", text: "Books can be expensive." },
          { label: "Plural general", text: "Spanish people are generally very sociable." },
          { label: "Uncountable", text: "Money cannot buy happiness." },
          { label: "Uncountable", text: "Education is extremely important." },
        ],
        compare: [
          "Spanish people often eat dinner late.",
          "The Spanish people in my class come from several different cities.",
          "Education is important.",
          "The education she received was excellent.",
        ],
      },
      {
        title: "Nationality groups",
        body: [
          "Nationalities ending in -an, -ian or similar can usually be plural nouns with no article for neutral generalisations.",
          "Nationalities ending in -ish, -sh, -ch or -ese normally use the + nationality adjective to refer to the people as a group.",
        ],
        examples: [
          { label: "Plural noun", text: "Americans tend to value individualism." },
          { label: "Plural noun", text: "Germans are known for their efficiency." },
          { label: "Group", text: "The Spanish have a strong tradition of family gatherings." },
          { label: "Alternative", text: "Spanish people have a strong tradition of family gatherings." },
        ],
        note: "Say a Spanish person or a Spaniard, not a Spanish.",
      },
      {
        title: "The + adjective",
        body: [
          "We can use the + adjective to refer to a whole group of people who share a characteristic.",
          "These expressions have a plural meaning.",
        ],
        examples: [
          { label: "Group", text: "The rich often invest in property." },
          { label: "Group", text: "The charity provides support for the elderly." },
          { label: "Agreement", text: "The elderly are particularly vulnerable." },
        ],
        note: "In many contexts, expressions such as elderly people or people experiencing homelessness may sound more neutral and respectful.",
      },
      {
        title: "Institutions",
        body: [
          "School, university, prison and hospital can be used without an article when we are thinking about their normal purpose.",
          "Use the when referring to the building or a particular institution.",
        ],
        examples: [
          { label: "Purpose", text: "She is at university." },
          { label: "Purpose", text: "He was sent to prison." },
          { label: "Building", text: "I went to the university to meet a professor." },
          { label: "Building", text: "We drove past the prison." },
        ],
        note: "These forms vary between British and American English. British English commonly uses at university and in hospital.",
      },
      {
        title: "Geographical names",
        body: [
          "Most countries, continents, cities, individual mountains and lakes usually have no article.",
          "Plural country names, political descriptions, rivers, seas, oceans, mountain ranges and deserts usually use the.",
        ],
        examples: [
          { label: "No article", text: "We spent a week travelling around Spain." },
          { label: "No article", text: "Lake Como is in northern Italy." },
          { label: "The", text: "Many tourists visit the Alps in winter." },
          { label: "The", text: "The Amazon is one of the world's longest rivers." },
        ],
        chips: ["Spain", "Europe", "Madrid", "Mount Fuji", "Lake Como", "the United States", "the Nile", "the Sahara"],
      },
      {
        title: "Regions and fixed expressions",
        body: [
          "Use the in expressions such as the north of Spain, the east of London and the west of the country.",
          "Do not normally use an article when the direction forms part of a place description before the name.",
          "Some expressions normally contain a/an and should be learnt as complete phrases.",
        ],
        examples: [
          { label: "Region", text: "Lake Como is in the north of Italy." },
          { label: "Description", text: "We spent a week hiking in northern Spain." },
          { label: "Expression", text: "After dinner, we went for a walk along the river." },
        ],
        chips: ["go for a walk", "have a rest", "take a break", "have a shower", "make a mistake", "have a good time"],
      },
    ],
    checklist: [
      "Is the noun singular and countable?",
      "Am I mentioning it for the first time?",
      "Does the listener know exactly which one I mean?",
      "Am I talking about something in general?",
      "Is it a geographical name with a special article rule?",
      "Is it part of a fixed expression?",
      "Am I describing an institution's normal purpose or its physical building?",
    ],
  },
  "Comparatives and Superlatives": {
    title: "Comparatives and superlatives",
    subtitle: "Comparing two things, whole groups and degrees of difference",
    intro:
      "We use comparative forms to compare two people, things or situations. We use superlative forms to compare one person or thing with the whole group.",
    examples: [
      "My phone is more expensive than yours.",
      "This test is easier than the last one.",
      "It is the most expensive phone in the shop.",
      "She was the fastest runner in the race.",
    ],
    focus:
      "This guide focuses on adjective form, than, the with superlatives, equality, modifiers and advanced comparison structures.",
    sections: [
      {
        title: "Short adjectives",
        body: [
          "With most one-syllable adjectives, add -er for the comparative and -est for the superlative.",
          "Some spelling changes are needed with adjectives ending in -e, short vowel + consonant, and consonant + y.",
        ],
        examples: [
          { label: "Comparative", text: "This phone is cheaper than mine." },
          { label: "Superlative", text: "She is the tallest person in her family." },
          { label: "Ending -e", text: "nice -> nicer -> the nicest" },
          { label: "Double consonant", text: "big -> bigger -> the biggest" },
          { label: "Y to i", text: "happy -> happier -> the happiest" },
        ],
        table: {
          headers: ["Adjective", "Comparative", "Superlative"],
          rows: [
            ["fast", "faster", "the fastest"],
            ["cheap", "cheaper", "the cheapest"],
            ["old", "older", "the oldest"],
            ["tall", "taller", "the tallest"],
          ],
        },
      },
      {
        title: "Longer adjectives",
        body: [
          "With most adjectives of two or more syllables, use more + adjective and the most + adjective.",
          "Some two-syllable adjectives can use either form. Others, especially those ending in -y, normally take -er/-est.",
        ],
        examples: [
          { label: "Comparative", text: "My phone is more expensive than yours." },
          { label: "Superlative", text: "This was the most terrifying experience I have ever had." },
          { label: "Either", text: "cleverer / more clever" },
          { label: "Usually -er", text: "happier / easier / busier" },
        ],
        table: {
          headers: ["Adjective", "Comparative", "Superlative"],
          rows: [
            ["expensive", "more expensive", "the most expensive"],
            ["difficult", "more difficult", "the most difficult"],
            ["interesting", "more interesting", "the most interesting"],
            ["terrifying", "more terrifying", "the most terrifying"],
          ],
        },
      },
      {
        title: "Irregular forms",
        body: ["Some common adjectives do not follow the normal rules."],
        examples: [
          { label: "Good", text: "This version is better than the original." },
          { label: "Bad", text: "That was the worst meal I have ever had." },
          { label: "Little", text: "The new system uses less energy than the old one." },
        ],
        table: {
          headers: ["Adjective", "Comparative", "Superlative"],
          rows: [
            ["good", "better", "the best"],
            ["bad", "worse", "the worst"],
            ["far", "farther/further", "the farthest/furthest"],
            ["little", "less", "the least"],
            ["much/many", "more", "the most"],
          ],
        },
      },
      {
        title: "Comparatives with than",
        body: [
          "Comparative adjectives are commonly followed by than.",
          "Do not use a superlative when comparing two things.",
          "The second thing can sometimes be understood without being mentioned.",
        ],
        examples: [
          { label: "Than", text: "This test is more difficult than the previous one." },
          { label: "Than", text: "My car is faster than yours." },
          { label: "Understood", text: "The new model is much faster." },
          { label: "Understood", text: "Could you speak more slowly?" },
        ],
        avoid: "This phone is the cheapest than mine.",
      },
      {
        title: "Superlatives",
        body: [
          "Use the + adjective-est or the most + adjective.",
          "We normally use the before a superlative adjective.",
          "Use in with places and organisations. Use of before a plural group or period.",
        ],
        examples: [
          { label: "Superlative", text: "She was the fastest runner." },
          { label: "Superlative", text: "It is the most expensive restaurant in town." },
          { label: "In", text: "the tallest building in the city" },
          { label: "Of", text: "the coldest day of the year" },
        ],
      },
      {
        title: "Superlatives with ever",
        body: [
          "We often use a superlative with the present perfect and ever to describe an experience up to now.",
          "Use a superlative here, not a comparative.",
        ],
        examples: [
          { label: "Experience", text: "It is the most terrifying experience I have ever had." },
          { label: "Experience", text: "She is the best teacher I have ever studied with." },
          { label: "Experience", text: "That was the worst film I have ever seen." },
        ],
      },
      {
        title: "As ... as",
        body: [
          "Use as + adjective + as to say that two things are equal or similar.",
          "Use the normal adjective, not the comparative.",
          "Use just as ... as to emphasise that there is no important difference.",
        ],
        examples: [
          { label: "Equality", text: "He is as tall as his brother." },
          { label: "Equality", text: "This exercise is as difficult as the last one." },
          { label: "Adjective", text: "as good as / as expensive as / as fast as" },
          { label: "Emphasis", text: "The second exam was just as difficult as the first." },
        ],
        avoid: "as better as",
      },
      {
        title: "Negative comparisons",
        body: [
          "Use not as ... as when one thing has less of a quality than another.",
          "Not so ... as is also possible, especially in more formal English, but not as ... as is much more common in everyday English.",
        ],
        examples: [
          { label: "Negative", text: "The train wasn't as fast as I expected." },
          { label: "Negative", text: "This phone isn't as expensive as that one." },
          { label: "Formal", text: "The journey was not so difficult as we had expected." },
        ],
      },
      {
        title: "Size of the difference",
        body: [
          "Add words before comparative structures to show whether the difference is small or large.",
          "Do not normally use very before a comparative.",
        ],
        examples: [
          { label: "Small", text: "This phone is slightly cheaper than mine." },
          { label: "Small", text: "The second task was a little more difficult." },
          { label: "Large", text: "This model is much faster than the old one." },
          { label: "Large", text: "The new system is considerably more efficient." },
        ],
        chips: ["slightly", "a little", "a bit", "much", "far", "a lot", "considerably", "significantly"],
        avoid: "very better",
      },
      {
        title: "Not quite as and stronger forms",
        body: [
          "Not quite as ... as usually indicates a relatively small difference.",
          "Not nearly as ... as indicates a large difference.",
          "Nowhere near as ... as strongly emphasises a very large difference.",
        ],
        examples: [
          { label: "Small", text: "The new version isn't quite as good as the original." },
          { label: "Large", text: "The new version is not nearly as good as the original." },
          { label: "Very large", text: "The new software is nowhere near as user-friendly as the old version." },
          { label: "Question", text: "Is the new version anywhere near as good as the original?" },
        ],
      },
      {
        title: "Less and least",
        body: [
          "Use less + adjective as the opposite of more + adjective.",
          "Use the least + adjective as the opposite of the most + adjective.",
          "We can emphasise less with words such as much and far.",
        ],
        examples: [
          { label: "Less", text: "The second exam was less difficult than the first." },
          { label: "Least", text: "This was the least difficult question." },
          { label: "Emphasis", text: "His latest book is far less interesting than his earlier work." },
        ],
      },
      {
        title: "Emphasising superlatives",
        body: [
          "Use by far to emphasise that someone or something is clearly different from the rest of the group.",
          "Easily can also emphasise a superlative.",
        ],
        examples: [
          { label: "By far", text: "She was by far the fastest runner." },
          { label: "By far", text: "This is by far the most useful feature." },
          { label: "Easily", text: "She is easily the best candidate." },
        ],
        chips: ["by far + the + superlative"],
      },
      {
        title: "The more ..., the more ...",
        body: [
          "Use the + comparative, the + comparative to show that two things change together.",
          "The first change causes or accompanies the second change.",
          "The second part can also describe a decreasing result.",
        ],
        examples: [
          { label: "Linked change", text: "The more you practise, the better you become." },
          { label: "Linked change", text: "The longer you wait, the more expensive it becomes." },
          { label: "Decrease", text: "The older I get, the less patience I have." },
          { label: "Decrease", text: "The more expensive the product is, the fewer people buy it." },
        ],
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use more with an -er comparative.",
          "Do not use a comparative after as.",
          "Remember than after many comparative structures and the before most superlatives.",
          "Use much or far, not very, before a comparative.",
        ],
        examples: [
          { label: "Correct", text: "cheaper" },
          { label: "Correct", text: "as good as" },
          { label: "Correct", text: "The new version is better than the old one." },
          { label: "Correct", text: "It is the most expensive option." },
          { label: "Correct", text: "much better / far cheaper" },
        ],
      },
    ],
    checklist: [
      "Am I comparing two things or one thing with a whole group?",
      "Does the adjective take -er/-est or more/most?",
      "Is the form irregular?",
      "Do I need than?",
      "Do I need the before a superlative?",
      "Am I expressing equality with as ... as?",
      "Do I want to show a small or large difference?",
      "Am I using an advanced structure such as the more ..., the more ...?",
    ],
  },
  Conditionals: {
    title: "Conditionals",
    subtitle: "Conditions, results and real or imagined situations",
    intro:
      "Conditional sentences describe a connection between a condition and its result.",
    examples: [
      "If it rains, we will stay at home.",
      "We will stay at home if it rains.",
      "If she had left earlier, she wouldn't have missed the bus.",
      "Unless we leave now, we will miss the beginning.",
    ],
    focus:
      "This guide focuses on the main conditional types, unless, in case, even if, formal inversion and common modal alternatives.",
    sections: [
      {
        title: "Basic clause order",
        body: [
          "A conditional sentence has a conditional clause and a result clause.",
          "The order can usually be reversed. When the if-clause comes first, we normally place a comma after it.",
        ],
        examples: [
          { label: "Condition", text: "if it rains" },
          { label: "Result", text: "we will stay at home" },
          { label: "If first", text: "If it rains, we will stay at home." },
          { label: "Result first", text: "We will stay at home if it rains." },
        ],
      },
      {
        title: "Zero conditional",
        body: [
          "Use the zero conditional for general truths, habits, routines and regular cause-effect situations.",
          "The result is generally or repeatedly true, not just one particular future occasion.",
        ],
        examples: [
          { label: "Structure", text: "If + present simple, present simple" },
          { label: "Truth", text: "If people don't drink enough water, they get dehydrated." },
          { label: "Routine", text: "If she isn't too tired, she goes to the gym." },
          { label: "When", text: "When I finish work early, I walk home." },
        ],
      },
      {
        title: "First conditional",
        body: [
          "Use the first conditional for a real or possible future situation and its likely result.",
          "Although the meaning is future, we normally use the present simple, not will, after if.",
          "The result clause can also contain a modal verb or an imperative.",
        ],
        examples: [
          { label: "Structure", text: "If + present simple, will + infinitive" },
          { label: "Likely result", text: "If it rains tomorrow, we won't have the picnic." },
          { label: "Modal", text: "If you finish early, you can leave." },
          { label: "Imperative", text: "If you feel tired, take a break." },
        ],
        avoid: "If it will rain, we will stay home.",
      },
      {
        title: "Second conditional",
        body: [
          "Use the second conditional for imaginary present situations, unlikely future possibilities and hypothetical advice.",
          "The past form does not necessarily refer to past time. It shows that the situation is imaginary or distant from reality.",
        ],
        examples: [
          { label: "Structure", text: "If + past simple, would + infinitive" },
          { label: "Imaginary", text: "If I won the lottery, I would buy a house by the sea." },
          { label: "Advice", text: "If I were you, I would speak to the manager." },
          { label: "Formal", text: "If the weather were better, we would go hiking more often." },
        ],
        note: "Were is generally the safest choice in clearly hypothetical exam sentences, especially in If I were you.",
      },
      {
        title: "Third conditional",
        body: [
          "Use the third conditional to imagine a different past.",
          "It often expresses regret, criticism, missed opportunities or an imagined past result.",
          "Do not use would have in the conditional clause.",
        ],
        examples: [
          { label: "Structure", text: "If + past perfect, would have + past participle" },
          { label: "Regret", text: "If she had left earlier, she wouldn't have missed the bus." },
          { label: "Past result", text: "They would have caught the train if they had left earlier." },
          { label: "Reality", text: "She did not leave earlier, so she missed the bus." },
        ],
        avoid: "If they would have known, they would have acted differently.",
      },
      {
        title: "Mixed conditionals",
        body: [
          "Mixed conditionals connect different time periods.",
          "The most common type describes a past event that has a present result.",
        ],
        examples: [
          { label: "Structure", text: "If + past perfect, would + infinitive" },
          { label: "Present result", text: "If I had taken that job, I would be living in New York now." },
          { label: "Present result", text: "If she had studied medicine, she would be a doctor today." },
          { label: "Past result", text: "If I hadn't skipped breakfast, I wouldn't have felt hungry during the meeting." },
        ],
      },
      {
        title: "Choosing the type",
        body: [
          "Choose the conditional form by asking whether the situation is general, future, present, past or mixed across time.",
        ],
        table: {
          headers: ["Type", "Condition", "Result", "Use"],
          rows: [
            ["Zero", "present simple", "present simple", "facts and routines"],
            ["First", "present simple", "will + infinitive", "possible future"],
            ["Second", "past simple", "would + infinitive", "unreal present/future"],
            ["Third", "past perfect", "would have + participle", "unreal past"],
            ["Mixed", "past perfect", "would + infinitive", "past condition, present result"],
          ],
        },
      },
      {
        title: "Unless",
        body: [
          "Unless means if not.",
          "We do not normally add another negative after unless.",
          "Unless can also introduce a third conditional clause.",
        ],
        examples: [
          { label: "If not", text: "Unless we leave now, we will miss the beginning." },
          { label: "Same meaning", text: "If we don't leave now, we will miss the beginning." },
          { label: "Past", text: "He wouldn't have succeeded unless someone had given him another chance." },
        ],
        avoid: "Unless you don't hurry, you will be late.",
      },
      {
        title: "Provided that and as long as",
        body: [
          "Provided that, providing that and as long as mean only if this condition is satisfied.",
          "Provided that is more formal than if. In everyday English, as long as is often more natural.",
          "Do not confuse conditional as long as with its time meaning.",
        ],
        examples: [
          { label: "Condition", text: "You can borrow the car provided that you drive carefully." },
          { label: "Everyday", text: "You can come as long as you let me know first." },
          { label: "Time", text: "We stayed there as long as we could." },
        ],
      },
      {
        title: "In case",
        body: [
          "Use in case when someone takes a precaution because something might happen.",
          "The action happens before the possible event as preparation.",
          "We normally use a present tense after in case when referring to the future.",
        ],
        examples: [
          { label: "Precaution", text: "Take a coat in case it gets cold." },
          { label: "Precaution", text: "Save the document in case the computer crashes." },
          { label: "Different", text: "Take a coat if it gets cold." },
        ],
        note: "Take a coat in case it gets cold means take it now. Take a coat if it gets cold means only take it after or when it becomes cold.",
      },
      {
        title: "Even if",
        body: [
          "Even if means that the result will not change, regardless of the condition.",
          "Even if introduces a condition. Even though introduces a fact.",
        ],
        examples: [
          { label: "Unchanged", text: "I will go for a walk even if it rains." },
          { label: "Condition", text: "I will go out even if it rains." },
          { label: "Fact", text: "I went out even though it was raining." },
        ],
      },
      {
        title: "Formal conditional inversion",
        body: [
          "In formal English, some conditional sentences can be written without if.",
          "The auxiliary verb moves before the subject.",
        ],
        examples: [
          { label: "Had", text: "Had they known the truth, they would have acted differently." },
          { label: "Structure", text: "Had + subject + past participle" },
          { label: "Were to", text: "Were she to accept the job, she would have to relocate." },
          { label: "Were", text: "Were I you, I would refuse the offer." },
        ],
      },
      {
        title: "Result clause alternatives",
        body: [
          "Although would is common in unreal conditionals, other modal verbs are possible.",
          "Could expresses ability or possibility. Might expresses a less certain result.",
        ],
        examples: [
          { label: "Could", text: "If I had more free time, I could learn another language." },
          { label: "Could have", text: "If she had left earlier, she could have caught the train." },
          { label: "Might", text: "If we moved abroad, we might miss our families." },
        ],
      },
      {
        title: "Common mistakes",
        body: [
          "Avoid will or would in the conditional clause.",
          "Use past perfect for unreal past situations.",
          "Do not add an extra negative after unless.",
          "Use in case for precautions, not simple conditions.",
        ],
        examples: [
          { label: "Correct", text: "If she arrives early, we will start immediately." },
          { label: "Correct", text: "If I had more time, I would help." },
          { label: "Correct", text: "If she had left earlier, she wouldn't have missed the bus." },
          { label: "Correct", text: "Take some water in case you get thirsty." },
        ],
      },
    ],
    checklist: [
      "Am I describing a general truth, the future, the present or the past?",
      "Is the situation real, possible, unlikely or impossible?",
      "Do the condition and result refer to the same time?",
      "Have I avoided will or would in the conditional clause?",
      "Do I need the past perfect for an unreal past situation?",
      "Does unless correctly mean if not?",
      "Am I expressing a precaution with in case?",
      "Would a formal inverted form such as Had they known be appropriate?",
    ],
  },
  "Future Forms": {
    title: "Future forms",
    subtitle: "Predictions, plans, arrangements, schedules and future viewpoints",
    intro:
      "English does not have one single future tense. We use different structures for predictions, intentions, arrangements, timetables, future progress and future completion.",
    examples: [
      "I think it will rain tomorrow.",
      "We are going to visit them next weekend.",
      "They are leaving for Paris at six.",
      "This time tomorrow, I will be flying home.",
    ],
    focus:
      "This guide focuses on choosing the future form that best matches the speaker's meaning and evidence.",
    sections: [
      {
        title: "Will",
        body: [
          "Use will + infinitive without to.",
          "After will, use the base form of the verb.",
        ],
        examples: [
          { label: "Structure", text: "will + infinitive" },
          { label: "Example", text: "I will call you later." },
          { label: "Negative", text: "They won't arrive before nine." },
          { label: "Base form", text: "will go / will arrive / will be" },
        ],
        avoid: "He will arrives soon.",
      },
      {
        title: "Predictions with will",
        body: [
          "Use will for predictions based on opinions, beliefs, expectations or general knowledge.",
          "These predictions are based mainly on what the speaker thinks, rather than clear evidence visible now.",
        ],
        examples: [
          { label: "Opinion", text: "I think it will be cold tomorrow." },
          { label: "Expectation", text: "She'll probably pass the exam." },
          { label: "Belief", text: "I'm sure you will enjoy the film." },
        ],
        chips: ["I think", "I expect", "I'm sure", "probably", "perhaps"],
      },
      {
        title: "Instant decisions, offers and promises",
        body: [
          "Use will when you decide to do something as you are speaking.",
          "Will is also common for offers, promises and requests.",
        ],
        examples: [
          { label: "Decision now", text: "The phone is ringing. I'll answer it." },
          { label: "Offer", text: "I'll carry that bag for you." },
          { label: "Promise", text: "I won't tell anyone." },
          { label: "Request", text: "Will you open the window?" },
        ],
      },
      {
        title: "Be going to",
        body: [
          "Use am/is/are going to + infinitive.",
          "Remember to include the correct form of be.",
        ],
        examples: [
          { label: "Structure", text: "am/is/are going to + infinitive" },
          { label: "Plan", text: "I am going to study tonight." },
          { label: "Plan", text: "We are going to visit them next weekend." },
          { label: "Correct", text: "She is going to leave." },
        ],
        avoid: "She going to leave.",
      },
      {
        title: "Plans and evidence with going to",
        body: [
          "Use going to for plans or intentions that existed before the moment of speaking.",
          "Use going to when there is evidence now that something will happen.",
        ],
        examples: [
          { label: "Intention", text: "I am going to start exercising more." },
          { label: "Evidence", text: "Look at those clouds! It is going to rain." },
          { label: "Evidence", text: "Be careful! You are going to drop that glass." },
          { label: "Compare", text: "I think it will rain tomorrow." },
        ],
      },
      {
        title: "Present continuous arrangements",
        body: [
          "Use the present continuous for a future arrangement that has already been organised.",
          "Arrangements often involve a specific time, place, person, booking, appointment or organised event.",
          "The present continuous normally suggests more organisation than going to.",
        ],
        examples: [
          { label: "Structure", text: "am/is/are + verb-ing" },
          { label: "Arrangement", text: "They are leaving for Paris at six tomorrow." },
          { label: "Appointment", text: "I'm seeing the dentist at 10:30." },
          { label: "Compare", text: "I'm visiting Carla at four tomorrow." },
        ],
      },
      {
        title: "Present simple schedules",
        body: [
          "Use the present simple for fixed timetables, programmes and official schedules.",
          "This is especially common for public transport, classes, films, performances and official programmes.",
        ],
        examples: [
          { label: "Timetable", text: "The train leaves at 7:15." },
          { label: "Programme", text: "The film starts at eight." },
          { label: "Schedule", text: "Our flight arrives at Terminal 2." },
          { label: "Compare", text: "We are leaving at six." },
        ],
      },
      {
        title: "Future time clauses",
        body: [
          "After words such as when, as soon as, before, after, until, once, by the time and if, we normally use a present tense to refer to the future.",
          "Do not normally use will in the time clause. The other clause can still contain will.",
        ],
        examples: [
          { label: "Time clause", text: "I will tell you as soon as I get the results." },
          { label: "Time clause", text: "Call me when you arrive." },
          { label: "Time clause", text: "We won't leave until everyone is ready." },
          { label: "Main clause", text: "As soon as I get the results, I will tell you." },
        ],
        avoid: "I'll tell you as soon as I will get the results.",
      },
      {
        title: "Future continuous",
        body: [
          "Use will be + verb-ing for an action that will be in progress at a particular future time.",
          "It can also describe something expected to happen as part of the normal course of events, often sounding less direct or more polite.",
        ],
        examples: [
          { label: "Structure", text: "will be + verb-ing" },
          { label: "In progress", text: "I will be working at six." },
          { label: "In progress", text: "This time next week, we will be lying on the beach." },
          { label: "Expected plan", text: "Will you be using the car this evening?" },
        ],
      },
      {
        title: "Future perfect",
        body: [
          "Use will have + past participle for an action that will be complete before a particular future time.",
          "It is especially common with by, by then, by Friday, by the end of the year, by the time and before.",
          "By means no later than. Until describes a continuing situation up to that time.",
        ],
        examples: [
          { label: "Structure", text: "will have + past participle" },
          { label: "Complete before", text: "I will have finished by six." },
          { label: "Complete before", text: "By the time you get home, I will have cooked dinner." },
          { label: "Until", text: "I will be working on it until Friday." },
        ],
      },
      {
        title: "Future continuous or perfect?",
        body: [
          "Use the future continuous for an action in progress at a future point.",
          "Use the future perfect for an action completed before a future point.",
        ],
        examples: [
          { label: "Progress", text: "At eight, she will be giving her presentation." },
          { label: "Complete", text: "By eight, she will have finished her presentation." },
          { label: "Progress", text: "This time tomorrow, we will be travelling home." },
          { label: "Complete", text: "By this time tomorrow, we will have arrived home." },
        ],
      },
      {
        title: "Formal future forms",
        body: [
          "Be to + infinitive is used in formal announcements, official plans and news reports.",
          "Be due to + infinitive describes something expected or scheduled at a particular time.",
          "Be set to + infinitive means that something is expected, prepared or likely to happen.",
        ],
        examples: [
          { label: "Be to", text: "The President is to issue a formal apology." },
          { label: "Be due to", text: "The flight is due to leave at 8:15." },
          { label: "Be set to", text: "Prices are set to rise again." },
          { label: "Instruction", text: "Visitors are to report to reception." },
        ],
      },
      {
        title: "Immediate future",
        body: [
          "Use be about to + infinitive for something that will happen very soon.",
          "Use be on the point of + verb-ing with a similar meaning.",
          "Because these forms mean imminent, they do not usually combine naturally with distant future times.",
        ],
        examples: [
          { label: "About to", text: "The film is about to start." },
          { label: "About to", text: "I am about to leave." },
          { label: "On the point of", text: "I am on the point of leaving." },
          { label: "Pattern", text: "about to leave / on the point of leaving" },
        ],
      },
      {
        title: "Future in the past",
        body: [
          "Sometimes we describe a future event from a point in the past.",
          "Use was/were going to for a past intention or plan, would for a future event viewed from the past, was/were about to for immediate future in the past, and was/were due to for a past schedule or expectation.",
        ],
        examples: [
          { label: "Past plan", text: "I was going to call you, but I forgot." },
          { label: "Past viewpoint", text: "She knew she would regret the decision." },
          { label: "Immediate", text: "I was about to leave when the phone rang." },
          { label: "Schedule", text: "The flight was due to leave at six, but it was delayed." },
        ],
      },
      {
        title: "Quick comparison",
        body: ["Choose the form according to the meaning you need."],
        table: {
          headers: ["Form", "Main use", "Example"],
          rows: [
            ["will", "opinion, instant decision, promise", "I think it will work."],
            ["going to", "intention or present evidence", "It is going to rain."],
            ["present continuous", "personal arrangement", "We are meeting at six."],
            ["present simple", "schedule or timetable", "The train leaves at six."],
            ["future continuous", "future progress", "I will be working at six."],
            ["future perfect", "completion before future time", "I will have finished by six."],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Remember be with going to and future continuous forms.",
          "Do not add -s after will.",
          "Do not use will in future time clauses.",
          "Choose future continuous for progress and future perfect for completion.",
        ],
        examples: [
          { label: "Correct", text: "We are going to visit them." },
          { label: "Correct", text: "She will be working." },
          { label: "Correct", text: "He will arrive soon." },
          { label: "Correct", text: "I'll call you when I arrive." },
        ],
      },
    ],
    checklist: [
      "Is this a prediction, plan, arrangement or timetable?",
      "Is the prediction based on opinion or present evidence?",
      "Was the decision made before or at the moment of speaking?",
      "Will the action be in progress at a particular future time?",
      "Will it be complete before that time?",
      "Is this a formal announcement or scheduled event?",
      "Does the time clause require a present tense rather than will?",
      "Am I describing the future from a past viewpoint?",
    ],
  },
  "Gerunds and Infinitives": {
    title: "Gerunds and infinitives",
    subtitle: "Verb patterns after other verbs, expressions and prepositions",
    intro:
      "When one verb follows another, the second verb can take the gerund, the to-infinitive or the bare infinitive.",
    examples: [
      "She enjoys hiking.",
      "He promised to call.",
      "You had better leave.",
      "He left without saying goodbye.",
    ],
    focus:
      "This guide focuses on common verb patterns, verbs with changing meanings, bare infinitives, passive forms and gerunds after prepositions.",
    sections: [
      {
        title: "The main forms",
        body: [
          "The correct form often depends on the first verb or expression.",
          "There is no single rule that works for every verb, so learn common verbs together with their patterns.",
        ],
        examples: [
          { label: "Gerund", text: "verb-ing: She enjoys hiking." },
          { label: "To-infinitive", text: "to + base verb: He promised to call." },
          { label: "Bare infinitive", text: "base verb without to: You had better leave." },
        ],
      },
      {
        title: "The gerund",
        body: [
          "The gerund is the -ing form of a verb used in a noun-like way.",
          "It can be the subject of a sentence, the object of a verb, or used after a preposition.",
        ],
        examples: [
          { label: "Subject", text: "Learning a language takes time." },
          { label: "Object", text: "She enjoys reading." },
          { label: "After preposition", text: "He left without saying goodbye." },
          { label: "After preposition", text: "She is interested in learning Japanese." },
        ],
      },
      {
        title: "Verbs followed by a gerund",
        body: [
          "Some verbs are normally followed by verb-ing.",
          "Common examples include enjoy, avoid, admit, deny, mind, suggest, recommend, consider, finish, imagine, practise and risk.",
        ],
        examples: [
          { label: "Enjoy", text: "She enjoys walking in the mountains." },
          { label: "Avoid", text: "He avoided speaking about the argument." },
          { label: "Admit", text: "They admitted making a mistake." },
          { label: "Recommend", text: "The therapist recommended keeping a journal." },
        ],
        avoid: "She enjoys to walk.",
      },
      {
        title: "Suggest and recommend",
        body: [
          "Use a gerund after suggest and recommend when proposing an activity.",
          "Another possible structure is suggest/recommend + that + subject + verb.",
          "In British English, the verb may also appear with should.",
        ],
        examples: [
          { label: "Gerund", text: "I suggest taking the train." },
          { label: "Gerund", text: "She recommended booking in advance." },
          { label: "That-clause", text: "I suggest that we take the train." },
          { label: "Should", text: "I suggest that we should take the train." },
        ],
        note: "Say I recommend taking the course or I recommend that you take the course.",
      },
      {
        title: "The to-infinitive",
        body: [
          "The to-infinitive consists of to + base form of the verb.",
          "Some verbs are normally followed by the to-infinitive, including agree, afford, decide, expect, hope, manage, offer, plan, promise, refuse, seem and want.",
        ],
        examples: [
          { label: "Promise", text: "He promised to call me." },
          { label: "Decide", text: "We decided to postpone the meeting." },
          { label: "Afford", text: "I can't afford to buy a new phone." },
          { label: "Manage", text: "She managed to finish the report." },
        ],
        avoid: "We decided postponing the meeting.",
      },
      {
        title: "Verb + object + to-infinitive",
        body: [
          "Some verbs are followed by an object and then a to-infinitive.",
          "Common examples include advise, allow, ask, encourage, expect, forbid, invite, order, persuade, remind, tell and want.",
          "In the passive, the person becomes the subject.",
        ],
        examples: [
          { label: "Pattern", text: "verb + person + to do something" },
          { label: "Active", text: "She reminded me to call the bank." },
          { label: "Active", text: "The teacher encouraged the students to speak more." },
          { label: "Passive", text: "They were allowed to leave early." },
        ],
        note: "Forbid can be used as forbid + activity or forbid + person + to-infinitive: The school forbids smoking / The school forbids students to smoke.",
      },
      {
        title: "Bare infinitive",
        body: [
          "The bare infinitive is the base form of the verb without to.",
          "Use it after modal verbs and after had better.",
          "Despite its past form, had better normally refers to the present or future.",
        ],
        examples: [
          { label: "Modal", text: "You should consult your manager." },
          { label: "Modal", text: "She can speak three languages." },
          { label: "Had better", text: "You had better consult your boss." },
          { label: "Had better", text: "We had better leave now." },
        ],
        avoid: "You had better to leave.",
      },
      {
        title: "Let and make",
        body: [
          "Use let + person + bare infinitive.",
          "Use make + person + bare infinitive.",
          "In the passive, make takes the to-infinitive.",
        ],
        examples: [
          { label: "Let", text: "They let us enter the venue early." },
          { label: "Make", text: "The teacher made us rewrite the essay." },
          { label: "Passive make", text: "We were made to rewrite the essay." },
          { label: "Compare", text: "They made us wait. / We were made to wait." },
        ],
      },
      {
        title: "After prepositions",
        body: [
          "When a verb follows a preposition, it normally takes the gerund.",
          "This also applies when to is a preposition rather than part of an infinitive.",
        ],
        examples: [
          { label: "Preposition", text: "She is interested in studying abroad." },
          { label: "Preposition", text: "He left without speaking to anyone." },
          { label: "To as preposition", text: "I look forward to hearing from you." },
          { label: "To as preposition", text: "She is used to working long hours." },
        ],
        avoid: "I look forward to hear from you.",
      },
      {
        title: "Passive gerunds",
        body: [
          "A gerund can also have a passive form: being + past participle.",
          "Use it when the person or thing receives the action.",
        ],
        examples: [
          { label: "Structure", text: "being + past participle" },
          { label: "Passive", text: "We managed to avoid being caught by the cameras." },
          { label: "Passive", text: "She dislikes being told what to do." },
          { label: "Compare", text: "He avoided photographing the building. / He avoided being photographed." },
        ],
      },
      {
        title: "After ordinals and superlatives",
        body: [
          "Use the to-infinitive after expressions such as the first, the second, the next, the last, the only and the best.",
          "The infinitive describes what made that person or thing first, last, best or unique.",
        ],
        examples: [
          { label: "First", text: "She was the first person to try the software." },
          { label: "Last", text: "He was the last student to arrive." },
          { label: "Best", text: "This is the best place to eat nearby." },
          { label: "Only", text: "She was the only person to notice the mistake." },
        ],
      },
      {
        title: "Meaning changes",
        body: [
          "Some verbs can be followed by either a gerund or an infinitive, but the meaning changes.",
          "These differences are particularly important in exam questions.",
        ],
        examples: [
          { label: "Stop doing", text: "They stopped talking when the teacher entered." },
          { label: "Stop to do", text: "We stopped to have a coffee." },
          { label: "Remember to do", text: "Remember to lock the door." },
          { label: "Remember doing", text: "I remember locking the door." },
        ],
      },
      {
        title: "More meaning changes",
        body: [
          "Regret doing means feeling sorry about a past action. Regret to do is used when giving bad news.",
          "Go on doing means continue the same activity. Go on to do means finish one activity and start a different one.",
          "Try to do means make an effort. Try doing means test a possible solution.",
        ],
        examples: [
          { label: "Regret doing", text: "I regret saying that." },
          { label: "Regret to do", text: "I regret to inform you that your application was unsuccessful." },
          { label: "Go on", text: "He described the problem and went on to explain the solution." },
          { label: "Try", text: "If you can't sleep, try drinking less coffee." },
        ],
      },
      {
        title: "Person before a gerund",
        body: [
          "A gerund can be preceded by a person.",
          "Possessive forms are also possible, particularly in more formal English.",
          "In everyday English, the object form is very common.",
        ],
        examples: [
          { label: "Object form", text: "I don't mind you arriving late." },
          { label: "Object form", text: "She disliked him interrupting her." },
          { label: "Possessive", text: "I don't mind your arriving late." },
          { label: "Possessive", text: "She disliked his interrupting her." },
        ],
      },
      {
        title: "Gerunds after expressions",
        body: [
          "A number of common expressions are followed by a gerund.",
          "Learn these expressions as complete patterns.",
        ],
        examples: [
          { label: "Be worth", text: "It is worth making a complaint." },
          { label: "No point in", text: "There is no point in arguing." },
          { label: "Difficulty", text: "She had difficulty understanding the instructions." },
          { label: "Spend time", text: "He spends hours playing video games." },
        ],
      },
      {
        title: "Infinitives of purpose",
        body: [
          "Use the to-infinitive to explain why someone does something.",
          "Do not use for + verb-ing to explain an individual person's purpose.",
          "However, for + gerund can describe the purpose or function of an object.",
        ],
        examples: [
          { label: "Purpose", text: "I went to the shop to buy some milk." },
          { label: "Purpose", text: "We left early to avoid the traffic." },
          { label: "Function", text: "This machine is used for cutting metal." },
          { label: "Function", text: "A thermometer is used for measuring temperature." },
        ],
        avoid: "I went there for speaking to the manager.",
      },
      {
        title: "Negative forms",
        body: [
          "Use not + verb-ing for a negative gerund.",
          "Use not to + verb for a negative infinitive.",
          "Use modal/expression + not + verb for a negative bare infinitive.",
        ],
        examples: [
          { label: "Gerund", text: "He admitted not reading the instructions." },
          { label: "Infinitive", text: "They decided not to attend the meeting." },
          { label: "Bare infinitive", text: "You had better not mention it." },
          { label: "Modal", text: "You must not enter this room." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Keep the verb pattern attached to the first verb or expression."],
        table: {
          headers: ["Pattern", "Examples"],
          rows: [
            ["verb + gerund", "enjoy doing, avoid doing, suggest doing"],
            ["verb + to-infinitive", "decide to do, promise to do, afford to do"],
            ["verb + object + to-infinitive", "tell someone to do, allow someone to do"],
            ["modal + bare infinitive", "can do, should do, must do"],
            ["preposition + gerund", "interested in doing, admit to doing"],
            ["passive gerund", "avoid being caught"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use an infinitive after a gerund verb.",
          "Do not use a gerund after an infinitive verb.",
          "Do not add to after a modal or had better.",
          "Use a gerund after a preposition.",
          "Use passive gerunds when the subject receives the action.",
        ],
        examples: [
          { label: "Correct", text: "She enjoys hiking." },
          { label: "Correct", text: "We decided to postpone the meeting." },
          { label: "Correct", text: "You had better leave." },
          { label: "Correct", text: "She is interested in learning more." },
          { label: "Correct", text: "They avoided being caught." },
        ],
      },
    ],
    checklist: [
      "Does the first verb take a gerund or a to-infinitive?",
      "Is there a person between the two verbs?",
      "Is to part of an infinitive or is it a preposition?",
      "Does the expression require a bare infinitive?",
      "Is a passive form such as being caught needed?",
      "Does choosing the gerund or infinitive change the meaning?",
      "Am I describing a purpose with the to-infinitive?",
      "Have I learnt the verb and its pattern together?",
    ],
  },
  Inversion: {
    title: "Inversion",
    subtitle: "Negative and restrictive expressions at the beginning",
    intro:
      "In normal affirmative sentences, the subject comes before the verb or auxiliary. In formal or emphatic English, some negative or restrictive expressions move to the beginning and cause inversion.",
    examples: [
      "I have never heard such a confusing explanation.",
      "Never have I heard such a confusing explanation.",
      "Rarely does she arrive late.",
      "Under no circumstances should you share your password.",
    ],
    focus:
      "This guide focuses on fronted negative expressions, do/does/did support, only/not until, not only and immediate-sequence structures.",
    sections: [
      {
        title: "Basic pattern",
        body: [
          "The general structure is negative or restrictive expression + auxiliary + subject + main verb.",
          "The word order is similar to a question, but the sentence is still a statement.",
        ],
        examples: [
          { label: "Pattern", text: "auxiliary + subject + main verb" },
          { label: "Auxiliary", text: "Never have I seen anything like it." },
          { label: "Modal", text: "Under no circumstances should you share your password." },
          { label: "Normal", text: "I have never heard this before." },
        ],
      },
      {
        title: "Do, does and did",
        body: [
          "If there is no auxiliary verb, add do, does or did.",
          "After do, does or did, use the base form of the main verb.",
          "With be, simply move be before the subject.",
        ],
        examples: [
          { label: "Present", text: "Rarely does she arrive late." },
          { label: "Past", text: "Only later did I understand the problem." },
          { label: "Base form", text: "did I understand" },
          { label: "Be", text: "Rarely is he on time." },
        ],
        avoid: "Only then did I understood.",
      },
      {
        title: "Common trigger expressions",
        body: [
          "Inversion commonly follows expressions with a negative or strongly restrictive meaning.",
          "Do not add another negative after strong negative phrases.",
        ],
        examples: [
          { label: "Never", text: "Never have I seen such a large crowd." },
          { label: "Rarely", text: "Rarely is he on time." },
          { label: "Little", text: "Little did she know what would happen next." },
          { label: "No account", text: "On no account must the machine be opened." },
        ],
        chips: ["never", "rarely", "seldom", "little", "under no circumstances", "on no account", "at no time", "in no way"],
      },
      {
        title: "Only and not until",
        body: [
          "Fronted expressions beginning with only often cause inversion.",
          "When only when, only after or not until introduces a clause, that clause keeps normal word order. The inversion occurs in the main clause.",
          "There is no inversion if the expression remains in its normal position.",
        ],
        examples: [
          { label: "Only after", text: "Only after the meeting did we realise how serious the problem was." },
          { label: "Only when", text: "Only when I arrived did I discover the truth." },
          { label: "Not until", text: "Not until the end of the film did I understand what was happening." },
          { label: "No inversion", text: "We only realised the problem after the meeting." },
        ],
      },
      {
        title: "Not only ... but also",
        body: [
          "In normal position, not only ... but also does not need inversion.",
          "When not only begins the sentence, the first clause is inverted.",
          "Only the first clause is inverted.",
        ],
        examples: [
          { label: "Normal", text: "They not only won the match but also broke a record." },
          { label: "Fronted", text: "Not only did they win the match, but they also broke a record." },
          { label: "Be", text: "Not only was the hotel expensive, but it was also uncomfortable." },
        ],
      },
      {
        title: "No sooner and hardly",
        body: [
          "No sooner, hardly, scarcely and barely show that one past event happened immediately before another.",
          "Use no sooner with than. Use hardly, scarcely and barely with when.",
        ],
        examples: [
          { label: "No sooner", text: "No sooner had he left than it started raining." },
          { label: "Hardly", text: "Hardly had they made the announcement when the website crashed." },
          { label: "Scarcely", text: "Scarcely had we sat down when the lights went out." },
          { label: "Barely", text: "Barely had she finished speaking when the audience began to applaud." },
        ],
        chips: ["No sooner + had + subject + past participle + than", "Hardly/scarcely/barely + had + subject + past participle + when"],
      },
      {
        title: "When inversion is not needed",
        body: [
          "Inversion is normally required only when the negative or restrictive expression is placed at the beginning.",
          "Ordinary time expressions do not cause inversion.",
          "There is no inversion when a negative phrase is the subject.",
        ],
        examples: [
          { label: "Normal", text: "I have never seen that before." },
          { label: "Inversion", text: "Never have I seen that before." },
          { label: "Time", text: "Yesterday, I went to the office." },
          { label: "Subject", text: "No students arrived late." },
        ],
      },
      {
        title: "Common mistakes",
        body: [
          "Do not keep normal word order after a fronted negative expression.",
          "Do not put the subject after the main verb.",
          "Remember do, does or did when there is no auxiliary.",
          "Use than after no sooner and when after hardly.",
        ],
        examples: [
          { label: "Correct", text: "Never have I heard such an explanation." },
          { label: "Correct", text: "Rarely does she arrive late." },
          { label: "Correct", text: "Only when she arrived did we begin." },
          { label: "Correct", text: "No sooner had I arrived than it started." },
        ],
      },
    ],
    checklist: [
      "Is the opening expression negative or restrictive?",
      "Does the sentence already contain an auxiliary or modal?",
      "Do I need to add do, does or did?",
      "Is the main verb in the base form after do, does or did?",
      "Does the inversion belong in the main clause?",
      "Have I used than after no sooner and when after hardly?",
    ],
  },
  Linkers: {
    title: "Linkers",
    subtitle: "Reason, result, contrast, addition, time and condition",
    intro:
      "Linkers show how ideas are connected. Choosing the correct linker depends on both meaning and the grammatical structure that follows it.",
    examples: [
      "We stayed at home because it was raining.",
      "It was raining, so we stayed at home.",
      "Although it was raining, we went out.",
      "The weather was terrible. Nevertheless, we went out.",
    ],
    focus:
      "This guide focuses on clause linkers, noun-phrase linkers, sentence connectors and commonly confused meanings.",
    sections: [
      {
        title: "Structure matters",
        body: [
          "Different linkers are followed by different structures.",
          "Some take a clause, some take a noun or -ing form, and some connect complete sentences.",
        ],
        examples: [
          { label: "Clause", text: "because the weather was bad" },
          { label: "Clause", text: "although he was tired" },
          { label: "Noun/-ing", text: "because of the bad weather" },
          { label: "Sentence connector", text: "She studied hard. As a result, she passed easily." },
        ],
        note: "This grammatical difference is just as important as the meaning.",
      },
      {
        title: "Reason and result",
        body: [
          "Use because + clause to give a reason.",
          "Use because of + noun phrase.",
          "Use so to join two clauses. Use therefore or as a result between separate sentences or after a semicolon.",
        ],
        examples: [
          { label: "Reason", text: "We didn't go out because it was raining." },
          { label: "Reason", text: "We didn't go out because of the rain." },
          { label: "Result", text: "The results were unclear, so further tests were required." },
          { label: "Connector", text: "The results were unclear. Therefore, further tests were required." },
        ],
      },
      {
        title: "Contrast and concession",
        body: [
          "Use but to join two contrasting clauses.",
          "Although and even though are followed by a clause.",
          "Despite and in spite of are followed by a noun, pronoun or -ing form.",
        ],
        examples: [
          { label: "But", text: "I wanted to go, but I didn't have enough money." },
          { label: "Although", text: "Although he was tired, he continued working." },
          { label: "Even though", text: "Even though he had all the qualifications, they rejected him." },
          { label: "Despite", text: "Despite being tired, she continued." },
        ],
        chips: ["despite the problem", "in spite of the problem"],
      },
      {
        title: "Sentence-level contrast",
        body: [
          "However introduces a general contrast.",
          "Nevertheless and even so show that something happened despite the previous information.",
          "Instead shows that something different happened.",
          "These linkers connect sentences rather than introducing subordinate clauses.",
        ],
        examples: [
          { label: "However", text: "The hotel was expensive. However, it was extremely comfortable." },
          { label: "Nevertheless", text: "The roads were icy. Nevertheless, they continued driving." },
          { label: "Even so", text: "The snow had stopped. Even so, the roads were still dangerous." },
          { label: "Instead", text: "I expected a warm welcome. Instead, the receptionist ignored me." },
        ],
      },
      {
        title: "In contrast or on the contrary?",
        body: [
          "In contrast compares two different people, things or situations.",
          "On the contrary rejects or corrects a previous statement.",
        ],
        examples: [
          { label: "Compare", text: "Her first novel was dark. In contrast, her latest book is full of humour." },
          { label: "Correct", text: "Some people think she is unfriendly. On the contrary, she is extremely kind." },
        ],
        note: "Use on the contrary when the second statement says the first idea is wrong, not simply different.",
      },
      {
        title: "Contrasting within one sentence",
        body: [
          "Whereas and while join two clauses.",
          "As opposed to and rather than can contrast nouns, phrases or activities.",
        ],
        examples: [
          { label: "Whereas", text: "The dining room is used only for eating, whereas the kitchen also serves as a workspace." },
          { label: "While", text: "My brother enjoys cities, while I prefer the countryside." },
          { label: "Rather than", text: "I decided to walk rather than take the bus." },
        ],
      },
      {
        title: "Addition",
        body: [
          "And is the most common way to add information.",
          "What's more and moreover introduce an additional point in a new sentence.",
          "As well as normally connects words or phrases inside one sentence. Too usually appears at the end.",
        ],
        examples: [
          { label: "And", text: "We visited the museum and the cathedral." },
          { label: "What's more", text: "We visited the museum. What's more, we went on a boat tour." },
          { label: "Moreover", text: "The film was too long. Moreover, the acting was weak." },
          { label: "As well as", text: "She speaks French as well as Spanish." },
        ],
      },
      {
        title: "Time linkers",
        body: [
          "Before and after may be followed by a clause or a noun phrase.",
          "Use while for actions happening at the same time.",
          "Use until to show that a situation continues up to a particular time or event.",
        ],
        examples: [
          { label: "Before", text: "Wash your hands before you eat." },
          { label: "After", text: "We went for a walk after dinner." },
          { label: "While", text: "She listened to music while she was working." },
          { label: "Until", text: "We can't start until the manager arrives." },
        ],
      },
      {
        title: "For, since and during",
        body: [
          "Use for + length of time.",
          "Use since + starting point.",
          "Use during + event or period.",
        ],
        examples: [
          { label: "For", text: "I lived in London for five years." },
          { label: "Since", text: "She has worked here since 2018." },
          { label: "During", text: "Nobody spoke during the presentation." },
          { label: "Compare", text: "for three hours / since three o'clock / during the lesson" },
        ],
      },
      {
        title: "Formal condition with should",
        body: [
          "In formal English, should + subject + infinitive can replace an if clause.",
          "This structure is common in formal instructions and correspondence.",
        ],
        examples: [
          { label: "Formal", text: "Should you decide to cancel, please let us know." },
          { label: "Meaning", text: "If you decide to cancel, please let us know." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Use the structure as well as the meaning to choose the linker."],
        table: {
          headers: ["Meaning", "Clause", "Noun/-ing phrase", "Sentence connector"],
          rows: [
            ["reason", "because", "because of", "-"],
            ["result", "so", "-", "therefore, as a result"],
            ["contrast", "although, even though", "despite, in spite of", "however, nevertheless, even so"],
            ["addition", "and", "as well as", "moreover, what's more"],
            ["comparison", "whereas, while", "as opposed to, rather than", "in contrast"],
            ["correction", "-", "-", "on the contrary"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not confuse a clause with a noun phrase.",
          "Do not use a sentence connector as if it were a conjunction.",
          "Do not confuse addition and contrast.",
          "Use in contrast for comparison and on the contrary for correction.",
        ],
        examples: [
          { label: "Reason", text: "because it was raining / because of the rain" },
          { label: "Contrast", text: "although they are twins / despite being twins" },
          { label: "Result", text: "The results were unclear, so further tests were needed." },
          { label: "Connector", text: "The results were unclear. Therefore, further tests were needed." },
        ],
      },
    ],
    checklist: [
      "What relationship do I want to express?",
      "Does the linker need a clause, noun phrase or complete sentence?",
      "Am I expressing reason or result?",
      "Is the contrast general, unexpected or a direct correction?",
      "Does the sentence connector need a full stop or semicolon?",
      "Am I using for, since or during correctly?",
    ],
  },
  "Modal verbs": {
    title: "Modal verbs",
    subtitle: "Ability, permission, obligation, advice, possibility and deduction",
    intro:
      "Modal verbs express ideas such as ability, permission, obligation, advice, possibility and deduction. They are normally followed by the infinitive without to.",
    examples: [
      "I can speak French quite well.",
      "You must wear a seat belt.",
      "She might be at home.",
      "He must have forgotten.",
    ],
    focus:
      "This guide focuses on choosing the right modal meaning and form, especially past modal structures.",
    sections: [
      {
        title: "Basic modal form",
        body: [
          "Common modal verbs include can, could, may, might, must, should and will.",
          "They are normally followed by the infinitive without to.",
        ],
        examples: [
          { label: "Ability", text: "can swim" },
          { label: "Advice", text: "should leave" },
          { label: "Obligation", text: "must finish" },
        ],
        avoid: "You must to leave.",
      },
      {
        title: "Ability",
        body: [
          "Use can for present ability.",
          "Use could for general past ability over a period of time.",
          "For one particular successful past action, use was/were able to or managed to.",
        ],
        examples: [
          { label: "Present", text: "I can speak French quite well." },
          { label: "Past general", text: "I could swim when I was five." },
          { label: "Specific success", text: "After several attempts, she was able to reset the server." },
          { label: "Specific success", text: "We finally managed to open the door." },
        ],
      },
      {
        title: "Permission",
        body: [
          "Use can to give or ask for permission.",
          "May is more formal.",
        ],
        examples: [
          { label: "Can", text: "You can leave early today." },
          { label: "Question", text: "Can I use your laptop?" },
          { label: "Formal", text: "You may leave when you have finished." },
        ],
      },
      {
        title: "Obligation and necessity",
        body: [
          "Use must for strong obligation, especially when the speaker sees it as important.",
          "Use have to for rules, external requirements and practical necessity.",
          "In many situations, must and have to are both possible.",
        ],
        examples: [
          { label: "Must", text: "You must wear a seat belt." },
          { label: "Must", text: "I must remember to call her." },
          { label: "Have to", text: "Employees have to wear identification." },
          { label: "Have to", text: "I have to get up early tomorrow." },
        ],
      },
      {
        title: "Prohibition or no necessity?",
        body: [
          "Mustn't means the action is prohibited.",
          "Don't have to means the action is not necessary, but it is allowed.",
        ],
        examples: [
          { label: "Prohibited", text: "You mustn't smoke here." },
          { label: "Prohibited", text: "You mustn't swim in this area." },
          { label: "Optional", text: "You don't have to bring any food." },
          { label: "Optional", text: "You don't have to attend the meeting." },
        ],
        note: "You mustn't come means do not come. You don't have to come means you can come, but it is optional.",
      },
      {
        title: "Advice and warnings",
        body: [
          "Use should and ought to for advice and recommendations.",
          "Had better gives strong advice or a warning and often suggests a negative consequence.",
        ],
        examples: [
          { label: "Should", text: "You should see a dentist." },
          { label: "Ought to", text: "You ought to get more rest." },
          { label: "Had better", text: "You had better leave now." },
          { label: "Negative", text: "You had better not be late again." },
        ],
        chips: ["should + infinitive", "ought to + infinitive", "had better + infinitive without to"],
      },
      {
        title: "Possibility and present deduction",
        body: [
          "Use may, might or could when something is possible.",
          "Use must for a strong positive deduction, can't for a strong negative deduction, and may/might/could for a possible deduction.",
        ],
        examples: [
          { label: "Possibility", text: "I might go to London next week." },
          { label: "Possibility", text: "She may be at home." },
          { label: "Strong", text: "She has been working all night. She must be exhausted." },
          { label: "Negative", text: "He is in Madrid, so he can't be at the meeting in London." },
        ],
        chips: ["must be = very likely", "might/could be = possible", "can't be = nearly impossible"],
      },
      {
        title: "Past deduction",
        body: [
          "Use modal + have + past participle for deductions about the past.",
          "Must have is a strong positive deduction. Can't have is a strong negative deduction. Might/could have show past possibility.",
        ],
        examples: [
          { label: "Structure", text: "modal + have + past participle" },
          { label: "Positive", text: "He drove for six hours. He must have been exhausted." },
          { label: "Negative", text: "He was in Madrid all day. He can't have attended the meeting in London." },
          { label: "Possible", text: "She might have forgotten." },
        ],
      },
      {
        title: "Past advice and criticism",
        body: [
          "Use should have + past participle for something that was a good idea but did not happen.",
          "The negative form means that an action happened but was a mistake.",
        ],
        examples: [
          { label: "Missed advice", text: "You should have told me earlier." },
          { label: "Criticism", text: "He should have apologised." },
          { label: "Negative", text: "You shouldn't have said that." },
          { label: "Negative", text: "They shouldn't have left so early." },
        ],
      },
      {
        title: "Needn't have and didn't need to",
        body: [
          "Needn't have + past participle means the action happened, but it was unnecessary.",
          "Didn't need to + infinitive means there was no necessity; the action probably did not happen.",
        ],
        examples: [
          { label: "Happened", text: "We needn't have left so early." },
          { label: "Happened", text: "They needn't have brought coats." },
          { label: "Probably not", text: "We didn't need to pay because we had free tickets." },
          { label: "Probably not", text: "She didn't need to wait in the queue." },
        ],
      },
      {
        title: "Was supposed to",
        body: [
          "Use was/were supposed to for a past plan, expectation or obligation.",
          "It often implies that the expected action did not happen correctly.",
        ],
        examples: [
          { label: "Plan", text: "The presentation was supposed to start at nine." },
          { label: "Expectation", text: "You were supposed to call me." },
          { label: "Problem", text: "The train was supposed to arrive at six, but it was delayed." },
        ],
      },
      {
        title: "Other useful modal expressions",
        body: [
          "Will can express a confident present assumption in informal British English.",
          "Dare can behave like a modal in questions and negatives.",
          "I might have known expresses annoyed recognition that someone has behaved in a typical way.",
        ],
        examples: [
          { label: "Will", text: "That will be the postwoman at the door." },
          { label: "Dare", text: "How dare you speak to her like that?" },
          { label: "Dare", text: "He daren't tell them the truth." },
          { label: "Idiom", text: "I might have known he would cancel at the last minute." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Choose the modal according to the meaning and time reference."],
        table: {
          headers: ["Meaning", "Form", "Example"],
          rows: [
            ["ability", "can/could", "She can swim."],
            ["permission", "can/may", "You can leave."],
            ["obligation", "must/have to", "You must wear a helmet."],
            ["prohibition", "mustn't", "You mustn't enter."],
            ["no necessity", "don't have to", "You don't have to come."],
            ["advice", "should/ought to", "You should rest."],
            ["possibility", "may/might/could", "She might be late."],
            ["past deduction", "must/can't have", "He must have forgotten."],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not add to after a modal.",
          "Do not confuse mustn't with don't have to.",
          "Do not confuse deduction with criticism.",
          "Use modal + have + past participle for past deduction.",
          "Use was/were able to for one successful past occasion.",
        ],
        examples: [
          { label: "Correct", text: "You must leave." },
          { label: "Deduction", text: "He must have forgotten." },
          { label: "Criticism", text: "He should have remembered." },
          { label: "Specific success", text: "We were able to open the door." },
        ],
      },
    ],
    checklist: [
      "Am I expressing ability, permission, obligation or advice?",
      "Is the action prohibited or simply unnecessary?",
      "Am I describing possibility or making a strong deduction?",
      "Does the sentence refer to the present or the past?",
      "Do I need modal + have + past participle?",
      "Did the unnecessary past action actually happen?",
      "Am I describing general past ability or one successful occasion?",
    ],
  },
  "Narrative Tenses": {
    title: "Narrative tenses",
    subtitle: "Completed events, background actions and earlier past events",
    intro:
      "Narrative tenses help us describe past events clearly. The main forms are past simple, past continuous, past perfect and past perfect continuous.",
    examples: [
      "I was walking home when I saw her.",
      "By the time we arrived, the guests had left.",
      "She had been waiting for over an hour when he called.",
      "Every summer, we would rent a cottage by the lake.",
    ],
    focus:
      "This guide focuses on sequencing past events, background actions, duration before a past point, and past habits.",
    sections: [
      {
        title: "Past simple",
        body: [
          "Use the past simple for completed actions and sequences of events.",
          "In a story, it usually describes the main events that move the story forward.",
        ],
        examples: [
          { label: "Completed", text: "We went to Italy last summer." },
          { label: "Sequence", text: "She signed the documents and put them in the drawer." },
          { label: "Story", text: "He opened the door, walked inside and turned on the light." },
        ],
        chips: ["yesterday", "last week", "in 2020", "two days ago"],
      },
      {
        title: "Past continuous",
        body: [
          "Use was/were + verb-ing for an action in progress at a particular past moment.",
          "It often provides the background to a story.",
          "Use it for the longer action when another event interrupts it.",
        ],
        examples: [
          { label: "Structure", text: "was/were + verb-ing" },
          { label: "Moment", text: "At eight o'clock, I was working." },
          { label: "Background", text: "The sun was shining, and people were sitting outside." },
          { label: "Interrupted", text: "I was going to the cinema when I saw her." },
        ],
      },
      {
        title: "Past perfect",
        body: [
          "Use had + past participle when one past action happened before another past action or reference point.",
          "You do not need it for every earlier event; use it when the order might otherwise be unclear or when the earlier action was already complete.",
        ],
        examples: [
          { label: "Structure", text: "had + past participle" },
          { label: "Earlier past", text: "By the time we arrived, the guests had already left." },
          { label: "Order", text: "When we arrived, the guests had left." },
          { label: "Earlier event", text: "The burglars had escaped before the police arrived." },
        ],
      },
      {
        title: "Past perfect continuous",
        body: [
          "Use had been + verb-ing for an activity that continued for a period before another past event.",
          "It often answers how long the activity had been happening or explains a visible past result.",
        ],
        examples: [
          { label: "Structure", text: "had been + verb-ing" },
          { label: "Duration", text: "They had been walking for hours before they reached the campsite." },
          { label: "Result", text: "The ground was wet because it had been raining." },
          { label: "Cause", text: "She had a headache because she had been working all morning." },
        ],
        chips: ["for several hours", "since early morning", "all day", "for a long time"],
      },
      {
        title: "Continuous or perfect continuous?",
        body: [
          "Use the past continuous for what was happening at a particular moment.",
          "Use the past perfect continuous for duration leading up to a later past moment.",
        ],
        examples: [
          { label: "Moment", text: "At ten o'clock, she was waiting outside." },
          { label: "Duration", text: "She had been waiting for an hour when he arrived." },
          { label: "Moment", text: "They were walking when it started to rain." },
          { label: "Duration", text: "They had been walking for hours when they reached the campsite." },
        ],
      },
      {
        title: "Perfect or perfect continuous?",
        body: [
          "Use the past perfect for a completed action or result.",
          "Use the past perfect continuous for an ongoing activity or its duration.",
          "Some state verbs are not normally used in continuous forms.",
        ],
        examples: [
          { label: "Complete", text: "She had written three reports before lunch." },
          { label: "Ongoing", text: "She had been writing reports all morning." },
          { label: "Complete", text: "He had repaired the car." },
          { label: "State verb", text: "They had known each other for years." },
        ],
      },
      {
        title: "Past habits",
        body: [
          "Use used to for repeated actions and past states that no longer happen or belong to an earlier period.",
          "Use would + infinitive for repeated past actions, especially in stories and memories.",
          "Do not normally use would for past states.",
        ],
        examples: [
          { label: "Used to action", text: "We used to rent a cottage by the lake." },
          { label: "Used to state", text: "She used to be very shy." },
          { label: "Would action", text: "Every summer, we would rent a cottage by the lake." },
          { label: "Context", text: "When I was young, I would play the piano every day." },
        ],
      },
      {
        title: "By the time",
        body: [
          "By the time introduces a later reference point.",
          "The other tense depends on whether the action was complete or still in progress by then.",
        ],
        examples: [
          { label: "Complete", text: "By the time I arrived, everyone had left." },
          { label: "In progress", text: "By the time I arrived, everyone was leaving." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Use each tense for a different job in the story."],
        table: {
          headers: ["Form", "Main use", "Example"],
          rows: [
            ["past simple", "completed event or sequence", "She signed the form."],
            ["past continuous", "action in progress or background", "She was signing the form."],
            ["past perfect", "completed before another past point", "She had signed it before I arrived."],
            ["past perfect continuous", "duration before another past point", "She had been working for hours."],
            ["used to", "past habits and states", "She used to live here."],
            ["would", "repeated past actions", "Every day, she would walk home."],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use present tenses in a past narrative.",
          "Do not use a past participle without an auxiliary.",
          "Use the past continuous for background activity.",
          "Use used to, not past perfect, for past habits.",
          "In affirmative sentences, write used to, not use to.",
        ],
        examples: [
          { label: "Correct", text: "We went to Italy last year." },
          { label: "Correct", text: "The train had gone." },
          { label: "Correct", text: "I was singing when I heard the crash." },
          { label: "Correct", text: "We used to rent a cottage." },
        ],
      },
    ],
    checklist: [
      "Is this a completed event or an action in progress?",
      "Did one event happen before another past event?",
      "Am I emphasising completion or duration?",
      "Is the action background information or part of the main sequence?",
      "Am I describing a repeated past action or a past state?",
      "Does by the time mean the action was complete or still in progress?",
    ],
  },
  "Passive Voice": {
    title: "The passive voice",
    subtitle: "Focusing on the receiver, result or process",
    intro:
      "In a passive sentence, the focus moves to the person or thing that receives the action.",
    examples: [
      "Our house was built by a local company.",
      "My bike was stolen last night.",
      "English is spoken in many countries.",
      "The results will be announced tomorrow.",
    ],
    focus:
      "This guide focuses on passive structure, tense choice, agents, modal passives, two-object verbs and reporting passives.",
    sections: [
      {
        title: "Basic form",
        body: [
          "The basic passive structure is be + past participle.",
          "The tense is shown by the verb be. The main verb stays in the past participle form.",
        ],
        examples: [
          { label: "Present", text: "The windows are cleaned every week." },
          { label: "Past", text: "My bike was stolen." },
          { label: "Future", text: "Applicants will be notified by email." },
          { label: "Perfect", text: "The report has already been finished." },
        ],
        chips: ["is spoken", "was repaired", "will be sent", "has been completed"],
      },
      {
        title: "When we use the passive",
        body: [
          "Use the passive when the person performing the action is unknown, obvious or unimportant.",
          "It is also useful when the result or receiver is more important, or when a formal/impersonal style is needed.",
        ],
        examples: [
          { label: "Unknown", text: "My bike was stolen." },
          { label: "Unimportant", text: "The windows are cleaned every week." },
          { label: "Formal", text: "The results will be announced tomorrow." },
        ],
      },
      {
        title: "Choosing the tense",
        body: [
          "The passive does not change the time of the sentence.",
          "Choose the tense in the same way as you would in an active sentence.",
        ],
        table: {
          headers: ["Tense/form", "Structure", "Example"],
          rows: [
            ["present simple", "am/is/are + participle", "Lunch is served at one."],
            ["past simple", "was/were + participle", "The car was repaired yesterday."],
            ["present continuous", "am/is/are being + participle", "The walls are being painted."],
            ["present perfect", "has/have been + participle", "The report has been completed."],
            ["future", "will be + participle", "The letter will be sent tomorrow."],
            ["modal", "modal + be + participle", "The forms must be completed."],
          ],
        },
      },
      {
        title: "The agent with by",
        body: [
          "Use by to introduce the person or organisation responsible.",
          "The agent is often omitted because it is unknown, obvious or unimportant.",
          "Do not add an unnecessary agent.",
        ],
        examples: [
          { label: "Agent", text: "The cake was baked by my mum." },
          { label: "Agent", text: "Our house was built by a local company." },
          { label: "No agent", text: "My bike was stolen." },
          { label: "No agent", text: "English is spoken in many countries." },
        ],
      },
      {
        title: "Modal passives",
        body: [
          "After a modal verb, use modal + be + past participle.",
          "For the past, use modal + have been + past participle.",
        ],
        examples: [
          { label: "Modal", text: "The forms must be completed before Friday." },
          { label: "Modal", text: "This information should be kept confidential." },
          { label: "Past modal", text: "The documents should have been sent yesterday." },
          { label: "Past modal", text: "The mistake could have been avoided." },
        ],
      },
      {
        title: "Two objects",
        body: [
          "Some verbs can have both a person and a thing as objects.",
          "Either object may become the subject of a passive sentence, but the person is often more natural.",
        ],
        examples: [
          { label: "Active", text: "They gave me some information." },
          { label: "Person subject", text: "I was given some information." },
          { label: "Thing subject", text: "Some information was given to me." },
          { label: "Natural", text: "Applicants will be notified of the decision." },
        ],
        chips: ["give", "tell", "send", "offer", "show", "teach", "ask"],
      },
      {
        title: "Reporting passives",
        body: [
          "Passive reporting structures are common in formal writing and news reports.",
          "Use It is said that... or subject + reporting verb + infinitive.",
        ],
        examples: [
          { label: "It + passive", text: "It is said that the palace is haunted." },
          { label: "Subject + infinitive", text: "The palace is said to be haunted." },
          { label: "Current", text: "He is said to be living in Portugal now." },
          { label: "Earlier", text: "The CEO is believed to have resigned." },
        ],
        chips: ["say", "believe", "think", "expect", "know", "report", "consider"],
      },
      {
        title: "Passive infinitives and gerunds",
        body: [
          "Use to be + past participle for a passive infinitive.",
          "Use being + past participle for a passive gerund.",
        ],
        examples: [
          { label: "Infinitive", text: "The documents need to be signed." },
          { label: "Infinitive", text: "She expects to be invited." },
          { label: "Gerund", text: "She hates being told what to do." },
          { label: "Gerund", text: "They complained about being treated unfairly." },
        ],
      },
      {
        title: "When passive is not possible",
        body: [
          "Only verbs that take an object can normally be made passive.",
          "Verbs such as arrive, happen, sleep and go do not normally take an object, so they cannot usually form passives.",
        ],
        examples: [
          { label: "Possible", text: "Someone opened the door. / The door was opened." },
          { label: "Not passive", text: "The guests arrived." },
        ],
      },
      {
        title: "Common mistakes",
        body: [
          "Do not forget the verb be.",
          "Use the correct past participle.",
          "Use a passive form when the subject receives the action.",
          "Remember being in continuous passives and been in perfect passives.",
          "Use passive infinitives when passive meaning is required.",
        ],
        examples: [
          { label: "Correct", text: "The car was repaired." },
          { label: "Correct", text: "The bike was stolen." },
          { label: "Correct", text: "The walls are being painted." },
          { label: "Correct", text: "The documents need to be signed." },
        ],
      },
    ],
    checklist: [
      "Is the subject performing or receiving the action?",
      "Which tense is needed?",
      "Have I included the correct form of be?",
      "Is the main verb in the past participle?",
      "Is the person performing the action important enough to mention?",
      "Do I need being, been or to be?",
      "Does a reporting passive need a simple, continuous or perfect infinitive?",
    ],
  },
  "Phrasal verbs": {
    title: "Phrasal verbs",
    subtitle: "Objects, separation and word order",
    intro:
      "A phrasal verb combines a verb with one or more short words. Together, they form a single unit whose grammar must often be learnt with the verb.",
    examples: [
      "The plane took off.",
      "Turn the lights off.",
      "Turn it off.",
      "I can't put up with the noise.",
    ],
    focus:
      "This guide focuses on whether the verb takes an object, whether it is separable, where pronouns go, and how three-part verbs behave.",
    sections: [
      {
        title: "No object",
        body: [
          "Some phrasal verbs are intransitive, meaning they do not take a direct object.",
          "They may be followed by extra information, but that information is not a direct object of the phrasal verb.",
        ],
        examples: [
          { label: "No object", text: "The plane took off." },
          { label: "No object", text: "Eva finally turned up." },
          { label: "Extra info", text: "The plane took off at 10:30." },
          { label: "Extra info", text: "We set off for Madrid." },
        ],
      },
      {
        title: "With an object",
        body: [
          "Other phrasal verbs are transitive, meaning they require or allow an object.",
          "The object may be a noun, noun phrase, pronoun or sometimes an -ing form.",
          "Word order depends on whether the phrasal verb is separable.",
        ],
        examples: [
          { label: "Object", text: "turn off the lights" },
          { label: "Object", text: "look after the dog" },
          { label: "Object", text: "turn down the offer" },
        ],
      },
      {
        title: "Separable verbs",
        body: [
          "With separable phrasal verbs, a noun object can usually go after the complete phrasal verb or between the verb and particle.",
          "Very long noun phrases usually sound more natural after the particle.",
        ],
        examples: [
          { label: "After", text: "turn off the lights" },
          { label: "Middle", text: "turn the lights off" },
          { label: "After", text: "look up the word" },
          { label: "Middle", text: "look the word up" },
        ],
      },
      {
        title: "Pronouns go in the middle",
        body: [
          "With a separable phrasal verb, a pronoun object must go between the verb and the particle.",
          "This is one of the most important phrasal-verb word-order rules.",
        ],
        examples: [
          { label: "Pronoun", text: "turn it down" },
          { label: "Pronoun", text: "look it up" },
          { label: "Pronoun", text: "pick them up" },
          { label: "Compare", text: "Turn down the music. / Turn the music down. / Turn it down." },
        ],
        avoid: "Turn down it.",
      },
      {
        title: "Inseparable verbs",
        body: [
          "With inseparable phrasal verbs, the object must come after the complete verb.",
          "Pronouns also remain after the full verb.",
        ],
        examples: [
          { label: "Noun", text: "look after the dog" },
          { label: "Noun", text: "come across some old photographs" },
          { label: "Pronoun", text: "look after it" },
          { label: "Pronoun", text: "run into him" },
        ],
      },
      {
        title: "Three-part verbs",
        body: [
          "Some verbs contain a verb plus two particles or prepositions.",
          "These verbs are normally inseparable, and pronouns normally come after the complete three-part verb.",
        ],
        examples: [
          { label: "Three-part", text: "I can't put up with the noise." },
          { label: "Three-part", text: "We need to come up with a solution." },
          { label: "Pronoun", text: "I can't put up with it." },
          { label: "Pronoun", text: "She looks up to him." },
        ],
        chips: ["put up with", "look forward to", "come up with", "run out of", "look up to", "own up to"],
      },
      {
        title: "When to is a preposition",
        body: [
          "In expressions such as look forward to and own up to, to is a preposition, not part of an infinitive.",
          "A verb after a preposition takes the -ing form.",
        ],
        examples: [
          { label: "Preposition", text: "I'm looking forward to seeing you." },
          { label: "Preposition", text: "He owned up to breaking the window." },
          { label: "Infinitive", text: "I want to see you." },
          { label: "Noun", text: "look forward to the holiday" },
        ],
        avoid: "I look forward to see you.",
      },
      {
        title: "Passive phrasal verbs",
        body: [
          "Transitive phrasal verbs can often be used in the passive.",
          "The particle remains with the verb.",
          "The agent, when needed, comes after the complete phrasal verb.",
        ],
        examples: [
          { label: "Active", text: "They put off the meeting." },
          { label: "Passive", text: "The meeting was put off." },
          { label: "Passive", text: "We were held up in traffic." },
          { label: "Agent", text: "The meeting was put off by the manager." },
        ],
      },
      {
        title: "Learn the whole pattern",
        body: [
          "A single base verb may combine with different particles, producing different meanings and grammar.",
          "Learn the complete pattern rather than only the main verb.",
        ],
        examples: [
          { label: "Separable", text: "look the word up / look it up" },
          { label: "Inseparable", text: "look after the child / look after her" },
          { label: "Inseparable", text: "look into the problem / look into it" },
          { label: "Three-part", text: "look up to your teacher / look up to him" },
        ],
      },
      {
        title: "Quick reference",
        body: ["First decide whether there is an object and whether the verb is separable."],
        table: {
          headers: ["Type", "Noun object", "Pronoun object"],
          rows: [
            ["no object", "The plane took off.", "-"],
            ["separable", "turn off the light / turn the light off", "turn it off"],
            ["inseparable", "look after the child", "look after her"],
            ["three-part", "put up with the noise", "put up with it"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not put a pronoun after a separable phrasal verb.",
          "Do not separate an inseparable verb or a three-part verb.",
          "Use -ing after prepositional to.",
          "Keep the particle with the verb in passive forms.",
        ],
        examples: [
          { label: "Correct", text: "Turn it down." },
          { label: "Correct", text: "Look after the dog." },
          { label: "Correct", text: "We ran out of milk." },
          { label: "Correct", text: "The meeting was put off." },
        ],
      },
    ],
    checklist: [
      "Does it take an object?",
      "Is it separable or inseparable?",
      "Is the object a noun or a pronoun?",
      "Does a pronoun need to go in the middle?",
      "Is it a three-part phrasal verb?",
      "Is to an infinitive marker or a preposition?",
      "If the sentence is passive, have I kept all parts together?",
    ],
  },
  Prepositions: {
    title: "Prepositions",
    subtitle: "Time, place, movement and fixed combinations",
    intro:
      "Prepositions are short words such as at, in, on, for, of and to. Some uses follow general rules; others are fixed combinations.",
    examples: [
      "The train leaves at eight.",
      "The keys are on the table.",
      "She walked into the room.",
      "He is afraid of spiders.",
    ],
    focus:
      "This guide focuses on time, place, movement, dependent prepositions and prepositions followed by nouns or -ing forms.",
    sections: [
      {
        title: "Time: at, on and in",
        body: [
          "Use at for precise times.",
          "Use on for days and dates.",
          "Use in for longer periods.",
        ],
        examples: [
          { label: "At", text: "The train leaves at 8:00." },
          { label: "On", text: "We are meeting on Saturday." },
          { label: "In", text: "She was born in 1990." },
          { label: "Progression", text: "at 8:00 / on Monday / in June" },
        ],
      },
      {
        title: "For, since and during",
        body: [
          "Use for + duration.",
          "Use since + starting point.",
          "Use during + event or period.",
        ],
        examples: [
          { label: "For", text: "I lived there for five years." },
          { label: "Since", text: "We haven't seen him since January." },
          { label: "During", text: "Nobody spoke during the presentation." },
          { label: "Compare", text: "for two hours / since two o'clock / during the lesson" },
        ],
      },
      {
        title: "On time and in time",
        body: [
          "On time means at the planned or scheduled time.",
          "In time means early enough to do something or before it is too late.",
        ],
        examples: [
          { label: "Punctual", text: "The train arrived on time." },
          { label: "Punctual", text: "She is always on time for meetings." },
          { label: "Early enough", text: "We arrived in time to catch the train." },
          { label: "Early enough", text: "The firefighters reached the building just in time." },
        ],
      },
      {
        title: "Place: at, in and on",
        body: [
          "Use at for a point or specific location.",
          "Use in for inside an area or space.",
          "Use on for touching a surface.",
        ],
        examples: [
          { label: "At", text: "They met at the corner of the street." },
          { label: "In", text: "She is waiting in the office." },
          { label: "On", text: "There was a painting on the wall." },
          { label: "Compare", text: "at the airport = location / in the airport = inside the building" },
        ],
      },
      {
        title: "Corner and movement",
        body: [
          "Use in the corner for the inside corner of a room or enclosed space.",
          "Use at the corner for the point where streets or roads meet.",
          "Movement prepositions describe where someone or something goes.",
        ],
        examples: [
          { label: "Inside", text: "There was a chair in the corner of the room." },
          { label: "Street point", text: "I'll meet you at the corner of King Street." },
          { label: "Into", text: "She walked into the room." },
          { label: "Along", text: "We walked along the river." },
        ],
      },
      {
        title: "Arrive at and arrive in",
        body: [
          "Use arrive at with specific places or points.",
          "Use arrive in with larger areas.",
          "Do not use arrive to.",
        ],
        examples: [
          { label: "Specific", text: "arrive at the airport / arrive at work" },
          { label: "Larger area", text: "arrive in Madrid / arrive in Spain" },
          { label: "Correct", text: "We arrived at the hotel." },
        ],
        avoid: "We arrived to the hotel.",
      },
      {
        title: "Dependent prepositions",
        body: [
          "Some verbs, adjectives and nouns are normally followed by particular prepositions.",
          "There is not always a logical reason, so learn the complete expression.",
        ],
        examples: [
          { label: "Adjective", text: "She is good at dealing with pressure." },
          { label: "Adjective", text: "The area is famous for its beaches." },
          { label: "Verb", text: "He depends on his parents." },
          { label: "Noun", text: "There has been a sharp increase in prices." },
        ],
        chips: ["good at", "afraid of", "famous for", "depend on", "apologise for", "succeed in", "an increase in"],
      },
      {
        title: "After a preposition",
        body: [
          "A preposition can be followed by a noun, pronoun or -ing form.",
          "Do not normally use an infinitive after a preposition.",
          "When to is a preposition, it is followed by a noun or -ing form.",
        ],
        examples: [
          { label: "Noun", text: "afraid of spiders" },
          { label: "Pronoun", text: "good at it" },
          { label: "-ing", text: "She apologised for being late." },
          { label: "To", text: "I'm looking forward to seeing you." },
        ],
      },
      {
        title: "Similar-looking expressions",
        body: [
          "Small changes in preposition can change the meaning.",
          "Learn these as separate expressions.",
        ],
        examples: [
          { label: "Afraid of", text: "He is afraid of flying." },
          { label: "Afraid for", text: "I'm afraid for his safety." },
          { label: "Apply to", text: "This rule applies to all employees." },
          { label: "Apply for", text: "She applied for the job." },
          { label: "Good at", text: "She is good at dancing." },
          { label: "Good with", text: "She is good with children." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Use the meaning and the noun type to choose the preposition."],
        table: {
          headers: ["Use", "Preposition", "Example"],
          rows: [
            ["clock time", "at", "at eight"],
            ["day/date", "on", "on Monday"],
            ["month/year", "in", "in June"],
            ["duration", "for", "for three hours"],
            ["starting point", "since", "since 2020"],
            ["event/period", "during", "during the meeting"],
            ["point/location", "at", "at the airport"],
            ["movement inside", "into", "walk into the room"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use to after arrive.",
          "Do not confuse on time and in time.",
          "Use -ing after a preposition.",
          "Avoid translating fixed combinations directly from another language.",
          "Keep location and movement separate.",
        ],
        examples: [
          { label: "Correct", text: "We arrived at the airport." },
          { label: "Correct", text: "The meeting started on time." },
          { label: "Correct", text: "She succeeded in finding a solution." },
          { label: "Correct", text: "She is in the room. / She walked into the room." },
        ],
      },
    ],
    checklist: [
      "Am I describing time, place or movement?",
      "Is the time a precise point, a day or a longer period?",
      "Am I describing location or movement?",
      "Is this a fixed verb, adjective or noun pattern?",
      "Does the preposition need a noun or an -ing form?",
      "Is to a preposition or part of an infinitive?",
      "Am I confusing similar expressions such as on time/in time?",
    ],
  },
  Quantifiers: {
    title: "Quantifiers",
    subtitle: "How much, how many, enough, too much and too many",
    intro:
      "Quantifiers tell us how much or how many of something there is. The correct quantifier often depends on whether the noun is countable, uncountable, singular or plural.",
    examples: [
      "There are a few sandwiches left.",
      "There is a little milk in the fridge.",
      "We don't have enough time.",
      "There were too many mistakes in the essay.",
    ],
    focus:
      "This guide focuses on countable and uncountable nouns, small and large quantities, sufficiency, and expressions such as none, neither and hardly any.",
    sections: [
      {
        title: "Countable and uncountable nouns",
        body: [
          "Countable nouns can be counted and have a plural form.",
          "Uncountable nouns are not normally counted individually and do not usually have a plural form.",
        ],
        examples: [
          { label: "Countable", text: "many people / a few sandwiches" },
          { label: "Uncountable", text: "much information / a little milk" },
          { label: "Countable", text: "one chair / two chairs / several people" },
          { label: "Uncountable", text: "milk / money / information / progress" },
        ],
      },
      {
        title: "Some and any",
        body: [
          "Use some mainly in affirmative sentences.",
          "Use any mainly in negatives and questions.",
          "Some is also common in offers and requests when a positive answer is expected.",
        ],
        examples: [
          { label: "Some", text: "There is some milk in the fridge." },
          { label: "Some", text: "I brought some sandwiches." },
          { label: "Any", text: "We don't have any money." },
          { label: "Offer", text: "Would you like some coffee?" },
        ],
      },
      {
        title: "Much, many and a lot of",
        body: [
          "Use many with plural countable nouns.",
          "Use much with uncountable nouns.",
          "Use a lot of with both types. In affirmative sentences, a lot of is often more natural than much or many.",
        ],
        examples: [
          { label: "Many", text: "We didn't see many people at the concert." },
          { label: "Much", text: "He didn't show much interest." },
          { label: "A lot of", text: "They have a lot of cats." },
          { label: "A lot of", text: "She has a lot of experience." },
        ],
      },
      {
        title: "Few, a few, little and a little",
        body: [
          "A few and a little mean some, so the meaning is relatively positive.",
          "Few and little mean almost none or not enough, so the meaning is negative.",
          "Use few/a few with plural countable nouns and little/a little with uncountable nouns.",
        ],
        examples: [
          { label: "A few", text: "I brought a few sandwiches." },
          { label: "Few", text: "Few people understood the explanation." },
          { label: "A little", text: "There is a little milk left." },
          { label: "Little", text: "We have little time left." },
        ],
      },
      {
        title: "Enough and too much/many",
        body: [
          "Enough means as much or as many as necessary and comes before a noun.",
          "Too many is used with plural countable nouns.",
          "Too much is used with uncountable nouns.",
        ],
        examples: [
          { label: "Enough", text: "We have enough chairs." },
          { label: "Not enough", text: "There weren't enough chairs for everyone." },
          { label: "Too many", text: "There were too many mistakes in the essay." },
          { label: "Too much", text: "He spends too much time online." },
        ],
      },
      {
        title: "Large quantities",
        body: [
          "Plenty of means more than enough. Remember to include of before a noun.",
          "A great deal of is more formal and is used with uncountable nouns.",
          "With plural countable nouns, use expressions such as a large number of or a great many.",
        ],
        examples: [
          { label: "Plenty of", text: "We have plenty of time." },
          { label: "Plenty of", text: "There are plenty of seats." },
          { label: "Formal", text: "There was a great deal of interest in the story." },
          { label: "Plural", text: "a large number of people" },
        ],
      },
      {
        title: "Quantifiers with of",
        body: [
          "Use a quantifier directly before a general noun.",
          "Use of before a determiner or pronoun.",
        ],
        examples: [
          { label: "General", text: "Most people agreed." },
          { label: "Specific", text: "Most of the people in the room agreed." },
          { label: "General", text: "Some information was missing." },
          { label: "Specific", text: "Some of the information in the report was missing." },
        ],
        chips: ["most people", "most of her time", "some information", "some of the information", "few students", "few of us"],
      },
      {
        title: "None, neither and either",
        body: [
          "None means zero people or things in a group and is generally used for groups of more than two.",
          "Neither means not one and not the other of two.",
          "Either means one or the other of two.",
        ],
        examples: [
          { label: "None", text: "None of us had been to Asia." },
          { label: "Neither", text: "Neither of the two applicants was suitable." },
          { label: "Either", text: "Either of the answers could be correct." },
          { label: "Exam distinction", text: "two -> either/neither; more than two -> any/none" },
        ],
      },
      {
        title: "Hardly any",
        body: [
          "Hardly any means almost none or almost no.",
          "It works with both plural countable and uncountable nouns.",
          "Because hardly already has a negative meaning, do not add another negative.",
        ],
        examples: [
          { label: "Plural", text: "We saw hardly any tourists." },
          { label: "Uncountable", text: "There was hardly any traffic." },
          { label: "Of", text: "Hardly any of the proposals were accepted." },
        ],
        avoid: "We didn't see hardly any tourists.",
      },
      {
        title: "Fewer and less",
        body: [
          "Use fewer with plural countable nouns.",
          "Use less with uncountable nouns.",
          "Use far or much to emphasise the difference.",
        ],
        examples: [
          { label: "Fewer", text: "fewer people / fewer mistakes" },
          { label: "Less", text: "less time / less progress" },
          { label: "Emphasis", text: "far fewer people / far less progress / much less time" },
        ],
      },
      {
        title: "Quick reference",
        body: ["Choose the quantifier according to noun type and meaning."],
        table: {
          headers: ["Noun type", "Small quantity", "Large quantity", "Negative/limited"],
          rows: [
            ["plural countable", "a few", "many, a lot of", "few, hardly any"],
            ["uncountable", "a little", "much, a lot of", "little, hardly any"],
            ["both types", "some", "plenty of", "any, enough"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use a countable quantifier with an uncountable noun.",
          "Do not use an uncountable quantifier with a plural noun.",
          "Do not confuse few and a few.",
          "Remember of before determiners and pronouns.",
          "Use none for a known group and nothing for no thing at all.",
        ],
        examples: [
          { label: "Correct", text: "much information" },
          { label: "Correct", text: "a few people" },
          { label: "Correct", text: "most of the students" },
          { label: "Correct", text: "None of the books was useful. / Nothing was useful." },
        ],
      },
    ],
    checklist: [
      "Is the noun countable or uncountable?",
      "Is it singular or plural?",
      "Is the sentence affirmative, negative or a question?",
      "Do I mean some or almost none?",
      "Is the quantity sufficient, insufficient or excessive?",
      "Do I need of before a determiner or pronoun?",
      "Am I referring to two things or a larger group?",
    ],
  },
  "Question forms": {
    title: "Question forms",
    subtitle: "Auxiliaries, word order and direct or indirect questions",
    intro:
      "Most English questions use a different word order from affirmative statements. The key is choosing the right auxiliary and deciding whether the question is direct, indirect, subject or object.",
    examples: [
      "Are you from Spain?",
      "Where do you live?",
      "Can you swim?",
      "Could you tell me where the station is?",
    ],
    focus:
      "This guide focuses on question word order with be, do/does/did, auxiliaries, modals, subject questions, indirect questions and common polite patterns.",
    sections: [
      {
        title: "Questions with be",
        body: [
          "When be is the main verb, put it before the subject.",
          "Do not add do when the main verb is be.",
          "The same pattern applies when be is followed by an adjective.",
        ],
        examples: [
          { label: "Be", text: "Are you from Spain?" },
          { label: "Be", text: "Is she a doctor?" },
          { label: "Past", text: "Where were they yesterday?" },
          { label: "Adjective", text: "Are you willing to help?" },
        ],
        avoid: "Do you are tired?",
      },
      {
        title: "Present and past simple",
        body: [
          "With most other verbs, use do or does in the present simple.",
          "Use did in the past simple.",
          "After do, does or did, use the base form of the main verb.",
        ],
        examples: [
          { label: "Present", text: "Do you work here?" },
          { label: "Present", text: "Where does she live?" },
          { label: "Past", text: "Did you call her?" },
          { label: "Negative", text: "Why didn't you come last night?" },
        ],
        avoid: "Does she works here?",
      },
      {
        title: "Auxiliaries and modals",
        body: [
          "If the sentence already has an auxiliary or modal verb, move it before the subject.",
          "Do not add do when another auxiliary is already present.",
        ],
        examples: [
          { label: "Continuous", text: "She is working. -> Is she working?" },
          { label: "Perfect", text: "They have finished. -> Have they finished?" },
          { label: "Modal", text: "You can swim. -> Can you swim?" },
          { label: "Future", text: "He will come. -> Will he come?" },
        ],
      },
      {
        title: "Question words",
        body: [
          "Question words usually come before the auxiliary and subject.",
          "The usual pattern is question word + auxiliary + subject + main verb.",
        ],
        examples: [
          { label: "Where", text: "Where do you live?" },
          { label: "Why", text: "Why did she leave?" },
          { label: "What", text: "What are they doing?" },
          { label: "How long", text: "How long have you been waiting?" },
        ],
        chips: ["who", "what", "where", "when", "why", "which", "how"],
      },
      {
        title: "Subject and object questions",
        body: [
          "In an object question, the question word asks about the object, so use normal question word order.",
          "In a subject question, the question word itself is the subject, so do not use do, does or did.",
        ],
        examples: [
          { label: "Object", text: "What did Julia open?" },
          { label: "Object", text: "Who did Julia call?" },
          { label: "Subject", text: "Who opened the window?" },
          { label: "Subject", text: "What kept you awake?" },
        ],
        compare: ["Who called you?", "Who did you call?"],
      },
      {
        title: "Indirect questions",
        body: [
          "Indirect questions are often more polite than direct questions.",
          "After the introductory phrase, use statement word order: subject + verb.",
          "Do not use do, does or did inside the indirect question.",
        ],
        examples: [
          { label: "Direct", text: "Where is the station?" },
          { label: "Indirect", text: "Could you tell me where the station is?" },
          { label: "Direct", text: "What time does the bank close?" },
          { label: "Indirect", text: "I was wondering what time the bank closes." },
        ],
        chips: [
          "Could you tell me ...?",
          "Do you know ...?",
          "I was wondering ...",
          "Would you mind telling me ...?",
        ],
      },
      {
        title: "Questions with prepositions",
        body: [
          "In everyday English, the preposition usually stays at the end of the question.",
          "In very formal English, the preposition can come before whom.",
          "When the verb needs an object, make sure it is included.",
        ],
        examples: [
          { label: "Natural", text: "Who are you talking to?" },
          { label: "Natural", text: "Which company does she work for?" },
          { label: "Formal", text: "To whom should I address the complaint?" },
          { label: "Object included", text: "What did you open it with?" },
        ],
      },
      {
        title: "Negative questions",
        body: [
          "Negative questions can express surprise, criticism, expectation or a request for confirmation.",
          "They do not normally sound completely neutral.",
        ],
        examples: [
          { label: "Expectation", text: "Didn't you call her last night?" },
          { label: "Surprise", text: "Haven't you finished yet?" },
          { label: "Confirmation", text: "Isn't she coming with us?" },
        ],
        compare: ["Did you call her?", "Didn't you call her?"],
      },
      {
        title: "Duration and polite forms",
        body: [
          "Use how long to ask about duration.",
          "For an activity that started in the past and continues now, the present perfect continuous is often natural.",
          "Common polite forms include Could you ...?, Would you mind ...? and Are you willing to ...?",
        ],
        examples: [
          { label: "Activity", text: "How long have you been studying English?" },
          { label: "State", text: "How long have you known him?" },
          { label: "Request", text: "Would you mind opening the window?" },
          { label: "Request", text: "Could you help me?" },
        ],
      },
      {
        title: "Quick reference",
        body: ["Choose the question pattern according to the verb type and the question type."],
        table: {
          headers: ["Question type", "Pattern", "Example"],
          rows: [
            ["be", "be + subject", "Are you ready?"],
            ["present simple", "do/does + subject + verb", "Where do you live?"],
            ["past simple", "did + subject + verb", "Why did she leave?"],
            ["auxiliary/modal", "auxiliary + subject", "Can you help?"],
            ["subject question", "question word + verb", "Who opened it?"],
            ["indirect question", "question word + subject + verb", "Do you know where he lives?"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use statement word order in direct questions.",
          "Do not add do to be.",
          "Do not keep the past form after did.",
          "Do not use inversion inside an indirect question.",
          "Do not add did to a subject question.",
          "Do not forget a necessary preposition.",
        ],
        examples: [
          { label: "Correct", text: "Where do you live?" },
          { label: "Correct", text: "Are you ready?" },
          { label: "Correct", text: "Why didn't you call?" },
          { label: "Correct", text: "Could you tell me where the station is?" },
        ],
      },
    ],
    checklist: [
      "Is the main verb be?",
      "Do I need do, does or did?",
      "Is there already an auxiliary or modal verb?",
      "Is the question word the subject or the object?",
      "Is this a direct or indirect question?",
      "Should the preposition stay at the end?",
      "Does a negative question imply an expectation?",
    ],
  },
  "Question tags": {
    title: "Question tags",
    subtitle: "Polarity, auxiliaries and pronouns",
    intro:
      "Question tags are short questions added to the end of a statement. They usually repeat the auxiliary verb and refer back to the subject with a pronoun.",
    examples: [
      "You like spicy food, don't you?",
      "She isn't coming, is she?",
      "They have finished, haven't they?",
      "Let's start the meeting, shall we?",
    ],
    focus:
      "This guide focuses on choosing the correct polarity, auxiliary and pronoun, including special cases with negative words, there, imperatives and let's.",
    sections: [
      {
        title: "Positive statement, negative tag",
        body: [
          "A positive statement normally takes a negative tag.",
          "The basic pattern is positive statement + negative auxiliary + pronoun.",
        ],
        examples: [
          { label: "Present simple", text: "You like spicy food, don't you?" },
          { label: "Be", text: "She is coming, isn't she?" },
          { label: "Perfect", text: "They have finished, haven't they?" },
          { label: "Future", text: "He will help us, won't he?" },
        ],
      },
      {
        title: "Negative statement, positive tag",
        body: [
          "A negative statement normally takes a positive tag.",
          "Do not repeat the negative in the tag.",
        ],
        examples: [
          { label: "Be", text: "She isn't coming, is she?" },
          { label: "Perfect", text: "They haven't finished, have they?" },
          { label: "Modal", text: "We shouldn't leave yet, should we?" },
        ],
        avoid: "She isn't coming, isn't she?",
      },
      {
        title: "Use the same auxiliary",
        body: [
          "The tag normally repeats the auxiliary or modal verb from the statement.",
          "If the statement contains a modal verb, use the same modal in the tag.",
        ],
        examples: [
          { label: "Be", text: "They are watching a film, aren't they?" },
          { label: "Will", text: "She will help, won't she?" },
          { label: "Perfect continuous", text: "You have been working hard, haven't you?" },
          { label: "Modal", text: "He can swim, can't he?" },
        ],
      },
      {
        title: "Use do, does or did",
        body: [
          "If the statement is in the present or past simple and has no auxiliary, use do, does or did.",
          "Use do or does for the present simple and did for the past simple.",
        ],
        examples: [
          { label: "Present simple", text: "You like spicy food, don't you?" },
          { label: "Present simple", text: "She works here, doesn't she?" },
          { label: "Past simple", text: "They arrived late, didn't they?" },
          { label: "Negative", text: "He doesn't drive, does he?" },
        ],
      },
      {
        title: "Have as auxiliary or main verb",
        body: [
          "When have is an auxiliary in a perfect tense, repeat have in the tag.",
          "When have means possession and acts as the main verb, do is normally used in the tag.",
        ],
        examples: [
          { label: "Perfect", text: "They've already met, haven't they?" },
          { label: "Perfect", text: "You've been working hard, haven't you?" },
          { label: "Possession", text: "You have three brothers, don't you?" },
          { label: "Possession", text: "She has a new car, doesn't she?" },
        ],
        note: "In British English, haven't you? can also occur with possession, but don't you? is a safe and widely used form.",
      },
      {
        title: "Negative words without not",
        body: [
          "Some words already have a negative meaning, so they take a positive tag.",
          "These include nobody, no one, nothing, never, hardly, scarcely, rarely and seldom.",
        ],
        examples: [
          { label: "Nobody", text: "Nobody phoned, did they?" },
          { label: "Hardly", text: "He hardly ever calls, does he?" },
          { label: "Never", text: "She never complains, does she?" },
        ],
      },
      {
        title: "Pronouns in tags",
        body: [
          "The subject of the statement is normally replaced by a pronoun.",
          "Words such as everyone, someone and nobody often take they in the tag.",
        ],
        examples: [
          { label: "Name", text: "Maria is here, isn't she?" },
          { label: "Plural", text: "The children are sleeping, aren't they?" },
          { label: "Thing", text: "The meeting starts at ten, doesn't it?" },
          { label: "Everyone", text: "Everyone is here, aren't they?" },
        ],
      },
      {
        title: "There, imperatives and let's",
        body: [
          "With there is/are, repeat there in the tag.",
          "Imperatives commonly take will you?",
          "Suggestions beginning with let's take shall we?",
        ],
        examples: [
          { label: "There", text: "There is enough time, isn't there?" },
          { label: "Imperative", text: "Close the window, will you?" },
          { label: "Invitation", text: "Come in, won't you?" },
          { label: "Let's", text: "Let's take a break, shall we?" },
        ],
      },
      {
        title: "Intonation and meaning",
        body: [
          "Falling intonation usually means the speaker expects agreement and is fairly sure.",
          "Rising intonation usually means the speaker is genuinely checking information.",
        ],
        examples: [
          { label: "Falling", text: "It's a lovely day, isn't it?" },
          { label: "Rising", text: "You sent the email, didn't you?" },
        ],
      },
      {
        title: "Quick reference",
        body: ["Match the tag to the statement's polarity, auxiliary and subject."],
        table: {
          headers: ["Statement", "Tag"],
          rows: [
            ["You like it", "don't you?"],
            ["She doesn't know", "does she?"],
            ["They are coming", "aren't they?"],
            ["He isn't ready", "is he?"],
            ["You have finished", "haven't you?"],
            ["She will help", "won't she?"],
            ["Nobody called", "did they?"],
            ["There are tickets", "aren't there?"],
            ["Close the door", "will you?"],
            ["Let's start", "shall we?"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use the wrong polarity.",
          "Do not use the wrong auxiliary.",
          "Do not forget do in simple tenses.",
          "Treat negative words such as nobody and hardly as negative.",
          "Use shall we after let's.",
        ],
        examples: [
          { label: "Correct", text: "She isn't coming, is she?" },
          { label: "Correct", text: "They're watching a film, aren't they?" },
          { label: "Correct", text: "She works here, doesn't she?" },
          { label: "Correct", text: "Let's begin, shall we?" },
        ],
      },
    ],
    checklist: [
      "Is the statement positive or negative?",
      "Which auxiliary or modal does it use?",
      "Do I need do, does or did?",
      "Which pronoun replaces the subject?",
      "Does the statement contain a negative word such as nobody or hardly?",
      "Is it an imperative or a let's suggestion?",
      "Am I checking information or inviting agreement?",
    ],
  },
  "Relative Clauses": {
    title: "Relative clauses",
    subtitle: "Who, which, that, whose, where and formal relative structures",
    intro:
      "Relative clauses give more information about a person, thing, place or situation. They normally begin with a relative word such as who, which, that, whose, where or whom.",
    examples: [
      "The person who called you is waiting outside.",
      "The book that is on the table is mine.",
      "That is the shop where I buy bread.",
      "She didn't get the job, which surprised everyone.",
    ],
    focus:
      "This guide focuses on defining and non-defining relative clauses, pronoun choice, omitted object pronouns, possession, place clauses, prepositions and formal structures such as none of whom.",
    sections: [
      {
        title: "Defining relative clauses",
        body: [
          "A defining relative clause identifies exactly which person or thing we mean.",
          "Without the relative clause, the meaning may be incomplete or unclear.",
          "Defining relative clauses do not normally use commas.",
        ],
        examples: [
          { label: "Person", text: "The man who lives next door is very friendly." },
          { label: "Thing", text: "The book that is on the table is mine." },
          { label: "Meaning", text: "The man is very friendly. Which man?" },
        ],
      },
      {
        title: "Who, which and that",
        body: [
          "Use who for people.",
          "Use which for things.",
          "In defining clauses, that can often replace who or which.",
        ],
        examples: [
          { label: "Who", text: "I have a friend who speaks three languages." },
          { label: "Which", text: "The proposal which they discussed was rejected." },
          { label: "That", text: "The person that called is waiting outside." },
          { label: "That", text: "The book that I bought was expensive." },
        ],
        note: "That is especially common in everyday English defining clauses.",
      },
      {
        title: "Subject and object pronouns",
        body: [
          "If the relative pronoun is the subject of the relative clause, it cannot be omitted.",
          "If it is the object in a defining clause, it can often be omitted.",
        ],
        examples: [
          { label: "Subject", text: "The woman who lives next door is a doctor." },
          { label: "Object", text: "He's the man who I told you about." },
          { label: "Object omitted", text: "He's the man I told you about." },
          { label: "Object omitted", text: "This is the book I recommended." },
        ],
        avoid: "The woman lives next door is a doctor.",
      },
      {
        title: "Whose for possession",
        body: [
          "Use whose to show that something belongs to or is connected with someone.",
          "Whose is followed by a noun.",
          "It replaces expressions such as her car, his brother or their lessons.",
        ],
        examples: [
          { label: "Possession", text: "The woman whose car was stolen went to the police." },
          { label: "Connection", text: "I met a girl whose brother works with me." },
          { label: "Noun after whose", text: "That's the teacher whose lessons are always interesting." },
        ],
        chips: ["whose car", "whose brother", "whose lessons"],
      },
      {
        title: "Where for places",
        body: [
          "Use where when the relative clause describes something happening in a place.",
          "Where means approximately in which or at which.",
          "Do not add another place preposition after where.",
        ],
        examples: [
          { label: "Place", text: "This is the shop where I buy bread." },
          { label: "Place", text: "She showed me the house where she was born." },
          { label: "Equivalent", text: "the house where she was born / the house in which she was born" },
          { label: "Alternative", text: "the city which I grew up in" },
        ],
        avoid: "the city where I grew up in",
      },
      {
        title: "Non-defining relative clauses",
        body: [
          "A non-defining relative clause adds extra information. It does not identify which person or thing we mean.",
          "These clauses are separated by commas.",
          "In non-defining clauses, do not normally use that and do not omit the relative pronoun.",
        ],
        examples: [
          { label: "Extra information", text: "The meeting, which was very long, finished at ten." },
          { label: "Extra information", text: "He gave me the keys, which I put in my pocket." },
          { label: "Person", text: "My sister, who lives in Valencia, is visiting us." },
        ],
        chips: ["who for people", "which for things", "no that after a comma", "do not omit the pronoun"],
      },
      {
        title: "Which for a whole clause",
        body: [
          "In a non-defining clause, which can refer to the whole previous idea.",
          "It does not necessarily refer only to the nearest noun.",
          "Do not use that in this structure.",
        ],
        examples: [
          { label: "Whole idea", text: "She didn't get the job, which surprised everyone." },
          { label: "Whole idea", text: "He failed the exam, which made his parents angry." },
          { label: "Meaning", text: "She didn't get the job. This surprised everyone." },
        ],
      },
      {
        title: "Who and whom",
        body: [
          "Whom is the formal object form of who.",
          "In everyday English, who is much more common.",
          "After a fronted preposition, use whom.",
        ],
        examples: [
          { label: "Formal", text: "He's the man whom I told you about." },
          { label: "Everyday", text: "He's the man who I told you about." },
          { label: "Omitted", text: "He's the man I told you about." },
          { label: "Fronted preposition", text: "the person to whom I spoke" },
        ],
      },
      {
        title: "Prepositions in relative clauses",
        body: [
          "In informal or neutral style, the preposition usually stays at the end.",
          "In formal style, the preposition can come before which or whom.",
          "Do not use that after a fronted preposition.",
        ],
        examples: [
          { label: "Neutral", text: "The proposal which many people disagreed with was accepted." },
          { label: "Neutral", text: "The city which I grew up in has changed." },
          { label: "Formal", text: "The proposal with which many people disagreed was accepted." },
          { label: "Formal", text: "The decision about which there has been much debate remains unchanged." },
        ],
        chips: ["preposition + which", "preposition + whom"],
      },
      {
        title: "Formal possession and quantities",
        body: [
          "For things, formal English can use of which to show possession.",
          "In formal non-defining clauses, quantity expressions can combine with whom for people and which for things.",
          "These structures come after a comma and cannot normally use that.",
        ],
        examples: [
          { label: "Of which", text: "He bought a car, the engine of which is extremely powerful." },
          { label: "People", text: "Few of the students, none of whom had studied consistently, passed." },
          { label: "Things", text: "She entered two races, neither of which she won." },
          { label: "Things", text: "She gave three reasons, the most convincing of which concerned cost." },
        ],
        chips: ["some of whom", "none of whom", "many of which", "neither of which", "the best of which"],
      },
      {
        title: "Quick reference",
        body: ["Choose the relative word according to meaning, clause type and style."],
        table: {
          headers: ["Use", "Relative word", "Example"],
          rows: [
            ["people", "who/that", "the person who called"],
            ["things", "which/that", "the book that I bought"],
            ["possession", "whose", "the woman whose car was stolen"],
            ["places", "where", "the house where she was born"],
            ["formal object for people", "whom", "the person to whom I spoke"],
            ["whole previous clause", "which", "He failed, which surprised us."],
            ["formal quantity", "of whom/of which", "none of whom, neither of which"],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use which for people.",
          "Do not use that after a comma in a non-defining clause.",
          "Remember that whose needs a noun.",
          "Do not use where and another place preposition together.",
          "Use relative pronouns, not normal pronouns, in formal quantity structures.",
        ],
        examples: [
          { label: "Correct", text: "The woman who called is outside." },
          { label: "Correct", text: "The meeting, which was very long, finished late." },
          { label: "Correct", text: "the woman whose car was stolen" },
          { label: "Correct", text: "She entered two races, neither of which she won." },
        ],
      },
    ],
    checklist: [
      "Am I referring to a person, thing or place?",
      "Is the relative pronoun the subject or object?",
      "Is the clause defining or non-defining?",
      "Do I need commas?",
      "Am I showing possession with whose?",
      "Is which referring to one noun or the whole previous clause?",
      "Should the preposition stay at the end or move before which/whom?",
      "Do I need a formal structure such as none of whom or neither of which?",
    ],
  },
  "Reported Speech": {
    title: "Reported speech",
    subtitle: "Tense changes, reported questions and reporting verb patterns",
    intro:
      "Reported speech tells us what someone said without repeating the exact words. When the reporting verb is in the past, we often change verb tenses, pronouns, time expressions and question word order.",
    examples: [
      'Marta said, "I am tired."',
      "Marta said that she was tired.",
      "He asked whether I had finished.",
      "She told me not to be late.",
    ],
    focus:
      "This guide focuses on say and tell, backshifting, time and place changes, reported questions, commands, reporting verb patterns and reported conditionals.",
    sections: [
      {
        title: "Reporting statements",
        body: [
          "Use say (that) + clause when there is no object immediately after the verb.",
          "Use tell + person + clause when you mention the listener.",
          "That is often omitted in everyday English.",
        ],
        examples: [
          { label: "Say", text: "He said that he was tired." },
          { label: "Say", text: "They said they would leave the next day." },
          { label: "Tell", text: "He told me that he was tired." },
          { label: "Tell", text: "She told us she had finished." },
        ],
        compare: ["He said he was tired.", "He told me he was tired."],
      },
      {
        title: "Backshifting",
        body: [
          "When the reporting verb is in the past, the original tense usually moves one step further into the past.",
          "The past perfect does not normally change.",
        ],
        examples: [
          { label: "Present simple", text: '"I don\'t drink coffee." -> He said he didn\'t drink coffee.' },
          { label: "Present continuous", text: '"I\'m coming." -> She said she was coming.' },
          { label: "Past simple", text: '"I watched the match." -> He said he had watched the match.' },
          { label: "Will/can", text: '"We will leave." -> They said they would leave. / "I can meet you." -> He said he could meet me.' },
        ],
        chips: [
          "present simple -> past simple",
          "present continuous -> past continuous",
          "present perfect -> past perfect",
          "past simple -> past perfect",
          "will -> would",
          "can -> could",
        ],
      },
      {
        title: "When backshifting is optional",
        body: [
          "We do not always need to backshift if the information is still true or relevant.",
          "Backshifting is most important when the report clearly belongs to a past context.",
        ],
        examples: [
          { label: "General truth", text: "The teacher said that water boils at 100°C." },
          { label: "Still true", text: "Elena said she lives in Madrid." },
          { label: "Also possible", text: "Elena said she lived in Madrid." },
          { label: "Past context", text: "She said she was busy that day." },
        ],
      },
      {
        title: "Time and place changes",
        body: [
          "Time and place expressions may change because the speaker's viewpoint has changed.",
          "These changes are only needed when the original expressions are no longer accurate.",
        ],
        examples: [
          { label: "Last week", text: '"I completed it last week." -> She said she had completed it the previous week.' },
          { label: "Tomorrow", text: '"I\'ll call you tomorrow." -> He said he would call me the next day.' },
        ],
        table: {
          headers: ["Direct speech", "Reported speech"],
          rows: [
            ["today", "that day"],
            ["yesterday", "the day before"],
            ["tomorrow", "the next/following day"],
            ["last week", "the previous week"],
            ["next week", "the following week"],
            ["now", "then"],
            ["here", "there"],
            ["this/these", "that/those"],
          ],
        },
      },
      {
        title: "Reported yes/no questions",
        body: [
          "Use if or whether for yes/no questions.",
          "Reported questions use statement word order: if/whether + subject + verb.",
          "Do not use do, does or did inside the reported question.",
        ],
        examples: [
          { label: "Whether", text: '"Have you finished?" -> He asked whether I had finished.' },
          { label: "If", text: '"Can you help me?" -> She asked if I could help her.' },
          { label: "Do question", text: '"Do you work here?" -> She asked if I worked there.' },
        ],
      },
      {
        title: "Reported wh- questions",
        body: [
          "Keep the original question word: who, what, where, when, why or how.",
          "Use statement word order after the question word.",
        ],
        examples: [
          { label: "Where", text: '"Where do you live?" -> She asked where I lived.' },
          { label: "How long", text: '"How long have you worked here?" -> He asked how long I had worked there.' },
        ],
        avoid: "She asked where did I live.",
      },
      {
        title: "Commands and requests",
        body: [
          "Use tell/ask + person + to-infinitive for positive commands and requests.",
          "Use tell/ask + person + not to-infinitive for negative commands.",
          "Do not keep the original imperative form.",
        ],
        examples: [
          { label: "Request", text: '"Arrive earlier." -> She asked me to arrive earlier.' },
          { label: "Command", text: '"Turn off your phones." -> The teacher told us to turn off our phones.' },
          { label: "Negative", text: '"Don\'t be late." -> He told me not to be late.' },
        ],
      },
      {
        title: "Reporting verb patterns",
        body: [
          "Reporting verbs allow us to describe the speaker's purpose more precisely.",
          "Some verbs are followed by a to-infinitive, some by an -ing form, and some by a preposition + -ing.",
          "After a preposition, use the -ing form.",
        ],
        examples: [
          { label: "To-infinitive", text: "The spokesperson refused to answer any questions." },
          { label: "-ing", text: "The athlete denied taking drugs." },
          { label: "Preposition + -ing", text: "The lawyer accused the witness of giving false evidence." },
          { label: "Preposition + -ing", text: "She apologised for arriving late." },
        ],
        chips: ["agree/offer/promise/refuse/threaten + to", "admit/deny/recommend/suggest + -ing", "accuse of / insist on / apologise for + -ing"],
      },
      {
        title: "Reporting with that-clauses",
        body: [
          "Some reporting verbs can introduce a that-clause.",
          "After verbs such as recommend, suggest and insist, formal English may use the base verb.",
          "Should is also common in British English.",
        ],
        examples: [
          { label: "That-clause", text: "He admitted that he had made a mistake." },
          { label: "Base verb", text: "They recommended that we publish the report." },
          { label: "Passive base", text: "She insisted that the contract be rewritten." },
          { label: "Should", text: "They recommended that we should publish it." },
        ],
      },
      {
        title: "Similar verbs, different patterns",
        body: [
          "Deny is followed by an -ing form, but refuse is followed by a to-infinitive.",
          "Suggest and recommend can take an -ing form or a that-clause.",
          "Insist can be followed by on + -ing or by a that-clause.",
        ],
        examples: [
          { label: "Deny/refuse", text: "He denied taking the money. / He refused to answer." },
          { label: "Suggest", text: "She suggested taking the train." },
          { label: "Suggest", text: "She suggested that we take the train." },
          { label: "Insist", text: "He insisted on paying. / He insisted that we stay." },
        ],
      },
      {
        title: "Reported conditionals",
        body: [
          "First conditional forms often backshift when reported.",
          "Second and third conditionals often remain unchanged because they are already past or unreal forms.",
        ],
        examples: [
          { label: "First conditional", text: '"If I see her, I\'ll call you." -> He said that if he saw her, he would call me.' },
          { label: "Second conditional", text: '"If I had more time, I would travel." -> She said that if she had more time, she would travel.' },
        ],
      },
      {
        title: "Quick reference",
        body: ["Choose the reporting pattern according to what was said and the reporting verb."],
        table: {
          headers: ["Type", "Pattern", "Example"],
          rows: [
            ["statement", "say (that) + clause", "He said he was tired."],
            ["statement with listener", "tell + person + clause", "He told me he was tired."],
            ["yes/no question", "ask + if/whether + clause", "She asked if I was ready."],
            ["wh- question", "ask + question word + clause", "She asked where I lived."],
            ["command", "tell + person + to-infinitive", "He told me to wait."],
            ["negative command", "tell + person + not to-infinitive", "He told me not to wait."],
            ["refusal", "refuse + to-infinitive", "She refused to answer."],
            ["denial", "deny + -ing", "She denied taking it."],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not confuse say and tell.",
          "Use statement word order in reported questions.",
          "Use if or whether for reported yes/no questions.",
          "Do not keep the imperative form in reported commands.",
          "Check whether the reporting verb takes an infinitive, an -ing form or a preposition.",
        ],
        examples: [
          { label: "Correct", text: "She said she was tired. / She told me she was tired." },
          { label: "Correct", text: "He asked where I lived." },
          { label: "Correct", text: "He asked whether I had finished." },
          { label: "Correct", text: "She told me not to be late." },
        ],
      },
    ],
    checklist: [
      "Do I need say or tell?",
      "Should the tense be backshifted?",
      "Do pronouns or time expressions need to change?",
      "Is it a statement, question, request or command?",
      "Have I used statement word order in a reported question?",
      "Does the reporting verb take an infinitive, an -ing form or a preposition?",
      "Is the original information still true, making backshift optional?",
    ],
  },
  "unreal forms": {
    title: "Unreal forms",
    subtitle: "Wish, if only, would rather, it's time and as if",
    intro:
      "English often uses a past form to describe an unreal present or future situation. Although the verb looks past, the meaning may refer to now or the future.",
    examples: [
      "I wish I owned a motorbike.",
      "I'd rather you didn't use your phone.",
      "It's high time you started working seriously.",
      "She acts as if she owned the place.",
    ],
    focus:
      "This guide focuses on unreal past forms after wish, if only, would rather, it's time, as if and as though, including present wishes, past regrets and preferences.",
    sections: [
      {
        title: "Wish about the present",
        body: [
          "Use wish + past simple to describe a present situation that you want to be different.",
          "The real situation is usually the opposite.",
          "With be, were is more traditional and formal in unreal situations, though was is common informally.",
        ],
        examples: [
          { label: "Present wish", text: "I wish I owned a motorbike." },
          { label: "Present wish", text: "She wishes she had more free time." },
          { label: "Be", text: "I wish I were more confident." },
          { label: "Reality", text: "I don't own a motorbike." },
        ],
      },
      {
        title: "Wish about arrangements",
        body: [
          "Use a past continuous form when the unwanted situation is an arrangement or activity around now or in the future.",
          "The arrangement is real, but the speaker wants it to be different.",
        ],
        examples: [
          { label: "Future arrangement", text: "I wish we weren't leaving tomorrow." },
          { label: "Current/future activity", text: "She wishes she wasn't working this weekend." },
        ],
      },
      {
        title: "Wish about the past",
        body: [
          "Use wish + past perfect to express regret about a past action or event.",
          "The action did not happen, or happened differently.",
        ],
        examples: [
          { label: "Regret", text: "I wish I had bought that house." },
          { label: "Regret", text: "I wish you had told me you were going to be late." },
          { label: "Regret", text: "She wishes she had studied harder." },
        ],
      },
      {
        title: "Wish + would",
        body: [
          "Use wish + person/thing + would + infinitive for annoyance or a desire for behaviour or a situation to change.",
          "It normally refers to a repeated or continuing problem, not one specific past event.",
          "Do not normally use wish + would simply to talk about your own states or abilities.",
        ],
        examples: [
          { label: "Complaint", text: "I wish you would stop shouting." },
          { label: "Situation", text: "I wish the neighbours would be quieter." },
          { label: "Behaviour", text: "She wishes he would listen to her." },
        ],
        compare: ["I wish you would tell me when you are late.", "I wish you had told me yesterday."],
      },
      {
        title: "If only",
        body: [
          "If only uses the same tense patterns as wish.",
          "It usually sounds stronger or more emotional.",
        ],
        examples: [
          { label: "Present", text: "If only I had more time." },
          { label: "Past regret", text: "If only I had gone to the doctor earlier." },
          { label: "Past regret", text: "If only we had listened to the warning." },
          { label: "Desired change", text: "If only he would stop complaining." },
        ],
      },
      {
        title: "Would rather and would sooner",
        body: [
          "For the same subject, use would rather/sooner + bare infinitive.",
          "For a different subject and a present or future preference, use would rather/sooner + subject + past simple.",
          "For a past preference, use would rather/sooner + subject + past perfect.",
        ],
        examples: [
          { label: "Same subject", text: "I'd rather stay at home." },
          { label: "Same subject", text: "She'd sooner wait until tomorrow." },
          { label: "Different subject", text: "I'd rather you didn't use your phone during dinner." },
          { label: "Past preference", text: "I'd rather you had explained what happened." },
        ],
      },
      {
        title: "It's time",
        body: [
          "Use it's time + subject + past simple when something should happen now or should already have happened.",
          "About time and high time add emphasis and may express impatience or criticism.",
          "It's time to + infinitive is also possible, but after a separate subject use the past form.",
        ],
        examples: [
          { label: "Subject + past", text: "It's time we left." },
          { label: "About time", text: "It's about time the government invested in green energy." },
          { label: "High time", text: "It's high time you started working seriously." },
          { label: "Infinitive", text: "It's time to leave." },
        ],
      },
      {
        title: "As if and as though",
        body: [
          "Use as if or as though to describe how something appears.",
          "When the comparison may be true, use a normal tense.",
          "When the comparison is unreal or clearly untrue, use a past form.",
          "For an unreal past comparison, use the past perfect.",
        ],
        examples: [
          { label: "May be true", text: "It looks as if it is going to rain." },
          { label: "May be true", text: "He sounds as though he knows the answer." },
          { label: "Unreal", text: "She acts as if she owned the place." },
          { label: "Unreal past", text: "He looked as though he had seen a ghost." },
        ],
      },
      {
        title: "Quick reference",
        body: ["Choose the unreal form according to time and meaning."],
        table: {
          headers: ["Meaning", "Structure", "Example"],
          rows: [
            ["unreal present", "wish + past simple", "I wish I had more time."],
            ["unwanted arrangement", "wish + past continuous", "I wish we weren't leaving."],
            ["past regret", "wish + past perfect", "I wish I had gone."],
            ["desired change", "wish + would", "I wish you would stop."],
            ["stronger wish", "if only + unreal form", "If only I had listened."],
            ["same-subject preference", "would rather + infinitive", "I'd rather stay."],
            ["preference about another person", "would rather + past simple", "I'd rather you stayed."],
            ["past preference", "would rather + past perfect", "I'd rather you had stayed."],
            ["delayed action", "it's time + past simple", "It's time we left."],
            ["unreal comparison", "as if + past form", "She acts as if she owned it."],
          ],
        },
      },
      {
        title: "Common mistakes",
        body: [
          "Do not use a present tense after wish for an unreal present situation.",
          "Use past perfect for a past regret.",
          "Do not use would for one specific past regret.",
          "Use a past form after would rather + different subject.",
          "Use a bare infinitive only when would rather has the same subject.",
          "Use a past form after it's high time + subject.",
        ],
        examples: [
          { label: "Correct", text: "I wish I had more time." },
          { label: "Correct", text: "I wish I had bought the house." },
          { label: "Correct", text: "I wish you had told me yesterday." },
          { label: "Correct", text: "I'd rather you didn't say anything." },
        ],
      },
    ],
    checklist: [
      "Does the situation refer to the present, future or past?",
      "Is it a present wish or a past regret?",
      "Am I complaining about behaviour with would?",
      "Does would rather have the same subject or a different one?",
      "Is the preference about now or about an earlier action?",
      "Does it's time require a past form?",
      "Is the comparison after as if/as though real or unreal?",
    ],
  },
};

export function getGrammarTheoryForItem(item) {
  const tags = [];
  if (typeof item?.tag === "string") tags.push(item.tag);
  if (Array.isArray(item?.tags)) tags.push(...item.tags);

  const match = tags.find((tag) => grammarTheoryNotes[tag]);
  return match ? grammarTheoryNotes[match] : null;
}
