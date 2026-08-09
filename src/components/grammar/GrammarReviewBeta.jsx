import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  completeGrammarLearningSession,
  fetchGrammarReviewQueue,
  fetchMistakes,
  startGrammarLearningSession,
} from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";
import GapFillList from "../GapFillList";

function createReviewSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `grammar-review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatReviewDate(value) {
  if (!value) return "Not scheduled";
  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : typeof value.toMillis === "function"
        ? new Date(value.toMillis())
        : value.seconds
          ? new Date(value.seconds * 1000)
          : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function GrammarReviewBeta({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState([]);
  const [legacyIds, setLegacyIds] = useState([]);
  const [items, setItems] = useState([]);
  const [trackingContext, setTrackingContext] = useState(null);
  const [phase, setPhase] = useState("ready");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const [reviewRows, recentLegacyIds] = await Promise.all([
          fetchGrammarReviewQueue(user.uid),
          fetchMistakes(),
        ]);
        if (!alive) return;

        const uniqueLegacyIds = Array.from(new Set(recentLegacyIds || []));
        const v2Ids = new Set(reviewRows.map((entry) => entry.itemId));
        const dueV2Ids = reviewRows
          .filter((entry) => entry.due)
          .map((entry) => entry.itemId);
        const legacyOnlyIds = uniqueLegacyIds.filter((itemId) => !v2Ids.has(itemId));
        const candidateIds = Array.from(
          new Set([...dueV2Ids, ...legacyOnlyIds])
        ).slice(0, 15);
        const questionItems = await fetchItemsByIds(candidateIds);
        if (!alive) return;

        setQueue(reviewRows);
        setLegacyIds(uniqueLegacyIds);
        setItems(questionItems);
        setTrackingContext(null);
        setPhase("ready");
      } catch (loadError) {
        console.error("[GrammarReviewBeta] load failed", loadError);
        if (alive) setError("We couldn’t get your review ready. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [reloadKey, user?.uid]);

  const queueById = useMemo(
    () => new Map(queue.map((entry) => [entry.itemId, entry])),
    [queue]
  );
  const reviewSetCounts = useMemo(
    () =>
      items.reduce(
        (counts, item) => {
          const progress = queueById.get(item.id);
          if (progress) {
            if (progress.maintenance) counts.maintenance += 1;
            else counts.due += 1;
          } else counts.legacy += 1;
          return counts;
        },
        { due: 0, legacy: 0, maintenance: 0 }
      ),
    [items, queueById]
  );
  const dueCount = queue.filter((entry) => entry.due).length;
  const scheduledCount = Math.max(0, queue.length - dueCount);
  const v2Ids = new Set(queue.map((entry) => entry.itemId));
  const legacyOnlyCount = legacyIds.filter((itemId) => !v2Ids.has(itemId)).length;
  async function beginReview() {
    if (!items.length || phase !== "ready") return;
    const nextContext = {
      sessionId: createReviewSessionId(),
      mode: "review",
      levels: [],
      tags: [],
      itemIds: items.map((item) => item.id),
      totalItems: items.length,
      dueItemCount: reviewSetCounts.due,
      legacyItemCount: reviewSetCounts.legacy,
      maintenanceItemCount: reviewSetCounts.maintenance,
    };

    setError("");
    try {
      await startGrammarLearningSession(nextContext);
      setTrackingContext(nextContext);
      setPhase("active");
    } catch (startError) {
      console.error("[GrammarReviewBeta] session start failed", startError);
      setError("We couldn’t start your review. Please try again.");
    }
  }

  async function finishReview(summary) {
    if (!trackingContext?.sessionId) return;
    await completeGrammarLearningSession({
      sessionId: trackingContext.sessionId,
      mode: "review",
      answeredCount: summary.answered,
      correctCount: summary.correct,
      totalItems: summary.total,
    });
    setPhase("complete");
  }

  if (!user) {
    return (
      <section className="grammar-review-beta panel">
        <h1>Today’s Review</h1>
        <p>Sign in to practise the grammar that will help you most today.</p>
      </section>
    );
  }

  if (loading) return <p>Getting today’s review ready…</p>;

  return (
    <div className="grammar-review-beta">
      <button
        type="button"
        className="review-btn"
        onClick={() => navigate("/profile")}
      >
        ← Back to profile
      </button>

      <header className="grammar-review-beta-hero">
        <span>Your personal grammar practice</span>
        <h1>Today’s Review</h1>
        <p>
          We’ve chosen a short set from the grammar you’ve found tricky. A little
          practice today will help it stick.
        </p>
      </header>

      {error && <p className="error-text">{error}</p>}

      <section className="grammar-review-beta-grid" aria-label="Today’s review summary">
        <article>
          <span>Ready today</span>
          <strong>{dueCount}</strong>
        </article>
        <article>
          <span>Coming up later</span>
          <strong>{scheduledCount}</strong>
        </article>
        <article>
          <span>Recent mistakes</span>
          <strong>{legacyOnlyCount}</strong>
        </article>
        <article>
          <span>Questions today</span>
          <strong>{items.length}</strong>
        </article>
      </section>

      {phase === "ready" && (
        <section className="grammar-review-beta-ready panel">
          <h2>{items.length ? "Your review is ready" : "You’re all caught up!"}</h2>
          <p>
            {items.length
              ? `${items.length} ${items.length === 1 ? "question has" : "questions have"} been chosen for you. Take your time — you’ll see helpful feedback after every answer.`
              : scheduledCount
                ? `Nice work. Your next review is scheduled for ${formatReviewDate(queue.find((entry) => !entry.due)?.nextReviewAt)}.`
                : "Keep practising as normal. Anything that needs another look will appear here for you."}
          </p>
          {items.length > 0 && (
            <button type="button" className="generate-btn grammar-start-btn" onClick={beginReview}>
              Start today’s review
            </button>
          )}
        </section>
      )}

      {(phase === "active" || phase === "complete") && trackingContext && (
        <>
          <section className="grammar-review-beta-reasons panel">
            <h2>What you’re practising</h2>
            <p>
              These are grammar points worth another look. Answer at your own pace
              and use the feedback to help you remember.
            </p>
            <ul>
              {items.map((item) => {
                const progress = queueById.get(item.id);
                return (
                  <li key={item.id}>
                    <strong>{item.tag || item.tags?.[0] || item.level}</strong>
                    <span>
                      {progress
                        ? progress.maintenance
                          ? "A longer-term check to help this stay mastered"
                          : Number(progress.lapseCount) > 1
                          ? "A grammar point that needs a little more practice"
                          : "Ready for a quick memory check"
                        : "From one of your recent mistakes"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <GapFillList
            key={trackingContext.sessionId}
            runKey={trackingContext.sessionId}
            items={items}
            trackingContext={trackingContext}
            showProgress
            onComplete={finishReview}
          />
        </>
      )}

      {phase === "complete" && (
        <div className="grammar-review-beta-actions">
          <button
            type="button"
            className="review-btn"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            See what’s next
          </button>
        </div>
      )}

    </div>
  );
}
