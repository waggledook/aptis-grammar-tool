// src/components/vocabulary/data/tvCinemaData.js

export const tvCinemaData = {
  topicKey: "tv_cinema",
  topicTitle: "TV & Cinema",
  sets: [
    {
      id: "tv_programmes",
      title: "TV programmes",
      focus:
        "Common types of shows you find on television and streaming platforms.",
      words: [
        "soap opera",
        "documentary",
        "sitcom",
        "reality show",
        "the news",
        "talk show",
        "series",
        "cartoons",
        "live sports",
        "weather forecast",
      ],
      pairs: [
        {
          term: "soap opera",
          definition:
            "a television story about the daily lives and relationships of the same group of people",
          image: "/images/vocab/tv/soap_opera.png",
          collocation: "watch a popular ____",
        },
        {
          term: "documentary",
          definition:
            "a program that gives facts and information about a real subject",
          image: "/images/vocab/tv/documentary.png",
          collocation: "a nature ____",
        },
        {
          term: "sitcom",
          definition:
            "a funny series where the same characters are in different amusing situations",
          image: "/images/vocab/tv/sitcom.png",
          collocation: "a classic American ____",
        },
        {
          term: "reality show",
          definition:
            "a program about ordinary people filmed in real situations",
          image: "/images/vocab/tv/reality_show.png",
          collocation: "an addictive ____",
        },
        {
          term: "the news",
          definition: "a program that reports on recent events",
          image: "/images/vocab/tv/news.png",
          collocation: "check ____ every evening",
        },
        {
          term: "talk show",
          definition: "a program where a host interviews various guests",
          image: "/images/vocab/tv/talk_show.png",
          collocation: "be a guest on a ____",
        },
        {
          term: "series",
          definition:
            "a set of television programs that continue the same story or theme",
          image: "/images/vocab/tv/series.png",
          collocation: "a hit TV ____",
        },
        {
          term: "cartoons",
          definition: "animated programmes, often for children",
          image: "/images/vocab/tv/cartoons.png",
          collocation: "watch Saturday morning ____",
        },
        {
          term: "weather forecast",
          definition:
            "the part of a TV or radio programme that tells you what the weather will be like",
          image: "/images/vocab/tv/weather_forecast.png",
          collocation: "check the ____ before going out",
        },
        {
          term: "live sports",
          definition:
            "sports events shown on TV at the same time as they are happening",
          image: "/images/vocab/tv/sports_programme.png",
          collocation: "watch ____ on TV",
        },
      ],
      distractors: ["channel", "advert"],
      review: [
        {
          sentence:
            "I missed the __________ this morning, so I don't know if I need an umbrella.",
          answer: "weather forecast",
        },
        {
          sentence:
            "She’s been watching the same __________ for twenty years; she knows all the families.",
          answer: "soap opera",
        },
        {
          sentence:
            "The __________ showed how climate change is affecting the Arctic.",
          answer: "documentary",
        },
        {
          sentence:
            "I love that __________, the characters are hilarious and the episodes are only 20 minutes.",
          answer: "sitcom",
        },
        {
          sentence:
            "Most __________ involve people living together in a house and arguing.",
          answer: "reality shows",
        },
        {
          sentence:
            "I always watch __________ at 10 p.m. to keep up with world events.",
          answer: "the news",
        },
        {
          sentence:
            "The __________ tonight features an interview with a famous actor.",
          answer: "talk show",
        },
        {
          sentence:
            "I'm watching a new crime __________ on Netflix, and every episode ends with a cliffhanger.",
          answer: "series",
        },
        {
          sentence:
            "My kids love watching __________ before they go to school.",
          answer: "cartoons",
        },
        {
          sentence:
            "My dad spends all weekend watching __________ on TV, especially football and tennis.",
          answer: "live sports",
        },
      ],
      tips: [
        "In the UK, people often say 'the telly' for television.",
        "'Soap opera' got its name because the original radio shows were sponsored by soap companies!",
        "A 'series' is the whole show, whereas an 'episode' is a single part.",
      ],
    },
    {
      id: "film_genres",
      title: "Types of films",
      focus:
        "Categorising movies based on their style, tone, and content.",
      words: [
        "thriller",
        "horror",
        "comedy",
        "action film",
        "rom-com",
        "sci-fi",
        "musical",
        "animation",
        "western",
        "historical drama",
      ],
      pairs: [
        {
          term: "thriller",
          definition:
            "an exciting film, often about a crime or a mystery",
          image: "/images/vocab/tv/thriller.png",
          collocation: "a psychological ____",
        },
        {
          term: "horror",
          definition: "a film that is intended to frighten people",
          image: "/images/vocab/tv/horror.png",
          collocation: "watch a scary ____ movie",
        },
        {
          term: "comedy",
          definition: "a film that is intended to make people laugh",
          image: "/images/vocab/tv/comedy.png",
          collocation: "a hilarious ____",
        },
        {
          term: "action film",
          definition:
            "a film with a fast-moving story, often with fights or chases",
          image: "/images/vocab/tv/action.png",
          collocation: "a big-budget ____",
        },
        {
          term: "rom-com",
          definition:
            "short for romantic comedy; a funny movie about love",
          image: "/images/vocab/tv/rom_com.png",
          collocation: "a feel-good ____",
        },
        {
          term: "sci-fi",
          definition:
            "short for science fiction; films about life in the future or in space",
          image: "/images/vocab/tv/sci_fi.png",
          collocation: "a classic ____ movie",
        },
        {
          term: "musical",
          definition:
            "a film in which part or all of the story is told using songs and dancing",
          image: "/images/vocab/tv/musical.png",
          collocation: "a Hollywood ____",
        },
        {
          term: "animation",
          definition:
            "a film made using drawings or computer models to look like they are moving",
          image: "/images/vocab/tv/animation.png",
          collocation: "a computer-generated ____",
        },
        {
          term: "western",
          definition:
            "a film about life in the American Old West, often with cowboys",
          image: "/images/vocab/tv/western.png",
          collocation: "an old-fashioned ____",
        },
        {
          term: "historical drama",
          definition:
            "a film set in the past that tells a serious story about historical events or people",
          image: "/images/vocab/tv/historical_drama.png",
          collocation: "a period ____",
        },
      ],
      distractors: ["plot", "screenplay"],
      review: [
        {
          sentence:
            "I don't like __________ films; they are too scary and I can't sleep afterwards.",
          answer: "horror",
        },
        {
          sentence:
            "The movie was a real __________; I was on the edge of my seat the whole time.",
          answer: "thriller",
        },
        {
          sentence:
            "We went to see a __________ because we wanted something light and funny.",
          answer: "comedy",
        },
        {
          sentence:
            "The latest __________ is full of car chases and explosions.",
          answer: "action film",
        },
        {
          sentence:
            "If you want a sweet story about a couple with a happy ending, watch a __________.",
          answer: "rom-com",
        },
        {
          sentence: "Star Wars is a very famous __________ saga.",
          answer: "sci-fi",
        },
        {
          sentence:
            "The audience clapped after every song in the __________.",
          answer: "musical",
        },
        {
          sentence:
            "Toy Story was a groundbreaking piece of __________.",
          answer: "animation",
        },
        {
          sentence:
            "My grandfather loves old __________ with cowboys, horses, and dusty towns.",
          answer: "western",
        },
        {
          sentence:
            "We watched a __________ about Queen Elizabeth I and life in sixteenth-century England.",
          answer: "historical drama",
        },
      ],
      tips: [
        "Use 'rom-com' and 'sci-fi' in informal speaking; they are more natural than the full names.",
        "When describing a film, try using 'gripping' for a thriller or 'heart-warming' for a rom-com.",
        "Remember: we 'watch' a film at home, but we 'go to the cinema' to see a movie.",
      ],
    },
    {
      id: "cinema_production",
      title: "Behind the scenes",
      focus:
        "The people, parts, and technical elements of film and TV production.",
      words: [
        "director",
        "cast",
        "script",
        "soundtrack",
        "extra",
        "producer",
        "plot",
        "scene",
        "sequel",
        "special effects",
      ],
      pairs: [
        {
          term: "director",
          definition:
            "the person who tells the actors what to do and is in charge of the filming",
          image: "/images/vocab/tv/director.png",
          collocation: "a famous film ____",
        },
        {
          term: "cast",
          definition: "all the actors in a film, play, or show",
          image: "/images/vocab/tv/cast.png",
          collocation: "an all-star ____",
        },
        {
          term: "script",
          definition: "the written text of a film, play, or broadcast",
          image: "/images/vocab/tv/script.png",
          collocation: "write the ____",
        },
        {
          term: "soundtrack",
          definition: "the music used in a film",
          image: "/images/vocab/tv/soundtrack.png",
          collocation: "an award-winning ____",
        },
        {
          term: "extra",
          definition:
            "a person in a film who does not have a speaking part and is usually part of a crowd",
          image: "/images/vocab/tv/extra.png",
          collocation: "work as a movie ____ in the background",
        },
        {
          term: "plot",
          definition: "the main story of a film or book",
          image: "/images/vocab/tv/plot.png",
          collocation: "a complicated ____",
        },
        {
          term: "scene",
          definition: "a part of a film that happens in one place",
          image: "/images/vocab/tv/scene.png",
          collocation: "the opening ____",
        },
        {
          term: "sequel",
          definition:
            "a film that continues the story of a previous film",
          image: "/images/vocab/tv/sequel.png",
          collocation: "film a ____",
        },
        {
          term: "producer",
          definition:
            "the person who manages the business and practical side of making a film or TV show",
          image: "/images/vocab/tv/producer.png",
          collocation: "an executive ____",
        },
        {
          term: "special effects",
          definition:
            "visual or sound tricks used in films to create things that are not real",
          image: "/images/vocab/tv/special_effects.png",
          collocation: "impressive ____",
        },
      ],
      distractors: ["studio", "camera"],
      review: [
        {
          sentence: "Steven Spielberg is a world-famous __________.",
          answer: "director",
        },
        {
          sentence:
            "The __________ of the film includes several Oscar winners.",
          answer: "cast",
        },
        {
          sentence:
            "The actors spent weeks learning their lines from the __________.",
          answer: "script",
        },
        {
          sentence: "I love the _________ of that movie; the music is beautiful.",
          answer: "soundtrack",
        },
        {
          sentence:
            "He earned a little money by being an __________ in a battle scene.",
          answer: "extra",
        },
        {
          sentence:
            "The _________ was so confusing that I didn't understand what was happening.",
          answer: "plot",
        },
        {
          sentence:
            "My favorite __________ is when the two main characters finally meet.",
          answer: "scene",
        },
        {
          sentence:
            "The first movie was great, but the __________ wasn't nearly as good.",
          answer: "sequel",
        },
        {
          sentence:
            "The __________ found the money for the project and made sure filming stayed on schedule.",
          answer: "producer",
        },
        {
          sentence:
            "Modern movies rely heavily on __________ to create alien worlds.",
          answer: "special effects",
        },
      ],
      tips: [
        "The 'cast' refers to the group of actors, while an 'actor' is an individual.",
        "Special effects (often shortened to VFX or SFX) are the visuals created by computers or props.",
        "A 'sequel' comes after the first movie; a 'prequel' tells the story of what happened before.",
      ],
    },
    {
      id: "viewing_experience",
      title: "The viewing experience",
      focus:
        "Terms related to how and where we watch films and TV shows.",
      words: [
        "binge-watch",
        "subtitles",
        "dubbed",
        "premiere",
        "box office",
        "trailer",
        "stream",
        "spoiler",
        "review",
        "credits",
      ],
      pairs: [
        {
          term: "binge-watch",
          definition:
            "to watch several episodes of a television series or programme one after another",
          image: "/images/vocab/tv/binge_watch.png",
          collocation: "____ a whole series",
        },
        {
          term: "subtitles",
          definition:
            "words shown at the bottom of a screen to translate what is being said",
          image: "/images/vocab/tv/subtitles.png",
          collocation: "watch with ____ in your language",
        },
        {
          term: "dubbed",
          definition:
            "when the original speech in a film is replaced by a translation in another language",
          image: "/images/vocab/tv/dubbed.png",
          collocation: "a ____ version of the movie",
        },
        {
          term: "premiere",
          definition:
            "the first public performance or showing of a film",
          image: "/images/vocab/tv/premiere.png",
          collocation: "attend the world ____",
        },
        {
          term: "box office",
          definition:
            "used to describe how successful a film is by the amount of money it earns",
          image: "/images/vocab/tv/box_office.png",
          collocation: "a ____ hit",
        },
        {
          term: "trailer",
          definition:
            "a short film that advertises a new movie or show",
          image: "/images/vocab/tv/trailer.png",
          collocation: "watch the ____ for a future release",
        },
        {
          term: "stream",
          definition:
            "to watch video directly from the internet without downloading it",
          image: "/images/vocab/tv/stream.png",
          collocation: "____ movies online",
        },
        {
          term: "spoiler",
          definition:
            "information that tells you what happens in a story and ruins the surprise",
          image: "/images/vocab/tv/spoiler.png",
          collocation: "avoid seeing a social media ____",
        },
        {
          term: "review",
          definition:
            "an opinion piece that gives judgment about a film, show, or performance",
          image: "/images/vocab/tv/review.png",
          collocation: "read a positive ____",
        },
        {
          term: "credits",
          definition:
            "the list of names shown at the end of a film or programme",
          image: "/images/vocab/tv/credits.png",
          collocation: "stay until the ____",
        },
      ],
      distractors: ["popcorn", "screen"],
      review: [
        {
          sentence:
            "I stayed up all night to __________ the entire season of that new show.",
          answer: "binge-watch",
        },
        {
          sentence:
            "I prefer watching foreign films with __________ so I can hear the original voices.",
          answer: "subtitles",
        },
        {
          sentence:
            "Many children's movies are __________ into different languages.",
          answer: "dubbed",
        },
        {
          sentence:
            "The actors walked the red carpet at the film __________.",
          answer: "premiere",
        },
        {
          sentence:
            "Despite being expensive to make, the movie was a huge __________ success.",
          answer: "box office",
        },
        {
          sentence:
            "The __________ made the movie look exciting, but the actual film was boring.",
          answer: "trailer",
        },
        {
          sentence:
            "Most people now __________ their favorite shows on platforms like Netflix.",
          answer: "stream",
        },
        {
          sentence:
            "Don't tell me the ending! I don't want any __________.",
          answer: "spoilers / spoiler",
        },
        {
          sentence:
            "I read a very positive __________ of the film in the newspaper before I went to see it.",
          answer: "review",
        },
        {
          sentence:
            "There was a surprise scene after the __________, so everyone stayed in their seats.",
          answer: "credits",
        },
      ],
      tips: [
        "'Binge-watch' is a very common B2-level word for modern TV habits.",
        "'Box office' can refer to the physical place where you buy tickets or the financial success of a movie.",
        "A 'spoiler' is something that 'spoils' (ruins) the surprise of the plot.",
      ],
    },
    {
      id: "cinema_critique",
      title: "Critiquing & describing",
      focus:
        "Adjectives to express opinions and reviews of films and TV shows.",
      words: [
        "gripping",
        "moving",
        "predictable",
        "slow-paced",
        "masterpiece",
        "overrated",
        "disappointing",
        "heart-warming",
        "hilarious",
        "thought-provoking",
      ],
      pairs: [
        {
          term: "gripping",
          definition:
            "so exciting that it holds your attention completely",
          image: "/images/vocab/tv/gripping.png",
          collocation: "a ____ thriller",
        },
        {
          term: "moving",
          definition:
            "causing strong feelings of sadness or sympathy",
          image: "/images/vocab/tv/moving.png",
          collocation: "a deeply ____ story",
        },
        {
          term: "predictable",
          definition:
            "happening in a way that you expect and is not at all surprising",
          image: "/images/vocab/tv/predictable.png",
          collocation: "a very ____ ending",
        },
        {
          term: "slow-paced",
          definition: "moving or developing slowly",
          image: "/images/vocab/tv/slow_paced.png",
          collocation: "a ____ drama",
        },
        {
          term: "masterpiece",
          definition: "a work of outstanding artistry or skill",
          image: "/images/vocab/tv/masterpiece.png",
          collocation: "a cinematic ____",
        },
        {
          term: "overrated",
          definition: "not as good as people say it is",
          image: "/images/vocab/tv/overrated.png",
          collocation: "completely ____: I didn't like it",
        },
        {
          term: "disappointing",
          definition: "not as good as you hoped or expected",
          image: "/images/vocab/tv/disappointing.png",
          collocation: "a ____ sequel",
        },
        {
          term: "heart-warming",
          definition:
            "causing feelings of happiness and pleasure",
          image: "/images/vocab/tv/heart_warming.png",
          collocation: "a ____ romantic comedy",
        },
        {
          term: "hilarious",
          definition:
            "extremely funny",
          image: "/images/vocab/tv/hilarious.png",
          collocation: "an absolutely ____ comedy",
        },
        {
          term: "thought-provoking",
          definition:
            "making you think seriously about a subject",
          image: "/images/vocab/tv/thought_provoking.png",
          collocation: "a ____ documentary",
        },
      ],
      distractors: ["amusing", "dull"],
      review: [
        {
          sentence:
            "The plot was so __________ that I couldn't look away from the screen for a second.",
          answer: "gripping",
        },
        {
          sentence:
            "It was such a __________ film that half the audience was in tears by the end.",
          answer: "moving",
        },
        {
          sentence:
            "I didn't like the movie because it was too __________; I knew exactly what would happen.",
          answer: "predictable",
        },
        {
          sentence:
            "The first hour was quite __________, and not much happened.",
          answer: "slow-paced",
        },
        {
          sentence:
            "Many critics believe this film is a __________ and the best of the decade.",
          answer: "masterpiece",
        },
        {
          sentence:
            "Personally, I think the show is __________; it's not nearly as good as everyone says.",
          answer: "overrated",
        },
        {
          sentence:
            "The finale was really __________ after such a great season.",
          answer: "disappointing",
        },
        {
          sentence:
            "It’s a __________ story about a family that the whole audience will love.",
          answer: "heart-warming",
        },
        {
          sentence:
            "The comedy was absolutely __________; I didn't stop laughing.",
          answer: "hilarious",
        },
        {
          sentence:
            "It was a __________ documentary that changed how I think about the environment.",
          answer: "thought-provoking",
        },
      ],
      tips: [
        "Use 'gripping' instead of 'interesting' to sound more advanced.",
        "A 'masterpiece' is the highest praise you can give a film.",
        "Remember: 'overrated' is a common B2-level word used to disagree with popular opinion.",
      ],
    },
  ],
};
