// src/components/vocabulary/data/educationData.js

export const educationData = {
  topicKey: "education",
  topicTitle: "Education & Learning",
  sets: [
    {
      id: "edu_verbs",
      title: "Education verb phrases",
      focus:
        "Actions related to studying, exams, and following (or breaking) school rules.",
      words: [
        "revise",
        "take / sit",
        "pass",
        "fail",
        "cheat",
        "misbehave",
        "be punished",
        "be expelled",
        "make",
        "let",
      ],
      pairs: [
        {
          term: "revise",
          definition:
            "study again something you have already learned, in preparation for an exam",
          image: "/images/vocab/education/revise.png",
          collocation: "____ for an English test",
        },
        {
          term: "take / sit",
          definition: "to do an exam or a test",
          image: "/images/vocab/education/take_exam.png",
          collocation: "____ an entrance exam",
        },
        {
          term: "pass",
          definition: "to be successful in an exam or test",
          image: "/images/vocab/education/pass.png",
          collocation: "____ with a high grade",
        },
        {
          term: "fail",
          definition: "to be unsuccessful in an exam or test",
          image: "/images/vocab/education/fail.png",
          collocation: "____ the final exam",
        },
        {
          term: "cheat",
          definition:
            "to behave in a dishonest way in an exam in order to get an advantage",
          image: "/images/vocab/education/cheat.png",
          collocation: "____ in an exam",
        },
        {
          term: "misbehave",
          definition: "to behave badly or not follow the rules",
          image: "/images/vocab/education/misbehave.png",
          collocation: "students who ____ in class",
        },
        {
          term: "be punished",
          definition:
            "to be made to suffer because you have done something wrong",
          image: "/images/vocab/education/punished.png",
          collocation: "____ for breaking the rules",
        },
        {
          term: "be expelled",
          definition:
            "to be officially forced to leave a school or college permanently",
          image: "/images/vocab/education/expelled.png",
          collocation: "____ from school",
        },
        {
          term: "make",
          definition:
            "to force someone to do something they might not want to do",
          image: "/images/vocab/education/make.png",
          collocation: "____ someone do homework",
        },
        {
          term: "let",
          definition: "to give someone permission to do something; to allow",
          image: "/images/vocab/education/let.png",
          collocation: "____ us use our phones",
        },
      ],
      distractors: ["study", "learn"],
      review: [
        {
          sentence: "I need to __________ for my history exam next week.",
          answer: "revise",
        },
        {
          sentence: "How many exams do you have to __________ this term?",
          answer: "take / sit",
        },
        {
          sentence:
            "She was so happy to __________ her driving test on the first try.",
          answer: "pass",
        },
        {
          sentence: "If you don't study, you might __________ the course.",
          answer: "fail",
        },
        {
          sentence:
            "He was caught trying to __________ by looking at his neighbour's paper.",
          answer: "cheat",
        },
        {
          sentence:
            "The teacher sent him out because he continued to __________.",
          answer: "misbehave",
        },
        {
          sentence: "If you arrive late, you will __________.",
          answer: "be punished",
        },
        {
          sentence:
            "The student was __________ after he was caught with drugs.",
          answer: "expelled / be expelled",
        },
        {
          sentence:
            "My parents __________ me study for two hours every night.",
          answer: "make",
        },
        {
          sentence:
            "Our teacher doesn't __________ us eat in the classroom.",
          answer: "let",
        },
      ],
      tips: [
        "In the UK, we 'take' or 'sit' an exam. We don't say 'give' an exam.",
        "'Make' and 'let' are followed by the infinitive without 'to' (e.g., make me do).",
        "'Allow' is followed by 'to' (e.g., allow me to do), but in rules we very often use the adjective/passive form 'allowed': 'We aren't allowed to...'",
      ],
    },
    {
      id: "edu_systems",
      title: "School systems",
      focus:
        "Different levels and types of schools in the UK and US systems.",
      words: [
        "nursery / kindergarten",
        "primary / elementary",
        "secondary / high school",
        "state school",
        "private school",
        "boarding school",
        "terms / semesters",
        "degree",
        "graduate",
      ],
      pairs: [
        {
          term: "nursery / kindergarten",
          definition: "a school for very young children (aged 2-4 or 5)",
          image: "/images/vocab/education/nursery.png",
          collocation: "go to ____",
        },
        {
          term: "primary / elementary",
          definition:
            "the first level of formal school for children (aged 5-11)",
          image: "/images/vocab/education/primary.png",
          collocation: "____ school education",
        },
        {
          term: "secondary / high school",
          definition: "school for students between the ages of 11 and 18",
          image: "/images/vocab/education/secondary.png",
          collocation: "attend ____ school",
        },
        {
          term: "state school",
          definition:
            "a school that is paid for by the government and is free to attend",
          image: "/images/vocab/education/state.png",
          collocation: "the majority go to ____",
        },
        {
          term: "private school",
          definition:
            "a school that is not paid for by the government and where parents pay fees",
          image: "/images/vocab/education/private.png",
          collocation: "expensive ____ schools",
        },
        {
          term: "boarding school",
          definition: "a school where students study, eat, and sleep",
          image: "/images/vocab/education/boarding.png",
          collocation: "stay at a ____",
        },
        {
          term: "terms / semesters",
          definition:
            "the periods of time that the school or university year is divided into",
          image: "/images/vocab/education/terms.png",
          collocation: "the autumn ____",
        },
        {
          term: "degree",
          definition:
            "a qualification given for completing a university course",
          image: "/images/vocab/education/degree.png",
          collocation: "get a ____ in biology",
        },
        {
          term: "graduate",
          definition:
            "a person who has finished their university studies and has a degree",
          image: "/images/vocab/education/graduate.png",
          collocation: "a university ____",
        },
      ],
      distractors: ["college", "academy"],
      review: [
        {
          sentence:
            "Before primary school, many children go to __________.",
          answer: "nursery / kindergarten",
        },
        {
          sentence:
            "In the UK, children start __________ school when they are five.",
          answer: "primary",
        },
        {
          sentence:
            "He is 15, so he is currently in __________ school.",
          answer: "secondary / high",
        },
        {
          sentence:
            "A __________ school is free because it is government-funded.",
          answer: "state",
        },
        {
          sentence:
            "Some parents choose to pay for __________ school to get smaller classes.",
          answer: "private",
        },
        {
          sentence:
            "In a __________ school, you live at the school during the week.",
          answer: "boarding",
        },
        {
          sentence:
            "The academic year is usually divided into three __________ in the UK.",
          answer: "terms",
        },
        {
          sentence:
            "After three years of study, she finally got her __________.",
          answer: "degree",
        },
        {
          sentence:
            "As a university __________, he is now looking for his first professional job.",
          answer: "graduate",
        },
      ],
      tips: [
        "UK: Nursery -> Primary -> Secondary. US: Kindergarten -> Elementary -> Middle -> High School.",
        "UK schools usually have three 'terms'. US schools usually have two 'semesters'.",
        "In the UK, 'public school' actually refers to a very old and expensive type of private school!",
      ],
    },
    {
      id: "edu_higher",
      title: "Higher education",
      focus:
        "Vocabulary for university life, academic levels, and research.",
      words: [
        "campus",
        "halls of residence",
        "undergraduate",
        "postgraduate",
        "Master's degree",
        "PhD / doctorate",
        "dissertation",
        "thesis",
        "faculty",
      ],
      pairs: [
        {
          term: "campus",
          definition:
            "the buildings and the surrounding land of a university or college",
          image: "/images/vocab/education/campus.png",
          collocation: "located on the main ____",
        },
        {
          term: "halls of residence",
          definition:
            "a college or university building where students live",
          image: "/images/vocab/education/halls.png",
          collocation: "live in ____ during the first year",
        },
        {
          term: "undergraduate",
          definition:
            "a student who is studying for their first degree",
          image: "/images/vocab/education/undergrad.png",
          collocation: "a first-year ____",
        },
        {
          term: "postgraduate",
          definition:
            "a student who has already got a first degree and is studying for a further degree",
          image: "/images/vocab/education/postgrad.png",
          collocation: "____ students doing research",
        },
        {
          term: "Master's degree",
          definition:
            "a further degree, usually a one-year course after a first degree",
          image: "/images/vocab/education/masters.png",
          collocation: "do a ____ in Engineering",
        },
        {
          term: "PhD / doctorate",
          definition:
            "the highest university degree, often involving three or more years of research",
          image: "/images/vocab/education/phd.png",
          collocation: "do a ____ to become a doctor",
        },
        {
          term: "dissertation",
          definition:
            "a long piece of writing on a particular subject, often required for a Master's degree",
          image: "/images/vocab/education/dissertation.png",
          collocation: "submit your ____",
        },
        {
          term: "thesis",
          definition:
            "a long piece of writing based on original research, especially for a PhD",
          image: "/images/vocab/education/thesis.png",
          collocation: "write a doctoral ____",
        },
        {
          term: "faculty",
          definition:
            "a department or group of departments in a university",
          image: "/images/vocab/education/faculty.png",
          collocation: "the ____ of Arts and Humanities",
        },
      ],
      distractors: ["staff", "department"],
      review: [
        {
          sentence:
            "The university __________ is spread across several streets in central London.",
          answer: "campus",
        },
        {
          sentence:
            "Many first-year students choose to live in __________.",
          answer: "halls of residence",
        },
        {
          sentence:
            "Students studying for their first degree are called __________.",
          answer: "undergraduates",
        },
        {
          sentence:
            "After her Bachelor's, she became a __________ to do a Master's.",
          answer: "postgraduate",
        },
        {
          sentence:
            "A __________ degree is a common next step after graduating.",
          answer: "Master's",
        },
        {
          sentence:
            "He is doing a __________ in Physics to become a doctor of science.",
          answer: "PhD / doctorate",
        },
        {
          sentence:
            "I have to write a 15,000-word __________ for my Master's.",
          answer: "dissertation",
        },
        {
          sentence:
            "Her doctoral __________ took four years to complete.",
          answer: "thesis",
        },
        {
          sentence:
            "The university is divided into ten different __________.",
          answer: "faculties",
        },
      ],
      tips: [
        "In the US, 'faculty' usually refers to the teaching staff. In the UK, it's a group of departments.",
        "'Dissertation' is often for Master's, while 'Thesis' is usually for a PhD.",
        "Overseas students are those who come from another country to study.",
      ],
    },
    {
      id: "edu_people_methods",
      title: "People & ways of learning",
      focus:
        "Roles in education and the different formats of academic classes.",
      words: [
        "professor",
        "lecturer",
        "tutor",
        "head teacher",
        "pupils",
        "lecture",
        "seminar",
        "tutorial",
        "webinar",
      ],
      pairs: [
        {
          term: "professor",
          definition: "the highest ranked university teacher",
          image: "/images/vocab/education/professor.png",
          collocation: "a ____ who teaches and researches history",
        },
        {
          term: "lecturer",
          definition: "a person who teaches at a university or college",
          image: "/images/vocab/education/lecturer.png",
          collocation: "a senior university ____",
        },
        {
          term: "tutor",
          definition:
            "a teacher who works with a very small group of students or an individual",
          image: "/images/vocab/education/tutor.png",
          collocation: "have a private ____",
        },
        {
          term: "head teacher",
          definition: "the person who is in charge of a school",
          image: "/images/vocab/education/head_teacher.png",
          collocation: "the ____ of the primary school",
        },
        {
          term: "pupils",
          definition:
            "children who are being taught in a school (especially primary)",
          image: "/images/vocab/education/pupils.png",
          collocation: "primary school ____",
        },
        {
          term: "lecture",
          definition:
            "a talk to a large group of students about a subject",
          image: "/images/vocab/education/lecture.png",
          collocation: "attend a ____ with 80 students",
        },
        {
          term: "seminar",
          definition:
            "a class where a smaller group of students discuss a subject with a teacher",
          image: "/images/vocab/education/seminar.png",
          collocation: "a discussion in a weekly ____",
        },
        {
          term: "tutorial",
          definition:
            "a very small class involving a teacher and just one or a few students",
          image: "/images/vocab/education/tutorial.png",
          collocation: "a one-to-one ____",
        },
        {
          term: "webinar",
          definition:
            "a seminar or talk conducted over the internet",
          image: "/images/vocab/education/webinar.png",
          collocation: "join an online ____",
        },
      ],
      distractors: ["staff", "assistant"],
      review: [
        {
          sentence:
            "The __________ gave an inspiring talk about climate change.",
          answer: "professor / lecturer",
        },
        {
          sentence:
            "I missed the __________ this morning, so I have to get the notes from a friend.",
          answer: "lecture",
        },
        {
          sentence:
            "In a __________, we discuss the reading material in small groups.",
          answer: "seminar",
        },
        {
          sentence:
            "I have a __________ with my professor to talk about my essay project.",
          answer: "tutorial",
        },
        {
          sentence:
            "Since I live far away, I attended the __________ via Zoom.",
          answer: "webinar",
        },
        {
          sentence:
            "The __________ is responsible for all the teachers and students in the school.",
          answer: "head teacher / head",
        },
        {
          sentence:
            "The teacher asked the __________ to open their books.",
          answer: "pupils / students",
        },
        {
          sentence:
            "She works as a private __________ helping kids with their maths.",
          answer: "tutor",
        },
      ],
      tips: [
        "Use 'pupils' for younger children (primary) and 'students' for older ones (secondary and university).",
        "A 'lecture' is passive (listening), whereas a 'seminar' is active (discussing).",
        "A 'tutor' provides more personalized or small-group help than a 'lecturer'.",
      ],
    },
  ],
};
