/* eslint-disable no-undef */
// Recovered from the deployed emailAnyTestResults function, 26 October 2026.
// Keep the existing test notification and student-copy behaviour.
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a tolerant regex that matches straight or curly apostrophes interchangeably.
function buildAnswerRegex(ans) {
  const norm = (ans || '').trim();
  if (!norm) return null;
  const pattern = esc(norm).replace(/'/g, "[\\u2019']");
  try { return new RegExp(pattern, 'i'); } catch (e) {
    console.warn('Bad regex pattern for answer:', ans, e);
    return null;
  }
}


function createLegacyTestEmailHandler({transporter, fromAddress: FROM_ADDRESS, teacherEmail: TEACHER_EMAIL}) {
  return async (snapshot, context) => {
    const { testName, pushId } = context.params;
    // Live lobbies and PIN indexes are handled by emailLiveGameActivity.
    if (testName === "liveGames" || testName === "liveGamePins") return null;

    const {
      name,
      email,
      sentences = null,          // NEW structured sentences array
      answersText = null,        // NEW plain-text bundle
      answers = null,            // legacy multi-line text
      answersList = [],          // legacy flat list
      answersListPerBlock = null,
      timestamp = Date.now()
    } = snapshot.val() || {};

    const dateStr = new Date(timestamp).toLocaleString('en-GB', { timeZone: 'Europe/Madrid' });

    // Decide which sentence source to use
    let sentenceArray = Array.isArray(sentences) && sentences.length ? sentences.slice() : null;
    if (!sentenceArray) {
      // Legacy parsing path: break answers blob into numbered blocks.
      const blocks = typeof answers === 'string' ? answers.trim().split('\n\n') : [];
      sentenceArray = [];
      for (let i = 1; i < blocks.length; i++) {
        const parts = blocks[i].split('\n').filter(Boolean);
        const fullSentence = parts.length === 1 ? parts[0] : parts[parts.length - 1];
        sentenceArray.push(fullSentence);
      }
    }

    // Gather multi-gap answers (array-of-arrays) or fall back.
    const nested = Array.isArray(answersListPerBlock) ? answersListPerBlock : null;
    const flat   = Array.isArray(answersList) ? answersList : [];

    // Build HTML body with highlighted answers
    let htmlBody = `
      <h2 style="font-family:Arial,sans-serif;">New ${testName} Submission</h2>
      <p style="font-family:Arial,sans-serif;">
        <strong>Name:</strong> ${name || ''}<br>
        <strong>Email:</strong> ${email ? `<a href="mailto:${email}">${email}</a>` : ''}<br>
        <strong>Submitted at:</strong> ${dateStr}
      </p>
      <hr/>
      <div style="font-family:Arial,sans-serif;line-height:1.4;">
    `;

    sentenceArray.forEach((sentence, idx) => {
      let ansArr;
      if (nested && Array.isArray(nested[idx])) {
        ansArr = nested[idx];
      } else {
        ansArr = [flat[idx]];
      }
      ansArr = ansArr.map(a => (a || '').trim()).filter(Boolean);

      let highlighted = sentence;
      ansArr.forEach(ans => {
        const re = buildAnswerRegex(ans);
        if (!re) return;
        highlighted = highlighted.replace(re, m => `<span style="color:blue;font-weight:bold;">${m}</span>`);
      });

      htmlBody += `<p style="margin-bottom:1em;">${idx + 1}. ${highlighted}</p>`;
    });

    htmlBody += `</div>`;

    // Plain text fallback
    const textBody = answersText ||
      `Name: ${name}\nEmail: ${email}\nSubmitted at: ${dateStr}\n\n` +
      (sentenceArray.map((s,i)=>`${i+1}. ${s}`).join('\n'));

    const subject = `Test Submission (${testName}) — ${name || ''} — ${dateStr}`;

    // Build messages: one to teacher, optional copy to student
    const messages = [
      {
        from: FROM_ADDRESS,
        to: TEACHER_EMAIL || FROM_ADDRESS,
        subject,
        text: textBody,
        html: htmlBody,
        replyTo: email && email.includes('@') ? email : undefined,
      }
    ];
    if (email && email.includes('@')) {
      messages.push({
        from: FROM_ADDRESS,
        to: email,
        subject: `Copy – ${subject}`,
        text: textBody,
        html: htmlBody,
        replyTo: FROM_ADDRESS,
      });
    }

    try {
      for (const m of messages) { await transporter.sendMail(m); }
      await snapshot.ref.child('emailStatus').set('sent').catch(()=>{});
      console.log('MAIL_OK', { testName, pushId, sent: messages.length });
    } catch (err) {
      const msg = err?.response?.body || err?.message || String(err);
      console.error('MAIL_FAIL', msg);
      await snapshot.ref.child('emailError').set(msg).catch(()=>{});
    }

    return null;
  };
}

module.exports = {createLegacyTestEmailHandler};
