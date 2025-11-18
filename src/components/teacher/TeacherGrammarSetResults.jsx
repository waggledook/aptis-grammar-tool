// src/components/teacher/TeacherGrammarSetResults.jsx
import React, { useEffect, useState } from "react";
import {
  listMyGrammarSets,
  listAttemptsForMyGrammarSet,
} from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";

export default function TeacherGrammarSetResults({ user }) {
  const [loadingSets, setLoadingSets] = useState(true);
  const [setsError, setSetsError] = useState(null);
  const [sets, setSets] = useState([]);

  // Which set is expanded
  const [activeSetId, setActiveSetId] = useState(null);

  // Per-set data: { [setId]: { loading, error, attempts, itemsById } }
  const [attemptState, setAttemptState] = useState({});

  // ───────────────── Load teacher's sets ─────────────────
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      setLoadingSets(true);
      setSetsError(null);
      try {
        const mySets = await listMyGrammarSets();
        if (!cancelled) {
          setSets(mySets);
        }
      } catch (err) {
        console.error("Error loading my grammar sets:", err);
        if (!cancelled) {
          setSetsError("Error loading your grammar sets.");
        }
      } finally {
        if (!cancelled) setLoadingSets(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return null; // TeacherTools already does the auth gate
  }

  const handleToggleSet = async (setId) => {
    // Collapse if already active
    if (activeSetId === setId) {
      setActiveSetId(null);
      return;
    }

    setActiveSetId(setId);

    // If we already loaded attempts for this set, don't refetch
    const existing = attemptState[setId];
    if (existing && existing.attempts) return;

    // Mark loading
    setAttemptState((prev) => ({
      ...prev,
      [setId]: { ...(prev[setId] || {}), loading: true, error: null },
    }));

    try {
      const attempts = await listAttemptsForMyGrammarSet(setId);

      // Collect all itemIds used in any attempt
      const allItemIds = Array.from(
        new Set(
          attempts.flatMap((att) =>
            Array.isArray(att.answers)
              ? att.answers
                  .map((a) => a.itemId)
                  .filter((id) => typeof id === "string" || typeof id === "number")
              : []
          )
        )
      );

      let itemsById = {};
      if (allItemIds.length) {
        const items = await fetchItemsByIds(allItemIds);
        itemsById = items.reduce((acc, itm) => {
          if (itm && itm.id != null) acc[itm.id] = itm;
          return acc;
        }, {});
      }

      setAttemptState((prev) => ({
        ...prev,
        [setId]: {
          loading: false,
          error: null,
          attempts,
          itemsById,
        },
      }));
    } catch (err) {
      console.error("Error loading attempts for grammar set:", err);
      setAttemptState((prev) => ({
        ...prev,
        [setId]: {
          ...(prev[setId] || {}),
          loading: false,
          error: "Error loading attempts for this set.",
        },
      }));
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : ts;
    try {
      return d.toLocaleString();
    } catch {
      return String(d);
    }
  };

  const shareUrlBase =
    typeof window !== "undefined" ? window.location.origin : "";

  // ───────────────── Render ─────────────────
  return (
    <section className="panel" style={{ marginTop: "1.5rem" }}>
      <h2 className="sec-title">My Grammar Sets &amp; Results</h2>
      <p className="muted small" style={{ marginBottom: ".75rem" }}>
        Here you can see the sets you’ve created and any student attempts.
      </p>

      {loadingSets && <p>Loading your sets…</p>}

      {setsError && (
        <p className="error-text small" style={{ marginBottom: ".75rem" }}>
          {setsError}
        </p>
      )}

      {!loadingSets && !setsError && sets.length === 0 && (
        <p className="muted small">
          You haven’t created any grammar sets yet. Use the builder above to
          make one, then share the link with your students.
        </p>
      )}

      {!loadingSets &&
        !setsError &&
        sets.map((set) => {
          const meta = set || {};
          const shareUrl = shareUrlBase
            ? `${shareUrlBase}/grammar-sets/${meta.id}`
            : `/grammar-sets/${meta.id}`;
          const metaAttempts = attemptState[meta.id] || {};
          const isActive = activeSetId === meta.id;

          return (
            <div
              key={meta.id}
              style={{
                borderTop: "1px solid #1f2937",
                paddingTop: ".75rem",
                marginTop: ".75rem",
              }}
            >
              {/* Header row for this set */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                    <h3
                      className="small"
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {meta.title || "Untitled set"}
                    </h3>
                    {meta.visibility && (
                      <span
                        className="badge"
                        style={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {meta.visibility}
                      </span>
                    )}
                  </div>

                  {meta.description && (
                    <p
                      className="muted small"
                      style={{
                        margin: "0.25rem 0 0.35rem",
                        maxWidth: "40rem",
                      }}
                    >
                      {meta.description}
                    </p>
                  )}

                  <p className="muted tiny" style={{ margin: 0 }}>
                    <strong>Items:</strong>{" "}
                    {Array.isArray(meta.itemIds) ? meta.itemIds.length : "—"}{" "}
                    &nbsp;·&nbsp;
                    <strong>Created:</strong> {formatDate(meta.createdAt)}
                  </p>

                  {/* Share link (same pattern as GrammarSetRunner) */}
                  <div
  className="small"
  style={{
    marginTop: ".4rem",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: ".5rem",
  }}
>
  <div
    style={{
      flex: "1 1 220px",
      minWidth: "180px",
      maxWidth: "360px",
      padding: "4px 10px",
      borderRadius: "999px",
      background: "#020617",
      border: "1px solid #1f2937",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "0.7rem",
    }}
    title={shareUrl} // full link on hover
  >
    <span className="muted tiny" style={{ opacity: 0.8 }}>
      Share link:&nbsp;
    </span>
    <span>{shareUrl}</span>
  </div>

  <button
    type="button"
    className="review-btn favourites"
    onClick={() => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareUrl);
      }
    }}
    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
  >
    Copy link
  </button>
                  </div>
                </div>

                <div>
                <button
  type="button"
  className="review-btn"
  onClick={() => handleToggleSet(meta.id)}
  style={{ padding: "8px 12px", fontSize: "0.8rem" }}
>
  {isActive ? "Hide attempts" : "View attempts"}
</button>
                </div>
              </div>

              {/* Attempts panel for this set */}
              {isActive && (
                <div
                  className="small"
                  style={{
                    marginTop: ".75rem",
                    padding: ".6rem .7rem",
                    borderRadius: "0.75rem",
                    background: "#020617",
                    border: "1px solid #1f2937",
                  }}
                >
                  {metaAttempts.loading && <p>Loading attempts…</p>}

                  {metaAttempts.error && (
                    <p className="error-text small">{metaAttempts.error}</p>
                  )}

                  {!metaAttempts.loading &&
                    !metaAttempts.error &&
                    (!metaAttempts.attempts ||
                      metaAttempts.attempts.length === 0) && (
                      <p className="muted small">
                        No student attempts recorded for this set yet.
                      </p>
                    )}

                  {!metaAttempts.loading &&
                    !metaAttempts.error &&
                    metaAttempts.attempts &&
                    metaAttempts.attempts.length > 0 && (
                      <>
                        <p
                          className="muted tiny"
                          style={{ marginBottom: ".5rem" }}
                        >
                          {metaAttempts.attempts.length} attempt
                          {metaAttempts.attempts.length === 1 ? "" : "s"} found.
                        </p>

                        <div
                          style={{
                            overflowX: "auto",
                            marginBottom: ".25rem",
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: "0.75rem",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  #
                                </th>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  Student
                                </th>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  Score
                                </th>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  %
                                </th>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  Submitted
                                </th>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.25rem 0.4rem",
                                    borderBottom: "1px solid #1f2937",
                                  }}
                                >
                                  Answers
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {metaAttempts.attempts.map((att, index) => {
                                const score = att.score ?? 0;
                                const total = att.total ?? 0;
                                const percent =
                                  typeof att.percent === "number"
                                    ? att.percent
                                    : total > 0
                                    ? Math.round((score / total) * 100)
                                    : 0;

                                const answers = Array.isArray(att.answers)
                                  ? att.answers
                                  : [];

                                const itemsById =
                                  metaAttempts.itemsById || {};

                                return (
                                  <tr key={att.id}>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      {index + 1}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      {att.studentEmail ||
                                        att.studentUid ||
                                        "Unknown"}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      {score}/{total}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      {percent}%
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      {formatDate(att.submittedAt)}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.4rem",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      <details>
  <summary
    className="review-btn"
    style={{
      cursor: "pointer",
      display: "inline-block",
      padding: "6px 10px",
      fontSize: "0.7rem",
    }}
  >
    View
  </summary>
                                        <ul
                                          style={{
                                            margin: "0.25rem 0 0",
                                            paddingLeft: "1.1rem",
                                          }}
                                        >
                                          {answers.map((ans, i) => {
                                            const item =
                                              itemsById[ans.itemId];
                                            const label =
                                              item?.sentence ||
                                              item?.text ||
                                              `Item ${ans.itemId}`;
                                            const isCorrect = !!ans.isCorrect;

                                            return (
                                              <li key={i} style={{ marginBottom: ".2rem" }}>
                                                <div>
                                                  <span className="muted tiny">
                                                    {label}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span
                                                    style={{
                                                      fontWeight: isCorrect
                                                        ? 600
                                                        : 400,
                                                      color: isCorrect
                                                        ? "#22c55e"
                                                        : "#f97316",
                                                    }}
                                                  >
                                                    Student:{" "}
                                                    {ans.selectedOption ??
                                                      "(no answer)"}
                                                  </span>
                                                  {!isCorrect && (
                                                    <span
                                                      className="muted tiny"
                                                      style={{ marginLeft: ".4rem" }}
                                                    >
                                                      Correct:{" "}
                                                      {ans.correctOption ??
                                                        "(unknown)"}
                                                    </span>
                                                  )}
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </details>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>
          );
        })}
    </section>
  );
}
