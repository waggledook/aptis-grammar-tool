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
    }
  ]
};
