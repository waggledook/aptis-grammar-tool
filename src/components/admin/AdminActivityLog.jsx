// src/components/admin/AdminActivityLog.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query, startAfter } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {
  formatActivityDetails,
  getActivityTypeLabel,
  getActivityTypeOptions,
  buildWritingGeneralSubmissionActivity,
  sortActivitiesByDateDesc,
  WRITING_GENERAL_GUEST_USER_ID,
  WRITING_GENERAL_SUBMISSION_TYPE,
} from "../../utils/adminActivity";

const PAGE_SIZE = 200;

  

export default function AdminActivityLog({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterEmail, setFilterEmail] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activityCursorDoc, setActivityCursorDoc] = useState(null);
  const [submissionCursorDoc, setSubmissionCursorDoc] = useState(null);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function load() {
      setLoading(true);
      setHasMore(true);
      setActivityCursorDoc(null);
      setSubmissionCursorDoc(null);

      const activityQuery = query(
        collection(db, "activityLog"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      const submissionQuery = query(
        collection(db, "submissions"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      const [activitySnap, submissionSnap] = await Promise.all([
        getDocs(activityQuery),
        getDocs(submissionQuery),
      ]);

      const activityLogs = activitySnap.docs
        .map((d) => {
          const data = d.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
          if (!createdAt) return null;

          return {
            id: d.id,
            ...data,
            createdAt,
          };
        })
        .filter(Boolean);

      const submissionLogs = submissionSnap.docs
        .map((docSnap) => buildWritingGeneralSubmissionActivity(docSnap))
        .filter(Boolean);

      setLogs([...activityLogs, ...submissionLogs].sort(sortActivitiesByDateDesc));

      const lastActivity = activitySnap.docs[activitySnap.docs.length - 1] || null;
      const lastSubmission = submissionSnap.docs[submissionSnap.docs.length - 1] || null;
      setActivityCursorDoc(lastActivity);
      setSubmissionCursorDoc(lastSubmission);
      setHasMoreActivity(activitySnap.docs.length === PAGE_SIZE);
      setHasMoreSubmissions(submissionSnap.docs.length === PAGE_SIZE);
      setHasMore(activitySnap.docs.length === PAGE_SIZE || submissionSnap.docs.length === PAGE_SIZE);

      setLoading(false);
    }

    load();
  }, [user]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
  
    setLoadingMore(true);

    const requests = [];

    if (hasMoreActivity && activityCursorDoc) {
      requests.push(
        getDocs(
          query(
            collection(db, "activityLog"),
            orderBy("createdAt", "desc"),
            startAfter(activityCursorDoc),
            limit(PAGE_SIZE)
          )
        )
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    if (hasMoreSubmissions && submissionCursorDoc) {
      requests.push(
        getDocs(
          query(
            collection(db, "submissions"),
            orderBy("createdAt", "desc"),
            startAfter(submissionCursorDoc),
            limit(PAGE_SIZE)
          )
        )
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    const [activitySnap, submissionSnap] = await Promise.all(requests);

    const nextActivityLogs = activitySnap
      ? activitySnap.docs
          .map((d) => {
            const data = d.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
            if (!createdAt) return null;

            return {
              id: d.id,
              ...data,
              createdAt,
            };
          })
          .filter(Boolean)
      : [];

    const nextSubmissionLogs = submissionSnap
      ? submissionSnap.docs
          .map((docSnap) => buildWritingGeneralSubmissionActivity(docSnap))
          .filter(Boolean)
      : [];

    setLogs((prev) =>
      [...prev, ...nextActivityLogs, ...nextSubmissionLogs].sort(sortActivitiesByDateDesc)
    );

    const lastActivity =
      activitySnap && activitySnap.docs.length
        ? activitySnap.docs[activitySnap.docs.length - 1]
        : activityCursorDoc;
    const lastSubmission =
      submissionSnap && submissionSnap.docs.length
        ? submissionSnap.docs[submissionSnap.docs.length - 1]
        : submissionCursorDoc;
    const moreActivity = activitySnap ? activitySnap.docs.length === PAGE_SIZE : hasMoreActivity;
    const moreSubmissions = submissionSnap
      ? submissionSnap.docs.length === PAGE_SIZE
      : hasMoreSubmissions;

    setActivityCursorDoc(lastActivity);
    setSubmissionCursorDoc(lastSubmission);
    setHasMoreActivity(moreActivity);
    setHasMoreSubmissions(moreSubmissions);
    setHasMore(moreActivity || moreSubmissions);
    setLoadingMore(false);
  }

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "all" && log.type !== filterType) return false;
    if (
      filterEmail &&
      !(log.userEmail || "").toLowerCase().includes(filterEmail.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const goToProfile = (uid) => {
    navigate(`/teacher/student/${uid}`);
  };

  const typeOptions = getActivityTypeOptions();

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <button className="review-btn" onClick={() => navigate("/admin")}>
        ← Back to Admin
      </button>

      <button className="review-btn" onClick={() => navigate("/admin/activity-charts")}>
  📊 Charts
</button>

      <h1 style={{ marginTop: "0.75rem" }}>Activity log</h1>
      <p className="muted small">
  Showing {logs.length} events (loaded in batches of {PAGE_SIZE}).
</p>

      {/* Simple filters */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1f2937",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">Type</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          >
            <option value="all">All types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">User email</span>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="filter by email"
            style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              minWidth: "10rem",
            }}
          />
        </div>
      </div>

      {loading && <p>Loading activity…</p>}

      {!loading && (
  <>
    <div style={{ marginTop: "1rem", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
          minWidth: 650,
        }}
      >
            <thead>
              <tr>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  When
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  User
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  Type
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderTop: "1px solid #1f2937",
                    verticalAlign: "top",
                  }}
                >
                  <td style={{ padding: "0.35rem 0.25rem", whiteSpace: "nowrap" }}>
                    {log.createdAt instanceof Date ? log.createdAt.toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    {log.userId && log.userId !== WRITING_GENERAL_GUEST_USER_ID ? (
                      <button
                        type="button"
                        onClick={() => goToProfile(log.userId)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          color: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        {log.userEmail || log.userId}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.85rem" }}>
                        {log.userEmail || "Guest"}
                      </span>
                    )}
                  </td>
                  {/* Type */}
<td style={{ padding: "0.35rem 0.25rem" }}>
  <span className="badge subtle small">
    {getActivityTypeLabel(log.type)}
  </span>
</td>

<td style={{ padding: "0.35rem 0.25rem" }}>
  {(() => {
    const text = formatActivityDetails(log) || "";
    const isMultiline = typeof text === "string" && text.includes("\n");

    return isMultiline ? (
      <pre
        style={{
          margin: 0,
          fontSize: "0.75rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          opacity: 0.85,
        }}
      >
        {text}
      </pre>
    ) : (
      <span className="tiny" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
        {text}
      </span>
    );
  })()}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
{/* ✅ PASTE THE LOAD MORE BLOCK HERE */}
<div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
<button
  className="review-btn"
  onClick={loadMore}
  disabled={!hasMore || loadingMore}
  style={{ opacity: !hasMore ? 0.6 : 1 }}
>
  {loadingMore ? "Loading…" : hasMore ? `Load ${PAGE_SIZE} more` : "No more results"}
</button>

<span className="muted small">
  {hasMore ? "More results available." : "You’ve reached the end."}
</span>
</div>
</>
)}

    </div>
  );
}
