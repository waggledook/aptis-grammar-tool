/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {buildSiteAccessEmail} = require("../site-access-email");

const access = {
  label: "Seif Hub",
  url: "https://seifhub.beeskillsenglish.com/",
  access: {startDate: "2026-07-20", endDate: "2026-11-06", indefinite: false},
};

test("new student email explains the signup and includes branded access details", () => {
  const email = buildSiteAccessEmail({
    displayName: "Lara García Navarro",
    changedAccesses: [access],
    isNewAccount: true,
    hasNewGrant: true,
    temporaryPassword: "sample-password",
  });

  assert.match(email.subject, /Seif English Academy/);
  assert.match(email.text, /ha creado tu cuenta de alumno/);
  assert.match(email.text, /You are receiving this email because/);
  assert.match(email.html, /20 de julio de 2026/);
  assert.match(email.html, /https:\/\/seifhub\.beeskillsenglish\.com\//);
  assert.match(email.html, /sample-password/);
  assert.match(email.html, /cid:seif-academy-logo@seifenglish\.com/);
  assert.ok(fs.existsSync(email.attachments[0].path));
});

test("date update email uses update copy and does not include a password", () => {
  const email = buildSiteAccessEmail({
    displayName: "Lara <script>alert(1)</script>",
    changedAccesses: [access],
    isNewAccount: false,
    hasNewGrant: false,
    temporaryPassword: null,
  });

  assert.match(email.subject, /hemos actualizado tu acceso/);
  assert.match(email.text, /ha actualizado las fechas de acceso/);
  assert.doesNotMatch(email.html, /Contraseña temporal/);
  assert.match(email.html, /Lara &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.html, /<script>/);
});
