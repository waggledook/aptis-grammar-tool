export const OTE_WRITING_MOCKS = {
  "writing-1": {
    id: "writing-1",
    title: "OTE Writing Mock 1",
    moduleLabel: "Writing",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      title: "Email",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      recommendedTime: "20 minutes",
      intro:
        "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You are planning a weekend activity with a friend. First read the email from your friend Alex. Then write an email to Alex, including the three notes you have made.",
      replyTo: "Alex",
      replySubject: "Re: Weekend bike trip",
      email: {
        from: "Alex",
        subject: "Weekend bike trip",
        greeting: "Hi there,",
        paragraphs: [
          "I've been looking at maps for our cycling trip this Saturday.",
        ],
        prompts: [
          {
            question: "I think we should ride up to the mountain lake. Do you agree?",
            note: "Yes - great idea!",
          },
          {
            question:
              "There are two different routes we can take. One is short but very steep, and the other is flat but takes an hour longer. Which path do you think would be best for us?",
            note: "Say which route and why",
          },
          {
            question:
              "Also, we need to decide what to do about lunch. Should we pack a picnic or stop at that small cafe near the water?",
            note: "Thanks, but let's...",
          },
        ],
        closing: ["Let me know what you think!", "Alex"],
      },
    },
    task2: {
      id: "task-2",
      number: 2,
      title: "Extended Writing",
      choiceSeconds: 2 * 60,
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      recommendedTime: "25 minutes",
      chooserIntro: "Choose one of the questions below.",
      chooserCopy: [
        "You have two minutes to choose.",
        "After two minutes, the computer chooses a question for you.",
      ],
      options: {
        essay: {
          id: "essay",
          label: "Write Essay",
          noun: "essay",
          title: "Essay",
          intro:
            "You have 25 minutes to write an essay. Write 100-160 words.",
          context:
            "You have had a class discussion about school schedules. Your teacher has asked you to write an essay.",
          promptLabel: "The title of the essay is:",
          prompt: "Should school holidays be shorter so summer breaks are less disruptive?",
          instruction: "Write your essay.",
        },
        article: {
          id: "article",
          label: "Write Article",
          noun: "article",
          title: "Article",
          intro:
            "You have 25 minutes to write an article. Write 100-160 words.",
          context:
            "You have seen the following advert in an online magazine for English language students.",
          promptLabel: "My favourite book or movie",
          prompt:
            "What is your absolute favourite book or movie? What is the story about and why do you love it so much? Write an article and tell us. We will publish the best entries in next month's issue.",
          instruction: "Write your article.",
        },
      },
    },
  },
  "writing-2": {
    id: "writing-2",
    title: "OTE Writing Mock 2",
    moduleLabel: "Writing",
    countdownSeconds: 10,
    task1: {
      id: "task-1",
      number: 1,
      title: "Email",
      timeSeconds: 20 * 60,
      minWords: 80,
      maxWords: 130,
      recommendedTime: "20 minutes",
      intro:
        "You have 20 minutes to write an email. Write 80-130 words.",
      setup:
        "You want to enroll in an evening course. First read the email from Mrs Higgins, the admissions coordinator at a local college. Then write an email to Mrs Higgins, including the three notes you have made.",
      replyTo: "Mrs Higgins",
      replySubject: "Re: Photography Course Enrollment",
      email: {
        from: "Mrs Higgins",
        subject: "Photography Course Enrollment",
        greeting: "Dear Applicant,",
        paragraphs: [
          "Thank you for your interest in our Evening Photography Course starting next term.",
        ],
        prompts: [
          {
            question:
              "Please reply with your full name, age, and student ID number if you have one.",
            note: "Give details",
          },
          {
            question:
              "We offer a choice between a Tuesday evening class or a Saturday morning class. Let us know which session fits your schedule better.",
            note: "Explain preference...",
          },
          {
            question:
              "We also offer a 10% discount on the course fees if you bring your own digital camera instead of borrowing ours. Will you be needing to use a college camera?",
            note: "No - say why",
          },
        ],
        closing: ["Best regards,", "Mrs Higgins"],
      },
    },
    task2: {
      id: "task-2",
      number: 2,
      title: "Extended Writing",
      choiceSeconds: 2 * 60,
      timeSeconds: 25 * 60,
      minWords: 100,
      maxWords: 160,
      recommendedTime: "25 minutes",
      chooserIntro: "Choose one of the questions below.",
      chooserCopy: [
        "You have two minutes to choose.",
        "After two minutes, the computer chooses a question for you.",
      ],
      options: {
        essay: {
          id: "essay",
          label: "Write Essay",
          noun: "essay",
          title: "Essay",
          intro:
            "You have 25 minutes to write an essay. Write 100-160 words.",
          context:
            "You have had a class discussion on public transport. Your teacher now wants you to write an essay.",
          promptLabel: "The title of the essay is:",
          prompt: "What are the advantages and disadvantages of working while studying at university?",
          instruction: "Write your essay.",
        },
        article: {
          id: "article",
          label: "Write Review",
          noun: "review",
          title: "Review",
          intro:
            "You have 25 minutes to write a review. Write 100-160 words.",
          context:
            "You have seen the following advert in an online magazine for English language students.",
          promptLabel: "Write a review!",
          prompt:
            "Write a review of an app or website you use frequently to study or organize your time. What features does it have? How exactly has it helped you? Are there any aspects that could be improved? The best review will win a technology gift voucher!",
          instruction: "Write your review.",
        },
      },
    },
  },
};

export function getOteWritingMocks() {
  return Object.values(OTE_WRITING_MOCKS);
}

export function getOteWritingMock(mockId = "writing-1") {
  return OTE_WRITING_MOCKS[mockId] || OTE_WRITING_MOCKS["writing-1"];
}
