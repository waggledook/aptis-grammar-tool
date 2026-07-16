/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const nodemailer = require("nodemailer");
const {aggregateAnalyticsEvent} = require("./activityAnalytics");

// ---------- init Admin (safe if called twice) ----------
try { admin.app(); } catch { admin.initializeApp(); }

// ---------- Environment config ----------
const GMAIL_USER   = process.env.GMAIL_USER;
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD;
const TEACHER_EMAIL = process.env.TEACHER_EMAIL || GMAIL_USER;
const OTE_LEVEL_REPORT_COPY_EMAIL = "nicholas@beeskillsenglish.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const firestore = admin.firestore();

exports.aggregateActivityLog = functions
  .runWith({maxInstances: 5})
  .region("europe-west1")
  .firestore.document("activityLog/{logId}")
  .onCreate((snap, context) => aggregateAnalyticsEvent({
    firestore,
    admin,
    source: "activityLog",
    sourceId: context.params.logId,
    data: snap.data() || {},
    createdAt: snap.createTime || context.timestamp,
  }));

exports.aggregateWritingSubmission = functions
  .runWith({maxInstances: 5})
  .region("europe-west1")
  .firestore.document("submissions/{submissionId}")
  .onCreate((snap, context) => aggregateAnalyticsEvent({
    firestore,
    admin,
    source: "submissions",
    sourceId: context.params.submissionId,
    data: {
      ...snap.data(),
      type: "writing_general_submission",
      app: "aptis-writing-general",
    },
    createdAt: snap.createTime || context.timestamp,
  }));

const WRITING_FEEDBACK_WEEKLY_CREDITS = {
  student: 40,
  teacher: 100,
  admin: 1000,
};

const APTIS_TRAINER_ACCESS_KEY = "aptisTrainer";
const SEIF_HUB_ACCESS_KEY = "seifhub";
const APTIS_DEMO_FEEDBACK_LIFETIME_CREDITS = 8;

const WRITING_FEEDBACK_CREDIT_COSTS = {
  generic: 4,
  aptis_part1: 1,
  aptis_part2: 2,
  aptis_part3: 3,
  aptis_part4: 5,
  aptis_speaking_part1: 2,
  aptis_speaking_part2: 3,
  aptis_speaking_part3: 4,
  aptis_speaking_part4: 5,
  ote_speaking_part: 4,
  ote_speaking_mock: 8,
  ote_full_mock: 8,
  ote_single_task: 4,
  ote_advanced_intro_conclusion: 2,
  ote_advanced_academic_style: 1,
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

function todayIsoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getSiteAccessConfig(userData, accessKey) {
  const raw = userData?.siteAccess?.[accessKey];

  if (raw === true) {
    return {
      active: true,
      startDate: "",
      endDate: "",
      indefinite: true,
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
    };
  }

  return {
    active: !!raw.active,
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    indefinite: !!raw.indefinite,
  };
}

function hasAptisTrainerAccess(userData) {
  const role = userData?.role || "student";
  if (role === "admin" || role === "teacher") return true;

  const access = getSiteAccessConfig(userData, APTIS_TRAINER_ACCESS_KEY);
  if (!access.active) return false;

  const today = todayIsoDate();
  if (access.startDate && today < access.startDate) return false;
  if (!access.indefinite && access.endDate && today > access.endDate) return false;

  return true;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteAccessLabel(accessKey = "") {
  const labels = {
    [APTIS_TRAINER_ACCESS_KEY]: "Aptis Trainer",
    [SEIF_HUB_ACCESS_KEY]: "Seif Hub",
    ote: "OTE Seif",
  };

  if (labels[accessKey]) return labels[accessKey];

  return String(accessKey || "your course platform")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "your course platform";
}

function siteAccessUrl(accessKey = "") {
  const urls = {
    [APTIS_TRAINER_ACCESS_KEY]: "https://aptis.beeskillsenglish.com/",
    [SEIF_HUB_ACCESS_KEY]: "https://seifhub.beeskillsenglish.com/",
    ote: "https://ote-seif.beeskillsenglish.com/",
  };

  return urls[accessKey] || "https://aptis.beeskillsenglish.com/";
}

function normalizeSiteAccessEntry(raw) {
  if (raw === true) {
    return {
      active: true,
      startDate: "",
      endDate: "",
      indefinite: true,
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
    };
  }

  return {
    active: !!raw.active,
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    indefinite: !!raw.indefinite,
  };
}

function hasMeaningfulAccessNotificationChange(beforeAccess, afterAccess) {
  if (!afterAccess.active) return false;
  if (!beforeAccess.active) return true;

  return (
    beforeAccess.startDate !== afterAccess.startDate ||
    beforeAccess.endDate !== afterAccess.endDate ||
    beforeAccess.indefinite !== afterAccess.indefinite
  );
}

function formatAccessDate(dateString = "") {
  if (!dateString) return "";

  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function isAptisFeedbackTask(taskType) {
  return String(taskType || "").startsWith("aptis_");
}

async function consumeWritingFeedbackCredits(context, taskType, creditCost) {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in to get feedback.");
  }

  const uid = context.auth.uid;
  const weekKey = getFeedbackWeekKey();
  const userRef = firestore.doc(`users/${uid}`);
  const usageRef = firestore.doc(`users/${uid}/writingFeedbackUsage/${weekKey}`);
  const demoUsageRef = firestore.doc(`users/${uid}/aptisTrainerDemoFeedbackUsage/lifetime`);

  return firestore.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.data() || {};

    if (isAptisFeedbackTask(taskType) && !hasAptisTrainerAccess(userData)) {
      const usageSnap = await tx.get(demoUsageRef);
      const rawLifetimeLimit = userData.aptisDemoFeedbackLifetimeCredits;
      const customLifetimeLimit =
        rawLifetimeLimit === undefined || rawLifetimeLimit === null || rawLifetimeLimit === ""
          ? NaN
          : Number(rawLifetimeLimit);
      const lifetimeLimit = Number.isFinite(customLifetimeLimit)
        ? customLifetimeLimit
        : APTIS_DEMO_FEEDBACK_LIFETIME_CREDITS;
      const used = Number(usageSnap.data()?.creditsUsed || 0);
      const nextUsed = used + creditCost;

      if (nextUsed > lifetimeLimit) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "You have used your demo feedback credits. Full Aptis Trainer access includes more AI feedback."
        );
      }

      tx.set(
        demoUsageRef,
        {
          pool: "aptis_demo_lifetime",
          creditsUsed: nextUsed,
          lifetimeLimit,
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
        creditsRemaining: Math.max(0, lifetimeLimit - nextUsed),
        lifetimeLimit,
        pool: "aptis_demo_lifetime",
      };
    }

    const usageSnap = await tx.get(usageRef);
    const role = userData.role || "student";
    const weeklyLimit =
      userData.writingFeedbackWeeklyCredits ??
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
      creditsRemaining: Math.max(0, weeklyLimit - nextUsed),
      weeklyLimit,
      weekKey,
      pool: "weekly",
    };
  });
}

async function refundWritingFeedbackCredits(context, reservation) {
  if (!context.auth?.uid || !reservation?.creditCost) return;

  if (reservation.pool === "aptis_demo_lifetime") {
    const usageRef = firestore.doc(`users/${context.auth.uid}/aptisTrainerDemoFeedbackUsage/lifetime`);
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
    return;
  }

  if (!reservation.weekKey) return;

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

async function logAiFeedbackGeneratedServer(context, kind, details = {}, resultMeta = {}) {
  if (!context.auth?.uid) return;

  const quota = resultMeta?.quota || {};
  try {
    await firestore.collection("activityLog").add({
      userId: context.auth.uid,
      userEmail: context.auth.token?.email || null,
      type: "ai_feedback_generated",
      details: {
        kind,
        product: details.product || "aptis",
        section: details.section || "",
        part: details.part || "",
        mode: details.mode || "",
        taskId: details.taskId || "",
        taskTitle: details.taskTitle || details.title || "",
        answerCount: details.answerCount ?? null,
        wordCount: details.wordCount ?? null,
        model: resultMeta.model || details.model || "",
        feedbackTaskType: details.feedbackTaskType || quota.taskType || "",
        creditCost: quota.creditCost ?? details.creditCost ?? null,
        loggedBy: "functions",
      },
      app: details.app || "aptis-trainer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("[activityLog] Failed to log AI feedback activity", error);
  }
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

const APTIS_SPEAKING_PART3_FEEDBACK_SCHEMA = JSON.parse(JSON.stringify(APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA));
APTIS_SPEAKING_PART3_FEEDBACK_SCHEMA.properties.taskType.enum = ["aptis_speaking_part3"];
APTIS_SPEAKING_PART3_FEEDBACK_SCHEMA.properties.answers.items.properties.questionType.enum = [
  "photo_comparison",
  "comparative_reasoning",
  "extended_opinion",
];

const APTIS_SPEAKING_PART4_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "estimatedLevel", "overall", "answer"],
  properties: {
    taskType: { type: "string", enum: ["aptis_speaking_part4"] },
    estimatedLevel: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.estimatedLevel,
    overall: {
      type: "object",
      additionalProperties: false,
      required: [
        "summary",
        "mainStrengths",
        "mainPriorities",
        "questionCoverage",
        "developmentAdvice",
        "transcriptCaveat",
      ],
      properties: {
        summary: { type: "string" },
        mainStrengths: { type: "array", items: { type: "string" } },
        mainPriorities: { type: "array", items: { type: "string" } },
        questionCoverage: { type: "array", items: { type: "string" } },
        developmentAdvice: { type: "string" },
        transcriptCaveat: { type: "string" },
      },
    },
    answer: {
      type: "object",
      additionalProperties: false,
      required: [
        "questionId",
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
        question: { type: "string" },
        transcript: { type: "string" },
        durationSeconds: { type: "number" },
        taskFulfilment: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.taskFulfilment,
        answerDevelopment: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.answerDevelopment,
        content: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.content,
        grammar: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.grammar,
        vocabulary: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.vocabulary,
        cohesion: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.cohesion,
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
        fluency: APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA.properties.answers.items.properties.fluency,
        improvedAnswer: { type: "string" },
        teacherNote: { type: "string" },
      },
    },
  },
};

const OTE_SPEAKING_FEEDBACK_SCHEMA = JSON.parse(JSON.stringify(APTIS_SPEAKING_PART2_FEEDBACK_SCHEMA));
OTE_SPEAKING_FEEDBACK_SCHEMA.properties.taskType.enum = ["ote_speaking"];
OTE_SPEAKING_FEEDBACK_SCHEMA.properties.estimatedLevel.properties.label.enum = [
  "Below A2 / unclear",
  "A2 range",
  "B1 range",
  "B2 range",
  "C1 range",
  "C1+ range",
  "C2-like / above OTE task range",
];
OTE_SPEAKING_FEEDBACK_SCHEMA.properties.answers.items.properties.questionNumber = { type: "integer" };
OTE_SPEAKING_FEEDBACK_SCHEMA.properties.answers.items.properties.questionType.enum = [
  "interview",
  "formal_voicemail",
  "informal_voicemail",
  "diplomatic_voicemail",
  "summary",
  "debate",
  "talk",
  "follow_up",
];

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
            "B2 range",
            "Strong B2 range",
            "C1 range",
            "At least C1 / above OTE range",
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
          "summaryEvaluation",
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
            enum: [
              "ote_part1_email",
              "ote_part2_essay",
              "ote_part2_article",
              "ote_part2_review",
              "ote_advanced_part1_essay",
              "ote_advanced_part2_summary",
            ],
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
                    status: { type: "string", enum: ["covered", "partly_covered", "missing", "optional_not_used"] },
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
          summaryEvaluation: {
            type: "object",
            additionalProperties: false,
            required: [
              "applicable",
              "overarchingIdea",
              "mainIdeas",
              "useOfSources",
              "synthesis",
              "redundancy",
              "organization",
              "paraphrasing",
            ],
            properties: {
              applicable: { type: "boolean" },
              overarchingIdea: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["present", "partly_present", "missing", "not_applicable"] },
                  feedback: { type: "string" },
                },
              },
              mainIdeas: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["id", "idea", "status", "feedback", "supportingDetail"],
                  properties: {
                    id: { type: "string" },
                    idea: { type: "string" },
                    status: { type: "string", enum: ["present", "partly_present", "missing"] },
                    feedback: { type: "string" },
                    supportingDetail: {
                      type: "object",
                      additionalProperties: false,
                      required: ["status", "feedback"],
                      properties: {
                        status: { type: "string", enum: ["appropriate", "limited", "missing"] },
                        feedback: { type: "string" },
                      },
                    },
                  },
                },
              },
              useOfSources: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["both_clearly_used", "both_used_but_weakly_integrated", "only_one_used", "not_applicable"] },
                  feedback: { type: "string" },
                },
              },
              synthesis: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["strongly_connected", "some_cross_text_integration", "source_by_source_summary", "not_applicable"] },
                  feedback: { type: "string" },
                },
              },
              redundancy: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["minimal", "some_unnecessary_detail", "excessive_detail_crowding_out_main_ideas", "not_applicable"] },
                  feedback: { type: "string" },
                },
              },
              organization: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["logical_idea_based_order", "partly_integrated", "mainly_follows_original_source_order", "not_applicable"] },
                  feedback: { type: "string" },
                },
              },
              paraphrasing: {
                type: "object",
                additionalProperties: false,
                required: ["status", "feedback"],
                properties: {
                  status: { type: "string", enum: ["structures_and_vocabulary_adapted", "partly_adapted", "heavily_dependent_on_source_wording", "not_applicable"] },
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

const OTE_LEVEL_PRODUCTION_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "taskType",
    "speaking",
    "writing",
    "productionEstimate",
    "confidence",
    "courseRecommendation",
    "advancedRecommended",
    "strength",
    "priority",
    "candidateMessage",
    "writingCorrections",
  ],
  properties: {
    taskType: { type: "string", enum: ["ote_level_production_feedback"] },
    speaking: {
      type: "object",
      additionalProperties: false,
      required: ["estimatedLevel", "confidence", "criteria", "note"],
      properties: {
        estimatedLevel: {
          type: "string",
          enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"],
        },
        confidence: { type: "string", enum: ["low", "moderate", "high"] },
        criteria: {
          type: "object",
          additionalProperties: false,
          required: ["taskFulfilment", "organization", "grammar", "lexis"],
          properties: {
            taskFulfilment: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            organization: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            grammar: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            lexis: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
          },
        },
        note: { type: "string" },
      },
    },
    writing: {
      type: "object",
      additionalProperties: false,
      required: ["estimatedLevel", "confidence", "criteria", "note"],
      properties: {
        estimatedLevel: {
          type: "string",
          enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"],
        },
        confidence: { type: "string", enum: ["low", "moderate", "high"] },
        criteria: {
          type: "object",
          additionalProperties: false,
          required: ["taskFulfilment", "organization", "grammar", "lexis"],
          properties: {
            taskFulfilment: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            organization: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            grammar: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
            lexis: { type: "string", enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"] },
          },
        },
        note: { type: "string" },
      },
    },
    productionEstimate: {
      type: "string",
      enum: ["Insufficient evidence", "Below A2", "A2", "B1", "B2", "Strong B2 / Advanced-ready", "C1"],
    },
    confidence: { type: "string", enum: ["low", "moderate", "high"] },
    courseRecommendation: {
      type: "string",
      enum: [
        "A2 / Elementary Foundation Course",
        "B1 Level Preparation Course",
        "B2 Exam Masterclass Course",
        "B2-to-C1 bridge / C1 preparation route",
        "OTE Advanced diagnostic recommended",
        "C1 Academic Track / Premium Diagnostic",
      ],
    },
    advancedRecommended: { type: "boolean" },
    strength: { type: "string" },
    priority: { type: "string" },
    candidateMessage: { type: "string" },
    writingCorrections: {
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

const OTE_ADVANCED_ACADEMIC_STYLE_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "overall", "items", "teacherComment"],
  properties: {
    taskType: { type: "string", enum: ["ote_advanced_academic_style_rewrite"] },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "styleControl", "mainAdvice"],
      properties: {
        summary: { type: "string" },
        styleControl: {
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
          "academicStyle",
          "language",
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
          academicStyle: { type: "string" },
          language: { type: "string" },
          suggestedRewrite: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    teacherComment: { type: "string" },
  },
};

const OTE_ADVANCED_INTRO_CONCLUSION_FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall",
    "issueFraming",
    "argumentControl",
    "finalJudgement",
    "consistency",
    "register",
    "languageCorrections",
    "teacherComment",
  ],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "verdict", "mainStrength", "mainPriority"],
      properties: {
        summary: { type: "string" },
        verdict: {
          type: "string",
          enum: ["strong", "mostly_effective", "developing", "incomplete"],
        },
        mainStrength: { type: "string" },
        mainPriority: { type: "string" },
      },
    },
    issueFraming: { $ref: "#/$defs/criterion" },
    argumentControl: { $ref: "#/$defs/criterion" },
    finalJudgement: { $ref: "#/$defs/criterion" },
    consistency: { $ref: "#/$defs/criterion" },
    register: { $ref: "#/$defs/criterion" },
    languageCorrections: {
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
    teacherComment: { type: "string" },
  },
  $defs: {
    criterion: {
      type: "object",
      additionalProperties: false,
      required: ["status", "feedback"],
      properties: {
        status: {
          type: "string",
          enum: ["strong", "mostly_effective", "needs_work", "missing"],
        },
        feedback: { type: "string" },
      },
    },
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

function normalizeSpeakingPart3Task(data = {}) {
  const task = data?.task || {};
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.slice(0, 3).map((item, index) => ({
    id: cleanString(item?.id || `q${index + 1}`, 120),
    questionNumber: index + 1,
    questionType:
      index === 0 ? "photo_comparison" : index === 1 ? "comparative_reasoning" : "extended_opinion",
    question: cleanString(item?.question || item?.text || "", 500),
  }));

  return {
    taskId: cleanString(task?.id || data?.taskId || "", 120),
    title: cleanString(task?.title || "", 200),
    photoA: {
      alt: cleanString(task?.photoA?.alt || "", 1200),
    },
    photoB: {
      alt: cleanString(task?.photoB?.alt || "", 1200),
    },
    questions,
  };
}

function normalizeSpeakingPart4Task(data = {}) {
  const task = data?.task || {};
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.slice(0, 3).map((item, index) => ({
    id: cleanString(item?.id || `q${index + 1}`, 120),
    questionNumber: index + 1,
    question: cleanString(item?.question || item?.text || "", 500),
  }));

  return {
    taskId: cleanString(task?.id || data?.taskId || "", 120),
    title: cleanString(task?.title || "", 200),
    imageAltText: cleanString(task?.alt || task?.imageAltText || "", 1200),
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

function normalizeOteSpeakingPayload(data = {}) {
  const rawRecordings = Array.isArray(data?.recordings) ? data.recordings : [];
  const partId = cleanString(data?.partId || data?.part || "mock", 40);
  const mockId = cleanString(data?.mockId || "", 120);
  const task = data?.task && typeof data.task === "object" ? data.task : {};
  const recordings = rawRecordings.slice(0, 18).map((item, index) => ({
    id: cleanString(item?.id || item?.questionId || item?.taskId || item?.stepId || `r${index + 1}`, 120),
    partId: cleanString(item?.partId || partId, 40),
    label: cleanString(item?.label || item?.title || `Response ${index + 1}`, 160),
    prompt: cleanString(item?.prompt || "", 1800),
    durationSeconds: Number(item?.durationSeconds || 0),
    base64: cleanString(item?.base64 || "", 12_000_000),
    mime: cleanString(item?.mime || "audio/webm", 80) || "audio/webm",
    name: cleanString(item?.name || `ote-speaking-${index + 1}.webm`, 160),
  }));

  return {
    partId,
    mockId,
    mockTitle: cleanString(data?.mockTitle || "", 180),
    task: {
      id: cleanString(task?.id || data?.taskId || mockId || partId, 120),
      title: cleanString(task?.title || data?.taskTitle || data?.mockTitle || "", 220),
      topic: cleanString(task?.topic || data?.topic || "", 160),
      instructions: Array.isArray(task?.instructions)
        ? task.instructions.slice(0, 8).map((item) => cleanString(item, 500)).filter(Boolean)
        : [],
      bullets: Array.isArray(task?.bullets)
        ? task.bullets.slice(0, 8).map((item) => cleanString(item, 500)).filter(Boolean)
        : [],
      lead: cleanString(task?.lead || task?.prompt || "", 2200),
      audience: cleanString(task?.audience || "", 160),
      mode: cleanString(task?.mode || task?.type || "", 80),
      friendMessage: cleanString(task?.friendMessage || task?.incomingAudioScript || "", 2000),
      images: Array.isArray(task?.images)
        ? task.images.slice(0, 8).map((image) => ({
            id: cleanString(image?.id || "", 80),
            label: cleanString(image?.label || "", 180),
            description: cleanString(image?.description || image?.alt || "", 500),
          })).filter((image) => image.label || image.description)
        : [],
      parts: Array.isArray(task?.parts) ? task.parts : [],
    },
    recordings,
  };
}

function getOteQuestionType(recording = {}, index = 0) {
  const partId = recording.partId || "";
  const text = normalizeFeedbackText(`${recording.id} ${recording.label}`);
  if (partId === "part-1" || text.includes("part 1")) return "interview";
  if (partId === "part-3") return text.includes("summary") ? "summary" : "talk";
  if (partId === "part-4") return text.includes("debate") ? "debate" : "follow_up";
  if (partId === "part-5" || text.includes("follow")) return "follow_up";
  if (partId === "part-2" || text.includes("message")) {
    if (text.includes("diplomatic")) return "diplomatic_voicemail";
    return text.includes("message 1") || text.includes("formal") || text.includes("leave") || index === 0
      ? "formal_voicemail"
      : "informal_voicemail";
  }
  return "interview";
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

function buildAptisSpeakingPart3Prompt(task, items) {
  return [
    "You are an English exam speaking feedback assistant for Aptis Speaking Part 3.",
    "",
    "The student answered three 45-second questions based on two photographs. Q1 usually asks them to describe what they can see in both photographs. Q2 asks them to compare some aspect of the situations, people, places, activities, advantages, disadvantages, feelings, difficulty, importance, preference, or suitability. Q3 is usually a broader opinion, explanation, comparison, or speculation question related to the topic. This is AI-estimated Aptis-style feedback, not official marking.",
    "",
    "Important limitation: you are assessing transcripts. Do not give pronunciation feedback or include pronunciation as a category. Only mention transcript clarity if a transcript is incomplete, unclear, or impossible to interpret. Do not invent accent, intonation, word-stress, phoneme, or sound-level problems.",
    "",
    "Part 3 priorities:",
    "- Q1 photo description/comparison: reward clear description of both photographs. The student should identify visible people, places, actions, objects, and the general situations in both images. Strong answers should also make at least one clear comparison or contrast between the photos.",
    "- In Q1, do not require every possible visible detail. Two to four relevant observations about each image can be enough if the answer is clear, balanced, and connected.",
    "- Q1 can include both description and speculation. Reward grounded phrases such as it looks like, it seems as if, they might be, they are probably, perhaps, I imagine, and it appears to be, especially when used to compare the two images.",
    "- Do not criticise speculation simply because it goes beyond literal description. Only flag it if it contradicts the image data, becomes implausible, or replaces almost all visible description with unsupported storytelling.",
    "- Q2 should answer the exact comparative question. Reward answers that compare both sides and give reasons. Do not treat Q2 as just more photo description.",
    "- Q3 should usually give a broader opinion, explanation, prediction, or speculation related to the topic. Reward developed reasoning: reasons, examples, consequences, personal experience, comparison, advantages/disadvantages, and cautious speculation.",
    "- Across the three answers, reward clear comparison language: both, whereas, while, on the other hand, compared with, in contrast, unlike, similarly, the main difference is, and one similarity is.",
    "- Task fulfilment and topic relevance matter more than showing advanced language for its own sake.",
    "- Grammar priorities: present continuous for visible actions, there is/there are, present simple, past simple where relevant, comparatives and superlatives, contrast clauses, modals for speculation, basic conditionals, connectors, word order, articles, prepositions, and subject-verb agreement.",
    "- Vocabulary priorities: concrete topic vocabulary, natural collocations, accurate adjectives for comparison, and specific details.",
    "- Cohesion: reward connected sentences and clear sequencing. A list of isolated observations is weaker than a short organised comparison.",
    "- Fluency: infer cautiously from transcript only. You may mention very short answers, repeated restarts, many transcribed fillers, unfinished sentences, or fragmented language, but do not overstate fluency from text.",
    "- Language errors: include up to three clear, useful fixes per answer. Use exact student words when possible. If there are no clear learner-language errors, return an empty languageErrors array for that answer.",
    "- Do not put preference-only rewrites in languageErrors. If a phrase is correct but could be shorter, simpler, more focused, more comparative, or more exam-like, mention it in teacherNote, task/content feedback, or priorities instead.",
    "- Do not create a languageError where original and correction are the same or nearly the same.",
    "- Do not label repetition, self-correction, filler, or over-explaining as word_order or grammar unless there is a concrete grammar/word-order error.",
    "- Do not correct correct grammar simply because an alternative tense, linker, or simpler phrasing is also possible.",
    "- Treat ordinary spoken informality and odd duplicated words cautiously; they may be normal speech or transcription artefacts.",
    "- If the task data includes descriptions of the two photos, use those descriptions to judge relevance. Do not invent extra image details that are not in the task data.",
    "",
    "Question-specific guidance:",
    "- Q1: Check whether the student describes both photographs and makes at least some comparison.",
    "- Q2: Check whether the student compares the aspect asked about, chooses a side or explains both sides, and gives reasons.",
    "- Q3: Check whether the student gives a clear opinion/speculation/explanation beyond the photos.",
    "",
    "Calibration:",
    "- Do not hard-cap the estimated level because this is a single Part 3 task. Limited evidence should lower confidence, not force B1/B2.",
    "- Use B1 range only for genuinely B1-like performance: mostly clear but limited range, repetitive structures, noticeable learner errors, thin development, weak comparison, partial task fulfilment, or answers that rely heavily on simple description.",
    "- Use B2 range for clear, relevant, reasonably developed answers with natural connected speech, good everyday vocabulary, mostly controlled grammar, and some successful comparison.",
    "- Use C1 range for highly natural, flexible, idiomatic answers with strong control, specific detail, clear comparison, good reasoning, and only occasional slips or transcript artefacts.",
    "- Use C1+ range as the minimum when all three answers are clear and relevant, reasonably developed, and show advanced spoken control.",
    "- Be generous when the response is clearly communicative and natural: when choosing between adjacent levels, choose the higher label with lower confidence unless there is concrete evidence for the lower label.",
    "- However, weak or missing comparison is a meaningful Part 3 task issue.",
    "",
    "Improved answer rules:",
    "- Keep the student's original idea where possible.",
    "- For Q1, model a natural description of both photos grounded in the image data supplied. Include at least one similarity or contrast if appropriate.",
    "- For Q2, answer the exact comparative question directly and give reasons.",
    "- For Q3, answer the exact broader opinion/speculation question directly and develop the point with reasons, examples, or consequences.",
    "- Use natural spoken English suitable for the student's observed level. Do not simplify strong answers into lower-level model answers.",
    "- Aim for a concise spoken answer, usually around 35-85 words for each 45-second question.",
    "- If the student's answer is already excellent, keep improvements minimal and say so.",
    "",
    "Feedback style: short, encouraging, practical, and specific to the question. Avoid long grammar lectures, harsh wording, official score claims, and pronunciation feedback.",
    "Use grammar.examples and vocabulary.examples only when they add something not already covered in languageErrors; otherwise return empty arrays.",
    "Set overall.transcriptCaveat to a short note that feedback is transcript-based and audio-level features are not assessed.",
    "Return only valid JSON using the required schema.",
    "",
    "Photo/task data:",
    JSON.stringify(task, null, 2),
    "",
    "Transcribed answers:",
    JSON.stringify(items, null, 2),
  ].join("\n");
}

function buildAptisSpeakingPart4Prompt(task, item) {
  return [
    "You are an English exam speaking feedback assistant for Aptis Speaking Part 4.",
    "",
    "The student gave one longer response of up to two minutes, covering three questions on a more abstract topic. The task includes a picture, but the student should not mainly describe the picture. The picture is a prompt for the topic, not the main focus of the answer. This is AI-estimated Aptis-style feedback, not official marking.",
    "",
    "Important limitation: you are assessing a transcript. Do not give pronunciation feedback or include pronunciation as a category. Only mention transcript clarity if the transcript is incomplete, unclear, or impossible to interpret. Do not invent accent, intonation, word-stress, phoneme, sound-level, pacing, or pronunciation problems.",
    "",
    "Part 4 task format:",
    "- The student sees a picture and three questions on an abstract topic.",
    "- The student has one minute to prepare and gives one continuous response of up to two minutes.",
    "- The response should answer all three questions, not treat them as three completely separate mini-answers.",
    "- The first one or two questions are often more personal or experiential. The final question is usually broader, more abstract, or opinion-based.",
    "",
    "Part 4 priorities:",
    "- The most important task issue is whether the student answers all three questions clearly and relevantly.",
    "- Reward answers that are well structured, easy to follow, and sustained across the full response.",
    "- Strong answers usually move from personal experience to broader opinion or reflection.",
    "- The student should not spend much time describing the photo. A very brief reference to the picture is acceptable if it introduces the topic, but extended photo description should be flagged as a task-focus problem.",
    "- Do not punish the student for not describing visible details in the picture.",
    "- Reward clear signposting between questions or ideas, such as first of all, speaking personally, as for the second question, when it comes to, more generally, overall, and to sum up.",
    "- Reward development: reasons, examples, consequences, contrasts, personal experience, generalisation, cautious qualification, and abstraction beyond the immediate personal example.",
    "- Flag answers that are very short, stop after only one or two questions, go off-topic, repeat the same idea without development, or sound like a memorised script.",
    "- If the student invents a realistic example, do not criticise this. Invented but plausible examples are acceptable if they help answer the question.",
    "",
    "Question coverage:",
    "- Check whether question 1, question 2, and question 3 are each answered clearly.",
    "- If one question is missing or only touched on very briefly, mention this as a key task issue.",
    "- If all three questions are answered but the response is unbalanced, explain which part needed more development.",
    "- If the response answers the topic generally but does not clearly cover the three specific questions, treat this as partial task fulfilment.",
    "- If the student only describes the picture and does not answer the questions, treat this as a serious task fulfilment problem.",
    "",
    "Language priorities:",
    "- Grammar priorities: present simple for general opinions, past simple and present perfect for experience, comparatives, modals, conditionals, relative clauses, linking clauses, noun phrases, articles, prepositions, word order, subject-verb agreement, and accurate tense control when moving between personal experience and general opinion.",
    "- Vocabulary priorities: topic-specific vocabulary, natural collocations, precise adjectives, abstract nouns, opinion phrases, and language for cause, consequence, contrast, and generalisation.",
    "- Cohesion priorities: clear linking between ideas, reference words, sequencing, contrast, addition, cause/reason, result, and summary language.",
    "- Fluency: infer cautiously from transcript only. You may mention very short answers, repeated restarts, many transcribed fillers, unfinished sentences, circular repetition, or fragmented language, but do not overstate fluency from text.",
    "- Normal spoken fillers, discourse markers, self-repairs, and informal phrases are acceptable.",
    "",
    "Language errors:",
    "- Include up to five clear, useful language fixes for the whole response.",
    "- Use exact student words where possible.",
    "- Prioritise errors that affect clarity, accuracy, naturalness, or repeated patterns.",
    "- If there are no clear learner-language errors, return an empty languageErrors array.",
    "- Do not put preference-only rewrites in languageErrors, create a languageError where original and correction are nearly the same, or correct correct grammar simply because another wording is possible.",
    "",
    "Calibration:",
    "- Part 4 targets a higher level than Parts 2 and 3, so weak development, missing questions, or poor organisation matter more here.",
    "- Do not hard-cap the estimated level because this is a single Part 4 task. Limited evidence should lower confidence, not force a low level.",
    "- Use B1 range when the answer is mostly understandable but simple, thin, repetitive, only partly developed, heavily dependent on basic structures, or answers only one or two questions clearly.",
    "- Use B2 range for a clear, relevant response that answers at least two questions well, uses some organisation, gives reasons/examples, and shows reasonably controlled grammar and vocabulary.",
    "- Use high B2 / B2.2 when all three questions are addressed, the response is organised and sustained, and the language is clear and mostly controlled, but lacks the flexibility, precision, or complexity of C1.",
    "- Use C1 range when the response addresses all three questions, is well structured, develops ideas naturally, uses some complex grammar accurately, has sufficient vocabulary for abstract discussion, and uses cohesive devices effectively.",
    "- Use C1+ range when the response is clearly sustained, flexible, well organised, specific, nuanced, and natural, with only minor local slips or transcript artefacts.",
    "- Do not give C1/C1+ if the student misses one of the three questions, mostly describes the picture, gives only general unsupported points, or cannot sustain the response.",
    "",
    "Improved answer rules:",
    "- Produce one improved two-minute-style answer, not three separate answers.",
    "- Keep the student's original ideas where possible.",
    "- Answer all three questions clearly and do not mainly describe the photo.",
    "- Use natural spoken English suitable for the student's observed level.",
    "- Aim for a concise but developed spoken response, usually around 140-220 words for the full two-minute answer.",
    "- If the student's answer is already excellent, keep improvements minimal and say so.",
    "",
    "Feedback style: short, encouraging, practical, and specific to the task. Avoid long grammar lectures, harsh wording, official score claims, and pronunciation feedback.",
    "Make the main priorities easy for a student to act on in their next attempt.",
    "Use grammar.examples and vocabulary.examples only when they add something not already covered in languageErrors; otherwise return empty arrays.",
    "Set overall.transcriptCaveat to a short note that feedback is transcript-based and audio-level features are not assessed.",
    "Return only valid JSON using the required schema.",
    "",
    "Photo/task data:",
    JSON.stringify(task, null, 2),
    "",
    "Transcribed Part 4 response:",
    JSON.stringify(item, null, 2),
  ].join("\n");
}

function isOteAdvancedSpeakingPayload(payload = {}) {
  const mockId = cleanString(payload.mockId || payload.task?.id || "", 120).toLowerCase();
  const parts = Array.isArray(payload.task?.parts) ? payload.task.parts : [];
  return (
    mockId.includes("advanced") ||
    parts.some((part) => part?.title === "Summary" && part?.task?.visualType === "summary") ||
    parts.some((part) => part?.title === "Debate" && part?.task?.visualType === "debate") ||
    parts.some((part) => part?.id === "part-5" && Array.isArray(part?.questions) && part.questions.length === 4)
  );
}

function buildOteAdvancedSpeakingPrompt(payload, items) {
  const isMock = payload.partId === "mock" || Boolean(payload.mockId);
  return [
    "You are an Oxford Test of English Advanced speaking feedback assistant.",
    "",
    "Use the Oxford Test of English Advanced speaking specifications as the exam frame. The Advanced Speaking module is designed for B2-C1 evidence, but the marking criteria use an eight-point 0-7 scale with B1, B2, C1 and C2 descriptors. Public results are reported only at B2 and C1, and you must not claim to give an official score.",
    "",
    "Advanced Speaking structure:",
    "- Script 1 is Part 1 Interview, Part 2 Voice message, and Part 3 Summary. Treat these together when forming the overall Script 1 impression.",
    "- Script 2 is Part 4 Debate and Part 5 Follow-up questions. Treat these together when forming the overall Script 2 impression.",
    "- The same four analytic criteria apply across both scripts: Task fulfilment, Pronunciation and fluency, Grammar, and Lexis.",
    "- Task fulfilment covers task requirements, impact on the listener, register, and Part 3 synthesis.",
    "- Pronunciation and fluency covers stress/rhythm/intonation, flow, coherence and cohesion. Because this system assesses transcripts, do not give detailed audio-level pronunciation feedback; comment only on transcript-visible fluency, organization, and clarity.",
    "- Grammar covers range, control and accuracy, including control of simple and complex structures.",
    "- Lexis covers range, accuracy, collocations, idioms, colloquialisms, appropriacy, and evidence of searching or avoidance.",
    "",
    "Transcript limitation:",
    "- Feedback is based on transcripts. Do not invent accent, intonation, phoneme, word-stress, pace, or sound-quality comments.",
    "- For the Pronunciation and fluency criterion, focus on flow visible in the transcript: sustained turns, hesitation markers, unfinished clauses, repairs, fragmented language, repetition, and organization.",
    "- Treat normal spoken fillers, restarts, discourse markers, self-corrections, and likely transcription artefacts leniently.",
    "",
    "Part-specific Advanced guidance:",
    "- Part 1 Interview: Questions 1 and 2 are biodata and not assessed. Questions 3-6 are 30-second personal/everyday questions designed to elicit opinions, attitudes, descriptions, comparison, narration, hypothesis, hopes, ambitions, and speculation. Reward direct answers with reasons, examples, contrasts, or personal detail. Do not over-penalize short but complete answers, but note missed development if time is clearly underused.",
    "- Part 2 Voice message: One 40-second message after 10 seconds' preparation. The student must respond diplomatically to a difficult or sensitive academic/professional situation. Reward coverage of all three bullet points, appropriate relationship/register, polite or tactful framing, acknowledgement of the listener's situation, clear request/suggestion, and natural spoken organization. The expected response is roughly 80-90 words, but do not grade mechanically by word count.",
    "- Part 3 Summary: One 50-second listening-into-speaking summary after 40 seconds' preparation. The student should combine information from two expert monologues, distinguish the same two main points from supporting details, synthesize and paraphrase the main points, and avoid over-copying input wording. Use any teacherKey or task-specific marking guide in the Part 3 task data as the content guide. Reward concise synthesis of both main points; note if only supporting details are reported, one main point is missing, sources are not combined, or the response becomes opinion/commentary rather than summary. Expected response is roughly 90-100 words.",
    "- Part 4 Debate: One two-minute argument after 45 seconds' preparation. The student should take a clear position for or against the statement, use two or three mind-map ideas, provide support/examples for the chosen ideas, structure and sustain an argument, emphasize key points, and give a conclusion. If fewer than two ideas are used, Task fulfilment should be capped at B2.2. Strong answers are organized, signposted, persuasive, and around 250-300 words, but judge quality before exact length.",
    "- Part 5 Follow-up questions: Four 40-second questions on or moving away from the debate topic. Reward direct answers, opinions, justification, examples, comparison/contrast, speculation, critical remarks, diplomatic disagreement where relevant, and logically connected ideas. Question 1 is closest to the debate theme; Questions 2-4 become broader to elicit more complex language.",
    "",
    "Advanced calibration:",
    "- B1 evidence: task requirements only partly fulfilled, listener only partially informed, limited register awareness, short fragmented contributions, frequent pausing/repair, simple grammatical routines, limited lexis, or only some relevant Part 3 content.",
    "- B2 evidence: task requirements generally fulfilled, listener adequately informed, register generally appropriate though lapses occur, ideas relevant but not always sufficiently expanded, coherent stretches of speech, adequate grammar/lexis with noticeable errors, and Part 3 paraphrases the two main points.",
    "- C1 evidence: task requirements mostly fulfilled, listener fully informed, register appropriate with rare lapses, smooth flow, organized discourse, high grammatical control of simple and complex structures, broad relevant lexis, and Part 3 synthesizes the two main points with appropriate supporting detail.",
    "- C2-like evidence: task requirements completely fulfilled, effortless and well-developed communication, effortlessly appropriate register, highly organized discourse, rare errors only in complex/infrequent language, sophisticated lexis, and Part 3 concisely synthesizes both main points with effective organization of any supporting details.",
    "- C1.2 / plus-level feedback should be reserved for performances that meet C1 comfortably, not merely minimally.",
    "- For Part 5-only feedback, use C1+ range or C2-like / above OTE task range when the answers are consistently native-like/professionally fluent for this limited task: direct, well developed, idiomatic, flexible, nuanced, and controlled across the four questions.",
    "- Do not hold a native-like Part 5 performance at plain C1 just because the evidence is limited to Part 5; reflect the limited scope in confidence/note instead.",
    "- Limited evidence should lower confidence, not automatically force a low level.",
    "- Do not lower a strong advanced performance because spontaneous speech contains ordinary fillers or local slips.",
    "",
    "Caps and relevance:",
    "- Up to one irrelevant/non-response among assessed Part 1 questions or Part 5 questions may receive no penalty; two or three should reduce all four criteria by one mark for that script; all of Part 1, Part 2, Part 3, Part 4, or Part 5 irrelevant/non-response should be treated as a serious failure for that script.",
    "- For Script 2, using fewer than two ideas in Part 4 caps Task fulfilment at B2.2.",
    "- Mention caps as coaching guidance, not as an official score decision.",
    "",
    "Feedback requirements:",
    "- Keep feedback practical, encouraging, and student-facing.",
    "- Make the two-script structure visible in the overall feedback where useful: Script 1 strengths/risks and Script 2 strengths/risks.",
    "- For each response, identify task fulfilment, development/content, grammar, vocabulary/lexis, cohesion/organization where relevant, and transcript-based fluency.",
    "- For Part 3, explicitly compare the response with the teacher key if teacherKey is provided.",
    "- For Part 4, explicitly check position, number of mind-map ideas used, support for ideas, and conclusion.",
    "- Include useful languageErrors only for clear learner-language issues supported by the transcript. Do not invent errors. Up to three per short response, up to five only for longer Part 3/Part 4 responses.",
    "- Do not put register preferences in languageErrors unless the style is genuinely inappropriate for the task audience.",
    "- Do not correct acceptable spoken phrasing just because a tidier written alternative exists.",
    "- Do not treat hesitation fragments, filler-adjacent wording, false starts, or likely transcription artifacts as grammar errors. For example, if a transcript appears to show an odd article before a plural noun but the surrounding speech is native-like, mention transcript uncertainty only if useful; do not present it as a definite correction.",
    "- Be very cautious with possible mistranscriptions. If a phrase is plausible as a transcription artefact, mention uncertainty in teacherNote rather than presenting it as a definite language error.",
    "- Improved answers should preserve the student's idea, specificity, tone, and level. Never simplify a strong advanced answer into a generic B1/B2 model.",
    "- For strong C1/C1+/C2-like responses, improvedAnswer must be a light same-level polish or say the original content is already strong and only needs minor local edits. If languageErrors are included, the improvedAnswer must apply those exact corrections and must not repeat the flagged wording.",
    "- Match the expected time limit: brief for Part 1, around 70-100 words for Part 2/3, around 220-300 words for Part 4, and around 50-85 words for each Part 5 answer when giving model/improved answers.",
    "",
    `Feedback scope: ${isMock ? "full OTE Advanced speaking mock" : payload.partId}.`,
    "Set overall.transcriptCaveat to: Feedback is based on transcripts, so audio-level pronunciation is not assessed reliably.",
    "Set estimatedLevel.note to mention this is AI-estimated OTE Advanced-style feedback, not an official score.",
    "Return only valid JSON using the required schema.",
    "",
    "Task data:",
    JSON.stringify(payload.task, null, 2),
    "",
    "Transcribed responses:",
    JSON.stringify(items, null, 2),
  ].join("\n");
}

function buildOteSpeakingPrompt(payload, items) {
  if (isOteAdvancedSpeakingPayload(payload)) {
    return buildOteAdvancedSpeakingPrompt(payload, items);
  }
  const isMock = payload.partId === "mock" || Boolean(payload.mockId);
  return [
    "You are an Oxford Test of English speaking feedback assistant.",
    "",
    "Use the Oxford Test of English speaking task specifications as the exam frame. The module has Part 1 interview questions, Part 2 two voicemails, Part 3 a one-minute talk from visual/written prompts, and Part 4 six follow-up questions linked to the Part 3 theme. Speaking is marked analytically for Task fulfilment, Pronunciation and Fluency, Grammar, and Lexis on a 0-7 scale from below A2 to C1, but the public OTE result is reported only up to B2. You must not claim to give an official score.",
    "",
    "Important limitation: you are assessing transcripts. Do not give detailed pronunciation, accent, intonation, word-stress, or phoneme feedback. For the OTE criterion Pronunciation and Fluency, comment mainly on fluency evidence visible in the transcript, and add that audio-level pronunciation is not assessed reliably here. Only mention transcript clarity if the transcript is incomplete or impossible to interpret.",
    "",
    "Calibration learned from Aptis feedback:",
    "- Do not grade harshly just because spoken transcripts are messy. Normal fillers, restarts, self-corrections, informal discourse markers, and transcript artefacts are compatible with strong spoken English.",
    "- Limited evidence should lower confidence, not automatically lower the level.",
    "- When evidence sits between adjacent levels, choose the higher level with lower confidence unless there is concrete evidence for the lower level.",
    "- Use B1 only when the performance is genuinely limited: thin development, frequent clear learner errors, repeated simple structures, partial task fulfilment, or poor relevance.",
    "- Use B2 for clear, relevant, reasonably developed learner responses with good control, natural everyday vocabulary, and only local errors.",
    "- Use C1 when the transcript shows flexible, idiomatic, nuanced, well controlled spoken English, even if the task itself is simple.",
    "- Use C1+ range when responses are consistently natural, spontaneous, developed, idiomatic, and controlled, with only minor local slips or likely transcript artefacts.",
    "- Use C2-like / above OTE task range when the answers sound essentially native-like or professionally fluent for this limited task type. Keep the caveat that Part 1 cannot prove the speaker's full ceiling.",
    "- If all OTE Part 1 scored answers are relevant, developed for the 20-second window, natural, and mostly error-free, the observed range should normally be at least C1. Do not assign B2 just because official OTE certificates report only up to B2.",
    "",
    "Part-specific task guidance:",
    "- Part 1 interview: answer each short spoken question directly. Short answers can be acceptable, but stronger practice answers add a reason, example, contrast, or personal detail. The first two questions may be simple identity questions; do not over-penalise them for being short.",
    "- Part 2 voicemail 1: the student leaves a voicemail to a neutral or formal audience such as a manager, shop, school, company, or service. Reward polite openings, clear identity/context, coverage of all bullet points, and neutral/formal style. Do not demand a written-email level of formality.",
    "- Part 2 voicemail 2: the student replies to a friend's voicemail. Reward friendly, natural, informal spoken style, direct response to the incoming message, and coverage of all bullet points. Do not criticise contractions or conversational phrases when they fit a friend.",
    "- Part 3 talk: the student chooses two visuals or options and gives a one-minute talk for a class/workplace audience. Reward clear selection of two items, relevance to the scenario, simple organisation, explanation of benefits/reasons, and enough development for one minute. Do not require all visuals to be discussed.",
    "- Part 4 follow-up questions: the six questions are linked to the Part 3 topic. Reward direct answers, reasons/examples, opinions, comparisons, and gradually broader thinking. Each answer is separate and short; do not expect a two-minute monologue.",
    "",
    "Feedback requirements:",
    "- Keep feedback practical, encouraging, and student-facing.",
    "- For each response, identify task fulfilment, development/content, grammar, vocabulary/lexis, cohesion where relevant, and transcript-based fluency.",
    "- Include useful languageErrors only for clear learner-language issues supported by the transcript. Do not invent errors. Up to three per short response, up to five only for a longer talk.",
    "- Do not put register preferences in languageErrors unless the style is genuinely inappropriate for the audience.",
    "- Do not correct acceptable spoken phrasing just because a shorter or tidier written alternative exists. Examples of acceptable spoken phrasing include hedges like kind of, discourse markers like well/you know/I guess, relative that for people in informal speech, and ordinary repetition used for planning.",
    "- Do not put optional style polish in languageErrors. If the phrase is understandable and acceptable in spontaneous speech, do not list it as a fix. Mention it lightly in teacherNote only if useful.",
    "- Avoid corrections whose only justification is slightly smoother, more natural, more direct, too strong, or better collocation. These are coaching notes, not language errors.",
    "- Be very cautious with possible mistranscriptions. If a phrase is plausible as a transcription artefact, mention transcript uncertainty in teacherNote rather than presenting it as a definite language error.",
    "- Improved answers should preserve the student's idea, specificity, tone, and level. Never simplify a strong advanced answer into a generic B1/B2 model.",
    "- For strong C1/C1+/C2-like responses, improvedAnswer must not be shorter or simpler than the original unless the original is genuinely unclear. Either give a very light same-level polish with similar length and content density, or write: This is already a strong answer; keep the original content and only make minor local edits.",
    "- Preserve advanced vocabulary, hedging, nuance, examples, and personality in suggested answers. Do not replace specific content with generic exam-safe content.",
    "- Match the expected time limit: brief for Part 1, about 35-60 words for voicemails, about 100-150 words for the Part 3 talk, and about 35-70 words for Part 4 follow-ups.",
    "",
    `Feedback scope: ${isMock ? "full OTE speaking mock" : payload.partId}.`,
    "Set overall.transcriptCaveat to: Feedback is based on transcripts, so audio-level pronunciation is not assessed reliably.",
    "Set estimatedLevel.note to mention this is AI-estimated OTE-style feedback, not an official score.",
    "Return only valid JSON using the required schema.",
    "",
    "Task data:",
    JSON.stringify(payload.task, null, 2),
    "",
    "Transcribed responses:",
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

function postProcessAptisSpeakingPart2Feedback(feedback, items = [], partLabel = "Part 2") {
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
        `AI-estimated Aptis-style feedback, not an official score. The transcript shows advanced spoken control across all three ${partLabel} answers, so the observed range is at least C1+ for this task.`,
    };
    if (feedback.overall) {
      feedback.overall.summary =
        `A strong advanced ${partLabel} performance with natural speculation, specific examples, mature reasoning, and only minor local phrasing issues.`;
    }
  }
  return preventAdvancedAnswerFlattening(feedback, items);
}

function isOteStylePolishOnly(item = {}) {
  const explanation = normalizeFeedbackText(item.explanation || item.feedback || item.comment);
  const category = normalizeFeedbackText(item.category || "");
  if (!explanation) return false;
  const polishSignals = [
    "slightly smoother",
    "slightly more natural",
    "more natural phrasing",
    "more natural here",
    "not the most natural",
    "not fully natural",
    "understandable but",
    "acceptable spoken phrasing",
    "a simpler phrasing",
    "slightly awkward",
    "too strong for the meaning",
  ];
  const hardErrorSignals = [
    "subject-verb agreement",
    "plural agreement",
    "countable noun",
    "missing",
    "incorrect",
    "wrong",
    "unclear",
    "changes the meaning",
  ];
  return (
    ["vocabulary", "word_order"].includes(category) &&
    polishSignals.some((signal) => explanation.includes(signal)) &&
    !hardErrorSignals.some((signal) => explanation.includes(signal))
  );
}

function isLikelySpokenTranscriptArtifact(item = {}) {
  const category = normalizeFeedbackText(item.category || "");
  const original = normalizeFeedbackText(item.original || "");
  const correction = normalizeFeedbackText(item.correction || "");
  const explanation = normalizeFeedbackText(item.explanation || item.feedback || item.comment || "");
  if (!original || !correction) return false;
  if (category === "transcript_unclear") return true;
  if (/\b(transcript|transcription|misheard|hesitation|false start|self-correction|slip|spoken)\b/.test(explanation)) {
    return true;
  }

  const withoutArticles = original.replace(/\b(a|an|the)\s+/g, "").trim();
  if (withoutArticles === correction && /\b(a|an|the)\b/.test(original)) return true;
  return false;
}

function getPart5Strength(feedback, items = []) {
  if (!feedback || !Array.isArray(feedback.answers) || feedback.answers.length !== 4) return "none";
  if (!items.every((item) => item?.questionType === "follow_up" || item?.partId === "part-5")) return "none";

  const totalWords = items.reduce((sum, item) => sum + Number(item.wordCount || 0), 0);
  const allSubstantial = items.every((item) => Number(item.wordCount || 0) >= 30);
  const answers = feedback.answers;
  const allTaskGood = answers.every((answer) => getCriterionStatus(answer.taskFulfilment) === "good");
  const developedCount = answers.filter((answer) => getCriterionStatus(answer.answerDevelopment) === "well_developed").length;
  const allGrammarControlled = answers.every((answer) =>
    ["good", "minor_issues"].includes(getCriterionStatus(answer.grammar))
  );
  const strongVocabCount = answers.filter((answer) => getCriterionStatus(answer.vocabulary) === "good").length;
  const fluentCount = answers.filter((answer) => getCriterionStatus(answer.fluency) === "good").length;
  const meaningfulErrors = answers.reduce((sum, answer) => {
    const errors = Array.isArray(answer.languageErrors) ? answer.languageErrors : [];
    return sum + errors.filter((error) => !isLikelySpokenTranscriptArtifact(error)).length;
  }, 0);

  if (
    totalWords >= 170 &&
    allSubstantial &&
    allTaskGood &&
    developedCount >= 3 &&
    allGrammarControlled &&
    strongVocabCount >= 3 &&
    fluentCount >= 3 &&
    meaningfulErrors <= 1
  ) {
    return "native_like";
  }

  if (
    totalWords >= 140 &&
    allSubstantial &&
    allTaskGood &&
    developedCount >= 2 &&
    allGrammarControlled &&
    strongVocabCount >= 2 &&
    fluentCount >= 2 &&
    meaningfulErrors <= 2
  ) {
    return "strong_c1_plus";
  }

  return "none";
}

function postProcessOteSpeakingFeedback(feedback, items = []) {
  feedback = postProcessAptisSpeakingPart2Feedback(feedback, items, "OTE Speaking");
  if (feedback?.estimatedLevel?.note) {
    feedback.estimatedLevel.note = feedback.estimatedLevel.note.replace(/Aptis-style/gi, "OTE-style");
  }
  if (!feedback || !Array.isArray(feedback.answers)) return feedback;

  const part5Strength = getPart5Strength(feedback, items);
  const nativeLikePart5 = part5Strength === "native_like";
  if (["native_like", "strong_c1_plus"].includes(part5Strength) && feedback.estimatedLevel?.label === "C1 range") {
    feedback.estimatedLevel = {
      ...feedback.estimatedLevel,
      label: nativeLikePart5 ? "C2-like / above OTE task range" : "C1+ range",
      confidence: feedback.estimatedLevel?.confidence === "low" ? "medium" : feedback.estimatedLevel?.confidence || "medium",
      note: nativeLikePart5
        ? "AI-estimated OTE Advanced-style feedback, not an official score. These Part 5 answers show native-like/professionally fluent control for this limited follow-up task; OTE public reporting is capped at C1, so treat this as above-range task evidence rather than an official C2 result."
        : "AI-estimated OTE Advanced-style feedback, not an official score. These Part 5 answers show comfortable C1 control for this limited follow-up task; OTE public reporting is capped at C1, so C1+ means strong task evidence rather than an official higher result.",
    };
    if (feedback.overall) {
      feedback.overall.summary = nativeLikePart5
        ? "The follow-up answers are consistently fluent, flexible, well developed, and idiomatic, with strong control of complex spoken language across the four questions."
        : "The follow-up answers are fluent, flexible, developed, and controlled across the set, showing comfortable C1-level performance for this task type.";
    }
  }

  const advanced = ["C1 range", "C1+ range", "C2-like / above OTE task range"].includes(
    feedback.estimatedLevel?.label || ""
  );

  feedback.answers = feedback.answers.map((answer, index) => {
    const next = { ...answer };
    if (Array.isArray(next.languageErrors)) {
      next.languageErrors = next.languageErrors.filter((item) =>
        !isOteStylePolishOnly(item) && !(nativeLikePart5 && isLikelySpokenTranscriptArtifact(item))
      );
    }
    if (nativeLikePart5 && next.grammar && next.languageErrors?.length === 0) {
      next.grammar = {
        ...next.grammar,
        status: "good",
        feedback: "Grammar is controlled and natural in spontaneous spoken English; no clear learner-language correction is needed here.",
        examples: [],
      };
    }
    if (advanced) {
      const transcript = cleanString(items[index]?.transcript || next.transcript || "", 3600);
      const improved = cleanString(next.improvedAnswer || "", 3600);
      const transcriptWords = countWords(transcript);
      const improvedWords = countWords(improved);
      if (transcriptWords >= 35 && improvedWords > 0 && improvedWords < transcriptWords * 0.85) {
        next.improvedAnswer = transcript;
        next.teacherNote = [
          next.teacherNote,
          "This is already a strong advanced answer; keep the original content and only make minor local edits.",
        ].filter(Boolean).join(" ");
      }
    }
    return next;
  });

  return feedback;
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
  if (taskType === "ote_advanced_part1_essay") {
    if (wordCount < 180) return "too_short";
    if (wordCount < 220) return "slightly_short_but_acceptable";
    if (wordCount <= 280) return "target_range";
    if (wordCount <= 300) return "acceptable_over_range";
    return "excessive";
  }
  if (taskType === "ote_advanced_part2_summary") {
    if (wordCount < 60) return "too_short";
    if (wordCount < 80) return "slightly_short_but_acceptable";
    if (wordCount <= 100) return "target_range";
    if (wordCount <= 105) return "acceptable_over_range";
    return "excessive";
  }
  if (wordCount < 80) return "too_short";
  if (wordCount < 100) return "slightly_short_but_acceptable";
  if (wordCount <= 160) return "target_range";
  if (wordCount <= 180) return "acceptable_over_range";
  return "excessive";
}

function describeOteWordCount(taskType, status, wordCount) {
  const label =
    taskType === "ote_part1_email"
      ? "Part 1 email"
      : taskType === "ote_advanced_part1_essay"
        ? "Part 1 essay"
        : taskType === "ote_advanced_part2_summary"
          ? "Part 2 summary"
          : "Part 2 task";
  const words = `${wordCount} word${wordCount === 1 ? "" : "s"}`;
  if (taskType === "ote_advanced_part1_essay") {
    if (wordCount >= 220 && wordCount <= 280) return `Part 1 essay: ${words}. In the target range.`;
    if (wordCount >= 161 && wordCount <= 219) return `Part 1 essay: ${words}. Under length; official criteria cap all criteria at B2.2.`;
    if (wordCount >= 91 && wordCount <= 160) return `Part 1 essay: ${words}. Clearly under length; official criteria cap all criteria at B2.1.`;
    if (wordCount >= 71 && wordCount <= 90) return `Part 1 essay: ${words}. Severely under length; official criteria cap all criteria at B1.2.`;
    if (wordCount <= 70) return `Part 1 essay: ${words}. Too short for the task; official criteria cap all criteria at B1.1.`;
    return `Part 1 essay: ${words}. Over the target range; mention this if it causes repetition, loss of focus, or exam-management risk.`;
  }

  if (taskType === "ote_advanced_part2_summary") {
    if (wordCount >= 80 && wordCount <= 100) return `Part 2 summary: ${words}. In the target range.`;
    if (wordCount >= 101 && wordCount <= 105) return `Part 2 summary: ${words}. Slightly over 100 words, but official criteria allow any mark up to 105 words.`;
    if (wordCount >= 106 && wordCount <= 120) return `Part 2 summary: ${words}. Over the limit; official criteria cap all criteria at B2.2.`;
    if (wordCount >= 121) return `Part 2 summary: ${words}. Far over the limit; official criteria cap all criteria at B1.2.`;
    return `${label}: ${words}. Under length; important main ideas are likely missing.`;
  }

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
  return points.every((point) => ["covered", "optional_not_used"].includes(point?.status));
}

function getOteEssayPointSearchTerms(point = "") {
  const normalized = String(point || "").trim().toLowerCase();
  if (!normalized) return [];
  const core = normalized.replace(/^(?:the\s+)?(?:impact|effect)\s+on\s+/, "").trim();
  return [...new Set([normalized, core].filter((term) => term.length >= 4))];
}

function textMentionsOteEssayPoint(text = "", point = "") {
  const haystack = String(text || "").toLowerCase();
  return getOteEssayPointSearchTerms(point).some((term) => haystack.includes(term));
}

function stripOptionalOteEssayPointCriticism(text = "", optionalPoints = []) {
  let cleaned = String(text || "");
  optionalPoints.forEach((point) => {
    getOteEssayPointSearchTerms(point).forEach((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      cleaned = cleaned
        .replace(
          new RegExp(`(?:,?\\s*(?:and|but)\\s+)?(?:the\\s+)?${escaped}(?:\\s+(?:point|idea))?\\s+(?:is|was)\\s+(?:missing|omitted|not\\s+(?:covered|included|developed))`, "gi"),
          ""
        )
        .replace(
          new RegExp(`(?:,?\\s*(?:and|but)\\s+)?(?:you\\s+)?(?:should|need\\s+to|must)?\\s*(?:include|cover|develop|add)\\s+(?:the\\s+)?${escaped}`, "gi"),
          ""
        );
    });
  });

  return cleaned
    .replace(/,\s*so\s+the\s+task\s+is\s+(?:only\s+)?partly\s+fulfilled/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ",")
    .replace(/\.\s*,/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeAdvancedEssayOptionalPoints(originalTask = {}, taskFeedback = {}) {
  if (originalTask.taskType !== "ote_advanced_part1_essay") return taskFeedback;
  const points = taskFeedback.taskFulfilment?.requiredPoints;
  if (!Array.isArray(points) || !points.length) return taskFeedback;

  const usedPoints = points.filter((point) => ["covered", "partly_covered"].includes(point?.status));
  if (usedPoints.length < 2) return taskFeedback;

  const optionalPoints = points
    .filter((point) => ["missing", "optional_not_used"].includes(point?.status))
    .map((point) => point?.point)
    .filter(Boolean);
  if (!optionalPoints.length) return taskFeedback;

  const coveredCount = usedPoints.filter((point) => point?.status === "covered").length;
  const taskFulfilment = taskFeedback.taskFulfilment || {};
  const cleanedFeedback = stripOptionalOteEssayPointCriticism(taskFulfilment.feedback, optionalPoints);
  const removedFalseCoverageCriticism = cleanedFeedback !== String(taskFulfilment.feedback || "").trim();
  const cleanedTeacherNote = stripOptionalOteEssayPointCriticism(taskFeedback.teacherNote, optionalPoints);
  const coverageMessage = "The response satisfies the content-choice requirement by using at least two of the listed ideas.";

  return {
    ...taskFeedback,
    taskFulfilment: {
      ...taskFulfilment,
      status:
        taskFulfilment.status === "partial" && coveredCount >= 2 && removedFalseCoverageCriticism
          ? "good"
          : taskFulfilment.status,
      feedback: cleanedFeedback
        ? `${coverageMessage} ${cleanedFeedback}`
        : coverageMessage,
      requiredPoints: points.map((point) =>
        ["missing", "optional_not_used"].includes(point?.status)
          ? {
              ...point,
              status: "optional_not_used",
              feedback: "Optional third idea; the task requires the student to use at least two listed ideas.",
            }
          : point
      ),
      contentSpecificity: taskFulfilment.contentSpecificity
        ? {
            ...taskFulfilment.contentSpecificity,
            feedback: stripOptionalOteEssayPointCriticism(
              taskFulfilment.contentSpecificity.feedback,
              optionalPoints
            ),
          }
        : taskFulfilment.contentSpecificity,
    },
    organization: taskFeedback.organization
      ? {
          ...taskFeedback.organization,
          feedback: stripOptionalOteEssayPointCriticism(taskFeedback.organization.feedback, optionalPoints),
        }
      : taskFeedback.organization,
    mistakes: (taskFeedback.mistakes || []).filter(
      (mistake) =>
        !(
          mistake?.category === "task" &&
          optionalPoints.some((point) =>
            textMentionsOteEssayPoint(
              [mistake.original, mistake.correction, mistake.explanation].join(" "),
              point
            )
          )
        )
    ),
    teacherNote:
      cleanedTeacherNote && !/^(?:next time|in (?:the )?future)\.?$/i.test(cleanedTeacherNote)
        ? cleanedTeacherNote
        : coverageMessage,
  };
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

  const explicitlyOptionalEdit =
    /\b(opening|meaning|structure|phrase|expression|wording|term)\b[^.]{0,80}\b(?:is|are)\s+(?:clear|correct|good|accurate|acceptable|natural)\b/.test(text) &&
    /\b(?:a little long|more direct|shorter|more focused|overpacked|tighten(?:ed)?|simpler|more natural(?:ly)?|streamline|concise|concision)\b/.test(text);

  return (
    explicitlyOptionalEdit ||
    (
      /\b(more natural|clearer|smoother|slightly awkward|more idiomatic|sounds better|prefer|could be more direct|can be tightened|slightly simpler)\b/.test(text) &&
      !/\b(error|incorrect|wrong|missing|unclear|confusing|changes the meaning|impede|grammar mistake)\b/.test(text)
    )
  );
}

function isLengthPriority(text = "") {
  return /\b(word count|word limit|length|too long|shorten|cut the essay|trim the introduction|target range|closer to the limit|closer to the word limit)\b/i.test(text);
}

function containsFalseOteTargetRangeLengthClaim(text = "") {
  return /\b(?:word count|word limit|word-limit|advanced essay cap|task limit|target length|too long|cut the essay|shorten the essay|trim the introduction|above the advanced|over the (?:task|word)|beyond the (?:advanced|word)|goes beyond)\b/i.test(String(text || ""));
}

function stripFalseOteTargetRangeLengthClaim(text = "") {
  const source = String(text || "").trim();
  if (!source) return "";

  const withoutTrailingClaim = source.replace(
    /,\s*(?:but|although)\s+(?:the\s+)?(?:essay(?:'s)?\s+)?(?:length|word count)\s+(?:is|was)[^.]*\.?$/i,
    "."
  );

  return withoutTrailingClaim
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !containsFalseOteTargetRangeLengthClaim(sentence))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isOteLengthMistake(mistake = {}) {
  return containsFalseOteTargetRangeLengthClaim(
    [mistake.category, mistake.original, mistake.correction, mistake.explanation].join(" ")
  );
}

function normalizeOteTargetRangeFeedback(originalTask = {}, taskFeedback = {}) {
  const wordCountStatus = originalTask.answer?.wordCountStatus || taskFeedback.wordCountStatus;
  if (!["target_range", "acceptable_over_range"].includes(wordCountStatus)) return taskFeedback;

  const taskFulfilment = taskFeedback.taskFulfilment || {};
  const originalTaskFeedback = String(taskFulfilment.feedback || "").trim();
  const cleanedTaskFeedback = stripFalseOteTargetRangeLengthClaim(originalTaskFeedback);
  const removedFalseLengthPenalty = cleanedTaskFeedback !== originalTaskFeedback;
  const contentStatus = taskFulfilment.contentSpecificity?.status;
  const coverageOtherwiseComplete =
    hasOnlyCoveredOtePoints(taskFeedback) &&
    !["too_generic", "off_task"].includes(contentStatus);
  const cleanedTeacherNote = stripFalseOteTargetRangeLengthClaim(taskFeedback.teacherNote);

  return {
    ...taskFeedback,
    taskFulfilment: {
      ...taskFulfilment,
      status:
        taskFulfilment.status === "partial" && removedFalseLengthPenalty && coverageOtherwiseComplete
          ? "good"
          : taskFulfilment.status,
      feedback:
        cleanedTaskFeedback ||
        (wordCountStatus === "target_range"
          ? "The response is within the target word range and fulfils the task without a length penalty."
          : "The response is slightly above the target range, which does not create an automatic grading penalty."),
    },
    mistakes: (taskFeedback.mistakes || []).filter((mistake) => !isOteLengthMistake(mistake)),
    teacherNote:
      cleanedTeacherNote ||
      (wordCountStatus === "target_range"
        ? "The response is within the target word range; no length reduction is required."
        : "The small overage does not create an automatic grading penalty; revise only if it affects focus."),
  };
}

function isVaguePolishPriority(text = "") {
  return /\b(make .*phrases? more natural|phrases? more natural|smoother wording|wording more natural|supporting details? tightly focused|maximum precision|maintain .*precision|tighten .*long sentences?|make the argument more direct)\b/i.test(text);
}

function dedupeOtePriorities(priorities = []) {
  return priorities.filter((item, index, list) => {
    const normalized = String(item || "").trim().toLowerCase();
    return normalized && list.findIndex((other) => String(other || "").trim().toLowerCase() === normalized) === index;
  });
}

function countOteMeaningfulMistakes(taskFeedback = {}) {
  return Array.isArray(taskFeedback.mistakes) ? taskFeedback.mistakes.length : 0;
}

function hasPartialOteTaskCoverage(taskFeedback = {}) {
  const taskStatus = taskFeedback.taskFulfilment?.status;
  const contentStatus = taskFeedback.taskFulfilment?.contentSpecificity?.status;
  const requiredPoints = taskFeedback.taskFulfilment?.requiredPoints || [];
  return (
    ["partial", "weak", "off_task"].includes(taskStatus) ||
    ["partly_generic", "too_generic", "off_task"].includes(contentStatus) ||
    requiredPoints.some((point) => ["partly_covered", "missing"].includes(point?.status))
  );
}

function postProcessOteWritingFeedback(payload, feedback) {
  if (!feedback || !Array.isArray(feedback.tasks)) return feedback;

  const processedTasks = feedback.tasks.map((taskFeedback, index) => {
    const originalTask = payload.tasks[index] || {};
    const normalizedTaskFeedback = normalizeAdvancedEssayOptionalPoints(originalTask, taskFeedback);
    const normalizedLengthFeedback = normalizeOteTargetRangeFeedback(originalTask, normalizedTaskFeedback);
    const withOriginalCounts = {
      ...normalizedLengthFeedback,
      wordCount: originalTask.answer?.wordCount ?? normalizedTaskFeedback.wordCount,
      wordCountStatus: originalTask.answer?.wordCountStatus || normalizedTaskFeedback.wordCountStatus,
      wordCountFeedback: describeOteWordCount(
        originalTask.taskType || normalizedTaskFeedback.taskType,
        originalTask.answer?.wordCountStatus || normalizedTaskFeedback.wordCountStatus,
        originalTask.answer?.wordCount ?? normalizedTaskFeedback.wordCount
      ),
    };

    const shouldPreFilterPreferenceEdits =
      originalTask.taskType === "ote_advanced_part1_essay" &&
      ["target_range", "acceptable_over_range"].includes(withOriginalCounts.wordCountStatus);
    const withoutPreferenceEdits = {
      ...withOriginalCounts,
      mistakes: shouldPreFilterPreferenceEdits
        ? (withOriginalCounts.mistakes || []).filter(
            (mistake) => !isPreferenceOnlyOteCorrection(mistake)
          )
        : (withOriginalCounts.mistakes || []),
    };

    if (!isHighControlOteTask(withoutPreferenceEdits)) return withoutPreferenceEdits;

    const filteredMistakes = (withoutPreferenceEdits.mistakes || []).filter(
      (mistake) => !isPreferenceOnlyOteCorrection(mistake)
    );
    const hasNoMeaningfulMistakes = filteredMistakes.length === 0;
    const studentAnswer = originalTask.answer?.text || withoutPreferenceEdits.studentAnswer || "";

    return {
      ...withoutPreferenceEdits,
      mistakes: filteredMistakes,
      grammar: hasNoMeaningfulMistakes
        ? {
            ...withoutPreferenceEdits.grammar,
            status: withoutPreferenceEdits.grammar?.status === "minor_issues" ? "strong" : withoutPreferenceEdits.grammar?.status,
            feedback: "Grammar is accurate and controlled; no significant corrections are needed.",
            examples: [],
          }
        : withoutPreferenceEdits.grammar,
      lexis: hasNoMeaningfulMistakes
        ? {
            ...withoutPreferenceEdits.lexis,
            status: withoutPreferenceEdits.lexis?.status || "strong",
            feedback: "Vocabulary is natural, precise, and appropriate for the task.",
            examples: [],
          }
        : withoutPreferenceEdits.lexis,
      formatAndRegister: hasNoMeaningfulMistakes
        ? {
            ...withoutPreferenceEdits.formatAndRegister,
            feedback: "The academic register is appropriate and consistently controlled for a tutor-facing essay.",
          }
        : withoutPreferenceEdits.formatAndRegister,
      improvedVersion: hasNoMeaningfulMistakes && studentAnswer ? studentAnswer : withoutPreferenceEdits.improvedVersion,
      teacherNote: hasNoMeaningfulMistakes
        ? "This is a polished response with no significant language corrections needed."
        : withoutPreferenceEdits.teacherNote,
    };
  });

  const hasHighControlTask = processedTasks.some(isHighControlOteTask);
  const hasOnlyHighControlTasks = processedTasks.length > 0 && processedTasks.every(isHighControlOteTask);
  const hasMeaningfulMistakes = processedTasks.some((task) => (task.mistakes || []).length > 0);
  const meaningfulMistakeCount = processedTasks.reduce((sum, task) => sum + countOteMeaningfulMistakes(task), 0);
  const hasPartialCoverage = processedTasks.some(hasPartialOteTaskCoverage);
  const allTasksWithinAcceptedRange = processedTasks.every((task) =>
    ["target_range", "acceptable_over_range"].includes(task.wordCountStatus)
  );
  const optionalEssayPoints = processedTasks.flatMap((task) =>
    (task.taskFulfilment?.requiredPoints || [])
      .filter((point) => point?.status === "optional_not_used")
      .map((point) => point?.point)
      .filter(Boolean)
  );

  const adjusted = {
    ...feedback,
    tasks: processedTasks,
    overall: {
      ...(feedback.overall || {}),
      summary: allTasksWithinAcceptedRange
        ? stripFalseOteTargetRangeLengthClaim(
            stripOptionalOteEssayPointCriticism(feedback.overall?.summary, optionalEssayPoints)
          )
        : stripOptionalOteEssayPointCriticism(feedback.overall?.summary, optionalEssayPoints),
      mainStrengths: (feedback.overall?.mainStrengths || []).map((strength) =>
        String(strength || "").replace(
          /all three required ideas/gi,
          (match) => (/^[A-Z]/.test(match) ? "All three listed ideas" : "all three listed ideas")
        )
      ),
      mainPriorities: dedupeOtePriorities(feedback.overall?.mainPriorities || []).filter((priority) => {
        if (optionalEssayPoints.some((point) => textMentionsOteEssayPoint(priority, point))) {
          return false;
        }
        if (allTasksWithinAcceptedRange && isLengthPriority(priority)) {
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
    ["B1+/B2 range", "B2 range", "Strong B2 range"].includes(adjusted.estimatedWritingLevel?.label)
  ) {
    adjusted.estimatedWritingLevel = {
      ...(adjusted.estimatedWritingLevel || {}),
      label: hasMeaningfulMistakes ? "C1 range" : "At least C1 / above OTE range",
      confidence: adjusted.estimatedWritingLevel?.confidence || "medium",
      note:
        "This is AI-estimated training feedback. OTE Advanced reports up to C1, and the observed writing quality comfortably meets that level for this task.",
    };
  }

  if (
    adjusted.estimatedWritingLevel?.label === "Strong B2 range" &&
    (meaningfulMistakeCount >= 8 || hasPartialCoverage)
  ) {
    adjusted.estimatedWritingLevel = {
      ...(adjusted.estimatedWritingLevel || {}),
      label: "B2 range",
      note:
        adjusted.estimatedWritingLevel?.note ||
        "This is AI-estimated training feedback. The script is clearly communicative, but recurring errors or incomplete task coverage make Strong B2 too generous.",
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

function normalizeOteSummaryMarkingGuide(markingGuide) {
  if (!markingGuide || typeof markingGuide !== "object") return null;
  const mainIdeas = Array.isArray(markingGuide.mainIdeas)
    ? markingGuide.mainIdeas.slice(0, 4).map((item, index) => {
        const ideaObject = typeof item === "string" ? { idea: item } : item || {};
        return {
          id: cleanString(ideaObject.id || `idea-${index + 1}`, 80),
          idea: cleanString(ideaObject.idea || "", 500),
          supportingDetails: Array.isArray(ideaObject.supportingDetails)
            ? ideaObject.supportingDetails.slice(0, 6).map((detail) => ({
                source: cleanString(detail?.source || "", 40),
                detail: cleanString(detail?.detail || "", 500),
              })).filter((detail) => detail.detail)
            : [],
        };
      }).filter((item) => item.idea)
    : [];

  return {
    overarchingIdea: cleanString(markingGuide.overarchingIdea || "", 700),
    mainIdeas,
    crossTextLinks: Array.isArray(markingGuide.crossTextLinks)
      ? markingGuide.crossTextLinks.slice(0, 6).map((link) => ({
          mainIdeaId: cleanString(link?.mainIdeaId || "", 80),
          explanation: cleanString(link?.explanation || "", 600),
        })).filter((link) => link.explanation)
      : [],
    lowPriorityDetails: Array.isArray(markingGuide.lowPriorityDetails)
      ? markingGuide.lowPriorityDetails.slice(0, 8).map((detail) => ({
          source: cleanString(detail?.source || "", 40),
          detail: cleanString(detail?.detail || "", 500),
        })).filter((detail) => detail.detail)
      : [],
    modelSummary: cleanString(markingGuide.modelSummary || "", 1400),
    commonWeaknesses: Array.isArray(markingGuide.commonWeaknesses)
      ? markingGuide.commonWeaknesses.slice(0, 8).map((item) => cleanString(item, 500)).filter(Boolean)
      : [],
  };
}

function normalizeOteWritingPayload(data) {
  const mode = data?.mode === "single_task" ? "single_task" : "full_mock";
  const validTaskTypes = new Set([
    "ote_part1_email",
    "ote_part2_essay",
    "ote_part2_article",
    "ote_part2_review",
    "ote_advanced_part1_essay",
    "ote_advanced_part2_summary",
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
        inputText: cleanString(task?.inputText || "", 9000),
        prompt: cleanString(task?.prompt || "", 1800),
        requiredPoints: Array.isArray(task?.requiredPoints)
          ? task.requiredPoints.slice(0, 5).map((point) => cleanString(point, 500)).filter(Boolean)
          : [],
        markingGuide: taskType === "ote_advanced_part2_summary"
          ? normalizeOteSummaryMarkingGuide(task?.markingGuide)
          : null,
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
    "- ote_advanced_part1_essay",
    "- ote_advanced_part2_summary",
    "",
    "Official task context:",
    "- Part 1 email: 80-130 words, responds to an input email, includes three required points, informal or neutral tone, functions such as giving information, responding to opinions/feelings, inviting, requesting, suggesting.",
    "- Part 2 essay/article/review: 100-160 words. Essay develops an argument on a classroom-discussion topic. Article/review tasks describe, narrate, express feelings/opinions, and may recommend. The target reader is usually an English teacher.",
    "- Advanced Part 1 essay: 220-280 words, academic tutor audience. The answer must develop a clear argument, include at least two listed ideas, support points, and reach a conclusion.",
    "- Advanced Part 2 summary: 80-100 words, one paragraph for classmates. The answer must combine the main ideas from a textbook extract and lecture transcript, use full sentences, avoid copying where possible, and stay concise. Use any task-specific marking guide in the input as the expected content coverage.",
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
    "- Use only: Below A2 / unclear, A2 range, B1 range, B1+/B2 range, B2 range, Strong B2 range, C1 range, At least C1 / above OTE range.",
    "- This training tool may describe observed writing quality above the core range targeted by a specific OTE writing task.",
    "- OTE Advanced reports up to C1. For exceptionally polished, native-like, or professionally fluent writing, use At least C1 / above OTE range rather than suggesting an official C2 result.",
    "- If the response shows highly natural idiomatic phrasing, flexible syntax, precise register control, strong cohesion, and almost no errors, use C1 range or At least C1 / above OTE range.",
    "- Do not lower an otherwise advanced answer to B1+/B2 because of a small word-count excess, one slightly indirect point, or a minor punctuation choice. Mention those as local issues while keeping the observed language level high.",
    "- Reserve Strong B2 range for strong but still visibly upper-intermediate writing: generally effective, but with limited idiomatic range, some awkwardness, noticeable simplification, or several correctable issues.",
    "- Use B2 range, not Strong B2 range, when the answer is organized and communicative but contains recurring basic/intermediate errors, many silent corrections would be needed, or task coverage is only partial.",
    "- If the writing is polished, idiomatic, naturally organized, register-appropriate, and virtually error-free, it should normally be C1 range or At least C1 / above OTE range, not Strong B2.",
    "- Do not give a precise official score.",
    "",
    "Task fulfilment and content specificity are high priority. Internally identify the specific task requirements before giving feedback.",
    "- For Part 1, identify the three required points and check whether each is covered, partly covered, or missing.",
    "- For Part 1, check that the answer responds to the input email, not just the general topic.",
    "- For essays, check for a clear opinion, developed argument, reasons/examples, logical organization, and specificity to the question.",
    "- Separate the writer's position from task fulfilment. Agreeing, disagreeing, partially agreeing, or proposing alternatives can all be valid if the question allows it. Do not mark a position wrong just because it is harder to develop.",
    "- For articles, check that it reads like a magazine article, has an engaging suitable tone, and answers the article prompt precisely.",
    "- For reviews, check that the reviewed item is clear, details/opinions/reasons are given, and recommendation is included where required.",
    "- Flag generic content: memorised openings, vague statements, opinions without reasons, unrelated examples, or article/review answers that sound like general essays.",
    "",
    "Oxford Test of English Advanced Writing criteria:",
    "- Advanced writing is marked separately for Part 1 Essay and Part 2 Summary. Both scripts use Task fulfilment, Organization, Grammar, and Lexis, but the task expectations are different.",
    "- Use the 0-7 marking scale conceptually only: B1.1/B1.2, B2.1/B2.2, C1.1/C1.2, C2.1. Do not output numeric marks unless the user-facing schema explicitly asks for them, and never claim official marking.",
    "- In feedback, describe the observed performance in plain language: B2-level, C1-level, or above-task-range quality where appropriate.",
    "",
    "Advanced Part 1 Essay criteria:",
    "- Task fulfilment: judge whether the essay develops a clear argument, expands and supports points, includes at least two of the three listed prompts, uses an appropriate tutor-facing academic register, and creates a positive effect on the reader.",
    "- C1-like essay task fulfilment: well-developed argument, points expanded and supported at length, register nearly always appropriate, consistently positive reader impact.",
    "- B2-like essay task fulfilment: generally well developed, argument and points reasonably expanded, register generally appropriate, reader understands with minimal effort.",
    "- B1-like essay task fulfilment: underdeveloped, short/minimally expanded points, inconsistent register, reader needs effort.",
    "- If the essay includes ideas from fewer than two listed prompts, say this clearly: official criteria cap Task fulfilment at B2.2.",
    "- Populate requiredPoints for all listed essay ideas. If the essay clearly uses at least two listed ideas, set any unused third idea to optional_not_used, never missing.",
    "- If the essay clearly covers at least two listed prompts, do not treat the unused third prompt as missing content. Do not mention it in the overall summary, main priorities, mistakes, task-fulfilment criticism, or improved version. It may be described only as an optional development route.",
    "- An optional_not_used point satisfies the task choice rule and must not lower Task fulfilment, Organization, the estimated level, or any other judgment.",
    "- If the essay covers fewer than two listed prompts but gives a legitimate opinion, keep the opinion. Tell the student to develop the missing listed prompt(s) in a way that supports their own stance.",
    "- Organization: look for an effective introduction, logical paragraphing, clear progression of argument, suitable conclusion, and cohesive features that guide the reader naturally.",
    "- Grammar: reward range plus control. C1 requires a high level of control of simple and complex structures with rare, hard-to-spot errors; B2 has good control but complex structures may be awkward or errors may occasionally impede.",
    "- Lexis: reward precise, task-appropriate range. C1 uses a wide range with rare non-impeding errors; B2 is generally appropriate but may include unnatural or inaccurate choices.",
    "- Advanced essay length caps: 161-219 words caps all criteria at B2.2; 91-160 at B2.1; 71-90 at B1.2; 0-70 at B1.1. Over 280 is not the same as the summary over-limit cap, but should be mentioned if it affects focus or exam management.",
    "",
    "Advanced Part 2 Summary criteria:",
    "- Task fulfilment: judge whether the response synthesizes the main ideas from both input texts with appropriate supporting details, avoids unnecessary detail, is clearly communicated, uses an appropriate academic register, and stays within the 80-100 word task.",
    "- Use the task-specific markingGuide information map as the expected meaning, not as a keyword checklist. requiredPoints contains short labels for the same main ideas.",
    "- Evaluate semantic idea coverage: accept any accurate paraphrase that expresses the same meaning. Never require exact phrases, keywords, or wording from the guide or model summary.",
    "- Populate summaryEvaluation for every advanced summary. Assess the overarching idea as present, partly_present, or missing. Assess every task-specific main idea separately as present, partly_present, or missing.",
    "- For each main idea, assess supportingDetail as appropriate, limited, or missing. Supporting details are acceptable evidence, not a compulsory checklist: selected details are normally sufficient and no candidate needs every listed detail.",
    "- Assess useOfSources, synthesis, redundancy, idea-based organization, and paraphrasing separately using the schema categories.",
    "- Do not give full credit merely because an idea and an unrelated detail both appear; check that their relationship is clear.",
    "- Do not require equal space for the two sources. Both must contribute meaningfully, but one may provide the framework while the other develops it.",
    "- Use crossTextLinks as examples of meaningful synthesis. Equivalent relationships expressed in a different way also receive credit.",
    "- Use lowPriorityDetails and commonWeaknesses to diagnose selection. Do not automatically penalize an example; it is redundant when it occupies space needed for more important content.",
    "- The overarching idea may appear anywhere in the paragraph; do not require it in the first sentence.",
    "- Check source use explicitly and precisely. Distinguish using only one source from using both sources but omitting essential ideas, adding unsupported ideas, or selecting details poorly.",
    "- If only one input text is used, official criteria cap Task fulfilment and Organization at B1.2. Do not say 'leans too much on one source' when the answer actually uses both; say which essential ideas are missing instead.",
    "- C1-like summary task fulfilment: main ideas and suitable supporting details from both texts are synthesized, clearly communicated with little redundancy, register nearly always appropriate.",
    "- B2-like summary task fulfilment: at least two main ideas plus some supporting detail from both texts, generally clear, some awareness of purpose.",
    "- B1-like summary task fulfilment: at least one main idea from one text, not always clearly communicated, limited awareness of task purpose.",
    "- Organization: reward reconstructing/reorganizing ideas into one coherent paragraph. Do not reward simply copying each text in sequence as two mini-summaries.",
    "- Grammar and Lexis: for summary, focus on paraphrasing and adaptation. Reward concise control and successful grammatical/lexical transformation; penalize reliance on original wording, copying, or awkward paraphrase that reduces clarity.",
    "- Summary concision matters. The response should be one paragraph, full sentences, enough information for classmates, and no more than 100 words.",
    "- Advanced summary length caps: up to 105 words may receive any mark; 106-120 words caps all criteria at B2.2; 121+ words caps all criteria at B1.2.",
    "- Redundancy is a real criterion: flag irrelevant examples, repeated points, or minor details that crowd out main ideas.",
    "- C1-like task fulfilment requires synthesized main ideas with appropriate selected support from both texts, clear communication, and little redundancy.",
    "- B2-like task fulfilment requires at least two main ideas with some supporting detail from both texts and generally clear communication.",
    "- B1-like task fulfilment includes at least one main idea from one text but limited synthesis or supporting information.",
    "- If only one source is used, cap Task fulfilment and Organization at B1.2. For 106-120 words cap all criteria at B2.2; for 121+ words cap all criteria at B1.2. Apply these caps even if other qualities are stronger.",
    "- For every non-summary task, set summaryEvaluation.applicable to false, return an empty mainIdeas array, set every summaryEvaluation status to not_applicable, and use empty feedback strings.",
    "",
    "Task-specific register:",
    "- Part 1 email to a friend: informal language, contractions, direct questions, friendly closings are appropriate.",
    "- Part 1 neutral recipient: polite but not excessively formal. Do not push students into very formal Aptis-style committee emails unless required.",
    "- Essay: neutral/formal classroom-discussion style for a teacher or tutor; avoid very chatty phrases.",
    "- Advanced summary: concise academic summary for classmates; no personal opinion, no bullet points, no informal commentary, no direct address.",
    "- Article: can be lively and reader-focused; do not mark it down simply because it is less formal than an essay.",
    "- Review: can be semi-formal or lively; should be useful for the target reader and not sound like a private message.",
    "",
    "Word count handling:",
    "- Use the supplied wordCountStatus and do not contradict it.",
    "- Under-length responses should be flagged clearly because OTE specifications penalize under-length writing.",
    "- Acceptable_over_range means the answer is no more than 20 words over the target. Do not list this as a weakness, priority, or correction if the answer is focused, relevant, and accurate.",
    "- Exception: for ote_advanced_part2_summary, acceptable_over_range means 101-105 words only. Above 105 words is capped in the official criteria and must be flagged.",
    "- Only make length a meaningful issue when the response is excessive, or when extra length causes repetition, loss of focus, unclear task coverage, or avoidable language errors.",
    "",
    "Mistakes section:",
    "- Include a dedicated mistakes array for each task.",
    "- Each mistake should show the exact student text or a short phrase, a corrected version, and a short explanation.",
    "- For error-heavy B1/B2 answers, include enough corrections to explain the main recurring patterns and the main changes in the improved version. Usually include 6-10 useful mistakes for a task with many errors, not just 3-5.",
    "- Only include genuine, defensible problems. If nothing is wrong, return an empty mistakes array.",
    "- Do not invent corrections just because feedback was requested. Do not rewrite natural idiomatic language into blander exam language.",
    "- Do catch precise idiom or collocation errors that change meaning, especially in otherwise strong writing, such as 'cannot be understated' when the intended meaning is 'cannot be overstated'.",
    "- Do not correct style choices that are appropriate for the task register, such as contractions, informal phrasing, direct questions, or friendly closings in an email to a friend.",
    "- Treat natural idiomatic phrases as acceptable even if a simpler alternative exists. For example, do not correct phrases like 'landing you with the mess', 'so long as we book', 'he's gonna love it', or 'lend us a hand' in an informal email when they fit the context.",
    "- A correction must fix a real problem, not merely replace an advanced or idiomatic phrase with a simpler one.",
    "- Prioritize mistakes that clearly affect task fulfilment, register, grammar accuracy, lexis accuracy, spelling, punctuation, or clarity.",
    "- For excellent responses, it is normal to include 0 mistakes and no grammar/lexis examples. For weaker responses, include the most useful representative mistakes; use a longer list when errors are frequent enough that a short list would make the rewrite look unexplained.",
    "- Do not say there are no significant corrections beyond the listed errors when the improved version silently fixes additional grammar, vocabulary, or collocation problems.",
    "- If a whole idea is missing, use category 'task', original as 'Missing idea: ...', and correction as a short suggested addition.",
    "- If a point is handled indirectly but still makes sense in context, describe it as a possible task-development improvement, not as a language error.",
    "",
    "Improved versions:",
    "- Preserve the student's meaning, choices, opinions, examples, and key ideas.",
    "- Do not change task decisions. For example, if the student chose the steep/fast route, keep that route; if the student chose the cafe, keep the cafe; if the student supported shorter holidays, keep that opinion.",
    "- Never reverse or soften the student's opinion to improve task fulfilment. For example, do not change 'instead of limiting visitors' to 'in addition to limiting visitors', or 'capping is not the right answer' to 'capping is not the only answer'.",
    "- The improved version should be a corrected and upgraded version of the student's answer, not a shorter alternative answer and not a generic model answer.",
    "- If the student's answer is already excellent and there are no meaningful corrections, keep improvedVersion identical or nearly identical to the original. Do not force changes.",
    "- Keep the version close to the original structure when the structure works.",
    "- Make the writing genuinely better: improve accuracy, naturalness, cohesion, and task clarity while preserving content.",
    "- Keep the version realistic for the student's observed level; do not simplify an advanced answer into a lower-level model answer.",
    "- Do not remove specific details unless they are irrelevant, repetitive, or incorrect.",
    "- Add new ideas only when a required task point is missing or too vague, and make them support the student's original stance.",
    "- Every substantial change in the improved version should correspond to an explained mistake or task-development note. Avoid silently correcting many errors that are not mentioned anywhere in feedback.",
    "- Keep Part 1 improved emails 80-130 words where possible.",
    "- Keep Part 2 improved versions 100-160 words where possible.",
    "- Keep Advanced Part 1 essay improved versions 220-280 words where possible.",
    "- Keep Advanced Part 2 summary improved versions 80-100 words, one paragraph, and no more than 100 words where possible.",
    "",
    "Overall feedback and priorities:",
    "- mainPriorities may be an empty array when there are no meaningful priorities. Do not fill it with artificial advice.",
    "- If the only issue is a tiny task-development point or a small overage within acceptable_over_range, say so proportionately and do not make it sound like a serious weakness.",
    "- For excellent answers, the teacherNote should explicitly say that no significant language corrections are needed.",
    "",
    "Feedback style: clear, practical, encouraging, suitable for A2-C1+ learners, specific to the answer. Avoid long grammar lectures, vague advice, official score claims, harsh wording, generic repeated advice, and unnecessary correction.",
    "Keep all feedback fields concise. Use one short sentence for most feedback strings, and keep mistake explanations brief so the JSON response can complete cleanly.",
    "Return only valid JSON using the required schema.",
    "",
    "Submission:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function normalizeOteLevelProductionPayload(data = {}) {
  const lead = data?.lead && typeof data.lead === "object" ? data.lead : {};
  const phase1 = data?.phase1 && typeof data.phase1 === "object" ? data.phase1 : {};
  const profile = phase1?.profile && typeof phase1.profile === "object" ? phase1.profile : {};
  const quizReport = data?.quizReport && typeof data.quizReport === "object" ? data.quizReport : {};
  const quizResult = quizReport?.result && typeof quizReport.result === "object" ? quizReport.result : {};
  const quizScores = quizReport?.scores && typeof quizReport.scores === "object" ? quizReport.scores : {};
  const speaking = data?.speaking && typeof data.speaking === "object" ? data.speaking : {};
  const writing = data?.writing && typeof data.writing === "object" ? data.writing : {};
  const writingTask = writing?.task && typeof writing.task === "object" ? writing.task : {};
  const writingAnswerText = cleanString(writing?.answer?.text || "", 5000);
  const recordings = Array.isArray(speaking?.recordings)
    ? speaking.recordings.slice(0, 3).map((item, index) => ({
        id: cleanString(item?.id || item?.taskId || `speaking-${index + 1}`, 120),
        label: cleanString(item?.label || item?.title || `Speaking ${index + 1}`, 160),
        prompt: cleanString(item?.prompt || "", 1800),
        durationSeconds: Number(item?.durationSeconds || 0),
        base64: cleanString(item?.base64 || "", 8_000_000),
        mime: cleanString(item?.mime || "audio/webm", 80) || "audio/webm",
        name: cleanString(item?.name || `ote-level-production-${index + 1}.webm`, 160),
      }))
    : [];

  return {
    mode: cleanString(data?.mode || "general_production_check", 80),
    lead: {
      email: cleanString(lead?.email || "", 180).toLowerCase(),
      name: cleanString(lead?.name || "", 120),
    },
    phase1: {
      routeKey: cleanString(phase1?.routeKey || "", 40),
      batch1Score: Number(phase1?.batch1Score || 0),
      totalScore: Number(phase1?.totalScore || 0),
      profile: {
        id: cleanString(profile?.id || "", 10),
        cefr: cleanString(profile?.cefr || "", 20),
        title: cleanString(profile?.title || "", 120),
        redirectLabel: cleanString(profile?.redirectLabel || "", 180),
      },
    },
    quizReport: {
      result: {
        cefr: cleanString(quizResult?.cefr || profile?.cefr || "", 20),
        title: cleanString(quizResult?.title || profile?.title || "", 120),
        profileId: cleanString(quizResult?.profileId || profile?.id || "", 10),
        summary: cleanString(quizResult?.summary || "", 600),
        redirectLabel: cleanString(quizResult?.redirectLabel || profile?.redirectLabel || "", 180),
        coursePath: cleanString(quizResult?.coursePath || "", 180),
        commercialCue: cleanString(quizResult?.commercialCue || "", 300),
      },
      routeKey: cleanString(quizReport?.routeKey || phase1?.routeKey || "", 40),
      scores: {
        batch1: Number(quizScores?.batch1 || phase1?.batch1Score || 0),
        batch2: Number(quizScores?.batch2 || 0),
        total: Number(quizScores?.total || phase1?.totalScore || 0),
        max: Number(quizScores?.max || 20),
      },
      items: Array.isArray(quizReport?.items)
        ? quizReport.items.slice(0, 20).map((item, index) => ({
            number: Number(item?.number || index + 1),
            id: cleanString(item?.id || "", 80),
            level: cleanString(item?.level || "", 20),
            focus: cleanString(item?.focus || "", 120),
            prompt: cleanString(item?.prompt || "", 600),
            selectedAnswer: cleanString(item?.selectedAnswer || "", 160),
            correctAnswer: cleanString(item?.correctAnswer || "", 160),
            isCorrect: Boolean(item?.isCorrect),
            feedback: cleanString(item?.feedback || "", 500),
          }))
        : [],
      text: cleanString(quizReport?.text || "", 14000),
    },
    speaking: {
      recordings,
    },
    writing: {
      task: {
        id: cleanString(writingTask?.id || "ote-diagnostic-writing-email-1", 120),
        title: cleanString(writingTask?.title || "Registration email", 160),
        inputText: cleanString(writingTask?.inputText || "", 2500),
        question: cleanString(writingTask?.question || "", 1200),
        prompt: cleanString(writingTask?.prompt || "", 1400),
        requiredPoints: Array.isArray(writingTask?.requiredPoints)
          ? writingTask.requiredPoints.slice(0, 5).map((point) => cleanString(point, 400)).filter(Boolean)
          : [],
        expectedContent: Array.isArray(writingTask?.expectedContent)
          ? writingTask.expectedContent.slice(0, 8).map((point) => cleanString(point, 400)).filter(Boolean)
          : [],
        assessmentFocus: Array.isArray(writingTask?.assessmentFocus)
          ? writingTask.assessmentFocus.slice(0, 8).map((point) => cleanString(point, 300)).filter(Boolean)
          : [],
        targetWordsMin: Number(writingTask?.targetWordsMin || 60),
        targetWordsMax: Number(writingTask?.targetWordsMax || 100),
      },
      answer: {
        text: writingAnswerText,
        wordCount: Number.isFinite(writing?.answer?.wordCount) ? writing.answer.wordCount : countWords(writingAnswerText),
      },
    },
  };
}

function buildOteLevelProductionPrompt(payload, speakingItems) {
  const isAdvancedCheck = payload.mode === "advanced_level_check";
  const levelInstructions = isAdvancedCheck
    ? [
        "Assess the learner's production using only these bands: Insufficient evidence, Below A2, A2, B1, B2, Strong B2 / Advanced-ready, C1.",
        "This is the Advanced diagnostic path. The tasks are designed to distinguish secure B2, approaching C1, and clear C1 evidence.",
        "Do not output C2. For exceptional, highly polished production, use C1 and explain that the evidence is comfortably advanced.",
        "Treat C1 as a normal, reachable outcome for this advanced check when the response is fluent, coherent, precise, and well controlled.",
      ]
    : [
        "Assess the learner's production using only these bands: Insufficient evidence, Below A2, A2, B1, B2, Strong B2 / Advanced-ready, C1.",
        "Do not output C2. If the learner is clearly beyond B2 for this short General check, use C1 and recommend a C1/Advanced diagnostic route.",
      ];
  const speakingTaskInstructions = isAdvancedCheck
    ? [
        "Speaking task weights:",
        "- Personal question: 15%",
        "- Diplomatic voicemail: 35%",
        "- Mini debate: 50%",
      ]
    : [
        "Speaking task weights:",
        "- Personal question: 15%",
        "- Voicemail: 35%",
        "- Picture-based talk: 50%",
      ];
  const writingTaskInstructions = isAdvancedCheck
    ? [
        "Writing task:",
        "- Short academic opinion response for a tutor.",
        `- Recommended length: ${payload.writing.task.targetWordsMin}-${payload.writing.task.targetWordsMax} words.`,
        "- The learner should discuss benefits, consider possible costs/disadvantages, give their own opinion, support ideas with reasons, and include a brief conclusion.",
        "- Assess whether the register is suitable for an academic tutor: neutral to formal, clear, organized, and appropriately concise.",
        "- Do not heavily penalize a response slightly over the target range if it is relevant, controlled, and well organized.",
      ]
    : [
        "Writing task:",
        "- Short polite registration/admissions email.",
        `- Recommended length: ${payload.writing.task.targetWordsMin}-${payload.writing.task.targetWordsMax} words.`,
        "- The learner should say which course or level they are interested in, explain why they want to improve their English, and say when they would like to start.",
        "- Assess whether the register is suitable for a course admissions context: polite, clear, and not too casual.",
        "- Do not heavily penalize a response slightly over 100 words if it is relevant, controlled, and well organized.",
      ];
  return [
    "You are an English level diagnostic assistant for Oxford Test of English preparation.",
    "",
    "This is a short public funnel diagnostic, not an official OTE score or full mock test.",
    ...levelInstructions,
    "Write candidate-facing comments in Spanish by default. Keep official level labels and course names unchanged when the schema requires them.",
    "",
    "Transcript-only limitation:",
    "- Speaking recordings have been transcribed. Do not claim reliable pronunciation assessment.",
    "- You may consider whether the transcript suggests connected speech, task fulfilment, organization, grammar range, vocabulary range, and approximate response length.",
    "- Do not lower the level estimate merely because pronunciation cannot be assessed. Mention pronunciation as a limitation, not as a weakness.",
    "- Keep speaking confidence no higher than moderate unless the evidence is unusually complete and clear, but confidence and level are separate: moderate confidence can still support Strong B2 / Advanced-ready.",
    "- If speaking transcripts are empty, too short, or marked with transcriptionConfidence insufficient, set speaking.estimatedLevel and speaking criteria to Insufficient evidence.",
    "- Do not block the report because of weak speaking evidence. Use the Use of English result and writing sample for the overall recommendation, and explain in Spanish that speaking could not be assessed reliably.",
    "",
    "Level calibration:",
    "- Use B2 for competent production with clear organization but noticeable limits in development, range, or control.",
    "- Use Strong B2 / Advanced-ready when the learner gives extended, well-organized answers, handles all task points, uses varied lexis and complex grammar, and only makes occasional slips that do not impede communication.",
    "- A response can be Strong B2 / Advanced-ready even with minor grammar slips, fillers, transcription artifacts, or slightly unnatural phrasing.",
    "- Use C1 when the learner's production is fluent, extended, coherent, naturally organized, idiomatic or near-idiomatic, and shows only isolated minor slips or typos.",
    "- Do not mention B2 in candidateMessage when productionEstimate is C1. Be clear and confident: the production sample is C1-level evidence, while still noting that this is not an official score.",
    "- If the learner explicitly mentions aiming for C1/C2, do not treat that as evidence of current level. Judge only the language produced.",
    "",
    ...speakingTaskInstructions,
    "",
    ...writingTaskInstructions,
    "- Populate writingCorrections only with real, specific language issues from the writing sample. Do not invent corrections. If there are no clear errors, return an empty array.",
    "- Do not say the learner needs to improve grammar or polish written grammar unless writingCorrections contains actual grammatical corrections.",
    "",
    "Minimum evidence rules:",
    "- Speaking is insufficient if the voicemail or talk is missing/unusable or there are only isolated words across the main tasks.",
    "- Writing is insufficient if there is no relevant response or fewer than about 35-40 relevant words.",
    "- A short but relevant response can still provide level evidence.",
    "",
    "Course recommendation rules:",
    ...(isAdvancedCheck
      ? [
        "- Below A2, A2, or B1: B1 Level Preparation Course or B2 bridge support, depending on the Use of English result.",
        "- B2: B2 Exam Masterclass Course.",
        "- Strong B2 / Advanced-ready: B2-to-C1 bridge / C1 preparation route.",
        "- C1: C1 Academic Track / Premium Diagnostic.",
        "- In advanced mode, advancedRecommended should normally be false because this is already the advanced diagnostic path.",
      ]
      : [
        "- Below A2 or A2: A2 / Elementary Foundation Course.",
        "- B1: B1 Level Preparation Course.",
        "- B2: B2 Exam Masterclass Course.",
        "- Strong B2 / Advanced-ready: OTE Advanced diagnostic recommended.",
        "- C1: C1 Academic Track / Premium Diagnostic.",
        "- If Phase 1 profile is D/C1, advancedRecommended should normally be true unless production evidence is clearly much weaker.",
      ]),
    "",
    "Return strict JSON only. Keep candidateMessage, strength, and priority concise, warm, practical, and in Spanish.",
    "",
    "Phase 1 Use of English result:",
    JSON.stringify(payload.phase1, null, 2),
    "",
    "Speaking transcripts:",
    JSON.stringify(speakingItems, null, 2),
    "",
    "Writing task and answer:",
    JSON.stringify(payload.writing, null, 2),
  ].join("\n");
}

function buildOteFinalRecommendation(feedback, payload, speakingItems) {
  const isAdvancedCheck = payload.mode === "advanced_level_check";
  const profile = payload.quizReport?.result || payload.phase1?.profile || {};
  const scores = payload.quizReport?.scores || {};
  const productionEstimate = feedback?.productionEstimate || "Insufficient evidence";
  const routeFromProduction = feedback?.courseRecommendation || "";
  const quizRoute = profile.redirectLabel || payload.phase1?.profile?.redirectLabel || "";
  const quizCefr = profile.cefr || payload.phase1?.profile?.cefr || "-";
  const totalScore = scores.total ?? payload.phase1?.totalScore ?? "-";
  const speakingWordTotal = (speakingItems || []).reduce((sum, item) => sum + Number(item.wordCount || 0), 0);
  const hasSpeakingEvidence = speakingWordTotal >= 80;
  const hasWritingEvidence = Number(payload?.writing?.answer?.wordCount || 0) >= 35;
  const hasCorrections = Array.isArray(feedback?.writingCorrections) && feedback.writingCorrections.length > 0;

  if (productionEstimate === "C1") {
    return {
      title: "Ruta C1 / evaluación avanzada",
      route: "C1 Academic Track / Premium Diagnostic",
      summary:
        `Tu producción de speaking y writing muestra evidencia clara de nivel C1. El resultado de Use of English (${quizCefr}, ${totalScore}/20) sirve como comprobación adicional de precisión, pero la recomendación final debe dar más peso a la muestra productiva completa.`,
      nextStep: hasCorrections
        ? "Recomendamos una evaluación avanzada C1 y revisar los detalles concretos señalados en writing."
        : "Recomendamos una evaluación avanzada C1 o una ruta de preparación de alto nivel.",
    };
  }

  if (productionEstimate === "Strong B2 / Advanced-ready") {
    return {
      title: isAdvancedCheck ? "B2 alto con puente hacia C1" : "B2 alto con evaluación avanzada recomendada",
      route: isAdvancedCheck ? "B2-to-C1 bridge / C1 preparation route" : (routeFromProduction || "OTE Advanced diagnostic recommended"),
      summary:
        isAdvancedCheck
          ? `La combinación del Use of English avanzado (${quizCefr}, ${totalScore}/20) y la producción oral/escrita indica un perfil B2 alto, cerca de una ruta C1 pero todavía con margen para consolidar precisión y desarrollo.`
          : `La combinación del Use of English (${quizCefr}, ${totalScore}/20) y la producción oral/escrita indica un perfil B2 alto. La muestra productiva es suficientemente fuerte como para recomendar una comprobación avanzada.`,
      nextStep: isAdvancedCheck
        ? "Recomendamos una ruta puente B2-C1 o preparación C1 si el objetivo es certificar un nivel avanzado."
        : "Recomendamos hacer una evaluación avanzada antes de elegir la ruta final.",
    };
  }

  if (["B2", "B1", "A2", "Below A2"].includes(productionEstimate)) {
    return {
      title: `Ruta recomendada: ${routeFromProduction || quizRoute || productionEstimate}`,
      route: routeFromProduction || quizRoute || productionEstimate,
      summary:
        hasSpeakingEvidence || hasWritingEvidence
          ? `La recomendación combina el resultado de Use of English (${quizCefr}, ${totalScore}/20) con la muestra de speaking/writing. En conjunto, el perfil encaja mejor con ${productionEstimate}.`
          : `La recomendación se basa principalmente en el resultado de Use of English (${quizCefr}, ${totalScore}/20), porque la muestra productiva fue limitada.`,
      nextStep: routeFromProduction || quizRoute || "Revisar la ruta recomendada con el equipo académico.",
    };
  }

  return {
    title: `Ruta orientativa: ${quizRoute || quizCefr}`,
    route: quizRoute || quizCefr,
    summary:
      `No hubo suficiente evidencia productiva para ajustar con seguridad el resultado. La recomendación final se basa principalmente en el Use of English (${quizCefr}, ${totalScore}/20).`,
    nextStep: "Completar speaking y writing de nuevo en un entorno tranquilo ayudaría a confirmar la ruta.",
  };
}

function buildOteLevelReportEmail({ payload, speakingItems, feedback, submissionId }) {
  const candidateEmail = payload.lead.email;
  const profile = payload.quizReport?.result || payload.phase1?.profile || {};
  const scores = payload.quizReport?.scores || {};
  const quizItems = Array.isArray(payload.quizReport?.items) ? payload.quizReport.items : [];
  const writingCorrections = Array.isArray(feedback?.writingCorrections) ? feedback.writingCorrections : [];
  const finalRecommendation = feedback?.finalRecommendation || buildOteFinalRecommendation(feedback, payload, speakingItems);
  const lines = [
    "Informe del test de nivel Oxford Test of English",
    "",
    `Email del estudiante: ${candidateEmail}`,
    submissionId ? `ID del informe: ${submissionId}` : "",
    "",
    "Recomendación final",
    finalRecommendation.title,
    `Ruta: ${finalRecommendation.route}`,
    finalRecommendation.summary,
    `Siguiente paso: ${finalRecommendation.nextStep}`,
    "",
    "Resultado de Use of English",
    `Resultado orientativo: ${profile.cefr || payload.phase1?.profile?.cefr || "-"} | ${profile.title || payload.phase1?.profile?.title || "-"}`,
    `Puntuación: ${scores.total ?? payload.phase1?.totalScore ?? "-"}/${scores.max || 20}`,
    `Primera parte: ${scores.batch1 ?? payload.phase1?.batch1Score ?? "-"}/10`,
    `Segunda parte: ${scores.batch2 ?? "-"}/10`,
    `Ruta: ${payload.quizReport?.routeKey || payload.phase1?.routeKey || "-"}`,
    `Recomendación: ${profile.redirectLabel || payload.phase1?.profile?.redirectLabel || "-"}`,
    "",
    "Revisión de preguntas",
  ].filter(Boolean);

  quizItems.forEach((item) => {
    lines.push(
      "",
      `${item.number}. ${item.level} | ${item.focus}`,
      item.prompt,
      `Respuesta del estudiante: ${item.selectedAnswer || "Sin respuesta"}`,
      `Respuesta correcta: ${item.correctAnswer}`,
      `Resultado: ${item.isCorrect ? "Correcto" : "Para revisar"}`,
      `Comentario: ${item.feedback}`
    );
  });

  lines.push(
    "",
    "Estimación de speaking y writing",
    `Nivel estimado: ${feedback?.productionEstimate || "-"}`,
    `Confianza: ${feedback?.confidence || "-"}`,
    `Ruta recomendada: ${feedback?.courseRecommendation || "-"}`,
    `Evaluación avanzada recomendada: ${feedback?.advancedRecommended ? "Sí" : "No"}`,
    `Punto fuerte: ${feedback?.strength || "-"}`,
    `Prioridad: ${feedback?.priority || "-"}`,
    `Mensaje para el estudiante: ${feedback?.candidateMessage || "-"}`,
    "",
    "Muestra de writing",
    `Tarea: ${payload.writing.task.title}`,
    `Palabras: ${payload.writing.answer.wordCount}`,
    payload.writing.answer.text || "-",
    ""
  );

  if (writingCorrections.length) {
    lines.push("Correcciones específicas de writing");
    writingCorrections.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.original}`,
        `Corrección: ${item.correction}`,
        `Comentario: ${item.explanation}`,
        ""
      );
    });
  }

  lines.push(
    "Transcripciones de speaking"
  );

  speakingItems.forEach((item, index) => {
    lines.push(
      "",
      `${index + 1}. ${item.title}`,
      item.prompt,
      `Palabras: ${item.wordCount}`,
      item.transcript || "-"
    );
  });

  lines.push(
    "",
    "Nota: este es un test de nivel breve para orientación, no una puntuación oficial del Oxford Test of English."
  );

  const text = lines.join("\n");
  const html = [
    "<h2>Informe del test de nivel Oxford Test of English</h2>",
    `<p><strong>Email del estudiante:</strong> ${escapeHtml(candidateEmail)}</p>`,
    submissionId ? `<p><strong>ID del informe:</strong> ${escapeHtml(submissionId)}</p>` : "",
    "<h3>Recomendación final</h3>",
    "<div style=\"border:1px solid #bfdbfe;border-left:5px solid #2563eb;background:#eff6ff;padding:14px;margin:12px 0;border-radius:8px\">",
    `<p><strong>${escapeHtml(finalRecommendation.title)}</strong></p>`,
    `<p><strong>Ruta:</strong> ${escapeHtml(finalRecommendation.route)}</p>`,
    `<p>${escapeHtml(finalRecommendation.summary)}</p>`,
    `<p><strong>Siguiente paso:</strong> ${escapeHtml(finalRecommendation.nextStep)}</p>`,
    "</div>",
    "<h3>Resultado de Use of English</h3>",
    `<p><strong>Resultado orientativo:</strong> ${escapeHtml(profile.cefr || payload.phase1?.profile?.cefr || "-")} | ${escapeHtml(profile.title || payload.phase1?.profile?.title || "-")}</p>`,
    `<p><strong>Puntuación:</strong> ${escapeHtml(scores.total ?? payload.phase1?.totalScore ?? "-")}/${escapeHtml(scores.max || 20)}</p>`,
    `<p><strong>Ruta:</strong> ${escapeHtml(payload.quizReport?.routeKey || payload.phase1?.routeKey || "-")}</p>`,
    `<p><strong>Recomendación:</strong> ${escapeHtml(profile.redirectLabel || payload.phase1?.profile?.redirectLabel || "-")}</p>`,
    "<h3>Revisión de preguntas</h3>",
    ...quizItems.map((item) => {
      const cardStyle = item.isCorrect
        ? "border:1px solid #bbf7d0;border-left:5px solid #16a34a;background:#f0fdf4;padding:12px;margin:10px 0;border-radius:8px"
        : "border:1px solid #fecaca;border-left:5px solid #dc2626;background:#fff7ed;padding:12px;margin:10px 0;border-radius:8px";
      const badgeStyle = item.isCorrect
        ? "display:inline-block;padding:3px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:700"
        : "display:inline-block;padding:3px 8px;border-radius:999px;background:#fee2e2;color:#991b1b;font-weight:700";
      return [
      `<div style="${cardStyle}">`,
      `<p><strong>${escapeHtml(item.number)}. ${escapeHtml(item.level)} | ${escapeHtml(item.focus)}</strong></p>`,
      `<p>${escapeHtml(item.prompt)}</p>`,
      `<p><strong>Respuesta del estudiante:</strong> ${escapeHtml(item.selectedAnswer || "Sin respuesta")}</p>`,
      `<p><strong>Respuesta correcta:</strong> ${escapeHtml(item.correctAnswer)}</p>`,
      `<p><strong>Resultado:</strong> <span style="${badgeStyle}">${item.isCorrect ? "Correcto" : "Para revisar"}</span></p>`,
      `<p>${escapeHtml(item.feedback)}</p>`,
      "</div>",
    ].join("");
    }),
    "<h3>Estimación de speaking y writing</h3>",
    `<p><strong>Nivel estimado:</strong> ${escapeHtml(feedback?.productionEstimate || "-")}</p>`,
    `<p><strong>Confianza:</strong> ${escapeHtml(feedback?.confidence || "-")}</p>`,
    `<p><strong>Ruta recomendada:</strong> ${escapeHtml(feedback?.courseRecommendation || "-")}</p>`,
    `<p><strong>Punto fuerte:</strong> ${escapeHtml(feedback?.strength || "-")}</p>`,
    `<p><strong>Prioridad:</strong> ${escapeHtml(feedback?.priority || "-")}</p>`,
    `<p>${escapeHtml(feedback?.candidateMessage || "")}</p>`,
    "<h3>Muestra de writing</h3>",
    `<p><strong>Tarea:</strong> ${escapeHtml(payload.writing.task.title)}</p>`,
    `<p><strong>Palabras:</strong> ${escapeHtml(payload.writing.answer.wordCount)}</p>`,
    `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(payload.writing.answer.text || "-")}</pre>`,
    writingCorrections.length ? "<h3>Correcciones específicas de writing</h3>" : "",
    ...writingCorrections.map((item) => [
      "<div style=\"border:1px solid #fed7aa;border-left:5px solid #f59e0b;background:#fff7ed;padding:12px;margin:10px 0;border-radius:8px\">",
      `<p><strong>Original:</strong> ${escapeHtml(item.original || "")}</p>`,
      `<p><strong>Corrección:</strong> ${escapeHtml(item.correction || "")}</p>`,
      `<p>${escapeHtml(item.explanation || "")}</p>`,
      "</div>",
    ].join("")),
    "<h3>Transcripciones de speaking</h3>",
    ...speakingItems.map((item, index) => [
      `<h4>${escapeHtml(index + 1)}. ${escapeHtml(item.title)}</h4>`,
      `<p>${escapeHtml(item.prompt)}</p>`,
      `<p><strong>Palabras:</strong> ${escapeHtml(item.wordCount)}</p>`,
      `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(item.transcript || "-")}</pre>`,
    ].join("")),
    "<p><em>Este es un test de nivel breve para orientación, no una puntuación oficial del Oxford Test of English.</em></p>",
  ].filter(Boolean).join("\n");

  return { text, html };
}

async function sendOteLevelReportEmail({ payload, speakingItems, feedback, submissionId }) {
  if (!FROM_ADDRESS || !GMAIL_PASS) {
    console.warn("[generateOteLevelProductionFeedback] Email skipped: missing Gmail credentials.");
    return false;
  }
  const report = buildOteLevelReportEmail({ payload, speakingItems, feedback, submissionId });
  const subject = `Informe de nivel Oxford Test of English: ${payload.quizReport?.result?.cefr || payload.phase1?.profile?.cefr || "resultado"}`;
  const candidateMsg = {
    from: FROM_ADDRESS,
    to: payload.lead.email,
    subject,
    text: [
      "Gracias por completar el test de nivel de Oxford Test of English.",
      "",
      "Tu informe está abajo. Nuestro equipo académico también ha recibido una copia para poder recomendarte el siguiente paso.",
      "",
      report.text,
    ].join("\n"),
    html: [
      "<p>Gracias por completar el test de nivel de Oxford Test of English.</p>",
      "<p>Tu informe está abajo. Nuestro equipo académico también ha recibido una copia para poder recomendarte el siguiente paso.</p>",
      report.html,
    ].join("\n"),
    replyTo: OTE_LEVEL_REPORT_COPY_EMAIL,
  };
  const adminMsg = {
    from: FROM_ADDRESS,
    to: OTE_LEVEL_REPORT_COPY_EMAIL,
    subject: `Nuevo test de nivel Oxford Test of English: ${payload.lead.email}`,
    text: report.text,
    html: report.html,
    replyTo: payload.lead.email,
  };

  await transporter.sendMail(candidateMsg);
  await transporter.sendMail(adminMsg);
  return true;
}

function postProcessOteLevelProductionFeedback(feedback, payload, speakingItems) {
  if (!feedback) return feedback;
  const isAdvancedCheck = payload.mode === "advanced_level_check";

  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const writingCorrections = Array.isArray(feedback.writingCorrections)
    ? feedback.writingCorrections.filter((item) => item?.original && item?.correction)
    : [];
  const allFeedbackText = normalize([
    feedback.strength,
    feedback.priority,
    feedback.candidateMessage,
    feedback.speaking?.note,
    feedback.writing?.note,
  ].filter(Boolean).join(" "));
  const speakingWordTotal = (speakingItems || []).reduce((sum, item) => sum + Number(item.wordCount || 0), 0);
  const substantialSpeakingTasks = (speakingItems || []).filter((item) => Number(item.wordCount || 0) >= 50).length;
  const writingWords = Number(payload?.writing?.answer?.wordCount || 0);
  const phase1Score = Number(payload?.phase1?.totalScore || payload?.quizReport?.scores?.total || 0);
  const profileId = String(payload?.phase1?.profile?.id || payload?.quizReport?.result?.profileId || "");
  const strongUseOfEnglish = phase1Score >= 18 || ["D", "ADV_C1", "ADV_C2"].includes(profileId);
  const enoughProductionEvidence = writingWords >= 70 && speakingWordTotal >= 180 && substantialSpeakingTasks >= 2;
  const hasStrongSignals =
    /(muy buen|buen control|respuestas? amplia|bien organizada|lexico.*(rico|variado)|vocabulario.*(rico|variado)|solido|clara|claridad)/.test(allFeedbackText);
  const hasSevereLimit =
    /(insuficient|limitad|incomplet|muchos errores|dificultad|impide|pobre|confus|no puede evaluarse el speaking)/.test(allFeedbackText);

  const shouldUpgradeToC1 =
    ["B2", "Strong B2 / Advanced-ready"].includes(feedback.productionEstimate) &&
    (strongUseOfEnglish || hasStrongSignals) &&
    enoughProductionEvidence &&
    !hasSevereLimit &&
    writingCorrections.length <= 1;

  if (feedback.productionEstimate === "C1" || shouldUpgradeToC1) {
    const adjusted = {
      ...feedback,
      writingCorrections,
      productionEstimate: "C1",
      courseRecommendation: "C1 Academic Track / Premium Diagnostic",
      advancedRecommended: !isAdvancedCheck,
      priority: writingCorrections.length
        ? "Revisar detalles aislados de precisión escrita y mantener este nivel de naturalidad en tareas formales."
        : "Mantener este nivel de naturalidad y precisión en tareas formales más exigentes.",
      candidateMessage:
        isAdvancedCheck
          ? "Tu producción se sitúa claramente en C1: las respuestas son amplias, naturales, bien organizadas y con muy buen control del registro. Este test no es una certificación oficial, pero la muestra justifica una ruta C1 de alto nivel."
          : "Tu producción se sitúa claramente en C1: las respuestas son amplias, naturales, bien organizadas y con muy buen control del registro. Este test no es una certificación oficial, pero la muestra justifica una ruta avanzada o una evaluación C1 más específica.",
    };
    return {
      ...adjusted,
      finalRecommendation: buildOteFinalRecommendation(adjusted, payload, speakingItems),
    };
  }

  const adjusted = {
    ...feedback,
    writingCorrections,
    advancedRecommended: isAdvancedCheck ? false : feedback.advancedRecommended,
  };
  return {
    ...adjusted,
    finalRecommendation: buildOteFinalRecommendation(adjusted, payload, speakingItems),
  };
}

function normalizeOteAdvancedIntroConclusionPayload(data = {}) {
  const introductionText = cleanString(data?.introduction?.text || "", 1400);
  const conclusionText = cleanString(data?.conclusion?.text || "", 1400);
  return {
    exam: "ote_advanced",
    taskId: cleanString(data?.taskId || "", 120),
    title: cleanString(data?.title || "", 180),
    taskPrompt: cleanString(data?.taskPrompt || "", 1800),
    availableIdeas: Array.isArray(data?.availableIdeas)
      ? data.availableIdeas.slice(0, 3).map((item) => cleanString(item, 180)).filter(Boolean)
      : [],
    selectedPosition: cleanString(data?.selectedPosition || "", 500),
    selectedIdeas: Array.isArray(data?.selectedIdeas)
      ? data.selectedIdeas.slice(0, 3).map((item) => cleanString(item, 180)).filter(Boolean)
      : [],
    introduction: {
      text: introductionText,
      wordCount: countWords(introductionText),
    },
    conclusion: {
      text: conclusionText,
      wordCount: countWords(conclusionText),
    },
  };
}

function buildOteAdvancedIntroConclusionFeedbackPrompt(payload) {
  return [
    "You are an expert English writing teacher giving focused formative feedback for an Oxford Test of English Advanced essay lesson.",
    "The student has planned a full essay but written only its introduction and conclusion. Do not assess the response as a complete 220-280-word essay.",
    "Do not claim to provide official Oxford Test of English marking or a certified level.",
    "Return strict JSON only using the supplied schema.",
    "",
    "Lesson principles:",
    "- The introduction should establish the precise issue, restate the two positions in the student's own words, and create a clear starting point.",
    "- An explicit position in the introduction is optional. Never criticise the introduction merely because it does not announce a thesis or preview the selected prompts.",
    "- The introduction should avoid developing supporting arguments, detailed examples, or an essay plan.",
    "- The conclusion must bring the imagined discussion together, answer the question clearly, remain consistent with the selected position and introduction, and avoid a new argument or policy.",
    "- Both paragraphs should normally be approximately 35-50 words. Treat this as formative guidance, not a rigid penalty.",
    "",
    "Assess exactly these areas:",
    "1. issueFraming: Does the introduction identify the precise advertising debate and fairly restate both positions?",
    "2. argumentControl: Does the introduction save development for the body, and does the conclusion avoid undeveloped new arguments or policies?",
    "3. finalJudgement: Does the conclusion give a definite answer to the question?",
    "4. consistency: Do both paragraphs align with the selected overall position and sound as though they belong to the same essay? Use the selected ideas only as intended body-paragraph context; do not require them to be listed in the introduction.",
    "5. register: Is the style appropriately formal, natural, clear, and suitable for an academic tutor?",
    "",
    "Feedback rules:",
    "- Give concise, learner-friendly comments grounded in exact wording from the student's paragraphs.",
    "- Do not invent missing body paragraphs or judge how well unseen arguments were developed.",
    "- Do not provide a model introduction, model conclusion, or full rewritten pair.",
    "- Add no language correction unless there is a real grammar, vocabulary, cohesion, or register problem.",
    "- Return at most four high-value languageCorrections. For strong accurate writing, return an empty array.",
    "- Do not replace advanced but natural British academic phrasing with simpler language merely as a preference.",
    "",
    "Student plan and paragraphs:",
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

function normalizeOteAdvancedAcademicStylePayload(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return {
    exam: "ote_advanced",
    taskId: cleanString(data?.taskId || "", 100),
    title: cleanString(data?.title || "", 180),
    instructions: cleanString(data?.instructions || "", 600),
    items: items.slice(0, 10).map((item) => ({
      id: cleanString(item?.id || "", 30),
      source: cleanString(item?.source || "", 600),
      studentAnswer: cleanString(item?.studentAnswer || "", 1000),
      suggestedAnswer: cleanString(item?.suggestedAnswer || "", 600),
      keyFeatures: Array.isArray(item?.keyFeatures)
        ? item.keyFeatures.slice(0, 8).map((feature) => cleanString(feature, 180)).filter(Boolean)
        : [],
    })),
  };
}

function buildOteAdvancedAcademicStyleFeedbackPrompt(payload) {
  return [
    "You are an expert writing teacher assessing a formative Oxford Test of English Advanced essay exercise.",
    "The student has rewritten sentence-level examples to make them suitable for a clear, precise and controlled academic essay.",
    "This is not an official exam score.",
    "",
    "For each submitted rewrite, assess:",
    "- Meaning: does it preserve the central meaning rather than replacing it with a different claim?",
    "- Academic style: is it neutral, precise, measured and appropriately qualified?",
    "- Language: is the grammar accurate and the vocabulary and collocations natural?",
    "",
    "Accept a wide range of effective rewrites. The suggestedAnswer and keyFeatures are teaching references, not a fixed answer key.",
    "Do not penalise a natural answer merely because it differs from the suggested version.",
    "Do not demand unnecessarily elaborate vocabulary, passive structures, nominalisation or an impersonal thesis style.",
    "Flag conversational wording, vague reference, unsupported generalisation, emotional exaggeration, direct address and inflated language only when genuinely present.",
    "Judge the rewrite as a whole and distinguish academic style from surface accuracy.",
    "An isolated grammar, spelling or typing slip must not make an otherwise appropriate rewrite not_appropriate. This includes a missing auxiliary such as 'be', a missing article, a small agreement error or a clear typo.",
    "When the style and meaning work but there is one small language slip, use acceptable, explicitly recognise what works, and give the correction gently and briefly.",
    "Use partly_appropriate only when a noticeable language problem affects clarity, the meaning has shifted, or the style remains inconsistent.",
    "Reserve not_appropriate for a rewrite that substantially changes the meaning, remains clearly conversational or vague, or is too inaccurate to communicate the intended idea.",
    "Phrase explanations supportively: lead with the successful feature, then identify the smallest useful correction. Avoid blunt statements that the whole answer is inappropriate when only one word is missing or mistyped.",
    "When suggesting a correction for a small slip, preserve the student's wording and change only what is necessary.",
    "If the answer is accurate, natural and academically appropriate, use excellent and leave suggestedRewrite empty.",
    "For acceptable, leave suggestedRewrite empty unless one small, concrete revision is genuinely useful.",
    "Use partly_appropriate or not_appropriate only when there is a clear issue with meaning, language or academic suitability.",
    "Keep comments concise, specific and learner-friendly. Refer to the student's exact wording where useful.",
    "Set taskType exactly to ote_advanced_academic_style_rewrite. Return strict JSON only.",
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

exports.generateOteAdvancedIntroConclusionFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating paragraph feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteAdvancedIntroConclusionPayload(data);
    if (
      !payload.taskId ||
      !payload.taskPrompt ||
      !payload.selectedPosition ||
      payload.selectedIdeas.length < 2 ||
      !payload.introduction.text ||
      !payload.conclusion.text
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Advanced introduction and conclusion feedback requires a complete plan and both paragraphs."
      );
    }
    if (payload.introduction.wordCount < 8 || payload.conclusion.wordCount < 8) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Both paragraphs need enough writing to assess."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "ote_advanced_intro_conclusion",
      WRITING_FEEDBACK_CREDIT_COSTS.ote_advanced_intro_conclusion
    );
    const requestBody = {
      model,
      input: buildOteAdvancedIntroConclusionFeedbackPrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 2400,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "ote_advanced_intro_conclusion_feedback",
          strict: true,
          schema: OTE_ADVANCED_INTRO_CONCLUSION_FEEDBACK_SCHEMA,
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
      console.error("[generateOteAdvancedIntroConclusionFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteAdvancedIntroConclusionFeedback] OpenAI error", responseJson);
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
      console.error("[generateOteAdvancedIntroConclusionFeedback] JSON parse failed", { outputText, error });
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

exports.generateOteAdvancedAcademicStyleFeedback = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in before generating academic style feedback.");
    }
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteAdvancedAcademicStylePayload(data);
    if (!payload.taskId || !payload.items.length) {
      throw new functions.https.HttpsError("invalid-argument", "Academic style feedback requires valid rewrite data.");
    }
    if (!payload.items.some((item) => item.studentAnswer.trim())) {
      throw new functions.https.HttpsError("invalid-argument", "Submit at least one rewrite before requesting feedback.");
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "ote_advanced_academic_style",
      WRITING_FEEDBACK_CREDIT_COSTS.ote_advanced_academic_style
    );
    const requestBody = {
      model,
      input: buildOteAdvancedAcademicStyleFeedbackPrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 3000,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "ote_advanced_academic_style_feedback",
          strict: true,
          schema: OTE_ADVANCED_ACADEMIC_STYLE_FEEDBACK_SCHEMA,
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
      console.error("[generateOteAdvancedAcademicStyleFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteAdvancedAcademicStyleFeedback] OpenAI error", responseJson);
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
      console.error("[generateOteAdvancedAcademicStyleFeedback] JSON parse failed", { outputText, error });
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

    const meta = {
      model,
      responseId: responseJson?.id || null,
      usage: responseJson?.usage || null,
      generatedAt: new Date().toISOString(),
      quota: creditReservation,
    };
    await logAiFeedbackGeneratedServer(
      context,
      "aptis_writing_part1",
      {
        product: "aptis",
        section: "writing",
        part: "part1",
        answerCount: items.length,
        wordCount: items.reduce((sum, item) => sum + Number(item.wordCount || 0), 0),
        feedbackTaskType: "aptis_part1",
      },
      meta
    );

    return {
      feedback,
      meta,
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

exports.generateAptisSpeakingPart3Feedback = functions
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

    const task = normalizeSpeakingPart3Task(data);
    const recordings = normalizeSpeakingAudioItems(data?.recordings);
    if (
      task.questions.length !== 3 ||
      recordings.length !== 3 ||
      task.questions.some((item) => !item.question) ||
      recordings.some((item) => !item.base64)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Speaking Part 3 feedback requires three questions and three recordings."
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
      "aptis_speaking_part3",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_speaking_part3
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
      input: buildAptisSpeakingPart3Prompt(task, items),
      reasoning: { effort: "low" },
      max_output_tokens: 5000,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "aptis_speaking_part3_feedback",
          strict: true,
          schema: APTIS_SPEAKING_PART3_FEEDBACK_SCHEMA,
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
      console.error("[generateAptisSpeakingPart3Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisSpeakingPart3Feedback] OpenAI error", responseJson);
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
      console.error("[generateAptisSpeakingPart3Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    feedback = postProcessAptisSpeakingPart2Feedback(feedback, items, "Part 3");

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

exports.generateAptisSpeakingPart4Feedback = functions
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

    const task = normalizeSpeakingPart4Task(data);
    const recordings = normalizeSpeakingAudioItems(data?.recordings).slice(0, 1);
    if (
      task.questions.length !== 3 ||
      recordings.length !== 1 ||
      task.questions.some((item) => !item.question) ||
      recordings.some((item) => !item.base64)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Aptis Speaking Part 4 feedback requires three questions and one recording."
      );
    }

    const totalBase64Bytes = recordings.reduce((sum, item) => sum + item.base64.length, 0);
    if (totalBase64Bytes > 9_000_000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "This recording is too large for the trial feedback request."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      "aptis_speaking_part4",
      WRITING_FEEDBACK_CREDIT_COSTS.aptis_speaking_part4
    );

    let transcripts;
    try {
      transcripts = await Promise.all(recordings.map((item, index) => transcribeAudioItem(item, index)));
    } catch (error) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw error;
    }

    const transcript = cleanString(transcripts[0] || "", 4200);
    const item = {
      questionId: "part4-talk",
      question: task.questions.map((question) => question.question).join(" / "),
      transcript,
      durationSeconds: 120,
      audioAvailable: true,
      audioAnalysisAvailable: false,
      transcriptionConfidence: "medium",
      wordCount: countWords(transcript),
    };

    if (item.wordCount < 2) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The recording could not be transcribed clearly enough to assess."
      );
    }

    const requestBody = {
      model,
      input: buildAptisSpeakingPart4Prompt(task, item),
      reasoning: { effort: "low" },
      max_output_tokens: 5000,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "aptis_speaking_part4_feedback",
          strict: true,
          schema: APTIS_SPEAKING_PART4_FEEDBACK_SCHEMA,
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
      console.error("[generateAptisSpeakingPart4Feedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateAptisSpeakingPart4Feedback] OpenAI error", responseJson);
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
      console.error("[generateAptisSpeakingPart4Feedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    if (feedback?.answer) {
      const processed = postProcessAptisSpeakingPart2Feedback({ answers: [feedback.answer] }, [item]);
      feedback.answer = processed.answers?.[0] || feedback.answer;
    }

    return {
      transcripts: [item],
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

exports.generateOteSpeakingFeedback = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
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

    const payload = normalizeOteSpeakingPayload(data);
    const recordings = payload.recordings;
    if (!recordings.length || recordings.some((item) => !item.base64)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "OTE speaking feedback requires at least one recording."
      );
    }

    const isMock = payload.partId === "mock" || Boolean(payload.mockId) || recordings.length > 7;
    const totalBase64Bytes = recordings.reduce((sum, item) => sum + item.base64.length, 0);
    if (totalBase64Bytes > (isMock ? 32_000_000 : 12_000_000)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "These recordings are too large for the feedback request."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const creditTaskType = isMock ? "ote_speaking_mock" : "ote_speaking_part";
    const creditReservation = await consumeWritingFeedbackCredits(
      context,
      creditTaskType,
      WRITING_FEEDBACK_CREDIT_COSTS[creditTaskType]
    );

    let transcripts;
    try {
      transcripts = await Promise.all(recordings.map((item, index) => transcribeAudioItem(item, index)));
    } catch (error) {
      await refundWritingFeedbackCredits(context, creditReservation);
      throw error;
    }

    const items = recordings.map((recording, index) => {
      const transcript = cleanString(transcripts[index] || "", 3200);
      return {
        questionId: recording.id,
        questionNumber: index + 1,
        questionType: getOteQuestionType(recording, index),
        question: recording.prompt || recording.label,
        partId: recording.partId || payload.partId,
        label: recording.label,
        transcript,
        durationSeconds: recording.durationSeconds || 0,
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
      input: buildOteSpeakingPrompt(payload, items),
      reasoning: { effort: "low" },
      max_output_tokens: isMock ? 9000 : 5200,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "ote_speaking_feedback",
          strict: true,
          schema: OTE_SPEAKING_FEEDBACK_SCHEMA,
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
      console.error("[generateOteSpeakingFeedback] OpenAI request failed", error);
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteSpeakingFeedback] OpenAI error", responseJson);
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
      console.error("[generateOteSpeakingFeedback] JSON parse failed", { outputText, error });
      await refundWritingFeedbackCredits(context, creditReservation);
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }

    feedback = postProcessOteSpeakingFeedback(feedback, items);

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
        product: "ote",
        partId: payload.partId,
        mockId: payload.mockId,
      },
    };
  });

exports.generateOteLevelProductionFeedback = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .https.onCall(async (data, context) => {
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Missing OPENAI_API_KEY in the Functions environment."
      );
    }

    const payload = normalizeOteLevelProductionPayload(data);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.lead.email)) {
      throw new functions.https.HttpsError("invalid-argument", "A valid email address is required.");
    }
    const recordingsWithAudio = payload.speaking.recordings.filter((item) => item.base64);
    const totalBase64Bytes = recordingsWithAudio.reduce((sum, item) => sum + item.base64.length, 0);
    if (totalBase64Bytes > 24_000_000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "These recordings are too large for the level-test diagnostic."
      );
    }
    if (payload.writing.answer.wordCount < 35) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The writing response is too short to estimate reliably."
      );
    }

    const model = cleanString(data?.model || "gpt-5.4-mini", 80);
    const transcripts = await Promise.all(payload.speaking.recordings.map(async (item, index) => {
      if (!item.base64) return "";
      try {
        return await transcribeAudioItem(item, index);
      } catch (error) {
        console.error("[generateOteLevelProductionFeedback] Transcription failed for item", {
          index,
          id: item.id,
          message: error?.message || String(error),
        });
        return "";
      }
    }));

    const speakingItems = payload.speaking.recordings.map((recording, index) => {
      const transcript = cleanString(transcripts[index] || "", 2600);
      const wordCount = countWords(transcript);
      return {
        taskId: recording.id,
        title: recording.label,
        prompt: recording.prompt,
        durationSeconds: recording.durationSeconds || 0,
        transcript,
        wordCount,
        audioAvailable: Boolean(recording.base64),
        audioAnalysisAvailable: false,
        transcriptionConfidence: wordCount >= 2 ? "medium" : "insufficient",
      };
    });

    const requestBody = {
      model,
      input: buildOteLevelProductionPrompt(payload, speakingItems),
      reasoning: { effort: "low" },
      max_output_tokens: 2600,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "ote_level_production_feedback",
          strict: true,
          schema: OTE_LEVEL_PRODUCTION_FEEDBACK_SCHEMA,
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
      console.error("[generateOteLevelProductionFeedback] OpenAI request failed", error);
      throw new functions.https.HttpsError("unavailable", "Could not reach the feedback service.");
    }

    const responseJson = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      console.error("[generateOteLevelProductionFeedback] OpenAI error", responseJson);
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
      console.error("[generateOteLevelProductionFeedback] JSON parse failed", { outputText, error });
      throw new functions.https.HttpsError("internal", "The feedback service returned invalid JSON.");
    }
    feedback = postProcessOteLevelProductionFeedback(feedback, payload, speakingItems);

    let submissionId = null;
    try {
      const docRef = await firestore.collection("oteLevelProductionLeads").add({
        email: payload.lead.email,
        name: payload.lead.name || "",
        uid: context.auth?.uid || null,
        mode: payload.mode,
        phase1: payload.phase1,
        quizReport: payload.quizReport,
        speakingTranscripts: speakingItems,
        writing: {
          task: payload.writing.task,
          answer: payload.writing.answer,
        },
        feedback,
        meta: {
          model,
          transcriptionModel: "gpt-4o-mini-transcribe",
          responseId: responseJson?.id || null,
          usage: responseJson?.usage || null,
          generatedAt: new Date().toISOString(),
          audioStored: false,
          publicFunnel: true,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      submissionId = docRef.id;
    } catch (error) {
      console.error("[generateOteLevelProductionFeedback] Firestore save failed", error);
    }

    let reportEmailed = false;
    try {
      reportEmailed = await sendOteLevelReportEmail({ payload, speakingItems, feedback, submissionId });
    } catch (error) {
      console.error("[generateOteLevelProductionFeedback] Report email failed", error);
    }

    return {
      submissionId,
      transcripts: speakingItems,
      feedback,
      reportEmailed,
      meta: {
        model,
        transcriptionModel: "gpt-4o-mini-transcribe",
        responseId: responseJson?.id || null,
        usage: responseJson?.usage || null,
        generatedAt: new Date().toISOString(),
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

    const meta = {
      model,
      responseId: responseJson?.id || null,
      usage: responseJson?.usage || null,
      generatedAt: new Date().toISOString(),
      quota: creditReservation,
    };
    await logAiFeedbackGeneratedServer(
      context,
      `aptis_writing_${payload.part || "part23"}`,
      {
        product: "aptis",
        section: "writing",
        part: payload.part || "",
        taskId: payload.taskId || "",
        taskTitle: payload.title || "",
        answerCount: payload.answers.length,
        wordCount: payload.answers.reduce((sum, answer) => sum + Number(answer.wordCount || 0), 0),
        feedbackTaskType,
      },
      meta
    );

    return {
      feedback,
      meta,
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
      max_output_tokens: 8200,
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

    const meta = {
      model,
      responseId: responseJson?.id || null,
      usage: responseJson?.usage || null,
      generatedAt: new Date().toISOString(),
      quota: creditReservation,
    };
    await logAiFeedbackGeneratedServer(
      context,
      "aptis_writing_part4",
      {
        product: "aptis",
        section: "writing",
        part: "part4",
        taskId: payload.taskId || "",
        taskTitle: payload.title || "",
        answerCount: 2,
        wordCount: Number(payload.friendEmail.wordCount || 0) + Number(payload.formalEmail.wordCount || 0),
        feedbackTaskType: "aptis_part4",
      },
      meta
    );

    return {
      feedback,
      meta,
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
    const site = r.site === "aptis-trainer" ? "aptis-trainer" : "seifhub";
    const productName = site === "aptis-trainer" ? "Aptis Trainer" : "Seif Hub";

    const lines = [
      `New ${productName} access request`,
      "",
      `Site: ${site}`,
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
      subject: `${productName} access request — ${userEmail || r.userName || "unknown user"}`,
      text: lines.join("\n"),
      html: toHtml(lines),
      replyTo: userEmail && userEmail.includes("@") ? userEmail : undefined,
    };

    const userMsg = userEmail && userEmail.includes("@")
        ? {
          from: FROM_ADDRESS,
          to: userEmail,
          subject: `We’ve received your ${productName} access request`,
          text: [
            `Thanks for your request. We’ve received it and will review your ${productName} access shortly.`,
            "",
            ...lines,
          ].join("\n"),
          html:
            `<p>Thanks for your request. We’ve received it and will review your ${esc(productName)} access shortly.</p>` +
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

exports.emailSupportMessage = functions.region("europe-west1")
  .firestore.document("supportMessages/{messageId}")
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" });
    const userEmail = m.userEmail || null;
    const language = m.language === "es" ? "Español" : "English";

    const lines = [
      "New app support message",
      "",
      `Language: ${language}`,
      `Category: ${m.categoryLabel || m.category || "Other"}`,
      `Site: ${m.site || "-"}`,
      `User: ${m.userName || "-"}`,
      `Email: ${userEmail || "-"}`,
      `UID: ${m.userId || "-"}`,
      `Route: ${m.route || "-"}`,
      `URL: ${m.url || "-"}`,
      `At: ${when}`,
      "",
      "Message:",
      m.message || "",
    ];

    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const toHtml = (arr) => arr.map((l) => `<p>${esc(l)}</p>`).join("");

    const adminMsg = {
      from: FROM_ADDRESS,
      to: TEACHER_EMAIL || FROM_ADDRESS,
      subject: `App support message — ${m.categoryLabel || m.category || "Other"} — ${userEmail || m.userName || "unknown user"}`,
      text: lines.join("\n"),
      html: toHtml(lines),
      replyTo: userEmail && userEmail.includes("@") ? userEmail : undefined,
    };

    const userMsg = userEmail && userEmail.includes("@")
      ? {
          from: FROM_ADDRESS,
          to: userEmail,
          subject: m.language === "es" ? "Hemos recibido tu mensaje" : "We’ve received your message",
          text: [
            m.language === "es"
              ? "Gracias por tu mensaje. Lo hemos recibido y te responderemos lo antes posible."
              : "Thanks for your message. We’ve received it and will reply as soon as possible.",
            "",
            ...lines,
          ].join("\n"),
          html:
            `<p>${m.language === "es"
              ? "Gracias por tu mensaje. Lo hemos recibido y te responderemos lo antes posible."
              : "Thanks for your message. We’ve received it and will reply as soon as possible."}</p>` +
            "<hr/>" +
            toHtml(lines),
          replyTo: TEACHER_EMAIL || FROM_ADDRESS,
        }
      : null;

    try {
      await transporter.sendMail(adminMsg);
      if (userMsg) await transporter.sendMail(userMsg);
      console.log("MAIL_OK support message", { id: snap.id, to: adminMsg.to, copy: !!userMsg });
    } catch (err) {
      console.error("MAIL_FAIL support message", err?.message || String(err));
    }

    return null;
  });

exports.emailSiteAccessGranted = functions.region("europe-west1")
  .firestore.document("users/{userId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() || {} : {};
    const after = change.after.exists ? change.after.data() || {} : null;

    if (!after) return null;

    const userEmail = after.email || null;
    if (!userEmail || !userEmail.includes("@")) return null;

    const beforeSiteAccess = before.siteAccess || {};
    const afterSiteAccess = after.siteAccess || {};
    const accessKeys = Array.from(
      new Set([
        ...Object.keys(beforeSiteAccess || {}),
        ...Object.keys(afterSiteAccess || {}),
      ])
    );

    const changedAccesses = accessKeys
      .map((accessKey) => {
        const previous = normalizeSiteAccessEntry(beforeSiteAccess?.[accessKey]);
        const current = normalizeSiteAccessEntry(afterSiteAccess?.[accessKey]);
        if (!hasMeaningfulAccessNotificationChange(previous, current)) return null;

        return {
          accessKey,
          label: siteAccessLabel(accessKey),
          url: siteAccessUrl(accessKey),
          access: current,
          isNewGrant: !previous.active,
        };
      })
      .filter(Boolean);

    if (!changedAccesses.length) return null;

    const displayName =
      after.displayName || after.name || after.username || userEmail.split("@")[0] || "there";
    const firstAccess = changedAccesses[0];
    const isSingleAccess = changedAccesses.length === 1;
    const accessListText = changedAccesses
      .map(({ label, url, access }) => {
        const startLine = access.startDate
          ? `Start date: ${formatAccessDate(access.startDate)}`
          : "Start date: active now";
        const endLine = access.indefinite
          ? "End date: no end date set"
          : access.endDate
            ? `End date: ${formatAccessDate(access.endDate)}`
            : "End date: not set";

        return [`${label}: ${url}`, startLine, endLine].join("\n");
      })
      .join("\n\n");
    const accessListHtml = changedAccesses
      .map(({ label, url, access }) => {
        const startLine = access.startDate
          ? `Start date: ${formatAccessDate(access.startDate)}`
          : "Start date: active now";
        const endLine = access.indefinite
          ? "End date: no end date set"
          : access.endDate
            ? `End date: ${formatAccessDate(access.endDate)}`
            : "End date: not set";

        return [
          `<li>`,
          `<strong>${escapeHtml(label)}</strong><br/>`,
          `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a><br/>`,
          `${escapeHtml(startLine)}<br/>`,
          `${escapeHtml(endLine)}`,
          `</li>`,
        ].join("");
      })
      .join("");
    const hasNewGrant = changedAccesses.some((entry) => entry.isNewGrant);
    const subject = isSingleAccess
      ? `Your ${firstAccess.label} access is ready`
      : "Your Seif English platform access is ready";
    const intro = hasNewGrant
      ? "Good news: your access has been activated."
      : "Good news: your access details have been updated.";

    const text = [
      `Hi ${displayName},`,
      "",
      intro,
      "",
      accessListText,
      "",
      "You can sign in with the same email address you used for your Seif English account.",
      "If anything looks wrong, just reply to this email and we will help.",
      "",
      "Best,",
      "Seif English Academy",
    ].join("\n");

    const html =
      `<p>Hi ${escapeHtml(displayName)},</p>` +
      `<p>${escapeHtml(intro)}</p>` +
      `<ul>${accessListHtml}</ul>` +
      `<p>You can sign in with the same email address you used for your Seif English account.</p>` +
      `<p>If anything looks wrong, just reply to this email and we will help.</p>` +
      `<p>Best,<br/>Seif English Academy</p>`;

    const userMsg = {
      from: FROM_ADDRESS,
      to: userEmail,
      subject,
      text,
      html,
      replyTo: TEACHER_EMAIL || FROM_ADDRESS,
    };

    try {
      await transporter.sendMail(userMsg);
      console.log("MAIL_OK site access granted", {
        uid: context.params.userId,
        userEmail,
        accessKeys: changedAccesses.map((entry) => entry.accessKey),
      });
    } catch (err) {
      console.error("MAIL_FAIL site access granted", err?.message || String(err));
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

const SEIF_ADMIN_SYNC_SECRET = "SEIF_ADMIN_SYNC_SECRET";
const SEIF_ADMIN_DEFAULT_PASSWORD = "12345678";
const SEIF_ADMIN_ACCESS_EXTENSION_DAYS = 14;
const SEIF_ADMIN_DATED_ACCESS_STATUSES = new Set(["active", "completed"]);
const SEIF_ADMIN_IMMEDIATE_DEACTIVATION_STATUSES = new Set(["cancelled"]);

class SeifAdminApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeSeifAdminEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSeifAdminId(value) {
  return String(value || "").trim();
}

function parseSeifAdminIsoDate(value, fieldName, required) {
  const raw = String(value || "").trim();
  if (!raw && !required) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new SeifAdminApiError(
      400,
      "invalid_request",
      `${fieldName} must use YYYY-MM-DD format.`
    );
  }

  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new SeifAdminApiError(400, "invalid_request", `${fieldName} is not a valid date.`);
  }

  return raw;
}

function addSeifAdminDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function validateSeifAdminToken(req) {
  const expected = String(process.env[SEIF_ADMIN_SYNC_SECRET] || "");
  const header = String(req.get("authorization") || "");
  const match = header.match(/^Bearer\s+(.+)$/i);
  const received = match ? match[1].trim() : "";

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function parseSeifAdminSyncRequest(body = {}) {
  const studentId = normalizeSeifAdminId(body.studentId);
  const email = normalizeSeifAdminEmail(body.email);
  const status = String(body.status || "").trim().toLowerCase();

  if (!studentId) {
    throw new SeifAdminApiError(400, "invalid_request", "studentId is required.");
  }
  if (!email || !email.includes("@")) {
    throw new SeifAdminApiError(400, "invalid_request", "A valid email is required.");
  }
  if (
    !SEIF_ADMIN_DATED_ACCESS_STATUSES.has(status) &&
    !SEIF_ADMIN_IMMEDIATE_DEACTIVATION_STATUSES.has(status)
  ) {
    throw new SeifAdminApiError(
      400,
      "invalid_request",
      "status must be active, completed, or cancelled."
    );
  }

  const active = SEIF_ADMIN_DATED_ACCESS_STATUSES.has(status);
  const courseStartDate = parseSeifAdminIsoDate(
    body.courseStartDate,
    "courseStartDate",
    false
  );
  const courseEndDate = parseSeifAdminIsoDate(body.courseEndDate, "courseEndDate", active);
  const requestedAccess = body.access;

  if (
    active &&
    (!requestedAccess ||
      typeof requestedAccess !== "object" ||
      typeof requestedAccess.aptisTrainer !== "boolean" ||
      typeof requestedAccess.ote !== "boolean")
  ) {
    throw new SeifAdminApiError(
      400,
      "invalid_request",
      "access.aptisTrainer and access.ote must both be true or false."
    );
  }

  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const accessEndDate = active
    ? addSeifAdminDays(courseEndDate, SEIF_ADMIN_ACCESS_EXTENSION_DAYS)
    : "";
  const makeAccess = (enabled) => enabled && active
    ? {
        active: true,
        startDate: courseStartDate || todayIsoDate(),
        endDate: accessEndDate,
        indefinite: false,
      }
    : {
        active: false,
        startDate: "",
        endDate: "",
        indefinite: false,
      };

  return {
    studentId,
    contractId: normalizeSeifAdminId(body.contractId),
    email,
    status,
    active,
    firstName,
    lastName,
    displayName,
    courseStartDate,
    courseEndDate,
    accessEndDate,
    siteAccess: {
      [SEIF_HUB_ACCESS_KEY]: makeAccess(true),
      [APTIS_TRAINER_ACCESS_KEY]: makeAccess(active && requestedAccess.aptisTrainer),
      ote: makeAccess(active && requestedAccess.ote),
    },
  };
}

async function findSeifAdminUserByStudentId(studentId) {
  const snapshot = await firestore
    .collection("users")
    .where("externalSystems.seifAdmin.studentId", "==", studentId)
    .limit(2)
    .get();

  if (snapshot.size > 1) {
    throw new SeifAdminApiError(
      409,
      "student_id_conflict",
      "More than one account is linked to this studentId."
    );
  }

  return snapshot.empty ? null : snapshot.docs[0];
}

async function getSeifAdminAuthUserByEmail(email) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (err) {
    if (err.code === "auth/user-not-found") return null;
    throw err;
  }
}

async function createSeifAdminAuthUser(email, displayName) {
  try {
    const authUser = await admin.auth().createUser({
      email,
      password: SEIF_ADMIN_DEFAULT_PASSWORD,
      displayName: displayName || undefined,
      emailVerified: false,
    });
    return {authUser, createdAuthUser: true};
  } catch (err) {
    // A retried or simultaneous first request may have created the Auth user.
    if (err.code === "auth/email-already-exists") {
      const existing = await getSeifAdminAuthUserByEmail(email);
      if (existing) return {authUser: existing, createdAuthUser: false};
    }
    throw err;
  }
}

async function resolveSeifAdminAuthUser(payload) {
  const studentDoc = await findSeifAdminUserByStudentId(payload.studentId);
  const emailUser = await getSeifAdminAuthUserByEmail(payload.email);

  // A cancellation may be retried after an account has already been removed manually.
  // Treat that as a successful no-op instead of creating a disabled account.
  if (!payload.active && !studentDoc && !emailUser) {
    return {authUser: null, existingDoc: null, createdAuthUser: false, skipped: true};
  }

  if (studentDoc) {
    if (emailUser && emailUser.uid !== studentDoc.id) {
      throw new SeifAdminApiError(
        409,
        "email_conflict",
        "This email belongs to a different account."
      );
    }

    const authUser = await admin.auth().getUser(studentDoc.id);
    const authUpdates = {};
    if (normalizeSeifAdminEmail(authUser.email) !== payload.email) {
      authUpdates.email = payload.email;
    }
    if (payload.displayName && authUser.displayName !== payload.displayName) {
      authUpdates.displayName = payload.displayName;
    }

    return {
      authUser: Object.keys(authUpdates).length
        ? await admin.auth().updateUser(authUser.uid, authUpdates)
        : authUser,
      existingDoc: studentDoc,
      createdAuthUser: false,
    };
  }

  let authUser = emailUser;
  let createdAuthUser = false;
  if (!authUser) {
    const created = await createSeifAdminAuthUser(payload.email, payload.displayName);
    authUser = created.authUser;
    createdAuthUser = created.createdAuthUser;
  } else if (payload.displayName && authUser.displayName !== payload.displayName) {
    authUser = await admin.auth().updateUser(authUser.uid, {
      displayName: payload.displayName,
    });
  }

  const existingDoc = await firestore.doc(`users/${authUser.uid}`).get();
  const linkedStudentId = normalizeSeifAdminId(
    existingDoc.data()?.externalSystems?.seifAdmin?.studentId
  );
  if (linkedStudentId && linkedStudentId !== payload.studentId) {
    throw new SeifAdminApiError(
      409,
      "account_link_conflict",
      "This account is already linked to a different studentId."
    );
  }

  return {authUser, existingDoc, createdAuthUser};
}

exports.syncSeifAdminStudent = functions
  .runWith({secrets: [SEIF_ADMIN_SYNC_SECRET]})
  .region("europe-west1")
  .https.onRequest(async (req, res) => {
    res.set("Cache-Control", "no-store");

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: {code: "method_not_allowed", message: "Use POST."},
      });
    }
    if (!validateSeifAdminToken(req)) {
      return res.status(401).json({
        ok: false,
        error: {code: "unauthorized", message: "Invalid credentials."},
      });
    }

    try {
      const payload = parseSeifAdminSyncRequest(req.body || {});
      const {authUser, existingDoc, createdAuthUser, skipped} =
        await resolveSeifAdminAuthUser(payload);

      if (skipped) {
        return res.status(200).json({
          ok: true,
          uid: null,
          studentId: payload.studentId,
          email: payload.email,
          createdAuthUser: false,
          status: payload.status,
          accessEndDate: "",
          access: {seifhub: false, aptisTrainer: false, ote: false},
        });
      }

      const existingData = existingDoc.exists ? existingDoc.data() || {} : {};
      const existingSeifAdmin = existingData.externalSystems?.seifAdmin || {};
      if (payload.active && !payload.courseStartDate) {
        Object.entries(payload.siteAccess).forEach(([accessKey, access]) => {
          if (access.active) {
            access.startDate = existingData.siteAccess?.[accessKey]?.startDate || access.startDate;
          }
        });
      }
      const now = admin.firestore.FieldValue.serverTimestamp();
      const userPayload = {
        email: payload.email,
        name: payload.displayName || existingData.name || authUser.displayName || "",
        username: existingData.username || "",
        role: existingData.role || "student",
        siteAccess: payload.siteAccess,
        externalSystems: {
          seifAdmin: {
            studentId: payload.studentId,
            contractId: payload.contractId || existingSeifAdmin.contractId || "",
            status: payload.status,
            courseStartDate: payload.courseStartDate || existingSeifAdmin.courseStartDate || "",
            courseEndDate: payload.courseEndDate,
            accessEndDate: payload.accessEndDate,
            lastSyncedAt: now,
          },
        },
        updatedAt: now,
      };

      if (!existingDoc.exists) userPayload.createdAt = now;
      await firestore.doc(`users/${authUser.uid}`).set(userPayload, {merge: true});

      console.log("SEIF_ADMIN_SYNC_OK", {
        uid: authUser.uid,
        studentId: payload.studentId,
        status: payload.status,
        createdAuthUser,
      });

      return res.status(createdAuthUser ? 201 : 200).json({
        ok: true,
        uid: authUser.uid,
        studentId: payload.studentId,
        email: payload.email,
        createdAuthUser,
        status: payload.status,
        accessEndDate: payload.accessEndDate,
        access: {
          seifhub: payload.siteAccess.seifhub.active,
          aptisTrainer: payload.siteAccess.aptisTrainer.active,
          ote: payload.siteAccess.ote.active,
        },
      });
    } catch (err) {
      const status = err instanceof SeifAdminApiError ? err.status : 500;
      const code = err instanceof SeifAdminApiError ? err.code : "sync_failed";
      const message = err instanceof SeifAdminApiError
        ? err.message
        : "The student could not be synchronized.";

      console.error("SEIF_ADMIN_SYNC_FAIL", {
        status,
        code,
        message: err?.message || String(err),
      });
      return res.status(status).json({ok: false, error: {code, message}});
    }
  });


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
