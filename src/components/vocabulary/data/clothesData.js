// src/components/vocabulary/data/clothesData.js

export const clothesData = {
    sets: [
      {
        id: "clothes_basic",
        title: "Clothes – basic",
        focus: "Everyday clothes you need to describe people and daily routines.",
  
        words: [
          "T-shirt",
          "shirt",
          "jeans",
          "trousers",
          "shorts",
          "skirt",
          "dress",
          "jacket",
          "coat",
          "sweater / jumper",
          "shoes",
          "trainers"
        ],
  
        pairs: [
          {
            term: "T-shirt",
            definition: "Casual short-sleeved top, usually made of cotton.",
            image: "/images/vocab/clothes/t-shirt.png"
          },
          {
            term: "shirt",
            definition:
              "Top with a collar and buttons, often worn for work or formal occasions.",
            image: "/images/vocab/clothes/shirt.png"
          },
          {
            term: "jeans",
            definition: "Casual trousers made of denim.",
            image: "/images/vocab/clothes/jeans.png"
          },
          {
            term: "trousers",
            definition:
              "Clothing that covers each leg separately, usually more formal than jeans.",
            image: "/images/vocab/clothes/trousers.png"
          },
          {
            term: "shorts",
            definition:
              "Short trousers that only cover the top part of the legs.",
            image: "/images/vocab/clothes/shorts.png"
          },
          {
            term: "skirt",
            definition:
              "Piece of clothing that hangs from the waist and covers part of the legs.",
            image: "/images/vocab/clothes/skirt.png"
          },
          {
            term: "dress",
            definition:
              "One-piece clothing that covers the body from shoulders to legs.",
            image: "/images/vocab/clothes/dress.png"
          },
          {
            term: "jacket",
            definition:
              "Short coat that you wear on the upper part of your body.",
            image: "/images/vocab/clothes/jacket.png"
          },
          {
            term: "coat",
            definition:
              "Thick outer clothing that you wear over other clothes to keep warm.",
            image: "/images/vocab/clothes/coat.png"
          },
          {
            term: "sweater / jumper",
            definition:
              "Warm knitted top that you wear over a shirt or T-shirt.",
            image: "/images/vocab/clothes/sweater.png"
          },
          {
            term: "shoes",
            definition:
              "General word for things you wear on your feet outdoors.",
            image: "/images/vocab/clothes/shoes.png"
          },
          {
            term: "trainers",
            definition:
              "Sport shoes that you wear for running or casual activities.",
            image: "/images/vocab/clothes/trainers.png"
          }
        ],
  
        distractors: ["boots", "hoodie"],
  
        review: [
          { sentence: "He usually wears a __________ and jeans to work because the office is quite informal.", answer: "T-shirt / t-shirt" },
        
          { sentence: "I bought a smart __________ for the interview to wear with my trousers.", answer: "shirt" },
        
          { sentence: "It’s freezing outside, so don’t forget your __________.", answer: "coat" },
        
          { sentence: "It might rain later, so take a __________ just in case.", answer: "jacket" },
        
          { sentence: "When it’s really hot, I usually wear __________ instead of trousers.", answer: "shorts" },
        
          { sentence: "She wore a long __________ with sandals on holiday.", answer: "skirt" },
        
          { sentence: "She put on a smart __________ and high heels for the party.", answer: "dress" },
        
          { sentence: "My new __________ are really comfortable for walking around the city.", answer: "shoes" },
        
          { sentence: "I always wear __________ to the gym because they’re more comfortable than shoes.", answer: "trainers" },
        
          { sentence: "I put on a warm __________ because the house was cold.", answer: "jumper / sweater" },
        
          { sentence: "She wore a long __________ with sandals on holiday.", answer: "skirt" },
        
          { sentence: "I wear a __________ with my suit for important meetings.", answer: "tie" },
        ],
        
        tips: [
          "In British English, 'trousers' is common; in American English, people often say 'pants'.",
          "A 'jumper' is British English; 'sweater' is more common in American English.",
          "We normally say 'wear a T-shirt / coat / dress', not *'put a T-shirt' without 'on'."
        ]
      },
  
      {
        id: "clothes_extended",
        title: "Clothes – extended",
        focus: "Extra clothing vocabulary for more detailed descriptions.",
  
        words: [
          "hoodie",
          "sweatshirt",
          "blouse",
          "suit",
          "tie",
          "boots",
          "sandals",
          "heels",
          "raincoat",
          "pyjamas",
          "swimsuit",
          "leggings"
        ],
  
        pairs: [
          {
            term: "hoodie",
            definition:
              "Casual top with long sleeves and a hood, often used for sport or streetwear.",
            image: "/images/vocab/clothes/hoodie.png"
          },
          {
            term: "sweatshirt",
            definition:
              "Warm, casual long-sleeved top, often without a hood.",
            image: "/images/vocab/clothes/sweatshirt.png"
          },
          {
            term: "blouse",
            definition: "Light shirt, usually worn by women.",
            image: "/images/vocab/clothes/blouse.png"
          },
          {
            term: "suit",
            definition:
              "Formal jacket and trousers (and sometimes a waistcoat) made of the same material.",
            image: "/images/vocab/clothes/suit.png"
          },
          {
            term: "tie",
            definition:
              "Thin piece of cloth you wear around your neck with a shirt for formal occasions.",
            image: "/images/vocab/clothes/tie.png"
          },
          {
            term: "boots",
            definition:
              "Shoes that cover your feet and part of your legs, often worn in cold or wet weather.",
            image: "/images/vocab/clothes/boots.png"
          },
          {
            term: "sandals",
            definition:
              "Light open shoes, often worn in hot weather.",
            image: "/images/vocab/clothes/sandals.png"
          },
          {
            term: "heels",
            definition:
              "Elegant shoes with high heels, often worn for parties or formal occasions.",
            image: "/images/vocab/clothes/heels.png"
          },
          {
            term: "raincoat",
            definition:
              "Light coat that keeps you dry in the rain.",
            image: "/images/vocab/clothes/raincoat.png"
          },
          {
            term: "pyjamas",
            definition:
              "Comfortable clothes that you wear in bed.",
            image: "/images/vocab/clothes/pyjamas.png"
          },
          {
            term: "swimsuit",
            definition:
              "Clothing you wear for swimming (for women or children).",
            image: "/images/vocab/clothes/swimsuit.png"
          },
          {
            term: "leggings",
            definition:
              "Tight trousers, often worn for exercise or as casual wear.",
            image: "/images/vocab/clothes/leggings.png"
          }
        ],
  
        distractors: ["uniform", "skirt"],
  
        review: [
          { sentence: "He wore a dark __________ and tie for the interview.", answer: "suit" },
        
          { sentence: "It’s raining hard, so I’m taking my __________.", answer: "raincoat" },
        
          { sentence: "I usually wear __________ when I go to the beach.", answer: "sandals" },
        
          { sentence: "She bought new __________ for the gym because they’re more comfortable than jeans.", answer: "leggings" },
        
          { sentence: "He changed into his __________ before going to bed.", answer: "pyjamas" },
        
          { sentence: "She wore high __________ to the wedding.", answer: "heels" },
        
          { sentence: "He wore a __________ with his shirt for the meeting.", answer: "tie" },
        
          { sentence: "It’s too cold for a T-shirt, so I’ll wear a __________ instead.", answer: "sweatshirt" },
        
          { sentence: "For a more casual look, he put on a __________.", answer: "hoodie" },
        
          { sentence: "She wore a smart __________ to the party — it looked very elegant.", answer: "blouse" },
        
          { sentence: "It was snowing, so I wore my __________ to keep my feet warm.", answer: "boots" },
        
          { sentence: "Don’t forget your __________ for the swimming pool.", answer: "swimsuit" },
        ],
  
        tips: [
          "In British English, 'pyjamas' is usually plural: 'wear pyjamas', not *'a pyjama'.",
          "A 'suit' usually includes a jacket and trousers made from the same material.",
          "Many of these items are very useful for describing clothes in photo tasks."
        ]
      },
  
      {
        id: "accessories",
        title: "Accessories",
        focus: "Things you wear or carry, useful for describing people and outfits.",
  
        words: [
          "hat",
          "cap",
          "scarf",
          "gloves",
          "belt",
          "sunglasses",
          "glasses",
          "watch",
          "bag",
          "backpack",
          "wallet",
          "earrings"
        ],
  
        pairs: [
          {
            term: "hat",
            definition:
              "Clothing you wear on your head, often to keep warm or protect from the sun.",
            image: "/images/vocab/clothes/hat.png"
          },
          {
            term: "cap",
            definition:
              "Casual hat with a stiff front part (a peak), often worn for sport.",
            image: "/images/vocab/clothes/cap.png"
          },
          {
            term: "scarf",
            definition:
              "Long piece of cloth you wear around your neck to keep warm.",
            image: "/images/vocab/clothes/scarf.png"
          },
          {
            term: "gloves",
            definition:
              "Clothing you wear on your hands to keep them warm.",
            image: "/images/vocab/clothes/gloves.png"
          },
          {
            term: "belt",
            definition:
              "Band of leather or cloth that you wear around your waist to hold up trousers or as decoration.",
            image: "/images/vocab/clothes/belt.png"
          },
          {
            term: "sunglasses",
            definition:
              "Dark glasses that protect your eyes from the sun.",
            image: "/images/vocab/clothes/sunglasses.png"
          },
          {
            term: "glasses",
            definition:
              "Lenses in a frame worn in front of the eyes to help you see better.",
            image: "/images/vocab/clothes/glasses.png"
          },
          {
            term: "watch",
            definition:
              "Thing you wear on your wrist to see the time.",
            image: "/images/vocab/clothes/watch.png"
          },
          {
            term: "bag",
            definition:
              "General word for something you carry things in, for example shopping or personal items.",
            image: "/images/vocab/clothes/bag.png"
          },
          {
            term: "backpack",
            definition:
              "Bag that you carry on your back, often with two straps.",
            image: "/images/vocab/clothes/backpack.png"
          },
          {
            term: "wallet",
            definition:
              "Small flat case for money and cards, usually kept in a pocket or bag.",
            image: "/images/vocab/clothes/wallet.png"
          },
          {
            term: "earrings",
            definition:
              "Jewellery that you wear in your ears.",
            image: "/images/vocab/clothes/earrings.png"
          }
        ],
  
        distractors: ["necklace", "umbrella"],
  
        review: [
          { sentence: "It’s very sunny today, so don’t forget your __________ to protect your eyes.", answer: "sunglasses" },
        
          { sentence: "I can’t see the board clearly, so I need to wear my __________.", answer: "glasses" },
        
          { sentence: "It was cold and windy, so I wore a __________ to keep my neck warm.", answer: "scarf" },
        
          { sentence: "My fingers were freezing, so I put on my __________.", answer: "gloves" },
        
          { sentence: "He wore a leather __________ with his jeans.", answer: "belt" },
        
          { sentence: "She always wears a __________ in summer to protect her head from the sun.", answer: "cap" },
        
          { sentence: "He put on a __________ to keep his head warm", answer: "hat" },
        
          { sentence: "He keeps his money and cards in a __________ in his pocket.", answer: "wallet" },
        
          { sentence: "After she learnt to tell the time, she got a beautiful __________ for her birthday", answer: "watch" },
        
          { sentence: "She bought some new __________ to match her necklace.", answer: "earrings" },
        
          { sentence: "I carry my laptop to work in a special __________ for computers.", answer: "bag" },
        
          { sentence: "When I go hiking, I take a __________ for water and snacks.", answer: "backpack" },
        ],
        
  
        tips: [
          "Use 'wear' with most accessories: 'wear a hat / glasses / earrings'.",
          "We say 'put on' or 'take off' a hat, gloves, or glasses when we change them.",
          "'Sunglasses' is always plural in form: 'These sunglasses are new', not *'this sunglasses is new'."
        ]
      },
  
      {
        id: "clothes_verbs",
        title: "Clothing verb phrases",
        focus: "Useful verbs and phrases for talking about clothes and outfits.",
  
        words: [
          "put on",
          "take off",
          "get dressed",
          "get undressed",
          "wear",
          "try on",
          "go shopping",
          "fit",
          "suit",
          "match",
          "dress up",
          "dress casually"
        ],
  
        pairs: [
          {
            term: "put on",
            definition: "Start wearing a piece of clothing or an accessory.",
            image: "/images/vocab/clothes/put-on.png",
            collocation: "__________ your jacket"
          },
          {
            term: "take off",
            definition: "Remove a piece of clothing or an accessory.",
            image: "/images/vocab/clothes/take-off.png",
            collocation: "__________ your t-shirt"
          },
          {
            term: "get dressed",
            definition: "Put your clothes on, usually in the morning or before you go out.",
            image: "/images/vocab/clothes/get-dressed.png",
            collocation: "__________ quickly before work"
          },
          {
            term: "get undressed",
            definition: "Take your clothes off, for example before bed.",
            image: "/images/vocab/clothes/get-undressed.png",
            collocation: "__________ before bed"
          },
          {
            term: "wear",
            definition: "Have clothes, shoes or accessories on your body.",
            image: "/images/vocab/clothes/wear.png",
            collocation: "__________ a sweater every day"
          },
          {
            term: "try on",
            definition: "Put clothes on in a shop to see if they are the right size or if you like them.",
            image: "/images/vocab/clothes/try-on.png",
            collocation: "__________ this jacket"
          },
          {
            term: "go shopping",
            definition: "Go to the shops, for example to buy clothes or food.",
            image: "/images/vocab/clothes/go-shopping.png",
            collocation: "__________ for clothes"
          },
          {
            term: "fit",
            definition: "Be the right size for someone.",
            image: "/images/vocab/clothes/fit.png",
            collocation: "This t-shirt will __________ you perfectly. The right size"
          },
          {
            term: "suit",
            definition: "Look good on someone; be good for their style or appearance.",
            image: "/images/vocab/clothes/suit.png",
            collocation: "That colour doesn't really __________ you. The wrong style"
          },
          {
            term: "match",
            definition: "Look good together (for example, same colour or style).",
            image: "/images/vocab/clothes/match.png",
            collocation: "This t-shirt doesn't __________ these trousers"
          },
          {
            term: "dress up",
            definition: "Wear very smart clothes, often for a special occasion.",
            image: "/images/vocab/clothes/dress-up.png",
            collocation: "__________ for a wedding"
          },
          {
            term: "dress casually",
            definition: "Wear relaxed, informal clothes.",
            image: "/images/vocab/clothes/dress-casually.png",
            collocation: "__________ at the weekend"
          }
        ],
  
        distractors: ["change clothes", "try it on in another size"],
  
        review: [
          { sentence: "This shirt doesn’t __________ me — it’s too small around the shoulders.", answer: "fit" },
        
          { sentence: "That colour really __________ you. You should wear it more often.", answer: "suits / suit" },
        
          { sentence: "These shoes don’t __________ my jacket. They’re a different style.", answer: "match" },
        
          { sentence: "I usually __________ in jeans and a T-shirt at the weekend.", answer: "dress casually" },
        
          { sentence: "You should __________ the coat before you buy it.", answer: "try on" },
        
          { sentence: "It’s hot in here. I’m going to __________ my jacket.", answer: "take off" },
        
          { sentence: "It’s cold outside, so __________ your coat before you go out.", answer: "put on" },
        
          { sentence: "She wants to __________ for the wedding, so she’s wearing her best clothes.", answer: "dress up" },
        
          { sentence: "He __________ before going to bed.", answer: "got undressed / get undressed" },
        
          { sentence: "I need to __________ quickly — we’re leaving in five minutes!", answer: "get dressed" },
        
          { sentence: "I don’t usually __________ black clothes, but I like this outfit.", answer: "wear" },
        
          { sentence: "They often __________ at the weekend, especially when the sales are on.", answer: "go shopping" },
        ],
  
        tips: [
          "Use 'put on' and 'take off' for the action, and 'wear' for the state.",
          "'Fit' is about size, 'suit' is about style and how good it looks, and 'match' is about two items looking good together.",
          "For photo descriptions, phrases like 'He is wearing…' or 'She is dressed very casually' are very natural."
        ]
      }
    ]
  };
  