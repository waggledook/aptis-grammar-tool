/* eslint-disable no-undef */
const path = require("path");

const LOGO_CID = "seif-academy-logo@seifenglish.com";
const LOGO_PATH = path.join(__dirname, "assets", "seif-academy-email-logo.png");
const SCHOOL_URL = "https://idiomasseif.com/";
const PLATFORM_URLS = [
  {label: "Aptis Trainer", url: "https://aptis-trainer.beeskillsenglish.com/"},
  {label: "Seif Hub", url: "https://seifhub.beeskillsenglish.com/"},
  {label: "OTE Seif", url: "https://ote-seif.beeskillsenglish.com/"},
];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPasswordResetEmail({displayName, temporaryPassword}) {
  const safeDisplayName = String(displayName || "").trim() || "estudiante";
  const platformText = PLATFORM_URLS
    .map(({label, url}) => `${label}: ${url}`)
    .join("\n");
  const platformHtml = PLATFORM_URLS
    .map(({label, url}) => (
      `<a href="${escapeHtml(url)}" style="color:#087ea9;font-weight:700;">` +
      `${escapeHtml(label)}</a>`
    ))
    .join(" &nbsp;·&nbsp; ");
  const subject = "Seif English Academy: hemos restablecido tu contraseña";
  const text = [
    `Hola ${safeDisplayName},`,
    "",
    "Hemos restablecido la contraseña de tu cuenta de Seif English Academy.",
    `Tu contraseña temporal es: ${temporaryPassword}`,
    "",
    "Inicia sesión en tu plataforma habitual y cambia esta contraseña inmediatamente desde Profile (Perfil) → Account & Security → Change password.",
    "",
    platformText,
    "",
    "Si no esperabas este cambio, responde a este correo para que podamos ayudarte.",
    "",
    "Seif English Academy · https://idiomasseif.com/",
    "",
    "ENGLISH SUMMARY",
    "We reset the password for your Seif English Academy account.",
    `Your temporary password is: ${temporaryPassword}`,
    "Sign in to your usual platform and change this password immediately from Profile → Account & Security → Change password.",
    "If you were not expecting this change, reply to this email so we can help.",
  ].join("\n");
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef5f8;font-family:Arial,Helvetica,sans-serif;color:#173144;">
  <div style="display:none;font-size:1px;line-height:1px;color:#eef5f8;max-height:0;max-width:0;opacity:0;overflow:hidden;">Hemos restablecido la contraseña de tu cuenta.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#eef5f8;"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#0c85b0;padding:24px 28px;">
        <img src="cid:${LOGO_CID}" alt="Seif English Academy" width="256" style="display:block;width:256px;max-width:100%;height:auto;border:0;">
      </td></tr>
      <tr><td style="padding:30px 30px 16px;">
        <p style="margin:0 0 10px;color:#087ea9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Tu cuenta de alumno · Student account</p>
        <h1 style="margin:0 0 24px;color:#153b50;font-size:28px;line-height:1.2;">Contraseña restablecida</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Hola ${escapeHtml(safeDisplayName)},</p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.65;">Hemos restablecido la contraseña de tu cuenta de Seif English Academy.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;border-left:4px solid #efa12c;background:#fffaf1;">
          <tr><td style="padding:16px 18px;color:#273d49;font-size:15px;line-height:1.6;">
            <strong>Contraseña temporal:</strong> <code>${escapeHtml(temporaryPassword)}</code><br>
            Por seguridad, cámbiala inmediatamente después de iniciar sesión.
          </td></tr>
        </table>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Abre tu plataforma habitual y ve a <strong>Profile (Perfil) → Account &amp; Security → Change password</strong>.</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.7;">${platformHtml}</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Si no esperabas este cambio, responde a este correo para que podamos ayudarte.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #d9e8ef;"><tr><td style="padding-top:22px;">
          <p style="margin:0 0 10px;color:#087ea9;font-size:12px;font-weight:700;letter-spacing:1.4px;">ENGLISH SUMMARY</p>
          <p style="margin:0 0 10px;color:#365767;font-size:14px;line-height:1.6;">We reset the password for your Seif English Academy account. Your temporary password is <code>${escapeHtml(temporaryPassword)}</code>.</p>
          <p style="margin:0 0 10px;color:#365767;font-size:14px;line-height:1.6;">Sign in to your usual platform and change it immediately from <strong>Profile → Account &amp; Security → Change password</strong>.</p>
          <p style="margin:0;color:#365767;font-size:14px;line-height:1.6;">If you were not expecting this change, reply to this email so we can help.</p>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:18px 30px 24px;background:#f7fbfd;color:#547080;font-size:13px;line-height:1.6;">
        Seif English Academy · <a href="${SCHOOL_URL}" style="color:#087ea9;">idiomasseif.com</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return {
    subject,
    text,
    html,
    attachments: [{filename: "seif-academy-logo.png", path: LOGO_PATH, cid: LOGO_CID}],
  };
}

module.exports = {buildPasswordResetEmail};
