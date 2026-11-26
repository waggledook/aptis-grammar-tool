/* eslint-disable no-undef */
// Standard, short-context USD rates per million tokens, checked 26 November 2026.
const MODEL_LAB_PRICING_DATE = "2026-11-26";
const MODEL_LAB_PRICING_SOURCE = "https://developers.openai.com/api/docs/pricing";
const MODEL_LAB_CATALOG = [
  {id: "gpt-5.6-luna", label: "GPT-5.6 Luna", input: 0.2, cachedInput: 0.02, output: 1.2, cacheWriteInput: 0.25, cacheWrite12hInput: 0.5},
  {id: "gpt-6-luna", label: "GPT-6 Luna", input: 0.1, cachedInput: 0.01, output: 0.5, cacheWriteInput: 0.125, cacheWrite12hInput: 0.25},
  {id: "gpt-6.1-terra", label: "GPT-6.1 Terra", input: 1, cachedInput: 0.05, output: 5, cacheWriteInput: 1.25, cacheWrite12hInput: 2.5},
  {id: "gpt-6.2-sol", label: "GPT-6.2 Sol", input: 2, cachedInput: 0.1, output: 10, cacheWriteInput: 2.5, cacheWrite12hInput: 5},
  {id: "gpt-5.4-mini", label: "GPT-5.4 mini", input: 0.75, cachedInput: 0.075, output: 4.5},
];
const DEFAULT_MODEL_LAB_MODELS = ["gpt-5.6-luna", "gpt-6.1-terra"];
const LEGACY_MODEL_LAB_MODELS = ["gpt-5.4-mini", "gpt-5.6-luna"];

// Older frontends advertise a fixed pair and do not send a model selection.
function resolveModelLabModels(requested = LEGACY_MODEL_LAB_MODELS) {
  if (!Array.isArray(requested) || requested.length !== 2 ||
      requested[0] === requested[1] ||
      requested.some((id) => !MODEL_LAB_CATALOG.some((model) => model.id === id))) {
    throw new Error("Choose two different models from the Model Lab list.");
  }
  return [...requested];
}

function estimateModelLabCost(model, usage = {}) {
  const price = MODEL_LAB_CATALOG.find((entry) => entry.id === model);
  if (!price) return null;
  const tokens = (value) => Math.max(0, Number(value) || 0);
  const inputTokens = tokens(usage.input_tokens);
  const details = usage.input_tokens_details || {};
  const cachedTokens = Math.min(inputTokens, tokens(details.cached_tokens));
  const writeDetails = details.cache_write_tokens_details || {};
  const cacheWriteTokens = Math.min(inputTokens - cachedTokens, tokens(
    details.cache_write_tokens ?? details.cache_creation_tokens ??
    (tokens(writeDetails.ttl_30m_tokens) + tokens(writeDetails.ttl_12h_tokens))
  ));
  const cacheWrite12hTokens = Math.min(cacheWriteTokens, tokens(writeDetails.ttl_12h_tokens));
  const regularTokens = inputTokens - cachedTokens - cacheWriteTokens;
  // output_tokens already includes reasoning tokens; do not add them again.
  return Number(((
    regularTokens * price.input +
    cachedTokens * price.cachedInput +
    (cacheWriteTokens - cacheWrite12hTokens) * (price.cacheWriteInput || price.input) +
    cacheWrite12hTokens * (price.cacheWrite12hInput || price.input) +
    tokens(usage.output_tokens) * price.output
  ) / 1_000_000).toFixed(8));
}

function summarizeModelLabEvaluations(entries = []) {
  // Retain older models in historical results when the candidate list changes.
  const models = [...new Set([
    ...MODEL_LAB_CATALOG.map((model) => model.id),
    ...entries.flatMap((entry) => Object.values(entry.outputs || {}).map((output) => output?.model).filter(Boolean)),
  ])];
  const counters = (initial) => Object.fromEntries(models.map((model) => [model, initial]));
  const summary = {
    reviewed: 0, wins: counters(0), ties: 0, neither: 0,
    reviewedComparisons: counters(0), failures: counters(0),
    totalEstimatedCostUsd: counters(0), averageRating: counters(null),
  };
  const ratings = Object.fromEntries(models.map((model) => [model, []]));
  for (const entry of entries) {
    const reviewed = entry.status === "reviewed";
    if (reviewed) {
      summary.reviewed += 1;
      const preference = entry.review?.preference;
      if (preference === "tie") summary.ties += 1;
      else if (preference === "neither") summary.neither += 1;
      else {
        const winner = entry.outputs?.[preference]?.model;
        if (winner) summary.wins[winner] += 1;
      }
    }
    for (const [label, output] of Object.entries(entry.outputs || {})) {
      const model = output?.model;
      if (!model) continue;
      // Failed and unreviewed requests can still incur API charges.
      summary.totalEstimatedCostUsd[model] += Number(output.estimatedCostUsd || 0);
      if (!output.ok) summary.failures[model] += 1;
      if (reviewed) {
        summary.reviewedComparisons[model] += 1;
        for (const value of Object.values(entry.review?.ratings?.[label] || {})) {
          if (Number.isFinite(Number(value))) ratings[model].push(Number(value));
        }
      }
    }
  }
  for (const model of models) {
    summary.totalEstimatedCostUsd[model] = Number(summary.totalEstimatedCostUsd[model].toFixed(6));
    const values = ratings[model];
    summary.averageRating[model] = values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)) : null;
  }
  return summary;
}

module.exports = {
  MODEL_LAB_CATALOG,
  MODEL_LAB_PRICING_DATE,
  MODEL_LAB_PRICING_SOURCE,
  DEFAULT_MODEL_LAB_MODELS,
  resolveModelLabModels,
  estimateModelLabCost,
  summarizeModelLabEvaluations,
};
