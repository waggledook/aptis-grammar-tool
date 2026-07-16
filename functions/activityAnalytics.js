/* eslint-disable no-undef */
const ANALYTICS_TIME_ZONE = "Europe/Madrid";
const PROCESSED_EVENT_TTL_DAYS = 14;

function getAnalyticsDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function metricKey(value, fallback = "unknown") {
  const normalized = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
  return normalized || fallback;
}

function isCompletionEvent(type) {
  return type === "writing_general_submission" ||
    /_(completed|submitted|finished|played)$/.test(type);
}

function normalizeEvent({source, sourceId, data, createdAt}) {
  const userId = typeof data.userId === "string" ? data.userId.trim() : "";
  const eventDate = toDate(createdAt) || new Date();
  return {
    source: metricKey(source),
    sourceId: String(sourceId),
    userId,
    type: metricKey(data.type),
    app: metricKey(data.app),
    eventDate,
    date: getAnalyticsDate(eventDate),
  };
}

async function aggregateAnalyticsEvent({
  firestore,
  admin,
  source,
  sourceId,
  data,
  createdAt,
}) {
  const event = normalizeEvent({source, sourceId, data, createdAt});
  const increment = admin.firestore.FieldValue.increment;
  const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
  const processedRef = firestore.doc(
    `adminAnalyticsProcessed/${event.source}--${event.sourceId}`
  );
  const dailyRef = firestore.doc(`adminAnalyticsDaily/${event.date}`);
  const dailyUserRef = event.userId
    ? dailyRef.collection("dailyUsers").doc(event.userId)
    : null;
  const analyticsUserRef = event.userId
    ? firestore.doc(`adminAnalyticsUsers/${event.userId}`)
    : null;
  const profileRef = event.userId
    ? firestore.doc(`users/${event.userId}`)
    : null;

  return firestore.runTransaction(async (transaction) => {
    const processedSnap = await transaction.get(processedRef);
    if (processedSnap.exists) return {duplicate: true, date: event.date};

    let dailyUserSnap = null;
    let analyticsUserSnap = null;
    let profileSnap = null;

    if (event.userId) {
      dailyUserSnap = await transaction.get(dailyUserRef);
      analyticsUserSnap = await transaction.get(analyticsUserRef);
      if (!analyticsUserSnap.exists) {
        profileSnap = await transaction.get(profileRef);
      }
    }

    const dailyUser = dailyUserSnap?.data() || {};
    const analyticsUser = analyticsUserSnap?.data() || {};
    const profile = profileSnap?.data() || {};
    const role = analyticsUser.role || profile.role || "unknown";
    const isAdmin = analyticsUser.isAdmin ?? role === "admin";
    const accountCreatedAt = toDate(
      analyticsUser.accountCreatedAt || profile.createdAt
    );
    const accountCreatedDate = analyticsUser.accountCreatedDate ||
      (accountCreatedAt ? getAnalyticsDate(accountCreatedAt) : "");
    const firstUserEventToday = !!event.userId && !dailyUserSnap.exists;
    const firstTypeToday = firstUserEventToday ||
      !Object.hasOwn(dailyUser.typesSeen || {}, event.type);
    const firstAppToday = firstUserEventToday ||
      !Object.hasOwn(dailyUser.appsSeen || {}, event.app);
    const isNewActiveUser = firstUserEventToday && !isAdmin &&
      accountCreatedDate === event.date;
    const isReturningActiveUser = firstUserEventToday && !isAdmin &&
      !isNewActiveUser;

    const dailyUpdate = {
      date: event.date,
      timeZone: ANALYTICS_TIME_ZONE,
      totalEvents: increment(1),
      eventsByType: {[event.type]: increment(1)},
      eventsByApp: {[event.app]: increment(1)},
      sourceCounts: {[event.source]: increment(1)},
      updatedAt: serverTimestamp(),
    };

    if (event.userId) {
      dailyUpdate.authenticatedEvents = increment(1);
      if (!isAdmin) dailyUpdate.userEvents = increment(1);
    } else {
      dailyUpdate.anonymousEvents = increment(1);
    }
    if (isCompletionEvent(event.type)) {
      dailyUpdate.completedEvents = increment(1);
    }
    if (event.type === "writing_general_submission") {
      dailyUpdate.writingSubmissions = increment(1);
      dailyUpdate[event.userId
        ? "authenticatedWritingSubmissions"
        : "anonymousWritingSubmissions"] = increment(1);
    }
    if (firstUserEventToday) {
      dailyUpdate.uniqueAuthenticatedUsers = increment(1);
      if (isAdmin) {
        dailyUpdate.uniqueAdminUsers = increment(1);
      } else {
        dailyUpdate.uniqueUsers = increment(1);
      }
    }
    if (isNewActiveUser) dailyUpdate.newUsers = increment(1);
    if (isReturningActiveUser) dailyUpdate.returningUsers = increment(1);
    if (event.userId && !isAdmin && firstTypeToday) {
      dailyUpdate.usersByType = {[event.type]: increment(1)};
    }
    if (event.userId && !isAdmin && firstAppToday) {
      dailyUpdate.usersByApp = {[event.app]: increment(1)};
    }

    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + PROCESSED_EVENT_TTL_DAYS);
    transaction.set(processedRef, {
      source: event.source,
      sourceId: event.sourceId,
      date: event.date,
      processedAt: serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });
    transaction.set(dailyRef, dailyUpdate, {merge: true});

    if (event.userId) {
      const dailyUserUpdate = {
        userId: event.userId,
        date: event.date,
        role,
        isAdmin,
        eventCount: increment(1),
        lastEventAt: event.eventDate,
        typesSeen: {[event.type]: true},
        appsSeen: {[event.app]: true},
        updatedAt: serverTimestamp(),
      };
      if (firstUserEventToday) dailyUserUpdate.firstEventAt = event.eventDate;
      transaction.set(dailyUserRef, dailyUserUpdate, {merge: true});

      const analyticsUserUpdate = {
        userId: event.userId,
        role,
        isAdmin,
        totalEvents: increment(1),
        lastSeenAt: event.eventDate,
        lastSeenDate: event.date,
        updatedAt: serverTimestamp(),
      };
      if (accountCreatedAt) analyticsUserUpdate.accountCreatedAt = accountCreatedAt;
      if (accountCreatedDate) {
        analyticsUserUpdate.accountCreatedDate = accountCreatedDate;
      }
      if (!analyticsUserSnap.exists) {
        analyticsUserUpdate.firstSeenAt = event.eventDate;
        analyticsUserUpdate.firstSeenDate = event.date;
      }
      if (firstUserEventToday) analyticsUserUpdate.activeDays = increment(1);
      transaction.set(analyticsUserRef, analyticsUserUpdate, {merge: true});
    }

    return {duplicate: false, date: event.date};
  });
}

module.exports = {
  ANALYTICS_TIME_ZONE,
  aggregateAnalyticsEvent,
  getAnalyticsDate,
  isCompletionEvent,
  metricKey,
};
