import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpeakingFeedbackPanel from "../../components/speaking/SpeakingFeedbackPanel.jsx";
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

export default function OteSpeakingResults({ user, homePath = "/ote" }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(Boolean(attemptId));

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      setAttempt(null);
      return undefined;
    }
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
      <button className="ote-secondary-btn" type="button" onClick={() => navigate(homePath)}>
        Back to OTE
      </button>
      <section className="ote-results-panel">
        <p className="ote-kicker">Speaking mock result</p>
        <h1>{!attemptId ? "Results" : loading ? "Loading result..." : attempt ? "Submission saved" : "Result not found"}</h1>
        {!attemptId ? (
          <p className="ote-muted">
            Saved OTE result history will appear here once the review dashboard is connected.
          </p>
        ) : null}
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
            <SpeakingFeedbackPanel
              feedbackResult={{
                feedback: attempt.aiFeedback,
                transcripts: attempt.aiFeedbackTranscripts || [],
              }}
              questions={(attempt.aiFeedbackTranscripts || []).map((entry) => entry.question || entry.label)}
              title="OTE speaking mock feedback"
            />
          </>
        ) : !loading ? (
          <p className="ote-muted">This attempt could not be loaded for the current account.</p>
        ) : null}
      </section>
    </main>
  );
}
