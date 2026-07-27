const a2AudioRoot = "/audio/ote/listening/general/part-2/a2-open-day";
const b1AudioRoot = "/audio/ote/listening/general/part-2/b1-volunteering";
const coastalAudioRoot = "/audio/ote/listening/general/part-2/b2-coastal-research";
const careersAudioRoot = "/audio/ote/listening/general/part-2/b2-careers-service";

export const generalListeningPart2Sets = [
  {
    id: "a2-open-day",
    level: "A2",
    title: "Riverside Leisure Centre Open Day",
    description: "Complete five sets of notes about a leisure-centre open day.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${a2AudioRoot}/lecture.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${a2AudioRoot}/question.mp3`,
    instructions:
      "Listen to a member of staff giving information about an open day at a leisure centre. Choose the correct answers to complete the notes. The first one has been done for you.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    example: {
      id: "deadline-example",
      section: "Dates",
      before: "To attend the open day, you must complete the form by",
      after: ".",
      options: ["1 June", "8 June", "15 June"],
      answer: 1,
      review: {
        explanation: "All three dates are heard. The first is the email date, the eighth is the form deadline, and the fifteenth is the open day itself.",
        correctQuote: "complete the online form by the 8th of June",
        distractors: [
          {
            quote: "Our open day is on Saturday the 15th of June.",
            note: "15 June is the date of the event, not the deadline for completing the form.",
          },
          {
            quote: "We sent the first information email on the 1st of June",
            note: "1 June is when the first email was sent.",
          },
        ],
      },
    },
    items: [
      {
        id: "travel",
        section: "Travel",
        before: "The best way to reach the leisure centre is",
        after: ".",
        options: ["by train", "by car", "by bus"],
        answer: 2,
        review: {
          explanation: "The car park is unavailable and the station is a long walk away. The staff member explicitly recommends the special bus.",
          correctQuote: "We recommend using the special bus from the town centre.",
          distractors: [
            {
              quote: "The centre car park will be closed",
              note: "Driving is unsuitable because visitors cannot use the centre car park.",
            },
            {
              quote: "The railway station is about twenty-five minutes away on foot.",
              note: "The train is possible, but the long walk makes it less convenient than the recommended bus.",
            },
          ],
        },
      },
      {
        id: "check-in",
        section: "Check-in",
        before: "When you arrive, you must bring your",
        after: ".",
        options: ["booking email", "visitor card", "health form"],
        answer: 0,
        review: {
          explanation: "Visitors bring or show the booking email. The centre gives them the visitor card, and they complete the health form afterwards.",
          correctQuote: "Please show us the booking email on your phone or bring a printed copy.",
          distractors: [
            {
              quote: "We will then give you a visitor card.",
              note: "The visitor card is provided at check-in; visitors do not bring it.",
            },
            {
              quote: "you will also need to complete a short health form",
              note: "The health form is completed after arrival rather than brought to the centre.",
            },
          ],
        },
      },
      {
        id: "swimming",
        section: "Swimming",
        before: "The beginners’ swimming class starts at",
        after: ".",
        options: ["9.30", "10.00", "10.30"],
        answer: 1,
        review: {
          explanation: "The three times refer to different events: the pool opening, the beginners’ class and the family session.",
          correctQuote: "The beginners’ swimming class starts at ten o’clock",
          distractors: [
            {
              quote: "The swimming pool opens at half past nine.",
              note: "9.30 is the pool opening time, not the class time.",
            },
            {
              quote: "the family swimming session begins at half past ten.",
              note: "10.30 is the start of the family session.",
            },
          ],
        },
      },
      {
        id: "lunch",
        section: "Lunch",
        before: "Visitors who bring their own lunch can eat in the",
        after: ".",
        options: ["café", "sports hall", "garden"],
        answer: 2,
        review: {
          explanation: "The café sells food but does not allow visitors’ own food. The garden has picnic tables for people who bring lunch.",
          correctQuote: "there are picnic tables in the garden.",
          distractors: [
            {
              quote: "the café will sell sandwiches and hot meals.",
              note: "The café sells its own food, and the following sentence says visitors cannot eat their own food there.",
            },
            {
              quote: "The sports hall has machines selling cold drinks.",
              note: "The sports hall is associated with drinks, not a place for eating a packed lunch.",
            },
          ],
        },
      },
      {
        id: "cost",
        section: "Cost",
        before: "The price of individual coaching is",
        after: ".",
        options: ["€8", "€12", "€20"],
        answer: 1,
        review: {
          explanation: "All three prices are genuine, but they refer to a locker deposit, individual coaching and the summer course respectively.",
          correctQuote: "Individual coaching costs twelve euros",
          distractors: [
            {
              quote: "A locker key needs an eight-euro deposit.",
              note: "€8 is a refundable locker-key deposit.",
            },
            {
              quote: "our summer sports course costs twenty euros.",
              note: "€20 is the price of the longer summer course.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Hello, and welcome to Riverside Leisure Centre. Our open day is on Saturday the 15th of June. We sent the first information email on the 1st of June, but please remember that you must complete the online form by the 8th of June if you want to attend.",
      },
      {
        speaker: "Woman",
        text: "Getting here is easy. The centre car park will be closed because we are using it for outdoor games. The railway station is about twenty-five minutes away on foot. We recommend using the special bus from the town centre. It leaves every fifteen minutes and stops outside the main entrance.",
      },
      {
        speaker: "Woman",
        text: "When you arrive, go to the check-in desk. Please show us the booking email on your phone or bring a printed copy. We will then give you a visitor card. Before doing any sports, you will also need to complete a short health form.",
      },
      {
        speaker: "Woman",
        text: "The swimming pool opens at half past nine. The beginners’ swimming class starts at ten o’clock, and the family swimming session begins at half past ten.",
      },
      {
        speaker: "Woman",
        text: "At lunchtime, the café will sell sandwiches and hot meals. You cannot eat your own food there, but there are picnic tables in the garden. The sports hall has machines selling cold drinks.",
      },
      {
        speaker: "Woman",
        text: "Most activities are free. A locker key needs an eight-euro deposit. Individual coaching costs twelve euros, and our summer sports course costs twenty euros.",
      },
      {
        speaker: "Woman",
        text: "We hope you enjoy the day.",
      },
    ],
  },
  {
    id: "b1-volunteering",
    level: "B1",
    title: "Local Volunteering Opportunities",
    description: "Complete five sets of notes comparing local volunteering opportunities.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${b1AudioRoot}/lecture.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${b1AudioRoot}/question.mp3`,
    instructions:
      "Listen to a student giving a friend information about some local volunteering opportunities. Choose the correct answers to complete the notes. The first one has been done for you.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    example: {
      id: "source-example",
      section: "General information",
      before: "The speaker found the opportunities on a",
      after: ".",
      options: ["college noticeboard", "local website", "social media page"],
      answer: 1,
      review: {
        explanation: "The college notice only supplied a department name and social media contained little detail. The complete information came from a local website.",
        correctQuote: "local website",
        distractors: [
          {
            quote: "A notice at college gave the name of the council department, but no real details.",
            note: "The college notice did not contain the full details.",
          },
          {
            quote: "sharing the opportunities on social media",
            note: "The social-media information is described as incomplete.",
          },
        ],
      },
    },
    items: [
      {
        id: "community-garden",
        section: "Community garden",
        before: "The garden particularly needs people who can",
        after: ".",
        options: ["work at weekends", "drive a van", "give gardening advice"],
        answer: 0,
        review: {
          explanation: "The garden already has experienced advisers and only the manager may drive the van. Its actual shortage is people available on Saturdays and Sundays.",
          correctQuote: "What they particularly need is people who can come on Saturdays or Sundays",
          distractors: [
            {
              quote: "several experienced gardeners can advise new volunteers.",
              note: "Gardening advice is already available, so this is not the skill being requested.",
            },
            {
              quote: "only the manager is allowed to drive it.",
              note: "New volunteers are not being recruited to drive the van.",
            },
          ],
        },
      },
      {
        id: "animal-rescue",
        section: "Animal rescue centre",
        before: "New volunteers initially help with",
        after: ".",
        options: ["preparing food", "cleaning animal areas", "taking dogs outside"],
        answer: 1,
        review: {
          explanation: "All three are genuine tasks, but “initially” directs candidates to the first two weeks, when everyone cleans cages and other animal areas.",
          correctQuote: "During the first two weeks, however, everyone begins by cleaning cages and other animal areas.",
          distractors: [
            {
              quote: "volunteers can do that once they have some experience.",
              note: "Walking dogs becomes possible later, not during the initial period.",
            },
            {
              quote: "After that, some volunteers help prepare food",
              note: "Food preparation is a real duty, but it is not identified as every new volunteer’s starting task.",
            },
          ],
        },
      },
      {
        id: "museum-training",
        section: "Town museum",
        before: "Everyone who volunteers at the museum must",
        after: ".",
        options: ["be at least 21", "have computer skills", "attend a training session"],
        answer: 2,
        review: {
          explanation: "The age and computer requirements are explicitly weakened. The short training session is the only condition that applies to every volunteer.",
          correctQuote: "The one requirement for everybody is to attend a short training session before their first shift.",
          distractors: [
            {
              quote: "there’s no minimum age of twenty-one.",
              note: "The speaker explicitly rejects 21 as the minimum age.",
            },
            {
              quote: "Computer skills are useful for some office work but aren’t essential.",
              note: "Computer knowledge may help, but it is not compulsory.",
            },
          ],
        },
      },
      {
        id: "museum-saturday",
        section: "Town museum",
        before: "On Saturdays, volunteers are mainly needed to",
        after: ".",
        options: ["welcome visitors", "organize old objects", "work in the café"],
        answer: 0,
        review: {
          explanation: "Cataloguing and café work are real museum roles, but those posts are already covered. Saturday demand is at the entrance, greeting and assisting visitors.",
          correctQuote: "On Saturdays, the museum particularly needs people near the entrance to greet visitors",
          distractors: [
            {
              quote: "Volunteers also help catalogue old photographs and objects",
              note: "The museum already has enough people doing this work.",
            },
            {
              quote: "there are sometimes shifts in the café",
              note: "Café work is another genuine role that is not currently short of volunteers.",
            },
          ],
        },
      },
      {
        id: "food-bank",
        section: "Food bank",
        before: "The food bank may suit the listener because",
        after: ".",
        options: ["transport costs are paid", "the working hours are flexible", "volunteers receive free meals"],
        answer: 1,
        review: {
          explanation: "Travel is not normally paid and lunch is conditional. The recommendation is based on choosing different hours each week around the listener’s classes.",
          correctQuote: "there are no fixed shifts, and you can choose different hours each week.",
          distractors: [
            {
              quote: "It doesn’t normally pay travel expenses.",
              note: "The recording directly rejects paid transport costs.",
            },
            {
              quote: "Volunteers who stay all day can also have lunch there",
              note: "Lunch is available only to all-day volunteers and is not the reason this option suits the listener.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Hi, Alex. I’ve been looking into volunteering, like we talked about. A notice at college gave the name of the council department, but no real details. I found everything on a local website in the end. Someone has also started sharing the opportunities on social media, although that page is still fairly basic.",
      },
      {
        speaker: "Woman",
        text: "The community garden is struggling most at weekends. What they particularly need is people who can come on Saturdays or Sundays, as most current volunteers prefer weekdays. You don’t need to be an expert because several experienced gardeners can advise new volunteers. The project also has a van for moving tools, but only the manager is allowed to drive it.",
      },
      {
        speaker: "Woman",
        text: "Then there’s the animal rescue centre. You said you’d enjoy taking dogs outside, and volunteers can do that once they have some experience. During the first two weeks, however, everyone begins by cleaning cages and other animal areas. After that, some volunteers help prepare food as well as caring for the animals.",
      },
      {
        speaker: "Woman",
        text: "The town museum also needs help. Sixteen- and seventeen-year-olds can apply with permission from a parent, so there’s no minimum age of twenty-one. Computer skills are useful for some office work but aren’t essential. The one requirement for everybody is to attend a short training session before their first shift.",
      },
      {
        speaker: "Woman",
        text: "On Saturdays, the museum particularly needs people near the entrance to greet visitors, hand out maps and answer simple questions. Volunteers also help catalogue old photographs and objects, and there are sometimes shifts in the café, but those areas are currently well covered.",
      },
      {
        speaker: "Woman",
        text: "The final option is the food bank. It doesn’t normally pay travel expenses. The advantage for you is the timetable: there are no fixed shifts, and you can choose different hours each week. Volunteers who stay all day can also have lunch there, although shorter shifts don’t include a meal.",
      },
      {
        speaker: "Woman",
        text: "Let me know which one sounds best.",
      },
    ],
  },
  {
    id: "b2-coastal-research",
    level: "B2",
    title: "Coastal Research Weekend",
    description: "Complete five sets of notes about arrangements for a coastal research weekend.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${coastalAudioRoot}/lecture.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${coastalAudioRoot}/question.mp3`,
    instructions:
      "Listen to a course organiser giving students information about a coastal research weekend. Choose the correct answers to complete the notes. The first one has been done for you.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    example: {
      id: "registration-example",
      section: "Arrival",
      before: "Registration will take place at the",
      after: ".",
      options: ["railway station", "visitor centre", "university campus"],
      answer: 1,
      review: {
        explanation: "The coach leaves the campus and collects two students at the station, but everyone registers at the visitor centre after arriving on the coast.",
        correctQuote: "everyone must report to the visitor centre",
        distractors: [
          {
            quote: "The coach will leave the university campus",
            note: "The university campus is the coach’s departure point, not the registration location.",
          },
          {
            quote: "We’ll collect two students from the railway station on the way, but please don’t try to register there.",
            note: "The station is only a collection point, and the speaker explicitly says not to register there.",
          },
        ],
      },
    },
    items: [
      {
        id: "before-trip",
        section: "Before the trip",
        before: "Students must",
        after: ".",
        options: ["submit medical information", "choose their final research group", "pay an equipment deposit"],
        answer: 0,
        review: {
          explanation: "Research groups are confirmed after arrival and there is no deposit. The compulsory pre-trip action is submitting the medical form.",
          correctQuote: "What we do need by Monday is the confidential medical form available on the course website.",
          distractors: [
            {
              quote: "final groups won’t be confirmed until the first evening.",
              note: "Students do not choose a final group before travelling; groups are confirmed on the first evening.",
            },
            {
              quote: "There is no equipment deposit to pay before the trip.",
              note: "The speaker explicitly rules out an equipment deposit.",
            },
          ],
        },
      },
      {
        id: "first-fieldwork",
        section: "Fieldwork",
        before: "The first fieldwork activity on Saturday will be",
        after: ".",
        options: ["testing seawater", "surveying birds", "mapping sand dunes"],
        answer: 1,
        review: {
          explanation: "Water testing was the original plan but has moved to the afternoon. Dune mapping is on Sunday, so Saturday begins with the bird survey.",
          correctQuote: "We’ll now start with the bird survey on the northern beach.",
          distractors: [
            {
              quote: "We originally intended to begin Saturday with water testing near the harbour.",
              note: "Water testing was the original first activity, but the schedule has changed.",
            },
            {
              quote: "Mapping the sand dunes will take place after lunch on Sunday.",
              note: "Dune mapping happens the following day.",
            },
          ],
        },
      },
      {
        id: "equipment-fee",
        section: "Equipment",
        before: "The equipment fee includes the use of",
        after: ".",
        options: ["waterproof clothing", "binoculars", "GPS devices"],
        answer: 2,
        review: {
          explanation: "Students provide their own waterproof clothing and binoculars are free. The fee specifically covers GPS devices and their software.",
          correctQuote: "The twenty-euro equipment fee covers the use of GPS devices",
          distractors: [
            {
              quote: "You should bring your own waterproof coat and boots",
              note: "Waterproof clothing is not supplied through the equipment fee.",
            },
            {
              quote: "The nature reserve supplies binoculars free of charge.",
              note: "Binoculars are supplied, but there is no charge for using them.",
            },
          ],
        },
      },
      {
        id: "research-groups",
        section: "Research groups",
        before: "Students are placed in groups mainly according to their",
        after: ".",
        options: ["degree subject", "research interests", "previous fieldwork experience"],
        answer: 1,
        review: {
          explanation: "Degree subject and experience are used to balance the teams. The main matching criterion is the research area selected on the application.",
          correctQuote: "The main factor is the research area you selected on your application",
          distractors: [
            {
              quote: "We try to mix students from different degree subjects",
              note: "Degree subjects are deliberately mixed rather than used as the principal grouping criterion.",
            },
            {
              quote: "We also avoid putting all the experienced fieldworkers in one team.",
              note: "Experience helps balance groups, but it is not the main basis for assigning them.",
            },
          ],
        },
      },
      {
        id: "final-presentation",
        section: "Final presentation",
        before: "The presentation should focus mainly on",
        after: ".",
        options: ["comparing results from two sites", "recommending changes in visitor behaviour", "evaluating the research method"],
        answer: 2,
        review: {
          explanation: "A detailed site comparison is not expected and visitor recommendations are optional. The central requirement is to assess the method used.",
          correctQuote: "The central requirement, however, is to evaluate the method you used",
          distractors: [
            {
              quote: "you are not expected to make a detailed comparison with it.",
              note: "Students receive second-site figures, but a detailed comparison is explicitly unnecessary.",
            },
            {
              quote: "Some groups may wish to suggest how visitors could reduce damage to the area, and that is welcome.",
              note: "Visitor recommendations are welcome, but they are not the main focus.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Man",
        text: "Good morning, everyone. Before next month’s coastal research weekend, I need to explain a few practical arrangements and some changes to the programme.",
      },
      {
        speaker: "Man",
        text: "The coach will leave the university campus at seven thirty on Friday morning. We’ll collect two students from the railway station on the way, but please don’t try to register there. When we arrive on the coast, everyone must report to the visitor centre, where you’ll receive your room key and course materials.",
      },
      {
        speaker: "Man",
        text: "Several of you have already chosen the research topic that interests you most, although final groups won’t be confirmed until the first evening. There is no equipment deposit to pay before the trip. What we do need by Monday is the confidential medical form available on the course website. Even if you have no health problems, you must submit it.",
      },
      {
        speaker: "Man",
        text: "The timetable depends partly on the weather and tides. We originally intended to begin Saturday with water testing near the harbour. However, low tide will occur later than expected, so that work has moved to the afternoon. We’ll now start with the bird survey on the northern beach. Mapping the sand dunes will take place after lunch on Sunday.",
      },
      {
        speaker: "Man",
        text: "Basic field equipment is provided. You should bring your own waterproof coat and boots, as we cannot lend clothing in enough sizes. The nature reserve supplies binoculars free of charge. The twenty-euro equipment fee covers the use of GPS devices and the software needed to download their data.",
      },
      {
        speaker: "Man",
        text: "Now, about the research groups. We try to mix students from different degree subjects rather than placing all the biologists or geographers together. We also avoid putting all the experienced fieldworkers in one team. The main factor is the research area you selected on your application, although we may need to move one or two people if a group becomes too large.",
      },
      {
        speaker: "Man",
        text: "On Sunday evening, each team will give a short presentation. You’ll receive figures from a second coastal site, but you are not expected to make a detailed comparison with it. Some groups may wish to suggest how visitors could reduce damage to the area, and that is welcome. The central requirement, however, is to evaluate the method you used: explain what worked, what caused difficulties and how the investigation could be improved.",
      },
      {
        speaker: "Man",
        text: "A final timetable and packing list will be emailed tomorrow. Please read both carefully before contacting the course office with questions.",
      },
    ],
  },
  {
    id: "b2-careers-service",
    level: "B2",
    title: "University Careers Service Update",
    description: "Complete five sets of notes about changes to a university careers service.",
    assetsReady: true,
    audioReady: true,
    audioSrc: `${careersAudioRoot}/lecture.mp3`,
    instructionAudioReady: true,
    instructionAudioSrc: `${careersAudioRoot}/question.mp3`,
    instructions:
      "Listen to a careers service manager telling students about changes to the services available. Choose the correct answers to complete the notes. The first one has been done for you.",
    preparationPrompt: "The clock shows how much time you have to look at the task.",
    preparationSeconds: 30,
    example: {
      id: "location-example",
      section: "General information",
      before: "From next month, careers advisers will be based in the",
      after: ".",
      options: ["Business School", "main library", "Student Hub"],
      answer: 2,
      review: {
        explanation: "The library office is closing and the Business School arrangement is temporary. From October, the service moves to the Student Hub.",
        correctQuote: "From 3 October, all advisers and reception staff will be based together in the new Student Hub.",
        distractors: [
          {
            quote: "Our small office in the main library will close at the end of term.",
            note: "The main-library office is the current location and is about to close.",
          },
          {
            quote: "A few appointments are currently taking place in rooms in the Business School while building work is completed, but that is only a temporary arrangement.",
            note: "The Business School is only a temporary location.",
          },
        ],
      },
    },
    items: [
      {
        id: "cv-appointment",
        section: "Advice and events",
        before: "Before an individual CV appointment, students must",
        after: ".",
        options: ["upload a draft of their CV", "attend a group workshop", "telephone an adviser"],
        answer: 0,
        review: {
          explanation: "Telephone bookings are exceptional and workshops remain optional. Uploading a current CV draft in advance is the new compulsory step.",
          correctQuote: "Students must upload a current draft at least forty-eight hours before the meeting",
          distractors: [
            {
              quote: "telephone bookings are only available for urgent problems or accessibility reasons.",
              note: "Telephone booking is only available for urgent or accessibility-related cases.",
            },
            {
              quote: "attending one is recommended rather than compulsory.",
              note: "The CV workshop is recommended, but students do not have to attend it.",
            },
          ],
        },
      },
      {
        id: "first-employer-event",
        section: "Advice and events",
        before: "The first employer event will focus on careers in",
        after: ".",
        options: ["local start-ups", "public services", "international charities"],
        answer: 0,
        review: {
          explanation: "Charities appear later in the programme and the planned public-sector opening changed. The first event now features local start-ups.",
          correctQuote: "The first event will now bring together the founders of a number of local start-ups.",
          distractors: [
            {
              quote: "Representatives from international charities will visit later in the term",
              note: "The international-charity event takes place later in the term.",
            },
            {
              quote: "Several public-service organisations were originally going to open the programme",
              note: "Public services were the original first event, but speaker availability forced a change.",
            },
          ],
        },
      },
      {
        id: "work-shadowing",
        section: "Experience programmes",
        before: "The work-shadowing scheme is particularly intended for students who",
        after: ".",
        options: ["have few professional contacts", "need to find paid work experience", "are uncertain about their career choice"],
        answer: 0,
        review: {
          explanation: "Undecided students may benefit, but the scheme particularly targets students without personal access to professional workplaces. It is not paid work experience.",
          correctQuote: "The scheme’s main purpose is to support students with few relatives or friends who can introduce them to professional workplaces.",
          distractors: [
            {
              quote: "It is not paid experience",
              note: "Students seeking paid experience are directed to a different service.",
            },
            {
              quote: "Students who are uncertain about their career choice may find it useful",
              note: "Uncertain students may find it useful, but they are not identified as the particular target group.",
            },
          ],
        },
      },
      {
        id: "mentoring-match",
        section: "Experience programmes",
        before: "Students taking part in the mentoring programme are matched mainly according to their",
        after: ".",
        options: ["degree subject", "career interests", "place of residence"],
        answer: 1,
        review: {
          explanation: "Degree subject is not automatically matched and location is secondary. The main consideration is the student’s intended career or industry.",
          correctQuote: "The principal matching criterion is the career or industry a student hopes to enter.",
          distractors: [
            {
              quote: "We do not automatically place students with a mentor who studied the same degree",
              note: "A shared degree subject is explicitly not the automatic basis for matching.",
            },
            {
              quote: "We ask where students live in case face-to-face meetings are possible",
              note: "Residence can help with meeting arrangements, but it is not the main matching criterion.",
            },
          ],
        },
      },
      {
        id: "interview-tool",
        section: "Digital services",
        before: "The updated interview-practice tool will",
        after: ".",
        options: ["assess answers recorded by students", "provide live interviews with advisers", "supply questions from real employers"],
        answer: 0,
        review: {
          explanation: "Real-employer questions were already available and live adviser interviews remain separate. The update adds automatic feedback on recorded answers.",
          correctQuote: "The new feature allows students to record their answers and receive automatic feedback",
          distractors: [
            {
              quote: "The existing question bank, which includes material supplied by real employers, will remain available.",
              note: "Employer-supplied questions are an existing feature rather than the update.",
            },
            {
              quote: "It will not connect students to an adviser for a live interview",
              note: "Live adviser interviews are explicitly excluded from the tool.",
            },
          ],
        },
      },
    ],
    script: [
      {
        speaker: "Woman",
        text: "Good afternoon, everyone. I’d like to explain several changes to the university careers service that will take effect next month.",
      },
      {
        speaker: "Woman",
        text: "From 3 October, all advisers and reception staff will be based together in the new Student Hub. Our small office in the main library will close at the end of term. A few appointments are currently taking place in rooms in the Business School while building work is completed, but that is only a temporary arrangement.",
      },
      {
        speaker: "Woman",
        text: "There is also a new rule for individual CV appointments. Students must upload a current draft at least forty-eight hours before the meeting, so the adviser can prepare useful feedback in advance. We will continue to offer group workshops on writing CVs, but attending one is recommended rather than compulsory. Appointments should still be booked online; telephone bookings are only available for urgent problems or accessibility reasons.",
      },
      {
        speaker: "Woman",
        text: "We have also arranged a programme of employer events. Several public-service organisations were originally going to open the programme, but two speakers became unavailable. The first event will now bring together the founders of a number of local start-ups. Representatives from international charities will visit later in the term to discuss opportunities overseas.",
      },
      {
        speaker: "Woman",
        text: "Our work-shadowing scheme is expanding too. Students who are uncertain about their career choice may find it useful because it allows them to observe several types of workplace. It is not paid experience, however, and anyone looking for a longer paid placement should use our vacancies service. The scheme’s main purpose is to support students with few relatives or friends who can introduce them to professional workplaces.",
      },
      {
        speaker: "Woman",
        text: "Applications are also open for the mentoring programme. The principal matching criterion is the career or industry a student hopes to enter. We do not automatically place students with a mentor who studied the same degree; a different academic background can sometimes provide a broader perspective. We ask where students live in case face-to-face meetings are possible, although most mentoring now takes place online.",
      },
      {
        speaker: "Woman",
        text: "Finally, we have upgraded our interview-practice tool. The existing question bank, which includes material supplied by real employers, will remain available. The new feature allows students to record their answers and receive automatic feedback on pace, answer length and repeated words. It will not connect students to an adviser for a live interview; those sessions can still be booked separately.",
      },
      {
        speaker: "Woman",
        text: "Full details will be emailed to you tomorrow.",
      },
    ],
  },
];

export function getGeneralListeningPart2Set(setId) {
  return generalListeningPart2Sets.find((set) => set.id === setId) || generalListeningPart2Sets[0];
}
