/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  resolveModelLabModels,
  estimateModelLabCost,
  summarizeModelLabEvaluations,
} = require("../aptis-writing-model-lab");

test("model selection rejects duplicate and unsupported models before a paid request", () => {
  for (const models of [[], ["gpt-6-luna"], ["gpt-6-luna", "gpt-6-luna"], ["gpt-6-luna", "arbitrary-model"], "gpt-6-luna", null]) {
    assert.throws(() => resolveModelLabModels(models), /two different models/);
  }
  const selected = ["gpt-6.2-sol", "gpt-5.6-luna"];
  assert.deepEqual(resolveModelLabModels(selected), selected);
  assert.notEqual(resolveModelLabModels(selected), selected);
  assert.deepEqual(resolveModelLabModels(), ["gpt-5.4-mini", "gpt-5.6-luna"]);
});

test("cost includes regular input, cache reads, both cache-write durations and reasoning once", () => {
  const usage = {
    input_tokens: 2000,
    input_tokens_details: {
      cached_tokens: 500,
      cache_write_tokens: 1000,
      cache_write_tokens_details: {ttl_30m_tokens: 600, ttl_12h_tokens: 400},
    },
    output_tokens: 1000,
    output_tokens_details: {reasoning_tokens: 300},
  };
  assert.equal(estimateModelLabCost("gpt-6.1-terra", usage), 0.007275);
  assert.equal(estimateModelLabCost("gpt-5.4-mini", usage), 0.0056625);
  assert.equal(estimateModelLabCost("unknown", usage), null);
});

test("cost accepts legacy cache fields and clamps overlapping token categories", () => {
  assert.equal(estimateModelLabCost("gpt-5.6-luna", {
    input_tokens: 1000,
    input_tokens_details: {cache_creation_tokens: 1000},
  }), 0.00025);
  assert.equal(estimateModelLabCost("gpt-6-luna", {
    input_tokens: 1000,
    input_tokens_details: {cached_tokens: 2000, cache_write_tokens: 3000},
  }), 0.00001);
});

test("summary preserves historical models and counts failed or unreviewed spend without awarding wins", () => {
  const summary = summarizeModelLabEvaluations([
    {
      status: "reviewed",
      outputs: {
        A: {model: "historical-model", ok: true, estimatedCostUsd: 0.01},
        B: {model: "gpt-5.6-luna", ok: true, estimatedCostUsd: 0.002},
      },
      review: {preference: "A", ratings: {A: {accuracy: 5, tone: 3}, B: {accuracy: 3}}},
    },
    {
      status: "pending_review",
      outputs: {
        A: {model: "gpt-6-luna", ok: false, estimatedCostUsd: 0.00446805},
        B: {model: "gpt-5.6-luna", ok: true, estimatedCostUsd: 0.003},
      },
      review: {preference: "B"},
    },
  ]);
  assert.equal(summary.reviewed, 1);
  assert.equal(summary.wins["historical-model"], 1);
  assert.equal(summary.wins["gpt-5.6-luna"], 0);
  assert.equal(summary.averageRating["historical-model"], 4);
  assert.equal(summary.reviewedComparisons["gpt-5.6-luna"], 1);
  assert.equal(summary.reviewedComparisons["gpt-6-luna"], 0);
  assert.equal(summary.failures["gpt-6-luna"], 1);
  assert.equal(summary.totalEstimatedCostUsd["gpt-6-luna"], 0.004468);
  assert.equal(summary.totalEstimatedCostUsd["gpt-5.6-luna"], 0.005);
});

function modelLabHarness(response) {
  const source = fs.readFileSync(path.join(__dirname, "../index.js"), "utf8");
  const between = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  const requests = [];
  const context = vm.createContext({
    OPENAI_API_KEY: "test-key",
    estimateModelLabCost,
    functions: {https: {HttpsError: Error}},
    fetch: async (_url, request) => {
      requests.push(JSON.parse(request.body));
      return {ok: true, json: async () => response};
    },
  });
  vm.runInContext([
    between("const APTIS_WRITING_PART4_FEEDBACK_SCHEMA =", "const OTE_WRITING_FEEDBACK_SCHEMA ="),
    between("function cleanString(", "function buildWritingFeedbackPrompt("),
    between("function getPart4WordCountStatus(", "async function requireAdminForModelLab("),
    between("function buildAptisWritingModelLabRequest(", "function modelLabCandidateFromSnapshot("),
    "globalThis.api = {buildAptisWritingModelLabRequest, runAptisWritingModelLabModel};",
  ].join("\n"), context);
  const config = context.api.buildAptisWritingModelLabRequest({
    kind: "part4",
    payload: {
      source: "The club will assign regular conversation partners.",
      friendPrompt: "Tell your friend how you feel.",
      formalPrompt: "Give your opinion and suggest an improvement.",
      friendEmail: {text: "Hi Sam, I like this idea. See you!"},
      formalEmail: {text: "Dear Organiser, I welcome the change and suggest weekly discussion topics. Kind regards, Alex"},
    },
  });
  return {api: context.api, config, requests};
}

test("lab uses the revised production grading scale and preserves the model's chosen level", async () => {
  const h = modelLabHarness({
    status: "completed", output_text: JSON.stringify({estimatedLevel: {label: "C1 range"}}),
    usage: {input_tokens: 1000, output_tokens: 500},
  });
  const result = await h.api.runAptisWritingModelLabModel("gpt-5.6-luna", h.config);
  assert.equal(result.ok, true);
  assert.equal(result.feedback.estimatedLevel.label, "C1 range");
  assert.equal(result.estimatedCostUsd, 0.0008);
  const request = h.requests[0];
  assert.equal(request.store, false);
  assert.equal(request.service_tier, "default");
  assert.ok(request.text.format.schema.properties.estimatedLevel.properties.label.enum.includes("C1 range"));
  for (const label of ["B1 range", "B2 range", "B2+/C1 range", "C1 range", "C1+ range"]) {
    const feedback = h.config.postprocess({estimatedLevel: {label}, informalEmail: {}, formalEmail: {}});
    assert.equal(feedback.estimatedLevel.label, label);
    assert.equal(feedback.formalEmail.wordCount, 14);
  }
});

test("truncated responses retain billable usage and are rejected even if partial JSON parses", async () => {
  const h = modelLabHarness({
    status: "incomplete", incomplete_details: {reason: "max_output_tokens"},
    output_text: "{}",
    usage: {
      input_tokens: 2945,
      input_tokens_details: {cache_write_tokens: 2942},
      output_tokens: 8200,
      output_tokens_details: {reasoning_tokens: 244},
    },
  });
  const result = await h.api.runAptisWritingModelLabModel("gpt-6-luna", h.config);
  assert.equal(result.ok, false);
  assert.match(result.error, /max_output_tokens/);
  assert.equal(result.usage.output_tokens, 8200);
  assert.equal(result.estimatedCostUsd, 0.00446805);
});

test("invalid JSON retains cost and usage for the reviewer", async () => {
  const h = modelLabHarness({
    status: "completed", output_text: "not JSON",
    usage: {input_tokens: 1000, output_tokens: 500},
  });
  const result = await h.api.runAptisWritingModelLabModel("gpt-6.1-terra", h.config);
  assert.equal(result.ok, false);
  assert.match(result.error, /invalid structured JSON/);
  assert.equal(result.estimatedCostUsd, 0.0035);
});
