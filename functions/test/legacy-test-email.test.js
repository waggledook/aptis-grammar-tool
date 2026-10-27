/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const {createLegacyTestEmailHandler} = require("../legacy-test-email");

function harness(data = {}) {
  const messages = [];
  const writes = [];
  const handler = createLegacyTestEmailHandler({
    transporter: {sendMail: async (message) => messages.push(message)},
    fromAddress: "sender@example.com", teacherEmail: "admin@example.com",
  });
  return {messages, writes, invoke: (testName) => handler({val: () => data, ref: {child: (key) => ({set: async (value) => writes.push({key, value})})}}, {params: {testName, pushId: "submission-1"}})};
}

test("live games and their PIN indexes no longer generate test-submission emails", async () => {
  const h = harness();
  await h.invoke("liveGames");
  await h.invoke("liveGamePins");
  assert.deepEqual(h.messages, []);
  assert.deepEqual(h.writes, []);
});

test("existing structured grammar submissions retain admin email, highlights and student copy", async () => {
  const h = harness({name: "Ana", email: "ana@example.com", timestamp: Date.parse("2026-10-26T15:00:00Z"),
    sentences: ["If I were you, I would study."], answersListPerBlock: [["were", "would"]], answersText: "Existing plain-text answer bundle"});
  await h.invoke("secondConditionalTests");
  assert.equal(h.messages.length, 2);
  assert.equal(h.messages[0].to, "admin@example.com");
  assert.equal(h.messages[1].to, "ana@example.com");
  assert.match(h.messages[0].subject, /^Test Submission \(secondConditionalTests\) — Ana/);
  assert.equal(h.messages[0].text, "Existing plain-text answer bundle");
  assert.match(h.messages[0].html, /font-weight:bold;">were<\/span>/);
  assert.match(h.messages[0].html, /font-weight:bold;">would<\/span>/);
  assert.equal(h.messages[0].replyTo, "ana@example.com");
  assert.equal(h.messages[1].replyTo, "sender@example.com");
  assert.deepEqual(h.writes, [{key: "emailStatus", value: "sent"}]);
});

test("legacy answer blobs still parse and students without email receive no copy", async () => {
  const h = harness({name: "Guest", answers: "Header\n\n1.\nI have lived here for years.", answersList: ["have lived"]});
  await h.invoke("presentPerfectSimpleContTests");
  assert.equal(h.messages.length, 1);
  assert.match(h.messages[0].html, /font-weight:bold;">have lived<\/span>/);
});
