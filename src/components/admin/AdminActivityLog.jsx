// src/components/admin/AdminActivityLog.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
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
const CACHE_KEY_PREFIX = "admin-activity-log-cache-v3";
const CACHE_TTL_MS = 2 * 60 * 1000;
const DEFAULT_FILTERS = Object.freeze({ type: "all", user: "" });

function normalizeFilters(filters = DEFAULT_FILTERS) {
  const user = String(filters.user || "").trim();
  return {
    type: filters.type || "all",
    user: user.includes("@") ? user.toLowerCase() : user,
  };
}

function getCacheKey(filters) {
  const normalized = normalizeFilters(filters);
  return `${CACHE_KEY_PREFIX}:${encodeURIComponent(normalized.type)}:${encodeURIComponent(normalized.user)}`;
}

function getUserFilter(filters) {
  const user = normalizeFilters(filters).user;
  if (!user) return null;
  return user.includes("@")
    ? { field: "userEmail", value: user }
    : { field: "userId", value: user };
}

function shouldQueryActivity(filters) {
  return normalizeFilters(filters).type !== WRITING_GENERAL_SUBMISSION_TYPE;
}

function shouldQuerySubmissions(filters) {
  const type = normalizeFilters(filters).type;
  return type === "all" || type === WRITING_GENERAL_SUBMISSION_TYPE;
}

function buildSourceQuery(source, filters, { cursorDoc = null, newerThan = null } = {}) {
  const normalized = normalizeFilters(filters);
  const constraints = [];
  const userFilter = getUserFilter(normalized);

  if (source === "activityLog" && normalized.type !== "all") {
    constraints.push(where("type", "==", normalized.type));
  }
  if (userFilter) constraints.push(where(userFilter.field, "==", userFilter.value));
  if (newerThan) constraints.push(where("createdAt", ">", new Date(newerThan)));
  constraints.push(orderBy("createdAt", "desc"));
  if (cursorDoc) constraints.push(startAfter(cursorDoc));
  constraints.push(limit(PAGE_SIZE));

  return query(collection(db, source), ...constraints);
}

function mapActivityDocs(snapshot) {
  if (!snapshot) return [];
  return snapshot.docs
    .map((entry) => {
      const data = entry.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
      if (!createdAt) return null;
      return { id: entry.id, ...data, source: "activityLog", createdAt };
    })
    .filter(Boolean);
}

function mapSubmissionDocs(snapshot) {
  if (!snapshot) return [];
  return snapshot.docs.map(buildWritingGeneralSubmissionActivity).filter(Boolean);
}

function snapshotTimestamp(snapshot, position) {
  const entry = position === "first" ? snapshot?.docs?.[0] : snapshot?.docs?.[snapshot.docs.length - 1];
  return entry?.data()?.createdAt?.toMillis?.() || entry?.data()?.createdAt?.seconds * 1000 || null;
}

function serializeLog(log) {
  return {
    ...log,
    createdAt:
      log?.createdAt instanceof Date
        ? log.createdAt.toISOString()
        : log?.createdAt || null,
  };
}

function hydrateLog(log) {
  return {
    ...log,
    createdAt: log?.createdAt ? new Date(log.createdAt) : null,
  };
}

function readCache(filters) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(getCacheKey(filters));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.logs)) return null;
    if (Date.now() - Number(parsed.savedAt || 0) > CACHE_TTL_MS) return null;

    return {
      logs: parsed.logs.map(hydrateLog).filter((entry) => entry.createdAt instanceof Date && !Number.isNaN(entry.createdAt.getTime())),
      activityCursorId: parsed.activityCursorId || null,
      submissionCursorId: parsed.submissionCursorId || null,
      newestActivityValue: parsed.newestActivityValue || null,
      newestSubmissionValue: parsed.newestSubmissionValue || null,
      hasMoreActivity: !!parsed.hasMoreActivity,
      hasMoreSubmissions: !!parsed.hasMoreSubmissions,
    };
  } catch (error) {
    console.warn("[AdminActivityLog] Could not read cache", error);
    return null;
  }
}

function writeCache({
  filters,
  logs,
  activityCursorId,
  submissionCursorId,
  newestActivityValue,
  newestSubmissionValue,
  hasMoreActivity,
  hasMoreSubmissions,
}) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      getCacheKey(filters),
      JSON.stringify({
        savedAt: Date.now(),
        logs: (logs || []).map(serializeLog),
        activityCursorId: activityCursorId || null,
        submissionCursorId: submissionCursorId || null,
        newestActivityValue: newestActivityValue || null,
        newestSubmissionValue: newestSubmissionValue || null,
        hasMoreActivity: !!hasMoreActivity,
        hasMoreSubmissions: !!hasMoreSubmissions,
      })
    );
  } catch (error) {
    console.warn("[AdminActivityLog] Could not write cache", error);
  }
}

function clearCache(filters) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(getCacheKey(filters));
  } catch (error) {
    console.warn("[AdminActivityLog] Could not clear cache", error);
  }
}

  

export default function AdminActivityLog({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterEmail, setFilterEmail] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activityCursorDoc, setActivityCursorDoc] = useState(null);
  const [submissionCursorDoc, setSubmissionCursorDoc] = useState(null);
  const [activityCursorId, setActivityCursorId] = useState(null);
  const [submissionCursorId, setSubmissionCursorId] = useState(null);
  const [newestActivityValue, setNewestActivityValue] = useState(null);
  const [newestSubmissionValue, setNewestSubmissionValue] = useState(null);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadFilters = useCallback(async (nextFilters, { forceRefresh = false } = {}) => {
    const filters = normalizeFilters(nextFilters);
    setError("");

    const cached = forceRefresh ? null : readCache(filters);
    if (cached) {
      setLogs(cached.logs);
      setAppliedFilters(filters);
      setLoading(false);
      setUsingCache(true);
      setActivityCursorDoc(null);
      setSubmissionCursorDoc(null);
      setActivityCursorId(cached.activityCursorId);
      setSubmissionCursorId(cached.submissionCursorId);
      setNewestActivityValue(cached.newestActivityValue);
      setNewestSubmissionValue(cached.newestSubmissionValue);
      setHasMoreActivity(cached.hasMoreActivity);
      setHasMoreSubmissions(cached.hasMoreSubmissions);
      setHasMore(cached.hasMoreActivity || cached.hasMoreSubmissions);
      return;
    }

    setLoading(true);
    setUsingCache(false);
    setActivityCursorDoc(null);
    setSubmissionCursorDoc(null);
    setActivityCursorId(null);
    setSubmissionCursorId(null);

    try {
      const [activitySnap, submissionSnap] = await Promise.all([
        shouldQueryActivity(filters)
          ? getDocs(buildSourceQuery("activityLog", filters))
          : Promise.resolve(null),
        shouldQuerySubmissions(filters)
          ? getDocs(buildSourceQuery("submissions", filters))
          : Promise.resolve(null),
      ]);
      const nextLogs = [...mapActivityDocs(activitySnap), ...mapSubmissionDocs(submissionSnap)].sort(sortActivitiesByDateDesc);
      const nextActivityCursor = activitySnap?.docs?.[activitySnap.docs.length - 1] || null;
      const nextSubmissionCursor = submissionSnap?.docs?.[submissionSnap.docs.length - 1] || null;
      const moreActivity = !!activitySnap && activitySnap.docs.length === PAGE_SIZE;
      const moreSubmissions = !!submissionSnap && submissionSnap.docs.length === PAGE_SIZE;
      const newestActivity = snapshotTimestamp(activitySnap, "first");
      const newestSubmission = snapshotTimestamp(submissionSnap, "first");

      setLogs(nextLogs);
      setAppliedFilters(filters);
      setActivityCursorDoc(nextActivityCursor);
      setSubmissionCursorDoc(nextSubmissionCursor);
      setActivityCursorId(nextActivityCursor?.id || null);
      setSubmissionCursorId(nextSubmissionCursor?.id || null);
      setNewestActivityValue(newestActivity);
      setNewestSubmissionValue(newestSubmission);
      setHasMoreActivity(moreActivity);
      setHasMoreSubmissions(moreSubmissions);
      setHasMore(moreActivity || moreSubmissions);
      writeCache({
        filters,
        logs: nextLogs,
        activityCursorId: nextActivityCursor?.id || null,
        submissionCursorId: nextSubmissionCursor?.id || null,
        newestActivityValue: newestActivity,
        newestSubmissionValue: newestSubmission,
        hasMoreActivity: moreActivity,
        hasMoreSubmissions: moreSubmissions,
      });
    } catch (loadError) {
      console.error("[AdminActivityLog] Could not load activity", loadError);
      setError("Activity could not be loaded. Check the filters or Firestore indexes and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    void loadFilters(DEFAULT_FILTERS);
  }, [loadFilters, user]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");

    try {
      let resolvedActivityCursor = activityCursorDoc;
      let resolvedSubmissionCursor = submissionCursorDoc;
      if (hasMoreActivity && !resolvedActivityCursor && activityCursorId) {
        const cursorSnap = await getDoc(doc(db, "activityLog", activityCursorId));
        resolvedActivityCursor = cursorSnap.exists() ? cursorSnap : null;
      }
      if (hasMoreSubmissions && !resolvedSubmissionCursor && submissionCursorId) {
        const cursorSnap = await getDoc(doc(db, "submissions", submissionCursorId));
        resolvedSubmissionCursor = cursorSnap.exists() ? cursorSnap : null;
      }

      const [activitySnap, submissionSnap] = await Promise.all([
        hasMoreActivity && resolvedActivityCursor
          ? getDocs(buildSourceQuery("activityLog", appliedFilters, { cursorDoc: resolvedActivityCursor }))
          : Promise.resolve(null),
        hasMoreSubmissions && resolvedSubmissionCursor
          ? getDocs(buildSourceQuery("submissions", appliedFilters, { cursorDoc: resolvedSubmissionCursor }))
          : Promise.resolve(null),
      ]);
      const nextActivityCursor = activitySnap?.docs?.[activitySnap.docs.length - 1] || resolvedActivityCursor;
      const nextSubmissionCursor = submissionSnap?.docs?.[submissionSnap.docs.length - 1] || resolvedSubmissionCursor;
      const moreActivity = activitySnap ? activitySnap.docs.length === PAGE_SIZE : false;
      const moreSubmissions = submissionSnap ? submissionSnap.docs.length === PAGE_SIZE : false;

      setLogs((previous) => {
        const nextLogs = [...previous, ...mapActivityDocs(activitySnap), ...mapSubmissionDocs(submissionSnap)].sort(sortActivitiesByDateDesc);
        writeCache({
          filters: appliedFilters,
          logs: nextLogs,
          activityCursorId: nextActivityCursor?.id || activityCursorId,
          submissionCursorId: nextSubmissionCursor?.id || submissionCursorId,
          newestActivityValue,
          newestSubmissionValue,
          hasMoreActivity: moreActivity,
          hasMoreSubmissions: moreSubmissions,
        });
        return nextLogs;
      });
      setActivityCursorDoc(nextActivityCursor);
      setSubmissionCursorDoc(nextSubmissionCursor);
      setActivityCursorId(nextActivityCursor?.id || null);
      setSubmissionCursorId(nextSubmissionCursor?.id || null);
      setHasMoreActivity(moreActivity);
      setHasMoreSubmissions(moreSubmissions);
      setHasMore(moreActivity || moreSubmissions);
    } catch (loadMoreError) {
      console.error("[AdminActivityLog] Could not load more activity", loadMoreError);
      setError("More activity could not be loaded. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function refreshNow() {
    if (refreshing) return;
    setRefreshing(true);
    setError("");
    clearCache(appliedFilters);

    try {
      const [activitySnap, submissionSnap] = await Promise.all([
        shouldQueryActivity(appliedFilters)
          ? getDocs(buildSourceQuery("activityLog", appliedFilters, { newerThan: newestActivityValue }))
          : Promise.resolve(null),
        shouldQuerySubmissions(appliedFilters)
          ? getDocs(buildSourceQuery("submissions", appliedFilters, { newerThan: newestSubmissionValue }))
          : Promise.resolve(null),
      ]);
      const activityLogs = mapActivityDocs(activitySnap);
      const submissionLogs = mapSubmissionDocs(submissionSnap);
      const nextNewestActivityValue = snapshotTimestamp(activitySnap, "first") || newestActivityValue;
      const nextNewestSubmissionValue = snapshotTimestamp(submissionSnap, "first") || newestSubmissionValue;

      setLogs((prev) => {
        const seen = new Set(prev.map((entry) => `${entry.source}:${entry.id}`));
        const incoming = [...activityLogs, ...submissionLogs].filter((entry) => !seen.has(`${entry.source}:${entry.id}`));
        const nextLogs = [...incoming, ...prev].sort(sortActivitiesByDateDesc);
        writeCache({
          filters: appliedFilters,
          logs: nextLogs,
          activityCursorId,
          submissionCursorId,
          newestActivityValue: nextNewestActivityValue,
          newestSubmissionValue: nextNewestSubmissionValue,
          hasMoreActivity,
          hasMoreSubmissions,
        });
        return nextLogs;
      });
      setUsingCache(false);
      setNewestActivityValue(nextNewestActivityValue);
      setNewestSubmissionValue(nextNewestSubmissionValue);
    } catch (refreshError) {
      console.error("[AdminActivityLog] Could not refresh activity", refreshError);
      setError("Activity could not be refreshed. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  const filtersDirty = filterType !== appliedFilters.type || normalizeFilters({ type: filterType, user: filterEmail }).user !== appliedFilters.user;
  const sourceCounts = useMemo(() => logs.reduce((counts, log) => {
    if (log.source === "submissions") counts.submissions += 1;
    else counts.activityLog += 1;
    return counts;
  }, { activityLog: 0, submissions: 0 }), [logs]);

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  const goToProfile = (uid) => {
    navigate(`/teacher/student/${uid}`);
  };

  const typeOptions = getActivityTypeOptions();
  const renderLogUser = (log) =>
    log.userId && log.userId !== WRITING_GENERAL_GUEST_USER_ID ? (
      <button
        type="button"
        onClick={() => goToProfile(log.userId)}
        className="activity-log-user-btn"
      >
        {log.userLabel || log.userEmail || log.userId}
      </button>
    ) : (
      <span className="activity-log-user-text">
        {log.userLabel || log.userEmail || "Guest"}
      </span>
    );

  const renderLogDetails = (log) => {
    const text = formatActivityDetails(log) || "";
    const isMultiline = typeof text === "string" && text.includes("\n");

    return isMultiline ? (
      <pre className="activity-log-details-pre">{text}</pre>
    ) : (
      <span className="activity-log-details-text">{text}</span>
    );
  };

  return (
    <div className="admin-activity-log">
      <div className="activity-log-top-actions">
        <button className="review-btn" onClick={() => navigate("/admin")}>
          ← Back to Admin
        </button>

        <button className="review-btn" onClick={() => navigate("/admin/activity-charts")}>
          Raw event explorer
        </button>

        <button className="review-btn" onClick={() => navigate("/admin/activity-insights")}>
          Insights
        </button>
      </div>

      <h1 style={{ marginTop: "0.75rem" }}>Activity log</h1>
      <p className="muted small">
        Loaded {logs.length} matching events: {sourceCounts.activityLog} activity events and {sourceCounts.submissions} Writing General submissions.
        {usingCache ? " Using cached results." : ""}
      </p>
      <div className="activity-log-refresh-row">
        <button className="ghost-btn" type="button" onClick={refreshNow} disabled={refreshing || loading}>
          {refreshing ? "Refreshing..." : "Refresh now"}
        </button>
        <span className="muted small">
          Cached for 2 minutes per browser tab to avoid reloading the same log page repeatedly.
        </span>
      </div>

      {/* Simple filters */}
      <div
        className="activity-log-filters"
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
          <span className="tiny muted">Exact email or UID</span>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="name@example.com or UID"
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

        <button
          className="review-btn"
          type="button"
          onClick={() => void loadFilters({ type: filterType, user: filterEmail })}
          disabled={!filtersDirty || loading}
        >
          {loading ? "Applying…" : "Apply filters"}
        </button>

        {filtersDirty ? (
          <span className="muted small">Filters changed — apply them to query Firestore.</span>
        ) : (
          <span className="muted small">Filters applied. Results remain capped and paginated.</span>
        )}
      </div>

      {error ? <p role="alert" style={{ color: "#fca5a5" }}>{error}</p> : null}
      {loading && <p>Loading activity…</p>}

      {!loading && (
  <>
    <div className="activity-log-table-wrap">
      <table
        className="activity-log-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
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
                  Source
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
              {logs.map((log) => (
                <tr
                  key={`${log.source}:${log.id}`}
                  style={{
                    borderTop: "1px solid #1f2937",
                    verticalAlign: "top",
                  }}
                >
                  <td style={{ padding: "0.35rem 0.25rem", whiteSpace: "nowrap" }}>
                    {log.createdAt instanceof Date ? log.createdAt.toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    {renderLogUser(log)}
                  </td>
<td style={{ padding: "0.35rem 0.25rem" }}>
  <span className="badge subtle small">
    {log.source === "submissions" ? "Writing submission" : "Activity log"}
  </span>
</td>

<td style={{ padding: "0.35rem 0.25rem" }}>
  <span className="badge subtle small">
    {getActivityTypeLabel(log.type)}
  </span>
</td>

<td style={{ padding: "0.35rem 0.25rem" }}>
  {renderLogDetails(log)}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="activity-log-card-list">
          {logs.map((log) => (
            <article className="activity-log-card" key={`${log.source}:${log.id}`}>
              <div className="activity-log-card-head">
                <span className="badge subtle small">
                  {log.source === "submissions" ? "Writing submission" : "Activity log"}
                </span>
                <time>{log.createdAt instanceof Date ? log.createdAt.toLocaleString() : "—"}</time>
              </div>
              <div style={{ marginTop: "0.45rem" }}>
                <span className="badge subtle small">{getActivityTypeLabel(log.type)}</span>
              </div>
              <div className="activity-log-card-user">{renderLogUser(log)}</div>
              <div className="activity-log-card-details">{renderLogDetails(log)}</div>
            </article>
          ))}
        </div>
{/* ✅ PASTE THE LOAD MORE BLOCK HERE */}
<div className="activity-log-load-more">
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
