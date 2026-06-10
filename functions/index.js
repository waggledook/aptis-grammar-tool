/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const nodemailer = require("nodemailer");

// ---------- init Admin (safe if called twice) ----------
try { admin.app(); } catch { admin.initializeApp(); }

// ---------- Environment config ----------
const GMAIL_USER   = process.env.GMAIL_USER;
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD;
const TEACHER_EMAIL = process.env.TEACHER_EMAIL || GMAIL_USER;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const firestore = admin.firestore();

const WRITING_FEEDBACK_WEEKLY_CREDITS = {
  student: 20,
  teacher: 100,
  admin: 1000,
};

const WRITING_FEEDBACK_CREDIT_COSTS = {
  generic: 4,
  aptis_part1: 1,
  aptis_part2: 2,
  aptis_part3: 3,
  aptis_part4: 5,
  aptis_speaking_part1: 2,
  aptis_speaking_part2: 3,
  ote_full_mock: 8,
  ote_single_task: 4,
  ote_register_gap: 1,
  ote_register_rewrite: 1,
};

// Gmail requires the "from" to be the authenticated user (or an alias on that account)
const FROM_ADDRESS = GMAIL_USER;

// Single reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

function getFeedbackWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

async function consumeWritingFeedbackCredits(context, taskType, creditCost) {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in to get feedback.");
  }

  const uid = context.auth.uid;
  const weekKey = getFeedbackWeekKey();
  const userRef = firestore.doc(`users/${uid}`);
  const usageRef = firestore.doc(`users/${uid}/writingFeedbackUsage/${weekKey}`);

  return firestore.runTransaction(async (tx) => {
    const [userSnap, usageSnap] = await Promise.all([tx.get(userRef), tx.get(usageRef)]);
    const role = userSnap.data()?.role || "student";
    const weeklyLimit =
      userSnap.data()?.writingFeedbackWeeklyCredits ??
      WRITING_FEEDBACK_WEEKLY_CREDITS[role] ??
      WRITING_FEEDBACK_WEEKLY_CREDITS.student;
    const used = Number(usageSnap.data()?.creditsUsed || 0);
    const nextUsed = used + creditCost;

    if (nextUsed > weeklyLimit) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `You have used your writing feedback allowance for this week. Your allowance resets next week.`
      );
    }

    tx.set(
      usageRef,
      {
        weekKey,
        creditsUsed: nextUsed,
        weeklyLimit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastTaskType: taskType,
        requests: admin.firestore.FieldValue.increment(1),
        tasks: {
          [taskType]: admin.firestore.FieldValue.increment(1),
        },
      },
      { merge: true }
    );

    return {
      taskType,
      creditCost,
      creditsUsed: nextUsed,
      weeklyLimit,
      weekKey,
    };
  });
}

async function refundWritingFeedbackCredits(context, reservation) {
  if (!context.auth?.uid || !reservation?.creditCost || !reservation?.weekKey) return;

  const usageRef = firestore.doc(`users/${context.auth.uid}/writingFeedbackUsage/${reservation.weekKey}`);
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(usageRef);
    const used = Number(snap.data()?.creditsUsed || 0);
    tx.set(
      usageRef,
      {
        creditsUsed: Math.max(0, used - reservation.creditCost),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        refundedRequests: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );
  });
}

const WRITING_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall",
    "criteria",
    "priorityFixes",
    "correctedVersion",
    "upgradedVersion",
    "teacherComment",
    "costControl",
  ],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["estimatedBand", "confidence", "summary"],
      properties: {
        estimatedBand: { type: "string" },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        summary: { type: "string" },
      },
    },
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "rating", "comment", "example"],
        properties: {
          name: { type: "string" },
          rating: { type: "string" },
          comment: { type: "string" },
          example: { type: "string" },
        },
      },
    },
    priorityFixes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "studentText", "suggestion", "why"],
        properties: {
          issue: { type: "string" },
          studentText: { type: "string" },
          suggestion: { type: "string" },
          why: { type: "string" },
        },
      },
    },
    correctedVersion: { type: "string" },
    upgradedVersion: { type: "string" },
    teacherComment: { type: "string" },
    costControl: {
      type: "object",
      additionalProperties: false,
      required: ["inputWordCount", "feedbackLength"],
      properties: {
        inputWordCount: { type: "integer" },
        feedbackLength: { type: "string", enum: ["short", "standard", "detailed"] },
      },
    },
  },
};

const APTIS_WRITING_PART1_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "answers", "teacherComment"],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "communication", "lengthControl"],
      properties: {
        summary: { type: "string" },
        communication: { type: "string", enum: ["clear", "mostly_clear", "needs_work"] },
        lengthControl: { type: "string", enum: ["good", "mixed", "too_long"] },
      },
    },
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "question",
          "answer",
          "wordCount",
          "communication",
          "length",
          "learningFeedback",
          "suggestedAnswer",
        ],
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          answer: { type: "string" },
          wordCount: { type: "integer" },
          communication: {
            type: "object",
            additionalProperties: false,
            required: ["status", "comment"],
            properties: {
              status: { type: "string", enum: ["clear", "mostly_clear", "unclear", "off_topic"] },
              comment: { type: "string" },
            },
          },
          length: {
            type: "object",
            additionalProperties: false,
            required: ["status", "comment"],
            properties: {
              status: { type: "string", enum: ["good", "a_bit_long", "too_long", "too_short"] },
              comment: { type: "string" },
            },
          },
          learningFeedback: { type: "string" },
          suggestedAnswer: { type: "string" },
        },
      },
    },
    teacherComment: { type: "string" },
  },
};

const APTIS_SPEAKING_PART1_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "estimatedLevel", "overall", "answers"],
  properties: {
    taskType: { type: "string", enum: ["aptis_speaking_part1"] },
    estimatedLevel: {
      type: "object",
      additionalProperties: false,
      required: ["label", "confidence", "note"],
      properties: {
        label: {
          type: "string",
          enum: [
            "Below A1 / unclear",
            "A1 range",
            "A2 range",
            "B1 range",
            "B2 range",
            "C1 range",
          ],
        },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        note: { type: "string" },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: [
        "summary",
        "mainStrengths",
        "mainPriorities",
        "developmentAdvice",
        "pronunciationFluencyCaveat",
      ],
      properties: {
        summary: { type: "string" },
        mainStrengths: {
          type: "array",
          items: { type: "string" },
        },
        mainPriorities: {
          type: "array",
          items: { type: "string" },
        },
        developmentAdvice: { type: "string" },
        pronunciationFluencyCaveat: { type: "string" },
      },
    },
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "questionId",
          "question",
          "transcript",
          "durationSeconds",
          "taskFulfilment",
          "answerDevelopment",
          "grammar",
          "vocabulary",
          "languageErrors",
          "fluency",
          "improvedAnswer",
          "teacherNote",
        ],
        properties: {
          questionId: { type: "string" },
          question: { type: "string" },
          transcript: { type: "string" },
          durationSeconds: { type: "number" },
          taskFulfilment: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["good", "partial", "weak", "off_topic", "unclear"] },
              feedback: { type: "string" },
            },
          },
          answerDevelopment: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: {
                type: "string",
                enum: [
                  "too_minimal",
                  "basic_but_clear",
                  "well_developed",
                  "overlong_or_rambling",
                  "memorised_or_generic",
                ],
              },
              feedback: { type: "string" },
            },
          },
          grammar: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["good", "minor_issues", "needs_work", "unclear"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "correction", "explanation"],
                  properties: {
                    original: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          vocabulary: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["good", "sufficient", "limited", "needs_work"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "suggestion", "explanation"],
                  properties: {
                    original: { type: "string" },
                    suggestion: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          languageErrors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["category", "original", "correction", "explanation"],
              properties: {
                category: {
                  type: "string",
                  enum: ["grammar", "vocabulary", "word_order", "missing_word"],
                },
                original: { type: "string" },
                correction: { type: "string" },
                explanation: { type: "string" },
              },
            },
          },
          fluency: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["good", "acceptable", "hesitant", "very_limited", "not_assessed"] },
              feedback: { type: "string" },
            },
          },
          improvedAnswer: { type: "string" },
          teacherNote: { type: "string" },
        },
      },
    },
  },
};

const APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "estimatedLevel", "overall", "answers"],
  properties: {
    taskType: { type: "string", enum: ["aptis_speaking_part2"] },
    estimatedLevel: {
      type: "object",
      additionalProperties: false,
      required: ["label", "confidence", "note"],
      properties: {
        label: {
          type: "string",
          enum: [
            "Below A1 / unclear",
            "A1 range",
            "A2 range",
            "B1 range",
            "B2 range",
            "C1 range",
            "C1+ range",
            "C2-like / above Aptis range",
          ],
        },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        note: { type: "string" },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: [
        "summary",
        "mainStrengths",
        "mainPriorities",
        "photoDescriptionAdvice",
        "developmentAdvice",
        "transcriptCaveat",
      ],
      properties: {
        summary: { type: "string" },
        mainStrengths: { type: "array", items: { type: "string" } },
        mainPriorities: { type: "array", items: { type: "string" } },
        photoDescriptionAdvice: { type: "string" },
        developmentAdvice: { type: "string" },
        transcriptCaveat: { type: "string" },
      },
    },
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "questionId",
          "questionNumber",
          "questionType",
          "question",
          "transcript",
          "durationSeconds",
          "taskFulfilment",
          "answerDevelopment",
          "content",
          "grammar",
          "vocabulary",
          "cohesion",
          "languageErrors",
          "fluency",
          "improvedAnswer",
          "teacherNote",
        ],
        properties: {
          questionId: { type: "string" },
          questionNumber: { type: "integer", enum: [1, 2, 3] },
          questionType: { type: "string", enum: ["photo_description", "personal_or_descriptive", "extended_opinion"] },
          question: { type: "string" },
          transcript: { type: "string" },
          durationSeconds: { type: "number" },
          taskFulfilment: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["good", "partial", "weak", "off_topic", "unclear"] },
              feedback: { type: "string" },
            },
          },
          answerDevelopment: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: {
                type: "string",
                enum: [
                  "too_minimal",
                  "basic_but_clear",
                  "well_developed",
                  "overlong_or_rambling",
                  "memorised_or_generic",
                ],
              },
              feedback: { type: "string" },
            },
          },
          content: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "missingIdeas"],
            properties: {
              status: { type: "string", enum: ["strong", "adequate", "thin", "inaccurate", "not_assessable"] },
              feedback: { type: "string" },
              missingIdeas: { type: "array", items: { type: "string" } },
            },
          },
          grammar: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["good", "minor_issues", "needs_work", "unclear"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "correction", "explanation"],
                  properties: {
                    original: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          vocabulary: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["good", "sufficient", "limited", "needs_work"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "suggestion", "explanation"],
                  properties: {
                    original: { type: "string" },
                    suggestion: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          cohesion: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["good", "basic", "list_like", "unclear"] },
              feedback: { type: "string" },
            },
          },
          languageErrors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["category", "original", "correction", "explanation"],
              properties: {
                category: { type: "string", enum: ["grammar", "vocabulary", "word_order", "missing_word", "transcript_unclear"] },
                original: { type: "string" },
                correction: { type: "string" },
                explanation: { type: "string" },
              },
            },
          },
          fluency: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["natural", "mostly_smooth", "hesitant", "fragmented", "not_assessed"] },
              feedback: { type: "string" },
            },
          },
          improvedAnswer: { type: "string" },
          teacherNote: { type: "string" },
        },
      },
    },
  },
};

const APTIS_WRITING_PART23_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "answers", "priorityAdvice", "teacherComment"],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "taskFulfilment", "languageControl", "wordCountComment"],
      properties: {
        summary: { type: "string" },
        taskFulfilment: { type: "string", enum: ["strong", "mostly_clear", "partial", "off_task"] },
        languageControl: { type: "string", enum: ["strong", "good", "developing", "needs_work"] },
        wordCountComment: { type: "string" },
      },
    },
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "index",
          "prompt",
          "answer",
          "wordCount",
          "wordCountStatus",
          "taskFulfilment",
          "grammar",
          "vocabulary",
          "punctuationSpelling",
          "cohesion",
          "languageErrors",
          "improvedVersion",
        ],
        properties: {
          index: { type: "integer" },
          prompt: { type: "string" },
          answer: { type: "string" },
          wordCount: { type: "integer" },
          wordCountStatus: {
            type: "string",
            enum: [
              "too_short",
              "slightly_short_but_acceptable",
              "recommended_range",
              "acceptable_over_range",
              "excessive",
            ],
          },
          taskFulfilment: { type: "string" },
          grammar: { type: "string" },
          vocabulary: { type: "string" },
          punctuationSpelling: { type: "string" },
          cohesion: { type: "string" },
          languageErrors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["category", "original", "correction", "explanation"],
              properties: {
                category: {
                  type: "string",
                  enum: ["grammar", "vocabulary", "word_order", "missing_word", "spelling", "punctuation", "cohesion"],
                },
                original: { type: "string" },
                correction: { type: "string" },
                explanation: { type: "string" },
              },
            },
          },
          improvedVersion: { type: "string" },
        },
      },
    },
    priorityAdvice: {
      type: "array",
      items: { type: "string" },
    },
    teacherComment: { type: "string" },
  },
};

const APTIS_WRITING_PART4_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "part", "estimatedLevel", "overall", "informalEmail", "formalEmail"],
  properties: {
    taskType: { type: "string", enum: ["aptis_writing_part4"] },
    part: { type: "string", enum: ["part4"] },
    estimatedLevel: {
      type: "object",
      additionalProperties: false,
      required: ["label", "confidence", "note"],
      properties: {
        label: {
          type: "string",
          enum: [
            "Below A2 / unclear",
            "A2 range",
            "B1 range",
            "B1+/B2 range",
            "B2+/C1 range",
            "C1+ range",
          ],
        },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        note: { type: "string" },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: [
        "summary",
        "mainStrengths",
        "mainPriorities",
        "registerContrast",
        "contentSpecificity",
      ],
      properties: {
        summary: { type: "string" },
        mainStrengths: { type: "array", items: { type: "string" } },
        mainPriorities: { type: "array", items: { type: "string" } },
        registerContrast: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback"],
          properties: {
            status: { type: "string", enum: ["strong", "adequate", "weak", "unclear"] },
            feedback: { type: "string" },
          },
        },
        contentSpecificity: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback"],
          properties: {
            status: { type: "string", enum: ["specific", "partly_generic", "too_generic", "off_task"] },
            feedback: { type: "string" },
          },
        },
      },
    },
    informalEmail: {
      type: "object",
      additionalProperties: false,
      required: [
        "studentAnswer",
        "wordCount",
        "wordCountStatus",
        "wordCountFeedback",
        "taskFulfilment",
        "register",
        "grammar",
        "vocabulary",
        "languageErrors",
        "cohesion",
        "improvedVersion",
        "teacherNote",
      ],
      properties: {
        studentAnswer: { type: "string" },
        wordCount: { type: "integer" },
        wordCountStatus: {
          type: "string",
          enum: ["too_short", "slightly_short_but_acceptable", "target_range", "acceptable_over_range", "excessive"],
        },
        wordCountFeedback: { type: "string" },
        taskFulfilment: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "missingOrWeakContent"],
          properties: {
            status: { type: "string", enum: ["good", "partial", "weak", "off_task"] },
            feedback: { type: "string" },
            missingOrWeakContent: { type: "array", items: { type: "string" } },
          },
        },
        register: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["strong", "mostly_appropriate", "mixed", "inappropriate"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "suggestion", "explanation"],
                properties: {
                  original: { type: "string" },
                  suggestion: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        grammar: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["good", "minor_issues", "needs_work"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "correction", "explanation"],
                properties: {
                  original: { type: "string" },
                  correction: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        vocabulary: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["good", "limited", "needs_work"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "suggestion", "explanation"],
                properties: {
                  original: { type: "string" },
                  suggestion: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        languageErrors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["category", "original", "correction", "explanation"],
            properties: {
              category: {
                type: "string",
                enum: ["grammar", "vocabulary", "word_order", "missing_word", "register", "cohesion", "spelling"],
              },
              original: { type: "string" },
              correction: { type: "string" },
              explanation: { type: "string" },
            },
          },
        },
        cohesion: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback"],
          properties: {
            status: { type: "string", enum: ["good", "ok", "needs_work"] },
            feedback: { type: "string" },
          },
        },
        improvedVersion: { type: "string" },
        teacherNote: { type: "string" },
      },
    },
    formalEmail: {
      type: "object",
      additionalProperties: false,
      required: [
        "studentAnswer",
        "wordCount",
        "wordCountStatus",
        "wordCountFeedback",
        "taskFulfilment",
        "register",
        "grammar",
        "vocabulary",
        "languageErrors",
        "cohesion",
        "improvedVersion",
        "teacherNote",
      ],
      properties: {
        studentAnswer: { type: "string" },
        wordCount: { type: "integer" },
        wordCountStatus: {
          type: "string",
          enum: ["too_short", "slightly_short_but_acceptable", "target_range", "acceptable_over_range", "excessive"],
        },
        wordCountFeedback: { type: "string" },
        taskFulfilment: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "missingOrWeakContent"],
          properties: {
            status: { type: "string", enum: ["good", "partial", "weak", "off_task"] },
            feedback: { type: "string" },
            missingOrWeakContent: { type: "array", items: { type: "string" } },
          },
        },
        register: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["strong", "mostly_appropriate", "mixed", "inappropriate"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "suggestion", "explanation"],
                properties: {
                  original: { type: "string" },
                  suggestion: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        grammar: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["good", "minor_issues", "needs_work"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "correction", "explanation"],
                properties: {
                  original: { type: "string" },
                  correction: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        vocabulary: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback", "examples"],
          properties: {
            status: { type: "string", enum: ["good", "limited", "needs_work"] },
            feedback: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["original", "suggestion", "explanation"],
                properties: {
                  original: { type: "string" },
                  suggestion: { type: "string" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
        languageErrors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["category", "original", "correction", "explanation"],
            properties: {
              category: {
                type: "string",
                enum: ["grammar", "vocabulary", "word_order", "missing_word", "register", "cohesion", "spelling"],
              },
              original: { type: "string" },
              correction: { type: "string" },
              explanation: { type: "string" },
            },
          },
        },
        cohesion: {
          type: "object",
          additionalProperties: false,
          required: ["status", "feedback"],
          properties: {
            status: { type: "string", enum: ["good", "ok", "needs_work"] },
            feedback: { type: "string" },
          },
        },
        improvedVersion: { type: "string" },
        teacherNote: { type: "string" },
      },
    },
  },
};

const OTE_WRITING_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "mode", "estimatedWritingLevel", "overall", "tasks"],
  properties: {
    taskType: { type: "string", enum: ["ote_writing_feedback"] },
    mode: { type: "string", enum: ["full_mock", "single_task"] },
    estimatedWritingLevel: {
      type: "object",
      additionalProperties: false,
      required: ["label", "confidence", "note"],
      properties: {
        label: {
          type: "string",
          enum: [
            "Below A2 / unclear",
            "A2 range",
            "B1 range",
            "B1+/B2 range",
            "Strong B2 range",
            "C1 range",
            "C2-like / above OTE range",
          ],
        },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        note: { type: "string" },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "mainStrengths", "mainPriorities"],
      properties: {
        summary: { type: "string" },
        mainStrengths: { type: "array", items: { type: "string" } },
        mainPriorities: { type: "array", items: { type: "string" } },
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "taskId",
          "taskType",
          "studentAnswer",
          "wordCount",
          "wordCountStatus",
          "wordCountFeedback",
          "taskFulfilment",
          "formatAndRegister",
          "organization",
          "grammar",
          "lexis",
          "mistakes",
          "improvedVersion",
          "teacherNote",
        ],
        properties: {
          taskId: { type: "string" },
          taskType: {
            type: "string",
            enum: ["ote_part1_email", "ote_part2_essay", "ote_part2_article", "ote_part2_review"],
          },
          studentAnswer: { type: "string" },
          wordCount: { type: "integer" },
          wordCountStatus: {
            type: "string",
            enum: ["too_short", "slightly_short_but_acceptable", "target_range", "acceptable_over_range", "excessive"],
          },
          wordCountFeedback: { type: "string" },
          taskFulfilment: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "requiredPoints", "contentSpecificity"],
            properties: {
              status: { type: "string", enum: ["strong", "good", "partial", "weak", "off_task"] },
              feedback: { type: "string" },
              requiredPoints: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["point", "status", "feedback"],
                  properties: {
                    point: { type: "string" },
                    status: { type: "string", enum: ["covered", "partly_covered", "missing"] },
                    feedback: { type: "string" },
                  },
                },
              },
              contentSpecificity: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["specific", "partly_generic", "too_generic", "off_task"] },
                  feedback: { type: "string" },
                },
              },
            },
          },
          formatAndRegister: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["strong", "mostly_appropriate", "mixed", "inappropriate"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "suggestion", "explanation"],
                  properties: {
                    original: { type: "string" },
                    suggestion: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          organization: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback"],
            properties: {
              status: { type: "string", enum: ["strong", "good", "adequate", "needs_work"] },
              feedback: { type: "string" },
            },
          },
          grammar: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["strong", "good", "minor_issues", "needs_work"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "correction", "explanation"],
                  properties: {
                    original: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          lexis: {
            type: "object",
            additionalProperties: false,
            required: ["status", "feedback", "examples"],
            properties: {
              status: { type: "string", enum: ["strong", "good", "limited", "needs_work"] },
              feedback: { type: "string" },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["original", "suggestion", "explanation"],
                  properties: {
                    original: { type: "string" },
                    suggestion: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
          mistakes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["category", "original", "correction", "explanation"],
              properties: {
                category: {
                  type: "string",
                  enum: ["task", "register", "organization", "grammar", "lexis", "spelling", "punctuation"],
                },
                original: { type: "string" },
                correction: { type: "string" },
                explanation: { type: "string" },
              },
            },
          },
          improvedVersion: { type: "string" },
          teacherNote: { type: "string" },
        },
      },
    },
  },
};

const OTE_REGISTER_GAP_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "gaps", "teacherComment"],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "registerControl", "mainAdvice"],
      properties: {
        summary: { type: "string" },
        registerControl: {
          type: "string",
          enum: ["strong", "mostly_good", "mixed", "needs_work", "too_incomplete"],
        },
        mainAdvice: { type: "string" },
      },
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "number",
          "studentAnswer",
          "verdict",
          "meaning",
          "syntax",
          "lexis",
          "register",
          "betterAnswer",
          "explanation",
        ],
        properties: {
          number: { type: "string" },
          studentAnswer: { type: "string" },
          verdict: {
            type: "string",
            enum: ["excellent", "acceptable", "partly_appropriate", "not_appropriate", "blank"],
          },
          meaning: { type: "string" },
          syntax: { type: "string" },
          lexis: { type: "string" },
          register: { type: "string" },
          betterAnswer: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    teacherComment: { type: "string" },
  },
};

const OTE_REGISTER_REWRITE_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "items", "teacherComment"],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "registerControl", "mainAdvice"],
      properties: {
        summary: { type: "string" },
        registerControl: {
          type: "string",
          enum: ["strong", "mostly_good", "mixed", "needs_work", "too_incomplete"],
        },
        mainAdvice: { type: "string" },
      },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "studentAnswer",
          "verdict",
          "meaning",
          "syntax",
          "lexis",
          "register",
          "suggestedRewrite",
          "explanation",
        ],
        properties: {
          id: { type: "string" },
          studentAnswer: { type: "string" },
          verdict: {
            type: "string",
            enum: ["excellent", "acceptable", "partly_appropriate", "not_appropriate", "blank"],
          },
          meaning: { type: "string" },
          syntax: { type: "string" },
          lexis: { type: "string" },
          register: { type: "string" },
          suggestedRewrite: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    teacherComment: { type: "string" },
  },
};

function cleanString(value, max = 6000) {
  return String(value || "").replace(/\s+\n/g, "\n").trim().slice(0, max);
}

function countWords(value) {
  const matches = String(value || "").trim().match(/\b[\p{L}\p{N}'’-]+\b/gu);
  return matches ? matches.length : 0;
}

function extractOutputText(responseJson) {
  if (typeof responseJson?.output_text === "string") return responseJson.output_text;
  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") return part.text;
    }
  }
  return "";
}

function buildWritingFeedbackPrompt(data) {
  const exam = cleanString(data.exam || "aptis", 40);
  const part = cleanString(data.part || "writing", 80);
  const taskTitle = cleanString(data.taskTitle || "", 160);
  const taskPrompt = cleanString(data.taskPrompt || "", 2500);
  const answer = cleanString(data.answer || "", 8000);
  const rubric = cleanString(data.rubric || "", 3000);
  const feedbackLength = ["short", "standard", "detailed"].includes(data.feedbackLength)
    ? data.feedbackLength
    : "standard";

  return [
    "You are an expert English exam writing teacher for Aptis and OTE-style tasks.",
    "Return strict JSON only, following the supplied schema.",
    "Give useful, exam-specific feedback without claiming to be an official examiner.",
    "Prefer clear B1-C1 learner-friendly explanations over long theory.",
    "Include exactly three priority fixes and four to six assessment criteria.",
    "If a task requirement is missing, mention it clearly.",
    "Do not invent personal details beyond the student's answer.",
    "",
    `Exam: ${exam}`,
    `Part: ${part}`,
    `Task title: ${taskTitle || "(none)"}`,
    `Desired feedback length: ${feedbackLength}`,
    "",
    "Task prompt:",
    taskPrompt || "(No task prompt supplied.)",
    "",
    "Custom marking/specification notes:",
    rubric || [
      "Assess task achievement, grammar accuracy, vocabulary range, organisation/cohesion, register, and word-count appropriacy.",
      "For OTE writing, consider whether the response answers every bullet/prompt and uses a suitable style for the genre.",
      "For Aptis writing, consider whether the answer fits the part, register, and recommended word count.",
    ].join(" "),
    "",
    "Student answer:",
    answer,
  ].join("\n");
}

function normalizePart1Items(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 5).map((item) => {
    const answer = cleanString(item?.answer || "", 300);
    return {
      id: cleanString(item?.id || "", 120),
      question: cleanString(item?.question || "", 400),
      answer,
      wordCount: countWords(answer),
    };
  });
}

function normalizeSpeakingPart1Questions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.slice(0, 3).map((item, index) => ({
    id: cleanString(item?.id || `q${index + 1}`, 120),
    question: cleanString(item?.question || item?.text || "", 500),
  }));
}

function normalizeSpeakingPart2Task(data = {}) {
  const task = data?.task || {};
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.slice(0, 3).map((item, index) => ({
    id: cleanString(item?.id || `q${index + 1}`, 120),
    questionNumber: index + 1,
    questionType:
      index === 0 ? "photo_description" : index === 1 ? "personal_or_descriptive" : "extended_opinion",
    question: cleanString(item?.question || item?.text || "", 500),
  }));

  const photoFeedback = task?.photoFeedback && typeof task.photoFeedback === "object" ? task.photoFeedback : {};
  return {
    taskId: cleanString(task?.id || data?.taskId || "", 120),
    title: cleanString(task?.title || "", 200),
    imageAltText: cleanString(task?.alt || task?.imageAltText || "", 1200),
    photoFeedback: {
      scene: cleanString(photoFeedback.scene || "", 240),
      keyDetails: Array.isArray(photoFeedback.keyDetails)
        ? photoFeedback.keyDetails.slice(0, 8).map((item) => cleanString(item, 180)).filter(Boolean)
        : [],
      usefulLanguage: Array.isArray(photoFeedback.usefulLanguage)
        ? photoFeedback.usefulLanguage.slice(0, 10).map((item) => cleanString(item, 120)).filter(Boolean)
        : [],
    },
    questions,
  };
}

function normalizeSpeakingAudioItems(recordings) {
  if (!Array.isArray(recordings)) return [];
  return recordings.slice(0, 3).map((item, index) => {
    const base64 = cleanString(item?.base64 || "", 12_000_000);
    const mime = cleanString(item?.mime || "audio/webm", 80) || "audio/webm";
    const name = cleanString(item?.name || `speaking-part1-q${index + 1}.webm`, 160);
    return { base64, mime, name };
  });
}

async function transcribeAudioItem(audioItem, index) {
  const buffer = Buffer.from(audioItem.base64, "base64");
  if (!buffer.byteLength) {
    throw new functions.https.HttpsError("invalid-argument", `Recording ${index + 1} is empty.`);
  }
  if (buffer.byteLength > 6 * 1024 * 1024) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Recording ${index + 1} is too large for this trial. Please keep answers short.`
    );
  }

  const blob = new Blob([buffer], { type: audioItem.mime || "audio/webm" });
  const form = new FormData();
  form.append("file", blob, audioItem.name || `speaking-part1-q${index + 1}.webm`);
  form.append("model", "gpt-4o-mini-transcribe");
  form.append("language", "en");
  form.append("response_format", "json");
  form.append(
    "prompt",
    [
      "Transcribe the speaker as literally as possible for English speaking exam feedback.",
      "Keep grammar mistakes, word choice mistakes, repetitions, false starts, fillers such as um, er, like, you know, and unfinished phrases.",
      "Do not rewrite, polish, or correct the speaker's English.",
      "Use normal punctuation only where it helps readability.",
      "Umm, er, like, you know, I mean, sort of, kind of.",
    ].join(" ")
  );

  let apiResponse;
  try {
    apiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
  } catch (error) {
    console.error("[transcribeSpeakingPart1] OpenAI request failed", error);
    throw new functions.https.HttpsError("unavailable", "Could not reach the transcription service.");
  }

  const responseJson = await apiResponse.json().catch(() => null);
  if (!apiResponse.ok) {
    console.error("[transcribeSpeakingPart1] OpenAI error", responseJson);
    throw new functions.https.HttpsError(
      "internal",
      responseJson?.error?.message || "The transcription service returned an error."
    );
  }

  return cleanString(responseJson?.text || "", 2000);
}

function buildAptisWritingPart1Prompt(items) {
  const tooLongCount = items.filter((item) => item.wordCount > 5).length;
  const tooShortCount = items.filter((item) => item.wordCount < 1).length;

  return [
    "You are an English exam writing feedback assistant for Aptis Writing Part 1.",
    "",
    "Aptis Writing Part 1 requires five very short answers to personal questions. Students should normally write 1-5 words. The goal is clear communication, not complex grammar. Longer answers do not receive extra credit, but a clear six- or seven-word answer is not a language mistake simply because it is slightly over the recommended range.",
    "",
    "Official guidance: for Part 1, focus on communicative competence. Do not over-penalise spelling, capitalisation or grammar if the meaning is clear. However, you may mention mistakes as learning feedback.",
    "",
    "Your feedback should be short, encouraging, practical, suitable for A1-B1 learners, and focused on direct answers, clear meaning, and accurate phrasing.",
    "",
    "For each answer:",
    "1. Check whether it answers the question.",
    "2. Check whether the meaning is clear.",
    "3. Check whether it is 1-5 words.",
    "4. Highlight important mistakes, especially if they affect meaning.",
    "5. Suggest an improved answer only if the original has a real language issue, is unclear/off task, or is clearly longer than Part 1 needs.",
    "",
    "Priorities:",
    "- Relevance and communication are the most important criteria.",
    "- If an answer is longer than necessary, you may suggest a shorter possible version, but frame this as an optional exam-management suggestion, not a mistake to fix.",
    "- Do not mention answers being too long in the overall summary unless at least one answer is more than 5 words.",
    "- If all answers are 1-5 words, say the length is good or short enough, even when the answers are irrelevant.",
    "- Keep relevance/communication problems separate from length problems.",
    "- Do not mark a grammatical full-sentence answer as wrong just because a shorter noun phrase is possible.",
    "- Highlight obvious grammar, spelling, vocabulary, or preposition mistakes as learning feedback, not official score loss.",
    "- Prefer noun phrases, short verb phrases, or single-word answers as optional models, while accepting correct fuller answers when they communicate clearly.",
    "",
    `Length facts: ${tooLongCount} answer(s) are over 5 words. ${tooShortCount} answer(s) are blank or under 1 word.`,
    "",
    "Avoid long explanations, advanced grammar terminology, official scores, complex full-sentence rewrites, and saying students get extra points for longer answers. Also avoid treating length advice as correction unless the answer is excessive, unclear, or error-prone.",
    "Return only valid JSON using the required schema.",
    "",
    "Student items:",
    JSON.stringify(items, null, 2),
  ].join("\n");
}

function buildAptisSpeakingPart1Prompt(items) {
  return [
    "You are an English exam speaking feedback assistant for Aptis Speaking Part 1.",
    "",
    "The student answered three simple personal-information questions. Each answer can be up to 30 seconds. This is AI-estimated feedback based on Aptis-style criteria, not official Aptis marking.",
    "",
    "Important limitation: you are assessing transcripts, not doing reliable pronunciation analysis. Do not include pronunciation as a normal feedback category. Only mention transcript clarity if the transcript is incomplete, unclear, or impossible to interpret. Do not invent pronunciation, intonation, word-stress, accent, or phoneme-level problems from the transcript.",
    "",
    "Part 1 priorities:",
    "- Task fulfilment and topic relevance: answer the exact question directly, stay on topic, and give a relevant personal response.",
    "- Answer development: do not reward one-word or ultra-minimal answers just because they are correct. Strong practice answers usually give a direct answer plus one or two useful details, such as a reason, example, frequency, contrast, personal comment, or short explanation.",
    "- Good target length: usually 1-4 connected sentences and around 15-60 words, depending on the question. A concise but natural answer can still be strong if it answers directly and shows control.",
    "- Grammar: focus on clear simple sentences, present simple for habits/facts, past simple for past questions, present continuous where relevant, auxiliary verbs, word order, subject + verb structure, articles/prepositions where they affect clarity, and simple connectors such as because, but, also, and, so.",
    "- Vocabulary: reward relevant, natural vocabulary and specific personal detail. Do not push advanced or unnatural words just to sound higher level.",
    "- Fluency: infer cautiously from the transcript only. You may mention very short answers, fragmented language, repeated restarts, or many transcribed fillers, but do not overstate fluency based only on transcript.",
    "- Language errors: students especially want explicit language feedback. For each answer, include the most useful grammar/vocabulary/word-order/missing-word fixes in languageErrors. Use exact student words where possible. Do not invent errors that are not supported by the transcript.",
    "- Keep languageErrors focused: include up to three languageErrors per answer when clear learner-language errors are present. Prefer errors that affect naturalness, clarity, or repeated patterns. If the transcript shows no clear learner-language errors, return an empty languageErrors array for that answer.",
    "",
    "Native/spontaneous speech calibration:",
    "- Do not downgrade a strong answer just because it includes normal spoken fillers, discourse markers, self-repairs, restarts, or informal phrasing such as well, let me think, you know, I guess, yeah, or things like this.",
    "- Spoken native-level answers are often less tidy than written answers. A false start or mid-sentence repair is not automatically a grammar error.",
    "- Treat obvious transcription artefacts cautiously, especially duplicated articles, repeated words, uncertain numbers, or odd phrases that may be misheard. Do not use these alone to assign a low level.",
    "- If the answers show idiomatic phrasing, flexible reformulation, natural discourse markers, specific detail, and control of connected speech, estimate B2 range or C1 range even if the transcript is not perfectly polished.",
    "- If all three answers are relevant, clear, natural, and reasonably developed, and there are no frequent clear learner-language errors, the observed range should normally be at least B2 range.",
    "- If all three answers show advanced/native-like control, specific personal detail, flexible phrasing, and no clear learner-language errors, use C1 range unless the evidence is too limited; if evidence is limited, use B2 range with lower confidence rather than B1.",
    "",
    "Answer development labels:",
    "- too_minimal: one word, one phrase, or one very short sentence. It may answer the question but does not give enough language for strong Part 1 practice.",
    "- basic_but_clear: relevant and understandable, but little extra detail. Suggest adding a reason, example, frequency, contrast, or personal detail.",
    "- well_developed: clear, relevant, and includes useful extra detail without becoming too long.",
    "- overlong_or_rambling: too long, repetitive, unfocused, or moves away from the question.",
    "- memorised_or_generic: prepared, unnatural, or not closely connected to the specific question.",
    "",
    "Estimated level:",
    "- Use broad labels only: Below A1 / unclear, A1 range, A2 range, B1 range, B2 range, C1 range.",
    "- You may recognise stronger performances up to C1 range when the transcript clearly shows strong control, range, natural detail, and very few errors.",
    "- The fact that Aptis Speaking Part 1 is short should reduce confidence, not artificially cap the label at B1.",
    "- Be generous when the answer is clearly communicative and natural: when choosing between two adjacent levels, choose the higher label with lower confidence unless there is concrete evidence for the lower label.",
    "- Use B1 range only for genuinely B1-like performance: mostly clear but limited range, simple repetitive structures, noticeable learner errors, and limited flexibility. Do not use B1 merely because the answers are short or because Part 1 evidence is limited.",
    "- Use B2 range for clear, developed answers with natural connected speech, flexible everyday vocabulary, generally good control, and only minor/non-disruptive issues.",
    "- Use C1 range for highly natural, idiomatic, flexible answers with strong control and only occasional slips, repairs, or transcript artefacts.",
    "- Always caveat the estimate: Aptis Speaking Part 1 is short and personal-information based, so it cannot reliably prove the student's full speaking level on its own.",
    "- The estimatedLevel.note must say this is AI-estimated Aptis-style feedback, not an official score, and that teacher feedback is preferable where available.",
    "",
    "Improved answer rules:",
    "- Keep the student's original idea where possible.",
    "- Answer the question directly.",
    "- Add one or two useful extra details.",
    "- Use natural spoken English suitable for the student's observed level. Do not simplify strong B2/C1 answers into lower-level model answers.",
    "- Aim for 2-4 connected sentences, usually around 25-60 words.",
    "- Avoid one-word model answers, over-advanced language, and long memorised monologues.",
    "",
    "Feedback style: short, encouraging, practical, specific to the question, suitable for learners across A1-C1, and focused on communication. Keep each feedback field to one concise sentence where possible. Avoid long grammar lectures, harsh wording, official score claims, advanced vocabulary for its own sake, and pronunciation feedback without reliable audio analysis.",
    "Use grammar.examples and vocabulary.examples only when they add something not already covered in languageErrors; otherwise return empty arrays for those fields.",
    "Return only valid JSON using the required schema.",
    "",
    "Transcribed answers:",
    JSON.stringify(items, null, 2),
  ].join("\n");
}

function buildAptisSpeakingPart2Prompt(task, items) {
  return [
    "You are an English exam speaking feedback assistant for Aptis Speaking Part 2.",
    "",
    "The student answered three 45-second questions based on one photograph. Q1 asks them to describe the photograph. Q2 is a related personal/descriptive question. Q3 is a more developed opinion/reasoning question. This is AI-estimated Aptis-style feedback, not official marking.",
    "",
    "Important limitation: you are assessing transcripts. Do not give pronunciation feedback or include pronunciation as a category. Only mention transcript clarity if a transcript is incomplete, unclear, or impossible to interpret. Do not invent accent, intonation, word-stress, phoneme, or sound-level problems.",
    "",
    "Part 2 priorities:",
    "- Q1 photo description: reward grounded description of visible people, place, actions, objects, and the general situation. Two to four relevant observations can be enough if they are clear and connected. Present continuous, there is/there are, and speculative language are useful. Do not require every possible detail.",
    "- Speculation is encouraged in Aptis-style photo description when it is based on visual evidence. Reward range such as it looks like, it seems as if, they might be, they are probably, perhaps, I imagine, and it appears to be.",
    "- Do not criticise speculation simply because it goes beyond literal description. Only flag it if it contradicts the image, becomes implausible, or replaces almost all visible description with unsupported storytelling.",
    "- Q2 should answer the actual related question, usually with personal experience, preference, or concrete descriptive detail. Do not treat Q2 as just more photo description.",
    "- Q3 should give a clearer opinion or explanation with reasons, examples, comparison, consequence, or speculation. Strong answers are developed but still focused.",
    "- Task fulfilment and topic relevance matter more than showing advanced language for its own sake.",
    "- Grammar priorities: present continuous for the photo, there is/there are, present simple, past simple where relevant, comparatives, modals, basic conditionals, connectors, word order, and subject-verb agreement.",
    "- Vocabulary priorities: concrete topic vocabulary, natural collocations, and specific details. Flag vague words, false friends, or unnatural phrasing only when they are actually present.",
    "- Cohesion: reward connected sentences. A list of isolated labels is weaker than a short organized description or answer.",
    "- Fluency: infer cautiously from transcript only. You may mention very short answers, repeated restarts, many transcribed fillers, or fragmented language, but do not overstate fluency from text.",
    "- Language errors: include up to three clear, useful fixes per answer. Use exact student words when possible. If there are no clear learner-language errors, return an empty languageErrors array for that answer.",
    "- Do not put preference-only rewrites in languageErrors. If a phrase is correct but could be shorter, simpler, more focused, or more exam-like, mention it in teacherNote, task/content feedback, or priorities instead.",
    "- Do not create a languageError where original and correction are the same or nearly the same.",
    "- Do not label repetition, self-correction, filler, or over-explaining as word_order or grammar unless there is a concrete grammar/word-order error. Treat it as fluency, cohesion, or task focus.",
    "- Do not correct correct grammar. For example, do not mark a correct phrase as an error just because an alternative tense or simpler phrasing is also possible.",
    "- Do not treat ordinary spoken informality, such as stuff, yeah, you know, why not, or discourse-marker repetition, as a language error in an otherwise advanced answer. Mention register or precision only if it genuinely weakens the answer.",
    "- For strong B2/C1/C1+ answers, keep improvedAnswer close to the student's level, tone, specificity, and intention. Do not flatten rich, natural speech into a generic lower-level model answer unless the original is unclear or off task.",
    "- If an answer is already strong, improvedAnswer should be a light polish of the student's own response, not a simplified replacement. Preserve mature ideas, specific references, hedging, discourse markers, and advanced vocabulary where they work.",
    "- For Q1 content, do not require every visible detail. If the student has already identified the people, action, place, general situation, and has used plausible speculative language, treat this as a strength. Do not add minor missing-detail criticisms unless the omitted detail would materially improve the answer.",
    "",
    "Calibration:",
    "- Do not hard-cap the estimated level because this is a single Part 2 task. Limited evidence should lower confidence, not force B1/B2.",
    "- Use B1 range only for genuinely B1-like performance: mostly clear but limited range, repetitive structures, noticeable learner errors, thin development, or partial task fulfilment.",
    "- Use B2 range for clear, relevant, reasonably developed answers with natural connected speech, good everyday vocabulary, and mostly controlled grammar, but limited abstraction or precision.",
    "- Use C1 range for highly natural, flexible, idiomatic answers with strong control, specific detail, and only occasional slips or transcript artefacts.",
    "- Use C1+ range as the minimum when all three answers are clear and relevant, reasonably developed, and show advanced spoken control: nuanced hedging/speculation, specific real-world examples, abstraction, topic-specific vocabulary, flexible syntax, and only minor local phrasing issues.",
    "- Use C2-like / above Aptis range only when the three answers are exceptionally natural, precise, flexible, and essentially error-free for this task type. Keep the confidence realistic.",
    "- Do not keep a performance at B2 merely because there are a few fillers, self-repairs, informal spoken words like stuff, or one or two local awkward phrases. Those are compatible with C1+ spoken performance if the overall range and control are strong.",
    "- Spoken answers can include normal fillers, discourse markers, self-repairs, and informal phrasing. Do not downgrade strong spoken English for not looking like polished writing.",
    "- Treat odd duplicated words or strange phrases cautiously as possible transcription artefacts. Do not use them alone to assign a low level.",
    "- Be generous when the response is clearly communicative and natural: when choosing between adjacent levels, choose the higher label with lower confidence unless there is concrete evidence for the lower label.",
    "",
    "Improved answer rules:",
    "- Keep the student's original idea where possible.",
    "- For Q1, model a natural photo description grounded in the image data supplied.",
    "- For Q2 and Q3, answer the exact question directly and add useful detail.",
    "- Use natural spoken English suitable for the student's observed level. Do not simplify strong answers into lower-level model answers.",
    "- For C1/C1+ answers, preserve sophisticated content and phrasing unless there is a real error. Improve local precision, not level.",
    "- Aim for a concise spoken answer, usually around 35-85 words for each 45-second question.",
    "- If the student's answer is already excellent, keep improvements minimal and say so.",
    "",
    "Set overall.transcriptCaveat to a short note that feedback is transcript-based and audio-level features are not assessed.",
    "Feedback style: short, encouraging, practical, and specific to the question. Avoid long grammar lectures, harsh wording, official score claims, and pronunciation feedback. Use grammar.examples and vocabulary.examples only when they add something not already covered in languageErrors; otherwise return empty arrays.",
    "Return only valid JSON using the required schema.",
    "",
    "Photo/task data:",
    JSON.stringify(task, null, 2),
    "",
    "Transcribed answers:",
    JSON.stringify(items, null, 2),
  ].join("\n");
}

function normalizeFeedbackText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPreferenceOnlySpeakingFix(item = {}) {
  const original = normalizeFeedbackText(item.original);
  const correction = normalizeFeedbackText(item.correction || item.suggestion);
  const explanation = normalizeFeedbackText(item.explanation);
  if (!original || !correction) return true;
  if (original === correction) return true;
  if (explanation.includes("this is correct")) return true;
  if (explanation.includes("rather than an error")) return true;
  if (item.category === "word_order" && explanation.includes("repetition")) return true;

  const preferenceSignals = [
    "could also say",
    "possible, but",
    "more natural and safer",
    "shorter version is clearer",
    "sounds better",
    "more specific noun",
    "more specific",
  ];
  const errorSignals = [
    "awkward",
    "unclear",
    "wrong",
    "incorrect",
    "missing",
    "affects meaning",
    "not natural",
    "unnatural",
  ];
  if (
    preferenceSignals.some((signal) => explanation.includes(signal)) &&
    !errorSignals.some((signal) => explanation.includes(signal))
  ) {
    return true;
  }
  return false;
}

function isGenericSpeculationCriticism(value = "") {
  const text = normalizeFeedbackText(value);
  if (!text) return false;
  const speculationTerms = [
    "overly speculative",
    "over-speculative",
    "over speculation",
    "over-speculation",
    "too speculative",
    "speculation lighter",
    "avoid speculating",
    "reduce speculation",
  ];
  if (!speculationTerms.some((term) => text.includes(term))) return false;
  return !["contradict", "impossible", "implausible", "not visible"].some((term) => text.includes(term));
}

function getCriterionStatus(value) {
  return normalizeFeedbackText(value?.status || "");
}

function hasAdvancedSpeakingEvidence(items = []) {
  const combined = normalizeFeedbackText(items.map((item) => item.transcript).join(" "));
  const totalWords = items.reduce((sum, item) => sum + Number(item.wordCount || 0), 0);
  const allDeveloped = items.length === 3 && items.every((item) => Number(item.wordCount || 0) >= 35);
  const advancedMarkers = [
    "obviously",
    "although",
    "contemporary",
    "underwhelming",
    "fundamental",
    "stimulate",
    "variety",
    "diversity",
    "by the looks of things",
    "it appears",
    "it looks like",
    "i'm much more interested",
    "in person",
    "as much as",
  ].filter((marker) => combined.includes(marker)).length;
  return totalWords >= 145 && allDeveloped && advancedMarkers >= 4;
}

function shouldLiftPart2ToC1Plus(feedback, items = []) {
  if (!feedback || !Array.isArray(feedback.answers) || feedback.answers.length !== 3) return false;
  const label = feedback.estimatedLevel?.label || "";
  if (label === "C1+ range" || label === "C2-like / above Aptis range") return false;
  if (!["B2 range", "C1 range"].includes(label)) return false;

  const answers = feedback.answers;
  const allTaskGood = answers.every((answer) =>
    ["good"].includes(getCriterionStatus(answer.taskFulfilment))
  );
  const allDeveloped = answers.every((answer) =>
    ["well_developed"].includes(getCriterionStatus(answer.answerDevelopment))
  );
  const contentStrong = answers.filter((answer) =>
    ["strong"].includes(getCriterionStatus(answer.content))
  ).length >= 2;
  const grammarControlled = answers.every((answer) =>
    ["good", "minor_issues"].includes(getCriterionStatus(answer.grammar))
  );
  const vocabStrong = answers.every((answer) =>
    ["good", "sufficient"].includes(getCriterionStatus(answer.vocabulary))
  );
  const cohesionGood = answers.every((answer) =>
    ["good", "basic"].includes(getCriterionStatus(answer.cohesion))
  );
  const errorCount = answers.reduce(
    (sum, answer) => sum + (Array.isArray(answer.languageErrors) ? answer.languageErrors.length : 0),
    0
  );

  return (
    allTaskGood &&
    allDeveloped &&
    contentStrong &&
    grammarControlled &&
    vocabStrong &&
    cohesionGood &&
    errorCount <= 6 &&
    hasAdvancedSpeakingEvidence(items)
  );
}

function preventAdvancedAnswerFlattening(feedback, items = []) {
  if (!["C1+ range", "C2-like / above Aptis range"].includes(feedback?.estimatedLevel?.label)) return feedback;
  if (!Array.isArray(feedback.answers)) return feedback;

  feedback.answers = feedback.answers.map((answer, index) => {
    const transcript = cleanString(items[index]?.transcript || answer.transcript || "", 2400);
    const improved = cleanString(answer.improvedAnswer || "", 2400);
    const transcriptWords = countWords(transcript);
    const improvedWords = countWords(improved);
    if (transcriptWords >= 45 && improvedWords > 0 && improvedWords < transcriptWords * 0.75) {
      return {
        ...answer,
        improvedAnswer: transcript,
        teacherNote: [
          answer.teacherNote,
          "This is already an advanced spoken answer, so feedback should focus on light local polishing rather than simplifying it.",
        ].filter(Boolean).join(" "),
      };
    }
    return answer;
  });
  return feedback;
}

function postProcessAptisSpeakingPart2Feedback(feedback, items = []) {
  if (!feedback || !Array.isArray(feedback.answers)) return feedback;
  if (feedback.overall) {
    if (Array.isArray(feedback.overall.mainPriorities)) {
      feedback.overall.mainPriorities = feedback.overall.mainPriorities.filter(
        (item) => !isGenericSpeculationCriticism(item)
      );
    }
    if (isGenericSpeculationCriticism(feedback.overall.photoDescriptionAdvice)) {
      feedback.overall.photoDescriptionAdvice =
        "Use visible details first, then add plausible speculation with phrases like it looks like, they might be, or they are probably.";
    }
    if (feedback.overall.transcriptCaveat && normalizeFeedbackText(feedback.overall.transcriptCaveat).includes("pronunciation")) {
      feedback.overall.transcriptCaveat =
        "Feedback is based on transcripts, so audio-level features are not assessed.";
    }
  }
  feedback.answers = feedback.answers.map((answer) => {
    const next = { ...answer };
    delete next.pronunciation;
    if (Array.isArray(next.languageErrors)) {
      next.languageErrors = next.languageErrors.filter((item) => !isPreferenceOnlySpeakingFix(item));
    }
    if (next.grammar && Array.isArray(next.grammar.examples)) {
      next.grammar = {
        ...next.grammar,
        examples: next.grammar.examples.filter((item) => !isPreferenceOnlySpeakingFix(item)),
      };
    }
    if (next.vocabulary && Array.isArray(next.vocabulary.examples)) {
      next.vocabulary = {
        ...next.vocabulary,
        examples: next.vocabulary.examples.filter((item) => !isPreferenceOnlySpeakingFix(item)),
      };
    }
    if (next.content && Array.isArray(next.content.missingIdeas)) {
      next.content = {
        ...next.content,
        missingIdeas: next.content.missingIdeas.filter((item) => !isGenericSpeculationCriticism(item)),
      };
    }
    if (next.taskFulfilment && isGenericSpeculationCriticism(next.taskFulfilment.feedback)) {
      next.taskFulfilment = {
        ...next.taskFulfilment,
        feedback:
          "You describe the scene clearly and use plausible speculation based on visual evidence, which is useful for this task.",
      };
    }
    return next;
  });
  if (shouldLiftPart2ToC1Plus(feedback, items)) {
    feedback.estimatedLevel = {
      ...(feedback.estimatedLevel || {}),
      label: "C1+ range",
      confidence: feedback.estimatedLevel?.confidence === "high" ? "high" : "medium",
      note:
        "AI-estimated Aptis-style feedback, not an official score. The transcript shows advanced spoken control across all three Part 2 answers, so the observed range is at least C1+ for this task.",
    };
    if (feedback.overall) {
      feedback.overall.summary =
        "A strong advanced Part 2 performance with natural speculation, specific examples, mature reasoning, and only minor local phrasing issues.";
    }
  }
  return preventAdvancedAnswerFlattening(feedback, items);
}

function getPart23WordCountStatus(part, wordCount) {
  if (part === "part2") {
    if (wordCount < 15) return "too_short";
    if (wordCount < 20) return "slightly_short_but_acceptable";
    if (wordCount <= 30) return "recommended_range";
    if (wordCount <= 45) return "acceptable_over_range";
    return "excessive";
  }
  if (wordCount < 25) return "too_short";
  if (wordCount < 30) return "slightly_short_but_acceptable";
  if (wordCount <= 40) return "recommended_range";
  if (wordCount <= 60) return "acceptable_over_range";
  return "excessive";
}

function describePart23WordCount(status, wordCount) {
  const words = `${wordCount} word${wordCount === 1 ? "" : "s"}`;
  switch (status) {
    case "too_short":
      return `${words}: probably too short to develop the answer well.`;
    case "slightly_short_but_acceptable":
      return `${words}: a little short, but this may be acceptable if the task is fully answered.`;
    case "recommended_range":
      return `${words}: in the recommended range.`;
    case "acceptable_over_range":
      return `${words}: above the recommended range, but still within a practical exam range.`;
    case "excessive":
      return `${words}: beyond the practical range, so a shorter answer would be safer.`;
    default:
      return `${words}.`;
  }
}

function normalizePart23Payload(data) {
  const part = data?.part === "part3" ? "part3" : data?.part === "part2" ? "part2" : "";
  const answers = Array.isArray(data?.answers) ? data.answers : [];
  const normalizedAnswers = answers.map((answer, index) => {
    const text = cleanString(answer?.text || "", 5000);
    const wordCount = Number.isFinite(answer?.wordCount) ? answer.wordCount : countWords(text);
    return {
      text,
      wordCount,
      wordCountStatus: part ? getPart23WordCountStatus(part, wordCount) : "recommended_range",
      index,
    };
  });

  return {
    part,
    taskId: cleanString(data?.taskId || "", 120),
    title: cleanString(data?.title || "", 180),
    context: cleanString(data?.context || "", 1200),
    prompt: cleanString(data?.prompt || "", 1200),
    chats: Array.isArray(data?.chats)
      ? data.chats.slice(0, 3).map((chat) => ({
          name: cleanString(chat?.name || "", 80),
          question: cleanString(chat?.question || "", 1200),
        }))
      : [],
    answers: normalizedAnswers,
  };
}

function buildAptisWritingPart23Prompt(payload) {
  const ranges = payload.part === "part2"
    ? "Part 2 ranges: recommendedMin 20, recommendedMax 30, practicalMax 45."
    : "Part 3 ranges: recommendedMin 30, recommendedMax 40, practicalMax 60.";

  return [
    "You are an English exam writing feedback assistant for Aptis General Writing.",
    "",
    "This is AI-estimated feedback based on Aptis-style criteria, not official Aptis marking.",
    "",
    "Assessment areas:",
    "1. Task fulfilment / relevance",
    "2. Grammar range and accuracy",
    "3. Vocabulary range and accuracy",
    "4. Punctuation and spelling",
    "5. Cohesion / organisation",
    "",
    "Word count handling:",
    ranges,
    "Use the supplied wordCountStatus for each answer. Do not recalculate or contradict it.",
    "Use 'recommended range', not 'word limit'.",
    "Do not describe an answer as too long simply because it is slightly over the recommended range.",
    "For acceptable_over_range, use a neutral tone: it is above the recommended range but still within a practical exam range.",
    "Do not include priority advice about reducing length for acceptable_over_range unless the answer is repetitive, unfocused, unclear, risky, or creates avoidable errors.",
    "Only suggest shortening when it improves clarity, focus, naturalness, accuracy, or exam control. Do not suggest shortening just to fit the recommended range, and do not replace ambitious accurate wording with a simpler phrase merely because it is simpler.",
    "",
    "Feedback behaviour:",
    "- Check task fulfilment first. Missing content from the prompt must be front and centre in the summary and priority advice.",
    "- For Part 2, explicitly check whether the answer covers every part of the prompt. If the prompt asks why the student joined, and the answer does not say why, make that the main task-fulfilment point.",
    "- For Part 3, judge each reply separately against its own chat message.",
    "- Identify important grammar errors with short correction examples.",
    "- Include a languageErrors array for each answer with the clearest mistakes to fix. For Part 2 include 2-5 items when clear errors are present. For each Part 3 answer include 1-4 items when clear errors are present.",
    "- languageErrors should be genuinely useful corrections: grammar, vocabulary, word order, missing words, spelling, punctuation, or cohesion. Use exact student wording in original where possible.",
    "- Do not put preference-only rewrites in languageErrors. A correction must fix a real problem, not merely make accurate ambitious writing shorter, simpler, safer, or more basic.",
    "- If the student uses ambitious or advanced language accurately, praise it and preserve it. Only correct ambitious language when it is genuinely inaccurate, unclear, unnatural, or inappropriate for the task.",
    "- If there are no clear mistakes in an answer, return an empty languageErrors array for that answer.",
    "- Praise strong natural vocabulary such as 'I'm particularly keen on', 'I'm really into', or other good B1/B2 phrases when used accurately.",
    "- Reward ambitious, accurate language. Do not discourage strong accurate vocabulary or more complex phrasing by suggesting simpler alternatives unless the original wording is genuinely unnatural, inaccurate, too formal/informal for the task, unclear, or causing errors.",
    "- Mention punctuation/spelling errors only when useful.",
    "- Sentence-initial 'But' is acceptable in this informal short-answer style. Do not criticise it unless it genuinely makes the meaning unclear or repetitive.",
    "- Encourage simple cohesive devices where useful: because, also, but, so, for example. Do not force extra linkers into a clear answer.",
    "- Provide an improved version that preserves the student's meaning, ambition, and strongest accurate language. Improve accuracy and clarity; do not simplify a good answer into a lower-level model.",
    "- Give 1-3 specific priority advice points.",
    "- Keep each feedback field concise. For Part 3, each improvedVersion should usually be one short natural reply, not a long rewrite.",
    "",
    "Tone: friendly, concise, encouraging, suitable for A2-B1 learners.",
    "Avoid harsh wording, long grammar lectures, official scores, and unnecessary complexity for its own sake. Ambitious language should be rewarded when it is accurate and task-appropriate, even in earlier parts.",
    "Return only valid JSON using the required schema.",
    "",
    "Submission:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function getPart4WordCountStatus(kind, wordCount) {
  if (kind === "informal") {
    if (wordCount < 35) return "too_short";
    if (wordCount < 40) return "slightly_short_but_acceptable";
    if (wordCount <= 50) return "target_range";
    if (wordCount <= 75) return "acceptable_over_range";
    return "excessive";
  }
  if (wordCount < 110) return "too_short";
  if (wordCount < 120) return "slightly_short_but_acceptable";
  if (wordCount <= 150) return "target_range";
  if (wordCount <= 225) return "acceptable_over_range";
  return "excessive";
}

function describePart4WordCount(kind, status, wordCount) {
  const label = kind === "informal" ? "Informal email" : "Formal email";
  const words = `${wordCount} word${wordCount === 1 ? "" : "s"}`;
  switch (status) {
    case "too_short":
      return `${label}: ${words}. This may be too short if important task content is missing.`;
    case "slightly_short_but_acceptable":
      return `${label}: ${words}. A little short, but acceptable if the task is fully answered.`;
    case "target_range":
      return `${label}: ${words}. In the target range.`;
    case "acceptable_over_range":
      return `${label}: ${words}. Above the target range, but still perfectly acceptable if the email is clear, relevant, and controlled.`;
    case "excessive":
      return `${label}: ${words}. This is beyond the practical range, so a shorter answer would be safer.`;
    default:
      return `${label}: ${words}.`;
  }
}

function normalizePart4Payload(data) {
  const friendText = cleanString(data?.friendEmail?.text || "", 9000);
  const formalText = cleanString(data?.formalEmail?.text || "", 14000);
  const friendWordCount = Number.isFinite(data?.friendEmail?.wordCount)
    ? data.friendEmail.wordCount
    : countWords(friendText);
  const formalWordCount = Number.isFinite(data?.formalEmail?.wordCount)
    ? data.formalEmail.wordCount
    : countWords(formalText);

  return {
    part: "part4",
    taskId: cleanString(data?.taskId || "", 120),
    title: cleanString(data?.title || "", 220),
    sourceTitle: cleanString(data?.sourceTitle || "", 220),
    source: cleanString(data?.source || "", 4500),
    friendPrompt: cleanString(data?.friendPrompt || "", 1400),
    formalPrompt: cleanString(data?.formalPrompt || "", 1600),
    friendEmail: {
      text: friendText,
      wordCount: friendWordCount,
      wordCountStatus: getPart4WordCountStatus("informal", friendWordCount),
    },
    formalEmail: {
      text: formalText,
      wordCount: formalWordCount,
      wordCountStatus: getPart4WordCountStatus("formal", formalWordCount),
    },
  };
}

function buildAptisWritingPart4Prompt(payload) {
  return [
    "You are an English exam writing feedback assistant for Aptis General Writing Part 4.",
    "",
    "This is AI-estimated feedback based on Aptis-style criteria, not official Aptis marking.",
    "",
    "Part 4 requires two emails based on the same source text:",
    "1. An informal email/message to a friend or close family member.",
    "2. A formal email to an organisation, unknown recipient, seller, coordinator, president, committee, or similar.",
    "",
    "Core assessment priorities:",
    "1. Content and task fulfilment.",
    "2. Register and tone.",
    "3. Clear difference between the two emails.",
    "4. Grammar range and accuracy.",
    "5. Vocabulary range and accuracy.",
    "6. Cohesion and organisation.",
    "",
    "Explicit mistake feedback:",
    "- Students especially value concrete language corrections. For each email, include a languageErrors array with the most useful mistakes to fix.",
    "- Informal email: include 3-5 languageErrors when clear errors are present. Formal email: include 5-8 languageErrors when clear errors are present.",
    "- Use exact student wording in original where possible, and a concise corrected version in correction.",
    "- Categories must be grammar, vocabulary, word_order, missing_word, register, cohesion, or spelling.",
    "- Prefer errors that affect clarity, register, naturalness, or repeated patterns.",
    "- If the improvedVersion changes a student phrase because it is inaccurate, unnatural, unclear, or register-inappropriate, include that phrase in languageErrors unless it is only a tiny punctuation or formatting cleanup.",
    "- Keep each languageErrors explanation to one short sentence.",
    "- Do not invent mistakes. If an email has no clear language errors, return an empty languageErrors array.",
    "- Use grammar.examples and vocabulary.examples only when they add something not already covered in languageErrors; otherwise return empty arrays for those fields.",
    "- Register feedback must be specific. If register.feedback mentions tone, formality, politeness, directness, naturalness, or the difference between the two emails, register.examples must include 1-3 concrete examples with exact student wording and a more suitable alternative.",
    "- For register.examples, include positive examples only when register is strong; otherwise prioritise phrases that need a clearer formal or informal version.",
    "",
    "Content checking is extremely important. Internally identify what happened in the source, what each prompt requires, and whether each email answers all required content points.",
    "Generic writing must be flagged: vague opinions, memorised phrases, no reference to the specific situation, or formal emails that sound like general complaints rather than responses to the actual prompt.",
    "Reward specific task content: concrete references to the fee, location, e-book change, used book condition, online screenings, transport, refund, seller, committee, or whichever specific situation appears in the source.",
    "",
    "Register is central:",
    "- Informal email: friendly, personal, natural, contractions allowed, direct questions allowed, natural openers/closings.",
    "- Formal email: polite, neutral, structured, no slang, limited contractions, measured opinions, appropriate greeting/closing.",
    "- Formal expressions such as 'with reference to', 'regarding', 'I would like to express...', 'I have some reservations', 'I would be grateful if...', and 'I trust you will...' are positive when used accurately. Do not replace them with simpler wording just because simpler wording is possible.",
    "- In the formal email, preserve appropriate formal vocabulary and phrasing unless it is genuinely inaccurate, unnatural, too heavy for the context, or unclear.",
    "- If the two emails are too similar in register, treat this as a major Part 4 issue.",
    "",
    "Word count handling:",
    "- Informal target is about 40-50 words, but up to 75 words is perfectly fine if clear, relevant, and controlled.",
    "- Formal target is about 120-150 words, but up to 225 words is perfectly fine if clear, relevant, and controlled.",
    "- Use the supplied wordCountStatus. Do not recalculate or contradict it.",
    "- Do not give negative feedback for acceptable_over_range by itself.",
    "- Only mention length negatively if it causes repetition, generic content, lack of control, unclear organisation, or exam-management problems.",
    "- Never say an informal email over 50 words is a problem if it is 75 words or fewer and works well.",
    "- Never say a formal email over 150 words is a problem if it is 225 words or fewer and works well.",
    "",
    "Improved versions:",
    "- Preserve the student's meaning where possible.",
    "- Preserve the student's strongest accurate language. Do not downgrade sophisticated, ambitious, or formal language to simpler B1 wording when it works.",
    "- Correct register problems.",
    "- Make the informal email genuinely informal and the formal email genuinely formal.",
    "- Add task-specific content only if the original is too generic or misses a required point. If the student's content is already specific and complete, do not add new ideas just to make a model answer.",
    "- Keep language realistic for the student's apparent level, but allow the improved version to preserve ambition and range. Do not create a perfect C2 template, and do not flatten a strong answer into basic English.",
    "- The improved formal email must respond to the specific source and formal prompt, not a generic template.",
    "- For strong answers, make minimal edits: correct errors, improve precision, and keep the student's style. Do not rewrite the whole email into a safer but less advanced version.",
    "",
    "Use broad estimated-level labels only. Do not present the level as an official Aptis score.",
    "Level calibration:",
    "- Do not cap a response at B1+/B2 just because it contains a few spelling errors, article/preposition issues, or isolated awkward phrases.",
    "- If both emails are task-specific, clearly different in register, cohesive, and use a strong range of vocabulary and formal/informal phrasing, consider B2+/C1 range or C1+ even with minor surface errors.",
    "- C1-level Part 4 writing may still contain occasional slips. Judge the overall control, register awareness, task fulfilment, cohesion, and vocabulary range.",
    "- Reserve B1+/B2 range for answers with generally clear communication but limited range, inconsistent register, underdeveloped content, or frequent errors that noticeably reduce control.",
    "- A student with strong register contrast, specific content, confident formal phrasing, and mostly accurate complex language should normally be at least B2+/C1 range.",
    "Keep feedback concise so the full JSON response completes. Return only valid JSON using the required schema.",
    "",
    "Submission:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function getOteWordCountStatus(taskType, wordCount) {
  if (taskType === "ote_part1_email") {
    if (wordCount < 60) return "too_short";
    if (wordCount < 80) return "slightly_short_but_acceptable";
    if (wordCount <= 130) return "target_range";
    if (wordCount <= 150) return "acceptable_over_range";
    return "excessive";
  }
  if (wordCount < 80) return "too_short";
  if (wordCount < 100) return "slightly_short_but_acceptable";
  if (wordCount <= 160) return "target_range";
  if (wordCount <= 180) return "acceptable_over_range";
  return "excessive";
}

function describeOteWordCount(taskType, status, wordCount) {
  const label = taskType === "ote_part1_email" ? "Part 1 email" : "Part 2 task";
  const words = `${wordCount} word${wordCount === 1 ? "" : "s"}`;
  switch (status) {
    case "too_short":
      return `${label}: ${words}. This is under length and should be flagged clearly, especially if content is missing.`;
    case "slightly_short_but_acceptable":
      return `${label}: ${words}. Slightly short; acceptable only if the task is fully covered.`;
    case "target_range":
      return `${label}: ${words}. In the target range.`;
    case "acceptable_over_range":
      return `${label}: ${words}. Within 20 words of the target range; do not treat this as a problem if the answer is focused, relevant, and accurate.`;
    case "excessive":
      return `${label}: ${words}. More than 20 words over the target range; mention length only if it creates repetition, loss of focus, unclear task coverage, or exam-management risk.`;
    default:
      return `${label}: ${words}.`;
  }
}

function hasOnlyCoveredOtePoints(taskFeedback = {}) {
  const points = taskFeedback.taskFulfilment?.requiredPoints;
  if (!Array.isArray(points) || !points.length) return true;
  return points.every((point) => point?.status === "covered");
}

function isHighControlOteTask(taskFeedback = {}) {
  const taskStatus = taskFeedback.taskFulfilment?.status;
  const contentStatus = taskFeedback.taskFulfilment?.contentSpecificity?.status;
  const registerStatus = taskFeedback.formatAndRegister?.status;
  const organizationStatus = taskFeedback.organization?.status;
  const grammarStatus = taskFeedback.grammar?.status;
  const lexisStatus = taskFeedback.lexis?.status;
  const wordStatus = taskFeedback.wordCountStatus;

  return (
    ["strong", "good"].includes(taskStatus) &&
    ["specific", "partly_generic"].includes(contentStatus) &&
    ["strong", "mostly_appropriate"].includes(registerStatus) &&
    ["strong", "good"].includes(organizationStatus) &&
    ["strong", "good", "minor_issues"].includes(grammarStatus) &&
    ["strong", "good"].includes(lexisStatus) &&
    ["target_range", "acceptable_over_range"].includes(wordStatus) &&
    hasOnlyCoveredOtePoints(taskFeedback)
  );
}

function isPreferenceOnlyOteCorrection(mistake = {}) {
  const text = [
    mistake.category,
    mistake.original,
    mistake.correction,
    mistake.explanation,
  ].join(" ").toLowerCase();

  return (
    /\b(more natural|clearer|smoother|slightly awkward|more idiomatic|sounds better|prefer)\b/.test(text) &&
    !/\b(error|incorrect|wrong|missing|unclear|confusing|changes the meaning|impede|grammar mistake)\b/.test(text)
  );
}

function isLengthPriority(text = "") {
  return /\b(word count|word limit|length|too long|shorten|closer to the limit|closer to the word limit)\b/i.test(text);
}

function isVaguePolishPriority(text = "") {
  return /\b(make .*phrases? more natural|phrases? more natural|smoother wording|wording more natural)\b/i.test(text);
}

function dedupeOtePriorities(priorities = []) {
  return priorities.filter((item, index, list) => {
    const normalized = String(item || "").trim().toLowerCase();
    return normalized && list.findIndex((other) => String(other || "").trim().toLowerCase() === normalized) === index;
  });
}

function postProcessOteWritingFeedback(payload, feedback) {
  if (!feedback || !Array.isArray(feedback.tasks)) return feedback;

  const processedTasks = feedback.tasks.map((taskFeedback, index) => {
    const originalTask = payload.tasks[index] || {};
    const withOriginalCounts = {
      ...taskFeedback,
      wordCount: originalTask.answer?.wordCount ?? taskFeedback.wordCount,
      wordCountStatus: originalTask.answer?.wordCountStatus || taskFeedback.wordCountStatus,
      wordCountFeedback: describeOteWordCount(
        originalTask.taskType || taskFeedback.taskType,
        originalTask.answer?.wordCountStatus || taskFeedback.wordCountStatus,
        originalTask.answer?.wordCount ?? taskFeedback.wordCount
      ),
    };

    if (!isHighControlOteTask(withOriginalCounts)) return withOriginalCounts;

    const filteredMistakes = (withOriginalCounts.mistakes || []).filter(
      (mistake) => !isPreferenceOnlyOteCorrection(mistake)
    );
    const hasNoMeaningfulMistakes = filteredMistakes.length === 0;
    const studentAnswer = originalTask.answer?.text || withOriginalCounts.studentAnswer || "";

    return {
      ...withOriginalCounts,
      mistakes: filteredMistakes,
      grammar: hasNoMeaningfulMistakes
        ? {
            ...withOriginalCounts.grammar,
            status: withOriginalCounts.grammar?.status === "minor_issues" ? "strong" : withOriginalCounts.grammar?.status,
            feedback: "Grammar is accurate and controlled; no significant corrections are needed.",
            examples: [],
          }
        : withOriginalCounts.grammar,
      lexis: hasNoMeaningfulMistakes
        ? {
            ...withOriginalCounts.lexis,
            status: withOriginalCounts.lexis?.status || "strong",
            feedback: "Vocabulary is natural, precise, and appropriate for the task.",
            examples: [],
          }
        : withOriginalCounts.lexis,
      improvedVersion: hasNoMeaningfulMistakes && studentAnswer ? studentAnswer : withOriginalCounts.improvedVersion,
      teacherNote: hasNoMeaningfulMistakes
        ? "This is a polished response with no significant language corrections needed."
        : withOriginalCounts.teacherNote,
    };
  });

  const hasHighControlTask = processedTasks.some(isHighControlOteTask);
  const hasOnlyHighControlTasks = processedTasks.length > 0 && processedTasks.every(isHighControlOteTask);
  const hasMeaningfulMistakes = processedTasks.some((task) => (task.mistakes || []).length > 0);

  const adjusted = {
    ...feedback,
    tasks: processedTasks,
    overall: {
      ...(feedback.overall || {}),
      mainPriorities: dedupeOtePriorities(feedback.overall?.mainPriorities || []).filter((priority) => {
        if (processedTasks.some((task) => task.wordCountStatus === "acceptable_over_range") && isLengthPriority(priority)) {
          return false;
        }
        if (hasOnlyHighControlTasks && isVaguePolishPriority(priority)) {
          return false;
        }
        return true;
      }),
    },
  };

  if (
    hasHighControlTask &&
    ["B1+/B2 range", "Strong B2 range"].includes(adjusted.estimatedWritingLevel?.label)
  ) {
    adjusted.estimatedWritingLevel = {
      ...(adjusted.estimatedWritingLevel || {}),
      label: hasMeaningfulMistakes ? "C1 range" : "C2-like / above OTE range",
      confidence: adjusted.estimatedWritingLevel?.confidence || "medium",
      note:
        "This is AI-estimated training feedback. OTE reports results only up to B2, but the observed writing quality is above that reporting range.",
    };
  }

  if (hasOnlyHighControlTasks && !hasMeaningfulMistakes) {
    adjusted.overall = {
      ...adjusted.overall,
      summary:
        adjusted.overall?.summary && !/minor|awkward|word limit|length/i.test(adjusted.overall.summary)
          ? adjusted.overall.summary
          : "This is a polished, natural, task-appropriate response with no significant language corrections needed.",
      mainPriorities: adjusted.overall?.mainPriorities || [],
    };
  }

  return adjusted;
}

function normalizeOteWritingPayload(data) {
  const mode = data?.mode === "single_task" ? "single_task" : "full_mock";
  const validTaskTypes = new Set([
    "ote_part1_email",
    "ote_part2_essay",
    "ote_part2_article",
    "ote_part2_review",
  ]);
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];

  return {
    exam: "ote",
    mode,
    tasks: tasks.slice(0, mode === "full_mock" ? 2 : 1).map((task) => {
      const taskType = validTaskTypes.has(task?.taskType) ? task.taskType : "";
      const answerText = cleanString(task?.answer?.text || "", 9000);
      const wordCount = Number.isFinite(task?.answer?.wordCount)
        ? task.answer.wordCount
        : countWords(answerText);
      return {
        taskId: cleanString(task?.taskId || "", 120),
        taskType,
        title: cleanString(task?.title || "", 180),
        inputText: cleanString(task?.inputText || "", 3500),
        prompt: cleanString(task?.prompt || "", 1800),
        requiredPoints: Array.isArray(task?.requiredPoints)
          ? task.requiredPoints.slice(0, 5).map((point) => cleanString(point, 500)).filter(Boolean)
          : [],
        targetAudience: cleanString(task?.targetAudience || "", 160),
        expectedRegister: cleanString(task?.expectedRegister || "", 60),
        answer: {
          text: answerText,
          wordCount,
          wordCountStatus: taskType ? getOteWordCountStatus(taskType, wordCount) : "",
        },
      };
    }),
  };
}

function buildOteWritingFeedbackPrompt(payload) {
  return [
    "You are an English writing feedback assistant for Oxford Test of English Writing.",
    "",
    "Use AI-estimated feedback based on Oxford Test of English-style criteria. Do not present the feedback as official Oxford Test of English marking.",
    "",
    "The service supports these task profiles:",
    "- ote_part1_email",
    "- ote_part2_essay",
    "- ote_part2_article",
    "- ote_part2_review",
    "",
    "Official task context:",
    "- Part 1 email: 80-130 words, responds to an input email, includes three required points, informal or neutral tone, functions such as giving information, responding to opinions/feelings, inviting, requesting, suggesting.",
    "- Part 2 essay/article/review: 100-160 words. Essay develops an argument on a classroom-discussion topic. Article/review tasks describe, narrate, express feelings/opinions, and may recommend. The target reader is usually an English teacher.",
    "- OTE Writing criteria are Task fulfilment, Organization, Grammar, and Lexis. Task fulfilment includes task requirements, format, register, and length.",
    "",
    "Feedback categories for every task:",
    "1. Task fulfilment, including format, register, and length",
    "2. Organization",
    "3. Grammar",
    "4. Lexis",
    "5. Word count",
    "6. Mistakes",
    "7. Improved version",
    "8. Priority advice",
    "",
    "Estimated writing level:",
    "- Use only: Below A2 / unclear, A2 range, B1 range, B1+/B2 range, Strong B2 range, C1 range, C2-like / above OTE range.",
    "- OTE reports results only up to B2, but this training tool may still describe observed writing quality above the OTE reporting range.",
    "- If the response shows highly natural idiomatic phrasing, flexible syntax, precise register control, strong cohesion, and almost no errors, use C1 range or C2-like / above OTE range even if the official exam would report at most B2.",
    "- Do not lower an otherwise advanced answer to B1+/B2 because of a small word-count excess, one slightly indirect point, or a minor punctuation choice. Mention those as local issues while keeping the observed language level high.",
    "- Reserve Strong B2 range for strong but still visibly upper-intermediate writing: generally effective, but with limited idiomatic range, some awkwardness, noticeable simplification, or several correctable issues.",
    "- If the writing is polished, idiomatic, naturally organized, register-appropriate, and virtually error-free, it should normally be C1 range or C2-like / above OTE range, not Strong B2.",
    "- Do not give a precise official score.",
    "",
    "Task fulfilment and content specificity are high priority. Internally identify the specific task requirements before giving feedback.",
    "- For Part 1, identify the three required points and check whether each is covered, partly covered, or missing.",
    "- For Part 1, check that the answer responds to the input email, not just the general topic.",
    "- For essays, check for a clear opinion, developed argument, reasons/examples, logical organization, and specificity to the question.",
    "- For articles, check that it reads like a magazine article, has an engaging suitable tone, and answers the article prompt precisely.",
    "- For reviews, check that the reviewed item is clear, details/opinions/reasons are given, and recommendation is included where required.",
    "- Flag generic content: memorised openings, vague statements, opinions without reasons, unrelated examples, or article/review answers that sound like general essays.",
    "",
    "Task-specific register:",
    "- Part 1 email to a friend: informal language, contractions, direct questions, friendly closings are appropriate.",
    "- Part 1 neutral recipient: polite but not excessively formal. Do not push students into very formal Aptis-style committee emails unless required.",
    "- Essay: neutral/formal classroom-discussion style; avoid very chatty phrases.",
    "- Article: can be lively and reader-focused; do not mark it down simply because it is less formal than an essay.",
    "- Review: can be semi-formal or lively; should be useful for the target reader and not sound like a private message.",
    "",
    "Word count handling:",
    "- Use the supplied wordCountStatus and do not contradict it.",
    "- Under-length responses should be flagged clearly because OTE specifications penalize under-length writing.",
    "- Acceptable_over_range means the answer is no more than 20 words over the target. Do not list this as a weakness, priority, or correction if the answer is focused, relevant, and accurate.",
    "- Only make length a meaningful issue when the response is excessive, or when extra length causes repetition, loss of focus, unclear task coverage, or avoidable language errors.",
    "",
    "Mistakes section:",
    "- Include a dedicated mistakes array for each task.",
    "- Each mistake should show the exact student text or a short phrase, a corrected version, and a short explanation.",
    "- Only include genuine, defensible problems. If nothing is wrong, return an empty mistakes array.",
    "- Do not invent corrections just because feedback was requested. Do not rewrite natural idiomatic language into blander exam language.",
    "- Do not correct style choices that are appropriate for the task register, such as contractions, informal phrasing, direct questions, or friendly closings in an email to a friend.",
    "- Treat natural idiomatic phrases as acceptable even if a simpler alternative exists. For example, do not correct phrases like 'landing you with the mess', 'so long as we book', 'he's gonna love it', or 'lend us a hand' in an informal email when they fit the context.",
    "- A correction must fix a real problem, not merely replace an advanced or idiomatic phrase with a simpler one.",
    "- Prioritize mistakes that clearly affect task fulfilment, register, grammar accuracy, lexis accuracy, spelling, punctuation, or clarity.",
    "- For excellent responses, it is normal to include 0 mistakes and no grammar/lexis examples. For weaker responses, include only the most useful mistakes, usually 1-5.",
    "- If a whole idea is missing, use category 'task', original as 'Missing idea: ...', and correction as a short suggested addition.",
    "- If a point is handled indirectly but still makes sense in context, describe it as a possible task-development improvement, not as a language error.",
    "",
    "Improved versions:",
    "- Preserve the student's meaning, choices, opinions, examples, and key ideas.",
    "- Do not change task decisions. For example, if the student chose the steep/fast route, keep that route; if the student chose the cafe, keep the cafe; if the student supported shorter holidays, keep that opinion.",
    "- The improved version should be a corrected and upgraded version of the student's answer, not a shorter alternative answer and not a generic model answer.",
    "- If the student's answer is already excellent and there are no meaningful corrections, keep improvedVersion identical or nearly identical to the original. Do not force changes.",
    "- Keep the version close to the original structure when the structure works.",
    "- Make the writing genuinely better: improve accuracy, naturalness, cohesion, and task clarity while preserving content.",
    "- Keep the version realistic for the student's observed level; do not simplify a C1/C2-like answer into a lower-level model answer.",
    "- Do not remove specific details unless they are irrelevant, repetitive, or incorrect.",
    "- Add new ideas only when a required task point is missing or too vague.",
    "- Keep Part 1 improved emails 80-130 words where possible.",
    "- Keep Part 2 improved versions 100-160 words where possible.",
    "",
    "Overall feedback and priorities:",
    "- mainPriorities may be an empty array when there are no meaningful priorities. Do not fill it with artificial advice.",
    "- If the only issue is a tiny task-development point or a small overage within acceptable_over_range, say so proportionately and do not make it sound like a serious weakness.",
    "- For excellent answers, the teacherNote should explicitly say that no significant language corrections are needed.",
    "",
    "Feedback style: clear, practical, encouraging, suitable for A2-C2 learners, specific to the answer. Avoid long grammar lectures, vague advice, official score claims, harsh wording, generic repeated advice, and unnecessary correction.",
    "Keep all feedback fields concise. Use one short sentence for most feedback strings, and keep mistake explanations brief so the JSON response can complete cleanly.",
    "Return only valid JSON using the required schema.",
    "",
    "Submission:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function normalizeOteRegisterGapPayload(data) {
  const gaps = Array.isArray(data?.gaps) ? data.gaps : [];
  return {
    exam: "ote",
    taskId: cleanString(data?.taskId || "", 80),
    title: cleanString(data?.title || "", 160),
    direction: cleanString(data?.direction || "", 80),
    targetRegister: cleanString(data?.targetRegister || "", 60),
    sourceRegister: cleanString(data?.sourceRegister || "", 60),
    instructions: cleanString(data?.instructions || "", 500),
    gaps: gaps.slice(0, 8).map((gap) => ({
      number: cleanString(gap?.number || "", 10),
      studentAnswer: cleanString(gap?.studentAnswer || "", 120),
      sentenceBefore: cleanString(gap?.sentenceBefore || "", 500),
      sentenceAfter: cleanString(gap?.sentenceAfter || "", 500),
      sourceMeaning: cleanString(gap?.sourceMeaning || "", 500),
      idiomNote: cleanString(gap?.idiomNote || "", 500),
      acceptedAnswers: Array.isArray(gap?.acceptedAnswers)
        ? gap.acceptedAnswers.slice(0, 8).map((answer) => cleanString(answer, 80)).filter(Boolean)
        : [],
    })),
  };
}

function buildOteRegisterGapFeedbackPrompt(payload) {
  return [
    "You are an expert English exam writing teacher for Oxford Test of English email tasks.",
    "Assess short gap-fill answers in a register transformation activity.",
    "The student is completing a parallel email so it keeps the same meaning in a different register.",
    "",
    "Judge each answer in four ways:",
    "- Meaning: does it preserve the intended idea?",
    "- Syntax: does it fit grammatically into the exact sentence frame?",
    "- Lexis: is the word or phrase natural and precise?",
    "- Register: is it appropriate for the target register? This is the most important criterion.",
    "",
    "Use the acceptedAnswers only as examples, not as the full list of possible correct answers.",
    "Accept creative alternatives if they fit the sentence, meaning, and target register.",
    "Follow any idiomNote exactly when judging naturalness. Do not recommend a phrase that the idiomNote says is unnatural.",
    "If an answer is blank, mark verdict as blank and suggest a suitable answer.",
    "If an answer is understandable but awkward, mark partly_appropriate and explain the smallest useful fix.",
    "For verdict excellent, set betterAnswer to an empty string and do not suggest a replacement.",
    "For verdict acceptable, set betterAnswer to an empty string unless there is a clearly better idiomatic option. Never repeat the student's answer in betterAnswer.",
    "Keep every field concise, practical, and learner-friendly. Do not give official exam scores.",
    "Return strict JSON only.",
    "",
    "Activity:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function normalizeOteRegisterRewritePayload(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return {
    exam: "ote",
    taskId: cleanString(data?.taskId || "", 80),
    title: cleanString(data?.title || "", 160),
    instructions: cleanString(data?.instructions || "", 500),
    items: items.slice(0, 12).map((item) => ({
      id: cleanString(item?.id || "", 20),
      functionLabel: cleanString(item?.functionLabel || "", 160),
      sourceRegister: cleanString(item?.sourceRegister || "", 40),
      targetRegister: cleanString(item?.targetRegister || "", 40),
      prompt: cleanString(item?.prompt || "", 500),
      studentAnswer: cleanString(item?.studentAnswer || "", 1000),
      suggestedAnswers: Array.isArray(item?.suggestedAnswers)
        ? item.suggestedAnswers.slice(0, 4).map((answer) => cleanString(answer, 400)).filter(Boolean)
        : [],
      keyFeatures: Array.isArray(item?.keyFeatures)
        ? item.keyFeatures.slice(0, 8).map((feature) => cleanString(feature, 120)).filter(Boolean)
        : [],
    })),
  };
}

function buildOteRegisterRewriteFeedbackPrompt(payload) {
  return [
    "You are an expert English exam writing teacher for Oxford Test of English email tasks.",
    "Assess sentence-level register transformations. The student rewrites each prompt into the opposite register.",
    "This is a formative practice activity, not formal marking. Be generous with natural alternatives from confident B2-C1 writers.",
    "",
    "For each answer judge:",
    "- Meaning: does it preserve the main communicative function and idea?",
    "- Syntax: is it a complete, grammatical sentence or phrase for the function?",
    "- Lexis: are the vocabulary and collocations natural?",
    "- Register: does it fit the requested target register? This is the most important criterion.",
    "",
    "Use suggestedAnswers and keyFeatures as examples, not as a fixed answer key.",
    "Do not use suggestedAnswers as preferred targets. They are sample classroom answers only.",
    "If the student's answer is natural and target-register appropriate, do not say another suggestedAnswer would be more typical, softer, more direct, or better.",
    "Do not add a 'though...' caveat just because the student's answer differs from suggestedAnswers.",
    "Accept natural alternatives that fit the target register, even if they do not match the examples.",
    "Do not penalize small, reasonable wording changes if the communicative function and register are preserved.",
    "Treat a response as excellent when it is natural, register-appropriate, and communicates the same broad function, even if it is not identical to the prompt.",
    "Use acceptable for answers that work but have a real minor issue worth fixing. Do not use acceptable merely to mean 'not the same as the model'.",
    "Use partly_appropriate only for a clear issue: noticeably changed meaning, unnatural collocation, incomplete syntax, or register mismatch.",
    "When the writer uses an advanced but natural formal phrase, do not call it too strict, too elaborate, or a meaning shift unless it genuinely changes the message.",
    "Specific calibration: 'Speak soon,' is an excellent informal sign-off. 'I would recommend visiting the park this weekend as an alternative' is an excellent formal suggestion. 'Much as I would be delighted to participate...' can be excellent as a formal decline if the rest of the sentence is grammatical and natural.",
    "For verdict excellent, set suggestedRewrite to an empty string and do not suggest a replacement.",
    "For verdict acceptable, set suggestedRewrite to an empty string unless there is one clear small upgrade. Never repeat the student's answer in suggestedRewrite.",
    "If an answer is blank, mark verdict as blank and provide a suitable rewrite.",
    "Keep feedback concise and learner-friendly. Do not give official exam scores.",
    "Return strict JSON only.",
    "",
    "Activity:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

exports.generateWritingFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating writing feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const answer = cleanString(data?.answer || "", 8000);
    if (countWords(answer) < 3) {
      throw new functions.https.HttpsError("invalid-argument", "The writing answer is too short to assess.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const prompt = buildWritingFeedbackPrompt({ ...data, answer });
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "generic",
      WRITING_FEEDBACK_CREDIT_COSTS.generic
    );

    const requestBody = {
      model,
      input: prompt,
      reasoning: { effort: "low" },
      max_output_tokens: 2200,
      text: {
        verbosity: data?.feedbackLength === "detailed" ? "high" : "medium",
        format: {
          type: "json_schema",
          name: "writing_feedback",
          strict: true,
          schema: WRITING_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateWritingFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateWritingFeedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateWritingFeedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateOteWritingFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating writing feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteWritingPayload(data);
    if (!payload.tasks.length || payload.tasks.some((task) => !task.taskType || !task.answer.text || !task.prompt)) {
      throw new functions.https.HttpsError("invalid-argument", "OTE writing feedback requires valid task data.");
    }
    if (payload.mode === "full_mock" && payload.tasks.length !== 2) {
      throw new functions.https.HttpsError("invalid-argument", "Full mock feedback requires two writing tasks.");
    }
    const part1 = payload.tasks.find((task) => task.taskType === "ote_part1_email");
    if (part1 && part1.requiredPoints.length < 3) {
      throw new functions.https.HttpsError("invalid-argument", "OTE Part 1 email feedback requires three points.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditTaskType = payload.mode === "single_task" ? "ote_single_task" : "ote_full_mock";
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      creditTaskType,
      WRITING_FEEDBACK_CREDIT_COSTS[creditTaskType]
    );
    const requestBody = {
      model,
      input: buildOteWritingFeedbackPrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: payload.mode === "full_mock" ? 5200 : 3400,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "ote_writing_feedback",
          strict: true,
          schema: OTE_WRITING_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateOteWritingFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteWritingFeedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateOteWritingFeedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    feedback = postProcessOteWritingFeedback(payload, feedback);

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateOteRegisterGapFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating register feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteRegisterGapPayload(data);
    if (!payload.taskId || !payload.gaps.length) {
      throw new functions.https.HttpsError("invalid-argument", "Register gap feedback requires valid task data.");
    }
    if (!payload.gaps.some((gap) => gap.studentAnswer.trim())) {
      throw new functions.https.HttpsError("invalid-argument", "Add at least one answer before requesting feedback.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "ote_register_gap",
      WRITING_FEEDBACK_CREDIT_COSTS.ote_register_gap
    );
    const requestBody = {
      model,
      input: buildOteRegisterGapFeedbackPrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 2200,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "ote_register_gap_feedback",
          strict: true,
          schema: OTE_REGISTER_GAP_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateOteRegisterGapFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteRegisterGapFeedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateOteRegisterGapFeedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateOteRegisterRewriteFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating rewrite feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteRegisterRewritePayload(data);
    if (!payload.taskId || !payload.items.length) {
      throw new functions.https.HttpsError("invalid-argument", "Register rewrite feedback requires valid task data.");
    }
    if (!payload.items.some((item) => item.studentAnswer.trim())) {
      throw new functions.https.HttpsError("invalid-argument", "Add at least one rewrite before requesting feedback.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "ote_register_rewrite",
      WRITING_FEEDBACK_CREDIT_COSTS.ote_register_rewrite
    );
    const requestBody = {
      model,
      input: buildOteRegisterRewriteFeedbackPrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 3000,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "ote_register_rewrite_feedback",
          strict: true,
          schema: OTE_REGISTER_REWRITE_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateOteRegisterRewriteFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteRegisterRewriteFeedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateOteRegisterRewriteFeedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateAptisWritingPart1Feedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating writing feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const items = normalizePart1Items(data?.items);
    if (items.length !== 5 || items.some((item) => !item.question || !item.answer)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Writing Part 1 feedback requires five answered items."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "aptis_part1",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_part1
    );
    const requestBody = {
      model,
      input: buildAptisWritingPart1Prompt(items),
      reasoning: { effort: "low" },
      max_output_tokens: 1400,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "aptis_writing_part1_feedback",
          strict: true,
          schema: APTIS_WRITING_PART1_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateAptisWritingPart1Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisWritingPart1Feedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateAptisWritingPart1Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    if (
      feedback?.overall &&
      items.every((item) => item.wordCount >= 1 && item.wordCount <= 5)
    ) {
      feedback.overall.lengthControl = "good";
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateAptisSpeakingPart1Feedback = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 120, memory: "512MB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating speaking feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const questions = normalizeSpeakingPart1Questions(data?.questions);
    const recordings = normalizeSpeakingAudioItems(data?.recordings);
    if (
      questions.length !== 3 ||
      recordings.length !== 3 ||
      questions.some((item) => !item.question) ||
      recordings.some((item) => !item.base64)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Speaking Part 1 feedback requires three questions and three recordings."
      );
    }

    const totalBase64Bytes = recordings.reduce((sum, item) => sum + item.base64.length, 0);
    if (totalBase64Bytes > 9_000_000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "These recordings are too large for the trial feedback request."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "aptis_speaking_part1",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_speaking_part1
    );

    let transcripts;
    try {
      transcripts = await Promise.all(recordings.map((item, index) => transcribeAudioItem(item, index)));
    } catch (error) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw error;
    }

    const items = questions.map((question, index) => {
      const transcript = cleanString(transcripts[index] || "", 2000);
      return {
        questionId: question.id,
        question: question.question,
        transcript,
        durationSeconds: 0,
        audioAvailable: true,
        audioAnalysisAvailable: false,
        transcriptionConfidence: "medium",
        wordCount: countWords(transcript),
      };
    });

    if (items.every((item) => item.wordCount < 2)) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The recordings could not be transcribed clearly enough to assess."
      );
    }

    const requestBody = {
      model,
      input: buildAptisSpeakingPart1Prompt(items),
      reasoning: { effort: "low" },
      max_output_tokens: 3600,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "aptis_speaking_part1_feedback",
          strict: true,
          schema: APTIS_SPEAKING_PART1_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateAptisSpeakingPart1Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisSpeakingPart1Feedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateAptisSpeakingPart1Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    return {
      transcripts: items,
      feedback,
      meta: {
        model,
        transcriptionModel: "gpt-4o-mini-transcribe",
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
        audioStored: false,
      },
    };
  });

exports.generateAptisSpeakingPart2Feedback = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 120, memory: "512MB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating speaking feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const task = normalizeSpeakingPart2Task(data);
    const recordings = normalizeSpeakingAudioItems(data?.recordings);
    if (
      task.questions.length !== 3 ||
      recordings.length !== 3 ||
      task.questions.some((item) => !item.question) ||
      recordings.some((item) => !item.base64)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Speaking Part 2 feedback requires three questions and three recordings."
      );
    }

    const totalBase64Bytes = recordings.reduce((sum, item) => sum + item.base64.length, 0);
    if (totalBase64Bytes > 9_000_000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "These recordings are too large for the trial feedback request."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "aptis_speaking_part2",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_speaking_part2
    );

    let transcripts;
    try {
      transcripts = await Promise.all(recordings.map((item, index) => transcribeAudioItem(item, index)));
    } catch (error) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw error;
    }

    const items = task.questions.map((question, index) => {
      const transcript = cleanString(transcripts[index] || "", 2400);
      return {
        questionId: question.id,
        questionNumber: question.questionNumber,
        questionType: question.questionType,
        question: question.question,
        transcript,
        durationSeconds: 45,
        audioAvailable: true,
        audioAnalysisAvailable: false,
        transcriptionConfidence: "medium",
        wordCount: countWords(transcript),
      };
    });

    if (items.every((item) => item.wordCount < 2)) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The recordings could not be transcribed clearly enough to assess."
      );
    }

    const requestBody = {
      model,
      input: buildAptisSpeakingPart2Prompt(task, items),
      reasoning: { effort: "low" },
      max_output_tokens: 4600,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "aptis_speaking_part2_feedback",
          strict: true,
          schema: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateAptisSpeakingPart2Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisSpeakingPart2Feedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateAptisSpeakingPart2Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    feedback = postProcessAptisSpeakingPart2Feedback(feedback, items);

    return {
      transcripts: items,
      feedback,
      meta: {
        model,
        transcriptionModel: "gpt-4o-mini-transcribe",
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
        audioStored: false,
      },
    };
  });

exports.generateAptisWritingPart23Feedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating writing feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizePart23Payload(data);
    const expectedAnswers = payload.part === "part2" ? 1 : payload.part === "part3" ? 3 : 0;
    if (!expectedAnswers || payload.answers.length !== expectedAnswers) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Writing feedback requires part2 with one answer or part3 with three answers."
      );
    }
    if (payload.answers.some((answer) => !answer.text)) {
      throw new functions.https.HttpsError("invalid-argument", "All answers must contain text.");
    }
    if (payload.part === "part2" && !payload.prompt) {
      throw new functions.https.HttpsError("invalid-argument", "Part 2 feedback requires a prompt.");
    }
    if (payload.part === "part3" && payload.chats.length !== 3) {
      throw new functions.https.HttpsError("invalid-argument", "Part 3 feedback requires three chat messages.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const feedbackTaskType = payload.part === "part2" ? "aptis_part2" : "aptis_part3";
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      feedbackTaskType,
      WRITING_FEEDBACK_CREDIT_COSTS[feedbackTaskType]
    );
    const requestBody = {
      model,
      input: buildAptisWritingPart23Prompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: payload.part === "part2" ? 2300 : 4700,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "aptis_writing_part23_feedback",
          strict: true,
          schema: APTIS_WRITING_PART23_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateAptisWritingPart23Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisWritingPart23Feedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateAptisWritingPart23Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    if (Array.isArray(feedback?.answers)) {
      feedback.answers = feedback.answers.map((answer, index) => ({
        ...answer,
        wordCount: payload.answers[index]?.wordCount ?? answer.wordCount,
        wordCountStatus: payload.answers[index]?.wordCountStatus || answer.wordCountStatus,
      }));
    }
    if (feedback?.overall) {
      feedback.overall.wordCountComment = payload.answers
        .map((answer) => describePart23WordCount(answer.wordCountStatus, answer.wordCount))
        .join(" ");
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });

exports.generateAptisWritingPart4Feedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating writing feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizePart4Payload(data);
    if (!payload.source || !payload.friendPrompt || !payload.formalPrompt) {
      throw new functions.https.HttpsError("invalid-argument", "Part 4 feedback requires source and both prompts.");
    }
    if (!payload.friendEmail.text || !payload.formalEmail.text) {
      throw new functions.https.HttpsError("invalid-argument", "Both Part 4 emails must contain text.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "aptis_part4",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_part4
    );
    const requestBody = {
      model,
      input: buildAptisWritingPart4Prompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 5200,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "aptis_writing_part4_feedback",
          strict: true,
          schema: APTIS_WRITING_PART4_FEEDBACK_SCHEMA,
        },
      },
    };

    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("[generateAptisWritingPart4Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisWritingPart4Feedback] OpenAI error", responseJson);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "internal",
        responseJson?.error?.message || "The feedback service returned an error."
      );
    }

    const outputText = extractOutputText(responseJson);
    let feedback;
    try {
      feedback = JSON.parse(outputText);
    } catch (error) {
      console.error("[generateAptisWritingPart4Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    if (feedback?.informalEmail) {
      feedback.informalEmail.wordCount = payload.friendEmail.wordCount;
      feedback.informalEmail.wordCountStatus = payload.friendEmail.wordCountStatus;
      feedback.informalEmail.wordCountFeedback = describePart4WordCount(
        "informal",
        payload.friendEmail.wordCountStatus,
        payload.friendEmail.wordCount
      );
    }
    if (feedback?.formalEmail) {
      feedback.formalEmail.wordCount = payload.formalEmail.wordCount;
      feedback.formalEmail.wordCountStatus = payload.formalEmail.wordCountStatus;
      feedback.formalEmail.wordCountFeedback = describePart4WordCount(
        "formal",
        payload.formalEmail.wordCountStatus,
        payload.formalEmail.wordCount
      );
    }

    return {
      feedback,
      meta: {
        model,
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
        quota: creditReservation,
      },
    };
  });


// Tip: pick a region; matching your TTS function is nice. If unsure, keep default.
exports.emailReport = functions.region("europe-west1")
  // .region("europe-west1")  // optional: align with your speak() region
  .firestore.document("reports/{reportId}")
  .onCreate(async (snap) => {
    const r = snap.data() || {};

    // Accept both old and new field names
    const {
      itemId,
      level = null,
      question = "",
      comments = "",
      selectedOption = null,
      correctOption = null,
      userEmail = null,
      userId = null,
    } = r;

    const issue =
      r.issueLabel || r.issueCode || r.issue || "unspecified";

    const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" });

    const lines = [
      `Item: ${itemId || "-"}`,
      `Question: ${question || "-"}`,
      `Issue: ${issue}`,
      `Comments: ${comments || "none"}`,
      ...(level ? [`Level: ${level}`] : []),
      ...(selectedOption != null ? [`User selected: ${selectedOption}`] : []),
      ...(correctOption != null ? [`Correct answer: ${correctOption}`] : []),
      `Reported by: ${userEmail || "anonymous"}${userId ? ` (uid: ${userId})` : ""}`,
      `At: ${when}`,
    ];

    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const toHtml = (arr) => arr.map(l => `<p>${esc(l)}</p>`).join("");

   // --- Admin email
   const adminMsg = {
    from: FROM_ADDRESS,
    to: TEACHER_EMAIL || FROM_ADDRESS,
    subject: `New report: ${issue} — ${itemId || "-"}`,
    text: lines.join("\n"),
    html: toHtml(lines),
    replyTo: userEmail && userEmail.includes("@") ? userEmail : undefined,
  };

    // --- Optional user receipt
    const userMsg = (userEmail && userEmail.includes("@")) ? {
      from: FROM_ADDRESS,
      to: userEmail,
      subject: "Thanks for your feedback 🙌",
      text: [
        "Thank you for your feedback! We will review the question as soon as possible.",
        "",
        "Here’s a copy of your report:",
        "",
        ...lines
      ].join("\n"),
      html:
        `<p>Thank you for your feedback! We will review the question as soon as possible.</p>` +
        `<hr/>` + toHtml(lines),
      replyTo: TEACHER_EMAIL || FROM_ADDRESS,
    } : null;

    try {
      await transporter.sendMail(adminMsg);
      if (userMsg) await transporter.sendMail(userMsg);
      console.log("MAIL_OK report", { id: snap.id, to: adminMsg.to, copy: !!userMsg });
    } catch (err) {
      console.error("MAIL_FAIL report", err?.message || String(err));
      // Do not throw — avoid retry storms; logs are enough to debug
    }

    return null;
  });

exports.emailHubAccessRequest = functions.region("europe-west1")
  .firestore.document("hubAccessRequests/{requestId}")
  .onCreate(async (snap) => {
    const r = snap.data() || {};
    const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" });
    const userEmail = r.userEmail || null;

    const lines = [
      "New Seif Hub access request",
      "",
      `Site: ${r.site || "seifhub"}`,
      `User: ${r.userName || "-"}`,
      `Email: ${userEmail || "-"}`,
      `UID: ${r.userId || "-"}`,
      `Note: ${r.note || "none"}`,
      `At: ${when}`,
    ];

    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const toHtml = (arr) => arr.map((l) => `<p>${esc(l)}</p>`).join("");

    const adminMsg = {
      from: FROM_ADDRESS,
      to: TEACHER_EMAIL || FROM_ADDRESS,
      subject: `Seif Hub access request — ${userEmail || r.userName || "unknown user"}`,
      text: lines.join("\n"),
      html: toHtml(lines),
      replyTo: userEmail && userEmail.includes("@") ? userEmail : undefined,
    };

    const userMsg = userEmail && userEmail.includes("@")
      ? {
          from: FROM_ADDRESS,
          to: userEmail,
          subject: "We’ve received your Seif Hub access request",
          text: [
            "Thanks for your request. We’ve received it and will review your Seif Hub access shortly.",
            "",
            ...lines,
          ].join("\n"),
          html:
            "<p>Thanks for your request. We’ve received it and will review your Seif Hub access shortly.</p>" +
            "<hr/>" +
            toHtml(lines),
          replyTo: TEACHER_EMAIL || FROM_ADDRESS,
        }
      : null;

    try {
      await transporter.sendMail(adminMsg);
      if (userMsg) await transporter.sendMail(userMsg);
      console.log("MAIL_OK hub access request", { id: snap.id, to: adminMsg.to, copy: !!userMsg });
    } catch (err) {
      console.error("MAIL_FAIL hub access request", err?.message || String(err));
    }

    return null;
  });

// =============== NEW: notify when a user becomes a TEACHER ===============
exports.onUserRoleChange = functions
  .region("europe-west1")
  .firestore.document("users/{userId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after  = change.after.exists  ? change.after.data()  : null;

    // If the document was deleted, do nothing
    if (!after) {
      return null;
    }

    const oldRole = before?.role || null;
    const newRole = after.role || null;

    // Only act if the role has JUST become "teacher"
    if (newRole !== "teacher" || oldRole === "teacher") {
      return null;
    }

    const userEmail = after.email || null;
    const when = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/Madrid",
    });

    const teacherLines = [
      "Hi!",
      "",
      "You’ve just been set up as a TEACHER on the Seif Aptis Trainer.",
      "",
      "From now on you’ll gradually see more teacher-only tools and options, ",
      "such as setting personalised grammar tests and accessing extra materials.",
      "",
      "If you think this was a mistake, or you have any questions, ",
      "please reply to this email.",
      "",
      `Activated on: ${when}`,
    ];

    const adminLines = [
      `User promoted to TEACHER at ${when}`,
      "",
      `UID: ${context.params.userId}`,
      `Email: ${userEmail || "(no email stored)"}`,
      "",
      `Previous role: ${oldRole || "(none)"}`,
      `New role: ${newRole}`,
    ];

    // Email to the new teacher (if we have an address)
    const teacherMsg =
      userEmail && userEmail.includes("@")
        ? {
            from: FROM_ADDRESS,
            to: userEmail,
            subject: "You now have teacher access – Seif Aptis Trainer",
            text: teacherLines.join("\n"),
            html:
              "<p>Hi!</p>" +
              "<p>You’ve just been set up as a <strong>teacher</strong> on the Seif Aptis Trainer.</p>" +
              "<p>From now on you’ll gradually see more teacher-only tools and options, such as setting personalised grammar tests and accessing extra materials.</p>" +
              "<p>If you think this was a mistake, or you have any questions, please reply to this email.</p>" +
              `<p><em>Activated on: ${when}</em></p>`,
            replyTo: TEACHER_EMAIL || FROM_ADDRESS,
          }
        : null;

    // Notification to you / main admin address
    const adminMsg = {
      from: FROM_ADDRESS,
      to: TEACHER_EMAIL || FROM_ADDRESS,
      subject: "User promoted to TEACHER – Seif Aptis Trainer",
      text: adminLines.join("\n"),
      html: adminLines.map((l) => `<p>${l}</p>`).join(""),
    };

    try {
      // Notify admin
      await transporter.sendMail(adminMsg);

      // Notify teacher, if we know their email
      if (teacherMsg) {
        await transporter.sendMail(teacherMsg);
      }

      console.log("MAIL_OK teacher role change", {
        uid: context.params.userId,
        userEmail,
      });
    } catch (err) {
      console.error("MAIL_FAIL teacher role change", err?.message || String(err));
    }

    return null;
  });


// =============== NEW: HTTPS /speak (Google TTS + cache) =========
const cors  = require("cors")({ origin: true });
const crypto = require("crypto");
const textToSpeech = require("@google-cloud/text-to-speech");


const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * POST /speak
 * Body: { text, voice?, rate?, pitch?, format? }
 * Returns: { url, cached }
 */
exports.speak = functions.region('europe-west1').https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).send('');
    }

    try {
      if (req.method !== 'POST') {
        res.set('Access-Control-Allow-Origin', '*');
        return res.status(405).send('Method not allowed');
      }

      const { text, voice, rate, pitch, format } = req.body || {};
      if (!text || typeof text !== 'string') {
        res.set('Access-Control-Allow-Origin', '*');
        return res.status(400).json({ error: 'Missing text' });
      }
      if (text.length > 1200) {
        res.set('Access-Control-Allow-Origin', '*');
        return res.status(413).json({ error: 'Text too long (max 1200 chars)' });
      }

      const voiceName     = voice || 'en-GB-Neural2-C';
      const languageCode  = voiceName.startsWith('en-GB') ? 'en-GB' : 'en-US';
      const audioEncoding = (format === 'ogg') ? 'OGG_OPUS' : 'MP3';

      const synthParams = {
        text, voice: voiceName, languageCode,
        rate: rate ?? 1.0, pitch: pitch ?? 0.0, encoding: audioEncoding,
      };

      const key      = crypto.createHash('sha256').update(JSON.stringify(synthParams)).digest('hex');
      const ext      = audioEncoding === 'MP3' ? 'mp3' : 'ogg';
      const fileName = `ttsCache/${key}.${ext}`;

      const bucket = admin.storage().bucket();
      const file   = bucket.file(fileName);

      // 1) Cache hit?
      const [exists] = await file.exists();
      if (exists) {
        const [meta] = await file.getMetadata();
        let token = meta.metadata?.firebaseStorageDownloadTokens;
        if (!token) {
          token = crypto.randomUUID();
          await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
        }
        const url = `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
        res.set('Access-Control-Allow-Origin', '*');
        return res.json({ url, cached: true });
      }

      // 2) Synthesize
      const [response] = await ttsClient.synthesizeSpeech({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding, speakingRate: synthParams.rate, pitch: synthParams.pitch },
      });
      if (!response.audioContent) {
        res.set('Access-Control-Allow-Origin', '*');
        return res.status(500).json({ error: 'No audioContent from TTS' });
      }

      // 3) Save with download token, then build token URL
      const token = crypto.randomUUID();
      await file.save(response.audioContent, {
        metadata: {
          contentType: audioEncoding === 'MP3' ? 'audio/mpeg' : 'audio/ogg',
          metadata: { firebaseStorageDownloadTokens: token },
        },
        resumable: false,
        public: false,
        validation: false,
      });

      const url = `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
      res.set('Access-Control-Allow-Origin', '*');
      return res.json({ url, cached: false });

    } catch (err) {
      console.error('[speak] error', err);
      res.set('Access-Control-Allow-Origin', '*');
      return res.status(500).json({ error: err.message || 'TTS failed' });
    }
  });
});
