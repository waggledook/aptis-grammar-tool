import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOteMockAttempt } from "../../firebase.js";
import "./styles/ote.css";

function formatDate(value) {
  if (!value) return "Not available";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OteSpeakingResults({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const row = await fetchOteMockAttempt(attemptId, user?.uid);
        if (alive) setAttempt(row);
      } catch (error) {
        console.error("[OTE] Could not load attempt", error);
        if (alive) setAttempt(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [attemptId, user?.uid]);

  return (
    <main className="ote-results">
      <button className="ote-secondary-btn" type="button" onClick={() => navigate("/ote")}>
        Back to OTE
      </button>
      <section className="ote-results-panel">
        <p className="ote-kicker">Speaking mock result</p>
        <h1>{loading ? "Loading result..." : attempt ? "Submission saved" : "Result not found"}</h1>
        {attempt ? (
          <>
            <p>
              Submitted: <strong>{formatDate(attempt.submittedAt || attempt.updatedAt)}</strong>
            </p>
            <p>
              Segments recorded: <strong>{attempt.recordings?.length || 0}</strong>
            </p>
            <p className="ote-muted">
              Audio playback is available immediately after a mock in this first slice. Persistent
              cloud audio storage can be added when we wire the final review workflow.
            </p>
          </>
        ) : !loading ? (
          <p className="ote-muted">This attempt could not be loaded for the current account.</p>
        ) : null}
      </section>
    </main>
  );
}
