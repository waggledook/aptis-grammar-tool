import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listAptisWritingModelLabCandidates,
  runAptisWritingModelLabComparison,
  submitAptisWritingModelLabReview,
} from "../../firebase.js";
import { WRITING_PART2_TASKS } from "../writing/WritingPart2.jsx";
import { WRITING_PART3_TASKS } from "../writing/WritingPart3.jsx";
import { WRITING_PART4_TASKS } from "../writing/WritingPart4Emails.jsx";

const PART_LABELS = {
  part1: "Part 1 · short answers",
  part2: "Part 2 · form response",
  part3: "Part 3 · chat responses",
  part4: "Part 4 · emails",
};

const RATING_CRITERIA = [
  ["accuracy", "Accuracy", "Corrections are correct and do not invent errors."],
  ["taskUnderstanding", "Task understanding", "Feedback correctly identifies what the task required."],
  ["usefulSpecificity", "Useful specificity", "Advice is concrete, relevant, and actionable."],
  ["tone", "Tone", "Feedback is concise, encouraging, and suitable for the learner."],
];

const TASKS_BY_PART = {
  part2: WRITING_PART2_TASKS,
  part3: WRITING_PART3_TASKS,
  part4: WRITING_PART4_TASKS,
};

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function errorMessage(error, fallback) {
  const message = String(error?.message || fallback || "Something went wrong.")
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\([^)]*\)\.?$/, "");

  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FUNCTIONS_EMULATOR !== "true" &&
    (/^internal$/i.test(message) || /failed to fetch|network|cors/i.test(message))
  ) {
    return "The production Model Lab request failed. Reload the page and try Refresh sample once; if it still fails, the latest function invocation will be checked in Cloud Logging.";
  }

  return message;
}

function titleCase(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function findTask(candidate) {
  return TASKS_BY_PART[candidate?.kind]?.find((task) => task.id === candidate.taskId) || null;
}

function buildComparisonPayload(candidate) {
  if (!candidate) return null;
  if (candidate.kind === "part1") {
    return { kind: "part1", payload: { items: candidate.payload.items } };
  }

  const task = findTask(candidate);
  if (!task) return null;
  if (candidate.kind === "part2") {
    return {
      kind: "part2",
      payload: {
        part: "part2",
        taskId: task.id,
        title: task.title,
        context: task.context,
        prompt: task.prompt,
        answers: [{ text: candidate.payload.answerText, wordCount: candidate.payload.wordCount }],
      },
    };
  }
  if (candidate.kind === "part3") {
    return {
      kind: "part3",
      payload: {
        part: "part3",
        taskId: task.id,
        title: task.title,
        context: task.context,
        chats: task.chats,
        answers: candidate.payload.answers.map((text, index) => ({
          text,
          wordCount: candidate.payload.wordCounts[index],
        })),
      },
    };
  }
  if (candidate.kind === "part4") {
    return {
      kind: "part4",
      payload: {
        part: "part4",
        taskId: task.id,
        title: task.title,
        sourceTitle: task.sourceTitle,
        source: task.source,
        friendPrompt: task.friendPrompt,
        formalPrompt: task.formalPrompt,
        friendEmail: {
          text: candidate.payload.friendText,
          wordCount: candidate.payload.friendWordCount,
        },
        formalEmail: {
          text: candidate.payload.formalText,
          wordCount: candidate.payload.formalWordCount,
        },
      },
    };
  }
  return null;
}

function FeedbackTree({ value, depth = 0 }) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "object") {
    return <div style={{ color: "#dbe7ff", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{String(value)}</div>;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <div style={{ color: "#8296ba", fontStyle: "italic" }}>None</div>;
    return (
      <div style={{ display: "grid", gap: "0.55rem" }}>
        {value.map((entry, index) => (
          <div
            key={index}
            style={{
              padding: typeof entry === "object" ? "0.65rem" : "0 0 0 0.8rem",
              border: typeof entry === "object" ? "1px solid rgba(82, 112, 166, 0.32)" : 0,
              borderLeft: typeof entry === "object" ? undefined : "2px solid #4669a8",
              borderRadius: typeof entry === "object" ? "0.65rem" : 0,
              background: typeof entry === "object" ? "rgba(7, 16, 36, 0.45)" : undefined,
            }}
          >
            <FeedbackTree value={entry} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: depth ? "0.5rem" : "0.75rem" }}>
      {Object.entries(value).map(([key, entry]) => {
        if (entry === null || entry === undefined || entry === "" || (Array.isArray(entry) && !entry.length)) return null;
        return (
          <section key={key}>
            <div style={{ color: "#8fb7ff", fontSize: "0.76rem", fontWeight: 800, letterSpacing: "0.035em", marginBottom: "0.18rem" }}>
              {titleCase(key)}
            </div>
            <FeedbackTree value={entry} depth={depth + 1} />
          </section>
        );
      })}
    </div>
  );
}

function CandidatePreview({ candidate }) {
  if (!candidate) return null;
  const task = findTask(candidate);
  const answerStyle = {
    margin: 0,
    padding: "0.7rem 0.8rem",
    borderRadius: "0.7rem",
    background: "rgba(2, 6, 23, 0.58)",
    border: "1px solid rgba(71, 94, 135, 0.35)",
    color: "#e4edff",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  };

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {task ? (
        <div style={{ color: "#c9d8f4", lineHeight: 1.5 }}>
          <strong style={{ color: "#f7faff" }}>{task.title}</strong>
          {task.context ? <div style={{ marginTop: "0.3rem" }}>{task.context}</div> : null}
          {task.prompt ? <div style={{ marginTop: "0.35rem" }}>{task.prompt}</div> : null}
          {task.source ? <div style={{ marginTop: "0.45rem", whiteSpace: "pre-wrap" }}>{task.source}</div> : null}
        </div>
      ) : null}

      {candidate.kind === "part1"
        ? candidate.payload.items.map((item, index) => (
            <div key={item.id || index}>
              <div style={{ color: "#9eb2d5", fontSize: "0.82rem", marginBottom: "0.25rem" }}>{item.question}</div>
              <p style={answerStyle}>{item.answer}</p>
            </div>
          ))
        : null}
      {candidate.kind === "part2" ? <p style={answerStyle}>{candidate.payload.answerText}</p> : null}
      {candidate.kind === "part3"
        ? candidate.payload.answers.map((answer, index) => (
            <div key={index}>
              <div style={{ color: "#9eb2d5", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                {task?.chats?.[index]?.name ? `${task.chats[index].name}: ` : `Message ${index + 1}: `}
                {task?.chats?.[index]?.question || ""}
              </div>
              <p style={answerStyle}>{answer}</p>
            </div>
          ))
        : null}
      {candidate.kind === "part4" ? (
        <>
          <div>
            <div style={{ color: "#9eb2d5", fontSize: "0.82rem", marginBottom: "0.25rem" }}>{task?.friendPrompt || "Informal email"}</div>
            <p style={answerStyle}>{candidate.payload.friendText}</p>
          </div>
          <div>
            <div style={{ color: "#9eb2d5", fontSize: "0.82rem", marginBottom: "0.25rem" }}>{task?.formalPrompt || "Formal email"}</div>
            <p style={answerStyle}>{candidate.payload.formalText}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Summary({ summary }) {
  if (!summary) return null;
  const rows = ["gpt-5.4-mini", "gpt-5.6-luna"];
  return (
    <section style={panelStyle}>
      <h2 style={headingStyle}>Results so far</h2>
      <p style={mutedStyle}>{summary.reviewed || 0} blind comparison{summary.reviewed === 1 ? "" : "s"} reviewed.</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ color: "#91a7cc", textAlign: "left", fontSize: "0.78rem" }}>
              <th style={cellStyle}>Model</th><th style={cellStyle}>Preferred</th><th style={cellStyle}>Avg rating</th><th style={cellStyle}>Measured API spend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((model) => (
              <tr key={model} style={{ color: "#e6eeff", borderTop: "1px solid rgba(75, 99, 142, 0.3)" }}>
                <td style={cellStyle}><strong>{model}</strong></td>
                <td style={cellStyle}>{summary.wins?.[model] || 0}</td>
                <td style={cellStyle}>{summary.averageRating?.[model] ?? "—"} / 5</td>
                <td style={cellStyle}>${Number(summary.totalEstimatedCostUsd?.[model] || 0).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "0.6rem", color: "#91a7cc", fontSize: "0.82rem" }}>
        {summary.ties || 0} tie{summary.ties === 1 ? "" : "s"} · {summary.neither || 0} neither
      </div>
    </section>
  );
}

const panelStyle = {
  borderRadius: "1rem",
  border: "1px solid rgba(57, 86, 140, 0.58)",
  background: "linear-gradient(180deg, rgba(15, 27, 53, 0.97), rgba(7, 15, 32, 0.96))",
  padding: "1rem",
  boxShadow: "0 14px 30px rgba(0, 0, 0, 0.16)",
};
const headingStyle = { margin: 0, color: "#f7faff", fontSize: "1.08rem" };
const mutedStyle = { color: "#9eb2d5", lineHeight: 1.5 };
const cellStyle = { padding: "0.65rem 0.55rem" };
const selectStyle = {
  border: "1px solid #435b87",
  borderRadius: "0.65rem",
  background: "#0b1730",
  color: "#f0f5ff",
  padding: "0.55rem 0.65rem",
};

export default function AdminAiModelLab({ user }) {
  const navigate = useNavigate();
  const [partFilter, setPartFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState(null);
  const [preference, setPreference] = useState("");
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);
  const [ratings, setRatings] = useState({ A: {}, B: {} });
  const [falseCorrections, setFalseCorrections] = useState({ A: false, B: false });
  const [notes, setNotes] = useState("");
  const [reveal, setReveal] = useState(null);
  const usingFunctionsEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true";

  const selected = useMemo(() => candidates.find((candidate) => candidate.id === selectedId) || null, [candidates, selectedId]);
  const selectedPayload = useMemo(() => buildComparisonPayload(selected), [selected]);

  async function loadCandidates(kind = partFilter) {
    setLoading(true);
    setError("");
    try {
      const result = await listAptisWritingModelLabCandidates({ kind, limit: 25 });
      setCandidates(result?.candidates || []);
      setSummary(result?.summary || null);
      setSelectedId((current) => (result?.candidates || []).some((candidate) => candidate.id === current)
        ? current
        : result?.candidates?.[0]?.id || "");
    } catch (loadError) {
      setError(errorMessage(loadError, "Could not load historical writing."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") loadCandidates("all");
    // Initial admin-only load. Filter changes are handled by the selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  function resetReview() {
    setComparison(null);
    setPreference("");
    setShowDetailedRatings(false);
    setRatings({ A: {}, B: {} });
    setFalseCorrections({ A: false, B: false });
    setNotes("");
    setReveal(null);
    setError("");
  }

  async function runComparison() {
    if (!selected || !selectedPayload) return;
    setRunning(true);
    setError("");
    setComparison(null);
    setReveal(null);
    try {
      const result = await runAptisWritingModelLabComparison({
        ...selectedPayload,
        sourceCandidateId: selected.id,
        taskId: selected.taskId || "",
      });
      setComparison(result);
    } catch (runError) {
      setError(errorMessage(runError, "The comparison could not be generated."));
    } finally {
      setRunning(false);
    }
  }

  const detailedRatingsComplete = ["A", "B"].every((label) =>
    RATING_CRITERIA.every(([criterion]) => Number(ratings[label]?.[criterion]) >= 1)
  );
  const reviewComplete = !!preference && (!showDetailedRatings || detailedRatingsComplete);

  async function saveReview() {
    if (!comparison?.evaluationId || !reviewComplete) return;
    setSaving(true);
    setError("");
    try {
      const result = await submitAptisWritingModelLabReview({
        evaluationId: comparison.evaluationId,
        preference,
        ratings: showDetailedRatings ? ratings : null,
        falseCorrections,
        notes,
      });
      setReveal(result?.reveal || null);
      setSummary(result?.summary || summary);
    } catch (saveError) {
      setError(errorMessage(saveError, "The review could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  if (!user || user.role !== "admin") return <p>⛔ You do not have permission to view this page.</p>;

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button type="button" className="review-btn" onClick={() => navigate("/admin")}>← Admin dashboard</button>
        <div style={{ color: "#8ea8d4", fontSize: "0.82rem" }}>
          Admin only · student identities removed · no feedback credits used · Backend: {usingFunctionsEmulator ? "local emulator" : "deployed functions"}
        </div>
      </div>

      <header style={{ marginBottom: "1rem" }}>
        <div style={{ color: "#75a7ff", fontSize: "0.78rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Model Lab</div>
        <h1 style={{ color: "#f8fbff", margin: "0.3rem 0 0.4rem" }}>Blind Aptis Writing comparison</h1>
        <p style={{ ...mutedStyle, margin: 0, maxWidth: 800 }}>
          Replay saved student writing through GPT-5.4 mini and GPT-5.6 Luna using the production prompt and JSON schema. Score the two responses before the model names, speed, tokens, and cost are revealed.
        </p>
      </header>

      {error ? <div role="alert" style={{ ...panelStyle, borderColor: "#a6414a", color: "#ffd7dc", marginBottom: "1rem" }}>{error}</div> : null}

      <Summary summary={summary} />

      <section style={{ ...panelStyle, marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "0.8rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={headingStyle}>1. Choose a historical submission</h2>
            <p style={{ ...mutedStyle, marginBottom: 0 }}>Latest complete saved submissions are sampled across student accounts. Names and account IDs are not returned.</p>
          </div>
          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
            <select
              aria-label="Writing part"
              value={partFilter}
              style={selectStyle}
              onChange={(event) => {
                const kind = event.target.value;
                setPartFilter(kind);
                resetReview();
                loadCandidates(kind);
              }}
            >
              <option value="all">All writing parts</option>
              {Object.entries(PART_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="button" className="ghost-btn" style={{ marginLeft: 0 }} onClick={() => loadCandidates()} disabled={loading}>
              {loading ? "Loading…" : "Refresh sample"}
            </button>
          </div>
        </div>

        {loading ? <p style={mutedStyle}>Loading historical writing…</p> : !candidates.length ? <p style={mutedStyle}>No complete saved submissions were found for this filter.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 0.75fr) minmax(0, 1.7fr)", gap: "1rem", marginTop: "1rem" }} className="model-lab-source-grid">
            <div style={{ display: "grid", gap: "0.45rem", alignContent: "start", maxHeight: 560, overflowY: "auto", paddingRight: "0.25rem" }}>
              {candidates.map((candidate) => {
                const task = findTask(candidate);
                const usable = candidate.kind === "part1" || !!task;
                const active = candidate.id === selectedId;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    disabled={!usable}
                    onClick={() => { setSelectedId(candidate.id); resetReview(); }}
                    style={{
                      textAlign: "left",
                      padding: "0.7rem",
                      borderRadius: "0.7rem",
                      border: active ? "1px solid #79aaff" : "1px solid rgba(70, 94, 138, 0.4)",
                      background: active ? "rgba(45, 88, 166, 0.3)" : "rgba(6, 15, 33, 0.6)",
                      color: usable ? "#edf4ff" : "#7d8ba5",
                      cursor: usable ? "pointer" : "not-allowed",
                    }}
                  >
                    <strong>{PART_LABELS[candidate.kind]}</strong>
                    <span style={{ display: "block", fontSize: "0.8rem", color: active ? "#b8d2ff" : "#91a7cc", marginTop: "0.2rem" }}>
                      {task?.title || candidate.taskId || "Random Part 1 set"} · {candidate.wordCount} words
                    </span>
                    <span style={{ display: "block", fontSize: "0.73rem", color: "#7185aa", marginTop: "0.18rem" }}>{formatDate(candidate.createdAt)}</span>
                    {!usable ? <span style={{ display: "block", fontSize: "0.73rem", marginTop: "0.18rem" }}>Task is no longer in the current bank</span> : null}
                  </button>
                );
              })}
            </div>
            <div>
              <CandidatePreview candidate={selected} />
              <button type="button" className="review-btn" onClick={runComparison} disabled={!selectedPayload || running} style={{ marginTop: "1rem" }}>
                {running ? "Running both models…" : "Run blind comparison"}
              </button>
              {running ? <p style={{ ...mutedStyle, fontSize: "0.82rem", marginBottom: 0 }}>Part 4 can take a couple of minutes. Both requests are running at the same time.</p> : null}
            </div>
          </div>
        )}
      </section>

      {comparison ? (
        <>
          <section style={{ marginTop: "1rem" }}>
            <h2 style={{ ...headingStyle, marginBottom: "0.75rem" }}>2. Compare the feedback</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }} className="model-lab-comparison-grid">
              {["A", "B"].map((label) => {
                const option = comparison.options?.[label];
                return (
                  <article key={label} style={panelStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center", marginBottom: "0.8rem" }}>
                      <h3 style={{ margin: 0, color: "#fff" }}>Response {label}</h3>
                      <span style={{ color: "#92a9d0", fontSize: "0.78rem" }}>{reveal?.[label]?.model || "Model hidden"}</span>
                    </div>
                    {option?.ok ? <FeedbackTree value={option.feedback} /> : <p style={{ color: "#ffbdc4" }}>{option?.error || "This response failed."}</p>}
                  </article>
                );
              })}
            </div>
          </section>

          <section style={{ ...panelStyle, marginTop: "1rem" }}>
            <h2 style={headingStyle}>3. Record your blind verdict</h2>
            {reveal ? (
              <div>
                <p style={{ color: "#9ee6bc" }}>Review saved. The models are now revealed.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.8rem" }} className="model-lab-comparison-grid">
                  {["A", "B"].map((label) => (
                    <div key={label} style={{ padding: "0.8rem", borderRadius: "0.75rem", background: "rgba(4, 12, 28, 0.64)", color: "#e7efff" }}>
                      <strong>Response {label}: {reveal[label]?.model}</strong>
                      <div style={{ color: "#9fb4d9", marginTop: "0.35rem", fontSize: "0.84rem" }}>
                        {reveal[label]?.latencyMs ? `${(reveal[label].latencyMs / 1000).toFixed(1)}s` : "No latency"} · ${Number(reveal[label]?.estimatedCostUsd || 0).toFixed(5)} · {reveal[label]?.usage?.input_tokens || 0} input / {reveal[label]?.usage?.output_tokens || 0} output tokens
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="review-btn" style={{ marginTop: "0.9rem" }} onClick={() => { resetReview(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Test another submission</button>
              </div>
            ) : (
              <>
                <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.8rem", maxWidth: 420 }}>
                  <span style={{ color: "#cbd9f2", fontWeight: 700 }}>Which response is better overall?</span>
                  <select value={preference} onChange={(event) => setPreference(event.target.value)} style={selectStyle}>
                    <option value="">Choose a verdict…</option>
                    <option value="A">Response A</option><option value="B">Response B</option><option value="tie">Tie</option><option value="neither">Neither is acceptable</option>
                  </select>
                </label>

                <div style={{ marginTop: "0.85rem" }}>
                  <button
                    type="button"
                    className="ghost-btn"
                    style={{ marginLeft: 0 }}
                    onClick={() => setShowDetailedRatings((current) => !current)}
                  >
                    {showDetailedRatings ? "Hide detailed ratings" : "Add detailed ratings (optional)"}
                  </button>
                  <div style={{ color: "#869bc0", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                    The overall verdict is the only required score.
                  </div>
                </div>

                {showDetailedRatings ? (
                  <div style={{ overflowX: "auto", marginTop: "0.9rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                      <thead><tr style={{ color: "#91a7cc", textAlign: "left" }}><th style={cellStyle}>Criterion</th><th style={cellStyle}>Response A</th><th style={cellStyle}>Response B</th></tr></thead>
                      <tbody>
                        {RATING_CRITERIA.map(([criterion, label, description]) => (
                          <tr key={criterion} style={{ borderTop: "1px solid rgba(75, 99, 142, 0.3)" }}>
                            <td style={cellStyle}><strong style={{ color: "#edf3ff" }}>{label}</strong><div style={{ color: "#869bc0", fontSize: "0.78rem", marginTop: "0.15rem" }}>{description}</div></td>
                            {["A", "B"].map((option) => (
                              <td key={option} style={cellStyle}>
                                <select aria-label={`${label} for response ${option}`} value={ratings[option]?.[criterion] || ""} onChange={(event) => setRatings((current) => ({ ...current, [option]: { ...current[option], [criterion]: Number(event.target.value) } }))} style={selectStyle}>
                                  <option value="">—</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
                                </select>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.8rem", color: "#cbd9f2" }}>
                  {["A", "B"].map((label) => <label key={label}><input type="checkbox" checked={falseCorrections[label]} onChange={(event) => setFalseCorrections((current) => ({ ...current, [label]: event.target.checked }))} /> Response {label} invents or mislabels a correction</label>)}
                </div>
                <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.85rem" }}>
                  <span style={{ color: "#cbd9f2", fontWeight: 700 }}>Notes (optional)</span>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={4000} placeholder="What made one response better? Note any false corrections or missing task points." style={{ ...selectStyle, resize: "vertical" }} />
                </label>
                <button type="button" className="review-btn" onClick={saveReview} disabled={!reviewComplete || saving} style={{ marginTop: "0.85rem" }}>
                  {saving ? "Saving review…" : "Save verdict and reveal models"}
                </button>
              </>
            )}
          </section>
        </>
      ) : null}

      <style>{`
        @media (max-width: 820px) {
          .model-lab-source-grid, .model-lab-comparison-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
