/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const nodemailer = require("nodemailer");

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


