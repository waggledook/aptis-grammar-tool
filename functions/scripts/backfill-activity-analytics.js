/* eslint-disable no-undef */
const admin = require("firebase-admin");
const {
  aggregateAnalyticsEvent,
} = require("../activityAnalytics");

const EXPECTED_PROJECT_ID = "examplay-auth";
const ANALYTICS_TIME_ZONE = "Europe/Madrid";
const DEFAULT_MAX_RECORDS = 5000;
const PAGE_SIZE = 200;
const CONCURRENCY = 5;

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function assertDateKey(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`${label} is not a valid date.`);
  }
}

function shiftDateKey(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function dateRangeDays(from, to) {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
}

function zonedStart(value) {
  const [year, month, day] = value.split("-").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcGuess)).map((part) => [part.type, part.value]));
  const represented = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return new Date(utcGuess - (represented - utcGuess));
}

function buildRangeQuery(firestore, collectionName, fromTimestamp, toTimestamp) {
  return firestore.collection(collectionName)
    .where("createdAt", ">=", fromTimestamp)
    .where("createdAt", "<", toTimestamp)
    .orderBy("createdAt", "asc");
}

async function getCounts(firestore, fromTimestamp, toTimestamp) {
  const [activityCount, submissionCount] = await Promise.all([
    buildRangeQuery(
      firestore,
      "activityLog",
      fromTimestamp,
      toTimestamp
    ).count().get(),
    buildRangeQuery(
      firestore,
      "submissions",
      fromTimestamp,
      toTimestamp
    ).count().get(),
  ]);
  return {
    activityLog: activityCount.data().count,
    submissions: submissionCount.data().count,
  };
}

async function processBatch(items, processItem) {
  const results = [];
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    const chunk = items.slice(index, index + CONCURRENCY);
    const settled = await Promise.allSettled(chunk.map(processItem));
    results.push(...settled);
  }
  return results;
}

async function backfillCollection({
  firestore,
  collectionName,
  source,
  fromTimestamp,
  toTimestamp,
  onProgress,
}) {
  let cursor = null;
  let scanned = 0;
  let processed = 0;
  let duplicates = 0;
  const failures = [];
  let hasMore = true;

  while (hasMore) {
    let pageQuery = buildRangeQuery(
      firestore,
      collectionName,
      fromTimestamp,
      toTimestamp
    ).limit(PAGE_SIZE);
    if (cursor) pageQuery = pageQuery.startAfter(cursor);
    const page = await pageQuery.get();
    if (page.empty) break;

    const results = await processBatch(page.docs, async (docSnap) => {
      const data = docSnap.data() || {};
      const normalizedData = source === "submissions"
        ? {
            ...data,
            type: "writing_general_submission",
            app: "aptis-writing-general",
          }
        : data;
      return aggregateAnalyticsEvent({
        firestore,
        admin,
        source,
        sourceId: docSnap.id,
        data: normalizedData,
        createdAt: docSnap.createTime || data.createdAt,
      });
    });

    results.forEach((result, index) => {
      scanned += 1;
      if (result.status === "fulfilled") {
        if (result.value.duplicate) duplicates += 1;
        else processed += 1;
      } else {
        failures.push({
          id: page.docs[index].id,
          message: result.reason?.message || String(result.reason),
        });
      }
    });
    cursor = page.docs[page.docs.length - 1];
    onProgress({source, scanned, processed, duplicates, failures: failures.length});
    hasMore = page.size === PAGE_SIZE;
  }

  return {source, scanned, processed, duplicates, failures};
}

async function main() {
  const from = getArg("from");
  const to = getArg("to");
  const projectId = getArg("project", EXPECTED_PROJECT_ID);
  const maxRecords = Number(getArg("max", DEFAULT_MAX_RECORDS));
  const execute = hasFlag("execute");

  assertDateKey(from, "from");
  assertDateKey(to, "to");
  const days = dateRangeDays(from, to);
  if (days < 1 || days > 7) throw new Error("Backfill range must be 1–7 days.");
  if (projectId !== EXPECTED_PROJECT_ID) {
    throw new Error(`Refusing to run against unexpected project ${projectId}.`);
  }
  if (!Number.isInteger(maxRecords) || maxRecords < 1 || maxRecords > 5000) {
    throw new Error("max must be an integer between 1 and 5000.");
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
  const firestore = admin.firestore();
  const fromTimestamp = admin.firestore.Timestamp.fromDate(zonedStart(from));
  const toTimestamp = admin.firestore.Timestamp.fromDate(
    zonedStart(shiftDateKey(to, 1))
  );
  const counts = await getCounts(firestore, fromTimestamp, toTimestamp);
  const total = counts.activityLog + counts.submissions;
  console.log(JSON.stringify({
    mode: execute ? "execute" : "dry-run",
    projectId,
    from,
    to,
    timeZone: ANALYTICS_TIME_ZONE,
    counts: {...counts, total},
    maxRecords,
  }, null, 2));

  if (total > maxRecords) {
    throw new Error(`Refusing to process ${total} records; cap is ${maxRecords}.`);
  }
  if (!execute) return;

  const runId = `${from}--${to}`;
  const runRef = firestore.doc(`adminAnalyticsBackfills/${runId}`);
  const existingRun = await runRef.get();
  if (existingRun.data()?.status === "completed") {
    throw new Error(`Backfill ${runId} is already marked complete.`);
  }
  await runRef.set({
    from,
    to,
    timeZone: ANALYTICS_TIME_ZONE,
    counts,
    status: "running",
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, {merge: true});

  const onProgress = (progress) => console.log(JSON.stringify({
    progress,
    expectedTotal: total,
  }));
  try {
    const activityResult = await backfillCollection({
      firestore,
      collectionName: "activityLog",
      source: "activityLog",
      fromTimestamp,
      toTimestamp,
      onProgress,
    });
    const submissionResult = await backfillCollection({
      firestore,
      collectionName: "submissions",
      source: "submissions",
      fromTimestamp,
      toTimestamp,
      onProgress,
    });
    const results = [activityResult, submissionResult];
    const failureCount = results.reduce(
      (sum, result) => sum + result.failures.length,
      0
    );
    await runRef.set({
      status: failureCount ? "failed" : "completed",
      results,
      failureCount,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    console.log(JSON.stringify({status: failureCount ? "failed" : "completed", results}, null, 2));
    if (failureCount) process.exitCode = 1;
  } catch (error) {
    await runRef.set({
      status: "failed",
      error: error.message || String(error),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
