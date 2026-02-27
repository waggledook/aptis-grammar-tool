// src/components/admin/AdminActivityCharts.jsx
import React, { useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit, // ✅ add
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Reuse your existing type labels (copy/paste from AdminActivityLog.jsx)
const typeLabels = {
  grammar_session: "Grammar session",
  vocab_set_completed: "Vocab set completed",
  grammar_set_completed: "Grammar set completed",
  live_game_played: "Live game played",
  writing_submitted: "Writing submitted",
  speaking_note_submitted: "Speaking note",
  reading_completed: "Reading activity",
  speaking_task_completed: "Speaking task",
  vocab_flashcards_session: "Vocab flashcards",
  vocab_match_session: "Vocab match",
  reading_guide_viewed: "Reading guide viewed",
  reading_guide_clue_reveal: "Reading guide clue revealed",
  reading_guide_reorder_check: "Reading guide check",
  reading_guide_show_answers: "Reading guide answers shown",
  reading_guide_reorder_completed: "Reading guide reorder completed",
  reading_reorder_completed: "Reading reorder completed",
  reading_part4_attempted: "Reading Part 4 attempt",
  reading_part4_completed: "Reading Part 4 completed",
  writing_p1_guide_activity_started: "Writing P1 guide activity started",
  writing_p4_register_guide_activity_started:
    "Writing P4 register guide activity started",
};

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

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return isoDate(d);
  });
  const [to, setTo] = useState(() => isoDate(today));

  const [groupBy, setGroupBy] = useState("day"); // "day" | "week"
  const [typeFilter, setTypeFilter] = useState("all");

  // fetched logs for the current range/type
  const [rawLogs, setRawLogs] = useState([]); // [{ userId, userEmail, type, createdAt: Date, details }]
  const [loading, setLoading] = useState(false);

  // user drill-down
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);

  // Chart rows derived from raw logs + selected user + groupBy
  const rows = useMemo(() => {
    const subset = selectedUserId
      ? rawLogs.filter((l) => l.userId === selectedUserId)
      : rawLogs;

    return computeRows({ logs: subset, from, to, groupBy });
  }, [rawLogs, selectedUserId, from, to, groupBy]);

  // Top users (leaderboard) derived from rawLogs
  const topUsers = useMemo(() => {
    const m = new Map(); // userId -> { userId, email, events, days:Set }
    rawLogs.forEach((l) => {
      const uid = l.userId || "unknown";
      const email = l.userEmail || uid;

      if (!m.has(uid))
        m.set(uid, { userId: uid, email, events: 0, days: new Set() });
      const entry = m.get(uid);
      entry.events += 1;
      entry.days.add(isoDate(l.createdAt));
      if (entry.email === uid && l.userEmail) entry.email = l.userEmail;
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
        label: typeLabels[type] || type,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rawLogs, selectedUserId]);

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

  async function searchUsers(input) {
    const term = input.trim().toLowerCase();
    setUserQuery(input);
  
    if (term.length < 2) {
      setUserResults([]);
      return;
    }
  
    setUserSearching(true);
  
    // Prefix search on users.email (works well if emails are stored lowercase)
    const qRef = query(
      collection(db, "users"),
      orderBy("email"),
      where("email", ">=", term),
      where("email", "<=", term + "\uf8ff"),
      limit(10)
    );
  
    const snap = await getDocs(qRef);
  
    setUserResults(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  
    setUserSearching(false);
  }

  async function loadChart() {
    setLoading(true);

    const fromD = startOfDay(parseYMD(from));
    const toD = endOfDay(parseYMD(to));

    const fromTs = Timestamp.fromDate(fromD);
    const toTs = Timestamp.fromDate(toD);

    let q;
    if (typeFilter === "all") {
      q = query(
        collection(db, "activityLog"),
        where("createdAt", ">=", fromTs),
        where("createdAt", "<=", toTs),
        orderBy("createdAt", "asc")
      );
    } else {
      // requires composite index: (type, createdAt)
      q = query(
        collection(db, "activityLog"),
        where("type", "==", typeFilter),
        where("createdAt", ">=", fromTs),
        where("createdAt", "<=", toTs),
        orderBy("createdAt", "asc")
      );
    }

    const snap = await getDocs(q);

    const arr = snap.docs
      .map((doc) => {
        const data = doc.data();
        const dt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        if (!dt) return null;

        return {
          id: doc.id,
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          type: data.type || "",
          details: data.details || {},
          createdAt: dt,
        };
      })
      .filter(Boolean);

    setRawLogs(arr);
    setLoading(false);
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

        {selectedUserId ? (
          <button className="review-btn" onClick={clearUser}>
            Clear user
          </button>
        ) : null}
      </div>

      <h1 style={{ marginTop: "0.75rem" }}>Activity charts</h1>
      <p className="muted small">
        Counts are aggregated client-side from activityLog for the selected date
        range.
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
            {Object.keys(typeLabels).map((t) => (
              <option key={t} value={t}>
                {typeLabels[t]}
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
      </div>

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
    onChange={(e) => searchUsers(e.target.value)}
    placeholder="Type email…"
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
          setUserQuery(u.email || "");
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

            {rawLogs.length === 0 ? (
              <div className="muted small">Run “Update chart” first.</div>
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
          {typeFilter === "all" ? "" : ` · ${typeLabels[typeFilter] || typeFilter}`}
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