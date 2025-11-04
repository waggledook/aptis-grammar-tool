// src/components/vocabulary/data/travelData.js

export const travelData = {
  sets: [
    {
      id: "airport_places",
      title: "At the airport",
      focus: "Nouns: places and things at the airport",

      words: [
        "gate",
        "check-in desk",
        "security check",
        "boarding pass",
        "luggage / baggage",
        "customs",
        "baggage claim",
        "passport control"
      ],

      pairs: [
        {
          term: "gate",
          definition: "Place in the airport where you wait to board your flight.",
          image: "/images/vocab/travel/gate.png"
        },
        {
          term: "check-in desk",
          definition:
            "Where you give your luggage and booking details before you fly, and they give you your boarding pass.",
          image: "/images/vocab/travel/check-in.png"
        },
        {
          term: "security check",
          definition:
            "Airport control where staff scan you and your bag for dangerous or banned items.",
          image: "/images/vocab/travel/security-check.png"
        },
        {
          term: "boarding pass",
          definition: "Document (paper or digital) you must show to get on the plane.",
          image: "/images/vocab/travel/boarding-pass.png"
        },
        {
          term: "luggage / baggage",
          definition:
            "All the bags and suitcases you are travelling with. (Uncountable.)",
          image: "/images/vocab/travel/luggage.png"
        },
        {
          term: "customs",
          definition:
            "Control where officers check what you are bringing into a country (alcohol, cigarettes, food, etc.).",
          image: "/images/vocab/travel/customs.png"
        },
        {
          term: "baggage claim",
          definition:
            "Area where you collect your suitcase after you land. Your bag comes out on a belt.",
          image: "/images/vocab/travel/baggage-claim.png"
        },
        {
          term: "passport control",
          definition: "Official check of your passport when you enter a country.",
          image: "/images/vocab/travel/passport-control.png"
        }
      ],

      distractors: ["runway", "pilot"],

      review: [
        {
          sentence:
            "Please have your passport ready for __________. The officer will ask where you're coming from.",
          answer: "passport control"
        },
        {
          sentence:
            "Excuse me, which __________ do we use for flight BA472 to London?",
          answer: "gate"
        },
        {
          sentence:
            "After we landed we went to __________ to pick up our suitcases.",
          answer: "baggage claim"
        },
        {
          sentence:
            "You can't take that bottle through __________. Put liquids in a small clear bag.",
          answer: "security check"
        },
        {
          sentence:
            "We had to go to the __________ to give them our suitcases and show our booking reference.",
          answer: "check-in desk"
        },
        {
          sentence:
            "My __________ was too heavy, so I had to pay extra at the airport.",
          answer: "luggage / baggage"
        },
        {
          sentence:
            "The officer at __________ asked if we were carrying cigarettes or alcohol.",
          answer: "customs"
        },
        {
          sentence:
            "You must show your __________ before you can get on the plane.",
          answer: "boarding pass"
        }
      ],

      tips: [
        "'Luggage' is uncountable: 'My luggage is here', not 'my luggages are here.'",
        "'Gate' is for planes. 'Platform' is for trains.",
        "You usually go through security check before you board the plane.",
        "Customs and passport control normally happen when you enter a country, not when you leave."
      ]
    },
    {
      id: "holiday_activities",
      title: "Holiday activities",
      focus: "Common things you do on holiday (verb + noun collocations).",

      words: [
        "go abroad",
        "book a flight",
        "stay in a hotel",
        "hire a car",
        "go sightseeing",
        "go to the beach",
        "try local food",
        "buy souvenirs"
      ],

      pairs: [
        {
          term: "go abroad",
          definition: "Travel to a foreign country, not your own.",
          image: "/images/vocab/travel/go-abroad.png"
        },
        {
          term: "book a flight",
          definition: "Arrange and pay for a plane ticket in advance.",
          image: "/images/vocab/travel/book-flight.png"
        },
        {
          term: "stay in a hotel",
          definition:
            "Sleep and live in a hotel for a short time while you are on holiday.",
          image: "/images/vocab/travel/stay-hotel.png"
        },
        {
          term: "hire a car",
          definition:
            "Pay to use a car for a short period, for example for a holiday.",
          image: "/images/vocab/travel/hire-car.png"
        },
        {
          term: "go sightseeing",
          definition:
            "Visit famous buildings and places in a city for pleasure.",
          image: "/images/vocab/travel/go-sightseeing.png"
        },
        {
          term: "go to the beach",
          definition:
            "Spend time by the sea on the sand, often to swim or relax.",
          image: "/images/vocab/travel/go-to-the-beach.png"
        },
        {
          term: "try local food",
          definition: "Eat typical dishes from the place you are visiting.",
          image: "/images/vocab/travel/try-local-food.png"
        },
        {
          term: "buy souvenirs",
          definition:
            "Purchase small gifts or objects to remember your trip or give to other people.",
          image: "/images/vocab/travel/buy-souvenirs.png"
        }
      ],

      // Shown on the right as extra “near miss” options
      distractors: ["miss a flight", "rent a flat"],

      review: [
        {
          sentence:
            "This year we want to __________ and visit Japan for the first time.",
          answer: "go abroad"
        },
        {
          sentence:
            "It's usually cheaper if you __________ a few months before you travel.",
          answer: "book a flight"
        },
        {
          sentence:
            "We decided to __________ near the city centre so we could walk everywhere.",
          answer: "stay in a hotel"
        },
        {
          sentence:
            "If you want to explore the countryside, it's easiest to __________ at the airport.",
          answer: "hire a car"
        },
        {
          sentence:
            "On our first day we took a bus tour to __________ and see the main monuments.",
          answer: "go sightseeing"
        },
        {
          sentence:
            "When the weather is good, we just __________ and swim in the sea.",
          answer: "go to the beach"
        },
        {
          sentence:
            "I always like to __________ when I travel and taste dishes from that region.",
          answer: "try local food"
        },
        {
          sentence:
            "Don't forget to __________ for your family before you come home.",
          answer: "buy souvenirs"
        }
      ],

      tips: [
        "'Go abroad' means go to another country, not just another city in your country.",
        "On holiday we usually 'hire a car' for a short time. People often 'rent a flat / house' for longer periods.",
        "We say 'go sightseeing' to talk about visiting famous places and monuments in a city.",
        "You 'stay in a hotel / apartment / Airbnb' on holiday – we don't normally say 'sleep in a hotel' for the whole stay."
      ]
    },
    {
      id: "destination_adjectives",
      title: "Describing destinations",
      focus: "Adjectives and phrases to describe places, landmarks, and travel destinations.",
    
      words: [
        "picturesque",
        "remote",
        "historic",
        "breathtaking",
        "off the beaten track",
        "touristy",
        "overrated",
        "lively",
        "cosmopolitan",
        "crowded",
        "tacky"
      ],
    
      pairs: [
        {
          term: "picturesque",
          definition: "Very beautiful, especially in a quaint or charming way.",
          image: "/images/vocab/travel/picturesque.png",
          collocation: "a __________ village"
        },
        {
          term: "remote",
          definition: "Far away from towns or cities; isolated and difficult to reach.",
          image: "/images/vocab/travel/remote.png",
          collocation: "a __________ island"
        },
        {
          term: "historic",
          definition: "Important or famous in history.",
          image: "/images/vocab/travel/historic.png",
          collocation: "a __________ city centre"
        },
        {
          term: "breathtaking",
          definition: "Extremely beautiful or impressive.",
          image: "/images/vocab/travel/breathtaking.png",
          collocation: "a __________ view"
        },
        {
          term: "off the beaten track",
          definition: "Far from the usual tourist areas; not visited by many tourists.",
          image: "/images/vocab/travel/off-the-beaten-path.png",
          collocation: "somewhere __________"
        },
        {
          term: "touristy",
          definition:
            "Very full of tourists, often with many souvenir shops and not very authentic.",
          image: "/images/vocab/travel/touristy.png",
          collocation: "a very __________ area"
        },
        {
          term: "overrated",
          definition: "Not as good as many people say or think.",
          image: "/images/vocab/travel/overrrated.png", // match your file name
          collocation: "an __________ tourist attraction"
        },
        {
          term: "lively",
          definition: "Full of activity, energy and fun.",
          image: "/images/vocab/travel/lively.png",
          collocation: "a __________ market"
        },
        {
          term: "cosmopolitan",
          definition:
            "Having people from many different countries and cultures.",
          image: "/images/vocab/travel/cosmopolitan.png",
          collocation: "a __________ city"
        },
        {
          term: "crowded",
          definition: "Full of people, leaving very little space to move.",
          image: "/images/vocab/travel/crowded.png",
          collocation: "a very __________ train"
        },
        {
          term: "tacky",
          definition:
            "Looking cheap and flashy in a way that is not in good taste.",
          image: "/images/vocab/travel/tacky.png",
          collocation: "__________ souvenirs"
        }
      ],
    
      distractors: ["peaceful", "noisy"],
    
      review: [
        {
          sentence:
            "The village was so __________ that every street looked like a postcard.",
          answer: "picturesque"
        },
        {
          sentence:
            "They stayed in a __________ cabin, hours away from the nearest town.",
          answer: "remote"
        },
        {
          sentence:
            "We walked through the __________ city centre, full of old churches and monuments.",
          answer: "historic"
        },
        {
          sentence:
            "The view from the top of the cliff was absolutely __________.",
          answer: "breathtaking"
        },
        {
          sentence:
            "We found a little café __________, far from the busy tourist area.",
          answer: "off the beaten track"
        },
        {
          sentence:
            "That square is so __________ now – just souvenir shops and tour groups everywhere.",
          answer: "touristy"
        },
        {
          sentence:
            "People talk about that monument all the time, but honestly I think it’s __________.",
          answer: "overrated"
        },
        {
          sentence:
            "The old town is really __________ in the evenings, with music and people in the streets.",
          answer: "lively"
        },
        {
          sentence:
            "London is a very __________ city, with people from all over the world.",
          answer: "cosmopolitan"
        },
        {
          sentence:
            "The metro was so __________ that we could hardly move.",
          answer: "crowded"
        },
        {
          sentence:
            "The shop was full of __________ souvenirs like plastic keyrings and glittery magnets.",
          answer: "tacky"
        }
      ],
    
      tips: [
        "Use these adjectives to avoid repeating 'nice' or 'beautiful' when you describe places.",
        "‘Touristy’ is often negative, while ‘popular’ is neutral.",
        "‘Overrated’ means people say it’s great but you don’t agree.",
        "‘Off the beaten track’ is a fixed phrase – don’t say *out of the beaten track*.",
        "‘Tacky’ describes things that look cheap and in bad taste, often souvenirs."
      ]
    }
  ]
};
