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
    }
  ]
};
