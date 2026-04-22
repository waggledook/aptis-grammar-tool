// src/components/vocabulary/data/transportData.js

export const transportData = {
  topicKey: "transport",
  topicTitle: "Transport & Travel",
  sets: [
    {
      id: "transport_types",
      title: "Transport types",
      focus:
        "Identifying common vehicles and modes of travel for road, rail, air, and water.",
      words: [
        "car",
        "bus",
        "train",
        "bicycle",
        "motorcycle",
        "plane",
        "boat / ferry",
        "tram",
        "taxi",
        "underground / metro",
      ],
      pairs: [
        {
          term: "car",
          definition:
            "a road vehicle with four wheels that can carry a small number of people",
          image: "/images/vocab/transport/car.png",
          collocation: "drive a ____",
        },
        {
          term: "bus",
          definition:
            "a large road vehicle that carries passengers along a fixed route",
          image: "/images/vocab/transport/bus.png",
          collocation: "wait at the ____ stop",
        },
        {
          term: "train",
          definition:
            "a number of vehicles joined together that move along a metal track",
          image: "/images/vocab/transport/train.png",
          collocation: "travel by ____",
        },
        {
          term: "bicycle",
          definition:
            "a vehicle with two wheels that you sit on and move by turning pedals",
          image: "/images/vocab/transport/bicycle.png",
          collocation: "ride a ____",
        },
        {
          term: "motorcycle",
          definition:
            "a fast two-wheeled vehicle with an engine that one or two people can ride",
          image: "/images/vocab/transport/motorbike.png",
          collocation: "ride a ____",
        },
        {
          term: "plane",
          definition:
            "a vehicle with wings and at least one engine that flies through the air",
          image: "/images/vocab/transport/plane.png",
          collocation: "board a ____",
        },
        {
          term: "boat / ferry",
          definition: "a vehicle used for travelling on water",
          image: "/images/vocab/transport/boat.png",
          collocation: "cross by ____",
        },
        {
          term: "tram",
          definition:
            "an electric vehicle for passengers that moves along metal tracks in the street",
          image: "/images/vocab/transport/tram.png",
          collocation: "hop on a ____",
        },
        {
          term: "taxi",
          definition:
            "a car with a driver that you pay to take you exactly where you want to go",
          image: "/images/vocab/transport/taxi.png",
          collocation: "call a ____",
        },
        {
          term: "underground / metro",
          definition:
            "a railway system in a city that runs under the ground",
          image: "/images/vocab/transport/underground.png",
          collocation: "take the ____ to work",
        },
      ],
      distractors: ["engine", "ticket"],
      review: [
        {
          sentence:
            "I usually go to work by __________ because it's easier to park than a big van.",
          answer: "car",
        },
        {
          sentence:
            "The __________ was late, so there were a lot of people waiting at the stop.",
          answer: "bus",
        },
        {
          sentence:
            "We took the high-speed __________ from Madrid to Seville.",
          answer: "train",
        },
        {
          sentence:
            "Cycling is great exercise; I try to use my __________ every day.",
          answer: "bicycle / bike",
        },
        {
          sentence:
            "He prefers going by __________ because it's faster than a bicycle in traffic.",
          answer: "motorcycle / motorbike",
        },
        {
          sentence:
            "The __________ from London to New York takes about eight hours.",
          answer: "plane / flight",
        },
        {
          sentence: "We crossed the river on a small __________.",
          answer: "boat / ferry",
        },
        {
          sentence:
            "In many European cities, the __________ is a popular way to get around the centre.",
          answer: "tram / streetcar",
        },
        {
          sentence:
            "It was raining, so we decided to take a __________ home.",
          answer: "taxi / cab",
        },
        {
          sentence:
            "In Madrid, many people use the __________ every day to avoid road traffic.",
          answer: "underground / metro / subway / tube",
        },
      ],
      tips: [
        "In the UK, we say 'underground' or 'the tube'. In the US, it's the 'subway'.",
        "Use 'ride' for bicycles and motorcycles, but 'drive' for cars and buses.",
        "A 'ferry' is a specific type of boat that carries people and cars across a body of water.",
      ],
    },
    {
      id: "transport_verbs",
      title: "Transport verbs",
      focus:
        "Action phrases used for daily travel routines and using public transport.",
      words: [
        "catch",
        "miss",
        "get on",
        "get off",
        "get in",
        "get out",
        "commute",
        "board",
        "drop off",
        "pick up",
      ],
      pairs: [
        {
          term: "catch",
          definition: "to be in time to get on a bus, train, or plane",
          image: "/images/vocab/transport/catch.png",
          collocation: "____ the 8 a.m. train",
        },
        {
          term: "miss",
          definition: "to arrive too late to get on a bus, train, or plane",
          image: "/images/vocab/transport/miss.png",
          collocation: "____ the last bus",
        },
        {
          term: "get on",
          definition: "to enter a bus, train, or plane",
          image: "/images/vocab/transport/get_on_off.png",
          collocation: "____ the bus quickly",
        },
        {
          term: "get off",
          definition: "to leave a bus, train, or plane",
          image: "/images/vocab/transport/get_on_off.png",
          collocation: "____ at the next stop",
        },
        {
          term: "get in",
          definition: "to enter a car or taxi",
          image: "/images/vocab/transport/get_in_out.png",
          collocation: "____ the taxi",
        },
        {
          term: "get out",
          definition: "to leave a car or taxi",
          image: "/images/vocab/transport/get_in_out.png",
          collocation: "____ of the car",
        },
        {
          term: "commute",
          definition: "to travel regularly between work and home",
          image: "/images/vocab/transport/commute.png",
          collocation: "a long daily ____",
        },
        {
          term: "board",
          definition: "to get on a plane, ship, or train, especially in a formal context",
          image: "/images/vocab/transport/board.png",
          collocation: "____ the plane",
        },
        {
          term: "drop off",
          definition:
            "to take someone to a place in a car and leave them there",
          image: "/images/vocab/transport/drop_off.png",
          collocation: "____ the kids at school",
        },
        {
          term: "pick up",
          definition:
            "to go to a place and collect someone, usually in a car",
          image: "/images/vocab/transport/pick_up.png",
          collocation: "____ a friend from the airport",
        },
      ],
      distractors: ["drive", "travel"],
      review: [
        {
          sentence: "If we don't leave now, we will __________ our flight.",
          answer: "miss",
        },
        {
          sentence:
            "I have to __________ the bus at the corner of my street.",
          answer: "catch",
        },
        {
          sentence:
            "Make sure you __________ the train before it starts moving!",
          answer: "get on",
        },
        {
          sentence:
            "This is our stop, so we need to __________ the bus now.",
          answer: "get off",
        },
        {
          sentence:
            "Hurry up and __________ the taxi before it drives away.",
          answer: "get in",
        },
        {
          sentence:
            "We need to __________ the car and walk the rest of the way.",
          answer: "get out of",
        },
        {
          sentence:
            "He has to __________ for an hour every morning to reach his office.",
          answer: "commute",
        },
        {
          sentence:
            "Passengers should __________ the plane as soon as their row is called.",
          answer: "board",
        },
        {
          sentence:
            "Can you __________ me __________ at the station on your way to work?",
          answer: "drop off",
        },
        {
          sentence:
            "My dad will __________ me __________ from the station at 6 p.m.",
          answer: "pick up",
        },
      ],
      tips: [
        "Use 'get on/off' for large transport (bus, train, plane) and 'get in/out' for small transport (car, taxi).",
        "We 'board' a plane or ship. It's a more formal version of 'get on'.",
        "A 'commuter' is the person who travels to work every day.",
      ],
    },
    {
      id: "roads_driving",
      title: "Roads & driving",
      focus:
        "Vocabulary for road systems, traffic rules, and common driving situations.",
      words: [
        "traffic jam",
        "roundabout",
        "pedestrian crossing",
        "speed limit",
        "lane",
        "fine",
        "parking space",
        "congestion",
        "junction",
        "pavement",
      ],
      pairs: [
        {
          term: "traffic jam",
          definition:
            "a large number of vehicles close together and unable to move or moving very slowly",
          image: "/images/vocab/transport/traffic_jam.png",
          collocation: "be stuck in a ____",
        },
        {
          term: "roundabout",
          definition:
            "a place where three or more roads join and traffic must go around a central island",
          image: "/images/vocab/transport/roundabout.png",
          collocation: "take the second exit at the ____",
        },
        {
          term: "pedestrian crossing",
          definition: "a special place where people can cross a road safely",
          image: "/images/vocab/transport/crossing.png",
          collocation: "wait at the ____",
        },
        {
          term: "speed limit",
          definition:
            "the fastest speed that a vehicle is allowed to go on a particular road",
          image: "/images/vocab/transport/speed_limit.png",
          collocation: "break the ____",
        },
        {
          term: "lane",
          definition:
            "one of the parts that a wide road is divided into by painted lines",
          image: "/images/vocab/transport/lane.png",
          collocation: "stay in the left ____",
        },
        {
          term: "fine",
          definition:
            "money that you have to pay as a punishment for breaking a rule",
          image: "/images/vocab/transport/fine.png",
          collocation: "get a parking ____",
        },
        {
          term: "parking space",
          definition: "a place where a car can be left",
          image: "/images/vocab/transport/parking.png",
          collocation: "find a ____",
        },
        {
          term: "congestion",
          definition:
            "the state of being full or blocked with too much traffic",
          image: "/images/vocab/transport/congestion.png",
          collocation: "heavy traffic ____",
        },
        {
          term: "junction",
          definition: "a place where two or more roads meet or cross",
          image: "/images/vocab/transport/junction.png",
          collocation: "turn left at the ____",
        },
        {
          term: "pavement",
          definition: "the raised path at the side of a road for people to walk on",
          image: "/images/vocab/transport/pavement.png",
          collocation: "walk along the ____",
        },
      ],
      distractors: ["wheel", "petrol"],
      review: [
        {
          sentence:
            "I was late for the meeting because I was stuck in a __________ for thirty minutes.",
          answer: "traffic jam",
        },
        {
          sentence:
            "At the __________, you must give way to traffic coming from the right.",
          answer: "roundabout",
        },
        {
          sentence:
            "Drivers must stop if someone is waiting at the __________.",
          answer: "pedestrian crossing / crosswalk",
        },
        {
          sentence:
            "You shouldn't drive faster than the __________, or you might get a ticket.",
          answer: "speed limit",
        },
        {
          sentence:
            "The motorway has three __________ in each direction.",
          answer: "lane / lanes",
        },
        {
          sentence: "He had to pay a heavy __________ for speeding.",
          answer: "fine",
        },
        {
          sentence:
            "It's almost impossible to find a __________ in the city centre on a Saturday.",
          answer: "parking space / parking spot",
        },
        {
          sentence:
            "The city has introduced a charge to reduce traffic __________.",
          answer: "congestion / traffic congestion",
        },
        {
          sentence:
            "Take the second right after the __________ near the petrol station.",
          answer: "junction / intersection",
        },
        {
          sentence:
            "For safety, children should walk on the __________, not in the road.",
          answer: "pavement / sidewalk",
        },
      ],
      tips: [
        "UK: 'pavement' where you walk. US: 'sidewalk'.",
        "UK: 'motorway'. US: 'highway'.",
        "A 'fine' is the money you pay; a 'ticket' is the piece of paper that tells you about the fine.",
      ],
    },
    {
      id: "transport_adjectives",
      title: "Describing the journey",
      focus:
        "Adjectives to evaluate and describe travel experiences and transport services.",
      words: [
        "crowded",
        "delayed",
        "convenient",
        "eco-friendly",
        "reliable",
        "overpriced",
        "efficient",
        "remote",
        "spacious",
        "exhausting",
      ],
      pairs: [
        {
          term: "crowded",
          definition: "full of people",
          image: "/images/vocab/transport/crowded.png",
          collocation: "a ____ morning train",
        },
        {
          term: "delayed",
          definition: "happening later than the planned time",
          image: "/images/vocab/transport/delayed.png",
          collocation: "the flight was ____",
        },
        {
          term: "convenient",
          definition:
            "suitable for your purposes and needs and causing the least difficulty",
          image: "/images/vocab/transport/convenient.png",
          collocation: "a ____ way to travel",
        },
        {
          term: "eco-friendly",
          definition: "not harmful to the environment",
          image: "/images/vocab/transport/reliable.png",
          collocation: "____ electric buses",
        },
        {
          term: "reliable",
          definition: "can be trusted or depended on",
          image: "/images/vocab/transport/eco_friendly.png",
          collocation: "a ____ bus service",
        },
        {
          term: "overpriced",
          definition: "too expensive; costing more than it is worth",
          image: "/images/vocab/transport/overpriced-v2.png",
          collocation: "____ airport food",
        },
        {
          term: "efficient",
          definition:
            "working well and quickly without wasting time or energy",
          image: "/images/vocab/transport/efficient-v2.png",
          collocation: "an ____ metro system",
        },
        {
          term: "remote",
          definition: "far away from places where other people live",
          image: "/images/vocab/transport/remote-v2.png",
          collocation: "a ____ mountain village",
        },
        {
          term: "spacious",
          definition: "large and with a lot of space inside",
          image: "/images/vocab/transport/spacious.png",
          collocation: "a ____ carriage",
        },
        {
          term: "exhausting",
          definition: "making you feel extremely tired",
          image: "/images/vocab/transport/exhausting.png",
          collocation: "an ____ journey home",
        },
      ],
      distractors: ["comfortable", "noisy"],
      review: [
        {
          sentence:
            "The bus was so __________ that I had to stand for the whole journey.",
          answer: "crowded",
        },
        {
          sentence:
            "Our train was __________ by two hours due to a technical problem.",
          answer: "delayed",
        },
        {
          sentence:
            "Living near the station is very __________ for getting to work.",
          answer: "convenient",
        },
        {
          sentence:
            "Cycling is the most __________ way to get around the city.",
          answer: "eco-friendly / environmentally friendly",
        },
        {
          sentence:
            "The trains in this country are very __________; they always arrive on time.",
          answer: "reliable",
        },
        {
          sentence:
            "I think the train tickets are __________; it's much cheaper to drive.",
          answer: "overpriced",
        },
        {
          sentence:
            "The new airport terminal is very __________; it only took ten minutes to get through security.",
          answer: "efficient",
        },
        {
          sentence:
            "They live in a __________ area that is only accessible by boat.",
          answer: "remote / isolated",
        },
        {
          sentence:
            "The first-class carriage was so __________ that everyone had plenty of room for their bags.",
          answer: "spacious / roomy",
        },
        {
          sentence:
            "After three delayed flights and a six-hour coach ride, the journey felt absolutely __________.",
          answer: "exhausting",
        },
      ],
      tips: [
        "Use 'crowded' for places and 'overcrowded' if it feels dangerous or very uncomfortable.",
        "A 'reliable' service is one you can trust to be there when the timetable says so.",
        "'Convenient' often describes something that saves you time or effort.",
      ],
    },
  ],
};
