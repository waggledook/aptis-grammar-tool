import React, { useMemo, useState } from "react";
import {
  collection,
  documentId,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../firebase";
import { getActivityTypeLabel } from "../../utils/adminActivity";

const MAX_INSIGHT_DAYS = 366;
const INSIGHT_CACHE_TTL_MS = 5 * 60 * 1000;
const INSIGHT_CACHE_PREFIX = "admin-activity-insights-v1";

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function shiftDateKey(value, days) {
  const date = parseDateKey(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateRangeDays(from, to) {
  return Math.floor((parseDateKey(to) - parseDateKey(from)) / 86400000) + 1;
}

function insightCacheKey(config) {
  return `${INSIGHT_CACHE_PREFIX}:${config.from}:${config.to}`;
}

function readInsightCache(config) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(insightCacheKey(config));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - Number(parsed.savedAt || 0) > INSIGHT_CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.current) || !Array.isArray(parsed.previous)) return null;
    return parsed;
  } catch (error) {
    console.warn("[AdminActivityInsights] Could not read cache", error);
    return null;
  }
}

function writeInsightCache(config, current, previous) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(insightCacheKey(config), JSON.stringify({
      savedAt: Date.now(),
      current,
      previous,
    }));
  } catch (error) {
    console.warn("[AdminActivityInsights] Could not write cache", error);
  }
}

function numberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function activeUsersForDay(summary = {}) {
  if (summary.uniqueUsers != null) return numberValue(summary.uniqueUsers);
  return Math.max(
    0,
    numberValue(summary.uniqueAuthenticatedUsers) - numberValue(summary.uniqueAdminUsers)
  );
}

function buildDailyRows(summaries, from, to) {
  const summariesByDate = new Map(summaries.map((entry) => [entry.id, entry]));
  const rows = [];
  for (let date = from; date <= to; date = shiftDateKey(date, 1)) {
    const summary = summariesByDate.get(date) || {};
    rows.push({
      date,
      label: date.slice(5),
      users: activeUsersForDay(summary),
      events: numberValue(summary.totalEvents),
      userEvents: numberValue(summary.userEvents),
      completed: numberValue(summary.completedEvents),
      newUsers: numberValue(summary.newUsers),
      returningUsers: numberValue(summary.returningUsers),
      anonymousSubmissions: numberValue(summary.anonymousWritingSubmissions),
    });
  }
  return rows;
}

function sumRows(rows, key) {
  return rows.reduce((total, row) => total + numberValue(row[key]), 0);
}

function summarizeRows(rows) {
  const userDays = sumRows(rows, "users");
  const userEvents = sumRows(rows, "userEvents");
  const peak = rows.reduce(
    (best, row) => row.users > best.users ? row : best,
    {users: 0, date: ""}
  );
  return {
    averageDailyUsers: rows.length ? userDays / rows.length : 0,
    peakDailyUsers: peak.users,
    peakDate: peak.date,
    userDays,
    events: sumRows(rows, "events"),
    completed: sumRows(rows, "completed"),
    newUsers: sumRows(rows, "newUsers"),
    anonymousSubmissions: sumRows(rows, "anonymousSubmissions"),
    eventsPerUserDay: userDays ? userEvents / userDays : 0,
  };
}

function mergeMetricMap(summaries, field) {
  const totals = new Map();
  summaries.forEach((summary) => {
    Object.entries(summary[field] || {}).forEach(([key, value]) => {
      totals.set(key, (totals.get(key) || 0) + numberValue(value));
    });
  });
  return totals;
}

function titleFromKey(value) {
  return String(value || "unknown")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function comparisonText(current, previous, decimals = 0) {
  if (!previous) return current ? "New vs previous period" : "No previous data";
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(decimals)}% vs previous period`;
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numberValue(value));
}

function InsightCard({label, value, comparison, detail}) {
  return (
    <article className="admin-insight-card">
      <div className="admin-insight-card-label">{label}</div>
      <div className="admin-insight-card-value">{value}</div>
      <div className="admin-insight-card-comparison">{comparison}</div>
      {detail ? <div className="admin-insight-card-detail">{detail}</div> : null}
    </article>
  );
}

async function fetchDailySummaries(from, to) {
  const snapshot = await getDocs(query(
    collection(db, "adminAnalyticsDaily"),
    where(documentId(), ">=", from),
    where(documentId(), "<=", to),
    orderBy(documentId(), "asc")
  ));
  return snapshot.docs.map((entry) => ({id: entry.id, ...entry.data()}));
}

export default function AdminActivityInsights({user}) {
  const navigate = useNavigate();
  const isAdmin = !!user && user.role === "admin";
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return isoDate(date);
  });
  const [to, setTo] = useState(() => isoDate(new Date()));
  const [currentSummaries, setCurrentSummaries] = useState([]);
  const [previousSummaries, setPreviousSummaries] = useState([]);
  const [loadedConfig, setLoadedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [error, setError] = useState("");

  const filtersDirty = !loadedConfig || from !== loadedConfig.from || to !== loadedConfig.to;
  const currentRows = useMemo(() => loadedConfig
    ? buildDailyRows(currentSummaries, loadedConfig.from, loadedConfig.to)
    : [], [currentSummaries, loadedConfig]);
  const previousRows = useMemo(() => loadedConfig
    ? buildDailyRows(previousSummaries, loadedConfig.previousFrom, loadedConfig.previousTo)
    : [], [previousSummaries, loadedConfig]);
  const totals = useMemo(() => summarizeRows(currentRows), [currentRows]);
  const previousTotals = useMemo(() => summarizeRows(previousRows), [previousRows]);

  const featureRows = useMemo(() => {
    const eventTotals = mergeMetricMap(currentSummaries, "eventsByType");
    const userDayTotals = mergeMetricMap(currentSummaries, "usersByType");
    return Array.from(eventTotals.entries())
      .map(([type, events]) => ({
        type,
        label: getActivityTypeLabel(type),
        events,
        userDays: userDayTotals.get(type) || 0,
      }))
      .sort((a, b) => b.userDays - a.userDays || b.events - a.events)
      .slice(0, 15);
  }, [currentSummaries]);

  const funnelRows = useMemo(() => {
    const eventTotals = mergeMetricMap(currentSummaries, "eventsByType");
    return Array.from(eventTotals.entries())
      .filter(([type]) => type.endsWith("_started") || type.endsWith("_attempted"))
      .map(([startType, starts]) => {
        const suffix = startType.endsWith("_started") ? "_started" : "_attempted";
        const completedType = `${startType.slice(0, -suffix.length)}_completed`;
        const completions = eventTotals.get(completedType) || 0;
        return {
          startType,
          label: getActivityTypeLabel(startType).replace(/ (Started|Attempt)$/i, ""),
          starts,
          completions,
          rate: starts ? (completions / starts) * 100 : 0,
        };
      })
      .sort((a, b) => b.starts - a.starts)
      .slice(0, 10);
  }, [currentSummaries]);

  const appRows = useMemo(() => {
    const events = mergeMetricMap(currentSummaries, "eventsByApp");
    const userDays = mergeMetricMap(currentSummaries, "usersByApp");
    return Array.from(events.entries())
      .map(([app, count]) => ({
        app,
        label: titleFromKey(app),
        events: count,
        userDays: userDays.get(app) || 0,
      }))
      .sort((a, b) => b.events - a.events);
  }, [currentSummaries]);

  const sourceRows = useMemo(() => Array.from(
    mergeMetricMap(currentSummaries, "sourceCounts").entries()
  ).map(([source, count]) => ({source, count}))
    .sort((a, b) => b.count - a.count), [currentSummaries]);

  function applyPreset(days) {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    setFrom(isoDate(start));
    setTo(isoDate(end));
  }

  async function loadInsights({bypassCache = false} = {}) {
    const days = dateRangeDays(from, to);
    setError("");
    if (from > to) {
      setError("The From date must be before the To date.");
      return;
    }
    if (days > MAX_INSIGHT_DAYS) {
      setError(`Choose a range of ${MAX_INSIGHT_DAYS} days or fewer.`);
      return;
    }

    const previousTo = shiftDateKey(from, -1);
    const previousFrom = shiftDateKey(previousTo, -(days - 1));
    const config = {from, to, previousFrom, previousTo};
    const cached = bypassCache ? null : readInsightCache(config);
    if (cached) {
      setCurrentSummaries(cached.current);
      setPreviousSummaries(cached.previous);
      setLoadedConfig(config);
      setUsingCache(true);
      return;
    }

    setLoading(true);
    setUsingCache(false);
    try {
      const [current, previous] = await Promise.all([
        fetchDailySummaries(from, to),
        fetchDailySummaries(previousFrom, previousTo),
      ]);
      setCurrentSummaries(current);
      setPreviousSummaries(previous);
      setLoadedConfig(config);
      writeInsightCache(config, current, previous);
    } catch (loadError) {
      console.error("[AdminActivityInsights] Could not load summaries", loadError);
      setError("Analytics summaries could not be loaded. Check the deployed rules and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) return <p>⛔ You do not have permission to view this page.</p>;

  return (
    <main className="admin-activity-insights">
      <div className="admin-insights-actions">
        <button className="review-btn" onClick={() => navigate("/admin/activity")}>← Activity log</button>
        <button className="review-btn" onClick={() => navigate("/admin/activity-charts")}>Raw event explorer</button>
      </div>

      <h1>Activity insights</h1>
      <p className="muted small">
        Exact daily user counts from compact server-maintained summaries. Known admin accounts are excluded from the primary user metric.
      </p>
      <p className="admin-insights-notice">
        Collection starts with the Phase 2 deployment. Historical activity has not been automatically backfilled, protecting against a large one-off read bill.
      </p>

      <section className="admin-insights-controls" aria-label="Analytics date controls">
        <label><span>From</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span>To</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <div className="admin-insights-presets">
          <button className="review-btn" onClick={() => applyPreset(7)}>Last 7</button>
          <button className="review-btn" onClick={() => applyPreset(30)}>Last 30</button>
          <button className="review-btn" onClick={() => applyPreset(90)}>Last 90</button>
        </div>
        <button className="review-btn" onClick={() => loadInsights()} disabled={loading}>
          {loading ? "Loading…" : "Update insights"}
        </button>
        {loadedConfig && !filtersDirty ? (
          <button className="ghost-btn" onClick={() => loadInsights({bypassCache: true})} disabled={loading}>
            Refresh summaries
          </button>
        ) : null}
        <span className="muted small">
          {filtersDirty ? "Dates changed — update to query summaries." : usingCache ? "Showing five-minute cached results." : "Dates are up to date."}
        </span>
      </section>

      {error ? <p className="admin-insights-error" role="alert">{error}</p> : null}
      {loadedConfig ? (
        <p className="muted small">
          Returned {currentSummaries.length} daily documents for this period and {previousSummaries.length} for the comparison period ({loadedConfig.previousFrom} to {loadedConfig.previousTo}).
        </p>
      ) : null}

      {loadedConfig ? (
        <>
          <section className="admin-insights-card-grid" aria-label="Key activity metrics">
            <InsightCard label="Average users per day" value={formatNumber(totals.averageDailyUsers, 1)} comparison={comparisonText(totals.averageDailyUsers, previousTotals.averageDailyUsers, 1)} detail="Distinct non-admin UIDs each day" />
            <InsightCard label="Peak daily users" value={formatNumber(totals.peakDailyUsers)} comparison={comparisonText(totals.peakDailyUsers, previousTotals.peakDailyUsers)} detail={totals.peakDate || "No activity yet"} />
            <InsightCard label="New active users" value={formatNumber(totals.newUsers)} comparison={comparisonText(totals.newUsers, previousTotals.newUsers)} detail="Account created and active that day" />
            <InsightCard label="Total events" value={formatNumber(totals.events)} comparison={comparisonText(totals.events, previousTotals.events)} detail="All sources, including anonymous submissions" />
            <InsightCard label="Completed events" value={formatNumber(totals.completed)} comparison={comparisonText(totals.completed, previousTotals.completed)} detail="Completed, submitted, finished or played" />
            <InsightCard label="Events per user-day" value={formatNumber(totals.eventsPerUserDay, 1)} comparison={comparisonText(totals.eventsPerUserDay, previousTotals.eventsPerUserDay, 1)} detail={`${formatNumber(totals.userDays)} active user-days`} />
            <InsightCard label="Anonymous writing submissions" value={formatNumber(totals.anonymousSubmissions)} comparison={comparisonText(totals.anonymousSubmissions, previousTotals.anonymousSubmissions)} detail="Counted as submissions, not guessed users" />
          </section>

          <section className="admin-insights-panel">
            <h2>Daily users and activity</h2>
            <p>Users are distinct non-admin Firebase UIDs. Events use the separate left axis.</p>
            <div className="admin-insights-chart">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={currentRows} margin={{top: 10, right: 15, left: 0, bottom: 25}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="label" angle={-35} textAnchor="end" height={48} tick={{fontSize: 11}} />
                  <YAxis yAxisId="events" allowDecimals={false} tick={{fontSize: 11}} />
                  <YAxis yAxisId="users" orientation="right" allowDecimals={false} tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{background: "#0b1220", border: "1px solid #334155", borderRadius: 10}} />
                  <Legend />
                  <Bar yAxisId="events" dataKey="events" name="Events" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="users" type="monotone" dataKey="users" name="Individual users" stroke="#34d399" strokeWidth={3} dot={{r: 2}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="admin-insights-two-column">
            <section className="admin-insights-panel">
              <h2>Feature reach</h2>
              <p>Active user-days count each person once per feature per day.</p>
              {featureRows.length ? (
                <div className="admin-insights-table-wrap"><table className="admin-insights-table">
                  <thead><tr><th>Feature</th><th>User-days</th><th>Events</th><th>Events/user-day</th></tr></thead>
                  <tbody>{featureRows.map((row) => <tr key={row.type}><td>{row.label}</td><td>{formatNumber(row.userDays)}</td><td>{formatNumber(row.events)}</td><td>{row.userDays ? formatNumber(row.events / row.userDays, 1) : "—"}</td></tr>)}</tbody>
                </table></div>
              ) : <p className="muted small">No feature activity in this range.</p>}
            </section>

            <section className="admin-insights-panel">
              <h2>Start-to-completion signals</h2>
              <p>Event ratios reveal likely abandonment; repeat attempts can make a ratio exceed 100%.</p>
              {funnelRows.length ? (
                <div className="admin-insights-table-wrap"><table className="admin-insights-table">
                  <thead><tr><th>Activity</th><th>Starts</th><th>Completions</th><th>Ratio</th></tr></thead>
                  <tbody>{funnelRows.map((row) => <tr key={row.startType}><td>{row.label}</td><td>{formatNumber(row.starts)}</td><td>{formatNumber(row.completions)}</td><td>{formatNumber(row.rate)}%</td></tr>)}</tbody>
                </table></div>
              ) : <p className="muted small">No paired start events in this range.</p>}
            </section>
          </div>

          <div className="admin-insights-two-column">
            <section className="admin-insights-panel">
              <h2>Applications</h2>
              {appRows.length ? appRows.map((row) => <div className="admin-insights-breakdown-row" key={row.app}><span>{row.label}</span><span>{formatNumber(row.events)} events · {formatNumber(row.userDays)} user-days</span></div>) : <p className="muted small">No application data in this range.</p>}
            </section>
            <section className="admin-insights-panel">
              <h2>Data sources</h2>
              {sourceRows.length ? sourceRows.map((row) => <div className="admin-insights-breakdown-row" key={row.source}><span>{row.source === "activityLog" ? "Activity log" : titleFromKey(row.source)}</span><span>{formatNumber(row.count)} records</span></div>) : <p className="muted small">No source data in this range.</p>}
            </section>
          </div>
        </>
      ) : (
        <section className="admin-insights-empty">Select “Update insights” to load the small daily summary documents.</section>
      )}
    </main>
  );
}
