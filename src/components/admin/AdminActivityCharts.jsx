// src/components/admin/AdminActivityCharts.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {
  getActivityTypeLabel,
  getActivityTypeOptions,
  buildWritingGeneralSubmissionActivity,
  WRITING_GENERAL_SUBMISSION_TYPE,
} from "../../utils/adminActivity";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MAX_CHART_DAYS = 90;
const MAX_DOCS_PER_SOURCE = 5000;
const CHART_CACHE_TTL_MS = 5 * 60 * 1000;
const CHART_CACHE_PREFIX = "admin-activity-chart-cache-v1";

function chartCacheKey({ from, to, type }) {
  return `${CHART_CACHE_PREFIX}:${from}:${to}:${encodeURIComponent(type)}`;
}

function serializeChartLog(log) {
  return {
    ...log,
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
  };
}

function readChartCache(config) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(chartCacheKey(config));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.logs) || Date.now() - Number(parsed.savedAt || 0) > CHART_CACHE_TTL_MS) return null;
    return {
      logs: parsed.logs
        .map((log) => ({ ...log, createdAt: new Date(log.createdAt) }))
        .filter((log) => !Number.isNaN(log.createdAt.getTime())),
      truncated: !!parsed.truncated,
    };
  } catch (error) {
    console.warn("[AdminActivityCharts] Could not read cache", error);
    return null;
  }
}

function writeChartCache(config, logs, truncated) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(chartCacheKey(config), JSON.stringify({
      savedAt: Date.now(),
      logs: logs.map(serializeChartLog),
      truncated: !!truncated,
    }));
  } catch (error) {
    console.warn("[AdminActivityCharts] Could not write cache", error);
  }
}

function isoDate(d) {
  // Local YYYY-MM-DD (NOT UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfISOWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  x.setDate(x.getDate() + diff);
  return x;
}

function parseYMD(s) {
  // Interpret "YYYY-MM-DD" as a LOCAL date (midnight local time)
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function computeRows({ logs, from, to, groupBy }) {
  const counts = new Map();

  logs.forEach((it) => {
    const dt = it.createdAt;
    if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return;

    const key =
      groupBy === "week"
        ? `${isoDate(startOfISOWeek(dt))} (wk)`
        : isoDate(dt);

    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const points = [];

  if (groupBy === "day") {
    let cur = startOfDay(parseYMD(from));
    const end = endOfDay(parseYMD(to));
    while (cur <= end) {
      const key = isoDate(cur);
      points.push({ bucket: key, events: counts.get(key) || 0 });
      cur = addDays(cur, 1);
    }
  } else {
    let cur = startOfISOWeek(parseYMD(from));
    const end = endOfDay(parseYMD(to));
    while (cur <= end) {
      const key = `${isoDate(cur)} (wk)`;
      points.push({ bucket: key, events: counts.get(key) || 0 });
      cur = addDays(cur, 7);
    }
  }

  return points;
}

export default function AdminActivityCharts({ user }) {
  const navigate = useNavigate();
  const isAdmin = !!user && user.role === "admin";
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return isoDate(d);
  });
  const [to, setTo] = useState(() => isoDate(today));

  const [groupBy, setGroupBy] = useState("day"); // "day" | "week"
  const [typeFilter, setTypeFilter] = useState("all");
  const typeOptions = useMemo(() => getActivityTypeOptions(), []);

  // fetched logs for the current range/type
  const [rawLogs, setRawLogs] = useState([]); // [{ userId, userEmail, type, createdAt: Date, details }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedConfig, setLoadedConfig] = useState(null);
  const [usingCache, setUsingCache] = useState(false);
  const [truncated, setTruncated] = useState(false);

  // user drill-down
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);

  const chartFrom = loadedConfig?.from || from;
  const chartTo = loadedConfig?.to || to;
  const filtersDirty = !loadedConfig || from !== loadedConfig.from || to !== loadedConfig.to || typeFilter !== loadedConfig.type;

  // Chart rows derived from raw logs + selected user + groupBy
  const rows = useMemo(() => {
    const subset = selectedUserId
      ? rawLogs.filter((l) => l.userId === selectedUserId)
      : rawLogs;

    return computeRows({ logs: subset, from: chartFrom, to: chartTo, groupBy });
  }, [rawLogs, selectedUserId, chartFrom, chartTo, groupBy]);

  // Top users (leaderboard) derived from rawLogs
  const topUsers = useMemo(() => {
    const m = new Map(); // userId -> { userId, email, events, days:Set }
    rawLogs.forEach((l) => {
      const uid = l.userId || "unknown";
      const email = l.userLabel || l.userEmail || uid;

      if (!m.has(uid))
        m.set(uid, { userId: uid, email, events: 0, days: new Set() });
      const entry = m.get(uid);
      entry.events += 1;
      entry.days.add(isoDate(l.createdAt));
      if (entry.email === uid && (l.userLabel || l.userEmail)) entry.email = l.userLabel || l.userEmail;
    });

    return Array.from(m.values())
      .map((u) => ({ ...u, activeDays: u.days.size }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 10);
  }, [rawLogs]);

  // Breakdown by type for selected user
  const selectedUserBreakdown = useMemo(() => {
    if (!selectedUserId) return [];
    const counts = new Map();
    rawLogs
      .filter((l) => l.userId === selectedUserId)
      .forEach((l) => {
        counts.set(l.type, (counts.get(l.type) || 0) + 1);
      });

    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        label: getActivityTypeLabel(type),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rawLogs, selectedUserId]);

  const sourceCounts = useMemo(() => rawLogs.reduce((counts, log) => {
    if (log.source === "submissions") counts.submissions += 1;
    else counts.activityLog += 1;
    return counts;
  }, { activityLog: 0, submissions: 0 }), [rawLogs]);

  useEffect(() => {
    const term = userQuery.trim().toLowerCase();
    if (!isAdmin || term.length < 3) {
      setUserResults([]);
      setUserSearching(false);
      return undefined;
    }

    let cancelled = false;
    setUserSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const snap = await getDocs(query(
          collection(db, "users"),
          orderBy("email"),
          where("email", ">=", term),
          where("email", "<=", `${term}\uf8ff`),
          limit(10)
        ));
        if (!cancelled) {
          setUserResults(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        }
      } catch (searchError) {
        console.error("[AdminActivityCharts] User search failed", searchError);
        if (!cancelled) setError("User search could not be completed.");
      } finally {
        if (!cancelled) setUserSearching(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAdmin, userQuery]);

  function clearUser() {
    setSelectedUserId("");
    setSelectedUserEmail("");
  }

  function applyPreset(preset) {
    const now = new Date();
    let a = new Date(now);
    let b = new Date(now);

    if (preset === "7d") a = addDays(now, -6);
    if (preset === "30d") a = addDays(now, -29);
    if (preset === "90d") a = addDays(now, -89);

    if (preset === "thisMonth") {
      a = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (preset === "prevMonth") {
      const firstThis = new Date(now.getFullYear(), now.getMonth(), 1);
      b = addDays(firstThis, -1);
      a = new Date(b.getFullYear(), b.getMonth(), 1);
    }

    setFrom(isoDate(a));
    setTo(isoDate(b));
  }

  async function loadChart() {
    const fromD = startOfDay(parseYMD(from));
    const toD = endOfDay(parseYMD(to));
    const rangeDays = Math.floor((toD.getTime() - fromD.getTime()) / 86400000) + 1;

    setError("");
    if (fromD > toD) {
      setError("The From date must be before the To date.");
      return;
    }
    if (rangeDays > MAX_CHART_DAYS) {
      setError(`Choose a range of ${MAX_CHART_DAYS} days or fewer to control Firestore reads.`);
      return;
    }

    const config = { from, to, type: typeFilter };
    const cached = readChartCache(config);
    if (cached) {
      setRawLogs(cached.logs);
      setLoadedConfig(config);
      setUsingCache(true);
      setTruncated(cached.truncated);
      return;
    }

    setLoading(true);
    setUsingCache(false);

    const fromTs = Timestamp.fromDate(fromD);
    const toTs = Timestamp.fromDate(toD);

    const shouldLoadActivityLog = typeFilter === "all" || typeFilter !== WRITING_GENERAL_SUBMISSION_TYPE;
    const shouldLoadSubmissions = typeFilter === "all" || typeFilter === WRITING_GENERAL_SUBMISSION_TYPE;

    try {
      const activityPromise = shouldLoadActivityLog
        ? getDocs(
            typeFilter === "all"
              ? query(
                  collection(db, "activityLog"),
                  where("createdAt", ">=", fromTs),
                  where("createdAt", "<=", toTs),
                  orderBy("createdAt", "asc"),
                  limit(MAX_DOCS_PER_SOURCE + 1)
                )
              : query(
                  collection(db, "activityLog"),
                  where("type", "==", typeFilter),
                  where("createdAt", ">=", fromTs),
                  where("createdAt", "<=", toTs),
                  orderBy("createdAt", "asc"),
                  limit(MAX_DOCS_PER_SOURCE + 1)
                )
          )
        : Promise.resolve(null);

      const submissionsPromise = shouldLoadSubmissions
        ? getDocs(
            query(
              collection(db, "submissions"),
              where("createdAt", ">=", fromTs),
              where("createdAt", "<=", toTs),
              orderBy("createdAt", "asc"),
              limit(MAX_DOCS_PER_SOURCE + 1)
            )
          )
        : Promise.resolve(null);

      const [activitySnap, submissionsSnap] = await Promise.all([activityPromise, submissionsPromise]);
      const wasTruncated = (activitySnap?.docs.length || 0) > MAX_DOCS_PER_SOURCE ||
        (submissionsSnap?.docs.length || 0) > MAX_DOCS_PER_SOURCE;
      const activityRows = activitySnap
        ? activitySnap.docs.slice(0, MAX_DOCS_PER_SOURCE)
          .map((doc) => {
            const data = doc.data();
            const dt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
            if (!dt) return null;

            return {
              id: doc.id,
              userId: data.userId || "",
              userEmail: data.userEmail || "",
              userLabel: data.userLabel || data.userEmail || "",
              type: data.type || "",
              details: data.details || {},
              app: data.app || "",
              source: "activityLog",
              createdAt: dt,
            };
          })
          .filter(Boolean)
        : [];

      const submissionRows = submissionsSnap
        ? submissionsSnap.docs.slice(0, MAX_DOCS_PER_SOURCE)
          .map((docSnap) => buildWritingGeneralSubmissionActivity(docSnap))
          .filter(Boolean)
        : [];
      const nextLogs = [...activityRows, ...submissionRows];

      setRawLogs(nextLogs);
      setLoadedConfig(config);
      setTruncated(wasTruncated);
      writeChartCache(config, nextLogs, wasTruncated);
    } catch (chartError) {
      console.error("[AdminActivityCharts] Could not load chart", chartError);
      setError("Chart data could not be loaded. Check the date range or Firestore indexes and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "auto" }}>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button className="review-btn" onClick={() => navigate("/admin/activity")}>
  ← Back to Activity Log
</button>

        <button className="review-btn" onClick={() => navigate("/admin/activity-insights")}>
          Aggregate insights
        </button>

        {selectedUserId ? (
          <button className="review-btn" onClick={clearUser}>
            Clear user
          </button>
        ) : null}
      </div>

      <h1 style={{ marginTop: "0.75rem" }}>Activity charts</h1>
      <p className="muted small">
        Queries run only when you select Update chart, cover at most {MAX_CHART_DAYS} days, and are cached for five minutes per tab.
      </p>

      {/* Controls */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.75rem",
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
          <span className="tiny muted">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">Group</span>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">Type</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button className="review-btn" onClick={() => applyPreset("7d")}>
            Last 7
          </button>
          <button className="review-btn" onClick={() => applyPreset("30d")}>
            Last 30
          </button>
          <button className="review-btn" onClick={() => applyPreset("90d")}>
            Last 90
          </button>
          <button className="review-btn" onClick={() => applyPreset("thisMonth")}>
            This month
          </button>
          <button className="review-btn" onClick={() => applyPreset("prevMonth")}>
            Prev month
          </button>
        </div>

        <button className="review-btn" onClick={loadChart} disabled={loading}>
          {loading ? "Loading…" : "Update chart"}
        </button>

        <span className="muted small">
          {filtersDirty
            ? "Filters changed — update the chart to query Firestore."
            : usingCache
              ? "Showing cached results."
              : "Filters are up to date."}
        </span>
      </div>

      {error ? <p role="alert" style={{ color: "#fca5a5" }}>{error}</p> : null}
      {loadedConfig ? (
        <p className="muted small">
          Loaded {rawLogs.length} matching records: {sourceCounts.activityLog} activity events and {sourceCounts.submissions} Writing General submissions.
          {truncated ? ` Results were capped at ${MAX_DOCS_PER_SOURCE} documents per source to control reads.` : ""}
        </p>
      ) : null}

      {/* User panel */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1f2937",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <strong>User drill-down</strong>
          {selectedUserId ? (
            <span className="muted small">
              Selected: <strong>{selectedUserEmail || selectedUserId}</strong>
            </span>
          ) : (
            <span className="muted small">
              Select a user from “Top users” below.
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
  <span className="tiny muted">Find user</span>
  <input
    type="text"
    value={userQuery}
    onChange={(e) => setUserQuery(e.target.value)}
    placeholder="Type at least 3 characters…"
    style={{
      fontSize: "0.85rem",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      border: "1px solid #374151",
      backgroundColor: "#020617",
      color: "#e5e7eb",
      minWidth: "14rem",
    }}
  />
  <span className="muted small">{userSearching ? "Searching…" : ""}</span>
</div>

{userResults.length > 0 && (
  <div style={{ marginTop: "0.5rem", display: "grid", gap: "0.35rem" }}>
    {userResults.map((u) => (
      <button
        key={u.id}
        type="button"
        className="review-btn"
        onClick={() => {
          setSelectedUserId(u.id);
          setSelectedUserEmail(u.email || "");
          setUserResults([]);
          setUserQuery("");
        }}
        style={{ justifyContent: "space-between", display: "flex", gap: "0.75rem" }}
        title="Select user"
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {u.email || u.id}
        </span>
        <span className="muted small" style={{ whiteSpace: "nowrap" }}>
          select
        </span>
      </button>
    ))}
  </div>
)}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div
            style={{
              border: "1px solid #1f2937",
              borderRadius: "0.75rem",
              padding: "0.75rem",
            }}
          >
            <div className="muted small" style={{ marginBottom: "0.4rem" }}>
              Top users in current results
            </div>

            {!loadedConfig ? (
              <div className="muted small">Run “Update chart” first.</div>
            ) : rawLogs.length === 0 ? (
              <div className="muted small">No activity found in this range.</div>
            ) : topUsers.length === 0 ? (
              <div className="muted small">No user data found.</div>
            ) : (
              <div style={{ display: "grid", gap: "0.35rem" }}>
                {topUsers.map((u) => (
                  <button
                    key={u.userId}
                    type="button"
                    className="review-btn"
                    onClick={() => {
                      setSelectedUserId(u.userId);
                      setSelectedUserEmail(u.email);
                    }}
                    style={{
                      justifyContent: "space-between",
                      display: "flex",
                      gap: "0.75rem",
                      opacity: selectedUserId && selectedUserId !== u.userId ? 0.8 : 1,
                    }}
                    title="Click to filter chart to this user"
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </span>
                    <span className="muted small" style={{ whiteSpace: "nowrap" }}>
                      {u.events} · {u.activeDays} day{u.activeDays === 1 ? "" : "s"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              border: "1px solid #1f2937",
              borderRadius: "0.75rem",
              padding: "0.75rem",
            }}
          >
            <div className="muted small" style={{ marginBottom: "0.4rem" }}>
              Selected user breakdown
            </div>

            {!selectedUserId ? (
              <div className="muted small">
                Select a user to see breakdown by activity type.
              </div>
            ) : selectedUserBreakdown.length === 0 ? (
              <div className="muted small">
                No activity types found for this user in the current range.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.35rem" }}>
                {selectedUserBreakdown.map((r) => (
                  <div
                    key={r.type}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      borderBottom: "1px dashed rgba(255,255,255,0.08)",
                      paddingBottom: "0.25rem",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.label}
                    </span>
                    <span className="muted small" style={{ whiteSpace: "nowrap" }}>
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1f2937",
        }}
      >
        <div className="muted small" style={{ marginBottom: "0.5rem" }}>
          Showing <strong>{rows.length}</strong>{" "}
          {groupBy === "week" ? "weeks" : "days"}
          {!loadedConfig || loadedConfig.type === "all" ? "" : ` · ${getActivityTypeLabel(loadedConfig.type)}`}
          {selectedUserId ? ` · ${selectedUserEmail || selectedUserId}` : ""}
        </div>

        <div
          style={{
            width: "100%",
            height: 320,
            minHeight: 320,
            position: "relative",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.12)"
              />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.75)" }}
                interval="preserveStartEnd"
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.75)" }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  color: "white",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.8)" }}
              />
              <Bar dataKey="events" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
