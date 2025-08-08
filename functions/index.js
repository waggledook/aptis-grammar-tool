/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const sgMail    = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

// no .runWith() here, just listen on the reports collection
exports.emailReport = functions.firestore
  .document("reports/{reportId}")
  .onCreate(async (snap) => {
    const {
      itemId,
      level = null,
      question = "",
      issue = "",
      comments = "",
      selectedOption = null,
      correctOption = null,
      userEmail = null,
      userId = null,
    } = snap.data();

    const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" });

    // Keep your original order/labels for the “copy of your report”
    const lines = [
      `Item: ${itemId}`,
      `Question: ${question}`,
      `Issue: ${issue}`,
      `Comments: ${comments || "none"}`,
      ...(level ? [`Level: ${level}`] : []),
      ...(selectedOption !== null ? [`User selected: ${selectedOption}`] : []),
      ...(correctOption !== null ? [`Correct answer: ${correctOption}`] : []),
      `Reported by: ${userEmail || "anonymous"}${userId ? ` (uid: ${userId})` : ""}`,
      `At: ${when}`,
    ];

    // Simple HTML escape
    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const toHtml = (arr) => arr.map(l => `<p>${esc(l)}</p>`).join("");

    // 1) Admin email (detailed)
    const adminMsg = {
      to: "contact@beeskillsenglish.com",
      from: '"Grammar Tool" <noreply@beeskillsenglish.com>',
      subject: `New report: ${issue} — ${itemId}`,
      text: lines.join("\n"),
      html: toHtml(lines),
      replyTo: userEmail || undefined,
    };

    // 2) User email (friendly), only if signed in
    const messages = [adminMsg];
    if (userEmail) {
      const userIntro = [
        "Thank you for your feedback! We will review the question as soon as possible.",
        "",
        "Here’s a copy of your report:"
      ];
      const userText = [...userIntro, ...lines].join("\n");
      const userHtml =
        `<p>Thank you for your feedback! We will review the question as soon as possible.</p>` +
        `<hr/>` +
        toHtml(lines);

      messages.push({
        to: userEmail,
        from: '"Grammar Tool" <noreply@beeskillsenglish.com>',
        subject: "Thanks for your feedback 🙌",
        text: userText,
        html: userHtml,
        replyTo: "contact@beeskillsenglish.com",
      });
    }

    // Send both (SendGrid supports an array)
    await sgMail.send(messages);
  });

