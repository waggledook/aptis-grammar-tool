function parseDateKey(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function numberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatChartDate(dateKey, options) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...options,
  }).format(parseDateKey(dateKey));
}

function weekStartKey(dateKey) {
  const date = parseDateKey(dateKey);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

function periodRangeLabel(firstDate, lastDate) {
  if (firstDate === lastDate) {
    return formatChartDate(firstDate, {day: "numeric", month: "short", year: "numeric"});
  }
  const firstYear = firstDate.slice(0, 4);
  const lastYear = lastDate.slice(0, 4);
  const firstMonth = firstDate.slice(0, 7);
  const lastMonth = lastDate.slice(0, 7);
  if (firstMonth === lastMonth) {
    return `${formatChartDate(firstDate, {day: "numeric"})}–${formatChartDate(lastDate, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }
  if (firstYear === lastYear) {
    return `${formatChartDate(firstDate, {day: "numeric", month: "short"})}–${formatChartDate(lastDate, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${formatChartDate(firstDate, {day: "numeric", month: "short", year: "numeric"})}–${formatChartDate(lastDate, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function buildInsightChartRows(dailyRows, granularity) {
  if (granularity === "daily") {
    return dailyRows.map((row) => ({
      ...row,
      userDays: row.users,
      dayCount: 1,
      rangeLabel: periodRangeLabel(row.date, row.date),
    }));
  }

  const buckets = new Map();
  dailyRows.forEach((row) => {
    const key = granularity === "monthly" ? row.date.slice(0, 7) : weekStartKey(row.date);
    const bucket = buckets.get(key) || {
      key,
      firstDate: row.date,
      lastDate: row.date,
      events: 0,
      userDays: 0,
      dayCount: 0,
    };
    bucket.lastDate = row.date;
    bucket.events += numberValue(row.events);
    bucket.userDays += numberValue(row.users);
    bucket.dayCount += 1;
    buckets.set(key, bucket);
  });

  return Array.from(buckets.values()).map((bucket) => ({
    date: bucket.firstDate,
    label: granularity === "monthly"
      ? formatChartDate(bucket.firstDate, {month: "short", year: "2-digit"})
      : periodRangeLabel(bucket.firstDate, bucket.lastDate).replace(/ \d{4}$/, ""),
    rangeLabel: granularity === "monthly"
      ? formatChartDate(bucket.firstDate, {month: "long", year: "numeric"})
      : periodRangeLabel(bucket.firstDate, bucket.lastDate),
    users: bucket.dayCount ? bucket.userDays / bucket.dayCount : 0,
    events: bucket.events,
    userDays: bucket.userDays,
    dayCount: bucket.dayCount,
  }));
}
