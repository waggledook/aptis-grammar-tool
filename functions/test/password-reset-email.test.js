/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {buildPasswordResetEmail} = require("../password-reset-email");

test("password reset email includes the temporary password and next steps", () => {
  const email = buildPasswordResetEmail({
    displayName: "Lara García Navarro",
    temporaryPassword: "12345678",
  });

  assert.match(email.subject, /restablecido tu contraseña/);
  assert.match(email.text, /Tu contraseña temporal es: 12345678/);
  assert.match(email.text, /Your temporary password is: 12345678/);
  assert.match(email.html, /Account &amp; Security/);
  assert.match(email.html, /aptis-trainer\.beeskillsenglish\.com/);
  assert.match(email.html, /cid:seif-academy-logo@seifenglish\.com/);
  assert.ok(fs.existsSync(email.attachments[0].path));
});

test("password reset email escapes the display name", () => {
  const email = buildPasswordResetEmail({
    displayName: "Lara <script>alert(1)</script>",
    temporaryPassword: "12345678",
  });

  assert.match(email.html, /Lara &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.html, /<script>/);
});
