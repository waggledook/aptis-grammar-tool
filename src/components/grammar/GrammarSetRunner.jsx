// src/components/grammar/GrammarSetRunner.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGrammarSet, submitGrammarSetAttempt } from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";
import GapFillList from "../GapFillList";

export default function GrammarSetRunner({ user }) {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [setMeta, setSetMeta]   = useState(null);
  const [items, setItems]       = useState([]);
  const [answers, setAnswers]   = useState({});   // itemId -> details
  const [submitted, setSubmitted] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  // called by GapFillItem via GapFillList
  const handleItemAnswer = (details) => {
    if (!details || !details.itemId) return;

    setAnswers((prev) => {
      // don’t overwrite if something weird calls twice
      if (prev[details.itemId]) return prev;
      return { ...prev, [details.itemId]: details };
    });
  };

  // Load the set + its items
  useEffect(() => {
    async function load() {
      try {
        const meta = await getGrammarSet(setId);
        if (!meta || meta.visibility !== "published") {
          setSetMeta(null);
          return;
        }
        setSetMeta(meta);

        const qs = await fetchItemsByIds(meta.itemIds || []);
        setItems(qs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setId]);

  // When all items are answered once, submit attempt
  useEffect(() => {
    if (!setMeta || !items.length) return;
    if (!user) return;

    const answeredIds = Object.keys(answers);
    if (!answeredIds.length) return;

    // only submit once, when all items have been answered
    if (answeredIds.length !== items.length || submitted) return;

    setSubmitted(true); // prevent double-submit

    const detailsArr = answeredIds.map((id) => answers[id]);
    const correct = detailsArr.filter((d) => d.isCorrect).length;
    const total = items.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    (async () => {
      try {
        await submitGrammarSetAttempt({
          setId,
          setTitle: setMeta.title || "",
          ownerUid: setMeta.ownerId || null,
          studentUid: user.uid,
          studentEmail: user.email || null,
          score: correct,
          total,
          answers: detailsArr,
        });

        setResultMsg(
          `Results saved: ${correct}/${total} correct (${percent}%).`
        );
      } catch (err) {
        console.error("Error saving grammar set attempt:", err);
        setResultMsg(
          "You completed this set, but there was a problem saving your results."
        );
      }
    })();
  }, [answers, items, setMeta, setId, submitted, user]);

  // ── Early returns (AFTER all hooks) ────────────────────────────────
  if (!user) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Please sign in to access this grammar set.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Loading grammar set…</p>
      </div>
    );
  }

  if (!setMeta) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Sorry, this set is not available.</p>
        <button className="btn" type="button" onClick={() => navigate("/")}>
          Go back home
        </button>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/grammar-sets/${setId}`;

  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h1 className="sec-title" style={{ marginBottom: ".25rem" }}>
        {setMeta.title}
      </h1>
      {setMeta.description && (
        <p className="muted" style={{ marginBottom: ".75rem" }}>
          {setMeta.description}
        </p>
      )}

      {/* Share box – handy for teachers */}
      <div
        className="panel"
        style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "#020617",
        }}
      >
        <p className="small muted" style={{ marginBottom: ".25rem" }}>
          Share this set with your students:
        </p>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: "1 1 220px",
              padding: "0.4rem 0.6rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: "0.875rem",
            }}
            onFocus={(e) => e.target.select()}
          />
          <button
            type="button"
            className="btn"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Copy link
          </button>
        </div>
      </div>

      {/* Re-use existing grammar UI */}
      <GapFillList items={items} onAnswer={handleItemAnswer} />

      {resultMsg && (
        <p className="small muted" style={{ marginTop: ".75rem" }}>
          {resultMsg}
        </p>
      )}
    </div>
  );
}
