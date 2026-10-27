/* eslint-disable no-undef */
const {buildLiveGameEmail, timestamp} = require("./live-game-email");

async function loadHost(firestore, auth, ownerUid, logger) {
  if (typeof ownerUid !== "string" || !ownerUid || ownerUid.includes("/")) return {};
  let host = {};
  try {
    host = (await firestore.doc(`users/${ownerUid}`).get()).data() || {};
  } catch (error) {
    logger.warn("LIVE_EMAIL_PROFILE_UNAVAILABLE", {code: error.code});
  }
  if (!host.email || !(host.displayName || host.name || host.username)) {
    try {
      const user = await auth.getUser(ownerUid);
      host = {...host, email: host.email || user.email, displayName: host.displayName || host.name || host.username || user.displayName};
    } catch (error) {
      logger.warn("LIVE_EMAIL_AUTH_PROFILE_UNAVAILABLE", {code: error.code});
    }
  }
  return host;
}

async function loadSet(firestore, game, logger) {
  if (!["grammar", "vocab"].includes(game.type) || typeof game.setId !== "string" || !game.setId || game.setId.includes("/")) return {};
  try {
    return (await firestore.doc(`grammarSets/${game.setId}`).get()).data() || {};
  } catch (error) {
    logger.warn("LIVE_EMAIL_CONTENT_UNAVAILABLE", {code: error.code});
    return {};
  }
}

// A private Firestore delivery record claims each email before SMTP. Duplicate
// Firebase events (including concurrent deliveries) cannot send a second copy.
// If SMTP succeeds but recording its receipt fails, retain the sending claim:
// automatically repeating SMTP in that ambiguous state could duplicate email.
async function sendOnce({firestore, transporter, message, gameId, kind, eventId, now, logger}) {
  const deliveryRef = firestore.doc(`liveActivityEmailDeliveries/${gameId}--${kind}`);
  const claimed = await firestore.runTransaction(async (transaction) => {
    const previous = (await transaction.get(deliveryRef)).data() || {};
    if (previous.status === "sent" || previous.status === "sending") return false;
    transaction.set(deliveryRef, {
      gameId, kind, eventId: eventId || "", status: "sending", attemptedAt: now(),
      attempts: (previous.attempts || 0) + 1,
    });
    return true;
  });
  if (!claimed) return null;

  let result;
  try {
    result = await transporter.sendMail(message);
  } catch (error) {
    await deliveryRef.set({status: "failed", failedAt: now(), errorCode: String(error.code || "SMTP_ERROR").slice(0, 80)}, {merge: true});
    logger.error("MAIL_FAIL live activity", {gameId, kind, code: error.code});
    throw error;
  }
  try {
    await deliveryRef.set({status: "sent", sentAt: now(), messageId: String(result?.messageId || "").slice(0, 200)}, {merge: true});
  } catch (error) {
    logger.error("LIVE_EMAIL_RECEIPT_WRITE_FAILED", {gameId, kind, code: error.code});
  }
  logger.log("MAIL_OK live activity", {gameId, kind});
  return null;
}

function createLiveGameEmailHandler({firestore, auth, transporter, fromAddress, teacherEmail, now = Date.now, logger = console}) {
  return async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();
    if (!after || before === after) return null;

    const launched = before == null && after === "lobby";
    const started = after === "in-progress";
    const finished = before != null && after === "finished";
    if (!launched && !started && !finished) return null;

    const gameId = context.params.gameId;
    const eventTime = timestamp(context.timestamp) || now();
    const sessionRef = firestore.doc(`liveActivityEmailSessions/${gameId}`);
    if (started) {
      await firestore.runTransaction(async (transaction) => {
        const previous = (await transaction.get(sessionRef)).data() || {};
        transaction.set(sessionRef, {startedAt: Math.min(previous.startedAt || eventTime, eventTime)}, {merge: true});
      });
      return null;
    }

    const game = (await change.after.ref.parent.get()).val();
    // A deleted session or an incomplete record cannot produce a useful email.
    if (!game || !game.ownerUid) return null;
    const session = await firestore.runTransaction(async (transaction) => {
      const previous = (await transaction.get(sessionRef)).data() || {};
      const update = launched
        ? {createdAt: Math.min(previous.createdAt || eventTime, eventTime)}
        : {finishedAt: Math.min(previous.finishedAt || eventTime, eventTime)};
      transaction.set(sessionRef, update, {merge: true});
      return {...previous, ...update};
    });
    const [host, set] = await Promise.all([
      loadHost(firestore, auth, game.ownerUid, logger),
      loadSet(firestore, game, logger),
    ]);
    const kind = finished ? "finished" : "launched";
    const message = buildLiveGameEmail({
      kind, gameId, game, host, set,
      createdAt: session.createdAt || timestamp(game.createdAt),
      startedAt: timestamp(game.state?.startedAt) || session.startedAt,
      finishedAt: session.finishedAt,
    });
    return sendOnce({
      firestore, transporter, gameId, kind, eventId: context.eventId, now, logger,
      message: {from: fromAddress, to: teacherEmail || fromAddress, ...message},
    });
  };
}

module.exports = {createLiveGameEmailHandler};
