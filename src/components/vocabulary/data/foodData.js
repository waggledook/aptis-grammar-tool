// src/components/vocabulary/data/foodData.js

export const foodData = {
    topicKey: "food",
    topicTitle: "Food",
    sets: [
      // -------------------------
      // SET 1: FRUIT
      // -------------------------
      {
        id: "food_fruit",
        title: "Fruit",
        focus: "Common fruits you can easily recognise in photos and everyday situations.",
        words: [
          "apple",
          "banana",
          "orange",
          "grapes",
          "strawberry",
          "pineapple",
          "pear",
          "lemon",
          "watermelon",
          "cherries",
        ],
        pairs: [
          {
            term: "apple",
            definition: "a round fruit with red or green skin and crisp flesh",
            image: "/images/vocab/food/apple.png",
            collocation: "",
          },
          {
            term: "banana",
            definition: "a long curved fruit with yellow skin",
            image: "/images/vocab/food/banana.png",
            collocation: "",
          },
          {
            term: "orange",
            definition: "a round citrus fruit with orange skin",
            image: "/images/vocab/food/orange.png",
            collocation: "",
          },
          {
            term: "grapes",
            definition: "small round fruit that grows in bunches",
            image: "/images/vocab/food/grapes.png",
            collocation: "",
          },
          {
            term: "strawberry",
            definition: "a small red fruit with seeds on the outside",
            image: "/images/vocab/food/strawberry.png",
            collocation: "",
          },
          {
            term: "pineapple",
            definition: "a tropical fruit with spiky skin and sweet yellow flesh",
            image: "/images/vocab/food/pineapple.png",
            collocation: "",
          },
          {
            term: "pear",
            definition: "a sweet fruit with a narrow top and wider bottom",
            image: "/images/vocab/food/pear.png",
            collocation: "",
          },
          {
            term: "lemon",
            definition: "a yellow citrus fruit with a sour taste",
            image: "/images/vocab/food/lemon.png",
            collocation: "",
          },
          {
            term: "watermelon",
            definition: "a large fruit with green skin and red flesh",
            image: "/images/vocab/food/watermelon.png",
            collocation: "",
          },
          {
            term: "cherries",
            definition: "small round red fruits with a stone inside",
            image: "/images/vocab/food/cherries.png",
            collocation: "",
          },
        ],
        distractors: ["peach", "mango"],
        review: [
            {
              sentence:
                "The pink lady is a popular type of __________ that is often red or green and has a crisp texture.",
              answer: "apple",
            },
            {
              sentence:
                "Monkeys are often shown eating a __________.",
              answer: "banana",
            },
            {
              sentence:
                "Freshly squeezed __________ juice is a popular breakfast drink.",
              answer: "orange",
            },
            {
              sentence:
                "___________ are used to make wine and raisins.",
              answer: "grapes",
            },
            {
              sentence:
                "She dipped __________ in chocolate and ate it as a dessert.",
              answer: "strawberry / strawberries",
            },
            {
              sentence:
                "A Hawaiian pizza has __________ on it, which some people love and others hate.",
              answer: "pineapple",
            },
            {
              sentence:
                "Some people prefer __________ to apples because they are softer and sweeter.",
              answer: "pear / pears",
            },
            {
              sentence:
                "If you add __________ juice to fish, it tastes fresher.",
              answer: "lemon",
            },
            {
              sentence:
                "They served huge slices of __________ at the picnic, with black seeds in the middle.",
              answer: "watermelon",
            },
            {
              sentence:
                "__________ have a stone (pit) inside it.",
              answer: "cherries",
            },
          ],
        tips: [
          "Fruit words are great for photo description: colours, shapes, and what people are doing (cutting, eating, buying).",
          "For speaking: use details like ‘fresh’, ‘ripe’, ‘juicy’, ‘sour’, ‘sweet’.",
        ],
      },
  
      // -------------------------
      // SET 2: VEGETABLES
      // -------------------------
      {
        id: "food_vegetables",
        title: "Vegetables",
        focus: "Everyday vegetables you see in meals, supermarkets, and cooking photos.",
        words: [
          "carrot",
          "potato",
          "onion",
          "garlic",
          "tomato",
          "cucumber",
          "lettuce",
          "pepper",
          "broccoli",
          "mushrooms",
        ],
        pairs: [
          {
            term: "carrot",
            definition: "an orange vegetable that grows underground",
            image: "/images/vocab/food/carrot.png",
            collocation: "",
          },
          {
            term: "potato",
            definition: "a vegetable that grows underground and is used for chips, mash, etc.",
            image: "/images/vocab/food/potato.png",
            collocation: "",
          },
          {
            term: "onion",
            definition: "a vegetable with layers that can make you cry when you cut it",
            image: "/images/vocab/food/onion.png",
            collocation: "",
          },
          {
            term: "garlic",
            definition: "a strong-smelling ingredient often used in savoury cooking",
            image: "/images/vocab/food/garlic.png",
            collocation: "",
          },
          {
            term: "tomato",
            definition: "a red fruit/vegetable often used in salads and sauces",
            image: "/images/vocab/food/tomato.png",
            collocation: "",
          },
          {
            term: "cucumber",
            definition: "a long green vegetable often used in salads",
            image: "/images/vocab/food/cucumber.png",
            collocation: "",
          },
          {
            term: "lettuce",
            definition: "a leafy vegetable often used in salads and sandwiches",
            image: "/images/vocab/food/lettuce.png",
            collocation: "",
          },
          {
            term: "pepper",
            definition: "a vegetable that can be red, green, or yellow; often used in salads",
            image: "/images/vocab/food/pepper.png",
            collocation: "",
          },
          {
            term: "broccoli",
            definition: "a green vegetable with a thick stem and many small florets",
            image: "/images/vocab/food/broccoli.png",
            collocation: "",
          },
          {
            term: "mushrooms",
            definition: "soft fungi used in cooking; they can be fried or added to sauces",
            image: "/images/vocab/food/mushrooms.png",
            collocation: "",
          },
        ],
        distractors: ["spinach", "aubergine / eggplant"],
        review: [
            {
              sentence:
                "Rabbits are often shown eating a __________.", answer: "carrot" },
                {
                    sentence:
                      "For fish and chips, the __________ are usually deep-fried.",
                    answer: "potato / potatoes",
                  },
            {
              sentence:
                "He cried a bit while chopping an __________.",
              answer: "onion",
            },
            {
                sentence:
                  "The recipe starts: “Crush two cloves of __________ and fry them in olive oil.”",
                answer: "garlic",
              },
              {
                sentence:
                  "A classic pasta sauce is made from __________, olive oil, and herbs.",
                answer: "tomato / tomatoes",
              },
              {
                sentence:
                  "In many salads, __________ is used for a fresh crunch and has lots of water inside.",
                answer: "cucumber",
              },
            {
              sentence:
                "The burger came with a __________ leaf inside the bun.",
              answer: "lettuce",
            },
            {
                sentence:
                  "In the supermarket, you can buy red, yellow, and green __________.",
                answer: "pepper / peppers",
              },
              {
                sentence:
                  "The kids liked __________ as they looked like small green ‘trees’ on the plate.",
                answer: "broccoli",
              },
            {
              sentence:
                "__________ aren't really vegetables, they are the fruiting bodies of fungi.",
              answer: "mushrooms",
            },
          ],
        tips: [
          "‘Pepper’ here means a bell pepper (not black pepper).",
          "For speaking: describe preparation too (chopped, sliced, roasted, steamed).",
        ],
      },
  
      // -------------------------
      // SET 3: ANIMAL PRODUCTS
      // -------------------------
      {
        id: "food_animal_products",
        title: "Animal products",
        focus: "Meat, fish, seafood, and dairy products that appear often in everyday food contexts.",
        words: [
          "chicken",
          "beef",
          "pork",
          "lamb",
          "salmon",
          "tuna",
          "prawns / shrimp",
          "eggs",
          "cheese",
          "milk",
        ],
        pairs: [
          {
            term: "chicken",
            definition: "meat that comes from a chicken",
            image: "/images/vocab/food/chicken.png",
            collocation: "",
          },
          {
            term: "beef",
            definition: "meat that comes from a cow",
            image: "/images/vocab/food/beef.png",
            collocation: "from a cow",
          },
          {
            term: "pork",
            definition: "meat that comes from a pig",
            image: "/images/vocab/food/pork.png",
            collocation: "from a pig",
          },
          {
            term: "lamb",
            definition: "meat that comes from a young sheep",
            image: "/images/vocab/food/lamb.png",
            collocation: "from a sheep",
          },
          {
            term: "salmon",
            definition: "a popular pink fish",
            image: "/images/vocab/food/salmon.png",
            collocation: "a type of fish",
          },
          {
            term: "tuna",
            definition: "a fish often used in sandwiches and salads",
            image: "/images/vocab/food/tuna.png",
            collocation: "a type of fish",
          },
          {
            term: "prawns / shrimp",
            definition: "small seafood often served with pasta or in salads",
            image: "/images/vocab/food/prawns.png",
            collocation: "",
          },
          {
            term: "eggs",
            definition: "food laid by birds, often used for breakfast or baking",
            image: "/images/vocab/food/eggs.png",
            collocation: "",
          },
          {
            term: "cheese",
            definition: "a dairy product made from milk",
            image: "/images/vocab/food/cheese.png",
            collocation: "",
          },
          {
            term: "milk",
            definition: "a white drink that comes from cows (and other animals)",
            image: "/images/vocab/food/milk.png",
            collocation: "",
          },
        ],
        distractors: ["turkey", "yoghurt"],
        review: [
            {
              sentence:
                "She ordered a __________ curry, but asked for no bones and no skin.",
              answer: "chicken",
            },
            {
              sentence:
                "A classic British roast dinner often includes __________ (from a cow) with gravy and Yorkshire pudding.",
              answer: "beef",
            },
            {
              sentence:
                "Traditional __________ sausages are very popular for breakfast in the UK.",
              answer: "pork",
            },
            {
              sentence:
                "He made __________ chops (from young sheep) with rosemary and garlic.",
              answer: "lamb",
            },
            {
              sentence:
                "The __________ was pink in the middle and served with lemon and dill.",
              answer: "salmon",
            },
            {
              sentence:
                "She opened a tin of __________ to make a quick pasta salad.",
              answer: "tuna",
            },
            {
              sentence:
                "The garlic __________ were served as seafood starters with aioli.",
              answer: "prawns / shrimp",
            },
            {
              sentence:
                "For breakfast, he had scrambled __________ on toast.",
              answer: "eggs / egg",
            },
            {
              sentence:
                "He grated some __________ over the pasta before serving it.",
              answer: "cheese",
            },
            {
              sentence:
                "Would you like a splash of __________ in your tea?",
              answer: "milk",
            },
          ],
        tips: [
          "‘Prawns’ (UK) and ‘shrimp’ (US) are often used for the same seafood in everyday English.",
          "For speaking/writing: you can add opinions easily (healthy, tasty, too oily, high in protein).",
        ],
      },
  
      // -------------------------
      // SET 4: COOKING METHODS
      // -------------------------
      {
        id: "food_cooking_methods",
        title: "Cooking methods",
        focus: "Common cooking verbs for describing recipes, routines, and food photos.",
        words: [
          "chop",
          "slice",
          "boil",
          "fry",
          "bake",
          "grill",
          "roast",
          "steam",
          "stir",
          "season",
        ],
        pairs: [
          {
            term: "chop",
            definition: "cut food into small pieces (often roughly)",
            image: "/images/vocab/food/chop.png",
            collocation: "into small pieces",
          },
          {
            term: "slice",
            definition: "cut food into thin flat pieces",
            image: "/images/vocab/food/slice.png",
            collocation: "into thin pieces",
          },
          {
            term: "boil",
            definition: "cook food in hot water",
            image: "/images/vocab/food/boil.png",
            collocation: "in hot water",
          },
          {
            term: "fry",
            definition: "cook food in hot oil in a pan",
            image: "/images/vocab/food/fry.png",
            collocation: "in oil",
          },
          {
            term: "bake",
            definition: "cook food in the oven (bread, cakes, etc.)",
            image: "/images/vocab/food/bake.png",
            collocation: "in the oven",
          },
          {
            term: "grill",
            definition: "cook food under/over direct heat",
            image: "/images/vocab/food/grill.png",
            collocation: "over direct heat",
          },
          {
            term: "roast",
            definition: "cook food in the oven, often meat or vegetables",
            image: "/images/vocab/food/roast.png",
            collocation: "in the oven until browned",
          },
          {
            term: "steam",
            definition: "cook food using vapour from boiling water",
            image: "/images/vocab/food/steam.png",
            collocation: "over hot water",
          },
          {
            term: "stir",
            definition: "move food around with a spoon while cooking",
            image: "/images/vocab/food/stir.png",
            collocation: "with a spoon",
          },
          {
            term: "season",
            definition: "add salt, pepper, herbs, or spices to improve flavour",
            image: "/images/vocab/food/season.png",
            collocation: "with salt and pepper",
          },
        ],
        distractors: ["mix", "pour"],
        review: [
          { sentence: "First, __________ the onions into small pieces.", answer: "chop" },
          { sentence: "Could you __________ the bread, please (cut into pieces)?", answer: "slice" },
          { sentence: "You need to __________ the pasta for about ten minutes.", answer: "boil" },
          { sentence: "He decided to __________ the eggs in a little oil.", answer: "fry" },
          { sentence: "She loves to __________ cakes at the weekend.", answer: "bake" },
          { sentence: "We usually __________ burgers on a barbecue.", answer: "grill" },
          { sentence: "They __________ the chicken with potatoes and carrots.", answer: "roast / roasted" },
          { sentence: "I __________ vegetables because it’s healthier than frying.", answer: "steam" },
          { sentence: "Don’t forget to __________ the sauce so it doesn’t burn.", answer: "stir" },
          { sentence: "Always __________ the soup with salt and pepper before serving it.", answer: "season" },
        ],
        tips: [
          "Cooking verbs are excellent for speaking: they add detail and make answers sound natural.",
          "Remember: bake/roast = oven; fry = oil; boil = water; steam = vapour.",
        ],
      },
  
      // -------------------------
// SET 5: EATING OUT (revised)
// -------------------------
{
    id: "food_eating_out",
    title: "Eating out",
    focus: "Useful restaurant vocabulary for speaking about experiences and writing practical messages.",
    words: [
      "menu",
      "book",
      "order",
      "bill / check",
      "tip",
      "starter / appetiser / appetizer",
      "main course",
      "dessert",
      "takeaway / takeout",
      "send back",
    ],
    pairs: [
      {
        term: "menu",
        definition: "a list of food and drink you can choose from",
        image: "/images/vocab/food/menu.png",
        collocation: "you read it before ordering",
      },
      {
        term: "book",
        definition: "arrange a table in advance at a restaurant",
        image: "/images/vocab/food/book.png",
        collocation: "____ a table",
      },
      {
        term: "order",
        definition: "ask for food and drinks in a restaurant",
        image: "/images/vocab/food/order.png",
        collocation: "_____ food from the waiter",
      },
      {
        term: "bill / check",
        definition: "the paper that shows how much you need to pay",
        image: "/images/vocab/food/bill.png",
        collocation: "ask for the _____ to pay",
      },
      {
        term: "tip",
        definition: "extra money you give to show you’re happy with the service",
        image: "/images/vocab/food/tip.png",
        collocation: "leave a _____ for the waiter",
      },
      {
        term: "starter / appetiser / appetizer",
        definition: "a small dish eaten before the main course",
        image: "/images/vocab/food/starter.png",
        collocation: "order a _____ to begin",
      },
      {
        term: "main course",
        definition: "the biggest/most important part of the meal",
        image: "/images/vocab/food/main_course.png",
        collocation: "the main part of the meal",
      },
      {
        term: "dessert",
        definition: "sweet food eaten at the end of a meal",
        image: "/images/vocab/food/dessert.png",
        collocation: "order ____ for something sweet",
      },
      {
        term: "takeaway / takeout",
        definition: "food you buy from a restaurant and eat somewhere else",
        image: "/images/vocab/food/takeaway.png",
        collocation: "order _____ to eat at home",
      },
      {
        term: "send back",
        definition: "return food to the kitchen because there is a problem with it",
        image: "/images/vocab/food/send_back.png",
        collocation: "____ a dish if it's bad",
      },
    ],
    distractors: ["customer", "complain"],
    review: [
      { sentence: "Could we see the __________, please?", answer: "menu" },
      { sentence: "We should __________ for 8 p.m. because it’s a busy restaurant.", answer: "book / book a table" },
      { sentence: "Are you ready to __________, or do you need more time?", answer: "order" },
      { sentence: "Can we have the __________, please?", answer: "bill / check" },
      { sentence: "In some countries, it’s normal to leave a __________ for good service", answer: "tip" },
      { sentence: "We had soup as a __________ before the steak.", answer: "starter / appetiser / appetizer" },
      { sentence: "For my __________, I’ll have the fish.", answer: "main course" },
      { sentence: "I ordered a cheesecake for __________.", answer: "dessert" },
      { sentence: "Let’s get a __________ tonight and eat at home.", answer: "takeaway / takeout / take-away / take-out" },
      { sentence: "It was undercooked, so we decided to __________ the steak.", answer: "send back" },
    ],
    tips: [
      "In British English, you usually ‘book a table’. In American English, you often ‘make a reservation’.",
      "‘Send back’ is useful for polite complaints: “Sorry, could I send this back? It’s a bit cold.”",
    ],
  },
    ],
  };