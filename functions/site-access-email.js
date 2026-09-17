/* eslint-disable no-undef */
const path = require("path");

const LOGO_CID = "seif-academy-logo@seifenglish.com";
const LOGO_PATH = path.join(__dirname, "assets", "seif-academy-email-logo.png");
const SCHOOL_URL = "https://idiomasseif.com/";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function accessDates(access) {
  return {
    start: access.startDate ? formatDate(access.startDate) : "disponible ahora",
    end: access.indefinite
      ? "sin fecha de finalización"
      : access.endDate ? formatDate(access.endDate) : "por confirmar",
  };
}

function buildSiteAccessEmail({displayName, changedAccesses, isNewAccount, hasNewGrant,
  temporaryPassword}) {
  const isSingleAccess = changedAccesses.length === 1;
  const firstLabel = changedAccesses[0].label;
  const subject = isNewAccount
    ? "Seif English Academy: ya puedes acceder a tus plataformas"
    : hasNewGrant
      ? isSingleAccess
        ? `Seif English Academy: ya puedes acceder a ${firstLabel}`
        : "Seif English Academy: tienes nuevos accesos"
      : isSingleAccess
        ? `Seif English Academy: hemos actualizado tu acceso a ${firstLabel}`
        : "Seif English Academy: hemos actualizado tus accesos";
  const title = isNewAccount || hasNewGrant
    ? "Ya puedes acceder a tus plataformas"
    : "Hemos actualizado tus accesos";
  const reasonEs = isNewAccount
    ? "Recibes este correo porque Seif English Academy ha creado tu cuenta de alumno y ha activado tus recursos digitales."
    : hasNewGrant
      ? "Recibes este correo porque Seif English Academy ha activado un nuevo acceso para tu cuenta de alumno."
      : "Recibes este correo porque Seif English Academy ha actualizado las fechas de acceso de tu cuenta de alumno.";
  const reasonEn = isNewAccount
    ? "You are receiving this email because Seif English Academy created your student account and activated your online learning resources."
    : hasNewGrant
      ? "You are receiving this email because Seif English Academy activated new access for your student account."
      : "You are receiving this email because Seif English Academy updated the access dates for your student account.";
  const accessText = changedAccesses.map(({label, url, access}) => {
    const dates = accessDates(access);
    return `${label}\n${url}\nInicio: ${dates.start}\nFin: ${dates.end}`;
  }).join("\n\n");
  const passwordText = isNewAccount && temporaryPassword
    ? `\nContraseña temporal: ${temporaryPassword}\nCámbiala al entrar: abre Profile (Perfil) → Account & Security → Change password.\n`
    : "";
  const text = [
    `Hola ${displayName},`,
    "",
    reasonEs,
    "Estas plataformas son recursos de aprendizaje de la academia para practicar inglés y complementar tus clases.",
    "",
    accessText,
    "",
    "Entra con la dirección de correo electrónico en la que has recibido este mensaje.",
    ...(passwordText ? [passwordText.trim()] : []),
    "Si no esperabas este correo o tienes alguna duda, responde a este mensaje y te ayudaremos.",
    "",
    "Seif English Academy · https://idiomasseif.com/",
    "",
    "ENGLISH SUMMARY",
    reasonEn,
    "These are the academy's online resources for English practice alongside your classes. Open the platform links above and sign in with the email address that received this message.",
    ...(passwordText ? ["Your temporary password is shown above. Please change it after signing in."] : []),
    "If you were not expecting this email, simply reply and we will help.",
  ].join("\n");

  const accessHtml = changedAccesses.map(({label, url, access}) => {
    const dates = accessDates(access);
    return `
      <tr><td style="padding:0 0 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #d9e8ef;border-radius:12px;background:#f7fbfd;">
          <tr><td style="padding:20px 22px;">
            <p style="margin:0 0 8px;color:#143d51;font-size:19px;font-weight:700;">${escapeHtml(label)}</p>
            <p style="margin:0 0 16px;color:#466170;font-size:14px;line-height:1.6;">Inicio: ${escapeHtml(dates.start)}<br>Fin: ${escapeHtml(dates.end)}</p>
            <a href="${escapeHtml(url)}" style="display:inline-block;border-radius:7px;background:#efa12c;color:#173144;text-decoration:none;font-size:15px;font-weight:700;padding:12px 20px;">Entrar en ${escapeHtml(label)}</a>
            <p style="margin:12px 0 0;color:#547080;font-size:12px;word-break:break-all;">${escapeHtml(url)}</p>
          </td></tr>
        </table>
      </td></tr>`;
  }).join("");
  const passwordHtml = isNewAccount && temporaryPassword
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;border-left:4px solid #efa12c;background:#fffaf1;">
        <tr><td style="padding:16px 18px;color:#273d49;font-size:15px;line-height:1.6;">
          <strong>Contraseña temporal:</strong> <code>${escapeHtml(temporaryPassword)}</code><br>
          Cámbiala al entrar: abre <strong>Profile (Perfil) → Account &amp; Security → Change password</strong>.
        </td></tr></table>`
    : "";
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef5f8;font-family:Arial,Helvetica,sans-serif;color:#173144;">
  <div style="display:none;font-size:1px;line-height:1px;color:#eef5f8;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(reasonEs)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#eef5f8;"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#0c85b0;padding:24px 28px;">
        <img src="cid:${LOGO_CID}" alt="Seif English Academy" width="256" style="display:block;width:256px;max-width:100%;height:auto;border:0;">
      </td></tr>
      <tr><td style="padding:30px 30px 16px;">
        <p style="margin:0 0 10px;color:#087ea9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Tu cuenta de alumno · Student account</p>
        <h1 style="margin:0 0 24px;color:#153b50;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Hola ${escapeHtml(displayName)},</p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;">${escapeHtml(reasonEs)}</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.65;">Estas plataformas son recursos de aprendizaje de la academia para practicar inglés y complementar tus clases.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${accessHtml}</table>
        <p style="margin:4px 0 20px;font-size:15px;line-height:1.6;">Entra con la dirección de correo electrónico en la que has recibido este mensaje.</p>
        ${passwordHtml}
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Si no esperabas este correo o tienes alguna duda, responde a este mensaje y te ayudaremos.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #d9e8ef;"><tr><td style="padding-top:22px;">
          <p style="margin:0 0 10px;color:#087ea9;font-size:12px;font-weight:700;letter-spacing:1.4px;">ENGLISH SUMMARY</p>
          <p style="margin:0 0 10px;color:#365767;font-size:14px;line-height:1.6;">${escapeHtml(reasonEn)} These are the academy's online resources for English practice alongside your classes. Open the platform links above and sign in with the email address that received this message.</p>
          ${passwordText ? `<p style="margin:0 0 10px;color:#365767;font-size:14px;line-height:1.6;">Your temporary password is shown above. Please change it after signing in.</p>` : ""}
          <p style="margin:0;color:#365767;font-size:14px;line-height:1.6;">If you were not expecting this email, simply reply and we will help.</p>
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

module.exports = {buildSiteAccessEmail};
