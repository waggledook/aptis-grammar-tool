/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const nodemailer = require("nodemailer");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");

// ---------- init Admin (safe if called twice) ----------
try { admin.app(); } catch { admin.initializeApp(); }

// ---------- Mail config (supports env vars OR functions.config()) ----------
const GMAIL_USER   = process.env.GMAIL_USER || functions.config().gmail?.user;
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD || functions.config().gmail?.pass;
const TEACHER_EMAIL = process.env.TEACHER_EMAIL || functions.config().notify?.teacher_email || GMAIL_USER;

// Gmail requires the "from" to be the authenticated user (or an alias on that account)
const FROM_ADDRESS = GMAIL_USER;

// Single reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
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

const APTIS_WRITING_PROJECT_ID = "aptis-writing";
const APTIS_WRITING_APP_NAME = "aptisWritingProject";

function getAptisWritingApp() {
  try {
    return admin.app(APTIS_WRITING_APP_NAME);
  } catch (error) {
    return admin.initializeApp({projectId: APTIS_WRITING_PROJECT_ID}, APTIS_WRITING_APP_NAME);
  }
}

function getAptisWritingDb() {
  return getFirestore(getAptisWritingApp());
}

function stripHtmlToText(html = "") {
  return String(html).replace(/<[^>]*>/g, " ");
}

function countWords(text = "") {
  const matches = String(text).trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function getWordCountFromHtml(html = "") {
  return countWords(stripHtmlToText(html));
}

function summarizeWritingSubmission(docSnap) {
  const data = docSnap.data() || {};
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
  if (!createdAt) return null;

  const answers = data.answers || {};
  const part1Answers = Array.isArray(answers[1]) ? answers[1] : [];
  const part2Answer = typeof answers[2] === "string" ? answers[2] : "";
  const part3Answers = Array.isArray(answers[3]) ? answers[3] : [];
  const part4Answers = Array.isArray(answers[4]) ? answers[4] : [];

  const part1Answered = part1Answers.filter((answer) => stripHtmlToText(answer).trim()).length;
  const part2Words = getWordCountFromHtml(part2Answer);
  const part3WordCounts = part3Answers.map((answer) => getWordCountFromHtml(answer));
  const part4WordCounts = part4Answers.map((answer) => getWordCountFromHtml(answer));
  const attemptedParts = [
    part1Answered > 0,
    part2Words > 0,
    part3WordCounts.some(Boolean),
    part4WordCounts.some(Boolean),
  ].filter(Boolean).length;
  const totalWords =
    part1Answers.reduce((sum, answer) => sum + getWordCountFromHtml(answer), 0) +
    part2Words +
    part3WordCounts.reduce((sum, value) => sum + value, 0) +
    part4WordCounts.reduce((sum, value) => sum + value, 0);

  return {
    id: `aptis-writing:${docSnap.id}`,
    userId: "__guest_aptis_writing_general__",
    userEmail: "Guest (Aptis Writing General)",
    type: "writing_general_submission",
    createdAt: createdAt.toISOString(),
    details: {
      submissionId: docSnap.id,
      attemptedParts,
      totalWords,
      part1Answered,
      part2Words,
      part3WordCounts,
      part4WordCounts,
      sourceCollection: "submissions",
      sourceProject: APTIS_WRITING_PROJECT_ID,
    },
  };
}

async function requireAdmin(req) {
  const header = req.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    throw Object.assign(new Error("Missing bearer token."), {statusCode: 401});
  }

  const decoded = await admin.auth().verifyIdToken(token);
  const userSnap = await admin.firestore().collection("users").doc(decoded.uid).get();
  if (!userSnap.exists || userSnap.data()?.role !== "admin") {
    throw Object.assign(new Error("Admin access required."), {statusCode: 403});
  }

  return decoded;
}


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

exports.adminAptisWritingSubmissions = functions.region("europe-west1").https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).send("");
    }

    try {
      if (req.method !== "GET") {
        res.set("Access-Control-Allow-Origin", "*");
        return res.status(405).json({error: "Method not allowed"});
      }

      await requireAdmin(req);

      const mode = String(req.query.mode || "recent");
      const db = getAptisWritingDb();
      let queryRef = db.collection("submissions");

      if (mode === "range") {
        const from = new Date(String(req.query.from || ""));
        const to = new Date(String(req.query.to || ""));

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
          res.set("Access-Control-Allow-Origin", "*");
          return res.status(400).json({error: "Invalid from/to date range."});
        }

        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);

        queryRef = queryRef
          .where("createdAt", ">=", Timestamp.fromDate(from))
          .where("createdAt", "<=", Timestamp.fromDate(to))
          .orderBy("createdAt", "asc");
      } else {
        const limitValue = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
        const before = String(req.query.before || "").trim();

        queryRef = queryRef.orderBy("createdAt", "desc");
        if (before) {
          const beforeDate = new Date(before);
          if (!Number.isNaN(beforeDate.getTime())) {
            queryRef = queryRef.where("createdAt", "<", Timestamp.fromDate(beforeDate));
          }
        }
        queryRef = queryRef.limit(limitValue);
      }

      const snap = await queryRef.get();
      const items = snap.docs
        .map((docSnap) => summarizeWritingSubmission(docSnap))
        .filter(Boolean);

      res.set("Access-Control-Allow-Origin", "*");
      return res.json({items});
    } catch (error) {
      console.error("[adminAptisWritingSubmissions] error", error);
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(error.statusCode || 500).json({
        error: error.message || "Could not load Aptis Writing General submissions.",
      });
    }
  });
});
